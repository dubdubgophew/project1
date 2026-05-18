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
    default: 'Formly — 26 Free AI Tools for Writers, Devs & Professionals',
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
    title: 'Formly — 26 Free AI Tools for Professionals',
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
    title: 'Formly — 26 Free AI Tools',
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
        {/* Schema.org — WebSite with SiteLinksSearchBox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Formly',
              url: 'https://formly.tools',
              description: 'Free AI-powered productivity tools for professionals',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://formly.tools/tools?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Schema.org — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Formly',
              url: 'https://formly.tools',
              logo: 'https://formly.tools/favicon.svg',
              description: 'Free AI-powered tools suite for writers, developers, and professionals — including PDF summarizer, resume builder, pay stub generator, contract generator, JSON formatter, and 20+ more tools.',
              sameAs: [
                'https://twitter.com/formlytools',
              ],
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
