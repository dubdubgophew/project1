import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@/components/shared/GoogleAnalytics';
import { AdSenseScript } from '@/components/shared/AdSense';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools'),
  title: {
    default: 'Formly — 28 Free AI Tools for Writers, Devs & Professionals',
    template: '%s | Formly',
  },
  description:
    'Free AI tools: PDF summarizer, paraphraser, grammar checker, email writer, pay stub generator, resume builder & more. Powered by Groq AI. No signup needed.',
  keywords: [
    'free ai tools',
    'pay stub generator',
    'paystub generator free',
    'ai pdf summarizer',
    'ai paraphraser',
    'grammar checker free',
    'ai email writer',
    'resume builder ai',
    'ai contract generator',
    'code explainer ai',
    'ai hashtag generator',
    'online ai tools',
    'free ai writing tools',
  ],
  authors: [{ name: 'Formly' }],
  creator: 'Formly',
  publisher: 'Formly',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://formly.tools',
    siteName: 'Formly',
    title: 'Formly — 28 Free AI Tools for Professionals',
    description:
      'Free AI tools: PDF summarizer, resume builder, pay stub generator, paraphraser, grammar checker & 21 more. Try free daily — no signup needed.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Formly — AI Tools Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formly — 28 Free AI Tools',
    description: 'AI PDF summarizer, resume builder, pay stub generator, paraphraser, grammar checker & 21 more tools. Free.',
    images: ['/og-image.png'],
    creator: '@formlytools',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://formly.tools',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <AdSenseScript />
        {/* hreflang — geo targeting for English-speaking markets */}
        <link rel="alternate" hrefLang="en" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-US" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-GB" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-IN" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-AU" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-CA" href="https://formly.tools" />
        <link rel="alternate" hrefLang="x-default" href="https://formly.tools" />

        {/* Schema.org — WebSite with SiteLinksSearchBox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Formly',
              url: 'https://formly.tools',
              description: 'Free AI-powered productivity tools for professionals worldwide — pay stub generator, resume builder, contract generator, PDF summarizer, and 22 more tools.',
              inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-AU', 'en-CA'],
              audience: {
                '@type': 'Audience',
                geographicArea: {
                  '@type': 'AdministrativeArea',
                  name: 'Worldwide — USA, United Kingdom, India, Australia, Canada, New Zealand, Singapore, Ireland',
                },
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: 'https://formly.tools/tools?q={search_term_string}' },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Schema.org — Organization with LLM context */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Formly',
              url: 'https://formly.tools',
              logo: 'https://formly.tools/favicon.svg',
              description: 'Formly provides 28 free AI-powered tools for professionals — including a free pay stub generator, resume builder, contract generator, PDF summarizer, AI paraphraser, grammar checker, digital signature creator, QR code generator, and developer utilities. Used by 50,000+ professionals in the USA, UK, India, Australia, and Canada.',
              sameAs: ['https://twitter.com/formlytools'],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Free AI Tools',
                numberOfItems: 28,
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Pay Stub Generator', url: 'https://formly.tools/tools/paystub-generator' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Resume Builder', url: 'https://formly.tools/tools/resume-builder' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Contract Generator', url: 'https://formly.tools/tools/contract-generator' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'PDF Summarizer', url: 'https://formly.tools/tools/pdf-summarizer' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI Paraphraser', url: 'https://formly.tools/tools/paraphraser' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Grammar Checker', url: 'https://formly.tools/tools/grammar-checker' } },
                ],
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-950 text-gray-100 min-h-screen">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
