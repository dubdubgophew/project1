'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, FileText, Plus, X, Download, BarChart2 } from 'lucide-react';

const RELATED = [
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
];

export default function ResumeBuilderPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState([
    { company: '', role: '', duration: '', bullets: '' },
  ]);
  const [education, setEducation] = useState([
    { institution: '', degree: '', year: '' },
  ]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editableOutput, setEditableOutput] = useState('');

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

  function handleDownloadPDF() {
    const content = editableOutput || output;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Resume - ${name}</title>
      <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 40px;font-size:13px;line-height:1.6;color:#111}pre{white-space:pre-wrap;font-family:inherit;margin:0}@media print{body{margin:0}}</style>
      </head><body><pre>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');

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

  function addExperience() {
    setExperience([...experience, { company: '', role: '', duration: '', bullets: '' }]);
  }
  function removeExperience(i: number) {
    setExperience(experience.filter((_, idx) => idx !== i));
  }

  return (
    <ToolLayout
      title="AI Resume Builder"
      description="Build a professional, ATS-optimized resume in minutes. Fill in your details and let AI craft compelling bullet points and a strong summary."
      icon="📋"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" className="input" required />
            </div>
            <div>
              <label className="label">Target Job Title</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" className="input" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className="input" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Professional Summary</h2>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Briefly describe your background and career goals. AI will enhance this into a compelling summary…"
            className="textarea min-h-[100px]"
          />
        </div>

        {/* Skills */}
        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Skills</h2>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="List your skills separated by commas: React, TypeScript, Node.js, Python, SQL, AWS, Leadership, Agile…"
            className="textarea min-h-[80px]"
            required
          />
        </div>

        {/* Experience */}
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
                  <div>
                    <label className="label text-xs">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => setExperience(experience.map((x, idx) => idx === i ? { ...x, company: e.target.value } : x))}
                      placeholder="Google, Amazon, Freelance…"
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Role / Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => setExperience(experience.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x))}
                      placeholder="Software Engineer"
                      className="input text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label text-xs">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => setExperience(experience.map((x, idx) => idx === i ? { ...x, duration: e.target.value } : x))}
                      placeholder="Jan 2022 — Present"
                      className="input text-sm"
                    />
                  </div>
                </div>
                <label className="label text-xs">Key Achievements / Responsibilities</label>
                <textarea
                  value={exp.bullets}
                  onChange={(e) => setExperience(experience.map((x, idx) => idx === i ? { ...x, bullets: e.target.value } : x))}
                  placeholder="Describe what you did and achieved. AI will turn this into strong bullet points with metrics…"
                  className="textarea min-h-[80px] text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="card">
          <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Education</h2>
          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => setEducation(education.map((x, idx) => idx === i ? { ...x, institution: e.target.value } : x))}
                  placeholder="MIT / Harvard…"
                  className="input text-sm"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => setEducation(education.map((x, idx) => idx === i ? { ...x, degree: e.target.value } : x))}
                  placeholder="B.S. Computer Science"
                  className="input text-sm"
                />
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => setEducation(education.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))}
                  placeholder="2020"
                  className="input text-sm"
                />
              </div>
            ))}
            <button type="button" onClick={() => setEducation([...education, { institution: '', degree: '', year: '' }])} className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add education
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={!name || !jobTitle || !skills || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Building your resume…</>
          ) : (
            <><FileText className="w-5 h-5" /> Generate ATS Resume</>
          )}
        </button>
      </form>

      {output && (() => {
        const ats = calcAtsScore(editableOutput || output, jobTitle);
        const scoreColor = ats.score >= 80 ? 'text-emerald-400' : ats.score >= 60 ? 'text-amber-400' : 'text-red-400';
        const barColor = ats.score >= 80 ? 'bg-emerald-500' : ats.score >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <>
            {/* ATS Score */}
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

            {/* Editable resume + download */}
            <div className="card">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-semibold text-white">Your Resume</h2>
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
          </>
        );
      })()}
    </ToolLayout>
  );
}
