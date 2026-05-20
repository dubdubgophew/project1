import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createDodoRefund, cancelDodoSubscription } from '@/lib/dodopay';

const REFUND_WINDOW_DAYS = 7;
const REFUNDABLE_PLANS = ['pro', 'unlimited'];

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('plan, refund_count')
      .eq('id', user.id)
      .single();

    const { data: sub } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const plan = profile?.plan ?? 'free';

    // Pro / Unlimited only — day pass and free are not refundable
    if (!REFUNDABLE_PLANS.includes(plan)) {
      return NextResponse.json({
        error: plan === 'day_pass'
          ? 'Day Pass purchases are non-refundable (one-time, low-cost access). Contact support@formly.tools if you have an issue.'
          : 'No active paid subscription found.',
      }, { status: 400 });
    }

    if (!sub) {
      return NextResponse.json({ error: 'No subscription record found. Contact support@formly.tools.' }, { status: 400 });
    }

    // One refund per account lifetime
    const refundCount = (profile as any)?.refund_count ?? 0;
    if (refundCount >= 1) {
      return NextResponse.json({
        error: 'Refunds are available once per account. You have already used your refund. Contact support@formly.tools for further assistance.',
      }, { status: 400 });
    }

    if (sub.status === 'refunded') {
      return NextResponse.json({ error: 'This subscription has already been refunded.' }, { status: 400 });
    }

    if (sub.status === 'refund_requested') {
      return NextResponse.json({ error: 'A refund request is already pending. Our team will process it within 24–48 hours.' }, { status: 400 });
    }

    // 7-day window
    const purchasedAt = new Date(sub.created_at ?? Date.now());
    const daysSince = (Date.now() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > REFUND_WINDOW_DAYS) {
      return NextResponse.json({
        error: `Refund window has passed. Refunds are available within ${REFUND_WINDOW_DAYS} days of purchase (purchased ${Math.floor(daysSince)} days ago). Contact support@formly.tools for assistance.`,
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rawReason: string = body.reason ?? '';
    // Sanitize: strip tags, cap length
    const reason = rawReason.replace(/<[^>]*>/g, '').slice(0, 500).trim() || 'Customer requested refund';

    let refundSucceeded = false;
    let manualReason = '';
    const paymentId: string | null = sub.dodo_payment_id ?? null;

    if (paymentId) {
      try {
        await createDodoRefund(paymentId, reason);
        refundSucceeded = true;
      } catch (err) {
        console.error('[Refund] DodoPayments API error:', err);
        manualReason = 'Payment processor error — will be handled manually.';
      }
    } else {
      manualReason = 'No payment ID on record — will be processed manually.';
    }

    if (sub.dodo_subscription_id) {
      await cancelDodoSubscription(sub.dodo_subscription_id).catch(err =>
        console.error('[Refund] Cancel subscription error:', err)
      );
    }

    // Downgrade plan + mark subscription + increment refund_count
    await admin.from('profiles')
      .update({ plan: 'free', refund_count: (refundCount + 1) })
      .eq('id', user.id);

    await admin.from('subscriptions')
      .update({ status: refundSucceeded ? 'refunded' : 'refund_requested' })
      .eq('user_id', user.id);

    console.log(`[Refund] user=${user.id} email=${user.email} plan=${plan} payment=${paymentId} auto=${refundSucceeded}`);

    if (!refundSucceeded) {
      return NextResponse.json({
        success: true,
        manual: true,
        message: `Your refund request has been received. Our team will process it within 24–48 hours and confirm via ${user.email}. ${manualReason}`,
      });
    }

    return NextResponse.json({
      success: true,
      manual: false,
      message: "Refund processed. You'll receive the amount within 5–7 business days.",
    });

  } catch (err) {
    console.error('[Refund] Unexpected error:', err);
    return NextResponse.json({ error: 'Refund request failed. Please contact support@formly.tools.' }, { status: 500 });
  }
}
