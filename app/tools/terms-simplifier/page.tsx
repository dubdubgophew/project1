'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Loader2, AlertCircle, Scale } from 'lucide-react';


interface TermsResult {
  tldr?: string[];
  can_do?: string[];
  you_can?: string[];
  red_flags?: string[];
  data_collected?: string[];
  your_rights?: string[];
  privacy_score?: number;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score * 10));
  const color = score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-500' : 'bg-red-500';
  const label = score >= 7 ? 'Good' : score >= 4 ? 'Fair' : 'Poor';
  const textColor = score >= 7 ? 'text-emerald-700' : score >= 4 ? 'text-amber-700' : 'text-red-600';
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-stone-700">Privacy Score</span>
        <span className={`font-bold ${textColor}`}>{score}/10 — {label}</span>
      </div>
      <div className="h-3 bg-stone-50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  colorClass,
  icon,
}: {
  title: string;
  items: string[];
  colorClass: string;
  icon: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`p-4 rounded-xl border ${colorClass} space-y-2`}>
      <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
            <span className="shrink-0 mt-0.5 text-stone-500">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TermsSimplifierPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<TermsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/tools/terms-simplifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
      } else {
        let parsed = data;
        if (typeof data === 'string') {
          try { parsed = JSON.parse(data); } catch { parsed = { tldr: [data] }; }
        }
        if (parsed.result) parsed = { ...parsed, ...parsed.result };
        setResult(parsed);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
        toolSlug="terms-simplifier"
      title="Terms Simplifier"
      description="Paste any Terms of Service or Privacy Policy and get a plain-English summary — red flags, what they can do, your rights, and a privacy score."
      icon="⚖️"
      relatedTools={[
        { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
        { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
        { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
      ]}
      faqs={[
        {
          q: 'Is the Terms Simplifier free to use?',
          a: 'Yes, completely free with no sign-up required. Paste any Terms of Service or Privacy Policy and get a plain-English breakdown instantly.',
        },
        {
          q: 'What types of documents can I simplify?',
          a: 'It works with Terms of Service, Privacy Policies, EULAs (End User License Agreements), cookie policies, and similar legal documents. Paste up to several thousand words of text.',
        },
        {
          q: 'How does this compare to paid tools like Tosdr or legal review services?',
          a: 'ToS;DR is a volunteer-curated database limited to well-known services. Lawyers charge hundreds per hour. Our tool is free, instant, and works on any document — not just popular platforms.',
        },
        {
          q: 'What does the privacy score mean?',
          a: 'The privacy score (0–10) reflects how user-friendly the document is regarding data collection, user rights, and red-flag clauses. A score of 7+ is good; below 4 suggests aggressive data practices.',
        },
        {
          q: 'Can I use this for legal decisions?',
          a: 'The summaries are for informational purposes only and may miss nuances in complex legal language. Always consult a qualified attorney for decisions with significant legal or financial consequences.',
        },
        {
          q: 'Does the tool store the documents I paste?',
          a: 'No. Text you paste is processed in real time and not stored or logged on our servers. However, avoid pasting documents that contain confidential personal or business information.',
        },
      ]}
    >
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300 mb-5">
        ℹ️ <strong>Note:</strong> AI-generated summaries are for informational purposes only and may miss nuances.
        Always read the full document for legal decisions.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Paste Terms of Service / Privacy Policy</label>
          <textarea
            className="textarea min-h-[280px] text-sm"
            placeholder="Paste the full Terms of Service, Privacy Policy, or EULA text here…"
            value={text}
            onChange={e => setText(e.target.value)}
            required
          />
          <p className="text-xs text-stone-600 mt-1.5">
            {text.trim().split(/\s+/).filter(Boolean).length} words pasted
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="btn-primary w-full justify-center py-3.5"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Simplifying…</>
            : <><Scale className="w-5 h-5" /> Simplify This Document</>}
        </button>
      </form>

      {result && (
        <div className="space-y-4 mt-6">
          {/* TL;DR */}
          {result.tldr && result.tldr.length > 0 && (
            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-2">
              <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                <span>⚡</span> TL;DR Summary
              </h3>
              <ul className="space-y-1.5">
                {result.tldr.map((item, i) => (
                  <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-violet-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Privacy score */}
          {result.privacy_score !== undefined && (
            <div className="card">
              <ScoreBar score={result.privacy_score} />
            </div>
          )}

          {/* Sections */}
          <Section
            title="What They Can Do"
            items={result.can_do ?? []}
            colorClass="border-amber-500/20 bg-amber-500/5"
            icon="🏢"
          />
          <Section
            title="Your Rights"
            items={result.your_rights ?? result.you_can ?? []}
            colorClass="border-emerald-500/20 bg-emerald-50/80"
            icon="✅"
          />
          <Section
            title="Data Collected"
            items={result.data_collected ?? []}
            colorClass="border-blue-500/20 bg-blue-500/5"
            icon="📊"
          />
          <Section
            title="Red Flags"
            items={result.red_flags ?? []}
            colorClass="border-red-500/20 bg-red-500/5"
            icon="⚠️"
          />
        </div>
      )}
    </ToolLayout>
  );
}
