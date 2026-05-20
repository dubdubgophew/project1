import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expense Splitter — Free Bill Splitter Calculator | Formly',
  description: 'Split bills and expenses fairly among friends or groups online for free. Instant expense splitter with tip and unequal split options — no signup required.',
  keywords: [
    'expense splitter',
    'bill splitter calculator',
    'split expenses online',
    'split bill free',
    'group expense calculator',
    'share bill calculator',
    'trip expense splitter',
    'restaurant bill splitter',
    'fair expense split tool',
    'online bill divider',
  ],
  openGraph: {
    title: 'Expense Splitter — Free Bill Splitter Calculator | Formly',
    description: 'Split bills and expenses fairly among groups instantly. Free, no signup. Supports tip and unequal splits.',
    url: 'https://formly.tools/tools/expense-splitter',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expense Splitter — Free Bill Splitter Calculator | Formly',
    description: 'Split bills and expenses fairly among groups instantly. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/expense-splitter' },
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
            name: 'Expense Splitter',
            description: 'Split bills and expenses fairly among friends or groups online for free with tip and unequal split options.',
            url: 'https://formly.tools/tools/expense-splitter',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Equal and unequal expense splitting',
              'Tip calculation and distribution',
              'Multiple currency support',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
