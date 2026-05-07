import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklyReport } from '@/agents/analytics-reporter';

/**
 * Cron: /api/cron/weekly-report
 * Schedule: 0 8 * * 1  (every Monday at 8am UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Sends a comprehensive weekly report to the CEO email.
 */
export async function POST(req: NextRequest) {
  console.log('[Cron] Weekly report started');

  try {
    await sendWeeklyReport();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Cron] Weekly report failed:', err);
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
