import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  purpose: z.string().min(2).max(100),
  recipient: z.string().min(2).max(100),
  tone: z.string().min(2).max(30),
  keyPoints: z.string().min(10).max(2000),
  senderName: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'email-writer');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { purpose, recipient, tone, keyPoints, senderName } = schema.parse(body);

    const email = await callAI([
      {
        role: 'system',
        content: `You are an expert business writer who crafts perfect professional emails.

Write a complete email (subject line + body) with these requirements:
- Purpose: ${purpose}
- Recipient: ${recipient}
- Tone: ${tone}
- Must include: ${keyPoints}
${senderName ? `- Signed by: ${senderName}` : ''}

Format:
Subject: [Subject line here]

[Email body here]

Best regards,
${senderName || '[Your Name]'}

Rules:
- Write a real, ready-to-send email — not a template with placeholders
- Be ${tone.toLowerCase()} in tone
- Keep it concise and impactful
- NO meta-commentary — output only the email itself`,
      },
      {
        role: 'user',
        content: `Write the email now.`,
      },
    ], { temperature: 0.7, maxTokens: 800 });

    return NextResponse.json({ email, remaining: limit.remaining });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Email writer error:', err);
    return NextResponse.json({ error: 'Failed to generate email. Please try again.' }, { status: 500 });
  }
}
