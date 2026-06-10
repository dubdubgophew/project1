import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(10, 'Text too short').max(10000, 'Text too long'),
  mode: z.enum(['fluent', 'formal', 'creative', 'academic', 'simple']),
});

const modePrompts = {
  fluent: 'Rewrite the following text to flow more naturally and smoothly, improving sentence rhythm and word choice while preserving the exact meaning. Fix any awkward phrasing, repetition, or choppy sentences.',
  formal: 'Rewrite the following text in a formal, professional, polished tone suitable for business reports, official correspondence, or executive communications.',
  creative: 'Rewrite the following text in a creative, vivid, and engaging way that makes it more memorable — vary sentence structure, use stronger verbs, and add expressive vocabulary.',
  academic: 'Rewrite the following text in a scholarly academic style: precise terminology, appropriate use of passive voice, formal vocabulary, and objective tone suitable for research papers.',
  simple: 'Rewrite the following text in plain, simple language that a 6th-grader can understand. Use short sentences, common words, and avoid jargon.',
};

export async function POST(req: NextRequest) {
  void logUsage(req, 'paraphrase');

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
- Output the rewritten text directly with no preamble
- Match the approximate length of the original (±20%)
- Every sentence must be noticeably different from the original`,
      },
      {
        role: 'user',
        content: text,
      },
    ], { temperature: 0.75, maxTokens: 2000 });

    const wordsBefore = text.trim().split(/\s+/).length;
    const wordsAfter = result.trim().split(/\s+/).length;

    return NextResponse.json({ result, wordsBefore, wordsAfter });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Paraphrase error:', err);
    return NextResponse.json({ error: 'Failed to paraphrase. Please try again.' }, { status: 500 });
  }
}
