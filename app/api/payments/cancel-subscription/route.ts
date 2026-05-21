import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { cancelDodoSubscription } from '@/lib/dodopay';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const admin = createAdminClient();

    const { data: sub } = await admin
      .from('subscriptions')
      .select('dodo_subscription_id, status, current_period_end, plan')
      .eq('user_id', user.id)
      .single();

    if (!sub) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
    }

    if (sub.status === 'cancelled' || sub.status === 'pending_cancellation') {
      return NextResponse.json({ error: 'Subscription is already cancelled.' }, { status: 400 });
    }

    // Cancel at payment processor — stops future billing, access continues until period end.
    if (sub.dodo_subscription_id) {
      await cancelDodoSubscription(sub.dodo_subscription_id);
    }

    // Mark pending_cancellation — keep plan active until current_period_end.
    // resolveUser() in rate-limit.ts lazily downgrades once the period expires.
    await admin
      .from('subscriptions')
      .update({ status: 'pending_cancellation' })
      .eq('user_id', user.id);

    console.log('[Cancel] user=' + user.id + ' plan=' + sub.plan + ' period_end=' + sub.current_period_end);

    return NextResponse.json({
      success: true,
      accessUntil: sub.current_period_end,
      message: sub.current_period_end
        ? 'Cancelled. You keep full access until ' + new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '. No further charges.'
        : 'Cancelled. No further charges will occur.',
    });
  } catch (err) {
    console.error('[Cancel] Error:', err);
    return NextResponse.json({ error: 'Cancellation failed. Please contact support@formly.tools.' }, { status: 500 });
  }
}
