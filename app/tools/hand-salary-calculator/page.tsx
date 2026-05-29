'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtPct = (n: number) => n.toFixed(1) + '%';

// ─── Tax computation ─────────────────────────────────────────────────────────

function calcNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 1200000) return 0;
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
  return tax;
}

function calcOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
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

// ─── Professional Tax by state ───────────────────────────────────────────────

type PTState = 'AP' | 'KA' | 'MH' | 'TN' | 'WB' | 'TS' | 'GJ' | 'MP' | 'KL' | 'OTHER';

interface PTOption { code: PTState; label: string; annual: (mb: number) => number; note: string; }

const PT_STATES: PTOption[] = [
  { code: 'KA', label: 'Karnataka', note: '₹200/month', annual: () => 2400 },
  {
    code: 'MH', label: 'Maharashtra', note: 'Slab-based',
    annual: (mb) => mb <= 7500 ? 0 : mb <= 10000 ? 175 * 12 : 200 * 11 + 300,
  },
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
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={s.color}
              opacity={0.9}
            />
          );
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function HandSalaryCalculatorPage() {
  // ── 1. Regime (shown first) ──
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  // ── 2. Core CTC inputs ──
  const [ctc, setCtc] = useState('1200000');
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(50);
  const [isMetro, setIsMetro] = useState(true);
  const [rentPaid, setRentPaid] = useState('0');
  const [otherAllowPct, setOtherAllowPct] = useState(10);

  // ── 3. Additional components ──
  const [bonusPay, setBonusPay] = useState('0');
  const [ltaAnnual, setLtaAnnual] = useState('0');
  const [ltaExemptClaimed, setLtaExemptClaimed] = useState(false);
  const [foodCoupons, setFoodCoupons] = useState('0');

  // ── 4. Employer PF (% of basic, toggleable) ──
  const [pfEnabled, setPfEnabled] = useState(true);
  const [pfEmployerPct, setPfEmployerPct] = useState(12);   // % of basic

  // ── 5. NPS employer (% of basic) ──
  const [npsEmpPct, setNpsEmpPct] = useState(0);            // % of basic

  // ── 6. Professional Tax ──
  const [ptState, setPtState] = useState<PTState>('KA');
  const [manualPtMonthly, setManualPtMonthly] = useState('200');

  const result = useMemo(() => {
    const annualCTC = parseFloat(ctc);
    if (!annualCTC || isNaN(annualCTC) || annualCTC <= 0) return null;

    const basic = annualCTC * (basicPct / 100);
    const hra = basic * (hraPct / 100);
    const otherAllowances = annualCTC * (otherAllowPct / 100);
    const bonus = Math.max(0, parseFloat(bonusPay) || 0);
    const lta = Math.max(0, parseFloat(ltaAnnual) || 0);
    const food = Math.max(0, parseFloat(foodCoupons) || 0);

    // PF — percentage-based, optional
    const pfRate = pfEnabled ? pfEmployerPct / 100 : 0;
    const pfEmployee = Math.min(basic * pfRate, 21600);   // employee contribution
    const pfEmployer = Math.min(basic * pfRate, 21600);   // employer contribution (same rate)

    // NPS employer — percentage of basic, capped at 10% for 80CCD(2)
    const npsEmpRaw = basic * (Math.min(npsEmpPct, 10) / 100);
    const npsEmpCap = basic * 0.10;
    const npsEmp = Math.min(npsEmpRaw, npsEmpCap);

    // Gratuity provisioning
    const gratuity = basic * 0.0481;

    // Professional Tax
    const monthlyBasic = basic / 12;
    const ptOption = PT_STATES.find(s => s.code === ptState)!;
    const profTaxAnnual = ptState === 'OTHER'
      ? Math.min((parseFloat(manualPtMonthly) || 0) * 12, 2500)
      : Math.min(ptOption.annual(monthlyBasic), 2500);

    // Special Allowance (balancing figure)
    const specialAllowance = Math.max(
      0,
      annualCTC - basic - hra - otherAllowances - bonus - lta - food
        - pfEmployer - npsEmp - gratuity,
    );

    const grossSalary = basic + hra + otherAllowances + bonus + lta + food + specialAllowance;

    // Exemptions
    const rentAnnual = (parseFloat(rentPaid) || 0) * 12;
    let hraExemption = 0;
    if (rentAnnual > 0) {
      hraExemption = Math.min(hra, Math.max(0, rentAnnual - 0.1 * basic), basic * (isMetro ? 0.5 : 0.4));
    }
    const hraTaxable = hra - hraExemption;
    const ltaExempt = (regime === 'old' && ltaExemptClaimed) ? lta : 0;
    const ltaTaxable = lta - ltaExempt;
    const foodExempt = Math.min(food, 26400);
    const foodTaxable = food - foodExempt;

    // New regime tax
    const taxableNew = Math.max(0, grossSalary - pfEmployee - 75000 - profTaxAnnual - npsEmp);
    const baseTaxNew = calcNewRegimeTax(taxableNew);
    const totalTaxNew = baseTaxNew * 1.04;

    // Old regime tax
    const deductions80C = Math.min(pfEmployee, 150000);
    const taxableOld = Math.max(0,
      grossSalary - pfEmployee - hraExemption - ltaExempt - foodExempt
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
      npsEmp, npsEmpCap,
      pfEmployee, pfEmployer, pfRate,
      gratuity, grossSalary,
      profTaxAnnual,
      taxableNew, taxableOld,
      totalTaxNew, totalTaxOld,
      activeTax, activeMonthlyTax,
      monthlyGross, monthlyPF, monthlyProfTax,
      monthlyTakeHome, annualTakeHome,
      betterRegime, savings: Math.abs(newSavings), newSavings,
    };
  }, [
    ctc, basicPct, hraPct, isMetro, rentPaid, otherAllowPct, regime,
    bonusPay, ltaAnnual, ltaExemptClaimed, foodCoupons,
    pfEnabled, pfEmployerPct, npsEmpPct,
    ptState, manualPtMonthly,
  ]);

  const annualCTCNum = parseFloat(ctc) || 0;

  return (
    <ToolLayout
      title="Hand Salary Calculator India FY 2025-26"
      description="Calculate in-hand salary from CTC. Full payslip view, HRA/LTA/food-coupon exemptions, NPS, state-wise professional tax, new vs old regime comparison, and visual salary breakdown."
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

        {/* ── 1. REGIME — FIRST ── */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-white">Tax Regime <span className="text-gray-500 font-normal">(FY 2025-26)</span></h2>
          <div className="flex rounded-xl overflow-hidden border border-gray-700">
            <button
              onClick={() => setRegime('new')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${regime === 'new' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
            >
              New Regime
            </button>
            <button
              onClick={() => setRegime('old')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${regime === 'old' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
            >
              Old Regime
            </button>
          </div>
          {regime === 'new'
            ? <p className="text-xs text-gray-500">Std deduction ₹75,000 • HRA/LTA not exempt • NPS 80CCD(2) allowed • 87A rebate up to ₹12L taxable income</p>
            : <p className="text-xs text-gray-500">Std deduction ₹50,000 • HRA + LTA + food coupons exempt • 80C ₹1.5L • NPS 80CCD(2) allowed</p>
          }
        </div>

        {/* ── 2. CTC & SALARY STRUCTURE ── */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Salary Structure</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Annual CTC (₹)</label>
              <input className="input" type="number" min="0" placeholder="12,00,000"
                value={ctc} onChange={e => setCtc(e.target.value)} />
              {result && <p className="text-xs text-gray-500 mt-1">≈ {fmtINR(annualCTCNum / 12)}/month</p>}
            </div>
            <div>
              <label className="label">Monthly Rent Paid (₹)</label>
              <input className="input" type="number" min="0" placeholder="0"
                value={rentPaid} onChange={e => setRentPaid(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Enter 0 if not claiming HRA</p>
            </div>
          </div>

          <div>
            <label className="label">Basic Salary — <span className="text-violet-400">{basicPct}% of CTC</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.basic)}/yr)</span>}
            </label>
            <input type="range" min={30} max={60} step={1} value={basicPct}
              onChange={e => setBasicPct(Number(e.target.value))} className="w-full accent-violet-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5"><span>30%</span><span>60%</span></div>
          </div>

          <div>
            <label className="label">HRA — <span className="text-violet-400">{hraPct}% of Basic</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.hra)}/yr)</span>}
            </label>
            <input type="range" min={40} max={50} step={1} value={hraPct}
              onChange={e => setHraPct(Number(e.target.value))} className="w-full accent-violet-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>40% (non-metro)</span><span>50% (metro)</span>
            </div>
          </div>

          <div>
            <label className="label">Other Allowances — <span className="text-violet-400">{otherAllowPct}% of CTC</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.otherAllowances)}/yr)</span>}
            </label>
            <input type="range" min={0} max={30} step={1} value={otherAllowPct}
              onChange={e => setOtherAllowPct(Number(e.target.value))} className="w-full accent-violet-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5"><span>0%</span><span>30%</span></div>
          </div>

          <div>
            <label className="label">City Type (for HRA)</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button onClick={() => setIsMetro(true)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isMetro ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                Metro (50% HRA)
              </button>
              <button onClick={() => setIsMetro(false)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isMetro ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                Non-Metro (40% HRA)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Metro: Delhi, Mumbai, Chennai, Kolkata</p>
          </div>
        </div>

        {/* ── 3. PF & NPS ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Provident Fund & NPS</h2>

          {/* Employer PF */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="label mb-0">Employer / Employee PF</label>
                <p className="text-xs text-gray-500 mt-0.5">Both employer & employee contribute same rate (12% statutory)</p>
              </div>
              <button
                onClick={() => setPfEnabled(!pfEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pfEnabled ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pfEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {pfEnabled && (
              <div>
                <label className="label">PF Rate — <span className="text-violet-400">{pfEmployerPct}% of Basic</span>
                  {result && <span className="text-gray-500 ml-2">(Employee: {fmtINR(result.pfEmployee)}/yr, capped ₹21,600)</span>}
                </label>
                <input type="range" min={1} max={12} step={1} value={pfEmployerPct}
                  onChange={e => setPfEmployerPct(Number(e.target.value))} className="w-full accent-violet-500" />
                <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                  <span>1%</span><span>12% (statutory max)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Statutory minimum: 12%. Capped at ₹1,800/month (12% of ₹15,000 wage ceiling).
                  Employee PF goes to EPF account; employer share splits into EPF (3.67%) + EPS (8.33%).
                </p>
              </div>
            )}
            {!pfEnabled && (
              <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                PF disabled — applicable only if employer is exempt (NPS-opted organisations, establishments with &lt;20 employees)
              </p>
            )}
          </div>

          {/* NPS Employer */}
          <div>
            <label className="label flex items-center gap-1.5">
              NPS Employer Contribution — <span className="text-violet-400">{npsEmpPct}% of Basic</span>
              <span title="Section 80CCD(2): deductible in BOTH regimes. Max 10% of basic for private employers (14% for govt)."
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
            </label>
            <input type="range" min={0} max={10} step={0.5} value={npsEmpPct}
              onChange={e => setNpsEmpPct(Number(e.target.value))} className="w-full accent-violet-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>0% (not applicable)</span><span>10% (max for private)</span>
            </div>
            {result && npsEmpPct > 0 && (
              <p className="text-xs text-emerald-400/80 mt-1">
                {fmtINR(result.npsEmp)}/yr deductible under 80CCD(2) in both regimes
                {result.npsEmp < result.npsEmpCap ? '' : ` (capped at ${fmtINR(result.npsEmpCap)})`}
              </p>
            )}
          </div>
        </div>

        {/* ── 4. ADDITIONAL COMPONENTS ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Additional CTC Components</h2>
          <p className="text-xs text-gray-500 -mt-1">Leave 0 if not applicable. All values annual.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Bonus / Variable Pay (₹/year)</label>
              <input className="input" type="number" min="0" placeholder="0"
                value={bonusPay} onChange={e => setBonusPay(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Fully taxable in both regimes</p>
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                LTA — Leave Travel Allowance (₹/year)
                <span title="Exempt (old regime): up to 2 journeys in 4-year block. Fully taxable in new regime."
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input className="input" type="number" min="0" placeholder="0"
                value={ltaAnnual} onChange={e => setLtaAnnual(e.target.value)} />
              {regime === 'old' && (parseFloat(ltaAnnual) || 0) > 0 && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" className="accent-violet-500 w-4 h-4"
                    checked={ltaExemptClaimed} onChange={e => setLtaExemptClaimed(e.target.checked)} />
                  <span className="text-xs text-gray-400">Claim LTA exemption (old regime)</span>
                </label>
              )}
              {regime === 'new' && (parseFloat(ltaAnnual) || 0) > 0 && (
                <p className="text-xs text-amber-400/80 mt-1">Taxable under new regime</p>
              )}
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                Food Coupons / Meal Allowance (₹/year)
                <span title="Exempt: ₹50 × 2 meals × 22 days × 12 = ₹26,400/year"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input className="input" type="number" min="0" placeholder="0"
                value={foodCoupons} onChange={e => setFoodCoupons(e.target.value)} />
              {result && (parseFloat(foodCoupons) || 0) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Exempt: {fmtINR(result.foodExempt)} • Taxable: {fmtINR(result.foodTaxable)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. PROFESSIONAL TAX ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Professional Tax</h2>
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
              <input className="input" type="number" min="0" max="250" placeholder="200"
                value={manualPtMonthly} onChange={e => setManualPtMonthly(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Capped at ₹2,500/year by law</p>
            </div>
          )}
          {result && (
            <p className="text-xs text-gray-500">
              Annual PT: <span className="text-gray-300">{fmtINR(result.profTaxAnnual)}</span>
              {ptState === 'MH' && ' (Maharashtra: slab-based)'}
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
                <p className="text-xs text-gray-500 mt-1">Income tax / CTC</p>
              </div>
            </div>

            {/* ── Regime comparison ── */}
            <div className={`card border ${result.betterRegime === 'new' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {result.betterRegime === 'new' ? '✓ New Regime saves you more' : '✓ Old Regime saves you more'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Save <span className="font-semibold text-emerald-400">{fmtINR(result.savings)}/year</span> by choosing the {result.betterRegime === 'new' ? 'New' : 'Old'} Regime
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

            {/* ── PIE CHARTS ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Chart 1: Where does your CTC go */}
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">Where Does Your CTC Go?</h3>
                <PieChart segments={[
                  { label: 'Take-Home', value: result.annualTakeHome, color: '#8b5cf6' },
                  { label: 'Income Tax', value: result.activeTax, color: '#ef4444' },
                  { label: 'Employee PF', value: result.pfEmployee, color: '#3b82f6' },
                  { label: 'Prof. Tax', value: result.profTaxAnnual, color: '#6b7280' },
                  { label: 'Employer PF', value: result.pfEmployer, color: '#0ea5e9' },
                  { label: 'Gratuity (prov.)', value: result.gratuity, color: '#d97706' },
                  ...(result.npsEmp > 0 ? [{ label: 'Employer NPS', value: result.npsEmp, color: '#10b981' }] : []),
                ]} />
              </div>

              {/* Chart 2: Salary component split */}
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

            {/* ── CTC Breakup Table ── */}
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
                          {label === 'Special Allowance' && <span className="text-xs text-gray-600 ml-1">(balancing)</span>}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(Number(val))}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(Number(val) / 12)}</td>
                      </tr>
                    ))}

                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employer Contributions (CTC only)</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-5">Employer PF ({pfEnabled ? `${pfEmployerPct}% of basic` : 'disabled'})</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.pfEmployer)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.pfEmployer / 12)}</td>
                    </tr>
                    {result.npsEmp > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-400 pl-5">Employer NPS — 80CCD(2) ({npsEmpPct}% of basic)</td>
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
                      <td className="py-2 px-3 text-red-400/90 pl-5">
                        Employee PF ({pfEnabled ? `${pfEmployerPct}% of basic` : 'disabled'})
                      </td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.pfEmployee)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.monthlyPF)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-red-400/90 pl-5">Professional Tax</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.profTaxAnnual)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.monthlyProfTax)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-red-400/90 pl-5">Income Tax + Cess (TDS)</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.activeTax)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.activeMonthlyTax)}</td>
                    </tr>
                    <tr className="bg-violet-600/10">
                      <td className="py-3 px-3 text-violet-300 font-bold">= Net Take-Home</td>
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
                        <span className="text-gray-400">PF ({pfEmployerPct}%)</span>
                        <span className="text-red-400/80">{fmtINR(result.monthlyPF)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-gray-400">Professional Tax</span>
                      <span className="text-red-400/80">{fmtINR(result.monthlyProfTax)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-gray-400">TDS / Income Tax</span>
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

            {/* ── Exemptions Summary ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Exemptions & Tax Benefits</h3>
              <div className="space-y-3 text-sm">
                {[
                  {
                    label: 'HRA', exempt: result.hraExemption, taxable: result.hraTaxable,
                    note: `Old: ${fmtINR(result.hraExemption)} exempt • New: fully taxable`,
                    badge: result.hraExemption > 0 ? `saves ${fmtINR(result.hraExemption)}` : 'no exemption',
                    green: result.hraExemption > 0,
                  },
                  ...(result.lta > 0 ? [{
                    label: 'LTA', exempt: result.ltaExempt, taxable: result.ltaTaxable,
                    note: ltaExemptClaimed && regime === 'old' ? `${fmtINR(result.ltaExempt)} exempt • New: taxable` : 'Not claimed / taxable under new regime',
                    badge: result.ltaExempt > 0 ? `saves ${fmtINR(result.ltaExempt)}` : 'not claimed',
                    green: result.ltaExempt > 0,
                  }] : []),
                  ...(result.food > 0 ? [{
                    label: 'Food Coupons', exempt: result.foodExempt, taxable: result.foodTaxable,
                    note: `Exempt: ${fmtINR(result.foodExempt)} (cap ₹26,400) • Taxable: ${fmtINR(result.foodTaxable)}`,
                    badge: `saves ${fmtINR(result.foodExempt)}`, green: true,
                  }] : []),
                  {
                    label: 'Employee PF — 80C',
                    exempt: pfEnabled ? Math.min(result.pfEmployee, 150000) : 0,
                    taxable: 0,
                    note: pfEnabled
                      ? `Old: ${fmtINR(Math.min(result.pfEmployee, 150000))} under 80C • New: not deductible`
                      : 'PF disabled',
                    badge: 'old regime only', green: false,
                  },
                  ...(result.npsEmp > 0 ? [{
                    label: 'NPS Employer 80CCD(2)', exempt: result.npsEmp, taxable: 0,
                    note: `Deductible in BOTH regimes — ${fmtINR(result.npsEmp)}/yr`,
                    badge: `saves ${fmtINR(result.npsEmp)}`, green: true,
                  }] : []),
                ].map(item => (
                  <div key={item.label} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.note}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${item.green ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Footer note ── */}
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 text-xs text-gray-500 space-y-1">
              <p>
                <span className="text-gray-400 font-medium">Note:</span> Employer PF ({fmtINR(result.pfEmployer)}/yr) and Gratuity provisioning ({fmtINR(result.gratuity)}/yr) are part of CTC but not in take-home.
              </p>
              <p>PF capped at ₹1,800/month • Professional tax capped at ₹2,500/year • Food coupon exemption ₹26,400/year • NPS 80CCD(2) capped at 10% of basic for private employers.</p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
