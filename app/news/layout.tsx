import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What's Trending Right Now — Live News from 15 Countries | Formly",
  description:
    "Discover today's top trending news from 15 countries — USA, India, UK, Canada, Australia, Germany, France, Brazil, Japan, Indonesia & more. AI-summarized, updated every 8 hours.",
  keywords: [
    'trending news today',
    "what's trending right now",
    'top trending topics',
    'viral stories today',
    'trending worldwide',
    'breaking news trending',
    'trending in US today',
    'trending in India today',
    'trending in UK today',
    'what is trending now',
    'popular news today',
    'hot topics 2025',
    'google trends today',
    'news from multiple countries',
    'ai summarized news',
  ],
  alternates: {
    canonical: 'https://formly.tools/news',
    languages: {
      'en-US': 'https://formly.tools/news?country=US',
      'en-IN': 'https://formly.tools/news?country=IN',
      'en-GB': 'https://formly.tools/news?country=GB',
      'en-CA': 'https://formly.tools/news?country=CA',
      'en-AU': 'https://formly.tools/news?country=AU',
      'de-DE': 'https://formly.tools/news?country=DE',
      'fr-FR': 'https://formly.tools/news?country=FR',
      'pt-BR': 'https://formly.tools/news?country=BR',
      'ja-JP': 'https://formly.tools/news?country=JP',
      'id-ID': 'https://formly.tools/news?country=ID',
      'x-default': 'https://formly.tools/news',
    },
  },
  openGraph: {
    title: "What's Trending Right Now — Formly",
    description:
      'Top trending news from 15 countries, AI-summarized every 8 hours. USA, India, UK, Canada, Australia & more.',
    type: 'website',
    url: 'https://formly.tools/news',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Trending Right Now — Formly",
    description: 'Top trending news from 15 countries, AI-summarized every 8 hours.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: "What's Trending Right Now",
            description: 'AI-curated trending news from 15+ countries, updated every 8 hours.',
            url: 'https://formly.tools/news',
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: {
              '@type': 'Thing',
              name: 'Trending News',
              description: 'Real-time trending news and viral stories from USA, India, UK, Canada, Australia, Germany, France, Brazil, Japan, Indonesia, and more.',
            },
            provider: {
              '@type': 'Organization',
              name: 'Formly',
              url: 'https://formly.tools',
            },
            inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'de-DE', 'fr-FR', 'pt-BR', 'ja-JP', 'id-ID'],
            audience: {
              '@type': 'Audience',
              audienceType: 'Global readers seeking trending news',
            },
          }),
        }}
      />
      {children}
    </>
  );
}

