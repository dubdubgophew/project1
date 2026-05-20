import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createDodoRefund, cancelDodoSubscription } from '@/lib/dodopay';

const REFUND_WINDOW_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const { data: sub } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const plan = profile?.plan ?? 'free';

    if (plan === 'free' || !sub) {
      return NextResponse.json({ error: 'No active paid subscription found.' }, { status: 400 });
    }

    if (sub.status === 'refunded') {
      return NextResponse.json({ error: 'This subscription has already been refunded.' }, { status: 400 });
    }

    if (sub.status === 'refund_requested') {
      return NextResponse.json({ error: 'A refund request is already pending. Our team will process it within 24–48 hours.' }, { status: 400 });
    }

    // Check 7-day window from when the row was created
    const purchasedAt = new Date(sub.created_at ?? Date.now());
    const daysSince = (Date.now() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince > REFUND_WINDOW_DAYS) {
      return NextResponse.json({
        error: `Refund window has passed. Refunds are available within ${REFUND_WINDOW_DAYS} days of purchase (purchased ${Math.floor(daysSince)} days ago). Contact support@formly.tools for assistance.`,
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason: string = body.reason?.trim() || 'Customer requested refund';

    let refundSucceeded = false;
    let manualReason = '';

    // Attempt automatic refund via DodoPayments
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

    // Cancel DodoPayments subscription if applicable (non-day_pass)
    if (sub.dodo_subscription_id && plan !== 'day_pass') {
      await cancelDodoSubscription(sub.dodo_subscription_id).catch(err =>
        console.error('[Refund] Cancel subscription error:', err)
      );
    }

    // Always downgrade the profile and mark subscription
    await admin.from('profiles').update({ plan: 'free' }).eq('id', user.id);
    await admin.from('subscriptions').update({
      status: refundSucceeded ? 'refunded' : 'refund_requested',
    }).eq('user_id', user.id);

    console.log(`[Refund] user=${user.id} plan=${plan} payment=${paymentId} auto=${refundSucceeded} reason="${reason}"`);

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
      message: 'Refund processed. You\'ll receive the amount within 5–7 business days depending on your bank.',
    });

  } catch (err) {
    console.error('[Refund] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Refund request failed. Please contact support@formly.tools.' },
      { status: 500 }
    );
  }
}
