import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyRazorpaySubscriptionSignature } from '@/lib/razorpay';
import { z } from 'zod';

const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
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
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan } = schema.parse(body);

    // Verify signature
    const isValid = verifyRazorpaySubscriptionSignature({
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Activate subscription
    await admin.from('profiles').update({ plan }).eq('id', user.id);

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await admin.from('subscriptions').upsert({
      user_id: user.id,
      plan,
      status: 'active',
      razorpay_subscription_id,
      current_period_end: periodEnd.toISOString(),
    }, { onConflict: 'user_id' });

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 500 });
  }
}
