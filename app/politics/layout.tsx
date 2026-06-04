import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politics Trending & Latest — Global Political News | Formly',
  description: 'Follow global politics in real time. AI-summarized political news from USA, India, UK, Canada, Australia, Europe & more. Updated daily. No signup required.',
  keywords: [
    'political news today', 'trending politics', 'global politics news', 'latest political news',
    'politics usa today', 'india politics news', 'uk politics today', 'world politics',
    'political news ai summarized', 'election news', 'government news', 'parliament news',
    'congress news', 'political trending topics', 'politics news no signup',
  ],
  alternates: { canonical: 'https://formly.tools/politics' },
  openGraph: {
    title: 'Politics Trending & Latest — Formly',
    description: 'AI-summarized political news from 10+ countries. Trending politics, elections, government news — updated daily.',
    type: 'website',
    url: 'https://formly.tools/politics',
  },
};

export default function PoliticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
