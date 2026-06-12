import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Paper Summaries — AI Science Digest | Formly',
  description:
    'Daily AI-curated research paper summaries from arXiv. Top 3 trending papers across AI, Physics, Biology, Space, Economics & more — explained in plain language for scientists, students, engineers, and curious minds worldwide.',
  keywords: [
    'arxiv research papers',
    'research paper summary',
    'ai research papers 2026',
    'machine learning papers explained',
    'physics research papers summary',
    'biology research arxiv',
    'quantum computing research',
    'astrophysics research summary',
    'economics research papers',
    'science paper explained layman',
    'research paper tldr',
    'arxiv daily papers',
    'trending research papers',
    'scientific research digest',
    'academic papers simplified',
    'research paper insights',
    'top research papers 2026',
    'science for non-specialists',
    'research breakthroughs',
    'formly research digest',
  ],
  alternates: { canonical: 'https://formly.tools/research' },
  openGraph: {
    title: 'Research Paper Summaries — AI Science Digest | Formly',
    description:
      'Daily top 3 trending research papers from arXiv — explained in plain language. AI, Physics, Biology, Space, Economics & more. Key findings, methodology, and real-world impact.',
    type: 'website',
    url: 'https://formly.tools/research',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Paper Summaries — Formly',
    description: 'Daily top 3 trending arXiv papers explained in plain language. AI, Physics, Biology, Space & more.',
  },
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Research Paper Summaries — AI Science Digest',
            description:
              'Daily AI-curated research paper summaries from arXiv. Top trending papers explained in plain language for scientists, students, engineers, and curious minds.',
            url: 'https://formly.tools/research',
            dateModified: new Date().toISOString().split('T')[0],
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: [
              { '@type': 'Thing', name: 'Scientific Research',    sameAs: 'https://en.wikipedia.org/wiki/Research' },
              { '@type': 'Thing', name: 'arXiv',                  sameAs: 'https://en.wikipedia.org/wiki/ArXiv' },
              { '@type': 'Thing', name: 'Artificial Intelligence', sameAs: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
              { '@type': 'Thing', name: 'Physics',                sameAs: 'https://en.wikipedia.org/wiki/Physics' },
              { '@type': 'Thing', name: 'Biology',                sameAs: 'https://en.wikipedia.org/wiki/Biology' },
            ],
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            inLanguage: 'en',
            audience: {
              '@type': 'Audience',
              audienceType: 'Researchers, scientists, students, engineers, doctors, teachers, and curious minds worldwide',
            },
            keywords:
              'arxiv, research papers, AI research, physics, biology, space, economics, quantum computing, machine learning, science digest, preprint, scholarly articles',
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
                name: 'Where do these research papers come from?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Papers are sourced daily from arXiv.org RSS feeds across six categories: cs.AI (Artificial Intelligence), cs.LG (Machine Learning), quant-ph (Quantum Physics), q-bio (Quantitative Biology), econ (Economics), and astro-ph (Astrophysics). arXiv is the world's largest open-access preprint repository, hosting over 2 million scholarly articles across STEM disciplines.",
                },
              },
              {
                '@type': 'Question',
                name: 'How are the top 3 papers selected each day?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'An AI research agent evaluates all new daily submissions and selects exactly 3 papers that score highest on real-world scientific significance and novelty, come from at least 2 different domains for diversity, and are most accessible to educated non-specialists. This guarantees daily variety across AI, physics, biology, economics, space, and other fields.',
                },
              },
              {
                '@type': 'Question',
                name: 'Who writes the paper summaries?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Each summary is generated by an AI research scientist trained to explain breakthrough papers to intelligent non-specialists — engineers, doctors, teachers, and business leaders. Summaries include a TL;DR (≤28 words), a 250–300 word 3-paragraph explanation (what, how, so what), 5 structured key findings, methodology, real-world use cases, and breakthrough significance.',
                },
              },
              {
                '@type': 'Question',
                name: 'How often are new papers published on Formly Research?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'New papers are fetched and summarized once daily at 12:00 UTC (noon). The feed shows papers from the last 30 days, with the most recent at the top. Filters let you browse by scientific domain (AI, Physics, Biology, Space, etc.) or impact level.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is Formly Research free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Formly Research Paper Summaries is completely free. No account, subscription, or payment required.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I read the original research paper?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Every summary card includes direct links to the original paper on arXiv.org and to the PDF. arXiv is free and open-access, so anyone can read the full paper without a paywall.',
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
