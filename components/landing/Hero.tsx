'use client';

import Link from 'next/link';
import { ArrowRight, Star, Sparkles, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gray-950">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] animate-pulse-slow animate-delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[160px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #8b5cf6 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>Powered by LLaMA 3 — World&apos;s most capable free AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up">
          <span className="text-white">10 AI Tools,</span>
          <br />
          <span className="gradient-text">Completely Free</span>
          <br />
          <span className="text-white text-4xl sm:text-5xl lg:text-6xl">to Try — No Signup</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-100">
          Summarize PDFs, rewrite text, check grammar, write emails, explain code,
          summarize YouTube videos, build resumes & more — powered by advanced AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up animate-delay-200">
          <Link href="/tools" className="btn-primary text-base px-8 py-4 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 group">
            Try All Tools Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/pricing" className="btn-secondary text-base px-8 py-4 group">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            See Pro Plans from $9/mo
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm animate-fade-up animate-delay-300">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex -space-x-2">
              {['🧑‍💻', '👩‍💼', '🧑‍🎨', '👨‍🏫', '👩‍🔬'].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-900 flex items-center justify-center text-sm">
                  {emoji}
                </div>
              ))}
            </div>
            <span><strong className="text-white">50,000+</strong> professionals trust Toolora</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-1.5 text-gray-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span><strong className="text-white">4.9/5</strong> average rating</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-800" />
          <div className="text-gray-400">
            <strong className="text-white">5M+</strong> tools used this month
          </div>
        </div>

        {/* Tool preview tiles */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-up animate-delay-400">
          {[
            { emoji: '📄', name: 'PDF Summarizer', href: '/tools/pdf-summarizer', color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20' },
            { emoji: '✍️', name: 'Paraphraser', href: '/tools/paraphraser', color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20' },
            { emoji: '✅', name: 'Grammar Fix', href: '/tools/grammar-checker', color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' },
            { emoji: '📧', name: 'Email Writer', href: '/tools/email-writer', color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20' },
            { emoji: '💻', name: 'Code Explainer', href: '/tools/code-explainer', color: 'from-pink-500/10 to-pink-600/5 border-pink-500/20' },
            { emoji: '▶️', name: 'YouTube AI', href: '/tools/youtube-summarizer', color: 'from-red-500/10 to-red-600/5 border-red-500/20' },
            { emoji: '📋', name: 'Resume Builder', href: '/tools/resume-builder', color: 'from-teal-500/10 to-teal-600/5 border-teal-500/20' },
            { emoji: '📜', name: 'Contract Gen', href: '/tools/contract-generator', color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20' },
            { emoji: '#️⃣', name: 'Hashtag Gen', href: '/tools/hashtag-generator', color: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20' },
            { emoji: '🪪', name: 'Bio Writer', href: '/tools/bio-writer', color: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/20' },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group flex flex-col items-center gap-2 p-4 rounded-xl border bg-gradient-to-br ${tool.color} hover:scale-105 transition-all duration-200 cursor-pointer`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{tool.emoji}</span>
              <span className="text-xs font-medium text-gray-300 text-center group-hover:text-white transition-colors">{tool.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
