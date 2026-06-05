import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor — Reduce Image Size Free Online | Formly',
  description:
    'Compress JPG, PNG, and WebP images online for free. Reduce file size by up to 90% without losing quality. No upload, works in your browser. Instant download.',
  keywords: [
    'image compressor',
    'compress image online',
    'reduce image size',
    'jpg compressor',
    'png compressor',
    'webp compressor',
    'image optimizer free',
  ],
  alternates: { canonical: 'https://formly.tools/tools/compress-image' },
  openGraph: {
    title: 'Free Image Compressor — Reduce File Size Online | Formly',
    description:
      'Compress JPG, PNG, WebP images without losing quality. 100% free, no upload, works in browser.',
    url: 'https://formly.tools/tools/compress-image',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
