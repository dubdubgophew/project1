import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service Simplifier — Free TOS Explainer | Formly',
  description: 'Simplify and understand terms of service and privacy policies instantly. Free AI tool that explains legal jargon in plain English — no signup required.',
  keywords: [
    'terms of service summarizer',
    'privacy policy explainer',
    'tos simplifier',
    'terms of service explainer',
    'privacy policy summarizer',
    'legal jargon simplifier',
    'tos reader free',
    'understand privacy policy',
    'ai terms explainer',
    'simplify legal text',
  ],
  openGraph: {
    title: 'Terms of Service Simplifier — Free TOS Explainer | Formly',
    description: 'Understand any terms of service or privacy policy in plain English with AI. Free, no signup required.',
    url: 'https://formly.tools/tools/terms-simplifier',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service Simplifier — Free TOS Explainer | Formly',
    description: 'Understand any terms of service or privacy policy in plain English with AI. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/terms-simplifier' },
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
            name: 'Terms of Service Simplifier',
            description: 'Simplify and understand terms of service and privacy policies instantly with AI in plain English.',
            url: 'https://formly.tools/tools/terms-simplifier',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Converts legal jargon to plain English',
              'Summarizes key clauses and policies',
              'Highlights important terms and conditions',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
