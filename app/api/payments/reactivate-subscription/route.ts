import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getDodoClient } from '@/lib/dodopay';

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

    if (!sub || sub.status !== 'pending_cancellation') {
      return NextResponse.json({ error: 'No pending cancellation found.' }, { status: 400 });
    }

    // Check period hasn't already expired
    if (sub.current_period_end && new Date(sub.current_period_end) <= new Date()) {
      return NextResponse.json({
        error: 'Your subscription period has already ended. Please subscribe again.',
        resubscribe: true,
      }, { status: 400 });
    }

    // Try to reactivate at DodoPayments
    let reactivated = false;
    if (sub.dodo_subscription_id) {
      try {
        const client = getDodoClient();
        await client.subscriptions.update(
          sub.dodo_subscription_id,
          { status: 'active' } as Parameters<typeof client.subscriptions.update>[1]
        );
        reactivated = true;
      } catch (err) {
        console.warn('[Reactivate] DodoPayments reactivation failed — may need new subscription:', err);
      }
    }

    if (!reactivated) {
      // DodoPayments doesn't support reactivation — redirect to new checkout
      return NextResponse.json({
        success: false,
        resubscribe: true,
        message: 'Unable to reactivate automatically. Please start a new subscription.',
      });
    }

    // Restore active status
    await admin
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('user_id', user.id);

    console.log('[Reactivate] user=' + user.id + ' plan=' + sub.plan);

    return NextResponse.json({ success: true, message: 'Subscription reactivated. Your plan will continue as normal.' });
  } catch (err) {
    console.error('[Reactivate] Error:', err);
    return NextResponse.json({ error: 'Reactivation failed. Please contact support@formly.tools.' }, { status: 500 });
  }
}
