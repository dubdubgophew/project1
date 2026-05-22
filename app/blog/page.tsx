import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd } from '@/components/shared/AdSense';
import { BLOG_POSTS } from '@/lib/blog-content';

export const metadata: Metadata = {
  title: 'AI Tool Guides & Tutorials — Formly Blog',
  description:
    'In-depth guides for every Formly AI tool. Learn how to create pay stubs, build resumes, generate contracts, summarize PDFs, and more — with SEO and country-specific tips.',
  alternates: { canonical: 'https://formly.tools/blog' },
  openGraph: { title: 'AI Tool Guides — Formly Blog', description: 'Guides for pay stub generators, resume builders, AI paraphrasers, grammar checkers & 22 more free AI tools.', type: 'website' },
};

const CATEGORY_LABELS: Record<string, string> = {
  'finance': '💰 Finance',
  'legal': '⚖️ Legal',
  'ai-tools': '✨ AI Writing',
  'developer-tools': '💻 Developer',
  'productivity': '🔧 Productivity',
};

const PINNED_SLUGS = ['paystub-generator', 'resume-builder', 'contract-generator'];

const pinned = BLOG_POSTS.filter(p => PINNED_SLUGS.includes(p.slug));
const rest = BLOG_POSTS.filter(p => !PINNED_SLUGS.includes(p.slug));
const ordered = [...pinned, ...rest];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              AI Tool Guides &amp; Tutorials
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Step-by-step guides for every Formly tool — with geo-specific tips for USA, UK, India, Canada, Australia, and more.
            </p>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
              <span key={cat} className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-400 border border-gray-700">
                {label}
              </span>
            ))}
          </div>

          {/* Guide cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordered.map((post) => {
              const isPinned = PINNED_SLUGS.includes(post.slug);
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={`group flex flex-col p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                    isPinned
                      ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      : 'bg-gray-900/50 border-gray-800 hover:border-violet-500/30 hover:bg-gray-900'
                  }`}
                >
                  {isPinned && (
                    <span className="text-xs font-semibold text-amber-400 mb-2">🔥 Most Popular</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-500 w-fit mb-3">
                    {CATEGORY_LABELS[post.category] ?? post.category}
                  </span>
                  <h2 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-2">
                    {post.metaDescription}
                  </p>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <BannerAd className="mt-10" />

          {/* JSON-LD ItemList */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Formly AI Tool Guides',
                description: 'Complete guides for 28 free AI tools covering pay stubs, resumes, contracts, writing, coding, and more.',
                numberOfItems: BLOG_POSTS.length,
                itemListElement: ordered.map((post, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: post.title,
                  url: `https://formly.tools/blog/${post.slug}`,
                })),
              }),
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
