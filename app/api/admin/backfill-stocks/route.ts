import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJsonArray } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { type StockNewsItem } from '@/lib/stocks-utils';

export const maxDuration = 300;

// GET /api/admin/backfill-stocks?secret=ADMIN_SECRET&limit=60
// Regenerates AI summaries for stock news records that have null key_points.

interface StockSummaryItem {
  topic: string;
  summary: string;
  category: string;
  key_points: string[];
}

async function regenerateSummaries(
  sourceName: string,
  countryName: string,
  langCode: string,
  langName: string,
  items: { id: string; topic: string; summary: string; source_title: string | null }[],
): Promise<(StockSummaryItem & { id: string })[]> {
  const langNote = langCode !== 'en'
    ? `\nIMPORTANT: Write "topic", "summary", and all "key_points" content in ${langName}. Keep "category" values in English.\n`
    : '';

  const topicsBlock = items
    .map((t, i) => {
      const ctx = (t.source_title || t.topic) + (t.summary ? `\n   Context: ${t.summary.slice(0, 300)}` : '');
      return `${i + 1}. Headline: "${t.source_title || t.topic}"\n   ${ctx}`;
    })
    .join('\n\n');

  const prompt = `You are a senior financial markets analyst writing for ${sourceName} (${countryName}). For each headline, deliver a rigorous market-focused analysis.${langNote}

Produce a JSON array with exactly ${items.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly as a market-relevant title (max 12 words)
- "summary": 230-270 words across 3 paragraphs:
  Para 1 — WHAT: Specific facts — what happened, key numbers, company/ticker names, index moves, prices, percentages.
  Para 2 — WHY: What drove this? Macro context, earnings drivers, policy changes, technical levels, sector dynamics.
  Para 3 — SO WHAT: Who wins and who loses? Concrete investment takeaway and forward-looking view.
- "key_points": exactly 5 strings, EACH in the format "emoji Label | content (max 20 words)":
  "📍 What Happened | [concise factual one-liner with key numbers]"
  "💰 Market Impact | [immediate effect on prices, indices, or sectors]"
  "📈 Bull Case | [who benefits, what could push prices higher]"
  "📉 Bear Case | [risks, headwinds, what could go wrong]"
  "🔮 What to Watch | [key upcoming events, levels, catalysts]"
- "category": exactly one of Markets | Earnings | Macro | Analysis | IPO | Commodities | Crypto

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional financial markets analyst. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 6000, temperature: 0.3, skipCache: true }
  );

  const jsonStr = extractJsonArray(raw);
  if (!jsonStr) throw new Error('No JSON array in AI response');
  const parsed = JSON.parse(jsonStr) as StockSummaryItem[];
  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');

  return parsed.map((s, i) => ({ ...s, id: items[i].id }));
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Math.min(parseInt(searchParams.get('limit') ?? '60', 10), 120);
  const supabase = createAdminClient();

  const { data: records, error } = await supabase
    .from('stocks_news')
    .select('id,source_key,source_name,topic,summary,source_title,country_name,language_code,language_name')
    .is('key_points', null)
    .order('fetched_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!records?.length) return NextResponse.json({ message: 'Nothing to backfill', updated: 0 });

  // Group by source so the AI prompt gets context-coherent batches
  const bySource = new Map<string, typeof records>();
  for (const r of records) {
    const key = `${r.source_key}||${r.language_code}`;
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key)!.push(r);
  }

  const MAX_BATCH = 6;
  let updated = 0;
  const errors: string[] = [];

  for (const [, group] of bySource) {
    const first = group[0] as StockNewsItem & { source_key: string };
    const sourceName   = first.source_name;
    const countryName  = first.country_name;
    const langCode     = first.language_code;
    const langName     = first.language_name;

    for (let bStart = 0; bStart < group.length; bStart += MAX_BATCH) {
      const batch = group.slice(bStart, bStart + MAX_BATCH) as {
        id: string; topic: string; summary: string; source_title: string | null;
      }[];

      try {
        const results = await regenerateSummaries(sourceName, countryName, langCode, langName, batch);

        for (const r of results) {
          const { error: upErr } = await supabase
            .from('stocks_news')
            .update({ topic: r.topic, summary: r.summary, key_points: r.key_points, category: r.category })
            .eq('id', r.id);
          if (upErr) errors.push(`${r.id}: ${upErr.message}`);
          else updated++;
        }
      } catch (err) {
        errors.push(`batch ${bStart}-${bStart + batch.length}: ${String(err)}`);
      }

      if (bStart + MAX_BATCH < group.length) await sleep(800);
    }

    await sleep(400);
  }

  return NextResponse.json({ updated, skipped: records.length - updated, errors });
}
