import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(10, 'Text too short').max(10000, 'Text too long'),
  mode: z.enum(['standard', 'formal', 'creative', 'academic', 'simple']),
});

const modePrompts = {
  standard: 'Rewrite the following text in a natural, balanced way that preserves the meaning but uses different words and sentence structures.',
  formal: 'Rewrite the following text in a formal, professional, polished tone suitable for business or official contexts.',
  creative: 'Rewrite the following text in a creative, engaging, and unique way that makes it more interesting and memorable.',
  academic: 'Rewrite the following text in an academic, scholarly style with precise language, passive voice where appropriate, and formal vocabulary.',
  simple: 'Rewrite the following text in simple, clear language that anyone can understand. Use short sentences and common words.',
};

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'paraphrase');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { text, mode } = schema.parse(body);

    const result = await callAI([
      {
        role: 'system',
        content: `You are an expert writer and editor. ${modePrompts[mode]}

Rules:
- Preserve the original meaning completely
- Do NOT add new information or opinions
- Do NOT include any meta-commentary (don't say "Here is the rewritten text:")
- Just output the rewritten text directly
- Match the approximate length of the original`,
      },
      {
        role: 'user',
        content: text,
      },
    ], { temperature: 0.7, maxTokens: 2000 });

    return NextResponse.json({ result, remaining: limit.remaining });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Paraphrase error:', err);
    return NextResponse.json({ error: 'Failed to paraphrase. Please try again.' }, { status: 500 });
  }
}
