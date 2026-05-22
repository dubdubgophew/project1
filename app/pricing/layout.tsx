import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Free & Pro Plans for AI Tools | Formly',
  description: 'Formly pricing: free forever plan with daily limits, Pro for unlimited AI tool usage. Pay stub generator, resume builder, contract generator & 26 more tools. No credit card to start.',
  keywords: ['formly pricing', 'ai tools pricing', 'free ai tools plan', 'formly pro', 'pay stub generator subscription', 'unlimited ai tools'],
  openGraph: {
    title: 'Formly Pricing — Free & Pro AI Tools Plans',
    description: 'Start free — no credit card. Upgrade to Pro for unlimited use of all 29 AI tools.',
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
                  description: 'Unlimited uses, priority processing, all 29 tools',
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
