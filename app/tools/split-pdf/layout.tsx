import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Split PDF — Extract & Separate PDF Pages Free Online | Formly',
  description: 'Split PDF files online for free. Extract specific pages, split by page range, or save each page as a separate PDF. No upload, works in browser.',
  keywords: ['split pdf', 'pdf splitter', 'extract pdf pages', 'separate pdf pages', 'split pdf online free', 'pdf page extractor'],
  alternates: { canonical: 'https://formly.tools/tools/split-pdf' },
  openGraph: { title: 'Free PDF Splitter — Extract PDF Pages Online | Formly', description: 'Split PDF by page range, extract pages, or save each page separately. Free, instant.', url: 'https://formly.tools/tools/split-pdf', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
