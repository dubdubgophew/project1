import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { AINewsItem } from '@/lib/ai-news-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? 'all';
    const country  = searchParams.get('country')  ?? 'all';
    const language = searchParams.get('language') ?? 'all';
    const sort     = searchParams.get('sort')     ?? 'latest';
    const q        = searchParams.get('q')        ?? '';
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
    const offset   = (page - 1) * limit;

    const supabase = createAdminClient();

    const { data: latestRow } = await supabase
      .from('ai_news')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let query = supabase
      .from('ai_news')
      .select('id,source_key,source_name,topic,summary,category,source_url,source_title,image_url,fetched_at,rank,country_code,country_name,language_code,language_name,key_points', { count: 'exact' })
      .order(sort === 'popular' ? 'rank' : 'fetched_at', { ascending: sort === 'popular' })
      .order(sort === 'popular' ? 'fetched_at' : 'rank', { ascending: sort !== 'popular' })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') query = query.eq('category', category);
    if (country  && country  !== 'all') query = query.eq('country_code', country.toUpperCase());
    if (language && language !== 'all') query = query.eq('language_code', language);
    if (q.trim()) query = query.or(`topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`);

    const { data: items, count } = await query;
    const total = count ?? 0;

    return NextResponse.json(
      {
        items: (items as AINewsItem[]) ?? [],
        total,
        page,
        hasMore: offset + limit < total,
        lastUpdated: latestRow?.fetched_at ?? null,
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
