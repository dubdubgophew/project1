import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

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
  return (
    <>
      <ToolSchemas
        name="Image Format Converter"
        description="Free image format converter — convert between JPG, PNG, and WebP online. Batch conversion, quality settings, 100% browser-based. No upload. Free."
        url="https://formly.tools/tools/image-converter"
        category="MultimediaApplication"
        features={[
          'Convert between JPG, PNG, and WebP formats',
          'Batch conversion — multiple images at once',
          'Adjustable quality for JPG and WebP output',
          '100% browser-based — images never uploaded',
          'Instant download',
          'Free with no account required',
        ]}
        faqs={[
          { q: 'Which image formats can I convert between?', a: 'Convert between JPG/JPEG, PNG, and WebP in any direction. All combinations are supported.' },
          { q: 'Are my images uploaded to a server?', a: 'No — all conversion happens in your browser. Your images never leave your device.' },
          { q: 'Why convert PNG to WebP?', a: 'WebP files are typically 25–34% smaller than PNG with similar quality, improving website load times and Core Web Vitals scores.' },
          { q: 'Is image conversion free?', a: 'Yes — completely free with no account, no daily limits, and no file size restrictions.' },
        ]}
        steps={[
          { name: 'Upload images', text: 'Upload JPG, PNG, or WebP images. Multiple files supported for batch conversion.' },
          { name: 'Select output format', text: 'Choose the target format: JPG, PNG, or WebP. Set quality for JPG/WebP output.' },
          { name: 'Download', text: 'Converted images download instantly. Multiple images download as a ZIP file.' },
        ]}
      />
      {children}
    </>
  );
}
