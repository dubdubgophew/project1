import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Latest in AI — Daily AI News, Tools & Research | Formly",
  description:
    "Stay ahead with the latest AI news: new tools, LLM research, GPU releases, AI startups, open source models, and breakthroughs. Curated daily from TechCrunch, VentureBeat, MIT Tech Review, Hugging Face, Google AI, and Reddit.",
  keywords: [
    'latest ai news 2025',
    'artificial intelligence news today',
    'ai tools news',
    'ai research news',
    'machine learning news',
    'llm news today',
    'openai news',
    'google ai news',
    'anthropic news',
    'ai startups news',
    'gpu ai hardware news',
    'open source ai news',
    'hugging face news',
    'ai industry updates',
    'generative ai news',
    'ai breakthroughs 2025',
    'chatgpt news',
    'claude ai news',
    'gemini ai news',
    'ai weekly digest',
  ],
  alternates: {
    canonical: 'https://formly.tools/ai-news',
  },
  openGraph: {
    title: 'Latest in AI — Daily AI News | Formly',
    description: 'Daily AI news from top sources: TechCrunch, VentureBeat, MIT Tech Review, Google AI, HuggingFace. Tools, research, companies, hardware.',
    type: 'website',
    url: 'https://formly.tools/ai-news',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest in AI — Formly',
    description: 'Daily AI news from TechCrunch, VentureBeat, MIT Tech Review, HuggingFace & more. Summarized by AI.',
  },
};

export default function AINewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Latest in AI',
            description: 'Daily curated AI news from top sources including TechCrunch, VentureBeat, MIT Technology Review, Hugging Face, Google AI Blog, and Reddit AI communities.',
            url: 'https://formly.tools/ai-news',
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: [
              { '@type': 'Thing', name: 'Artificial Intelligence', sameAs: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
              { '@type': 'Thing', name: 'Machine Learning', sameAs: 'https://en.wikipedia.org/wiki/Machine_learning' },
              { '@type': 'Thing', name: 'Large Language Models', sameAs: 'https://en.wikipedia.org/wiki/Large_language_model' },
            ],
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            inLanguage: 'en',
            audience: { '@type': 'Audience', audienceType: 'AI professionals, developers, researchers, and enthusiasts' },
            keywords: 'artificial intelligence, machine learning, LLM, GPT, Claude, Gemini, AI tools, AI research, GPU, robotics, open source AI',
          }),
        }}
      />
      {children}
    </>
  );
}

