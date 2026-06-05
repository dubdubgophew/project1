export interface AINewsItem {
  id: string;
  source_key: string;
  source_name: string;
  topic: string;
  summary: string;
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
  key_points: string[] | null;
}

export const AI_SOURCES = [
  { key: 'techcrunch',  name: 'TechCrunch AI',            url: 'https://techcrunch.com/category/artificial-intelligence/feed/',     countryCode: 'GLOBAL', countryName: 'Global', langCode: 'en', langName: 'English' },
  { key: 'venturebeat', name: 'VentureBeat AI',            url: 'https://venturebeat.com/category/ai/feed/',                          countryCode: 'GLOBAL', countryName: 'Global', langCode: 'en', langName: 'English' },
  { key: 'theverge',    name: 'The Verge AI',              url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',   countryCode: 'GLOBAL', countryName: 'Global', langCode: 'en', langName: 'English' },
  { key: 'arstechnica', name: 'Ars Technica',              url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',            countryCode: 'US',     countryName: 'United States', langCode: 'en', langName: 'English' },
  { key: 'mitreview',   name: 'MIT Tech Review',           url: 'https://www.technologyreview.com/feed/',                             countryCode: 'US',     countryName: 'United States', langCode: 'en', langName: 'English' },
  { key: 'googleai',    name: 'Google AI Blog',            url: 'https://blog.google/technology/ai/rss/',                             countryCode: 'US',     countryName: 'United States', langCode: 'en', langName: 'English' },
  { key: 'huggingface', name: 'Hugging Face Blog',         url: 'https://huggingface.co/blog/feed.xml',                               countryCode: 'GLOBAL', countryName: 'Global', langCode: 'en', langName: 'English' },
  { key: 'ainews',      name: 'AI News',                   url: 'https://artificialintelligence-news.com/feed/',                      countryCode: 'GB',     countryName: 'United Kingdom', langCode: 'en', langName: 'English' },
  { key: 'reddit_ai',   name: 'Reddit r/artificial',       url: 'https://www.reddit.com/r/artificial/.rss',                           countryCode: 'GLOBAL', countryName: 'Global', langCode: 'en', langName: 'English' },
  { key: 'reddit_ml',   name: 'Reddit r/MachineLearning',  url: 'https://www.reddit.com/r/MachineLearning/.rss',                      countryCode: 'GLOBAL', countryName: 'Global', langCode: 'en', langName: 'English' },
  // Regional AI sources
  { key: 'aim_india',   name: 'Analytics India Mag',       url: 'https://analyticsindiamag.com/feed/',                               countryCode: 'IN',     countryName: 'India',   langCode: 'en', langName: 'English' },
  { key: 'inc42',       name: 'Inc42 AI',                  url: 'https://inc42.com/tag/artificial-intelligence/feed/',               countryCode: 'IN',     countryName: 'India',   langCode: 'en', langName: 'English' },
  { key: 'heise_ai',    name: 'Heise KI',                  url: 'https://www.heise.de/thema/KI/feed/rss.xml',                        countryCode: 'DE',     countryName: 'Germany', langCode: 'de', langName: 'Deutsch' },
  { key: 'silicon_fr',  name: 'Silicon.fr',                url: 'https://www.silicon.fr/feed/',                                      countryCode: 'FR',     countryName: 'France',  langCode: 'fr', langName: 'Français' },
  { key: 'xataka',      name: 'Xataka IA',                 url: 'https://www.xataka.com/tag/inteligencia-artificial/rss',            countryCode: 'ES',     countryName: 'Spain',   langCode: 'es', langName: 'Español' },
  { key: 'olhar',       name: 'Olhar Digital',             url: 'https://olhardigital.com.br/editoria/inteligencia-artificial/feed/', countryCode: 'BR',     countryName: 'Brazil',  langCode: 'pt', langName: 'Português' },
];

export type AISourceKey = (typeof AI_SOURCES)[number]['key'];

export const AI_CATEGORIES = [
  { value: 'all',        label: '✨ All' },
  { value: 'Tools',      label: '🛠️ Tools' },
  { value: 'Research',   label: '🔬 Research' },
  { value: 'Companies',  label: '🏢 Companies' },
  { value: 'Hardware',   label: '⚡ Hardware' },
  { value: 'Learning',   label: '📚 Learning' },
  { value: 'Open Source',label: '🌐 Open Source' },
  { value: 'Industry',   label: '💼 Industry' },
] as const;

function decodeXML(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '').trim();
}

export interface AIRawItem {
  topic: string;
  newsUrl: string;
  newsTitle: string;
  imageUrl: string;
  snippets: string[];
}

export function parseAIFeedRSS(xml: string): AIRawItem[] {
  const items: AIRawItem[] = [];
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
      (block.match(/<atom:link[^>]+href="([^"]+)"/)?.[1] ?? '').trim() ||
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
