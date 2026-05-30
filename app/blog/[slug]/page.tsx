import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd, BannerAd } from '@/components/shared/AdSense';
import { BLOG_POSTS } from '@/lib/blog-content';
import { createAdminClient } from '@/lib/supabase/server';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { SocialShare } from '@/components/shared/SocialShare';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

interface DBPost {
  slug: string;
  title: string;
  content: string;
  meta_description: string;
  tags: string[];
  read_time: number;
  created_at: string;
  updated_at: string;
}

async function getDBPost(slug: string): Promise<DBPost | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, content, meta_description, tags, read_time, created_at, updated_at')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const staticPost = BLOG_POSTS.find(p => p.slug === params.slug);
  if (staticPost) {
    return {
      title: `${staticPost.title} | Formly`,
      description: staticPost.metaDescription,
      alternates: { canonical: `https://formly.tools/blog/${staticPost.slug}` },
      openGraph: { title: staticPost.title, description: staticPost.metaDescription, type: 'article', publishedTime: staticPost.publishedAt, modifiedTime: staticPost.updatedAt, siteName: 'Formly' },
      keywords: [staticPost.toolName, 'free online tool', 'AI tool', 'Formly'],
    };
  }
  const dbPost = await getDBPost(params.slug);
  if (!dbPost) return { title: 'Guide Not Found' };
  return {
    title: `${dbPost.title} | Formly`,
    description: dbPost.meta_description,
    alternates: { canonical: `https://formly.tools/blog/${dbPost.slug}` },
    openGraph: { title: dbPost.title, description: dbPost.meta_description, type: 'article', publishedTime: dbPost.created_at, modifiedTime: dbPost.updated_at, siteName: 'Formly' },
    keywords: [...(dbPost.tags ?? []), 'free online tool', 'AI tool', 'Formly'],
  };
}

export default async function BlogPostPage({ params }: Props) {
  const staticPost = BLOG_POSTS.find(p => p.slug === params.slug);

  // ── Static post (rich format) ────────────────────────────────────────────────
  if (staticPost) {
    const post = staticPost;
    const related = BLOG_POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

    const articleSchema = {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: post.title, description: post.metaDescription,
      datePublished: post.publishedAt, dateModified: post.updatedAt,
      author: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
      publisher: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools', logo: 'https://formly.tools/favicon.svg' },
      mainEntityOfPage: `https://formly.tools/blog/${post.slug}`,
    };
    const faqSchema = {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: post.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    };

    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-950 pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_280px] gap-12">
              <article>
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> All Guides
                </Link>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-6 pb-6 border-b border-gray-800">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Updated {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readingTime} min read</span>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">{post.intro}</p>
                <Link href={`/tools/${post.toolSlug}`} className="btn-primary inline-flex mb-8">Try {post.toolName} Free →</Link>
                <SocialShare url={`https://formly.tools/blog/${post.slug}`} title={post.title} />
                {post.sections.map((section, i) => (
                  <section key={i} className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-3">{section.heading}</h2>
                    {section.body.split('\n\n').map((para, j) => (
                      <p key={j} className="text-gray-300 leading-relaxed mb-3">{para}</p>
                    ))}
                    {i === 2 && <BannerAd className="my-6" />}
                  </section>
                ))}
                <div className="mt-10 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {post.faqs.map(({ q, a }, i) => (
                      <details key={i} className="group rounded-xl border border-gray-800 bg-gray-900/50">
                        <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm list-none">
                          {q}<span className="text-gray-500 group-open:rotate-180 transition-transform text-lg leading-none">⌄</span>
                        </summary>
                        <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{a}</p>
                      </details>
                    ))}
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/5 border border-violet-500/20 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Try {post.toolName} — It&apos;s Free</h3>
                  <p className="text-gray-400 text-sm mb-4">No signup needed. 5 free uses daily.</p>
                  <Link href={`/tools/${post.toolSlug}`} className="btn-primary inline-flex">Open {post.toolName} →</Link>
                </div>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
              </article>
              <aside className="space-y-6 lg:pt-12">
                <SidebarAd />
                {related.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-white mb-4 text-sm">Related Guides</h3>
                    <div className="space-y-3">
                      {related.map(r => (
                        <Link key={r.slug} href={`/blog/${r.slug}`} className="block text-sm text-gray-400 hover:text-white transition-colors leading-snug">→ {r.title}</Link>
                      ))}
                    </div>
                  </div>
                )}
                <SidebarAd />
              </aside>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Dynamic post (from Supabase) ─────────────────────────────────────────────
  const post = await getDBPost(params.slug);
  if (!post) notFound();

  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.meta_description,
    datePublished: post.created_at, dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
    publisher: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools', logo: 'https://formly.tools/favicon.svg' },
    mainEntityOfPage: `https://formly.tools/blog/${post.slug}`,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            <article>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> All Guides
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-6 pb-6 border-b border-gray-800">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.read_time} min read</span>
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-500 text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <SocialShare url={`https://formly.tools/blog/${post.slug}`} title={post.title} />

              {/* Render HTML content from AI */}
              <div
                className="prose prose-invert prose-sm max-w-none mt-6
                  prose-headings:text-white prose-headings:font-bold
                  prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                  prose-li:text-gray-300 prose-ul:my-4 prose-ol:my-4
                  prose-strong:text-white
                  prose-a:text-violet-400 prose-a:no-underline hover:prose-a:text-violet-300
                  prose-code:text-violet-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-10 p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/5 border border-violet-500/20 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Try Formly Tools — Free</h3>
                <p className="text-gray-400 text-sm mb-4">No signup needed. 37 free AI tools.</p>
                <Link href="/tools" className="btn-primary inline-flex">Explore All Tools →</Link>
              </div>

              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            </article>

            <aside className="space-y-6 lg:pt-12">
              <SidebarAd />
              <div className="card">
                <h3 className="font-semibold text-white mb-4 text-sm">Top Tools</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Pay Stub Generator', href: '/tools/paystub-generator', icon: '🧾' },
                    { name: 'Resume Builder', href: '/tools/resume-builder', icon: '📋' },
                    { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
                    { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
                    { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
                  ].map(t => (
                    <Link key={t.href} href={t.href} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300 hover:text-white">
                      <span>{t.icon}</span>{t.name}
                    </Link>
                  ))}
                </div>
              </div>
              <SidebarAd />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
