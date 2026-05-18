import type { NextRequest } from 'next/server';
import { Webhooks } from '@dodopayments/nextjs';
import { createAdminClient } from '@/lib/supabase/server';

let _handler: ReturnType<typeof Webhooks> | null = null;

function getWebhookHandler() {
  if (_handler) return _handler;

  _handler = Webhooks({
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
    },

    onPaymentSucceeded: async (payload) => {
      const data = (payload as any).data ?? payload;
      const { userId, plan } = data.metadata ?? {};

      // Handle Day Pass one-time payment
      if (plan === 'day_pass' && userId) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const admin = createAdminClient();
        await admin.from('profiles').update({ plan: 'pro' }).eq('id', userId);
        await admin.from('subscriptions').upsert({
          user_id: userId,
          plan: 'pro',
          status: 'active',
          current_period_end: expiresAt,
        }, { onConflict: 'user_id' });
        console.log(`[Webhook] Day Pass activated for user ${userId} — expires ${expiresAt}`);
      } else {
        console.log(`[Webhook] Payment succeeded: ${data.payment_id}`);
      }
    },

    onPaymentFailed: async (payload) => {
      const data = (payload as any).data ?? payload;
      console.warn(`[Webhook] Payment failed: ${data.payment_id}`);
    },
  });

  return _handler;
}

export async function POST(req: NextRequest) {
  return getWebhookHandler()(req);
}
