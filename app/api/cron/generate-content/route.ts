import { NextRequest, NextResponse } from 'next/server';
import { runSEOAgent } from '@/agents/seo-content-agent';

export const maxDuration = 300;

/**
 * Cron: /api/cron/generate-content
 * Schedule: 0 6 * * *  (daily at 6am UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Generates 3 SEO-optimized blog posts per day targeting AI Overviews + PAA.
 */
export async function POST(req: NextRequest) {
  console.log('[Cron] SEO content generation started');

  try {
    const result = await runSEOAgent(3);
    console.log(`[Cron] Generated ${result.generated} posts:`, result.posts);

    return NextResponse.json({
      success: true,
      generated: result.generated,
      posts: result.posts,
    });
  } catch (err) {
    console.error('[Cron] Content generation failed:', err);
    return NextResponse.json({ error: 'Content generation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}