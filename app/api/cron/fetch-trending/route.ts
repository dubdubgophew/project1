import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import {
  COUNTRIES,
  parseGTrendsRSS,
  detectCategory,
  type RawTrendItem,
} from '@/lib/trending-utils';

export const maxDuration = 300;

/**
 * Cron: /api/cron/fetch-trending
 * Schedule: 0 *\/3 * * *  (every 3 hours)
 * Secured by CRON_SECRET header (enforced in middleware.ts)
 *
 * Fetches Google Trends RSS for 10 countries, generates AI summaries via Groq,
 * and stores top 5 topics per country in Supabase.
 */

interface AISummaryItem {
  topic: string;
  summary: string;
  category: string;
}

const DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTrendsForCountry(countryCode: string): Promise<RawTrendItem[]> {
  const url = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${countryCode}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${countryCode}`);
  const xml = await res.text();
  return parseGTrendsRSS(xml);
}

async function generateSummariesBatch(trends: RawTrendItem[]): Promise<AISummaryItem[]> {
  const topicsBlock = trends.map((t, i) => {
    const snippetText = t.snippets.slice(0, 3).join(' | ');
    return `${i + 1}. Topic: "${t.topic}"\n   Headlines/snippets: ${snippetText || t.newsTitle || 'No snippet available'}`;
  }).join('\n\n');

  const prompt = `You are a concise news summarizer. Given the following trending topics, produce a JSON array with exactly ${trends.length} objects (one per topic, in the same order).

Each object must have:
- "topic": the exact topic string from input
- "summary": 150-200 words explaining what is trending and why, written in clear English, suitable for a general audience
- "category": exactly one of: Sports, Tech, Politics, Entertainment, Business, Health, General

Trending topics:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no code blocks, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional news summarizer. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.1-8b-instant', maxTokens: 2000, temperature: 0.4 }
  );

  // Extract JSON array from response
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
      console.log(`[fetch-trending] Processing ${country.code}...`);

      // Fetch RSS
      let trends: RawTrendItem[];
      try {
        trends = await fetchTrendsForCountry(country.code);
      } catch (fetchErr) {
        console.error(`[fetch-trending] RSS fetch failed for ${country.code}:`, fetchErr);
        results.push({ country: country.code, inserted: 0, error: String(fetchErr) });
        await sleep(DELAY_MS);
        continue;
      }

      if (trends.length === 0) {
        console.warn(`[fetch-trending] No trends found for ${country.code}`);
        results.push({ country: country.code, inserted: 0 });
        await sleep(DELAY_MS);
        continue;
      }

      // Generate AI summaries for all 5 topics in one batch call
      let summaries: AISummaryItem[];
      try {
        summaries = await generateSummariesBatch(trends);
      } catch (aiErr) {
        console.error(`[fetch-trending] AI batch failed for ${country.code}, using snippet fallback:`, aiErr);
        // Fallback: use snippets as summary
        summaries = trends.map(t => ({
          topic: t.topic,
          summary: t.snippets.join(' ') || t.newsTitle || `${t.topic} is currently trending in ${country.name}.`,
          category: detectCategory(t.topic, t.snippets),
        }));
      }

      // Build rows indexed by position (not topic name match)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 9 * 60 * 60 * 1000); // +9 hours

      const rows = trends.map((trend, idx) => {
        // Map by index — more reliable than name matching
        const aiItem: AISummaryItem = summaries[idx] ?? {
          topic: trend.topic,
          summary: trend.snippets.join(' ') || trend.newsTitle || `${trend.topic} is currently trending.`,
          category: detectCategory(trend.topic, trend.snippets),
        };

        return {
          country_code: country.code,
          country_name: country.name,
          topic: trend.topic,
          summary: aiItem.summary,
          traffic_volume: trend.traffic || null,
          category: aiItem.category || detectCategory(trend.topic, trend.snippets),
          source_url: trend.newsUrl,
          source_name: trend.newsSource || 'Unknown',
          source_title: trend.newsTitle || null,
          image_url: trend.imageUrl || null,
          fetched_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          rank: idx + 1,
        };
      });

      const { error: insertError } = await supabase
        .from('trending_news')
        .insert(rows);

      if (insertError) {
        console.error(`[fetch-trending] Insert failed for ${country.code}:`, insertError);
        results.push({ country: country.code, inserted: 0, error: insertError.message });
      } else {
        console.log(`[fetch-trending] Inserted ${rows.length} rows for ${country.code}`);
        results.push({ country: country.code, inserted: rows.length });
      }
    } catch (err) {
      console.error(`[fetch-trending] Unexpected error for ${country.code}:`, err);
      results.push({ country: country.code, inserted: 0, error: String(err) });
    }

    await sleep(DELAY_MS);
  }

  // Clean up expired rows
  try {
    const { error: deleteError } = await supabase
      .from('trending_news')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      console.error('[fetch-trending] Cleanup failed:', deleteError);
    } else {
      console.log('[fetch-trending] Expired rows cleaned up');
    }
  } catch (cleanupErr) {
    console.error('[fetch-trending] Cleanup error:', cleanupErr);
  }

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  console.log(`[Cron] fetch-trending complete. Inserted ${totalInserted} rows across ${results.length} countries.`);

  return NextResponse.json({
    success: true,
    totalInserted,
    results,
  });
}

// Allow GET for manual trigger
export async function GET(req: NextRequest) {
  return POST(req);
}
