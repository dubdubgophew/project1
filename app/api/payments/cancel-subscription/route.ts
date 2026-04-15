import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cancelStripeSubscription } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single();

    if (sub?.stripe_subscription_id) {
      await cancelStripeSubscription(sub.stripe_subscription_id);
    }

    // Update DB
    await admin.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', user.id);
    await admin.from('profiles').update({ plan: 'free' }).eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return NextResponse.json({ error: 'Cancellation failed.' }, { status: 500 });
  }
}
