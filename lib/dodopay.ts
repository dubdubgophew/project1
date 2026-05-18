import DodoPayments from 'dodopayments';

let _client: DodoPayments | null = null;

export function getDodoClient(): DodoPayments {
  if (!_client) {
    _client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'live_mode') as 'test_mode' | 'live_mode',
    });
  }
  return _client;
}

export const DODO_PLANS = {
  pro: {
    productId: process.env.DODO_PRO_PRODUCT_ID!,
    priceUSD: 9.99,
    name: 'Pro',
    type: 'subscription' as const,
  },
  unlimited: {
    productId: process.env.DODO_UNLIMITED_PRODUCT_ID!,
    priceUSD: 19.99,
    name: 'Unlimited',
    type: 'subscription' as const,
  },
  day_pass: {
    productId: process.env.DODO_DAY_PASS_PRODUCT_ID!,
    priceUSD: 1.99,
    name: 'Day Pass',
    type: 'one_time' as const,
  },
};

export async function createDodoCheckout({
  plan,
  userEmail,
  userName,
  userId,
  returnUrl,
}: {
  plan: 'pro' | 'unlimited' | 'day_pass';
  userEmail: string;
  userName?: string;
  userId: string;
  returnUrl: string;
}) {
  const client = getDodoClient();
  const planConfig = DODO_PLANS[plan];

  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: planConfig.productId, quantity: 1 }],
    customer: { email: userEmail, name: userName ?? userEmail },
    return_url: returnUrl,
    metadata: { userId, plan },
  } as Parameters<typeof client.checkoutSessions.create>[0]);

  return session;
}

export async function cancelDodoSubscription(subscriptionId: string) {
  const client = getDodoClient();
  return client.subscriptions.update(subscriptionId, { status: 'cancelled' } as Parameters<typeof client.subscriptions.update>[1]);
}
