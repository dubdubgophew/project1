import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  jobTitle: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  yourName: z.string().min(2).max(100),
  yourBackground: z.string().min(10).max(1000),
  keySkills: z.string().min(5).max(1000),
  jobDescription: z.string().max(3000).optional(),
  tone: z.enum(['Professional', 'Enthusiastic', 'Concise']),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'cover-letter');

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const letter = await callAI([
      {
        role: 'system',
        content: `You are an expert career coach and professional writer specializing in cover letters that get interviews. Write compelling, specific cover letters that stand out.

Rules:
- 3-4 paragraphs, max 400 words total
- First paragraph: strong hook + specific role + why this company
- Second paragraph: most relevant experience + concrete achievements (use numbers if possible)
- Third paragraph: why this company specifically (not generic praise)
- Fourth paragraph: confident call to action
- NO clichés: no "I am writing to express my interest", no "team player", no "hard worker", no "passion for"
- ATS-friendly: naturally include job title and key skills
- Match the tone: ${data.tone}
- Output the complete letter ready to use (include "Dear Hiring Manager," and sign-off with candidate name)
- Include today's date at the top`,
      },
      {
        role: 'user',
        content: `Write a cover letter for:
Name: ${data.yourName}
Applying for: ${data.jobTitle} at ${data.company}
My background: ${data.yourBackground}
Key skills: ${data.keySkills}
${data.jobDescription ? `\nJob description:\n${data.jobDescription}` : ''}
Tone: ${data.tone}`,
      },
    ], { temperature: 0.6, maxTokens: 1200 });

    return NextResponse.json({ letter });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Cover letter error:', err);
    return NextResponse.json({ error: 'Failed to generate cover letter. Please try again.' }, { status: 500 });
  }
}
