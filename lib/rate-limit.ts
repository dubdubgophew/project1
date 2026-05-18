import { createAdminClient } from './supabase/server';
import { getIp } from './utils';
import { PLAN_LIMITS } from './utils';

export type RateLimitResult =
  | { allowed: true; remaining: number; plan: string }
  | { allowed: false; reason: string; remaining: 0 };

export async function checkRateLimit(
  req: Request,
  toolName: string
): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient();
    const ip = getIp(req);

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    let userId: string | null = null;
    let plan = 'anonymous';

    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        userId = data.user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', userId)
          .single();
        plan = profile?.plan ?? 'free';
      }
    }

    const limit = userId
      ? PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
      : PLAN_LIMITS.anonymous;

    if (plan === 'unlimited') {
      await recordUsage(supabase, userId, ip, toolName);
      return { allowed: true, remaining: 999_999, plan };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const query = userId
      ? supabase
          .from('usage_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', since)
      : supabase
          .from('usage_logs')
          .select('id', { count: 'exact', head: true })
          .eq('ip', ip)
          .is('user_id', null)
          .gte('created_at', since);

    const { count, error: countError } = await query;

    // If DB check fails, allow the request rather than blocking everyone
    if (countError) {
      await recordUsage(supabase, userId, ip, toolName);
      return { allowed: true, remaining: limit, plan };
    }

    const usedCount = count ?? 0;

    if (usedCount >= limit) {
      const reason = userId
        ? plan === 'free'
          ? 'Daily limit reached (10/day on free plan). Upgrade to Pro for 200 uses/day.'
          : 'Daily limit reached. Upgrade to Unlimited for unlimited uses.'
        : 'Daily limit reached (5/day without account). Sign up free for 10 uses/day.';
      return { allowed: false, reason, remaining: 0 };
    }

    await recordUsage(supabase, userId, ip, toolName);
    return { allowed: true, remaining: limit - usedCount - 1, plan };
  } catch {
    // On any unexpected error, allow rather than block
    return { allowed: true, remaining: 1, plan: 'anonymous' };
  }
}

async function recordUsage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string | null,
  ip: string,
  toolName: string
) {
  try {
    await supabase.from('usage_logs').insert({
      user_id: userId,
      ip,
      tool_name: toolName,
    });
  } catch {
    // Non-fatal — don't block the request if logging fails
  }
}
