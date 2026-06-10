'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtPct = (n: number) => n.toFixed(2) + '%';

interface PieSegment { label: string; value: number; color: string; }
function PieChart({ segments }: { segments: PieSegment[] }) {
  const filtered = segments.filter(s => s.value > 0.5);
  const total = filtered.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;
  const cx = 80, cy = 80, r = 65, inner = 30, gap = 1.5;
  let cumAngle = -90;
  const paths = filtered.map(seg => {
    const pct = seg.value / total;
    const degrees = pct * 360 - gap;
    const startA = cumAngle + gap / 2;
    const endA = cumAngle + degrees + gap / 2;
    cumAngle += pct * 360;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startA)), y1 = cy + r * Math.sin(toRad(startA));
    const x2 = cx + r * Math.cos(toRad(endA)), y2 = cy + r * Math.sin(toRad(endA));
    const ix1 = cx + inner * Math.cos(toRad(startA)), iy1 = cy + inner * Math.sin(toRad(startA));
    const ix2 = cx + inner * Math.cos(toRad(endA)), iy2 = cy + inner * Math.sin(toRad(endA));
    const large = degrees > 180 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { ...seg, d, pct };
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
        <circle cx={cx} cy={cy} r={inner - 1} fill="#030712" />
      </svg>
      <div className="flex-1 space-y-2 w-full">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-stone-500 min-w-0">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.label}</span>
            </span>
            <span className="text-stone-700 font-medium whitespace-nowrap">
              {fmtINR(p.value)} <span className="text-stone-500">({(p.pct * 100).toFixed(1)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calculation helpers ──────────────────────────────────────────────────────
function calcSIP(monthly: number, annualRate: number, years: number): {
  fv: number; invested: number; returns: number; cagr: number; absReturns: number;
} {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const returns = fv - invested;
  const cagr = invested > 0 && years > 0 ? (Math.pow(fv / invested, 1 / years) - 1) * 100 : 0;
  const absReturns = invested > 0 ? (returns / invested) * 100 : 0;
  return { fv, invested, returns, cagr, absReturns };
}

function calcStepUpSIP(monthly: number, annualRate: number, years: number, stepUpPct: number): {
  fv: number; invested: number; returns: number; cagr: number; absReturns: number;
} {
  const r = annualRate / 12 / 100;
  let fv = 0;
  let invested = 0;
  let currentMonthly = monthly;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) {
      const monthsRemaining = (years - y) * 12 - m;
      fv += r === 0
        ? currentMonthly
        : currentMonthly * Math.pow(1 + r, monthsRemaining);
      invested += currentMonthly;
    }
    currentMonthly = currentMonthly * (1 + stepUpPct / 100);
  }
  const returns = fv - invested;
  const cagr = invested > 0 && years > 0 ? (Math.pow(fv / invested, 1 / years) - 1) * 100 : 0;
  const absReturns = invested > 0 ? (returns / invested) * 100 : 0;
  return { fv, invested, returns, cagr, absReturns };
}

function calcLumpsum(amount: number, annualRate: number, years: number): {
  fv: number; invested: number; returns: number; cagr: number; absReturns: number;
} {
  const fv = amount * Math.pow(1 + annualRate / 100, years);
  const returns = fv - amount;
  const cagr = annualRate;
  const absReturns = amount > 0 ? (returns / amount) * 100 : 0;
  return { fv, invested: amount, returns, cagr, absReturns };
}

function calcReverseSIP(goal: number, annualRate: number, years: number): number {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return goal / n;
  return goal / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

// LTCG Tax (Equity): exempt ₹1.25L, 12.5% on remainder
function calcEquityTax(gains: number): number {
  const exempt = 125000;
  if (gains <= exempt) return 0;
  return (gains - exempt) * 0.125;
}

// Real value adjusted for inflation
function calcRealValue(nominalFV: number, inflationPct: number, years: number): number {
  return nominalFV / Math.pow(1 + inflationPct / 100, years);
}

interface YearRow { year: number; invested: number; value: number; returns: number }

function buildYearTable(
  mode: 'sip' | 'lumpsum',
  monthly: number,
  annualRate: number,
  years: number,
  stepUp: number,
): YearRow[] {
  const rows: YearRow[] = [];
  if (mode === 'lumpsum') {
    for (let y = 1; y <= years; y++) {
      const value = monthly * Math.pow(1 + annualRate / 100, y);
      rows.push({ year: y, invested: monthly, value, returns: value - monthly });
    }
  } else {
    const r = annualRate / 12 / 100;
    let fv = 0;
    let invested = 0;
    let currentMonthly = monthly;
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        fv = r === 0 ? fv + currentMonthly : (fv + currentMonthly) * (1 + r);
        invested += currentMonthly;
      }
      rows.push({ year: y, invested, value: fv, returns: fv - invested });
      if (stepUp > 0) currentMonthly = currentMonthly * (1 + stepUp / 100);
    }
  }
  return rows;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function SIPCalculatorPage() {
  // Tab
  const [tab, setTab] = useState<'sip' | 'lumpsum'>('sip');

  // SIP inputs
  const [sipAmount, setSipAmount] = useState('5000');
  const [sipRate, setSipRate] = useState('12');
  const [sipYears, setSipYears] = useState(10);
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPct, setStepUpPct] = useState('10');

  // Lumpsum inputs
  const [lsAmount, setLsAmount] = useState('100000');
  const [lsRate, setLsRate] = useState('12');
  const [lsYears, setLsYears] = useState(10);

  // Inflation
  const [inflationRate, setInflationRate] = useState('6');

  // Tax
  const [fundType, setFundType] = useState<'equity' | 'debt'>('equity');
  const [debtSlabRate, setDebtSlabRate] = useState('30');

  // Goal planner
  const [goalAmount, setGoalAmount] = useState('1000000');
  const [goalRate, setGoalRate] = useState('12');
  const [goalYears, setGoalYears] = useState(10);
  const [showGoal, setShowGoal] = useState(false);

  // Year table
  const [showAllYears, setShowAllYears] = useState(false);

  // ── Calculations ─────────────────────────────────────────────────────────
  const result = useMemo(() => {
    if (tab === 'sip') {
      const P = parseFloat(sipAmount);
      const r = parseFloat(sipRate);
      const y = sipYears;
      const su = parseFloat(stepUpPct);
      if (!P || !r || !y || isNaN(P) || isNaN(r) || isNaN(y) || P <= 0 || r <= 0 || y <= 0) return null;
      if (stepUpEnabled && su > 0) return calcStepUpSIP(P, r, y, su);
      return calcSIP(P, r, y);
    } else {
      const P = parseFloat(lsAmount);
      const r = parseFloat(lsRate);
      const y = lsYears;
      if (!P || !r || !y || isNaN(P) || isNaN(r) || isNaN(y) || P <= 0 || r <= 0 || y <= 0) return null;
      return calcLumpsum(P, r, y);
    }
  }, [tab, sipAmount, sipRate, sipYears, stepUpEnabled, stepUpPct, lsAmount, lsRate, lsYears]);

  const taxResult = useMemo(() => {
    if (!result) return null;
    const gains = result.returns;
    if (fundType === 'equity') {
      const tax = calcEquityTax(gains);
      const postTax = result.fv - tax;
      return { tax, postTax, label: 'LTCG @ 12.5% (₹1.25L exempt)' };
    } else {
      const slabRate = parseFloat(debtSlabRate) || 30;
      const tax = gains * (slabRate / 100);
      const postTax = result.fv - tax;
      return { tax, postTax, label: `Debt / Slab Rate @ ${slabRate}%` };
    }
  }, [result, fundType, debtSlabRate]);

  const inflationResult = useMemo(() => {
    if (!result) return null;
    const inflation = parseFloat(inflationRate);
    const years = tab === 'sip' ? sipYears : lsYears;
    if (isNaN(inflation) || inflation < 0) return null;
    const realValue = calcRealValue(result.fv, inflation, years);
    return { realValue };
  }, [result, inflationRate, tab, sipYears, lsYears]);

  // SIP vs Lumpsum comparison (same total invested)
  const comparisonResult = useMemo(() => {
    if (tab !== 'sip') return null;
    const P = parseFloat(sipAmount);
    const r = parseFloat(sipRate);
    const y = sipYears;
    const su = parseFloat(stepUpPct);
    if (!P || !r || !y || isNaN(P) || isNaN(r) || P <= 0 || r <= 0) return null;
    const sipRes = stepUpEnabled && su > 0 ? calcStepUpSIP(P, r, y, su) : calcSIP(P, r, y);
    const totalInvested = sipRes.invested;
    const lsRes = calcLumpsum(totalInvested, r, y);
    return { sipFV: sipRes.fv, lsFV: lsRes.fv, totalInvested, diff: sipRes.fv - lsRes.fv };
  }, [tab, sipAmount, sipRate, sipYears, stepUpEnabled, stepUpPct]);

  const yearRows = useMemo(() => {
    if (tab === 'sip') {
      const P = parseFloat(sipAmount);
      const r = parseFloat(sipRate);
      const su = parseFloat(stepUpPct);
      if (!P || !r || isNaN(P) || isNaN(r) || P <= 0 || r <= 0) return [];
      return buildYearTable('sip', P, r, sipYears, stepUpEnabled ? (su || 0) : 0);
    } else {
      const P = parseFloat(lsAmount);
      const r = parseFloat(lsRate);
      if (!P || !r || isNaN(P) || isNaN(r) || P <= 0 || r <= 0) return [];
      return buildYearTable('lumpsum', P, r, lsYears, 0);
    }
  }, [tab, sipAmount, sipRate, sipYears, stepUpEnabled, stepUpPct, lsAmount, lsRate, lsYears]);

  const goalResult = useMemo(() => {
    const g = parseFloat(goalAmount);
    const r = parseFloat(goalRate);
    const y = goalYears;
    if (!g || !r || !y || isNaN(g) || isNaN(r) || isNaN(y) || g <= 0 || r <= 0 || y <= 0) return null;
    return calcReverseSIP(g, r, y);
  }, [goalAmount, goalRate, goalYears]);

  const currentYears = tab === 'sip' ? sipYears : lsYears;
  const displayedRows = showAllYears ? yearRows : yearRows.slice(0, 5);
  const growthMultiple = result ? (result.fv / result.invested).toFixed(2) : null;

  // Helper to set rate preset
  const setRatePreset = (rate: number) => {
    if (tab === 'sip') setSipRate(String(rate));
    else setLsRate(String(rate));
  };
  const currentRate = tab === 'sip' ? sipRate : lsRate;

  return (
    <ToolLayout
        toolSlug="sip-calculator"
      title="SIP Calculator India"
      description="Calculate mutual fund SIP returns, lumpsum growth, CAGR, inflation-adjusted real value, post-tax corpus and year-by-year wealth. Includes step-up SIP and goal planning."
      icon="📈"
      relatedTools={[
        { name: 'Home Loan EMI Calculator', href: '/tools/home-loan-emi-calculator', icon: '🏠' },
        { name: 'In-Hand Salary Calculator', href: '/tools/hand-salary-calculator', icon: '💼' },
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '🧾' },
      ]}
      faqs={[
        {
          q: 'Is this SIP calculator free?',
          a: 'Yes, completely free. No login or payment required. You can calculate SIP returns, lumpsum growth, and goal planning as many times as you like.',
        },
        {
          q: 'What does this SIP calculator compute?',
          a: 'It calculates the future value of your SIP or lumpsum investment, total amount invested, total returns, CAGR, and absolute return percentage. It also shows inflation-adjusted real value, post-tax corpus (LTCG for equity funds or slab rate for debt funds), a year-by-year growth table, SIP vs lumpsum comparison, and a reverse SIP goal planner that tells you how much to invest monthly to reach a target corpus.',
        },
        {
          q: 'How do I use the SIP calculator?',
          a: 'Select SIP or Lumpsum tab. For SIP: enter monthly investment amount, expected annual return rate (use presets — 8% conservative, 12% moderate, 15% aggressive), and investment period in years. Optionally enable Step-up SIP to increase your investment annually. Set inflation rate and fund type for post-tax and real-value calculations. Results update instantly.',
        },
        {
          q: 'What return rate should I use for SIP calculations?',
          a: 'This depends on the fund type. Large-cap equity mutual funds have historically delivered around 10–12% CAGR over long periods. Mid/small-cap funds may deliver higher returns (12–15%) but with higher risk. Debt funds typically return 6–8%. These are estimates — actual returns vary and past performance does not guarantee future results.',
        },
        {
          q: 'Are the SIP return calculations accurate? Is this a disclaimer?',
          a: 'The calculator uses standard compound interest formulas (future value of annuity) and is mathematically accurate. However, mutual fund returns are market-linked and not guaranteed. The results shown are projections based on a fixed assumed rate. Actual returns will vary based on market conditions, fund selection, and timing. This tool is for educational and planning purposes only — consult a SEBI-registered financial advisor before investing.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Country selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-stone-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-900">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="card space-y-5">
          <div className="flex gap-1 bg-stone-50/60 rounded-xl p-1 w-fit">
            {(['sip', 'lumpsum'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {t === 'sip' ? 'SIP' : 'Lumpsum'}
              </button>
            ))}
          </div>

          {/* Return Rate Presets */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Conservative', rate: 8, color: 'bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30' },
                { label: 'Moderate', rate: 12, color: 'bg-violet-600/20 border-violet-500/30 text-violet-700 hover:bg-violet-600/30' },
                { label: 'Aggressive', rate: 15, color: 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30' },
              ].map(({ label, rate, color }) => (
                <button
                  key={rate}
                  onClick={() => setRatePreset(rate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${color} ${
                    currentRate === String(rate) ? 'ring-1 ring-offset-1 ring-offset-gray-900 ring-current' : ''
                  }`}
                >
                  {label} ({rate}%)
                </button>
              ))}
            </div>
          </div>

          {tab === 'sip' ? (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Monthly Investment Amount (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="100"
                    step="100"
                    placeholder="5000"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Expected Annual Return (%)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    placeholder="12"
                    value={sipRate}
                    onChange={(e) => setSipRate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="label mb-0">Investment Period</label>
                  <span className="text-sm text-violet-600 font-semibold">{sipYears} years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-stone-600 mt-1">
                  <span>1 yr</span><span>30 yrs</span>
                </div>
              </div>

              {/* Step-up SIP */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">Step-up SIP</p>
                    <p className="text-xs text-stone-500">Increase SIP annually to grow wealth faster</p>
                  </div>
                  <button
                    onClick={() => setStepUpEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      stepUpEnabled ? 'bg-violet-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        stepUpEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {stepUpEnabled && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="label mb-0">Annual SIP Increase</label>
                      <span className="text-sm text-violet-600 font-semibold">{stepUpPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      step={1}
                      value={stepUpPct}
                      onChange={(e) => setStepUpPct(e.target.value)}
                      className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-stone-600 mt-1">
                      <span>0%</span><span>25%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Investment Amount (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="100000"
                    value={lsAmount}
                    onChange={(e) => setLsAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Expected Annual Return (%)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    placeholder="12"
                    value={lsRate}
                    onChange={(e) => setLsRate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="label mb-0">Investment Period</label>
                  <span className="text-sm text-violet-600 font-semibold">{lsYears} years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={lsYears}
                  onChange={(e) => setLsYears(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-stone-600 mt-1">
                  <span>1 yr</span><span>30 yrs</span>
                </div>
              </div>
            </div>
          )}

          {/* Inflation & Tax settings */}
          <div className="border-t border-stone-200 pt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Inflation Rate (%)</label>
              <input
                className="input"
                type="number"
                min="0"
                max="20"
                step="0.5"
                placeholder="6"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Fund / Tax Type</label>
              <div className="flex gap-1 bg-stone-50/60 rounded-xl p-1 w-fit mt-1">
                {(['equity', 'debt'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFundType(t)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      fundType === t
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {t === 'equity' ? 'Equity / MF (LTCG)' : 'Debt (Slab Rate)'}
                  </button>
                ))}
              </div>
              {fundType === 'debt' && (
                <div className="mt-2">
                  <label className="label">Your Tax Slab (%)</label>
                  <select
                    className="input"
                    value={debtSlabRate}
                    onChange={(e) => setDebtSlabRate(e.target.value)}
                  >
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                    <option value="30">30%</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <>
            {/* Stat boxes */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card text-center py-5">
                <p className="text-2xl font-bold text-stone-700">{fmtINR(result.invested)}</p>
                <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Invested Amount</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-2xl font-bold text-emerald-700">{fmtINR(result.returns)}</p>
                <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Total Returns</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-2xl font-bold text-violet-600">{fmtINR(result.fv)}</p>
                <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Total Value (Nominal)</p>
                {inflationResult && (
                  <p className="text-xs text-amber-700 mt-1">
                    Real: {fmtINR(inflationResult.realValue)}
                  </p>
                )}
              </div>
            </div>

            {/* Nominal vs Real Value + Tax */}
            <div className="card space-y-4">
              {/* Inflation card */}
              {inflationResult && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Inflation-Adjusted Value ({inflationRate}% p.a.)</p>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs text-stone-500">Nominal (Future ₹)</p>
                      <p className="text-lg font-bold text-stone-900">{fmtINR(result.fv)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Real Value (Today&apos;s ₹)</p>
                      <p className="text-lg font-bold text-amber-700">{fmtINR(inflationResult.realValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Purchasing Power Lost</p>
                      <p className="text-lg font-bold text-red-600">{fmtINR(result.fv - inflationResult.realValue)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax card */}
              {taxResult && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Post-Tax Corpus — {taxResult.label}</p>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs text-stone-500">Gross Corpus</p>
                      <p className="text-lg font-bold text-stone-900">{fmtINR(result.fv)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">
                        {fundType === 'equity' ? 'LTCG Tax' : 'Tax on Gains'}
                      </p>
                      <p className="text-lg font-bold text-red-600">− {fmtINR(taxResult.tax)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Net Post-Tax Corpus</p>
                      <p className="text-lg font-bold text-emerald-700">{fmtINR(taxResult.postTax)}</p>
                    </div>
                  </div>
                  {fundType === 'equity' && (
                    <p className="text-xs text-stone-600 mt-2">* LTCG: ₹1.25L of gains exempt, remainder taxed at 12.5% (as per Finance Act 2024)</p>
                  )}
                </div>
              )}
            </div>

            {/* Growth multiple + CAGR + Absolute Returns */}
            <div className="card">
              <div className="flex flex-wrap gap-6 mb-5">
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Wealth Gained</p>
                  <p className="text-lg font-bold text-stone-900">
                    Your money grew <span className="text-violet-600">{growthMultiple}x</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">CAGR on Invested</p>
                  <p className="text-lg font-bold text-amber-700">{fmtPct(result.cagr)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Absolute Returns %</p>
                  <p className="text-lg font-bold text-emerald-700">{result.absReturns.toFixed(1)}%</p>
                </div>
              </div>

              {/* Invested vs Returns donut */}
              <PieChart segments={[
                { label: 'Amount Invested', value: result.invested, color: '#6b7280' },
                { label: 'Total Returns (Gains)', value: result.returns, color: '#10b981' },
              ]} />
            </div>

            {/* SIP vs Lumpsum Comparison */}
            {comparisonResult && (
              <div className="card">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">SIP vs Lumpsum Comparison</h3>
                <p className="text-xs text-stone-500 mb-4">
                  Same total invested ({fmtINR(comparisonResult.totalInvested)}): SIP monthly vs all at start
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 px-3 text-stone-500 font-medium">Mode</th>
                        <th className="text-right py-2 px-3 text-stone-500 font-medium">Total Invested</th>
                        <th className="text-right py-2 px-3 text-stone-500 font-medium">Final Value</th>
                        <th className="text-right py-2 px-3 text-stone-500 font-medium">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-stone-200 bg-violet-500/5">
                        <td className="py-2 px-3 text-violet-700 font-medium">SIP (Monthly)</td>
                        <td className="py-2 px-3 text-right text-stone-700">{fmtINR(comparisonResult.totalInvested)}</td>
                        <td className="py-2 px-3 text-right text-violet-600 font-semibold">{fmtINR(comparisonResult.sipFV)}</td>
                        <td className="py-2 px-3 text-right text-stone-500">—</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="py-2 px-3 text-amber-300 font-medium">Lumpsum (At Start)</td>
                        <td className="py-2 px-3 text-right text-stone-700">{fmtINR(comparisonResult.totalInvested)}</td>
                        <td className="py-2 px-3 text-right text-amber-700 font-semibold">{fmtINR(comparisonResult.lsFV)}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={comparisonResult.diff >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                            {comparisonResult.diff >= 0 ? '+' : ''}{fmtINR(comparisonResult.diff)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  {comparisonResult.diff >= 0
                    ? 'SIP benefits from rupee cost averaging — lumpsum wins when market only rises.'
                    : 'Lumpsum wins here because compounding starts earlier on full corpus.'}
                </p>
              </div>
            )}

            {/* Year-by-year table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">Year-by-Year Growth</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 px-3 text-stone-500 font-medium">Year</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Invested</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Returns</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.map((row) => (
                      <tr key={row.year} className="border-b border-stone-200 hover:bg-stone-50/30">
                        <td className="py-2 px-3 text-stone-500">Year {row.year}</td>
                        <td className="py-2 px-3 text-right text-stone-700">{fmtINR(row.invested)}</td>
                        <td className="py-2 px-3 text-right text-emerald-700">{fmtINR(row.returns)}</td>
                        <td className="py-2 px-3 text-right text-violet-600 font-semibold">{fmtINR(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {yearRows.length > 5 && (
                <button
                  onClick={() => setShowAllYears((v) => !v)}
                  className="mt-3 text-xs text-violet-600 hover:text-violet-700 transition-colors w-full text-center"
                >
                  {showAllYears ? 'Show less' : `Show all ${currentYears} years`}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="card text-center py-8 text-stone-500 text-sm">
            Enter valid investment details above to see results.
          </div>
        )}

        {/* Goal Planning */}
        <div className="card">
          <button
            onClick={() => setShowGoal((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <p className="text-sm font-semibold text-stone-900">Goal Planning Calculator</p>
              <p className="text-xs text-stone-500 mt-0.5">How much should I invest monthly to reach my goal?</p>
            </div>
            <span className="text-stone-500 text-lg">{showGoal ? '−' : '+'}</span>
          </button>

          {showGoal && (
            <div className="mt-5 space-y-4 pt-4 border-t border-stone-200">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Target Amount (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="1000"
                    step="10000"
                    placeholder="1000000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Expected Return (%)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    placeholder="12"
                    value={goalRate}
                    onChange={(e) => setGoalRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Time Period (years)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="40"
                    placeholder="10"
                    value={goalYears}
                    onChange={(e) => setGoalYears(Number(e.target.value))}
                  />
                </div>
              </div>

              {goalResult ? (
                <div className="bg-violet-50 border border-violet-500/20 rounded-xl p-4 flex items-center gap-4">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Required Monthly SIP</p>
                    <p className="text-2xl font-bold text-violet-600 mt-1">{fmtINR(goalResult)}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Invest {fmtINR(goalResult)}/month at {goalRate}% p.a. for {goalYears} years to accumulate{' '}
                      {fmtINR(parseFloat(goalAmount))}.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Enter all values above to calculate.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
