import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Image Compressor — Reduce File Size Up to 90% | Formly',
  description:
    'Compress JPG, PNG & WebP images online free — up to 90% size reduction without quality loss. 100% in-browser, no upload, no signup. Instant download. Free TinyPNG & Squoosh alternative.',
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
  return (
    <>
      <ToolSchemas
        name="Image Compressor"
        description="Free online image compressor — reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss. 100% in-browser, no upload, instant download."
        url="https://formly.tools/tools/compress-image"
        category="MultimediaApplication"
        features={[
          'Up to 90% file size reduction',
          'Supports JPG, PNG, and WebP formats',
          '100% browser-based — files never uploaded',
          'Batch processing — compress multiple images',
          'Adjustable quality slider',
          'Instant download, no account required',
        ]}
        faqs={[
          { q: 'Is image compression free?', a: 'Yes — completely free with no signup, no account, and no daily limits. All processing happens in your browser.' },
          { q: 'How much can I compress images?', a: 'JPG and WebP images can be reduced by 60–90% with minimal visible quality loss. PNG files compress by 20–50% losslessly.' },
          { q: 'Does compressing images affect quality?', a: 'Minimal impact at standard settings. Use the quality slider to balance file size vs image quality for your use case.' },
          { q: 'What image formats are supported?', a: 'JPG/JPEG, PNG, and WebP formats are all supported. HEIC and GIF are not currently supported.' },
          { q: 'Is my image data private?', a: 'Yes — images are processed entirely in your browser and never uploaded to any server.' },
        ]}
        steps={[
          { name: 'Upload images', text: 'Drag and drop or click to upload JPG, PNG, or WebP images. Multiple files supported.' },
          { name: 'Adjust quality', text: 'Use the quality slider to set compression level (10–100%). Default 80% balances quality and size.' },
          { name: 'Download', text: 'Click Download to save the compressed image, or Download All for batch compression as a ZIP file.' },
        ]}
      />
      {children}
    </>
  );
}
