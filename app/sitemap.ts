import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { BLOG_POSTS } from '@/lib/blog-content';

const BASE_URL = 'https://formly.tools';

const STATIC_ROUTES = [
  // Homepage — highest priority, crawled daily
  { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
  // Tools index — high value landing page
  { url: '/tools', priority: 0.9, changeFrequency: 'weekly' as const },
  // High-traffic AI tools — priority 0.8, weekly crawl
  { url: '/tools/pdf-summarizer', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/paraphraser', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/grammar-checker', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/email-writer', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/code-explainer', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/paystub-generator', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/resume-builder', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/contract-generator', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/cover-letter', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tools/code-reviewer', priority: 0.8, changeFrequency: 'weekly' as const },
  // Standard tools — priority 0.8, monthly crawl
  { url: '/tools/hashtag-generator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/bio-writer', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/json-formatter', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/base64', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/password-generator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/pdf-to-markdown', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/word-counter', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/youtube-summarizer', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/expense-splitter', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/loan-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/unit-converter', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/age-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/text-case', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/color-converter', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/regex-tester', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/diff-checker', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/terms-simplifier', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/qr-code', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/digital-signature', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/diagrify', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/tools/hand-salary-calculator', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/income-tax-calculator', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/hra-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/gratuity-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/gst-calculator', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/sip-calculator', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/home-loan-emi-calculator', priority: 0.9, changeFrequency: 'monthly' as const },
  // Comparison / alternatives pages (high-intent SEO)
  { url: '/alternatives', priority: 0.8, changeFrequency: 'monthly' as const },
  // Static marketing & informational pages
  { url: '/pricing', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/contact', priority: 0.4, changeFrequency: 'yearly' as const },
  { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/refunds', priority: 0.3, changeFrequency: 'yearly' as const },
  // News & blog
  { url: '/news', priority: 0.9, changeFrequency: 'hourly' as const },
  { url: '/ai-news', priority: 0.9, changeFrequency: 'hourly' as const },
  { url: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: now,
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
