import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regex Tester — Free Regular Expression Tester Online | Formly',
  description: 'Test and debug regular expressions online for free. Real-time regex tester with match highlighting and pattern explanation — no signup required.',
  keywords: [
    'regex tester',
    'regular expression tester online',
    'regex validator',
    'test regex online free',
    'regex debugger',
    'regex pattern tester',
    'online regex tool',
    'regular expression validator',
    'regex match tester',
    'javascript regex tester',
  ],
  openGraph: {
    title: 'Regex Tester — Free Regular Expression Tool | Formly',
    description: 'Test and debug regular expressions with real-time match highlighting. Free, no signup. Supports all major regex flavors.',
    url: 'https://formly.tools/tools/regex-tester',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regex Tester — Free Regular Expression Tool | Formly',
    description: 'Test and debug regular expressions with real-time match highlighting. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/regex-tester' },
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
            name: 'Regex Tester',
            description: 'Test and debug regular expressions online for free with real-time match highlighting and pattern explanation.',
            url: 'https://formly.tools/tools/regex-tester',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Real-time regex match highlighting',
              'Capture group extraction',
              'Regex pattern explanation and debugging',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
