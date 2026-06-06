import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'PDF to JPG Converter — Extract PDF Pages as Images Free | Formly',
  description: 'Convert PDF pages to JPG images online for free. Extract every page as a high-quality image, download individually or all at once. No upload, works in browser.',
  keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpg online free', 'pdf page to image', 'extract pdf pages as images', 'pdf to png'],
  alternates: { canonical: 'https://formly.tools/tools/pdf-to-jpg' },
  openGraph: { title: 'Free PDF to JPG Converter Online | Formly', description: 'Convert PDF pages to JPG images free. Extract all pages, download instantly.', url: 'https://formly.tools/tools/pdf-to-jpg', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="PDF to JPG Converter"
        description="Free PDF to JPG converter — extract PDF pages as high-quality JPG or PNG images. Select specific pages, choose resolution, instant download. No upload needed."
        url="https://formly.tools/tools/pdf-to-jpg"
        category="UtilitiesApplication"
        features={[
          'Extract individual PDF pages as JPG or PNG images',
          'Select specific pages or extract all',
          'High resolution: 150 DPI and 300 DPI options',
          '100% browser-based — PDF never uploaded',
          'ZIP download for multiple pages',
          'Free with no account required',
        ]}
        faqs={[
          { q: 'Is PDF to JPG conversion free?', a: 'Yes — completely free with no account and no daily limits.' },
          { q: 'Are my PDFs uploaded to a server?', a: 'No — conversion happens in your browser. Your PDF never leaves your device.' },
          { q: 'What resolution are the exported images?', a: 'You can choose between 150 DPI (web-quality) and 300 DPI (print-quality) for exported images.' },
          { q: 'Can I extract specific pages?', a: 'Yes — select individual pages or page ranges to extract, rather than converting the entire PDF.' },
        ]}
        steps={[
          { name: 'Upload PDF', text: 'Click to upload or drag your PDF file. The tool displays page thumbnails for selection.' },
          { name: 'Select pages', text: 'Choose which pages to extract — all pages, specific pages, or a page range.' },
          { name: 'Download', text: 'Click Extract to JPG. Download individual images or all pages as a ZIP file.' },
        ]}
      />
      {children}
    </>
  );
}
