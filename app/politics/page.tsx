import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import { createAdminClient } from '@/lib/supabase/server';
import { type TrendingNews } from '@/lib/trending-utils';
import { PoliticsFeed } from './PoliticsFeed';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: { country?: string; language?: string; q?: string; sort?: string; id?: string };
}

async function fetchInitialData(sp: PageProps['searchParams']) {
  try {
    const supabase  = createAdminClient();
    const country   = sp?.country?.toUpperCase();
    const language  = sp?.language;
    const q         = sp?.q ?? '';
    const sort      = sp?.sort ?? 'latest';
    const deepLinkId = sp?.id ?? null;

    const { data: latestRow } = await supabase
      .from('trending_news').select('fetched_at').eq('category', 'Politics')
      .order('fetched_at', { ascending: false }).limit(1).maybeSingle();

    let query = supabase
      .from('trending_news')
      .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name')
      .eq('category', 'Politics')
      .order(sort === 'popular' ? 'rank' : 'fetched_at', { ascending: sort === 'popular' })
      .order(sort === 'popular' ? 'fetched_at' : 'rank', { ascending: sort !== 'popular' })
      .limit(50);

    if (country && country !== 'ALL' && country.length === 2) query = query.eq('country_code', country);
    if (language && language !== 'all') query = query.eq('language_code', language);
    if (q.trim()) query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);

    const { data: items } = await query;
    let list = (items as TrendingNews[]) ?? [];

    if (deepLinkId && !list.some(i => i.id === deepLinkId)) {
      const { data: specific } = await supabase
        .from('trending_news')
        .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name')
        .eq('id', deepLinkId).maybeSingle();
      if (specific) list = [specific as TrendingNews, ...list];
    }

    return { items: list, lastUpdated: latestRow?.fetched_at ?? null, deepLinkId };
  } catch {
    return { items: [], lastUpdated: null, deepLinkId: null };
  }
}

export default async function PoliticsPage({ searchParams }: PageProps) {
  const { items, lastUpdated, deepLinkId } = await fetchInitialData(searchParams);
  const initialCountry  = searchParams?.country  ?? 'all';
  const initialQ        = searchParams?.q         ?? '';
  const initialSort     = searchParams?.sort      ?? 'latest';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-500 text-xs font-medium uppercase tracking-widest">Live · Daily</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 mb-1">
              🏛️ <span className="gradient-text">Politics</span> — Trending &amp; Latest
            </h1>
            <p className="text-stone-500 text-sm">Global political news · 10+ countries · AI-summarized daily</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div>
              <Suspense>
                <PoliticsFeed
                  initialItems={items}
                  initialCountry={initialCountry}
                  initialQ={initialQ}
                  initialSort={initialSort}
                  initialId={deepLinkId}
                  lastUpdated={lastUpdated}
                />
              </Suspense>
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
    </>
  );
}
