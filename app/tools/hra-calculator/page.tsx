'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function HRACalculatorPage() {
  const [basicSalary, setBasicSalary] = useState('50000');
  const [hraReceived, setHraReceived] = useState('20000');
  const [rentPaid, setRentPaid] = useState('18000');
  const [isMetro, setIsMetro] = useState(true);

  const result = useMemo(() => {
    const basic = parseFloat(basicSalary);
    const hra = parseFloat(hraReceived);
    const rent = parseFloat(rentPaid);
    if (!basic || !hra || !rent || isNaN(basic) || isNaN(hra) || isNaN(rent) || basic <= 0 || hra <= 0 || rent <= 0) return null;

    const annualBasic = basic * 12;
    const annualHRA = hra * 12;
    const annualRent = rent * 12;

    const comp1 = annualHRA;
    const comp2 = Math.max(0, annualRent - 0.1 * annualBasic);
    const comp3 = (isMetro ? 0.5 : 0.4) * annualBasic;

    const exemption = Math.min(comp1, comp2, comp3);
    const taxableHRA = annualHRA - exemption;

    const taxSaving30 = exemption * 0.30;
    const taxSaving20 = exemption * 0.20;

    const minComp = exemption === comp1 ? 1 : exemption === comp2 ? 2 : 3;

    return { comp1, comp2, comp3, exemption, taxableHRA, taxSaving30, taxSaving20, minComp, annualHRA };
  }, [basicSalary, hraReceived, rentPaid, isMetro]);

  return (
    <ToolLayout
      title="HRA Exemption Calculator"
      description="Calculate your HRA exemption under Section 10(13A) of the Income Tax Act. Instantly find exempt vs taxable HRA for metro and non-metro cities."
      icon="🏠"
      relatedTools={[
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '🧾' },
        { name: 'In-Hand Salary Calculator', href: '/tools/hand-salary-calculator', icon: '💵' },
      ]}
    >
      <div className="space-y-6">
        {/* Country selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
          </select>
        </div>

        {/* Inputs */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Salary & Rent Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Basic Salary / month (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="50000"
                value={basicSalary}
                onChange={e => setBasicSalary(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Your monthly basic pay (exclude DA, HRA etc.)</p>
            </div>
            <div>
              <label className="label">HRA Received / month (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="20000"
                value={hraReceived}
                onChange={e => setHraReceived(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">HRA component in your salary slip</p>
            </div>
            <div>
              <label className="label">Rent Paid / month (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="18000"
                value={rentPaid}
                onChange={e => setRentPaid(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Actual rent you pay to your landlord</p>
            </div>
          </div>

          {/* City type toggle */}
          <div>
            <label className="label">City Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsMetro(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  isMetro
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Metro City (50%)
              </button>
              <button
                type="button"
                onClick={() => setIsMetro(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  !isMetro
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Non-Metro City (40%)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Metro cities: Delhi, Mumbai, Chennai, Kolkata — 50% of basic. All other cities — 40% of basic.
            </p>
          </div>
        </div>

        {result && (
          <>
            {/* Three components */}
            <div className="card space-y-4">
              <h2 className="text-sm font-semibold text-white">HRA Exemption Components (Annual)</h2>
              <p className="text-xs text-gray-500">Exemption = minimum of the three components below</p>

              <div className="space-y-3">
                {/* Component 1 */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${result.minComp === 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                  <div>
                    <p className="text-sm text-gray-300">
                      Component 1: Actual HRA received (annual)
                      {result.minComp === 1 && <span className="ml-2 text-xs text-emerald-400 font-medium">← Minimum (used)</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">HRA per month × 12</p>
                  </div>
                  <span className={`text-sm font-semibold ${result.minComp === 1 ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {fmtINR(result.comp1)}
                  </span>
                </div>

                {/* Component 2 */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${result.minComp === 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                  <div>
                    <p className="text-sm text-gray-300">
                      Component 2: Rent paid − 10% of Annual Basic
                      {result.minComp === 2 && <span className="ml-2 text-xs text-emerald-400 font-medium">← Minimum (used)</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Annual rent − 10% of annual basic salary</p>
                  </div>
                  <span className={`text-sm font-semibold ${result.minComp === 2 ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {fmtINR(result.comp2)}
                  </span>
                </div>

                {/* Component 3 */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${result.minComp === 3 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                  <div>
                    <p className="text-sm text-gray-300">
                      Component 3: {isMetro ? '50%' : '40%'} of Annual Basic ({isMetro ? 'Metro' : 'Non-Metro'})
                      {result.minComp === 3 && <span className="ml-2 text-xs text-emerald-400 font-medium">← Minimum (used)</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{isMetro ? '50%' : '40%'} × annual basic salary</p>
                  </div>
                  <span className={`text-sm font-semibold ${result.minComp === 3 ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {fmtINR(result.comp3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card text-center py-6">
                <p className="text-3xl font-bold text-emerald-400">{fmtINR(result.exemption)}</p>
                <p className="text-sm text-gray-400 mt-1">HRA Exemption (Annual)</p>
                <p className="text-xs text-gray-600 mt-0.5">Minimum of 3 components</p>
              </div>
              <div className="card text-center py-6">
                <p className="text-3xl font-bold text-red-400">{fmtINR(result.taxableHRA)}</p>
                <p className="text-sm text-gray-400 mt-1">Taxable HRA (Annual)</p>
                <p className="text-xs text-gray-600 mt-0.5">HRA received − Exemption</p>
              </div>
            </div>

            {/* Tax savings */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Estimated Annual Tax Saving</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div>
                    <p className="text-sm text-gray-300">At 30% tax slab</p>
                    <p className="text-xs text-gray-500 mt-0.5">For income above ₹10L</p>
                  </div>
                  <span className="text-sm font-semibold text-violet-400">{fmtINR(result.taxSaving30)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div>
                    <p className="text-sm text-gray-300">At 20% tax slab</p>
                    <p className="text-xs text-gray-500 mt-0.5">For income ₹5L–₹10L</p>
                  </div>
                  <span className="text-sm font-semibold text-violet-400">{fmtINR(result.taxSaving20)}</span>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-amber-400 text-lg shrink-0">ℹ️</span>
              <div className="text-sm">
                <p className="text-amber-300 font-medium mb-1">Old Tax Regime Only</p>
                <p className="text-gray-400">
                  HRA exemption under Section 10(13A) only applies under the <strong className="text-gray-300">Old Tax Regime</strong>.
                  Under the <strong className="text-gray-300">New Tax Regime</strong> (default from FY 2023-24), HRA exemption is not available and the entire HRA received is taxable.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
