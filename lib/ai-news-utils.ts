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
}

export const AI_SOURCES = [
  { key: 'techcrunch',  name: 'TechCrunch AI',       url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { key: 'venturebeat', name: 'VentureBeat AI',       url: 'https://venturebeat.com/category/ai/feed/' },
  { key: 'theverge',    name: 'The Verge AI',         url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml' },
  { key: 'arstechnica', name: 'Ars Technica',         url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { key: 'mitreview',   name: 'MIT Tech Review',      url: 'https://www.technologyreview.com/feed/' },
  { key: 'googleai',    name: 'Google AI Blog',       url: 'https://blog.google/technology/ai/rss/' },
  { key: 'huggingface', name: 'Hugging Face Blog',    url: 'https://huggingface.co/blog/feed.xml' },
  { key: 'ainews',      name: 'AI News',              url: 'https://artificialintelligence-news.com/feed/' },
  { key: 'reddit_ai',   name: 'Reddit r/artificial',  url: 'https://www.reddit.com/r/artificial/.rss' },
  { key: 'reddit_ml',   name: 'Reddit r/MachineLearning', url: 'https://www.reddit.com/r/MachineLearning/.rss' },
] as const;

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
