import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export const maxDuration = 300;

// Cron: /api/cron/send-digest — schedule: 0 10 * * * (daily 10am UTC)
// Runs 1 hour after fetch-ai-news (9am) so fresh articles are always available.
// Secured by CRON_SECRET header (enforced in middleware.ts).

interface AINewsItem {
  id: string;
  topic: string;
  summary: string;
  category: string;
  source_url: string;
  source_name: string;
  image_url: string | null;
  fetched_at: string;
  rank: number;
}

interface Subscriber {
  id: string;
  email: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Tools:        '🛠️',
  Research:     '🔬',
  Companies:    '🏢',
  Hardware:     '⚙️',
  Learning:     '📚',
  'Open Source':'🐙',
  Industry:     '🏭',
};

function digestHtml(articles: AINewsItem[], unsubscribeId: string, dateLabel: string): string {
  const articleCards = articles.map((a) => {
    const emoji = CATEGORY_EMOJI[a.category] ?? '📰';
    const shortSummary = a.summary.length > 280 ? a.summary.slice(0, 277) + '…' : a.summary;
    return `
    <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:12px;font-weight:700;color:#a855f7;background:#7c3aed20;border:1px solid #7c3aed40;border-radius:20px;padding:2px 10px">${emoji} ${a.category}</span>
        <span style="font-size:11px;color:#4b5563;margin-left:auto">${a.source_name}</span>
      </div>
      <h3 style="margin:0 0 8px;font-size:16px;color:white;line-height:1.4">${a.topic}</h3>
      <p style="margin:0 0 14px;font-size:13px;color:#9ca3af;line-height:1.6">${shortSummary}</p>
      <a href="${a.source_url}" style="font-size:13px;color:#a855f7;font-weight:600;text-decoration:none">Read full story →</a>
    </div>`;
  }).join('');

  const unsubscribeUrl = `https://formly.tools/api/newsletter/unsubscribe?id=${unsubscribeId}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#030712;color:#f9fafb;margin:0;padding:0}
  .wrap{max-width:600px;margin:0 auto;padding:32px 24px}
  .logo{font-size:22px;font-weight:800;color:white;margin-bottom:8px}
  .logo span{color:#a855f7}
  .tagline{font-size:13px;color:#6b7280;margin-bottom:28px}
  .hero{background:linear-gradient(135deg,#7c3aed20,#a855f720);border:1px solid #7c3aed40;border-radius:16px;padding:24px;margin-bottom:28px}
  .hero h1{margin:0 0 6px;font-size:22px;color:white}
  .hero p{margin:0;color:#9ca3af;font-size:14px}
  .section-label{font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px}
  .divider{border:none;border-top:1px solid #1f2937;margin:28px 0}
  .tools{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;margin-bottom:16px}
  .tools h3{margin:0 0 12px;font-size:15px;color:white}
  .tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .tool-item{background:#1f2937;border-radius:8px;padding:10px 12px;font-size:13px}
  .tool-item a{color:#a855f7;text-decoration:none;font-weight:600}
  .tool-item p{margin:4px 0 0;color:#6b7280;font-size:12px}
  .footer{text-align:center;color:#374151;font-size:12px;margin-top:32px;line-height:2}
  .footer a{color:#6b7280;text-decoration:none}
</style></head>
<body>
<div class="wrap">
  <div class="logo">form<span>ly</span></div>
  <div class="tagline">Daily AI Digest · ${dateLabel}</div>

  <div class="hero">
    <h1>🤖 Today's Top AI Stories</h1>
    <p>The most important AI news from 10 sources, summarized so you can stay sharp in under 5 minutes.</p>
  </div>

  <div class="section-label">Top ${articles.length} stories today</div>

  ${articleCards}

  <hr class="divider">

  <div class="tools">
    <h3>⚡ Free AI Tools at formly.tools</h3>
    <div class="tool-grid">
      <div class="tool-item"><a href="https://formly.tools/tools/pdf-summarizer">PDF Summarizer</a><p>Summarize any paper in seconds</p></div>
      <div class="tool-item"><a href="https://formly.tools/tools/resume-builder">Resume Builder</a><p>ATS-optimized, PDF download</p></div>
      <div class="tool-item"><a href="https://formly.tools/tools/grammar-checker">Grammar Checker</a><p>Fix errors instantly, free</p></div>
      <div class="tool-item"><a href="https://formly.tools/tools/paraphraser">Paraphraser</a><p>Rewrite any text in 5 tones</p></div>
    </div>
  </div>

  <div style="text-align:center;margin:24px 0">
    <a href="https://formly.tools/ai-news" style="display:inline-block;background:#7c3aed;color:white;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px">View Full AI News Feed →</a>
  </div>

  <div class="footer">
    <p>Formly · Free AI Tools for Professionals · <a href="https://formly.tools">formly.tools</a></p>
    <p>You're receiving this because you subscribed to the Daily AI Digest.</p>
    <p><a href="${unsubscribeUrl}">Unsubscribe</a> · <a href="https://formly.tools/privacy">Privacy Policy</a></p>
  </div>
</div>
</body>
</html>`;
}

export async function POST(_req: NextRequest) {
  console.log('[Cron] send-digest started');

  if (!process.env.RESEND_API_KEY) {
    console.warn('[send-digest] RESEND_API_KEY not set — skipping');
    return NextResponse.json({ success: false, reason: 'RESEND_API_KEY not configured' });
  }

  const supabase = createAdminClient();
  const resend   = new Resend(process.env.RESEND_API_KEY);

  // 1. Fetch today's top AI news — prefer last 24h, fall back to most recent batch
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let { data: articles } = await supabase
    .from('ai_news')
    .select('id,topic,summary,category,source_url,source_name,image_url,fetched_at,rank')
    .gte('fetched_at', oneDayAgo)
    .order('fetched_at', { ascending: false })
    .order('rank', { ascending: true })
    .limit(8);

  // Fallback: if cron ran but no fresh news yet, grab the most recent stored articles
  if (!articles || articles.length < 4) {
    const { data: fallback } = await supabase
      .from('ai_news')
      .select('id,topic,summary,category,source_url,source_name,image_url,fetched_at,rank')
      .order('fetched_at', { ascending: false })
      .order('rank', { ascending: true })
      .limit(8);
    articles = fallback ?? [];
  }

  if (!articles || articles.length === 0) {
    console.warn('[send-digest] No articles available — skipping send');
    return NextResponse.json({ success: false, reason: 'No articles to send' });
  }

  const topArticles = articles as AINewsItem[];

  // 2. Fetch all active subscribers
  const { data: subscribers, error: subErr } = await supabase
    .from('newsletter_subscribers')
    .select('id, email')
    .eq('subscribed', true);

  if (subErr) {
    console.error('[send-digest] Could not fetch subscribers:', subErr);
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }

  const subs = (subscribers ?? []) as Subscriber[];
  if (subs.length === 0) {
    console.log('[send-digest] No active subscribers');
    return NextResponse.json({ success: true, sent: 0 });
  }

  console.log(`[send-digest] Sending digest to ${subs.length} subscribers…`);

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Formly AI Digest <noreply@formly.tools>';

  // 3. Send in batches of 50 (Resend batch API limit)
  let sent = 0;
  let failed = 0;
  const BATCH = 50;

  for (let i = 0; i < subs.length; i += BATCH) {
    const batch = subs.slice(i, i + BATCH);
    const payload = batch.map(sub => ({
      from: fromAddress,
      to: sub.email,
      subject: `🤖 Daily AI Digest — ${dateLabel}`,
      html: digestHtml(topArticles, sub.id, dateLabel),
    }));

    try {
      await resend.batch.send(payload);
      sent += batch.length;
    } catch (err) {
      console.error(`[send-digest] Batch ${i}–${i + BATCH} failed:`, err);
      failed += batch.length;
    }

    // Small delay between batches to avoid bursting Resend's rate limit
    if (i + BATCH < subs.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`[send-digest] Done. Sent: ${sent}, Failed: ${failed}`);
  return NextResponse.json({ success: true, sent, failed, articleCount: topArticles.length });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
