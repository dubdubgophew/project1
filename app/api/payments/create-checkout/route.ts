import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PLANS, createStripeCustomer, createCheckoutSession } from '@/lib/stripe';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['pro', 'unlimited']),
  currency: z.enum(['usd', 'inr']).default('usd'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, currency } = schema.parse(body);

    // Only Stripe handles USD; Razorpay handles INR (separate route)
    if (currency === 'inr') {
      return NextResponse.json({ error: 'Use /api/payments/create-razorpay-order for INR.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await createStripeCustomer(user.email!, profile?.name);
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;
    const priceId = STRIPE_PLANS[plan].priceId;

    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${origin}/dashboard?upgrade=success&plan=${plan}`,
      cancelUrl: `${origin}/pricing?upgrade=cancelled`,
      userId: user.id,
      plan,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
