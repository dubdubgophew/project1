import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(100),
  profession: z.string().min(2).max(200),
  achievements: z.string().min(10).max(2000),
  platform: z.string().max(50).default('LinkedIn'),
  tone: z.string().max(30).default('Professional'),
  length: z.enum(['short', 'medium', 'long']),
});

const lengthTargets = {
  short: 'Maximum 150 characters (like a Twitter bio)',
  medium: 'Around 300 characters (2-3 sentences)',
  long: 'Around 500 characters (4-5 sentences)',
};

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'bio');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, profession, achievements, platform, tone, length } = schema.parse(body);

    const bio = await callAI([
      {
        role: 'system',
        content: `You are an expert personal branding specialist and copywriter.

Write a ${tone.toLowerCase()} professional bio for ${platform}.

Requirements:
- Length: ${lengthTargets[length]}
- Tone: ${tone}
- Platform: ${platform}
- Must feel human, authentic, and compelling
- Highlight the most impressive and relevant details
- Start with the person's name or role (NOT "I am" or "My name is")
- For ${platform}: ${
            platform === 'LinkedIn'
              ? 'Focus on professional value, expertise, and impact. Use keywords.'
              : platform === 'Twitter/X'
              ? 'Be punchy, personality-driven, with a touch of humor if appropriate. Add emoji if fits the tone.'
              : platform === 'Instagram'
              ? 'Be creative, show personality, use line breaks, add relevant emoji.'
              : platform === 'GitHub'
              ? 'Focus on technical skills, projects, and open-source contributions.'
              : 'Be versatile and comprehensive.'
          }
- Do NOT include placeholder text like [Company] or [Achievement]
- Output ONLY the bio text, nothing else`,
      },
      {
        role: 'user',
        content: `Name: ${name}
Profession: ${profession}
Background & Achievements: ${achievements}`,
      },
    ], { temperature: 0.8, maxTokens: 400 });

    return NextResponse.json({ bio: bio.trim(), remaining: limit.remaining });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Bio writer error:', err);
    return NextResponse.json({ error: 'Failed to write bio. Please try again.' }, { status: 500 });
  }
}
