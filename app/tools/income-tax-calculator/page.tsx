'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtPct = (n: number) => n.toFixed(2) + '%';

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

type AgeGroup = 'below60' | '60to80' | 'above80';

interface SlabRow {
  from: number;
  to: number;
  rate: number;
  taxOnSlab: number;
}

// ── Slab calculators ──────────────────────────────────────────────────────────

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
    if (slice > 0) slabRows.push({ from: s.from, to: s.to, rate: s.rate, taxOnSlab });
  }

  // Section 87A: full rebate if taxable ≤ ₹12L (Budget 2025)
  if (taxableIncome <= 1200000) return { slabRows, baseTax: 0 };

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

  // Section 87A: rebate if taxable ≤ ₹5L (only below 60)
  if (age === 'below60' && taxableIncome <= 500000) return { slabRows, baseTax: 0 };

  return { slabRows, baseTax };
}

function calcSurcharge(baseTax: number, taxableIncome: number, regime: 'new' | 'old'): number {
  if (taxableIncome <= 5000000) return 0;
  if (taxableIncome <= 10000000) return baseTax * 0.10;
  if (taxableIncome <= 20000000) return baseTax * 0.15;
  if (taxableIncome <= 50000000) return baseTax * 0.25;
  return baseTax * (regime === 'new' ? 0.25 : 0.37);
}

function capDeduction(value: string, max: number): number {
  const n = parseFloat(value) || 0;
  return Math.min(Math.max(0, n), max);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IncomeTaxCalculatorPage() {
  // ── Basic inputs
  const [grossSalary, setGrossSalary] = useState('1200000');
  const [age, setAge] = useState<AgeGroup>('below60');
  const [regime, setRegime] = useState<'new' | 'old'>('new');

  // ── Extra income sources
  const [rentalIncome, setRentalIncome] = useState('0');
  const [fdInterest, setFdInterest] = useState('0');
  const [stcg, setStcg] = useState('0');       // Short-term capital gains (equity/MF) — 20% flat
  const [ltcg, setLtcg] = useState('0');       // Long-term capital gains on equity — 12.5% above ₹1.25L

  // ── TDS already deducted
  const [tdsDeducted, setTdsDeducted] = useState('0');

  // ── Old regime deductions
  const [ded80C, setDed80C] = useState('150000');
  const [ded80DSelf, setDed80DSelf] = useState('25000');
  const [ded80DParents, setDed80DParents] = useState('0');
  const [hraExemption, setHraExemption] = useState('0');
  const [homeLoanInt, setHomeLoanInt] = useState('0');
  const [ded80CCD, setDed80CCD] = useState('50000');
  const [ded80TTA, setDed80TTA] = useState('0');   // 80TTA / 80TTB — auto-capped by age
  const [otherDed, setOtherDed] = useState('0');

  // ── Parents age (for 80D parents limit)
  const [parentsAge, setParentsAge] = useState<'below60' | 'senior'>('below60');

  // ── All calculations
  const result = useMemo(() => {
    const gross = parseFloat(grossSalary) || 0;
    if (gross <= 0) return null;

    const rental = Math.max(0, parseFloat(rentalIncome) || 0);
    const fdInt  = Math.max(0, parseFloat(fdInterest) || 0);
    const stcgAmt = Math.max(0, parseFloat(stcg) || 0);
    const ltcgAmt = Math.max(0, parseFloat(ltcg) || 0);
    const tds    = Math.max(0, parseFloat(tdsDeducted) || 0);

    // LTCG on equity: first ₹1,25,000 exempt, rest @12.5%
    const ltcgExemption = 125000;
    const ltcgTaxable   = Math.max(0, ltcgAmt - ltcgExemption);
    const ltcgTax       = ltcgTaxable * 0.125;   // No surcharge on LTCG from equity

    // STCG on equity/MF: flat 20% (from 23 July 2024 Budget)
    const stcgTax = stcgAmt * 0.20;

    // Regular income (salary + rental + FD interest — capital gains are separate)
    const regularIncome = gross + rental + fdInt;

    // Total "gross" for display
    const totalIncomeDisplay = regularIncome + stcgAmt + ltcgAmt;

    // ── 80TTA / 80TTB cap
    // 80TTB for seniors (60+): max ₹50K covers FD + savings interest
    // 80TTA for below-60: max ₹10K only savings bank interest
    const ttaMax = age === 'below60' ? 10000 : 50000;  // 60to80 & above80 get 80TTB (₹50K)
    const c80TTA = capDeduction(ded80TTA, ttaMax);

    // ── NEW REGIME ────────────────────────────────────────────────
    const stdDedNew = 75000;
    // Capital gains are taxed separately; regular income minus std ded goes through normal slabs
    const taxableNew = Math.max(0, regularIncome - stdDedNew);
    const { slabRows: slabsNew, baseTax: baseTaxNew } = calcNewRegimeDetails(taxableNew);
    const surchargeNew = calcSurcharge(baseTaxNew, taxableNew, 'new');
    const cessNew = (baseTaxNew + surchargeNew) * 0.04;
    const regularTaxNew = baseTaxNew + surchargeNew + cessNew;
    // Capital gains tax (same rates in both regimes)
    const capitalGainsTaxNew = (stcgTax + ltcgTax) * 1.04;  // +4% cess on CG tax too
    const totalTaxNew = regularTaxNew + capitalGainsTaxNew;
    const effRateNew  = totalIncomeDisplay > 0 ? (totalTaxNew / totalIncomeDisplay) * 100 : 0;
    const netTaxNew   = Math.max(0, totalTaxNew - tds);

    // ── OLD REGIME ────────────────────────────────────────────────
    const stdDedOld = 50000;
    const c80C      = capDeduction(ded80C, 150000);
    const c80DSelf  = capDeduction(ded80DSelf, age === '60to80' || age === 'above80' ? 50000 : 25000);
    const c80DParMax = parentsAge === 'senior' ? 50000 : 25000;
    const c80DPar   = capDeduction(ded80DParents, c80DParMax);
    const cHRA      = Math.max(0, parseFloat(hraExemption) || 0);
    const cHomeLoan = capDeduction(homeLoanInt, 200000);
    const c80CCDVal = capDeduction(ded80CCD, 50000);
    const cOther    = Math.max(0, parseFloat(otherDed) || 0);

    const totalDedOld = stdDedOld + c80C + c80DSelf + c80DPar + cHRA + cHomeLoan + c80CCDVal + c80TTA + cOther;

    // Old regime: STCG is taxed at 30% slab rate (not flat 20%)
    // LTCG rules apply same for both regimes (12.5% above 1.25L)
    // So for old regime, regular taxable income includes STCG at normal slab
    const taxableOldRegular = Math.max(0, regularIncome - totalDedOld);
    // STCG in old regime: add to slab income — but slab rate is 30% if in top bracket
    // Simplification: compute slab tax on (taxableOldRegular + stcgAmt) and subtract slab tax without STCG
    const { slabRows: slabsOldWithSTCG, baseTax: baseTaxOldWithSTCG } = calcOldRegimeDetails(taxableOldRegular + stcgAmt, age);
    const { slabRows: slabsOld, baseTax: baseTaxOldNoSTCG } = calcOldRegimeDetails(taxableOldRegular, age);
    const stcgTaxOld = baseTaxOldWithSTCG - baseTaxOldNoSTCG; // incremental tax on STCG under old regime

    const surchargeOld  = calcSurcharge(baseTaxOldNoSTCG, taxableOldRegular, 'old');
    const cessOld       = (baseTaxOldNoSTCG + surchargeOld) * 0.04;
    const regularTaxOld = baseTaxOldNoSTCG + surchargeOld + cessOld;
    // STCG old regime cess
    const stcgCessOld   = stcgTaxOld * 0.04;
    const capitalGainsTaxOld = (stcgTaxOld + stcgCessOld) + (ltcgTax * 1.04);
    const totalTaxOld   = regularTaxOld + capitalGainsTaxOld;
    const effRateOld    = totalIncomeDisplay > 0 ? (totalTaxOld / totalIncomeDisplay) * 100 : 0;
    const netTaxOld     = Math.max(0, totalTaxOld - tds);

    // ── Comparison
    const savings       = totalTaxOld - totalTaxNew;
    const betterRegime  = savings >= 0 ? 'new' : 'old';
    const savingsAbs    = Math.abs(savings);

    // ── Advance tax schedule (if tax payable > ₹10,000)
    const selectedTax = regime === 'new' ? netTaxNew : netTaxOld;
    const advanceTax = selectedTax > 10000 ? {
      jun15:  selectedTax * 0.15,
      sep15:  selectedTax * 0.45,
      dec15:  selectedTax * 0.75,
      mar15:  selectedTax * 1.00,
    } : null;

    // ── Income breakup (for bar chart)
    const salaryPct  = totalIncomeDisplay > 0 ? (gross / totalIncomeDisplay) * 100 : 0;
    const otherPct   = totalIncomeDisplay > 0 ? ((rental + fdInt) / totalIncomeDisplay) * 100 : 0;
    const capGainPct = totalIncomeDisplay > 0 ? ((stcgAmt + ltcgAmt) / totalIncomeDisplay) * 100 : 0;

    return {
      // Income
      gross,
      rental, fdInt, stcgAmt, ltcgAmt,
      regularIncome, totalIncomeDisplay,
      ltcgTaxable, ltcgTax, stcgTax,
      stcgTaxOld,
      // New regime
      stdDedNew, taxableNew,
      baseTaxNew, surchargeNew, cessNew,
      regularTaxNew, capitalGainsTaxNew,
      totalTaxNew, effRateNew, netTaxNew,
      monthlyTDSNew: totalTaxNew / 12,
      slabsNew,
      // Old regime
      stdDedOld, totalDedOld,
      c80C, c80DSelf, c80DPar, cHRA, cHomeLoan, c80CCDVal, c80TTA, cOther,
      taxableOldRegular,
      slabsOld, slabsOldWithSTCG,
      baseTaxOldNoSTCG, surchargeOld, cessOld,
      regularTaxOld, capitalGainsTaxOld,
      totalTaxOld, effRateOld, netTaxOld,
      monthlyTDSOld: totalTaxOld / 12,
      // TDS
      tds,
      // Comparison
      betterRegime, savings: savingsAbs, rawSavings: savings,
      // Advance tax
      advanceTax, selectedTax,
      // Chart
      salaryPct, otherPct, capGainPct,
      // Flags
      isNew87A: taxableNew <= 1200000 && taxableNew > 0,
      isOld87A: taxableOldRegular <= 500000 && taxableOldRegular > 0 && age === 'below60',
      // 80TTA label
      ttaLabel: age === 'below60' ? '80TTA – Savings Bank Interest' : '80TTB – FD + Savings Interest',
      ttaMax,
    };
  }, [
    grossSalary, age, regime,
    rentalIncome, fdInterest, stcg, ltcg, tdsDeducted,
    ded80C, ded80DSelf, ded80DParents, hraExemption, homeLoanInt,
    ded80CCD, ded80TTA, otherDed, parentsAge,
  ]);

  const oldRegimeDisabled = regime === 'new';

  return (
    <ToolLayout
        toolSlug="income-tax-calculator"
      title="Income Tax Calculator India FY 2025-26"
      description="Calculate income tax for FY 2025-26 (AY 2026-27). Compare new vs old tax regime. Includes capital gains, rental income, 87A rebate, surcharge, cess, advance tax schedule. Budget 2024 & 2025 rates."
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
              : 'Old Regime: Standard deduction ₹50,000 • HRA + 80C (₹1.5L) + 80D + NPS + other deductions applicable'}
          </p>
        </div>

        {/* Age Group */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-white">Age Group</h2>
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
            <p className="text-xs text-gray-500">
              {age === '60to80'
                ? 'Senior citizen: basic exemption ₹3,00,000 (old regime) • 80TTB ₹50K instead of 80TTA'
                : 'Super senior: basic exemption ₹5,00,000 (old regime) • 80TTB ₹50K instead of 80TTA'}
            </p>
          )}
        </div>

        {/* Income Details */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Income Details</h2>

          {/* Salary */}
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
            <p className="text-xs text-gray-500 mt-1">CTC / gross before deductions. Standard deduction applied automatically.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Rental Income */}
            <div>
              <label className="label">Rental Income (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={rentalIncome}
                onChange={e => setRentalIncome(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Added to total income and taxed at slab rates</p>
            </div>

            {/* FD / Savings Bank Interest */}
            <div>
              <label className="label">FD / Savings Bank Interest (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={fdInterest}
                onChange={e => setFdInterest(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Taxed at slab rates. Use 80TTA/80TTB deduction (old regime) to offset.</p>
            </div>

            {/* STCG */}
            <div>
              <label className="label flex items-center gap-1.5">
                Short-Term Capital Gains — STCG (₹)
                <span className="text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">20% flat</span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={stcg}
                onChange={e => setStcg(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Equity / MF held &lt; 1 yr. Taxed @ 20% (Budget 2024, effective 23 Jul 2024). Old regime: taxed at 30% slab.</p>
            </div>

            {/* LTCG */}
            <div>
              <label className="label flex items-center gap-1.5">
                Long-Term Capital Gains — LTCG on Equity (₹)
                <span className="text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">12.5% above ₹1.25L</span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={ltcg}
                onChange={e => setLtcg(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Equity / equity MF held &gt; 1 yr. First ₹1,25,000 exempt. Balance @ 12.5% (Budget 2024).</p>
            </div>
          </div>

          {/* TDS */}
          <div>
            <label className="label flex items-center gap-1.5">
              TDS Already Deducted (₹)
              <span className="text-xs text-gray-500">by employer / bank</span>
            </label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="0"
              value={tdsDeducted}
              onChange={e => setTdsDeducted(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Deducted at source. Shows "Tax Still Payable" in results.</p>
          </div>
        </div>

        {/* Deductions — Old Regime Only */}
        <div className={`card space-y-4 transition-opacity duration-200 ${oldRegimeDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Deductions (Old Regime)</h2>
            {oldRegimeDisabled && (
              <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                Old Regime only
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* 80C */}
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

            {/* 80D Self & Family */}
            <div>
              <label className="label flex items-center gap-1.5">
                Section 80D — Self &amp; Family (₹)
                <span className="text-xs text-gray-500">
                  max {age === '60to80' || age === 'above80' ? '₹50,000' : '₹25,000'}
                </span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="25,000"
                value={ded80DSelf}
                onChange={e => setDed80DSelf(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Health insurance premium for self, spouse, children</p>
            </div>

            {/* 80D Parents */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label flex items-center gap-1.5">
                  Section 80D — Parents (₹)
                  <span className="text-xs text-gray-500">
                    max {parentsAge === 'senior' ? '₹50,000' : '₹25,000'}
                  </span>
                </label>
              </div>
              <input
                className="input mb-2"
                type="number"
                min="0"
                placeholder="0"
                value={ded80DParents}
                onChange={e => setDed80DParents(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setParentsAge('below60')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${parentsAge === 'below60' ? 'bg-violet-600/20 border-violet-500/40 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-300'}`}
                >
                  Parents Below 60
                </button>
                <button
                  onClick={() => setParentsAge('senior')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${parentsAge === 'senior' ? 'bg-violet-600/20 border-violet-500/40 text-violet-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-300'}`}
                >
                  Parents Senior (60+)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total 80D (self + parents) can be up to ₹1,00,000</p>
            </div>

            {/* HRA */}
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

            {/* Home Loan 24b */}
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

            {/* 80CCD NPS */}
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

            {/* 80TTA / 80TTB */}
            <div>
              <label className="label flex items-center gap-1.5">
                {result?.ttaLabel ?? (age === 'below60' ? '80TTA – Savings Bank Interest' : '80TTB – FD + Savings Interest')} (₹)
                <span className="text-xs text-gray-500">
                  max {age === 'below60' ? '₹10,000' : '₹50,000'}
                </span>
              </label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={ded80TTA}
                onChange={e => setDed80TTA(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {age === 'below60'
                  ? '80TTA: deduction on savings account interest only (max ₹10K)'
                  : '80TTB: deduction for seniors on FD + savings bank interest (max ₹50K)'}
              </p>
            </div>

            {/* Other Deductions */}
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

        {/* ── RESULTS ──────────────────────────────────────────────── */}
        {result && (
          <>
            {/* Income Breakup Bar */}
            {(result.rental > 0 || result.fdInt > 0 || result.stcgAmt > 0 || result.ltcgAmt > 0) && (
              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-white">Income Composition</h3>
                <div className="flex rounded-full overflow-hidden h-4 bg-gray-800">
                  {result.salaryPct > 0 && (
                    <div
                      className="bg-violet-500 h-full transition-all duration-500"
                      style={{ width: `${result.salaryPct}%` }}
                    />
                  )}
                  {result.otherPct > 0 && (
                    <div
                      className="bg-sky-500 h-full transition-all duration-500"
                      style={{ width: `${result.otherPct}%` }}
                    />
                  )}
                  {result.capGainPct > 0 && (
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${result.capGainPct}%` }}
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                    Salary {fmtINR(result.gross)} ({result.salaryPct.toFixed(0)}%)
                  </span>
                  {(result.rental > 0 || result.fdInt > 0) && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                      Other Income {fmtINR(result.rental + result.fdInt)} ({result.otherPct.toFixed(0)}%)
                    </span>
                  )}
                  {(result.stcgAmt > 0 || result.ltcgAmt > 0) && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Capital Gains {fmtINR(result.stcgAmt + result.ltcgAmt)} ({result.capGainPct.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Better Regime Banner */}
            <div className={`card border ${result.betterRegime === 'new' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-base font-semibold text-white">
                    {result.betterRegime === 'new' ? '✓ New Regime is better for you' : '✓ Old Regime is better for you'}
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
              {/* New Regime Card */}
              <div className={`card space-y-3 ${regime === 'new' ? 'border-violet-500/30 bg-violet-500/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">New Regime</h3>
                  {result.betterRegime === 'new' && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Better</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Income</span>
                    <span className="text-gray-200">{fmtINR(result.totalIncomeDisplay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Standard Deduction</span>
                    <span className="text-gray-200">−{fmtINR(result.stdDedNew)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Taxable (Regular)</span>
                    <span className="text-white">{fmtINR(result.taxableNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Tax (slabs)</span>
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
                  {result.stcgAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">STCG Tax (20%)</span>
                      <span className="text-orange-400">{fmtINR(result.stcgTax * 1.04)}</span>
                    </div>
                  )}
                  {result.ltcgAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">LTCG Tax (12.5%)</span>
                      <span className="text-orange-400">{fmtINR(result.ltcgTax * 1.04)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                    <span className="text-white">Total Tax Payable</span>
                    <span className="text-amber-400 text-base">{fmtINR(result.totalTaxNew)}</span>
                  </div>
                  {result.tds > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TDS Deducted</span>
                        <span className="text-emerald-400">−{fmtINR(result.tds)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-200">Tax Still Payable</span>
                        <span className={result.netTaxNew <= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {result.netTaxNew <= 0 ? 'Refund: ' + fmtINR(-result.netTaxNew) : fmtINR(result.netTaxNew)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly TDS</span>
                    <span className="text-gray-200">{fmtINR(result.monthlyTDSNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Effective Rate</span>
                    <span className="text-gray-200">{fmtPct(result.effRateNew)}</span>
                  </div>
                  {result.isNew87A && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-2 py-1.5">
                      87A rebate: zero slab tax (income ≤ ₹12L)
                    </p>
                  )}
                </div>
              </div>

              {/* Old Regime Card */}
              <div className={`card space-y-3 ${regime === 'old' ? 'border-violet-500/30 bg-violet-500/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Old Regime</h3>
                  {result.betterRegime === 'old' && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Better</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Income</span>
                    <span className="text-gray-200">{fmtINR(result.totalIncomeDisplay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Deductions</span>
                    <span className="text-gray-200">−{fmtINR(result.totalDedOld)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Taxable (Regular)</span>
                    <span className="text-white">{fmtINR(result.taxableOldRegular)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Tax (slabs)</span>
                    <span className="text-amber-400">{fmtINR(result.baseTaxOldNoSTCG)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Surcharge</span>
                    <span className="text-gray-300">{fmtINR(result.surchargeOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cess (4%)</span>
                    <span className="text-gray-300">{fmtINR(result.cessOld)}</span>
                  </div>
                  {result.stcgAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">STCG Tax (30% slab)</span>
                      <span className="text-orange-400">{fmtINR(result.stcgTaxOld * 1.04)}</span>
                    </div>
                  )}
                  {result.ltcgAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">LTCG Tax (12.5%)</span>
                      <span className="text-orange-400">{fmtINR(result.ltcgTax * 1.04)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                    <span className="text-white">Total Tax Payable</span>
                    <span className="text-amber-400 text-base">{fmtINR(result.totalTaxOld)}</span>
                  </div>
                  {result.tds > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TDS Deducted</span>
                        <span className="text-emerald-400">−{fmtINR(result.tds)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-200">Tax Still Payable</span>
                        <span className={result.netTaxOld <= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {result.netTaxOld <= 0 ? 'Refund: ' + fmtINR(-result.netTaxOld) : fmtINR(result.netTaxOld)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly TDS</span>
                    <span className="text-gray-200">{fmtINR(result.monthlyTDSOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Effective Rate</span>
                    <span className="text-gray-200">{fmtPct(result.effRateOld)}</span>
                  </div>
                  {result.isOld87A && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-2 py-1.5">
                      87A rebate: zero slab tax (income ≤ ₹5L)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Income vs Tax breakdown donut */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">
                Income Breakdown — {regime === 'new' ? 'New' : 'Old'} Regime
              </h3>
              <PieChart segments={[
                { label: 'Take-Home (Net Income)', value: result.totalIncomeDisplay - (regime === 'new' ? result.totalTaxNew : result.totalTaxOld), color: '#10b981' },
                { label: 'Income Tax (Base Slab)', value: regime === 'new' ? result.baseTaxNew : result.baseTaxOldNoSTCG, color: '#f59e0b' },
                { label: 'Surcharge', value: regime === 'new' ? result.surchargeNew : result.surchargeOld, color: '#ef4444' },
                { label: 'Health & Education Cess (4%)', value: regime === 'new' ? result.cessNew : result.cessOld, color: '#f97316' },
                ...(result.stcgAmt > 0 ? [{ label: 'STCG Tax', value: result.stcgTax * 1.04, color: '#a78bfa' }] : []),
                ...(result.ltcgAmt > 0 ? [{ label: 'LTCG Tax', value: result.ltcgTax * 1.04, color: '#818cf8' }] : []),
              ]} />
            </div>

            {/* Capital Gains Detail */}
            {(result.stcgAmt > 0 || result.ltcgAmt > 0) && (
              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-white">Capital Gains Tax Detail</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-400 font-medium">Type</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-medium">Gains</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-medium">Taxable</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-medium">Rate</th>
                        <th className="text-right py-2 px-3 text-gray-400 font-medium">Tax (incl. cess)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.stcgAmt > 0 && (
                        <tr className="border-b border-gray-800">
                          <td className="py-2 px-3 text-gray-300">STCG (equity/MF)</td>
                          <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.stcgAmt)}</td>
                          <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.stcgAmt)}</td>
                          <td className="py-2 px-3 text-right text-gray-400">20%*</td>
                          <td className="py-2 px-3 text-right text-orange-400">{fmtINR(result.stcgTax * 1.04)}</td>
                        </tr>
                      )}
                      {result.ltcgAmt > 0 && (
                        <tr className="border-b border-gray-800">
                          <td className="py-2 px-3 text-gray-300">LTCG (equity/MF)</td>
                          <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.ltcgAmt)}</td>
                          <td className="py-2 px-3 text-right text-gray-300">{fmtINR(result.ltcgTaxable)}</td>
                          <td className="py-2 px-3 text-right text-gray-400">12.5%</td>
                          <td className="py-2 px-3 text-right text-orange-400">{fmtINR(result.ltcgTax * 1.04)}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-800/30">
                        <td colSpan={4} className="py-2 px-3 text-gray-400">Total Capital Gains Tax</td>
                        <td className="py-2 px-3 text-right text-orange-400 font-semibold">
                          {fmtINR((result.stcgTax + result.ltcgTax) * 1.04)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    * STCG rate shown for new regime. Under old regime, STCG is taxed at 30% slab rate. LTCG: first ₹1,25,000 is exempt (shown in Taxable column). No surcharge on LTCG from listed equity.
                  </p>
                </div>
              </div>
            )}

            {/* Old Regime Deductions Breakdown */}
            {regime === 'old' && (
              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-white">Deductions Breakdown (Old Regime)</h3>
                <div className="space-y-1.5 text-sm">
                  {[
                    ['Standard Deduction', result.stdDedOld],
                    ['80C', result.c80C],
                    ['80D – Self & Family', result.c80DSelf],
                    ['80D – Parents', result.c80DPar],
                    ['HRA Exemption', result.cHRA],
                    ['Home Loan Interest (24b)', result.cHomeLoan],
                    ['NPS 80CCD(1B)', result.c80CCDVal],
                    [result.ttaLabel, result.c80TTA],
                    ['Other Deductions', result.cOther],
                  ].filter(([, v]) => (v as number) > 0).map(([label, val]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-gray-400">{label as string}</span>
                      <span className="text-emerald-400">−{fmtINR(val as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Total Deductions</span>
                    <span className="text-emerald-400">−{fmtINR(result.totalDedOld)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slab-wise Tax Breakdown */}
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
                          No slab tax — income below exemption or 87A rebate applied
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800/30">
                      <td className="py-2.5 px-3 text-gray-300 font-medium">Base Tax Subtotal</td>
                      <td />
                      <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                        {fmtINR(regime === 'new' ? result.baseTaxNew : result.baseTaxOldNoSTCG)}
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
                    {(result.stcgAmt > 0 || result.ltcgAmt > 0) && (
                      <tr className="bg-gray-800/30">
                        <td className="py-2 px-3 text-gray-400">+ Capital Gains Tax (incl. cess)</td>
                        <td />
                        <td className="py-2 px-3 text-right text-orange-400">
                          {fmtINR(regime === 'new' ? result.capitalGainsTaxNew : result.capitalGainsTaxOld)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-violet-600/10">
                      <td className="py-3 px-3 text-violet-300 font-bold">Total Tax Payable</td>
                      <td />
                      <td className="py-3 px-3 text-right text-violet-300 font-bold text-base">
                        {fmtINR(regime === 'new' ? result.totalTaxNew : result.totalTaxOld)}
                      </td>
                    </tr>
                    {result.tds > 0 && (
                      <tr className="bg-emerald-900/10">
                        <td className="py-2 px-3 text-emerald-400 font-medium">Tax Still Payable (after TDS)</td>
                        <td />
                        <td className="py-2 px-3 text-right font-semibold">
                          <span className={(regime === 'new' ? result.netTaxNew : result.netTaxOld) <= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {(() => {
                              const net = regime === 'new' ? result.netTaxNew : result.netTaxOld;
                              return net <= 0 ? 'Refund: ' + fmtINR(-net) : fmtINR(net);
                            })()}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Advance Tax Schedule */}
            {result.advanceTax && (
              <div className="card space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Advance Tax Schedule</h3>
                  <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                    Tax &gt; ₹10,000
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Advance tax is required if total tax liability exceeds ₹10,000. Amounts below are cumulative instalments based on {fmtINR(result.selectedTax)} payable.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { date: 'By 15 Jun', pct: '15%', amt: result.advanceTax.jun15, color: 'violet' },
                    { date: 'By 15 Sep', pct: '45%', amt: result.advanceTax.sep15, color: 'sky' },
                    { date: 'By 15 Dec', pct: '75%', amt: result.advanceTax.dec15, color: 'amber' },
                    { date: 'By 15 Mar', pct: '100%', amt: result.advanceTax.mar15, color: 'emerald' },
                  ].map(({ date, pct, amt, color }) => (
                    <div key={date} className={`rounded-xl p-3 bg-${color}-500/5 border border-${color}-500/20 text-center`}>
                      <p className="text-xs text-gray-500 mb-0.5">{date}</p>
                      <p className={`text-base font-bold text-${color}-400`}>{fmtINR(amt)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">({pct} cumulative)</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Each instalment is cumulative (not incremental). E.g., by Sep 15 you should have paid 45% of total tax in all.
                </p>
              </div>
            )}

            {/* Tax Slabs Reference */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">FY 2025-26 Tax Slabs Reference</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">New Regime (Budget 2025)</p>
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
                  <p className="text-xs text-gray-500 mt-2">87A rebate: zero tax if taxable income ≤ ₹12L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Old Regime</p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-gray-800">
                      {[
                        ['₹0 – ₹2,50,000 (₹3L/₹5L for seniors)', '0%'],
                        ['Up to ₹5,00,000', '5%'],
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
                    87A rebate: zero tax if taxable income ≤ ₹5L (below 60 only)
                  </p>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Capital Gains (all regimes)</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">STCG equity/MF (held &lt; 1yr)</span>
                      <span className="text-orange-400 font-medium">20%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">LTCG equity/MF (held &gt; 1yr)</span>
                      <span className="text-orange-400 font-medium">12.5% (above ₹1.25L)</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Budget 2024 rates effective 23 Jul 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
