import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Encoder/Decoder — Free Online Base64 Tool | Formly',
  description: 'Encode and decode Base64 strings online for free. Instant Base64 converter for text, URLs, and files — no signup required.',
  keywords: [
    'base64 encoder decoder',
    'encode base64 online',
    'base64 converter free',
    'decode base64 online',
    'base64 to text',
    'text to base64',
    'base64 string converter',
    'online base64 tool',
    'base64 url encoder',
    'base64 file encoder',
  ],
  openGraph: {
    title: 'Base64 Encoder/Decoder — Free Online Tool | Formly',
    description: 'Encode and decode Base64 strings instantly online. Free, no signup. Supports text, URLs, and file data.',
    url: 'https://formly.tools/tools/base64',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base64 Encoder/Decoder — Free Online Tool | Formly',
    description: 'Encode and decode Base64 strings instantly online. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/base64' },
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
            name: 'Base64 Encoder/Decoder',
            description: 'Encode and decode Base64 strings online for free. Supports text, URLs, and file data.',
            url: 'https://formly.tools/tools/base64',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Base64 encoding and decoding',
              'Supports text, URLs, and file data',
              'Instant conversion with copy to clipboard',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
