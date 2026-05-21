import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Known malicious/scanner bot patterns
const BAD_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nessus/i, /openvas/i, /masscan/i,
  /zgrab/i, /nuclei/i, /acunetix/i, /nmap/i, /burpsuite/i,
  /python-requests\/[01]\./i,
];

// Suspicious path patterns
const SUSPICIOUS_PATH_PATTERNS = [
  /\.\./,           // path traversal
  /%2e%2e/i,        // encoded path traversal
  /%00/,            // null byte
  /\.(php|asp|aspx|jsp|cgi|env|git|svn|htaccess|htpasswd)$/i,
  /wp-(admin|login|content|includes)/i,
  /\/etc\/(passwd|shadow|hosts)/i,
  /<script/i,       // XSS in path
  /union.*select/i, // SQLi in path
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block suspicious paths
  const fullUrl = request.url;
  if (SUSPICIOUS_PATH_PATTERNS.some(p => p.test(pathname) || p.test(fullUrl))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block known bad bots/scanners
  const ua = request.headers.get('user-agent') ?? '';
  if (BAD_UA_PATTERNS.some(p => p.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block oversized query strings (potential injection/DoS)
  const search = request.nextUrl.search;
  if (search.length > 2000) {
    return new NextResponse('Request Too Large', { status: 414 });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    if (user.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Cron routes secured by secret
  if (pathname.startsWith('/api/cron/')) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|ads.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|xml)$).*)',
  ],
};
