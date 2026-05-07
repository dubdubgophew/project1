import { createAdminClient } from './supabase/server';
import { getIp } from './utils';
import { PLAN_LIMITS } from './utils';

export type RateLimitResult =
  | { allowed: true; remaining: number; plan: string }
  | { allowed: false; reason: string; remaining: 0 };

/**
 * Check and record usage for a tool call.
 * - Unauthenticated users: 5 uses/day by IP
 * - Authenticated free users: 10 uses/day by user ID
 * - Pro/Unlimited users: per plan limits
 */
export async function checkRateLimit(
  req: Request,
  toolName: string
): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const ip = getIp(req);

  // Try to get authenticated user
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  let userId: string | null = null;
  let plan = 'anonymous';

  if (token) {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      userId = data.user.id;
      // Get user's plan
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
    : PLAN_LIMITS.free; // anonymous = same as free

  // Unlimited plan bypasses all checks
  if (plan === 'unlimited') {
    await recordUsage(supabase, userId, ip, toolName);
    return { allowed: true, remaining: 999_999, plan };
  }

  // Count uses in last 24 hours
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

  const { count } = await query;
  const usedCount = count ?? 0;

  if (usedCount >= limit) {
    return {
      allowed: false,
      reason:
        plan === 'free'
          ? 'Daily limit reached. Upgrade to Pro for 200 uses/day.'
          : 'Daily limit reached. Upgrade to Unlimited for unlimited uses.',
      remaining: 0,
    };
  }

  await recordUsage(supabase, userId, ip, toolName);
  return { allowed: true, remaining: limit - usedCount - 1, plan };
}

async function recordUsage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string | null,
  ip: string,
  toolName: string
) {
  await supabase.from('usage_logs').insert({
    user_id: userId,
    ip,
    tool_name: toolName,
  });
}
