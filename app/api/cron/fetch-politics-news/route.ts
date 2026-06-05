import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJsonArray } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { parseStandardRSS, fetchOGImage, type RawTrendItem } from '@/lib/trending-utils';

export const maxDuration = 300;

// Cron: /api/cron/fetch-politics-news — schedule: 0 13 * * * (daily 1pm UTC)
// Dedicated political RSS feeds to bulk up politics category in trending_news.

const POLITICS_FEEDS = [
  // English
  { key: 'US_NPR_POL',  countryCode: 'US', countryName: 'United States',  langCode: 'en', langName: 'English',    url: 'https://feeds.npr.org/1014/rss.xml',                                                              name: 'NPR Politics' },
  { key: 'US_HILL',     countryCode: 'US', countryName: 'United States',  langCode: 'en', langName: 'English',    url: 'https://thehill.com/news/feed/',                                                                  name: 'The Hill' },
  { key: 'GB_BBC_POL',  countryCode: 'GB', countryName: 'United Kingdom', langCode: 'en', langName: 'English',    url: 'https://feeds.bbci.co.uk/news/politics/rss.xml',                                                  name: 'BBC Politics' },
  { key: 'IN_WIRE',     countryCode: 'IN', countryName: 'India',          langCode: 'en', langName: 'English',    url: 'https://thewire.in/politics/feed',                                                                name: 'The Wire' },
  { key: 'IN_NDTV_POL', countryCode: 'IN', countryName: 'India',          langCode: 'en', langName: 'English',    url: 'https://feeds.feedburner.com/ndtvnews-politics',                                                  name: 'NDTV Politics' },
  { key: 'CA_CBC_POL',  countryCode: 'CA', countryName: 'Canada',         langCode: 'en', langName: 'English',    url: 'https://www.cbc.ca/cmlink/rss-politics',                                                          name: 'CBC Politics' },
  { key: 'AU_ABC_POL',  countryCode: 'AU', countryName: 'Australia',      langCode: 'en', langName: 'English',    url: 'https://www.abc.net.au/news/politics/feed/51940/rss.xml',                                         name: 'ABC Politics' },
  { key: 'EU_EURACT',   countryCode: 'DE', countryName: 'Europe',         langCode: 'en', langName: 'English',    url: 'https://www.euractiv.com/feed/',                                                                  name: 'Euractiv' },
  { key: 'GL_AJ',       countryCode: 'AE', countryName: 'Global',         langCode: 'en', langName: 'English',    url: 'https://www.aljazeera.com/xml/rss/all.xml',                                                       name: 'Al Jazeera' },
  { key: 'GL_REUTERS',  countryCode: 'US', countryName: 'United States',  langCode: 'en', langName: 'English',    url: 'https://feeds.reuters.com/Reuters/PoliticsNews',                                                  name: 'Reuters Politics' },
  // French
  { key: 'FR_LEMONDE',  countryCode: 'FR', countryName: 'France',         langCode: 'fr', langName: 'French',     url: 'https://www.lemonde.fr/politique/rss_full.xml',                                                   name: 'Le Monde Politique' },
  { key: 'FR_F24',      countryCode: 'FR', countryName: 'France',         langCode: 'fr', langName: 'French',     url: 'https://www.france24.com/fr/france/rss',                                                          name: 'France 24' },
  // German
  { key: 'DE_SPIEGEL',  countryCode: 'DE', countryName: 'Germany',        langCode: 'de', langName: 'German',     url: 'https://www.spiegel.de/politik/index.rss',                                                        name: 'Der Spiegel' },
  { key: 'DE_ZEIT',     countryCode: 'DE', countryName: 'Germany',        langCode: 'de', langName: 'German',     url: 'https://newsfeed.zeit.de/politik/index',                                                          name: 'Zeit Online' },
  // Spanish
  { key: 'ES_ELPAIS',   countryCode: 'ES', countryName: 'Spain',          langCode: 'es', langName: 'Spanish',    url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/politica/portada',               name: 'El País Política' },
  { key: 'ES_ELMUNDO',  countryCode: 'ES', countryName: 'Spain',          langCode: 'es', langName: 'Spanish',    url: 'https://e00-elmundo.uecdn.es/elmundo/rss/espana.xml',                                             name: 'El Mundo España' },
  // Portuguese
  { key: 'BR_FOLHA',    countryCode: 'BR', countryName: 'Brazil',         langCode: 'pt', langName: 'Portuguese', url: 'https://feeds.folha.uol.com.br/poder/rss091.xml',                                                 name: 'Folha Poder' },
  { key: 'BR_G1',       countryCode: 'BR', countryName: 'Brazil',         langCode: 'pt', langName: 'Portuguese', url: 'https://g1.globo.com/rss/g1/politica/',                                                           name: 'G1 Política' },
];

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function generatePoliticsSummaries(sourceName: string, country: string, langCode: string, langName: string, items: RawTrendItem[]) {
  const topicsBlock = items
    .map((t, i) => {
      const ctx = t.snippets.slice(0, 2).join(' ').slice(0, 400) || t.newsTitle;
      return `${i + 1}. Headline: "${t.topic}"\n   Context: ${ctx}`;
    })
    .join('\n\n');

  const langNote = langCode !== 'en' ? ` Write ALL output (topic, summary, key_points) in ${langName}.` : '';

  const prompt = `You are a senior political analyst covering ${country} politics. Your reader is an educated global audience. For each headline, deliver a proper analytical piece — not a summary. Give real understanding of the political dynamics at play.${langNote}

Each object in your JSON array:
- "topic": restate headline clearly (max 12 words)
- "summary": 230-270 words across 3 paragraphs:
  Para 1 — WHAT: Specific facts — what happened, key actors, dates, policy details, vote counts, or quotes.
  Para 2 — WHY: Political causes — what drove this event? Party dynamics, public pressure, historical context, international factors.
  Para 3 — SO WHAT: Real impact on citizens, governance, opposition, or international relations. Who benefits politically, who is weakened, what policy shifts. End with a direct editorial assessment of the political significance.
- "key_points": exactly 5 strings, EACH in the format "emoji Label | content (max 20 words)":
  "📍 What Happened | [factual political one-liner]"
  "💡 Why It Happened | [political cause or context]"
  "📈 Possible Upside | [who benefits, positive outcomes for governance/citizens]"
  "⚠️ Possible Downside | [risks, opposition, who loses, democratic concerns]"
  "🔮 Outlook | [what to watch — upcoming elections, legislation, or fallout]"
- "category": always "Politics"

Headlines:
${topicsBlock}

Return ONLY a valid JSON array with exactly ${items.length} objects. No markdown.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional political analyst. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 6000, temperature: 0.3 }
  );

  const jsonStr = extractJsonArray(raw);
  if (!jsonStr) throw new Error('No JSON array in response');
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) throw new Error('Response is not an array');
  return parsed as { topic: string; summary: string; key_points: string[]; category: string }[];
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] fetch-politics-news started');
  const supabase = createAdminClient();
  const results: { key: string; inserted: number; skipped: number; error?: string }[] = [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingRows } = await supabase
    .from('trending_news')
    .select('source_url')
    .gte('fetched_at', sevenDaysAgo)
    .eq('category', 'Politics');
  const existingUrls = new Set((existingRows ?? []).map(r => r.source_url).filter(Boolean));

  for (const feed of POLITICS_FEEDS) {
    try {
      console.log(`[fetch-politics-news] Fetching ${feed.key}…`);

      let items: RawTrendItem[];
      try {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          next: { revalidate: 0 },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        items = parseStandardRSS(await res.text(), feed.name, 8);
      } catch (err) {
        console.error(`[fetch-politics-news] Feed failed for ${feed.key}:`, err);
        results.push({ key: feed.key, inserted: 0, skipped: 0, error: String(err) });
        await sleep(300);
        continue;
      }

      const newItems = items.filter(t => t.newsUrl && !existingUrls.has(t.newsUrl));
      const skipped  = items.length - newItems.length;

      if (!newItems.length) {
        results.push({ key: feed.key, inserted: 0, skipped, error: skipped ? undefined : 'No items' });
        await sleep(300);
        continue;
      }

      // Best-effort: fetch OG images for articles without RSS images (max 3, parallel)
      const noImageItems = newItems.filter(t => !t.imageUrl);
      if (noImageItems.length > 0) {
        const toFetch = noImageItems.slice(0, 3);
        const ogImages = await Promise.all(toFetch.map(t => fetchOGImage(t.newsUrl)));
        toFetch.forEach((t, i) => { if (ogImages[i]) t.imageUrl = ogImages[i]!; });
      }

      let summaries: { topic: string; summary: string; key_points: string[]; category: string }[];
      try {
        summaries = await generatePoliticsSummaries(feed.name, feed.countryName, feed.langCode, feed.langName, newItems);
      } catch (aiErr) {
        console.error(`[fetch-politics-news] AI failed for ${feed.key}:`, aiErr);
        summaries = newItems.map(t => ({
          topic: t.topic,
          summary: t.snippets.join(' ').slice(0, 600) || t.topic,
          key_points: [],
          category: 'Politics',
        }));
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const rows = newItems.map((item, idx) => {
        const ai = summaries[idx] ?? { topic: item.topic, summary: item.snippets.join(' ').slice(0, 600) || item.topic, key_points: [], category: 'Politics' };
        if (item.newsUrl) existingUrls.add(item.newsUrl);
        return {
          country_code:   feed.countryCode,
          country_name:   feed.countryName,
          topic:          ai.topic || item.topic,
          summary:        ai.summary,
          key_points:     ai.key_points?.length ? ai.key_points : null,
          traffic_volume: null,
          category:       'Politics',
          source_url:     item.newsUrl,
          source_name:    item.newsSource,
          source_title:   item.newsTitle || null,
          image_url:      item.imageUrl || null,
          fetched_at:     now.toISOString(),
          expires_at:     expiresAt.toISOString(),
          rank:           idx + 1,
          language_code:  feed.langCode,
          language_name:  feed.langName,
        };
      });

      const { error: insertError } = await supabase.from('trending_news').insert(rows);
      if (insertError) {
        results.push({ key: feed.key, inserted: 0, skipped, error: insertError.message });
      } else {
        results.push({ key: feed.key, inserted: rows.length, skipped });
      }
    } catch (err) {
      results.push({ key: feed.key, inserted: 0, skipped: 0, error: String(err) });
    }
    await sleep(300);
  }

  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  const totalSkipped  = results.reduce((s, r) => s + r.skipped, 0);
  console.log(`[fetch-politics-news] Done. Inserted ${totalInserted}, skipped ${totalSkipped}.`);
  return NextResponse.json({ success: true, totalInserted, totalSkipped, results });
}

export async function GET(req: NextRequest) { return POST(req); }
