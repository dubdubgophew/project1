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
      title="AI Code Explainer"
      description="Paste any code and get a clear plain-English explanation, improvement suggestions, or auto-generated documentation. Supports 20+ languages."
      icon="💻"
      relatedTools={RELATED}
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
            <span className="text-xs text-gray-500">{code.length}/5,000 chars</span>
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
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
            <h2 className="font-semibold text-white">Result</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
        </div>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">Free AI Code Explainer</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Whether you&apos;re a beginner trying to understand someone else&apos;s code, or a senior developer
          who wants quick documentation — our AI code explainer handles it all. Supports JavaScript,
          TypeScript, Python, Java, C++, Go, Rust, SQL, and 15+ more languages.
        </p>
      </div>
    </ToolLayout>
  );
}
