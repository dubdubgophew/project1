'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const MODES = [
  { id: 'fluent', label: 'Fluent', desc: 'Improve flow & readability' },
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
  const [wordsBefore, setWordsBefore] = useState(0);
  const [wordsAfter, setWordsAfter] = useState(0);
  const [mode, setMode] = useState<'fluent' | 'formal' | 'creative' | 'academic' | 'simple'>('fluent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const charLimit = 2000;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
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
      else {
        setOutput(data.result);
        setWordsBefore(data.wordsBefore ?? 0);
        setWordsAfter(data.wordsAfter ?? 0);
      }
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
        toolSlug="paraphraser"
      title="AI Paraphraser"
      description="Instantly rewrite text in 5 different styles. Improve flow, eliminate plagiarism, and tailor your writing for any audience — free, no limits."
      icon="✍️"
      badge="Top Rated"
      relatedTools={RELATED}
      faqs={[
        { q: 'Is this paraphraser completely free?', a: 'Yes. The AI paraphraser is free with no character limits and no premium paywall. No account or credit card required.' },
        { q: 'What paraphrasing styles are available?', a: 'The tool offers 5 styles: Fluent (improves flow and readability), Formal (professional/business tone), Academic (scholarly and precise), Simple (plain language), and Creative (varied and engaging).' },
        { q: 'Does paraphrasing eliminate plagiarism?', a: 'Paraphrasing significantly reduces plagiarism by replacing original wording with new phrasing. However, for academic work, always cite the original source even after paraphrasing — the idea remains borrowed even if the words change.' },
        { q: 'How does this compare to QuillBot?', a: 'Formly\'s paraphraser is completely free with no word limit — QuillBot\'s free plan limits you to 125 words per request and locks most modes behind a $9.95/month subscription. Formly supports up to 2,000 characters free.' },
        { q: 'Can I use it for academic essays?', a: 'Yes — use the Academic mode for scholarly writing. It uses precise terminology, appropriate passive voice, and formal vocabulary. Always verify the output preserves the original meaning before submission.' },
        { q: 'Is my text data private?', a: 'Your text is sent only for AI processing and is never stored or logged. The connection is HTTPS-encrypted and no account is needed.' },
      ]}
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

        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Your Text</label>
            <span className={`text-xs ${input.length > charLimit ? 'text-red-600' : 'text-stone-500'}`}>
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
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
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
            <div>
              <h2 className="font-semibold text-stone-900">Paraphrased Text</h2>
              {wordsBefore > 0 && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {wordsBefore} → {wordsAfter} words
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                title="Try a different rewrite"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all">
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
          <div className="mt-4 pt-4 border-t border-stone-200 text-xs text-stone-500">
            Mode: <span className="capitalize font-medium">{mode}</span>
          </div>
        </div>
      )}

      <div className="card bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">About the AI Paraphraser</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Our AI paraphraser rewrites your text while preserving the original meaning.
          Perfect for avoiding plagiarism, improving readability, adapting content for different audiences,
          or getting a fresh perspective on your writing. Supports text up to 2,000 characters free.
          Use the Retry button to get a fresh rewrite with different wording.
        </p>
      </div>
    </ToolLayout>
  );
}
