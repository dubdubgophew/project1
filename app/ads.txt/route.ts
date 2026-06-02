import { NextResponse } from 'next/server';

// Explicit route so Vercel always serves ads.txt correctly.
// Google AdSense requires this at https://formly.tools/ads.txt
export async function GET() {
  return new NextResponse(
    'google.com, pub-7233937066598688, DIRECT, f08c47fec0942fa0\n',
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    }
  );
}