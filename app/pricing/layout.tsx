import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Free & Pro Plans for AI Tools | Formly',
  description: 'Formly pricing: free forever plan with daily limits, Pro plan at $5.99/month for 200 uses/day. 40 AI tools — pay stub generator, resume builder, contract generator & more. No credit card to start.',
  keywords: ['formly pricing', 'ai tools pricing', 'free ai tools plan', 'formly pro', 'pay stub generator subscription', 'ai tools pro plan'],
  openGraph: {
    title: 'Formly Pricing — Free & Pro AI Tools Plans',
    description: 'Start free — no credit card. Pro plan $5.99/month for 200 uses/day across all 40 AI tools.',
    url: 'https://formly.tools/pricing',
    type: 'website',
    siteName: 'Formly',
  },
  alternates: { canonical: 'https://formly.tools/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Formly Pricing',
            description: 'Formly pricing plans — Free and Pro tiers for AI-powered productivity tools',
            url: 'https://formly.tools/pricing',
            mainEntity: {
              '@type': 'OfferCatalog',
              name: 'Formly Plans',
              itemListElement: [
                {
                  '@type': 'Offer',
                  name: 'Free Plan',
                  price: '0',
                  priceCurrency: 'USD',
                  description: '5–10 free uses per day per tool, no credit card required',
                  eligibleCustomerType: 'https://schema.org/EndUserCustomer',
                },
                {
                  '@type': 'Offer',
                  name: 'Pro Plan',
                  description: '200 uses/day, priority processing, PDF downloads, all 40 tools',
                  eligibleCustomerType: 'https://schema.org/EndUserCustomer',
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}
