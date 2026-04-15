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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://toolora.com'),
  title: {
    default: 'Toolora — 10 Free AI Tools for Writers, Devs & Professionals',
    template: '%s | Toolora',
  },
  description:
    'Free AI-powered tools: PDF summarizer, paraphraser, grammar checker, email writer, code explainer, YouTube summarizer, resume builder & more. No signup needed.',
  keywords: [
    'free ai tools',
    'ai pdf summarizer',
    'ai paraphraser',
    'grammar checker free',
    'ai email writer',
    'youtube summarizer ai',
    'resume builder ai',
    'ai contract generator',
    'code explainer ai',
    'ai hashtag generator',
    'online ai tools',
    'free ai writing tools',
  ],
  authors: [{ name: 'Toolora' }],
  creator: 'Toolora',
  publisher: 'Toolora',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toolora.com',
    siteName: 'Toolora',
    title: 'Toolora — 10 Free AI Tools for Professionals',
    description:
      'Free AI tools: PDF summarizer, paraphraser, grammar checker, email writer & more. Try 5 tools free daily — no signup needed.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Toolora — AI Tools Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolora — 10 Free AI Tools',
    description: 'AI PDF summarizer, paraphraser, grammar checker & 7 more tools. Free.',
    images: ['/og-image.png'],
    creator: '@toolora_ai',
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
    canonical: 'https://toolora.com',
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
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Toolora',
              url: 'https://toolora.com',
              description: 'Free AI-powered productivity tools for professionals',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://toolora.com/tools?q={search_term_string}',
                'query-input': 'required name=search_term_string',
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
