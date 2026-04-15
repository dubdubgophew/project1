import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWeeklyReport } from '@/agents/analytics-reporter';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sendWeeklyReport();

    if (req.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Report send failed.' }, { status: 500 });
  }
}
