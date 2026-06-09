import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politics Trending & Latest — Global Political News | Formly',
  description: 'Follow global politics in real time. AI-summarized political news from USA, India, UK, Canada, Australia, Europe & more. Elections, government, parliament, foreign policy — updated daily.',
  keywords: [
    'political news today', 'trending politics', 'global politics news', 'latest political news',
    'politics usa today', 'india politics news', 'uk politics today', 'world politics',
    'political news ai summarized', 'election news', 'government news', 'parliament news',
    'congress news', 'political trending topics', 'politics news no signup',
    'eu politics news', 'foreign policy news', 'geopolitics news 2025',
  ],
  alternates: {
    canonical: 'https://formly.tools/politics',
    languages: {
      'en-US': 'https://formly.tools/politics?country=US',
      'en-IN': 'https://formly.tools/politics?country=IN',
      'en-GB': 'https://formly.tools/politics?country=GB',
      'en-CA': 'https://formly.tools/politics?country=CA',
      'en-AU': 'https://formly.tools/politics?country=AU',
      'de-DE': 'https://formly.tools/politics?country=DE',
      'fr-FR': 'https://formly.tools/politics?country=FR',
      'pt-BR': 'https://formly.tools/politics?country=BR',
      'es-ES': 'https://formly.tools/politics?country=ES',
      'x-default': 'https://formly.tools/politics',
    },
  },
  openGraph: {
    title: 'Politics Trending & Latest — Formly',
    description: 'AI-summarized political news from 10+ countries. Elections, government, parliament, foreign policy — updated daily.',
    type: 'website',
    url: 'https://formly.tools/politics',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Politics Trending & Latest — Formly',
    description: 'AI-summarized political news from USA, India, UK, Canada, Australia, Europe & more. Updated daily.',
  },
};

export default function PoliticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Politics Trending & Latest — Global Political News',
            description: 'AI-summarized political news from 10+ countries. Covers elections, legislation, government decisions, parliament, foreign policy, and geopolitics across USA, India, UK, Canada, Australia, Europe, and beyond.',
            url: 'https://formly.tools/politics',
            dateModified: new Date().toISOString().split('T')[0],
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: [
              { '@type': 'Thing', name: 'Political News', description: 'Coverage of elections, government decisions, legislation, and political events worldwide.' },
              { '@type': 'Thing', name: 'Geopolitics', sameAs: 'https://en.wikipedia.org/wiki/Geopolitics' },
              { '@type': 'Thing', name: 'Elections', sameAs: 'https://en.wikipedia.org/wiki/Election' },
            ],
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'de-DE', 'fr-FR', 'pt-BR', 'es-ES'],
            audience: { '@type': 'Audience', audienceType: 'Global readers interested in politics, elections, and government' },
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
                name: 'Which political news sources does Formly use?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Formly Politics aggregates from NPR Politics, The Hill, BBC Politics, The Wire (India), NDTV Politics, CBC Politics, ABC Australia Politics, Euractiv, Al Jazeera, Reuters Politics, Le Monde (French), France 24, Der Spiegel (German), Zeit Online, El País (Spanish), El Mundo, Folha de São Paulo, and G1 Política.',
                },
              },
              {
                '@type': 'Question',
                name: 'Which countries\' politics does Formly cover?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Formly covers political news from the United States, India, United Kingdom, Canada, Australia, Germany, France, Spain, Brazil, and global geopolitics via Al Jazeera and Reuters.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is political news available in languages other than English?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Political news on Formly is available in English, French (Le Monde, France 24), German (Der Spiegel, Zeit Online), Spanish (El País, El Mundo), and Portuguese (Folha de São Paulo, G1). Use the Language filter on the page to switch.',
                },
              },
              {
                '@type': 'Question',
                name: 'How is each political news story summarized?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Each story is analyzed by a senior political AI analyst that covers: the specific political facts (what happened, key actors, vote counts), the political causes (party dynamics, public pressure, historical context), and the real-world impact on citizens, governance, and international relations — with an editorial assessment of significance.',
                },
              },
              {
                '@type': 'Question',
                name: 'How often is political news updated on Formly?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Political news is refreshed daily at 1pm UTC, pulling from 18 dedicated political RSS feeds across 9 countries and 5 languages.',
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

