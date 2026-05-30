import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const TOOLS = [
  { name: 'Pay Stub Generator', href: '/tools/paystub-generator' },
  { name: 'Resume Builder', href: '/tools/resume-builder' },
  { name: 'Contract Generator', href: '/tools/contract-generator' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer' },
  { name: 'Digital Signature', href: '/tools/digital-signature' },
  { name: 'Paraphraser', href: '/tools/paraphraser' },
  { name: 'Grammar Checker', href: '/tools/grammar-checker' },
  { name: 'Email Writer', href: '/tools/email-writer' },
  { name: 'Code Explainer', href: '/tools/code-explainer' },
  { name: 'Cover Letter', href: '/tools/cover-letter' },
  { name: 'Code Reviewer', href: '/tools/code-reviewer' },
  { name: 'Terms Simplifier', href: '/tools/terms-simplifier' },
  { name: 'JSON Formatter', href: '/tools/json-formatter' },
  { name: 'Word Counter', href: '/tools/word-counter' },
  { name: 'Loan Calculator', href: '/tools/loan-calculator' },
  { name: 'Unit Converter', href: '/tools/unit-converter' },
  { name: 'Regex Tester', href: '/tools/regex-tester' },
  { name: 'Diff Checker', href: '/tools/diff-checker' },
  { name: 'Color Converter', href: '/tools/color-converter' },
  { name: 'View All Tools →', href: '/tools' },
];

const COMPANY = [
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const LEGAL = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Refund Policy', href: '/refunds' },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">form</span>
                <span className="gradient-text">ly</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              37 free AI tools for writers, developers, and professionals.
              No signup required for first 5 daily uses.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/formlytools" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com/formlytools" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/formlytools" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:hello@formly.tools" className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">AI Tools</h3>
            <ul className="space-y-2.5">
              {TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2.5">
              {COMPANY.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-8 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-zinc-500 hover:text-orange-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Stay Updated</h3>
            <p className="text-sm text-zinc-500 mb-4">
              Get notified when we add new AI tools and features.
            </p>
            <form action="/api/newsletter" method="POST" className="space-y-2">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="input text-sm"
              />
              <button type="submit" className="btn-primary w-full justify-center text-sm py-2.5">
                Subscribe Free
              </button>
            </form>
            <p className="text-xs text-zinc-700 mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Formly. Built with ♥ in India.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-700">Powered by Groq AI</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-xs text-zinc-700 flex items-center gap-1">
              <span className="text-emerald-500">●</span> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
