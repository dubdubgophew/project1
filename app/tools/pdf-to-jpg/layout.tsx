import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'PDF to JPG Converter — Extract PDF Pages as Images Free | Formly',
  description: 'Convert PDF pages to JPG images online for free. Extract every page as a high-quality image, download individually or all at once. No upload, works in browser.',
  keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpg online free', 'pdf page to image', 'extract pdf pages as images', 'pdf to png'],
  alternates: { canonical: 'https://formly.tools/tools/pdf-to-jpg' },
  openGraph: { title: 'Free PDF to JPG Converter Online | Formly', description: 'Convert PDF pages to JPG images free. Extract all pages, download instantly.', url: 'https://formly.tools/tools/pdf-to-jpg', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
