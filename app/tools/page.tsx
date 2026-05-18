import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd } from '@/components/shared/AdSense';

export const metadata: Metadata = {
  title: 'All AI Tools — Free PDF Summarizer, Paraphraser, Grammar Checker & More',
  description:
    'Browse all 10 free AI tools: PDF summarizer, paraphraser, grammar checker, email writer, code explainer, YouTube summarizer, resume builder, contract generator, hashtag generator, bio writer.',
  alternates: { canonical: 'https://formly.tools/tools' },
};

const TOOLS = [
  {
    icon: '📄',
    name: 'PDF Summarizer',
    description: 'Upload any PDF and get a concise, bullet-pointed summary with key insights in seconds.',
    href: '/tools/pdf-summarizer',
    badge: 'Popular',
    color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
    tags: ['pdf', 'summarize', 'research'],
  },
  {
    icon: '✍️',
    name: 'AI Paraphraser',
    description: 'Rewrite any text in 5 different styles — Standard, Formal, Creative, Academic, or Simple.',
    href: '/tools/paraphraser',
    badge: 'Top Rated',
    color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40',
    tags: ['rewrite', 'paraphrase', 'writing'],
  },
  {
    icon: '✅',
    name: 'Grammar Checker',
    description: 'Fix grammar, spelling, and style issues instantly. Get explanations for every correction.',
    href: '/tools/grammar-checker',
    badge: null,
    color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
    tags: ['grammar', 'spell check', 'writing'],
  },
  {
    icon: '📧',
    name: 'Email Writer',
    description: 'Generate professional emails in seconds. Choose your tone — formal, casual, or persuasive.',
    href: '/tools/email-writer',
    badge: 'Popular',
    color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40',
    tags: ['email', 'professional', 'business'],
  },
  {
    icon: '💻',
    name: 'Code Explainer',
    description: 'Paste any code and get a clear plain-English explanation. Supports 20+ programming languages.',
    href: '/tools/code-explainer',
    badge: null,
    color: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:border-pink-500/40',
    tags: ['code', 'programming', 'developer'],
  },
  {
    icon: '▶️',
    name: 'YouTube Summarizer',
    description: 'Paste any YouTube URL and get a complete summary with timestamps and key takeaways.',
    href: '/tools/youtube-summarizer',
    badge: 'Trending',
    color: 'from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40',
    tags: ['youtube', 'video', 'summarize'],
  },
  {
    icon: '📋',
    name: 'Resume Builder',
    description: 'Build an ATS-optimized resume with AI. Stand out from hundreds of other applicants.',
    href: '/tools/resume-builder',
    badge: null,
    color: 'from-teal-500/10 to-teal-600/5 border-teal-500/20 hover:border-teal-500/40',
    tags: ['resume', 'cv', 'job'],
  },
  {
    icon: '📜',
    name: 'Contract Generator',
    description: 'Generate freelance contracts, NDAs, service agreements in minutes. Professional & legally sound.',
    href: '/tools/contract-generator',
    badge: null,
    color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40',
    tags: ['legal', 'contract', 'nda'],
  },
  {
    icon: '#️⃣',
    name: 'Hashtag Generator',
    description: 'Generate viral hashtags for Instagram, Twitter, LinkedIn, and TikTok based on your topic.',
    href: '/tools/hashtag-generator',
    badge: null,
    color: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40',
    tags: ['hashtags', 'social media', 'instagram'],
  },
  {
    icon: '🪪',
    name: 'Bio Writer',
    description: 'Create compelling professional bios for LinkedIn, Twitter, Instagram, and websites.',
    href: '/tools/bio-writer',
    badge: null,
    color: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/20 hover:border-fuchsia-500/40',
    tags: ['bio', 'profile', 'linkedin'],
  },
];

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              10 Free AI Tools
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              No signup required for first 5 daily uses. Professional quality.
              Powered by Groq AI — fast, accurate, and free.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
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

                <h2 className="text-lg font-bold text-white mb-2">{tool.name}</h2>
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
        </div>
      </main>
      <Footer />
    </>
  );
}
