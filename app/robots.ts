import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All crawlers: allow public site, block private areas
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/settings/'],
      },
      // Googlebot: explicit allow for key SEO paths
      {
        userAgent: 'Googlebot',
        allow: ['/', '/tools/', '/blog/', '/pricing', '/about'],
        disallow: ['/admin/', '/api/', '/dashboard/', '/settings/'],
      },
      // Bingbot
      {
        userAgent: 'Bingbot',
        allow: ['/', '/tools/', '/blog/', '/pricing', '/about'],
        disallow: ['/admin/', '/api/', '/dashboard/', '/settings/'],
      },
      // Allow AI training crawlers (GPTBot, Claude, etc.) — boosts GEO
      {
        userAgent: 'GPTBot',
        allow: ['/', '/tools/', '/blog/'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/tools/', '/blog/'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/tools/', '/blog/'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/tools/', '/blog/'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: 'https://formly.tools/sitemap.xml',
    host: 'https://formly.tools',
  };
}
