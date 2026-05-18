import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Contract Generator — Free Contract Template Builder | Formly',
  description: 'Generate professional contracts and legal agreements online for free. AI contract generator for freelancers, businesses, and consultants — no signup required.',
  keywords: [
    'contract generator',
    'free contract template',
    'ai contract writer',
    'online contract maker',
    'legal contract generator',
    'freelance contract generator',
    'business contract template',
    'service agreement generator',
    'nda generator free',
    'contract builder online',
  ],
  openGraph: {
    title: 'AI Contract Generator — Free Contract Builder | Formly',
    description: 'Generate professional contracts and legal agreements instantly with AI. Free, no signup. For freelancers & businesses.',
    url: 'https://formly.tools/tools/contract-generator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Contract Generator — Free Contract Builder | Formly',
    description: 'Generate professional contracts and legal agreements instantly with AI. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/contract-generator' },
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
            name: 'AI Contract Generator',
            description: 'Generate professional contracts and legal agreements online for free using AI for freelancers and businesses.',
            url: 'https://formly.tools/tools/contract-generator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-generated contract templates',
              'Covers NDAs, service agreements, and more',
              'Customizable for freelancers and businesses',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
