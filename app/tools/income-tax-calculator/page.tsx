'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtPct = (n: number) => n.toFixed(2) + '%';

type AgeGroup = 'below60' | '60to80' | 'above80';

interface SlabRow {
  from: number;
  to: number;
  rate: number;
  taxOnSlab: number;
}

function calcNewRegimeDetails(taxableIncome: number): { slabRows: SlabRow[]; baseTax: number } {
  const slabs: Array<{ from: number; to: number; rate: number }> = [
    { from: 0, to: 400000, rate: 0 },
    { from: 400000, to: 800000, rate: 0.05 },
    { from: 800000, to: 1200000, rate: 0.10 },
    { from: 1200000, to: 1600000, rate: 0.15 },
    { from: 1600000, to: 2000000, rate: 0.20 },
    { from: 2000000, to: 2400000, rate: 0.25 },
    { from: 2400000, to: Infinity, rate: 0.30 },
  ];

  let baseTax = 0;
  const slabRows: SlabRow[] = [];

  for (const s of slabs) {
    if (taxableIncome <= s.from) break;
    const slice = Math.min(taxableIncome, s.to === Infinity ? taxableIncome : s.to) - s.from;
    const taxOnSlab = slice * s.rate;
    baseTax += taxOnSlab;
    if (slice > 0) {
      slabRows.push({ from: s.from, to: s.to, rate: s.rate, taxOnSlab });
    }
  }

  // Section 87A: full rebate if taxable ≤ ₹12L
  if (taxableIncome <= 1200000) {
    return { slabRows, baseTax: 0 };
  }

  return { slabRows, baseTax };
}

function calcOldRegimeDetails(taxableIncome: number, age: AgeGroup): { slabRows: SlabRow[]; baseTax: number } {
  const exemption = age === 'above80' ? 500000 : age === '60to80' ? 300000 : 250000;

  const slabs: Array<{ from: number; to: number; rate: number }> = [
    { from: 0, to: exemption, rate: 0 },
    { from: exemption, to: 500000, rate: 0.05 },
    { from: 500000, to: 1000000, rate: 0.20 },
    { from: 1000000, to: Infinity, rate: 0.30 },
  ];

  // Remove zero-width slabs for super senior (exemption >= 500000)
  const effectiveSlabs = slabs.filter(s => s.to > s.from || s.to === Infinity);

  let baseTax = 0;
  const slabRows: SlabRow[] = [];

  for (const s of effectiveSlabs) {
    if (taxableIncome <= s.from) break;
    if (s.to !== Infinity && s.to <= s.from) continue;
    const slice = Math.min(taxableIncome, s.to === Infinity ? taxableIncome : s.to) - s.from;
    if (slice <= 0) continue;
    const taxOnSlab = slice * s.rate;
    baseTax += taxOnSlab;
    slabRows.push({ from: s.from, to: s.to, rate: s.rate, taxOnSlab });
  }

  // Section 87A: rebate if taxable ≤ ₹5L (only for non-senior)
  if (age === 'below60' && taxableIncome <= 500000) {
    return { slabRows, baseTax: 0 };
  }

  return { slabRows, baseTax };
}

function calcSurcharge(baseTax: number, taxableIncome: number, regime: 'new' | 'old'): number {
  if (taxableIncome <= 5000000) return 0;
  if (taxableIncome <= 10000000) return baseTax * 0.10;
  if (taxableIncome <= 20000000) return baseTax * 0.15;
  if (taxableIncome <= 50000000) return baseTax * 0.25;
  // >5Cr: new regime caps at 25%, old regime 37%
  return baseTax * (regime === 'new' ? 0.25 : 0.37);
}

function capDeduction(value: string, max: number): number {
  const n = parseFloat(value) || 0;
  return Math.min(Math.max(0, n), max);
}

export default function IncomeTaxCalculatorPage() {
  const [grossSalary, setGrossSalary] = useState('1200000');
  const [otherIncome, setOtherIncome] = useState('0');
  const [age, setAge] = useState<AgeGroup>('below60');
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  // Old regime deductions
  const [ded80C, setDed80C] = useState('150000');
  const [ded80D, setDed80D] = useState('25000');
  const [hraExemption, setHraExemption] = useState('0');
  const [homeLoanInt, setHomeLoanInt] = useState('0');
  const [ded80CCD, setDed80CCD] = useState('50000');
  const [otherDed, setOtherDed] = useState('0');

  const result = useMemo(() => {
    const gross = parseFloat(grossSalary) || 0;
    const other = parseFloat(otherIncome) || 0;
    if (gross <= 0) return null;

    const totalIncome = gross + other;

    // ---- NEW REGIME ----
    const stdDedNew = 75000;
    const taxableNew = Math.max(0, totalIncome - stdDedNew);
    const { slabRows: slabsNew, baseTax: baseTaxNew } = calcNewRegimeDetails(taxableNew);
    const surchargeNew = calcSurcharge(baseTaxNew, taxableNew, 'new');
    const cessNew = (baseTaxNew + surchargeNew) * 0.04;
    const totalTaxNew = baseTaxNew + surchargeNew + cessNew;
    const effRateNew = totalIncome > 0 ? (totalTaxNew / totalIncome) * 100 : 0;
    const totalDedNew = stdDedNew;

    // ---- OLD REGIME ----
    const stdDedOld = 50000;
    const c80C = capDeduction(ded80C, 150000);
    const c80D = capDeduction(ded80D, age === '60to80' || age === 'above80' ? 50000 : 25000);
    const cHRA = Math.max(0, parseFloat(hraExemption) || 0);
    const cHomeLoan = capDeduction(homeLoanInt, 200000);
    const c80CCD = capDeduction(ded80CCD, 50000);
    const cOther = Math.max(0, parseFloat(otherDed) || 0);
    const totalDedOld = stdDedOld + c80C + c80D + cHRA + cHomeLoan + c80CCD + cOther;
    const taxableOld = Math.max(0, totalIncome - totalDedOld);
    const { slabRows: slabsOld, baseTax: baseTaxOld } = calcOldRegimeDetails(taxableOld, age);
    const surchargeOld = calcSurcharge(baseTaxOld, taxableOld, 'old');
    const cessOld = (baseTaxOld + surchargeOld) * 0.04;
    const totalTaxOld = baseTaxOld + surchargeOld + cessOld;
    const effRateOld = totalIncome > 0 ? (totalTaxOld / totalIncome) * 100 : 0;

    const savings = totalTaxOld - totalTaxNew;
    const betterRegime = savings >= 0 ? 'new' : 'old';
    const savingsAbs = Math.abs(savings);

    return {
      totalIncome,
      // New regime
      stdDedNew,
      totalDedNew,
      taxableNew,
      baseTaxNew,
      surchargeNew,
      cessNew,
      totalTaxNew,
      effRateNew,
      monthlyTDSNew: totalTaxNew / 12,
      slabsNew,
      // Old regime
      stdDedOld,
      totalDedOld,
      taxableOld,
      baseTaxOld,
      surchargeOld,
      cessOld,
      totalTaxOld,
      effRateOld,
      monthlyTDSOld: totalTaxOld / 12,
      slabsOld,
      // Comparison
      betterRegime,
      savings: savingsAbs,
      rawSavings: savings,
    };
  }, [grossSalary, otherIncome, age, regime, ded80C, ded80D, hraExemption, homeLoanInt, ded80CCD, otherDed]);

  const oldRegimeDisabled = regime === 'new';

  return (
    <ToolLayout
      title="Income Tax Calculator India FY 2025-26"
      description="Calculate income tax for FY 2025-26. Compare new vs old tax regime side by side. Includes Budget 2025 slabs, 87A rebate, surcharge, and cess. Free, instant."
      icon="📊"
      relatedTools={[
        { name: 'Hand Salary Calculator', href: '/tools/hand-salary-calculator', icon: '🧮' },
        { name: 'Loan / EMI Calculator', href: '/tools/loan-calculator', icon: '🏦' },
        { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
      ]}
    >
      <div className="space-y-6">

        {/* Country Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
            <option disabled value="UK">🇬🇧 UK (coming soon)</option>
          </select>
        </div>

        {/* Regime Toggle */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-semibold text-white">Tax Regime</h2>
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button
                onClick={() => setRegime('new')}
                className={`px-5 py-2 text-sm font-medium transition-colors ${regime === 'new' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                New Regime
              </button>
              <button
                onClick={() => setRegime('old')}
                className={`px-5 py-2 text-sm font-medium transition-colors ${regime === 'old' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                Old Regime
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {regime === 'new'
              ? 'New Regime (Budget 2025): Standard deduction ₹75,000 • 87A rebate up to ₹12L • No HRA/80C exemptions allowed'
              : 'Old Regime: Standard deduction ₹50,000 • HRA + 80C (₹1.5L) + other deductions applicable'}
          </p>
        </div>

        {/* Income Inputs */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Income Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Annual Gross Salary (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="12,00,000"
                value={grossSalary}
                onChange={e => setGrossSalary(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Other Income (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={otherIncome}
                onChange={e => setOtherIncome(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Rent, interest, capital gains, etc.</p>
            </div>
          </div>

          <div>
            <label className="label">Age Group</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button
                onClick={() => setAge('below60')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-medium transition-colors ${age === 'below60' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                Below 60
              </button>
              <button
                onClick={() => setAge('60to80')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-medium transition-colors ${age === '60to80' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                60–80 (Senior)
              </button>
              <button
                onClick={() => setAge('above80')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-medium transition-colors ${age === 'above80' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                80+ (Super Senior)
              </button>
            </div>
            {age !== 'below60' && (
              <p className="text-xs text-gray-500 mt-1">
                {age === '60to80' ? 'Senior citizen: basic exemption ₹3,00,000 (old regime)' : 'Super senior: basic exemption ₹5,00,000 (old regime)'}
              </p>
            )}
          </div>
        </div>

        {/* Deductions — Old Regime Only */}
        <div className={`card space-y-4 transition-opacity duration-200 ${oldRegimeDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Deductions</h2>
            {oldRegimeDisabled && (
              <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                Old Regime only
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                Section 80C (₹)
                <span className="text-xs text-gray-500">max ₹1,50,000</span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="150000"
                placeholder="1,50,000"
                value={ded80C}
                onChange={e => setDed80C(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">PPF, ELSS, LIC, EPF, NSC, etc.</p>
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                Section 80D — Health Insurance (₹)
                <span className="text-xs text-gray-500">
                  max {age === '60to80' || age === 'above80' ? '₹50,000' : '₹25,000'}
                </span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="25,000"
                value={ded80D}
                onChange={e => setDed80D(e.target.value)}
              />
            </div>

            <div>
              <label className="label">HRA Exemption (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={hraExemption}
                onChange={e => setHraExemption(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Use Hand Salary Calculator to compute HRA exemption</p>
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                Home Loan Interest — Section 24b (₹)
                <span className="text-xs text-gray-500">max ₹2,00,000</span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="200000"
                placeholder="0"
                value={homeLoanInt}
                onChange={e => setHomeLoanInt(e.target.value)}
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                NPS — Section 80CCD(1B) (₹)
                <span className="text-xs text-gray-500">max ₹50,000</span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="50000"
                placeholder="0"
                value={ded80CCD}
                onChange={e => setDed80CCD(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Other Deductions (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={otherDed}
                onChange={e => setOtherDed(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">80G donations, 80E education loan interest, etc.</p>
            </div>
          </div>
        </div>

        {result && (
          <>
            {/* Better Regime Banner */}
            <div className={`card border ${result.betterRegime === 'new' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-base font-semibold text-white">
                    {result.betterRegime === 'new'
                      ? '✓ New Regime is better for you'
                      : '✓ Old Regime is better for you'}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Save <span className="text-emerald-400 font-semibold">{fmtINR(result.savings)}/year</span> by choosing the{' '}
                    {result.betterRegime === 'new' ? 'New' : 'Old'} Regime
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${result.betterRegime === 'new' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  Save {fmtINR(result.savings)}
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* New Regime */}
              <div className={`card space-y-3 ${regime === 'new' ? 'border-violet-500/30 bg-violet-500/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">New Regime</h3>
                  {result.betterRegime === 'new' && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Better</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gross Income</span>
                    <span className="text-gray-200">{fmtINR(result.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Standard Deduction</span>
                    <span className="text-gray-200">−{fmtINR(result.stdDedNew)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Taxable Income</span>
                    <span className="text-white">{fmtINR(result.taxableNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Tax</span>
                    <span className="text-amber-400">{fmtINR(result.baseTaxNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Surcharge</span>
                    <span className="text-gray-300">{fmtINR(result.surchargeNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cess (4%)</span>
                    <span className="text-gray-300">{fmtINR(result.cessNew)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                    <span className="text-white">Total Tax Payable</span>
                    <span className="text-amber-400 text-base">{fmtINR(result.totalTaxNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly TDS</span>
                    <span className="text-gray-200">{fmtINR(result.monthlyTDSNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Effective Rate</span>
                    <span className="text-gray-200">{fmtPct(result.effRateNew)}</span>
                  </div>
                  {result.taxableNew <= 1200000 && result.taxableNew > 0 && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-2 py-1.5">
                      87A rebate: zero tax (income ≤ ₹12L)
                    </p>
                  )}
                </div>
              </div>

              {/* Old Regime */}
              <div className={`card space-y-3 ${regime === 'old' ? 'border-violet-500/30 bg-violet-500/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Old Regime</h3>
                  {result.betterRegime === 'old' && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Better</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gross Income</span>
                    <span className="text-gray-200">{fmtINR(result.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Deductions</span>
                    <span className="text-gray-200">−{fmtINR(result.totalDedOld)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Taxable Income</span>
                    <span className="text-white">{fmtINR(result.taxableOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Tax</span>
                    <span className="text-amber-400">{fmtINR(result.baseTaxOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Surcharge</span>
                    <span className="text-gray-300">{fmtINR(result.surchargeOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cess (4%)</span>
                    <span className="text-gray-300">{fmtINR(result.cessOld)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                    <span className="text-white">Total Tax Payable</span>
                    <span className="text-amber-400 text-base">{fmtINR(result.totalTaxOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly TDS</span>
                    <span className="text-gray-200">{fmtINR(result.monthlyTDSOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Effective Rate</span>
                    <span className="text-gray-200">{fmtPct(result.effRateOld)}</span>
                  </div>
                  {result.taxableOld <= 500000 && result.taxableOld > 0 && age === 'below60' && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-2 py-1.5">
                      87A rebate: zero tax (income ≤ ₹5L)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Slab-wise breakdown */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">
                Slab-wise Tax Breakdown — {regime === 'new' ? 'New' : 'Old'} Regime
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">Income Slab</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Rate</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Tax on Slab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(regime === 'new' ? result.slabsNew : result.slabsOld).map((row, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-2 px-3 text-gray-300">
                          {fmtINR(row.from)} – {row.to === Infinity ? 'Above' : fmtINR(row.to)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-400">{(row.rate * 100).toFixed(0)}%</td>
                        <td className="py-2 px-3 text-right text-amber-400">{fmtINR(row.taxOnSlab)}</td>
                      </tr>
                    ))}
                    {(regime === 'new' ? result.slabsNew : result.slabsOld).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500 text-sm">
                          No tax — income below exemption or 87A rebate applied
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800/30">
                      <td className="py-2.5 px-3 text-gray-300 font-medium">Base Tax Subtotal</td>
                      <td />
                      <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                        {fmtINR(regime === 'new' ? result.baseTaxNew : result.baseTaxOld)}
                      </td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="py-2 px-3 text-gray-400">+ Surcharge</td>
                      <td />
                      <td className="py-2 px-3 text-right text-gray-300">
                        {fmtINR(regime === 'new' ? result.surchargeNew : result.surchargeOld)}
                      </td>
                    </tr>
                    <tr className="bg-gray-800/30">
                      <td className="py-2 px-3 text-gray-400">+ Health & Education Cess (4%)</td>
                      <td />
                      <td className="py-2 px-3 text-right text-gray-300">
                        {fmtINR(regime === 'new' ? result.cessNew : result.cessOld)}
                      </td>
                    </tr>
                    <tr className="bg-violet-600/10">
                      <td className="py-3 px-3 text-violet-300 font-bold">Total Tax Payable</td>
                      <td />
                      <td className="py-3 px-3 text-right text-violet-300 font-bold text-base">
                        {fmtINR(regime === 'new' ? result.totalTaxNew : result.totalTaxOld)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Tax Slabs Reference */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">FY 2025-26 Tax Slabs Reference</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">New Regime</p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-gray-800">
                      {[
                        ['₹0 – ₹4,00,000', '0%'],
                        ['₹4,00,001 – ₹8,00,000', '5%'],
                        ['₹8,00,001 – ₹12,00,000', '10%'],
                        ['₹12,00,001 – ₹16,00,000', '15%'],
                        ['₹16,00,001 – ₹20,00,000', '20%'],
                        ['₹20,00,001 – ₹24,00,000', '25%'],
                        ['Above ₹24,00,000', '30%'],
                      ].map(([slab, rate]) => (
                        <tr key={slab}>
                          <td className="py-1.5 text-gray-400">{slab}</td>
                          <td className="py-1.5 text-right text-violet-400 font-medium">{rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">87A rebate: zero tax if income ≤ ₹12L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Old Regime</p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-gray-800">
                      {[
                        ['₹0 – ₹2,50,000', '0%'],
                        ['₹2,50,001 – ₹5,00,000', '5%'],
                        ['₹5,00,001 – ₹10,00,000', '20%'],
                        ['Above ₹10,00,000', '30%'],
                      ].map(([slab, rate]) => (
                        <tr key={slab}>
                          <td className="py-1.5 text-gray-400">{slab}</td>
                          <td className="py-1.5 text-right text-amber-400 font-medium">{rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    Senior (60+): ₹3L exempt • Super senior (80+): ₹5L exempt<br />
                    87A rebate: zero tax if income ≤ ₹5L
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
