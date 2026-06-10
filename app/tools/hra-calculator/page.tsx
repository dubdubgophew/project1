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

export default function HRACalculatorPage() {
  const [inputMode, setInputMode] = useState<'monthly' | 'annual'>('monthly');
  const [basicSalary, setBasicSalary] = useState('50000');
  const [hraReceived, setHraReceived] = useState('20000');
  const [rentPaid, setRentPaid] = useState('18000');
  const [isMetro, setIsMetro] = useState(true);
  const [annualCTC, setAnnualCTC] = useState('1200000');

  const result = useMemo(() => {
    const basicRaw = parseFloat(basicSalary);
    const hraRaw = parseFloat(hraReceived);
    const rentRaw = parseFloat(rentPaid);
    if (!basicRaw || !hraRaw || !rentRaw || isNaN(basicRaw) || isNaN(hraRaw) || isNaN(rentRaw) || basicRaw <= 0 || hraRaw <= 0 || rentRaw <= 0) return null;

    // Normalize to monthly
    const monthlyBasic = inputMode === 'annual' ? basicRaw / 12 : basicRaw;
    const monthlyHRA = inputMode === 'annual' ? hraRaw / 12 : hraRaw;
    const monthlyRent = inputMode === 'annual' ? rentRaw / 12 : rentRaw;

    const annualBasic = monthlyBasic * 12;
    const annualHRA = monthlyHRA * 12;
    const annualRent = monthlyRent * 12;

    const comp1 = annualHRA;
    const comp2 = Math.max(0, annualRent - 0.1 * annualBasic);
    const comp3 = (isMetro ? 0.5 : 0.4) * annualBasic;

    const exemption = Math.min(comp1, comp2, comp3);
    const taxableHRA = annualHRA - exemption;

    const taxSaving30 = exemption * 0.312; // 30% + 4% cess
    const taxSaving20 = exemption * 0.208; // 20% + 4% cess
    const taxSaving10 = exemption * 0.104; // 10% + 4% cess

    const minComp = exemption === comp1 ? 1 : exemption === comp2 ? 2 : 3;

    // Metro vs non-metro comparison
    const metroComp3 = 0.5 * annualBasic;
    const nonMetroComp3 = 0.4 * annualBasic;
    const metroExemption = Math.min(comp1, comp2, metroComp3);
    const nonMetroExemption = Math.min(comp1, comp2, nonMetroComp3);
    const metroBonus = metroExemption - nonMetroExemption;

    // CTC-based HRA %
    const ctcVal = parseFloat(annualCTC);
    const hraAsCTC = ctcVal > 0 && !isNaN(ctcVal) ? (annualHRA / ctcVal) * 100 : null;

    // PAN requirement
    const panRequired = annualRent > 100000;
    const tdsApplicable = monthlyRent > 50000;
    const panWarning = annualRent > 100000 && annualRent <= 600000; // subtle range reminder

    return {
      comp1, comp2, comp3,
      exemption, taxableHRA,
      taxSaving30, taxSaving20, taxSaving10,
      minComp,
      annualHRA, annualRent,
      monthlyBasic, monthlyHRA, monthlyRent,
      metroBonus,
      hraAsCTC,
      panRequired,
      tdsApplicable,
      panWarning,
    };
  }, [basicSalary, hraReceived, rentPaid, isMetro, inputMode, annualCTC]);

  const inputLabel = inputMode === 'monthly' ? '/ month' : '/ year';

  return (
    <ToolLayout
        toolSlug="hra-calculator"
      title="HRA Exemption Calculator"
      description="Calculate your HRA exemption under Section 10(13A) of the Income Tax Act. Instantly find exempt vs taxable HRA for metro and non-metro cities."
      icon="🏠"
      relatedTools={[
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '🧾' },
        { name: 'In-Hand Salary Calculator', href: '/tools/hand-salary-calculator', icon: '💵' },
      ]}
      faqs={[
        {
          q: 'Is this HRA calculator free?',
          a: 'Yes, completely free. No registration or payment required. Calculate your HRA exemption instantly for any salary and rent combination.',
        },
        {
          q: 'Which country\'s HRA rules does this calculator follow?',
          a: 'This calculator is built for India. It applies Section 10(13A) of the Indian Income Tax Act — the three-component minimum rule (actual HRA received, rent paid minus 10% of basic, and 50%/40% of basic for metro/non-metro cities). It is relevant only under the Indian Old Tax Regime; HRA exemption is not available under the New Tax Regime.',
        },
        {
          q: 'How do I use the HRA exemption calculator?',
          a: 'Enter your Basic Salary, HRA Received, and Rent Paid (monthly or annual using the toggle). Select your city type — Metro (Delhi, Mumbai, Chennai, Kolkata) for 50% limit, or Non-Metro for 40% limit. The calculator instantly shows the three HRA components, the minimum (which is your exemption), taxable HRA, and estimated tax savings at 10%, 20%, and 30% slabs.',
        },
        {
          q: 'What does this HRA calculator compute?',
          a: 'It calculates all three HRA exemption components (actual HRA, excess rent over 10% of basic, 50%/40% of basic), identifies the limiting minimum component, splits your annual HRA into exempt and taxable portions, estimates annual tax savings at all three income tax slabs (10%, 20%, 30%), shows metro vs non-metro comparison, flags PAN of landlord requirement when rent exceeds ₹1,00,000/year, and alerts when TDS (Section 194-IB) applies for rent above ₹50,000/month.',
        },
        {
          q: 'Does HRA exemption apply under the New Tax Regime?',
          a: 'No. HRA exemption under Section 10(13A) is exclusively available under the Old Tax Regime. Under the New Tax Regime (the default from FY 2023-24 onwards), the entire HRA received is added to your taxable income and there is no exemption, regardless of how much rent you pay. If claiming HRA exemption is important to you, you must opt for the Old Tax Regime when filing your ITR.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Old Regime prominent notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40">
          <span className="text-amber-700 text-xl shrink-0 mt-0.5">⚠️</span>
          <div className="text-sm">
            <p className="text-amber-300 font-semibold text-base mb-1">Old Regime Only — HRA Exemption does NOT apply under New Regime</p>
            <p className="text-amber-200/80">
              HRA exemption under Section 10(13A) is <strong className="text-amber-200">exclusively available under the Old Tax Regime</strong>.
              Under the <strong className="text-amber-200">New Tax Regime</strong> (default from FY 2023-24), there is no HRA exemption and the
              entire HRA received is added to your taxable income.
            </p>
          </div>
        </div>

        {/* Country selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-900">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
          </select>
        </div>

        {/* Monthly / Annual toggle */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Salary & Rent Details</h2>
            <div className="flex gap-1 p-1 bg-stone-50 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setInputMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inputMode === 'monthly'
                    ? 'bg-violet-600 text-white'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInputMode('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inputMode === 'annual'
                    ? 'bg-violet-600 text-white'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Basic Salary {inputLabel} (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder={inputMode === 'monthly' ? '50000' : '600000'}
                value={basicSalary}
                onChange={e => setBasicSalary(e.target.value)}
              />
              <p className="text-xs text-stone-500 mt-1">Exclude DA, HRA and other allowances</p>
            </div>
            <div>
              <label className="label">HRA Received {inputLabel} (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder={inputMode === 'monthly' ? '20000' : '240000'}
                value={hraReceived}
                onChange={e => setHraReceived(e.target.value)}
              />
              <p className="text-xs text-stone-500 mt-1">HRA component in your salary slip</p>
            </div>
            <div>
              <label className="label">Rent Paid {inputLabel} (₹)</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder={inputMode === 'monthly' ? '18000' : '216000'}
                value={rentPaid}
                onChange={e => setRentPaid(e.target.value)}
              />
              <p className="text-xs text-stone-500 mt-1">Actual rent paid to landlord</p>
            </div>
          </div>

          {/* Annual CTC for % calculation */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Annual CTC (₹) <span className="text-stone-600 font-normal">— optional</span></label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="1200000"
                value={annualCTC}
                onChange={e => setAnnualCTC(e.target.value)}
              />
              <p className="text-xs text-stone-500 mt-1">Used to calculate HRA as % of CTC</p>
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
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
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
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                Non-Metro City (40%)
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Metro cities: Delhi, Mumbai, Chennai, Kolkata — 50% of basic. All other cities — 40% of basic.
            </p>
          </div>
        </div>

        {/* PAN / TDS warnings (shown as soon as inputs exist) */}
        {result && result.panRequired && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <span className="text-blue-700 text-lg shrink-0">📋</span>
            <div className="text-sm space-y-1">
              <p className="text-blue-300 font-medium">PAN of Landlord Mandatory</p>
              <p className="text-stone-500">Annual rent exceeds ₹1,00,000 — you <strong className="text-stone-700">must submit landlord&apos;s PAN</strong> to your employer to claim HRA exemption (Form 12BB).</p>
              {result.tdsApplicable && (
                <p className="text-amber-300 mt-2 font-medium">
                  TDS @10% deductible — Monthly rent exceeds ₹50,000. You must deduct TDS under Section 194-IB before paying the landlord.
                </p>
              )}
            </div>
          </div>
        )}

        {result && (
          <>
            {/* Three components */}
            <div className="card space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">HRA Exemption Components (Annual)</h2>
                <p className="text-xs text-stone-500 mt-0.5">Exemption = minimum of the three components below</p>
              </div>

              <div className="space-y-3">
                {/* Component 1 */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${result.minComp === 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-stone-50 border-stone-200'}`}>
                  <div>
                    <p className="text-sm text-stone-700 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Component 1</span>
                      <span className="text-stone-500">Actual HRA received</span>
                      {result.minComp === 1 && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                          ← Minimum (Exempt)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {fmtINR(result.monthlyHRA)}/mo × 12
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${result.minComp === 1 ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {fmtINR(result.comp1)}
                  </span>
                </div>

                {/* Component 2 */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${result.minComp === 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-stone-50 border-stone-200'}`}>
                  <div>
                    <p className="text-sm text-stone-700 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Component 2</span>
                      <span className="text-stone-500">Rent paid − 10% of Annual Basic</span>
                      {result.minComp === 2 && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                          ← Minimum (Exempt)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {fmtINR(result.annualRent)} − 10% of {fmtINR(result.monthlyBasic * 12)}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${result.minComp === 2 ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {fmtINR(result.comp2)}
                  </span>
                </div>

                {/* Component 3 */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${result.minComp === 3 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-stone-50 border-stone-200'}`}>
                  <div>
                    <p className="text-sm text-stone-700 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Component 3</span>
                      <span className="text-stone-500">{isMetro ? '50%' : '40%'} of Annual Basic ({isMetro ? 'Metro' : 'Non-Metro'})</span>
                      {result.minComp === 3 && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                          ← Minimum (Exempt)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {isMetro ? '50%' : '40%'} × {fmtINR(result.monthlyBasic * 12)}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${result.minComp === 3 ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {fmtINR(result.comp3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card text-center py-6">
                <p className="text-3xl font-bold text-emerald-700">{fmtINR(result.exemption)}</p>
                <p className="text-sm text-stone-500 mt-1">HRA Exemption (Annual)</p>
                <p className="text-xs text-stone-500 mt-0.5">{fmtINR(Math.round(result.exemption / 12))}/month</p>
              </div>
              <div className="card text-center py-6">
                <p className="text-3xl font-bold text-red-600">{fmtINR(result.taxableHRA)}</p>
                <p className="text-sm text-stone-500 mt-1">Taxable HRA (Annual)</p>
                <p className="text-xs text-stone-500 mt-0.5">{fmtINR(Math.round(result.taxableHRA / 12))}/month</p>
              </div>
              <div className="card text-center py-6">
                <p className="text-3xl font-bold text-violet-600">
                  {result.hraAsCTC !== null ? result.hraAsCTC.toFixed(1) + '%' : '—'}
                </p>
                <p className="text-sm text-stone-500 mt-1">HRA as % of CTC</p>
                <p className="text-xs text-stone-500 mt-0.5">Annual HRA ÷ Annual CTC</p>
              </div>
            </div>

            {/* HRA exempt vs taxable donut */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-4">HRA Exempt vs Taxable Split</h3>
              <PieChart segments={[
                { label: 'HRA Exempt (Tax-Free)', value: result.exemption, color: '#10b981' },
                { label: 'Taxable HRA (Added to Income)', value: result.taxableHRA, color: '#ef4444' },
              ]} />
            </div>

            {/* Tax savings — all three brackets */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Annual Tax Savings on HRA Exemption</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <p className="text-sm text-stone-700">At 30% slab</p>
                    <p className="text-xs text-stone-500 mt-0.5">Income &gt; ₹10L (+ 4% cess)</p>
                  </div>
                  <span className="text-sm font-semibold text-violet-600">{fmtINR(result.taxSaving30)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <p className="text-sm text-stone-700">At 20% slab</p>
                    <p className="text-xs text-stone-500 mt-0.5">₹5L–₹10L (+ 4% cess)</p>
                  </div>
                  <span className="text-sm font-semibold text-violet-600">{fmtINR(result.taxSaving20)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <p className="text-sm text-stone-700">At 10% slab</p>
                    <p className="text-xs text-stone-500 mt-0.5">₹2.5L–₹5L (+ 4% cess)</p>
                  </div>
                  <span className="text-sm font-semibold text-violet-600">{fmtINR(result.taxSaving10)}</span>
                </div>
              </div>
            </div>

            {/* Metro vs Non-Metro comparison */}
            {result.metroBonus > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Metro vs Non-Metro Comparison</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${isMetro ? 'bg-violet-50 border-violet-500/30' : 'bg-stone-50 border-stone-200'}`}>
                    <p className="text-xs text-stone-500 mb-1">Metro City (50% of Basic)</p>
                    <p className={`text-lg font-bold ${isMetro ? 'text-violet-600' : 'text-stone-700'}`}>
                      {fmtINR(Math.min(result.comp1, result.comp2, 0.5 * result.monthlyBasic * 12))}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">HRA Exemption</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${!isMetro ? 'bg-violet-50 border-violet-500/30' : 'bg-stone-50 border-stone-200'}`}>
                    <p className="text-xs text-stone-500 mb-1">Non-Metro City (40% of Basic)</p>
                    <p className={`text-lg font-bold ${!isMetro ? 'text-violet-600' : 'text-stone-700'}`}>
                      {fmtINR(Math.min(result.comp1, result.comp2, 0.4 * result.monthlyBasic * 12))}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">HRA Exemption</p>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-3">
                  Metro city gives <span className="text-emerald-700 font-medium">{fmtINR(result.metroBonus)} extra exemption per year</span> compared to non-metro (at same basic and rent).
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
