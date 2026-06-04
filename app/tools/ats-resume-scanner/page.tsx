'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd, InArticleAd } from '@/components/shared/AdSense';
import { Upload, Clipboard, Share2, Check, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Zap, Target, TrendingUp } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface SectionScore { score: number; feedback: string }
interface ATSResult {
  overall_score: number;
  grade: string;
  verdict: string;
  keywords_found: string[];
  keywords_missing: string[];
  formatting_score: number;
  formatting_issues: string[];
  sections: Record<string, SectionScore>;
  top_suggestions: string[];
  quick_wins: string[];
  power_words_missing: string[];
  quantification_score: number;
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
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x={size/2} y={size/2 - 8} textAnchor="middle" fontSize={28} fontWeight="700" fill={color}>{pct}%</text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize={12} fill="#6b7280">{label}</text>
    </svg>
  );
}

// ── Mini Bar ─────────────────────────────────────────────────────────────────
function MiniBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-stone-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-stone-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-700 w-8 text-right">{score}</span>
    </div>
  );
}

const SECTION_LABELS: Record<string, string> = {
  contact: 'Contact Info', summary: 'Summary/Objective', experience: 'Work Experience',
  skills: 'Skills Section', education: 'Education',
};

const FAQS = [
  { q: 'What is an ATS resume scanner?', a: 'An ATS (Applicant Tracking System) scanner checks your resume against a job description to see how well it matches. Companies like Google, Amazon, and most Fortune 500s use ATS software to filter resumes before a human ever reads them. If your score is too low, your resume gets rejected automatically.' },
  { q: 'What ATS score is good enough?', a: 'Most career coaches recommend targeting a score of 75% or higher. Scores below 55% are typically auto-rejected. A score of 80%+ puts you comfortably in the interview shortlist. Our scanner is calibrated to match enterprise ATS systems like Workday, Greenhouse, and Lever.' },
  { q: 'Is this free? How is it different from Jobscan?', a: 'Yes, completely free — no signup, no credit card. Jobscan charges $49.95/month for the same functionality. We use advanced AI (Llama 70B) to give you equally accurate — often more insightful — analysis at zero cost.' },
  { q: 'Should I paste my resume or upload a PDF?', a: 'Paste the plain text from your resume for the most accurate analysis. Copy your resume from your Word doc or PDF, then paste it into the text box. PDF formatting can sometimes confuse parsers — plain text gives cleaner results.' },
  { q: 'How do I improve my ATS score?', a: "Add the exact keywords from the job description to your resume — especially in the skills section and experience bullets. Use the job title from the posting. Quantify achievements (e.g., 'increased sales by 40%' instead of 'improved sales'). Remove tables and graphics that ATS systems can't parse." },
  { q: 'Do Indian resumes get scored differently?', a: 'The core ATS logic is the same worldwide, but Indian resumes often include details like date of birth, photograph, and marital status — which international ATS systems either ignore or penalize. For global applications, we flag these formatting differences.' },
  { q: 'Can I use this for multiple job applications?', a: 'Absolutely — and you should. Run your resume against every unique job description. The keywords and requirements vary significantly between roles, even at the same company. Most successful job seekers tailor their resume for each application.' },
  { q: 'What are power words and why do they matter?', a: 'Power words are strong action verbs that ATS systems and hiring managers look for: Led, Built, Delivered, Increased, Reduced, Managed, Launched. Weak verbs like "Responsible for" or "Helped with" score poorly. Our tool flags exactly which power words you\'re missing.' },
];

export default function ATSResumeScannerPage() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleScan() {
    if (!resume.trim() || !jobDescription.trim()) {
      setError('Please paste both your resume and the job description.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/ats-resume-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resume.trim(), jobDescription: jobDescription.trim() }),
      });
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
    const text = `I just scanned my resume with Formly's free ATS Scanner!\n\n📊 ATS Score: ${result.overall_score}% (${result.grade})\n✅ Keywords Found: ${result.keywords_found.length}\n❌ Keywords Missing: ${result.keywords_missing.length}\n\n${result.verdict}\n\nCheck yours free → https://formly.tools/tools/ats-resume-scanner`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const gradeColor = (g: string) => {
    if (g.startsWith('A')) return 'text-green-600 bg-green-50 border-green-200';
    if (g.startsWith('B')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">

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
              Paste your resume + job description. Get your <strong>ATS match score</strong>, missing keywords, section grades, and exact fixes — in seconds. Free forever.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-stone-500">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> No signup required</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Works globally</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> AI-powered by Llama 70B</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Instant results</span>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

          <BannerAd />

          {/* ── Input ── */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-teal-500" />
                Your Resume
              </label>
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your full resume text here…

John Smith
john@email.com | LinkedIn | GitHub

EXPERIENCE
Senior Developer at Acme Corp (2021–2024)
• Built REST APIs serving 500K daily users
• Led team of 5 engineers..."
                className="w-full h-64 p-4 border border-stone-200 rounded-xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono placeholder:font-sans placeholder:text-stone-400"
              />
              <p className="text-xs text-stone-400">{resume.length} chars · Tip: paste plain text from Word/PDF for best results</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…

Senior Software Engineer — XYZ Inc
We are looking for a Senior Software Engineer with:
• 5+ years of experience in React and Node.js
• Strong knowledge of TypeScript, AWS, Docker
• Experience with CI/CD pipelines..."
                className="w-full h-64 p-4 border border-stone-200 rounded-xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono placeholder:font-sans placeholder:text-stone-400"
              />
              <p className="text-xs text-stone-400">{jobDescription.length} chars · Include the full JD for highest accuracy</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={loading || !resume.trim() || !jobDescription.trim()}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing your resume…</>
            ) : (
              <><Zap className="w-5 h-5" /> Scan My Resume — It&apos;s Free</>
            )}
          </button>

          {/* ── Results ── */}
          {result && (
            <div ref={resultRef} className="space-y-6">

              {/* Score header */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <ScoreCircle score={result.overall_score} />
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <span className={`text-3xl font-black px-4 py-1 rounded-xl border-2 ${gradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                      <span className="text-stone-400 text-sm">ATS Grade</span>
                    </div>
                    <p className="text-stone-300 text-base leading-relaxed italic">&ldquo;{result.verdict}&rdquo;</p>
                    <p className="text-stone-400 text-sm leading-relaxed">{result.match_summary}</p>
                  </div>
                  <button
                    onClick={handleShare}
                    className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share Result</>}
                  </button>
                </div>
              </div>

              {/* Stat cards */}
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

              <InArticleAd variant={1} />

              {/* Keywords */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Keywords Found ({result.keywords_found.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_found.map(k => (
                      <span key={k} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">{k}</span>
                    ))}
                    {result.keywords_found.length === 0 && <p className="text-green-700 text-sm">No matching keywords found.</p>}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Missing Keywords ({result.keywords_missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_missing.map(k => (
                      <span key={k} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full border border-red-200">{k}</span>
                    ))}
                    {result.keywords_missing.length === 0 && <p className="text-red-700 text-sm">Great! No critical keywords missing.</p>}
                  </div>
                </div>
              </div>

              {/* Section scores */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" /> Section-by-Section Analysis
                </h3>
                <div className="space-y-4">
                  {Object.entries(result.sections).map(([key, val]) => (
                    <div key={key} className="space-y-1.5">
                      <MiniBar score={val.score} label={SECTION_LABELS[key] ?? key} />
                      <p className="text-xs text-stone-500 pl-[92px]">{val.feedback}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-stone-100 space-y-3">
                  <MiniBar score={result.quantification_score} label="Quantification" />
                  <p className="text-xs text-stone-500 pl-[92px]">How well your bullet points use numbers, %, and metrics</p>
                </div>
              </div>

              {/* Quick wins + suggestions */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-3">⚡ Quick Wins (Fix in 10 min)</h3>
                  <ul className="space-y-2.5">
                    {result.quick_wins.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                        <span className="shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">{i+1}</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <h3 className="font-bold text-blue-800 mb-3">💪 Power Words Missing</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.power_words_missing.map(w => (
                      <span key={w} className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">{w}</span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700">Add these to the start of your experience bullet points to instantly boost your score.</p>
                </div>
              </div>

              {/* Full suggestions */}
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

              {/* Formatting issues */}
              {result.formatting_issues.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <h3 className="font-bold text-orange-800 mb-3">📐 Formatting Issues Found</h3>
                  <ul className="space-y-2">
                    {result.formatting_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-orange-900">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <InArticleAd variant={2} />

              {/* CTA to try again */}
              <div className="text-center">
                <button
                  onClick={() => { setResult(null); setResume(''); setJobDescription(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  ↑ Scan Another Resume
                </button>
                <p className="text-xs text-stone-400 mt-2">Tip: tailor your resume for each job — ATS scores vary significantly per posting</p>
              </div>
            </div>
          )}

          <InArticleAd variant={1} />

          {/* ── How it works ── */}
          <section>
            <h2 className="text-2xl font-black text-stone-900 mb-6 text-center">How the ATS Scanner Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: '1', icon: '📋', title: 'Paste Your Resume', desc: 'Copy your resume text directly from Word, Google Docs, or a PDF. Plain text works best.' },
                { step: '2', icon: '🎯', title: 'Add the Job Description', desc: 'Paste the full job posting including requirements, qualifications, and responsibilities.' },
                { step: '3', icon: '📊', title: 'Get Your Score & Fixes', desc: 'Our AI analyzes keyword match, formatting, section quality, and gives you a precise action plan.' },
              ].map(s => (
                <div key={s.step} className="text-center p-6 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="w-10 h-10 bg-teal-600 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-3">{s.step}</div>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <h3 className="font-bold text-stone-800 mb-1">{s.title}</h3>
                  <p className="text-sm text-stone-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Comparison table ── */}
          <section className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <h2 className="text-xl font-black text-stone-900 mb-5 text-center">Formly ATS Scanner vs. Paid Alternatives</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-teal-200">
                    <th className="text-left py-2 text-stone-600 font-semibold">Feature</th>
                    <th className="text-center py-2 text-teal-700 font-bold">Formly (Free)</th>
                    <th className="text-center py-2 text-stone-500 font-semibold">Jobscan ($49.95/mo)</th>
                    <th className="text-center py-2 text-stone-500 font-semibold">Rezi ($29/mo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {[
                    ['ATS Match Score', '✅', '✅', '✅'],
                    ['Keyword Analysis', '✅', '✅', '✅'],
                    ['Section-by-Section Grades', '✅', '✅', '❌'],
                    ['Power Words Feedback', '✅', '✅', '❌'],
                    ['Formatting Issues', '✅', '✅', '✅'],
                    ['Quick Wins List', '✅', '❌', '❌'],
                    ['Signup Required', '❌ None', '✅ Required', '✅ Required'],
                    ['Monthly Cost', '🎉 Free', '$49.95', '$29'],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature as string}>
                      <td className="py-2 text-stone-700 font-medium">{feature}</td>
                      {vals.map((v, i) => (
                        <td key={i} className={`py-2 text-center ${i === 0 ? 'text-teal-700 font-bold' : 'text-stone-500'}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <BannerAd />

          {/* ── FAQ ── */}
          <section>
            <h2 className="text-2xl font-black text-stone-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-stone-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-semibold text-stone-800 pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Schema ── */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ATS Resume Scanner',
            applicationCategory: 'BusinessApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            operatingSystem: 'Web',
            description: 'Free ATS resume scanner that checks your resume against job descriptions and gives you a match score, missing keywords, and actionable improvements.',
            url: 'https://formly.tools/tools/ats-resume-scanner',
          })}} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
