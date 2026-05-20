import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grammar Checker — Free Online Grammar Corrector | Formly',
  description: 'Check and fix grammar, spelling, and punctuation errors for free online. AI-powered grammar checker with instant corrections — no signup required.',
  keywords: [
    'grammar checker',
    'free grammar check online',
    'grammar corrector',
    'spelling checker',
    'punctuation checker',
    'ai grammar tool',
    'english grammar checker',
    'grammar fixer free',
    'online proofreader',
    'sentence grammar check',
  ],
  openGraph: {
    title: 'Grammar Checker — Free Online Tool | Formly',
    description: 'Fix grammar, spelling, and punctuation errors instantly with AI. Free, no signup. Write with confidence.',
    url: 'https://formly.tools/tools/grammar-checker',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grammar Checker — Free Online Tool | Formly',
    description: 'Fix grammar, spelling, and punctuation errors instantly with AI. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/grammar-checker' },
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
            name: 'Grammar Checker',
            description: 'Check and fix grammar, spelling, and punctuation errors for free with AI-powered corrections.',
            url: 'https://formly.tools/tools/grammar-checker',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI grammar and spelling correction',
              'Punctuation and style suggestions',
              'Instant real-time feedback',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
