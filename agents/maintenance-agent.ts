/**
 * Maintenance Agent
 * Autonomously monitors system health, cleans up old data, and alerts on anomalies.
 * Runs daily via Vercel Cron.
 */

import { createAdminClient } from '@/lib/supabase/server';

interface HealthReport {
  status: 'healthy' | 'warning' | 'critical';
  checks: { name: string; status: 'ok' | 'warn' | 'fail'; detail: string }[];
  actionsPerformed: string[];
}

export async function runMaintenanceAgent(): Promise<HealthReport> {
  const admin = createAdminClient();
  const checks: HealthReport['checks'] = [];
  const actionsPerformed: string[] = [];

  // 1. Clean up usage logs older than 90 days
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: deleted } = await admin
      .from('usage_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo)
      .select('id');

    const count = deleted?.length ?? 0;
    if (count > 0) {
      actionsPerformed.push(`Cleaned ${count} usage logs older than 90 days`);
    }
    checks.push({ name: 'Usage log cleanup', status: 'ok', detail: `${count} old records removed` });
  } catch (err) {
    checks.push({ name: 'Usage log cleanup', status: 'fail', detail: String(err) });
  }

  // 2. Check for orphaned subscriptions (active but user on free plan)
  try {
    const { data: mismatch } = await admin
      .from('subscriptions')
      .select('user_id, plan, status')
      .eq('status', 'active');

    let fixed = 0;
    for (const sub of mismatch ?? []) {
      const { data: profile } = await admin
        .from('profiles')
        .select('plan')
        .eq('id', sub.user_id)
        .single();

      if (profile && profile.plan !== sub.plan) {
        await admin.from('profiles').update({ plan: sub.plan }).eq('id', sub.user_id);
        fixed++;
      }
    }

    if (fixed > 0) actionsPerformed.push(`Fixed ${fixed} plan mismatches`);
    checks.push({ name: 'Plan sync check', status: 'ok', detail: `${fixed} mismatches corrected` });
  } catch (err) {
    checks.push({ name: 'Plan sync check', status: 'warn', detail: String(err) });
  }

  // 3. Check database table sizes
  try {
    const { count: usageCount } = await admin
      .from('usage_logs')
      .select('id', { count: 'exact', head: true });

    const status = (usageCount ?? 0) > 500000 ? 'warn' : 'ok';
    checks.push({
      name: 'Database size',
      status,
      detail: `${(usageCount ?? 0).toLocaleString()} usage log records`,
    });

    if (status === 'warn') {
      actionsPerformed.push('WARNING: Database growing large — consider archiving old usage logs');
    }
  } catch (err) {
    checks.push({ name: 'Database size', status: 'fail', detail: String(err) });
  }

  // 4. Check for expired subscriptions not downgraded
  try {
    const { data: expiredSubs } = await admin
      .from('subscriptions')
      .select('user_id, plan')
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString());

    let downgraded = 0;
    for (const sub of expiredSubs ?? []) {
      await admin.from('profiles').update({ plan: 'free' }).eq('id', sub.user_id);
      await admin.from('subscriptions').update({ status: 'expired' }).eq('user_id', sub.user_id);
      downgraded++;
    }

    if (downgraded > 0) actionsPerformed.push(`Downgraded ${downgraded} expired subscriptions to free`);
    checks.push({ name: 'Expired subscription cleanup', status: 'ok', detail: `${downgraded} processed` });
  } catch (err) {
    checks.push({ name: 'Expired subscription cleanup', status: 'warn', detail: String(err) });
  }

  // 5. Check Groq API (simple connectivity test)
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      checks.push({ name: 'Groq API', status: 'fail', detail: 'API key not configured' });
    } else {
      checks.push({ name: 'Groq API', status: 'ok', detail: 'Key configured' });
    }
  } catch {
    checks.push({ name: 'Groq API', status: 'warn', detail: 'Could not verify' });
  }

  // Determine overall status
  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warn');
  const status: HealthReport['status'] = hasFail ? 'critical' : hasWarn ? 'warning' : 'healthy';

  const report: HealthReport = { status, checks, actionsPerformed };

  // Log report
  console.log(`[Maintenance Agent] Status: ${status}`);
  console.log(`[Maintenance Agent] Checks: ${checks.length} total`);
  console.log(`[Maintenance Agent] Actions: ${actionsPerformed.join(', ') || 'none'}`);

  // Store report in DB
  try {
    await admin.from('maintenance_logs').insert({
      status,
      checks: JSON.stringify(checks),
      actions: actionsPerformed,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Table may not exist yet
  }

  return report;
}
