import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, DollarSign, Zap, TrendingUp, FileText, RefreshCw } from 'lucide-react';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/');

  const admin = createAdminClient();

  // Fetch stats in parallel
  const [
    { count: totalUsers },
    { count: proUsers },
    { count: unlimitedUsers },
    { count: totalUsage30d },
    { data: recentPosts },
    { data: topTools },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('plan', 'pro'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('plan', 'unlimited'),
    admin.from('usage_logs').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    admin.from('blog_posts').select('id, title, slug, published, created_at').order('created_at', { ascending: false }).limit(5),
    admin.from('usage_logs').select('tool_name').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Count tool usage
  const toolCounts = (topTools ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.tool_name] = (acc[row.tool_name] ?? 0) + 1;
    return acc;
  }, {});
  const sortedTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Estimated MRR
  const proMRR = (proUsers ?? 0) * 9;
  const unlimMRR = (unlimitedUsers ?? 0) * 19;
  const totalMRR = proMRR + unlimMRR;
  const mrrINR = totalMRR * 83;

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">CEO Overview · Formly</p>
          </div>
          <div className="flex gap-3">
            <form action="/api/admin/generate-blog" method="POST">
              <button type="submit" className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generate Blog Post
              </button>
            </form>
            <Link href="/" className="btn-secondary py-2 px-4 text-sm">← Back to Site</Link>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: (totalUsers ?? 0).toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Pro Subscribers', value: (proUsers ?? 0).toString(), icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { label: 'Unlimited Users', value: (unlimitedUsers ?? 0).toString(), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Est. MRR', value: `$${totalMRR.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue detail */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Revenue Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pro (${proUsers} × $9)</span>
                <span className="text-white font-medium">${proMRR}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Unlimited ({unlimitedUsers} × $19)</span>
                <span className="text-white font-medium">${unlimMRR}/mo</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between">
                <span className="text-gray-300 font-medium">Total MRR</span>
                <span className="text-emerald-400 font-bold">${totalMRR}/mo ≈ ₹{mrrINR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Target: ₹10,00,000/mo</span>
                <span>{Math.round((mrrINR / 1000000) * 100)}% of target</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" style={{ width: `${Math.min(Math.round((mrrINR / 1000000) * 100), 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-white mb-4">Top Tools (Last 7 Days)</h2>
            <div className="space-y-3">
              {sortedTools.length === 0 ? (
                <p className="text-sm text-gray-500">No usage data yet.</p>
              ) : (
                sortedTools.map(([tool, count]) => (
                  <div key={tool} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 capitalize">{tool.replace(/-/g, ' ')}</span>
                        <span className="text-gray-500">{count} uses</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${Math.round((count / (sortedTools[0]?.[1] ?? 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Usage (Last 30 Days)</h2>
            <span className="text-2xl font-bold text-white">{(totalUsage30d ?? 0).toLocaleString()} requests</span>
          </div>
          <p className="text-sm text-gray-500">
            At $0.001 per Groq API request estimated cost: <span className="text-gray-300">${((totalUsage30d ?? 0) * 0.001).toFixed(2)}</span>
            {' '}(likely much less due to free tier).
          </p>
        </div>

        {/* Blog posts */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Recent Blog Posts</h2>
            <form action="/api/admin/generate-blog" method="POST">
              <button type="submit" className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300">
                <RefreshCw className="w-3.5 h-3.5" /> Auto-generate
              </button>
            </form>
          </div>
          <div className="space-y-2">
            {(recentPosts ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">No blog posts yet. Click "Generate Blog Post" to create one.</p>
            ) : (
              (recentPosts ?? []).map((post) => (
                <div key={post.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link href={`/blog/${post.slug}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-600">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge text-xs ${post.published ? 'badge-free' : 'bg-gray-800 text-gray-500'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Autonomous Agent Controls</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <form action="/api/cron/generate-content" method="POST">
              <button className="w-full btn-secondary text-sm py-2.5">
                Run SEO Content Agent
              </button>
            </form>
            <form action="/api/cron/reset-usage" method="POST">
              <button className="w-full btn-secondary text-sm py-2.5">
                Reset Daily Usage
              </button>
            </form>
            <form action="/api/admin/send-report" method="POST">
              <button className="w-full btn-secondary text-sm py-2.5">
                Send Weekly Report
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
