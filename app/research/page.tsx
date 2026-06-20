export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import { createAdminClient } from '@/lib/supabase/server';
import { type ResearchPaper, DOMAIN_EMOJIS } from '@/lib/research-utils';
import { ResearchFeed } from './ResearchFeed';

interface PageProps {
  searchParams?: {
    domain?: string;
    impact?: string;
    q?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const domain = searchParams?.domain;

  if (domain && domain !== 'all') {
    const emoji = DOMAIN_EMOJIS[domain] ?? '🔬';
    return {
      title: `${emoji} ${domain} Research Papers — Plain Language Summaries | Formly`,
      description: `Latest ${domain} research papers from arXiv, explained in plain language. Daily summaries with key findings, methodology, and real-world applications.`,
      alternates: { canonical: 'https://formly.tools/research' },
    };
  }

  return {
    title: 'Research Paper Summaries — AI Science Digest | Formly',
    description:
      'Daily top 3 trending research papers from arXiv explained in plain language. AI, Physics, Biology, Space, Economics & more — with key findings, methodology, and real-world impact.',
    alternates: { canonical: 'https://formly.tools/research' },
  };
}

async function fetchInitialData(searchParams: PageProps['searchParams']): Promise<{
  items: ResearchPaper[];
  lastUpdated: string | null;
}> {
  try {
    const supabase = createAdminClient();
    const domain   = searchParams?.domain ?? 'all';
    const impact   = searchParams?.impact ?? 'all';
    const q        = searchParams?.q      ?? '';

    const { data: latestRow } = await supabase
      .from('research_papers')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let query = supabase
      .from('research_papers')
      .select('*')
      .order('fetched_at', { ascending: false })
      .order('rank',       { ascending: true })
      .limit(9);

    if (domain && domain !== 'all') query = query.eq('domain', domain);
    if (impact && impact !== 'all') query = query.eq('impact_level', impact);
    if (q.trim()) query = query.or(`title.ilike.%${q.trim()}%,tldr.ilike.%${q.trim()}%`);

    const { data: items } = await query;

    return {
      items:       (items as ResearchPaper[]) ?? [],
      lastUpdated: latestRow?.fetched_at ?? null,
    };
  } catch {
    return { items: [], lastUpdated: null };
  }
}

export default async function ResearchPage({ searchParams }: PageProps) {
  const { items, lastUpdated } = await fetchInitialData(searchParams);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Research Papers — Daily arXiv Digest',
    description:
      'Daily top 3 trending research papers from arXiv, explained in plain language for scientists, students, and curious minds.',
    url: 'https://formly.tools/research',
    numberOfItems: items.length,
    itemListElement: items.map((paper, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type':       'ScholarlyArticle',
        headline:      paper.title,
        description:   paper.tldr ?? paper.abstract ?? '',
        url:           paper.source_url,
        datePublished: paper.published_date ?? paper.fetched_at,
        dateModified:  paper.fetched_at,
        author:        (paper.authors ?? []).map(a => ({ '@type': 'Person', name: a })),
        ...(paper.institution ? { publisher: { '@type': 'Organization', name: paper.institution } } : {}),
        about:         { '@type': 'Thing', name: paper.domain },
        keywords:      [paper.domain, paper.subdomain].filter(Boolean).join(', '),
        isPartOf:      { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
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
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-indigo-500 text-xs font-medium uppercase tracking-widest">Daily · arXiv</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-2">
              Research <span className="gradient-text">Papers</span>
            </h1>
            <p className="text-stone-500 text-sm mb-3">
              Updated daily · Top 3 trending papers · AI, Physics, Biology, Space &amp; more
            </p>
            <p className="text-stone-500 text-sm max-w-2xl leading-relaxed">
              An AI research scientist explores new submissions on{' '}
              <strong className="text-stone-700 font-semibold">arXiv</strong> daily, selects the 3 most impactful
              papers across scientific domains, and explains each one in plain language — so engineers, students,
              doctors, and curious minds worldwide can grasp{' '}
              <em>what was discovered, how, and why it matters</em>.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div>
              <ResearchFeed
                initialItems={items}
                initialDomain={searchParams?.domain ?? 'all'}
                initialImpact={searchParams?.impact ?? 'all'}
                initialQ={searchParams?.q ?? ''}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://formly.tools' },
              { '@type': 'ListItem', position: 2, name: 'Research', item: 'https://formly.tools/research' },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsMediaOrganization',
          name: 'Formly — Research Paper Summaries',
          url: 'https://formly.tools/research',
          logo: { '@type': 'ImageObject', url: 'https://formly.tools/favicon.svg', width: 512, height: 512 },
          description: 'Daily summaries of the top 3 trending arXiv research papers — explained in plain language across AI, Physics, Biology, Space, Economics, and more. Updated daily for engineers, students, and curious minds.',
          publishingPrinciples: 'https://formly.tools/about',
          masthead: 'https://formly.tools/about',
          contactPoint: { '@type': 'ContactPoint', contactType: 'editorial', email: 'support@formly.tools' },
        }) }}
      />
    </>
  );
}
