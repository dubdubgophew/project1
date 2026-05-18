'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Scroll, Download } from 'lucide-react';

const CONTRACT_TYPES = [
  'Freelance Services Agreement',
  'Non-Disclosure Agreement (NDA)',
  'Software Development Contract',
  'Consulting Agreement',
  'Employment Offer Letter',
  'Website Design Contract',
  'Content Creation Agreement',
  'Social Media Management Contract',
  'Partnership Agreement',
  'Photography Contract',
];

const JURISDICTIONS = [
  'India (General)', 'United States (General)', 'United Kingdom',
  'European Union', 'Canada', 'Australia',
];

const RELATED = [
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
];

export default function ContractGeneratorPage() {
  const [contractType, setContractType] = useState('');
  const [party1, setParty1] = useState('');
  const [party2, setParty2] = useState('');
  const [scope, setScope] = useState('');
  const [payment, setPayment] = useState('');
  const [duration, setDuration] = useState('');
  const [jurisdiction, setJurisdiction] = useState('India (General)');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [output, setOutput] = useState('');
  const [editableOutput, setEditableOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleDownloadPDF() {
    const content = editableOutput || output;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${contractType || 'Contract'}</title>
      <style>body{font-family:Georgia,serif;max-width:820px;margin:40px auto;padding:0 40px;font-size:13px;line-height:1.7;color:#111}pre{white-space:pre-wrap;font-family:inherit;margin:0}@media print{body{margin:0}}</style>
      </head><body><pre>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  }
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/tools/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractType, party1, party2, scope, payment, duration, jurisdiction, additionalTerms }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else { setOutput(data.contract); setEditableOutput(data.contract); }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="AI Contract Generator"
      description="Generate professional legal contracts in minutes — freelance agreements, NDAs, consulting contracts & more. Saves thousands in legal fees."
      icon="📜"
      relatedTools={RELATED}
    >
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300 mb-6">
        ⚠️ <strong>Disclaimer:</strong> AI-generated contracts are a starting point. For binding legal agreements,
        please review with a qualified lawyer. This tool reduces drafting time, not legal review.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Contract Type</label>
            <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="input" required>
              <option value="">Select type…</option>
              {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Jurisdiction</label>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="input">
              {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Party 1 (Your Name / Company)</label>
            <input type="text" value={party1} onChange={(e) => setParty1(e.target.value)} placeholder="Acme Design Studio" className="input" required />
          </div>
          <div>
            <label className="label">Party 2 (Client / Other Party)</label>
            <input type="text" value={party2} onChange={(e) => setParty2(e.target.value)} placeholder="XYZ Corporation" className="input" required />
          </div>
        </div>

        <div>
          <label className="label">Scope of Work / Purpose</label>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Describe the services, deliverables, or confidential information covered by this contract…"
            className="textarea min-h-[100px]"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Payment Terms</label>
            <input type="text" value={payment} onChange={(e) => setPayment(e.target.value)} placeholder="e.g., $2,000 total, 50% upfront, 50% on delivery" className="input" />
          </div>
          <div>
            <label className="label">Contract Duration</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 3 months, 1 year, project-based" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Additional Terms (optional)</label>
          <textarea
            value={additionalTerms}
            onChange={(e) => setAdditionalTerms(e.target.value)}
            placeholder="Any special clauses, limitations, IP ownership terms, non-compete clauses…"
            className="textarea min-h-[80px]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={!contractType || !party1 || !party2 || !scope || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating contract…</>
          ) : (
            <><Scroll className="w-5 h-5" /> Generate Contract</>
          )}
        </button>
      </form>

      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-white">Your Contract</h2>
            <div className="flex gap-2">
              <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={() => { navigator.clipboard.writeText(editableOutput || output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">Edit directly below, then download as PDF.</p>
          <textarea
            value={editableOutput || output}
            onChange={e => setEditableOutput(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-300 text-xs leading-relaxed font-mono resize-y min-h-[500px] focus:outline-none focus:border-violet-500"
          />
        </div>
      )}
    </ToolLayout>
  );
}
