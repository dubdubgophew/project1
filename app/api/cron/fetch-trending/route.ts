import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import {
  COUNTRIES,
  parseStandardRSS,
  detectCategory,
  fetchOGImage,
  type RawTrendItem,
} from '@/lib/trending-utils';

export const maxDuration = 300;

// Cron: /api/cron/fetch-trending — schedule: 0 8 * * * (daily 8am UTC)
// Secured by CRON_SECRET in middleware.ts
//
// Google Trends RSS blocks Vercel/AWS IPs. Using reputable country-specific
// news RSS feeds instead — free, no API key, no IP restrictions.

const COUNTRY_FEEDS: Record<string, { url: string; name: string }> = {
  US: { url: 'https://feeds.npr.org/1001/rss.xml',                           name: 'NPR News' },
  IN: { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',   name: 'Times of India' },
  GB: { url: 'https://feeds.bbci.co.uk/news/rss.xml',                        name: 'BBC News' },
  CA: { url: 'https://globalnews.ca/feed/',                                   name: 'Global News' },
  AU: { url: 'https://www.abc.net.au/news/feed/51120/rss.xml',               name: 'ABC Australia' },
  DE: { url: 'https://feeds.feedburner.com/euronews/en/news/',               name: 'Euronews' },
  FR: { url: 'https://www.france24.com/en/rss',                              name: 'France 24' },
  BR: { url: 'https://feeds.feedburner.com/euronews/en/news/latin-america',  name: 'Euronews Americas' },
  JP: { url: 'https://www.japantimes.co.jp/feed/',                           name: 'Japan Times' },
  ID: { url: 'https://www.antaranews.com/rss/terkini.xml',                   name: 'Antara News' },
};

interface AISummaryItem {
  topic: string;
  summary: string;
  category: string;
  key_points: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchCountryNews(countryCode: string): Promise<RawTrendItem[]> {
  const feed = COUNTRY_FEEDS[countryCode];
  if (!feed) throw new Error(`No feed configured for ${countryCode}`);

  const res = await fetch(feed.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${feed.url}`);
  const xml = await res.text();
  return parseStandardRSS(xml, feed.name);
}

async function generateSummariesBatch(
  countryName: string,
  trends: RawTrendItem[]
): Promise<AISummaryItem[]> {
  const topicsBlock = trends
    .map((t, i) => {
      const context = t.snippets.slice(0, 2).join(' ').slice(0, 400) || t.newsTitle;
      return `${i + 1}. Headline: "${t.topic}"\n   Context: ${context}`;
    })
    .join('\n\n');

  const prompt = `You are a sharp investigative journalist covering ${countryName}. For each headline below, write a proper multi-angle analysis — not a summary. Your job is to give readers real understanding, not just facts.

Produce a JSON array with exactly ${trends.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly (max 12 words)
- "summary": 230-270 words across 3 paragraphs:
  Para 1 — WHAT: Specific facts (who, what, when, where, key numbers or quotes).
  Para 2 — WHY: Root causes, historical context, key actors and their motivations, contributing factors.
  Para 3 — SO WHAT: Who benefits, who loses out, what concretely changes. End with a direct editorial opinion on what this story really means.
- "key_points": exactly 5 strings, EACH in the format "emoji Label | content (max 20 words)":
  "📍 What Happened | [one-liner factual summary]"
  "💡 Why It Happened | [root cause or background context]"
  "📈 Possible Upside | [positive outcomes or who benefits]"
  "⚠️ Possible Downside | [risks, negative consequences, who loses]"
  "🔮 Outlook | [what to watch short-term and long-term]"
- "category": exactly one of Sports | Tech | Politics | Entertainment | Business | Health | General

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional investigative journalist. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 3500, temperature: 0.35 }
  );

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array in AI response');
  const parsed = JSON.parse(jsonMatch[0]) as AISummaryItem[];
  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');
  return parsed;
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] fetch-trending started');
  const supabase = createAdminClient();
  const results: { country: string; inserted: number; skipped: number; error?: string }[] = [];

  // Load all source_urls stored in the last 7 days to deduplicate
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingRows } = await supabase
    .from('trending_news')
    .select('source_url')
    .gte('fetched_at', sevenDaysAgo);
  const existingUrls = new Set((existingRows ?? []).map(r => r.source_url).filter(Boolean));

  for (const country of COUNTRIES) {
    try {
      console.log(`[fetch-trending] Fetching news for ${country.code}…`);

      let trends: RawTrendItem[];
      try {
        trends = await fetchCountryNews(country.code);
      } catch (err) {
        console.error(`[fetch-trending] Feed failed for ${country.code}:`, err);
        results.push({ country: country.code, inserted: 0, skipped: 0, error: String(err) });
        await sleep(400);
        continue;
      }

      // Skip articles already stored in the last 7 days
      const newTrends = trends.filter(t => t.newsUrl && !existingUrls.has(t.newsUrl));
      const skipped   = trends.length - newTrends.length;

      if (!newTrends.length) {
        results.push({ country: country.code, inserted: 0, skipped, error: skipped ? undefined : 'No items in feed' });
        await sleep(400);
        continue;
      }

      // Best-effort: fetch OG images for articles that have no RSS image (max 3, parallel)
      const noImageItems = newTrends.filter(t => !t.imageUrl);
      if (noImageItems.length > 0) {
        const toFetch = noImageItems.slice(0, 3);
        const ogImages = await Promise.all(toFetch.map(t => fetchOGImage(t.newsUrl)));
        toFetch.forEach((t, i) => { if (ogImages[i]) t.imageUrl = ogImages[i]!; });
      }

      let summaries: AISummaryItem[];
      try {
        summaries = await generateSummariesBatch(country.name, newTrends);
      } catch (aiErr) {
        console.error(`[fetch-trending] AI failed for ${country.code}, using fallback:`, aiErr);
        summaries = newTrends.map(t => ({
          topic: t.topic,
          summary: t.snippets.join(' ').slice(0, 600) || `${t.topic} — latest news from ${country.name}.`,
          key_points: [],
          category: detectCategory(t.topic, t.snippets),
        }));
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const rows = newTrends.map((trend, idx) => {
        const ai: AISummaryItem = summaries[idx] ?? {
          topic: trend.topic,
          summary: trend.snippets.join(' ').slice(0, 600) || trend.topic,
          key_points: [],
          category: detectCategory(trend.topic, trend.snippets),
        };
        // Track newly inserted URLs so subsequent countries don't double-insert
        if (trend.newsUrl) existingUrls.add(trend.newsUrl);
        return {
          country_code:   country.code,
          country_name:   country.name,
          topic:          ai.topic || trend.topic,
          summary:        ai.summary,
          key_points:     ai.key_points?.length ? ai.key_points : null,
          traffic_volume: null,
          category:       ai.category || detectCategory(trend.topic, trend.snippets),
          source_url:     trend.newsUrl,
          source_name:    trend.newsSource,
          source_title:   trend.newsTitle || null,
          image_url:      trend.imageUrl || null,
          fetched_at:     now.toISOString(),
          expires_at:     expiresAt.toISOString(),
          rank:           idx + 1,
        };
      });

      const { error: insertError } = await supabase.from('trending_news').insert(rows);
      if (insertError) {
        console.error(`[fetch-trending] Insert failed for ${country.code}:`, insertError);
        results.push({ country: country.code, inserted: 0, skipped, error: insertError.message });
      } else {
        results.push({ country: country.code, inserted: rows.length, skipped });
      }
    } catch (err) {
      results.push({ country: country.code, inserted: 0, skipped: 0, error: String(err) });
    }

    await sleep(400);
  }

  // Prune articles older than 30 days to keep the database lean
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('trending_news').delete().lt('fetched_at', thirtyDaysAgo);

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalSkipped  = results.reduce((sum, r) => sum + r.skipped, 0);
  console.log(`[fetch-trending] Done. Inserted ${totalInserted}, skipped ${totalSkipped} duplicates.`);
  return NextResponse.json({ success: true, totalInserted, totalSkipped, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
