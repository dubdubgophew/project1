'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, FileText, Plus, X, Download, BarChart2, Eye, Pencil } from 'lucide-react';

const RELATED = [
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'Email Writer',    href: '/tools/email-writer',    icon: '📧' },
  { name: 'Bio Writer',      href: '/tools/bio-writer',      icon: '🪪' },
];

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   headerBg: '#1a2332', accent: '#1a5276' },
  { id: 'modern',    name: 'Modern',    headerBg: '#7c3aed', accent: '#6d28d9' },
  { id: 'executive', name: 'Executive', headerBg: '#111827', accent: '#b45309' },
  { id: 'minimal',   name: 'Minimal',   headerBg: '#f3f4f6', accent: '#374151' },
  { id: 'corporate', name: 'Corporate', headerBg: '#14532d', accent: '#166534' },
];

const TEMPLATE_CSS: Record<string, string> = {
  classic: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.55;color:#111;background:#fff}
.page{max-width:8.5in;margin:0 auto;padding:.75in}
.resume-header{border-bottom:3px solid #4f46e5;padding-bottom:16px;margin-bottom:22px}
.resume-name{font-size:26pt;font-weight:700;color:#1e1b4b;letter-spacing:-.5px}
.resume-contact{font-size:10pt;color:#6b7280;margin-top:6px}
.section{margin-bottom:18px}
.section-title{font-size:9.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#4f46e5;border-bottom:1.5px solid #e0e7ff;padding-bottom:4px;margin-bottom:8px}
.entry-header{font-weight:700;font-size:11pt;color:#1f2937;margin-top:8px;margin-bottom:1px}
.bullet{padding-left:18px;position:relative;font-size:10.5pt;color:#374151;margin-bottom:2px}
.bullet::before{content:"•";position:absolute;left:3px;color:#4f46e5;font-weight:700}
.body-text{font-size:10.5pt;color:#374151;margin-bottom:4px;text-align:justify}
.skills-wrap{display:flex;flex-wrap:wrap;gap:6px}
.skill-tag{background:#ede9fe;color:#5b21b6;padding:3px 10px;border-radius:3px;font-size:10pt;font-weight:500}
.gap{height:6px}
@media print{.page{padding:.5in}}`,

  modern: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Segoe UI',Arial,sans-serif;font-size:11pt;line-height:1.6;color:#111;background:#fff}
.page{max-width:8.5in;margin:0 auto}
.resume-header{background:#1d4ed8;color:#fff;padding:32px 56px 24px;margin-bottom:28px}
.resume-name{font-size:28pt;font-weight:800;color:#fff;letter-spacing:-.5px}
.resume-contact{font-size:10pt;color:#bfdbfe;margin-top:8px}
.page-body{padding:0 56px 48px}
.section{margin-bottom:20px}
.section-title{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#1d4ed8;border-bottom:2px solid #bfdbfe;padding-bottom:4px;margin-bottom:10px}
.entry-header{font-weight:700;font-size:11pt;color:#111;margin-top:10px;margin-bottom:2px}
.bullet{padding-left:18px;position:relative;font-size:10.5pt;color:#374151;margin-bottom:2px}
.bullet::before{content:"▸";position:absolute;left:2px;color:#1d4ed8}
.body-text{font-size:10.5pt;color:#374151;margin-bottom:4px;text-align:justify}
.skills-wrap{display:flex;flex-wrap:wrap;gap:6px}
.skill-tag{background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:4px;font-size:10pt;font-weight:500}
.gap{height:6px}
@media print{.page{}.resume-header{padding:24px 48px 20px}.page-body{padding:0 48px 40px}}`,

  executive: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.6;color:#111;background:#fff}
.page{max-width:8.5in;margin:0 auto;padding:.75in}
.resume-header{margin-bottom:24px;padding-bottom:20px;border-bottom:3px double #111}
.resume-name{font-size:28pt;font-weight:700;color:#111;letter-spacing:.5px;text-transform:uppercase}
.resume-contact{font-size:10pt;color:#374151;margin-top:8px;letter-spacing:.3px}
.section{margin-bottom:20px}
.section-title{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#111;border-bottom:2px solid #111;padding-bottom:3px;margin-bottom:10px}
.entry-header{font-weight:700;font-size:11.5pt;color:#111;margin-top:10px;margin-bottom:2px;font-style:italic}
.bullet{padding-left:20px;position:relative;font-size:10.5pt;color:#374151;margin-bottom:3px}
.bullet::before{content:"–";position:absolute;left:4px;color:#111}
.body-text{font-size:10.5pt;color:#374151;margin-bottom:4px;text-align:justify}
.skills-wrap{display:flex;flex-wrap:wrap;gap:6px}
.skill-tag{background:#f9fafb;color:#111;padding:3px 10px;border:1px solid #d1d5db;font-size:10pt}
.gap{height:6px}
@media print{.page{padding:.5in}}`,

  minimal: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.5;color:#111;background:#fff}
.page{max-width:8.5in;margin:0 auto;padding:.75in}
.resume-header{margin-bottom:24px}
.resume-name{font-size:22pt;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:2px}
.resume-contact{font-size:10pt;color:#4b5563;margin-top:6px;border-top:1px solid #d1d5db;padding-top:6px}
.section{margin-bottom:16px}
.section-title{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:#111;padding-bottom:2px;margin-bottom:8px;border-bottom:1px solid #111}
.entry-header{font-weight:700;font-size:11pt;color:#111;margin-top:8px;margin-bottom:1px}
.bullet{padding-left:16px;position:relative;font-size:10.5pt;color:#374151;margin-bottom:2px}
.bullet::before{content:"·";position:absolute;left:4px;color:#111;font-size:14pt;line-height:1}
.body-text{font-size:10.5pt;color:#374151;margin-bottom:4px}
.skills-wrap{display:flex;flex-wrap:wrap;gap:4px}
.skill-tag{background:#fff;color:#111;padding:2px 8px;border:1px solid #111;font-size:9.5pt}
.gap{height:4px}
@media print{.page{padding:.5in}}`,

  corporate: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Calibri',Arial,sans-serif;font-size:11pt;line-height:1.55;color:#111;background:#fff}
.page{max-width:8.5in;margin:0 auto;padding:.75in}
.resume-header{border-left:5px solid #0f766e;padding:12px 0 12px 20px;margin-bottom:24px}
.resume-name{font-size:24pt;font-weight:700;color:#134e4a;letter-spacing:-.3px}
.resume-contact{font-size:10pt;color:#6b7280;margin-top:5px}
.section{margin-bottom:18px}
.section-title{font-size:9.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#0f766e;background:#f0fdfa;padding:4px 8px;margin-bottom:8px;border-left:3px solid #0f766e}
.entry-header{font-weight:700;font-size:11pt;color:#134e4a;margin-top:8px;margin-bottom:1px}
.bullet{padding-left:18px;position:relative;font-size:10.5pt;color:#374151;margin-bottom:2px}
.bullet::before{content:"•";position:absolute;left:3px;color:#0f766e;font-weight:700}
.body-text{font-size:10.5pt;color:#374151;margin-bottom:4px;text-align:justify}
.skills-wrap{display:flex;flex-wrap:wrap;gap:6px}
.skill-tag{background:#ccfbf1;color:#134e4a;padding:3px 10px;border-radius:3px;font-size:10pt;font-weight:500}
.gap{height:6px}
@media print{.page{padding:.5in}}`,
};

function TemplatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Template</h2>
      <div className="grid grid-cols-5 gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
              value === t.id
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="w-full rounded overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
              <div className="w-full h-3.5" style={{ background: t.headerBg }} />
              <div className="px-1 py-1 space-y-0.5">
                <div className="h-1 rounded" style={{ background: t.accent, width: '55%' }} />
                <div className="h-0.5 rounded bg-gray-200 w-full" />
                <div className="h-0.5 rounded bg-gray-200 w-4/5" />
                <div className="h-0.5 rounded bg-gray-200 w-3/5" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-300">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ATS SCORE ───────────────────────────────────────────────────────────────

function calcAtsScore(text: string, title: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;
  if (/([\w.]+@[\w.]+)|(\+?[\d\s\-()]{7,})/.test(text)) { score += 10; } else { feedback.push('Add contact info (email/phone)'); }
  if (/SUMMARY|OBJECTIVE/i.test(text)) { score += 15; } else { feedback.push('Add a Professional Summary section'); }
  if (/SKILLS/i.test(text)) { score += 10; } else { feedback.push('Add a Skills section'); }
  if (/EXPERIENCE|EMPLOYMENT/i.test(text)) { score += 10; } else { feedback.push('Add a Work Experience section'); }
  if (/EDUCATION/i.test(text)) { score += 10; } else { feedback.push('Add an Education section'); }
  const metrics = (text.match(/\d+%|\$[\d,]+|[\d,]+ (users|clients|projects|employees|revenue)/gi) ?? []).length;
  if (metrics >= 3) { score += 25; } else if (metrics >= 1) { score += 15; feedback.push('Add more measurable achievements (%, $, numbers)'); } else { feedback.push('Add metrics to achievements (increased revenue by 30%, managed 15 staff)'); }
  const bullets = (text.match(/^[•\-\*]/gm) ?? []).length;
  if (bullets >= 5) { score += 10; } else { feedback.push('Use bullet points for experience entries'); }
  const titleWords = title.toLowerCase().split(/\s+/);
  const matches = titleWords.filter(w => w.length > 3 && text.toLowerCase().includes(w)).length;
  if (matches >= 2) { score += 10; } else { feedback.push(`Include keywords from your target role: "${title}"`); }
  return { score: Math.min(100, score), feedback };
}

// ─── RESUME PDF TEMPLATE ─────────────────────────────────────────────────────

function escH(s: string) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildResumeHTML(rawText: string, template: string = 'classic'): string {
  const css = TEMPLATE_CSS[template] ?? TEMPLATE_CSS.classic;

  const lines = rawText.split('\n');
  const nonEmpty = lines.filter(l => l.trim());

  const nameLine = nonEmpty[0] || '';
  let contactLine = '';
  let bodyStartIdx = 1;
  if (nonEmpty.length > 1 && (nonEmpty[1].includes('@') || nonEmpty[1].includes('|') || /\+?[\d\s\-()]{7,}/.test(nonEmpty[1]))) {
    contactLine = nonEmpty[1];
    bodyStartIdx = 2;
  }

  interface Section { title: string; lines: string[] }
  const sections: Section[] = [];
  let cur: Section | null = null;
  let skipped = 0;

  for (const line of lines) {
    const t = line.trim();
    if (skipped < bodyStartIdx) {
      if (t === nameLine || t === contactLine || !t) { if (t) skipped++; continue; }
    }
    const isSectionHead = /^[A-Z][A-Z\s&\/\-]{2,}$/.test(t) && t.length > 3 && !t.includes('@') && !t.includes('|');
    if (isSectionHead) {
      if (cur) sections.push(cur);
      cur = { title: t, lines: [] };
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  if (cur) sections.push(cur);

  const renderSection = (s: Section): string => {
    const isSkills = /SKILL/i.test(s.title);
    if (isSkills) {
      const skills = s.lines.join('\n').replace(/^[•\-\*]\s*/gm, '').split(/[,\n]/).map(sk => sk.trim()).filter(Boolean);
      const tags = skills.map(sk => `<span class="skill-tag">${escH(sk)}</span>`).join('');
      return `<div class="section"><div class="section-title">${escH(s.title)}</div><div class="skills-wrap">${tags}</div></div>`;
    }
    let html = '';
    for (const line of s.lines) {
      const t = line.trim();
      if (!t) { html += '<div class="gap"></div>'; continue; }
      if (/^[•\-\*]/.test(t)) {
        html += `<div class="bullet">${escH(t.replace(/^[•\-\*]\s*/, ''))}</div>`;
      } else if (t.includes('|') || /\w.+(at|@)\s+\w/.test(t) || /\d{4}\s*[—\-–]\s*(\d{4}|[Pp]resent)/.test(t)) {
        html += `<div class="entry-header">${escH(t)}</div>`;
      } else {
        html += `<p class="body-text">${escH(t)}</p>`;
      }
    }
    return `<div class="section"><div class="section-title">${escH(s.title)}</div>${html}</div>`;
  };

  const sectionsHTML = sections.map(renderSection).join('');

  if (template === 'modern') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Resume — ${escH(nameLine)}</title>
<style>
${css}
</style>
</head>
<body>
<div class="page">
  <div class="resume-header">
    <div class="resume-name">${escH(nameLine)}</div>
    ${contactLine ? `<div class="resume-contact">${escH(contactLine)}</div>` : ''}
  </div>
  <div class="page-body">
    ${sectionsHTML}
  </div>
</div>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Resume — ${escH(nameLine)}</title>
<style>
${css}
</style>
</head>
<body>
<div class="page">
  <div class="resume-header">
    <div class="resume-name">${escH(nameLine)}</div>
    ${contactLine ? `<div class="resume-contact">${escH(contactLine)}</div>` : ''}
  </div>
  ${sectionsHTML}
</div>
</body>
</html>`;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ResumeBuilderPage() {
  const [template, setTemplate]   = useState('classic');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [location, setLocation]   = useState('');
  const [jobTitle, setJobTitle]   = useState('');
  const [summary, setSummary]     = useState('');
  const [skills, setSkills]       = useState('');
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', bullets: '' }]);
  const [education, setEducation]   = useState([{ institution: '', degree: '', year: '' }]);

  const [output, setOutput]                 = useState('');
  const [editableOutput, setEditableOutput] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [copied, setCopied]                 = useState(false);
  const [viewMode, setViewMode]             = useState<'edit' | 'preview'>('edit');

  const currentText = editableOutput || output;

  function handleDownloadPDF() {
    const html = buildResumeHTML(currentText, template);
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
      const res = await fetch('/api/tools/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, location, jobTitle, summary, skills, experience, education }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else { setOutput(data.resume); setEditableOutput(data.resume); }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function addExperience() { setExperience([...experience, { company: '', role: '', duration: '', bullets: '' }]); }
  function removeExperience(i: number) { setExperience(experience.filter((_, idx) => idx !== i)); }

  return (
    <ToolLayout
      title="AI Resume Builder"
      description="Build a professional, ATS-optimized resume in minutes. Fill in your details and let AI craft compelling bullet points and a strong summary."
      icon="📋"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        <TemplatePicker value={template} onChange={setTemplate} />

        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className="input" required /></div>
            <div><label className="label">Target Job Title</label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" className="input" required /></div>
            <div><label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="input" /></div>
            <div><label className="label">Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="input" /></div>
            <div className="sm:col-span-2"><label className="label">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA" className="input" /></div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Professional Summary</h2>
          <textarea value={summary} onChange={e => setSummary(e.target.value)}
            placeholder="Briefly describe your background and career goals. AI will enhance this into a compelling summary…"
            className="textarea min-h-[100px]" />
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Skills</h2>
          <textarea value={skills} onChange={e => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js, Python, SQL, AWS, Leadership, Agile…"
            className="textarea min-h-[80px]" required />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Work Experience</h2>
            <button type="button" onClick={addExperience} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 relative">
                {i > 0 && (
                  <button type="button" onClick={() => removeExperience(i)} className="absolute top-3 right-3 p-1 rounded text-gray-600 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div><label className="label text-xs">Company</label>
                    <input type="text" value={exp.company} onChange={e => setExperience(experience.map((x,idx) => idx===i ? {...x,company:e.target.value} : x))} placeholder="Google, Amazon, Freelance…" className="input text-sm" /></div>
                  <div><label className="label text-xs">Role / Title</label>
                    <input type="text" value={exp.role} onChange={e => setExperience(experience.map((x,idx) => idx===i ? {...x,role:e.target.value} : x))} placeholder="Software Engineer" className="input text-sm" /></div>
                  <div className="sm:col-span-2"><label className="label text-xs">Duration</label>
                    <input type="text" value={exp.duration} onChange={e => setExperience(experience.map((x,idx) => idx===i ? {...x,duration:e.target.value} : x))} placeholder="Jan 2022 — Present" className="input text-sm" /></div>
                </div>
                <label className="label text-xs">Key Achievements / Responsibilities</label>
                <textarea value={exp.bullets} onChange={e => setExperience(experience.map((x,idx) => idx===i ? {...x,bullets:e.target.value} : x))}
                  placeholder="Describe what you did and achieved. AI will turn this into strong bullet points with metrics…"
                  className="textarea min-h-[80px] text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Education</h2>
          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3">
                <input type="text" value={edu.institution} onChange={e => setEducation(education.map((x,idx) => idx===i ? {...x,institution:e.target.value} : x))} placeholder="MIT / Harvard…" className="input text-sm" />
                <input type="text" value={edu.degree} onChange={e => setEducation(education.map((x,idx) => idx===i ? {...x,degree:e.target.value} : x))} placeholder="B.S. Computer Science" className="input text-sm" />
                <input type="text" value={edu.year} onChange={e => setEducation(education.map((x,idx) => idx===i ? {...x,year:e.target.value} : x))} placeholder="2020" className="input text-sm" />
              </div>
            ))}
            <button type="button" onClick={() => setEducation([...education, { institution:'', degree:'', year:'' }])} className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add education
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <button type="submit" disabled={!name || !jobTitle || !skills || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Building your resume…</> : <><FileText className="w-5 h-5" /> Generate ATS Resume</>}
        </button>
      </form>

      {output && (() => {
        const ats = calcAtsScore(currentText, jobTitle);
        const scoreColor = ats.score >= 80 ? 'text-emerald-400' : ats.score >= 60 ? 'text-amber-400' : 'text-red-400';
        const barColor   = ats.score >= 80 ? 'bg-emerald-500' : ats.score >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <>
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <BarChart2 className="w-5 h-5 text-violet-400" />
                <h2 className="font-semibold text-white">ATS Score</h2>
                <span className={`text-2xl font-bold ${scoreColor}`}>{ats.score}/100</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full mb-3">
                <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${ats.score}%` }} />
              </div>
              {ats.feedback.length > 0 && (
                <ul className="text-xs text-gray-400 space-y-1">
                  {ats.feedback.map((f, i) => <li key={i} className="flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span>{f}</li>)}
                </ul>
              )}
              {ats.score >= 80 && <p className="text-xs text-emerald-400 mt-2">Excellent! This resume is well-optimised for ATS systems.</p>}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-semibold text-white">Your Resume</h2>
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
                  <p className="text-xs text-gray-500 mb-3">Edit the content below, then switch to Preview to see the formatted resume before downloading.</p>
                  <textarea
                    value={currentText}
                    onChange={e => setEditableOutput(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-300 text-xs leading-relaxed font-mono resize-y min-h-[500px] focus:outline-none focus:border-violet-500"
                  />
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">Formatted preview — click Download PDF to export this professional layout.</p>
                  <iframe
                    srcDoc={buildResumeHTML(currentText, template)}
                    className="w-full rounded-xl border border-gray-700 bg-white"
                    style={{ height: '800px' }}
                    title="Resume Preview"
                    sandbox="allow-same-origin"
                  />
                </>
              )}
            </div>
          </>
        );
      })()}
    </ToolLayout>
  );
}
