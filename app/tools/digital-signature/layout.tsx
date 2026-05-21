import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Digital Signature Creator — Draw, Type or Upload & Sign Documents | Formly',
  description:
    'Create professional digital signatures free — draw with mouse or touch, type in elegant fonts, or upload. Place on any document, save locally, download PNG. No account needed.',
  keywords: [
    'digital signature',
    'electronic signature',
    'free e-signature',
    'sign documents online',
    'digital signature creator',
    'draw signature online',
    'free docusign alternative',
    'esignature free',
    'online signature maker',
    'sign PDF online free',
  ],
  openGraph: {
    title: 'Free Digital Signature Creator | Formly',
    description:
      'Draw, type, or upload your signature. Place on documents. Download signed files. Free — no account needed.',
    url: 'https://formly.tools/tools/digital-signature',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Digital Signature Creator | Formly',
    description:
      'Create professional e-signatures free. Draw, type, or upload. Place on documents. No DocuSign account needed.',
  },
  alternates: { canonical: 'https://formly.tools/tools/digital-signature' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Digital Signature Creator"
        description="Create professional digital signatures free — draw with mouse or touch, type in elegant fonts, or upload. Place on any document, save locally, download PNG. No account needed."
        url="https://formly.tools/tools/digital-signature"
        category="UtilitiesApplication"
        features={[
          'Draw signature with mouse or touchscreen',
          'Type signature in 6 professional script fonts',
          'Upload existing signature image',
          'Place signature on any document image',
          'Resize and reposition signature on document',
          'Download signed document as PNG',
          'Initials generator from typed name',
          'Save up to 6 signatures in browser',
          'Timestamped signature certificate',
          'Works entirely in browser — no data uploaded',
        ]}
        faqs={[
          {
            q: 'Is this digital signature legally binding?',
            a: 'For most informal business agreements, freelance contracts, and personal documents: yes. The US ESIGN Act and EU eIDAS Regulation both recognize electronic signatures as legally valid. Download the signature certificate as your audit trail.',
          },
          {
            q: 'Can I sign a PDF?',
            a: 'Export a page from your PDF as a PNG image, upload it to the document placement feature, add your signature, and download. For multi-page PDFs, process each page separately.',
          },
          {
            q: 'Is my document uploaded to any server?',
            a: 'No. Everything happens in your browser. Your document, signature, and certificate never leave your device.',
          },
          {
            q: 'Can I use a stylus or Apple Pencil?',
            a: 'Yes. The drawing canvas uses Pointer Events which support all input devices including stylus and Apple Pencil.',
          },
        ]}
      />
      {children}
    </>
  );
}
