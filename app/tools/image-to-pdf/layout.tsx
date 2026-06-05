import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Image to PDF Converter — JPG PNG to PDF Free Online | Formly',
  description: 'Convert JPG, PNG, and WebP images to PDF online for free. Multiple images to one PDF, reorder pages, set margins. No upload, works in browser.',
  keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf online free', 'multiple images to pdf', 'photos to pdf'],
  alternates: { canonical: 'https://formly.tools/tools/image-to-pdf' },
  openGraph: { title: 'Free Image to PDF Converter Online | Formly', description: 'Convert JPG, PNG images to PDF free. Multiple images, reorder pages, instant download.', url: 'https://formly.tools/tools/image-to-pdf', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
