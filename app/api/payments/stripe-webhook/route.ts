import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

// Disable body parsing — Stripe needs raw body for signature verification
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature error:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

          // Update user plan
          await admin.from('profiles').update({ plan }).eq('id', userId);

          // Upsert subscription record
          await admin.from('subscriptions').upsert({
            user_id: userId,
            plan,
            status: 'active',
            stripe_subscription_id: subscriptionId,
            current_period_end: periodEnd,
          }, { onConflict: 'user_id' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const plan = sub.metadata?.plan ?? 'free';
        const status = sub.status === 'active' ? 'active' : sub.status;
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        await admin.from('profiles').update({
          plan: status === 'active' ? plan : 'free',
        }).eq('id', userId);

        await admin.from('subscriptions').update({
          status,
          plan,
          current_period_end: periodEnd,
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        // Downgrade to free
        await admin.from('profiles').update({ plan: 'free' }).eq('id', userId);
        await admin.from('subscriptions').update({
          status: 'cancelled',
          plan: 'free',
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Could send email here via Resend
        console.warn('Payment failed for customer:', invoice.customer);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
