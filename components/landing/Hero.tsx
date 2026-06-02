'use client';

import Link from 'next/link';
import { ArrowRight, Star, Sparkles, TrendingUp } from 'lucide-react';

const TOOL_TILES = [
  { emoji: '📄', name: 'PDF Summarizer',    href: '/tools/pdf-summarizer' },
  { emoji: '✍️', name: 'Paraphraser',        href: '/tools/paraphraser' },
  { emoji: '✅', name: 'Grammar Fix',        href: '/tools/grammar-checker' },
  { emoji: '📧', name: 'Email Writer',       href: '/tools/email-writer' },
  { emoji: '💻', name: 'Code Explainer',     href: '/tools/code-explainer' },
  { emoji: '🧾', name: 'Pay Stub',           href: '/tools/paystub-generator' },
  { emoji: '📋', name: 'Resume Builder',     href: '/tools/resume-builder' },
  { emoji: '📜', name: 'Contract Gen',       href: '/tools/contract-generator' },
  { emoji: '🎨', name: 'Diagrify',           href: '/tools/diagrify' },
  { emoji: '💪', name: 'Iron Core',          href: '/tools/iron-core-workout' },
];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20">
      {/* Warm cream background */}
      <div className="absolute inset-0 bg-[#F9F7F4]" />
      {/* Subtle orange warmth at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      {/* Very subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, #78716c 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-500 text-xs sm:text-sm font-medium mb-8 sm:mb-10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Powered by Groq AI — Blazing fast inference
        </div>

        {/* Headline — editorial serif */}
        <h1 className="font-display text-[2.8rem] sm:text-6xl lg:text-[5.5rem] font-normal tracking-[-0.02em] mb-5 sm:mb-6 leading-[1.08] text-stone-900">
          38 Free AI Tools,
          <br />
          <em className="text-orange-500">Zero Signup</em>
          <br />
          <span className="font-sans font-semibold text-stone-600 text-[2.2rem] sm:text-5xl lg:text-[4rem] tracking-[-0.025em]">
            Required.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-stone-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Summarize PDFs, build resumes, generate pay stubs, write contracts,
          format JSON, calculate EMIs, split expenses &amp; 30 more tools —
          powered by Groq AI. No signup needed.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 sm:mb-12">
          <Link
            href="/tools"
            className="btn-primary text-sm sm:text-base px-7 py-3.5 sm:px-8 sm:py-4 shadow-xl shadow-orange-500/20 group w-full sm:w-auto"
          >
            Try All 38 Tools Free
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/pricing"
            className="btn-secondary text-sm sm:text-base px-7 py-3.5 sm:px-8 sm:py-4 group w-full sm:w-auto"
          >
            <TrendingUp className="w-4 h-4 text-orange-400" />
            Pro Plans from $9.99/mo
          </Link>
        </div>

        {/* Social proof row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm mb-14 sm:mb-20">
          <div className="flex items-center gap-2 text-stone-500">
            <div className="flex -space-x-1.5">
              {['🧑‍💻', '👩‍💼', '🧑‍🎨', '👨‍🏫', '👩‍🔬'].map((emoji, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-stone-100 border-2 border-[#F9F7F4] flex items-center justify-center text-xs">
                  {emoji}
                </div>
              ))}
            </div>
            <span><strong className="text-stone-800">50,000+</strong> professionals</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <div className="flex items-center gap-1 text-stone-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
            <span className="ml-1"><strong className="text-stone-800">4.9/5</strong> rating</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <span className="text-stone-500">
            <strong className="text-stone-800">5M+</strong> uses this month
          </span>
        </div>

        {/* Tool preview tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {TOOL_TILES.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl
                         bg-white border border-stone-200
                         hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/8
                         transition-all duration-200 cursor-pointer"
            >
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">
                {tool.emoji}
              </span>
              <span className="text-xs text-stone-500 group-hover:text-stone-800 transition-colors text-center leading-tight font-medium">
                {tool.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
