import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pay Stub Generator — Free Paystub Maker Online | Formly',
  description: 'Create professional pay stubs online for free. Instant paycheck stub generator with accurate calculations for employees and contractors — no signup required.',
  keywords: [
    'pay stub generator',
    'paystub maker online',
    'free paycheck stub creator',
    'online paystub generator',
    'paycheck stub maker free',
    'employee pay stub creator',
    'contractor paystub generator',
    'free pay stub template',
    'instant paystub maker',
    'payroll stub generator',
  ],
  openGraph: {
    title: 'Pay Stub Generator — Free Paystub Maker | Formly',
    description: 'Create professional pay stubs instantly for free. Accurate calculations for employees and contractors. No signup needed.',
    url: 'https://formly.tools/tools/paystub-generator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pay Stub Generator — Free Paystub Maker | Formly',
    description: 'Create professional pay stubs instantly for free. No signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/paystub-generator' },
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
            name: 'Pay Stub Generator',
            description: 'Create professional pay stubs online for free with accurate calculations for employees and contractors.',
            url: 'https://formly.tools/tools/paystub-generator',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Professional pay stub creation',
              'Accurate tax and deduction calculations',
              'Supports employees and contractors',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
