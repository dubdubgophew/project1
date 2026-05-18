import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Markdown Converter — Free Online Tool | Formly',
  description: 'Convert PDF files to clean Markdown format online for free. Preserve headings, lists, and structure — perfect for developers and writers. No signup needed.',
  keywords: [
    'pdf to markdown converter',
    'convert pdf to markdown',
    'pdf to md free',
    'pdf markdown tool',
    'pdf to md online',
    'extract markdown from pdf',
    'pdf converter for developers',
    'free pdf to markdown',
    'markdown converter online',
    'pdf to text markdown',
  ],
  openGraph: {
    title: 'PDF to Markdown Converter — Free Online Tool | Formly',
    description: 'Convert any PDF to clean Markdown format instantly. Free, no signup. Ideal for developers, writers & content teams.',
    url: 'https://formly.tools/tools/pdf-to-markdown',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF to Markdown Converter — Free Online Tool | Formly',
    description: 'Convert any PDF to clean Markdown format instantly. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/pdf-to-markdown' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'PDF to Markdown Converter',
            description: 'Convert PDF files to clean Markdown format online, preserving headings, lists, and document structure.',
            url: 'https://formly.tools/tools/pdf-to-markdown',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Accurate PDF to Markdown conversion',
              'Preserves document headings and structure',
              'Clean output for developers and writers',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
