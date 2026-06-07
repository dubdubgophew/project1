import { NextRequest, NextResponse } from 'next/server';
import { runEditorialAgent } from '@/agents/editorial-agent';

export const maxDuration = 300;

/**
 * Cron: /api/cron/publish-articles
 * Schedule: 0 5 * * *  (daily at 5am UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Publishes 4 high-quality editorial articles daily:
 * - Human-style writing (prolific journalist voice)
 * - Trending high-engagement topics across 6 rotating categories
 * - GEO optimized for US, UK, India, AU, CA audiences
 * - 950-1200 words per article
 */
export async function POST(req: NextRequest) {
  console.log('[Cron] Editorial article publishing started');

  try {
    const result = await runEditorialAgent(4);
    console.log(`[Cron] Published ${result.generated} editorial articles:`, result.posts);

    return NextResponse.json({
      success: true,
      generated: result.generated,
      posts: result.posts,
    });
  } catch (err) {
    console.error('[Cron] Editorial publishing failed:', err);
    return NextResponse.json({ error: 'Editorial publishing failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
