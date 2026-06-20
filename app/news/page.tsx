import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import { createAdminClient } from '@/lib/supabase/server';
import { COUNTRY_MAP, type TrendingNews } from '@/lib/trending-utils';
import { TrendingFeed } from './TrendingFeed';

interface PageProps {
  searchParams?: {
    country?: string;
    category?: string;
    language?: string;
    q?: string;
    id?: string;
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
  deepLinkId: string | null;
}> {
  try {
    const supabase = createAdminClient();

    const country    = searchParams?.country?.toUpperCase();
    const category   = searchParams?.category;
    const language   = searchParams?.language ?? 'en';
    const q          = searchParams?.q ?? '';
    const deepLinkId = searchParams?.id ?? null;

    // Get latest fetched_at
    const { data: latestRow } = await supabase
      .from('trending_news')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastUpdated = latestRow?.fetched_at ?? null;

    // Build data query — load all 50 items so shared cards are always in the DOM
    let query = supabase
      .from('trending_news')
      .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name,key_points')
      .order('fetched_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(50);

    if (country  && country !== 'ALL' && country.length === 2) query = query.eq('country_code', country);
    if (category && category !== 'all')                         query = query.eq('category', category);
    if (language && language !== 'all') {
      if (language === 'en') {
        query = query.or('language_code.eq.en,language_code.is.null');
      } else {
        query = query.eq('language_code', language);
      }
    }
    if (q.trim()) query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);

    const { data: items } = await query;
    let list = (items as TrendingNews[]) ?? [];

    if (deepLinkId && !list.some(i => i.id === deepLinkId)) {
      const { data: specific } = await supabase
        .from('trending_news')
        .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name,key_points')
        .eq('id', deepLinkId)
        .maybeSingle();
      if (specific) list = [specific as TrendingNews, ...list];
    }

    return { items: list, lastUpdated, deepLinkId };
  } catch {
    return { items: [], lastUpdated: null, deepLinkId: null };
  }
}

export default async function NewsPage({ searchParams }: PageProps) {
  const { items, lastUpdated, deepLinkId } = await fetchInitialData(searchParams);

  const initialCountry  = searchParams?.country  ?? 'all';
  const initialCategory = searchParams?.category ?? 'all';
  const initialLanguage = searchParams?.language ?? 'en';
  const initialQ        = searchParams?.q        ?? '';

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
      <main id="main-content" className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium uppercase tracking-widest">Live</span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 mb-1">
              What&apos;s <span className="gradient-text">Trending</span> Right Now
            </h1>
            <p className="text-stone-500 text-sm">Updated daily · 50 topics · 10 countries</p>
            <p className="text-stone-500 text-sm mt-2 max-w-2xl leading-relaxed">
              Today&apos;s top trending stories from <strong className="text-stone-700 font-semibold">USA, India, UK, Canada, Australia, Germany, France, Brazil, Japan, and Indonesia</strong> — sourced from NPR, BBC News, Times of India, ABC Australia, Japan Times, and more. Every headline is AI-analyzed with a full summary and five structured key takeaways, so you understand not just <em>what</em> happened but <em>why it matters</em>.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div className="min-w-0">
              <TrendingFeed
                initialItems={items}
                initialCountry={initialCountry}
                initialCategory={initialCategory}
                initialLanguage={initialLanguage}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://formly.tools' },
            { '@type': 'ListItem', position: 2, name: 'Trending News', item: 'https://formly.tools/news' },
          ],
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsMediaOrganization',
          name: 'Formly',
          url: 'https://formly.tools',
          logo: { '@type': 'ImageObject', url: 'https://formly.tools/favicon.svg', width: 512, height: 512 },
          description: 'Formly publishes daily AI-summarized news across trending topics, AI industry news, politics, stock markets, and scientific research — sourced from 50+ reputable outlets worldwide.',
          publishingPrinciples: 'https://formly.tools/about',
          diversityPolicy: 'https://formly.tools/about',
          sameAs: ['https://twitter.com/formlytools'],
          masthead: 'https://formly.tools/about',
          contactPoint: { '@type': 'ContactPoint', contactType: 'editorial', email: 'support@formly.tools' },
        }) }}
      />
    </>
  );
}
