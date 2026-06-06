import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Image to PDF Converter — JPG PNG to PDF Free Online | Formly',
  description: 'Convert JPG, PNG, and WebP images to PDF online for free. Multiple images to one PDF, reorder pages, set margins. No upload, works in browser.',
  keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf online free', 'multiple images to pdf', 'photos to pdf'],
  alternates: { canonical: 'https://formly.tools/tools/image-to-pdf' },
  openGraph: { title: 'Free Image to PDF Converter Online | Formly', description: 'Convert JPG, PNG images to PDF free. Multiple images, reorder pages, instant download.', url: 'https://formly.tools/tools/image-to-pdf', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Image to PDF Converter"
        description="Free image to PDF converter — convert JPG, PNG, WebP images to PDF online. Multiple images in one PDF, reorder pages, set size. No upload, browser-only."
        url="https://formly.tools/tools/image-to-pdf"
        category="UtilitiesApplication"
        features={[
          'Convert multiple images to a single PDF',
          'Drag-to-reorder images before converting',
          'Supports JPG, PNG, and WebP',
          '100% browser-based — images never uploaded',
          'A4, Letter, or original image size options',
          'Free with no account required',
        ]}
        faqs={[
          { q: 'Is image to PDF conversion free?', a: 'Yes — completely free with no account, no file size limits, and no daily quotas.' },
          { q: 'Can I convert multiple images to one PDF?', a: 'Yes — upload multiple images and they are combined into a multi-page PDF. Drag to reorder before converting.' },
          { q: 'Are my images uploaded to a server?', a: 'No — all conversion happens in your browser. Your images never leave your device.' },
          { q: 'What image formats can I convert to PDF?', a: 'JPG/JPEG, PNG, and WebP are supported. Convert as many images as needed in one session.' },
        ]}
        steps={[
          { name: 'Upload images', text: 'Drag and drop JPG, PNG, or WebP images. Multiple images create a multi-page PDF.' },
          { name: 'Reorder', text: 'Drag image thumbnails to set the page order in the final PDF.' },
          { name: 'Download PDF', text: 'Click Convert to PDF to generate and download the PDF immediately.' },
        ]}
      />
      {children}
    </>
  );
}
