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
  title: 'Formly — 37 Free AI Tools: Pay Stub Generator, Resume Builder, Military Calisthenics Tracker & More',
  description:
    'Free AI tools online: pay stub generator, resume builder, contract generator, PDF summarizer, paraphraser, grammar checker, Iron Core 30-day workout tracker & 30 more. No signup needed. Used by 50,000+ professionals.',
  alternates: { canonical: 'https://formly.tools' },
};

export default function HomePage() {
  return (
    <>
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
                  Try All 37 Tools Free →
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
