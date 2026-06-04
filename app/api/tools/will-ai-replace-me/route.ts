import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  jobTitle: z.string().min(2).max(100),
  industry: z.string().min(2).max(80),
  skills: z.string().max(500).optional(),
  yearsExperience: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'will-ai-replace-me');
  if (!rl.allowed) return NextResponse.json({ error: rl.reason }, { status: 429 });
  void logUsage(req, 'will-ai-replace-me');

  try {
    const body = await req.json();
    const { jobTitle, industry, skills, yearsExperience } = schema.parse(body);

    const raw = await callAI([
      {
        role: 'system',
        content: `You are a leading AI researcher, labor economist, and futurist with deep expertise in automation, AI capabilities, and the future of work. You have studied McKinsey, Oxford, and MIT research on AI job displacement extensively.

Be honest, data-driven, and specific. Calibrate risk based on:
- Task routineness and predictability
- Physical vs. cognitive tasks
- Level of creativity, empathy, and complex judgment required
- Current AI capabilities (LLMs, robotics, computer vision)
- Industry-specific AI adoption trends
- Historical precedent from automation waves

Return ONLY valid JSON — no markdown, no extra text:
{
  "risk_percentage": <integer 0-100, be brutally honest>,
  "risk_level": <"VERY_LOW"|"LOW"|"MEDIUM"|"HIGH"|"VERY_HIGH">,
  "survival_title": "<creative fun title like 'The Digital Dinosaur' or 'The Human Fortress' or 'The Cautious Transformer'>",
  "survival_description": "<2-3 sentences that are funny but accurate about their situation>",
  "replacement_year_range": "<e.g. '2028–2033' | 'Already happening (2024–2026)' | 'Beyond 2040' | 'Unlikely in your career'>",
  "at_risk_tasks": [<exactly 6 specific tasks from THEIR job that AI handles well today>],
  "safe_tasks": [<exactly 6 specific tasks that genuinely require human qualities>],
  "skills_to_learn": [<exactly 5 specific skills, tools, or certifications to stay relevant>],
  "current_ai_threats": "<2-3 sentences naming specific AI tools already encroaching on their role>",
  "why_safe": "<2-3 sentences explaining what protects them>",
  "fun_verdict": "<one hilarious but accurate analogy — e.g. 'Your job is like a Nokia 3310 in 2007: technically still functional, but everyone can see what's coming.'>",
  "action_plan": [<exactly 3 specific, concrete actions to take in the next 6 months>],
  "ai_collaboration_tips": [<exactly 3 ways they can use AI to make themselves MORE valuable, not less>],
  "salary_impact": "<1 sentence on how AI will affect salaries in their field over next 5 years>"
}`,
      },
      {
        role: 'user',
        content: `Job Title: ${jobTitle}
Industry: ${industry}${skills ? `\nCurrent Skills: ${skills}` : ''}${yearsExperience ? `\nYears of Experience: ${yearsExperience}` : ''}`,
      },
    ], { temperature: 0.4, maxTokens: 1600 });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[will-ai-replace-me]', err);
    return NextResponse.json({ error: 'Failed to analyze job. Please try again.' }, { status: 500 });
  }
}
