'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtPct = (n: number) => n.toFixed(1) + '%';

// ─── Tax slabs — FY 2026-27 / AY 2027-28 ─────────────────────────────────────
function calcNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0, prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    tax += (Math.min(taxableIncome, slab.limit) - prev) * slab.rate;
    prev = slab.limit;
  }
  // 87A rebate: taxable ≤ ₹12L → zero tax (max rebate ₹60,000)
  if (taxableIncome <= 1200000) return 0;
  // Marginal relief: net tax can't exceed excess over ₹12L
  return Math.min(tax, taxableIncome - 1200000);
}

function calcOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  // 87A rebate: taxable ≤ ₹5L → zero tax (max rebate ₹12,500)
  if (taxableIncome <= 500000) return 0;
  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0, prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    tax += (Math.min(taxableIncome, slab.limit) - prev) * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

// ─── Professional Tax ─────────────────────────────────────────────────────────
type PTState = 'AP' | 'KA' | 'MH' | 'TN' | 'WB' | 'TS' | 'GJ' | 'MP' | 'KL' | 'OTHER';
interface PTOption { code: PTState; label: string; annual: (mb: number) => number; note: string; }
const PT_STATES: PTOption[] = [
  { code: 'KA', label: 'Karnataka', note: '₹200/month', annual: () => 2400 },
  { code: 'MH', label: 'Maharashtra', note: 'Slab-based', annual: (mb) => mb <= 7500 ? 0 : mb <= 10000 ? 175 * 12 : 200 * 11 + 300 },
  { code: 'AP', label: 'Andhra Pradesh', note: '₹200/month', annual: () => 2400 },
  { code: 'TS', label: 'Telangana', note: '₹200/month', annual: () => 2400 },
  { code: 'TN', label: 'Tamil Nadu', note: '₹180/month', annual: () => 2160 },
  { code: 'WB', label: 'West Bengal', note: '₹110/month', annual: () => 1320 },
  { code: 'GJ', label: 'Gujarat', note: '₹200/month', annual: () => 2400 },
  { code: 'MP', label: 'Madhya Pradesh', note: '₹208/month (cap ₹2,500)', annual: () => 2500 },
  { code: 'KL', label: 'Kerala', note: '₹208/month', annual: () => 2496 },
  { code: 'OTHER', label: 'Other / Enter manually', note: '', annual: () => 0 },
];

// ─── SVG Pie Chart ────────────────────────────────────────────────────────────
interface PieSegment { label: string; value: number; color: string; }
function PieChart({ segments }: { segments: PieSegment[] }) {
  const filtered = segments.filter(s => s.value > 0.5);
  const total = filtered.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;
  const cx = 80, cy = 80, r = 70, gap = 1.5;
  let cum = 0;
  const slices = filtered.map(s => {
    const start = (cum / total) * 2 * Math.PI - Math.PI / 2;
    cum += s.value;
    const end = (cum / total) * 2 * Math.PI - Math.PI / 2;
    return { ...s, start, end, pct: (s.value / total) * 100 };
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0">
        {slices.map((s, i) => {
          const span = s.end - s.start - gap / r;
          if (span <= 0) return null;
          const x1 = cx + r * Math.cos(s.start + gap / r / 2);
          const y1 = cy + r * Math.sin(s.start + gap / r / 2);
          const x2 = cx + r * Math.cos(s.end - gap / r / 2);
          const y2 = cy + r * Math.sin(s.end - gap / r / 2);
          const large = span > Math.PI ? 1 : 0;
          return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={s.color} opacity={0.9} />;
        })}
        <circle cx={cx} cy={cy} r={30} fill="#111827" />
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-gray-300 truncate flex-1">{s.label}</span>
            <span className="text-gray-400 flex-shrink-0">{fmtPct(s.pct)}</span>
            <span className="text-gray-500 flex-shrink-0 hidden sm:block">{fmtINR(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Percent input helper ─────────────────────────────────────────────────────
function PctInput({ value, onChange, min = 0, max = 100, step = 1 }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="relative">
      <input
        className="input pr-8"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">%</span>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HandSalaryCalculatorPage() {
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  // Core CTC
  const [ctc, setCtc] = useState('1200000');
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(50);
  const [otherAllowPct, setOtherAllowPct] = useState(10);

  // HRA exemption — old regime only
  const [isMetro, setIsMetro] = useState(true);
  const [rentPaid, setRentPaid] = useState('0');

  // Additional
  const [bonusPay, setBonusPay] = useState('0');
  const [ltaAnnual, setLtaAnnual] = useState('0');
  const [ltaExemptClaimed, setLtaExemptClaimed] = useState(false);
  const [foodCoupons, setFoodCoupons] = useState('0');

  // PF
  const [pfEnabled, setPfEnabled] = useState(true);
  const [pfPct, setPfPct] = useState(12);

  // NPS employer
  const [npsEmpPct, setNpsEmpPct] = useState(0);

  // PT
  const [ptState, setPtState] = useState<PTState>('KA');
  const [manualPtMonthly, setManualPtMonthly] = useState('200');

  const result = useMemo(() => {
    const annualCTC = parseFloat(ctc);
    if (!annualCTC || isNaN(annualCTC) || annualCTC <= 0) return null;

    const bPct = Math.max(0, Math.min(100, basicPct || 0));
    const hPct = Math.max(0, Math.min(100, hraPct || 0));
    const oPct = Math.max(0, Math.min(100, otherAllowPct || 0));

    const basic = annualCTC * (bPct / 100);
    const hra = basic * (hPct / 100);
    const otherAllowances = annualCTC * (oPct / 100);
    const bonus = Math.max(0, parseFloat(bonusPay) || 0);
    const lta = Math.max(0, parseFloat(ltaAnnual) || 0);
    const food = Math.max(0, parseFloat(foodCoupons) || 0);

    const pfRate = pfEnabled ? Math.max(0, Math.min(12, pfPct)) / 100 : 0;
    const pfEmployee = basic * pfRate;
    const pfEmployer = basic * pfRate;

    const npsEmpPctClamped = Math.max(0, Math.min(10, npsEmpPct));
    const npsEmp = basic * (npsEmpPctClamped / 100);

    const gratuity = basic * 0.0481;

    const monthlyBasic = basic / 12;
    const ptOption = PT_STATES.find(s => s.code === ptState)!;
    const profTaxAnnual = ptState === 'OTHER'
      ? Math.min((parseFloat(manualPtMonthly) || 0) * 12, 2500)
      : Math.min(ptOption.annual(monthlyBasic), 2500);

    const specialAllowance = Math.max(
      0,
      annualCTC - basic - hra - otherAllowances - bonus - lta - food
        - pfEmployer - npsEmp - gratuity,
    );

    const grossSalary = basic + hra + otherAllowances + bonus + lta + food + specialAllowance;

    // HRA exemption — old regime only
    const rentAnnual = (parseFloat(rentPaid) || 0) * 12;
    let hraExemption = 0;
    if (regime === 'old' && rentAnnual > 0) {
      hraExemption = Math.min(
        hra,
        Math.max(0, rentAnnual - 0.1 * basic),
        basic * (isMetro ? 0.5 : 0.4),
      );
    }
    const hraTaxable = hra - hraExemption;

    const ltaExempt = (regime === 'old' && ltaExemptClaimed) ? lta : 0;
    const ltaTaxable = lta - ltaExempt;

    // Food: exempt under perquisite valuation rules in old regime only
    const foodExempt = regime === 'old' ? Math.min(food, 26400) : 0;
    const foodTaxable = food - foodExempt;

    // New regime: std deduction ₹75K + PT + NPS 80CCD(2). No HRA/LTA/80C.
    const taxableNew = Math.max(0, grossSalary - 75000 - profTaxAnnual - npsEmp);
    const baseTaxNew = calcNewRegimeTax(taxableNew);
    const totalTaxNew = baseTaxNew * 1.04; // + 4% cess

    // Old regime: std deduction ₹50K + PT + HRA + LTA + food + 80C (PF) + NPS 80CCD(2)
    const deductions80C = Math.min(pfEmployee, 150000);
    const taxableOld = Math.max(0,
      grossSalary - hraExemption - ltaExempt - foodExempt
        - 50000 - profTaxAnnual - deductions80C - npsEmp,
    );
    const baseTaxOld = calcOldRegimeTax(taxableOld);
    const totalTaxOld = baseTaxOld * 1.04;

    const activeTax = regime === 'new' ? totalTaxNew : totalTaxOld;
    const activeMonthlyTax = activeTax / 12;
    const monthlyPF = pfEmployee / 12;
    const monthlyProfTax = profTaxAnnual / 12;
    const monthlyGross = grossSalary / 12;
    const monthlyTakeHome = monthlyGross - monthlyPF - monthlyProfTax - activeMonthlyTax;
    const annualTakeHome = monthlyTakeHome * 12;

    const newSavings = totalTaxOld - totalTaxNew;
    const betterRegime: 'new' | 'old' = newSavings >= 0 ? 'new' : 'old';

    return {
      basic, hra, hraTaxable, hraExemption,
      lta, ltaTaxable, ltaExempt,
      food, foodTaxable, foodExempt,
      bonus, otherAllowances, specialAllowance,
      npsEmp, pfEmployee, pfEmployer, gratuity, grossSalary,
      profTaxAnnual, taxableNew, taxableOld,
      totalTaxNew, totalTaxOld, activeTax, activeMonthlyTax,
      monthlyGross, monthlyPF, monthlyProfTax,
      monthlyTakeHome, annualTakeHome,
      betterRegime, savings: Math.abs(newSavings), newSavings,
      deductions80C,
    };
  }, [
    ctc, basicPct, hraPct, isMetro, rentPaid, otherAllowPct, regime,
    bonusPay, ltaAnnual, ltaExemptClaimed, foodCoupons,
    pfEnabled, pfPct, npsEmpPct, ptState, manualPtMonthly,
  ]);

  const annualCTCNum = parseFloat(ctc) || 0;

  return (
    <ToolLayout
        toolSlug="hand-salary-calculator"
      title="In-Hand Salary Calculator — FY 2026-27"
      description="Calculate your exact in-hand salary from CTC. FY 2026-27 tax slabs, new vs old regime comparison, EPF/NPS account breakdown, HRA exemption, and full payslip."
      icon="🧮"
      relatedTools={[
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '📊' },
        { name: 'HRA Calculator', href: '/tools/hra-calculator', icon: '🏠' },
        { name: 'Home Loan EMI', href: '/tools/home-loan-emi-calculator', icon: '🏡' },
      ]}
    >
      <div className="space-y-6">

        {/* Country */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white">
            <option value="IN">🇮🇳 India</option>
            <option disabled>🇺🇸 USA (coming soon)</option>
            <option disabled>🇬🇧 UK (coming soon)</option>
          </select>
        </div>

        {/* ── REGIME ── */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-white">
            Tax Regime <span className="text-gray-500 font-normal">— FY 2026-27 (AY 2027-28)</span>
          </h2>
          <div className="flex rounded-xl overflow-hidden border border-gray-700">
            <button
              onClick={() => setRegime('new')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${regime === 'new' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
            >
              New Regime <span className="text-xs opacity-70">(default)</span>
            </button>
            <button
              onClick={() => setRegime('old')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${regime === 'old' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
            >
              Old Regime
            </button>
          </div>
          {regime === 'new' ? (
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>• Std deduction ₹75,000 &nbsp;• 87A rebate ₹60,000 → <span className="text-gray-300">zero tax up to ₹12L income</span></p>
              <p>• Salaried with ≤ ₹12.75L gross pay <span className="text-gray-300">zero tax</span> after std deduction</p>
              <p>• HRA &amp; LTA <span className="text-amber-400/80">not exempt</span> &nbsp;• No 80C &nbsp;• NPS employer 80CCD(2) <span className="text-emerald-400/80">allowed</span></p>
            </div>
          ) : (
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>• Std deduction ₹50,000 &nbsp;• 87A rebate ₹12,500 → zero tax up to ₹5L income</p>
              <p>• HRA exempt (rent-based) &nbsp;• LTA exempt (2 journeys/4yr) &nbsp;• 80C up to ₹1.5L</p>
              <p>• NPS employer 80CCD(2) <span className="text-emerald-400/80">allowed</span> in old regime too</p>
            </div>
          )}
        </div>

        {/* ── SALARY STRUCTURE ── */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Salary Structure</h2>

          <div>
            <label className="label">Annual CTC (₹)</label>
            <input className="input" type="number" min="0" step="10000" placeholder="12,00,000"
              value={ctc} onChange={e => setCtc(e.target.value)} />
            {annualCTCNum > 0 && <p className="text-xs text-gray-500 mt-1">≈ {fmtINR(annualCTCNum / 12)}/month CTC</p>}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">
                Basic Salary % of CTC
                {result && <span className="text-gray-500 ml-1 font-normal text-xs">({fmtINR(result.basic)}/yr)</span>}
              </label>
              <PctInput value={basicPct} onChange={setBasicPct} min={0} max={100} />
              <p className="text-xs text-gray-500 mt-1">Typical: 40–50%</p>
            </div>
            <div>
              <label className="label">
                HRA % of Basic
                {result && <span className="text-gray-500 ml-1 font-normal text-xs">({fmtINR(result.hra)}/yr)</span>}
              </label>
              <PctInput value={hraPct} onChange={setHraPct} min={0} max={100} />
              <p className="text-xs text-gray-500 mt-1">Metro 50% · Non-metro 40%</p>
            </div>
            <div>
              <label className="label">
                Other Allowances % of CTC
                {result && <span className="text-gray-500 ml-1 font-normal text-xs">({fmtINR(result.otherAllowances)}/yr)</span>}
              </label>
              <PctInput value={otherAllowPct} onChange={setOtherAllowPct} min={0} max={100} />
              <p className="text-xs text-gray-500 mt-1">Conveyance, phone, etc.</p>
            </div>
          </div>
        </div>

        {/* ── HRA EXEMPTION — old regime only ── */}
        {regime === 'old' && (
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white">
              HRA Exemption <span className="text-gray-500 font-normal">(Old Regime)</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Monthly Rent Paid (₹)</label>
                <input className="input" type="number" min="0" step="500" placeholder="0"
                  value={rentPaid} onChange={e => setRentPaid(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">Enter 0 if not claiming HRA exemption</p>
              </div>
              <div>
                <label className="label">City Type</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-700">
                  <button onClick={() => setIsMetro(true)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isMetro ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                    Metro (50%)
                  </button>
                  <button onClick={() => setIsMetro(false)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isMetro ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                    Non-Metro (40%)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Metro: Delhi, Mumbai, Chennai, Kolkata</p>
              </div>
            </div>
            {result && result.hraExemption > 0 && (
              <p className="text-xs text-emerald-400/80 bg-emerald-400/5 border border-emerald-400/20 rounded-lg px-3 py-2">
                HRA exempt: {fmtINR(result.hraExemption)}/yr &nbsp;·&nbsp; Taxable HRA: {fmtINR(result.hraTaxable)}/yr
              </p>
            )}
          </div>
        )}

        {regime === 'new' && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-300/80">
            <span className="font-semibold">New regime:</span> HRA is a payslip component but <strong>not exempt</strong>. Rent deduction is unavailable. Switch to Old Regime to claim HRA exemption.
          </div>
        )}

        {/* ── BONUS & ALLOWANCES ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Bonus &amp; Additional Allowances</h2>
          <p className="text-xs text-gray-500 -mt-1">Annual amounts. Leave 0 if not part of your CTC.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Bonus / Variable Pay (₹/year)</label>
              <input className="input" type="number" min="0" step="1000" placeholder="0"
                value={bonusPay} onChange={e => setBonusPay(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Fully taxable in both regimes</p>
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                LTA — Leave Travel Allowance (₹/year)
                <span title="Old regime: actual travel costs exempt, up to 2 journeys in 4-year block. New regime: fully taxable."
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input className="input" type="number" min="0" step="1000" placeholder="0"
                value={ltaAnnual} onChange={e => setLtaAnnual(e.target.value)} />
              {regime === 'old' && (parseFloat(ltaAnnual) || 0) > 0 && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" className="accent-violet-500 w-4 h-4"
                    checked={ltaExemptClaimed} onChange={e => setLtaExemptClaimed(e.target.checked)} />
                  <span className="text-xs text-gray-400">Claim LTA exemption this year (old regime)</span>
                </label>
              )}
              {regime === 'new' && (parseFloat(ltaAnnual) || 0) > 0 && (
                <p className="text-xs text-amber-400/80 mt-1">Taxable under new regime</p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                Food Coupons / Meal Allowance (₹/year)
                <span title="Old regime: exempt up to ₹50/meal × 2 × 22 days × 12 = ₹26,400/year. New regime: fully taxable."
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input className="input" type="number" min="0" step="1000" placeholder="0"
                value={foodCoupons} onChange={e => setFoodCoupons(e.target.value)} />
              {(parseFloat(foodCoupons) || 0) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {regime === 'old'
                    ? `Exempt: ${fmtINR(Math.min(parseFloat(foodCoupons) || 0, 26400))}/yr (cap ₹26,400)`
                    : 'Fully taxable under new regime'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── PF & NPS ── */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Provident Fund &amp; NPS</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="label mb-0">EPF (Employee Provident Fund)</label>
                <p className="text-xs text-gray-500 mt-0.5">Employee &amp; employer contribute same rate</p>
              </div>
              <button
                onClick={() => setPfEnabled(!pfEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pfEnabled ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pfEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {pfEnabled && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    PF Rate (% of Basic)
                    {result && <span className="text-gray-500 ml-1 font-normal text-xs">({fmtINR(result.pfEmployee)}/yr each)</span>}
                  </label>
                  <PctInput value={pfPct} onChange={setPfPct} min={1} max={12} />
                  <p className="text-xs text-gray-500 mt-1">Statutory: 12% · max 12%</p>
                </div>
                <div className="text-xs text-gray-500 space-y-1 self-center">
                  <p>Employee PF → Your EPF account <span className="text-blue-400/70">(not in hand)</span></p>
                  <p>Employer PF → 3.67% EPF + 8.33% EPS (pension)</p>
                  {regime === 'old'
                    ? <p className="text-emerald-400/70">Old regime: Employee PF deductible under 80C (up to ₹1.5L)</p>
                    : <p className="text-amber-400/70">New regime: No 80C — Employee PF not deductible</p>}
                </div>
              </div>
            )}

            {!pfEnabled && (
              <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                PF disabled — applicable for &lt;20-employee establishments or NPS-opted organisations
              </p>
            )}
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              NPS Employer Contribution (% of Basic)
              <span title="Section 80CCD(2): deductible in BOTH regimes. Max 10% of basic for private sector, 14% for government."
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              {result && result.npsEmp > 0 && <span className="text-gray-500 font-normal text-xs">({fmtINR(result.npsEmp)}/yr)</span>}
            </label>
            <PctInput value={npsEmpPct} onChange={setNpsEmpPct} min={0} max={10} step={0.5} />
            <p className="text-xs text-gray-500 mt-1">0 = not applicable · max 10% (private) · deductible in both regimes</p>
            {result && result.npsEmp > 0 && (
              <p className="text-xs text-emerald-400/80 mt-1">
                {fmtINR(result.npsEmp)}/yr → Your NPS account (not in hand) · tax deduction under 80CCD(2)
              </p>
            )}
          </div>
        </div>

        {/* ── PROFESSIONAL TAX ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Professional Tax</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">State</label>
              <select className="input" value={ptState} onChange={e => setPtState(e.target.value as PTState)}>
                {PT_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.label}{s.note ? ` — ${s.note}` : ''}</option>
                ))}
              </select>
            </div>
            {ptState === 'OTHER' && (
              <div>
                <label className="label">Monthly PT (₹)</label>
                <input className="input" type="number" min="0" max="250" step="10" placeholder="200"
                  value={manualPtMonthly} onChange={e => setManualPtMonthly(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">Capped at ₹2,500/year by law</p>
              </div>
            )}
          </div>
          {result && (
            <p className="text-xs text-gray-500">
              Annual PT: <span className="text-gray-300">{fmtINR(result.profTaxAnnual)}</span>
              {ptState === 'MH' && ' (Maharashtra slab-based — ₹0 if basic ≤ ₹7,500/month)'}
            </p>
          )}
        </div>

        {/* ════════════ RESULTS ════════════ */}
        {result && (
          <>
            {/* ── Hero ── */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card text-center py-5 bg-gradient-to-br from-violet-600/10 to-purple-600/5 border-violet-500/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Monthly Take-Home</p>
                <p className="text-3xl font-bold text-violet-400">{fmtINR(result.monthlyTakeHome)}</p>
                <p className="text-xs text-gray-500 mt-1">{regime === 'new' ? 'New' : 'Old'} Regime</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Annual Take-Home</p>
                <p className="text-3xl font-bold text-emerald-400">{fmtINR(result.annualTakeHome)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {annualCTCNum > 0 ? (result.annualTakeHome / annualCTCNum * 100).toFixed(1) : 0}% of CTC
                </p>
              </div>
              <div className="card text-center py-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Effective Tax Rate</p>
                <p className="text-3xl font-bold text-amber-400">
                  {annualCTCNum > 0 ? (result.activeTax / annualCTCNum * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Tax / CTC</p>
              </div>
            </div>

            {/* ── Regime comparison ── */}
            <div className={`card border ${result.betterRegime === 'new' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {result.betterRegime === 'new' ? '✓ New Regime saves more' : '✓ Old Regime saves more'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Save <span className="font-semibold text-emerald-400">{fmtINR(result.savings)}/year</span>{' '}
                    by choosing {result.betterRegime === 'new' ? 'New' : 'Old'} Regime
                  </p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">New Regime Tax</p>
                    <p className={`font-semibold ${result.betterRegime === 'new' ? 'text-emerald-400' : 'text-gray-300'}`}>{fmtINR(result.totalTaxNew)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Old Regime Tax</p>
                    <p className={`font-semibold ${result.betterRegime === 'old' ? 'text-emerald-400' : 'text-gray-300'}`}>{fmtINR(result.totalTaxOld)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Where money goes ── */}
            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-white">Where Your Compensation Goes</h3>
              <p className="text-xs text-gray-500 -mt-1">PF and NPS are credited to your own accounts — not your bank account.</p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏦</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Bank Account (Take-Home)</p>
                    <p className="text-xs text-gray-500">After TDS, PF deduction &amp; Professional Tax</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-violet-400">{fmtINR(result.monthlyTakeHome)}/mo</p>
                  <p className="text-xs text-gray-500">{fmtINR(result.annualTakeHome)}/yr</p>
                </div>
              </div>

              {pfEnabled && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏛️</span>
                    <div>
                      <p className="text-sm font-semibold text-white">EPF Account (Not in Hand)</p>
                      <p className="text-xs text-gray-500">
                        Your share: {fmtINR(result.pfEmployee)}/yr &nbsp;+&nbsp; Employer: {fmtINR(result.pfEmployer)}/yr
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-blue-400">{fmtINR((result.pfEmployee + result.pfEmployer) / 12)}/mo</p>
                    <p className="text-xs text-gray-500">{fmtINR(result.pfEmployee + result.pfEmployer)}/yr total</p>
                  </div>
                </div>
              )}

              {result.npsEmp > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📈</span>
                    <div>
                      <p className="text-sm font-semibold text-white">NPS Account (Not in Hand)</p>
                      <p className="text-xs text-gray-500">Employer NPS — 80CCD(2) deductible in both regimes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-emerald-400">{fmtINR(result.npsEmp / 12)}/mo</p>
                    <p className="text-xs text-gray-500">{fmtINR(result.npsEmp)}/yr</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Income Tax (TDS)</p>
                    <p className="text-xs text-gray-500">Deducted at source, paid to central government</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-red-400">{fmtINR(result.activeMonthlyTax)}/mo</p>
                  <p className="text-xs text-gray-500">{fmtINR(result.activeTax)}/yr (incl. 4% cess)</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Gratuity Provision</p>
                    <p className="text-xs text-gray-500">Employer accrual at 4.81% of basic — paid on exit after 5 yrs service</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-amber-400">{fmtINR(result.gratuity / 12)}/mo</p>
                  <p className="text-xs text-gray-500">{fmtINR(result.gratuity)}/yr</p>
                </div>
              </div>
            </div>

            {/* ── Pie Charts ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">CTC Distribution</h3>
                <PieChart segments={[
                  { label: 'Bank Account (Take-Home)', value: result.annualTakeHome, color: '#8b5cf6' },
                  { label: 'EPF — Your Share', value: result.pfEmployee, color: '#3b82f6' },
                  { label: 'EPF — Employer Share', value: result.pfEmployer, color: '#60a5fa' },
                  { label: 'Income Tax + Cess', value: result.activeTax, color: '#ef4444' },
                  { label: 'Professional Tax', value: result.profTaxAnnual, color: '#6b7280' },
                  { label: 'Gratuity Provision', value: result.gratuity, color: '#d97706' },
                  ...(result.npsEmp > 0 ? [{ label: 'NPS (Employer)', value: result.npsEmp, color: '#10b981' }] : []),
                ]} />
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">Salary Component Split</h3>
                <PieChart segments={[
                  { label: 'Basic', value: result.basic, color: '#8b5cf6' },
                  { label: 'HRA', value: result.hra, color: '#0ea5e9' },
                  ...(result.lta > 0 ? [{ label: 'LTA', value: result.lta, color: '#10b981' }] : []),
                  ...(result.food > 0 ? [{ label: 'Food Coupons', value: result.food, color: '#22c55e' }] : []),
                  ...(result.bonus > 0 ? [{ label: 'Bonus', value: result.bonus, color: '#f59e0b' }] : []),
                  ...(result.otherAllowances > 0 ? [{ label: 'Other Allow.', value: result.otherAllowances, color: '#f97316' }] : []),
                  { label: 'Special Allow.', value: result.specialAllowance, color: '#6b7280' },
                ]} />
              </div>
            </div>

            {/* ── CTC Breakup ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">CTC Breakup</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">Component</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Annual</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Monthly</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Earnings (In Payslip)</td>
                    </tr>
                    {[
                      ['Basic Salary', result.basic],
                      ['HRA', result.hra],
                      ...(result.lta > 0 ? [['LTA', result.lta]] : []),
                      ...(result.food > 0 ? [['Food Coupons', result.food]] : []),
                      ...(result.bonus > 0 ? [['Bonus / Variable Pay', result.bonus]] : []),
                      ...(result.otherAllowances > 0 ? [['Other Allowances', result.otherAllowances]] : []),
                      ['Special Allowance', result.specialAllowance],
                    ].map(([label, val]) => (
                      <tr key={String(label)} className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-300 pl-5">
                          {String(label)}
                          {label === 'Special Allowance' && <span className="text-xs text-gray-600 ml-1">(balancing figure)</span>}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(Number(val))}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(Number(val) / 12)}</td>
                      </tr>
                    ))}

                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employer Contributions (CTC only, not in payslip)</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-5">Employer PF ({pfEnabled ? `${pfPct}% of basic` : 'disabled'})</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.pfEmployer)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.pfEmployer / 12)}</td>
                    </tr>
                    {result.npsEmp > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-400 pl-5">Employer NPS 80CCD(2) ({npsEmpPct}% of basic)</td>
                        <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.npsEmp)}</td>
                        <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.npsEmp / 12)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400 pl-5">Gratuity Provisioning (4.81% of basic)</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.gratuity)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.gratuity / 12)}</td>
                    </tr>

                    <tr className="bg-gray-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">Total CTC</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">{fmtINR(annualCTCNum)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">{fmtINR(annualCTCNum / 12)}</td>
                    </tr>

                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Deductions from Payslip</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 pl-5">
                        <span className="text-blue-400/90">Employee PF ({pfEnabled ? `${pfPct}% of basic` : 'disabled'})</span>
                        <p className="text-xs text-blue-400/50">→ Your EPF account (not in hand, but yours)</p>
                      </td>
                      <td className="py-2 px-3 text-right text-blue-400/80">-{fmtINR(result.pfEmployee)}</td>
                      <td className="py-2 px-3 text-right text-blue-400/80">-{fmtINR(result.monthlyPF)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 pl-5">
                        <span className="text-red-400/90">Professional Tax</span>
                        <p className="text-xs text-gray-600">→ State government</p>
                      </td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.profTaxAnnual)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.monthlyProfTax)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 pl-5">
                        <span className="text-red-400/90">Income Tax + Cess (TDS)</span>
                        <p className="text-xs text-gray-600">→ Central government</p>
                      </td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.activeTax)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.activeMonthlyTax)}</td>
                    </tr>
                    <tr className="bg-violet-600/10">
                      <td className="py-3 px-3 text-violet-300 font-bold">= Net Take-Home (Bank)</td>
                      <td className="py-3 px-3 text-right text-violet-300 font-bold">{fmtINR(result.annualTakeHome)}</td>
                      <td className="py-3 px-3 text-right text-violet-300 font-bold">{fmtINR(result.monthlyTakeHome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Monthly Payslip ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Payslip</h3>
              <div className="grid sm:grid-cols-2 gap-0 border border-gray-700 rounded-xl overflow-hidden text-sm">
                <div className="border-b sm:border-b-0 sm:border-r border-gray-700">
                  <div className="bg-gray-800/60 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Earnings</div>
                  <div className="divide-y divide-gray-800/50">
                    {[
                      ['Basic', result.basic / 12],
                      ['HRA', result.hra / 12],
                      ...(result.lta > 0 ? [['LTA', result.lta / 12]] : []),
                      ...(result.food > 0 ? [['Food Coupons', result.food / 12]] : []),
                      ...(result.bonus > 0 ? [['Bonus', result.bonus / 12]] : []),
                      ...(result.otherAllowances > 0 ? [['Other Allow.', result.otherAllowances / 12]] : []),
                      ['Special Allow.', result.specialAllowance / 12],
                    ].map(([label, val]) => (
                      <div key={String(label)} className="flex justify-between px-4 py-2">
                        <span className="text-gray-400">{String(label)}</span>
                        <span className="text-gray-200">{fmtINR(Number(val))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-4 py-2.5 bg-gray-800/40 border-t border-gray-700">
                    <span className="font-semibold text-gray-200">Gross Pay</span>
                    <span className="font-semibold text-gray-100">{fmtINR(result.monthlyGross)}</span>
                  </div>
                </div>
                <div>
                  <div className="bg-gray-800/60 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Deductions</div>
                  <div className="divide-y divide-gray-800/50">
                    {pfEnabled && (
                      <div className="flex justify-between px-4 py-2">
                        <div>
                          <span className="text-gray-400">Employee PF ({pfPct}%)</span>
                          <p className="text-xs text-blue-400/70">→ Your EPF account</p>
                        </div>
                        <span className="text-blue-400/80">{fmtINR(result.monthlyPF)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-4 py-2">
                      <div>
                        <span className="text-gray-400">Professional Tax</span>
                        <p className="text-xs text-gray-600">→ State government</p>
                      </div>
                      <span className="text-red-400/80">{fmtINR(result.monthlyProfTax)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2">
                      <div>
                        <span className="text-gray-400">TDS / Income Tax</span>
                        <p className="text-xs text-gray-600">→ Central government</p>
                      </div>
                      <span className="text-red-400/80">{fmtINR(result.activeMonthlyTax)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 bg-gray-800/40 border-t border-gray-700">
                    <span className="font-semibold text-gray-200">Total Deductions</span>
                    <span className="font-semibold text-red-400/80">
                      {fmtINR(result.monthlyPF + result.monthlyProfTax + result.activeMonthlyTax)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-0 border border-t-0 border-gray-700 rounded-b-xl bg-violet-600/10 flex justify-between items-center px-4 py-3">
                <span className="font-bold text-violet-300">Net Pay (Take-Home)</span>
                <span className="text-xl font-bold text-violet-300">{fmtINR(result.monthlyTakeHome)}</span>
              </div>
            </div>

            {/* ── Exemptions & Tax Benefits ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Exemptions &amp; Tax Benefits</h3>
              <div className="space-y-3 text-sm">
                {[
                  {
                    label: 'Standard Deduction',
                    note: regime === 'new' ? '₹75,000 (new regime)' : '₹50,000 (old regime)',
                    badge: `saves ${fmtINR(regime === 'new' ? 75000 : 50000)}`, green: true,
                  },
                  ...(regime === 'old' ? [{
                    label: 'HRA Exemption',
                    note: result.hraExemption > 0
                      ? `${fmtINR(result.hraExemption)}/yr exempt · Taxable HRA: ${fmtINR(result.hraTaxable)}/yr`
                      : 'No exemption — enter monthly rent to claim',
                    badge: result.hraExemption > 0 ? `saves ${fmtINR(result.hraExemption)}` : 'not claimed',
                    green: result.hraExemption > 0,
                  }] : []),
                  ...(result.lta > 0 ? [{
                    label: 'LTA',
                    note: regime === 'new'
                      ? 'Taxable under new regime — no exemption'
                      : (ltaExemptClaimed ? `${fmtINR(result.ltaExempt)}/yr exempt` : 'Not claimed'),
                    badge: result.ltaExempt > 0 ? `saves ${fmtINR(result.ltaExempt)}` : regime === 'new' ? 'n/a (new)' : 'not claimed',
                    green: result.ltaExempt > 0,
                  }] : []),
                  ...(result.food > 0 ? [{
                    label: 'Food Coupons',
                    note: regime === 'old'
                      ? `Exempt: ${fmtINR(result.foodExempt)}/yr (cap ₹26,400) · Taxable: ${fmtINR(result.foodTaxable)}/yr`
                      : 'Fully taxable under new regime',
                    badge: result.foodExempt > 0 ? `saves ${fmtINR(result.foodExempt)}` : 'taxable',
                    green: result.foodExempt > 0,
                  }] : []),
                  {
                    label: 'Employee PF — 80C',
                    note: regime === 'old' && pfEnabled
                      ? `${fmtINR(result.deductions80C)}/yr deductible under 80C (cap ₹1.5L)`
                      : regime === 'new'
                        ? 'Not available in new regime'
                        : 'PF disabled',
                    badge: regime === 'old' && pfEnabled ? `saves ${fmtINR(result.deductions80C)}` : 'n/a (new)',
                    green: regime === 'old' && pfEnabled && result.deductions80C > 0,
                  },
                  ...(result.npsEmp > 0 ? [{
                    label: 'NPS Employer — 80CCD(2)',
                    note: `${fmtINR(result.npsEmp)}/yr deductible in both regimes`,
                    badge: `saves ${fmtINR(result.npsEmp)}`, green: true,
                  }] : []),
                ].map(item => (
                  <div key={item.label} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${item.green ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tax Computation Detail ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Tax Computation — {regime === 'new' ? 'New' : 'Old'} Regime</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Gross Salary</span><span>{fmtINR(result.grossSalary)}</span>
                </div>
                {regime === 'new' ? (
                  <>
                    <div className="flex justify-between text-gray-500 text-xs pl-3">
                      <span>− Standard Deduction</span><span>-{fmtINR(75000)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs pl-3">
                      <span>− Professional Tax</span><span>-{fmtINR(result.profTaxAnnual)}</span>
                    </div>
                    {result.npsEmp > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs pl-3">
                        <span>− NPS Employer 80CCD(2)</span><span>-{fmtINR(result.npsEmp)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300 font-medium border-t border-gray-700 pt-2">
                      <span>Taxable Income</span><span>{fmtINR(result.taxableNew)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs pl-3">
                      <span>87A Rebate</span>
                      <span>{result.taxableNew <= 1200000 ? `−${fmtINR(Math.min(calcNewRegimeTax(result.taxableNew), 60000))} (full rebate)` : 'Not applicable (income > ₹12L)'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {result.hraExemption > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs pl-3">
                        <span>− HRA Exemption</span><span>-{fmtINR(result.hraExemption)}</span>
                      </div>
                    )}
                    {result.ltaExempt > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs pl-3">
                        <span>− LTA Exemption</span><span>-{fmtINR(result.ltaExempt)}</span>
                      </div>
                    )}
                    {result.foodExempt > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs pl-3">
                        <span>− Food Coupon Exemption</span><span>-{fmtINR(result.foodExempt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500 text-xs pl-3">
                      <span>− Standard Deduction</span><span>-{fmtINR(50000)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs pl-3">
                      <span>− Professional Tax</span><span>-{fmtINR(result.profTaxAnnual)}</span>
                    </div>
                    {result.deductions80C > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs pl-3">
                        <span>− 80C (Employee PF)</span><span>-{fmtINR(result.deductions80C)}</span>
                      </div>
                    )}
                    {result.npsEmp > 0 && (
                      <div className="flex justify-between text-gray-500 text-xs pl-3">
                        <span>− NPS Employer 80CCD(2)</span><span>-{fmtINR(result.npsEmp)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300 font-medium border-t border-gray-700 pt-2">
                      <span>Taxable Income</span><span>{fmtINR(result.taxableOld)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs pl-3">
                      <span>87A Rebate</span>
                      <span>{result.taxableOld <= 500000 ? '−₹12,500 (full rebate)' : 'Not applicable (income > ₹5L)'}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-white font-semibold border-t border-gray-700 pt-2">
                  <span>Tax + 4% Cess</span>
                  <span className="text-red-400">{fmtINR(regime === 'new' ? result.totalTaxNew : result.totalTaxOld)}</span>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 text-xs text-gray-500 space-y-1.5">
              <p><span className="text-gray-400 font-medium">FY 2026-27 (AY 2027-28):</span> Slabs unchanged per Union Budget 2026. New regime default. 87A rebate ₹60,000 for taxable ≤ ₹12L (effective zero tax ≤ ₹12.75L for salaried with std deduction).</p>
              <p><span className="text-gray-400 font-medium">EPF:</span> Employee + Employer PF both go to your EPF account — not your bank. Withdrawal allowed on resignation (with conditions) or retirement.</p>
              <p>PT capped at ₹2,500/year · Food coupon exemption ₹26,400/year (old regime) · Gratuity: 4.81% of basic, paid after 5 years of continuous service · Surcharge not included (applies for income &gt; ₹50L).</p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
