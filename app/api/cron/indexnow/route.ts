import { NextRequest, NextResponse } from 'next/server';
import { submitToIndexNow, allToolUrls } from '@/lib/indexnow';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const urls = allToolUrls();
    await submitToIndexNow(urls);
    console.log(`[IndexNow] Submitted ${urls.length} URLs`);
    return NextResponse.json({ ok: true, submitted: urls.length });
  } catch (err) {
    console.error('[IndexNow] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
