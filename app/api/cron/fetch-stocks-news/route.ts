import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJsonArray } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { STOCK_SOURCES, parseStockFeedRSS, type StockRawItem } from '@/lib/stocks-utils';
import { fetchOGImage } from '@/lib/trending-utils';

export const maxDuration = 300;

// Cron: /api/cron/fetch-stocks-news — schedule: 0 14 * * * (daily 2pm UTC)
// Secured by CRON_SECRET in middleware.ts

interface StockSummaryItem {
  topic: string;
  summary: string;
  category: string;
  key_points: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchSourceFeed(url: string): Promise<StockRawItem[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return parseStockFeedRSS(await res.text());
}

async function generateStockSummaries(
  sourceName: string,
  countryName: string,
  langCode: string,
  langName: string,
  items: StockRawItem[],
): Promise<StockSummaryItem[]> {
  const topicsBlock = items
    .map((t, i) => {
      const ctx = t.snippets.slice(0, 2).join(' ').slice(0, 400) || t.newsTitle;
      return `${i + 1}. Headline: "${t.topic}"\n   Context: ${ctx}`;
    })
    .join('\n\n');

  const langNote = langCode !== 'en'
    ? `\nIMPORTANT: Write "topic", "summary", and all "key_points" content in ${langName}. Keep "category" values in English.\n`
    : '';

  const prompt = `You are a senior financial markets analyst writing for ${sourceName} (${countryName}). For each headline, deliver a rigorous market-focused analysis — not just a news summary. Give investors and traders real insight into what this means for markets.${langNote}

Produce a JSON array with exactly ${items.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly as a market-relevant title (max 12 words)
- "summary": 230-270 words across 3 paragraphs:
  Para 1 — WHAT: Specific facts — what happened, key numbers, company/ticker names, index moves, prices, percentages.
  Para 2 — WHY: What drove this? Macro context, earnings drivers, policy changes, technical levels, sector dynamics, insider moves.
  Para 3 — SO WHAT: Who wins and who loses? What does this signal for the broader market, sector rotation, or specific stocks? Concrete investment takeaway and forward-looking view.
- "key_points": exactly 5 strings, EACH in the format "emoji Label | content (max 20 words)":
  "📍 What Happened | [concise factual one-liner with key numbers]"
  "💰 Market Impact | [immediate effect on prices, indices, or sectors]"
  "📈 Bull Case | [who benefits, what could push prices higher]"
  "📉 Bear Case | [risks, headwinds, what could go wrong]"
  "🔮 What to Watch | [key upcoming events, levels, catalysts]"
- "category": exactly one of Markets | Earnings | Macro | Analysis | IPO | Commodities | Crypto

Category guide:
- Markets: index moves, market-wide trends, daily market wrap, sector rotation
- Earnings: company earnings reports, revenue beats/misses, guidance updates
- Macro: central bank decisions, inflation, GDP, employment, interest rates, fiscal policy
- Analysis: analyst ratings, price targets, technical analysis, fund flows, research
- IPO: IPOs, SPACs, delistings, M&A, buybacks, spin-offs
- Commodities: oil, gold, silver, copper, wheat, natural gas, commodity indices
- Crypto: Bitcoin, Ethereum, altcoins, DeFi, stablecoins, crypto regulation

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional financial markets analyst. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 6000, temperature: 0.3 }
  );

  const jsonStr = extractJsonArray(raw);
  if (!jsonStr) throw new Error('No JSON array in AI response');
  const parsed = JSON.parse(jsonStr) as StockSummaryItem[];
  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');
  return parsed;
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] fetch-stocks-news started');
  const supabase = createAdminClient();
  const results: { source: string; inserted: number; skipped: number; error?: string }[] = [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingRows } = await supabase
    .from('stocks_news')
    .select('source_url')
    .gte('fetched_at', sevenDaysAgo);
  const existingUrls = new Set((existingRows ?? []).map(r => r.source_url).filter(Boolean));

  for (const source of STOCK_SOURCES) {
    try {
      console.log(`[fetch-stocks-news] Fetching ${source.name}…`);

      let items: StockRawItem[];
      try {
        items = await fetchSourceFeed(source.url);
      } catch (err) {
        console.error(`[fetch-stocks-news] Feed failed for ${source.key}:`, err);
        results.push({ source: source.key, inserted: 0, skipped: 0, error: String(err) });
        await sleep(400);
        continue;
      }

      const newItems = items.filter(item => item.newsUrl && !existingUrls.has(item.newsUrl));
      const skipped  = items.length - newItems.length;

      if (!newItems.length) {
        results.push({ source: source.key, inserted: 0, skipped, error: skipped ? undefined : 'No items in feed' });
        await sleep(400);
        continue;
      }

      // Fetch OG images for articles without RSS images (max 3)
      const noImageItems = newItems.filter(t => !t.imageUrl);
      if (noImageItems.length > 0) {
        const toFetch = noImageItems.slice(0, 3);
        const ogImages = await Promise.all(toFetch.map(t => fetchOGImage(t.newsUrl)));
        toFetch.forEach((t, i) => { if (ogImages[i]) t.imageUrl = ogImages[i]!; });
      }

      let summaries: StockSummaryItem[];
      try {
        summaries = await generateStockSummaries(source.name, source.countryName, source.langCode, source.langName, newItems);
      } catch (aiErr) {
        console.error(`[fetch-stocks-news] AI failed for ${source.key}, using fallback:`, aiErr);
        summaries = newItems.map(t => ({
          topic: t.topic,
          summary: t.snippets.join(' ').slice(0, 600) || `${t.topic} — latest market news.`,
          key_points: [],
          category: 'Markets',
        }));
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const rows = newItems.map((item, idx) => {
        const ai: StockSummaryItem = summaries[idx] ?? {
          topic: item.topic,
          summary: item.snippets.join(' ').slice(0, 600) || item.topic,
          key_points: [],
          category: 'Markets',
        };
        if (item.newsUrl) existingUrls.add(item.newsUrl);
        return {
          source_key:    source.key,
          source_name:   source.name,
          topic:         ai.topic || item.topic,
          summary:       ai.summary,
          key_points:    ai.key_points?.length ? ai.key_points : null,
          category:      ai.category || 'Markets',
          source_url:    item.newsUrl,
          source_title:  item.newsTitle || null,
          image_url:     item.imageUrl || null,
          fetched_at:    now.toISOString(),
          expires_at:    expiresAt.toISOString(),
          rank:          idx + 1,
          country_code:  source.countryCode,
          country_name:  source.countryName,
          language_code: source.langCode,
          language_name: source.langName,
        };
      });

      const { error: insertError } = await supabase.from('stocks_news').insert(rows);
      if (insertError) {
        console.error(`[fetch-stocks-news] Insert failed for ${source.key}:`, insertError);
        results.push({ source: source.key, inserted: 0, skipped, error: insertError.message });
      } else {
        results.push({ source: source.key, inserted: rows.length, skipped });
      }
    } catch (err) {
      results.push({ source: source.key, inserted: 0, skipped: 0, error: String(err) });
    }

    await sleep(400);
  }

  // Prune articles older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('stocks_news').delete().lt('fetched_at', thirtyDaysAgo);

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalSkipped  = results.reduce((sum, r) => sum + r.skipped, 0);
  console.log(`[fetch-stocks-news] Done. Inserted ${totalInserted}, skipped ${totalSkipped} duplicates.`);
  return NextResponse.json({ success: true, totalInserted, totalSkipped, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
