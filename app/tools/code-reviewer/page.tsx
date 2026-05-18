'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Code2 } from 'lucide-react';


const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
  'PHP', 'Ruby', 'C#', 'Swift', 'Kotlin', 'SQL', 'Bash', 'HTML/CSS',
];

type Tab = 'issues' | 'quality' | 'performance' | 'improved';

interface ReviewResult {
  issues?: { severity: string; message: string; line?: number }[];
  quality?: { score: number; summary: string; points?: string[] };
  performance?: string[];
  improved_code?: string;
  grade?: string;
}

function gradeStyle(grade: string) {
  const g = grade?.charAt(0)?.toUpperCase();
  if (g === 'A') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (g === 'B') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (g === 'C') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function severityStyle(severity: string) {
  const s = severity?.toLowerCase();
  if (s === 'critical' || s === 'error' || s === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (s === 'warning' || s === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
}

export default function CodeReviewerPage() {
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('issues');
  const [copiedCode, setCopiedCode] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/tools/code-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        // Parse JSON if returned as string
        let parsed = data;
        if (typeof data === 'string') {
          try { parsed = JSON.parse(data); } catch { parsed = { improved_code: data }; }
        }
        // Handle nested review field
        if (parsed.review) parsed = { ...parsed, ...parsed.review };
        setResult(parsed);
        setActiveTab('issues');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const issues = result?.issues ?? [];
  const quality = result?.quality;
  const performance = result?.performance ?? [];
  const improvedCode = result?.improved_code ?? '';
  const grade = result?.grade ?? '';

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'issues', label: 'Issues', count: issues.length },
    { key: 'quality', label: 'Quality' },
    { key: 'performance', label: 'Performance', count: performance.length },
    { key: 'improved', label: 'Improved Code' },
  ];

  return (
    <ToolLayout
      title="AI Code Reviewer"
      description="Paste your code and get an instant AI review — issues, quality score, performance tips, and an improved version."
      icon="🔎"
      relatedTools={[
        { name: 'Code Explainer', href: '/tools/code-explainer', icon: '💻' },
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Programming Language</label>
          <select className="input max-w-xs" value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Code to Review</label>
          <textarea
            className="textarea min-h-[260px] font-mono text-sm"
            placeholder={`Paste your ${language} code here…`}
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="btn-primary w-full justify-center py-3.5"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Reviewing code…</>
            : <><Code2 className="w-5 h-5" /> Review Code</>}
        </button>
      </form>

      {result && (
        <div className="card mt-6 space-y-4">
          {/* Header with grade */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-white">Review Results</h2>
            {grade && (
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl font-black border ${gradeStyle(grade)}`}>
                {grade}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-gray-700 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm rounded-t-lg transition-colors -mb-px ${
                  activeTab === tab.key
                    ? 'bg-gray-800 text-white border border-b-gray-800 border-gray-700'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${tab.count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'issues' && (
              issues.length === 0 ? (
                <p className="text-emerald-400 text-sm p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  No issues found — your code looks clean!
                </p>
              ) : (
                <div className="space-y-2">
                  {issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl text-sm">
                      <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold border ${severityStyle(issue.severity)}`}>
                        {issue.severity || 'info'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200">{issue.message}</p>
                        {issue.line && <p className="text-gray-500 text-xs mt-0.5">Line {issue.line}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'quality' && (
              quality ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Quality Score</span>
                      <span className="text-white font-bold">{quality.score}/10</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${quality.score >= 8 ? 'bg-emerald-500' : quality.score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${(quality.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{quality.summary}</p>
                  {quality.points && quality.points.length > 0 && (
                    <ul className="space-y-1.5">
                      {quality.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-violet-400 shrink-0 mt-0.5">•</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No quality data returned.</p>
              )
            )}

            {activeTab === 'performance' && (
              performance.length === 0 ? (
                <p className="text-emerald-400 text-sm p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  No performance issues found.
                </p>
              ) : (
                <ul className="space-y-2">
                  {performance.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 bg-gray-800/50 rounded-xl text-sm">
                      <span className="text-amber-400 shrink-0 mt-0.5">⚡</span>
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              )
            )}

            {activeTab === 'improved' && (
              improvedCode ? (
                <div>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(improvedCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={improvedCode}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-emerald-300 text-xs font-mono resize-y min-h-[300px] focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No improved code returned.</p>
              )
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
