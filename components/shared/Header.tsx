'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Zap, ChevronDown, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const TOOLS_NAV = [
  { name: 'Pay Stub Generator', href: '/tools/paystub-generator' },
  { name: 'Resume Builder', href: '/tools/resume-builder' },
  { name: 'Contract Generator', href: '/tools/contract-generator' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer' },
  { name: 'Digital Signature', href: '/tools/digital-signature' },
  { name: 'Paraphraser', href: '/tools/paraphraser' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 px-3 sm:px-4 lg:px-6">
      {/* Floating pill container */}
      <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-lg shadow-stone-900/8 border border-stone-200'
          : 'bg-white/97 backdrop-blur-xl border border-stone-200/80'
      }`}>
        <div className="px-4 sm:px-5">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-stone-900">form</span>
                <span className="gradient-text">ly</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              <div className="relative">
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  onBlur={() => setTimeout(() => setToolsOpen(false), 150)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                >
                  Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
                </button>
                {toolsOpen && (
                  <div onMouseDown={(e) => e.preventDefault()} className="absolute top-full left-0 mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
                    {TOOLS_NAV.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="block px-4 py-2.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      >
                        {tool.name}
                      </Link>
                    ))}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <Link
                        href="/tools"
                        className="block px-4 py-2.5 text-sm text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                      >
                        View all tools →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all">
                Pricing
              </Link>
              <Link href="/blog" className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all">
                Blog
              </Link>
              <Link href="/news" className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Trending
              </Link>
              <Link href="/ai-news" className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                AI News
              </Link>
              <Link href="/politics" className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Politics
              </Link>
              <Link href="/stocks" className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Stocks
              </Link>
            </nav>

            {/* Search */}
            <form onSubmit={e => { e.preventDefault(); if (q.trim()) { router.push(`/tools?q=${encodeURIComponent(q.trim())}`); setQ(''); } }}>
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search tools…"
                  className="bg-stone-100 border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-stone-700 w-32 focus:w-48 focus:border-orange-400 focus:bg-white focus:ring-1 focus:ring-orange-400/30 transition-all duration-200 focus:outline-none placeholder:text-stone-400"
                />
              </div>
            </form>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Link href="/dashboard" className="btn-primary py-2 px-4 text-xs">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors px-2">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn-primary py-2 px-4 text-xs">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — also floating */}
      {mobileOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-1.5 rounded-2xl bg-white border border-stone-200 shadow-xl overflow-hidden">
          <div className="px-4 py-4 space-y-0.5">
            {TOOLS_NAV.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              >
                {tool.name}
              </Link>
            ))}
            <Link href="/tools" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-orange-500 font-medium hover:bg-orange-50 transition-colors">
              All Tools →
            </Link>
            <div className="h-px bg-stone-100 my-1" />
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors">
              Blog
            </Link>
            <Link href="/news" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Trending
            </Link>
            <Link href="/ai-news" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              AI News
            </Link>
            <Link href="/politics" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Politics
            </Link>
            <Link href="/stocks" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stocks
            </Link>
            <div className="h-px bg-stone-100 my-1" />
            <div className="pt-1 pb-1 flex flex-col gap-2">
              {user ? (
                <Link href="/dashboard" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary w-full justify-center" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
