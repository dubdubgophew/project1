import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { InArticleAd } from '@/components/shared/AdSense';
import { ArticleImage } from '@/components/shared/ArticleImage';
import { createAdminClient } from '@/lib/supabase/server';
import type { TrendingNews } from '@/lib/trending-utils';

export const revalidate = 60;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Sports:        'bg-blue-50 text-blue-700 border-blue-200',
  Tech:          'bg-violet-50 text-violet-700 border-violet-200',
  Politics:      'bg-red-50 text-red-700 border-red-200',
  Entertainment: 'bg-amber-50 text-amber-700 border-amber-200',
  Business:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  Health:        'bg-teal-50 text-teal-700 border-teal-200',
  General:       'bg-stone-50 text-stone-600 border-stone-200',
};

const CATEGORY_BAR: Record<string, string> = {
  Sports:        'bg-blue-500',
  Tech:          'bg-violet-500',
  Politics:      'bg-red-500',
  Entertainment: 'bg-amber-500',
  Business:      'bg-emerald-500',
  Health:        'bg-teal-500',
  General:       'bg-stone-400',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Sports:        '🏆',
  Tech:          '💻',
  Politics:      '🏛️',
  Entertainment: '🎬',
  Business:      '📈',
  Health:        '❤️',
  General:       '📰',
};

const TOOL_BY_CATEGORY: Record<string, { name: string; href: string; description: string; emoji: string }> = {
  Business:      { name: 'PDF Summarizer',    href: '/tools/pdf-summarizer',   description: 'Upload reports, earnings releases, or any business document for instant AI-powered key points.', emoji: '📄' },
  Tech:          { name: 'Code Explainer',    href: '/tools/code-explainer',   description: 'Paste any code snippet from this article and get a plain-English explanation instantly.', emoji: '💻' },
  Politics:      { name: 'AI Email Writer',   href: '/tools/email-writer',     description: 'Draft a professional email to your representative or colleagues about this story — in seconds.', emoji: '📧' },
  Health:        { name: 'Grammar Checker',   href: '/tools/grammar-checker',  description: 'Polish health summaries, reports, or patient communications with AI-powered grammar checking.', emoji: '✅' },
  Sports:        { name: 'Bio Writer',        href: '/tools/bio-writer',       description: 'Write a compelling professional bio or sports profile with AI — perfect for athletes and coaches.', emoji: '✍️' },
  Entertainment: { name: 'Paraphraser',       href: '/tools/paraphraser',      description: 'Rephrase any entertainment content in your own voice. Great for social captions and reviews.', emoji: '🔄' },
  General:       { name: 'AI Email Writer',   href: '/tools/email-writer',     description: 'Write professional emails about any topic in seconds — no more staring at a blank page.', emoji: '📧' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Related Card ─────────────────────────────────────────────────────────────

function RelatedCard({ item }: { item: TrendingNews }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className="flex items-start gap-3 bg-white border border-stone-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-sm transition-all group"
    >
      <span className="text-xl shrink-0 mt-0.5">{CATEGORY_EMOJIS[item.category] ?? '📰'}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-stone-900 text-sm leading-snug mb-1 group-hover:text-orange-700 transition-colors line-clamp-2">
          {item.topic}
        </h3>
        <p className="text-stone-500 text-xs">{timeAgo(item.fetched_at)} · {item.country_name}</p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();

  const { data: article } = await supabase
    .from('trending_news')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!article) notFound();

  const { data: relatedRaw } = await supabase
    .from('trending_news')
    .select('id,country_code,country_name,topic,summary,category,source_url,source_name,image_url,fetched_at,rank,key_points,traffic_volume,source_title,language_code,language_name')
    .eq('category', article.category)
    .neq('id', article.id)
    .order('fetched_at', { ascending: false })
    .limit(4);

  const related = (relatedRaw ?? []) as TrendingNews[];
  const tool    = TOOL_BY_CATEGORY[article.category] ?? TOOL_BY_CATEGORY.General;
  const catColor = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.General;
  const catBar   = CATEGORY_BAR[article.category]    ?? CATEGORY_BAR.General;
  const catEmoji = CATEGORY_EMOJIS[article.category] ?? '📰';
  const keyPoints: string[] = Array.isArray(article.key_points) ? article.key_points : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.topic,
    description: article.summary,
    datePublished: article.fetched_at,
    dateModified: article.fetched_at,
    author: { '@type': 'Organization', name: 'Formly AI', url: 'https://formly.tools' },
    publisher: { '@type': 'Organization', name: 'Formly Tools', url: 'https://formly.tools', logo: { '@type': 'ImageObject', url: 'https://formly.tools/favicon.svg' } },
    url: `https://formly.tools/news/${article.id}`,
    mainEntityOfPage: `https://formly.tools/news/${article.id}`,
    ...(article.image_url ? { image: article.image_url } : {}),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Back */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>

          {/* Article */}
          <article itemScope itemType="https://schema.org/NewsArticle">

            {/* Category bar */}
            <div className={`h-1.5 w-full rounded-full mb-5 ${catBar}`} />

            {/* Meta */}
            <div className="flex items-center gap-2.5 flex-wrap mb-4">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${catColor}`}>
                {catEmoji} {article.category}
              </span>
              <span className="text-sm text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <time dateTime={article.fetched_at} itemProp="datePublished">
                  {timeAgo(article.fetched_at)}
                </time>
              </span>
              <span className="text-sm text-stone-400">{article.country_name}</span>
            </div>

            {/* Headline */}
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight mb-5"
              itemProp="headline"
            >
              {article.topic}
            </h1>

            {/* Image — only shown if real unique URL from RSS */}
            {article.image_url && (
              <ArticleImage src={article.image_url} alt={article.topic} />
            )}

            {/* Analysis narrative */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 mb-5">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                📰 Analysis
              </p>
              <p className="text-stone-800 text-base leading-relaxed whitespace-pre-line" itemProp="description">
                {article.summary}
              </p>
            </div>

            {/* Deep Analysis — structured key_points */}
            {keyPoints.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                  🔍 Deep Analysis
                </p>
                <div className="space-y-2.5">
                  {keyPoints.map((pt, i) => {
                    const sepIdx = pt.indexOf(' | ');
                    const label   = sepIdx > 0 ? pt.slice(0, sepIdx) : null;
                    const content = sepIdx > 0 ? pt.slice(sepIdx + 3) : pt;
                    const sectionColors = [
                      'bg-slate-50 border-slate-200',
                      'bg-amber-50 border-amber-200',
                      'bg-emerald-50 border-emerald-200',
                      'bg-red-50 border-red-200',
                      'bg-violet-50 border-violet-200',
                    ];
                    return (
                      <div key={i} className={`border rounded-xl p-4 ${sectionColors[i] ?? 'bg-stone-50 border-stone-200'}`}>
                        {label && (
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">{label}</p>
                        )}
                        <p className="text-stone-800 text-sm leading-relaxed">{content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <InArticleAd variant={1} className="mb-5" />

            {/* Source attribution */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">Original source</p>
                <p className="text-sm font-semibold text-stone-700 truncate">{article.source_name}</p>
              </div>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors"
              >
                Read original <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>

          {/* Tool CTA */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/80 border border-orange-200 rounded-2xl p-5 sm:p-6 mb-10">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3">
              🤖 Free Tool for You
            </p>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{tool.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 text-base">{tool.name}</h3>
                <p className="text-stone-600 text-sm mt-1 leading-relaxed">{tool.description}</p>
              </div>
            </div>
            <Link href={tool.href} className="btn-primary inline-flex text-sm py-2 px-5">
              Try {tool.name} Free →
            </Link>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                {catEmoji} More {article.category} News
              </h2>
              <div className="space-y-2.5">
                {related.map(r => <RelatedCard key={r.id} item={r} />)}
              </div>
            </section>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-stone-200">
            <Link href="/news" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              All News
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
