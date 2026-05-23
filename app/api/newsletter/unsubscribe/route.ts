import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/newsletter/unsubscribe?id=<subscriber-uuid>
 * One-click unsubscribe. The subscriber id acts as the token — it's a UUID,
 * hard to guess, and requires no extra column or signed JWT.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing unsubscribe token.', { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ subscribed: false })
    .eq('id', id);

  if (error) {
    console.error('[unsubscribe] DB error:', error);
    return new NextResponse('Unsubscribe failed. Please try again.', { status: 500 });
  }

  // Redirect to a friendly confirmation page
  return NextResponse.redirect(new URL('/?unsubscribed=true', req.url));
}
