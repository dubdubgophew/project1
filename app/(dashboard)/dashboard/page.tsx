import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Zap, ArrowUpRight, Crown, BarChart2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

const TOOLS = [
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'Code Explainer', href: '/tools/code-explainer', icon: '💻' },
  { name: 'Pay Stub Generator', href: '/tools/paystub-generator', icon: '🧾' },
  { name: 'Resume Builder', href: '/tools/resume-builder', icon: '📋' },
  { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
  { name: 'Hashtag Generator', href: '/tools/hashtag-generator', icon: '#️⃣' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
  { name: 'Cover Letter', href: '/tools/cover-letter', icon: '📝' },
  { name: 'Code Reviewer', href: '/tools/code-reviewer', icon: '🔎' },
  { name: 'Terms Simplifier', href: '/tools/terms-simplifier', icon: '⚖️' },
  { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
  { name: 'Base64 Encoder', href: '/tools/base64', icon: '🔐' },
  { name: 'Password Generator', href: '/tools/password-generator', icon: '🔑' },
  { name: 'Word Counter', href: '/tools/word-counter', icon: '📊' },
  { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
  { name: 'Loan Calculator', href: '/tools/loan-calculator', icon: '🏦' },
  { name: 'Unit Converter', href: '/tools/unit-converter', icon: '📐' },
  { name: 'Age Calculator', href: '/tools/age-calculator', icon: '🎂' },
  { name: 'Text Case', href: '/tools/text-case', icon: '🔤' },
  { name: 'Color Converter', href: '/tools/color-converter', icon: '🎨' },
  { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
  { name: 'Diff Checker', href: '/tools/diff-checker', icon: '↔️' },
  { name: 'PDF to Markdown', href: '/tools/pdf-to-markdown', icon: '📑' },
];

export default async function DashboardPage({ searchParams }: { searchParams: { upgrade?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  // Fetch profile + subscription
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();
  const { data: subscription } = await admin.from('subscriptions').select('*').eq('user_id', user.id).single();

  const plan = profile?.plan ?? 'free';
  const planLimit = plan === 'unlimited' ? 999999 : plan === 'pro' ? 200 : 10;

  // Usage in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: usageToday } = await admin
    .from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since);

  // Usage per tool (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: toolUsage } = await admin
    .from('usage_logs')
    .select('tool_name')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo);

  const toolCounts = (toolUsage ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.tool_name] = (acc[row.tool_name] ?? 0) + 1;
    return acc;
  }, {});

  const topTool = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0];
  const totalThisMonth = Object.values(toolCounts).reduce((a, b) => a + b, 0);

  const usedToday = usageToday ?? 0;
  const pct = Math.min((usedToday / planLimit) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Upgrade success banner */}
      {searchParams.upgrade === 'success' && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <Crown className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 font-medium">
            Welcome to {plan.charAt(0).toUpperCase() + plan.slice(1)}! Your account has been upgraded.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {profile?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-gray-400 text-sm">Here&apos;s your usage overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Today's usage */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Today</p>
              <p className="text-2xl font-bold text-white">{usedToday}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {plan === 'unlimited' ? 'Unlimited uses' : `${usedToday} / ${planLimit} uses`}
          </p>
        </div>

        {/* This month */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">This Month</p>
              <p className="text-2xl font-bold text-white">{totalThisMonth}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Total AI requests (30 days)</p>
        </div>

        {/* Top tool */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Top Tool</p>
              <p className="text-sm font-bold text-white truncate max-w-[130px]">
                {topTool ? topTool[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'None yet'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {topTool ? `Used ${topTool[1]} times this month` : 'Start using a tool!'}
          </p>
        </div>
      </div>

      {/* Plan info */}
      <div className={`card mb-8 ${plan !== 'free' ? 'border-violet-500/20 bg-violet-500/5' : ''}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white capitalize">{plan} Plan</span>
            </div>
            <p className="text-sm text-gray-400">
              {plan === 'free' && 'Upgrade to Pro for 200 uses/day and priority processing.'}
              {plan === 'pro' && `Renews ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'monthly'}.`}
              {plan === 'unlimited' && `Unlimited uses. Renews ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'monthly'}.`}
            </p>
          </div>
          {plan === 'free' && (
            <Link href="/pricing" className="btn-primary py-2 px-5 text-sm">
              Upgrade to Pro →
            </Link>
          )}
          {plan !== 'free' && (
            <Link href="/settings" className="btn-secondary py-2 px-4 text-sm">
              Manage Subscription
            </Link>
          )}
        </div>
      </div>

      {/* Quick access to tools */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your AI Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOOLS.map((tool) => {
            const count = toolCounts[tool.href.split('/').pop()!.replace(/-/g, '-')] ?? 0;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="card-hover group flex flex-col items-center gap-2 p-4 text-center"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors leading-tight">
                  {tool.name}
                </span>
                <ArrowUpRight className="w-3 h-3 text-gray-700 group-hover:text-violet-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
