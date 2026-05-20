import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { PLAN_LIMITS } from '@/lib/utils';

export async function GET() {
  try {
    const { data: { user } } = await createClient().auth.getUser();

    if (!user) {
      // Anonymous — return anonymous limits, no DB query
      return NextResponse.json({
        plan: 'anonymous',
        limit: PLAN_LIMITS.anonymous,
        used: null,
        remaining: null,
        resets_at: nextMidnightUTC(),
      });
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan ?? 'free';
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    if (plan === 'unlimited') {
      return NextResponse.json({ plan, limit: null, used: null, remaining: null, resets_at: null });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);

    const used = count ?? 0;
    return NextResponse.json({
      plan,
      limit,
      used,
      remaining: Math.max(0, limit - used),
      resets_at: nextMidnightUTC(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}

function nextMidnightUTC(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}
