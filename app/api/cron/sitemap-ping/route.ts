import { NextRequest, NextResponse } from 'next/server';
import { pingSitemaps } from '@/lib/indexnow';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await pingSitemaps();
    console.log('[SitemapPing] Results:', JSON.stringify(results));
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error('[SitemapPing] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
