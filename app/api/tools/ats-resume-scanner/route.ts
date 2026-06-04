import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  resume: z.string().min(50).max(8000),
  jobDescription: z.string().min(30).max(5000),
});

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'ats-resume-scanner');
  if (rl) return rl;
  void logUsage(req, 'ats-resume-scanner');

  try {
    const body = await req.json();
    const { resume, jobDescription } = schema.parse(body);

    const raw = await callAI([
      {
        role: 'system',
        content: `You are a senior ATS (Applicant Tracking System) expert and career coach with 15+ years of experience. Analyze resumes with the precision of enterprise ATS software like Taleo, Workday, Greenhouse, and Lever.

Return ONLY valid JSON — no markdown, no extra text:
{
  "overall_score": <integer 0-100>,
  "grade": <"A+"|"A"|"B+"|"B"|"C+"|"C"|"D"|"F">,
  "verdict": "<1 brutally honest sentence about their chances>",
  "keywords_found": [<up to 15 exact keyword strings from JD found in resume>],
  "keywords_missing": [<up to 15 critical keywords from JD NOT in resume>],
  "formatting_score": <integer 0-100>,
  "formatting_issues": [<3-6 specific formatting/structure issues found>],
  "sections": {
    "contact": { "score": <0-100>, "feedback": "<specific feedback>" },
    "summary": { "score": <0-100>, "feedback": "<specific feedback>" },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>" },
    "skills": { "score": <0-100>, "feedback": "<specific feedback>" },
    "education": { "score": <0-100>, "feedback": "<specific feedback>" }
  },
  "top_suggestions": [<exactly 6 specific, actionable improvement suggestions>],
  "quick_wins": [<exactly 3 things they can fix in under 10 minutes>],
  "power_words_missing": [<5 strong action verbs missing from their experience bullets>],
  "quantification_score": <0-100, how well they use numbers/metrics>,
  "match_summary": "<2-3 sentences on overall fit and what's holding them back>"
}`,
      },
      {
        role: 'user',
        content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ], { temperature: 0.2, maxTokens: 1800 });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[ats-resume-scanner]', err);
    return NextResponse.json({ error: 'Failed to analyze resume. Please try again.' }, { status: 500 });
  }
}
