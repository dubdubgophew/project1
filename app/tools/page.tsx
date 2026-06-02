'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd, SidebarAd } from '@/components/shared/AdSense';

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
  {
    icon: '🎨',
    name: 'Diagrify',
    description: 'Create flowcharts and diagrams with AI text-to-diagram. Infinite canvas, sketchy mode, shapes, arrows, freehand drawing. Free, no signup.',
    href: '/tools/diagrify',
    badge: 'New',
    color: 'from-violet-500/10 to-purple-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['whiteboard', 'diagram', 'ai diagram', 'infinite canvas', 'drawing', 'flowchart', 'brainstorm', 'sketchy'],
    category: 'Design & Diagrams',
  },
  // India Calculators
  {
    icon: '💵',
    name: 'Hand Salary Calculator',
    description: 'Calculate take-home salary in India after PF, professional tax, and income tax deductions. CTC to in-hand breakdown.',
    href: '/tools/hand-salary-calculator',
    badge: 'New',
    color: 'from-green-500/10 to-emerald-600/5 border-green-500/20 hover:border-green-500/40',
    tags: ['salary', 'ctc', 'take home', 'india', 'pf', 'tax'],
    category: 'Calculators',
  },
  {
    icon: '🧾',
    name: 'Income Tax Calculator',
    description: 'India income tax FY 2025-26. Compare new vs old regime, calculate surcharge, cess, and TDS. Budget 2025 slabs.',
    href: '/tools/income-tax-calculator',
    badge: 'New',
    color: 'from-orange-500/10 to-amber-600/5 border-orange-500/20 hover:border-orange-500/40',
    tags: ['income tax', 'tax', 'india', 'new regime', 'old regime', 'itr'],
    category: 'Calculators',
  },
  {
    icon: '🏠',
    name: 'HRA Calculator',
    description: 'Calculate HRA exemption from income tax under Section 10(13A). Metro vs non-metro, all three components shown.',
    href: '/tools/hra-calculator',
    badge: 'New',
    color: 'from-sky-500/10 to-blue-600/5 border-sky-500/20 hover:border-sky-500/40',
    tags: ['hra', 'house rent allowance', 'india', 'tax exemption', 'section 10'],
    category: 'Calculators',
  },
  {
    icon: '🏦',
    name: 'Gratuity Calculator',
    description: 'Calculate gratuity under Payment of Gratuity Act 1972. Taxable vs exempt gratuity with latest ₹20L limit.',
    href: '/tools/gratuity-calculator',
    badge: 'New',
    color: 'from-yellow-500/10 to-amber-600/5 border-yellow-500/20 hover:border-yellow-500/40',
    tags: ['gratuity', 'india', 'gratuity act', 'retirement', 'tax exemption'],
    category: 'Calculators',
  },
  {
    icon: '🧮',
    name: 'GST Calculator',
    description: 'Calculate GST for any amount. Add or remove GST, CGST+SGST vs IGST, all slab rates. Compare across rates instantly.',
    href: '/tools/gst-calculator',
    badge: 'New',
    color: 'from-rose-500/10 to-red-600/5 border-rose-500/20 hover:border-rose-500/40',
    tags: ['gst', 'goods and services tax', 'india', 'cgst', 'sgst', 'igst'],
    category: 'Calculators',
  },
  {
    icon: '📈',
    name: 'SIP Calculator',
    description: 'Calculate mutual fund SIP returns with step-up SIP, lumpsum mode, goal planner, and year-by-year growth table.',
    href: '/tools/sip-calculator',
    badge: 'New',
    color: 'from-purple-500/10 to-violet-600/5 border-purple-500/20 hover:border-purple-500/40',
    tags: ['sip', 'mutual fund', 'india', 'investment', 'returns', 'lumpsum'],
    category: 'Calculators',
  },
  {
    icon: '🏡',
    name: 'Home Loan EMI Calculator',
    description: 'Calculate home loan EMI, total interest, amortization schedule. Prepayment analysis, Section 24b tax benefit.',
    href: '/tools/home-loan-emi-calculator',
    badge: 'New',
    color: 'from-teal-500/10 to-cyan-600/5 border-teal-500/20 hover:border-teal-500/40',
    tags: ['home loan', 'emi', 'india', 'mortgage', 'amortization', 'section 24b'],
    category: 'Calculators',
  },
  // Fitness & Health
  {
    icon: '✨',
    name: 'Vibe Check',
    description: 'A 60-second AI mood check-in. Understand your feelings, track patterns, get personalized insights and micro-exercises. Works in 25+ countries. Private & free.',
    href: '/tools/vibe-check',
    badge: 'New',
    color: 'from-violet-500/10 to-purple-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['mental wellness', 'mood tracker', 'mindfulness', 'emotional check-in', 'mental health', 'meditation'],
    category: 'Fitness & Health',
  },
  {
    icon: '💪',
    name: 'Iron Core Workout',
    description: '30-day military calisthenics program with progressive training, rest timer, diet plan, ancient wisdom, and streak tracking. No equipment needed.',
    href: '/tools/iron-core-workout',
    badge: 'New',
    color: 'from-red-900/20 to-orange-900/10 border-red-800/30 hover:border-red-700/50',
    tags: ['calisthenics', 'workout tracker', 'fitness', 'plank', 'military', '30 day challenge', 'bodyweight'],
    category: 'Fitness & Health',
  },
];

const ALL_CATEGORIES = ['All', 'Payroll & Legal', 'AI Writing', 'AI Documents', 'Developer', 'Finance', 'Utilities', 'Design & Diagrams', 'Calculators', 'Fitness & Health'];

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">
          {TOOLS.length} Free AI Tools
        </h1>
        <p className="text-gray-500 text-sm">
          No signup · 5 free uses daily · Powered by Groq AI
        </p>
      </div>

      {/* Category filter pills — sticky */}
      <div className="sticky top-[80px] z-10 bg-[#F9F7F4]/95 py-3 -mx-2 px-2 mb-6 border-b border-stone-200 backdrop-blur-sm">
        <div className="flex flex-wrap gap-1.5">
        {ALL_CATEGORIES.map(c => {
          const params = new URLSearchParams();
          if (c !== 'All') params.set('cat', c);
          if (q) params.set('q', q);
          const href = `/tools${params.toString() ? '?' + params.toString() : ''}`;
          return (
            <Link
              key={c}
              href={href}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                cat === c
                  ? 'bg-violet-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              {c}
              {c !== 'All' && (
                <span className="ml-1 opacity-60">
                  {TOOLS.filter(t => t.category === c).length}
                </span>
              )}
            </Link>
          );
        })}
        </div>
      </div>

      {/* Search indicator */}
      {q && (
        <div className="mb-6 flex items-center gap-3">
          <p className="text-sm text-gray-400">
            Showing <span className="text-stone-900 font-medium">{filtered.length}</span> results for{' '}
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
          <p className="text-stone-700 font-medium mb-2">No tools found</p>
          <p className="text-stone-500 text-sm">Try a different search term or category.</p>
          <Link href="/tools" className="btn-secondary mt-4 inline-flex">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative flex flex-col p-4 rounded-xl border bg-gradient-to-br ${tool.color} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
            >
              {tool.badge && (
                <span className="absolute top-3 right-3 badge-pro text-[10px] px-1.5 py-0.5">
                  {tool.badge}
                </span>
              )}

              <div className="text-2xl mb-2.5 group-hover:scale-110 transition-transform duration-200">
                {tool.icon}
              </div>

              <h2 className="text-sm font-bold text-stone-900 mb-1 leading-snug pr-8">{tool.name}</h2>
              <p className="text-stone-600 text-xs leading-relaxed flex-1 line-clamp-2">{tool.description}</p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-500 font-medium group-hover:gap-2 transition-all">
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
      <div className="mt-16 prose prose-sm max-w-4xl mx-auto text-stone-500">
        <h2 className="text-2xl font-bold text-stone-900">Why Formly is Better Than the Alternatives</h2>
        <p>
          Most AI tool platforms charge $20-100/month, show intrusive ads, require signups for basic features,
          or produce mediocre AI output. Formly is different: powered by Groq AI — fast, high-quality output
          comparable to GPT-4 — and available free for casual users. Our Pro plan at just $9.99/month gives you 200 daily uses
          and priority processing, making it the most affordable professional AI suite available.
        </p>
        <h3 className="text-lg font-semibold text-stone-900 mt-6">Privacy-First Approach</h3>
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
      <main className="min-h-screen bg-[#F9F7F4] pt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-[1fr_260px] gap-8">
            <div>
              <Suspense fallback={
                <div className="text-center py-20">
                  <p className="text-stone-500">Loading tools…</p>
                </div>
              }>
                <ToolsContent />
              </Suspense>
            </div>
            <aside className="hidden lg:flex flex-col gap-4 pt-2">
              <div className="sticky top-24 space-y-4">
                <SidebarAd />
                <SidebarAd />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
