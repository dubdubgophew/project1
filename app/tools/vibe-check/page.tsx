'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { InArticleAd } from '@/components/shared/AdSense';

// ── Types ────────────────────────────────────────────────────────────────────
type Step = 'checkin' | 'loading' | 'result';
interface Mood { emoji: string; label: string; group: string }
interface Entry { date: string; mood: string; emoji: string }
interface Crisis { name: string; number: string; url: string }
interface VibeResult {
  insight: string; reframe: string; action: string; actionType: string;
  affirmation: string; followUp: string; safetyFlag: boolean;
  crisis: Crisis; remaining: number;
}

// ── Mood data ─────────────────────────────────────────────────────────────────
const GROUPS: { label: string; icon: string; tc: string; bg: string; border: string; ring: string; moods: Mood[] }[] = [
  { label: 'Thriving', icon: '🌟', tc: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400',
    moods: [{ emoji: '😄', label: 'Joyful', group: 'Thriving' }, { emoji: '🤩', label: 'Excited', group: 'Thriving' },
            { emoji: '🙏', label: 'Grateful', group: 'Thriving' }, { emoji: '💪', label: 'Confident', group: 'Thriving' }, { emoji: '⚡', label: 'Energized', group: 'Thriving' }] },
  { label: 'Calm', icon: '🌊', tc: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', ring: 'ring-sky-400',
    moods: [{ emoji: '😌', label: 'Peaceful', group: 'Calm' }, { emoji: '😊', label: 'Content', group: 'Calm' },
            { emoji: '🌅', label: 'Hopeful', group: 'Calm' }, { emoji: '🤔', label: 'Reflective', group: 'Calm' }] },
  { label: 'Unsettled', icon: '🌀', tc: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-400',
    moods: [{ emoji: '😑', label: 'Numb', group: 'Unsettled' }, { emoji: '😕', label: 'Confused', group: 'Unsettled' },
            { emoji: '😣', label: 'Restless', group: 'Unsettled' }, { emoji: '😴', label: 'Drained', group: 'Unsettled' }] },
  { label: 'Hurting', icon: '💙', tc: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-400',
    moods: [{ emoji: '😢', label: 'Sad', group: 'Hurting' }, { emoji: '🫂', label: 'Lonely', group: 'Hurting' },
            { emoji: '😔', label: 'Guilty', group: 'Hurting' }, { emoji: '😞', label: 'Disappointed', group: 'Hurting' }] },
  { label: 'Stressed', icon: '🔥', tc: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', ring: 'ring-rose-400',
    moods: [{ emoji: '😰', label: 'Anxious', group: 'Stressed' }, { emoji: '😤', label: 'Frustrated', group: 'Stressed' }, { emoji: '🤯', label: 'Overwhelmed', group: 'Stressed' }] },
];

const AREAS = [
  { label: 'Work', icon: '💼' }, { label: 'Relationships', icon: '💕' }, { label: 'Health', icon: '🌿' },
  { label: 'Money', icon: '💰' }, { label: 'Family', icon: '🏡' }, { label: 'Self', icon: '🪞' },
];

const COUNTRIES: [string, string][] = [
  ['IN','🇮🇳 India'],['US','🇺🇸 USA'],['GB','🇬🇧 UK'],['CA','🇨🇦 Canada'],['AU','🇦🇺 Australia'],
  ['NZ','🇳🇿 New Zealand'],['NG','🇳🇬 Nigeria'],['PH','🇵🇭 Philippines'],['PK','🇵🇰 Pakistan'],
  ['BD','🇧🇩 Bangladesh'],['ZA','🇿🇦 South Africa'],['KE','🇰🇪 Kenya'],['AE','🇦🇪 UAE'],
  ['SG','🇸🇬 Singapore'],['MY','🇲🇾 Malaysia'],['ID','🇮🇩 Indonesia'],['JP','🇯🇵 Japan'],
  ['KR','🇰🇷 South Korea'],['BR','🇧🇷 Brazil'],['MX','🇲🇽 Mexico'],['EG','🇪🇬 Egypt'],
  ['SA','🇸🇦 Saudi Arabia'],['DE','🇩🇪 Germany'],['FR','🇫🇷 France'],['IE','🇮🇪 Ireland'],
];

const STORAGE_KEY = 'vibe-check-history';

function loadHistory(): Entry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function saveEntry(e: Entry) {
  try {
    const today = e.date;
    const h = loadHistory().filter(x => x.date !== today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([e, ...h].slice(0, 14)));
  } catch {}
}
function getStreak(h: Entry[]): number {
  if (!h.length) return 0;
  const now = new Date();
  let streak = 0;
  for (let i = 0; i < h.length; i++) {
    const diff = Math.round((now.getTime() - new Date(h[i].date).getTime()) / 86400000);
    if (diff === i) streak++; else break;
  }
  return streak;
}

// ── Micro-exercise components ─────────────────────────────────────────────────
function BoxBreathing() {
  const [on, setOn] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const phases = ['Breathe in 🌬️', 'Hold 🤫', 'Breathe out 💨', 'Hold 🤫'];
  const colors = ['bg-sky-400', 'bg-violet-400', 'bg-teal-400', 'bg-indigo-400'];
  const scales = ['scale-125', 'scale-100', 'scale-75', 'scale-100'];
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setCount(c => { if (c <= 1) { setPhase(p => (p + 1) % 4); return 4; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [on]);
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className={`w-20 h-20 rounded-full ${colors[phase]} ${on ? scales[phase] : 'scale-100'} transition-all duration-1000 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
        {on ? count : '▶'}
      </div>
      <p className="text-sm font-medium text-stone-600">{on ? phases[phase] : 'Box Breathing (4-4-4-4)'}</p>
      <button onClick={() => { setOn(x => !x); setPhase(0); setCount(4); }}
        className="px-5 py-2 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-medium transition-colors">
        {on ? 'Stop' : 'Start Exercise'}
      </button>
    </div>
  );
}

function Grounding() {
  const [step, setStep] = useState(-1);
  const steps = [
    { n: 5, q: 'Name 5 things you can SEE right now' },
    { n: 4, q: 'Feel 4 things you can TOUCH — notice each texture' },
    { n: 3, q: 'Listen for 3 sounds you can HEAR in this moment' },
    { n: 2, q: 'Find 2 things you can SMELL (or recall a comforting scent)' },
    { n: 1, q: 'Notice 1 thing you can TASTE right now' },
  ];
  if (step === -1) return (
    <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm font-medium transition-colors">
      Start 5-4-3-2-1 Grounding
    </button>
  );
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
        <p className="text-4xl font-bold text-teal-500 mb-1">{steps[step].n}</p>
        <p className="text-stone-700 font-medium text-sm">{steps[step].q}</p>
        <p className="text-stone-400 text-xs mt-1">Take your time. Be specific. Breathe.</p>
      </div>
      <div className="flex gap-1">{steps.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-teal-400' : 'bg-stone-200'} transition-colors`} />)}</div>
      <div className="flex gap-2">
        {step < 4
          ? <button onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm font-medium">Next →</button>
          : <button onClick={() => setStep(-1)} className="px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-medium">✓ Done — feeling grounded</button>
        }
        <button onClick={() => setStep(-1)} className="px-4 py-2 rounded-full bg-stone-100 text-stone-400 text-sm">Reset</button>
      </div>
    </div>
  );
}

function MicroAction({ type, action }: { type: string; action: string }) {
  if (type === 'breathing') return <BoxBreathing />;
  if (type === 'grounding') return <Grounding />;
  return <p className="text-sm text-stone-600 leading-relaxed bg-violet-50 border border-violet-100 rounded-xl p-4">{action}</p>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function VibeCheck() {
  const [step, setStep] = useState<Step>('checkin');
  const [mood, setMood] = useState<Mood | null>(null);
  const [moodGroup, setMoodGroup] = useState('');
  const [area, setArea] = useState('');
  const [country, setCountry] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<VibeResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Entry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const streak = getStreak(history);

  async function submit() {
    if (!mood) return;
    setStep('loading'); setError('');
    try {
      const res = await fetch('/api/tools/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood.label, moodGroup, area: area || 'General', country, context: context.trim(), history: history.slice(0, 7).map(h => ({ date: h.date, mood: h.mood })) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setStep('checkin'); return; }
      const entry: Entry = { date: new Date().toISOString().split('T')[0], mood: mood.label, emoji: mood.emoji };
      saveEntry(entry);
      setHistory(loadHistory());
      setResult(data);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setError('Network error. Please try again.'); setStep('checkin'); }
  }

  function reset() { setStep('checkin'); setMood(null); setArea(''); setContext(''); setResult(null); setError(''); }

  async function copyShare() {
    if (!result || !mood) return;
    await navigator.clipboard.writeText(`✨ My vibe today: ${mood.emoji} ${mood.label}\n"${result.affirmation}"\n\nCheck your vibe → formly.tools/tools/vibe-check`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  // ── Check-in screen ─────────────────────────────────────────────────────────
  if (step === 'checkin' || step === 'loading') return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">✨</div>
            <h1 className="text-3xl font-bold text-stone-900 mb-1">Vibe Check</h1>
            <p className="text-stone-500 text-sm">60 seconds. Real insight. Free forever.</p>
            {streak > 1 && <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold">🔥 {streak}-day streak</div>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-6">
            {/* Mood grid */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-4">How are you feeling right now?</p>
              <div className="space-y-4">
                {GROUPS.map(g => (
                  <div key={g.label}>
                    <p className={`text-xs font-bold ${g.tc} mb-2 flex items-center gap-1`}>{g.icon} {g.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {g.moods.map(m => {
                        const sel = mood?.label === m.label;
                        return (
                          <button key={m.label} onClick={() => { setMood(m); setMoodGroup(g.label); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 ${sel ? `${g.bg} ${g.border} ${g.tc} font-semibold shadow-sm ring-2 ${g.ring} scale-105` : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}>
                            <span>{m.emoji}</span>{m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Area */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">What's this about? <span className="font-normal text-stone-400">(optional)</span></p>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(a => (
                  <button key={a.label} onClick={() => setArea(area === a.label ? '' : a.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${area === a.label ? 'bg-violet-100 border-violet-300 text-violet-700 font-semibold' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Tell me more <span className="font-normal text-stone-400">(optional — more detail = better insight)</span></p>
              <textarea value={context} onChange={e => setContext(e.target.value)} maxLength={300} rows={2}
                placeholder="e.g. Had a rough week at work and feel like I'm falling behind..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              <p className="text-right text-xs text-stone-300 mt-1">{context.length}/300</p>
            </div>

            {/* Country */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">🌍 Your country <span className="font-normal text-stone-400">(personalizes your insight)</span></p>
              <select value={country} onChange={e => setCountry(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-300">
                <option value="">Select country (optional)</option>
                {COUNTRIES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>

            {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}

            <button onClick={submit} disabled={!mood || step === 'loading'}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-base hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-violet-200">
              {step === 'loading'
                ? <span className="flex items-center justify-center gap-2"><span className="inline-block animate-spin">✨</span> Reading your vibe…</span>
                : mood ? `Check my ${mood.emoji} vibe →` : 'Pick a mood to begin'}
            </button>
            <p className="text-center text-xs text-stone-400">Free · No account · Your data stays on your device</p>
          </div>

          {history.length > 0 && (
            <div className="mt-5 bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
              <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">Your mood journey</p>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 12).map((h, i) => (
                  <div key={i} title={`${h.date}: ${h.mood}`} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-[10px] text-stone-400">{new Date(h.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-center text-xs text-stone-400 mt-5 px-4">
            Vibe Check is for self-reflection and wellness only — not a substitute for professional mental health care.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );

  // ── Result screen ────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-2">{mood?.emoji}</div>
            <h2 className="text-xl font-bold text-stone-900">You're feeling <span className="text-violet-600">{mood?.label}</span></h2>
            {area && <p className="text-stone-400 text-sm">{AREAS.find(a => a.label === area)?.icon} {area}</p>}
            {streak > 0 && <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs">🔥 {streak}-day streak</div>}
          </div>

          {result?.safetyFlag ? (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-rose-800">💙 You're not alone in this</h3>
              <p className="text-rose-700 text-sm leading-relaxed">{result.insight}</p>
              <p className="text-sm font-semibold text-rose-800">Please reach out — help is available:</p>
              <a href={result.crisis?.url ?? 'https://findahelpline.com'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{result.crisis?.name}</p>
                  {result.crisis?.number && <p className="text-rose-600 font-bold">{result.crisis.number}</p>}
                </div>
              </a>
            </div>
          ) : result && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">✨ What Vibe sees</p>
                  <p className="text-stone-700 leading-relaxed">{result.insight}</p>
                </div>
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">🔮 A new lens</p>
                  <p className="text-stone-700 leading-relaxed">{result.reframe}</p>
                </div>
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-2">⚡ Do this now (2–5 min)</p>
                  <p className="text-stone-500 text-sm mb-3">{result.action}</p>
                  <MicroAction type={result.actionType} action={result.action} />
                </div>
                {result.followUp && (
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">💭 Sit with this</p>
                    <p className="text-stone-500 text-sm italic">&ldquo;{result.followUp}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 text-center">
                <p className="text-white/60 text-xs mb-1">Your affirmation for today</p>
                <p className="text-white font-bold text-lg">&ldquo;{result.affirmation}&rdquo;</p>
                <button onClick={copyShare} className="mt-3 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
                  {copied ? '✓ Copied!' : '📋 Share your vibe'}
                </button>
              </div>
            </>
          )}

          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Your mood journey</p>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 12).map((h, i) => (
                  <div key={i} title={`${h.date}: ${h.mood}`} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-[10px] text-stone-400">{new Date(h.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
              {streak > 1 && <p className="text-xs text-amber-600 mt-3 font-medium">🔥 {streak}-day check-in streak — you're building something real.</p>}
            </div>
          )}

          <InArticleAd className="my-2" />

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium text-sm hover:bg-stone-50 transition-colors">
              Check in again
            </button>
            <a href="/tools" className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors text-center">
              All 38 tools →
            </a>
          </div>

          <p className="text-center text-xs text-stone-400 px-4">
            For self-reflection only — not a substitute for professional mental health care.
            {result?.crisis && !result.safetyFlag && country && (
              <span> Need support? <a href={result.crisis.url} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">{result.crisis.name}</a></span>
            )}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}