import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What's Trending Right Now — Live News from 10 Countries | Formly",
  description:
    "Discover today's top trending news from 10 countries — USA, India, UK, Canada, Australia, Germany, France, Brazil, Japan, Indonesia & more. AI-summarized, updated daily.",
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
      'Top trending news from 10 countries, AI-summarized daily. USA, India, UK, Canada, Australia & more.',
    type: 'website',
    url: 'https://formly.tools/news',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Trending Right Now — Formly",
    description: 'Top trending news from 10 countries, AI-summarized daily.',
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
            description: 'AI-curated trending news from 10 countries, updated daily from NPR, BBC, Times of India, ABC Australia, Japan Times, and other trusted sources.',
            url: 'https://formly.tools/news',
            dateModified: new Date().toISOString().split('T')[0],
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: {
              '@type': 'Thing',
              name: 'Trending News',
              description: 'Real-time trending news and viral stories from USA, India, UK, Canada, Australia, Germany, France, Brazil, Japan, Indonesia, and more.',
            },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'de-DE', 'fr-FR', 'pt-BR', 'ja-JP', 'id-ID'],
            audience: { '@type': 'Audience', audienceType: 'Global readers seeking trending news' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How often is the trending news updated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Trending news on Formly is refreshed daily at 8am UTC. Each run fetches the latest headlines from 10 country-specific RSS feeds and generates fresh AI summaries.',
                },
              },
              {
                '@type': 'Question',
                name: 'Which countries does Formly trending news cover?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Formly covers trending news from 10 countries: United States (NPR News), India (Times of India), United Kingdom (BBC News), Canada (Global News), Australia (ABC Australia), Germany (Euronews), France (France 24), Brazil (Euronews Americas), Japan (Japan Times), and Indonesia (Antara News).',
                },
              },
              {
                '@type': 'Question',
                name: 'Are the news summaries AI-generated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Each story is analyzed by an AI model that writes a multi-paragraph summary covering what happened, why it happened, and the broader impact — plus five structured key takeaways per story.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is Formly trending news free to use?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. All news on Formly is completely free to read with no account or signup required.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I filter news by country or category?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Use the country pills to filter by a specific nation, or use the category dropdown to filter by Sports, Tech, Politics, Entertainment, Business, or Health.',
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}


