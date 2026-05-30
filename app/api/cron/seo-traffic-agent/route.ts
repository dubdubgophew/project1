import { NextRequest, NextResponse } from 'next/server';
import { runTrafficSEOAgent } from '@/agents/traffic-seo-agent';

export const maxDuration = 300;

/**
 * Cron: /api/cron/seo-traffic-agent
 * Schedule: 0 3 * * *  (daily at 3am UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Fetches GSC data, scores SEO opportunities, auto-applies meta/content
 * improvements to blog posts, queues new posts for keyword gaps.
 */
export async function POST(_req: NextRequest) {
  console.log('[Cron] SEO Traffic Agent started');

  try {
    const result = await runTrafficSEOAgent('cron');

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[Cron] SEO Traffic Agent failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
