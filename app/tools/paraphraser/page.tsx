'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const MODES = [
  { id: 'standard', label: 'Standard', desc: 'Natural, balanced rewrite' },
  { id: 'formal', label: 'Formal', desc: 'Professional & polished' },
  { id: 'creative', label: 'Creative', desc: 'Unique & engaging' },
  { id: 'academic', label: 'Academic', desc: 'Scholarly & precise' },
  { id: 'simple', label: 'Simple', desc: 'Easy to understand' },
] as const;

const RELATED = [
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
];

export default function ParaphraserPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'standard' | 'formal' | 'creative' | 'academic' | 'simple'>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const charLimit = 2000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.length > charLimit) {
      setError(`Text too long. Maximum ${charLimit} characters for free plan.`);
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/tools/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, mode }),
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

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout
      title="AI Paraphraser"
      description="Instantly rewrite text in 5 different styles. Eliminate plagiarism, improve clarity, and tailor your writing for any audience."
      icon="✍️"
      badge="Top Rated"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mode selector */}
        <div>
          <label className="label">Rewriting Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === m.id
                    ? 'bg-violet-600/20 border-violet-500/50 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Your Text</label>
            <span className={`text-xs ${input.length > charLimit ? 'text-red-400' : 'text-gray-500'}`}>
              {input.length}/{charLimit}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the text you want to paraphrase here…"
            className="textarea min-h-[180px]"
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
            <><Loader2 className="w-5 h-5 animate-spin" /> Rewriting…</>
          ) : (
            <><RefreshCw className="w-5 h-5" /> Paraphrase Text</>
          )}
        </button>
      </form>

      {/* Output */}
      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Paraphrased Text</h2>
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
            <span>Mode: <span className="text-gray-400 capitalize">{mode}</span></span>
            <span>{output.split(' ').length} words</span>
          </div>
        </div>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">About the AI Paraphraser</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Our AI paraphraser uses Groq AI to rewrite your text while preserving the original meaning.
          Perfect for avoiding plagiarism, improving readability, adapting content for different audiences,
          or simply getting a fresh perspective on your writing. Supports text up to 2,000 characters free
          (10,000 for Pro users).
        </p>
      </div>
    </ToolLayout>
  );
}
