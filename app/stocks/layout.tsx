import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Market News — Global Markets Today | Formly',
  description:
    'Live stock market news from NYSE, NASDAQ, LSE, NSE, ASX, TSE, and XETRA. AI-summarized earnings reports, macro analysis, IPOs, commodities, and crypto — updated daily. No signup required.',
  keywords: [
    'stock market news today',
    'global stock market news',
    'NYSE news today',
    'NASDAQ news today',
    'stock market analysis',
    'earnings reports today',
    'IPO news 2025',
    'stock market today live',
    'market news AI summarized',
    'CNBC markets news',
    'Financial Times markets',
    'ET Markets India',
    'NSE BSE news today',
    'commodities market news',
    'crypto market news',
    'macro economy news',
    'Nikkei Asia markets',
    'ASX market news',
    'DAX market news Germany',
    'stock market briefing',
  ],
  alternates: {
    canonical: 'https://formly.tools/stocks',
    languages: {
      'en-US': 'https://formly.tools/stocks?country=US',
      'en-GB': 'https://formly.tools/stocks?country=GB',
      'en-IN': 'https://formly.tools/stocks?country=IN',
      'en-AU': 'https://formly.tools/stocks?country=AU',
      'en-JP': 'https://formly.tools/stocks?country=JP',
      'de-DE': 'https://formly.tools/stocks?country=DE',
      'x-default': 'https://formly.tools/stocks',
    },
  },
  openGraph: {
    title: 'Stock Market News — Global Markets Today | Formly',
    description:
      'AI-summarized stock market news from NYSE, NASDAQ, LSE, NSE, ASX, TSE, and XETRA. Earnings, macro, IPOs, commodities, crypto — updated daily.',
    type: 'website',
    url: 'https://formly.tools/stocks',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Market News — Global Markets Today | Formly',
    description: 'AI-summarized stock market news from NYSE, NASDAQ, LSE, NSE, ASX & more. Earnings, IPOs, macro, crypto — updated daily.',
  },
};

export default function StocksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Stock Market News — Global Markets Today',
            description:
              'Daily AI-summarized stock market news from NYSE, NASDAQ, London Stock Exchange, NSE/BSE India, ASX Australia, Tokyo Stock Exchange, and XETRA Germany. Covers earnings, IPOs, macro, commodities, and crypto.',
            url: 'https://formly.tools/stocks',
            dateModified: new Date().toISOString().split('T')[0],
            isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
            about: [
              { '@type': 'Thing', name: 'Stock Market', sameAs: 'https://en.wikipedia.org/wiki/Stock_market' },
              { '@type': 'Thing', name: 'Financial Markets', sameAs: 'https://en.wikipedia.org/wiki/Financial_market' },
              { '@type': 'Thing', name: 'NYSE', sameAs: 'https://en.wikipedia.org/wiki/New_York_Stock_Exchange' },
              { '@type': 'Thing', name: 'NASDAQ', sameAs: 'https://en.wikipedia.org/wiki/Nasdaq' },
            ],
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-AU', 'en-JP', 'de-DE'],
            audience: { '@type': 'Audience', audienceType: 'Investors, traders, finance professionals, and market watchers' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Which stock markets does Formly cover?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Formly covers stock market news from NYSE and NASDAQ (USA), London Stock Exchange (UK), NSE and BSE (India), ASX (Australia), Tokyo Stock Exchange (Japan), and XETRA/DAX (Germany). Global markets news comes from CNBC Markets, Reuters Business, MarketWatch, Yahoo Finance, and Investing.com.',
                },
              },
              {
                '@type': 'Question',
                name: 'What categories of stock market news are available?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Formly stock news is organized into eight categories: Markets (indices, price movements), Earnings (quarterly results, guidance), Macro & Economy (interest rates, GDP, inflation), Analysis (expert commentary, forecasts), IPO & Deals (new listings, mergers, acquisitions), Commodities (oil, gold, metals), and Crypto (Bitcoin, Ethereum, DeFi).',
                },
              },
              {
                '@type': 'Question',
                name: 'How often is stock market news updated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Stock market news on Formly is refreshed daily at 2pm UTC, pulling the latest articles from 13 financial RSS feeds across 6 countries and 2 languages (English and German).',
                },
              },
              {
                '@type': 'Question',
                name: 'Which financial news sources does Formly use for stock news?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sources include CNBC Markets, Reuters Business, MarketWatch, Yahoo Finance, Investing.com, Financial Times, The Guardian Money (UK), Economic Times Markets, Moneycontrol, Livemint Markets (India), Nikkei Asia (Japan), AFR Markets (Australia), and Handelsblatt (Germany).',
                },
              },
              {
                '@type': 'Question',
                name: 'Is Formly stock market news free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. All stock market news on Formly is completely free with no account, subscription, or signup required.',
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
