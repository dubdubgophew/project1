export interface TrendingNews {
  id: string;
  country_code: string;
  country_name: string;
  topic: string;
  summary: string;
  traffic_volume: string | null;
  category: string;
  source_url: string;
  source_name: string;
  source_title: string | null;
  image_url: string | null;
  fetched_at: string;
  rank: number;
}

export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India',          flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦' },
  { code: 'AU', name: 'Australia',      flag: '🇦🇺' },
  { code: 'DE', name: 'Germany',        flag: '🇩🇪' },
  { code: 'FR', name: 'France',         flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil',         flag: '🇧🇷' },
  { code: 'JP', name: 'Japan',          flag: '🇯🇵' },
  { code: 'ID', name: 'Indonesia',      flag: '🇮🇩' },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['code'];

export const COUNTRY_MAP = Object.fromEntries(
  COUNTRIES.map(c => [c.code, c])
) as Record<CountryCode, (typeof COUNTRIES)[number]>;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Sports:        ['football','soccer','cricket','nba','nfl','tennis','golf','f1','formula','olympic','league','cup','match','score','sport','rugby','hockey','baseball','ipl','bcci'],
  Tech:          ['ai ','apple','google','microsoft','meta','amazon','tesla','spacex','iphone','android','chip','software','app ','tech','crypto','bitcoin','nft','cyber','hack','startup'],
  Politics:      ['election','president','prime minister','parliament','congress','senate','vote','government','policy','democrat','republican','party','minister','war','diplomacy','treaty'],
  Entertainment: ['movie','film','netflix','celebrity','oscar','grammy','music','album','actor','actress','singer','show','series','award','hollywood','bollywood'],
  Business:      ['stock','market','nasdaq','dow','economy','gdp','inflation','bank','finance','merger','ipo','revenue','profit','invest'],
  Health:        ['covid','vaccine','health','hospital','disease','cancer','fda','drug','clinical','treatment','mental health','virus','pandemic'],
};

export function detectCategory(topic: string, snippets: string[]): string {
  const text = `${topic} ${snippets.join(' ')}`.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(kw => text.includes(kw))) return cat;
  }
  return 'General';
}

function decodeXML(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '').trim();
}

export interface RawTrendItem {
  topic: string; traffic: string; imageUrl: string;
  newsTitle: string; newsUrl: string; newsSource: string; snippets: string[];
}

export function parseGTrendsRSS(xml: string): RawTrendItem[] {
  const items: RawTrendItem[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  for (const block of blocks.slice(0, 5)) {
    const topic     = decodeXML(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const traffic   = (block.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1] ?? '').trim();
    const imageUrl  = (block.match(/<ht:picture>([\s\S]*?)<\/ht:picture>/)?.[1] ?? '').trim();
    const newsTitle  = decodeXML(block.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/)?.[1] ?? '');
    const newsUrl    = (block.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/)?.[1] ?? '').trim();
    const newsSource = decodeXML(block.match(/<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/)?.[1] ?? '');
    const snippets   = [...block.matchAll(/<ht:news_item_snippet>([\s\S]*?)<\/ht:news_item_snippet>/g)]
      .map(m => decodeXML(m[1])).filter(Boolean);
    if (topic && newsUrl) items.push({ topic, traffic, imageUrl, newsTitle, newsUrl, newsSource, snippets });
  }
  return items;
}
