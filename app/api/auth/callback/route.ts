import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const plan = searchParams.get('plan') ?? 'free';
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create profile if it doesn't exist
      const admin = createAdminClient();
      await admin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? data.user.email?.split('@')[0],
        plan: 'free',
      }, { onConflict: 'id', ignoreDuplicates: true });

      // If signing up for paid plan, redirect to payment
      if (plan === 'pro' || plan === 'unlimited') {
        return NextResponse.redirect(
          `${origin}/pricing?plan=${plan}&checkout=true`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
