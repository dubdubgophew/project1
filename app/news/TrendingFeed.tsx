'use client';

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, TrendingUp, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { COUNTRIES, type TrendingNews } from '@/lib/trending-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendingFeedProps {
  initialItems: TrendingNews[];
  initialCountry: string;
  initialCategory: string;
  initialQ: string;
  lastUpdated: string | null;
}

interface ApiResponse {
  items: TrendingNews[];
  total: number;
  page: number;
  hasMore: boolean;
  lastUpdated: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'all',           label: 'All Topics' },
  { value: 'Sports',        label: 'Sports' },
  { value: 'Tech',          label: 'Tech' },
  { value: 'Politics',      label: 'Politics' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Business',      label: 'Business' },
  { value: 'Health',        label: 'Health' },
  { value: 'General',       label: 'General' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Sports:        'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Tech:          'bg-violet-500/15 text-violet-400 border-violet-500/20',
  Politics:      'bg-red-500/15 text-red-400 border-red-500/20',
  Entertainment: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Business:      'bg-green-500/15 text-green-400 border-green-500/20',
  Health:        'bg-teal-500/15 text-teal-400 border-teal-500/20',
  General:       'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const RANK_EMOJIS: Record<number, string> = { 1: '🔥', 2: '📈', 3: '⚡', 4: '💡', 5: '🌟' };

const TOOL_PROMOS = [
  { label: 'Resume Builder',   href: '/tools/resume-builder' },
  { label: 'Email Writer',     href: '/tools/email-writer' },
  { label: 'Grammar Checker',  href: '/tools/grammar-checker' },
  { label: 'PDF Summarizer',   href: '/tools/pdf-summarizer' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diffMs  = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24)  return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: TrendingNews }) {
  const [expanded, setExpanded] = useState(false);
  const rankEmoji  = RANK_EMOJIS[item.rank] ?? '📰';
  const catColors  = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.General;
  const countryData = COUNTRIES.find(c => c.code === item.country_code);
  const flag        = countryData?.flag ?? '';

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="bg-violet-500/10 text-violet-400 font-bold text-xs px-2 py-0.5 rounded-md border border-violet-500/20">
            #{item.rank} {rankEmoji}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${catColors}`}>
            {item.category}
          </span>
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
          {flag} {item.country_name}
        </span>
      </div>

      {/* Topic */}
      <h2 className="text-white font-bold text-base leading-snug">
        {item.topic}
      </h2>

      {/* Summary */}
      <div className="relative">
        <p
          className={`text-gray-300 text-sm leading-relaxed ${
            expanded ? '' : 'line-clamp-4'
          }`}
        >
          {item.summary}
        </p>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-violet-400 hover:text-violet-300 text-xs mt-1 transition-colors"
          >
            Read more...
          </button>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1 flex-wrap">
        {item.traffic_volume && (
          <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {item.traffic_volume} searches
          </span>
        )}
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors ml-auto"
          title={`Read on ${item.source_name}`}
        >
          <ExternalLink className="w-3 h-3" />
          {item.source_name}
        </a>
      </div>
    </article>
  );
}

// ─── Ad Slot ─────────────────────────────────────────────────────────────────

function AdSlot() {
  return (
    <div className="col-span-full">
      <div className="w-full h-[90px] bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-center text-xs text-gray-700">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? 'ca-pub-REPLACE'}
          data-ad-slot="REPLACE_AD_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="col-span-full flex justify-center py-16">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md">
        <div className="text-4xl mb-4">🔄</div>
        <h3 className="text-white font-bold text-lg mb-2">Fetching latest trends&hellip;</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Our AI agent is gathering trending topics from 10 countries. Check back in a few
          minutes, or trigger a manual refresh.
        </p>
        <button
          onClick={onRefresh}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrendingFeed({
  initialItems,
  initialCountry,
  initialCategory,
  initialQ,
  lastUpdated: initialLastUpdated,
}: TrendingFeedProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [items,       setItems]       = useState<TrendingNews[]>(initialItems);
  const [country,     setCountry]     = useState(initialCountry);
  const [category,    setCategory]    = useState(initialCategory);
  const [q,           setQ]           = useState(initialQ);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(initialItems.length === 20);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialLastUpdated);
  const [searchInput, setSearchInput] = useState(initialQ);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL sync ──────────────────────────────────────────────────────────────

  const updateURL = useCallback(
    (newCountry: string, newCategory: string, newQ: string) => {
      const params = new URLSearchParams();
      if (newCountry  && newCountry  !== 'all') params.set('country',  newCountry);
      if (newCategory && newCategory !== 'all') params.set('category', newCategory);
      if (newQ.trim())                          params.set('q',        newQ.trim());
      const qs = params.toString();
      router.push(`/news${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router]
  );

  // ── Fetch helper ──────────────────────────────────────────────────────────

  const fetchPage = useCallback(
    async (opts: { country: string; category: string; q: string; page: number; append: boolean }) => {
      const params = new URLSearchParams({
        country:  opts.country,
        category: opts.category,
        q:        opts.q,
        page:     String(opts.page),
        limit:    '20',
      });

      try {
        const res = await fetch(`/api/trending?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();

        if (opts.append) {
          setItems(prev => [...prev, ...(data.items ?? [])]);
        } else {
          setItems(data.items ?? []);
        }
        setHasMore(data.hasMore);
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
      } catch (err) {
        console.error('[TrendingFeed] fetch error:', err);
      }
    },
    []
  );

  // ── Country filter ────────────────────────────────────────────────────────

  const handleCountryChange = (code: string) => {
    setCountry(code);
    setPage(1);
    setLoading(true);
    updateURL(code, category, q);
    fetchPage({ country: code, category, q, page: 1, append: false }).finally(() =>
      setLoading(false)
    );
  };

  // ── Category filter ───────────────────────────────────────────────────────

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    setLoading(true);
    updateURL(country, cat, q);
    fetchPage({ country, category: cat, q, page: 1, append: false }).finally(() =>
      setLoading(false)
    );
  };

  // ── Search (debounced) ────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(value);
      setPage(1);
      setLoading(true);
      updateURL(country, category, value);
      fetchPage({ country, category, q: value, page: 1, append: false }).finally(() =>
        setLoading(false)
      );
    }, 400);
  };

  // ── Load more ─────────────────────────────────────────────────────────────

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPage({ country, category, q, page: nextPage, append: true });
    setLoadingMore(false);
  };

  // ── Manual refresh ────────────────────────────────────────────────────────

  const handleRefresh = () => {
    setLoading(true);
    fetchPage({ country, category, q, page: 1, append: false }).finally(() =>
      setLoading(false)
    );
  };

  // ── Sync from URL on navigation ───────────────────────────────────────────

  useEffect(() => {
    const c  = searchParams.get('country')  ?? 'all';
    const ca = searchParams.get('category') ?? 'all';
    const sq = searchParams.get('q')        ?? '';
    setCountry(c);
    setCategory(ca);
    setQ(sq);
    setSearchInput(sq);
  }, [searchParams]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search topics..."
            className="input pl-9 w-full text-sm py-2"
          />
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
            className="input appearance-none pr-8 text-sm py-2 cursor-pointer bg-gray-900 border-gray-700"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-500 shrink-0">
            Updated {timeAgo(lastUpdated)}
          </p>
        )}
      </div>

      {/* Country pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        <button
          onClick={() => handleCountryChange('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            country === 'all'
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
          }`}
        >
          🌍 All Countries
        </button>
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => handleCountryChange(c.code)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
              country === c.code
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
            }`}
          >
            <span>{c.flag}</span>
            <span className="hidden sm:inline">{c.name}</span>
            <span className="sm:hidden">{c.code}</span>
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 animate-pulse"
            >
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-800 rounded-md" />
                <div className="h-5 w-20 bg-gray-800 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-gray-800 rounded" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-800 rounded w-5/6" />
                <div className="h-3 bg-gray-800 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <EmptyState onRefresh={handleRefresh} />
          ) : (
            items.map((item, idx) => (
              <Fragment key={item.id}>
                <NewsCard item={item} />
                {(idx + 1) % 9 === 0 && <AdSlot />}
              </Fragment>
            ))
          )}
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && items.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Tool promotion strip */}
      <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-sm text-gray-400 mb-3">
          📋 Trending topics need professional handling — try these free tools:
        </p>
        <div className="flex flex-wrap gap-2">
          {TOOL_PROMOS.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {tool.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
