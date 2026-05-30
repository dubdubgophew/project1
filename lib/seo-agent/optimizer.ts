/**
 * AI-powered improvement generator
 * Uses Groq/LLaMA for content — no paid SEO APIs
 */

import { callAI } from '@/lib/ai';
import type { Opportunity } from './analyzer';
import type { KeywordMetric } from './gsc';

export interface ContentImprovement {
  page: string;
  type: string;
  field: string;
  oldValue: string;
  newValue: string;
}

const SITE = 'formly.tools';
const SITE_URL = 'https://formly.tools';

function slug(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
}

function topKeywords(page: string, keywords: KeywordMetric[], limit = 10): KeywordMetric[] {
  return keywords
    .filter(k => k.page === page)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
}

export async function generateMetaImprovement(
  opp: Opportunity,
  keywords: KeywordMetric[],
  currentMeta: string
): Promise<ContentImprovement | null> {
  const kws = topKeywords(opp.page, keywords).map(
    k => `"${k.query}" (${k.impressions} impr, pos ${k.position.toFixed(1)}, CTR ${(k.ctr * 100).toFixed(1)}%)`
  );

  const raw = await callAI([
    {
      role: 'system',
      content: `You are an elite SEO conversion specialist for ${SITE}, a free AI tools platform.
Write a meta description that maximizes Google click-through rate.
Hard rules:
• 148–158 characters (count every character including spaces)
• Primary keyword in first 60 characters
• Include the word "free"
• Specific benefit/number where possible ("in seconds", "2026", "no signup")
• No generic filler ("In this article…", "Click here…")
• No quotes or special symbols
Return ONLY the meta description text — nothing else.`,
    },
    {
      role: 'user',
      content: `Page: ${SITE_URL}${slug(opp.page)}
Current meta (${currentMeta.length} chars, CTR ${((opp.data.ctr as number) * 100).toFixed(1)}%): ${currentMeta}
Expected CTR for position ${(opp.data.position as number).toFixed(1)}: ${((opp.data.expectedCtr as number) * 100).toFixed(1)}%
CTR gap: −${((opp.data.ctrGap as number) * 100).toFixed(1)}pp
Top queries:
${kws.join('\n')}`,
    },
  ], { temperature: 0.4, maxTokens: 100 });

  const newMeta = raw.trim().replace(/^["']|["']$/g, '').slice(0, 160);
  if (newMeta.length < 100 || newMeta === currentMeta) return null;

  return { page: opp.page, type: 'fix_meta', field: 'meta_description', oldValue: currentMeta, newValue: newMeta };
}

export async function generateTitleImprovement(
  opp: Opportunity,
  keywords: KeywordMetric[],
  currentTitle: string
): Promise<ContentImprovement | null> {
  const topKws = topKeywords(opp.page, keywords, 5).map(k => k.query);

  const raw = await callAI([
    {
      role: 'system',
      content: `You are an SEO title optimizer for ${SITE}.
Write a page title that ranks higher and gets more clicks.
Rules:
• 50–62 characters
• Primary keyword near the start
• Include year (2026) or "Free" if natural
• Brand suffix: " | Formly" or " — Formly"
• Be specific, not generic
Return ONLY the title — nothing else.`,
    },
    {
      role: 'user',
      content: `Current title: ${currentTitle}
Page: ${slug(opp.page)}
Position: ${(opp.data.position as number).toFixed(1)}
Top queries: ${topKws.join(' | ')}`,
    },
  ], { temperature: 0.35, maxTokens: 80 });

  const newTitle = raw.trim().replace(/^["']|["']$/g, '').slice(0, 65);
  if (newTitle.length < 20 || newTitle === currentTitle) return null;

  return { page: opp.page, type: 'title_tweak', field: 'title', oldValue: currentTitle, newValue: newTitle };
}

export async function generateFAQSection(
  opp: Opportunity,
  keywords: KeywordMetric[]
): Promise<ContentImprovement | null> {
  const kws = topKeywords(opp.page, keywords, 20).map(k => k.query);

  const raw = await callAI([
    {
      role: 'system',
      content: `You are an SEO specialist targeting Google's "People Also Ask" boxes for ${SITE}.
Generate an FAQ section in clean HTML.
Rules:
• 6 questions derived from the actual search queries
• Each answer: 2–4 sentences, start with the keyword from the question
• Be genuinely useful — specific numbers, clear steps
• Use exactly this structure (no extra wrappers):
<div class="faq-section"><h2>Frequently Asked Questions</h2>
<div class="faq-item"><h3>Q?</h3><p>Answer.</p></div>
...
</div>
Return ONLY the HTML block.`,
    },
    {
      role: 'user',
      content: `Page: ${SITE_URL}${slug(opp.page)}
Search queries landing here:
${kws.join('\n')}
Position: ${(opp.data.position as number).toFixed(1)}, Impressions: ${opp.data.impressions}`,
    },
  ], { temperature: 0.4, maxTokens: 1500 });

  const html = raw.trim();
  if (!html.includes('faq') || !html.includes('<h3>')) return null;

  return { page: opp.page, type: 'add_faq', field: 'faq_html', oldValue: '', newValue: html };
}

export async function generateContentRefresh(
  opp: Opportunity,
  keywords: KeywordMetric[],
  currentIntro: string
): Promise<ContentImprovement | null> {
  const kws = topKeywords(opp.page, keywords, 15);
  const primaryKw = kws[0]?.query ?? slug(opp.page).replace(/\//g, ' ').trim();

  const raw = await callAI([
    {
      role: 'system',
      content: `You are an SEO content refresher for ${SITE}, a free AI tools platform.
Rewrite the blog post introduction to:
• Open with the primary keyword in the first sentence
• Include 2026, current stats, or recent context
• Answer the search intent immediately (no "In this article…")
• 120–180 words
• End with a transition sentence leading to the main content
Return ONLY the new introduction paragraph(s) in HTML (<p> tags).`,
    },
    {
      role: 'user',
      content: `Page: ${SITE_URL}${slug(opp.page)}
Primary keyword: "${primaryKw}"
Position: ${(opp.data.position as number).toFixed(1)} (was higher — needs refresh)
Traffic drop: ${((opp.data.clicksDelta as number) * 100).toFixed(0)}%
Current intro: ${currentIntro.slice(0, 500)}
Other top queries: ${kws.slice(1, 6).map(k => k.query).join(', ')}`,
    },
  ], { temperature: 0.5, maxTokens: 400 });

  const html = raw.trim();
  if (!html.includes('<p>') || html.length < 100) return null;

  return { page: opp.page, type: 'content_refresh', field: 'intro_html', oldValue: currentIntro.slice(0, 1000), newValue: html };
}

export async function deriveNewPostKeyword(opp: Opportunity): Promise<string | null> {
  const queries = (opp.data.queries as string[]) ?? [];
  if (queries.length < 2) return null;

  const raw = await callAI([
    {
      role: 'system',
      content: `Pick the single best target keyword for a new blog post for ${SITE} (free AI tools).
Choose a long-tail keyword (4–6 words) that:
• Has clear informational or tool-seeking intent
• Represents the cluster's core topic
• People actually search for
Return ONLY the keyword — nothing else, no punctuation.`,
    },
    {
      role: 'user',
      content: `Topic cluster: ${opp.data.topic}
Search queries from this cluster:
${queries.join('\n')}`,
    },
  ], { temperature: 0.3, maxTokens: 30 });

  return raw.trim().toLowerCase().replace(/['"]/g, '') || null;
}
