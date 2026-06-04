'use client';

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, ChevronDown, RefreshCw, Share2, Check,
  ExternalLink, Clock, Mail,
} from 'lucide-react';
import { AI_CATEGORIES, type AINewsItem } from '@/lib/ai-news-utils';
import { COUNTRIES } from '@/lib/trending-utils';
import { LANGUAGES } from '@/lib/regional-news-utils';
import { ArrowUpDown, TrendingUp, Calendar } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  initialItems: AINewsItem[];
  initialCategory: string;
  initialQ: string;
  initialId: string | null;
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
  Tools:        'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Research:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Companies:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Hardware:     'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Learning:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Open Source':'bg-teal-500/20 text-teal-300 border-teal-500/30',
  Industry:     'bg-red-500/20 text-red-300 border-red-500/30',
};

const CATEGORY_IMAGES: Record<string, string> = {
  Tools:        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=75',
  Research:     'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=75',
  Companies:    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=75',
  Hardware:     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=75',
  Learning:     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=75',
  'Open Source':'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=75',
  Industry:     'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=75',
};

const TOOL_PROMOS = [
  { icon: '📄', name: 'PDF Summarizer',    href: '/tools/pdf-summarizer',    blurb: 'Summarize any AI research paper or whitepaper in seconds. Free, no signup.' },
  { icon: '✍️', name: 'AI Email Writer',   href: '/tools/email-writer',      blurb: 'Reach out to AI companies, researchers, or teams with a perfectly crafted email.' },
  { icon: '📋', name: 'Resume Builder',    href: '/tools/resume-builder',    blurb: 'Land an AI/ML role with an ATS-optimized resume. Built with AI, free.' },
  { icon: '📷', name: 'QR Code Generator', href: '/tools/qr-code',           blurb: 'Create branded QR codes for your AI projects, papers, or GitHub repos.' },
  { icon: '✅', name: 'Grammar Checker',   href: '/tools/grammar-checker',   blurb: 'Polish your AI blog posts, documentation, or research abstracts instantly.' },
  { icon: '🖊️', name: 'Digital Signature', href: '/tools/digital-signature', blurb: 'Sign NDAs, partnership agreements, and contracts online — free, no DocuSign.' },
];

const STOP_WORDS = new Set([
  'the','a','an','in','on','at','of','to','for','is','are','was','were',
  'be','been','and','or','but','with','by','from','as','it','its','his',
  'her','their','our','we','they','he','she','i','you','after','over',
  'new','will','says','said','that','this','has','have','had','what','who',
  'how','why','when','where','than','then','into','about','more','some',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getSeoKeywords(topic: string, category: string): string[] {
  const words = topic
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .slice(0, 3);
  return ['AI', category, ...words].filter(Boolean).slice(0, 5);
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
    { label: 'WhatsApp',   icon: '💬', href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}` },
    { label: 'Twitter / X',icon: '𝕏',  href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { label: 'Facebook',   icon: 'f',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: 'LinkedIn',   icon: 'in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { label: 'Telegram',   icon: '✈️', href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  ];

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-1">
        {options.map(opt => (
          <a
            key={opt.label}
            href={opt.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-700 text-sm text-gray-200 hover:text-white transition-colors"
          >
            <span className="w-5 text-center font-bold text-xs">{opt.icon}</span>
            {opt.label}
          </a>
        ))}
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-700 text-sm text-gray-200 hover:text-white transition-colors"
        >
          {copied
            ? <><Check className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
            : <><span className="w-5 text-center text-xs">🔗</span>Copy link</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function AICard({ item }: { item: AINewsItem }) {
  const [shareOpen,    setShareOpen]    = useState(false);
  const [highlighted,  setHighlighted]  = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    item.image_url || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.Industry
  );

  const catColor = CATEGORY_COLORS[item.category] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  const keywords = getSeoKeywords(item.topic, item.category);

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
      className={`bg-stone-900 border rounded-2xl overflow-hidden flex flex-col transition-all duration-700 ${
        highlighted
          ? 'border-orange-500 ring-2 ring-orange-500/40'
          : 'border-stone-800 hover:border-stone-700'
      }`}
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      {/* Image — shorter aspect ratio */}
      <div className="relative w-full aspect-[16/7] overflow-hidden bg-stone-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={item.topic}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.Industry)}
          itemProp="image"
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          #{item.rank}
        </div>
        <div className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${catColor}`}>
          {item.category}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Source + time */}
        <div className="flex items-center justify-between gap-2 text-[10px] text-stone-500">
          <span className="font-medium text-stone-400 truncate">{item.source_name}</span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            <time dateTime={item.fetched_at} itemProp="datePublished">
              {timeAgo(item.fetched_at)}
            </time>
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-white font-bold text-sm leading-snug" itemProp="headline">
          {item.topic}
        </h2>

        {/* Summary — truncated */}
        <p className="text-stone-300 text-xs leading-relaxed flex-1 line-clamp-3" itemProp="description">
          {item.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 mt-auto">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-orange-400 transition-colors"
            itemProp="publisher"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span>Read more</span>
          </a>
          <div className="relative">
            <button
              onClick={() => setShareOpen(o => !o)}
              className="flex items-center gap-1 text-[10px] font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded transition-colors"
            >
              <Share2 className="w-3 h-3" />
              Share
            </button>
            {shareOpen && <ShareDropdown item={item} onClose={() => setShareOpen(false)} />}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Tool Promo Card ──────────────────────────────────────────────────────────

function ToolPromoCard({ promo }: { promo: typeof TOOL_PROMOS[number] }) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200 rounded-2xl p-6 flex flex-col gap-4">
      <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">🤖 Free Tool Spotlight</span>
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
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 flex flex-col gap-3">
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
      <div className="w-full aspect-video bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-3 w-24 bg-stone-200 rounded" />
          <div className="h-3 w-20 bg-stone-200 rounded ml-auto" />
        </div>
        <div className="h-5 w-3/4 bg-stone-200 rounded" />
        <div className="flex gap-1.5">
          {[50, 40, 60].map(w => (
            <div key={w} className="h-4 bg-stone-200 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="space-y-2">
          {[100, 95, 90, 88, 85].map(w => (
            <div key={w} className="h-3 bg-stone-200 rounded" style={{ width: `${w}%` }} />
          ))}
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
  lastUpdated: initialLastUpdated,
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [items,       setItems]       = useState<AINewsItem[]>(initialItems);
  const [category,    setCategory]    = useState(initialCategory);
  const [country,     setCountry]     = useState('all');
  const [language,    setLanguage]    = useState('all');
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
    if (lang && lang !== 'all')    p.set('language', lang);
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
    const lang = searchParams.get('language') ?? 'all';
    const s    = searchParams.get('sort')     ?? 'latest';
    const sq   = searchParams.get('q')        ?? '';
    setCategory(ca); setCountry(co); setLanguage(lang); setSort(s); setQ(sq); setSearchInput(sq);
  }, [searchParams]);

  // Instant jump to deep-linked card
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
    <div className="space-y-6">

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
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="input appearance-none pr-8 text-sm py-2 cursor-pointer"
            >
              {AI_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
          {/* Sort toggle */}
          <div className="flex items-center gap-0.5 bg-stone-100 p-1 rounded-xl">
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
          <p className="text-xs text-stone-500 flex items-center gap-1 shrink-0">
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
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-orange-300'
          }`}
        >
          🌍 All
        </button>
        <button
          onClick={() => handleCountryChange('GLOBAL')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            country === 'GLOBAL'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-orange-300'
          }`}
        >
          🌐 Global
        </button>
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => handleCountryChange(c.code)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
              country === c.code
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-orange-300'
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
        {LANGUAGES.map(l => (
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
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* ── Feed ── */}
      {!loading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="sm:col-span-2"><EmptyState onRefresh={handleRefresh} /></div>
          ) : (
            feedItems.map((entry, idx) => {
              if (entry === 'newsletter') {
                return (
                  <div key="newsletter" className="sm:col-span-2">
                    <NewsletterCard />
                  </div>
                );
              }
              if (typeof entry === 'object' && 'promo' in entry) {
                return (
                  <div key={`promo-${idx}`} className="sm:col-span-2">
                    <ToolPromoCard promo={TOOL_PROMOS[entry.promo]} />
                  </div>
                );
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
