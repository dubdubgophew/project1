import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

const BASE_URL = 'https://formly.tools';

const STATIC_ROUTES = [
  { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/tools', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/tools/pdf-summarizer', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/paraphraser', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/grammar-checker', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/email-writer', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/code-explainer', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/youtube-summarizer', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/resume-builder', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/contract-generator', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/tools/hashtag-generator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/tools/bio-writer', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
  { url: '/about', priority: 0.5, changeFrequency: 'yearly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Fetch published blog posts
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (posts) {
      blogUrls = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Supabase not configured — skip blog URLs
  }

  return [...staticUrls, ...blogUrls];
}
