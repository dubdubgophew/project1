import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { BLOG_POSTS } from '@/lib/blog-content';

const BASE_URL = 'https://formly.tools';

const STATIC_ROUTES: Array<{ url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; lastModified: string }> = [
  // Homepage — highest priority, crawled daily
  { url: '/', priority: 1.0, changeFrequency: 'daily', lastModified: '2026-05-31' },
  // Tools index — high value landing page
  { url: '/tools', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  // High-traffic AI tools — priority 0.8, weekly crawl
  { url: '/tools/pdf-summarizer', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/paraphraser', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/grammar-checker', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/plagiarism-checker', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-06-06' },
  // Editorial articles
  { url: '/blog/how-ats-systems-filter-resumes', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-06-06' },
  { url: '/blog/ai-job-displacement-2026-career-guide', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-06-06' },
  { url: '/blog/professional-email-writing-guide-2026', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-06-06' },
  { url: '/tools/email-writer', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/code-explainer', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/paystub-generator', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/resume-builder', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/contract-generator', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/cover-letter', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/code-reviewer', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  // Standard tools — updated May 2026
  { url: '/tools/hashtag-generator', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/bio-writer', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/json-formatter', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/base64', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/password-generator', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/pdf-to-markdown', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/word-counter', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/youtube-summarizer', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/expense-splitter', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/loan-calculator', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/unit-converter', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/age-calculator', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/text-case', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/color-converter', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/regex-tester', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/diff-checker', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/terms-simplifier', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/qr-code', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/digital-signature', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/diagrify', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/aetherboard', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-05-31' },
  { url: '/tools/hand-salary-calculator', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/income-tax-calculator', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/hra-calculator', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/gratuity-calculator', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/gst-calculator', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/sip-calculator', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/home-loan-emi-calculator', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/vibe-check', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-06-02' },
  { url: '/tools/iron-core-workout', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/tools/ats-resume-scanner', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-06-04' },
  { url: '/tools/will-ai-replace-me', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-06-04' },
  { url: '/tools/compress-image', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-05' },
  { url: '/tools/image-converter', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-05' },
  { url: '/tools/image-to-pdf', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-05' },
  { url: '/tools/merge-pdf', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-05' },
  { url: '/tools/pdf-to-jpg', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-05' },
  { url: '/tools/split-pdf', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-05' },
  { url: '/tools/bank-statement-analyzer', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-08' },
  { url: '/tools/compliance-ai', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-06-08' },
  // Comparison / alternatives pages (high-intent SEO)
  { url: '/alternatives', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  // Static marketing & informational pages
  { url: '/pricing', priority: 0.6, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/about', priority: 0.5, changeFrequency: 'monthly', lastModified: '2026-05-31' },
  { url: '/contact', priority: 0.4, changeFrequency: 'yearly', lastModified: '2024-01-15' },
  { url: '/terms', priority: 0.3, changeFrequency: 'yearly', lastModified: '2024-01-15' },
  { url: '/privacy', priority: 0.3, changeFrequency: 'yearly', lastModified: '2024-01-15' },
  { url: '/refunds', priority: 0.3, changeFrequency: 'yearly', lastModified: '2024-01-15' },
  // News & blog
  { url: '/news', priority: 0.9, changeFrequency: 'hourly', lastModified: '2026-05-31' },
  { url: '/ai-news', priority: 0.9, changeFrequency: 'hourly', lastModified: '2026-05-31' },
  { url: '/politics', priority: 0.9, changeFrequency: 'hourly', lastModified: '2026-06-05' },
  { url: '/stocks',   priority: 0.9, changeFrequency: 'hourly', lastModified: '2026-06-05' },
  { url: '/blog', priority: 0.7, changeFrequency: 'daily', lastModified: '2026-05-31' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Static tool guide blog posts (always present)
  const guideUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Dynamic blog posts from Supabase (if configured)
  let dbBlogUrls: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (posts) {
      const guideSlugs = new Set(BLOG_POSTS.map(p => p.slug));
      dbBlogUrls = posts
        .filter(p => !guideSlugs.has(p.slug))
        .map((post) => ({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.updated_at ?? now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));
    }
  } catch {
    // Supabase not configured — skip DB blog URLs
  }

  return [...staticUrls, ...guideUrls, ...dbBlogUrls];
}
