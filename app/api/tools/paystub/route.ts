import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'paystub');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }
  return NextResponse.json({ allowed: true, remaining: limit.remaining });
}
