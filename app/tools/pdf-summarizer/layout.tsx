import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Summarizer — Free Online AI Tool | Formly',
  description: 'Summarize any PDF online for free with AI. Get instant, accurate summaries of research papers, reports, and documents — no signup required.',
  keywords: [
    'pdf summarizer',
    'summarize pdf online free',
    'ai pdf summarizer',
    'pdf summary tool',
    'online pdf summarizer',
    'summarize document free',
    'ai document summarizer',
    'free pdf reader summarizer',
    'extract key points from pdf',
    'pdf text summarizer',
  ],
  openGraph: {
    title: 'PDF Summarizer — Free AI Tool | Formly',
    description: 'Instantly summarize any PDF with AI. Free, no signup. Get key insights from research papers, reports & more.',
    url: 'https://formly.tools/tools/pdf-summarizer',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF Summarizer — Free AI Tool | Formly',
    description: 'Instantly summarize any PDF with AI. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/pdf-summarizer' },
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
            name: 'PDF Summarizer',
            description: 'Summarize any PDF online for free with AI. Get instant, accurate summaries of research papers, reports, and documents.',
            url: 'https://formly.tools/tools/pdf-summarizer',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-powered PDF summarization',
              'Extracts key points and insights',
              'Supports research papers and reports',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
