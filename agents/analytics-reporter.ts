/**
 * Analytics Reporter Agent
 * Generates weekly performance reports and sends them to the CEO via email.
 * Runs every Monday morning via Vercel Cron.
 */

import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

interface WeeklyReport {
  weekOf: string;
  totalUsers: number;
  newUsers: number;
  proUsers: number;
  unlimitedUsers: number;
  estimatedMRR: number;
  estimatedMRRINR: number;
  totalUsageWeek: number;
  topTools: { tool: string; count: number }[];
  topPagesHint: string;
  growthNotes: string;
}

export async function generateWeeklyReport(): Promise<WeeklyReport> {
  const admin = createAdminClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Parallel queries
  const [
    { count: totalUsers },
    { count: newUsersThisWeek },
    { count: proUsers },
    { count: unlimitedUsers },
    { count: usageThisWeek },
    { count: usageLastWeek },
    { data: toolData },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('plan', 'pro'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('plan', 'unlimited'),
    admin.from('usage_logs').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    admin.from('usage_logs').select('id', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo.toISOString()).lt('created_at', weekAgo.toISOString()),
    admin.from('usage_logs').select('tool_name').gte('created_at', weekAgo.toISOString()),
  ]);

  // Count by tool
  const toolCounts = (toolData ?? []).reduce<Record<string, number>>((acc, row: { tool_name: string }) => {
    acc[row.tool_name] = (acc[row.tool_name] ?? 0) + 1;
    return acc;
  }, {});
  const topTools: { tool: string; count: number }[] = Object.entries(toolCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([tool, count]) => ({ tool, count: count as number }));

  const pro = proUsers ?? 0;
  const unlim = unlimitedUsers ?? 0;
  const mrrUSD = pro * 9 + unlim * 19;
  const mrrINR = mrrUSD * 83;

  const thisWeekUsage = usageThisWeek ?? 0;
  const lastWeekUsage = usageLastWeek ?? 0;
  const usageGrowth = lastWeekUsage > 0
    ? Math.round(((thisWeekUsage - lastWeekUsage) / lastWeekUsage) * 100)
    : 0;

  const growthNotes = [
    usageGrowth > 0 ? `✅ Usage grew ${usageGrowth}% vs last week` : `⚠️ Usage dropped ${Math.abs(usageGrowth)}% vs last week`,
    mrrUSD >= 5000 ? `✅ MRR above $5K — growing strongly` : `📈 MRR at $${mrrUSD} — ${Math.round((mrrUSD / 12000) * 100)}% of target`,
    (newUsersThisWeek ?? 0) > 100 ? `✅ ${newUsersThisWeek} new users this week` : `📊 ${newUsersThisWeek} new users this week`,
  ].join('\n');

  return {
    weekOf: weekAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    totalUsers: totalUsers ?? 0,
    newUsers: newUsersThisWeek ?? 0,
    proUsers: pro,
    unlimitedUsers: unlim,
    estimatedMRR: mrrUSD,
    estimatedMRRINR: mrrINR,
    totalUsageWeek: thisWeekUsage,
    topTools,
    topPagesHint: 'PDF Summarizer, Paraphraser, Grammar Checker (check GA for exact data)',
    growthNotes,
  };
}

export async function sendWeeklyReport(): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const report = await generateWeeklyReport();
  const adminEmail = process.env.ADMIN_EMAIL!;

  const targetINR = 1_000_000; // ₹10 Lac
  const progressPct = Math.round((report.estimatedMRRINR / targetINR) * 100);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; background: #030712; color: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
  .header { background: linear-gradient(135deg, #7c3aed, #6d28d9); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 24px; color: white; }
  .header p { margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .stat { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
  .stat .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .stat .value { font-size: 28px; font-weight: 700; color: white; }
  .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .progress-bar { height: 8px; background: #1f2937; border-radius: 4px; overflow: hidden; margin-top: 8px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #10b981); border-radius: 4px; }
  .tool-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1f2937; font-size: 14px; }
  .footer { text-align: center; color: #374151; font-size: 12px; margin-top: 32px; }
  pre { background: #0a0a0a; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 13px; color: #d1d5db; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>📊 Formly Weekly Report</h1>
    <p>Week of ${report.weekOf} · CEO Briefing</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="label">Estimated MRR</div>
      <div class="value">$${report.estimatedMRR.toLocaleString()}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">≈ ₹${report.estimatedMRRINR.toLocaleString()}/mo</div>
    </div>
    <div class="stat">
      <div class="label">Target Progress</div>
      <div class="value">${progressPct}%</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(progressPct,100)}%"></div></div>
    </div>
    <div class="stat">
      <div class="label">Total Users</div>
      <div class="value">${report.totalUsers.toLocaleString()}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">+${report.newUsers} this week</div>
    </div>
    <div class="stat">
      <div class="label">Paying Users</div>
      <div class="value">${report.proUsers + report.unlimitedUsers}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">${report.proUsers} Pro · ${report.unlimitedUsers} Unlimited</div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin:0 0 12px;color:white">🔥 Top Tools This Week</h3>
    ${report.topTools.map((t, i) => `
      <div class="tool-row">
        <span style="color:#d1d5db">${i + 1}. ${t.tool.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        <span style="color:#8b5cf6;font-weight:600">${t.count} uses</span>
      </div>
    `).join('')}
    <div class="tool-row" style="border:none;padding-top:12px">
      <span style="color:#6b7280">Total requests this week</span>
      <span style="color:white;font-weight:700">${report.totalUsageWeek.toLocaleString()}</span>
    </div>
  </div>

  <div class="card">
    <h3 style="margin:0 0 12px;color:white">📈 Growth Summary</h3>
    <pre>${report.growthNotes}</pre>
  </div>

  <div class="card">
    <h3 style="margin:0 0 8px;color:white">⚡ Quick Actions for This Week</h3>
    <ul style="color:#9ca3af;font-size:14px;padding-left:20px;line-height:1.8">
      ${report.estimatedMRR < 12000 ? '<li>Share Formly in 2 online communities (Reddit, Twitter, ProductHunt)</li>' : ''}
      <li>Check Google Search Console for new keyword opportunities</li>
      <li>Reply to any user support emails (check support@formly.tools)</li>
      ${report.newUsers < 50 ? '<li>Consider running a limited-time 30% discount promo</li>' : ''}
      <li>Autonomous agents have already generated this week\'s blog content ✅</li>
    </ul>
  </div>

  <div class="footer">
    <p>Formly · Built in India 🇮🇳 · Autonomous AI-managed platform</p>
    <p>This report was auto-generated. No action needed unless flagged above.</p>
    <p><a href="https://formly.tools/admin" style="color:#7c3aed">View Admin Dashboard →</a></p>
  </div>
</div>
</body>
</html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmail,
    subject: `Formly Weekly: $${report.estimatedMRR} MRR · ${report.totalUsers} Users · ${progressPct}% to target`,
    html,
  });

  console.log(`[Analytics Agent] Weekly report sent to ${adminEmail}`);
}
