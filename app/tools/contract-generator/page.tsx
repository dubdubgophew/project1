'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Scroll, Download, Eye, Pencil } from 'lucide-react';

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
  { name: 'Email Writer',   href: '/tools/email-writer',   icon: '📧' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Bio Writer',     href: '/tools/bio-writer',     icon: '🪪' },
];

// ─── CONTRACT PDF TEMPLATE ───────────────────────────────────────────────────

function escH(s: string) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildContractHTML(rawText: string, contractType: string, party1: string, party2: string): string {
  const lines = rawText.split('\n');
  const nonEmpty = lines.filter(l => l.trim());

  let title = contractType || 'CONTRACT';
  let startIdx = 0;
  if (nonEmpty[0] && !/^\d+\./.test(nonEmpty[0])) {
    title = nonEmpty[0];
    startIdx = 1;
  }

  interface Clause { title: string; paras: string[] }
  const clauses: Clause[] = [];
  let openingParas: string[] = [];
  let cur: Clause | null = null;
  let inOpening = true;

  for (let i = startIdx; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;

    const numMatch = t.match(/^(\d+[\.\d]*\.?)\s+(.+)$/);
    const allCapsHdr = /^[A-Z][A-Z\s&\/\-:]{3,}$/.test(t) && t.length > 4 && i > startIdx;

    if (numMatch || allCapsHdr) {
      inOpening = false;
      if (cur) clauses.push(cur);
      cur = { title: numMatch ? `${numMatch[1]} ${numMatch[2]}` : t, paras: [] };
    } else if (inOpening) {
      openingParas.push(t);
    } else if (cur) {
      cur.paras.push(t);
    }
  }
  if (cur) clauses.push(cur);

  const renderPara = (t: string) => {
    if (/^[•\-\*]/.test(t)) return `<div class="list-item">${escH(t.replace(/^[•\-\*]\s*/,''))}</div>`;
    return `<p>${escH(t)}</p>`;
  };

  const openingHTML = openingParas.map(renderPara).join('');
  const clausesHTML = clauses.map(c => `
    <div class="clause">
      <div class="clause-title">${escH(c.title)}</div>
      <div class="clause-body">${c.paras.map(renderPara).join('')}</div>
    </div>`).join('');

  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escH(contractType||'Contract')}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Times New Roman',Georgia,serif;font-size:12pt;line-height:1.75;color:#000;background:#fff}
.page{max-width:8.5in;margin:0 auto;padding:1in}
.contract-title{text-align:center;font-size:16pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.contract-date{text-align:center;font-size:11pt;color:#555;margin-bottom:4px}
.parties{text-align:center;font-size:11pt;color:#333;margin-bottom:20px}
.divider{border:none;border-top:2px solid #000;margin:0 0 28px}
.opening p{margin-bottom:10px;text-align:justify}
.opening{margin-bottom:24px}
.clause{margin-bottom:20px}
.clause-title{font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-size:12pt}
.clause-body p{margin-bottom:8px;text-align:justify}
.clause-body .list-item{padding-left:24px;position:relative;margin-bottom:4px}
.clause-body .list-item::before{content:"•";position:absolute;left:8px}
.sig-section{margin-top:56px;border-top:1px solid #999;padding-top:28px}
.sig-title{text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:28px;font-size:12pt}
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
.sig-block .party-label{font-weight:700;margin-bottom:48px;font-size:12pt}
.sig-line{border-top:1px solid #000;margin-bottom:4px}
.sig-caption{font-size:10pt;color:#555}
.sig-date{margin-top:20px}
@media print{.page{padding:.75in}}
</style>
</head>
<body>
<div class="page">
  <div class="contract-title">${escH(title)}</div>
  <div class="contract-date">Dated: ${today}</div>
  ${(party1||party2)?`<div class="parties">Between <strong>${escH(party1||'Party 1')}</strong> and <strong>${escH(party2||'Party 2')}</strong></div>`:''}
  <hr class="divider">
  ${openingHTML?`<div class="opening">${openingHTML}</div>`:''}
  ${clausesHTML}
  <div class="sig-section">
    <div class="sig-title">IN WITNESS WHEREOF, the parties have executed this Agreement.</div>
    <div class="sig-grid">
      <div class="sig-block">
        <div class="party-label">${escH(party1||'Party 1')}</div>
        <div class="sig-line"></div><div class="sig-caption">Signature</div>
        <div class="sig-date"><div class="sig-line"></div><div class="sig-caption">Date</div></div>
        <div class="sig-date"><div class="sig-line"></div><div class="sig-caption">Printed Name &amp; Title</div></div>
      </div>
      <div class="sig-block">
        <div class="party-label">${escH(party2||'Party 2')}</div>
        <div class="sig-line"></div><div class="sig-caption">Signature</div>
        <div class="sig-date"><div class="sig-line"></div><div class="sig-caption">Date</div></div>
        <div class="sig-date"><div class="sig-line"></div><div class="sig-caption">Printed Name &amp; Title</div></div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ContractGeneratorPage() {
  const [contractType,    setContractType]    = useState('');
  const [party1,          setParty1]          = useState('');
  const [party2,          setParty2]          = useState('');
  const [scope,           setScope]           = useState('');
  const [payment,         setPayment]         = useState('');
  const [duration,        setDuration]        = useState('');
  const [jurisdiction,    setJurisdiction]    = useState('India (General)');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [output,          setOutput]          = useState('');
  const [editableOutput,  setEditableOutput]  = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [copied,          setCopied]          = useState(false);
  const [viewMode,        setViewMode]        = useState<'edit' | 'preview'>('edit');

  const currentText = editableOutput || output;

  function handleDownloadPDF() {
    const html = buildContractHTML(currentText, contractType, party1, party2);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 350);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    setEditableOutput('');
    setViewMode('edit');
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
            <select value={contractType} onChange={e => setContractType(e.target.value)} className="input" required>
              <option value="">Select type…</option>
              {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Jurisdiction</label>
            <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} className="input">
              {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Party 1 (Your Name / Company)</label>
            <input type="text" value={party1} onChange={e => setParty1(e.target.value)} placeholder="Acme Design Studio" className="input" required />
          </div>
          <div>
            <label className="label">Party 2 (Client / Other Party)</label>
            <input type="text" value={party2} onChange={e => setParty2(e.target.value)} placeholder="XYZ Corporation" className="input" required />
          </div>
        </div>

        <div>
          <label className="label">Scope of Work / Purpose</label>
          <textarea value={scope} onChange={e => setScope(e.target.value)}
            placeholder="Describe the services, deliverables, or confidential information covered by this contract…"
            className="textarea min-h-[100px]" required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Payment Terms</label>
            <input type="text" value={payment} onChange={e => setPayment(e.target.value)} placeholder="e.g., $2,000 total, 50% upfront, 50% on delivery" className="input" />
          </div>
          <div>
            <label className="label">Contract Duration</label>
            <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 3 months, 1 year, project-based" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Additional Terms (optional)</label>
          <textarea value={additionalTerms} onChange={e => setAdditionalTerms(e.target.value)}
            placeholder="Any special clauses, limitations, IP ownership terms, non-compete clauses…"
            className="textarea min-h-[80px]" />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <button type="submit" disabled={!contractType || !party1 || !party2 || !scope || loading} className="btn-primary w-full justify-center py-3.5">
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating contract…</>
            : <><Scroll className="w-5 h-5" /> Generate Contract</>}
        </button>
      </form>

      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-white">Your Contract</h2>
            <div className="flex gap-2 flex-wrap">
              <div className="flex rounded-lg border border-gray-700 overflow-hidden text-sm">
                <button onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode==='edit' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode==='preview' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
              <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={() => { navigator.clipboard.writeText(currentText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <>
              <p className="text-xs text-gray-500 mb-3">Edit the contract text below, then switch to Preview to see the formatted legal document with signature blocks.</p>
              <textarea
                value={currentText}
                onChange={e => setEditableOutput(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-300 text-xs leading-relaxed font-mono resize-y min-h-[500px] focus:outline-none focus:border-violet-500"
              />
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">Formatted legal document with signature blocks — click Download PDF to export.</p>
              <iframe
                srcDoc={buildContractHTML(currentText, contractType, party1, party2)}
                className="w-full rounded-xl border border-gray-700 bg-white"
                style={{ height: '960px' }}
                title="Contract Preview"
                sandbox="allow-same-origin"
              />
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
