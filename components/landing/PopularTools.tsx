'use client';

import Link from 'next/link';

const POPULAR_TOOLS = [
  {
    icon: '🧾',
    name: 'Pay Stub Generator',
    href: '/tools/paystub-generator',
    desc: 'Professional pay stubs with 2025 tax calculations for 8 countries.',
    category: 'Payroll',
    pinned: true,
  },
  {
    icon: '📋',
    name: 'Resume Builder',
    href: '/tools/resume-builder',
    desc: 'ATS-optimized resumes that get past filters and land interviews.',
    category: 'Career',
    pinned: true,
  },
  {
    icon: '📜',
    name: 'Contract Generator',
    href: '/tools/contract-generator',
    desc: 'Freelance contracts, NDAs, and service agreements in minutes.',
    category: 'Legal',
    pinned: true,
  },
  {
    icon: '📄',
    name: 'PDF Summarizer',
    href: '/tools/pdf-summarizer',
    desc: 'Upload any PDF and get bullet-pointed key insights in seconds.',
    category: 'AI Writing',
    pinned: false,
  },
  {
    icon: '✍️',
    name: 'AI Paraphraser',
    href: '/tools/paraphraser',
    desc: 'Rewrite text in 5 styles — formal, creative, academic and more.',
    category: 'AI Writing',
    pinned: false,
  },
  {
    icon: '✅',
    name: 'Grammar Checker',
    href: '/tools/grammar-checker',
    desc: 'Fix grammar, spelling, and style with explanations for each fix.',
    category: 'AI Writing',
    pinned: false,
  },
  {
    icon: '📧',
    name: 'Email Writer',
    href: '/tools/email-writer',
    desc: 'Generate professional emails in seconds in any tone.',
    category: 'AI Writing',
    pinned: false,
  },
  {
    icon: '📝',
    name: 'Cover Letter',
    href: '/tools/cover-letter',
    desc: 'Tailored cover letters that match any job description.',
    category: 'Career',
    pinned: false,
  },
  {
    icon: '🏦',
    name: 'Loan Calculator',
    href: '/tools/loan-calculator',
    desc: 'EMI, total interest, and full amortization schedule for any loan.',
    category: 'Finance',
    pinned: false,
  },
  {
    icon: '💻',
    name: 'Code Explainer',
    href: '/tools/code-explainer',
    desc: 'Plain-English explanation of any code in 20+ languages.',
    category: 'Developer',
    pinned: false,
  },
  {
    icon: '✍️',
    name: 'Digital Signature',
    href: '/tools/digital-signature',
    desc: 'Draw, type, or upload signatures. Place on documents. Free — beats DocuSign.',
    category: 'Legal',
    pinned: true,
  },
  {
    icon: '📷',
    name: 'QR Code Generator',
    href: '/tools/qr-code',
    desc: 'Artistic QR codes with photo overlays, custom colors, logos & gradients.',
    category: 'Utilities',
    pinned: true,
  },
  {
    icon: '🎨',
    name: 'AetherBoard',
    href: '/tools/aetherboard',
    desc: 'Infinite canvas with AI text-to-diagram, sketchy mode, shapes, arrows & stickies.',
    category: 'Design',
    pinned: true,
  },
];

export function PopularTools() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Most Popular Tools
            </h2>
            <p className="text-gray-400 text-base">
              Used by 50,000+ professionals every day
            </p>
          </div>
          <Link
            href="/tools"
            className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            View all 29 tools →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {POPULAR_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative flex flex-col p-4 rounded-xl border transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${
                tool.pinned
                  ? 'ring-1 ring-amber-500/30 bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10'
                  : 'card border-gray-800/60 hover:border-gray-700'
              }`}
            >
              {/* Popular badge */}
              {tool.pinned && (
                <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-semibold tracking-wide">
                  🔥 Most Popular
                </span>
              )}

              {/* Icon */}
              <div className="text-2xl mb-3 mt-1 group-hover:scale-110 transition-transform duration-200">
                {tool.icon}
              </div>

              {/* Name */}
              <h3 className="text-sm font-bold text-white leading-tight mb-1">
                {tool.name}
              </h3>

              {/* Category badge */}
              <span className="inline-block mb-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-500 w-fit">
                {tool.category}
              </span>

              {/* Description */}
              <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-3">
                {tool.desc}
              </p>

              {/* CTA */}
              <div className="text-xs text-violet-400 font-medium group-hover:text-violet-300 transition-colors">
                Try free →
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom link — visible on mobile where header link is less prominent */}
        <div className="mt-8 text-right sm:hidden">
          <Link
            href="/tools"
            className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            View all 29 tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
