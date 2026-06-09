'use client';

import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Share2, Check, Flame, TrendingUp } from 'lucide-react';

const RELATED = [
  { name: 'SIP Calculator', href: '/tools/sip-calculator', icon: '📈' },
  { name: 'Home Loan EMI Calculator', href: '/tools/home-loan-emi-calculator', icon: '🏠' },
  { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '🧮' },
];

const CURRENCIES = [
  { symbol: '$', label: 'USD' },
  { symbol: '₹', label: 'INR' },
  { symbol: '£', label: 'GBP' },
  { symbol: '€', label: 'EUR' },
  { symbol: 'A$', label: 'AUD' },
  { symbol: 'C$', label: 'CAD' },
];

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  return Math.round(n).toLocaleString('en-US');
}

interface FireResult {
  fireNumber: number;
  leanNumber: number;
  fatNumber: number;
  coastNumber: number;
  yearsToFire: number | null;   // null = never at current savings rate
  fireAge: number | null;
  alreadyFire: boolean;
  alreadyCoast: boolean;
  savingsRate: number;
  monthlySavings: number;
  milestones: { label: string; portfolio: number; age: number }[];
}

function calcYearsTo(target: number, principal: number, monthlySavings: number, realReturn: number): number | null {
  if (principal >= target) return 0;
  const r = realReturn / 12;
  let bal = principal;
  for (let m = 1; m <= 12 * 80; m++) {
    bal = bal * (1 + r) + monthlySavings;
    if (bal >= target) return m / 12;
  }
  return null;
}

function calcFire(
  age: number, savings: number, income: number, expenses: number,
  returnPct: number, inflationPct: number, swrPct: number,
): FireResult {
  const realReturn = (1 + returnPct / 100) / (1 + inflationPct / 100) - 1;
  const monthlySavings = Math.max(0, (income - expenses) / 12);
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

  const fireNumber  = expenses * (100 / swrPct);
  const leanNumber  = expenses * 0.6 * (100 / swrPct);
  const fatNumber   = expenses * 1.5 * (100 / swrPct);
  // Coast FIRE: portfolio that grows untouched to fireNumber by age 65
  const yearsTo65 = Math.max(0, 65 - age);
  const coastNumber = fireNumber / Math.pow(1 + realReturn, yearsTo65);

  const yearsToFire = calcYearsTo(fireNumber, savings, monthlySavings, realReturn);

  const milestones = [
    { label: '☕ Coast FIRE', target: coastNumber },
    { label: '🌱 Lean FIRE', target: leanNumber },
    { label: '🔥 FIRE', target: fireNumber },
    { label: '👑 Fat FIRE', target: fatNumber },
  ].map(m => {
    const yrs = calcYearsTo(m.target, savings, monthlySavings, realReturn);
    return { label: m.label, portfolio: m.target, age: yrs === null ? -1 : Math.round((age + yrs) * 10) / 10 };
  });

  return {
    fireNumber, leanNumber, fatNumber, coastNumber,
    yearsToFire,
    fireAge: yearsToFire === null ? null : Math.round((age + yearsToFire) * 10) / 10,
    alreadyFire: savings >= fireNumber,
    alreadyCoast: savings >= coastNumber,
    savingsRate,
    monthlySavings,
    milestones,
  };
}

function SliderInput({ label, value, onChange, min, max, step, suffix, prefix }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; suffix?: string; prefix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">{label}</label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm text-gray-400">{prefix}</span>}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(Number(e.target.value) || 0)}
            className="input w-28 py-1.5 text-right text-sm"
          />
          {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        value={Math.min(value, max)}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
    </div>
  );
}

export default function FireCalculatorPage() {
  const [currency, setCurrency]   = useState('$');
  const [age, setAge]             = useState(30);
  const [savings, setSavings]     = useState(50000);
  const [income, setIncome]       = useState(80000);
  const [expenses, setExpenses]   = useState(48000);
  const [returnPct, setReturnPct] = useState(8);
  const [inflation, setInflation] = useState(3);
  const [swr, setSwr]             = useState(4);
  const [copied, setCopied]       = useState(false);

  const r = useMemo(
    () => calcFire(age, savings, income, expenses, returnPct, inflation, swr),
    [age, savings, income, expenses, returnPct, inflation, swr],
  );

  function share() {
    const text = r.fireAge !== null
      ? `🔥 My FIRE number is ${currency}${fmt(r.fireNumber)} — on track to retire at ${Math.round(r.fireAge)}! Find yours free:`
      : `🔥 I just calculated my FIRE number: ${currency}${fmt(r.fireNumber)}. Find yours free:`;
    navigator.clipboard.writeText(`${text} https://formly.tools/tools/fire-calculator`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout
      toolSlug="fire-calculator"
      title="FIRE Calculator"
      description="When can you retire early? Get your FIRE number, exact retirement age, and Lean / Fat / Coast FIRE milestones — calculated live with the 4% rule."
      icon="🔥"
      relatedTools={RELATED}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="card space-y-5">
          <div>
            <label className="label">Currency</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCurrency(c.symbol)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                    currency === c.symbol
                      ? 'bg-orange-600/20 border-orange-500/50 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {c.symbol} {c.label}
                </button>
              ))}
            </div>
          </div>

          <SliderInput label="Current Age" value={age} onChange={setAge} min={16} max={70} step={1} suffix="yrs" />
          <SliderInput label="Invested Savings Today" value={savings} onChange={setSavings} min={0} max={2_000_000} step={5000} prefix={currency} />
          <SliderInput label="Annual Post-Tax Income" value={income} onChange={setIncome} min={0} max={1_000_000} step={1000} prefix={currency} />
          <SliderInput label="Annual Expenses" value={expenses} onChange={setExpenses} min={0} max={500_000} step={1000} prefix={currency} />
          <SliderInput label="Expected Annual Return" value={returnPct} onChange={setReturnPct} min={1} max={15} step={0.5} suffix="%" />
          <SliderInput label="Inflation" value={inflation} onChange={setInflation} min={0} max={10} step={0.5} suffix="%" />
          <SliderInput label="Safe Withdrawal Rate" value={swr} onChange={setSwr} min={2.5} max={6} step={0.25} suffix="%" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Your FIRE Number</span>
            </div>
            <p className="text-4xl font-extrabold text-white">{currency}{fmt(r.fireNumber)}</p>
            <p className="text-sm text-gray-400 mt-1">
              {currency}{fmt(expenses)}/yr expenses ÷ {swr}% withdrawal rate
            </p>
          </div>

          <div className="card">
            {r.alreadyFire ? (
              <p className="text-emerald-400 font-bold text-xl">🎉 You are already financially independent!</p>
            ) : r.fireAge !== null ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Retirement Age</span>
                </div>
                <p className="text-4xl font-extrabold text-white">{Math.round(r.fireAge)}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {r.yearsToFire!.toFixed(1)} years away, saving {currency}{fmt(r.monthlySavings)}/month
                  ({r.savingsRate.toFixed(0)}% savings rate)
                </p>
              </>
            ) : (
              <p className="text-amber-400 text-sm leading-relaxed">
                At your current savings rate you won&apos;t reach FIRE. Increase income, cut expenses,
                or raise your expected return to see a retirement age.
              </p>
            )}
          </div>

          {/* Milestones */}
          <div className="card">
            <h2 className="font-semibold text-white mb-3">Your FIRE Milestones</h2>
            <div className="space-y-2.5">
              {r.milestones.map(m => (
                <div key={m.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                  <div>
                    <p className="text-sm font-medium text-white">{m.label}</p>
                    <p className="text-xs text-gray-500">{currency}{fmt(m.portfolio)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-300">
                    {m.age === -1 ? '—' : m.age <= age ? '✅ Done' : `age ${Math.round(m.age)}`}
                  </p>
                </div>
              ))}
            </div>
            {r.alreadyCoast && !r.alreadyFire && (
              <p className="text-xs text-emerald-400 mt-3">
                ☕ You&apos;ve hit Coast FIRE — your current portfolio alone will fund retirement at 65.
              </p>
            )}
          </div>

          <button onClick={share} className="btn-primary w-full justify-center py-3">
            {copied ? <><Check className="w-4 h-4" /> Copied to clipboard!</> : <><Share2 className="w-4 h-4" /> Share My FIRE Age</>}
          </button>
        </div>
      </div>

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">Free FIRE Calculator — Financial Independence, Retire Early</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-3">
          FIRE (Financial Independence, Retire Early) is simple math: once your investments equal roughly
          25× your annual expenses, a 4% annual withdrawal can fund your lifestyle indefinitely — that&apos;s
          the famous <strong className="text-gray-300">4% rule</strong> from the Trinity Study. This calculator
          shows your FIRE number, the exact age you&apos;ll reach it at your current savings rate, and three
          popular variants: <strong className="text-gray-300">Lean FIRE</strong> (a frugal 60%-of-expenses budget),
          <strong className="text-gray-300"> Fat FIRE</strong> (a comfortable 150% budget), and
          <strong className="text-gray-300"> Coast FIRE</strong> (enough saved that growth alone funds retirement at 65).
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          All projections use inflation-adjusted (real) returns, so results are in today&apos;s money. Everything
          runs in your browser — your financial data never leaves your device. Pair it with our{' '}
          <a href="/tools/sip-calculator" className="text-orange-400 hover:underline">SIP calculator</a> to plan
          monthly investing, or the{' '}
          <a href="/tools/income-tax-calculator" className="text-orange-400 hover:underline">income tax calculator</a>{' '}
          to maximize post-tax savings.
        </p>
      </div>
    </ToolLayout>
  );
}
