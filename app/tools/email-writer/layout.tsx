import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Email Writer — Free Professional Email Generator | Formly',
  description: 'Write professional emails in seconds with AI. Free email writer for business, follow-ups, cold outreach, and more — no signup required.',
  keywords: [
    'ai email writer',
    'email generator',
    'professional email writer free',
    'email writing tool',
    'business email generator',
    'cold email writer',
    'free email writer online',
    'ai email composer',
    'email template generator',
    'automated email writer',
  ],
  openGraph: {
    title: 'AI Email Writer — Free Professional Email Generator | Formly',
    description: 'Generate professional emails in seconds with AI. Free, no signup. Perfect for business, outreach & follow-ups.',
    url: 'https://formly.tools/tools/email-writer',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Email Writer — Free Email Generator | Formly',
    description: 'Generate professional emails in seconds with AI. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/email-writer' },
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
            name: 'AI Email Writer',
            description: 'Write professional emails in seconds with AI for business, follow-ups, cold outreach, and more.',
            url: 'https://formly.tools/tools/email-writer',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-generated professional emails',
              'Multiple email tones and styles',
              'Business and cold outreach templates',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
