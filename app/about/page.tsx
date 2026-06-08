import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Zap, Target, Heart, Shield, Users, Globe, Mail, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Formly — Free AI Tools Platform | Who We Are',
  description:
    'Formly is a free AI productivity tools platform built in India. 49 professional tools including pay stub generator, resume builder, grammar checker, PDF summarizer & more. No subscriptions. Powered by Groq AI.',
  alternates: { canonical: 'https://formly.tools/about' },
  openGraph: {
    title: 'About Formly — Free AI Tools for Everyone',
    description:
      'Learn about Formly — who we are, our mission, and why we built 49 free AI tools for professionals worldwide. No credit card. No subscriptions.',
    url: 'https://formly.tools/about',
    type: 'website',
    siteName: 'Formly Tools',
  },
};

const STATS = [
  { value: '49', label: 'Free AI Tools' },
  { value: '50,000+', label: 'Monthly Users' },
  { value: '100+', label: 'Countries Served' },
  { value: '0', label: 'Mandatory Signups' },
];

const VALUES = [
  {
    icon: Target,
    color: 'text-orange-500',
    bg: 'bg-orange-50 border border-orange-200',
    title: 'Our Mission',
    text: 'Formly was built to democratize professional AI tools. The best writing assistants, resume builders, legal document generators, and finance calculators were locked behind expensive SaaS paywalls charging $30–100 per month. We changed that. All 49 tools are free to use every day — no credit card required.',
  },
  {
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50 border border-amber-200',
    title: 'Why We Built This',
    text: "We were tired of paying for five different subscriptions for tools that should be simple utilities. Using Groq's fast AI infrastructure (llama-3.3-70b-versatile), we can deliver near-instant AI responses at a fraction of what legacy providers charge — which means we can offer genuinely free tools, not just free trials.",
  },
  {
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-50 border border-rose-200',
    title: 'Built in India 🇮🇳',
    text: "Formly is proudly built and operated from India. We understand the pain of USD-only pricing for Indian users. That's why we integrate DodoPayments, which automatically shows local currency at checkout — UPI, cards, net banking, and wallets all supported. For our Pro plan, Indian users pay in INR. Taxes handled automatically.",
  },
  {
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border border-emerald-200',
    title: 'Privacy First',
    text: 'We do not store the content you process through our AI tools. Text, PDFs, resumes — all processed in real time and immediately discarded. We only record which tool was used and when, solely for rate limiting. Your data is not used for AI training, marketing, or resale. Read our full Privacy Policy for details.',
  },
  {
    icon: Globe,
    color: 'text-blue-500',
    bg: 'bg-blue-50 border border-blue-200',
    title: 'Global but Local',
    text: 'Our tools serve professionals in 100+ countries. Pay stub calculations cover USA (all 50 states), UK, Canada, India, Australia, New Zealand, Singapore, and Ireland. Income tax and salary calculators are built specifically for India\'s tax system. ATS resume optimization is tuned to US, UK, and Canadian job markets.',
  },
  {
    icon: Star,
    color: 'text-violet-500',
    bg: 'bg-violet-50 border border-violet-200',
    title: 'No Dark Patterns',
    text: "We don't hide features behind fake paywalls, force account creation for basic use, or trick you into subscriptions. Our Pro plan ($5.99/month) simply removes daily usage limits and unlocks higher output quality. If you never upgrade, that's fine — the free tier is genuinely useful by design.",
  },
];

const TOOLS_HIGHLIGHT = [
  { emoji: '🧾', name: 'Pay Stub Generator', href: '/tools/paystub-generator' },
  { emoji: '📋', name: 'Resume Builder', href: '/tools/resume-builder' },
  { emoji: '🎯', name: 'ATS Resume Scanner', href: '/tools/ats-resume-scanner' },
  { emoji: '✍️', name: 'Grammar Checker', href: '/tools/grammar-checker' },
  { emoji: '📄', name: 'PDF Summarizer', href: '/tools/pdf-summarizer' },
  { emoji: '📜', name: 'Contract Generator', href: '/tools/contract-generator' },
  { emoji: '🗜️', name: 'Image Compressor', href: '/tools/compress-image' },
  { emoji: '🎨', name: 'AI Diagram Maker', href: '/tools/diagrify' },
];

export default function AboutPage() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'WebSite'],
    name: 'Formly Tools',
    alternateName: 'formly.tools',
    url: 'https://formly.tools',
    logo: 'https://formly.tools/favicon.svg',
    description:
      'Formly provides 49 free AI-powered productivity tools for professionals worldwide — pay stub generator, resume builder, contract generator, PDF summarizer, AI paraphraser, grammar checker, digital signature, QR code generator, image compressor, and more. Built in India, used by 50,000+ professionals in 100+ countries.',
    foundingDate: '2024',
    foundingLocation: { '@type': 'Place', name: 'India', addressCountry: 'IN' },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@formly.tools',
      availableLanguage: 'English',
    },
    areaServed: 'Worldwide',
    audience: {
      '@type': 'Audience',
      audienceType: 'Professionals, freelancers, developers, writers, and businesses',
    },
    applicationCategory: 'Productivity',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free daily usage for all 49 tools — no credit card required',
    },
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 10 },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="mb-12">
            <span className="inline-block text-xs font-semibold text-orange-500 uppercase tracking-widest mb-3 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
              About Us
            </span>
            <h1 className="text-4xl font-bold text-stone-900 mb-4 leading-tight">
              Making Professional AI Tools Free for Everyone
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Formly is a free AI productivity platform. We build tools that professionals actually
              need — pay stubs, resumes, contracts, grammar fixes, PDF summaries — and make them
              completely free to use, no signup required.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {STATS.map((s) => (
              <div key={s.label} className="text-center p-4 rounded-2xl bg-white border border-stone-200">
                <div className="text-2xl font-bold text-stone-900 mb-1">{s.value}</div>
                <div className="text-xs text-stone-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="space-y-5 mb-14">
            {VALUES.map((item) => (
              <div key={item.title} className="flex gap-5 p-5 rounded-2xl bg-white border border-stone-200">
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-stone-900 mb-1.5">{item.title}</h2>
                  <p className="text-stone-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Popular tools */}
          <div className="mb-14">
            <h2 className="text-xl font-bold text-stone-900 mb-5">Popular Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TOOLS_HIGHLIGHT.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all text-sm text-stone-700 font-medium"
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="leading-tight">{t.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tools" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                View all 49 free tools →
              </Link>
            </div>
          </div>

          {/* Contact strip */}
          <div className="p-6 rounded-2xl bg-stone-900 text-center mb-10">
            <h2 className="text-lg font-bold text-white mb-2">Get in Touch</h2>
            <p className="text-stone-400 text-sm mb-4">
              Questions, bugs, partnerships, or just want to say hi?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:support@formly.tools"
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@formly.tools
              </a>
              <span className="hidden sm:inline text-stone-600">·</span>
              <Link
                href="/contact"
                className="text-sm font-medium text-stone-400 hover:text-white transition-colors"
              >
                Contact form →
              </Link>
            </div>
          </div>

          {/* Final CTA */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-200 text-center">
            <h2 className="text-xl font-bold text-stone-900 mb-2">Start Using Formly — It&apos;s Free</h2>
            <p className="text-stone-600 text-sm mb-5">
              49 tools. No signup required for basic use. No credit card ever.
            </p>
            <Link href="/tools" className="btn-primary inline-flex">
              Try All 49 Tools Free →
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
