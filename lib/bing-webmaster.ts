/**
 * Bing Webmaster Tools API
 * Requires BING_WEBMASTER_API_KEY from https://www.bing.com/webmasters/
 * Settings → API Access → API Key
 *
 * Separate from IndexNow — gives Bing direct URL submission quota (10 req/day free tier).
 * Use in addition to IndexNow for new/updated pages.
 */

const API_KEY = process.env.BING_WEBMASTER_API_KEY;
const SITE_URL = 'https://formly.tools';
const BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

interface BingSubmitResult {
  submitted: number;
  error?: string;
}

export async function submitUrlsToBing(urls: string[]): Promise<BingSubmitResult> {
  if (!API_KEY) return { submitted: 0, error: 'BING_WEBMASTER_API_KEY not set' };
  if (!urls.length) return { submitted: 0 };

  try {
    const res = await fetch(`${BASE}/SubmitUrlBatch?apikey=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ siteUrl: SITE_URL, urlList: urls.slice(0, 500) }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { submitted: 0, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    return { submitted: urls.length };
  } catch (err) {
    return { submitted: 0, error: String(err) };
  }
}

/**
 * Fetch keyword stats from Bing Webmaster Tools.
 * Returns top keywords by impressions for a given page.
 * Useful for comparing Bing vs Google keyword distribution.
 */
export async function getBingKeywords(page: string, startDate: string, endDate: string) {
  if (!API_KEY) return null;

  try {
    const params = new URLSearchParams({
      apikey: API_KEY,
      siteUrl: SITE_URL,
      page,
      startDate,
      endDate,
    });

    const res = await fetch(`${BASE}/GetKeywordStats?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch page traffic stats from Bing Webmaster Tools.
 */
export async function getBingPageStats(startDate: string, endDate: string) {
  if (!API_KEY) return null;

  try {
    const params = new URLSearchParams({
      apikey: API_KEY,
      siteUrl: SITE_URL,
      startDate,
      endDate,
    });

    const res = await fetch(`${BASE}/GetPageStats?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
