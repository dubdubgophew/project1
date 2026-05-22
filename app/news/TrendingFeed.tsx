'use client';

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, ChevronDown, RefreshCw, Share2, Check,
  ExternalLink, Clock, Mail,
} from 'lucide-react';
import { COUNTRIES, type TrendingNews } from '@/lib/trending-utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
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

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'all', label: 'All Topics' },
  { value: 'Sports', label: '🏆 Sports' },
  { value: 'Tech', label: '💻 Tech' },
  { value: 'Politics', label: '🏛️ Politics' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Business', label: '📈 Business' },
  { value: 'Health', label: '❤️ Health' },
  { value: 'General', label: '📰 General' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Sports:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Tech:          'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Politics:      'bg-red-500/20 text-red-300 border-red-500/30',
  Entertainment: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Business:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Health:        'bg-teal-500/20 text-teal-300 border-teal-500/30',
  General:       'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

// High-quality Unsplash fallback images per category
const CATEGORY_IMAGES: Record<string, string> = {
  Sports:        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=75',
  Tech:          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=75',
  Politics:      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=75',
  Entertainment: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=75',
  Business:      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=75',
  Health:        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=75',
  General:       'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=75',
};

const TOOL_PROMOS = [
  { icon: '📄', name: 'PDF Summarizer',   href: '/tools/pdf-summarizer',   blurb: 'Upload any document from today\'s news and get the key points in seconds.' },
  { icon: '📧', name: 'AI Email Writer',  href: '/tools/email-writer',     blurb: 'Draft a professional response to any news story or business update instantly.' },
  { icon: '✍️', name: 'Digital Signature', href: '/tools/digital-signature', blurb: 'Sign documents, contracts, and agreements online — free, no DocuSign needed.' },
  { icon: '📋', name: 'Resume Builder',   href: '/tools/resume-builder',   blurb: 'Land your next opportunity with an ATS-optimized resume. AI-powered, free.' },
  { icon: '📷', name: 'QR Code Generator', href: '/tools/qr-code',         blurb: 'Create branded QR codes for sharing articles, profiles, and business links.' },
  { icon: '✅', name: 'Grammar Checker',  href: '/tools/grammar-checker',  blurb: 'Polish any piece of writing — articles, emails, or reports — instantly free.' },
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

function getSeoKeywords(topic: string, category: string, country: string): string[] {
  const words = topic
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .slice(0, 3);
  return [country, category, ...words].filter(Boolean).slice(0, 5);
}

function getCountryFlag(code: string): string {
  return COUNTRIES.find(c => c.code === code)?.flag ?? '🌍';
}

// ─── Share Dropdown ───────────────────────────────────────────────────────────

function ShareDropdown({ item, onClose }: { item: TrendingNews; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://www.formly.tools/news?id=${item.id}`;
  const shareText = `${item.topic} — via Formly News`;

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
    {
      label: 'WhatsApp',
      icon: '💬',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      label: 'Twitter / X',
      icon: '𝕏',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'Facebook',
      icon: 'f',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'LinkedIn',
      icon: 'in',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'Telegram',
      icon: '✈️',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
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
          {copied ? (
            <><Check className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
          ) : (
            <><span className="w-5 text-center text-xs">🔗</span>Copy link</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: TrendingNews }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    item.image_url || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.General
  );

  const flag     = getCountryFlag(item.country_code);
  const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.General;
  const keywords = getSeoKeywords(item.topic, item.category, item.country_name);

  return (
    <article
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-700 transition-colors"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={item.topic}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.General)}
          itemProp="image"
        />
        {/* Rank badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
          #{item.rank}
        </div>
        {/* Category badge */}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${catColor}`}>
          {item.category}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Country + time row */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span>{flag}</span>
            <span className="font-medium text-gray-400">{item.country_name}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <time dateTime={item.fetched_at} itemProp="datePublished">
              {formatDateTime(item.fetched_at)}
            </time>
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-white font-bold text-base leading-snug"
          itemProp="headline"
        >
          {item.topic}
        </h2>

        {/* SEO keyword tags */}
        <div className="flex flex-wrap gap-1.5" aria-label="Related topics">
          {keywords.map(kw => (
            <span
              key={kw}
              className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full"
            >
              #{kw}
            </span>
          ))}
        </div>

        {/* Full summary — no truncation */}
        <p
          className="text-gray-300 text-sm leading-relaxed flex-1"
          itemProp="description"
        >
          {item.summary}
        </p>

        {/* Footer: source + share */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800 mt-auto">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-400 transition-colors max-w-[55%]"
            itemProp="publisher"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.source_name}</span>
          </a>

          <div className="relative">
            <button
              onClick={() => setShareOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            {shareOpen && (
              <ShareDropdown item={item} onClose={() => setShareOpen(false)} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Tool Promo Card (monetisation) ──────────────────────────────────────────

function ToolPromoCard({ promo }: { promo: typeof TOOL_PROMOS[number] }) {
  return (
    <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
          🤖 Free Tool Spotlight
        </span>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{promo.icon}</span>
        <div>
          <h3 className="text-white font-bold text-base">{promo.name}</h3>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{promo.blurb}</p>
        </div>
      </div>
      <Link
        href={promo.href}
        className="btn-primary text-sm py-2 justify-center"
      >
        Try {promo.name} Free →
      </Link>
    </div>
  );
}

// ─── Newsletter Card (monetisation) ──────────────────────────────────────────

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
      setState('done');
    } catch {
      setState('done');
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-6 flex flex-col gap-3">
      <Mail className="w-6 h-6 text-emerald-400" />
      <div>
        <h3 className="text-white font-bold text-base">Daily Trending Digest</h3>
        <p className="text-gray-400 text-sm mt-1">
          Get the top 10 trending stories across 10 countries delivered to your inbox every morning.
        </p>
      </div>
      {state === 'done' ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
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

// ─── Ezoic Ad Placeholder (monetisation) ─────────────────────────────────────
// To activate: sign up at ezoic.com, verify formly.tools, then replace this
// component with your Ezoic ad placeholder divs. Ezoic works with Google
// ad inventory and accepts sites of any size — no minimum traffic requirement.

function EzoicAd({ id }: { id: number }) {
  return (
    <div className="w-full">
      {/* Ezoic ad placeholder — replace with: <div id={`ezoic-pub-ad-placeholder-${id}`} /> */}
      <div className="w-full h-[90px] bg-gray-900/40 border border-dashed border-gray-800 rounded-xl flex items-center justify-center">
        <span className="text-xs text-gray-700">
          Ad slot {id} · Sign up at ezoic.com to monetise
        </span>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full aspect-video bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-3 w-20 bg-gray-800 rounded" />
          <div className="h-3 w-24 bg-gray-800 rounded ml-auto" />
        </div>
        <div className="h-5 w-3/4 bg-gray-800 rounded" />
        <div className="flex gap-1.5">
          {[60, 80, 70].map(w => (
            <div key={w} className="h-4 bg-gray-800 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="space-y-2">
          {[100, 95, 90, 88, 85].map(w => (
            <div key={w} className="h-3 bg-gray-800 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="col-span-full flex justify-center py-16">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-sm">
        <div className="text-4xl mb-4">📡</div>
        <h3 className="text-white font-bold text-lg mb-2">Fetching latest news…</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Our AI agent is gathering today&apos;s top stories from 10 countries.
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

export function TrendingFeed({
  initialItems,
  initialCountry,
  initialCategory,
  initialQ,
  lastUpdated: initialLastUpdated,
}: Props) {
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

  const updateURL = useCallback((c: string, ca: string, sq: string) => {
    const p = new URLSearchParams();
    if (c  && c  !== 'all') p.set('country', c);
    if (ca && ca !== 'all') p.set('category', ca);
    if (sq.trim())          p.set('q', sq.trim());
    router.push(`/news${p.size ? `?${p}` : ''}`, { scroll: false });
  }, [router]);

  const fetchPage = useCallback(async (opts: {
    country: string; category: string; q: string; page: number; append: boolean;
  }) => {
    const p = new URLSearchParams({
      country: opts.country, category: opts.category,
      q: opts.q, page: String(opts.page), limit: '20',
    });
    try {
      const res = await fetch(`/api/trending?${p}`);
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
      console.error('[TrendingFeed]', err);
    }
  }, []);

  const handleCountryChange = (code: string) => {
    setCountry(code); setPage(1); setLoading(true);
    updateURL(code, category, q);
    fetchPage({ country: code, category, q, page: 1, append: false }).finally(() => setLoading(false));
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat); setPage(1); setLoading(true);
    updateURL(country, cat, q);
    fetchPage({ country, category: cat, q, page: 1, append: false }).finally(() => setLoading(false));
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(val); setPage(1); setLoading(true);
      updateURL(country, category, val);
      fetchPage({ country, category, q: val, page: 1, append: false }).finally(() => setLoading(false));
    }, 400);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const next = page + 1; setPage(next);
    await fetchPage({ country, category, q, page: next, append: true });
    setLoadingMore(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPage({ country, category, q, page: 1, append: false }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const c  = searchParams.get('country')  ?? 'all';
    const ca = searchParams.get('category') ?? 'all';
    const sq = searchParams.get('q')        ?? '';
    setCountry(c); setCategory(ca); setQ(sq); setSearchInput(sq);
  }, [searchParams]);

  // Interleave promos and newsletter into the flat item list
  function buildFeedItems(news: TrendingNews[]): ('newsletter' | { promo: number } | TrendingNews)[] {
    const out: ('newsletter' | { promo: number } | TrendingNews)[] = [];
    let promoIdx = 0;
    for (let i = 0; i < news.length; i++) {
      out.push(news[i]);
      // After item 7 (index 6), insert newsletter
      if (i === 6) out.push('newsletter');
      // After every 4th item (4, 8, 12, …), insert a tool promo
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search stories…"
            className="input pl-9 w-full text-sm py-2"
          />
        </div>

        <div className="relative">
          <select
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
            className="input appearance-none pr-8 text-sm py-2 cursor-pointer bg-gray-900 border-gray-700"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {lastUpdated && (
          <p className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
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
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
          }`}
        >
          🌍 All
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
            {c.flag}
            <span className="hidden sm:inline">{c.name}</span>
            <span className="sm:hidden">{c.code}</span>
          </button>
        ))}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="flex flex-col gap-5 max-w-2xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* ── Feed grid ── */}
      {!loading && (
        <div className="flex flex-col gap-5 max-w-2xl mx-auto">
          {items.length === 0 ? (
            <EmptyState onRefresh={handleRefresh} />
          ) : (
            feedItems.map((entry, idx) => {
              if (entry === 'newsletter') {
                return (
                  <Fragment key="newsletter">
                    <NewsletterCard />
                    <EzoicAd id={1} />
                  </Fragment>
                );
              }
              if (typeof entry === 'object' && 'promo' in entry) {
                return <ToolPromoCard key={`promo-${idx}`} promo={TOOL_PROMOS[entry.promo]} />;
              }
              const item = entry as TrendingNews;
              return <NewsCard key={item.id} item={item} />;
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
