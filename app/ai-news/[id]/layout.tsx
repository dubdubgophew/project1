import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('ai_news')
      .select('topic, summary, image_url, fetched_at')
      .eq('id', params.id)
      .maybeSingle();

    if (!data) return { title: 'AI News — Formly' };

    const title       = `${data.topic} — AI Analysis | Formly`;
    const description = data.summary?.slice(0, 160) ?? '';
    const canonical   = `https://formly.tools/ai-news/${params.id}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        publishedTime: data.fetched_at,
        ...(data.image_url ? { images: [{ url: data.image_url }] } : {}),
      },
      twitter: {
        card: data.image_url ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(data.image_url ? { images: [data.image_url] } : {}),
      },
    };
  } catch {
    return { title: 'AI News — Formly' };
  }
}

export default function AIArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
