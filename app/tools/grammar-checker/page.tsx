'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const RELATED = [
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
];

interface GrammarResult {
  corrected: string;
  issues: { type: string; original: string; correction: string; explanation: string }[];
  score: number;
  reading_level?: string;
  tone?: string;
}

export default function GrammarCheckerPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function runCheck() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/tools/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runCheck();
  }

  return (
    <ToolLayout
        toolSlug="grammar-checker"
      title="Grammar Checker & Fixer"
      description="Instantly detect and fix grammar, spelling, punctuation, and style errors. Get clear explanations for every correction."
      icon="✅"
      relatedTools={RELATED}
      faqs={[
        { q: 'Is this grammar checker completely free?', a: 'Yes. Formly\'s grammar checker is free with no word limits and no premium paywall. No account or credit card required — open the tool and start checking immediately.' },
        { q: 'What errors does the AI grammar checker catch?', a: 'It catches grammar errors, spelling mistakes, punctuation issues, run-on sentences, passive voice overuse, subject-verb disagreement, comma splices, dangling modifiers, and style/clarity suggestions. Every correction includes a plain-language explanation.' },
        { q: 'Is it better than Grammarly?', a: 'For free use, yes — Grammarly locks most suggestions behind a $12/month subscription. Formly provides full corrections with explanations at no cost, with no account needed.' },
        { q: 'Does it work for academic and professional writing?', a: 'Yes. It handles academic essays, research papers, business emails, and reports. It identifies passive voice overuse, formal grammar violations, and awkward phrasing common in academic writing.' },
        { q: 'Does it support British English?', a: 'Yes. The tool understands both US and UK English conventions and will not flag British spellings like "colour", "organise", or "programme" as errors.' },
        { q: 'Is my text private and secure?', a: 'Your text is sent only for processing and is never stored, logged, or shared. The connection is HTTPS-encrypted and no account is needed, so your writing stays private.' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Your Text</label>
            <span className="text-xs text-stone-500">{input.length}/5,000</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here and we'll fix grammar, spelling, and style issues…"
            className="textarea min-h-[200px]"
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

        <button type="submit" disabled={!input.trim() || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Checking grammar…</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Check & Fix Grammar</>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Score + metadata */}
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                result.score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                result.score >= 60 ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-600'
              }`}>
                {result.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900">Grammar Score</div>
                <div className="text-sm text-stone-500">
                  {result.issues.length} issue{result.issues.length !== 1 ? 's' : ''} found &amp; corrected
                </div>
                {(result.reading_level || result.tone) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.reading_level && (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                        📖 {result.reading_level}
                      </span>
                    )}
                    {result.tone && (
                      <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-md">
                        🎯 {result.tone}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Corrected text */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Corrected Text</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={runCheck}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                  title="Re-check with fresh analysis"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-check
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(result.corrected); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{result.corrected}</div>
          </div>

          {/* Issues list */}
          {result.issues.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-stone-900 mb-4">Corrections Explained</h2>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        issue.type === 'grammar' ? 'bg-red-50 text-red-600' :
                        issue.type === 'spelling' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {issue.type}
                      </span>
                      <span className="text-xs text-stone-500 line-through">{issue.original}</span>
                      <span className="text-xs text-stone-500">→</span>
                      <span className="text-xs text-emerald-700 font-medium">{issue.correction}</span>
                    </div>
                    <p className="text-xs text-stone-500">{issue.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Free Grammar Checker</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Better than basic spell checkers — our AI understands context, meaning, and style.
          Detects grammar errors, awkward phrasing, passive voice overuse, and more.
          Perfect for emails, essays, blog posts, and professional documents.
        </p>
      </div>
    </ToolLayout>
  );
}
