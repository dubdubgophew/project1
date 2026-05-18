import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator — Free JSON Beautifier | Formly',
  description: 'Format, validate, and beautify JSON online for free. Instant JSON formatter with syntax highlighting and error detection — no signup required.',
  keywords: [
    'json formatter',
    'json validator online',
    'json beautifier free',
    'format json online',
    'json pretty printer',
    'json minifier',
    'validate json free',
    'json editor online',
    'json parser tool',
    'json syntax checker',
  ],
  openGraph: {
    title: 'JSON Formatter & Validator — Free Online Tool | Formly',
    description: 'Format, validate, and beautify JSON instantly. Free, no signup. Syntax highlighting and error detection included.',
    url: 'https://formly.tools/tools/json-formatter',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatter & Validator — Free Online Tool | Formly',
    description: 'Format, validate, and beautify JSON instantly. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/json-formatter' },
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
            name: 'JSON Formatter & Validator',
            description: 'Format, validate, and beautify JSON online for free with syntax highlighting and error detection.',
            url: 'https://formly.tools/tools/json-formatter',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'JSON formatting and beautification',
              'JSON validation and error detection',
              'JSON minification and compression',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
