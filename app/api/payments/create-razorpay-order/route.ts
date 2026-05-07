import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { razorpay, RAZORPAY_PLANS, createRazorpaySubscription } from '@/lib/razorpay';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['pro', 'unlimited']),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = schema.parse(body);

    const planConfig = RAZORPAY_PLANS[plan];
    const subscription = await createRazorpaySubscription(planConfig.planId);

    const admin = createAdminClient();
    // Store pending subscription
    await admin.from('subscriptions').upsert({
      user_id: user.id,
      plan,
      status: 'pending',
      razorpay_subscription_id: subscription.id,
    }, { onConflict: 'user_id' });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: planConfig.amount,
      currency: 'INR',
      name: 'Formly',
      description: `Formly ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
      prefill: {
        email: user.email,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Razorpay order error:', err);
    return NextResponse.json({ error: 'Failed to create payment order.' }, { status: 500 });
  }
}
