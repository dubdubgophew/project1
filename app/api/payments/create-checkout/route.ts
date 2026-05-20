import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDodoCheckout } from '@/lib/dodopay';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['pro', 'unlimited', 'day_pass']),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const body = await req.json();
    const { plan } = schema.parse(body);

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL!;

    const checkoutUrl = await createDodoCheckout({
      plan,
      userEmail: user.email!,
      userName: user.user_metadata?.name,
      userId: user.id,
      returnUrl: `${origin}/dashboard?upgrade=success&plan=${plan}`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
