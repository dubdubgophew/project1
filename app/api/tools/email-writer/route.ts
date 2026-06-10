import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  purpose: z.string().min(2).max(100),
  recipient: z.string().min(2).max(100),
  tone: z.string().min(2).max(30),
  keyPoints: z.string().min(10).max(2000),
  senderName: z.string().max(100).optional(),
  length: z.enum(['concise', 'standard', 'detailed']).default('standard'),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'email-writer');

  try {
    const body = await req.json();
    const { purpose, recipient, tone, keyPoints, senderName, length } = schema.parse(body);

    const lengthGuide = {
      concise: '3-4 sentences total body. Ultra-short, get to the point immediately.',
      standard: '2-3 short paragraphs. Clear and complete but no fluff.',
      detailed: '4-5 paragraphs. Thorough with context, details, and clear next steps.',
    };

    const email = await callAI([
      {
        role: 'system',
        content: `You are an expert business writer who crafts perfect professional emails that actually get responses.

Write a complete email (subject line + body) with these requirements:
- Purpose: ${purpose}
- Recipient: ${recipient}
- Tone: ${tone}
- Must include: ${keyPoints}
- Length: ${lengthGuide[length]}
${senderName ? `- Signed by: ${senderName}` : ''}

Format:
Subject: [Compelling subject line — max 50 chars, no clickbait]

[Email body here]

${tone.toLowerCase().includes('formal') ? 'Yours sincerely,' : 'Best regards,'}
${senderName || '[Your Name]'}

Rules:
- Write a real, ready-to-send email — NO placeholders like [Company] or [Achievement]
- Be ${tone.toLowerCase()} throughout
- Subject line must be specific and relevant — not generic like "Regarding your request"
- NO meta-commentary — output only the email itself
- NO clichés: avoid "I hope this email finds you well", "per our conversation", "going forward"`,
      },
      {
        role: 'user',
        content: `Write the email now.`,
      },
    ], { temperature: 0.7, maxTokens: 1000 });

    return NextResponse.json({ email });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Email writer error:', err);
    return NextResponse.json({ error: 'Failed to generate email. Please try again.' }, { status: 500 });
  }
}
