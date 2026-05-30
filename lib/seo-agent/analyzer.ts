/**
 * Opportunity scorer
 * Ranks pages and keyword clusters by traffic growth potential
 */

import type { PageMetric, KeywordMetric } from './gsc';

export type OpportunityType = 'fix_meta' | 'content_refresh' | 'add_faq' | 'new_post' | 'title_tweak' | 'geo_markup';

export interface Opportunity {
  page: string;
  type: OpportunityType;
  score: number;
  priority: 1 | 2 | 3; // 1=critical 2=high 3=medium
  data: Record<string, unknown>;
}

// Industry average CTR by position (Sistrix 2024 data)
const EXPECTED_CTR: Record<number, number> = {
  1: 0.278, 2: 0.152, 3: 0.111, 4: 0.078, 5: 0.058,
  6: 0.044, 7: 0.034, 8: 0.026, 9: 0.021, 10: 0.017,
};

function expectedCTR(position: number): number {
  const pos = Math.min(10, Math.max(1, Math.round(position)));
  return EXPECTED_CTR[pos] ?? 0.015;
}

function pctDelta(current: number, prev: number): number {
  if (prev === 0) return 0;
  return (current - prev) / prev;
}

export function scoreOpportunities(
  pages: PageMetric[],
  pagesPrev: PageMetric[],
  keywords: KeywordMetric[]
): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const prevMap = new Map(pagesPrev.map(p => [p.page, p]));

  for (const page of pages) {
    const prev = prevMap.get(page.page);
    const clicksDelta = prev ? pctDelta(page.clicks, prev.clicks) : 0;
    const expCtr = expectedCTR(page.position);
    const ctrGap = expCtr - page.ctr;

    // Need at least minimal signal
    if (page.impressions < 20) continue;

    // 1. Fix meta description — high impressions, CTR well below expected
    if (page.impressions >= 100 && ctrGap > 0.025) {
      const score = page.impressions * ctrGap * 12;
      opportunities.push({
        page: page.page,
        type: 'fix_meta',
        score,
        priority: ctrGap > 0.07 ? 1 : ctrGap > 0.04 ? 2 : 3,
        data: { impressions: page.impressions, ctr: page.ctr, expectedCtr: expCtr, ctrGap: +ctrGap.toFixed(4), position: page.position, clicks: page.clicks },
      });
    }

    // 2. Title tweak — positions 4-10, good impressions (just off the top 3)
    if (page.position >= 4 && page.position <= 10 && page.impressions >= 150) {
      const score = page.impressions * (11 - page.position) * 2.5;
      opportunities.push({
        page: page.page,
        type: 'title_tweak',
        score,
        priority: page.position <= 6 ? 2 : 3,
        data: { position: page.position, impressions: page.impressions, clicks: page.clicks, ctr: page.ctr },
      });
    }

    // 3. Content refresh — page 2-3 rankings or significant traffic decline
    const isPage2 = page.position > 10 && page.position <= 30;
    const isFalling = clicksDelta < -0.25 && page.clicks >= 5;
    if (isPage2 || isFalling) {
      const score = page.impressions * (1 / Math.max(1, page.position)) * 80 + (isFalling ? Math.abs(clicksDelta) * 400 : 0);
      opportunities.push({
        page: page.page,
        type: 'content_refresh',
        score,
        priority: isFalling && clicksDelta < -0.4 ? 1 : isPage2 && page.impressions > 300 ? 2 : 3,
        data: { position: page.position, clicksDelta: +clicksDelta.toFixed(4), impressions: page.impressions, clicks: page.clicks },
      });
    }

    // 4. Add FAQ — top 10, high impressions on non-blog tool pages
    if (page.position <= 10 && page.impressions >= 300 && page.page.includes('/tools/')) {
      const score = page.impressions * 0.6;
      opportunities.push({
        page: page.page,
        type: 'add_faq',
        score,
        priority: 2,
        data: { position: page.position, impressions: page.impressions, clicks: page.clicks },
      });
    }

    // 5. GEO markup — any high-traffic tool page missing rich results
    if (page.position <= 5 && page.impressions >= 500 && page.page.includes('/tools/')) {
      opportunities.push({
        page: page.page,
        type: 'geo_markup',
        score: page.impressions * 0.4,
        priority: 2,
        data: { position: page.position, impressions: page.impressions, clicks: page.clicks },
      });
    }
  }

  // 6. New post opportunities — keyword clusters with no dedicated page
  const pageSet = new Set(pages.map(p => p.page));
  const clusters = new Map<string, { impressions: number; clicks: number; queries: string[]; pages: string[] }>();

  for (const kw of keywords) {
    if (kw.impressions < 30) continue;
    const words = kw.query.trim().toLowerCase().split(/\s+/);
    // Cluster by 2-word prefix
    const clusterKey = words.slice(0, 2).join(' ');
    const c = clusters.get(clusterKey);
    if (c) {
      c.impressions += kw.impressions;
      c.clicks += kw.clicks;
      if (!c.queries.includes(kw.query)) c.queries.push(kw.query);
      if (!c.pages.includes(kw.page)) c.pages.push(kw.page);
    } else {
      clusters.set(clusterKey, { impressions: kw.impressions, clicks: kw.clicks, queries: [kw.query], pages: [kw.page] });
    }
  }

  for (const [topic, data] of clusters) {
    if (data.queries.length >= 4 && data.impressions >= 300 && data.clicks < data.impressions * 0.02) {
      opportunities.push({
        page: '(new)',
        type: 'new_post',
        score: data.impressions * 0.35,
        priority: 3,
        data: { topic, impressions: data.impressions, clicks: data.clicks, queries: data.queries.slice(0, 12) },
      });
    }
  }

  // Deduplicate by page+type, sort by score
  const seen = new Set<string>();
  return opportunities
    .sort((a, b) => b.score - a.score)
    .filter(o => {
      const key = `${o.page}::${o.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
