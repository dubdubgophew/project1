import { Webhooks } from '@dodopayments/nextjs';
import { createAdminClient } from '@/lib/supabase/server';

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  onSubscriptionActive: async (payload) => {
    const data = (payload as any).data ?? payload;
    const { userId, plan } = data.metadata ?? {};
    if (!userId || !plan) return;

    const admin = createAdminClient();
    await admin.from('profiles').update({ plan }).eq('id', userId);
    await admin.from('subscriptions').upsert({
      user_id: userId,
      plan,
      status: 'active',
      dodo_subscription_id: data.subscription_id,
      current_period_end: data.next_billing_date ?? null,
    }, { onConflict: 'user_id' });

    console.log(`[Webhook] Subscription activated: ${plan} for user ${userId}`);
  },

  onSubscriptionRenewed: async (payload) => {
    const data = (payload as any).data ?? payload;
    const subscriptionId = data.subscription_id;
    if (!subscriptionId) return;

    const admin = createAdminClient();
    await admin.from('subscriptions').update({
      status: 'active',
      current_period_end: data.next_billing_date ?? null,
    }).eq('dodo_subscription_id', subscriptionId);

    console.log(`[Webhook] Subscription renewed: ${subscriptionId}`);
  },

  onSubscriptionCancelled: async (payload) => {
    const data = (payload as any).data ?? payload;
    const subscriptionId = data.subscription_id;
    if (!subscriptionId) return;

    const admin = createAdminClient();
    const { data: sub } = await admin
      .from('subscriptions')
      .select('user_id')
      .eq('dodo_subscription_id', subscriptionId)
      .single();

    if (sub?.user_id) {
      await admin.from('profiles').update({ plan: 'free' }).eq('id', sub.user_id);
      await admin.from('subscriptions').update({ status: 'cancelled' }).eq('dodo_subscription_id', subscriptionId);
    }

    console.log(`[Webhook] Subscription cancelled: ${subscriptionId}`);
  },

  onSubscriptionExpired: async (payload) => {
    const data = (payload as any).data ?? payload;
    const subscriptionId = data.subscription_id;
    if (!subscriptionId) return;

    const admin = createAdminClient();
    const { data: sub } = await admin
      .from('subscriptions')
      .select('user_id')
      .eq('dodo_subscription_id', subscriptionId)
      .single();

    if (sub?.user_id) {
      await admin.from('profiles').update({ plan: 'free' }).eq('id', sub.user_id);
      await admin.from('subscriptions').update({ status: 'expired' }).eq('dodo_subscription_id', subscriptionId);
    }

    console.log(`[Webhook] Subscription expired: ${subscriptionId}`);
  },

  onPaymentSucceeded: async (payload) => {
    const data = (payload as any).data ?? payload;
    console.log(`[Webhook] Payment succeeded: ${data.payment_id}`);
  },

  onPaymentFailed: async (payload) => {
    const data = (payload as any).data ?? payload;
    console.warn(`[Webhook] Payment failed: ${data.payment_id}`);
  },
});
