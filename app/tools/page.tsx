'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd } from '@/components/shared/AdSense';

type Tool = {
  icon: string;
  name: string;
  description: string;
  href: string;
  badge?: string | null;
  color: string;
  tags: string[];
  category: string;
};

const TOOLS: Tool[] = [
  // Pinned top 3
  {
    icon: '🧾',
    name: 'Pay Stub Generator',
    description: 'Generate professional pay stubs with accurate 2024/2025 tax calculations. USA, UK, Canada, Australia, India & more.',
    href: '/tools/paystub-generator',
    badge: 'New',
    color: 'from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40',
    tags: ['payroll', 'tax', 'salary'],
    category: 'Payroll & Legal',
  },
  {
    icon: '📋',
    name: 'Resume Builder',
    description: 'Build an ATS-optimized resume with AI. Stand out from hundreds of other applicants.',
    href: '/tools/resume-builder',
    badge: null,
    color: 'from-teal-500/10 to-teal-600/5 border-teal-500/20 hover:border-teal-500/40',
    tags: ['resume', 'cv', 'job'],
    category: 'AI Writing',
  },
  {
    icon: '📜',
    name: 'Contract Generator',
    description: 'Generate freelance contracts, NDAs, service agreements in minutes. Professional & legally sound.',
    href: '/tools/contract-generator',
    badge: null,
    color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40',
    tags: ['legal', 'contract', 'nda'],
    category: 'Payroll & Legal',
  },
  // Payroll & Legal (remaining)
  {
    icon: '⚖️',
    name: 'Terms Simplifier',
    description: 'Paste any Terms of Service or Privacy Policy and get a plain-English summary with red flags.',
    href: '/tools/terms-simplifier',
    badge: 'New',
    color: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40',
    tags: ['legal', 'privacy', 'terms'],
    category: 'Payroll & Legal',
  },
  // AI Writing
  {
    icon: '📄',
    name: 'PDF Summarizer',
    description: 'Upload any PDF and get a concise, bullet-pointed summary with key insights in seconds.',
    href: '/tools/pdf-summarizer',
    badge: 'Popular',
    color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
    tags: ['pdf', 'summarize', 'research'],
    category: 'AI Writing',
  },
  {
    icon: '✍️',
    name: 'AI Paraphraser',
    description: 'Rewrite any text in 5 different styles — Standard, Formal, Creative, Academic, or Simple.',
    href: '/tools/paraphraser',
    badge: 'Top Rated',
    color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['rewrite', 'paraphrase', 'writing'],
    category: 'AI Writing',
  },
  {
    icon: '✅',
    name: 'Grammar Checker',
    description: 'Fix grammar, spelling, and style issues instantly. Get explanations for every correction.',
    href: '/tools/grammar-checker',
    badge: null,
    color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
    tags: ['grammar', 'spell check', 'writing'],
    category: 'AI Writing',
  },
  {
    icon: '📧',
    name: 'Email Writer',
    description: 'Generate professional emails in seconds. Choose your tone — formal, casual, or persuasive.',
    href: '/tools/email-writer',
    badge: 'Popular',
    color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40',
    tags: ['email', 'professional', 'business'],
    category: 'AI Writing',
  },
  {
    icon: '#️⃣',
    name: 'Hashtag Generator',
    description: 'Generate viral hashtags for Instagram, Twitter, LinkedIn, and TikTok based on your topic.',
    href: '/tools/hashtag-generator',
    badge: null,
    color: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40',
    tags: ['hashtags', 'social media', 'instagram'],
    category: 'AI Writing',
  },
  {
    icon: '🪪',
    name: 'Bio Writer',
    description: 'Create compelling professional bios for LinkedIn, Twitter, Instagram, and websites.',
    href: '/tools/bio-writer',
    badge: null,
    color: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/20 hover:border-fuchsia-500/40',
    tags: ['bio', 'profile', 'linkedin'],
    category: 'AI Writing',
  },
  {
    icon: '📝',
    name: 'Cover Letter',
    description: 'Generate tailored cover letters that highlight your skills and match the job description.',
    href: '/tools/cover-letter',
    badge: 'New',
    color: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/40',
    tags: ['cover letter', 'job', 'career'],
    category: 'AI Writing',
  },
  // AI Documents
  {
    icon: '📑',
    name: 'PDF to Markdown',
    description: 'Convert PDF documents to clean Markdown format. Preserve structure, headings, and lists.',
    href: '/tools/pdf-to-markdown',
    badge: 'New',
    color: 'from-rose-500/10 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40',
    tags: ['pdf', 'markdown', 'convert'],
    category: 'AI Documents',
  },
  // Developer
  {
    icon: '💻',
    name: 'Code Explainer',
    description: 'Paste any code and get a clear plain-English explanation. Supports 20+ programming languages.',
    href: '/tools/code-explainer',
    badge: null,
    color: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40',
    tags: ['code', 'programming', 'developer'],
    category: 'Developer',
  },
  {
    icon: '🔎',
    name: 'Code Reviewer',
    description: 'Get instant AI code review — issues, quality score, performance tips, and improved code.',
    href: '/tools/code-reviewer',
    badge: 'New',
    color: 'from-sky-500/10 to-sky-600/5 border-sky-500/20 hover:border-sky-500/40',
    tags: ['code review', 'developer', 'quality'],
    category: 'Developer',
  },
  {
    icon: '{}',
    name: 'JSON Formatter',
    description: 'Format, minify, and validate JSON instantly. See detailed stats and error messages.',
    href: '/tools/json-formatter',
    badge: null,
    color: 'from-lime-500/10 to-lime-600/5 border-lime-500/20 hover:border-lime-500/40',
    tags: ['json', 'developer', 'format'],
    category: 'Developer',
  },
  {
    icon: '🔐',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings instantly. Supports text and file encoding.',
    href: '/tools/base64',
    badge: null,
    color: 'from-slate-500/10 to-slate-600/5 border-slate-500/20 hover:border-slate-500/40',
    tags: ['base64', 'encode', 'developer'],
    category: 'Developer',
  },
  {
    icon: '🎨',
    name: 'Color Converter',
    description: 'Convert colors between HEX, RGB, HSL, HSV, CMYK. Generate tints, shades, and harmonies.',
    href: '/tools/color-converter',
    badge: 'New',
    color: 'from-pink-500/10 to-rose-600/5 border-pink-500/20 hover:border-pink-500/40',
    tags: ['color', 'hex', 'css', 'design'],
    category: 'Developer',
  },
  {
    icon: '🔍',
    name: 'Regex Tester',
    description: 'Test regular expressions live with match highlighting, group inspection, and replace mode.',
    href: '/tools/regex-tester',
    badge: 'New',
    color: 'from-violet-500/10 to-indigo-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['regex', 'developer', 'pattern'],
    category: 'Developer',
  },
  {
    icon: '↔️',
    name: 'Diff Checker',
    description: 'Compare two texts side by side. See added, removed, and unchanged lines with color coding.',
    href: '/tools/diff-checker',
    badge: 'New',
    color: 'from-emerald-500/10 to-teal-600/5 border-emerald-500/20 hover:border-emerald-500/40',
    tags: ['diff', 'compare', 'developer'],
    category: 'Developer',
  },
  // Finance
  {
    icon: '💰',
    name: 'Expense Splitter',
    description: 'Split group expenses fairly. Track who paid what and get a simplified debt settlement plan.',
    href: '/tools/expense-splitter',
    badge: 'New',
    color: 'from-green-500/10 to-emerald-600/5 border-green-500/20 hover:border-green-500/40',
    tags: ['expense', 'split', 'finance'],
    category: 'Finance',
  },
  {
    icon: '🏦',
    name: 'Loan Calculator',
    description: 'Calculate monthly EMI, total interest, and full amortization schedule for any loan.',
    href: '/tools/loan-calculator',
    badge: 'New',
    color: 'from-violet-500/10 to-purple-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['loan', 'emi', 'finance'],
    category: 'Finance',
  },
  // Utilities
  {
    icon: '🔑',
    name: 'Password Generator',
    description: 'Generate cryptographically secure passwords. See entropy, strength, and estimated crack time.',
    href: '/tools/password-generator',
    badge: null,
    color: 'from-gray-500/10 to-gray-600/5 border-gray-500/20 hover:border-gray-500/40',
    tags: ['password', 'security', 'generator'],
    category: 'Utilities',
  },
  {
    icon: '📊',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, paragraphs in real time. Get reading time and top words.',
    href: '/tools/word-counter',
    badge: 'New',
    color: 'from-blue-500/10 to-indigo-600/5 border-blue-500/20 hover:border-blue-500/40',
    tags: ['word count', 'text', 'writing'],
    category: 'Utilities',
  },
  {
    icon: '📐',
    name: 'Unit Converter',
    description: 'Convert between length, weight, temperature, area, volume, speed, data, and time units.',
    href: '/tools/unit-converter',
    badge: 'New',
    color: 'from-amber-500/10 to-orange-600/5 border-amber-500/20 hover:border-amber-500/40',
    tags: ['unit', 'convert', 'measurement'],
    category: 'Utilities',
  },
  {
    icon: '🎂',
    name: 'Age Calculator',
    description: 'Calculate exact age, next birthday countdown, zodiac sign, and total days lived — live.',
    href: '/tools/age-calculator',
    badge: 'New',
    color: 'from-pink-500/10 to-fuchsia-600/5 border-pink-500/20 hover:border-pink-500/40',
    tags: ['age', 'birthday', 'calculator'],
    category: 'Utilities',
  },
  {
    icon: '🔤',
    name: 'Text Case Converter',
    description: 'Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case and more.',
    href: '/tools/text-case',
    badge: 'New',
    color: 'from-teal-500/10 to-cyan-600/5 border-teal-500/20 hover:border-teal-500/40',
    tags: ['text', 'case', 'format'],
    category: 'Utilities',
  },
  {
    icon: '📷',
    name: 'QR Code Generator',
    description: 'Generate artistic QR codes with photo overlays, custom colors, logos, and multiple styles. Free & instant.',
    href: '/tools/qr-code',
    badge: 'New',
    color: 'from-violet-500/10 to-purple-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['qr code', 'generator', 'image', 'barcode'],
    category: 'Utilities',
  },
  {
    icon: '✍️',
    name: 'Digital Signature',
    description: 'Create professional e-signatures by drawing, typing, or uploading. Place on documents, save locally, download PNG. Free.',
    href: '/tools/digital-signature',
    badge: 'New',
    color: 'from-blue-500/10 to-indigo-600/5 border-blue-500/20 hover:border-blue-500/40',
    tags: ['digital signature', 'e-signature', 'sign document', 'electronic signature', 'esign'],
    category: 'Payroll & Legal',
  },
];

const ALL_CATEGORIES = ['All', 'Payroll & Legal', 'AI Writing', 'AI Documents', 'Developer', 'Finance', 'Utilities'];

function ToolsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const cat = searchParams.get('cat') ?? 'All';

  const filtered = TOOLS.filter(t => {
    const matchesCat = cat === 'All' || t.category === cat;
    const matchesQ = !q || [t.name, t.description, ...t.tags, t.category]
      .some(s => s.toLowerCase().includes(q.toLowerCase()));
    return matchesCat && matchesQ;
  });

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          {TOOLS.length} Free Tools
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          No signup required for first 5 daily uses. Professional quality.
          Powered by Groq AI — fast, accurate, and free.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_CATEGORIES.map(c => {
          const params = new URLSearchParams();
          if (c !== 'All') params.set('cat', c);
          if (q) params.set('q', q);
          const href = `/tools${params.toString() ? '?' + params.toString() : ''}`;
          return (
            <Link
              key={c}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                cat === c
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {c}
              {c !== 'All' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {TOOLS.filter(t => t.category === c).length}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Search indicator */}
      {q && (
        <div className="mb-6 flex items-center gap-3">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-medium">{filtered.length}</span> results for{' '}
            <span className="text-violet-400 font-medium">&quot;{q}&quot;</span>
          </p>
          <Link
            href={cat !== 'All' ? `/tools?cat=${cat}` : '/tools'}
            className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
          >
            Clear search
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-gray-300 font-medium mb-2">No tools found</p>
          <p className="text-gray-500 text-sm">Try a different search term or category.</p>
          <Link href="/tools" className="btn-secondary mt-4 inline-flex">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative flex flex-col p-6 rounded-2xl border bg-gradient-to-br ${tool.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
            >
              {tool.badge && (
                <span className="absolute top-4 right-4 badge-pro text-xs">
                  {tool.badge}
                </span>
              )}

              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {tool.icon}
              </div>

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg font-bold text-white">{tool.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800/60 text-gray-500">
                  {tool.category}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{tool.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {tool.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-500">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-violet-400 font-medium group-hover:gap-3 transition-all">
                Try free <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <BannerAd />
      </div>

      {/* SEO content */}
      <div className="mt-16 prose prose-sm max-w-4xl mx-auto text-gray-400">
        <h2 className="text-2xl font-bold text-white">Why Formly is Better Than the Alternatives</h2>
        <p>
          Most AI tool platforms charge $20-100/month, show intrusive ads, require signups for basic features,
          or produce mediocre AI output. Formly is different: powered by Groq AI — fast, high-quality output
          comparable to GPT-4 — and available free for casual users. Our Pro plan at just $9.99/month gives you 200 daily uses
          and priority processing, making it the most affordable professional AI suite available.
        </p>
        <h3 className="text-lg font-semibold text-white mt-6">Privacy-First Approach</h3>
        <p>
          We don&apos;t store your text, PDFs, or any content you process through our tools. Your data is sent
          to our AI, processed, and returned to you. Nothing is saved, sold, or used for training.
        </p>
      </div>
    </>
  );
}

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <Suspense fallback={
            <div className="text-center py-20">
              <p className="text-gray-400">Loading tools…</p>
            </div>
          }>
            <ToolsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
