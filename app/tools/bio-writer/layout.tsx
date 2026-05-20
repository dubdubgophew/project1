import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bio Writer — Free Professional Bio Generator | Formly',
  description: 'Generate a professional bio for LinkedIn, Instagram, Twitter, or your website for free. AI bio writer with multiple styles — no signup required.',
  keywords: [
    'bio generator',
    'professional bio writer',
    'instagram bio generator',
    'linkedin bio generator',
    'twitter bio generator',
    'free bio writer online',
    'ai bio creator',
    'short bio generator',
    'personal bio writer',
    'website bio generator',
  ],
  openGraph: {
    title: 'Bio Writer — Free Professional Bio Generator | Formly',
    description: 'Create a professional bio for LinkedIn, Instagram, or your website with AI. Free, no signup, multiple styles.',
    url: 'https://formly.tools/tools/bio-writer',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bio Writer — Free Professional Bio Generator | Formly',
    description: 'Create a professional bio for LinkedIn, Instagram, or your website with AI. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/bio-writer' },
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
            name: 'Bio Writer',
            description: 'Generate a professional bio for LinkedIn, Instagram, Twitter, or your website with AI.',
            url: 'https://formly.tools/tools/bio-writer',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-generated professional bios',
              'Platform-specific styles for LinkedIn, Instagram, Twitter',
              'Customizable tone and length',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
