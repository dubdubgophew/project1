import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const parsed = await pdfParse(buffer);
  return parsed.text;
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'ats-resume-scanner');
  if (!rl.allowed) return NextResponse.json({ error: rl.reason }, { status: 429 });
  void logUsage(req, 'ats-resume-scanner');

  try {
    let resumeText = '';
    let jobDescription = '';
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      jobDescription = (formData.get('jobDescription') as string ?? '').trim();

      const file = formData.get('resumeFile') as File | null;
      const pastedText = (formData.get('resumeText') as string ?? '').trim();

      if (file && file.size > 0) {
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'Resume file too large. Maximum 5 MB.' }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        try {
          resumeText = await extractTextFromPDF(buffer);
        } catch {
          return NextResponse.json({ error: 'Could not read your PDF. Please paste the resume text instead.' }, { status: 400 });
        }
      } else {
        resumeText = pastedText;
      }
    } else {
      const body = await req.json();
      resumeText = (body.resume ?? '').trim();
      jobDescription = (body.jobDescription ?? '').trim();
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: 'Resume is too short. Please provide your full resume.' }, { status: 400 });
    }
    if (!jobDescription || jobDescription.length < 30) {
      return NextResponse.json({ error: 'Please provide the job description.' }, { status: 400 });
    }

    const truncatedResume = resumeText.slice(0, 6000);
    const truncatedJD = jobDescription.slice(0, 3000);

    const raw = await callAI([
      {
        role: 'system',
        content: `You are a senior ATS expert and career coach. Analyze the resume against the job description with the precision of enterprise ATS systems (Taleo, Workday, Greenhouse, Lever).

Return ONLY valid JSON — no markdown, no extra text:
{
  "overall_score": <integer 0-100>,
  "grade": <"A+"|"A"|"B+"|"B"|"C+"|"C"|"D"|"F">,
  "verdict": "<1 brutally honest sentence about their chances>",
  "keywords_found": [<up to 15 exact keyword strings from JD found in resume>],
  "keywords_missing": [<up to 15 critical keywords from JD NOT in resume>],
  "formatting_score": <integer 0-100>,
  "formatting_issues": [<3-6 specific formatting/structure issues>],
  "sections": {
    "contact": { "score": <0-100>, "feedback": "<specific feedback>" },
    "summary": { "score": <0-100>, "feedback": "<specific feedback>" },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>" },
    "skills": { "score": <0-100>, "feedback": "<specific feedback>" },
    "education": { "score": <0-100>, "feedback": "<specific feedback>" }
  },
  "top_suggestions": [<exactly 6 specific actionable improvement suggestions>],
  "quick_wins": [<exactly 3 things to fix in under 10 minutes>],
  "power_words_missing": [<5 strong action verbs missing from experience bullets>],
  "quantification_score": <0-100>,
  "match_summary": "<2-3 sentences on overall fit and what is holding them back>"
}`,
      },
      {
        role: 'user',
        content: `RESUME:\n${truncatedResume}\n\nJOB DESCRIPTION:\n${truncatedJD}`,
      },
    ], { temperature: 0.2, maxTokens: 1800 });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (err) {
    console.error('[ats-resume-scanner]', err);
    return NextResponse.json({ error: 'Failed to analyze resume. Please try again.' }, { status: 500 });
  }
}
