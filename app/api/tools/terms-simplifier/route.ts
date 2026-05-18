import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(100).max(15000),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'terms-simplifier');

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const raw = await callAI([
      {
        role: 'system',
        content: `You are a consumer privacy advocate and legal expert. Analyze terms of service / privacy policies and extract key information in plain English.

Return a JSON object with this exact structure:
{
  "tldr": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "they_can_do": ["thing 1", "thing 2"],
  "you_can_do": ["right 1", "right 2"],
  "red_flags": ["concerning clause 1", "concerning clause 2"],
  "data_collected": ["data type 1", "data type 2"],
  "your_rights": ["right 1", "right 2"],
  "privacy_score": 7,
  "privacy_score_reason": "brief explanation of the score"
}

Guidelines:
- tldr: 3-5 most important things users MUST know
- they_can_do: what the company/service is allowed to do
- you_can_do: what rights and actions you have as a user
- red_flags: genuinely concerning clauses that could harm users (empty array if none)
- data_collected: specific types of personal data they collect
- your_rights: legal/contractual rights you retain
- privacy_score: 1-10 (1 = extremely invasive/dangerous, 10 = very privacy-friendly)
- Be specific and plain-language. No legal jargon.
- Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.`,
      },
      {
        role: 'user',
        content: `Analyze these terms/privacy policy:\n\n${data.text}`,
      },
    ], { temperature: 0.2, maxTokens: 2000 });

    let result;
    try {
      const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse results. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Terms simplifier error:', err);
    return NextResponse.json({ error: 'Failed to analyze terms. Please try again.' }, { status: 500 });
  }
}
