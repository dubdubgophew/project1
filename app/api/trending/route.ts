import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/trending
 * Public API for the trending news feed.
 *
 * Query params:
 *   country  - 2-letter country code or 'all' (default: 'all')
 *   category - category name or 'all' (default: 'all')
 *   q        - search string
 *   page     - page number, default 1
 *   limit    - items per page, default 20, max 50
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const country  = searchParams.get('country')  ?? 'all';
  const category = searchParams.get('category') ?? 'all';
  const language = searchParams.get('language') ?? 'all';
  const sort     = searchParams.get('sort')     ?? 'latest'; // 'latest' | 'popular'
  const q        = searchParams.get('q')        ?? '';
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit    = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const offset   = (page - 1) * limit;

  try {
    const supabase = createAdminClient();

    // Get latest fetched_at timestamp
    const { data: latestRow } = await supabase
      .from('trending_news')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastUpdated = latestRow?.fetched_at ?? null;

    // Build the count query
    let countQuery = supabase
      .from('trending_news')
      .select('id', { count: 'exact', head: true });

    if (country !== 'all' && country.length === 2) {
      countQuery = countQuery.eq('country_code', country.toUpperCase());
    }
    if (category !== 'all' && category) {
      countQuery = countQuery.eq('category', category);
    }
    if (language !== 'all' && language) {
      countQuery = countQuery.eq('language_code', language);
    }
    if (q.trim()) {
      countQuery = countQuery.or(
        `topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`
      );
    }

    const { count } = await countQuery;
    const total = count ?? 0;

    // Build the data query
    let dataQuery = supabase
      .from('trending_news')
      .select('id,country_code,country_name,topic,summary,traffic_volume,category,source_url,source_name,source_title,image_url,fetched_at,rank,language_code,language_name')
      .order(sort === 'popular' ? 'rank' : 'fetched_at', { ascending: sort === 'popular' })
      .order(sort === 'popular' ? 'fetched_at' : 'rank', { ascending: sort !== 'popular' })
      .range(offset, offset + limit - 1);

    if (country !== 'all' && country.length === 2) {
      dataQuery = dataQuery.eq('country_code', country.toUpperCase());
    }
    if (category !== 'all' && category) {
      dataQuery = dataQuery.eq('category', category);
    }
    if (language !== 'all' && language) {
      dataQuery = dataQuery.eq('language_code', language);
    }
    if (q.trim()) {
      dataQuery = dataQuery.or(
        `topic.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%`
      );
    }

    const { data: items, error } = await dataQuery;

    if (error) {
      console.error('[/api/trending] Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const hasMore = offset + limit < total;

    return NextResponse.json(
      { items: items ?? [], total, page, hasMore, lastUpdated },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('[/api/trending] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
