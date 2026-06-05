import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';

export const maxDuration = 300;

// GET /api/admin/repair-summaries?secret=ADMIN_SECRET&table=ai_news&limit=30
// Finds articles with one-liner fallback summaries and re-generates proper analyses.

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

function extractSection(raw: string, tag: string): string {
  const re = new RegExp(`===\\s*${tag}\\s*===\\s*([\\s\\S]*?)(?:===|$)`, 'i');
  return raw.match(re)?.[1]?.trim() ?? '';
}

async function repairOne(article: BadArticle, isAI: boolean): Promise<RepairResult> {
  const langCode = article.language_code ?? 'en';
  const langName = article.language_name ?? 'English';
  const langNote = langCode !== 'en' ? ` Write ALL output in ${langName}.` : '';
  const categoryValues = isAI
    ? 'Tools | Research | Companies | Hardware | Learning | Open Source | Industry'
    : 'Sports | Tech | Politics | Entertainment | Business | Health | General';

  const prompt = `You are a senior analyst. Write a proper multi-angle analysis for this headline from ${article.source_name}.${langNote}

Headline: "${article.topic}"

Output EXACTLY this format with the === delimiters. Do not add any other text.

===TOPIC===
Restate the headline clearly (max 12 words)
===SUMMARY===
Paragraph 1 (WHAT): Specific facts — what happened, key names, numbers, dates.

Paragraph 2 (WHY): Root causes, context, what drove this development.

Paragraph 3 (SO WHAT): Concrete impact on people, industry, or society. Who wins, who loses. End with your editorial take on the true significance.
===KEY1===
📍 What Happened | one-line factual summary (max 20 words)
===KEY2===
💡 Why It Happened | root cause or strategic reason (max 20 words)
===KEY3===
📈 Possible Upside | who benefits and how (max 20 words)
===KEY4===
⚠️ Possible Downside | risks or who loses out (max 20 words)
===KEY5===
🔮 Outlook | what to watch near-term and long-term (max 20 words)
===CATEGORY===
${categoryValues}`;

  const raw = await callAI(
    [
      { role: 'system', content: `You are a professional analyst. Follow the output format exactly. Write exactly 3 paragraphs in ===SUMMARY===, each separated by a blank line.${langCode !== 'en' ? ` Write in ${langName}.` : ''}` },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 1500, temperature: 0.35 }
  );

  const topic    = extractSection(raw, 'TOPIC')    || article.topic;
  const summary  = extractSection(raw, 'SUMMARY');
  const key1     = extractSection(raw, 'KEY1');
  const key2     = extractSection(raw, 'KEY2');
  const key3     = extractSection(raw, 'KEY3');
  const key4     = extractSection(raw, 'KEY4');
  const key5     = extractSection(raw, 'KEY5');
  const category = extractSection(raw, 'CATEGORY').split('|')[0].trim() || article.category || 'Industry';

  if (!summary || summary.length < 50) {
    throw new Error(`Summary too short (${summary.length} chars). Raw: ${raw.slice(0, 300)}`);
  }

  const key_points = [key1, key2, key3, key4, key5].filter(Boolean);

  return { topic, summary, key_points, category };
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

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all recent articles with summary + key_points and filter client-side
  const { data: all, error: fetchErr } = await supabase
    .from(table)
    .select('id, topic, source_name, language_code, language_name, category, summary, key_points')
    .gte('fetched_at', sevenDaysAgo)
    .limit(200);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const bad = ((all ?? []) as (BadArticle & { summary: string; key_points: unknown })[]).filter(a =>
    !a.summary ||
    a.summary.length < 200 ||
    !a.key_points ||
    (Array.isArray(a.key_points) && a.key_points.length === 0) ||
    a.summary.includes('— latest AI news.') ||
    a.summary.includes('— latest news from') ||
    a.summary.includes('— AI update.') ||
    a.summary.trim() === a.topic?.trim()
  ).slice(0, limit);
  if (!bad?.length) return NextResponse.json({ message: 'No bad articles found', repaired: 0 });

  if (dryRun) {
    return NextResponse.json({ found: bad.length, articles: bad.map((a: BadArticle) => a.topic) });
  }

  // Debug: show raw AI output for first article
  if (debug) {
    const art = bad[0] as BadArticle;
    const res = await repairOne(art, isAI);
    return NextResponse.json({ article: art.topic, result: res });
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
          key_points: res.key_points.length ? res.key_points : null,
          category:   res.category || art.category,
        })
        .eq('id', art.id);
      if (upErr) errors.push(`${art.topic.slice(0, 40)}: ${upErr.message}`);
      else repaired++;
    } catch (err) {
      errors.push(`${art.topic.slice(0, 40)}: ${String(err).slice(0, 150)}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  return NextResponse.json({ success: true, found: bad.length, repaired, errors });
}
