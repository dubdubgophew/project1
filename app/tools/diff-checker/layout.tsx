import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Diff Checker — Free Online Text Comparison Tool | Formly',
  description: 'Compare two texts and find differences instantly online for free. Side-by-side text diff checker with highlighted changes — no signup required.',
  keywords: [
    'diff checker',
    'text comparison tool',
    'online diff tool free',
    'compare two texts online',
    'text diff online',
    'file comparison tool',
    'side by side diff viewer',
    'find text differences free',
    'code diff checker',
    'text difference finder',
  ],
  openGraph: {
    title: 'Text Diff Checker — Free Online Comparison Tool | Formly',
    description: 'Compare two texts side-by-side and highlight differences instantly. Free, no signup. Great for code and document review.',
    url: 'https://formly.tools/tools/diff-checker',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Diff Checker — Free Online Comparison Tool | Formly',
    description: 'Compare two texts side-by-side and highlight differences instantly. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/diff-checker' },
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
            name: 'Text Diff Checker',
            description: 'Compare two texts and find differences instantly online for free with side-by-side highlighted changes.',
            url: 'https://formly.tools/tools/diff-checker',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Side-by-side text comparison',
              'Highlighted additions and deletions',
              'Supports code and document comparison',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
