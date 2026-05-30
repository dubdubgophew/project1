import { NextRequest, NextResponse } from 'next/server';
import { runTrafficSEOAgent } from '@/agents/traffic-seo-agent';
import { getDashboardData } from '@/lib/seo-agent/tracker';
import { isGSCConfigured, listGSCSites } from '@/lib/seo-agent/gsc';

export const maxDuration = 300;

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('Authorization') ?? req.nextUrl.searchParams.get('secret');
  return auth === secret || auth === `Bearer ${secret}`;
}

// GET /api/admin/seo-agent?secret=X           — dashboard data
// GET /api/admin/seo-agent?secret=X&run=1     — trigger agent run
// GET /api/admin/seo-agent?secret=X&sites=1   — list GSC properties (debug)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;

  if (params.get('run') === '1' || params.get('run') === 'true') {
    try {
      const result = await runTrafficSEOAgent('manual');
      return NextResponse.json({ success: true, ...result });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  if (params.get('sites') === '1') {
    try {
      const sites = await listGSCSites();
      return NextResponse.json({ sites, currentGscSiteUrl: process.env.GSC_SITE_URL });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  try {
    const data = await getDashboardData();
    return NextResponse.json({
      gscConfigured: isGSCConfigured(),
      gscSiteUrl: process.env.GSC_SITE_URL ?? null,
      ...data,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/admin/seo-agent — manual trigger
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runTrafficSEOAgent('manual');
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
