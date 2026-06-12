export interface ResearchPaper {
  id: string;
  arxiv_id: string | null;
  title: string;
  tldr: string | null;
  summary: string | null;
  key_findings: string[] | null;
  methodology: string | null;
  use_cases: string | null;
  breakthrough: string | null;
  impact_level: string;
  authors: string[];
  institution: string | null;
  journal: string | null;
  domain: string;
  subdomain: string | null;
  published_date: string | null;
  source_url: string;
  pdf_url: string | null;
  abstract: string | null;
  image_url: string | null;
  fetched_at: string;
  rank: number;
  source_key: string | null;
  source_name: string | null;
}

export interface RawResearchPaper {
  arxivId: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedDate: string;
  sourceUrl: string;
  pdfUrl: string;
  sourceKey: string;
  sourceName: string;
  domain: string;
  subdomain: string;
}

export const RESEARCH_DOMAINS = [
  { value: 'all',             label: '🔬 All Domains' },
  { value: 'AI & ML',         label: '🤖 AI & Machine Learning' },
  { value: 'CS',              label: '💻 Computer Science' },
  { value: 'Physics',         label: '⚛️ Physics' },
  { value: 'Biology',         label: '🧬 Biology & Medicine' },
  { value: 'Math',            label: '📐 Mathematics' },
  { value: 'Climate',         label: '🌍 Climate & Environment' },
  { value: 'Neuroscience',    label: '🧠 Neuroscience' },
  { value: 'Space',           label: '🚀 Space & Astronomy' },
  { value: 'Economics',       label: '💰 Economics & Finance' },
  { value: 'Chemistry',       label: '🧪 Chemistry & Materials' },
  { value: 'General Science', label: '📡 General Science' },
] as const;

export const DOMAIN_COLORS: Record<string, { bar: string; badge: string; glow: string; heading: string }> = {
  'AI & ML':         { bar: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-200',    glow: 'bg-violet-50 border-violet-100',  heading: 'text-violet-700' },
  'CS':              { bar: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200',          glow: 'bg-blue-50 border-blue-100',      heading: 'text-blue-700' },
  'Physics':         { bar: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200',             glow: 'bg-sky-50 border-sky-100',        heading: 'text-sky-700' },
  'Biology':         { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', glow: 'bg-emerald-50 border-emerald-100',heading: 'text-emerald-700' },
  'Math':            { bar: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200',    glow: 'bg-orange-50 border-orange-100',  heading: 'text-orange-700' },
  'Climate':         { bar: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 border-teal-200',          glow: 'bg-teal-50 border-teal-100',      heading: 'text-teal-700' },
  'Neuroscience':    { bar: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700 border-purple-200',    glow: 'bg-purple-50 border-purple-100',  heading: 'text-purple-700' },
  'Space':           { bar: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',    glow: 'bg-indigo-50 border-indigo-100',  heading: 'text-indigo-700' },
  'Economics':       { bar: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       glow: 'bg-amber-50 border-amber-100',    heading: 'text-amber-700' },
  'Chemistry':       { bar: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',          glow: 'bg-cyan-50 border-cyan-100',      heading: 'text-cyan-700' },
  'General Science': { bar: 'bg-stone-400',   badge: 'bg-stone-50 text-stone-600 border-stone-200',       glow: 'bg-stone-50 border-stone-100',    heading: 'text-stone-600' },
};

export const DOMAIN_EMOJIS: Record<string, string> = {
  'AI & ML':         '🤖',
  'CS':              '💻',
  'Physics':         '⚛️',
  'Biology':         '🧬',
  'Math':            '📐',
  'Climate':         '🌍',
  'Neuroscience':    '🧠',
  'Space':           '🚀',
  'Economics':       '💰',
  'Chemistry':       '🧪',
  'General Science': '📡',
};

export const IMPACT_STYLES: Record<string, { badge: string; dot: string }> = {
  'High Impact': { badge: 'bg-red-50 text-red-700 border-red-200',                dot: 'bg-red-500' },
  'Notable':     { badge: 'bg-amber-50 text-amber-700 border-amber-200',          dot: 'bg-amber-500' },
  'Emerging':    { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',    dot: 'bg-emerald-500' },
};

// arXiv RSS feeds — daily new submissions per category
export const ARXIV_SOURCES: Array<{ key: string; name: string; url: string; domain: string; subdomain: string }> = [
  { key: 'arxiv_ai',    name: 'arXiv · AI',          url: 'https://export.arxiv.org/rss/cs.AI',    domain: 'AI & ML',    subdomain: 'Artificial Intelligence' },
  { key: 'arxiv_lg',    name: 'arXiv · ML',          url: 'https://export.arxiv.org/rss/cs.LG',    domain: 'AI & ML',    subdomain: 'Machine Learning' },
  { key: 'arxiv_quant', name: 'arXiv · Quantum',     url: 'https://export.arxiv.org/rss/quant-ph', domain: 'Physics',    subdomain: 'Quantum Physics' },
  { key: 'arxiv_bio',   name: 'arXiv · Biology',     url: 'https://export.arxiv.org/rss/q-bio',    domain: 'Biology',    subdomain: 'Quantitative Biology' },
  { key: 'arxiv_econ',  name: 'arXiv · Economics',   url: 'https://export.arxiv.org/rss/econ',     domain: 'Economics',  subdomain: 'Economics' },
  { key: 'arxiv_astro', name: 'arXiv · Astrophysics',url: 'https://export.arxiv.org/rss/astro-ph', domain: 'Space',      subdomain: 'Astrophysics' },
];

function decodeXML(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g,           (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}

export function parseArxivRSS(
  xml: string,
  source: { key: string; name: string; domain: string; subdomain: string },
): RawResearchPaper[] {
  const papers: RawResearchPaper[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];

  for (const block of blocks.slice(0, 8)) {
    // Title — strip the "(arXiv:2506.07890v1 [cs.AI])" suffix arXiv appends
    const rawTitle = decodeXML(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const title = rawTitle.replace(/\s*\(arXiv:\S+\)\s*$/, '').trim();
    if (!title || title.length < 10) continue;

    // URL — from <link> or rdf:about
    const link = (
      block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ??
      block.match(/rdf:about="([^"]+)"/)?.[1] ??
      block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ?? ''
    ).trim();
    if (!link.includes('arxiv.org')) continue;

    const arxivId = link.match(/arxiv\.org\/abs\/([0-9]{4}\.\d+)/)?.[1] ?? '';
    if (!arxivId) continue;

    // Abstract from <description>
    const rawDesc = block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? '';
    const abstract = decodeXML(rawDesc)
      .replace(/^Abstract:\s*/i, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 900);
    if (!abstract || abstract.length < 50) continue;

    // Authors
    const authorRaw = decodeXML(
      block.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1] ??
      block.match(/<author>([\s\S]*?)<\/author>/)?.[1] ?? '',
    );
    const authors = authorRaw
      .replace(/<[^>]+>/g, ' ')
      .split(/[,;]\s*/)
      .map(a => a.trim())
      .filter(a => a.length > 2)
      .slice(0, 5);

    const publishedDate = (
      block.match(/<dc:date>([\s\S]*?)<\/dc:date>/)?.[1] ??
      block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? ''
    ).trim().slice(0, 10);

    papers.push({
      arxivId, title, abstract, authors, publishedDate,
      sourceUrl: link,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
      sourceKey: source.key,
      sourceName: source.name,
      domain: source.domain,
      subdomain: source.subdomain,
    });
  }

  return papers;
}
