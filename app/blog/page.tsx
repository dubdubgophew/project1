import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd } from '@/components/shared/AdSense';
import { BLOG_POSTS } from '@/lib/blog-content';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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

interface DynamicPost {
  slug: string;
  title: string;
  meta_description: string;
  tags: string[];
  read_time: number;
  created_at: string;
  updated_at: string;
  dynamic: true;
}

export default async function BlogPage() {
  // Fetch dynamic posts from Supabase
  let dynamicPosts: DynamicPost[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, meta_description, tags, read_time, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(200);

    const staticSlugs = new Set(BLOG_POSTS.map(p => p.slug));
    dynamicPosts = (data ?? [])
      .filter(p => !staticSlugs.has(p.slug))
      .map(p => ({ ...p, dynamic: true as const }));
  } catch {
    // Supabase unavailable — show static only
  }

  const pinned = BLOG_POSTS.filter(p => PINNED_SLUGS.includes(p.slug));
  const staticRest = BLOG_POSTS.filter(p => !PINNED_SLUGS.includes(p.slug));
  const allPosts = [...pinned, ...staticRest, ...dynamicPosts];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              AI Tool Guides &amp; Tutorials
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Step-by-step guides for every Formly tool — with geo-specific tips for USA, UK, India, Canada, Australia, and more.
            </p>
            <p className="text-gray-600 text-sm mt-3">{allPosts.length} guides published</p>
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
            {allPosts.map((post) => {
              const isPinned = !('dynamic' in post) && PINNED_SLUGS.includes(post.slug);
              const isDynamic = 'dynamic' in post;
              const meta = isDynamic
                ? (post as DynamicPost).meta_description
                : (post as typeof BLOG_POSTS[0]).metaDescription;
              const date = isDynamic
                ? (post as DynamicPost).created_at
                : (post as typeof BLOG_POSTS[0]).publishedAt;
              const readTime = isDynamic
                ? (post as DynamicPost).read_time
                : (post as typeof BLOG_POSTS[0]).readingTime;
              const category = isDynamic ? 'ai-tools' : (post as typeof BLOG_POSTS[0]).category;

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
                    {CATEGORY_LABELS[category] ?? category}
                  </span>
                  <h2 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-2">
                    {meta}
                  </p>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                    <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{readTime} min read</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <BannerAd className="mt-10" />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Formly AI Tool Guides',
                numberOfItems: allPosts.length,
                itemListElement: allPosts.map((post, i) => ({
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
