import DodoPayments from 'dodopayments';

export function getDodoClient(): DodoPayments {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'live_mode') as 'test_mode' | 'live_mode',
  });
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

const BILLING_PLACEHOLDER = {
  city: '',
  country: 'US' as const,
  state: '',
  street: '',
  zipcode: '',
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
}): Promise<string> {
  const client = getDodoClient();
  const planConfig = DODO_PLANS[plan];
  const customer = { email: userEmail, name: userName ?? userEmail };
  const metadata = { userId, plan };

  if (planConfig.type === 'one_time') {
    // One-time payment (Day Pass)
    const payment = await client.payments.create({
      billing: BILLING_PLACEHOLDER,
      customer,
      product_cart: [{ product_id: planConfig.productId, quantity: 1 }],
      payment_link: true,
      return_url: returnUrl,
      metadata,
    } as Parameters<typeof client.payments.create>[0]);

    const url = (payment as any).payment_link ?? (payment as any).checkout_url ?? (payment as any).url;
    if (!url) throw new Error(`No payment URL returned. Response: ${JSON.stringify(payment)}`);
    return url;
  } else {
    // Subscription (Pro / Unlimited)
    const subscription = await client.subscriptions.create({
      billing: BILLING_PLACEHOLDER,
      customer,
      product_id: planConfig.productId,
      quantity: 1,
      payment_link: true,
      return_url: returnUrl,
      metadata,
    } as Parameters<typeof client.subscriptions.create>[0]);

    const url = (subscription as any).payment_link ?? (subscription as any).checkout_url ?? (subscription as any).url;
    if (!url) throw new Error(`No checkout URL returned. Response: ${JSON.stringify(subscription)}`);
    return url;
  }
}

export async function cancelDodoSubscription(subscriptionId: string) {
  const client = getDodoClient();
  return client.subscriptions.update(
    subscriptionId,
    { status: 'cancelled' } as Parameters<typeof client.subscriptions.update>[1]
  );
}
