import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('trending_news')
      .select('topic,summary,image_url,category,country_name,fetched_at')
      .eq('id', params.id)
      .maybeSingle();

    if (!data) return { title: 'News Analysis | Formly' };

    const title       = `${data.topic} — AI Analysis | Formly`;
    const description = data.summary.length > 155
      ? data.summary.slice(0, 152) + '…'
      : data.summary;

    return {
      title,
      description,
      alternates: { canonical: `https://formly.tools/news/${params.id}` },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://formly.tools/news/${params.id}`,
        publishedTime: data.fetched_at,
        images: data.image_url ? [{ url: data.image_url, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: data.image_url ? [data.image_url] : [],
      },
    };
  } catch {
    return { title: 'News Analysis | Formly' };
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
