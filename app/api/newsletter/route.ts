import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    let email: string;
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = schema.parse(body).email;
    } else {
      const formData = await req.formData();
      email = schema.parse({ email: formData.get('email') }).email;
    }

    const admin = createAdminClient();
    await admin.from('newsletter_subscribers').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    // If request came from a form, redirect back
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL('/?subscribed=true', req.url));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Subscription failed.' }, { status: 500 });
  }
}
