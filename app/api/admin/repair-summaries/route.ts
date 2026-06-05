import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';

export const maxDuration = 300;

// GET /api/admin/repair-summaries?secret=ADMIN_SECRET&table=ai_news&limit=30
// GET /api/admin/repair-summaries?secret=ADMIN_SECRET&table=ai_news&debug=1  ← returns raw AI output

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

async function repairOne(article: BadArticle, isAI: boolean): Promise<RepairResult> {
  const langCode = article.language_code ?? 'en';
  const langName = article.language_name ?? 'English';
  const langNote = langCode !== 'en' ? ` Write the response in ${langName}.` : '';

  const categoryValues = isAI
    ? 'Tools | Research | Companies | Hardware | Learning | Open Source | Industry'
    : 'Sports | Tech | Politics | Entertainment | Business | Health | General';

  const prompt = `You are a senior analyst. Write a proper analysis for this news headline from ${article.source_name}.${langNote}

Headline: "${article.topic}"

Return a single JSON object (no array, no markdown):
{
  "topic": "restate headline clearly, max 12 words",
  "summary": "230-270 words across 3 paragraphs. Para 1: WHAT happened (specific facts, names, numbers). Para 2: WHY it happened (context, causes, motivations). Para 3: SO WHAT — concrete impact, who wins/loses, end with editorial opinion on true significance.",
  "key_points": [
    "📍 What Happened | one-line factual summary",
    "💡 Why It Happened | root cause or strategic reason",
    "📈 Possible Upside | who benefits and how",
    "⚠️ Possible Downside | risks, disruption, who loses",
    "🔮 Outlook | what to watch near-term and long-term"
  ],
  "category": "one of: ${categoryValues}"
}

Respond with ONLY the JSON object. No extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional analyst. Respond with a single valid JSON object only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 2000, temperature: 0.35 }
  );

  // Extract JSON object — find first { ... }
  const objStart = raw.indexOf('{');
  if (objStart === -1) throw new Error(`No JSON object in response. Raw: ${raw.slice(0, 200)}`);

  // Find the matching closing brace using balanced counting
  let depth = 0;
  let inString = false;
  let escape = false;
  let objEnd = -1;
  for (let i = objStart; i < raw.length; i++) {
    const c = raw[i];
    if (escape)            { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"')         { inString = !inString; continue; }
    if (inString)          continue;
    if (c === '{')         depth++;
    else if (c === '}')    { depth--; if (depth === 0) { objEnd = i; break; } }
  }
  if (objEnd === -1) throw new Error(`Unclosed JSON object. Raw: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(raw.slice(objStart, objEnd + 1)) as RepairResult;
  if (!parsed.summary || parsed.summary.length < 50) throw new Error('Summary too short');
  return parsed;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const table  = (searchParams.get('table') ?? 'ai_news') as 'ai_news' | 'trending_news';
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 60);
  const dryRun = searchParams.get('dry') === '1';
  const debug  = searchParams.get('debug') === '1';
  const isAI   = table === 'ai_news';

  const supabase = createAdminClient();

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
    return NextResponse.json({ found: bad.length, articles: bad.map((a: BadArticle) => a.topic) });
  }

  // Debug mode: test AI on first article, return raw response
  if (debug) {
    const art = bad[0] as BadArticle;
    const langNote = (art.language_code ?? 'en') !== 'en' ? ` Write in ${art.language_name}.` : '';
    const prompt = `You are a senior analyst. Write an analysis for this headline from ${art.source_name}.${langNote}\n\nHeadline: "${art.topic}"\n\nReturn a single JSON object with keys: topic, summary (230-270 words, 3 paragraphs), key_points (array of 5 strings), category.\n\nRespond with ONLY the JSON object.`;
    const raw = await callAI(
      [{ role: 'system', content: 'Respond with a single valid JSON object only.' }, { role: 'user', content: prompt }],
      { model: 'llama-3.3-70b-versatile', maxTokens: 2000, temperature: 0.35 }
    );
    return NextResponse.json({ article: art.topic, rawResponse: raw });
  }

  let repaired = 0;
  const errors: string[] = [];

  for (const art of bad as BadArticle[]) {
    try {
      const res = await repairOne(art, isAI);
      const { error: upErr } = await supabase
        .from(table)
        .update({
          topic:      res.topic || art.topic,
          summary:    res.summary,
          key_points: res.key_points?.length ? res.key_points : null,
          category:   res.category || art.category,
        })
        .eq('id', art.id);
      if (upErr) errors.push(`${art.topic.slice(0, 40)}: ${upErr.message}`);
      else repaired++;
    } catch (err) {
      errors.push(`${art.topic.slice(0, 40)}: ${String(err).slice(0, 120)}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json({ success: true, found: bad.length, repaired, errors });
}
