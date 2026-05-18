import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Password Generator — Free Strong Password Maker | Formly',
  description: 'Generate strong, secure, and random passwords instantly for free. Customizable password generator with length, symbols, and strength options — no signup required.',
  keywords: [
    'password generator',
    'strong password generator',
    'random password maker',
    'secure password generator',
    'free password generator online',
    'complex password creator',
    'password strength generator',
    'random secure password',
    'online password maker',
    'best password generator',
  ],
  openGraph: {
    title: 'Password Generator — Free Strong Password Maker | Formly',
    description: 'Generate strong, secure, random passwords instantly. Free, no signup. Customizable length, symbols, and complexity.',
    url: 'https://formly.tools/tools/password-generator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Password Generator — Free Strong Password Maker | Formly',
    description: 'Generate strong, secure, random passwords instantly. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/password-generator' },
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
            name: 'Password Generator',
            description: 'Generate strong, secure, and random passwords instantly for free with customizable options.',
            url: 'https://formly.tools/tools/password-generator',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Cryptographically strong random passwords',
              'Customizable length and character sets',
              'Password strength indicator',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
