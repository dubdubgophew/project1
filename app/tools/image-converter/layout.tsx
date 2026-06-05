import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Converter — Convert JPG PNG WebP Free Online | Formly',
  description:
    'Convert images between JPG, PNG, WebP, and GIF formats online for free. Batch convert, no upload required. Works in your browser instantly.',
  keywords: [
    'image converter',
    'convert jpg to png',
    'convert png to webp',
    'image format converter',
    'jpg to webp',
    'png to jpg online free',
  ],
  alternates: { canonical: 'https://formly.tools/tools/image-converter' },
  openGraph: {
    title: 'Free Image Format Converter Online | Formly',
    description:
      'Convert JPG, PNG, WebP images online free. No upload, instant, works in browser.',
    url: 'https://formly.tools/tools/image-converter',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
