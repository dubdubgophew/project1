import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }
  return _stripe;
}

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    amount: 900,
    currency: 'usd',
    interval: 'month',
  },
  unlimited: {
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID!,
    amount: 1900,
    currency: 'usd',
    interval: 'month',
  },
} as const;

export async function createStripeCustomer(email: string, name?: string) {
  return getStripe().customers.create({ email, name });
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId,
  plan,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  plan: string;
}) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
    allow_promotion_codes: true,
  });
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}
