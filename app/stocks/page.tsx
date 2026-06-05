import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import { createAdminClient } from '@/lib/supabase/server';
import { type StockNewsItem } from '@/lib/stocks-utils';
import { StocksFeed } from './StocksFeed';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: {
    category?: string;
    country?: string;
    q?: string;
    id?: string;
    sort?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const category = searchParams?.category;
  const country  = searchParams?.country;

  let title = 'Stock Market News — Global Markets Today | Formly';
  let description = 'Live stock market news from NYSE, NASDAQ, LSE, NSE, ASX and more. AI-summarized earnings, macro, IPO and market analysis — updated daily.';

  if (category && category !== 'all') {
    title = `${category} — Stock Market News | Formly`;
    description = `Latest ${category} news from global stock markets, AI-summarized daily.`;
  } else if (country && country !== 'all') {
    title = `${country} Stock Market News | Formly`;
    description = `Top stock market stories from ${country} — AI-summarized daily.`;
  }

  return {
    title,
    description,
    alternates: { canonical: 'https://formly.tools/stocks' },
    openGraph: { title, description, type: 'website', url: 'https://formly.tools/stocks' },
  };
}

async function fetchInitialData(searchParams: PageProps['searchParams']): Promise<{
  items: StockNewsItem[];
  lastUpdated: string | null;
  deepLinkId: string | null;
}> {
  try {
    const supabase = createAdminClient();

    const category   = searchParams?.category ?? 'all';
    const country    = searchParams?.country?.toUpperCase() ?? 'all';
    const sort       = searchParams?.sort ?? 'latest';
    const q          = searchParams?.q ?? '';
    const deepLinkId = searchParams?.id ?? null;

    const { data: latestRow } = await supabase
      .from('stocks_news')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let query = supabase
      .from('stocks_news')
      .select('id,source_key,source_name,topic,summary,key_points,category,source_url,source_title,image_url,fetched_at,rank,country_code,country_name,language_code,language_name')
      .order(sort === 'popular' ? 'rank' : 'fetched_at', { ascending: sort === 'popular' })
      .order(sort === 'popular' ? 'fetched_at' : 'rank', { ascending: sort !== 'popular' })
      .limit(50);

    if (category && category !== 'all') query = query.eq('category', category);
    if (country  && country  !== 'ALL' && country.length >= 2) query = query.eq('country_code', country);
    if (q.trim()) query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);

    const { data: items } = await query;
    let list = (items as StockNewsItem[]) ?? [];

    if (deepLinkId && !list.some(i => i.id === deepLinkId)) {
      const { data: specific } = await supabase
        .from('stocks_news')
        .select('id,source_key,source_name,topic,summary,key_points,category,source_url,source_title,image_url,fetched_at,rank,country_code,country_name,language_code,language_name')
        .eq('id', deepLinkId)
        .maybeSingle();
      if (specific) list = [specific as StockNewsItem, ...list];
    }

    return { items: list, lastUpdated: latestRow?.fetched_at ?? null, deepLinkId };
  } catch {
    return { items: [], lastUpdated: null, deepLinkId: null };
  }
}

export default async function StocksPage({ searchParams }: PageProps) {
  const { items, lastUpdated, deepLinkId } = await fetchInitialData(searchParams);

  const initialCategory = searchParams?.category ?? 'all';
  const initialCountry  = searchParams?.country  ?? 'all';
  const initialQ        = searchParams?.q         ?? '';
  const initialSort     = searchParams?.sort      ?? 'latest';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 text-xs font-medium uppercase tracking-widest">Live · Daily</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 mb-1">
              📈 <span className="gradient-text">Stock Market</span> — Global News
            </h1>
            <p className="text-stone-500 text-sm">NYSE · NASDAQ · LSE · NSE · ASX · TSE · XETRA · AI-summarized daily</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div>
              <Suspense>
                <StocksFeed
                  initialItems={items}
                  initialCategory={initialCategory}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Global Stock Market News',
          description: 'Daily stock market news from NYSE, NASDAQ, LSE, NSE, ASX and more — AI-summarized.',
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
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://formly.tools' },
            { '@type': 'ListItem', position: 2, name: 'Stock Markets', item: 'https://formly.tools/stocks' },
          ],
        }) }}
      />
    </>
  );
}
