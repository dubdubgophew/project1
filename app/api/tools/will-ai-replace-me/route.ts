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
        content: `You are a blunt, well-researched AI labor economist. Your job is to give SPECIFIC, ROLE-TAILORED analysis — not generic boilerplate. Every answer must be unique to the exact job title and industry provided.

CRITICAL RULES:
1. NEVER give generic answers. "Data analysis" and "communication" are lazy. Name the EXACT tasks specific to THIS role.
2. Name REAL AI tools already displacing this role (e.g., "Harvey AI for lawyers", "Midjourney for graphic designers", "GitHub Copilot for developers").
3. The survival_title must be a creative phrase that only makes sense for THIS specific job (not reusable for other roles).
4. The fun_verdict analogy must reference something from THIS specific industry or role culture.
5. at_risk_tasks must be tasks a person in THIS exact role does day-to-day — not abstract descriptions.
6. skills_to_learn must be tools/certifications specific to surviving in THIS field with AI.
7. If your answer could apply to a "Marketing Manager" AND a "Civil Engineer" equally, you have FAILED.

Return ONLY valid JSON:
{
  "risk_percentage": <integer 0-100, calibrated precisely to this role — not rounded to 5s>,
  "risk_level": <"VERY_LOW"|"LOW"|"MEDIUM"|"HIGH"|"VERY_HIGH">,
  "survival_title": "<creative title specific to THIS role — e.g. 'The Last Human Radiologist' or 'The Prompt-Whispering Copywriter'>",
  "survival_description": "<2 sharp, witty sentences that show you understand exactly what THIS person does day to day>",
  "replacement_year_range": "<specific range e.g. '2027–2031' or 'Already happening' or 'Post-2040'>",
  "at_risk_tasks": [<6 specific daily tasks in THIS exact role that AI handles better — be granular, e.g. 'Writing boilerplate API documentation' not 'writing tasks'>],
  "safe_tasks": [<6 specific tasks in THIS role that genuinely require human judgment, relationships, or physical presence>],
  "skills_to_learn": [<5 specific tools, frameworks, or certifications that make THIS role AI-proof — e.g. 'Runway ML for video editors', 'dbt for data analysts', 'Harvey AI prompting for lawyers'>],
  "current_ai_threats": "<2 sentences naming 2-3 REAL, specific AI products already being used in this exact field right now>",
  "why_safe": "<2 sentences on what specifically about this role resists automation — be honest, not reassuring>",
  "fun_verdict": "<one analogy using a reference from THIS field's culture, history, or jargon — should make someone in this exact role laugh or wince in recognition>",
  "action_plan": [<3 concrete actions with specific tool names or steps — not 'learn AI tools' but 'Complete the Coursera prompt engineering cert and use it in [specific workflow]'>],
  "ai_collaboration_tips": [<3 specific ways to use AI that make THIS role more valuable — e.g. 'Use Perplexity to pre-research clients before sales calls' for a sales role>],
  "salary_impact": "<1 honest sentence on salary trajectory for this specific role over 5 years given AI — can be negative>"
}`,
      },
      {
        role: 'user',
        content: `Job Title: ${jobTitle}
Industry: ${industry}${skills ? `\nSkills: ${skills}` : ''}${yearsExperience ? `\nExperience: ${yearsExperience}` : ''}

Be specific to this exact role. Generic answers are unacceptable.`,
      },
    ], { temperature: 0.5, maxTokens: 1800 });

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
