'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// ─── Tax computation ─────────────────────────────────────────────────────────

function calcNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 1200000) return 0; // Section 87A rebate

  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, slab.limit) - prev;
    tax += slice * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

function calcOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 500000) return 0; // Section 87A rebate

  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];

  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, slab.limit) - prev;
    tax += slice * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

// ─── Professional Tax by state ───────────────────────────────────────────────

type PTState =
  | 'AP' | 'KA' | 'MH' | 'TN' | 'WB' | 'TS' | 'GJ' | 'MP' | 'KL' | 'OTHER';

interface PTOption {
  code: PTState;
  label: string;
  annual: (monthlyBasic: number) => number;
  note: string;
}

const PT_STATES: PTOption[] = [
  {
    code: 'KA', label: 'Karnataka', note: '₹200/month',
    annual: () => 2400,
  },
  {
    code: 'MH', label: 'Maharashtra', note: 'Slab-based (₹200/month above ₹10,000)',
    annual: (mb: number) => {
      // Maharashtra slab on monthly salary
      if (mb <= 7500) return 0;
      if (mb <= 10000) return 175 * 11 + 175; // ₹175/month × 11 + ₹175 last month
      // Above ₹10,000: ₹200 × 11 months + ₹300 in February
      return 200 * 11 + 300;
    },
  },
  {
    code: 'AP', label: 'Andhra Pradesh', note: '₹200/month',
    annual: () => 2400,
  },
  {
    code: 'TS', label: 'Telangana', note: '₹200/month',
    annual: () => 2400,
  },
  {
    code: 'TN', label: 'Tamil Nadu', note: '₹180/month',
    annual: () => 2160,
  },
  {
    code: 'WB', label: 'West Bengal', note: '₹110/month',
    annual: () => 1320,
  },
  {
    code: 'GJ', label: 'Gujarat', note: '₹200/month',
    annual: () => 2400,
  },
  {
    code: 'MP', label: 'Madhya Pradesh', note: '₹208/month (capped ₹2,500/year)',
    annual: () => 2500,
  },
  {
    code: 'KL', label: 'Kerala', note: '₹208/month',
    annual: () => 2496,
  },
  {
    code: 'OTHER', label: 'Other / Enter manually', note: '',
    annual: () => 0,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HandSalaryCalculatorPage() {
  // Core CTC inputs
  const [ctc, setCtc] = useState('1200000');
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(50);
  const [isMetro, setIsMetro] = useState(true);
  const [rentPaid, setRentPaid] = useState('0');
  const [otherAllowPct, setOtherAllowPct] = useState(10);
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  // New CTC components
  const [bonusPay, setBonusPay] = useState('0');
  const [ltaAnnual, setLtaAnnual] = useState('0');
  const [ltaExemptClaimed, setLtaExemptClaimed] = useState(false);
  const [foodCoupons, setFoodCoupons] = useState('0');
  const [npsEmployer, setNpsEmployer] = useState('0');

  // Professional Tax
  const [ptState, setPtState] = useState<PTState>('KA');
  const [manualPtMonthly, setManualPtMonthly] = useState('200');

  const result = useMemo(() => {
    const annualCTC = parseFloat(ctc);
    if (!annualCTC || isNaN(annualCTC) || annualCTC <= 0) return null;

    // ── Salary components ──────────────────────────────────────────────────
    const basic = annualCTC * (basicPct / 100);
    const hra = basic * (hraPct / 100);
    const otherAllowances = annualCTC * (otherAllowPct / 100);
    const bonus = Math.max(0, parseFloat(bonusPay) || 0);
    const lta = Math.max(0, parseFloat(ltaAnnual) || 0);
    const food = Math.max(0, parseFloat(foodCoupons) || 0);

    // NPS employer: capped at 10% of basic (Section 80CCD(2))
    const npsEmpRaw = Math.max(0, parseFloat(npsEmployer) || 0);
    const npsEmpCap = basic * 0.10;
    const npsEmp = Math.min(npsEmpRaw, npsEmpCap);

    // PF: 12% of basic, capped ₹1,800/month = ₹21,600/year
    const pfEmployee = Math.min(basic * 0.12, 21600);
    const pfEmployer = Math.min(basic * 0.12, 21600);

    // Gratuity provisioning: 4.81% of basic (employer cost, part of CTC)
    const gratuity = basic * 0.0481;

    // Professional Tax
    const monthlyBasic = basic / 12;
    const ptOption = PT_STATES.find(s => s.code === ptState)!;
    const profTaxAnnual = ptState === 'OTHER'
      ? Math.min((parseFloat(manualPtMonthly) || 0) * 12, 2500)
      : Math.min(ptOption.annual(monthlyBasic), 2500);

    // Special Allowance = CTC − all explicit components − employer contributions
    const specialAllowance = Math.max(
      0,
      annualCTC - basic - hra - otherAllowances - bonus - lta - food
        - pfEmployer - npsEmp - gratuity,
    );

    // Gross salary (employee payslip — excludes employer PF/NPS/gratuity)
    const grossSalary = basic + hra + otherAllowances + bonus + lta + food + specialAllowance;

    // ── Exempt component calculations ──────────────────────────────────────

    // HRA exemption
    const rentAnnual = (parseFloat(rentPaid) || 0) * 12;
    let hraExemption = 0;
    if (rentAnnual > 0) {
      const metroRate = isMetro ? 0.5 : 0.4;
      hraExemption = Math.min(hra, Math.max(0, rentAnnual - 0.1 * basic), basic * metroRate);
    }
    const hraTaxable = hra - hraExemption;

    // LTA exemption (old regime only, if user claims it)
    const ltaExempt = (regime === 'old' && ltaExemptClaimed) ? lta : 0;
    const ltaTaxable = lta - ltaExempt;

    // Food coupon exemption: ₹50 × 2 meals × 22 days × 12 months = ₹26,400
    const foodExemptLimit = 26400;
    const foodExempt = Math.min(food, foodExemptLimit);
    const foodTaxable = food - foodExempt;

    // ── Taxable Income — New Regime ─────────────────────────────────────────
    // Standard deduction ₹75,000; no HRA/LTA/food exemptions; NPS employer 80CCD(2) allowed
    const taxableNew = Math.max(
      0,
      grossSalary - pfEmployee - 75000 - profTaxAnnual - npsEmp,
    );
    const baseTaxNew = calcNewRegimeTax(taxableNew);
    const cessNew = baseTaxNew * 0.04;
    const totalTaxNew = baseTaxNew + cessNew;

    // ── Taxable Income — Old Regime ─────────────────────────────────────────
    // Standard deduction ₹50,000; HRA + LTA + food coupons exempt; 80C; NPS employer 80CCD(2)
    const deductions80C = Math.min(pfEmployee, 150000);
    const taxableOld = Math.max(
      0,
      grossSalary
        - pfEmployee
        - hraExemption
        - ltaExempt
        - foodExempt
        - 50000
        - profTaxAnnual
        - deductions80C
        - npsEmp,
    );
    const baseTaxOld = calcOldRegimeTax(taxableOld);
    const cessOld = baseTaxOld * 0.04;
    const totalTaxOld = baseTaxOld + cessOld;

    // ── Active regime figures ───────────────────────────────────────────────
    const activeTax = regime === 'new' ? totalTaxNew : totalTaxOld;
    const activeMonthlyTax = activeTax / 12;

    const monthlyPF = pfEmployee / 12;
    const monthlyProfTax = profTaxAnnual / 12;
    const monthlyGross = grossSalary / 12;
    const monthlyTakeHome = monthlyGross - monthlyPF - monthlyProfTax - activeMonthlyTax;
    const annualTakeHome = monthlyTakeHome * 12;

    const newSavings = totalTaxOld - totalTaxNew;
    const betterRegime: 'new' | 'old' = newSavings >= 0 ? 'new' : 'old';
    const savings = Math.abs(newSavings);

    return {
      // Components
      basic, hra, hraTaxable, hraExemption,
      lta, ltaTaxable, ltaExempt,
      food, foodTaxable, foodExempt,
      bonus,
      otherAllowances,
      specialAllowance,
      npsEmp, npsEmpCap,
      pfEmployee, pfEmployer,
      gratuity,
      grossSalary,
      // PT
      profTaxAnnual,
      // Tax
      taxableNew, taxableOld,
      totalTaxNew, totalTaxOld,
      activeTax,
      // Monthly
      monthlyGross, monthlyPF, monthlyProfTax, activeMonthlyTax,
      monthlyTakeHome, annualTakeHome,
      // Regime comparison
      betterRegime, savings, newSavings,
    };
  }, [
    ctc, basicPct, hraPct, isMetro, rentPaid, otherAllowPct, regime,
    bonusPay, ltaAnnual, ltaExemptClaimed, foodCoupons, npsEmployer,
    ptState, manualPtMonthly,
  ]);

  const annualCTCNum = parseFloat(ctc) || 0;

  return (
    <ToolLayout
      title="Hand Salary Calculator India 2025"
      description="Calculate your in-hand (take-home) salary from CTC for FY 2025-26. Full CTC breakup, payslip view, HRA/LTA/food-coupon exemptions, NPS employer 80CCD(2), state-wise professional tax, and new vs old regime comparison."
      icon="🧮"
      relatedTools={[
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '📊' },
        { name: 'Loan / EMI Calculator', href: '/tools/loan-calculator', icon: '🏦' },
        { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
      ]}
    >
      <div className="space-y-6">

        {/* Country selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
            <option disabled value="UK">🇬🇧 UK (coming soon)</option>
          </select>
        </div>

        {/* ── Section 1: Core Salary Inputs ── */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Core Salary Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Annual CTC (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="12,00,000"
                value={ctc}
                onChange={e => setCtc(e.target.value)}
              />
              {result && <p className="text-xs text-gray-500 mt-1">≈ {fmtINR(annualCTCNum / 12)}/month</p>}
            </div>

            <div>
              <label className="label">Monthly Rent Paid (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={rentPaid}
                onChange={e => setRentPaid(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Enter 0 if not claiming HRA</p>
            </div>
          </div>

          {/* Basic % */}
          <div>
            <label className="label">
              Basic Salary — <span className="text-violet-400">{basicPct}% of CTC</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.basic)}/year)</span>}
            </label>
            <input
              type="range" min={30} max={60} step={1} value={basicPct}
              onChange={e => setBasicPct(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>30%</span><span>60%</span>
            </div>
          </div>

          {/* HRA % */}
          <div>
            <label className="label">
              HRA — <span className="text-violet-400">{hraPct}% of Basic</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.hra)}/year)</span>}
            </label>
            <input
              type="range" min={40} max={50} step={1} value={hraPct}
              onChange={e => setHraPct(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>40% (non-metro)</span><span>50% (metro)</span>
            </div>
          </div>

          {/* Other Allowances % */}
          <div>
            <label className="label">
              Other Allowances — <span className="text-violet-400">{otherAllowPct}% of CTC</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.otherAllowances)}/year)</span>}
            </label>
            <input
              type="range" min={0} max={30} step={1} value={otherAllowPct}
              onChange={e => setOtherAllowPct(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>0%</span><span>30%</span>
            </div>
          </div>

          {/* Metro toggle */}
          <div>
            <label className="label">City Type (for HRA)</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button
                onClick={() => setIsMetro(true)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${isMetro ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                Metro
              </button>
              <button
                onClick={() => setIsMetro(false)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${!isMetro ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                Non-Metro
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Metro: Delhi, Mumbai, Chennai, Kolkata</p>
          </div>
        </div>

        {/* ── Section 2: Additional CTC Components ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Additional CTC Components</h2>
          <p className="text-xs text-gray-500 -mt-1">Leave blank or enter 0 if not applicable. All values per year.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Bonus */}
            <div>
              <label className="label flex items-center gap-1.5">
                Bonus / Variable Pay (₹/year)
                <span title="Fully taxable. Included in CTC." className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input
                className="input"
                type="number" min="0" placeholder="0"
                value={bonusPay}
                onChange={e => setBonusPay(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Fully taxable in both regimes</p>
            </div>

            {/* LTA */}
            <div>
              <label className="label flex items-center gap-1.5">
                LTA – Leave Travel Allowance (₹/year)
                <span title="Exempt up to 2 journeys in a 4-year block under old regime only. Enter actual LTA received." className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input
                className="input"
                type="number" min="0" placeholder="0"
                value={ltaAnnual}
                onChange={e => setLtaAnnual(e.target.value)}
              />
              {regime === 'old' && (parseFloat(ltaAnnual) || 0) > 0 && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-violet-500 w-4 h-4"
                    checked={ltaExemptClaimed}
                    onChange={e => setLtaExemptClaimed(e.target.checked)}
                  />
                  <span className="text-xs text-gray-400">Claim LTA exemption (old regime)</span>
                </label>
              )}
              {regime === 'new' && (parseFloat(ltaAnnual) || 0) > 0 && (
                <p className="text-xs text-amber-400/80 mt-1">Taxable under new regime</p>
              )}
            </div>

            {/* Food Coupons */}
            <div>
              <label className="label flex items-center gap-1.5">
                Food Coupons / Meal Allowance (₹/year)
                <span title="Exempt up to ₹50/meal × 2 meals × 22 working days × 12 months = ₹26,400/year in old regime." className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input
                className="input"
                type="number" min="0" placeholder="0"
                value={foodCoupons}
                onChange={e => setFoodCoupons(e.target.value)}
              />
              {result && (parseFloat(foodCoupons) || 0) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Exempt: {fmtINR(result.foodExempt)} • Taxable: {fmtINR(result.foodTaxable)}
                </p>
              )}
            </div>

            {/* NPS Employer */}
            <div>
              <label className="label flex items-center gap-1.5">
                NPS Employer Contribution (₹/year)
                <span title="Section 80CCD(2): deductible in BOTH regimes. Capped at 10% of basic salary for private employers." className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help">?</span>
              </label>
              <input
                className="input"
                type="number" min="0" placeholder="0"
                value={npsEmployer}
                onChange={e => setNpsEmployer(e.target.value)}
              />
              {result && (
                <p className="text-xs text-gray-500 mt-1">
                  Cap (10% of basic): {fmtINR(result.npsEmpCap)} •{' '}
                  Allowed: {fmtINR(result.npsEmp)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Professional Tax ── */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Professional Tax</h2>

          <div>
            <label className="label">State</label>
            <select
              className="input"
              value={ptState}
              onChange={e => setPtState(e.target.value as PTState)}
            >
              {PT_STATES.map(s => (
                <option key={s.code} value={s.code}>
                  {s.label}{s.note ? ` — ${s.note}` : ''}
                </option>
              ))}
            </select>
          </div>

          {ptState === 'OTHER' && (
            <div>
              <label className="label">Professional Tax / month (₹)</label>
              <input
                className="input"
                type="number" min="0" max="250" placeholder="200"
                value={manualPtMonthly}
                onChange={e => setManualPtMonthly(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Capped at ₹2,500/year by law</p>
            </div>
          )}

          {result && (
            <p className="text-xs text-gray-500">
              Annual Professional Tax: <span className="text-gray-300">{fmtINR(result.profTaxAnnual)}</span>
              {ptState === 'MH' && ' (Maharashtra slab-based)'}
            </p>
          )}
        </div>

        {/* ── Section 4: Tax Regime ── */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-white">Tax Regime (FY 2025-26)</h2>
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
            ? <p className="text-xs text-gray-500">Standard deduction ₹75,000 • HRA/LTA not exempt • NPS 80CCD(2) allowed • 87A rebate up to ₹12L</p>
            : <p className="text-xs text-gray-500">Standard deduction ₹50,000 • HRA + LTA + food coupons exempt • 80C ₹1.5L • NPS 80CCD(2) allowed</p>
          }
        </div>

        {result && (
          <>
            {/* ── Hero take-home ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card text-center py-6 bg-gradient-to-br from-violet-600/10 to-purple-600/5 border-violet-500/20">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Monthly Take-Home</p>
                <p className="text-4xl font-bold text-violet-400">{fmtINR(result.monthlyTakeHome)}</p>
                <p className="text-xs text-gray-500 mt-2">{regime === 'new' ? 'New' : 'Old'} Regime • FY 2025-26</p>
              </div>
              <div className="card text-center py-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Annual Take-Home</p>
                <p className="text-4xl font-bold text-emerald-400">{fmtINR(result.annualTakeHome)}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {annualCTCNum > 0 ? (result.annualTakeHome / annualCTCNum * 100).toFixed(1) : '0'}% of CTC
                </p>
              </div>
            </div>

            {/* ── Regime comparison banner ── */}
            <div className={`card border ${result.betterRegime === 'new' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {result.betterRegime === 'new' ? '✓ New Regime saves you more' : '✓ Old Regime saves you more'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Save <span className="font-semibold text-emerald-400">{fmtINR(result.savings)}/year</span> by choosing{' '}
                    {result.betterRegime === 'new' ? 'New' : 'Old'} Regime
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">New Regime Tax</p>
                    <p className={`font-semibold ${result.betterRegime === 'new' ? 'text-emerald-400' : 'text-gray-300'}`}>{fmtINR(result.totalTaxNew)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Old Regime Tax</p>
                    <p className={`font-semibold ${result.betterRegime === 'old' ? 'text-emerald-400' : 'text-gray-300'}`}>{fmtINR(result.totalTaxOld)}</p>
                  </div>
                </div>
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
                    {/* Earnings section header */}
                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Earnings (In Payslip)
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-300 pl-5">Basic Salary</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.basic)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.basic / 12)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-300 pl-5">HRA</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.hra)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.hra / 12)}</td>
                    </tr>
                    {result.lta > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-300 pl-5">LTA</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.lta)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.lta / 12)}</td>
                      </tr>
                    )}
                    {result.food > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-300 pl-5">Food Coupons</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.food)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.food / 12)}</td>
                      </tr>
                    )}
                    {result.bonus > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-300 pl-5">Bonus / Variable Pay</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.bonus)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.bonus / 12)}</td>
                      </tr>
                    )}
                    {result.otherAllowances > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-300 pl-5">Other Allowances</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.otherAllowances)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.otherAllowances / 12)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-300 pl-5">
                        Special Allowance
                        <span className="text-xs text-gray-600 ml-1">(balancing figure)</span>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.specialAllowance)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.specialAllowance / 12)}</td>
                    </tr>

                    {/* Employer contributions section */}
                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Employer Contributions (CTC only, not in payslip)
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-5">
                        Employer PF (12% of basic, cap ₹1,800/mo)
                      </td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.pfEmployer)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.pfEmployer / 12)}</td>
                    </tr>
                    {result.npsEmp > 0 && (
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 px-3 text-gray-400 pl-5">
                          Employer NPS — 80CCD(2)
                        </td>
                        <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.npsEmp)}</td>
                        <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.npsEmp / 12)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400 pl-5">
                        Gratuity Provisioning (4.81% of basic)
                      </td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.gratuity)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtINR(result.gratuity / 12)}</td>
                    </tr>

                    {/* Total CTC */}
                    <tr className="border-b border-gray-700 bg-gray-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">Total CTC</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">{fmtINR(annualCTCNum)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">{fmtINR(annualCTCNum / 12)}</td>
                    </tr>

                    {/* Deductions */}
                    <tr className="bg-gray-800/40">
                      <td colSpan={3} className="py-1.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Deductions from Payslip
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-red-400/90 pl-5">Employee PF (12% of basic)</td>
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

                    {/* Net take-home */}
                    <tr className="bg-violet-600/10">
                      <td className="py-3 px-3 text-violet-300 font-bold rounded-bl-lg">= Net Take-Home</td>
                      <td className="py-3 px-3 text-right text-violet-300 font-bold">{fmtINR(result.annualTakeHome)}</td>
                      <td className="py-3 px-3 text-right text-violet-300 font-bold rounded-br-lg">{fmtINR(result.monthlyTakeHome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Monthly Payslip View ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Payslip</h3>
              <div className="grid sm:grid-cols-2 gap-0 border border-gray-700 rounded-xl overflow-hidden text-sm">
                {/* Earnings column */}
                <div className="border-b sm:border-b-0 sm:border-r border-gray-700">
                  <div className="bg-gray-800/60 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Earnings
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-gray-400">Basic</span>
                      <span className="text-gray-200">{fmtINR(result.basic / 12)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-gray-400">HRA</span>
                      <span className="text-gray-200">{fmtINR(result.hra / 12)}</span>
                    </div>
                    {result.lta > 0 && (
                      <div className="flex justify-between px-4 py-2">
                        <span className="text-gray-400">LTA</span>
                        <span className="text-gray-200">{fmtINR(result.lta / 12)}</span>
                      </div>
                    )}
                    {result.food > 0 && (
                      <div className="flex justify-between px-4 py-2">
                        <span className="text-gray-400">Food Coupons</span>
                        <span className="text-gray-200">{fmtINR(result.food / 12)}</span>
                      </div>
                    )}
                    {result.bonus > 0 && (
                      <div className="flex justify-between px-4 py-2">
                        <span className="text-gray-400">Bonus / Variable</span>
                        <span className="text-gray-200">{fmtINR(result.bonus / 12)}</span>
                      </div>
                    )}
                    {result.otherAllowances > 0 && (
                      <div className="flex justify-between px-4 py-2">
                        <span className="text-gray-400">Other Allowances</span>
                        <span className="text-gray-200">{fmtINR(result.otherAllowances / 12)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-gray-400">Special Allowance</span>
                      <span className="text-gray-200">{fmtINR(result.specialAllowance / 12)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 bg-gray-800/40 border-t border-gray-700">
                    <span className="font-semibold text-gray-200">Gross Pay</span>
                    <span className="font-semibold text-gray-100">{fmtINR(result.monthlyGross)}</span>
                  </div>
                </div>

                {/* Deductions column */}
                <div>
                  <div className="bg-gray-800/60 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Deductions
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    <div className="flex justify-between px-4 py-2">
                      <span className="text-gray-400">Provident Fund</span>
                      <span className="text-red-400/80">{fmtINR(result.monthlyPF)}</span>
                    </div>
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

              {/* Net Pay footer */}
              <div className="mt-0 border border-t-0 border-gray-700 rounded-b-xl bg-violet-600/10 flex justify-between items-center px-4 py-3">
                <span className="font-bold text-violet-300">Net Pay (Take-Home)</span>
                <span className="text-xl font-bold text-violet-300">{fmtINR(result.monthlyTakeHome)}</span>
              </div>
            </div>

            {/* ── Exempt Component Summary (old regime shown always; new regime shows differences) ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-1">Exemptions & Deductions Summary</h3>
              <p className="text-xs text-gray-500 mb-4">
                Old regime exemptions vs new regime treatment
              </p>
              <div className="space-y-3 text-sm">
                {/* HRA */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-gray-300 font-medium">HRA</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Old: <span className="text-emerald-400">{fmtINR(result.hraExemption)} exempt</span>
                      {result.hraTaxable > 0 && <span> + <span className="text-amber-400">{fmtINR(result.hraTaxable)} taxable</span></span>}
                      {' • '}New: fully taxable
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${result.hraExemption > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                    {result.hraExemption > 0 ? `saves ${fmtINR(result.hraExemption)}` : 'no exemption'}
                  </span>
                </div>

                {/* LTA */}
                {result.lta > 0 && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-gray-300 font-medium">LTA</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Old: <span className={ltaExemptClaimed && regime === 'old' ? 'text-emerald-400' : 'text-gray-400'}>
                          {ltaExemptClaimed ? `${fmtINR(result.ltaExempt)} exempt` : 'not claimed'}
                        </span>
                        {' • '}New: fully taxable
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${result.ltaExempt > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                      {result.ltaExempt > 0 ? `saves ${fmtINR(result.ltaExempt)}` : 'no exemption'}
                    </span>
                  </div>
                )}

                {/* Food Coupons */}
                {result.food > 0 && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-gray-300 font-medium">Food Coupons</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Exempt: <span className="text-emerald-400">{fmtINR(result.foodExempt)}</span>
                        {result.foodTaxable > 0 && <> + <span className="text-amber-400">taxable: {fmtINR(result.foodTaxable)}</span></>}
                        {' • '}Cap: ₹26,400/year
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      saves {fmtINR(result.foodExempt)}
                    </span>
                  </div>
                )}

                {/* NPS Employer */}
                {result.npsEmp > 0 && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-gray-300 font-medium">NPS Employer — 80CCD(2)</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Deductible in <span className="text-emerald-400">both regimes</span> •{' '}
                        {fmtINR(result.npsEmp)} deductible (cap: {fmtINR(result.npsEmpCap)})
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      saves {fmtINR(result.npsEmp)}
                    </span>
                  </div>
                )}

                {/* PF 80C */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-gray-300 font-medium">Employee PF — 80C</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Old: <span className="text-emerald-400">{fmtINR(Math.min(result.pfEmployee, 150000))} deductible</span> under 80C •{' '}
                      New: not applicable
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                    old regime only
                  </span>
                </div>
              </div>
            </div>

            {/* ── Tax Summary ── */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">
                Tax Details ({regime === 'new' ? 'New' : 'Old'} Regime)
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Taxable Income</p>
                  <p className="text-lg font-semibold text-gray-200">
                    {fmtINR(regime === 'new' ? result.taxableNew : result.taxableOld)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Annual Income Tax</p>
                  <p className="text-lg font-semibold text-amber-400">{fmtINR(result.activeTax)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Effective Tax Rate</p>
                  <p className="text-lg font-semibold text-gray-200">
                    {annualCTCNum > 0
                      ? (result.activeTax / annualCTCNum * 100).toFixed(2) + '%'
                      : '0%'}
                  </p>
                </div>
              </div>
              {regime === 'new' && result.taxableNew <= 1200000 && result.taxableNew > 0 && (
                <p className="text-xs text-emerald-400 mt-3 text-center">
                  Section 87A rebate applied — zero tax on taxable income up to ₹12,00,000
                </p>
              )}
              {regime === 'old' && result.taxableOld <= 500000 && result.taxableOld > 0 && (
                <p className="text-xs text-emerald-400 mt-3 text-center">
                  Section 87A rebate applied — zero tax on taxable income up to ₹5,00,000
                </p>
              )}
            </div>

            {/* ── Footer note ── */}
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 text-xs text-gray-500 space-y-1">
              <p>
                <span className="text-gray-400 font-medium">Employer PF</span> {fmtINR(result.pfEmployer)}/year and{' '}
                <span className="text-gray-400 font-medium">Gratuity provisioning</span> {fmtINR(result.gratuity)}/year
                are part of CTC but not in take-home.
              </p>
              <p>
                PF is capped at ₹1,800/month (12% of ₹15,000 wage ceiling) •
                Professional tax capped at ₹2,500/year •
                Food coupon exemption: ₹26,400/year •
                NPS 80CCD(2) cap: 10% of basic for private employees.
              </p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
