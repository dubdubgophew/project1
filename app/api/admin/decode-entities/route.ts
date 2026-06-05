import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const maxDuration = 120;

// GET /api/admin/decode-entities?secret=ADMIN_SECRET&table=ai_news
// Decodes HTML entities (&#8217; &#8230; etc.) in topic and summary fields.

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g,          (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g,(_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'");
}

// Strip "The post X appeared first on Y." boilerplate from RSS summaries
function stripRSSBoilerplate(s: string): string {
  return s.replace(/\s*The post .+ appeared first on .+\.\s*$/i, '').trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const table = (searchParams.get('table') ?? 'ai_news') as 'ai_news' | 'trending_news';
  const supabase = createAdminClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all recent articles and filter client-side for any with entities or boilerplate
  const { data: all, error } = await supabase
    .from(table)
    .select('id, topic, summary')
    .gte('fetched_at', sevenDaysAgo)
    .limit(300);

  const data = (all ?? []).filter(r =>
    r.topic?.includes('&#') ||
    r.summary?.includes('&#') ||
    r.summary?.includes('appeared first on') ||
    r.summary?.includes('&amp;') ||
    r.summary?.includes('&lt;') ||
    r.topic?.includes('&amp;')
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data.length) return NextResponse.json({ message: 'Nothing to fix', fixed: 0 });

  let fixed = 0;
  const errors: string[] = [];

  for (const row of data) {
    const newTopic   = decodeEntities(row.topic);
    const newSummary = stripRSSBoilerplate(decodeEntities(row.summary));

    if (newTopic === row.topic && newSummary === row.summary) continue;

    const { error: upErr } = await supabase
      .from(table)
      .update({ topic: newTopic, summary: newSummary })
      .eq('id', row.id);

    if (upErr) errors.push(`${row.id}: ${upErr.message}`);
    else fixed++;
  }

  return NextResponse.json({ success: true, found: data.length, fixed, errors });
}
