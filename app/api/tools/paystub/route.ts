import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const result = await checkRateLimit(req, 'paystub');
  if (!result.allowed) {
    return NextResponse.json(
      { error: result.reason, plan: result.plan, limit: result.limit, remaining: 0 },
      { status: 429 }
    );
  }
  return NextResponse.json({
    allowed: true,
    remaining: result.remaining,
    plan: result.plan,
    limit: result.limit,
  });
}
