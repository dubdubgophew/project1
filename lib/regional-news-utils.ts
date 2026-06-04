export interface RegionalFeed {
  key: string;
  countryCode: string;
  countryName: string;
  langCode: string;
  langName: string;
  url: string;
  name: string;
}

// Language display config for UI pills
export const LANGUAGES = [
  { code: 'en', name: 'English',   flag: '🌐' },
  { code: 'hi', name: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்',    flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी',    flag: '🇮🇳' },
  { code: 'es', name: 'Español',   flag: '🇲🇽' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'ja', name: '日本語',    flag: '🇯🇵' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'العربية',  flag: '🌍' },
] as const;

export const REGIONAL_FEEDS: RegionalFeed[] = [
  // India – extra English sources
  { key: 'IN_EN_NDTV',  countryCode: 'IN', countryName: 'India', langCode: 'en', langName: 'English',  url: 'https://feeds.feedburner.com/ndtvnews-top-stories',               name: 'NDTV' },
  { key: 'IN_EN_HINDU', countryCode: 'IN', countryName: 'India', langCode: 'en', langName: 'English',  url: 'https://www.thehindu.com/news/national/feeder/default.rss',        name: 'The Hindu' },
  { key: 'IN_EN_IT',    countryCode: 'IN', countryName: 'India', langCode: 'en', langName: 'English',  url: 'https://www.indiatoday.in/rss/home',                               name: 'India Today' },

  // India – Hindi
  { key: 'IN_HI_NBT',   countryCode: 'IN', countryName: 'India', langCode: 'hi', langName: 'हिन्दी', url: 'https://navbharattimes.indiatimes.com/rssfeedstopstories.cms',     name: 'Navbharat Times' },
  { key: 'IN_HI_JGN',   countryCode: 'IN', countryName: 'India', langCode: 'hi', langName: 'हिन्दी', url: 'https://www.jagran.com/rss/news-national.xml',                     name: 'Dainik Jagran' },
  { key: 'IN_HI_AU',    countryCode: 'IN', countryName: 'India', langCode: 'hi', langName: 'हिन्दी', url: 'https://www.amarujala.com/rss/breaking-news.xml',                  name: 'Amar Ujala' },

  // India – Tamil
  { key: 'IN_TA_DML',   countryCode: 'IN', countryName: 'India', langCode: 'ta', langName: 'தமிழ்', url: 'https://www.dinamalar.com/rss.asp',                                name: 'Dinamalar' },

  // India – Marathi
  { key: 'IN_MR_MT',    countryCode: 'IN', countryName: 'India', langCode: 'mr', langName: 'मराठी',  url: 'https://maharashtratimes.com/rssfeedstopstories.cms',              name: 'Maharashtra Times' },

  // Brazil – Portuguese
  { key: 'BR_PT_BBC',   countryCode: 'BR', countryName: 'Brazil',     langCode: 'pt', langName: 'Português', url: 'https://feeds.bbci.co.uk/portuguese/rss.xml',               name: 'BBC Brasil' },

  // Latin America – Spanish
  { key: 'MX_ES_BBC',   countryCode: 'MX', countryName: 'Mexico',     langCode: 'es', langName: 'Español',  url: 'https://feeds.bbci.co.uk/mundo/rss.xml',                    name: 'BBC Mundo' },

  // Germany – German
  { key: 'DE_DE_SPG',   countryCode: 'DE', countryName: 'Germany',    langCode: 'de', langName: 'Deutsch',  url: 'https://www.spiegel.de/schlagzeilen/index.rss',             name: 'Der Spiegel' },
  { key: 'DE_DE_DW',    countryCode: 'DE', countryName: 'Germany',    langCode: 'de', langName: 'Deutsch',  url: 'https://rss.dw.com/rdf/rss-de-all',                         name: 'DW Deutsch' },

  // France – French
  { key: 'FR_FR_LM',    countryCode: 'FR', countryName: 'France',     langCode: 'fr', langName: 'Français', url: 'https://www.lemonde.fr/rss/une.xml',                        name: 'Le Monde' },
  { key: 'FR_FR_BBC',   countryCode: 'FR', countryName: 'France',     langCode: 'fr', langName: 'Français', url: 'https://feeds.bbci.co.uk/french/rss.xml',                   name: 'BBC French' },

  // Japan – Japanese
  { key: 'JP_JA_NHK',   countryCode: 'JP', countryName: 'Japan',     langCode: 'ja', langName: '日本語',   url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',                  name: 'NHK News' },

  // Indonesia – Indonesian
  { key: 'ID_ID_KMP',   countryCode: 'ID', countryName: 'Indonesia',  langCode: 'id', langName: 'Indonesia', url: 'https://rss.kompas.com/nasional',                         name: 'Kompas' },

  // Arabic
  { key: 'AR_AR_BBC',   countryCode: 'AE', countryName: 'Arab World', langCode: 'ar', langName: 'العربية',  url: 'https://feeds.bbci.co.uk/arabic/rss.xml',                  name: 'BBC Arabic' },
];
