import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All crawlers: allow public site, block private areas
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/dashboard', '/settings', '/login', '/signup'],
      },
      // Googlebot: explicit allow for key SEO paths
      {
        userAgent: 'Googlebot',
        allow: ['/', '/tools/', '/blog/', '/pricing', '/about', '/news', '/ai-news', '/alternatives', '/contact'],
        disallow: ['/admin', '/api/', '/dashboard', '/settings', '/login', '/signup'],
      },
      // Bingbot
      {
        userAgent: 'Bingbot',
        allow: ['/', '/tools/', '/blog/', '/pricing', '/about', '/news', '/ai-news'],
        disallow: ['/admin', '/api/', '/dashboard', '/settings', '/login', '/signup'],
      },
      // Allow AI training crawlers (GPTBot, Claude, etc.) — boosts GEO
      {
        userAgent: 'GPTBot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'YouBot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Applebot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Bytespider',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'DuckDuckBot',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'cohere-ai',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Meta-ExternalAgent',
        allow: ['/', '/tools/', '/blog/', '/news', '/ai-news'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: 'https://formly.tools/sitemap.xml',
    host: 'https://formly.tools',
  };
}
