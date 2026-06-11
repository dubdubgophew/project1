'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, ChevronDown, RefreshCw, Share2, Check,
  ExternalLink, Clock, Mail, ArrowUpDown, TrendingUp, Calendar,
} from 'lucide-react';
import { AI_CATEGORIES, type AINewsItem } from '@/lib/ai-news-utils';
import { BannerAd, InArticleAd } from '@/components/shared/AdSense';

// ─── AI-specific filter options (only countries/languages with real sources) ──

const AI_COUNTRIES = [
  { code: 'GLOBAL', name: 'Global',        flag: '🌐' },
  { code: 'US',     name: 'United States', flag: '🇺🇸' },
  { code: 'GB',     name: 'United Kingdom',flag: '🇬🇧' },
  { code: 'IN',     name: 'India',         flag: '🇮🇳' },
  { code: 'DE',     name: 'Germany',       flag: '🇩🇪' },
  { code: 'FR',     name: 'France',        flag: '🇫🇷' },
  { code: 'ES',     name: 'Spain',         flag: '🇪🇸' },
  { code: 'BR',     name: 'Brazil',        flag: '🇧🇷' },
];

const AI_LANGUAGES = [
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  initialItems: AINewsItem[];
  initialCategory: string;
  initialQ: string;
  initialId: string | null;
  initialLanguage: string;
  initialCountry: string;
  lastUpdated: string | null;
}

interface ApiResponse {
  items: AINewsItem[];
  total: number;
  page: number;
  hasMore: boolean;
  lastUpdated: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Tools:        'bg-violet-50 text-violet-700 border-violet-200',
  Research:     'bg-blue-50 text-blue-700 border-blue-200',
  Companies:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Hardware:     'bg-orange-50 text-orange-700 border-orange-200',
  Learning:     'bg-amber-50 text-amber-700 border-amber-200',
  'Open Source':'bg-teal-50 text-teal-700 border-teal-200',
  Industry:     'bg-red-50 text-red-700 border-red-200',
};

const CATEGORY_BAR: Record<string, string> = {
  Tools:        'bg-violet-500',
  Research:     'bg-blue-500',
  Companies:    'bg-emerald-500',
  Hardware:     'bg-orange-500',
  Learning:     'bg-amber-500',
  'Open Source':'bg-teal-500',
  Industry:     'bg-red-500',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Tools:        '🛠️',
  Research:     '🔬',
  Companies:    '🏢',
  Hardware:     '⚡',
  Learning:     '📚',
  'Open Source':'🌐',
  Industry:     '💼',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Tools:        'bg-gradient-to-br from-violet-100 to-violet-200',
  Research:     'bg-gradient-to-br from-blue-100 to-blue-200',
  Companies:    'bg-gradient-to-br from-emerald-100 to-emerald-200',
  Hardware:     'bg-gradient-to-br from-orange-100 to-orange-200',
  Learning:     'bg-gradient-to-br from-amber-100 to-amber-200',
  'Open Source':'bg-gradient-to-br from-teal-100 to-teal-200',
  Industry:     'bg-gradient-to-br from-red-100 to-red-200',
};

const TOOL_PROMOS = [
  { icon: '📄', name: 'PDF Summarizer',    href: '/tools/pdf-summarizer',    blurb: 'Summarize any AI research paper or whitepaper in seconds. Free, no signup.' },
  { icon: '✍️', name: 'AI Email Writer',   href: '/tools/email-writer',      blurb: 'Reach out to AI companies, researchers, or teams with a perfectly crafted email.' },
  { icon: '📋', name: 'Resume Builder',    href: '/tools/resume-builder',    blurb: 'Land an AI/ML role with an ATS-optimized resume. Built with AI, free.' },
  { icon: '📷', name: 'QR Code Generator', href: '/tools/qr-code',           blurb: 'Create branded QR codes for your AI projects, papers, or GitHub repos.' },
  { icon: '✅', name: 'Grammar Checker',   href: '/tools/grammar-checker',   blurb: 'Polish your AI blog posts, documentation, or research abstracts instantly.' },
  { icon: '🖊️', name: 'Digital Signature', href: '/tools/digital-signature', blurb: 'Sign NDAs, partnership agreements, and contracts online — free, no DocuSign.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Share Dropdown ───────────────────────────────────────────────────────────

function ShareDropdown({ item, onClose }: { item: AINewsItem; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl  = `https://www.formly.tools/ai-news?id=${item.id}`;
  const shareText = `${item.topic} — via Formly AI News`;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(onClose, 1000);
    });
  }

  const options = [
    { label: 'WhatsApp',    icon: '💬', href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}` },
    { label: 'Twitter / X', icon: '𝕏',  href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { label: 'Facebook',    icon: 'f',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: 'LinkedIn',    icon: 'in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { label: 'Telegram',    icon: '✈️', href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  ];

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="p-1">
        {options.map(opt => (
          <a
            key={opt.label}
            href={opt.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-50 text-sm text-stone-700 hover:text-stone-900 transition-colors"
          >
            <span className="w-5 text-center font-bold text-xs">{opt.icon}</span>
            {opt.label}
          </a>
        ))}
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-50 text-sm text-stone-700 hover:text-stone-900 transition-colors"
        >
          {copied ? (
            <><Check className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600">Copied!</span></>
          ) : (
            <><span className="w-5 text-center text-xs">🔗</span>Copy link</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── AI News Card ─────────────────────────────────────────────────────────────

function AICard({ item }: { item: AINewsItem }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const hasUniqueImage = Boolean(item.image_url);
  const catColor    = CATEGORY_COLORS[item.category]    ?? 'bg-stone-50 text-stone-600 border-stone-200';
  const catBar      = CATEGORY_BAR[item.category]       ?? 'bg-stone-400';
  const catEmoji    = CATEGORY_EMOJIS[item.category]    ?? '🤖';
  const catGradient = CATEGORY_GRADIENTS[item.category] ?? 'bg-gradient-to-br from-stone-100 to-stone-200';

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id === item.id) {
      setHighlighted(true);
      setTimeout(() => setHighlighted(false), 2000);
    }
  }, [item.id]);

  return (
    <article
      id={`ai-${item.id}`}
      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
        highlighted
          ? 'border-violet-400 ring-2 ring-violet-400/20'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
      }`}
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      {/* Category colour bar */}
      <div className={`h-1 w-full ${catBar}`} />

      <div className="p-4 sm:p-5 flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
              {catEmoji} {item.category}
            </span>
            <span className="text-[11px] text-stone-400">{item.country_name}</span>
            {item.language_code && item.language_code !== 'en' && (
              <span className="text-[11px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{item.language_name}</span>
            )}
            <span className="text-[11px] text-stone-400">{item.source_name}</span>
            <span className="text-[11px] text-stone-300">·</span>
            <time dateTime={item.fetched_at} className="text-[11px] text-stone-400 flex items-center gap-0.5" itemProp="datePublished">
              <Clock className="w-3 h-3" />
              {timeAgo(item.fetched_at)}
            </time>
          </div>

          {/* Headline */}
          <h2 className="text-stone-900 font-bold text-[15px] leading-snug mb-2.5" itemProp="headline">
            {item.topic}
          </h2>

          {/* Full summary */}
          <p className="text-stone-600 text-sm leading-relaxed mb-3" itemProp="description">
            {item.summary}
          </p>

          {/* Key takeaways */}
          {item.key_points && item.key_points.length > 0 && (
            <div className="mb-3 bg-violet-50 border border-violet-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2">
                📌 Key Takeaways
              </p>
              <ul className="space-y-1.5">
                {item.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="text-violet-400 font-bold mt-0.5 shrink-0">→</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2.5 border-t border-stone-100 flex items-center gap-2">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
              itemProp="publisher"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[140px]">{item.source_name}</span>
            </a>
            <div className="relative ml-auto">
              <button
                onClick={() => setShareOpen(o => !o)}
                className="flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
              {shareOpen && <ShareDropdown item={item} onClose={() => setShareOpen(false)} />}
            </div>
          </div>
        </div>

        {/* Thumbnail — real image if available, category gradient otherwise */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden self-start mt-0.5">
          {hasUniqueImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.image_url!}
              alt=""
              loading="lazy"
              decoding="async"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement!;
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${catGradient}"><span class="text-2xl">${catEmoji}</span></div>`;
              }}
              itemProp="image"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${catGradient}`}>
              <span className="text-2xl">{catEmoji}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Tool Promo Card ──────────────────────────────────────────────────────────

function ToolPromoCard({ promo }: { promo: typeof TOOL_PROMOS[number] }) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-200 rounded-2xl p-5 flex flex-col gap-4">
      <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">🤖 Free Tool Spotlight</span>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{promo.icon}</span>
        <div>
          <h3 className="text-stone-900 font-bold text-base">{promo.name}</h3>
          <p className="text-stone-600 text-sm mt-1 leading-relaxed">{promo.blurb}</p>
        </div>
      </div>
      <Link href={promo.href} className="btn-primary text-sm py-2 justify-center">
        Try {promo.name} Free →
      </Link>
    </div>
  );
}

// ─── Newsletter Card ──────────────────────────────────────────────────────────

function NewsletterCard() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState('loading');
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } finally {
      setState('done');
    }
  }

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex flex-col gap-3">
      <Mail className="w-6 h-6 text-violet-600" />
      <div>
        <h3 className="text-stone-900 font-bold text-base">Daily AI Digest</h3>
        <p className="text-stone-600 text-sm mt-1">
          Get the top AI stories from 10 sources delivered to your inbox every morning.
        </p>
      </div>
      {state === 'done' ? (
        <div className="flex items-center gap-2 text-violet-600 text-sm font-medium">
          <Check className="w-4 h-4" /> You&apos;re in! Check your inbox.
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input flex-1 text-sm py-2"
            required
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="btn-primary text-sm py-2 px-4 shrink-0 disabled:opacity-60"
          >
            {state === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-stone-200 rounded-full" />
          <div className="h-5 w-20 bg-stone-200 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-stone-200 rounded" />
        <div className="space-y-2">
          {[100, 95, 90, 88, 85, 80].map(w => (
            <div key={w} className="h-3.5 bg-stone-200 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-px bg-stone-100" />
        <div className="flex gap-4">
          <div className="h-8 bg-stone-200 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex justify-center py-16">
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center max-w-sm">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-stone-900 font-bold text-lg mb-2">Gathering AI news…</h3>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          Our AI agent is curating today&apos;s top stories from 10 AI sources.
          Check back in a few minutes or trigger a manual refresh.
        </p>
        <button onClick={onRefresh} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIFeed({
  initialItems,
  initialCategory,
  initialQ,
  initialId,
  initialLanguage,
  initialCountry,
  lastUpdated: initialLastUpdated,
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [items,       setItems]       = useState<AINewsItem[]>(initialItems);
  const [category,    setCategory]    = useState(initialCategory);
  const [country,     setCountry]     = useState(initialCountry);
  const [language,    setLanguage]    = useState(initialLanguage);
  const [sort,        setSort]        = useState('latest');
  const [q,           setQ]           = useState(initialQ);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(initialItems.length === 50);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialLastUpdated);
  const [searchInput, setSearchInput] = useState(initialQ);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateURL = useCallback((ca: string, sq: string, co: string, lang: string, s: string) => {
    const p = new URLSearchParams();
    if (ca   && ca   !== 'all')    p.set('category', ca);
    if (co   && co   !== 'all')    p.set('country', co);
    if (lang && lang !== 'en')     p.set('language', lang);  // 'en' is default, omit from URL
    if (sq.trim())                 p.set('q', sq.trim());
    if (s    && s    !== 'latest') p.set('sort', s);
    router.push(`/ai-news${p.size ? `?${p}` : ''}`, { scroll: false });
  }, [router]);

  const fetchPage = useCallback(async (opts: {
    category: string; country: string; language: string; sort: string; q: string; page: number; append: boolean;
  }) => {
    const p = new URLSearchParams({
      category: opts.category, country: opts.country,
      language: opts.language, sort: opts.sort, q: opts.q,
      page: String(opts.page), limit: '20',
    });
    try {
      const res = await fetch(`/api/ai-news?${p}`);
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
      console.error('[AIFeed]', err);
    }
  }, []);

  const handleCategoryChange = (cat: string)  => { setCategory(cat);  setPage(1); setLoading(true); updateURL(cat,      q, country,    language, sort); fetchPage({ category: cat,       country, language, sort, q, page: 1, append: false }).finally(() => setLoading(false)); };
  const handleCountryChange  = (co: string)   => { setCountry(co);    setPage(1); setLoading(true); updateURL(category, q, co,         language, sort); fetchPage({ category, country: co,       language, sort, q, page: 1, append: false }).finally(() => setLoading(false)); };
  const handleLanguageChange = (lang: string) => { setLanguage(lang); setPage(1); setLoading(true); updateURL(category, q, country,    lang,     sort); fetchPage({ category, country, language: lang,  sort, q, page: 1, append: false }).finally(() => setLoading(false)); };
  const handleSortChange     = (s: string)    => { setSort(s);        setPage(1); setLoading(true); updateURL(category, q, country,    language, s);    fetchPage({ category, country, language, sort: s,       q, page: 1, append: false }).finally(() => setLoading(false)); };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(val); setPage(1); setLoading(true);
      updateURL(category, val, country, language, sort);
      fetchPage({ category, country, language, sort, q: val, page: 1, append: false }).finally(() => setLoading(false));
    }, 400);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const next = page + 1; setPage(next);
    const scrollY = window.scrollY;
    await fetchPage({ category, country, language, sort, q, page: next, append: true });
    setLoadingMore(false);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollY)));
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPage({ category, country, language, sort, q, page: 1, append: false }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const ca   = searchParams.get('category') ?? 'all';
    const co   = searchParams.get('country')  ?? 'all';
    const lang = searchParams.get('language') ?? 'en';
    const s    = searchParams.get('sort')     ?? 'latest';
    const sq   = searchParams.get('q')        ?? '';
    setCategory(ca); setCountry(co); setLanguage(lang); setSort(s); setQ(sq); setSearchInput(sq);
  }, [searchParams]);

  useEffect(() => {
    if (!initialId) return;
    const el = document.getElementById(`ai-${initialId}`);
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [initialId]);

  function buildFeedItems(news: AINewsItem[]): ('newsletter' | { promo: number } | AINewsItem)[] {
    const out: ('newsletter' | { promo: number } | AINewsItem)[] = [];
    let promoIdx = 0;
    for (let i = 0; i < news.length; i++) {
      out.push(news[i]);
      if (i === 6) out.push('newsletter');
      if ((i + 1) % 4 === 0 && i < news.length - 1) {
        out.push({ promo: promoIdx % TOOL_PROMOS.length });
        promoIdx++;
      }
    }
    return out;
  }

  const feedItems = buildFeedItems(items);

  return (
    <div className="space-y-5">
      <BannerAd />

      {/* ── Filter bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="search"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search AI stories…"
            className="input pl-9 w-full text-sm py-2"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[120px]">
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="input appearance-none pr-8 text-sm py-2 cursor-pointer w-full"
            >
              {AI_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
          <div className="shrink-0 flex items-center gap-0.5 bg-stone-100 p-1 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
            <button onClick={() => handleSortChange('latest')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === 'latest' ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              <Calendar className="w-3 h-3" /> Latest
            </button>
            <button onClick={() => handleSortChange('popular')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === 'popular' ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
              <TrendingUp className="w-3 h-3" /> Popular
            </button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-stone-400 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            Updated {timeAgo(lastUpdated)}
          </p>
        )}
      </div>

      {/* ── Country pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => handleCountryChange('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            country === 'all'
              ? 'bg-violet-500 text-white border-violet-500'
              : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-violet-300'
          }`}
        >
          🌍 All
        </button>
        {AI_COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => handleCountryChange(c.code)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
              country === c.code
                ? 'bg-violet-500 text-white border-violet-500'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-violet-300'
            }`}
          >
            {c.flag}
            <span className="hidden sm:inline">{c.name}</span>
            <span className="sm:hidden">{c.code}</span>
          </button>
        ))}
      </div>

      {/* ── Language pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        <span className="shrink-0 text-[11px] text-stone-400 self-center pr-1">Language:</span>
        <button
          onClick={() => handleLanguageChange('all')}
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
            language === 'all'
              ? 'bg-violet-500 text-white border-violet-500'
              : 'bg-white text-stone-500 border-stone-200 hover:text-stone-800 hover:border-violet-300'
          }`}
        >
          All
        </button>
        {AI_LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => handleLanguageChange(l.code)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1 ${
              language === l.code
                ? 'bg-violet-500 text-white border-violet-500'
                : 'bg-white text-stone-500 border-stone-200 hover:text-stone-800 hover:border-violet-300'
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* ── Feed ── */}
      {!loading && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <EmptyState onRefresh={handleRefresh} />
          ) : (
            feedItems.map((entry, idx) => {
              if (entry === 'newsletter') {
                return (
                  <div key="newsletter">
                    <NewsletterCard />
                    <InArticleAd variant={1} className="mt-3" />
                  </div>
                );
              }
              if (typeof entry === 'object' && 'promo' in entry) {
                return <ToolPromoCard key={`promo-${idx}`} promo={TOOL_PROMOS[entry.promo]} />;
              }
              const item = entry as AINewsItem;
              return <AICard key={item.id} item={item} />;
            })
          )}
        </div>
      )}

      {/* ── Load more ── */}
      {!loading && hasMore && items.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</>
              : 'Load More Stories'
            }
          </button>
        </div>
      )}
    </div>
  );
}
