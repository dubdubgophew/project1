const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? 'a4f7c2b9e1d35870f6c8a09b72341e5d';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools';

export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  const body = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  // Bing/IndexNow endpoint (shared with Yandex, Naver, etc.)
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (res.status !== 200 && res.status !== 202) {
    const text = await res.text().catch(() => '');
    throw new Error(`IndexNow failed (${res.status}): ${text}`);
  }
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
