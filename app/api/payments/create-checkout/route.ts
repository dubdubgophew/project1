import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDodoCheckout } from '@/lib/dodopay';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['pro', 'unlimited', 'day_pass']),
});

// Simple in-process rate limiter: max 10 checkout attempts per user per hour
const checkoutAttempts = new Map<string, number[]>();
function isCheckoutRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const timestamps = (checkoutAttempts.get(userId) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= 10) return true;
  timestamps.push(now);
  checkoutAttempts.set(userId, timestamps);
  return false;
}

const SITE_HOSTNAME = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools').hostname;
  } catch {
    return 'formly.tools';
  }
})();

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return true; // server-to-server or missing origin
  try {
    const host = new URL(origin).hostname;
    // Allow the exact hostname and www subdomain
    if (host === SITE_HOSTNAME || host === `www.${SITE_HOSTNAME}`) return true;
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && (host === 'localhost' || host === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate origin to prevent CSRF (hostname-based, handles www variants)
    const origin = req.headers.get('origin') ?? '';
    if (origin && !isAllowedOrigin(origin)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    if (isCheckoutRateLimited(user.id)) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please wait before trying again.' }, { status: 429 });
    }

    const body = await req.json();
    const { plan } = schema.parse(body);

    const resolvedOrigin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;

    const checkoutUrl = await createDodoCheckout({
      plan,
      userEmail: user.email!,
      userName: user.user_metadata?.name,
      userId: user.id,
      returnUrl: `${resolvedOrigin}/dashboard?upgrade=success&plan=${plan}`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
