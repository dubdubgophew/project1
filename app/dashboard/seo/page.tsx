import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDashboardData } from '@/lib/seo-agent/tracker';
import { isGSCConfigured } from '@/lib/seo-agent/gsc';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// ─── Auth ────────────────────────────────────────────────────────────────────

function checkAuth(secret: string | undefined | null): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  return !!(adminSecret && secret === adminSecret);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delta(v: number) {
  if (v === 0) return <span className="text-gray-500">–</span>;
  const color = v > 0 ? 'text-emerald-400' : 'text-red-400';
  return <span className={color}>{v > 0 ? '+' : ''}{v.toFixed(1)}%</span>;
}

function pBadge(priority: number) {
  if (priority === 1) return <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 font-bold">P1</span>;
  if (priority === 2) return <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400 font-bold">P2</span>;
  return <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-400 font-bold">P3</span>;
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    fix_meta: 'bg-violet-500/20 text-violet-300',
    title_tweak: 'bg-blue-500/20 text-blue-300',
    content_refresh: 'bg-amber-500/20 text-amber-300',
    add_faq: 'bg-emerald-500/20 text-emerald-300',
    new_post: 'bg-pink-500/20 text-pink-300',
    geo_markup: 'bg-cyan-500/20 text-cyan-300',
  };
  const cls = map[type] ?? 'bg-gray-700 text-gray-300';
  return <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${cls}`}>{type.replace('_', ' ')}</span>;
}

function shortPage(page: string) {
  return page.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function SEODashboard({ searchParams }: { searchParams: any }) {
  const secret = searchParams?.secret as string | undefined;
  if (!checkAuth(secret)) {
    redirect('/');
  }

  const gscConfigured = isGSCConfigured();
  const { runs, opportunities, improvements, topPages, topKeywords } = await getDashboardData();

  const latestRun = runs[0];
  const totalClicksToday = latestRun?.total_clicks_7d ?? 0;
  const clicksDelta = latestRun?.clicks_delta_pct ?? 0;
  const totalImpressionsToday = latestRun?.total_impressions_7d ?? 0;
  const impressionsDelta = latestRun?.impressions_delta_pct ?? 0;
  const avgPos = latestRun?.avg_position ?? 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">SEO Traffic Agent</h1>
            <p className="text-gray-500 text-sm mt-1">Autonomous daily optimization · formly.tools</p>
          </div>
          <div className="flex items-center gap-3">
            {gscConfigured
              ? <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> GSC Connected
                </span>
              : <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Content-only mode
                </span>
            }
            <span className="text-xs text-gray-600">Last run: {latestRun?.run_date ?? '—'}</span>
          </div>
        </div>

        {/* GSC Setup Guide */}
        {!gscConfigured && (
          <div className="mb-8 p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <h2 className="text-amber-400 font-semibold mb-3">Connect Google Search Console for full traffic analysis</h2>
            <ol className="text-sm text-gray-400 space-y-1.5 list-decimal list-inside">
              <li>Go to <span className="text-amber-300">console.cloud.google.com</span> → Create project → Enable "Google Search Console API"</li>
              <li>IAM & Admin → Service Accounts → Create → Download JSON key</li>
              <li>In Search Console → Settings → Users → Add the service account email (Restricted)</li>
              <li>Set env vars: <code className="text-amber-300 bg-gray-900 px-1 rounded">GSC_SERVICE_ACCOUNT_JSON</code> (stringified JSON) and <code className="text-amber-300 bg-gray-900 px-1 rounded">GSC_SITE_URL=https://formly.tools</code></li>
              <li>Redeploy — the agent will automatically start tracking on next cron run</li>
            </ol>
          </div>
        )}

        {/* Traffic KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Clicks (14d)', value: totalClicksToday.toLocaleString(), sub: delta(clicksDelta) },
            { label: 'Impressions (14d)', value: totalImpressionsToday.toLocaleString(), sub: delta(impressionsDelta) },
            { label: 'Avg Position', value: avgPos ? avgPos.toFixed(1) : '—', sub: <span className="text-gray-500">lower = better</span> },
            { label: 'Open Opportunities', value: opportunities.length.toString(), sub: <span className="text-gray-500">{opportunities.filter(o => o.priority === 1).length} critical</span> },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Top Opportunities */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-semibold text-white">Open Opportunities</h2>
                <span className="text-xs text-gray-500">{opportunities.length} total</span>
              </div>
              <div className="divide-y divide-gray-800/60">
                {opportunities.length === 0 && (
                  <div className="p-5 text-center text-gray-600 text-sm">No open opportunities — run the agent to generate</div>
                )}
                {opportunities.slice(0, 12).map((opp: Record<string, unknown>) => (
                  <div key={opp.id as string} className="px-5 py-3 flex items-start gap-3">
                    <div className="flex gap-1.5 mt-0.5 shrink-0">
                      {pBadge(opp.priority as number)}
                      {typeBadge(opp.type as string)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-300 truncate font-mono">{shortPage(opp.page as string)}</div>
                      <div className="text-[11px] text-gray-600 mt-0.5">
                        Score {(opp.score as number).toFixed(0)}
                        {(opp.data as Record<string, number>).impressions ? ` · ${(opp.data as Record<string, number>).impressions.toLocaleString()} impr` : ''}
                        {(opp.data as Record<string, number>).position ? ` · pos ${(opp.data as Record<string, number>).position.toFixed(1)}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Improvements Applied */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Applied Improvements</h2>
              </div>
              <div className="divide-y divide-gray-800/60">
                {improvements.length === 0 && (
                  <div className="p-5 text-center text-gray-600 text-sm">No improvements applied yet</div>
                )}
                {improvements.map((imp: Record<string, unknown>) => (
                  <div key={imp.id as string} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      {typeBadge(imp.improvement_type as string)}
                      <span className="text-[10px] text-gray-600">{imp.field as string}</span>
                      <span className="text-[10px] text-gray-700 ml-auto">
                        {imp.applied_at ? new Date(imp.applied_at as string).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono truncate">{shortPage(imp.page as string)}</div>
                    {!!imp.new_value && (
                      <div className="mt-1.5 text-[11px] text-gray-500 bg-gray-800/60 rounded p-2 line-clamp-2">
                        {(imp.new_value as string).replace(/<[^>]+>/g, '').slice(0, 150)}…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Agent Run History */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Agent Runs</h2>
              </div>
              <div className="divide-y divide-gray-800/60 max-h-72 overflow-y-auto">
                {runs.length === 0 && (
                  <div className="p-5 text-center text-gray-600 text-sm">No runs yet</div>
                )}
                {runs.map((run: Record<string, unknown>) => (
                  <div key={run.id as string} className="px-4 py-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-300">{run.run_date as string}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${run.gsc_connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                        {run.gsc_connected ? 'GSC' : 'content'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 space-y-0.5">
                      <div>{run.pages_analyzed as number} pages · {run.opportunities_found as number} opps · {run.improvements_applied as number} applied</div>
                      {(run.clicks_delta_pct as number) !== 0 && (
                        <div>Clicks {delta(run.clicks_delta_pct as number)} · Impr {delta(run.impressions_delta_pct as number)}</div>
                      )}
                      {run.new_posts_queued ? <div>{run.new_posts_queued as number} new posts</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Top Pages</h2>
              </div>
              <div className="divide-y divide-gray-800/60 max-h-72 overflow-y-auto">
                {topPages.length === 0 && (
                  <div className="p-5 text-center text-gray-600 text-sm">No data yet</div>
                )}
                {topPages.slice(0, 15).map((p: Record<string, unknown>, i: number) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 w-4">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-gray-300 font-mono truncate">{shortPage(p.page as string)}</div>
                      <div className="text-[10px] text-gray-600">{(p.clicks as number).toLocaleString()} clicks · pos {(p.position as number).toFixed(1)}</div>
                    </div>
                    <div className="text-[10px] text-violet-400 shrink-0">{((p.ctr as number) * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Keywords */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Top Keywords</h2>
              </div>
              <div className="divide-y divide-gray-800/60 max-h-64 overflow-y-auto">
                {topKeywords.length === 0 && (
                  <div className="p-5 text-center text-gray-600 text-sm">No data yet</div>
                )}
                {topKeywords.map((k: Record<string, unknown>, i: number) => (
                  <div key={i} className="px-4 py-2">
                    <div className="text-[11px] text-gray-300 truncate">{k.query as string}</div>
                    <div className="text-[10px] text-gray-600">{(k.impressions as number).toLocaleString()} impr · pos {(k.position as number).toFixed(1)} · {(k.clicks as number)} clicks</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Manual trigger instructions */}
        <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Manual trigger</h3>
          <code className="text-xs text-violet-300 bg-gray-950 px-3 py-2 rounded block">
            curl -X POST https://formly.tools/api/admin/seo-agent -H &quot;Authorization: YOUR_ADMIN_SECRET&quot;
          </code>
          <p className="text-xs text-gray-600 mt-2">Agent runs automatically daily at 3am UTC. Cron: <code className="text-gray-500">0 3 * * *</code></p>
        </div>

      </div>
    </div>
  );
}
