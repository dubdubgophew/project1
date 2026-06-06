import { NextRequest, NextResponse } from 'next/server';
import { POST as fetchStocksNews }       from '@/app/api/cron/fetch-stocks-news/route';
import { POST as fetchAiNews }           from '@/app/api/cron/fetch-ai-news/route';
import { POST as fetchTrending }         from '@/app/api/cron/fetch-trending/route';
import { POST as fetchPoliticsNews }     from '@/app/api/cron/fetch-politics-news/route';
import { POST as fetchRegionalNews }     from '@/app/api/cron/fetch-regional-news/route';
import { POST as generateContent }       from '@/app/api/cron/generate-content/route';
import { POST as generateBrandContent }  from '@/app/api/cron/generate-brand-content/route';

export const maxDuration = 300;

// GET /api/admin/run-cron?secret=ADMIN_SECRET&job=generate-brand-content
// Browser-accessible trigger for any cron job. Calls handlers directly (no HTTP hop).

const HANDLERS: Record<string, (req: NextRequest) => Promise<NextResponse>> = {
  'fetch-stocks-news':       fetchStocksNews,
  'fetch-ai-news':           fetchAiNews,
  'fetch-trending':          fetchTrending,
  'fetch-politics-news':     fetchPoliticsNews,
  'fetch-regional-news':     fetchRegionalNews,
  'generate-content':        generateContent,
  'generate-brand-content':  generateBrandContent,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const job    = searchParams.get('job');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const handler = job ? HANDLERS[job] : null;
  if (!handler) {
    return NextResponse.json(
      { error: 'Invalid job. Allowed: ' + Object.keys(HANDLERS).join(', ') },
      { status: 400 }
    );
  }

  const start = Date.now();
  try {
    const res  = await handler(req);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ job, status: res.status, duration_ms: Date.now() - start, ...data });
  } catch (err) {
    return NextResponse.json({ job, error: String(err), duration_ms: Date.now() - start }, { status: 500 });
  }
}
