import { NextRequest, NextResponse } from 'next/server';
import { callAI, sanitizeJsonString } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { ARXIV_SOURCES, parseArxivRSS, type RawResearchPaper } from '@/lib/research-utils';

export const maxDuration = 300;

// Cron: /api/cron/fetch-research-papers — schedule: 0 12 * * * (daily noon UTC)
// Secured by CRON_SECRET in middleware.ts

interface PaperAISummary {
  tldr: string;
  summary: string;
  key_findings: string[];
  methodology: string;
  use_cases: string;
  breakthrough: string;
  impact_level: string;
  domain: string;
  subdomain: string;
  institution: string | null;
  authors_list: string[];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (esc)               { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"')         { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return sanitizeJsonString(raw.slice(start, i + 1)); }
  }
  return null;
}

async function fetchArxivFeed(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Formly-ResearchBot/1.0 (https://formly.tools)',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

async function selectTopPapers(candidates: RawResearchPaper[]): Promise<number[]> {
  if (candidates.length <= 3) return candidates.map((_, i) => i);

  // Send compressed list — title + 100-char abstract per paper
  const list = candidates
    .map((p, i) =>
      `${i}. [${p.domain}] "${p.title.slice(0, 90)}"\n   ${p.abstract.slice(0, 100).replace(/\n/g, ' ')}…`
    )
    .join('\n\n');

  const prompt = `Science editor task: From these ${candidates.length} new arXiv papers, select EXACTLY 3 that are:
1. Highest real-world scientific significance and novelty
2. From DIFFERENT domains (mandatory: at least 2 distinct domain groups)
3. Most accessible + interesting to educated non-specialists

Papers:
${list}

Respond ONLY with JSON: {"selected":[idx1,idx2,idx3]}`;

  try {
    const raw = await callAI(
      [
        { role: 'system', content: 'Science editor. Respond only with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      { model: 'llama-3.3-70b-versatile', maxTokens: 80, temperature: 0.2, skipCache: true },
    );
    const obj = extractJsonObject(raw);
    if (!obj) return [0, 1, 2];
    const parsed = JSON.parse(obj);
    const sel: number[] = (parsed.selected ?? []).filter(
      (n: unknown) => typeof n === 'number' && n >= 0 && n < candidates.length,
    );
    return sel.length >= 3 ? sel.slice(0, 3) : [0, 1, 2];
  } catch {
    return [0, 1, 2];
  }
}

async function generatePaperSummary(paper: RawResearchPaper): Promise<PaperAISummary> {
  const authorsText = paper.authors.slice(0, 4).join(', ') || 'Unknown authors';

  const prompt = `You are a research scientist who explains breakthrough papers to intelligent non-specialists — engineers, doctors, teachers, business leaders. Make readers understand, marvel at, and remember this research.

Paper Title: "${paper.title}"
Authors: ${authorsText}
Domain: ${paper.domain} / ${paper.subdomain}
Abstract: ${paper.abstract}

Generate a JSON object with EXACTLY these fields:

- "tldr": One powerful sentence (max 28 words) capturing the core discovery in plain language
- "summary": Exactly 3 paragraphs, 250-300 total words:
    Para 1 (WHAT): What problem/question does this tackle? Explain in simple terms what the research is about and why it matters.
    Para 2 (HOW): What novel method or approach did they use? What makes it scientifically interesting or technically significant?
    Para 3 (SO WHAT): What did they find or achieve? Why should the world care — both inside and outside academia?
- "key_findings": Array of EXACTLY 5 strings. Each must be in this exact format "emoji Label | content (max 20 words)":
    "🔬 The Research | [one-line description of what it studies]"
    "💡 Key Discovery | [main result — include specific numbers or metrics if available]"
    "🎯 Real-World Use | [concrete applications outside the lab]"
    "🔮 Future Potential | [what this enables in 5-10 years; implications]"
    "👥 Who Benefits | [specific people, industries, or fields that gain from this]"
- "methodology": 2-3 sentences describing their approach in plain, accessible language (define any jargon)
- "use_cases": 2-3 sentences on specific real-world applications and industries this affects
- "breakthrough": 1-2 sentences on what is genuinely new — what could NOT be done before this paper
- "impact_level": exactly one of "High Impact" | "Notable" | "Emerging"
- "domain": most accurate from: AI & ML, CS, Physics, Biology, Math, Climate, Neuroscience, Space, Economics, Chemistry, General Science
- "subdomain": specific subfield (e.g. "Large Language Models", "Drug Discovery", "Quantum Error Correction", "Dark Matter")
- "institution": primary institution/university/company of lead author (null if unclear)
- "authors_list": first 3 author names as array of strings

Respond ONLY with valid JSON. No markdown, no preamble, no explanation.`;

  const raw = await callAI(
    [
      { role: 'system', content: 'Research scientist. Always respond with valid JSON only. No markdown.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.3-70b-versatile', maxTokens: 3000, temperature: 0.3, skipCache: true },
  );

  const obj = extractJsonObject(raw);
  if (!obj) throw new Error('No JSON in AI response');

  const parsed = JSON.parse(obj) as PaperAISummary;
  if (!parsed.tldr || !parsed.summary) throw new Error('Incomplete AI summary');

  if (!Array.isArray(parsed.key_findings))  parsed.key_findings = [];
  if (!Array.isArray(parsed.authors_list))  parsed.authors_list = paper.authors.slice(0, 3);

  return parsed;
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] fetch-research-papers started');
  const supabase = createAdminClient();

  // Load already-seen arxiv IDs (last 30 days) to avoid duplicates
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingRows } = await supabase
    .from('research_papers')
    .select('arxiv_id')
    .gte('fetched_at', thirtyDaysAgo);
  const seenIds = new Set((existingRows ?? []).map(r => r.arxiv_id).filter(Boolean));

  // Step 1 — Collect candidates from all arXiv sources
  const allCandidates: RawResearchPaper[] = [];

  for (const source of ARXIV_SOURCES) {
    try {
      console.log(`[research] Fetching ${source.name}…`);
      const xml = await fetchArxivFeed(source.url);
      const papers = parseArxivRSS(xml, source).filter(p => !seenIds.has(p.arxivId));
      allCandidates.push(...papers.slice(0, 5));
    } catch (err) {
      console.error(`[research] Feed failed for ${source.key}:`, err);
    }
    await sleep(300);
  }

  console.log(`[research] ${allCandidates.length} new candidates after dedup`);

  if (allCandidates.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, message: 'No new papers today' });
  }

  // Step 2 — AI selects top 3 most impactful + domain-diverse papers
  let selectedIndices: number[];
  try {
    selectedIndices = await selectTopPapers(allCandidates);
  } catch (err) {
    console.error('[research] Selection failed, using first 3:', err);
    selectedIndices = [0, 1, Math.min(2, allCandidates.length - 1)];
  }

  const selectedPapers = selectedIndices
    .map(i => allCandidates[i])
    .filter(Boolean)
    .slice(0, 3);

  console.log(`[research] Generating summaries for ${selectedPapers.length} papers`);

  // Step 3 — Generate detailed AI summaries and insert to DB
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  let inserted = 0;

  for (let i = 0; i < selectedPapers.length; i++) {
    const paper = selectedPapers[i];
    let ai: PaperAISummary;

    try {
      ai = await generatePaperSummary(paper);
    } catch (err) {
      console.error(`[research] Summary failed for "${paper.title}":`, err);
      ai = {
        tldr: paper.title.slice(0, 120),
        summary: paper.abstract.slice(0, 600),
        key_findings: [],
        methodology: '',
        use_cases: '',
        breakthrough: '',
        impact_level: 'Notable',
        domain: paper.domain,
        subdomain: paper.subdomain,
        institution: null,
        authors_list: paper.authors.slice(0, 3),
      };
    }

    const row = {
      arxiv_id:      paper.arxivId,
      title:         paper.title,
      tldr:          ai.tldr,
      summary:       ai.summary,
      key_findings:  ai.key_findings?.length ? ai.key_findings : null,
      methodology:   ai.methodology   || null,
      use_cases:     ai.use_cases     || null,
      breakthrough:  ai.breakthrough  || null,
      impact_level:  ai.impact_level  || 'Notable',
      authors:       (ai.authors_list?.length ? ai.authors_list : paper.authors).slice(0, 5),
      institution:   ai.institution   || null,
      domain:        ai.domain        || paper.domain,
      subdomain:     ai.subdomain     || paper.subdomain,
      published_date:paper.publishedDate || null,
      source_url:    paper.sourceUrl,
      pdf_url:       paper.pdfUrl,
      abstract:      paper.abstract,
      fetched_at:    now.toISOString(),
      expires_at:    expiresAt.toISOString(),
      rank:          i + 1,
      source_key:    paper.sourceKey,
      source_name:   paper.sourceName,
    };

    const { error } = await supabase.from('research_papers').insert(row);
    if (error) {
      console.error(`[research] Insert failed for "${paper.title}":`, error.message);
    } else {
      seenIds.add(paper.arxivId);
      inserted++;
      console.log(`[research] Inserted: "${paper.title.slice(0, 60)}…"`);
    }

    if (i < selectedPapers.length - 1) await sleep(1000);
  }

  // Prune expired papers
  await supabase.from('research_papers').delete().lt('fetched_at', thirtyDaysAgo);

  console.log(`[research] Done. Inserted ${inserted}/${selectedPapers.length} papers.`);
  return NextResponse.json({ success: true, inserted, candidates: allCandidates.length });
}

export async function GET(req: NextRequest) { return POST(req); }
