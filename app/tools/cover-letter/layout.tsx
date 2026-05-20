import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cover Letter Generator — Free AI Cover Letter Builder | Formly',
  description: 'Write a compelling cover letter in minutes with AI. Free cover letter generator for any job, industry, or experience level — no signup required.',
  keywords: [
    'cover letter generator',
    'ai cover letter writer',
    'free cover letter builder',
    'cover letter maker online',
    'professional cover letter generator',
    'job application cover letter',
    'cover letter creator free',
    'ai cover letter tool',
    'cover letter template generator',
    'instant cover letter writer',
  ],
  openGraph: {
    title: 'Cover Letter Generator — Free AI Tool | Formly',
    description: 'Write a compelling cover letter for any job in minutes with AI. Free, no signup, tailored to your experience.',
    url: 'https://formly.tools/tools/cover-letter',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cover Letter Generator — Free AI Tool | Formly',
    description: 'Write a compelling cover letter for any job in minutes with AI. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/cover-letter' },
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
            name: 'Cover Letter Generator',
            description: 'Write a compelling cover letter in minutes with AI for any job, industry, or experience level.',
            url: 'https://formly.tools/tools/cover-letter',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-generated personalized cover letters',
              'Tailored to specific job descriptions',
              'Multiple tones and professional styles',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
