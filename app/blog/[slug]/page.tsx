import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd, SidebarAd } from '@/components/shared/AdSense';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('blog_posts')
      .select('title, meta_description, slug')
      .eq('slug', params.slug)
      .eq('published', true)
      .single();

    if (!data) return { title: 'Post Not Found' };

    return {
      title: data.title,
      description: data.meta_description,
      alternates: { canonical: `https://formly.tools/blog/${data.slug}` },
      openGraph: {
        title: data.title,
        description: data.meta_description,
        type: 'article',
      },
    };
  } catch {
    return { title: 'Blog Post' };
  }
}

export default async function BlogPostPage({ params }: Props) {
  let post: { title: string; content: string; meta_description: string; tags: string[]; created_at: string; read_time?: number } | null = null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .single();

    post = data;
  } catch {
    // DB not configured
  }

  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            {/* Article */}
            <article>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                All Articles
              </Link>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(post.tags ?? []).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>

              <div className="flex items-center gap-4 text-xs text-gray-600 mb-8 pb-8 border-b border-gray-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {post.read_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {post.read_time} min read
                  </span>
                )}
                <span>By Formly Team</span>
              </div>

              {/* Article content */}
              <div
                className="prose prose-sm max-w-none prose-invert prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-violet-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-li:text-gray-300 prose-ol:text-gray-300"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* In-content ad — mid article */}
              <BannerAd className="my-10" />

              {/* CTA at end */}
              <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/5 border border-violet-500/20 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Try the AI Tools for Free</h3>
                <p className="text-gray-400 text-sm mb-4">
                  No signup needed. 5 free uses per day across all 10 tools.
                </p>
                <Link href="/tools" className="btn-primary inline-flex">
                  Start Using Formly Free →
                </Link>
              </div>

              {/* Article schema */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: post.title,
                    description: post.meta_description,
                    author: { '@type': 'Organization', name: 'Formly' },
                    publisher: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
                    datePublished: post.created_at,
                  }),
                }}
              />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <SidebarAd />
              <div className="card">
                <h3 className="font-semibold text-white mb-4">Popular Tools</h3>
                <div className="space-y-2">
                  {[
                    { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
                    { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
                    { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
                    { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
                    { name: 'YouTube Summarizer', href: '/tools/youtube-summarizer', icon: '▶️' },
                  ].map((tool) => (
                    <Link key={tool.href} href={tool.href} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300 hover:text-white">
                      <span>{tool.icon}</span>{tool.name}
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
