import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Split PDF — Extract & Separate PDF Pages Free Online | Formly',
  description: 'Split PDF files online for free. Extract specific pages, split by page range, or save each page as a separate PDF. No upload, works in browser.',
  keywords: ['split pdf', 'pdf splitter', 'extract pdf pages', 'separate pdf pages', 'split pdf online free', 'pdf page extractor'],
  alternates: { canonical: 'https://formly.tools/tools/split-pdf' },
  openGraph: { title: 'Free PDF Splitter — Extract PDF Pages Online | Formly', description: 'Split PDF by page range, extract pages, or save each page separately. Free, instant.', url: 'https://formly.tools/tools/split-pdf', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="PDF Splitter"
        description="Free PDF splitter — extract pages from PDF online. Split by page range, extract individual pages, or split every page. No upload, 100% in-browser. Free."
        url="https://formly.tools/tools/split-pdf"
        category="UtilitiesApplication"
        features={[
          'Split by specific page ranges',
          'Extract individual pages',
          'Split every page into separate PDFs',
          '100% browser-based — PDF never uploaded',
          'ZIP download for multiple outputs',
          'Free with no account required',
        ]}
        faqs={[
          { q: 'Is splitting PDFs free?', a: 'Yes — completely free with no account, no daily limits, and no file size restrictions.' },
          { q: 'Are my PDFs uploaded to a server?', a: 'No — PDF splitting works entirely in your browser. Your files never leave your device.' },
          { q: "Can I split a large PDF?", a: "Yes — the only limit is your device's memory. Most PDFs up to 200MB work without issues." },
          { q: 'How are split PDFs downloaded?', a: 'Single page extractions download as one PDF. Multiple pages download as a ZIP file containing individual PDFs.' },
        ]}
        steps={[
          { name: 'Upload PDF', text: 'Upload your PDF file. Page thumbnails are displayed for easy selection.' },
          { name: 'Choose split method', text: 'Select pages to extract, define page ranges (e.g., 1-5, 8, 10-12), or split every page.' },
          { name: 'Download', text: 'Click Split PDF to process. Downloads as a single PDF or ZIP for multiple outputs.' },
        ]}
      />
      {children}
    </>
  );
}
