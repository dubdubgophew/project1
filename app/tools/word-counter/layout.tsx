import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Counter — Free Online Character & Word Count Tool | Formly',
  description: 'Count words, characters, sentences, and paragraphs online for free. Instant word counter with reading time estimate — no signup required.',
  keywords: [
    'word counter',
    'character counter online',
    'word count tool free',
    'online word counter',
    'character count tool',
    'text word counter',
    'word and character counter',
    'sentence counter',
    'paragraph counter',
    'reading time calculator',
  ],
  openGraph: {
    title: 'Word Counter — Free Online Character & Word Count Tool | Formly',
    description: 'Count words, characters, sentences & paragraphs instantly. Free, no signup. Includes reading time estimate.',
    url: 'https://formly.tools/tools/word-counter',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Word Counter — Free Online Character & Word Count Tool | Formly',
    description: 'Count words, characters, sentences & paragraphs instantly. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/word-counter' },
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
            name: 'Word Counter',
            description: 'Count words, characters, sentences, and paragraphs online for free with reading time estimates.',
            url: 'https://formly.tools/tools/word-counter',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Real-time word and character counting',
              'Sentence and paragraph count',
              'Estimated reading time calculator',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
