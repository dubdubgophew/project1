import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(5).max(5000),
});

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'grammar');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { text } = schema.parse(body);

    const result = await callAI([
      {
        role: 'system',
        content: `You are an expert grammar checker and editor. Analyze the given text and:
1. Fix ALL grammar, spelling, punctuation, and style issues
2. Identify each issue with type, original text, correction, and brief explanation

Respond ONLY with valid JSON in this exact format:
{
  "corrected": "The fully corrected text here",
  "score": 85,
  "issues": [
    {
      "type": "grammar|spelling|punctuation|style",
      "original": "the wrong text",
      "correction": "the correct text",
      "explanation": "Brief explanation of why"
    }
  ]
}

Score 100 = perfect, 0 = many errors. Be accurate and thorough.`,
      },
      {
        role: 'user',
        content: text,
      },
    ], { temperature: 0.1, maxTokens: 3000 });

    // Parse JSON response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      corrected: parsed.corrected ?? text,
      score: Math.max(0, Math.min(100, parsed.score ?? 80)),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 20) : [],
      remaining: limit.remaining,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Grammar check error:', err);
    return NextResponse.json({ error: 'Failed to check grammar. Please try again.' }, { status: 500 });
  }
}
