'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

// ── Helpers ─────────────────────────────────────────────────────────────────
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

function calcEMI(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

interface YearSummary {
  year: number;
  openingBalance: number;
  emiPaid: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

interface LumpSum {
  amount: string;
  afterMonth: string;
}

interface AmortResult {
  emi: number;
  totalPaid: number;
  totalInterest: number;
  yearSummaries: YearSummary[];
  // With prepayment
  prepayTenureMonths: number;
  prepayInterestSaved: number;
  revisedEMI: number; // for reduce-EMI mode
}

function buildAmortization(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  emi: number,
  extraMonthly: number,
  processingFee: number,
  prepayMode: 'reduce-tenure' | 'reduce-emi',
  lumpSums: LumpSum[],
  floatRateYear: number,
  floatNewRate: number,
): AmortResult {
  const stdTotal = emi * tenureMonths + processingFee;
  const stdTotalInterest = stdTotal - principal - processingFee;

  // Parse lump sums
  const parsedLumps: { month: number; amount: number }[] = lumpSums
    .map((ls) => ({ month: parseInt(ls.afterMonth) || 0, amount: parseFloat(ls.amount) || 0 }))
    .filter((ls) => ls.amount > 0 && ls.month > 0);

  // Prepay amort (with all options)
  let prepayBalance = principal;
  let prepayMonths = 0;
  let prepayTotalInterest = 0;
  let currentEMI = emi;
  let remainingMonths = tenureMonths;
  let revisedEMI = emi;

  while (prepayBalance > 0.5 && prepayMonths < tenureMonths * 2) {
    prepayMonths++;

    // Apply float rate change
    const currentYearForFloat = Math.ceil(prepayMonths / 12);
    const activeRate =
      floatNewRate > 0 && floatRateYear > 0 && currentYearForFloat > floatRateYear
        ? floatNewRate
        : annualRate;
    const r = activeRate / 12 / 100;

    const interest = prepayBalance * r;
    let principalPart = currentEMI - interest;
    if (principalPart < 0) principalPart = 0;

    // Monthly extra prepayment
    let extra = Math.min(extraMonthly, Math.max(0, prepayBalance - principalPart));

    // One-time lump sum
    const lumpThisMonth = parsedLumps
      .filter((ls) => ls.month === prepayMonths)
      .reduce((sum, ls) => sum + ls.amount, 0);
    const lumpApplied = Math.min(lumpThisMonth, Math.max(0, prepayBalance - principalPart - extra));

    prepayBalance = Math.max(0, prepayBalance - principalPart - extra - lumpApplied);
    prepayTotalInterest += interest;

    // After applying lump + extra, adjust based on mode
    if ((extra > 0 || lumpApplied > 0) && prepayBalance > 0.5) {
      remainingMonths = tenureMonths - prepayMonths;
      if (remainingMonths > 0) {
        if (prepayMode === 'reduce-emi') {
          currentEMI = calcEMI(prepayBalance, activeRate, remainingMonths);
          revisedEMI = currentEMI;
        }
        // reduce-tenure: keep same EMI, tenure auto-shortens
      }
    }
  }

  // Regular amort for year table (no prepay, but with float rate)
  let balance = principal;
  let month = 0;
  const yearSummaries: YearSummary[] = [];

  for (let y = 1; balance > 0.5; y++) {
    const opening = balance;
    let yEmiPaid = 0;
    let yPrincipal = 0;
    let yInterest = 0;
    for (let m = 0; m < 12 && balance > 0.5; m++) {
      month++;
      const currentYearForFloat2 = Math.ceil(month / 12);
      const activeRate2 =
        floatNewRate > 0 && floatRateYear > 0 && currentYearForFloat2 > floatRateYear
          ? floatNewRate
          : annualRate;
      const r2 = activeRate2 / 12 / 100;
      const interest = balance * r2;
      const principalPart = Math.min(emi - interest, balance);
      balance = Math.max(0, balance - principalPart);
      yEmiPaid += emi;
      yPrincipal += principalPart;
      yInterest += interest;
    }
    yearSummaries.push({
      year: y,
      openingBalance: opening,
      emiPaid: yEmiPaid,
      principalPaid: yPrincipal,
      interestPaid: yInterest,
      balance,
    });
    if (month >= tenureMonths) break;
  }

  return {
    emi,
    totalPaid: stdTotal,
    totalInterest: stdTotalInterest,
    yearSummaries,
    prepayTenureMonths: prepayMonths,
    prepayInterestSaved: stdTotalInterest - prepayTotalInterest,
    revisedEMI,
  };
}

function calcTaxBenefit(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  emi: number,
): { annualPrincipal: number; annualInterest: number; annualTaxSaving: number } {
  const r = annualRate / 12 / 100;
  let balance = principal;
  let firstYearPrincipal = 0;
  let firstYearInterest = 0;
  for (let m = 0; m < 12 && m < tenureMonths; m++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    firstYearPrincipal += principalPart;
    firstYearInterest += interest;
  }
  const deductiblePrincipal = Math.min(firstYearPrincipal, 150000);
  const deductibleInterest = Math.min(firstYearInterest, 200000);
  const taxSaving = (deductiblePrincipal + deductibleInterest) * 0.30 * 1.04;
  return {
    annualPrincipal: firstYearPrincipal,
    annualInterest: firstYearInterest,
    annualTaxSaving: taxSaving,
  };
}

function calcOutstandingAfterN(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  emi: number,
  afterN: number,
): { outstanding: number; interestPaid: number; principalPaid: number } {
  const r = annualRate / 12 / 100;
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  for (let m = 0; m < afterN && balance > 0.5; m++) {
    const interest = balance * r;
    const principalPart = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    totalPrincipal += principalPart;
  }
  return { outstanding: balance, interestPaid: totalInterest, principalPaid: totalPrincipal };
}

const COMPARE_RATES = [8, 8.5, 9, 9.5, 10];

// ── Component ────────────────────────────────────────────────────────────────
export default function HomeLoanEMIPage() {
  // Property & loan
  const [propertyValue, setPropertyValue] = useState('5000000');
  const [downPaymentMode, setDownPaymentMode] = useState<'pct' | 'amt'>('pct');
  const [downPaymentPct, setDownPaymentPct] = useState('20');
  const [downPaymentAmt, setDownPaymentAmt] = useState('1000000');
  const [loanAmountOverride, setLoanAmountOverride] = useState('');
  const [interestRate, setInterestRate] = useState('8.75');
  const [tenureYears, setTenureYears] = useState(20);
  const [processingFeePct, setProcessingFeePct] = useState('0.5');

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prepayMonthly, setPrepayMonthly] = useState('0');
  const [prepayMode, setPrepayMode] = useState<'reduce-tenure' | 'reduce-emi'>('reduce-tenure');
  const [showTaxBenefit, setShowTaxBenefit] = useState(false);

  // Lump sum prepayments (up to 5)
  const [lumpSums, setLumpSums] = useState<LumpSum[]>([{ amount: '', afterMonth: '' }]);

  // Outstanding balance lookup
  const [outstandingN, setOutstandingN] = useState(12);

  // Floating rate
  const [floatRateYear, setFloatRateYear] = useState('');
  const [floatNewRate, setFloatNewRate] = useState('');

  // Table view
  const [yearPage, setYearPage] = useState(0);

  // ── Derived loan amount ──────────────────────────────────────────────────
  const derivedLoanAmount = useMemo(() => {
    const pv = parseFloat(propertyValue);
    if (isNaN(pv) || pv <= 0) return 0;
    if (loanAmountOverride !== '') {
      const ov = parseFloat(loanAmountOverride);
      return isNaN(ov) ? 0 : ov;
    }
    if (downPaymentMode === 'pct') {
      const dp = parseFloat(downPaymentPct);
      return isNaN(dp) ? pv : pv * (1 - dp / 100);
    } else {
      const dp = parseFloat(downPaymentAmt);
      return isNaN(dp) ? pv : Math.max(0, pv - dp);
    }
  }, [propertyValue, downPaymentMode, downPaymentPct, downPaymentAmt, loanAmountOverride]);

  // ── Main calculation ──────────────────────────────────────────────────────
  const result = useMemo(() => {
    const P = derivedLoanAmount;
    const r = parseFloat(interestRate);
    const n = tenureYears * 12;
    const feePct = parseFloat(processingFeePct);
    const extra = parseFloat(prepayMonthly) || 0;
    const pv = parseFloat(propertyValue);
    const fRateYear = parseFloat(floatRateYear) || 0;
    const fNewRate = parseFloat(floatNewRate) || 0;

    if (!P || !r || !n || isNaN(P) || isNaN(r) || P <= 0 || r <= 0) return null;

    const fee = isNaN(feePct) ? 0 : P * feePct / 100;
    const emi = calcEMI(P, r, n);
    const ltv = pv > 0 ? (P / pv) * 100 : 0;

    const amort = buildAmortization(P, r, n, emi, extra, fee, prepayMode, lumpSums, fRateYear, fNewRate);
    const tax = calcTaxBenefit(P, r, n, emi);

    const compareRates = COMPARE_RATES.map((rate) => ({
      rate,
      emi: calcEMI(P, rate, n),
      totalInterest: calcEMI(P, rate, n) * n - P,
    }));

    return { P, r, n, fee, emi, ltv, amort, tax, compareRates, extra };
  }, [
    derivedLoanAmount, interestRate, tenureYears, processingFeePct,
    prepayMonthly, prepayMode, propertyValue, lumpSums, floatRateYear, floatNewRate,
  ]);

  // Outstanding balance lookup
  const outstandingResult = useMemo(() => {
    if (!result) return null;
    return calcOutstandingAfterN(result.P, result.r, result.n, result.emi, outstandingN);
  }, [result, outstandingN]);

  const maxTenureMonths = tenureYears * 12;

  const totalPages = result ? Math.ceil(result.amort.yearSummaries.length / 5) : 0;
  const pageRows = result ? result.amort.yearSummaries.slice(yearPage * 5, yearPage * 5 + 5) : [];

  const hasPrepayEffect = result && (result.extra > 0 || lumpSums.some((ls) => parseFloat(ls.amount) > 0));

  // Lump sum helpers
  const addLumpSum = () => {
    if (lumpSums.length < 5) setLumpSums((prev) => [...prev, { amount: '', afterMonth: '' }]);
  };
  const removeLumpSum = (idx: number) => {
    setLumpSums((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateLumpSum = (idx: number, field: keyof LumpSum, value: string) => {
    setLumpSums((prev) => prev.map((ls, i) => i === idx ? { ...ls, [field]: value } : ls));
  };

  return (
    <ToolLayout
      title="Home Loan EMI Calculator India"
      description="Calculate EMI, amortization, LTV, Section 24b tax benefits, prepayment savings, outstanding balance lookup and floating rate scenarios for home loans in India."
      icon="🏠"
      relatedTools={[
        { name: 'SIP Calculator', href: '/tools/sip-calculator', icon: '📈' },
        { name: 'In-Hand Salary Calculator', href: '/tools/hand-salary-calculator', icon: '💼' },
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '🧾' },
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

        {/* ── Inputs ─────────────────────────────────────────────────────── */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-white">Property & Loan Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Home / Property Value (₹)</label>
              <input
                className="input"
                type="number"
                min="100000"
                step="100000"
                placeholder="5000000"
                value={propertyValue}
                onChange={(e) => { setPropertyValue(e.target.value); setLoanAmountOverride(''); }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Down Payment</label>
                <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
                  {(['pct', 'amt'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setDownPaymentMode(m); setLoanAmountOverride(''); }}
                      className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                        downPaymentMode === m ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {m === 'pct' ? '%' : '₹'}
                    </button>
                  ))}
                </div>
              </div>
              {downPaymentMode === 'pct' ? (
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="20"
                  value={downPaymentPct}
                  onChange={(e) => { setDownPaymentPct(e.target.value); setLoanAmountOverride(''); }}
                />
              ) : (
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="50000"
                  placeholder="1000000"
                  value={downPaymentAmt}
                  onChange={(e) => { setDownPaymentAmt(e.target.value); setLoanAmountOverride(''); }}
                />
              )}
            </div>

            <div>
              <label className="label">Loan Amount (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="50000"
                placeholder="Auto-calculated"
                value={loanAmountOverride !== '' ? loanAmountOverride : Math.round(derivedLoanAmount).toString()}
                onChange={(e) => setLoanAmountOverride(e.target.value)}
              />
              {loanAmountOverride === '' && (
                <p className="text-xs text-gray-600 mt-1">Auto: {fmtINR(derivedLoanAmount)}</p>
              )}
            </div>

            <div>
              <label className="label">Annual Interest Rate (%)</label>
              <input
                className="input"
                type="number"
                min="1"
                max="30"
                step="0.05"
                placeholder="8.75"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">SBI home loan rate: ~8.75%</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="label mb-0">Loan Tenure</label>
              <span className="text-sm text-violet-400 font-semibold">{tenureYears} years</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>5 yrs</span><span>30 yrs</span>
            </div>
          </div>

          <div className="sm:w-1/2">
            <label className="label">Processing Fee (%)</label>
            <input
              className="input"
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="0.5"
              value={processingFeePct}
              onChange={(e) => setProcessingFeePct(e.target.value)}
            />
          </div>

          {/* Advanced Options */}
          <div className="border border-gray-700 rounded-xl">
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex items-center justify-between w-full px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-gray-300">Advanced Options</span>
              <span className="text-gray-500">{showAdvanced ? '−' : '+'}</span>
            </button>
            {showAdvanced && (
              <div className="px-4 pb-4 space-y-5 border-t border-gray-700 pt-4">

                {/* Monthly Prepayment + Mode */}
                <div>
                  <p className="text-sm font-medium text-white mb-3">Monthly Prepayment</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Extra Monthly Amount (₹)</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={prepayMonthly}
                        onChange={(e) => setPrepayMonthly(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Prepayment Mode</label>
                      <div className="flex gap-1 bg-gray-800/60 rounded-xl p-1 w-fit mt-1">
                        {(['reduce-tenure', 'reduce-emi'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setPrepayMode(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              prepayMode === m
                                ? 'bg-violet-600 text-white shadow'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {m === 'reduce-tenure' ? 'Reduce Tenure' : 'Reduce EMI'}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {prepayMode === 'reduce-tenure'
                          ? 'Keep EMI same, finish loan earlier'
                          : 'Keep tenure, recalculate lower EMI'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lump Sum Prepayments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">One-Time Lump Sum Prepayments</p>
                    {lumpSums.length < 5 && (
                      <button
                        onClick={addLumpSum}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {lumpSums.map((ls, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="label text-xs">Amount (₹)</label>
                          <input
                            className="input text-sm"
                            type="number"
                            min="0"
                            step="10000"
                            placeholder="500000"
                            value={ls.amount}
                            onChange={(e) => updateLumpSum(idx, 'amount', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="label text-xs">After EMI #</label>
                          <input
                            className="input text-sm"
                            type="number"
                            min="1"
                            max="360"
                            placeholder="24"
                            value={ls.afterMonth}
                            onChange={(e) => updateLumpSum(idx, 'afterMonth', e.target.value)}
                          />
                        </div>
                        {lumpSums.length > 1 && (
                          <button
                            onClick={() => removeLumpSum(idx)}
                            className="text-red-400 hover:text-red-300 text-xs pb-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Rate Scenario */}
                <div>
                  <p className="text-sm font-medium text-white mb-3">Floating Rate Scenario</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Rate Changes After Year</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="30"
                        placeholder="5"
                        value={floatRateYear}
                        onChange={(e) => setFloatRateYear(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">New Interest Rate (%)</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="30"
                        step="0.05"
                        placeholder="9.5"
                        value={floatNewRate}
                        onChange={(e) => setFloatNewRate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tax benefit toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowTaxBenefit((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showTaxBenefit ? 'bg-violet-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        showTaxBenefit ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-300">Show Section 24b Tax Benefits (Old Regime)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {result ? (
          <>
            {/* Stat boxes */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card text-center py-5">
                <p className="text-2xl font-bold text-violet-400">{fmtINR(result.emi)}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Monthly EMI</p>
                {prepayMode === 'reduce-emi' && result.extra > 0 && result.amort.revisedEMI !== result.emi && (
                  <p className="text-xs text-emerald-400 mt-1">
                    Revised: {fmtINR(result.amort.revisedEMI)}
                  </p>
                )}
              </div>
              <div className="card text-center py-5">
                <p className="text-2xl font-bold text-amber-400">{fmtINR(result.amort.totalInterest)}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Total Interest</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-2xl font-bold text-emerald-400">{fmtINR(result.amort.totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Total Payment</p>
              </div>
            </div>

            {/* Prepayment Effect — show when any prepay set */}
            {hasPrepayEffect && (
              <div className="card bg-emerald-500/5 border-emerald-500/20">
                <h3 className="text-sm font-semibold text-white mb-3">Prepayment Analysis</h3>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Effective Tenure</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {Math.floor(result.amort.prepayTenureMonths / 12)} yrs{' '}
                      {result.amort.prepayTenureMonths % 12} mo
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {prepayMode === 'reduce-tenure' ? 'Months Saved' : 'EMI Reduction'}
                    </p>
                    <p className="text-xl font-bold text-emerald-400">
                      {prepayMode === 'reduce-tenure'
                        ? `${result.n - result.amort.prepayTenureMonths} months`
                        : result.amort.revisedEMI < result.emi
                        ? `${fmtINR(result.emi - result.amort.revisedEMI)}/mo`
                        : '—'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest Saved</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {fmtINR(Math.max(0, result.amort.prepayInterestSaved))}
                    </p>
                  </div>
                </div>
                {prepayMode === 'reduce-emi' && result.amort.revisedEMI !== result.emi && (
                  <div className="bg-gray-800/40 rounded-xl p-3 flex gap-6 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Original EMI</p>
                      <p className="font-semibold text-gray-300">{fmtINR(result.emi)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revised EMI (after prepay)</p>
                      <p className="font-semibold text-emerald-400">{fmtINR(result.amort.revisedEMI)}</p>
                    </div>
                  </div>
                )}
                {prepayMode === 'reduce-tenure' && (
                  <div className="bg-gray-800/40 rounded-xl p-3 flex gap-6 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Original Tenure</p>
                      <p className="font-semibold text-gray-300">{tenureYears} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Effective Tenure</p>
                      <p className="font-semibold text-emerald-400">
                        {Math.floor(result.amort.prepayTenureMonths / 12)} yrs{' '}
                        {result.amort.prepayTenureMonths % 12} mo
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Floating rate effect */}
            {parseFloat(floatRateYear) > 0 && parseFloat(floatNewRate) > 0 && (
              <div className="card bg-blue-500/5 border-blue-500/20">
                <h3 className="text-sm font-semibold text-white mb-2">Floating Rate Scenario</h3>
                <p className="text-xs text-gray-500">
                  Rate changes from {interestRate}% to {floatNewRate}% after Year {floatRateYear}.
                  The amortization table below reflects this change.
                </p>
                {parseFloat(floatNewRate) > parseFloat(interestRate) ? (
                  <p className="text-xs text-amber-400 mt-1">
                    Rate increased — expect higher effective interest cost.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-400 mt-1">
                    Rate decreased — you save on interest from Year {floatRateYear} onwards.
                  </p>
                )}
              </div>
            )}

            {/* LTV + breakdown */}
            <div className="card space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Loan-to-Value (LTV) Ratio</p>
                    <p className="text-xs text-gray-500 mt-0.5">RBI limit: 75–90% depending on loan amount</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${result.ltv > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {result.ltv.toFixed(1)}%
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        result.ltv > 80
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {result.ltv > 80 ? 'High LTV' : 'Good LTV'}
                    </span>
                  </div>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-gray-800">
                  <div
                    className={`h-full rounded-full transition-all ${result.ltv > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(result.ltv, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-4">Principal vs Interest Breakdown</p>
                <PieChart segments={[
                  { label: 'Principal (Loan Amount)', value: result.P, color: '#7c3aed' },
                  { label: 'Total Interest Cost', value: result.amort.totalInterest, color: '#f59e0b' },
                  ...(result.fee > 0 ? [{ label: 'Processing Fee', value: result.fee, color: '#6b7280' }] : []),
                ]} />
              </div>
            </div>

            {/* Outstanding Balance Lookup */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Outstanding Balance Lookup</h3>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label mb-0">After how many EMIs paid?</label>
                  <span className="text-sm text-violet-400 font-semibold">{outstandingN} EMIs</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={maxTenureMonths}
                  value={outstandingN}
                  onChange={(e) => setOutstandingN(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>1 EMI</span><span>{maxTenureMonths} EMIs ({tenureYears} yrs)</span>
                </div>
              </div>
              {outstandingResult && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Outstanding Principal</p>
                    <p className="text-lg font-bold text-amber-400">{fmtINR(outstandingResult.outstanding)}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Principal Paid</p>
                    <p className="text-lg font-bold text-violet-400">{fmtINR(outstandingResult.principalPaid)}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest Paid</p>
                    <p className="text-lg font-bold text-red-400">{fmtINR(outstandingResult.interestPaid)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Amortization chart — CSS stacked bars per year */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Amortization Chart (Year-wise)</h3>
              <div className="space-y-1.5 overflow-y-auto max-h-72">
                {result.amort.yearSummaries.map((row) => {
                  const total = row.principalPaid + row.interestPaid;
                  const pPct = total > 0 ? (row.principalPaid / total) * 100 : 0;
                  const maxTotal = Math.max(...result.amort.yearSummaries.map((r2) => r2.principalPaid + r2.interestPaid));
                  const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                  return (
                    <div key={row.year} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-10 shrink-0">Yr {row.year}</span>
                      <div className="flex-1 h-5 rounded overflow-hidden bg-gray-800/50">
                        <div
                          className="h-full rounded overflow-hidden flex"
                          style={{ width: `${barWidth}%` }}
                        >
                          <div className="bg-violet-600" style={{ width: `${pPct}%` }} />
                          <div className="bg-amber-500" style={{ width: `${100 - pPct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-24 text-right shrink-0">
                        {fmtINR(row.balance)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-violet-600 inline-block" />Principal
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />Interest
                </span>
                <span className="text-gray-600 ml-auto">Remaining balance →</span>
              </div>
            </div>

            {/* Year-wise summary table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Year-wise Amortization</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">Year</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Opening Bal</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">EMI Paid</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Principal</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Interest</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Closing Bal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => (
                      <tr key={row.year} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-2 px-3 text-gray-400">Year {row.year}</td>
                        <td className="py-2 px-3 text-right text-gray-500 text-xs">{fmtINR(row.openingBalance)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(row.emiPaid)}</td>
                        <td className="py-2 px-3 text-right text-violet-400">{fmtINR(row.principalPaid)}</td>
                        <td className="py-2 px-3 text-right text-amber-400">{fmtINR(row.interestPaid)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{fmtINR(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  <button
                    disabled={yearPage === 0}
                    onClick={() => setYearPage((p) => p - 1)}
                    className="text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-gray-500">
                    Years {yearPage * 5 + 1}–{Math.min(yearPage * 5 + 5, result.amort.yearSummaries.length)} of {result.amort.yearSummaries.length}
                  </span>
                  <button
                    disabled={yearPage >= totalPages - 1}
                    onClick={() => setYearPage((p) => p + 1)}
                    className="text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Tax benefit */}
            {showTaxBenefit && (
              <div className="card bg-blue-500/5 border-blue-500/20">
                <h3 className="text-sm font-semibold text-white mb-1">Section 24b Tax Benefits (Old Regime)</h3>
                <p className="text-xs text-gray-500 mb-4">Estimated for Year 1 at 30% tax slab + 4% cess</p>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Principal Repaid (Year 1)</p>
                    <p className="text-lg font-bold text-white">{fmtINR(result.tax.annualPrincipal)}</p>
                    <p className="text-xs text-gray-500 mt-1">80C deductible: {fmtINR(Math.min(result.tax.annualPrincipal, 150000))}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest Paid (Year 1)</p>
                    <p className="text-lg font-bold text-white">{fmtINR(result.tax.annualInterest)}</p>
                    <p className="text-xs text-gray-500 mt-1">Sec 24b deductible: {fmtINR(Math.min(result.tax.annualInterest, 200000))}</p>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Estimated Annual Tax Saving</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{fmtINR(result.tax.annualTaxSaving)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      (₹1.5L/yr under 80C + ₹2L/yr under Sec 24b) × 31.2%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  * Only applicable for self-occupied property under old tax regime. Consult a CA for exact figures.
                </p>
              </div>
            )}

            {/* Compare Rates */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Rate Comparison</h3>
              <p className="text-xs text-gray-500 mb-3">
                Monthly EMI for {fmtINR(result.P)} over {tenureYears} years at different rates
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">Rate</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Monthly EMI</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Total Interest</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">vs Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.compareRates.map((cr) => {
                      const diff = cr.emi - result.emi;
                      const isActive = Math.abs(cr.rate - result.r) < 0.01;
                      return (
                        <tr
                          key={cr.rate}
                          className={`border-b border-gray-800 ${isActive ? 'bg-violet-500/10' : 'hover:bg-gray-800/30'}`}
                        >
                          <td className="py-2 px-3 text-gray-300 font-medium">
                            {cr.rate}%
                            {isActive && <span className="ml-2 text-xs text-violet-400">(current)</span>}
                          </td>
                          <td className="py-2 px-3 text-right text-white">{fmtINR(cr.emi)}</td>
                          <td className="py-2 px-3 text-right text-gray-400">{fmtINR(cr.totalInterest)}</td>
                          <td className={`py-2 px-3 text-right text-xs font-medium ${
                            diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-gray-500'
                          }`}>
                            {isActive ? '—' : diff > 0 ? `+${fmtINR(diff)}/mo` : `${fmtINR(diff)}/mo`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-8 text-gray-500 text-sm">
            Enter valid loan details above to see results.
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
