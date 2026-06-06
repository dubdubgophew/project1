import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Merge PDF Files Free Online — Combine & Reorder PDFs | Formly',
  description: 'Merge multiple PDF files into one PDF online, free. Drag to reorder, no file size limits, no upload to servers, no account required. Free Smallpdf and iLovePDF alternative.',
  keywords: ['merge pdf', 'combine pdf files', 'pdf merger online free', 'join pdf files', 'merge pdf files online', 'pdf combiner'],
  alternates: { canonical: 'https://formly.tools/tools/merge-pdf' },
  openGraph: { title: 'Free PDF Merger — Combine PDF Files Online | Formly', description: 'Merge PDF files instantly free. No upload, no size limit, works in browser.', url: 'https://formly.tools/tools/merge-pdf', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="PDF Merger"
        description="Free online PDF merger — combine multiple PDF files into one. Drag to reorder, no upload required, works entirely in browser. No file size limits."
        url="https://formly.tools/tools/merge-pdf"
        category="UtilitiesApplication"
        features={[
          'Combine unlimited PDFs into one file',
          'Drag-to-reorder pages before merging',
          '100% browser-based — PDFs never uploaded',
          'No file size limits',
          'Instant download, no account required',
          'Works in Chrome, Firefox, Safari, Edge',
        ]}
        faqs={[
          { q: 'Is merging PDFs free?', a: 'Yes — completely free with no account, no daily limits, and no file size restrictions.' },
          { q: 'Are my PDF files uploaded to a server?', a: "No — Formly's PDF merger works entirely in your browser using PDF.js. Your files never leave your device." },
          { q: 'How many PDFs can I merge at once?', a: 'There is no hard limit — merge as many PDFs as your device memory can handle. Most users merge 5–20 files without issues.' },
          { q: 'Can I reorder pages before merging?', a: 'Yes — drag the PDF thumbnails into the order you want before clicking Merge.' },
          { q: 'What is the maximum file size for merging?', a: "There is no server-enforced limit since processing is in-browser. File size is limited only by your device's available memory." },
        ]}
        steps={[
          { name: 'Upload PDFs', text: 'Drag and drop multiple PDF files or click to upload. Each PDF is shown as a thumbnail card.' },
          { name: 'Reorder', text: 'Drag the PDF cards into the desired order for the merged output.' },
          { name: 'Merge and download', text: 'Click Merge PDFs to combine all files. The merged PDF downloads automatically.' },
        ]}
      />
      {children}
    </>
  );
}
