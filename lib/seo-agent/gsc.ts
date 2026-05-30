/**
 * Google Search Console API client
 * Supports two auth methods:
 *   1. OAuth2 refresh token (recommended — works for regular Google accounts)
 *   2. Service account JWT (requires Google Workspace domain-wide delegation)
 */

import crypto from 'crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PageMetric {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface KeywordMetric {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export function isGSCConfigured(): boolean {
  const hasOAuth = !!(process.env.GSC_CLIENT_ID && process.env.GSC_CLIENT_SECRET && process.env.GSC_REFRESH_TOKEN);
  const hasServiceAccount = !!(process.env.GSC_SERVICE_ACCOUNT_JSON);
  return !!(process.env.GSC_SITE_URL && (hasOAuth || hasServiceAccount));
}

// ── Auth method 1: OAuth2 refresh token ──────────────────────────────────────

async function getTokenFromRefreshToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GSC_CLIENT_ID!,
      client_secret: process.env.GSC_CLIENT_SECRET!,
      refresh_token: process.env.GSC_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json() as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) throw new Error(`GSC OAuth failed: ${data.error} — ${data.error_description}`);
  return data.access_token;
}

// ── Auth method 2: Service account JWT ───────────────────────────────────────

async function getTokenFromServiceAccount(): Promise<string> {
  const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON!) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const sigInput = `${header}.${claims}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${sigInput}.${sig}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`GSC service account auth failed: ${data.error}`);
  return data.access_token;
}

async function getAccessToken(): Promise<string> {
  if (process.env.GSC_CLIENT_ID && process.env.GSC_REFRESH_TOKEN) {
    return getTokenFromRefreshToken();
  }
  return getTokenFromServiceAccount();
}

// ── GSC query ─────────────────────────────────────────────────────────────────

async function gscQuery(token: string, siteUrl: string, body: Record<string, unknown>): Promise<GSCRow[]> {
  const encoded = encodeURIComponent(siteUrl);
  const res = await fetch(`${GSC_API}/${encoded}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSC query failed ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json() as { rows?: GSCRow[] };
  return data.rows ?? [];
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ── List all verified GSC properties (for debugging) ─────────────────────────

export async function listGSCSites(): Promise<string[]> {
  const token = await getAccessToken();
  const res = await fetch(GSC_API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSC list sites failed ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json() as { siteEntry?: { siteUrl: string }[] };
  return (data.siteEntry ?? []).map(s => s.siteUrl);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchGSCData(windowDays = 14): Promise<{
  pages: PageMetric[];
  pagesPrev: PageMetric[];
  keywords: KeywordMetric[];
  dateRange: { start: string; end: string };
}> {
  const siteUrl = process.env.GSC_SITE_URL!;
  const token = await getAccessToken();

  // GSC has ~3 day reporting lag
  const endDate = daysAgoStr(3);
  const startDate = daysAgoStr(windowDays + 3);
  const prevStart = daysAgoStr(windowDays * 2 + 3);
  const prevEnd = daysAgoStr(windowDays + 3);

  const [pageRows, pagePrevRows, kwRows] = await Promise.all([
    gscQuery(token, siteUrl, { startDate, endDate, dimensions: ['page'], rowLimit: 1000 }),
    gscQuery(token, siteUrl, { startDate: prevStart, endDate: prevEnd, dimensions: ['page'], rowLimit: 1000 }),
    gscQuery(token, siteUrl, { startDate, endDate, dimensions: ['query', 'page'], rowLimit: 5000 }),
  ]);

  return {
    pages: pageRows.map(r => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    pagesPrev: pagePrevRows.map(r => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    keywords: kwRows.map(r => ({ query: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    dateRange: { start: startDate, end: endDate },
  };
}
