import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Hero } from '@/components/landing/Hero';
import { PopularTools } from '@/components/landing/PopularTools';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQ } from '@/components/landing/FAQ';
import { Testimonials } from '@/components/landing/Testimonials';
import { BannerAd } from '@/components/shared/AdSense';
import { DiagrifBanner } from '@/components/landing/DiagrifBanner';

export const metadata: Metadata = {
  title: 'Formly Tools — 47 Free AI Tools Online | No Signup Required',
  description:
    'Free AI-powered tools: ATS resume scanner, AI job risk checker, pay stub generator, resume builder, grammar checker, PDF summarizer, image compressor, merge PDF & 39 more. No signup. No credit card. Works instantly in your browser.',
  keywords: [
    'free ai tools online', 'free tools no signup', 'ai productivity tools free',
    'pay stub generator free', 'resume builder free ai', 'grammar checker free online',
    'pdf summarizer free', 'free contract generator', 'income tax calculator india',
    'free diagram tool', 'formly tools',
  ],
  alternates: { canonical: 'https://formly.tools' },
  openGraph: {
    title: 'Formly Tools — 47 Free AI Tools Online | No Signup Required',
    description: '47 free AI-powered tools in one place. Pay stubs, resumes, contracts, grammar check, PDF summarizer, image compressor, merge PDF & more. No signup needed.',
    url: 'https://formly.tools',
    type: 'website',
    siteName: 'Formly Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formly Tools — 47 free AI tools | No Signup',
    description: '47 free AI tools: pay stubs, resumes, grammar checker, PDF summarizer, image compressor, merge PDF & more. No signup needed.',
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://formly.tools/#webpage',
  url: 'https://formly.tools',
  name: 'Formly Tools — 47 Free AI Tools Online',
  description: 'Free AI-powered tools: pay stub generator, resume builder, grammar checker, PDF summarizer, image compressor, merge PDF, contract generator, income tax calculator, diagram maker & 38 more. No signup required.',
  isPartOf: { '@id': 'https://formly.tools/#website' },
  about: { '@type': 'Thing', name: 'Free AI Tools' },
  datePublished: '2024-01-15',
  dateModified: '2026-05-31',
  inLanguage: 'en-US',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://formly.tools' }],
  },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.hero-description', '[data-speakable]'],
  },
};

const softwareAppListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Top Free AI Tools — Formly Tools',
  description: 'The most popular free AI-powered productivity tools on Formly Tools. No signup required.',
  url: 'https://formly.tools/tools',
  numberOfItems: 47,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Free Pay Stub Generator', url: 'https://formly.tools/tools/paystub-generator' },
    { '@type': 'ListItem', position: 2, name: 'Free Resume Builder', url: 'https://formly.tools/tools/resume-builder' },
    { '@type': 'ListItem', position: 3, name: 'Free Grammar Checker', url: 'https://formly.tools/tools/grammar-checker' },
    { '@type': 'ListItem', position: 4, name: 'Free PDF Summarizer', url: 'https://formly.tools/tools/pdf-summarizer' },
    { '@type': 'ListItem', position: 5, name: 'Free Contract Generator', url: 'https://formly.tools/tools/contract-generator' },
    { '@type': 'ListItem', position: 6, name: 'Free AI Diagram Tool (Diagrify)', url: 'https://formly.tools/tools/diagrify' },
    { '@type': 'ListItem', position: 7, name: 'Free Income Tax Calculator India', url: 'https://formly.tools/tools/income-tax-calculator' },
    { '@type': 'ListItem', position: 8, name: 'Free Email Writer', url: 'https://formly.tools/tools/email-writer' },
    { '@type': 'ListItem', position: 9, name: 'Free Cover Letter Generator', url: 'https://formly.tools/tools/cover-letter' },
    { '@type': 'ListItem', position: 10, name: 'Free Paraphraser Tool', url: 'https://formly.tools/tools/paraphraser' },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppListSchema) }} />
      <Header />
      <main>
        <div className="h-20" />
        <DiagrifBanner />
        <Hero />
        <PopularTools />

        <div className="max-w-4xl mx-auto px-4">
          <BannerAd />
        </div>

        <HowItWorks />
        <Testimonials />

        <div className="max-w-4xl mx-auto px-4">
          <BannerAd />
        </div>

        <PricingSection />
        <FAQ />

        {/* Final CTA */}
        <section className="section bg-stone-900">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-600/10 border border-orange-500/20 p-10 sm:p-12">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-4">Get Started</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to Supercharge Your Workflow?
              </h2>
              <p className="text-stone-400 mb-8 text-base sm:text-lg max-w-xl mx-auto">
                Join 50,000+ professionals who save hours every week with Formly.
                Start free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="/tools" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
                  Try All 47 Tools Free →
                </a>
                <a href="/pricing" className="inline-flex items-center justify-center gap-2 text-base px-8 py-4 rounded-xl font-semibold border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/70 transition-all duration-200 w-full sm:w-auto">
                  View Pro Plans
                </a>
              </div>
              <p className="text-xs text-stone-600 mt-6">
                Free forever · No credit card · Cancel pro anytime
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
