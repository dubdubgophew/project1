import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(5).max(5000),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'grammar');

  try {
    const body = await req.json();
    const { text } = schema.parse(body);

    const result = await callAI([
      {
        role: 'system',
        content: `You are an expert grammar checker, editor, and writing coach. Analyze the given text and:
1. Fix ALL grammar, spelling, punctuation, and style issues
2. Identify each issue with type, original text, correction, and brief explanation
3. Assess reading level and writing quality

Respond ONLY with valid JSON in this exact format:
{
  "corrected": "The fully corrected text here",
  "score": 85,
  "reading_level": "Grade 8 (Hemingway App equivalent)",
  "tone": "Professional|Casual|Academic|Conversational|Technical",
  "issues": [
    {
      "type": "grammar|spelling|punctuation|style|clarity|wordiness",
      "original": "the wrong text",
      "correction": "the correct text",
      "explanation": "Brief explanation of why"
    }
  ]
}

Score 100 = perfect, 0 = many errors.
Reading level: estimate as "Grade X" (e.g. Grade 6 = simple, Grade 12 = complex).
Detect ALL issue types: grammar, spelling, punctuation, style, passive voice overuse, wordiness, unclear pronoun references, dangling modifiers.
Be accurate and thorough.`,
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
      reading_level: parsed.reading_level ?? '',
      tone: parsed.tone ?? '',
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 25) : [],
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Grammar check error:', err);
    return NextResponse.json({ error: 'Failed to check grammar. Please try again.' }, { status: 500 });
  }
}
