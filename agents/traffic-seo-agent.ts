/**
 * Traffic SEO Agent
 * Runs daily. Fetches GSC data, scores opportunities, generates and applies
 * content improvements, queues new posts, submits changed URLs to IndexNow.
 * Works without GSC (content-only mode) if credentials aren't configured.
 */

import { isGSCConfigured, fetchGSCData } from '@/lib/seo-agent/gsc';
import { scoreOpportunities } from '@/lib/seo-agent/analyzer';
import {
  generateMetaImprovement,
  generateTitleImprovement,
  generateFAQSection,
  generateContentRefresh,
  deriveNewPostKeyword,
} from '@/lib/seo-agent/optimizer';
import {
  storePageMetrics,
  dismissOldOpportunities,
  storeOpportunity,
  storeImprovement,
  markOpportunityApplied,
  logRun,
  getBlogPostForPage,
  applyBlogPostUpdate,
} from '@/lib/seo-agent/tracker';
import { submitToIndexNow } from '@/lib/indexnow';
import { generateBlogPost } from './seo-content-agent';

const MAX_IMPROVEMENTS_PER_RUN = 5;
const MAX_NEW_POSTS_PER_RUN = 5;

function pctDelta(current: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((current - prev) / prev) * 100 * 100) / 100;
}

export async function runTrafficSEOAgent(trigger = 'cron'): Promise<{
  gscConnected: boolean;
  pagesAnalyzed: number;
  opportunitiesFound: number;
  improvementsApplied: number;
  newPostsQueued: number;
  summary: string;
}> {
  const gscConnected = isGSCConfigured();
  let pagesAnalyzed = 0;
  let keywordsAnalyzed = 0;
  let opportunitiesFound = 0;
  let improvementsApplied = 0;
  let newPostsQueued = 0;
  const updatedUrls: string[] = [];
  const appliedDetails: string[] = [];

  let totalClicks7d = 0;
  let totalImpressions7d = 0;
  let clicksDeltaPct = 0;
  let impressionsDeltaPct = 0;
  let avgPosition = 0;

  // ── Phase 1: Dismiss stale open opportunities ──────────────────────────────
  await dismissOldOpportunities();

  // ── Phase 2: GSC traffic analysis ─────────────────────────────────────────
  if (gscConnected) {
    console.log('[SEO Agent] Fetching GSC data…');
    try {
      const { pages, pagesPrev, keywords, dateRange } = await fetchGSCData(14);

      pagesAnalyzed = pages.length;
      keywordsAnalyzed = keywords.length;

      const today = new Date().toISOString().split('T')[0];
      await storePageMetrics(pages, today);

      // Aggregate stats
      totalClicks7d = pages.reduce((s, p) => s + p.clicks, 0);
      totalImpressions7d = pages.reduce((s, p) => s + p.impressions, 0);
      const prevClicks = pagesPrev.reduce((s, p) => s + p.clicks, 0);
      const prevImpressions = pagesPrev.reduce((s, p) => s + p.impressions, 0);
      clicksDeltaPct = pctDelta(totalClicks7d, prevClicks);
      impressionsDeltaPct = pctDelta(totalImpressions7d, prevImpressions);
      avgPosition = pages.length ? pages.reduce((s, p) => s + p.position, 0) / pages.length : 0;

      console.log(`[SEO Agent] GSC: ${pagesAnalyzed} pages, ${keywordsAnalyzed} keywords. Clicks: ${totalClicks7d} (${clicksDeltaPct > 0 ? '+' : ''}${clicksDeltaPct}%), Impressions: ${totalImpressions7d} (${impressionsDeltaPct > 0 ? '+' : ''}${impressionsDeltaPct}%)`);

      // ── Phase 3: Score opportunities ────────────────────────────────────────
      const opportunities = scoreOpportunities(pages, pagesPrev, keywords);
      opportunitiesFound = opportunities.length;

      // Store top 30 opportunities
      const oppIds: Record<number, string | null> = {};
      for (let i = 0; i < Math.min(30, opportunities.length); i++) {
        oppIds[i] = await storeOpportunity(opportunities[i]);
      }

      console.log(`[SEO Agent] ${opportunitiesFound} opportunities found. Top: ${opportunities.slice(0, 3).map(o => `${o.type}@${o.page.split('/').pop()}`).join(', ')}`);

      // ── Phase 4: Generate & apply improvements ──────────────────────────────
      const actionable = opportunities.filter(o => o.type !== 'new_post').slice(0, MAX_IMPROVEMENTS_PER_RUN);

      for (let i = 0; i < actionable.length; i++) {
        const opp = actionable[i];
        const oppId = oppIds[opportunities.indexOf(opp)] ?? null;

        try {
          let improvement = null;

          if (opp.type === 'fix_meta' && opp.page.includes('/blog/')) {
            const post = await getBlogPostForPage(opp.page);
            if (post?.meta_description) {
              improvement = await generateMetaImprovement(opp, keywords, post.meta_description);
              if (improvement) {
                const ok = await applyBlogPostUpdate(opp.page, { meta_description: improvement.newValue });
                if (ok) {
                  await storeImprovement(improvement, oppId, true);
                  if (oppId) await markOpportunityApplied(oppId);
                  updatedUrls.push(opp.page);
                  appliedDetails.push(`meta: ${opp.page.split('/').pop()}`);
                  improvementsApplied++;
                }
              }
            }
          } else if (opp.type === 'title_tweak' && opp.page.includes('/blog/')) {
            const post = await getBlogPostForPage(opp.page);
            if (post?.title) {
              improvement = await generateTitleImprovement(opp, keywords, post.title);
              if (improvement) {
                const ok = await applyBlogPostUpdate(opp.page, { title: improvement.newValue });
                if (ok) {
                  await storeImprovement(improvement, oppId, true);
                  if (oppId) await markOpportunityApplied(oppId);
                  updatedUrls.push(opp.page);
                  appliedDetails.push(`title: ${opp.page.split('/').pop()}`);
                  improvementsApplied++;
                }
              }
            }
          } else if (opp.type === 'content_refresh' && opp.page.includes('/blog/')) {
            const post = await getBlogPostForPage(opp.page);
            if (post?.content) {
              const firstPara = (post.content.match(/<p[^>]*>([\s\S]*?)<\/p>/) ?? [])[0] ?? '';
              improvement = await generateContentRefresh(opp, keywords, firstPara);
              if (improvement) {
                // Prepend new intro to content
                const newContent = improvement.newValue + '\n' + post.content.replace(/<p[^>]*>[\s\S]*?<\/p>/, '');
                const ok = await applyBlogPostUpdate(opp.page, { content: newContent });
                if (ok) {
                  await storeImprovement(improvement, oppId, true);
                  if (oppId) await markOpportunityApplied(oppId);
                  updatedUrls.push(opp.page);
                  appliedDetails.push(`refresh: ${opp.page.split('/').pop()}`);
                  improvementsApplied++;
                }
              }
            }
          } else if (opp.type === 'add_faq' || opp.type === 'fix_meta' || opp.type === 'title_tweak' || opp.type === 'geo_markup') {
            // Tool pages — store as recommendations (can't auto-apply static files on Vercel)
            let recImprovement = null;
            if (opp.type === 'fix_meta') {
              recImprovement = await generateMetaImprovement(opp, keywords, '');
            } else if (opp.type === 'add_faq') {
              recImprovement = await generateFAQSection(opp, keywords);
            }
            if (recImprovement) {
              await storeImprovement(recImprovement, oppId, false);
            }
          }

          // Rate limit between AI calls
          await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
          console.error(`[SEO Agent] Error on ${opp.type} for ${opp.page}:`, err);
        }
      }

      // ── Phase 5: Queue new posts from keyword gaps ──────────────────────────
      const newPostOpps = opportunities.filter(o => o.type === 'new_post').slice(0, MAX_NEW_POSTS_PER_RUN);
      for (const opp of newPostOpps) {
        try {
          const keyword = await deriveNewPostKeyword(opp);
          if (keyword) {
            console.log(`[SEO Agent] Generating new post for keyword: "${keyword}"`);
            const post = await generateBlogPost(keyword);
            if (post) {
              newPostsQueued++;
              appliedDetails.push(`new post: "${post.title}"`);
              // Track in improvements table
              await storeImprovement(
                { page: '(new)', type: 'new_post', field: 'slug', oldValue: '', newValue: post.slug },
                null,
                true
              );
            }
          }
          await new Promise(r => setTimeout(r, 5000));
        } catch (err) {
          console.error(`[SEO Agent] New post generation error:`, err);
        }
      }

      // ── Phase 6: IndexNow submission for updated pages ──────────────────────
      if (updatedUrls.length > 0) {
        try {
          await submitToIndexNow(updatedUrls);
          console.log(`[SEO Agent] IndexNow submitted: ${updatedUrls.length} URLs`);
        } catch (err) {
          console.error('[SEO Agent] IndexNow error:', err);
        }
      }
    } catch (err) {
      console.error('[SEO Agent] GSC fetch error:', err);
      // Fall through to content-only mode
    }
  } else {
    console.log('[SEO Agent] GSC not configured — running in content-only mode');
  }

  // ── Phase 7: Content generation (always runs) ──────────────────────────────
  // Always publish new posts regardless of GSC — sustain publishing velocity
  // When GSC connected: generate up to 5 posts/day. Without GSC: 5 posts/day.
  const contentOnlyPosts = Math.max(0, 5 - newPostsQueued);
  if (contentOnlyPosts > 0) {
    for (let i = 0; i < contentOnlyPosts; i++) {
      try {
        const post = await generateBlogPost();
        if (post) {
          newPostsQueued++;
          appliedDetails.push(`content post: "${post.title}"`);
        }
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error('[SEO Agent] Content-only post error:', err);
      }
    }
  }

  // ── Phase 8: Log run ────────────────────────────────────────────────────────
  const summary = [
    gscConnected
      ? `GSC: ${pagesAnalyzed} pages · ${totalClicks7d} clicks (${clicksDeltaPct > 0 ? '+' : ''}${clicksDeltaPct}%)`
      : 'Content-only mode (GSC not configured)',
    `${opportunitiesFound} opportunities · ${improvementsApplied} applied · ${newPostsQueued} new posts`,
    appliedDetails.length ? `Changes: ${appliedDetails.join(', ')}` : '',
  ].filter(Boolean).join(' | ');

  await logRun({
    trigger,
    pagesAnalyzed,
    keywordsAnalyzed,
    opportunitiesFound,
    improvementsApplied,
    newPostsQueued,
    totalClicks7d,
    totalImpressions7d,
    clicksDeltaPct,
    impressionsDeltaPct,
    avgPosition: +avgPosition.toFixed(2),
    gscConnected,
    summary,
    details: { appliedDetails, updatedUrls },
  });

  console.log(`[SEO Agent] Done. ${summary}`);

  return { gscConnected, pagesAnalyzed, opportunitiesFound, improvementsApplied, newPostsQueued, summary };
}
