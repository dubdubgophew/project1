import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hashtag Generator — Free Instagram & Social Media Tool | Formly',
  description: 'Generate the best hashtags for Instagram, Twitter, and TikTok for free. AI hashtag generator to boost reach and engagement — no signup required.',
  keywords: [
    'hashtag generator',
    'instagram hashtags generator',
    'free hashtag tool',
    'tiktok hashtag generator',
    'twitter hashtag generator',
    'social media hashtags',
    'best hashtags for instagram',
    'ai hashtag generator',
    'hashtag finder free',
    'trending hashtags tool',
  ],
  openGraph: {
    title: 'Hashtag Generator — Free Social Media Tool | Formly',
    description: 'Generate the best hashtags for Instagram, TikTok & Twitter with AI. Free, no signup. Boost your reach instantly.',
    url: 'https://formly.tools/tools/hashtag-generator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hashtag Generator — Free Social Media Tool | Formly',
    description: 'Generate the best hashtags for Instagram, TikTok & Twitter with AI. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/hashtag-generator' },
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
            name: 'Hashtag Generator',
            description: 'Generate the best hashtags for Instagram, Twitter, and TikTok to boost social media reach and engagement.',
            url: 'https://formly.tools/tools/hashtag-generator',
            applicationCategory: 'SocialNetworkingApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'AI-curated hashtag suggestions',
              'Platform-specific hashtags for Instagram, TikTok, Twitter',
              'Trending and niche hashtag discovery',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
