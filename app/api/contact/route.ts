import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = schema.parse(body);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'Formly Contact <noreply@formly.tools>',
      to: 'support@formly.tools',
      replyTo: email,
      subject: `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1c1917;margin-bottom:16px">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#78716c;width:100px">Name:</td><td style="padding:8px 0;color:#1c1917;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#78716c">Email:</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#f97316">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#78716c">Subject:</td><td style="padding:8px 0;color:#1c1917">${subject}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0" />
          <p style="color:#44403c;line-height:1.7;white-space:pre-wrap">${message}</p>
        </div>
      `,
    });

    await resend.emails.send({
      from: 'Formly <support@formly.tools>',
      to: email,
      subject: `We received your message — Formly`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fafaf9">
          <h2 style="color:#1c1917">Hi ${name},</h2>
          <p style="color:#44403c;line-height:1.7">Thanks for reaching out! We've received your message about <strong>"${subject}"</strong> and will get back to you within 24–48 hours.</p>
          <p style="color:#44403c;line-height:1.7">In the meantime, you can explore our <a href="https://formly.tools/tools" style="color:#f97316">48 free AI tools</a> or check our <a href="https://formly.tools/blog" style="color:#f97316">tool guides</a>.</p>
          <p style="color:#78716c;font-size:13px;margin-top:32px">— The Formly Team<br>support@formly.tools</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
