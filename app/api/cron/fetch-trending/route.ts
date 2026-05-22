import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import {
  COUNTRIES,
  parseStandardRSS,
  detectCategory,
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
  CA: { url: 'https://www.cbc.ca/cmlink/rss-topstories',                     name: 'CBC News' },
  AU: { url: 'https://www.abc.net.au/news/feed/51120/rss.xml',               name: 'ABC Australia' },
  DE: { url: 'https://rss.dw.com/rdf/rss-en-all',                            name: 'Deutsche Welle' },
  FR: { url: 'https://www.france24.com/en/rss',                              name: 'France 24' },
  BR: { url: 'https://www.reuters.com/world/americas/rss.xml',               name: 'Reuters Americas' },
  JP: { url: 'https://www.japantimes.co.jp/feed/',                           name: 'Japan Times' },
  ID: { url: 'https://www.thejakartapost.com/feed/',                         name: 'Jakarta Post' },
};

interface AISummaryItem {
  topic: string;
  summary: string;
  category: string;
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

  const prompt = `You are a news summarizer for ${countryName}. Given these top news headlines, produce a JSON array with exactly ${trends.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly (max 12 words)
- "summary": 150-200 words explaining what happened and why it matters, in plain English
- "category": exactly one of Sports | Tech | Politics | Entertainment | Business | Health | General

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional news editor. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.1-8b-instant', maxTokens: 2200, temperature: 0.3 }
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
  const results: { country: string; inserted: number; error?: string }[] = [];

  for (const country of COUNTRIES) {
    try {
      console.log(`[fetch-trending] Fetching news for ${country.code}…`);

      let trends: RawTrendItem[];
      try {
        trends = await fetchCountryNews(country.code);
      } catch (err) {
        console.error(`[fetch-trending] Feed failed for ${country.code}:`, err);
        results.push({ country: country.code, inserted: 0, error: String(err) });
        await sleep(400);
        continue;
      }

      if (!trends.length) {
        results.push({ country: country.code, inserted: 0, error: 'No items in feed' });
        await sleep(400);
        continue;
      }

      let summaries: AISummaryItem[];
      try {
        summaries = await generateSummariesBatch(country.name, trends);
      } catch (aiErr) {
        console.error(`[fetch-trending] AI failed for ${country.code}, using fallback:`, aiErr);
        summaries = trends.map(t => ({
          topic: t.topic,
          summary: t.snippets.join(' ').slice(0, 600) || `${t.topic} — latest news from ${country.name}.`,
          category: detectCategory(t.topic, t.snippets),
        }));
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 26 * 60 * 60 * 1000); // 26h — survives until next daily run

      const rows = trends.map((trend, idx) => {
        const ai: AISummaryItem = summaries[idx] ?? {
          topic: trend.topic,
          summary: trend.snippets.join(' ').slice(0, 600) || trend.topic,
          category: detectCategory(trend.topic, trend.snippets),
        };
        return {
          country_code:  country.code,
          country_name:  country.name,
          topic:         ai.topic || trend.topic,
          summary:       ai.summary,
          traffic_volume: null,
          category:      ai.category || detectCategory(trend.topic, trend.snippets),
          source_url:    trend.newsUrl,
          source_name:   trend.newsSource,
          source_title:  trend.newsTitle || null,
          image_url:     trend.imageUrl || null,
          fetched_at:    now.toISOString(),
          expires_at:    expiresAt.toISOString(),
          rank:          idx + 1,
        };
      });

      const { error: insertError } = await supabase.from('trending_news').insert(rows);
      if (insertError) {
        console.error(`[fetch-trending] Insert failed for ${country.code}:`, insertError);
        results.push({ country: country.code, inserted: 0, error: insertError.message });
      } else {
        results.push({ country: country.code, inserted: rows.length });
      }
    } catch (err) {
      results.push({ country: country.code, inserted: 0, error: String(err) });
    }

    await sleep(400);
  }

  // Delete rows past their expiry
  await supabase.from('trending_news').delete().lt('expires_at', new Date().toISOString());

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  console.log(`[fetch-trending] Done. Inserted ${totalInserted} rows.`);
  return NextResponse.json({ success: true, totalInserted, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
