'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const MAX_GRATUITY = 2000000; // ₹20,00,000

export default function GratuityCalculatorPage() {
  const [basicDA, setBasicDA] = useState('50000');
  const [yearsOfService, setYearsOfService] = useState('7');
  const [isCovered, setIsCovered] = useState(true);
  const [reason, setReason] = useState('resignation');

  const result = useMemo(() => {
    const salary = parseFloat(basicDA);
    const years = parseFloat(yearsOfService);
    if (!salary || !years || isNaN(salary) || isNaN(years) || salary <= 0 || years <= 0) return null;

    // Round up if fraction of year >= 6 months
    const wholeYears = Math.floor(years);
    const fractional = years - wholeYears;
    const effectiveYears = fractional >= 0.5 ? wholeYears + 1 : wholeYears;

    const isDeath = reason === 'death' || reason === 'disability';

    // Eligibility: 5 years min (except death/disability)
    const eligible = isDeath || effectiveYears >= 5;

    // Calculate gratuity
    let gratuity = 0;
    if (eligible) {
      if (isCovered) {
        gratuity = (salary * 15 * effectiveYears) / 26;
      } else {
        gratuity = (salary * 15 * effectiveYears) / 30;
      }
    }

    // Apply ₹20L ceiling
    const cappedAt20L = gratuity > MAX_GRATUITY;
    const actualGratuity = Math.min(gratuity, MAX_GRATUITY);

    // Tax exemption
    // Government employees: fully exempt
    // Private (covered): exempt up to ₹20L
    // Private (not covered): exempt = min(₹20L, actual gratuity, 15/26 × salary × years)
    let taxExempt = 0;
    if (eligible) {
      if (isCovered) {
        taxExempt = Math.min(actualGratuity, MAX_GRATUITY);
      } else {
        const notCoveredLimit = (15 / 26) * salary * effectiveYears;
        taxExempt = Math.min(actualGratuity, MAX_GRATUITY, notCoveredLimit);
      }
    }

    const taxableGratuity = Math.max(0, actualGratuity - taxExempt);

    const displayYears = Math.floor(years);
    const displayMonths = Math.round((years - displayYears) * 12);

    return {
      gratuity: actualGratuity,
      rawGratuity: gratuity,
      cappedAt20L,
      taxExempt,
      taxableGratuity,
      eligible,
      effectiveYears,
      displayYears,
      displayMonths,
    };
  }, [basicDA, yearsOfService, isCovered, reason]);

  return (
    <ToolLayout
      title="Gratuity Calculator"
      description="Calculate gratuity payable under Payment of Gratuity Act, 1972. Find taxable and exempt gratuity for covered and non-covered employees."
      icon="🎁"
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
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Employment Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Last Drawn Monthly Basic + DA (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="50000"
                value={basicDA}
                onChange={e => setBasicDA(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Basic salary + Dearness Allowance (DA) per month</p>
            </div>
            <div>
              <label className="label">Years of Service</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.1"
                placeholder="7"
                value={yearsOfService}
                onChange={e => setYearsOfService(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">E.g. 5.5 = 5 years 6 months. Fractions ≥ 6 months round up.</p>
            </div>
          </div>

          {/* Employee type toggle */}
          <div>
            <label className="label">Employee Type</label>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCovered(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  isCovered
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Covered under Gratuity Act
              </button>
              <button
                type="button"
                onClick={() => setIsCovered(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  !isCovered
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Not Covered under Gratuity Act
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Organizations with 10 or more employees are covered under the Payment of Gratuity Act, 1972.
            </p>
          </div>

          {/* Reason for leaving */}
          <div>
            <label className="label">Reason for Leaving</label>
            <select
              className="input"
              value={reason}
              onChange={e => setReason(e.target.value)}
            >
              <option value="resignation">Resignation</option>
              <option value="retirement">Retirement / Superannuation</option>
              <option value="death">Death</option>
              <option value="disability">Total Disability</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Death and Disability are exempt from the 5-year minimum service rule.</p>
          </div>
        </div>

        {result && (
          <>
            {/* Eligibility notice */}
            {!result.eligible && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <span className="text-red-400 text-lg shrink-0">⚠️</span>
                <div className="text-sm">
                  <p className="text-red-300 font-medium">Not Eligible for Gratuity</p>
                  <p className="text-gray-400 mt-1">
                    Minimum 5 years of continuous service is required to be eligible for gratuity.
                    Current service: {result.displayYears} year{result.displayYears !== 1 ? 's' : ''} {result.displayMonths > 0 ? `${result.displayMonths} month${result.displayMonths !== 1 ? 's' : ''}` : ''}.
                  </p>
                </div>
              </div>
            )}

            {result.eligible && (
              <>
                {/* Gratuity amount */}
                <div className="card text-center py-8">
                  <p className="text-4xl font-bold text-emerald-400">{fmtINR(result.gratuity)}</p>
                  <p className="text-sm text-gray-400 mt-2">Gratuity Amount</p>
                  {result.cappedAt20L && (
                    <p className="text-xs text-amber-400 mt-2">
                      Calculated amount was {fmtINR(result.rawGratuity)} — capped at statutory maximum of ₹20,00,000
                    </p>
                  )}
                </div>

                {/* Breakdown */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-4">Gratuity Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Monthly Basic + DA</p>
                      </div>
                      <span className="text-sm font-medium text-gray-200">{fmtINR(parseFloat(basicDA))}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Years of Service</p>
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        {result.displayYears} yr{result.displayYears !== 1 ? 's' : ''}
                        {result.displayMonths > 0 ? ` ${result.displayMonths} mo` : ''}
                        {' '}(effective: {result.effectiveYears} yr{result.effectiveYears !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Formula used</p>
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        Basic+DA × 15 × Years ÷ {isCovered ? '26' : '30'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Tax Exempt Amount</p>
                        <p className="text-xs text-gray-500">Up to ₹20,00,000 limit</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400">{fmtINR(result.taxExempt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-gray-300">Taxable Gratuity</p>
                        <p className="text-xs text-gray-500">Added to income, taxed at slab rate</p>
                      </div>
                      <span className="text-sm font-semibold text-red-400">{fmtINR(result.taxableGratuity)}</span>
                    </div>
                  </div>
                </div>

                {/* ₹20L cap notice */}
                {result.cappedAt20L && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-amber-400 text-lg shrink-0">ℹ️</span>
                    <div className="text-sm">
                      <p className="text-amber-300 font-medium">Statutory Maximum Limit Applied</p>
                      <p className="text-gray-400 mt-1">
                        The maximum gratuity payable under the Payment of Gratuity Act is ₹20,00,000 (revised in 2024).
                        Any amount above this is at the employer&apos;s discretion (ex-gratia) and may be fully taxable.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Info note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <span className="text-gray-400 text-lg shrink-0">ℹ️</span>
              <div className="text-sm text-gray-400">
                <p className="text-gray-300 font-medium mb-1">How gratuity is calculated</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong className="text-gray-300">Covered employees</strong> (Gratuity Act): Basic+DA × 15 × Years ÷ 26</li>
                  <li><strong className="text-gray-300">Not covered</strong>: Basic+DA × 15 × Years ÷ 30</li>
                  <li>Fractions ≥ 6 months in the last year are rounded up to the next full year</li>
                  <li>Government employees receive full tax exemption; private employees are exempt up to ₹20L</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
