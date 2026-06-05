import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJsonArray } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';

export const maxDuration = 300;

// GET /api/admin/repair-summaries?secret=ADMIN_SECRET&table=ai_news&limit=30
// Finds articles with fallback one-liner summaries and re-generates proper analyses.

interface BadArticle {
  id: string;
  topic: string;
  source_name: string;
  language_code?: string;
  language_name?: string;
  category?: string;
}

interface RepairResult {
  topic: string;
  summary: string;
  key_points: string[];
  category: string;
}

async function repairBatch(articles: BadArticle[], table: 'ai_news' | 'trending_news'): Promise<RepairResult[]> {
  const isAI = table === 'ai_news';
  const langCode = articles[0]?.language_code ?? 'en';
  const langName = articles[0]?.language_name ?? 'English';

  const langInstruction = langCode !== 'en'
    ? `\nIMPORTANT: Write "topic", "summary", and all "key_points" content in ${langName}. Keep "category" values in English.\n`
    : '';

  const topicsBlock = articles
    .map((a, i) => `${i + 1}. Headline: "${a.topic}"\n   Source: ${a.source_name}`)
    .join('\n\n');

  const categoryGuide = isAI
    ? '- "category": exactly one of Tools | Research | Companies | Hardware | Learning | Open Source | Industry'
    : '- "category": exactly one of Sports | Tech | Politics | Entertainment | Business | Health | General';

  const prompt = `You are a senior analyst. For each headline, write a proper multi-angle analysis — not a description.${langInstruction}

Produce a JSON array with exactly ${articles.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly (max 12 words)
- "summary": 230-270 words across 3 paragraphs:
  Para 1 — WHAT: Specific facts — what happened, key details, names, numbers.
  Para 2 — WHY: Root causes, context, what drove this development.
  Para 3 — SO WHAT: Concrete impact on people, industry, or policy. Who wins, who loses. End with a direct editorial take on the significance.
- "key_points": exactly 5 strings, EACH in the format "emoji Label | content (max 20 words)":
  "📍 What Happened | [concise factual one-liner]"
  "💡 Why It Happened | [root cause or strategic reason]"
  "📈 Possible Upside | [who benefits, what opportunities open up]"
  "⚠️ Possible Downside | [risks, limitations, who is disrupted]"
  "🔮 Outlook | [what to watch — near-term and longer-term]"
${categoryGuide}

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional analyst. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 6000, temperature: 0.35 }
  );

  const jsonStr = extractJsonArray(raw);
  if (!jsonStr) throw new Error('No JSON array in repair response');
  const parsed = JSON.parse(jsonStr) as RepairResult[];
  if (!Array.isArray(parsed)) throw new Error('Repair response is not an array');
  return parsed;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const table = (searchParams.get('table') ?? 'ai_news') as 'ai_news' | 'trending_news';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 60);
  const dryRun = searchParams.get('dry') === '1';

  const supabase = createAdminClient();

  // Find articles with fallback one-liner summaries (short or matching known patterns)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const { data: bad, error: fetchErr } = await supabase
    .from(table)
    .select('id, topic, source_name, language_code, language_name, category')
    .gte('fetched_at', twoDaysAgo)
    .or('summary.like.%— latest AI news.%,summary.like.%— latest news from%,summary.like.%— AI update.%')
    .limit(limit);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!bad?.length) return NextResponse.json({ message: 'No bad articles found', repaired: 0 });

  if (dryRun) {
    return NextResponse.json({ message: 'Dry run', found: bad.length, articles: bad.map(a => a.topic) });
  }

  const BATCH = 3;
  let repaired = 0;
  const errors: string[] = [];

  for (let i = 0; i < bad.length; i += BATCH) {
    const batch = bad.slice(i, i + BATCH) as BadArticle[];
    try {
      const results = await repairBatch(batch, table);
      for (let j = 0; j < batch.length; j++) {
        const art = batch[j];
        const res = results[j];
        if (!art || !res?.summary || res.summary.length < 50) continue;
        const { error: upErr } = await supabase
          .from(table)
          .update({
            topic:      res.topic || art.topic,
            summary:    res.summary,
            key_points: res.key_points?.length ? res.key_points : null,
            category:   res.category || art.category,
          })
          .eq('id', art.id);
        if (upErr) errors.push(`${art.id}: ${upErr.message}`);
        else repaired++;
      }
    } catch (err) {
      errors.push(`Batch ${i}-${i + BATCH}: ${String(err)}`);
    }
    // small delay between batches
    await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({ success: true, found: bad.length, repaired, errors });
}
