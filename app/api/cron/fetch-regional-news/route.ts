import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { parseStandardRSS, detectCategory, type RawTrendItem } from '@/lib/trending-utils';
import { REGIONAL_FEEDS } from '@/lib/regional-news-utils';

export const maxDuration = 300;

// Cron: /api/cron/fetch-regional-news — schedule: 0 11 * * * (daily 11am UTC)
// Fetches multiple sources per country + regional language news to boost volume.
// All articles go into the same trending_news table with language_code/language_name set.

interface AISummaryItem {
  topic: string;
  summary: string;
  category: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchFeed(url: string, sourceName: string): Promise<RawTrendItem[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return parseStandardRSS(await res.text(), sourceName, 8);
}

async function generateSummaries(
  sourceName: string,
  langName: string,
  trends: RawTrendItem[]
): Promise<AISummaryItem[]> {
  const isEnglish = langName === 'English';
  const topicsBlock = trends
    .map((t, i) => {
      const ctx = t.snippets.slice(0, 2).join(' ').slice(0, 400) || t.newsTitle;
      return `${i + 1}. Headline: "${t.topic}"\n   Context: ${ctx}`;
    })
    .join('\n\n');

  const langInstruction = isEnglish
    ? 'Write the summary in English.'
    : `Write the topic and summary in ${langName}. Preserve key proper nouns (names, places) as-is.`;

  const prompt = `You are a news summarizer for ${sourceName}. Given these headlines, produce a JSON array with exactly ${trends.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly (max 12 words). ${langInstruction}
- "summary": 120-180 words explaining what happened and why it matters. ${langInstruction}
- "category": exactly one of Sports | Tech | Politics | Entertainment | Business | Health | General (always in English)

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional news editor. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 2400, temperature: 0.3 }
  );

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array in AI response');
  const parsed = JSON.parse(jsonMatch[0]) as AISummaryItem[];
  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');
  return parsed;
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] fetch-regional-news started');
  const supabase = createAdminClient();
  const results: { key: string; inserted: number; skipped: number; error?: string }[] = [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingRows } = await supabase
    .from('trending_news')
    .select('source_url')
    .gte('fetched_at', sevenDaysAgo);
  const existingUrls = new Set((existingRows ?? []).map(r => r.source_url).filter(Boolean));

  for (const feed of REGIONAL_FEEDS) {
    try {
      console.log(`[fetch-regional-news] Fetching ${feed.key}…`);

      let trends: RawTrendItem[];
      try {
        trends = await fetchFeed(feed.url, feed.name);
      } catch (err) {
        console.error(`[fetch-regional-news] Feed failed for ${feed.key}:`, err);
        results.push({ key: feed.key, inserted: 0, skipped: 0, error: String(err) });
        await sleep(300);
        continue;
      }

      const newTrends = trends.filter(t => t.newsUrl && !existingUrls.has(t.newsUrl));
      const skipped = trends.length - newTrends.length;

      if (!newTrends.length) {
        results.push({ key: feed.key, inserted: 0, skipped, error: skipped ? undefined : 'No items in feed' });
        await sleep(300);
        continue;
      }

      let summaries: AISummaryItem[];
      try {
        summaries = await generateSummaries(feed.name, feed.langName, newTrends);
      } catch (aiErr) {
        console.error(`[fetch-regional-news] AI failed for ${feed.key}, using fallback:`, aiErr);
        summaries = newTrends.map(t => ({
          topic: t.topic,
          summary: t.snippets.join(' ').slice(0, 600) || `${t.topic} — ${feed.name}.`,
          category: detectCategory(t.topic, t.snippets),
        }));
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const rows = newTrends.map((trend, idx) => {
        const ai: AISummaryItem = summaries[idx] ?? {
          topic: trend.topic,
          summary: trend.snippets.join(' ').slice(0, 600) || trend.topic,
          category: detectCategory(trend.topic, trend.snippets),
        };
        if (trend.newsUrl) existingUrls.add(trend.newsUrl);
        return {
          country_code:   feed.countryCode,
          country_name:   feed.countryName,
          topic:          ai.topic || trend.topic,
          summary:        ai.summary,
          traffic_volume: null,
          category:       ai.category || detectCategory(trend.topic, trend.snippets),
          source_url:     trend.newsUrl,
          source_name:    trend.newsSource,
          source_title:   trend.newsTitle || null,
          image_url:      trend.imageUrl || null,
          fetched_at:     now.toISOString(),
          expires_at:     expiresAt.toISOString(),
          rank:           idx + 1,
          language_code:  feed.langCode,
          language_name:  feed.langName,
        };
      });

      const { error: insertError } = await supabase.from('trending_news').insert(rows);
      if (insertError) {
        console.error(`[fetch-regional-news] Insert failed for ${feed.key}:`, insertError);
        results.push({ key: feed.key, inserted: 0, skipped, error: insertError.message });
      } else {
        results.push({ key: feed.key, inserted: rows.length, skipped });
      }
    } catch (err) {
      results.push({ key: feed.key, inserted: 0, skipped: 0, error: String(err) });
    }

    await sleep(300);
  }

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalSkipped  = results.reduce((sum, r) => sum + r.skipped, 0);
  console.log(`[fetch-regional-news] Done. Inserted ${totalInserted}, skipped ${totalSkipped}.`);
  return NextResponse.json({ success: true, totalInserted, totalSkipped, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
