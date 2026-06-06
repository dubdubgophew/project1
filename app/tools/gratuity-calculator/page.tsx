'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

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
            <span className="flex items-center gap-1.5 text-gray-400 min-w-0">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.label}</span>
            </span>
            <span className="text-gray-300 font-medium whitespace-nowrap">
              {fmtINR(p.value)} <span className="text-gray-500">({(p.pct * 100).toFixed(1)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MAX_GRATUITY = 2000000; // ₹20,00,000
const INFLATION_RATE = 0.06;

export default function GratuityCalculatorPage() {
  const [basicDA, setBasicDA] = useState('50000');
  const [yearsInput, setYearsInput] = useState('7');
  const [monthsInput, setMonthsInput] = useState('3');
  const [isCovered, setIsCovered] = useState(true);
  const [employmentType, setEmploymentType] = useState<'regular' | 'fixed-term'>('regular');
  const [reason, setReason] = useState('resignation');
  const [isGovt, setIsGovt] = useState(false);
  const [yearsToRetirement, setYearsToRetirement] = useState('10');

  const result = useMemo(() => {
    const salary = parseFloat(basicDA);
    const years = parseInt(yearsInput, 10) || 0;
    const months = parseInt(monthsInput, 10) || 0;
    if (!salary || isNaN(salary) || salary <= 0) return null;
    if (years < 0 || months < 0) return null;

    // Effective years: months >= 6 → round up
    const effectiveYears = months >= 6 ? years + 1 : years;

    const isDeath = reason === 'death' || reason === 'disability';
    const isVRS = reason === 'vrs';
    const isResignBefore5 = reason === 'resign-before-5';

    // Eligibility rules
    let eligible = false;
    let notEligibleReason = '';

    if (isResignBefore5) {
      eligible = false;
      notEligibleReason = 'Resignation before completing 5 years — not eligible for gratuity under regular service rules.';
    } else if (isDeath) {
      // No minimum service required
      eligible = effectiveYears >= 0;
      if (!eligible) notEligibleReason = 'No service completed.';
    } else if (isVRS) {
      eligible = effectiveYears >= 10;
      if (!eligible) notEligibleReason = 'VRS requires minimum 10 years of service. Current effective service: ' + effectiveYears + ' years.';
    } else if (employmentType === 'fixed-term') {
      // New Labour Code 2023 — eligible after 1 year
      eligible = effectiveYears >= 1;
      if (!eligible) notEligibleReason = 'Fixed-term employees require minimum 1 year of service under New Labour Code 2023.';
    } else {
      // Regular employee — 5 years minimum
      eligible = effectiveYears >= 5;
      if (!eligible) notEligibleReason = `Minimum 5 years of continuous service required. Effective service: ${effectiveYears} year${effectiveYears !== 1 ? 's' : ''}.`;
    }

    // Calculate gratuity
    let gratuity = 0;
    if (eligible) {
      const yearsForCalc = isDeath ? (effectiveYears > 0 ? effectiveYears : 1) : effectiveYears;
      if (isCovered) {
        gratuity = (salary * 15 * yearsForCalc) / 26;
      } else {
        gratuity = (salary * 15 * yearsForCalc) / 30;
      }
    }

    const cappedAt20L = gratuity > MAX_GRATUITY;
    const actualGratuity = Math.min(gratuity, MAX_GRATUITY);

    // Tax treatment
    let taxExempt = 0;
    let taxableGratuity = 0;
    if (eligible) {
      if (isGovt) {
        taxExempt = actualGratuity; // Fully exempt
      } else if (isCovered) {
        taxExempt = Math.min(actualGratuity, MAX_GRATUITY);
      } else {
        const notCoveredLimit = (15 / 26) * salary * effectiveYears;
        taxExempt = Math.min(actualGratuity, MAX_GRATUITY, notCoveredLimit);
      }
      taxableGratuity = Math.max(0, actualGratuity - taxExempt);
    }

    // Tax on taxable gratuity at 30% + 4% cess = 31.2%
    const taxOn30 = taxableGratuity * 0.312;

    // Inflation-adjusted PV
    const retYears = parseInt(yearsToRetirement, 10) || 0;
    const pvGratuity = retYears > 0
      ? actualGratuity / Math.pow(1 + INFLATION_RATE, retYears)
      : null;

    return {
      gratuity: actualGratuity,
      rawGratuity: gratuity,
      cappedAt20L,
      taxExempt,
      taxableGratuity,
      taxOn30,
      eligible,
      notEligibleReason,
      effectiveYears,
      enteredYears: years,
      enteredMonths: months,
      isResignBefore5,
      pvGratuity,
      retYears,
    };
  }, [basicDA, yearsInput, monthsInput, isCovered, employmentType, reason, isGovt, yearsToRetirement]);

  const toggleBtn = (active: boolean) =>
    `px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
      active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
    }`;

  return (
    <ToolLayout
        toolSlug="gratuity-calculator"
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
          </select>
        </div>

        {/* Inputs */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Employment Details</h2>

          {/* Salary */}
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
            <p className="text-xs text-gray-500 mt-1">Basic salary + Dearness Allowance per month</p>
          </div>

          {/* Service Period — Years + Months */}
          <div>
            <label className="label">Service Period</label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="7"
                  value={yearsInput}
                  onChange={e => setYearsInput(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Years</p>
              </div>
              <div className="flex-1">
                <select
                  className="input"
                  value={monthsInput}
                  onChange={e => setMonthsInput(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{i} month{i !== 1 ? 's' : ''}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Months (0–11)</p>
              </div>
            </div>
            {result && (
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-gray-400">
                  Entered: {result.enteredYears} yr{result.enteredYears !== 1 ? 's' : ''} {result.enteredMonths > 0 ? `${result.enteredMonths} mo` : ''}
                </span>
                <span className="text-gray-600">→</span>
                <span className={`font-medium ${result.enteredMonths >= 6 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  Effective: {result.effectiveYears} yr{result.effectiveYears !== 1 ? 's' : ''}
                  {result.enteredMonths >= 6 && ' (rounded up — months ≥ 6)'}
                </span>
              </div>
            )}
          </div>

          {/* Employment Type toggle */}
          <div>
            <label className="label">Employment Type</label>
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => setEmploymentType('regular')} className={toggleBtn(employmentType === 'regular')}>
                Regular Employee
              </button>
              <button type="button" onClick={() => setEmploymentType('fixed-term')} className={toggleBtn(employmentType === 'fixed-term')}>
                Fixed-Term Contract
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {employmentType === 'fixed-term'
                ? 'Under New Labour Code 2023: Fixed-term employees are eligible for gratuity after just 1 year of service.'
                : 'Regular employees require a minimum of 5 continuous years of service.'}
            </p>
            {employmentType === 'fixed-term' && (
              <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300">
                <span className="shrink-0">ℹ️</span>
                <span>New Labour Code 2023 — Fixed-Term Contract employees have gratuity eligibility from 1 year of service (not 5 years). Employers are required to pay pro-rated gratuity at end of each contract.</span>
              </div>
            )}
          </div>

          {/* Employee / Govt toggle */}
          <div>
            <label className="label">Employee Category</label>
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => { setIsCovered(true); setIsGovt(false); }} className={toggleBtn(isCovered && !isGovt)}>
                Private (Covered under Act)
              </button>
              <button type="button" onClick={() => { setIsCovered(false); setIsGovt(false); }} className={toggleBtn(!isCovered && !isGovt)}>
                Private (Not Covered)
              </button>
              <button type="button" onClick={() => { setIsCovered(true); setIsGovt(true); }} className={toggleBtn(isGovt)}>
                Government Employee
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {isGovt
                ? 'Government employees receive full tax exemption on gratuity — no upper limit.'
                : isCovered
                  ? 'Organizations with 10+ employees are covered under Payment of Gratuity Act, 1972.'
                  : 'Formula uses ÷30 instead of ÷26 for uncovered organizations.'}
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
              <option value="resignation">Resignation (after 5 years)</option>
              <option value="resign-before-5">Resignation before 5 years (Regular)</option>
              <option value="retirement">Retirement / Superannuation</option>
              <option value="vrs">Voluntary Retirement Scheme (VRS)</option>
              <option value="death">Death</option>
              <option value="disability">Total Disability</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {reason === 'death' || reason === 'disability'
                ? 'Death/Disability: eligible from Day 1 — no minimum service period required.'
                : reason === 'vrs'
                  ? 'VRS: eligible after completing minimum 10 years of service.'
                  : reason === 'resign-before-5'
                    ? 'Regular employees must complete 5 years before gratuity is payable on resignation.'
                    : 'Standard service rules apply.'}
            </p>
          </div>
        </div>

        {/* Inflation adjustment input */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-white">Inflation Adjustment (Optional)</h3>
          <div>
            <label className="label">Years to Retirement</label>
            <input
              className="input"
              type="number"
              min="0"
              max="40"
              placeholder="10"
              value={yearsToRetirement}
              onChange={e => setYearsToRetirement(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Shows present value of future gratuity at 6% inflation</p>
          </div>
        </div>

        {result && (
          <>
            {/* Not Eligible banner */}
            {!result.eligible && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <span className="text-red-400 text-xl shrink-0 mt-0.5">✗</span>
                <div className="text-sm">
                  <p className="text-red-300 font-semibold text-base">Not Eligible for Gratuity</p>
                  <p className="text-gray-400 mt-1">{result.notEligibleReason}</p>
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
                      Calculated amount was {fmtINR(result.rawGratuity)} — capped at statutory maximum ₹20,00,000
                    </p>
                  )}
                </div>

                {/* Breakdown */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-4">Gratuity Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <p className="text-sm text-gray-300">Monthly Basic + DA</p>
                      <span className="text-sm font-medium text-gray-200">{fmtINR(parseFloat(basicDA))}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Service Period (entered)</p>
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        {result.enteredYears} yr{result.enteredYears !== 1 ? 's' : ''}
                        {result.enteredMonths > 0 ? ` ${result.enteredMonths} mo` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Effective Years Used</p>
                        <p className="text-xs text-gray-500">After rounding rule (months ≥ 6 → round up)</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-400">
                        {result.effectiveYears} yr{result.effectiveYears !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <p className="text-sm text-gray-300">Formula</p>
                      <span className="text-sm font-medium text-gray-200">
                        Basic+DA × 15 × {result.effectiveYears} ÷ {isCovered ? '26' : '30'}
                      </span>
                    </div>

                    {/* Tax section */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Tax Exempt Amount</p>
                        <p className="text-xs text-gray-500">
                          {isGovt ? 'Govt employees: fully exempt' : `Up to ₹20,00,000 (private — ${isCovered ? 'covered' : 'not covered'})`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400">{fmtINR(result.taxExempt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-300">Taxable Gratuity</p>
                        <p className="text-xs text-gray-500">max(0, Gratuity − ₹20L)</p>
                      </div>
                      <span className="text-sm font-semibold text-red-400">{fmtINR(result.taxableGratuity)}</span>
                    </div>
                    {result.taxableGratuity > 0 && (
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm text-gray-300">Income Tax on Taxable Gratuity</p>
                          <p className="text-xs text-gray-500">At 30% slab + 4% cess = 31.2%</p>
                        </div>
                        <span className="text-sm font-semibold text-red-400">{fmtINR(result.taxOn30)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gratuity composition donut */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-4">Gratuity Composition</h3>
                  <PieChart segments={[
                    { label: 'Tax-Exempt Gratuity', value: result.taxExempt, color: '#10b981' },
                    { label: 'Taxable Gratuity', value: result.taxableGratuity, color: '#ef4444' },
                  ]} />
                  {result.taxableGratuity === 0 && (
                    <p className="text-xs text-emerald-400 mt-3 text-center">
                      Your entire gratuity of {fmtINR(result.gratuity)} is tax-exempt.
                    </p>
                  )}
                </div>

                {/* Inflation adjustment */}
                {result.pvGratuity !== null && result.retYears > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-white mb-3">Inflation-Adjusted Value</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{fmtINR(result.gratuity)}</p>
                        <p className="text-xs text-gray-400 mt-1">Gratuity at Retirement</p>
                        <p className="text-xs text-gray-600 mt-0.5">Nominal value (future rupees)</p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                        <p className="text-2xl font-bold text-amber-400">{fmtINR(result.pvGratuity)}</p>
                        <p className="text-xs text-gray-400 mt-1">Present Value Today</p>
                        <p className="text-xs text-gray-600 mt-0.5">At 6% inflation, {result.retYears} yrs away</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      In today&apos;s purchasing power, your {fmtINR(result.gratuity)} gratuity at retirement is worth approximately {fmtINR(result.pvGratuity)}.
                    </p>
                  </div>
                )}

                {/* ₹20L cap notice */}
                {result.cappedAt20L && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-amber-400 text-lg shrink-0">ℹ️</span>
                    <div className="text-sm">
                      <p className="text-amber-300 font-medium">Statutory Maximum Limit Applied</p>
                      <p className="text-gray-400 mt-1">
                        The maximum gratuity payable under the Payment of Gratuity Act is ₹20,00,000.
                        Any amount above this is ex-gratia at employer&apos;s discretion and may be fully taxable.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* How it works */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <span className="text-gray-400 text-lg shrink-0">ℹ️</span>
              <div className="text-sm text-gray-400">
                <p className="text-gray-300 font-medium mb-1">How gratuity is calculated</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong className="text-gray-300">Covered employees</strong> (Gratuity Act): Basic+DA × 15 × Years ÷ 26</li>
                  <li><strong className="text-gray-300">Not covered</strong>: Basic+DA × 15 × Years ÷ 30</li>
                  <li>Months ≥ 6 in the last year round up to the next full year</li>
                  <li><strong className="text-gray-300">Fixed-term</strong> (Labour Code 2023): eligible after 1 year, not 5</li>
                  <li>Death/Disability: eligible from Day 1, no minimum service</li>
                  <li>VRS: eligible after 10 years; Govt employees: fully tax-exempt</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
