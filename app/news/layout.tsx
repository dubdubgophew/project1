import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What's Trending Right Now — Formly Trending News",
  description:
    "Discover today's top trending topics from 10 countries — United States, India, UK, Canada, Australia, Germany, France, Brazil, Japan, and Indonesia. Updated daily by AI.",
  keywords: [
    'trending news',
    "what's trending today",
    'google trends',
    'viral stories',
    'trending topics',
    'top trending searches',
    'news today',
    'breaking news trends',
    'trending worldwide',
    'trending in US',
    'trending in India',
    'trending in UK',
    'what is trending now',
    'popular topics today',
    'hot topics 2025',
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
      'Top 5 trending topics from 10 countries, summarized by AI. Updated daily.',
    type: 'website',
    url: 'https://formly.tools/news',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Trending Right Now — Formly",
    description: 'Top trending topics from 10 countries, AI-summarized daily.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
