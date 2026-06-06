import { NextRequest, NextResponse } from 'next/server';
import { runBrandAgent } from '@/agents/brand-seo-agent';

export const maxDuration = 300;

/**
 * Cron: /api/cron/generate-brand-content
 * Schedule: 0 7 * * *  (daily at 7am UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Generates 2 brand-building SEO blog posts per day:
 * "Formly Tools vs X", "What Is Formly Tools", tool comparisons, audience guides, etc.
 */
export async function POST(req: NextRequest) {
  console.log('[Cron] Brand content generation started');

  try {
    const result = await runBrandAgent(2);
    console.log(`[Cron] Brand agent generated ${result.generated} posts:`, result.posts);

    return NextResponse.json({
      success: true,
      generated: result.generated,
      posts: result.posts,
    });
  } catch (err) {
    console.error('[Cron] Brand content generation failed:', err);
    return NextResponse.json({ error: 'Brand content generation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
