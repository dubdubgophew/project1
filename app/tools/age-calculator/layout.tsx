import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Age Calculator — How Old Am I? Free Date of Birth Tool | Formly',
  description: 'Calculate your exact age in years, months, and days from your date of birth for free. Instant age calculator with birthday countdown — no signup required.',
  keywords: [
    'age calculator',
    'date of birth calculator',
    'how old am i calculator',
    'exact age calculator',
    'birthday age calculator',
    'age in years months days',
    'age from date of birth',
    'dob age calculator',
    'free age calculator online',
    'birthday countdown calculator',
  ],
  openGraph: {
    title: 'Age Calculator — How Old Am I? Free Tool | Formly',
    description: 'Calculate your exact age in years, months & days from your date of birth. Free, no signup. Includes birthday countdown.',
    url: 'https://formly.tools/tools/age-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Age Calculator — How Old Am I? Free Tool | Formly',
    description: 'Calculate your exact age in years, months & days from your date of birth. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/age-calculator' },
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
            name: 'Age Calculator',
            description: 'Calculate your exact age in years, months, and days from your date of birth for free.',
            url: 'https://formly.tools/tools/age-calculator',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Exact age in years, months, and days',
              'Birthday countdown timer',
              'Age between any two dates',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
