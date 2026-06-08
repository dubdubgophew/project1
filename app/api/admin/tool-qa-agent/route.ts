import { NextRequest, NextResponse } from 'next/server';
import { runToolQAAgent } from '@/agents/tool-qa-agent';
import { getRecentRuns, getRecentBugs, getRecentFeatureGaps } from '@/lib/tool-qa/tracker';
import { TOOL_REGISTRY } from '@/lib/tool-qa/registry';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [runs, bugs, gaps] = await Promise.all([
    getRecentRuns(10),
    getRecentBugs(20),
    getRecentFeatureGaps(20),
  ]);

  return NextResponse.json({
    toolCount: TOOL_REGISTRY.length,
    tools: TOOL_REGISTRY.map(t => ({ slug: t.slug, name: t.name, category: t.category, testCount: t.testCases.length })),
    recentRuns: runs,
    recentBugs: bugs,
    recentFeatureGaps: gaps,
  });
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runToolQAAgent('manual');
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[Admin] tool-qa-agent error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
