import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const experienceSchema = z.object({
  company: z.string().max(100),
  role: z.string().max(100),
  duration: z.string().max(100),
  bullets: z.string().max(2000),
});

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  location: z.string().max(100).optional(),
  jobTitle: z.string().min(2).max(100),
  summary: z.string().max(1000).optional(),
  skills: z.string().min(5).max(2000),
  experience: z.array(experienceSchema).max(10),
  education: z.array(z.object({
    institution: z.string().max(100),
    degree: z.string().max(100),
    year: z.string().max(10),
  })).max(5),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'resume');

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const experienceText = data.experience
      .filter((e) => e.company || e.role)
      .map(
        (e) =>
          `${e.role} at ${e.company} (${e.duration})\n${e.bullets}`
      )
      .join('\n\n');

    const educationText = data.education
      .filter((e) => e.institution || e.degree)
      .map((e) => `${e.degree} — ${e.institution} (${e.year})`)
      .join('\n');

    const resume = await callAI([
      {
        role: 'system',
        content: `You are an expert resume writer and career coach. Create a professional, ATS-optimized resume.

Rules:
- Use clean formatting with clear sections
- Transform the raw experience bullets into powerful, metric-driven achievement statements
- Start each bullet with a strong action verb
- Optimize for ATS by using relevant keywords from the job title
- Write a compelling professional summary if not provided or enhance if provided
- Keep the format text-based (no tables, no special characters except standard ones)
- Output the complete resume ready to copy-paste

Format:
[NAME]
[Email] | [Phone] | [Location]

PROFESSIONAL SUMMARY
[2-3 sentence compelling summary]

SKILLS
[Organized list of skills]

WORK EXPERIENCE
[Company] | [Role] | [Duration]
• [Achievement bullet 1]
• [Achievement bullet 2]

EDUCATION
[Degree] — [Institution] | [Year]`,
      },
      {
        role: 'user',
        content: `Create a resume for:
Name: ${data.name}
Target Role: ${data.jobTitle}
Email: ${data.email || 'N/A'}
Phone: ${data.phone || 'N/A'}
Location: ${data.location || 'N/A'}

Professional Summary: ${data.summary || 'Please write a compelling summary based on experience'}

Skills: ${data.skills}

Work Experience:
${experienceText || 'No experience listed'}

Education:
${educationText || 'Not provided'}`,
      },
    ], { temperature: 0.4, maxTokens: 2000 });

    return NextResponse.json({ resume });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Resume builder error:', err);
    return NextResponse.json({ error: 'Failed to build resume. Please try again.' }, { status: 500 });
  }
}
