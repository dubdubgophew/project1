'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronDown, ChevronUp, ExternalLink, FileText,
  Search, Clock, TrendingUp, X, BookOpen,
} from 'lucide-react';
import { InArticleAd } from '@/components/shared/AdSense';
import {
  type ResearchPaper,
  RESEARCH_DOMAINS,
  DOMAIN_COLORS,
  DOMAIN_EMOJIS,
  IMPACT_STYLES,
} from '@/lib/research-utils';

interface ResearchFeedProps {
  initialItems: ResearchPaper[];
  initialDomain: string;
  initialImpact: string;
  initialQ: string;
  lastUpdated: string | null;
}

const IMPACT_FILTERS = [
  { value: 'all',         label: 'All Impact' },
  { value: 'High Impact', label: '🔴 High Impact' },
  { value: 'Notable',     label: '🟠 Notable' },
  { value: 'Emerging',    label: '🟢 Emerging' },
];

function parseKeyFinding(finding: string): { label: string; content: string } {
  const idx = finding.indexOf(' | ');
  if (idx !== -1) {
    return { label: finding.slice(0, idx).trim(), content: finding.slice(idx + 3).trim() };
  }
  return { label: '', content: finding };
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PaperCard({ paper }: { paper: ResearchPaper }) {
  const [expanded, setExpanded] = useState(false);

  const colors    = DOMAIN_COLORS[paper.domain]       ?? DOMAIN_COLORS['General Science'];
  const impactSt  = IMPACT_STYLES[paper.impact_level] ?? IMPACT_STYLES['Notable'];
  const emoji     = DOMAIN_EMOJIS[paper.domain]       ?? '🔬';
  const paragraphs = (paper.summary ?? '').split(/\n\n+/).filter(p => p.trim().length > 0);
  const authorsShown  = (paper.authors ?? []).slice(0, 3);
  const extraAuthors  = Math.max(0, (paper.authors ?? []).length - 3);

  return (
    <article
      className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      aria-label={paper.title}
    >
      {/* Domain accent bar */}
      <div className={`h-1.5 ${colors.bar}`} />

      <div className="p-5 sm:p-6">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.badge}`}>
            {emoji} {paper.domain}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${impactSt.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${impactSt.dot}`} />
            {paper.impact_level}
          </span>
          {paper.subdomain && (
            <span className="text-xs text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full">
              {paper.subdomain}
            </span>
          )}
          <span className="ml-auto text-xs text-stone-400 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo(paper.fetched_at)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug mb-2">
          <a
            href={paper.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 transition-colors"
          >
            {paper.title}
          </a>
        </h2>

        {/* Authors + institution */}
        {(paper.institution || authorsShown.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-stone-500 mb-4">
            {paper.institution && (
              <span className="font-semibold text-stone-600">{paper.institution}</span>
            )}
            {paper.institution && authorsShown.length > 0 && (
              <span className="text-stone-300">·</span>
            )}
            {authorsShown.map((author, i) => (
              <span key={i}>{author}{i < authorsShown.length - 1 ? ',' : ''}</span>
            ))}
            {extraAuthors > 0 && (
              <span className="text-stone-400">+{extraAuthors} more</span>
            )}
          </div>
        )}

        {/* TLDR box */}
        {paper.tldr && (
          <div className={`rounded-xl px-4 py-3 mb-4 border ${colors.glow}`}>
            <p className="text-sm font-semibold text-stone-800 leading-relaxed">
              💡 {paper.tldr}
            </p>
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              expanded
                ? 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
            aria-expanded={expanded}
          >
            {expanded
              ? <><ChevronUp className="w-3.5 h-3.5" /> Collapse</>
              : <><ChevronDown className="w-3.5 h-3.5" /> Read Summary</>
            }
          </button>
          <a
            href={paper.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-white transition-all"
          >
            <ExternalLink className="w-3 h-3" /> arXiv
          </a>
          {paper.pdf_url && (
            <a
              href={paper.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-white transition-all"
            >
              <FileText className="w-3 h-3" /> PDF
            </a>
          )}
          {paper.published_date && (
            <span className="ml-auto text-xs text-stone-400 hidden sm:block">{paper.published_date}</span>
          )}
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-6 pt-6 border-t border-stone-100 space-y-6">

            {/* Summary paragraphs */}
            {paragraphs.length > 0 && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${colors.heading}`}>
                  Summary
                </h3>
                <div className="space-y-3">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="text-sm text-stone-600 leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Key findings */}
            {paper.key_findings && paper.key_findings.length > 0 && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${colors.heading}`}>
                  Key Findings
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {paper.key_findings.map((finding, i) => {
                    const { label, content } = parseKeyFinding(finding);
                    return (
                      <div key={i} className="rounded-xl bg-stone-50 border border-stone-100 p-3">
                        {label && (
                          <div className="text-xs font-bold text-stone-700 mb-1">{label}</div>
                        )}
                        <p className="text-xs text-stone-600 leading-relaxed">{content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Methodology / Use Cases / Breakthrough */}
            {(paper.methodology || paper.use_cases || paper.breakthrough) && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paper.methodology && (
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                    <h4 className="text-xs font-bold text-stone-700 mb-2">🔧 Methodology</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{paper.methodology}</p>
                  </div>
                )}
                {paper.use_cases && (
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                    <h4 className="text-xs font-bold text-stone-700 mb-2">🎯 Real-World Use</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{paper.use_cases}</p>
                  </div>
                )}
                {paper.breakthrough && (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                    <h4 className="text-xs font-bold text-amber-700 mb-2">⚡ Breakthrough</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">{paper.breakthrough}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function ResearchFeed({
  initialItems,
  initialDomain,
  initialImpact,
  initialQ,
  lastUpdated,
}: ResearchFeedProps) {
  const [domain,      setDomain]      = useState(initialDomain);
  const [impact,      setImpact]      = useState(initialImpact);
  const [sort,        setSort]        = useState<'latest' | 'impact'>('latest');
  const [q,           setQ]           = useState(initialQ);
  const [debouncedQ,  setDebouncedQ]  = useState(initialQ);
  const [items,       setItems]       = useState<ResearchPaper[]>(initialItems);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [total,       setTotal]       = useState(initialItems.length);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const isInitialMount = useRef(true);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchPapers = useCallback(async (opts: {
    domain: string; impact: string; sort: string; q: string; page: number; append?: boolean;
  }) => {
    opts.append ? setLoadingMore(true) : setLoading(true);
    try {
      const params = new URLSearchParams({
        domain: opts.domain,
        impact: opts.impact,
        sort:   opts.sort,
        q:      opts.q,
        page:   String(opts.page),
        limit:  '9',
      });
      const res  = await fetch(`/api/research-papers?${params}`);
      const data = await res.json();
      setItems(prev => opts.append ? [...prev, ...(data.items ?? [])] : (data.items ?? []));
      setHasMore(data.hasMore ?? false);
      setTotal(data.total ?? 0);
      setPage(opts.page);
    } catch { /* noop */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  // Refetch when filters change — skip initial mount (SSR data already loaded)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    fetchPapers({ domain, impact, sort, q: debouncedQ, page: 1 });
  }, [domain, impact, sort, debouncedQ, fetchPapers]);

  const loadMore = () =>
    fetchPapers({ domain, impact, sort, q: debouncedQ, page: page + 1, append: true });

  const formattedUpdate = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="mb-6 space-y-3">

        {/* Domain pills — horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 pb-1.5">
          <div className="flex items-center gap-1.5 w-max">
            {RESEARCH_DOMAINS.map(d => (
              <button
                key={d.value}
                onClick={() => setDomain(d.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                  domain === d.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Impact filter + Sort toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search papers…"
              aria-label="Search research papers"
              className="input text-sm py-2 pl-9 pr-8 w-full"
            />
            {q && (
              <button
                onClick={() => { setQ(''); setDebouncedQ(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <select
              value={impact}
              onChange={e => setImpact(e.target.value)}
              className="input appearance-none pr-8 text-sm py-2 cursor-pointer min-w-[130px]"
              aria-label="Filter by impact level"
            >
              {IMPACT_FILTERS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          <div className="shrink-0 flex items-center gap-0.5 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setSort('latest')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sort === 'latest'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Clock className="w-3 h-3" /> Latest
            </button>
            <button
              onClick={() => setSort('impact')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sort === 'impact'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <TrendingUp className="w-3 h-3" /> Impact
            </button>
          </div>
        </div>

        {/* Count + last updated */}
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{total > 0 ? `${total} paper${total !== 1 ? 's' : ''}` : 'No papers found'}</span>
          {formattedUpdate && <span>Updated {formattedUpdate}</span>}
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-52 skeleton rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-stone-500 text-sm">No papers found</p>
          <p className="text-xs mt-1">Try a different domain or clear your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((paper, i) => (
            <div key={paper.id}>
              <PaperCard paper={paper} />
              {(i + 1) % 3 === 0 && i < items.length - 1 && (
                <div className="my-4">
                  <InArticleAd />
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading…' : 'Load more papers'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
