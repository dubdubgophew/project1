import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd } from '@/components/shared/AdSense';
import { Calendar, Clock, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — AI Writing Tips, Productivity Guides & Tool Updates',
  description:
    'Learn how to use AI tools for writing, coding, and productivity. Tips, tutorials, and updates from the Formly team.',
  alternates: { canonical: 'https://formly.tools/blog' },
};

export const revalidate = 3600; // Revalidate every hour

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  tags: string[];
  created_at: string;
  read_time?: number;
}

// Fallback blog posts for when DB is not set up yet
const SEED_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'How to Summarize a PDF with AI in Under 30 Seconds',
    slug: 'how-to-summarize-pdf-with-ai',
    meta_description: 'Learn how to use AI to summarize lengthy PDFs, research papers, and reports in seconds. Step-by-step guide.',
    tags: ['pdf', 'ai tools', 'productivity'],
    created_at: '2024-01-15',
    read_time: 4,
  },
  {
    id: '2',
    title: '10 Ways AI Can Improve Your Email Writing',
    slug: '10-ways-ai-improves-email-writing',
    meta_description: 'Discover how AI email writers can save hours and improve your professional communication instantly.',
    tags: ['email', 'writing', 'productivity'],
    created_at: '2024-01-12',
    read_time: 6,
  },
  {
    id: '3',
    title: 'The Best Free AI Grammar Checkers in 2024 (Compared)',
    slug: 'best-free-ai-grammar-checkers-2024',
    meta_description: 'We tested 8 free AI grammar checkers. Here\'s which one gives the best output quality — and why Formly wins.',
    tags: ['grammar', 'comparison', 'writing tools'],
    created_at: '2024-01-10',
    read_time: 8,
  },
  {
    id: '4',
    title: 'How to Build an ATS-Optimized Resume with AI',
    slug: 'build-ats-optimized-resume-with-ai',
    meta_description: 'Most resumes fail ATS screening. Here\'s how to use AI to create a resume that gets past the bots and to the hiring manager.',
    tags: ['resume', 'career', 'ai tools'],
    created_at: '2024-01-08',
    read_time: 7,
  },
  {
    id: '5',
    title: 'YouTube Summarizer: Save 10 Hours a Week on Research',
    slug: 'youtube-summarizer-save-time-research',
    meta_description: 'Stop watching 2-hour videos. Use AI to get the key insights from any YouTube video in under a minute.',
    tags: ['youtube', 'productivity', 'research'],
    created_at: '2024-01-05',
    read_time: 5,
  },
  {
    id: '6',
    title: 'Freelance Contracts: How to Protect Yourself with AI-Generated Agreements',
    slug: 'freelance-contracts-ai-generated-agreements',
    meta_description: 'Learn how to create professional freelance contracts using AI — and what clauses you must never miss.',
    tags: ['freelance', 'legal', 'contracts'],
    created_at: '2024-01-03',
    read_time: 9,
  },
];

export default async function BlogPage() {
  let posts: BlogPost[] = SEED_POSTS;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('blog_posts')
      .select('id, title, slug, meta_description, tags, created_at, read_time')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && data.length > 0) posts = data;
  } catch {
    // DB not configured — use seed posts
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
            <p className="text-gray-400 text-lg">
              AI tool guides, writing tips, productivity hacks, and updates from Formly.
            </p>
          </div>

          <div className="grid gap-6 mb-10">
            {posts.map((post, i) => (
              <article key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="card-hover group flex flex-col sm:flex-row gap-6 p-6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(post.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                      {post.meta_description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
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
                    </div>
                  </div>
                </Link>
                {/* Natural ad placement every 3 posts */}
                {(i + 1) % 3 === 0 && i < posts.length - 1 && <BannerAd className="mt-4" />}
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
