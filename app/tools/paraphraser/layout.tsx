import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paraphrasing Tool — Free Online Rewriter | Formly',
  description: 'Paraphrase and reword any text online for free. AI-powered paraphrasing tool for essays, articles, and content — no signup needed.',
  keywords: [
    'paraphrasing tool',
    'paraphrase online free',
    'reword text online',
    'text rewriter',
    'ai paraphraser',
    'sentence rephraser',
    'free paraphrase tool',
    'online paraphrasing',
    'rephrase text free',
    'essay paraphraser',
  ],
  openGraph: {
    title: 'Paraphrasing Tool — Free Online Rewriter | Formly',
    description: 'Reword and paraphrase any text instantly with AI. Free, no signup. Perfect for essays, articles, and content.',
    url: 'https://formly.tools/tools/paraphraser',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paraphrasing Tool — Free Online Rewriter | Formly',
    description: 'Reword and paraphrase any text instantly with AI. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/paraphraser' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'AI Paraphraser',
            description: 'Paraphrase and reword any text online for free with AI-powered technology.',
            url: 'https://formly.tools/tools/paraphraser',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-powered text paraphrasing',
              'Multiple rewriting styles',
              'Preserves original meaning',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
