import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loan Calculator & EMI Calculator — Free Mortgage Tool | Formly',
  description: 'Calculate loan EMI, total interest, and repayment schedule for free online. Free loan and mortgage calculator for any interest rate and term — no signup required.',
  keywords: [
    'loan calculator',
    'emi calculator',
    'mortgage calculator online free',
    'loan emi calculator',
    'monthly payment calculator',
    'interest rate calculator',
    'home loan calculator',
    'personal loan calculator',
    'loan repayment calculator',
    'amortization calculator free',
  ],
  openGraph: {
    title: 'Loan Calculator & EMI Calculator — Free Tool | Formly',
    description: 'Calculate loan EMI, total interest & repayment schedule instantly. Free, no signup. Works for any loan or mortgage.',
    url: 'https://formly.tools/tools/loan-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loan Calculator & EMI Calculator — Free Tool | Formly',
    description: 'Calculate loan EMI, total interest & repayment schedule instantly. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/loan-calculator' },
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
            name: 'Loan Calculator & EMI Calculator',
            description: 'Calculate loan EMI, total interest, and repayment schedule for free online for any loan or mortgage.',
            url: 'https://formly.tools/tools/loan-calculator',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Monthly EMI calculation',
              'Total interest and cost breakdown',
              'Full amortization schedule',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
