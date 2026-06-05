import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Merge PDF Files Online Free — Combine PDFs | Formly',
  description: 'Merge multiple PDF files into one PDF online for free. Drag to reorder pages, no file size limits, no upload. Works entirely in your browser.',
  keywords: ['merge pdf', 'combine pdf files', 'pdf merger online free', 'join pdf files', 'merge pdf files online', 'pdf combiner'],
  alternates: { canonical: 'https://formly.tools/tools/merge-pdf' },
  openGraph: { title: 'Free PDF Merger — Combine PDF Files Online | Formly', description: 'Merge PDF files instantly free. No upload, no size limit, works in browser.', url: 'https://formly.tools/tools/merge-pdf', type: 'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
