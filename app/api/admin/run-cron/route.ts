import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

// GET /api/admin/run-cron?secret=ADMIN_SECRET&job=fetch-stocks-news
// Browser-accessible trigger for any cron job.

const ALLOWED_JOBS = [
  'fetch-stocks-news',
  'fetch-ai-news',
  'fetch-trending',
  'fetch-politics-news',
  'fetch-regional-news',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const job    = searchParams.get('job');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!job || !ALLOWED_JOBS.includes(job)) {
    return NextResponse.json(
      { error: 'Invalid job. Allowed: ' + ALLOWED_JOBS.join(', ') },
      { status: 400 }
    );
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools';
  const res = await fetch(`${baseUrl}/api/cron/${job}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ job, status: res.status, ...data });
}
