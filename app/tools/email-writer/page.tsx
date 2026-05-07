'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Mail } from 'lucide-react';

const TONES = ['Professional', 'Formal', 'Casual', 'Persuasive', 'Apologetic', 'Friendly'];
const PURPOSES = [
  'Job Application', 'Follow-up', 'Meeting Request', 'Customer Support',
  'Sales Pitch', 'Thank You', 'Complaint', 'Proposal', 'Introduction', 'Collaboration',
];

const RELATED = [
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
];

export default function EmailWriterPage() {
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Professional');
  const [keyPoints, setKeyPoints] = useState('');
  const [senderName, setSenderName] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/tools/email-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, recipient, tone, keyPoints, senderName }),
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

  return (
    <ToolLayout
      title="AI Email Writer"
      description="Generate professional, ready-to-send emails in seconds. Choose your tone, describe your purpose, and let AI craft the perfect email."
      icon="📧"
      badge="Popular"
      relatedTools={RELATED}
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
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  tone === t
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Key Points to Include</label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder="What are the main points? e.g., Apply for Senior Developer position, 5 years React experience, available for interview next week"
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
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
            <h2 className="font-semibold text-white">Your Email</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-800/50 rounded-xl p-4">
            {output}
          </div>
        </div>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">AI Email Writer — Free Online</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Write professional emails in seconds without staring at a blank screen. Our AI generates
          contextually appropriate, tone-matched emails for any situation — job applications, sales,
          customer support, and more. Each email is unique, human-sounding, and ready to send with
          minor personalization.
        </p>
      </div>
    </ToolLayout>
  );
}
