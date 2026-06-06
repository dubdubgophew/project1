import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(50).max(5000),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'plagiarism');

  try {
    const body = await req.json();
    const { text } = schema.parse(body);

    const wordCount = text.trim().split(/\s+/).length;

    const result = await callAI([
      {
        role: 'system',
        content: `You are an expert plagiarism detection AI. Analyze the given text and identify:
1. Signs of plagiarism: copied phrases, style inconsistencies, mixing of academic/casual writing, suspiciously perfect phrasing from known texts
2. Segment-level risk: break the text into logical segments (1-3 sentences each) and assess plagiarism risk for each
3. Improvement suggestions

Return ONLY valid JSON in this exact format:
{
  "originality_score": 82,
  "risk_level": "low",
  "summary": "One sentence summary of the assessment",
  "segments": [
    {
      "text": "exact text from input",
      "risk": "low",
      "reason": "why this segment is or isn't concerning"
    }
  ],
  "suggestions": [
    "Specific actionable suggestion to improve originality"
  ],
  "search_queries": [
    "exact phrase to Google to verify source"
  ]
}

Risk levels: "low" (clearly original), "medium" (possibly paraphrased or common phrasing), "high" (likely copied verbatim or closely paraphrased from a known source).
Originality score: 0-100 (100 = fully original, 0 = entirely plagiarized).
Risk level overall: "low" (score 75-100), "medium" (40-74), "high" (0-39).
Include 2-5 segments, 2-4 suggestions, and 0-3 search_queries only for high-risk segments.
Be specific and accurate. If the text is original, say so clearly.`,
      },
      {
        role: 'user',
        content: `Check this text for plagiarism:\n\n${text}`,
      },
    ], { temperature: 0.2, maxTokens: 2000 });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response');

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      originality_score: Math.max(0, Math.min(100, Number(parsed.originality_score) || 80)),
      risk_level: ['low', 'medium', 'high'].includes(parsed.risk_level) ? parsed.risk_level : 'low',
      summary: parsed.summary || 'Analysis complete.',
      segments: Array.isArray(parsed.segments) ? parsed.segments.slice(0, 10) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 6) : [],
      search_queries: Array.isArray(parsed.search_queries) ? parsed.search_queries.slice(0, 3) : [],
      word_count: wordCount,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Plagiarism check error:', err);
    return NextResponse.json({ error: 'Failed to analyze text. Please try again.' }, { status: 500 });
  }
}
