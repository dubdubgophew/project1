import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractJsonArray } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { AI_SOURCES, parseAIFeedRSS, type AIRawItem } from '@/lib/ai-news-utils';
import { fetchOGImage } from '@/lib/trending-utils';

export const maxDuration = 300;

// Cron: /api/cron/fetch-ai-news — schedule: 0 9 * * * (daily 9am UTC)
// Secured by CRON_SECRET in middleware.ts

interface AISummaryItem {
  topic: string;
  summary: string;
  category: string;
  key_points: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchSourceFeed(url: string): Promise<AIRawItem[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return parseAIFeedRSS(await res.text());
}

function cleanSnippet(snippet: string): string {
  return snippet
    .replace(/submitted by\s+\/u\/\S+\s+to\s+\/r\/\S+/gi, '')
    .replace(/\[link\]/gi, '').replace(/\[comments\]/gi, '')
    .replace(/\[score hidden\]/gi, '').replace(/\[\+?\d+\s+comments?\]/gi, '')
    .replace(/\s{2,}/g, ' ').trim();
}

async function generateAISummaries(
  sourceName: string,
  items: AIRawItem[],
  langCode: string,
  langName: string,
): Promise<AISummaryItem[]> {
  const topicsBlock = items
    .map((t, i) => {
      const raw = t.snippets.slice(0, 2).join(' ').slice(0, 400);
      const ctx = cleanSnippet(raw) || t.newsTitle;
      return `${i + 1}. Headline: "${t.topic}"\n   Context: ${ctx}`;
    })
    .join('\n\n');

  const langInstruction = langCode !== 'en'
    ? `\nIMPORTANT: Write "topic", "summary", and all "key_points" content in ${langName}. Keep "category" values in English.\n`
    : '';

  const prompt = `You are a senior AI industry analyst writing for ${sourceName}. For each headline, deliver a proper multi-angle analysis — not a description. Give readers real understanding of what this means for the AI field. Use your own knowledge to enrich context where provided snippets are thin.${langInstruction}

Produce a JSON array with exactly ${items.length} objects in the SAME ORDER.

Each object:
- "topic": restate the headline clearly (max 12 words)
- "summary": 230-270 words across 3 paragraphs:
  Para 1 — WHAT: Specific facts — what was announced/released/happened, key numbers, model names, benchmarks, company names.
  Para 2 — WHY: Why now? What drove this development? Technical context, competitive dynamics, funding, research trends.
  Para 3 — SO WHAT: Concrete impact on developers, businesses, or end users. Who wins, who is threatened, what shifts. End with a direct editorial take on the true significance for AI's trajectory.
- "key_points": exactly 5 strings, EACH in the format "emoji Label | content (max 20 words)":
  "📍 What Happened | [concise factual one-liner]"
  "💡 Why It Happened | [technical or strategic root cause]"
  "📈 Possible Upside | [who benefits, what opportunities open up]"
  "⚠️ Possible Downside | [risks, limitations, who is disrupted]"
  "🔮 Outlook | [what to watch — near-term and longer-term]"
- "category": exactly one of Tools | Research | Companies | Hardware | Learning | Open Source | Industry

Category guide:
- Tools: AI products, apps, APIs, comparisons, new releases
- Research: papers, breakthroughs, benchmarks, academic work
- Companies: funding rounds, acquisitions, partnerships, business news
- Hardware: GPUs, TPUs, chips, quantum computing, robotics, data centers
- Learning: tutorials, explainers, terminology, how-to guides, courses
- Open Source: open models, datasets, frameworks, GitHub releases
- Industry: enterprise AI, use cases, regulation, policy, AI services

Headlines:
${topicsBlock}

Respond ONLY with a valid JSON array. No markdown, no extra text.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'You are a professional AI industry analyst. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 4000, temperature: 0.35 }
  );

  const jsonStr = extractJsonArray(raw);
  if (!jsonStr) throw new Error('No JSON array in AI response');
  const parsed = JSON.parse(jsonStr) as AISummaryItem[];
  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');
  return parsed;
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] fetch-ai-news started');
  const supabase = createAdminClient();
  const results: { source: string; inserted: number; skipped: number; error?: string }[] = [];

  // Load all source_urls stored in the last 7 days to deduplicate
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingRows } = await supabase
    .from('ai_news')
    .select('source_url')
    .gte('fetched_at', sevenDaysAgo);
  const existingUrls = new Set((existingRows ?? []).map(r => r.source_url).filter(Boolean));

  for (const source of AI_SOURCES) {
    try {
      console.log(`[fetch-ai-news] Fetching ${source.name}…`);

      let items: AIRawItem[];
      try {
        items = await fetchSourceFeed(source.url);
      } catch (err) {
        console.error(`[fetch-ai-news] Feed failed for ${source.key}:`, err);
        results.push({ source: source.key, inserted: 0, skipped: 0, error: String(err) });
        await sleep(1000);
        continue;
      }

      // Skip articles whose source_url is already in the database
      const newItems = items.filter(item => item.newsUrl && !existingUrls.has(item.newsUrl));
      const skipped  = items.length - newItems.length;

      if (!newItems.length) {
        results.push({ source: source.key, inserted: 0, skipped, error: skipped ? undefined : 'No items in feed' });
        await sleep(1000);
        continue;
      }

      // Best-effort: fetch OG images for articles without RSS images (max 3, parallel)
      const noImageItems = newItems.filter(t => !t.imageUrl);
      if (noImageItems.length > 0) {
        const toFetch = noImageItems.slice(0, 3);
        const ogImages = await Promise.all(toFetch.map(t => fetchOGImage(t.newsUrl)));
        toFetch.forEach((t, i) => { if (ogImages[i]) t.imageUrl = ogImages[i]!; });
      }

      // Batch into groups of 4 so each call stays well under the token limit.
      const MAX_BATCH = 4;
      const summaries: AISummaryItem[] = [];
      for (let bStart = 0; bStart < newItems.length; bStart += MAX_BATCH) {
        const batch = newItems.slice(bStart, bStart + MAX_BATCH);
        try {
          const batchSummaries = await generateAISummaries(source.name, batch, source.langCode, source.langName);
          summaries.push(...batchSummaries);
        } catch (aiErr) {
          console.error(`[fetch-ai-news] AI failed batch ${bStart}-${bStart + batch.length} for ${source.key}:`, aiErr);
          summaries.push(...batch.map(t => ({
            topic: t.topic,
            summary: t.snippets.join(' ').slice(0, 600) || `${t.topic} — latest AI news.`,
            key_points: [] as string[],
            category: 'Industry',
          })));
        }
        if (bStart + MAX_BATCH < newItems.length) await sleep(800);
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const rows = newItems.map((item, idx) => {
        const ai: AISummaryItem = summaries[idx] ?? {
          topic: item.topic,
          summary: item.snippets.join(' ').slice(0, 600) || item.topic,
          key_points: [],
          category: 'Industry',
        };
        // Track newly inserted URLs so subsequent sources don't double-insert
        if (item.newsUrl) existingUrls.add(item.newsUrl);
        return {
          source_key:    source.key,
          source_name:   source.name,
          topic:         ai.topic || item.topic,
          summary:       ai.summary,
          key_points:    ai.key_points?.length ? ai.key_points : null,
          category:      ai.category || 'Industry',
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

      const { error: insertError } = await supabase.from('ai_news').insert(rows);
      if (insertError) {
        console.error(`[fetch-ai-news] Insert failed for ${source.key}:`, insertError);
        results.push({ source: source.key, inserted: 0, skipped, error: insertError.message });
      } else {
        results.push({ source: source.key, inserted: rows.length, skipped });
      }
    } catch (err) {
      results.push({ source: source.key, inserted: 0, skipped: 0, error: String(err) });
    }

    // Longer pause between sources to avoid Groq rate limits
    await sleep(2000);
  }

  // Prune articles older than 30 days to keep the database lean
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('ai_news').delete().lt('fetched_at', thirtyDaysAgo);

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalSkipped  = results.reduce((sum, r) => sum + r.skipped, 0);
  console.log(`[fetch-ai-news] Done. Inserted ${totalInserted}, skipped ${totalSkipped} duplicates.`);
  return NextResponse.json({ success: true, totalInserted, totalSkipped, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
