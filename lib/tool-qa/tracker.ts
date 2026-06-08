/**
 * Supabase persistence layer for Tool QA Agent
 * Handles: run logging, bug tracking, feature gaps, last-tested tracking, competitor cache
 */

import { createAdminClient } from '@/lib/supabase/server';
import type { BugReport, FeatureGap, QARunResult, CompetitorFeatures, BugSeverity } from './types';

function sb() {
  return createAdminClient();
}

// ── Tool Last-Tested Tracking ─────────────────────────────────────────────────

export async function getToolsOrderedByLastTested(): Promise<string[]> {
  try {
    const { data } = await sb()
      .from('tool_last_tested')
      .select('tool_slug, last_tested_at')
      .order('last_tested_at', { ascending: true });
    return (data ?? []).map(r => r.tool_slug as string);
  } catch {
    return [];
  }
}

export async function markToolTested(toolSlug: string, passRate: number): Promise<void> {
  try {
    await sb().from('tool_last_tested').upsert(
      { tool_slug: toolSlug, last_tested_at: new Date().toISOString(), last_test_pass_rate: passRate },
      { onConflict: 'tool_slug' }
    );
  } catch (err) {
    console.error('[QA Tracker] markToolTested error:', err);
  }
}

// ── Bug Tracking ──────────────────────────────────────────────────────────────

export async function storeBug(bug: BugReport): Promise<string | null> {
  try {
    const { data } = await sb().from('tool_bugs').insert({
      tool_slug: bug.toolSlug,
      test_name: bug.testName,
      error_type: bug.errorType,
      description: bug.description,
      test_input: bug.testInput,
      expected: bug.expected,
      actual: JSON.stringify(bug.actual ?? null).slice(0, 2000),
      severity: bug.severity,
      status: 'open',
    }).select('id').single();
    return data?.id ?? null;
  } catch (err) {
    console.error('[QA Tracker] storeBug error:', err);
    return null;
  }
}

export async function updateBugWithPR(bugId: string, prUrl: string): Promise<void> {
  try {
    await sb().from('tool_bugs').update({ status: 'pr_created', pr_url: prUrl }).eq('id', bugId);
  } catch (err) {
    console.error('[QA Tracker] updateBugWithPR error:', err);
  }
}

export async function getRecentOpenBugsForTool(toolSlug: string, days = 7): Promise<string[]> {
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data } = await sb()
      .from('tool_bugs')
      .select('description')
      .eq('tool_slug', toolSlug)
      .in('status', ['open', 'pr_created'])
      .gte('created_at', since);
    return (data ?? []).map(r => r.description as string);
  } catch {
    return [];
  }
}

// ── Feature Gaps ──────────────────────────────────────────────────────────────

export async function storeFeatureGap(gap: FeatureGap): Promise<string | null> {
  try {
    // Don't duplicate — check if same feature was stored recently
    const { data: existing } = await sb()
      .from('tool_feature_gaps')
      .select('id')
      .eq('tool_slug', gap.toolSlug)
      .eq('feature_name', gap.featureName)
      .in('status', ['identified', 'pr_created'])
      .limit(1);

    if (existing && existing.length > 0) return existing[0].id;

    const { data } = await sb().from('tool_feature_gaps').insert({
      tool_slug: gap.toolSlug,
      competitor_name: gap.competitorName,
      competitor_url: gap.competitorUrl,
      feature_name: gap.featureName,
      feature_description: gap.featureDescription,
      priority: gap.priority,
      complexity: gap.complexity,
      status: 'identified',
    }).select('id').single();
    return data?.id ?? null;
  } catch (err) {
    console.error('[QA Tracker] storeFeatureGap error:', err);
    return null;
  }
}

export async function updateFeatureGapWithPR(gapId: string, prUrl: string): Promise<void> {
  try {
    await sb().from('tool_feature_gaps').update({ status: 'pr_created', pr_url: prUrl }).eq('id', gapId);
  } catch {}
}

export async function getTopUnimplementedGap(toolSlug: string): Promise<{
  id: string; featureName: string; featureDescription: string; competitorName: string;
} | null> {
  try {
    const { data } = await sb()
      .from('tool_feature_gaps')
      .select('id, feature_name, feature_description, competitor_name')
      .eq('tool_slug', toolSlug)
      .eq('status', 'identified')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (!data) return null;
    return {
      id: data.id,
      featureName: data.feature_name,
      featureDescription: data.feature_description,
      competitorName: data.competitor_name,
    };
  } catch {
    return null;
  }
}

// ── Competitor Analysis Cache ─────────────────────────────────────────────────

export async function getCachedCompetitor(toolSlug: string, competitorName: string): Promise<CompetitorFeatures | null> {
  try {
    const { data } = await sb()
      .from('competitor_analysis_cache')
      .select('features, competitor_url, expires_at')
      .eq('tool_slug', toolSlug)
      .eq('competitor_name', competitorName)
      .single();

    if (!data) return null;
    if (new Date(data.expires_at as string) < new Date()) return null; // expired

    return {
      name: competitorName,
      url: data.competitor_url as string,
      features: data.features as string[],
    };
  } catch {
    return null;
  }
}

export async function cacheCompetitorAnalysis(toolSlug: string, competitor: CompetitorFeatures): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await sb().from('competitor_analysis_cache').upsert(
      {
        tool_slug: toolSlug,
        competitor_name: competitor.name,
        competitor_url: competitor.url,
        features: competitor.features,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: 'tool_slug,competitor_name' }
    );
  } catch (err) {
    console.error('[QA Tracker] cacheCompetitorAnalysis error:', err);
  }
}

// ── Run Logging ───────────────────────────────────────────────────────────────

export async function logQARun(result: QARunResult, trigger = 'cron'): Promise<void> {
  try {
    await sb().from('tool_qa_runs').insert({
      trigger,
      tools_tested: result.toolsTested,
      tests_run: result.testsRun,
      tests_passed: result.testsPassed,
      tests_failed: result.testsFailed,
      bugs_filed: result.bugsFiled,
      pr_urls: result.prUrls,
      features_identified: result.featuresIdentified,
      feature_pr_urls: result.featurePrUrls,
      summary: result.summary,
    });
  } catch (err) {
    console.error('[QA Tracker] logQARun error:', err);
  }
}

export async function getRecentRuns(limit = 10): Promise<unknown[]> {
  try {
    const { data } = await sb()
      .from('tool_qa_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getRecentBugs(limit = 20): Promise<unknown[]> {
  try {
    const { data } = await sb()
      .from('tool_bugs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getRecentFeatureGaps(limit = 20): Promise<unknown[]> {
  try {
    const { data } = await sb()
      .from('tool_feature_gaps')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}
