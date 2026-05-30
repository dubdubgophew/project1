import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import { createAdminClient } from '@/lib/supabase/server';
import { type AINewsItem } from '@/lib/ai-news-utils';
import { AIFeed } from './AIFeed';

interface PageProps {
  searchParams?: {
    category?: string;
    q?: string;
    id?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const category = searchParams?.category;
  let title = 'Latest in AI — Formly';
  let description = 'Daily AI news from the best sources: tools, research, companies, hardware, and more.';

  if (category && category !== 'all') {
    title = `AI ${category} News — Formly`;
    description = `Latest AI ${category} news, summarized daily from the best sources.`;
  }

  return {
    title,
    description,
    alternates: { canonical: 'https://formly.tools/ai-news' },
    openGraph: { title, description, type: 'website', url: 'https://formly.tools/ai-news' },
  };
}

async function fetchInitialData(searchParams: PageProps['searchParams']): Promise<{
  items: AINewsItem[];
  lastUpdated: string | null;
  deepLinkId: string | null;
}> {
  try {
    const supabase = createAdminClient();

    const category   = searchParams?.category;
    const q          = searchParams?.q ?? '';
    const deepLinkId = searchParams?.id ?? null;

    const { data: latestRow } = await supabase
      .from('ai_news')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastUpdated = latestRow?.fetched_at ?? null;

    let query = supabase
      .from('ai_news')
      .select('id,source_key,source_name,topic,summary,category,source_url,source_title,image_url,fetched_at,rank')
      .order('fetched_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(50);

    if (category && category !== 'all') query = query.eq('category', category);
    if (q.trim()) query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);

    const { data: items } = await query;
    let list = (items as AINewsItem[]) ?? [];

    if (deepLinkId && !list.some(i => i.id === deepLinkId)) {
      const { data: specific } = await supabase
        .from('ai_news')
        .select('id,source_key,source_name,topic,summary,category,source_url,source_title,image_url,fetched_at,rank')
        .eq('id', deepLinkId)
        .maybeSingle();
      if (specific) list = [specific as AINewsItem, ...list];
    }

    return { items: list, lastUpdated, deepLinkId };
  } catch {
    return { items: [], lastUpdated: null, deepLinkId: null };
  }
}

export default async function AINewsPage({ searchParams }: PageProps) {
  const { items, lastUpdated, deepLinkId } = await fetchInitialData(searchParams);

  const initialCategory = searchParams?.category ?? 'all';
  const initialQ        = searchParams?.q         ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Latest in AI',
    description: 'Daily AI news from the best sources, AI-summarized.',
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'NewsArticle',
        headline: item.topic,
        description: item.summary,
        url: item.source_url,
        datePublished: item.fetched_at,
        publisher: { '@type': 'Organization', name: item.source_name },
      },
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-400 text-xs font-medium uppercase tracking-widest">Daily</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1">
              Latest in <span className="gradient-text">AI</span>
            </h1>
            <p className="text-gray-500 text-sm">Updated daily · 50 stories · 10 sources</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div>
              <AIFeed
                initialItems={items}
                initialCategory={initialCategory}
                initialQ={initialQ}
                initialId={deepLinkId}
                lastUpdated={lastUpdated}
              />
            </div>
            <aside className="hidden lg:flex flex-col gap-4">
              <div className="sticky top-24 space-y-4">
                <SidebarAd />
                <SidebarAd />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
