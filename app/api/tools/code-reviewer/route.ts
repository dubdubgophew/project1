import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(5).max(10000),
  language: z.string().min(1).max(50),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'code-reviewer');

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const raw = await callAI([
      {
        role: 'system',
        content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance. Review the provided code and return a JSON object with this exact structure:

{
  "issues": [
    { "line": "line number or range or 'general'", "severity": "critical|warning|info", "description": "clear description of the issue", "fix": "how to fix it" }
  ],
  "quality": {
    "score": 7,
    "summary": "overall assessment in 2-3 sentences",
    "positives": ["what the code does well"],
    "negatives": ["what needs improvement"]
  },
  "performance": [
    "performance suggestion 1",
    "performance suggestion 2"
  ],
  "improved_code": "the full improved/fixed version of the code",
  "grade": "A"
}

Grade scale: A (90-100), B (75-89), C (60-74), D (45-59), F (<45)
Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.`,
      },
      {
        role: 'user',
        content: `Review this ${data.language} code:\n\n${data.code}`,
      },
    ], { temperature: 0.2, maxTokens: 3000 });

    let result;
    try {
      const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse review results. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Code reviewer error:', err);
    return NextResponse.json({ error: 'Failed to review code. Please try again.' }, { status: 500 });
  }
}
