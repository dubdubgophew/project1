import { NextRequest, NextResponse } from 'next/server';
import { runToolQAAgent } from '@/agents/tool-qa-agent';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runToolQAAgent('cron');
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[Cron] tool-qa-agent error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
