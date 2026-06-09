import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import { createAdminClient } from '@/lib/supabase/server';
import { type TrendingNews } from '@/lib/trending-utils';
import { PoliticsFeed } from './PoliticsFeed';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: { country?: string; language?: string; category?: string; q?: string; sort?: string; id?: string };
}

async function fetchInitialData(sp: PageProps['searchParams']) {
  try {
    const supabase   = createAdminClient();
    const country    = sp?.country?.toUpperCase();
    const language   = sp?.language   ?? 'en';
    const category   = sp?.category   ?? 'Politics';
    const q          = sp?.q          ?? '';
    const sort       = sp?.sort       ?? 'latest';
    const deepLinkId = sp?.id         ?? null;

    const { data: latestRow } = await supabase
      .from('trending_news').select('fetched_at')
      .eq('category', category !== 'all' ? category : 'Politics')
      .order('fetched_at', { ascending: false }).limit(1).maybeSingle();

    let query = supabase
      .from('trending_news')
      .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name,key_points')
      .order(sort === 'popular' ? 'rank' : 'fetched_at', { ascending: sort === 'popular' })
      .order(sort === 'popular' ? 'fetched_at' : 'rank', { ascending: sort !== 'popular' })
      .limit(50);

    if (category && category !== 'all') query = query.eq('category', category);
    if (country  && country !== 'ALL' && country.length === 2) query = query.eq('country_code', country);
    if (language && language !== 'all') query = query.eq('language_code', language);
    if (q.trim()) query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);

    const { data: items } = await query;
    let list = (items as TrendingNews[]) ?? [];

    if (deepLinkId && !list.some(i => i.id === deepLinkId)) {
      const { data: specific } = await supabase
        .from('trending_news')
        .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name,key_points')
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
  const initialCategory = searchParams?.category ?? 'Politics';
  const initialLanguage = searchParams?.language ?? 'en';
  const initialQ        = searchParams?.q        ?? '';
  const initialSort     = searchParams?.sort     ?? 'latest';

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
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
            <p className="text-stone-500 text-sm mt-2 max-w-2xl leading-relaxed">
              Real-time coverage of political developments worldwide — <strong className="text-stone-700 font-semibold">elections, legislation, government decisions, and foreign policy</strong> across the USA, India, UK, Canada, Australia, and Europe. Sourced from <strong className="text-stone-700 font-semibold">NPR Politics, BBC Politics, Al Jazeera, Reuters, The Wire, Der Spiegel, Le Monde,</strong> and 12 more outlets in 5 languages. Each story is AI-analyzed to explain <em>what happened, why it happened, and who it affects</em>.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div>
              <Suspense>
                <PoliticsFeed
                  initialItems={items}
                  initialCountry={initialCountry}
                  initialCategory={initialCategory}
                  initialLanguage={initialLanguage}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Trending Political News',
          description: 'Today\'s top political news stories from 10+ countries, AI-summarized.',
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
              about: { '@type': 'Thing', name: 'Politics' },
              publisher: { '@type': 'Organization', name: item.source_name },
            },
          })),
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://formly.tools' },
            { '@type': 'ListItem', position: 2, name: 'Politics News', item: 'https://formly.tools/politics' },
          ],
        }) }}
      />
    </>
  );
}
