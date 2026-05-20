import { NextResponse } from 'next/server';

// IndexNow key verification — Bing/Yandex crawl this to verify site ownership
export async function GET() {
  const key = process.env.INDEXNOW_KEY ?? '';
  return new NextResponse(key, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
