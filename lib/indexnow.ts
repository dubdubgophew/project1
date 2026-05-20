const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? 'a4f7c2b9e1d35870f6c8a09b72341e5d';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools').replace(/\/$/, '');

// IndexNow-compatible endpoints — one submission notifies all participating engines
// (Bing, Yandex, Naver, Seznam, Yep, DuckDuckGo-via-Bing, Yahoo-via-Bing, Ecosia-via-Bing)
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',   // hub — distributes to all members
  'https://www.bing.com/indexnow',        // Bing directly (belt+suspenders)
  'https://yandex.com/indexnow',          // Yandex directly
];

export async function submitToIndexNow(urls: string[]): Promise<{ engine: string; status: number }[]> {
  if (!urls.length) return [];

  const body = JSON.stringify({
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      return { engine: endpoint, status: res.status };
    })
  );

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { engine: INDEXNOW_ENDPOINTS[i], status: 0 }
  );
}

// Google doesn't use IndexNow. Ping their sitemap endpoint (widely used, still effective).
// Note: Google removed the /ping endpoint officially in 2023 but community reports it still works.
// Primary indexing signal: keep sitemap.xml fresh and GSC verified.
export async function pingSitemaps(): Promise<{ engine: string; status: number }[]> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);

  const endpoints = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (url) => {
      const res = await fetch(url, { method: 'GET' });
      return { engine: url.split('?')[0], status: res.status };
    })
  );

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { engine: endpoints[i].split('?')[0], status: 0 }
  );
}

export function allToolUrls(): string[] {
  const tools = [
    'pdf-summarizer', 'paraphraser', 'grammar-checker', 'email-writer',
    'code-explainer', 'paystub-generator', 'resume-builder', 'contract-generator',
    'hashtag-generator', 'bio-writer', 'cover-letter', 'code-reviewer',
    'terms-simplifier', 'json-formatter', 'base64', 'password-generator',
    'word-counter', 'expense-splitter', 'loan-calculator', 'unit-converter',
    'age-calculator', 'text-case', 'color-converter', 'regex-tester',
    'diff-checker', 'pdf-to-markdown',
  ];
  return [
    SITE_URL,
    `${SITE_URL}/tools`,
    `${SITE_URL}/pricing`,
    ...tools.map(t => `${SITE_URL}/tools/${t}`),
  ];
}
