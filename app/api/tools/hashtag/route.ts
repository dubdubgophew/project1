import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  topic: z.string().min(5).max(1000),
  platform: z.string().max(30).default('Instagram'),
  count: z.number().min(5).max(30).default(20),
});

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'hashtag');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { topic, platform, count } = schema.parse(body);

    const popular = Math.floor(count * 0.3);
    const niche = Math.floor(count * 0.4);
    const targeted = count - popular - niche;

    const result = await callAI([
      {
        role: 'system',
        content: `You are a social media expert specializing in hashtag strategy for ${platform}.

Generate exactly ${count} hashtags for the topic. Return ONLY valid JSON:
{
  "popular": ["#hashtag1", "#hashtag2"],
  "niche": ["#hashtag1", "#hashtag2"],
  "branded": ["#hashtag1", "#hashtag2"],
  "all": ["#all1", "#all2", "#all3"]
}

- "popular": ${popular} high-volume hashtags (1M+ posts) — wide reach
- "niche": ${niche} medium-volume hashtags (10K-500K posts) — targeted reach
- "branded": ${targeted} low-volume, highly specific hashtags — engaged audience
- "all": all ${count} hashtags combined in optimal posting order (mix popular, niche, branded)

Make hashtags relevant, trending, and platform-appropriate for ${platform}.
No spaces in hashtags. Use camelCase for multi-word tags.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}\nPlatform: ${platform}`,
      },
    ], { temperature: 0.6, maxTokens: 1000 });

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response');

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      popular: parsed.popular ?? [],
      niche: parsed.niche ?? [],
      branded: parsed.branded ?? [],
      all: parsed.all ?? [...(parsed.popular ?? []), ...(parsed.niche ?? []), ...(parsed.branded ?? [])],
      remaining: limit.remaining,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Hashtag error:', err);
    return NextResponse.json({ error: 'Failed to generate hashtags. Please try again.' }, { status: 500 });
  }
}
