import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { createAdminClient } from '@/lib/supabase/server';
import { COUNTRY_MAP, type TrendingNews } from '@/lib/trending-utils';
import { TrendingFeed } from './TrendingFeed';

interface PageProps {
  searchParams?: {
    country?: string;
    category?: string;
    q?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const country = searchParams?.country?.toUpperCase();
  const category = searchParams?.category;

  let title = "What's Trending Right Now — Formly";
  let description =
    "Discover today's top trending topics from 10 countries, summarized by AI. Updated daily.";

  if (country && country !== 'all' && country in COUNTRY_MAP) {
    const countryData = COUNTRY_MAP[country as keyof typeof COUNTRY_MAP];
    title = `Trending in ${countryData.name} Right Now — Formly`;
    description = `Top 5 trending topics in ${countryData.name} today. AI-summarized news, updated daily.`;
  } else if (category && category !== 'all') {
    title = `Trending ${category} News Right Now — Formly`;
    description = `What's trending in ${category} today across 10 countries. AI-powered news summaries updated daily.`;
  }

  return {
    title,
    description,
    alternates: { canonical: 'https://formly.tools/news' },
    openGraph: { title, description, type: 'website', url: 'https://formly.tools/news' },
  };
}

async function fetchInitialData(searchParams: PageProps['searchParams']): Promise<{
  items: TrendingNews[];
  lastUpdated: string | null;
}> {
  try {
    const supabase = createAdminClient();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const country  = searchParams?.country?.toUpperCase();
    const category = searchParams?.category;
    const q        = searchParams?.q ?? '';

    // Get latest fetched_at
    const { data: latestRow } = await supabase
      .from('trending_news')
      .select('fetched_at')
      .gte('fetched_at', sixHoursAgo)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastUpdated = latestRow?.fetched_at ?? null;

    // Build data query
    let query = supabase
      .from('trending_news')
      .select(
        'id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank'
      )
      .gte('fetched_at', sixHoursAgo)
      .order('fetched_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(20);

    if (country && country !== 'ALL' && country.length === 2) {
      query = query.eq('country_code', country);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (q.trim()) {
      query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);
    }

    const { data: items } = await query;

    return {
      items: (items as TrendingNews[]) ?? [],
      lastUpdated,
    };
  } catch {
    return { items: [], lastUpdated: null };
  }
}

export default async function NewsPage({ searchParams }: PageProps) {
  const { items, lastUpdated } = await fetchInitialData(searchParams);

  const initialCountry  = searchParams?.country  ?? 'all';
  const initialCategory = searchParams?.category ?? 'all';
  const initialQ        = searchParams?.q         ?? '';

  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "What's Trending Right Now",
    description: 'Top 5 trending topics from 10 countries, AI-summarized daily.',
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
        publisher: {
          '@type': 'Organization',
          name: item.source_name,
        },
      },
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium uppercase tracking-widest">
                Live
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              What&apos;s{' '}
              <span className="gradient-text">Trending</span>{' '}
              Right Now
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Updated daily &middot; 50 topics &middot; 10 countries
            </p>
          </div>

          {/* Feed */}
          <TrendingFeed
            initialItems={items}
            initialCountry={initialCountry}
            initialCategory={initialCategory}
            initialQ={initialQ}
            lastUpdated={lastUpdated}
          />
        </div>
      </main>

      <Footer />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
    </>
  );
}
