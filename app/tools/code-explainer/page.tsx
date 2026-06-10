'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Code2 } from 'lucide-react';

const LANGUAGES = [
  'Auto-detect', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
  'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'Bash', 'HTML/CSS', 'Other',
];

const MODES = [
  { id: 'explain', label: 'Explain Code', desc: "What does this code do?" },
  { id: 'improve', label: 'Suggest Improvements', desc: 'How to make it better?' },
  { id: 'debug', label: 'Find Bugs', desc: 'What could go wrong?' },
  { id: 'document', label: 'Generate Docs', desc: 'Write comments & JSDoc' },
] as const;

const RELATED = [
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
];

export default function CodeExplainerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');
  const [mode, setMode] = useState<'explain' | 'improve' | 'debug' | 'document'>('explain');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/tools/code-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, mode }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setOutput(data.result);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
        toolSlug="code-explainer"
      title="AI Code Explainer"
      description="Paste any code and get a clear plain-English explanation, improvement suggestions, or auto-generated documentation. Supports 20+ languages."
      icon="💻"
      relatedTools={RELATED}
      faqs={[
        {
          q: 'Is the AI Code Explainer free to use?',
          a: 'Yes, it is 100% free with no account or sign-up needed. Paste your code and get a plain-English explanation instantly.',
        },
        {
          q: 'Which programming languages does it support?',
          a: 'It supports 20+ languages including JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, SQL, Bash, HTML/CSS, and more. Use "Auto-detect" if you are unsure.',
        },
        {
          q: 'How does this compare to GitHub Copilot or paid AI tools?',
          a: 'GitHub Copilot costs $10–$19/month and is built into an IDE. Our tool is free, browser-based, and requires no installation — perfect for quickly understanding a snippet, debugging unfamiliar code, or generating docs without committing to a subscription.',
        },
        {
          q: 'Can it do more than just explain code?',
          a: 'Yes. Beyond explanations, it can suggest improvements to make code cleaner and more efficient, find potential bugs, and auto-generate comments and JSDoc-style documentation.',
        },
        {
          q: 'Is it useful for learning programming?',
          a: 'Definitely. Beginners can paste confusing code from tutorials or Stack Overflow and get a step-by-step plain-English breakdown. It is like having a senior developer explain any snippet on demand.',
        },
        {
          q: 'Is my code private when I use this tool?',
          a: 'Your code is only used for the current analysis and is not stored or shared. As a precaution, avoid submitting code that contains passwords, API keys, or other sensitive credentials.',
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mode */}
        <div>
          <label className="label">What do you need?</label>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === m.id
                    ? 'bg-violet-100 border-violet-400 text-violet-700'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="label">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Code input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Your Code</label>
            <span className="text-xs text-stone-500">{code.length}/5,000 chars</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here…
function example() {
  // ...
}"
            className="textarea min-h-[220px] font-mono text-xs"
            maxLength={5000}
            required
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={!code.trim() || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing code…</>
          ) : (
            <><Code2 className="w-5 h-5" /> {MODES.find(m => m.id === mode)?.label}</>
          )}
        </button>
      </form>

      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">Result</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
        </div>
      )}

      <div className="card bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Free AI Code Explainer</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Whether you&apos;re a beginner trying to understand someone else&apos;s code, or a senior developer
          who wants quick documentation — our AI code explainer handles it all. Supports JavaScript,
          TypeScript, Python, Java, C++, Go, Rust, SQL, and 15+ more languages.
        </p>
      </div>
    </ToolLayout>
  );
}
