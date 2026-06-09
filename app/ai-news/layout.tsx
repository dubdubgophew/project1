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
            name: 'Latest in AI — Daily AI News',
            description: 'Daily curated AI news from TechCrunch, VentureBeat, MIT Technology Review, Hugging Face, Google AI Blog, and Reddit. Covers tools, research, companies, hardware, and open source.',
            url: 'https://formly.tools/ai-news',
            dateModified: new Date().toISOString().split('T')[0],
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: [
              { '@type': 'Thing', name: 'Artificial Intelligence', sameAs: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
              { '@type': 'Thing', name: 'Machine Learning', sameAs: 'https://en.wikipedia.org/wiki/Machine_learning' },
              { '@type': 'Thing', name: 'Large Language Models', sameAs: 'https://en.wikipedia.org/wiki/Large_language_model' },
              { '@type': 'Thing', name: 'Generative AI', sameAs: 'https://en.wikipedia.org/wiki/Generative_artificial_intelligence' },
            ],
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            inLanguage: 'en',
            audience: { '@type': 'Audience', audienceType: 'AI professionals, developers, researchers, and enthusiasts' },
            keywords: 'artificial intelligence, machine learning, LLM, GPT, Claude, Gemini, AI tools, AI research, GPU, robotics, open source AI, ChatGPT, generative AI',
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
                name: 'What sources does Formly AI News cover?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Formly AI News aggregates stories from TechCrunch, VentureBeat, MIT Technology Review, Hugging Face blog, Google AI Blog, Reddit r/MachineLearning, Reddit r/artificial, and other leading AI publications and communities.',
                },
              },
              {
                '@type': 'Question',
                name: 'What categories of AI news are available?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'AI news is organized into seven categories: Tools (new AI products and APIs), Research (papers and breakthroughs), Companies (funding, acquisitions, partnerships), Hardware (GPUs, chips, data centers), Learning (tutorials and explainers), Open Source (open models and frameworks), and Industry (enterprise AI, regulation, policy).',
                },
              },
              {
                '@type': 'Question',
                name: 'How is each AI news story summarized?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Each story is processed by an AI analyst that writes a 230–270 word analysis across three angles: what happened (facts, benchmarks, model names), why it happened (competitive dynamics, research trends, funding context), and the broader impact on developers, businesses, and the AI ecosystem.',
                },
              },
              {
                '@type': 'Question',
                name: 'How often is the AI news updated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'AI news is refreshed daily at 9am UTC, pulling the latest items from all configured sources and generating fresh summaries for new articles.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is Formly AI News free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. All AI news on Formly is completely free with no account, subscription, or signup required.',
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


