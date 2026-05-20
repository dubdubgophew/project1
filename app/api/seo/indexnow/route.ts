import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = 'https://formly.tools';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? '';

// All URLs to submit
const ALL_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/tools`,
  `${SITE_URL}/blog`,
  `${SITE_URL}/pricing`,
  // Tools
  `${SITE_URL}/tools/pdf-summarizer`,
  `${SITE_URL}/tools/paraphraser`,
  `${SITE_URL}/tools/grammar-checker`,
  `${SITE_URL}/tools/email-writer`,
  `${SITE_URL}/tools/resume-builder`,
  `${SITE_URL}/tools/hashtag-generator`,
  `${SITE_URL}/tools/bio-writer`,
  `${SITE_URL}/tools/cover-letter`,
  `${SITE_URL}/tools/pdf-to-markdown`,
  `${SITE_URL}/tools/paystub-generator`,
  `${SITE_URL}/tools/contract-generator`,
  `${SITE_URL}/tools/terms-simplifier`,
  `${SITE_URL}/tools/code-explainer`,
  `${SITE_URL}/tools/code-reviewer`,
  `${SITE_URL}/tools/json-formatter`,
  `${SITE_URL}/tools/base64`,
  `${SITE_URL}/tools/color-converter`,
  `${SITE_URL}/tools/regex-tester`,
  `${SITE_URL}/tools/diff-checker`,
  `${SITE_URL}/tools/password-generator`,
  `${SITE_URL}/tools/word-counter`,
  `${SITE_URL}/tools/unit-converter`,
  `${SITE_URL}/tools/age-calculator`,
  `${SITE_URL}/tools/text-case`,
  `${SITE_URL}/tools/expense-splitter`,
  `${SITE_URL}/tools/loan-calculator`,
];

export async function POST(req: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 });
  }

  // Optional: accept extra URLs in body
  let extraUrls: string[] = [];
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body.urls)) extraUrls = body.urls;
  } catch {}

  const urlsToSubmit = [...new Set([...ALL_URLS, ...extraUrls])];

  const results: Record<string, string> = {};

  // Submit to IndexNow (covers Bing, Yandex, and others)
  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'formly.tools',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urlsToSubmit,
      }),
    });
    results.indexnow = res.ok ? 'success' : `error_${res.status}`;
  } catch (e) {
    results.indexnow = 'network_error';
  }

  // Submit sitemap to Google
  try {
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`
    );
    results.google_sitemap = googleRes.ok ? 'pinged' : `error_${googleRes.status}`;
  } catch {
    results.google_sitemap = 'network_error';
  }

  // Submit sitemap to Bing
  try {
    const bingRes = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`
    );
    results.bing_sitemap = bingRes.ok ? 'pinged' : `error_${bingRes.status}`;
  } catch {
    results.bing_sitemap = 'network_error';
  }

  return NextResponse.json({
    submitted: urlsToSubmit.length,
    results,
    timestamp: new Date().toISOString(),
  });
}

// GET: manual trigger
export async function GET(req: NextRequest) {
  return POST(req);
}
