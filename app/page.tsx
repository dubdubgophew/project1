import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQ } from '@/components/landing/FAQ';
import { Testimonials } from '@/components/landing/Testimonials';
import { BannerAd } from '@/components/shared/AdSense';

export const metadata: Metadata = {
  title: 'Formly — 10 Free AI Tools: PDF Summarizer, Paraphraser, Grammar Checker & More',
  description:
    'Free AI tools online: PDF summarizer, paraphraser, grammar checker, email writer, code explainer, YouTube summarizer, resume builder & more. No signup needed. Powered by Groq AI.',
  alternates: { canonical: 'https://formly.tools' },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* Natural AdSense placement — between sections, not intrusive */}
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
        <section className="section bg-gray-950">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="rounded-3xl bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-pink-600/10 border border-violet-500/20 p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Supercharge Your Workflow?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join 50,000+ professionals who save hours every week with Formly.
                Start free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/tools" className="btn-primary text-base px-8 py-4">
                  Try All 10 Tools Free →
                </a>
                <a href="/pricing" className="btn-outline text-base px-8 py-4">
                  View Pro Plans
                </a>
              </div>
              <p className="text-xs text-gray-600 mt-6">
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
