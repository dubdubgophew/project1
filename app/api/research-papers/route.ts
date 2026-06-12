import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { ResearchPaper } from '@/lib/research-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') ?? 'all';
    const impact = searchParams.get('impact') ?? 'all';
    const sort   = searchParams.get('sort')   ?? 'latest';
    const q      = searchParams.get('q')      ?? '';
    const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10));
    const limit  = Math.min(30, parseInt(searchParams.get('limit') ?? '9', 10));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    const { data: latestRow } = await supabase
      .from('research_papers')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let query = supabase
      .from('research_papers')
      .select('*', { count: 'exact' });

    if (sort === 'impact') {
      query = query.order('rank', { ascending: true }).order('fetched_at', { ascending: false });
    } else {
      query = query.order('fetched_at', { ascending: false }).order('rank', { ascending: true });
    }

    query = query.range(offset, offset + limit - 1);

    if (domain && domain !== 'all') query = query.eq('domain', domain);
    if (impact && impact !== 'all') query = query.eq('impact_level', impact);
    if (q.trim()) query = query.or(`title.ilike.%${q.trim()}%,tldr.ilike.%${q.trim()}%,abstract.ilike.%${q.trim()}%`);

    const { data: items, count } = await query;
    const total = count ?? 0;

    return NextResponse.json(
      {
        items: (items as ResearchPaper[]) ?? [],
        total,
        page,
        hasMore: offset + limit < total,
        lastUpdated: latestRow?.fetched_at ?? null,
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
