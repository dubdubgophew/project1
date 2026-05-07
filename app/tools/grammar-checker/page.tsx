'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const RELATED = [
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
];

interface GrammarResult {
  corrected: string;
  issues: { type: string; original: string; correction: string; explanation: string }[];
  score: number;
}

export default function GrammarCheckerPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <ToolLayout
      title="Grammar Checker & Fixer"
      description="Instantly detect and fix grammar, spelling, punctuation, and style errors. Get clear explanations for every correction."
      icon="✅"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Your Text</label>
            <span className="text-xs text-gray-500">{input.length}/3,000</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here and we'll fix grammar, spelling, and style issues…"
            className="textarea min-h-[200px]"
            maxLength={3000}
            required
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
          {/* Score */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-900 border border-gray-800">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
              result.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
              result.score >= 60 ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            }`}>
              {result.score}
            </div>
            <div>
              <div className="font-semibold text-white">Grammar Score</div>
              <div className="text-sm text-gray-400">
                {result.issues.length} issue{result.issues.length !== 1 ? 's' : ''} found &amp; corrected
              </div>
            </div>
          </div>

          {/* Corrected text */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Corrected Text</h2>
              <button
                onClick={() => { navigator.clipboard.writeText(result.corrected); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result.corrected}</div>
          </div>

          {/* Issues list */}
          {result.issues.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Corrections Explained</h2>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        issue.type === 'grammar' ? 'bg-red-500/10 text-red-400' :
                        issue.type === 'spelling' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {issue.type}
                      </span>
                      <span className="text-xs text-gray-500 line-through">{issue.original}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-xs text-emerald-400 font-medium">{issue.correction}</span>
                    </div>
                    <p className="text-xs text-gray-500">{issue.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">Free Grammar Checker</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Better than basic spell checkers — our AI understands context, meaning, and style.
          Detects grammar errors, awkward phrasing, passive voice overuse, and more.
          Perfect for emails, essays, blog posts, and professional documents.
        </p>
      </div>
    </ToolLayout>
  );
}
