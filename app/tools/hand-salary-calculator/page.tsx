'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

function calcNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  // Section 87A: full rebate if taxable income ≤ ₹12,00,000
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
  // Section 87A: full rebate if taxable income ≤ ₹5,00,000
  if (taxableIncome <= 500000) return 0;

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

export default function HandSalaryCalculatorPage() {
  const [ctc, setCtc] = useState('1200000');
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(50);
  const [isMetro, setIsMetro] = useState(true);
  const [rentPaid, setRentPaid] = useState('0');
  const [profTaxMonthly, setProfTaxMonthly] = useState('200');
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [otherAllowPct, setOtherAllowPct] = useState(10);

  const result = useMemo(() => {
    const annualCTC = parseFloat(ctc);
    if (!annualCTC || isNaN(annualCTC) || annualCTC <= 0) return null;

    const rentAnnual = parseFloat(rentPaid) * 12 || 0;
    const profTaxAnnual = Math.min((parseFloat(profTaxMonthly) || 0) * 12, 2500);

    // Salary components (annual)
    const basic = annualCTC * (basicPct / 100);
    const hra = basic * (hraPct / 100);
    const otherAllowances = annualCTC * (otherAllowPct / 100);

    // PF: 12% of basic, capped at ₹1800/month = ₹21,600/year
    const pfEmployee = Math.min(basic * 0.12, 21600);
    const pfEmployer = Math.min(basic * 0.12, 21600);

    // Special Allowance = CTC - Basic - HRA - PF_employer - Other Allowances
    const specialAllowance = Math.max(0, annualCTC - basic - hra - pfEmployer - otherAllowances);

    // Gross salary (what employee receives before deductions — excludes employer PF)
    const grossSalary = basic + hra + specialAllowance + otherAllowances;

    // HRA Exemption (only if rent paid > 0)
    let hraExemption = 0;
    if (rentAnnual > 0) {
      const metroRate = isMetro ? 0.5 : 0.4;
      hraExemption = Math.min(
        hra,
        Math.max(0, rentAnnual - 0.1 * basic),
        basic * metroRate,
      );
    }

    // Taxable Income — New Regime
    // Standard deduction ₹75,000; HRA NOT exempt; no 80C
    const taxableNew = Math.max(0, annualCTC - pfEmployee - 75000 - profTaxAnnual);
    const baseTaxNew = calcNewRegimeTax(taxableNew);
    const cessNew = baseTaxNew * 0.04;
    const totalTaxNew = baseTaxNew + cessNew;
    const monthlyTaxNew = totalTaxNew / 12;

    // Taxable Income — Old Regime
    // Standard deduction ₹50,000; HRA exempt; 80C ₹1,50,000
    const deductions80C = Math.min(pfEmployee, 150000);
    const taxableOld = Math.max(0, annualCTC - pfEmployee - hraExemption - 50000 - profTaxAnnual - deductions80C);
    const baseTaxOld = calcOldRegimeTax(taxableOld);
    const cessOld = baseTaxOld * 0.04;
    const totalTaxOld = baseTaxOld + cessOld;
    const monthlyTaxOld = totalTaxOld / 12;

    const activeTax = regime === 'new' ? totalTaxNew : totalTaxOld;
    const activeMonthlyTax = regime === 'new' ? monthlyTaxNew : monthlyTaxOld;

    const monthlyPF = pfEmployee / 12;
    const monthlyProfTax = profTaxAnnual / 12;

    // Monthly take-home
    const monthlyGross = grossSalary / 12;
    const monthlyTakeHome = monthlyGross - monthlyPF - monthlyProfTax - activeMonthlyTax;
    const annualTakeHome = monthlyTakeHome * 12;

    const newSavings = totalTaxOld - totalTaxNew;
    const betterRegime = newSavings >= 0 ? 'new' : 'old';
    const savings = Math.abs(newSavings);

    return {
      basic,
      hra,
      specialAllowance,
      otherAllowances,
      pfEmployee,
      pfEmployer,
      grossSalary,
      hraExemption,
      profTaxAnnual,
      taxableNew,
      taxableOld,
      totalTaxNew,
      totalTaxOld,
      activeTax,
      monthlyGross,
      monthlyPF,
      monthlyProfTax,
      activeMonthlyTax,
      monthlyTakeHome,
      annualTakeHome,
      betterRegime,
      savings,
      newSavings,
    };
  }, [ctc, basicPct, hraPct, isMetro, rentPaid, profTaxMonthly, regime, otherAllowPct]);

  return (
    <ToolLayout
      title="Hand Salary Calculator India 2025"
      description="Calculate your in-hand (take-home) salary from CTC for FY 2025-26. Get a full breakdown of PF, HRA, professional tax, and income tax under new & old regime."
      icon="🧮"
      relatedTools={[
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '📊' },
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

        {/* Inputs */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Salary Details</h2>

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
              {result && <p className="text-xs text-gray-500 mt-1">≈ {fmtINR(parseFloat(ctc) / 12)}/month</p>}
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

          {/* Basic % Slider */}
          <div>
            <label className="label">
              Basic Salary — <span className="text-violet-400">{basicPct}% of CTC</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.basic)}/year)</span>}
            </label>
            <input
              type="range"
              min={30}
              max={60}
              step={1}
              value={basicPct}
              onChange={e => setBasicPct(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>30%</span><span>60%</span>
            </div>
          </div>

          {/* HRA % Slider */}
          <div>
            <label className="label">
              HRA — <span className="text-violet-400">{hraPct}% of Basic</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.hra)}/year)</span>}
            </label>
            <input
              type="range"
              min={40}
              max={50}
              step={1}
              value={hraPct}
              onChange={e => setHraPct(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>40% (non-metro)</span><span>50% (metro)</span>
            </div>
          </div>

          {/* Other Allowances Slider */}
          <div>
            <label className="label">
              Other Allowances — <span className="text-violet-400">{otherAllowPct}% of CTC</span>
              {result && <span className="text-gray-500 ml-2">({fmtINR(result.otherAllowances)}/year)</span>}
            </label>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={otherAllowPct}
              onChange={e => setOtherAllowPct(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>0%</span><span>30%</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Metro Toggle */}
            <div>
              <label className="label">City Type</label>
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

            {/* Professional Tax */}
            <div>
              <label className="label flex items-center gap-1.5">
                Professional Tax / month (₹)
                <span
                  title="Varies by state. Max ₹2,500/year. Common: ₹200/month in Karnataka, Maharashtra."
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-xs cursor-help"
                >
                  ?
                </span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="250"
                placeholder="200"
                value={profTaxMonthly}
                onChange={e => setProfTaxMonthly(e.target.value)}
              />
            </div>
          </div>

          {/* Tax Regime */}
          <div>
            <label className="label">Tax Regime (FY 2025-26)</label>
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
              ? <p className="text-xs text-gray-500 mt-1">Standard deduction ₹75,000 • No HRA/80C exemptions • 87A rebate up to ₹12L</p>
              : <p className="text-xs text-gray-500 mt-1">Standard deduction ₹50,000 • HRA + 80C (₹1.5L) deductions apply</p>
            }
          </div>
        </div>

        {result && (
          <>
            {/* Hero Take-Home */}
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
                  {(result.annualTakeHome / parseFloat(ctc) * 100).toFixed(1)}% of CTC
                </p>
              </div>
            </div>

            {/* Regime Comparison */}
            <div className={`card border ${result.betterRegime === 'new' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {result.betterRegime === 'new'
                      ? '✓ New Regime saves you more'
                      : '✓ Old Regime saves you more'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You save <span className="font-semibold text-emerald-400">{fmtINR(result.savings)}</span> per year by choosing{' '}
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

            {/* Detailed Breakdown */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Salary Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">Component</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Monthly</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-2.5 px-3 text-gray-300 font-semibold">Gross CTC</td>
                      <td className="py-2.5 px-3 text-right text-white font-semibold">{fmtINR(parseFloat(ctc) / 12)}</td>
                      <td className="py-2.5 px-3 text-right text-white font-semibold">{fmtINR(parseFloat(ctc))}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-6">Basic Salary</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.basic / 12)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.basic)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-6">HRA</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.hra / 12)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.hra)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-6">Special Allowance</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.specialAllowance / 12)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.specialAllowance)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-400 pl-6">Other Allowances</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.otherAllowances / 12)}</td>
                      <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.otherAllowances)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2.5 px-3 text-gray-300 font-medium">Gross Salary</td>
                      <td className="py-2.5 px-3 text-right text-gray-200">{fmtINR(result.monthlyGross)}</td>
                      <td className="py-2.5 px-3 text-right text-gray-200">{fmtINR(result.grossSalary)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-red-400/90 pl-6">(-) PF Employee (12%)</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.monthlyPF)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.pfEmployee)}</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-red-400/90 pl-6">(-) Professional Tax</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.monthlyProfTax)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.profTaxAnnual)}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-red-400/90 pl-6">(-) Income Tax + Cess</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.activeMonthlyTax)}</td>
                      <td className="py-2 px-3 text-right text-red-400/80">-{fmtINR(result.activeTax)}</td>
                    </tr>
                    <tr className="bg-violet-600/10">
                      <td className="py-3 px-3 text-violet-300 font-bold rounded-bl-lg">= Net Take-Home</td>
                      <td className="py-3 px-3 text-right text-violet-300 font-bold">{fmtINR(result.monthlyTakeHome)}</td>
                      <td className="py-3 px-3 text-right text-violet-300 font-bold rounded-br-lg">{fmtINR(result.annualTakeHome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Summary */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Tax Details ({regime === 'new' ? 'New' : 'Old'} Regime)</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Taxable Income</p>
                  <p className="text-lg font-semibold text-gray-200">{fmtINR(regime === 'new' ? result.taxableNew : result.taxableOld)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Annual Income Tax</p>
                  <p className="text-lg font-semibold text-amber-400">{fmtINR(result.activeTax)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Effective Tax Rate</p>
                  <p className="text-lg font-semibold text-gray-200">
                    {parseFloat(ctc) > 0
                      ? (result.activeTax / parseFloat(ctc) * 100).toFixed(2) + '%'
                      : '0%'}
                  </p>
                </div>
              </div>
              {regime === 'new' && (result.taxableNew <= 1200000 && result.taxableNew > 0) && (
                <p className="text-xs text-emerald-400 mt-3 text-center">
                  Section 87A rebate applied — zero tax on taxable income up to ₹12,00,000
                </p>
              )}
              {regime === 'old' && (result.taxableOld <= 500000 && result.taxableOld > 0) && (
                <p className="text-xs text-emerald-400 mt-3 text-center">
                  Section 87A rebate applied — zero tax on taxable income up to ₹5,00,000
                </p>
              )}
            </div>

            {/* Employer PF Note */}
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">Note:</span> Employer PF contribution of{' '}
              <span className="text-gray-300">{fmtINR(result.pfEmployer)}/year</span> is part of CTC but not included in gross salary or take-home.
              Professional tax is capped at ₹2,500/year per Indian law.
              PF is capped at ₹1,800/month (12% of ₹15,000 wage ceiling).
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
