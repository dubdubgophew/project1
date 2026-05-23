import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

function welcomeHtml(unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#030712;color:#f9fafb;margin:0;padding:0}
  .wrap{max-width:600px;margin:0 auto;padding:32px 24px}
  .logo{font-size:22px;font-weight:800;color:white;margin-bottom:32px}
  .logo span{color:#a855f7}
  .hero{background:linear-gradient(135deg,#7c3aed20,#a855f720);border:1px solid #7c3aed40;border-radius:16px;padding:32px;margin-bottom:28px;text-align:center}
  .hero h1{margin:0 0 12px;font-size:26px;color:white}
  .hero p{margin:0;color:#9ca3af;font-size:15px;line-height:1.6}
  .what{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:24px;margin-bottom:20px}
  .what h2{margin:0 0 16px;font-size:16px;color:white}
  .item{display:flex;gap:12px;margin-bottom:14px;align-items:flex-start}
  .item .icon{font-size:20px;flex-shrink:0;margin-top:1px}
  .item p{margin:0;font-size:14px;color:#9ca3af;line-height:1.5}
  .item p strong{color:#d1d5db}
  .cta{text-align:center;margin:28px 0}
  .btn{display:inline-block;background:#7c3aed;color:white;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:12px}
  .footer{text-align:center;color:#374151;font-size:12px;margin-top:32px;line-height:1.8}
  .footer a{color:#6b7280;text-decoration:none}
</style></head>
<body>
<div class="wrap">
  <div class="logo">form<span>ly</span></div>

  <div class="hero">
    <div style="font-size:40px;margin-bottom:12px">🤖</div>
    <h1>You're subscribed to the Daily AI Digest</h1>
    <p>Every morning you'll get the top AI stories from 10 sources — tools, research, companies, and breakthroughs — summarized by AI so you can stay sharp without the noise.</p>
  </div>

  <div class="what">
    <h2>What to expect in each digest:</h2>
    <div class="item">
      <span class="icon">⚡</span>
      <p><strong>Top 8 AI stories</strong> curated from TechCrunch, VentureBeat, MIT Technology Review, Google AI Blog, and 6 more sources</p>
    </div>
    <div class="item">
      <span class="icon">🧠</span>
      <p><strong>AI-written summaries</strong> — 150-word plain-English explanations of why each story matters to developers and AI enthusiasts</p>
    </div>
    <div class="item">
      <span class="icon">📅</span>
      <p><strong>Delivered daily</strong> every morning so you start the day informed</p>
    </div>
  </div>

  <div class="cta">
    <a href="https://formly.tools/ai-news" class="btn">Read Today's AI News →</a>
  </div>

  <div class="footer">
    <p>Formly · Free AI Tools for Professionals · <a href="https://formly.tools">formly.tools</a></p>
    <p><a href="${unsubscribeUrl}">Unsubscribe</a> · <a href="https://formly.tools/privacy">Privacy Policy</a></p>
  </div>
</div>
</body>
</html>`;
}

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

    // Upsert subscriber — get the id back for the unsubscribe link
    const { data: row } = await admin
      .from('newsletter_subscribers')
      .upsert({ email, subscribed: true }, { onConflict: 'email' })
      .select('id, created_at')
      .single();

    // Send welcome email only to genuinely new subscribers
    const isNew = row && new Date(row.created_at).getTime() > Date.now() - 10_000;
    if (isNew && process.env.RESEND_API_KEY && row?.id) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const unsubscribeUrl = `https://formly.tools/api/newsletter/unsubscribe?id=${row.id}`;
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'Formly <noreply@formly.tools>',
        to: email,
        subject: '🤖 You\'re in — Daily AI Digest confirmed',
        html: welcomeHtml(unsubscribeUrl),
      }).catch(err => console.error('[newsletter] Welcome email failed:', err));
    }

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
