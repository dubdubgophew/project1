import { NextRequest, NextResponse } from 'next/server';
import { submitToIndexNow, allToolUrls } from '@/lib/indexnow';
import { submitUrlsToBing } from '@/lib/bing-webmaster';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const urls = allToolUrls();

    // Submit via IndexNow (notifies Bing, Yandex, DuckDuckGo-via-Bing, Yahoo-via-Bing)
    const indexNowResults = await submitToIndexNow(urls);
    console.log('[IndexNow] Results:', JSON.stringify(indexNowResults));

    // Also submit directly via Bing Webmaster API if key is configured
    const bingResult = await submitUrlsToBing(urls);
    if (bingResult.error) {
      console.log('[BingWebmaster] Skipped or errored:', bingResult.error);
    } else {
      console.log('[BingWebmaster] Submitted:', bingResult.submitted, 'URLs');
    }

    return NextResponse.json({
      ok: true,
      urls: urls.length,
      indexNow: indexNowResults,
      bingWebmaster: bingResult,
    });
  } catch (err) {
    console.error('[IndexNow] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
