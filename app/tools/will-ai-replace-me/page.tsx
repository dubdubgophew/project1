'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BannerAd, InArticleAd } from '@/components/shared/AdSense';
import { Share2, Check, ChevronDown, ChevronUp, AlertCircle, Zap, Shield, Brain, TrendingUp } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface AIReplaceResult {
  risk_percentage: number;
  risk_level: string;
  survival_title: string;
  survival_description: string;
  replacement_year_range: string;
  at_risk_tasks: string[];
  safe_tasks: string[];
  skills_to_learn: string[];
  current_ai_threats: string;
  why_safe: string;
  fun_verdict: string;
  action_plan: string[];
  ai_collaboration_tips: string[];
  salary_impact: string;
}

// ── Risk Gauge ────────────────────────────────────────────────────────────────
function RiskGauge({ pct }: { pct: number }) {
  const clamp = Math.min(100, Math.max(0, pct));
  const color = clamp >= 70 ? '#f87171' : clamp >= 45 ? '#fbbf24' : '#4ade80';
  const label = clamp >= 80 ? 'Critical Risk' : clamp >= 60 ? 'High Risk' : clamp >= 40 ? 'Medium Risk' : clamp >= 20 ? 'Low Risk' : 'Very Safe';
  const r = 70, cx = 90, cy = 90;
  const circ = Math.PI * r;
  const offset = circ * (1 - clamp / 100);
  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={108} className="overflow-visible">
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#374151" strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={color} strokeWidth={14}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={38} fontWeight="900" fill={color}>{clamp}%</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={13} fontWeight="600" fill="#d1d5db">{label}</text>
      </svg>
    </div>
  );
}

const INDUSTRIES = [
  'Technology / Software', 'Finance & Banking', 'Healthcare & Medicine', 'Legal & Law',
  'Education & Teaching', 'Marketing & Advertising', 'Sales & Business Development',
  'Human Resources', 'Accounting & Auditing', 'Journalism & Media', 'Design & Creative',
  'Engineering (Civil/Mechanical)', 'Manufacturing & Production', 'Retail & E-commerce',
  'Customer Service & Support', 'Logistics & Supply Chain', 'Real Estate',
  'Government & Public Sector', 'Research & Academia', 'Consulting', 'Other',
];

const EXPERIENCE_OPTIONS = [
  'Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10–20 years', '20+ years',
];

const RISK_BORDER: Record<string, string> = {
  VERY_LOW:  'border-emerald-500/40',
  LOW:       'border-teal-500/40',
  MEDIUM:    'border-amber-500/40',
  HIGH:      'border-orange-500/40',
  VERY_HIGH: 'border-red-500/40',
};

const RISK_ACCENT: Record<string, string> = {
  VERY_LOW:  'text-emerald-400',
  LOW:       'text-teal-400',
  MEDIUM:    'text-amber-400',
  HIGH:      'text-orange-400',
  VERY_HIGH: 'text-red-400',
};

const FAQS = [
  { q: 'How accurate is this AI job replacement calculator?', a: "It's grounded in published research from McKinsey Global Institute, the Oxford Martin Programme on Technology and Employment, and MIT Work of the Future. Our AI model weighs task routineness, cognitive complexity, physical requirements, and industry-specific AI adoption trends. It's not a crystal ball, but it's far more accurate than generic lists." },
  { q: 'Which jobs are most at risk from AI?', a: 'Data entry clerks, telemarketers, bookkeepers, radiologists (image reading), basic legal document review, customer service reps (Tier 1), and assembly line workers face the highest near-term risk. Creative directors, therapists, surgeons, teachers, and senior engineers are among the most protected.' },
  { q: 'Which jobs are safest from AI replacement?', a: 'Jobs requiring complex human judgment, physical dexterity in unpredictable environments, deep emotional intelligence, and creative synthesis are safest. Think: therapists, plumbers, surgeons, executive leaders, artists, and scientists doing novel research.' },
  { q: 'Will AI replace software engineers and developers?', a: 'AI will replace repetitive coding tasks (boilerplate, simple scripts, bug fixes) but is unlikely to replace senior engineers who design systems, make architectural decisions, and understand business context. GitHub Copilot and Claude already handle ~40% of code for many developers — but engineers who learn to leverage these tools become 3–5x more productive.' },
  { q: 'How will AI affect jobs in India specifically?', a: "India's IT and BPO sectors face significant risk in routine coding, data processing, and Tier 1 support. However, India's engineering talent in AI/ML, product development, and complex software is in high global demand. The shift will eliminate some roles while massively upskilling others." },
  { q: 'What skills should I learn to be safe from AI?', a: 'Prompt engineering, AI tool mastery (ChatGPT, Claude, Midjourney for your field), data literacy, critical thinking, complex negotiation, leadership, and domain-specific expertise that AI cannot easily replicate. The goal is to become the human who directs AI, not the human AI replaces.' },
  { q: 'By when will AI start replacing most jobs?', a: 'Goldman Sachs estimates AI could automate 25% of current work tasks by 2030. McKinsey says 30% of hours currently worked could be automated by 2030. But these are task-level disruptions — most jobs will be transformed rather than eliminated outright.' },
  { q: "How should I use this tool?", a: 'Enter your actual job title, industry, and key skills honestly for the most accurate analysis. Then focus on the Action Plan and AI Collaboration Tips — the goal is to use this as a roadmap, not a reason for panic. Most people who adapt early end up better off.' },
];

export default function WillAIReplaceMePage() {
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [skills, setSkills] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [result, setResult] = useState<AIReplaceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleCheck() {
    if (!jobTitle.trim() || !industry) { setError('Please enter your job title and select your industry.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/will-ai-replace-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), industry, skills: skills.trim(), yearsExperience }),
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
    const riskEmoji = result.risk_percentage >= 80 ? '💀' : result.risk_percentage >= 60 ? '🔴' : result.risk_percentage >= 40 ? '🟡' : '🟢';
    const text = `I just checked if AI will replace my job as a ${jobTitle}...\n\n${riskEmoji} AI Replacement Risk: ${result.risk_percentage}%\n⏰ Timeline: ${result.replacement_year_range}\n🏆 "${result.survival_title}"\n\n"${result.fun_verdict}"\n\nCheck yours free → https://formly.tools/tools/will-ai-replace-me`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  const borderClass = result ? (RISK_BORDER[result.risk_level] ?? 'border-stone-700') : '';
  const accentClass = result ? (RISK_ACCENT[result.risk_level] ?? 'text-stone-400') : '';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-orange-50 via-red-50 to-white border-b border-stone-100 pt-12 pb-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mb-4 leading-tight">
              Will AI Replace Me?
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Enter your job title and get your <strong>AI replacement risk score</strong>, timeline, at-risk tasks, safe skills, and a survival plan — based on real research. Brutally honest. Free.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-5 text-sm text-stone-500">
              <span>🔬 Backed by McKinsey & Oxford research</span>
              <span>·</span>
              <span>⚡ Results in 10 seconds</span>
              <span>·</span>
              <span>😬 Painfully honest</span>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
          <BannerAd />

          {/* ── Input form ── */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="text-lg font-black text-stone-900">Tell us about your job</h2>

            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-1.5">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Marketing Manager, Radiologist…"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-1.5">Industry *</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-1.5">Years of Experience</label>
                <select
                  value={yearsExperience}
                  onChange={e => setYearsExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="">Select…</option>
                  {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-1.5">Key Skills <span className="text-stone-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="Python, leadership, client relations…"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button
              onClick={handleCheck}
              disabled={loading || !jobTitle.trim() || !industry}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-stone-300 disabled:to-stone-300 text-white font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-200"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Consulting the machines…</>
              ) : (
                <><Zap className="w-5 h-5" /> Am I Being Replaced? Find Out Now</>
              )}
            </button>
          </div>

          {/* ── Results ── */}
          {result && (
            <div ref={resultRef} className="space-y-6">

              {/* Hero result card */}
              <div className={`bg-stone-950 border-2 ${borderClass} rounded-3xl p-8 text-center`}>
                <RiskGauge pct={result.risk_percentage} />
                <h2 className={`text-2xl font-black mt-5 mb-2 ${accentClass}`}>{result.survival_title}</h2>
                <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto mb-4">{result.survival_description}</p>
                <div className={`inline-flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-sm font-semibold text-stone-200 mb-5`}>
                  ⏰ Timeline: {result.replacement_year_range}
                </div>
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-left text-sm text-stone-300 italic leading-relaxed mb-5">
                  &ldquo;{result.fun_verdict}&rdquo;
                </div>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share My Result</>}
                </button>
              </div>

              <InArticleAd variant={1} />

              {/* At risk vs safe tasks */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    🤖 Tasks AI Will Handle
                  </h3>
                  <ul className="space-y-2">
                    {result.at_risk_tasks.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                        <span className="text-red-400 shrink-0 mt-0.5">✕</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Tasks That Stay Human
                  </h3>
                  <ul className="space-y-2">
                    {result.safe_tasks.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                        <span className="text-green-500 shrink-0 mt-0.5">✓</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI threats + why safe */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-2">⚠️ AI Already Encroaching</h3>
                  <p className="text-sm text-amber-900 leading-relaxed">{result.current_ai_threats}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <h3 className="font-bold text-blue-800 mb-2">🛡️ What Protects You</h3>
                  <p className="text-sm text-blue-900 leading-relaxed">{result.why_safe}</p>
                </div>
              </div>

              {/* Skills to learn */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-500" /> Skills to Learn to Stay Relevant
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.skills_to_learn.map((s, i) => (
                    <span key={i} className="bg-violet-100 text-violet-800 text-sm font-semibold px-4 py-2 rounded-xl border border-violet-200">
                      {i+1}. {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action plan */}
              <div className="bg-stone-900 rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" /> Your 6-Month Action Plan
                </h3>
                <div className="space-y-3">
                  {result.action_plan.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                      <span className="shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-black">{i+1}</span>
                      <p className="text-sm text-stone-300 leading-snug">{a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI collaboration tips */}
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
                <h3 className="font-bold text-violet-800 mb-4">🤝 Use AI to Become MORE Valuable</h3>
                <div className="space-y-3">
                  {result.ai_collaboration_tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-violet-900">
                      <span className="text-violet-400 font-bold shrink-0">→</span>{tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary impact */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-center">
                <p className="text-sm font-semibold text-stone-600 mb-1">💰 Salary Forecast</p>
                <p className="text-stone-800 text-base leading-relaxed">{result.salary_impact}</p>
              </div>

              <InArticleAd variant={2} />

              <div className="text-center">
                <button
                  onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  ↑ Check Another Job
                </button>
              </div>
            </div>
          )}

          <InArticleAd variant={1} />

          {/* ── Risk scale ── */}
          <section>
            <h2 className="text-2xl font-black text-stone-900 mb-6 text-center">AI Risk Scale — Where Does Your Job Fall?</h2>
            <div className="space-y-3">
              {[
                { range: '0–20%', label: '🟢 Very Safe', desc: 'Complex human judgment, creativity, physical dexterity in unpredictable environments. AI is a tool, not a threat. Examples: Surgeon, Therapist, Plumber, Artist.', bg: 'bg-green-50 border-green-200' },
                { range: '21–40%', label: '🟢 Low Risk', desc: 'AI assists but humans remain essential. Your role evolves with AI tools. Examples: Teacher, Nurse, Civil Engineer, Product Manager.', bg: 'bg-teal-50 border-teal-200' },
                { range: '41–60%', label: '🟡 Medium Risk', desc: 'AI handles significant portions. Adaptability is key. Examples: Marketer, Junior Developer, Financial Analyst, HR Generalist.', bg: 'bg-amber-50 border-amber-200' },
                { range: '61–80%', label: '🔴 High Risk', desc: 'Major portions of your job are automatable today. Urgent need to upskill. Examples: Copywriter, Data Entry, Customer Service, Bookkeeper.', bg: 'bg-orange-50 border-orange-200' },
                { range: '81–100%', label: '💀 Critical Risk', desc: 'AI already does most of this role or will very soon. Career pivot recommended. Examples: Telemarketer, Basic Translator, Image Tagger, Paralegal (routine tasks).', bg: 'bg-red-50 border-red-200' },
              ].map(r => (
                <div key={r.range} className={`${r.bg} border rounded-xl p-4 flex gap-4`}>
                  <span className="shrink-0 font-black text-stone-700 w-16 text-sm">{r.range}</span>
                  <div>
                    <span className="font-bold text-stone-800 text-sm">{r.label} — </span>
                    <span className="text-sm text-stone-600">{r.desc}</span>
                  </div>
                </div>
              ))}
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
                    <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Will AI Replace Me?',
            applicationCategory: 'UtilitiesApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            operatingSystem: 'Web',
            description: 'Free AI job replacement risk calculator. Find out your AI displacement risk %, timeline, and personalised action plan.',
            url: 'https://formly.tools/tools/will-ai-replace-me',
          })}} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
