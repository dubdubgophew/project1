import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  DollarSign,
  Star,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '29 Free Alternatives: Grammarly, Excalidraw, DocuSign, Visio & More | Formly',
  description:
    'Free online alternatives to Grammarly, Excalidraw, draw.io, Visio, DocuSign, AdobeSign, QuillBot, ChatGPT writing tools, Resume.io, LegalZoom, and ADP. 40 AI tools — no signup, no credit card.',
  alternates: { canonical: 'https://formly.tools/alternatives' },
  openGraph: {
    title: 'Free Alternatives to Grammarly, Excalidraw, DocuSign, Visio & More',
    description:
      '40 free AI tools replacing expensive subscriptions. Grammar checker, diagrams, digital signatures, resume builder — all free, no signup required.',
    url: 'https://formly.tools/alternatives',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Alternatives to Grammarly, Excalidraw, DocuSign & More',
    description:
      '40 free AI-powered tools that replace expensive paid subscriptions. No signup needed.',
  },
};

// ─── Comparison data ──────────────────────────────────────────────────────────

interface Comparison {
  /** The paid / well-known tool */
  paidTool: string;
  /** Short tag rendered as a badge */
  paidCategory: string;
  /** Estimated monthly cost of the paid tool */
  paidPrice: string;
  /** Our free tool */
  ourTool: string;
  /** Route to our tool */
  ourHref: string;
  /** Accent color class (Tailwind) for the card */
  accent: string;
  /** Four benefit bullet points */
  bullets: string[];
  /** Slug for the anchor link on this page */
  id: string;
}

const COMPARISONS: Comparison[] = [
  {
    paidTool: 'Grammarly',
    paidCategory: 'Grammar & Writing',
    paidPrice: '$12–30/mo',
    ourTool: 'Grammar Checker',
    ourHref: '/tools/grammar-checker',
    accent: 'violet',
    id: 'grammarly',
    bullets: [
      'AI-powered grammar, spelling, and punctuation checks — instant results',
      'Style and clarity suggestions beyond simple spell-check',
      'Works on any text: emails, essays, cover letters, blog posts',
      '100% free — no Grammarly Premium subscription needed',
    ],
  },
  {
    paidTool: 'Excalidraw Pro / Miro',
    paidCategory: 'Whiteboard & Diagrams',
    paidPrice: '$8–16/mo',
    ourTool: 'Diagrify',
    ourHref: '/tools/diagrify',
    accent: 'blue',
    id: 'excalidraw',
    bullets: [
      'Generate flowcharts, mind maps, and diagrams from plain-text descriptions',
      'No drawing skills required — describe it and the AI builds it',
      'Export-ready diagrams without a paid Excalidraw or Miro plan',
      'Free alternative for solo users, students, and small teams',
    ],
  },
  {
    paidTool: 'draw.io / Microsoft Visio',
    paidCategory: 'Diagram Software',
    paidPrice: '$5–15/mo',
    ourTool: 'Diagrify',
    ourHref: '/tools/diagrify',
    accent: 'blue',
    id: 'visio',
    bullets: [
      'AI turns written descriptions into structured Mermaid-style diagrams',
      'No Visio license or local install — runs entirely in your browser',
      'Ideal free draw.io alternative for quick architecture and process diagrams',
      'Share diagrams via URL or copy the source to any compatible viewer',
    ],
  },
  {
    paidTool: 'DocuSign',
    paidCategory: 'eSignatures',
    paidPrice: '$10–25/mo',
    ourTool: 'Digital Signature',
    ourHref: '/tools/digital-signature',
    accent: 'emerald',
    id: 'docusign',
    bullets: [
      'Draw, type, or upload your signature and embed it on any document',
      'No DocuSign account or per-envelope fees required',
      'Download signed PDFs instantly — browser-based, nothing installed',
      'Perfect free alternative for freelancers and small business owners',
    ],
  },
  {
    paidTool: 'Adobe Acrobat Sign',
    paidCategory: 'eSignatures',
    paidPrice: '$12–23/mo',
    ourTool: 'Digital Signature',
    ourHref: '/tools/digital-signature',
    accent: 'emerald',
    id: 'adobesign',
    bullets: [
      'Sign documents without an Adobe subscription or Creative Cloud plan',
      'Multiple signature styles: hand-drawn, typed, or image upload',
      'All processing happens in your browser — documents never touch our servers',
      'Free for casual and professional document signing',
    ],
  },
  {
    paidTool: 'ChatGPT (email writing)',
    paidCategory: 'AI Writing',
    paidPrice: '$20/mo',
    ourTool: 'Email Writer',
    ourHref: '/tools/email-writer',
    accent: 'pink',
    id: 'chatgpt-email',
    bullets: [
      'Purpose-built for professional emails — not a generic chat interface',
      'Choose tone (formal, friendly, persuasive) and let AI draft instantly',
      'Covers cold outreach, follow-ups, apologies, proposals, and more',
      'Free ChatGPT alternative specifically optimized for email copy',
    ],
  },
  {
    paidTool: 'QuillBot',
    paidCategory: 'Paraphrasing',
    paidPrice: '$9.95–19.95/mo',
    ourTool: 'AI Paraphraser',
    ourHref: '/tools/paraphraser',
    accent: 'amber',
    id: 'quillbot',
    bullets: [
      'Rewrites sentences and paragraphs while preserving original meaning',
      'Multiple rewrite modes: formal, casual, concise, creative',
      'Supports long-form content — essays, reports, blog posts',
      'Free QuillBot alternative with no word-count caps on the free tier',
    ],
  },
  {
    paidTool: 'Adobe Acrobat (PDF Summary)',
    paidCategory: 'PDF Tools',
    paidPrice: '$14–23/mo',
    ourTool: 'PDF Summarizer',
    ourHref: '/tools/pdf-summarizer',
    accent: 'rose',
    id: 'adobe-pdf',
    bullets: [
      'Uploads and summarizes PDFs in seconds using AI — no Adobe subscription',
      'Extracts key points, conclusions, and action items automatically',
      'Handles research papers, contracts, reports, and eBooks',
      'Free PDF summarizer that rivals Adobe Acrobat AI Assistant',
    ],
  },
  {
    paidTool: 'Resume.io / Zety',
    paidCategory: 'Resume Builders',
    paidPrice: '$2.95–24.99/mo',
    ourTool: 'Resume Builder',
    ourHref: '/tools/resume-builder',
    accent: 'cyan',
    id: 'resume-io',
    bullets: [
      'AI writes tailored resume bullet points from your job history',
      'ATS-optimized formatting — no hidden paywall to download your own resume',
      'Customize for any job title or industry in minutes',
      'Free resume builder alternative with no subscription lock-in',
    ],
  },
  {
    paidTool: 'LegalZoom (Contracts)',
    paidCategory: 'Legal Documents',
    paidPrice: '$49–249 per doc',
    ourTool: 'Contract Generator',
    ourHref: '/tools/contract-generator',
    accent: 'teal',
    id: 'legalzoom',
    bullets: [
      'AI generates freelance, NDA, service, and employment contracts instantly',
      'Fill in your specifics and download a complete, professional contract',
      'Saves hundreds of dollars vs. LegalZoom per-document fees',
      'Free contract generator — always review with a licensed attorney for high-stakes deals',
    ],
  },
  {
    paidTool: 'QR Code Generator Apps',
    paidCategory: 'QR / Utilities',
    paidPrice: '$5–15/mo',
    ourTool: 'QR Code Generator',
    ourHref: '/tools/qr-code',
    accent: 'purple',
    id: 'qr-apps',
    bullets: [
      'Generate QR codes for URLs, text, email, Wi-Fi, and more — instantly',
      'Download high-resolution PNG — no watermarks, no paid plan required',
      'Customize colors and size for print or digital use',
      'Free QR code alternative to subscription-gated apps like QR Code Monkey Pro',
    ],
  },
  {
    paidTool: 'ADP (Pay Stubs)',
    paidCategory: 'Payroll',
    paidPrice: '$59+/mo',
    ourTool: 'Pay Stub Generator',
    ourHref: '/tools/paystub-generator',
    accent: 'orange',
    id: 'adp',
    bullets: [
      'Generates professional, detailed pay stubs for employees and contractors',
      'Handles federal/state tax deductions, YTD totals, and custom line items',
      'Download printable PDF pay stubs in under a minute',
      'Free ADP alternative for small businesses, freelancers, and gig workers',
    ],
  },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is a free alternative to Grammarly?',
    a: "Formly's Grammar Checker is a free Grammarly alternative that catches grammar, spelling, and punctuation errors using AI. It also offers style and clarity suggestions. No account required — just paste your text and get instant corrections.",
  },
  {
    q: 'What is a free alternative to Excalidraw Pro or Miro?',
    a: "Formly's Diagrify tool lets you create flowcharts, mind maps, and diagrams for free by simply describing what you want. It's a free Excalidraw alternative that requires no drawing skills and works entirely in your browser.",
  },
  {
    q: 'Is there a free alternative to draw.io or Microsoft Visio?',
    a: "Yes. Diagrify by Formly is a free draw.io and Visio alternative. Describe your process or architecture in plain language and the AI generates a structured diagram you can export or copy instantly — no Visio license needed.",
  },
  {
    q: 'What is a free alternative to DocuSign or AdobeSign?',
    a: "Formly's Digital Signature tool is a free DocuSign and AdobeSign alternative. Draw or type your signature, apply it to your document, and download a signed PDF — all in your browser with no subscription fees.",
  },
  {
    q: 'Is there a free alternative to QuillBot?',
    a: "Formly's AI Paraphraser is a free QuillBot alternative. It rewrites your text in multiple styles (formal, casual, concise, creative) with no per-word limits on the free tier. Paste your paragraph and get a fresh rewrite in seconds.",
  },
  {
    q: 'What is a free alternative to Resume.io or Zety?',
    a: "Formly's Resume Builder is a free alternative to Resume.io and Zety. Our AI writes tailored, ATS-friendly bullet points from your experience and lets you download your resume without a subscription paywall.",
  },
  {
    q: 'Is there a free alternative to Adobe Acrobat for summarizing PDFs?',
    a: "Yes — Formly's PDF Summarizer is a free Adobe Acrobat AI Assistant alternative. Upload your PDF and the AI extracts key points, conclusions, and action items in seconds. No Adobe subscription required.",
  },
  {
    q: 'What is a free alternative to LegalZoom for contracts?',
    a: "Formly's Contract Generator is a free LegalZoom alternative for standard contracts. It generates freelance agreements, NDAs, service contracts, and more. Always have a licensed attorney review contracts for high-value situations.",
  },
  {
    q: 'Is there a free alternative to ADP for pay stubs?',
    a: "Formly's Pay Stub Generator is a free ADP alternative for small businesses and freelancers. Enter employee details, wages, and deductions, and download a professional PDF pay stub instantly — no payroll subscription needed.",
  },
  {
    q: 'Do I need to sign up to use Formly tools?',
    a: 'No. All Formly tools are free to try with no signup required. You get 5 AI uses per day without an account and 10 uses per day with a free account. No credit card is ever required to use the free tier.',
  },
];

// ─── Accent color map ─────────────────────────────────────────────────────────

const ACCENT_CLASSES: Record<
  string,
  { border: string; badge: string; icon: string; glow: string; bullet: string }
> = {
  violet: {
    border: 'border-violet-500/30 hover:border-violet-500/60',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    icon: 'bg-violet-500/15 text-violet-400',
    glow: 'hover:shadow-violet-500/10',
    bullet: 'text-violet-400',
  },
  blue: {
    border: 'border-blue-500/30 hover:border-blue-500/60',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    icon: 'bg-blue-500/15 text-blue-400',
    glow: 'hover:shadow-blue-500/10',
    bullet: 'text-blue-400',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: 'bg-emerald-500/15 text-emerald-400',
    glow: 'hover:shadow-emerald-500/10',
    bullet: 'text-emerald-400',
  },
  pink: {
    border: 'border-pink-500/30 hover:border-pink-500/60',
    badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    icon: 'bg-pink-500/15 text-pink-400',
    glow: 'hover:shadow-pink-500/10',
    bullet: 'text-pink-400',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500/60',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: 'bg-amber-500/15 text-amber-400',
    glow: 'hover:shadow-amber-500/10',
    bullet: 'text-amber-400',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-500/60',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: 'bg-rose-500/15 text-rose-400',
    glow: 'hover:shadow-rose-500/10',
    bullet: 'text-rose-400',
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: 'bg-cyan-500/15 text-cyan-400',
    glow: 'hover:shadow-cyan-500/10',
    bullet: 'text-cyan-400',
  },
  teal: {
    border: 'border-teal-500/30 hover:border-teal-500/60',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    icon: 'bg-teal-500/15 text-teal-400',
    glow: 'hover:shadow-teal-500/10',
    bullet: 'text-teal-400',
  },
  purple: {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    icon: 'bg-purple-500/15 text-purple-400',
    glow: 'hover:shadow-purple-500/10',
    bullet: 'text-purple-400',
  },
  orange: {
    border: 'border-orange-500/30 hover:border-orange-500/60',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    icon: 'bg-orange-500/15 text-orange-400',
    glow: 'hover:shadow-orange-500/10',
    bullet: 'text-orange-400',
  },
};

// ─── Schema.org JSON-LD ───────────────────────────────────────────────────────

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free Alternatives to Grammarly, Excalidraw, DocuSign, Visio & More',
  description:
    'Find free online alternatives to expensive tools: Grammarly, Excalidraw, draw.io, DocuSign, QuillBot, Resume.io, ADP, and more. 40 free AI tools, no signup needed.',
  url: 'https://formly.tools/alternatives',
  isPartOf: { '@type': 'WebSite', name: 'Formly', url: 'https://formly.tools' },
  about: {
    '@type': 'Thing',
    name: 'Free alternatives to paid software tools',
  },
  provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlternativesPage() {
  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-950">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 overflow-hidden">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-start justify-center"
          >
            <div className="w-[900px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] -translate-y-1/4" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              40 Free AI Tools — No Signup Required
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              The Best{' '}
              <span className="gradient-text">Free Alternatives</span>
              <br className="hidden sm:block" /> to Paid Tools in 2025
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Stop paying for Grammarly, Excalidraw, DocuSign, Visio, QuillBot, and more.
              Formly gives you 40 free AI-powered alternatives — no subscriptions, no credit card,
              no signup needed.
            </p>

            {/* Trust stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-gray-400 mb-10">
              {[
                { icon: DollarSign, label: 'Always Free Tier' },
                { icon: Shield, label: 'No Data Stored' },
                { icon: Zap, label: 'Instant AI Results' },
                { icon: Star, label: '50,000+ Users' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-violet-400" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Quick-jump navigation */}
            <div className="flex flex-wrap justify-center gap-2">
              {COMPARISONS.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-700 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
                >
                  vs {c.paidTool}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison cards grid ──────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {COMPARISONS.map((item) => {
              const ac = ACCENT_CLASSES[item.accent] ?? ACCENT_CLASSES.violet;
              return (
                <article
                  key={item.id}
                  id={item.id}
                  className={`bg-gray-900 border rounded-2xl p-6 flex flex-col shadow-xl shadow-black/20 transition-all duration-300 ${ac.border} ${ac.glow} hover:shadow-xl scroll-mt-24`}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      {/* Category badge */}
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border mb-2 ${ac.badge}`}
                      >
                        {item.paidCategory}
                      </span>
                      {/* Paid tool name */}
                      <h2 className="text-base font-semibold text-gray-300 leading-snug">
                        Free{' '}
                        <span className="text-white font-bold">{item.paidTool}</span>{' '}
                        Alternative
                      </h2>
                    </div>
                    {/* Price pill */}
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-gray-500 line-through">{item.paidPrice}</div>
                      <div className="text-sm font-bold text-emerald-400">Free</div>
                    </div>
                  </div>

                  {/* Our tool name */}
                  <div className="mb-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      Our free tool
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ac.icon}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-white font-semibold">{item.ourTool}</span>
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {item.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${ac.bullet}`} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={item.ourHref}
                    className="btn-primary w-full justify-center text-sm py-2.5"
                  >
                    Try {item.ourTool} Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Why Formly section ────────────────────────────────── */}
        <section className="border-t border-gray-800 bg-gray-900/40 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Formly as Your{' '}
              <span className="gradient-text">Free Alternative</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              We built Formly because the best productivity tools were locked behind expensive
              monthly subscriptions. Here&apos;s what makes us different.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {[
                {
                  icon: DollarSign,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                  title: 'Genuinely Free',
                  body: 'No credit card required. No free trial that expires. Our free tier gives you real daily access to all 40 AI tools — not a neutered demo.',
                },
                {
                  icon: Shield,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                  title: 'Privacy by Design',
                  body: "We do not store your content. Everything you process is discarded after your request. Your documents, text, and signatures never leave your session.",
                },
                {
                  icon: Zap,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10',
                  title: 'AI-Powered Quality',
                  body: "Powered by Groq's ultra-fast AI infrastructure, our tools deliver professional-grade output in seconds — on par with the paid tools they replace.",
                },
                {
                  icon: Star,
                  color: 'text-violet-400',
                  bg: 'bg-violet-500/10',
                  title: '40 Tools in One Place',
                  body: 'Instead of juggling subscriptions to Grammarly, DocuSign, QuillBot, and Resume.io, get all the functionality under one roof — for free.',
                },
                {
                  icon: ArrowRight,
                  color: 'text-pink-400',
                  bg: 'bg-pink-500/10',
                  title: 'No Learning Curve',
                  body: "Each tool is purpose-built and focused. Paste your text (or upload your file) and get results. No onboarding tutorials, no complex UI.",
                },
                {
                  icon: CheckCircle2,
                  color: 'text-teal-400',
                  bg: 'bg-teal-500/10',
                  title: 'No Signup to Start',
                  body: "Use any tool right now — zero friction. Create a free account only if you want a higher daily usage limit. We earn on upgrades, not on your attention.",
                },
              ].map((item) => (
                <div key={item.title} className="card flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ section ───────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none">
                  <span className="text-white font-medium text-sm pr-4">{q}</span>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800/60 pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/15 to-purple-600/10 border border-violet-500/25 p-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Switch to Free?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join 50,000+ professionals who replaced expensive subscriptions with Formly&apos;s
              free AI tools. No credit card. No signup required to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tools" className="btn-primary px-8 py-3">
                Explore All 40 Free Tools
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="btn-secondary px-8 py-3">
                See Pro Plans
              </Link>
            </div>
            <p className="text-xs text-gray-600 mt-5">
              5 free uses/day without an account &bull; 10 free uses/day with a free account
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
