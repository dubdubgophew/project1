'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, FileText, Download, Eye, Pencil } from 'lucide-react';


const TONES = ['Professional', 'Enthusiastic', 'Concise'];

function escH(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function buildLetterHTML(text: string, yourName: string, jobTitle: string, companyName: string): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim());
  const bodyHTML = paragraphs.map(p => `<p>${escH(p.trim())}</p>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cover Letter — ${escH(yourName)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.8;color:#111;background:#fff}
.page{max-width:8.5in;margin:0 auto;padding:1in}
.date{text-align:right;margin-bottom:36px;color:#555;font-size:11pt}
.recipient{margin-bottom:28px}
.recipient strong{display:block;font-size:13pt;margin-bottom:4px}
.body p{margin-bottom:14px;text-align:justify}
.sign-off{margin-top:32px}
.sign-off p{margin-bottom:8px}
.sig-name{font-size:13pt;font-weight:bold;margin-top:40px;border-top:1px solid #999;padding-top:8px;display:inline-block;min-width:200px}
@media print{.page{padding:.75in}}
</style>
</head>
<body>
<div class="page">
  <div class="date">${today}</div>
  <div class="recipient">
    <strong>Hiring Manager</strong>
    ${escH(companyName)}
  </div>
  <div class="body">
    <p>Re: Application for <strong>${escH(jobTitle)}</strong></p>
    <br>
    ${bodyHTML}
  </div>
  <div class="sign-off">
    <p>Sincerely,</p>
    <div class="sig-name">${escH(yourName)}</div>
  </div>
</div>
</body>
</html>`;
}

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [yourName, setYourName] = useState('');
  const [background, setBackground] = useState('');
  const [skills, setSkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState('');
  const [editableOutput, setEditableOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const currentText = editableOutput || output;

  function handleDownloadPDF() {
    const html = buildLetterHTML(currentText, yourName, jobTitle, companyName);
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
      const res = await fetch('/api/tools/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company: companyName, yourName, yourBackground: background, keySkills: skills, jobDescription, tone }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else {
        const text = data.letter ?? data.cover_letter ?? data.text ?? JSON.stringify(data);
        setOutput(text);
        setEditableOutput(text);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = jobTitle && companyName && yourName && background && skills;

  return (
    <ToolLayout
        toolSlug="cover-letter"
      title="AI Cover Letter Generator"
      description="Generate a tailored, professional cover letter in seconds. Customize tone, highlight your skills, and download as PDF."
      icon="📝"
      relatedTools={[
        { name: 'Resume Builder', href: '/tools/resume-builder', icon: '📋' },
        { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
        { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
      ]}
      faqs={[
        {
          q: 'Is the AI Cover Letter Generator free?',
          a: 'Yes, completely free. No account, subscription, or credit card required. Generate as many cover letters as you need.',
        },
        {
          q: 'How does this compare to Kickresume or Zety cover letter builders?',
          a: 'Kickresume and Zety charge $6–$19/month and lock PDF downloads behind a paywall. Our tool is free, generates a tailored letter in seconds, and lets you download a print-ready PDF at no cost.',
        },
        {
          q: 'Can I customize the tone of my cover letter?',
          a: 'Yes. You can choose from Professional, Enthusiastic, or Concise tones to match the company culture and role you are applying for.',
        },
        {
          q: 'Will the cover letter be tailored to the specific job?',
          a: 'Yes. Paste the job description into the optional field and the AI will align your letter to the exact requirements, keywords, and responsibilities listed in the posting.',
        },
        {
          q: 'Can I edit the cover letter after it is generated?',
          a: 'Absolutely. The output is fully editable directly in the browser. Tweak any sentence, then switch to Preview mode to see the formatted letter before downloading as a PDF.',
        },
        {
          q: 'Does it save my personal information?',
          a: 'No personal data is stored. The information you enter is used only to generate your letter and is not retained on our servers after the request completes.',
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Job Title <span className="text-red-600">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Senior Frontend Engineer"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Company Name <span className="text-red-600">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Your Name <span className="text-red-600">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Jane Smith"
              value={yourName}
              onChange={e => setYourName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Tone</label>
            <select className="input" value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Your Role / Background <span className="text-red-600">*</span></label>
          <input
            type="text"
            className="input"
            placeholder="e.g. 5 years of React/TypeScript, ex-Google engineer"
            value={background}
            onChange={e => setBackground(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Key Skills <span className="text-red-600">*</span></label>
          <textarea
            className="textarea min-h-[90px]"
            placeholder="e.g. React, TypeScript, Node.js, CI/CD, Team Leadership, Communication…"
            value={skills}
            onChange={e => setSkills(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Job Description (optional)</label>
          <textarea
            className="textarea min-h-[100px]"
            placeholder="Paste the job description here to personalize the letter further…"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="btn-primary w-full justify-center py-3.5"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating cover letter…</>
            : <><FileText className="w-5 h-5" /> Generate Cover Letter</>}
        </button>
      </form>

      {output && (
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-stone-900">Your Cover Letter</h2>
            <div className="flex gap-2 flex-wrap">
              <div className="flex rounded-lg border border-stone-200 overflow-hidden text-sm">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'edit' ? 'bg-violet-600 text-white' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'preview' ? 'bg-violet-600 text-white' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(currentText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <>
              <p className="text-xs text-stone-500 mb-3">
                Edit the cover letter below, then switch to Preview to see the formatted letter ready for download.
              </p>
              <textarea
                value={currentText}
                onChange={e => setEditableOutput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-700 text-sm leading-relaxed resize-y min-h-[420px] focus:outline-none focus:border-violet-500"
              />
            </>
          ) : (
            <>
              <p className="text-xs text-stone-500 mb-3">
                Formatted letter with letterhead — click Download PDF to export.
              </p>
              <iframe
                srcDoc={buildLetterHTML(currentText, yourName, jobTitle, companyName)}
                className="w-full rounded-xl border border-stone-200 bg-white"
                style={{ height: '780px' }}
                title="Cover Letter Preview"
                sandbox="allow-same-origin"
              />
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
