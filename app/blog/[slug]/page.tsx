import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd, BannerAd } from '@/components/shared/AdSense';
import { BLOG_POSTS } from '@/lib/blog-content';
import { ArrowLeft, Clock, Calendar, Globe } from 'lucide-react';
import { SocialShare } from '@/components/shared/SocialShare';

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) return { title: 'Guide Not Found' };
  return {
    title: `${post.title} | Formly`,
    description: post.metaDescription,
    alternates: { canonical: `https://formly.tools/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      siteName: 'Formly',
    },
    keywords: [post.toolName, 'free online tool', 'AI tool', 'Formly'],
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
    publisher: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools', logo: 'https://formly.tools/favicon.svg' },
    mainEntityOfPage: `https://formly.tools/blog/${post.slug}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">

            {/* Article */}
            <article>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> All Guides
              </Link>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-6 pb-6 border-b border-gray-800">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Updated {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readingTime} min read</span>
                {post.countriesServed && (
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{post.countriesServed.join(' · ')}</span>
                )}
              </div>

              {/* Intro */}
              <p className="text-gray-300 text-lg leading-relaxed mb-8">{post.intro}</p>

              {/* CTA — top */}
              <Link href={`/tools/${post.toolSlug}`} className="btn-primary inline-flex mb-8">
                Try {post.toolName} Free →
              </Link>

              <SocialShare url={`https://formly.tools/blog/${post.slug}`} title={post.title} />

              {/* Sections */}
              {post.sections.map((section, i) => (
                <section key={i} className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-3">{section.heading}</h2>
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j} className="text-gray-300 leading-relaxed mb-3">{para}</p>
                  ))}
                  {i === 2 && <BannerAd className="my-6" />}
                </section>
              ))}

              {/* FAQ */}
              <div className="mt-10 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {post.faqs.map(({ q, a }, i) => (
                    <details key={i} className="group rounded-xl border border-gray-800 bg-gray-900/50">
                      <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm list-none">
                        {q}
                        <span className="text-gray-500 group-open:rotate-180 transition-transform text-lg leading-none">⌄</span>
                      </summary>
                      <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{a}</p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/5 border border-violet-500/20 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Try {post.toolName} — It&apos;s Free</h3>
                <p className="text-gray-400 text-sm mb-4">No signup needed. 5 free uses daily. Pro plan from $9.99/month.</p>
                <Link href={`/tools/${post.toolSlug}`} className="btn-primary inline-flex">
                  Open {post.toolName} →
                </Link>
              </div>

              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:pt-12">
              <SidebarAd />
              {related.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-white mb-4 text-sm">Related Guides</h3>
                  <div className="space-y-3">
                    {related.map(r => (
                      <Link key={r.slug} href={`/blog/${r.slug}`} className="block text-sm text-gray-400 hover:text-white transition-colors leading-snug">
                        → {r.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
