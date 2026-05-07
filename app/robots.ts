import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/settings/'],
      },
    ],
    sitemap: 'https://toolora.com/sitemap.xml',
    host: 'https://toolora.com',
  };
}
