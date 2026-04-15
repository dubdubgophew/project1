import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Cron: /api/cron/reset-usage
 * Schedule: 0 0 * * *  (daily at midnight UTC)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Usage is tracked by timestamp, so "reset" just means old logs
 * become irrelevant. This cron also runs the maintenance agent.
 */
export async function POST(req: NextRequest) {
  console.log('[Cron] Daily reset + maintenance started');

  try {
    // Run maintenance agent
    const { runMaintenanceAgent } = await import('@/agents/maintenance-agent');
    const healthReport = await runMaintenanceAgent();

    // Log summary to admin DB
    const admin = createAdminClient();
    await admin.from('cron_logs').insert({
      job: 'daily-maintenance',
      status: healthReport.status,
      details: JSON.stringify({
        checks: healthReport.checks.length,
        actions: healthReport.actionsPerformed,
      }),
    }).select();

    return NextResponse.json({
      success: true,
      health: healthReport.status,
      actions: healthReport.actionsPerformed,
    });
  } catch (err) {
    console.error('[Cron] Reset/maintenance failed:', err);
    return NextResponse.json({ error: 'Maintenance failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
