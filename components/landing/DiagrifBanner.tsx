'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X, Layers, Pen, Zap } from 'lucide-react';

export function DiagrifBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-violet-50 via-purple-50 to-violet-50 border-b border-violet-200 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        {/* Icon */}
        <div className="shrink-0 hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center shadow-md shadow-violet-500/25">
          <span className="text-white font-bold text-base">D</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-violet-600 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              NEW
            </span>
            <span className="font-bold text-stone-800 text-sm">Diagrify is live →</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500 min-w-0">
            <span className="hidden md:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
              AI text-to-diagram
            </span>
            <span className="text-stone-300 hidden md:block">·</span>
            <span className="hidden md:flex items-center gap-1">
              <Layers className="w-3 h-3 text-violet-500 shrink-0" />
              Infinite canvas
            </span>
            <span className="text-stone-300 hidden md:block">·</span>
            <span className="hidden lg:flex items-center gap-1">
              <Pen className="w-3 h-3 text-violet-500 shrink-0" />
              Sketchy &amp; blueprint modes
            </span>
            <span className="text-stone-300 hidden lg:block">·</span>
            <span className="hidden lg:flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 shrink-0" />
              Free, no signup
            </span>
            <span className="sm:hidden text-stone-500">Free AI diagram &amp; flowchart tool</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/tools/diagrify"
          className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-violet-500/25 group"
        >
          Try Free
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1.5 text-stone-400 hover:text-stone-600 transition-colors rounded-lg hover:bg-stone-100"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
