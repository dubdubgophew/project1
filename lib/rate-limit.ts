import { createClient, createAdminClient } from './supabase/server';
import { getIp, PLAN_LIMITS } from './utils';

export type RateLimitResult =
  | { allowed: true; remaining: number; plan: string; limit: number }
  | { allowed: false; reason: string; remaining: 0; plan: string; limit: number };

async function resolveUser(): Promise<{ userId: string | null; plan: string }> {
  try {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) return { userId: null, plan: 'anonymous' };

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan ?? 'free';

    if (plan === 'day_pass' || plan === 'pro' || plan === 'unlimited') {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (plan === 'day_pass') {
        if (!sub?.current_period_end || new Date(sub.current_period_end) <= new Date()) {
          admin.from('profiles').update({ plan: 'free' }).eq('id', user.id);
          return { userId: user.id, plan: 'free' };
        }
      } else if (sub?.status === 'pending_cancellation' && sub.current_period_end && new Date(sub.current_period_end) <= new Date()) {
        // Billing period ended — lazily finalise the cancellation
        admin.from('profiles').update({ plan: 'free' }).eq('id', user.id);
        admin.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', user.id);
        return { userId: user.id, plan: 'free' };
      }
    }

    return { userId: user.id, plan };
  } catch {
    return { userId: null, plan: 'anonymous' };
  }
}

export async function logUsage(req: Request, toolName: string): Promise<void> {
  try {
    const { userId } = await resolveUser();
    const admin = createAdminClient();
    const ip = getIp(req);
    await admin.from('usage_logs').insert({ user_id: userId, ip, tool_name: toolName });
  } catch {
    // Non-fatal — never block a request for logging failures
  }
}

export async function checkRateLimit(
  req: Request,
  toolName: string
): Promise<RateLimitResult> {
  try {
    const { userId, plan } = await resolveUser();
    const admin = createAdminClient();
    const ip = getIp(req);

    const limit = userId
      ? (PLAN_LIMITS[plan] ?? PLAN_LIMITS.free)
      : PLAN_LIMITS.anonymous;

    // Unlimited plan — always allow, just log
    if (plan === 'unlimited') {
      await recordUsage(admin, userId, ip, toolName);
      return { allowed: true, remaining: 999_999, plan, limit: 999_999 };
    }

    // Count usage in the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const query = userId
      ? admin
          .from('usage_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', since)
      : admin
          .from('usage_logs')
          .select('id', { count: 'exact', head: true })
          .eq('ip', ip)
          .is('user_id', null)
          .gte('created_at', since);

    const { count, error: countError } = await query;

    // DB failure → allow rather than block
    if (countError) {
      await recordUsage(admin, userId, ip, toolName);
      return { allowed: true, remaining: limit, plan, limit };
    }

    const usedCount = count ?? 0;

    if (usedCount >= limit) {
      const reason = userId
        ? plan === 'free'
          ? `Daily limit reached (${limit}/day on Free plan). Upgrade to Pro for 200 uses/day.`
          : plan === 'day_pass'
            ? `Day Pass limit reached (${limit} uses in 24h). Purchase another Day Pass or upgrade to Pro.`
            : plan === 'pro'
              ? `Daily limit reached (${limit}/day on Pro plan). Upgrade to Unlimited for unlimited uses.`
              : `Daily limit reached.`
        : `Daily limit reached (${limit}/day without account). Sign up free for 10 uses/day.`;
      return { allowed: false, reason, remaining: 0, plan, limit };
    }

    await recordUsage(admin, userId, ip, toolName);
    return { allowed: true, remaining: limit - usedCount - 1, plan, limit };
  } catch {
    return { allowed: true, remaining: 1, plan: 'anonymous', limit: 5 };
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
    await supabase.from('usage_logs').insert({ user_id: userId, ip, tool_name: toolName });
  } catch {
    // Non-fatal
  }
}
