export interface StockNewsItem {
  id: string;
  source_key: string;
  source_name: string;
  topic: string;
  summary: string;
  key_points: string[] | null;
  category: string;
  source_url: string;
  source_title: string | null;
  image_url: string | null;
  fetched_at: string;
  rank: number;
  country_code: string;
  country_name: string;
  language_code: string;
  language_name: string;
}

export const STOCK_SOURCES = [
  // Global / US
  { key: 'cnbc_markets',  name: 'CNBC Markets',      url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html',                               countryCode: 'US',     countryName: 'United States', langCode: 'en', langName: 'English' },
  { key: 'reuters_biz',   name: 'Reuters Business',  url: 'https://feeds.reuters.com/reuters/businessNews',                                       countryCode: 'GLOBAL', countryName: 'Global',        langCode: 'en', langName: 'English' },
  { key: 'marketwatch',   name: 'MarketWatch',       url: 'https://feeds.marketwatch.com/marketwatch/topstories/',                                countryCode: 'US',     countryName: 'United States', langCode: 'en', langName: 'English' },
  { key: 'yahoo_finance', name: 'Yahoo Finance',     url: 'https://finance.yahoo.com/news/rssindex',                                              countryCode: 'GLOBAL', countryName: 'Global',        langCode: 'en', langName: 'English' },
  { key: 'investing_com', name: 'Investing.com',     url: 'https://www.investing.com/rss/news.rss',                                               countryCode: 'GLOBAL', countryName: 'Global',        langCode: 'en', langName: 'English' },
  // UK
  { key: 'ft',            name: 'Financial Times',   url: 'https://www.ft.com/rss/home/uk',                                                       countryCode: 'GB',     countryName: 'United Kingdom', langCode: 'en', langName: 'English' },
  { key: 'guardian_fin',  name: 'The Guardian Money',url: 'https://www.theguardian.com/money/rss',                                                countryCode: 'GB',     countryName: 'United Kingdom', langCode: 'en', langName: 'English' },
  // India
  { key: 'et_markets',    name: 'ET Markets',        url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',                  countryCode: 'IN',     countryName: 'India',         langCode: 'en', langName: 'English' },
  { key: 'moneycontrol',  name: 'Moneycontrol',      url: 'https://www.moneycontrol.com/rss/business.xml',                                        countryCode: 'IN',     countryName: 'India',         langCode: 'en', langName: 'English' },
  { key: 'livemint',      name: 'Livemint Markets',  url: 'https://www.livemint.com/rss/markets',                                                 countryCode: 'IN',     countryName: 'India',         langCode: 'en', langName: 'English' },
  // Japan / Asia
  { key: 'nikkei',        name: 'Nikkei Asia',       url: 'https://asia.nikkei.com/rss/feed/nar',                                                 countryCode: 'JP',     countryName: 'Japan',         langCode: 'en', langName: 'English' },
  // Australia
  { key: 'afr',           name: 'AFR Markets',       url: 'https://www.afr.com/rss/markets.xml',                                                  countryCode: 'AU',     countryName: 'Australia',     langCode: 'en', langName: 'English' },
  // Germany
  { key: 'handelsblatt',  name: 'Handelsblatt',      url: 'https://www.handelsblatt.com/contentexport/feed/finanzen',                             countryCode: 'DE',     countryName: 'Germany',       langCode: 'de', langName: 'Deutsch' },
];

export const STOCK_CATEGORIES = [
  { value: 'all',          label: '📊 All' },
  { value: 'Markets',      label: '📈 Markets' },
  { value: 'Earnings',     label: '💰 Earnings' },
  { value: 'Macro',        label: '🏦 Macro & Economy' },
  { value: 'Analysis',     label: '🔍 Analysis' },
  { value: 'IPO',          label: '🚀 IPO & Deals' },
  { value: 'Commodities',  label: '🛢️ Commodities' },
  { value: 'Crypto',       label: '₿ Crypto' },
] as const;

export const STOCK_COUNTRIES = [
  { code: 'GLOBAL', name: 'Global',         flag: '🌐' },
  { code: 'US',     name: 'United States',  flag: '🇺🇸' },
  { code: 'GB',     name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN',     name: 'India',          flag: '🇮🇳' },
  { code: 'JP',     name: 'Japan',          flag: '🇯🇵' },
  { code: 'AU',     name: 'Australia',      flag: '🇦🇺' },
  { code: 'DE',     name: 'Germany',        flag: '🇩🇪' },
];

export interface StockRawItem {
  topic: string;
  newsUrl: string;
  newsTitle: string;
  imageUrl: string;
  snippets: string[];
}

function decodeXML(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/<[^>]+>/g, '').trim();
}

export function parseStockFeedRSS(xml: string): StockRawItem[] {
  const items: StockRawItem[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g)
    ?? xml.match(/<entry>([\s\S]*?)<\/entry>/g)
    ?? [];

  for (const block of blocks.slice(0, 5)) {
    const topic = decodeXML(
      block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''
    );

    const link =
      (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '').trim() ||
      (block.match(/<link[^>]+href="([^"]+)"/)?.[1] ?? '').trim() ||
      (block.match(/<guid[^>]*isPermaLink="true">([\s\S]*?)<\/guid>/)?.[1] ?? '').trim() ||
      (block.match(/<guid>([\s\S]*?)<\/guid>/)?.[1] ?? '').trim();

    const description = decodeXML(
      block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
      block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1] ??
      block.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] ?? ''
    );

    const imageUrl =
      (block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ?? '').trim() ||
      (block.match(/<media:content[^>]+url="([^"]+)"/)?.[1] ?? '').trim() ||
      (block.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ?? '').trim();

    if (topic && link) {
      items.push({
        topic,
        newsUrl: link,
        newsTitle: topic,
        imageUrl,
        snippets: description ? [description.slice(0, 400)] : [],
      });
    }
  }
  return items;
}
