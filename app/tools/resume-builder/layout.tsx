import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Builder — Free Resume Maker Online | Formly',
  description: 'Build a professional resume in minutes with AI. Free resume maker with smart suggestions for skills, experience, and summaries — no signup required.',
  keywords: [
    'ai resume builder',
    'free resume maker online',
    'resume generator',
    'resume builder free',
    'online resume creator',
    'ai cv builder',
    'professional resume maker',
    'resume writer online',
    'free cv generator',
    'job resume builder',
  ],
  openGraph: {
    title: 'AI Resume Builder — Free Resume Maker | Formly',
    description: 'Build a professional resume in minutes with AI. Free, no signup. Smart suggestions for any job or industry.',
    url: 'https://formly.tools/tools/resume-builder',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder — Free Resume Maker | Formly',
    description: 'Build a professional resume in minutes with AI. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/resume-builder' },
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
            name: 'AI Resume Builder',
            description: 'Build a professional resume in minutes with AI-powered suggestions for skills, experience, and summaries.',
            url: 'https://formly.tools/tools/resume-builder',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-powered resume writing assistance',
              'Professional templates for any industry',
              'Smart skill and experience suggestions',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
