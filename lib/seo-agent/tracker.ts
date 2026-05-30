/**
 * Supabase persistence layer for SEO agent state
 */

import { createAdminClient } from '@/lib/supabase/server';
import type { PageMetric } from './gsc';
import type { Opportunity } from './analyzer';
import type { ContentImprovement } from './optimizer';

export async function storePageMetrics(pages: PageMetric[], date: string): Promise<void> {
  const admin = createAdminClient();
  const rows = pages.map(p => ({
    date,
    page: p.page,
    clicks: p.clicks,
    impressions: p.impressions,
    ctr: p.ctr,
    position: p.position,
  }));
  for (let i = 0; i < rows.length; i += 200) {
    await admin.from('seo_page_metrics').upsert(rows.slice(i, i + 200), { onConflict: 'date,page' });
  }
}

export async function dismissOldOpportunities(): Promise<void> {
  const admin = createAdminClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  await admin
    .from('seo_opportunities')
    .update({ status: 'dismissed' })
    .eq('status', 'open')
    .lt('created_at', cutoff.toISOString());
}

export async function storeOpportunity(opp: Opportunity): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.from('seo_opportunities').insert({
    page: opp.page,
    type: opp.type,
    score: opp.score,
    priority: opp.priority,
    data: opp.data,
    status: 'open',
  }).select('id').single();
  return data?.id ?? null;
}

export async function storeImprovement(
  imp: ContentImprovement,
  opportunityId: string | null,
  applied: boolean
): Promise<void> {
  const admin = createAdminClient();
  await admin.from('seo_content_improvements').insert({
    opportunity_id: opportunityId,
    page: imp.page,
    improvement_type: imp.type,
    field: imp.field,
    old_value: imp.oldValue.slice(0, 2000),
    new_value: imp.newValue.slice(0, 5000),
    applied,
    applied_at: applied ? new Date().toISOString() : null,
  });
}

export async function markOpportunityApplied(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from('seo_opportunities').update({ status: 'applied', resolved_at: new Date().toISOString() }).eq('id', id);
}

export async function logRun(run: {
  trigger: string;
  pagesAnalyzed: number;
  keywordsAnalyzed: number;
  opportunitiesFound: number;
  improvementsApplied: number;
  newPostsQueued: number;
  totalClicks7d: number;
  totalImpressions7d: number;
  clicksDeltaPct: number;
  impressionsDeltaPct: number;
  avgPosition: number;
  gscConnected: boolean;
  summary: string;
  details: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from('seo_agent_runs').insert({
    run_date: new Date().toISOString().split('T')[0],
    trigger: run.trigger,
    pages_analyzed: run.pagesAnalyzed,
    keywords_analyzed: run.keywordsAnalyzed,
    opportunities_found: run.opportunitiesFound,
    improvements_applied: run.improvementsApplied,
    new_posts_queued: run.newPostsQueued,
    total_clicks_7d: run.totalClicks7d,
    total_impressions_7d: run.totalImpressions7d,
    clicks_delta_pct: run.clicksDeltaPct,
    impressions_delta_pct: run.impressionsDeltaPct,
    avg_position: run.avgPosition,
    gsc_connected: run.gscConnected,
    summary: run.summary,
    details: run.details,
  });
}

export async function getBlogPostForPage(page: string): Promise<{ id: string; title: string; meta_description: string; content: string } | null> {
  const admin = createAdminClient();
  const urlSlug = page.replace(/^https?:\/\/[^/]+\/blog\//, '').replace(/\/$/, '');
  if (!page.includes('/blog/')) return null;
  const { data } = await admin
    .from('blog_posts')
    .select('id, title, meta_description, content')
    .eq('slug', urlSlug)
    .eq('published', true)
    .single();
  return data;
}

export async function applyBlogPostUpdate(
  page: string,
  updates: Partial<{ title: string; meta_description: string; content: string }>
): Promise<boolean> {
  const admin = createAdminClient();
  const urlSlug = page.replace(/^https?:\/\/[^/]+\/blog\//, '').replace(/\/$/, '');
  if (!page.includes('/blog/')) return false;
  const { error } = await admin
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('slug', urlSlug);
  return !error;
}

export async function getDashboardData() {
  const admin = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString().split('T')[0];

  const [runs, opportunities, improvements, topPages, recentKeywords] = await Promise.all([
    admin.from('seo_agent_runs').select('*').order('run_date', { ascending: false }).limit(30),
    admin.from('seo_opportunities').select('*').eq('status', 'open').order('score', { ascending: false }).limit(20),
    admin.from('seo_content_improvements').select('*').eq('applied', true).order('applied_at', { ascending: false }).limit(20),
    admin.from('seo_page_metrics').select('page, clicks, impressions, ctr, position, date').gte('date', since).order('clicks', { ascending: false }).limit(30),
    admin.from('seo_keyword_metrics').select('query, clicks, impressions, ctr, position').gte('date', since).order('impressions', { ascending: false }).limit(20),
  ]);

  return {
    runs: runs.data ?? [],
    opportunities: opportunities.data ?? [],
    improvements: improvements.data ?? [],
    topPages: topPages.data ?? [],
    topKeywords: recentKeywords.data ?? [],
  };
}
