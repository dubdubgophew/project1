import { NextRequest, NextResponse } from 'next/server';
import { runSEOAgent } from '@/agents/seo-content-agent';

export const maxDuration = 300; // 5 min max for content generation

/**
 * Cron: /api/cron/generate-content
 * Schedule: 0 6 * * 2,5  (Tuesdays and Fridays at 6am UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Generates 2 SEO-optimized blog posts automatically.
 * No human input needed.
 */
export async function POST(req: NextRequest) {
  console.log('[Cron] SEO content generation started');

  try {
    const result = await runSEOAgent(2);
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

// Also allow GET for manual trigger from admin
export async function GET(req: NextRequest) {
  return POST(req);
}
