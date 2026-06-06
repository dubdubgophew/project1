'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd, InArticleAd } from '@/components/shared/AdSense';
import { Upload, FileText, Share2, Check, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Zap, Target, TrendingUp } from 'lucide-react';
import { ToolSEOContent } from '@/components/tools/ToolSEOContent';

// ── Types ────────────────────────────────────────────────────────────────────
interface SectionScore { score: number; feedback: string }
interface ATSResult {
  overall_score: number; grade: string; verdict: string;
  keywords_found: string[]; keywords_missing: string[];
  formatting_score: number; formatting_issues: string[];
  sections: Record<string, SectionScore>;
  top_suggestions: string[]; quick_wins: string[];
  power_words_missing: string[]; quantification_score: number;
  match_summary: string;
}

// ── Score Circle ─────────────────────────────────────────────────────────────
function ScoreCircle({ score, size = 140 }: { score: number; size?: number }) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ * (1 - pct / 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#ef4444';
  const label = pct >= 75 ? 'Strong' : pct >= 55 ? 'Fair' : 'Weak';
  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={12}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 1s ease' }}/>
      <text x={size/2} y={size/2 - 8} textAnchor="middle" fontSize={28} fontWeight="700" fill={color}>{pct}%</text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize={12} fill="#6b7280">{label}</text>
    </svg>
  );
}

function MiniBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-stone-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-stone-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }}/>
      </div>
      <span className="text-xs font-semibold text-stone-700 w-7 text-right">{score}</span>
    </div>
  );
}

const SECTION_LABELS: Record<string, string> = {
  contact: 'Contact Info', summary: 'Summary', experience: 'Experience',
  skills: 'Skills', education: 'Education',
};

const FAQS = [
  { q: 'What is an ATS resume scanner?', a: 'An ATS (Applicant Tracking System) scanner checks your resume against a job description to see how well it matches. Over 98% of Fortune 500 companies use ATS to auto-filter resumes before a human reads them. If your score is too low, your resume is rejected automatically.' },
  { q: 'Can I upload my resume PDF?', a: 'Yes — just click "Upload PDF" and select your resume file (up to 5 MB). Our tool extracts the text automatically using the same parsing technology that real ATS systems use. DOCX users: open your file in Google Docs, then File → Download → PDF.' },
  { q: 'What ATS score is good enough to get an interview?', a: 'Aim for 75%+. Scores below 55% are typically auto-rejected before any human sees your resume. A score of 80%+ puts you comfortably in the interview shortlist for most roles.' },
  { q: 'Is this a free alternative to Jobscan?', a: 'Yes. Jobscan charges $49.95/month. Formly\'s ATS Scanner is completely free, requires no signup, and provides equivalent keyword analysis, section grading, power word feedback, and improvement suggestions.' },
  { q: 'How do I improve my ATS score?', a: 'Add exact keywords from the job description to your Skills section and experience bullets. Match the job title from the posting. Quantify achievements with numbers. Remove tables, columns, and graphics that ATS parsers can\'t read. Use a clean single-column layout.' },
  { q: 'Should I use PDF or paste text for the most accurate scan?', a: 'Both work well. PDF upload is most convenient and mirrors what real ATS systems receive. Pasted text can be slightly more accurate if your PDF has complex formatting. For best results with PDF, ensure your resume is text-based (not a scanned image).' },
  { q: 'Do Indian resumes get scanned differently?', a: 'The core ATS logic is the same globally. However, Indian resumes often include date of birth, photographs, and marital status — which international ATS systems ignore or penalise. For global applications, remove these details and use a clean format.' },
  { q: 'How often should I scan my resume?', a: 'Every time you apply to a new job. ATS scores are specific to each job description — the keywords for "Marketing Manager" at a tech startup differ significantly from the same title at a bank. Most successful job seekers tailor their resume for each application.' },
];

export default function ATSResumeScannerPage() {
  const [resumeMode, setResumeMode] = useState<'upload' | 'paste'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file. For DOCX: open in Google Docs → File → Download → PDF.');
      return;
    }
    setError('');
    setResumeFile(file);
  }

  async function handleScan() {
    const hasResume = resumeMode === 'upload' ? !!resumeFile : resumeText.trim().length >= 50;
    if (!hasResume || !jobDescription.trim()) {
      setError(resumeMode === 'upload' ? 'Please upload your resume PDF and paste the job description.' : 'Please paste your resume text and the job description.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription.trim());
      if (resumeMode === 'upload' && resumeFile) {
        formData.append('resumeFile', resumeFile);
      } else {
        formData.append('resumeText', resumeText.trim());
      }

      const res = await fetch('/api/tools/ats-resume-scanner', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (!result) return;
    const text = `Just scanned my resume with Formly's free ATS Scanner!\n\n📊 ATS Score: ${result.overall_score}% (${result.grade})\n✅ Keywords Found: ${result.keywords_found.length}\n❌ Keywords Missing: ${result.keywords_missing.length}\n\n${result.verdict}\n\nCheck yours free (no signup) → https://formly.tools/tools/ats-resume-scanner`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const gradeColor = (g: string) =>
    g.startsWith('A') ? 'text-green-600 bg-green-50 border-green-200' :
    g.startsWith('B') ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-red-600 bg-red-50 border-red-200';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-teal-50 via-white to-blue-50 border-b border-stone-100 pt-12 pb-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              🎯 Free Alternative to Jobscan ($49.95/mo)
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mb-4 leading-tight">
              ATS Resume Scanner
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Upload your resume PDF + paste the job description. Get your <strong>ATS match score</strong>, missing keywords, section grades, and exact fixes — instantly free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-5 text-sm text-stone-500">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/>PDF & text supported</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/>No signup required</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/>Works globally</span>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
          <BannerAd />

          {/* ── Resume Input ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-stone-700">Step 1 — Your Resume</span>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit mb-4">
              <button
                onClick={() => setResumeMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${resumeMode === 'upload' ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <Upload className="w-4 h-4"/> Upload PDF
              </button>
              <button
                onClick={() => setResumeMode('paste')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${resumeMode === 'paste' ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <FileText className="w-4 h-4"/> Paste Text
              </button>
            </div>

            {resumeMode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>; handleFileChange(fakeEvent); } }}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${resumeFile ? 'border-teal-400 bg-teal-50' : 'border-stone-300 hover:border-teal-400 bg-stone-50'}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden"/>
                {resumeFile ? (
                  <div className="space-y-2">
                    <div className="text-3xl">✅</div>
                    <p className="font-bold text-teal-700">{resumeFile.name}</p>
                    <p className="text-sm text-stone-500">{(resumeFile.size / 1024).toFixed(0)} KB · Click to replace</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 text-stone-400 mx-auto"/>
                    <div>
                      <p className="font-bold text-stone-700">Drop your resume PDF here</p>
                      <p className="text-sm text-stone-500 mt-1">or click to browse · Max 5 MB</p>
                    </div>
                    <p className="text-xs text-stone-400">DOCX? Open in Google Docs → File → Download → PDF</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume text here…&#10;&#10;John Smith&#10;john@email.com | LinkedIn | GitHub&#10;&#10;EXPERIENCE&#10;Senior Developer, Acme Corp (2021–2024)&#10;• Built REST APIs serving 500K daily users&#10;• Led team of 5 engineers..."
                className="w-full h-56 p-4 border border-stone-200 rounded-2xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono placeholder:font-sans placeholder:text-stone-400"
              />
            )}
          </div>

          {/* ── JD Input ── */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500"/>
              Step 2 — Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…&#10;&#10;Senior Software Engineer — XYZ Inc&#10;We are looking for a Senior Software Engineer with:&#10;• 5+ years of experience in React and Node.js&#10;• Strong knowledge of TypeScript, AWS, Docker&#10;• Experience with CI/CD pipelines..."
              className="w-full h-48 p-4 border border-stone-200 rounded-2xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono placeholder:font-sans placeholder:text-stone-400"
            />
            <p className="text-xs text-stone-400">Include the full JD — requirements, qualifications, and responsibilities — for the most accurate analysis</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0"/>{error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            {loading
              ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analyzing your resume…</>
              : <><Zap className="w-5 h-5"/>Scan My Resume — It&apos;s Free</>}
          </button>

          {/* ── Results ── */}
          {result && (
            <div ref={resultRef} className="space-y-6">
              <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <ScoreCircle score={result.overall_score}/>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <span className={`text-3xl font-black px-4 py-1 rounded-xl border-2 ${gradeColor(result.grade)}`}>{result.grade}</span>
                      <span className="text-stone-400 text-sm">ATS Grade</span>
                    </div>
                    <p className="text-stone-300 text-base leading-relaxed italic">&ldquo;{result.verdict}&rdquo;</p>
                    <p className="text-stone-400 text-sm leading-relaxed">{result.match_summary}</p>
                  </div>
                  <button onClick={handleShare} className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4 text-green-400"/>Copied!</> : <><Share2 className="w-4 h-4"/>Share Result</>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'ATS Score', value: `${result.overall_score}%`, icon: '🎯', color: 'bg-teal-50 border-teal-200' },
                  { label: 'Keywords Found', value: result.keywords_found.length, icon: '✅', color: 'bg-green-50 border-green-200' },
                  { label: 'Keywords Missing', value: result.keywords_missing.length, icon: '❌', color: 'bg-red-50 border-red-200' },
                  { label: 'Formatting', value: `${result.formatting_score}%`, icon: '📐', color: 'bg-blue-50 border-blue-200' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-black text-stone-800">{s.value}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <InArticleAd variant={1}/>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Keywords Found ({result.keywords_found.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_found.map(k => <span key={k} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">{k}</span>)}
                    {!result.keywords_found.length && <p className="text-green-700 text-sm">No matching keywords found.</p>}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><XCircle className="w-4 h-4"/>Missing Keywords ({result.keywords_missing.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_missing.map(k => <span key={k} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full border border-red-200">{k}</span>)}
                    {!result.keywords_missing.length && <p className="text-red-700 text-sm">Great! No critical keywords missing.</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-5 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-teal-500"/>Section-by-Section Analysis</h3>
                <div className="space-y-4">
                  {Object.entries(result.sections).map(([key, val]) => (
                    <div key={key} className="space-y-1.5">
                      <MiniBar score={val.score} label={SECTION_LABELS[key] ?? key}/>
                      <p className="text-xs text-stone-500 pl-[100px]">{val.feedback}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
                  <MiniBar score={result.quantification_score} label="Quantification"/>
                  <p className="text-xs text-stone-500 pl-[100px]">How well your bullets use numbers, %, and metrics</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-3">⚡ Quick Wins (10 min fixes)</h3>
                  <ul className="space-y-2.5">
                    {result.quick_wins.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">{i+1}</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <h3 className="font-bold text-blue-800 mb-3">💪 Power Words to Add</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.power_words_missing.map(w => <span key={w} className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">{w}</span>)}
                  </div>
                  <p className="text-xs text-blue-700">Start your experience bullet points with these action verbs.</p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-4">🎯 Full Improvement Roadmap</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.top_suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white border border-stone-200 rounded-xl p-3">
                      <span className="shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[11px] font-black">{i+1}</span>
                      <p className="text-sm text-stone-700 leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.formatting_issues.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <h3 className="font-bold text-orange-800 mb-3">📐 Formatting Issues</h3>
                  <ul className="space-y-2">
                    {result.formatting_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-orange-900">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500"/>{issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <InArticleAd variant={2}/>

              <div className="text-center">
                <button
                  onClick={() => { setResult(null); setResumeFile(null); setResumeText(''); setJobDescription(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  ↑ Scan Another Resume
                </button>
              </div>
            </div>
          )}

          <InArticleAd variant={1}/>

          {/* ── Comparison table ── */}
          <section className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <h2 className="text-xl font-black text-stone-900 mb-5 text-center">Formly vs. Paid ATS Scanners</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-teal-200">
                  <th className="text-left py-2 text-stone-600 font-semibold">Feature</th>
                  <th className="text-center py-2 text-teal-700 font-bold">Formly (Free)</th>
                  <th className="text-center py-2 text-stone-500">Jobscan ($49.95/mo)</th>
                  <th className="text-center py-2 text-stone-500">Rezi ($29/mo)</th>
                </tr></thead>
                <tbody className="divide-y divide-teal-100">
                  {[
                    ['PDF Upload', '✅', '✅', '✅'],
                    ['ATS Match Score', '✅', '✅', '✅'],
                    ['Missing Keywords', '✅', '✅', '✅'],
                    ['Section Grades', '✅', '✅', '❌'],
                    ['Power Words', '✅', '✅', '❌'],
                    ['Quick Wins List', '✅', '❌', '❌'],
                    ['No Signup', '✅', '❌', '❌'],
                    ['Monthly Cost', '🎉 Free', '$49.95', '$29'],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature as string}>
                      <td className="py-2 text-stone-700 font-medium">{feature}</td>
                      {vals.map((v, i) => <td key={i} className={`py-2 text-center ${i === 0 ? 'text-teal-700 font-bold' : 'text-stone-500'}`}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <BannerAd/>

          {/* ── FAQ ── */}
          <section>
            <h2 className="text-2xl font-black text-stone-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-stone-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors">
                    <span className="font-semibold text-stone-800 pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0"/> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0"/>}
                  </button>
                  {openFaq === i && <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">{faq.a}</div>}
                </div>
              ))}
            </div>
          </section>

          <ToolSEOContent toolSlug="ats-resume-scanner" />

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'SoftwareApplication',
            name: 'ATS Resume Scanner', applicationCategory: 'BusinessApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            operatingSystem: 'Web',
            description: 'Free ATS resume scanner. Upload PDF or paste text, get ATS match score, missing keywords, and actionable fixes.',
            url: 'https://formly.tools/tools/ats-resume-scanner',
          })}}/>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
