'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Mail, RefreshCw } from 'lucide-react';

const TONES = ['Professional', 'Formal', 'Casual', 'Persuasive', 'Apologetic', 'Friendly', 'Concise', 'Urgent'];
const PURPOSES = [
  'Job Application', 'Follow-up', 'Meeting Request', 'Customer Support',
  'Sales Pitch', 'Thank You', 'Complaint', 'Proposal', 'Introduction', 'Collaboration', 'Reply', 'Resignation',
];
const LENGTHS = [
  { id: 'concise', label: 'Short', desc: '3-4 sentences' },
  { id: 'standard', label: 'Standard', desc: '2-3 paragraphs' },
  { id: 'detailed', label: 'Detailed', desc: '4-5 paragraphs' },
] as const;

const RELATED = [
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
];

export default function EmailWriterPage() {
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState<'concise' | 'standard' | 'detailed'>('standard');
  const [keyPoints, setKeyPoints] = useState('');
  const [senderName, setSenderName] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/tools/email-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, recipient, tone, keyPoints, senderName, length }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setOutput(data.email);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await generate();
  }

  return (
    <ToolLayout
        toolSlug="email-writer"
      title="AI Email Writer"
      description="Generate professional, ready-to-send emails in seconds. Choose your tone, length, and purpose — AI crafts the perfect email with no clichés."
      icon="📧"
      badge="Popular"
      relatedTools={RELATED}
      faqs={[
        { q: 'Is the AI email writer free?', a: 'Yes. Formly\'s AI email writer is completely free with no word limits and no account required. Generate professional emails instantly without signup.' },
        { q: 'What types of emails can it write?', a: 'The AI generates business emails, follow-up emails, cold outreach, apology emails, resignation letters, complaint emails, thank-you notes, sales pitches, meeting requests, replies, and more — just describe your purpose.' },
        { q: 'Can I choose the tone and length?', a: 'Yes. Choose from 8 tones (Professional, Formal, Casual, Persuasive, Apologetic, Friendly, Concise, Urgent) and 3 lengths (Short, Standard, Detailed). The AI adjusts vocabulary, structure, and formality to match.' },
        { q: 'How do I write a professional follow-up email?', a: 'Select "Follow-up" purpose, describe what you\'re following up on, choose your tone, and the AI generates a polite follow-up email. Use the Retry button to get a fresh version with different wording.' },
        { q: 'Can it write cold outreach emails for sales?', a: 'Yes — describe your product/service and target audience, select Persuasive tone, and the AI creates a cold outreach email with a clear value proposition and call to action.' },
        { q: 'Are the emails plagiarism-free and unique?', a: 'Yes. Every email is generated fresh from your specific inputs. No templates are reused — each output is unique to your context and preferences.' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input"
              required
            >
              <option value="">Select purpose…</option>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Recipient</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g., Hiring Manager, John Smith, Customer"
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  tone === t
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Length</label>
          <div className="flex gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLength(l.id)}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  length === l.id
                    ? 'bg-violet-100 border-violet-400 text-violet-700'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                <div className="text-sm font-medium">{l.label}</div>
                <div className="text-xs text-stone-500">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Key Points to Include</label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder="What are the main points? e.g., Applying for Senior Developer role, 5 years React experience, available to start immediately"
            className="textarea min-h-[120px]"
            required
          />
        </div>

        <div>
          <label className="label">Your Name (optional)</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name for the sign-off"
            className="input"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={!purpose || !recipient || !keyPoints || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Writing your email…</>
          ) : (
            <><Mail className="w-5 h-5" /> Generate Email</>
          )}
        </button>
      </form>

      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">Your Email</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                title="Generate a different version"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-stone-50 rounded-xl p-4">
            {output}
          </div>
        </div>
      )}

      <div className="card bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">AI Email Writer — Free Online</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Write professional emails in seconds without staring at a blank screen. Our AI generates
          contextually appropriate, tone-matched emails for any situation — job applications, sales,
          customer support, and more. Each email is unique, human-sounding, and ready to send.
          Use Retry to get a fresh version with different wording.
        </p>
      </div>
    </ToolLayout>
  );
}
