import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unit Converter — Free Online Measurement Converter | Formly',
  description: 'Convert units of length, weight, temperature, volume, and more online for free. Instant unit conversion calculator — no signup required.',
  keywords: [
    'unit converter',
    'measurement converter online',
    'unit conversion calculator',
    'free unit converter',
    'length unit converter',
    'weight converter online',
    'temperature converter free',
    'volume converter online',
    'metric to imperial converter',
    'online measurement tool',
  ],
  openGraph: {
    title: 'Unit Converter — Free Online Measurement Tool | Formly',
    description: 'Convert length, weight, temperature, volume & more instantly. Free, no signup. Covers metric, imperial & more.',
    url: 'https://formly.tools/tools/unit-converter',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unit Converter — Free Online Measurement Tool | Formly',
    description: 'Convert length, weight, temperature, volume & more instantly. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/unit-converter' },
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
            name: 'Unit Converter',
            description: 'Convert units of length, weight, temperature, volume, and more online for free with instant results.',
            url: 'https://formly.tools/tools/unit-converter',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Converts length, weight, temperature, and volume',
              'Metric and imperial unit support',
              'Instant real-time conversion',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
