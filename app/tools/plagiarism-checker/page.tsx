'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { AlertTriangle, CheckCircle2, Loader2, Search, Lightbulb, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

const RELATED = [
  { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
];

interface Segment {
  text: string;
  risk: 'low' | 'medium' | 'high';
  reason: string;
}

interface PlagiarismResult {
  originality_score: number;
  risk_level: 'low' | 'medium' | 'high';
  summary: string;
  segments: Segment[];
  suggestions: string[];
  search_queries: string[];
  word_count: number;
}

const RISK_CONFIG = {
  low: {
    label: 'Low Risk',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
    scoreBg: 'bg-emerald-500/10',
    scoreText: 'text-emerald-600',
  },
  medium: {
    label: 'Medium Risk',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    icon: ShieldAlert,
    iconColor: 'text-amber-500',
    scoreBg: 'bg-amber-500/10',
    scoreText: 'text-amber-600',
  },
  high: {
    label: 'High Risk',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    icon: ShieldX,
    iconColor: 'text-red-500',
    scoreBg: 'bg-red-500/10',
    scoreText: 'text-red-600',
  },
};

export default function PlagiarismCheckerPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || input.trim().split(/\s+/).length < 10) {
      setError('Please enter at least 10 words to check for plagiarism.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/tools/plagiarism', {
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

  const config = result ? RISK_CONFIG[result.risk_level] : null;

  return (
    <ToolLayout
        toolSlug="plagiarism-checker"
      title="Plagiarism Checker"
      description="AI-powered originality detector. Get a segment-level plagiarism risk score, identify suspicious passages, and get specific rewriting suggestions."
      icon="🔍"
      badge="Free"
      relatedTools={RELATED}
      rateLimited
      faqs={[
        { q: 'Is this plagiarism checker completely free?', a: "Yes — completely free with no signup. Paste your text and get an instant originality analysis with segment-level risk scores." },
        { q: 'How does AI plagiarism detection work?', a: 'The AI analyzes writing style consistency, detects phrases common in known sources, and identifies segments that appear paraphrased rather than originally written. It provides a risk score per segment.' },
        { q: 'Is this a Turnitin alternative?', a: 'It is a free self-check tool before submitting to Turnitin. Use it to identify passages that need rewriting. Turnitin compares against institutional databases; our tool uses AI pattern analysis.' },
        { q: 'What is a good originality score?', a: '75–100 = low risk (your text appears original). 40–74 = medium risk (some passages need attention). Below 40 = high risk (significant rewriting recommended).' },
        { q: 'Is my text stored or shared?', a: 'No. Your text is processed by AI and immediately discarded. Nothing is stored, logged, or shared.' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="plagiarism-input" className="label mb-0">Your Text</label>
            <span className="text-xs text-stone-500">{input.trim().split(/\s+/).filter(Boolean).length} words · {input.length}/5,000 chars</span>
          </div>
          <textarea
            id="plagiarism-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your essay, article, blog post, or any text here to check for plagiarism. Minimum 50 words recommended for accurate results."
            className="textarea min-h-[220px]"
            maxLength={5000}
            required
          />
          <p className="text-xs text-stone-400 mt-1.5">Supports essays, articles, blog posts, research papers, and any written content.</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary w-full justify-center py-3.5"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Analyzing for plagiarism…</>
          ) : (
            <><Search className="w-5 h-5" aria-hidden="true" /> Check for Plagiarism</>
          )}
        </button>
      </form>

      {result && config && (
        <div className="space-y-5">
          {/* Score card */}
          <div className={`flex items-center gap-5 p-5 rounded-2xl border ${config.bg} ${config.border}`}>
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 ${config.scoreBg}`}>
              <span className={`text-3xl font-bold ${config.scoreText}`}>{result.originality_score}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.scoreText}`}>/ 100</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <config.icon className={`w-5 h-5 ${config.iconColor}`} aria-hidden="true" />
                <span className={`font-bold text-lg ${config.text}`}>
                  {result.originality_score >= 75 ? 'Likely Original' : result.originality_score >= 40 ? 'Needs Review' : 'High Risk'}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                  {config.label}
                </span>
              </div>
              <p className={`text-sm ${config.text} opacity-80`}>{result.summary}</p>
              <p className="text-xs text-stone-500 mt-1">{result.word_count} words analyzed</p>
            </div>
          </div>

          {/* Originality meter */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-900 text-sm">Originality Score</h2>
              <span className="text-sm font-bold text-stone-900">{result.originality_score}%</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  result.originality_score >= 75 ? 'bg-emerald-500' :
                  result.originality_score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.originality_score}%` }}
                role="progressbar"
                aria-valuenow={result.originality_score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Originality score: ${result.originality_score}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
              <span>High Risk (0)</span>
              <span>Medium Risk (40)</span>
              <span>Low Risk (75)</span>
              <span>Original (100)</span>
            </div>
          </div>

          {/* Segment-level analysis */}
          {result.segments.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-stone-900 mb-4">Segment Analysis</h2>
              <div className="space-y-3">
                {result.segments.map((seg, i) => {
                  const sc = RISK_CONFIG[seg.risk];
                  const Icon = sc.icon;
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${sc.bg} ${sc.border}`}>
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${sc.iconColor}`} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${sc.badge}`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-sm text-stone-800 leading-relaxed mb-1.5">
                            &ldquo;{seg.text}&rdquo;
                          </p>
                          <p className={`text-xs ${sc.text} opacity-80`}>{seg.reason}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <h2 className="font-semibold text-stone-900">How to Improve Originality</h2>
              </div>
              <ul className="space-y-2.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search queries for verification */}
          {result.search_queries.length > 0 && (
            <div className="card border-red-100 bg-red-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-red-500" aria-hidden="true" />
                <h2 className="font-semibold text-stone-900 text-sm">Verify These Phrases</h2>
              </div>
              <p className="text-xs text-stone-500 mb-3">Google these exact phrases to find the potential source:</p>
              <div className="space-y-2">
                {result.search_queries.map((q, i) => (
                  <a
                    key={i}
                    href={`https://www.google.com/search?q=${encodeURIComponent(`"${q}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-red-200 text-sm text-stone-700 hover:border-red-400 hover:text-red-600 transition-colors group"
                  >
                    <Search className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
                    <span className="font-mono text-xs">&ldquo;{q}&rdquo;</span>
                    <span className="ml-auto text-[10px] text-stone-400 group-hover:text-red-600">Search →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* All clear banner */}
          {result.risk_level === 'low' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Your text looks original!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Low plagiarism risk. Review the suggestions above to maximize originality before submission.</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setResult(null); setInput(''); }}
              className="btn-secondary flex-1 justify-center py-2.5 text-sm"
            >
              Check Another Text
            </button>
          </div>
        </div>
      )}

      {/* How it works — shown before results */}
      {!result && !loading && (
        <div className="card bg-stone-50 border-stone-100">
          <h2 className="font-semibold text-stone-900 text-sm mb-3">What this tool detects</h2>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
              <span><strong className="text-stone-800">Style inconsistencies</strong> — sudden shifts between academic and casual writing indicating copied blocks</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
              <span><strong className="text-stone-800">Common source phrasing</strong> — exact or near-exact matches with known textbooks, Wikipedia, and common web sources</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
              <span><strong className="text-stone-800">Suspicious patterns</strong> — unusually polished sentences amid otherwise ordinary writing</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
              <span><strong className="text-stone-800">Search-verify links</strong> — Google search links for flagged phrases so you can confirm the source</span>
            </li>
          </ul>
        </div>
      )}
    </ToolLayout>
  );
}
