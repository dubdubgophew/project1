'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Zap, ChevronDown, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const TOOLS_NAV = [
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer' },
  { name: 'Paraphraser', href: '/tools/paraphraser' },
  { name: 'Grammar Checker', href: '/tools/grammar-checker' },
  { name: 'Email Writer', href: '/tools/email-writer' },
  { name: 'Code Explainer', href: '/tools/code-explainer' },
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">form</span>
              <span className="gradient-text">ly</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                onBlur={() => setTimeout(() => setToolsOpen(false), 150)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all"
              >
                Tools <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                  {TOOLS_NAV.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-800 mt-1 pt-1">
                    <Link
                      href="/tools"
                      className="block px-4 py-2.5 text-sm text-violet-400 hover:text-violet-300 hover:bg-gray-800 transition-colors font-medium"
                    >
                      View all tools →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/pricing" className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all">
              Pricing
            </Link>
            <Link href="/blog" className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all">
              Blog
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={e => { e.preventDefault(); if (q.trim()) { router.push(`/tools?q=${encodeURIComponent(q.trim())}`); setQ(''); } }}>
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search tools…"
                className="bg-gray-800/50 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-300 w-36 focus:w-52 focus:border-violet-500 transition-all duration-200 focus:outline-none placeholder:text-gray-600"
              />
            </div>
          </form>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-primary py-2 px-4 text-xs">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary py-2 px-4 text-xs">
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
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
          <div className="px-4 py-4 space-y-1">
            {TOOLS_NAV.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {tool.name}
              </Link>
            ))}
            <Link href="/tools" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-violet-400 font-medium hover:bg-gray-800 transition-colors">
              All Tools
            </Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
              Blog
            </Link>
            <div className="pt-3 flex flex-col gap-2 border-t border-gray-800 mt-2">
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
