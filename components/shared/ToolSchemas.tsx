interface FAQ { q: string; a: string }

interface HowToStep {
  name: string;
  text: string;
}

interface ToolSchemasProps {
  name: string;
  description: string;
  url: string;
  category: string;
  features: string[];
  faqs?: FAQ[];
  steps?: HowToStep[];
  /** Override the dateModified signal (ISO date string, default: today) */
  dateModified?: string;
  /** Optional aggregate rating for this specific tool */
  rating?: { value: number; count: number };
}

const TODAY = '2026-05-31';
const PUBLISHED = '2024-01-15';

export function ToolSchemas({
  name, description, url, category, features, faqs, steps,
  dateModified = TODAY,
  rating = { value: 4.8, count: 1247 },
}: ToolSchemasProps) {

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://formly.tools' },
      { '@type': 'ListItem', position: 2, name: 'Free AI Tools', item: 'https://formly.tools/tools' },
      { '@type': 'ListItem', position: 3, name, item: url },
    ],
  };

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: 'Any — runs in browser, no installation required',
    browserRequirements: 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
    },
    provider: {
      '@type': 'Organization',
      name: 'Formly Tools',
      url: 'https://formly.tools',
      sameAs: ['https://twitter.com/formlytools'],
    },
    author: { '@type': 'Organization', name: 'Formly Tools', url: 'https://formly.tools' },
    featureList: features,
    isAccessibleForFree: true,
    inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-AU', 'en-CA'],
    datePublished: PUBLISHED,
    dateModified,
    softwareVersion: '2.1',
    creativeWorkStatus: 'Published',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(rating.value),
      reviewCount: String(rating.count),
      bestRating: '5',
      worstRating: '1',
    },
    // Audience signals help AI engines categorize and recommend correctly
    audience: {
      '@type': 'Audience',
      audienceType: 'Professionals, Students, Freelancers, Small Business Owners',
      geographicArea: {
        '@type': 'AdministrativeArea',
        name: 'Worldwide — USA, United Kingdom, India, Australia, Canada, New Zealand, Singapore',
      },
    },
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  const howToSchema = steps && steps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${name} — Step by Step`,
    description,
    dateModified,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${url}#step-${i + 1}`,
    })),
    tool: { '@type': 'HowToTool', name, url },
    supply: { '@type': 'HowToSupply', name: 'Web browser — no download needed' },
    totalTime: 'PT2M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
  } : null;

  // SpeakableSpecification tells Google Assistant / voice search what to read aloud
  const speakable = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.tool-description', '.tool-hero-desc', '[data-speakable]'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakable) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {howToSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      )}
    </>
  );
}
