interface FAQ { q: string; a: string }

interface ToolSchemasProps {
  name: string;
  description: string;
  url: string;
  category: string;
  features: string[];
  faqs?: FAQ[];
}

export function ToolSchemas({ name, description, url, category, features, faqs }: ToolSchemasProps) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://formly.tools' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://formly.tools/tools' },
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
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Works in all modern browsers.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
    featureList: features,
    isAccessibleForFree: true,
    inLanguage: 'en',
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </>
  );
}
