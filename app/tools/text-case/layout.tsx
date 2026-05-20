import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Case Converter — Free Online Case Changer | Formly',
  description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, and more online for free. Instant text case converter — no signup required.',
  keywords: [
    'text case converter',
    'uppercase to lowercase',
    'camelcase converter online',
    'title case converter',
    'snake case converter',
    'lowercase to uppercase',
    'text case changer free',
    'capitalize text online',
    'camel case to snake case',
    'online case converter',
  ],
  openGraph: {
    title: 'Text Case Converter — Free Online Case Changer | Formly',
    description: 'Convert text between uppercase, lowercase, camelCase, snake_case & more instantly. Free, no signup.',
    url: 'https://formly.tools/tools/text-case',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Case Converter — Free Online Case Changer | Formly',
    description: 'Convert text between uppercase, lowercase, camelCase, snake_case & more instantly. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/text-case' },
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
            name: 'Text Case Converter',
            description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, and more online for free.',
            url: 'https://formly.tools/tools/text-case',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'UPPERCASE, lowercase, and Title Case conversion',
              'camelCase, PascalCase, snake_case, kebab-case',
              'Instant bulk text transformation',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
