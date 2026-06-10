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
  if (g === 'A') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (g === 'B') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (g === 'C') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-600 border-red-200';
}

function severityStyle(severity: string) {
  const s = severity?.toLowerCase();
  if (s === 'critical' || s === 'error' || s === 'high') return 'bg-red-50 text-red-600 border-red-200';
  if (s === 'warning' || s === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
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
        toolSlug="code-reviewer"
      title="AI Code Reviewer"
      description="Paste your code and get an instant AI review — issues, quality score, performance tips, and an improved version."
      icon="🔎"
      relatedTools={[
        { name: 'Code Explainer', href: '/tools/code-explainer', icon: '💻' },
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
      ]}
      faqs={[
        {
          q: 'Is the AI Code Reviewer free?',
          a: 'Yes, completely free. No account, no sign-up, and no credit card required. Just paste your code and get an instant review.',
        },
        {
          q: 'Which programming languages does the code reviewer support?',
          a: 'It supports 15+ languages including JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, Ruby, C#, Swift, Kotlin, SQL, Bash, and HTML/CSS.',
        },
        {
          q: 'How does this compare to paid tools like SonarQube or DeepCode?',
          a: 'SonarQube and DeepCode require setup, CI/CD integration, or paid plans starting at $150+/month. Our tool is free, requires zero configuration, and gives instant feedback — ideal for quick ad-hoc reviews, learning, or freelance projects.',
        },
        {
          q: 'What does the code review actually check?',
          a: 'The AI identifies bugs and issues by severity, gives a quality score out of 10, flags performance bottlenecks, and returns an improved version of your code — all in one pass.',
        },
        {
          q: 'Is my code stored or shared after I submit it?',
          a: 'No. Your code is sent to the AI model for processing and is not stored, logged, or used for training. Avoid pasting production secrets or API keys as a general best practice.',
        },
        {
          q: 'Can I use this to review code before a pull request or job interview?',
          a: 'Absolutely. It is great for cleaning up code before a PR review, preparing for technical interviews, or getting a second opinion on a snippet without waiting for a colleague.',
        },
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
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
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
            <h2 className="font-semibold text-stone-900">Review Results</h2>
            {grade && (
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl font-black border ${gradeStyle(grade)}`}>
                {grade}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-stone-200 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm rounded-t-lg transition-colors -mb-px ${
                  activeTab === tab.key
                    ? 'bg-white text-stone-900 border border-b-white border-stone-300'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${tab.count > 0 ? 'bg-red-500/20 text-red-600' : 'bg-stone-200 text-stone-500'}`}>
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
                <p className="text-emerald-700 text-sm p-4 bg-emerald-50/80 rounded-xl border border-emerald-500/20">
                  No issues found — your code looks clean!
                </p>
              ) : (
                <div className="space-y-2">
                  {issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl text-sm">
                      <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold border ${severityStyle(issue.severity)}`}>
                        {issue.severity || 'info'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800">{issue.message}</p>
                        {issue.line && <p className="text-stone-500 text-xs mt-0.5">Line {issue.line}</p>}
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
                      <span className="text-stone-700">Quality Score</span>
                      <span className="text-stone-900 font-bold">{quality.score}/10</span>
                    </div>
                    <div className="h-3 bg-stone-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${quality.score >= 8 ? 'bg-emerald-500' : quality.score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${(quality.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-stone-700 text-sm">{quality.summary}</p>
                  {quality.points && quality.points.length > 0 && (
                    <ul className="space-y-1.5">
                      {quality.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-500">
                          <span className="text-violet-600 shrink-0 mt-0.5">•</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-stone-500 text-sm">No quality data returned.</p>
              )
            )}

            {activeTab === 'performance' && (
              performance.length === 0 ? (
                <p className="text-emerald-700 text-sm p-4 bg-emerald-50/80 rounded-xl border border-emerald-500/20">
                  No performance issues found.
                </p>
              ) : (
                <ul className="space-y-2">
                  {performance.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl text-sm">
                      <span className="text-amber-700 shrink-0 mt-0.5">⚡</span>
                      <span className="text-stone-700">{tip}</span>
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
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={improvedCode}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-4 text-emerald-300 text-xs font-mono resize-y min-h-[300px] focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-stone-500 text-sm">No improved code returned.</p>
              )
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
