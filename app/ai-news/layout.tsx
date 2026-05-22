import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Latest in AI — Formly",
  description:
    "Stay ahead with the latest AI news, tools, research, and breakthroughs. Curated daily from TechCrunch, VentureBeat, MIT Tech Review, Hugging Face, Google AI, Reddit and more.",
  keywords: [
    'latest ai news',
    'artificial intelligence news',
    'ai tools 2025',
    'ai research breakthroughs',
    'machine learning news',
    'llm news',
    'openai news',
    'google ai news',
    'ai startups funding',
    'gpu news',
    'ai hardware',
    'robotics news',
    'hugging face',
    'open source ai',
    'ai industry news',
  ],
  alternates: {
    canonical: 'https://formly.tools/ai-news',
  },
  openGraph: {
    title: 'Latest in AI — Formly',
    description: 'Daily AI news from the best sources: tools, research, companies, hardware, and more. AI-summarized.',
    type: 'website',
    url: 'https://formly.tools/ai-news',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest in AI — Formly',
    description: 'Daily AI news from the best sources, summarized by AI.',
  },
};

export default function AINewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
