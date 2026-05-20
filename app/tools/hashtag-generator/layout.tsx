import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Hashtag Generator — Instagram, TikTok & Twitter Hashtags | Formly',
  description: 'Generate the best hashtags for any post with AI. Optimized for Instagram, TikTok, Twitter and LinkedIn. Mix of popular, niche and trending tags. Free, no signup needed.',
  keywords: ["hashtag generator", "instagram hashtag generator", "ai hashtag generator free", "tiktok hashtag generator", "twitter hashtag tool", "best hashtags for instagram", "hashtag finder online", "hashtag generator no signup", "hashtag maker free", "instagram tags generator"],
  openGraph: { title: 'Free AI Hashtag Generator | Formly', description: 'Generate optimized hashtags for Instagram, TikTok, Twitter. Popular + niche mix. Free, no signup.', url: 'https://formly.tools/tools/hashtag-generator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Hashtag Generator | Formly', description: 'Free AI hashtag generator — Instagram, TikTok, Twitter. Popular + niche + trending tags.' },
  alternates: { canonical: 'https://formly.tools/tools/hashtag-generator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Hashtag Generator"
        description="Generate the best hashtags for any post with AI. Optimized for Instagram, TikTok, Twitter and LinkedIn. Mix of popular, niche and trending tags. Free, no signup needed."
        url="https://formly.tools/tools/hashtag-generator"
        category="SocialNetworkingApplication"
        features={['Optimized for Instagram, TikTok, Twitter, LinkedIn', 'Mix of popular and niche hashtags', 'Copy all hashtags with one click', 'Topic and platform specific', 'No signup required']}
        faqs={[{ q: 'How many hashtags should I use on Instagram?', a: 'Instagram allows up to 30 hashtags. Research shows 3-5 highly relevant hashtags often outperform 30 generic ones. Our AI generates a strategic mix of popular (>500K posts), medium, and niche (<50K posts) tags.' }, { q: 'What is the difference between popular and niche hashtags?', a: 'Popular hashtags (#fitness) have millions of posts so your content gets buried quickly. Niche hashtags (#homegymworkout) have less competition and your post stays visible longer. A good strategy uses both.' }, { q: 'Does it work for TikTok hashtags?', a: 'Yes — select TikTok as the platform and the AI generates hashtags optimized for TikTok's discovery algorithm.' }, { q: 'Is it free?', a: 'Yes — free to generate hashtags up to 5 times/day without signing up.' }]}
      />
      {children}
    </>
  );
}
