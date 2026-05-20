import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Code Explainer — Explain Code Online Free | Formly',
  description: 'Understand any code snippet instantly with AI. Free code explainer tool for all programming languages — perfect for beginners and learners. No signup needed.',
  keywords: [
    'code explainer ai',
    'explain code online',
    'ai code explanation tool',
    'code explanation free',
    'understand code ai',
    'code snippet explainer',
    'programming code explainer',
    'javascript code explainer',
    'python code explainer',
    'free code analyzer',
  ],
  openGraph: {
    title: 'AI Code Explainer — Explain Any Code Free | Formly',
    description: 'Understand any code snippet instantly with AI. Free, no signup. Supports all major programming languages.',
    url: 'https://formly.tools/tools/code-explainer',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Explainer — Explain Any Code Free | Formly',
    description: 'Understand any code snippet instantly with AI. Free, no signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/code-explainer' },
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
            name: 'AI Code Explainer',
            description: 'Understand any code snippet instantly with AI. Supports all major programming languages.',
            url: 'https://formly.tools/tools/code-explainer',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-powered code explanation',
              'Supports all major programming languages',
              'Line-by-line code breakdown',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
