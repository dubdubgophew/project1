import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Code Converter — Free HEX to RGB & CSS Tool | Formly',
  description: 'Convert color codes between HEX, RGB, HSL, and more online for free. Instant color format converter for designers and developers — no signup required.',
  keywords: [
    'color code converter',
    'hex to rgb converter',
    'color format converter',
    'rgb to hex online',
    'hsl color converter',
    'css color converter',
    'color picker online free',
    'hex color to rgb free',
    'color code tool',
    'web color converter',
  ],
  openGraph: {
    title: 'Color Code Converter — Free HEX, RGB & HSL Tool | Formly',
    description: 'Convert between HEX, RGB, HSL, and other color formats instantly. Free, no signup. Perfect for designers and developers.',
    url: 'https://formly.tools/tools/color-converter',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Code Converter — Free HEX, RGB & HSL Tool | Formly',
    description: 'Convert between HEX, RGB, HSL, and other color formats instantly. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/color-converter' },
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
            name: 'Color Code Converter',
            description: 'Convert color codes between HEX, RGB, HSL, and more online for free for designers and developers.',
            url: 'https://formly.tools/tools/color-converter',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'HEX to RGB and RGB to HEX conversion',
              'HSL, HSV, and CMYK color formats',
              'Visual color picker with preview',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
