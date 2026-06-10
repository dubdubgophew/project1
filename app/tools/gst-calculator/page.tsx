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

const PRESET_RATES = [0, 5, 12, 18, 28];

interface LineItem {
  id: number;
  description: string;
  amount: string;
  rate: number;
}

const GST_RATES_REF = [
  { item: 'Milk, fresh vegetables, eggs', rate: '0%', note: 'Exempt' },
  { item: 'Sugar, tea, coffee (unprocessed)', rate: '5%', note: '' },
  { item: 'Mobile phones', rate: '12%', note: '' },
  { item: 'Butter, cheese, ghee', rate: '12%', note: '' },
  { item: 'Restaurant food (non-AC)', rate: '5%', note: 'No ITC' },
  { item: 'Restaurant food (AC)', rate: '18%', note: '' },
  { item: 'Health insurance premium', rate: '18%', note: '' },
  { item: 'AC, refrigerator, washing machine', rate: '18%', note: '' },
  { item: 'Education services', rate: '0%', note: 'Exempt' },
  { item: 'Cars (small petrol <1200cc)', rate: '28%', note: '+ cess ~1%' },
  { item: 'Cars (SUV/luxury)', rate: '28%', note: '+ cess up to 22%' },
  { item: 'Tobacco, cigarettes', rate: '28%', note: '+ cess' },
  { item: 'Aerated drinks', rate: '28%', note: '+ cess 12%' },
];

const COMPOSITION_TYPES = [
  { label: 'Manufacturer / Trader', rate: 1, cgst: 0.5, sgst: 0.5, note: '1% (0.5% CGST + 0.5% SGST)' },
  { label: 'Restaurant (no alcohol)', rate: 5, cgst: 2.5, sgst: 2.5, note: '5% (2.5% CGST + 2.5% SGST)' },
  { label: 'Other Service Provider', rate: 6, cgst: 3, sgst: 3, note: '6% (3% CGST + 3% SGST)' },
];

let nextId = 2;

export default function GSTCalculatorPage() {
  // Single-item mode
  const [amount, setAmount] = useState('10000');
  const [gstRate, setGstRate] = useState(18);
  const [customRate, setCustomRate] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [txnType, setTxnType] = useState<'intra' | 'inter'>('intra');

  // Scheme toggle
  const [scheme, setScheme] = useState<'regular' | 'composition'>('regular');
  const [compositionTypeIdx, setCompositionTypeIdx] = useState(0);

  // Multi-item mode
  const [multiMode, setMultiMode] = useState(false);
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: 'Item 1', amount: '10000', rate: 18 },
  ]);

  // GST rate finder
  const [rateFinderOpen, setRateFinderOpen] = useState(false);

  const effectiveRate = isCustom ? (parseFloat(customRate) || 0) : gstRate;

  const addItem = () => {
    if (items.length >= 10) return;
    setItems(prev => [...prev, { id: nextId++, description: '', amount: '', rate: 18 }]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  // Single-item result
  const singleResult = useMemo(() => {
    if (multiMode) return null;
    const base = parseFloat(amount);
    if (!base || isNaN(base) || base <= 0 || effectiveRate < 0) return null;

    let originalAmount: number, gstAmount: number, totalAmount: number;
    if (mode === 'add') {
      originalAmount = base;
      gstAmount = base * effectiveRate / 100;
      totalAmount = base + gstAmount;
    } else {
      totalAmount = base;
      originalAmount = base * 100 / (100 + effectiveRate);
      gstAmount = base - originalAmount;
    }

    const halfRate = effectiveRate / 2;
    const cgst = txnType === 'intra' ? gstAmount / 2 : 0;
    const sgst = txnType === 'intra' ? gstAmount / 2 : 0;
    const igst = txnType === 'inter' ? gstAmount : 0;

    const comparison = PRESET_RATES.map(rate => {
      let cmpGST: number, cmpTotal: number, cmpBase: number;
      if (mode === 'add') {
        cmpBase = base; cmpGST = base * rate / 100; cmpTotal = base + cmpGST;
      } else {
        cmpTotal = base; cmpBase = base * 100 / (100 + rate); cmpGST = base - cmpBase;
      }
      return { rate, gst: cmpGST, total: cmpTotal, base: cmpBase };
    });

    return { originalAmount, gstAmount, totalAmount, cgst, sgst, igst, halfRate, comparison };
  }, [amount, effectiveRate, mode, txnType, multiMode]);

  // Multi-item result
  const multiResult = useMemo(() => {
    if (!multiMode) return null;
    const rows = items.map(it => {
      const amt = parseFloat(it.amount);
      if (!amt || isNaN(amt) || amt <= 0) return null;
      const gst = amt * it.rate / 100;
      return { ...it, amtNum: amt, gst, total: amt + gst };
    });
    const validRows = rows.filter((r): r is NonNullable<typeof r> => r !== null);
    if (validRows.length === 0) return null;
    const subtotal = validRows.reduce((s, r) => s + r.amtNum, 0);
    const totalGST = validRows.reduce((s, r) => s + r.gst, 0);
    const grandTotal = subtotal + totalGST;
    return { rows: validRows, subtotal, totalGST, grandTotal };
  }, [items, multiMode]);

  // Composition result
  const compResult = useMemo(() => {
    if (scheme !== 'composition') return null;
    const base = parseFloat(amount);
    if (!base || isNaN(base) || base <= 0) return null;
    const ct = COMPOSITION_TYPES[compositionTypeIdx];
    const gstAmt = base * ct.rate / 100;
    return { gstAmt, total: base + gstAmt, ct, base };
  }, [scheme, amount, compositionTypeIdx]);

  const exportText = () => {
    if (!multiResult) return;
    const lines = [
      '=== GST Invoice Summary ===',
      '',
      ...multiResult.rows.map((r, i) =>
        `${i + 1}. ${r.description || 'Item ' + (i + 1)}\n   Base: ${fmtINR(r.amtNum)}  GST ${r.rate}%: ${fmtINR(r.gst)}  Total: ${fmtINR(r.total)}`
      ),
      '',
      `Subtotal (ex-GST): ${fmtINR(multiResult.subtotal)}`,
      `Total GST:         ${fmtINR(multiResult.totalGST)}`,
      `Grand Total:       ${fmtINR(multiResult.grandTotal)}`,
      '',
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const toggleBtn = (active: boolean) =>
    `px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
      active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
    }`;

  return (
    <ToolLayout
        toolSlug="gst-calculator"
      title="GST Calculator India"
      description="Calculate GST in India instantly. Add or remove GST from any amount at 5%, 12%, 18%, 28% rates. CGST, SGST, and IGST breakdown."
      icon="🧮"
      relatedTools={[
        { name: 'Income Tax Calculator', href: '/tools/income-tax-calculator', icon: '🧾' },
        { name: 'In-Hand Salary Calculator', href: '/tools/hand-salary-calculator', icon: '💵' },
      ]}
      faqs={[
        {
          q: 'Is this GST calculator free?',
          a: 'Yes, it is completely free to use. No registration or payment is required. You can calculate GST for any amount and any rate instantly.',
        },
        {
          q: 'Which country\'s GST system does this calculator follow?',
          a: 'This calculator is built for India\'s GST system. It supports all Indian GST rates (0%, 5%, 12%, 18%, 28%), splits tax into CGST + SGST for intra-state transactions and IGST for inter-state transactions, and also covers the Composition Scheme for small businesses.',
        },
        {
          q: 'How do I use the GST calculator?',
          a: 'For a single item: enter the amount, select the GST rate (or choose Custom), pick "Add GST" or "Remove GST", and select Intra-state or Inter-state. The calculator instantly shows base amount, GST amount, CGST/SGST or IGST split, and the total. For multiple items, switch to "Multiple Items" mode, add up to 10 line items each with their own GST rate, and get the full invoice summary.',
        },
        {
          q: 'What does this calculator compute?',
          a: 'It calculates GST-exclusive and GST-inclusive amounts, CGST/SGST breakdown (intra-state) or IGST (inter-state), supports all five GST slabs (0%, 5%, 12%, 18%, 28%) plus custom rates, handles multi-item invoices with mixed rates, computes Composition Scheme GST (1%, 5%, or 6% depending on business type), and provides a rate comparison table.',
        },
        {
          q: 'What is the difference between "Add GST" and "Remove GST"?',
          a: '"Add GST" (exclusive) means your entered amount is the base price before GST — the calculator adds GST on top. "Remove GST" (inclusive) means your entered amount already includes GST — the calculator extracts the base price and the GST component from the total. For example, if a product costs ₹1,000 excluding tax, use "Add GST". If the invoice total is ₹1,180 and you want to find the base amount, use "Remove GST".',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Country selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 uppercase tracking-wider">Country</span>
          <select className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-900">
            <option value="IN">🇮🇳 India</option>
            <option disabled value="US">🇺🇸 USA (coming soon)</option>
          </select>
        </div>

        {/* Scheme toggle */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-stone-900">GST Scheme</h2>
          <div className="flex gap-3 flex-wrap">
            <button type="button" onClick={() => setScheme('regular')} className={toggleBtn(scheme === 'regular')}>
              Regular Scheme
            </button>
            <button type="button" onClick={() => setScheme('composition')} className={toggleBtn(scheme === 'composition')}>
              Composition Scheme
            </button>
          </div>
          {scheme === 'composition' && (
            <div className="space-y-3">
              <div>
                <label className="label">Business Type</label>
                <select
                  className="input"
                  value={compositionTypeIdx}
                  onChange={e => setCompositionTypeIdx(parseInt(e.target.value, 10))}
                >
                  {COMPOSITION_TYPES.map((ct, i) => (
                    <option key={i} value={i}>{ct.label} — {ct.note}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300">
                <span className="shrink-0">ℹ️</span>
                <span>Composition dealers cannot charge GST separately on invoices, cannot claim ITC, and cannot make inter-state supplies. Turnover limit: ₹1.5 crore (₹75L for special category states).</span>
              </div>
            </div>
          )}
        </div>

        {scheme === 'regular' && (
          <>
            {/* Single / Multi toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900">Calculation Mode</h2>
              <div className="flex gap-1 p-1 bg-stone-50 rounded-xl border border-stone-200">
                <button type="button" onClick={() => setMultiMode(false)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!multiMode ? 'bg-violet-600 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                  Single Item
                </button>
                <button type="button" onClick={() => setMultiMode(true)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${multiMode ? 'bg-violet-600 text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                  Multiple Items
                </button>
              </div>
            </div>

            {/* Single item inputs */}
            {!multiMode && (
              <div className="card space-y-5">
                <h2 className="text-sm font-semibold text-stone-900">GST Details</h2>

                <div>
                  <label className="label">Amount (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="10000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">GST Rate</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_RATES.map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => { setGstRate(rate); setIsCustom(false); }}
                        className={toggleBtn(!isCustom && gstRate === rate)}
                      >
                        {rate}%
                      </button>
                    ))}
                    <button type="button" onClick={() => setIsCustom(true)} className={toggleBtn(isCustom)}>
                      Custom
                    </button>
                  </div>
                  {isCustom && (
                    <div className="mt-3">
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter custom GST rate %"
                        value={customRate}
                        onChange={e => setCustomRate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Calculation Type</label>
                  <div className="flex gap-3 flex-wrap">
                    <button type="button" onClick={() => setMode('add')} className={toggleBtn(mode === 'add')}>
                      Add GST to amount
                    </button>
                    <button type="button" onClick={() => setMode('remove')} className={toggleBtn(mode === 'remove')}>
                      Remove GST from amount
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5">
                    {mode === 'add'
                      ? 'Exclusive: amount is pre-GST. GST will be added on top.'
                      : 'Inclusive: amount already includes GST. GST will be extracted.'}
                  </p>
                </div>

                <div>
                  <label className="label">Transaction Type</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setTxnType('intra')} className={toggleBtn(txnType === 'intra')}>
                      Intra-state (CGST + SGST)
                    </button>
                    <button type="button" onClick={() => setTxnType('inter')} className={toggleBtn(txnType === 'inter')}>
                      Inter-state (IGST)
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5">
                    Intra-state: buyer and seller in same state. Inter-state: different states.
                  </p>
                </div>
              </div>
            )}

            {/* Multi-item inputs */}
            {multiMode && (
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-stone-900">Items</h2>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-12 sm:col-span-5">
                        {idx === 0 && <label className="label">Description</label>}
                        <input
                          className="input"
                          type="text"
                          placeholder={`Item ${idx + 1}`}
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        {idx === 0 && <label className="label">Amount (₹)</label>}
                        <input
                          className="input"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={item.amount}
                          onChange={e => updateItem(item.id, 'amount', e.target.value)}
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        {idx === 0 && <label className="label">GST Rate</label>}
                        <select
                          className="input"
                          value={item.rate}
                          onChange={e => updateItem(item.id, 'rate', parseInt(e.target.value, 10))}
                        >
                          {PRESET_RATES.map(r => (
                            <option key={r} value={r}>{r}%</option>
                          ))}
                        </select>
                      </div>
                      <div className={`col-span-2 sm:col-span-1 flex items-end ${idx === 0 ? 'pb-0' : ''}`}>
                        {idx === 0 && <div className="label invisible">X</div>}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="w-full py-2.5 rounded-xl text-sm font-medium border border-stone-200 bg-stone-50 text-stone-500 hover:border-red-500/50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {items.length < 10 && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border border-dashed border-stone-300 text-stone-500 hover:border-violet-500/50 hover:text-violet-600 transition-all"
                  >
                    + Add Item {items.length > 0 && `(${items.length}/10)`}
                  </button>
                )}
                {items.length >= 10 && (
                  <p className="text-xs text-stone-500 text-center">Maximum 10 items reached.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Composition amount input */}
        {scheme === 'composition' && (
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-stone-900">Turnover / Sale Amount</h2>
            <div>
              <label className="label">Amount (₹)</label>
              <input
                className="input"
                type="number"
                min="0.01"
                placeholder="10000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <p className="text-xs text-stone-500 mt-1">Enter the base sale amount (pre-GST)</p>
            </div>
          </div>
        )}

        {/* Results — single */}
        {singleResult && (
          <>
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-4">GST Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-stone-200">
                  <p className="text-sm text-stone-700">{mode === 'add' ? 'Original Amount (pre-GST)' : 'Original Amount (ex-GST)'}</p>
                  <span className="text-sm font-medium text-stone-800">{fmtINR(singleResult.originalAmount)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone-200">
                  <p className="text-sm text-stone-700">GST Amount ({effectiveRate}%)</p>
                  <span className="text-sm font-semibold text-amber-700">{fmtINR(singleResult.gstAmount)}</span>
                </div>
                {txnType === 'intra' ? (
                  <>
                    <div className="flex items-center justify-between py-1 pl-4">
                      <p className="text-xs text-stone-500">CGST ({singleResult.halfRate}%)</p>
                      <span className="text-xs text-stone-500">{fmtINR(singleResult.cgst)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 pl-4 border-b border-stone-200">
                      <p className="text-xs text-stone-500">SGST ({singleResult.halfRate}%)</p>
                      <span className="text-xs text-stone-500">{fmtINR(singleResult.sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-1 pl-4 border-b border-stone-200">
                    <p className="text-xs text-stone-500">IGST ({effectiveRate}%)</p>
                    <span className="text-xs text-stone-500">{fmtINR(singleResult.igst)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 bg-violet-50 rounded-xl px-3 border border-violet-500/20">
                  <p className="text-sm font-semibold text-stone-900">Total Amount (incl. GST)</p>
                  <span className="text-lg font-bold text-violet-600">{fmtINR(singleResult.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* GST breakdown donut */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Amount Breakdown</h3>
              <PieChart segments={
                txnType === 'intra'
                  ? [
                      { label: 'Base Amount (Pre-GST)', value: singleResult.originalAmount, color: '#7c3aed' },
                      { label: `CGST (${singleResult.halfRate}%)`, value: singleResult.cgst, color: '#f59e0b' },
                      { label: `SGST (${singleResult.halfRate}%)`, value: singleResult.sgst, color: '#f97316' },
                    ]
                  : [
                      { label: 'Base Amount (Pre-GST)', value: singleResult.originalAmount, color: '#7c3aed' },
                      { label: `IGST (${effectiveRate}%)`, value: singleResult.igst, color: '#f59e0b' },
                    ]
              } />
            </div>

            {/* Rate comparison */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">
                Rate Comparison — {fmtINR(parseFloat(amount) || 0)}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 px-3 text-stone-500 font-medium">GST Rate</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">{mode === 'add' ? 'Pre-GST' : 'Ex-GST'}</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">GST Amount</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleResult.comparison.map(row => (
                      <tr
                        key={row.rate}
                        className={`border-b border-stone-200 hover:bg-stone-50/30 ${row.rate === effectiveRate && !isCustom ? 'bg-violet-500/5' : ''}`}
                      >
                        <td className="py-2 px-3">
                          <span className={`font-medium ${row.rate === effectiveRate && !isCustom ? 'text-violet-600' : 'text-stone-700'}`}>
                            {row.rate}%
                            {row.rate === effectiveRate && !isCustom && (
                              <span className="ml-2 text-xs text-violet-500">← current</span>
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-stone-500">{fmtINR(row.base)}</td>
                        <td className="py-2 px-3 text-right text-amber-700">{fmtINR(row.gst)}</td>
                        <td className="py-2 px-3 text-right text-emerald-700">{fmtINR(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Results — multi-item */}
        {multiResult && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-900">Invoice Summary</h3>
              <button
                type="button"
                onClick={exportText}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-300 text-stone-500 hover:border-violet-500/50 hover:text-violet-600 transition-all"
              >
                Copy as Text
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 px-2 text-stone-500 font-medium">Description</th>
                    <th className="text-right py-2 px-2 text-stone-500 font-medium">Base</th>
                    <th className="text-right py-2 px-2 text-stone-500 font-medium">Rate</th>
                    <th className="text-right py-2 px-2 text-stone-500 font-medium">GST</th>
                    <th className="text-right py-2 px-2 text-stone-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {multiResult.rows.map((row, i) => (
                    <tr key={row.id} className="border-b border-stone-200 hover:bg-stone-50/30">
                      <td className="py-2 px-2 text-stone-700">{row.description || `Item ${i + 1}`}</td>
                      <td className="py-2 px-2 text-right text-stone-500">{fmtINR(row.amtNum)}</td>
                      <td className="py-2 px-2 text-right text-stone-500">{row.rate}%</td>
                      <td className="py-2 px-2 text-right text-amber-700">{fmtINR(row.gst)}</td>
                      <td className="py-2 px-2 text-right text-emerald-700">{fmtINR(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-stone-200">
                    <td colSpan={3} className="py-2 px-2 text-sm text-stone-500">Subtotal (ex-GST)</td>
                    <td></td>
                    <td className="py-2 px-2 text-right text-sm font-medium text-stone-800">{fmtINR(multiResult.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 px-2 text-sm text-stone-500">Total GST</td>
                    <td></td>
                    <td className="py-2 px-2 text-right text-sm font-semibold text-amber-700">{fmtINR(multiResult.totalGST)}</td>
                  </tr>
                  <tr className="bg-violet-50 rounded-xl">
                    <td colSpan={3} className="py-3 px-2 text-sm font-semibold text-stone-900 rounded-l-xl">Grand Total</td>
                    <td></td>
                    <td className="py-3 px-2 text-right text-lg font-bold text-violet-600 rounded-r-xl">{fmtINR(multiResult.grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Composition results */}
        {compResult && (
          <div className="card">
            <h3 className="text-sm font-semibold text-stone-900 mb-4">Composition Scheme — GST Payable</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-stone-200">
                <p className="text-sm text-stone-700">Business Type</p>
                <span className="text-sm font-medium text-stone-800">{compResult.ct.label}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-200">
                <p className="text-sm text-stone-700">Applicable Rate</p>
                <span className="text-sm font-semibold text-amber-700">{compResult.ct.rate}%</span>
              </div>
              <div className="flex items-center justify-between py-1 pl-4">
                <p className="text-xs text-stone-500">CGST ({compResult.ct.cgst}%)</p>
                <span className="text-xs text-stone-500">{fmtINR(compResult.base * compResult.ct.cgst / 100)}</span>
              </div>
              <div className="flex items-center justify-between py-1 pl-4 border-b border-stone-200">
                <p className="text-xs text-stone-500">SGST ({compResult.ct.sgst}%)</p>
                <span className="text-xs text-stone-500">{fmtINR(compResult.base * compResult.ct.sgst / 100)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-200">
                <p className="text-sm text-stone-700">GST Payable</p>
                <span className="text-sm font-semibold text-amber-700">{fmtINR(compResult.gstAmt)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-violet-50 rounded-xl px-3 border border-violet-500/20">
                <p className="text-sm font-semibold text-stone-900">Total (incl. GST)</p>
                <span className="text-lg font-bold text-violet-600">{fmtINR(compResult.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* GST Rate Finder */}
        <div className="card">
          <button
            type="button"
            onClick={() => setRateFinderOpen(p => !p)}
            className="w-full flex items-center justify-between text-sm font-semibold text-stone-900"
          >
            <span>Common GST Rates — Quick Reference</span>
            <span className="text-stone-500 text-xs">{rateFinderOpen ? '▲ Close' : '▼ Open'}</span>
          </button>
          {rateFinderOpen && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 px-3 text-stone-500 font-medium">Item / Service</th>
                    <th className="text-right py-2 px-3 text-stone-500 font-medium">GST Rate</th>
                    <th className="text-right py-2 px-3 text-stone-500 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {GST_RATES_REF.map((row, i) => (
                    <tr key={i} className="border-b border-stone-200 hover:bg-stone-50/30">
                      <td className="py-2 px-3 text-stone-700">{row.item}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-semibold ${
                          row.rate === '0%' ? 'text-emerald-700' :
                          row.rate === '5%' ? 'text-blue-700' :
                          row.rate === '12%' ? 'text-violet-600' :
                          row.rate === '18%' ? 'text-amber-700' :
                          'text-red-600'
                        }`}>{row.rate}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-stone-500">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RCM info box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-stone-500 text-lg shrink-0">ℹ️</span>
          <div className="text-sm text-stone-500">
            <p className="text-stone-700 font-medium mb-1">Reverse Charge Mechanism (RCM)</p>
            <p className="mb-2">
              Under RCM, the <strong className="text-stone-700">recipient</strong> (buyer) pays GST directly to the government instead of the supplier.
              This is the reverse of the normal GST flow where the supplier collects and remits GST.
            </p>
            <p className="text-stone-500 text-xs">
              <strong className="text-stone-500">When RCM applies:</strong> (1) Purchases from unregistered suppliers above threshold; (2) Specified services like legal services from advocates, GTA freight, import of services; (3) Notified goods such as cashew nuts, silk yarn, tobacco leaves.
              Under RCM, you can claim ITC on the GST you self-remit, subject to normal ITC rules.
            </p>
          </div>
        </div>

        {/* GST quick ref */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-stone-500 text-lg shrink-0">📌</span>
          <div className="text-sm text-stone-500">
            <p className="text-stone-700 font-medium mb-1">GST Slab Summary</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong className="text-stone-700">0%</strong> — Essential items: fresh food, health services, education</li>
              <li><strong className="text-stone-700">5%</strong> — Packaged foods, transport, medicines</li>
              <li><strong className="text-stone-700">12%</strong> — Processed foods, mobile phones, business class travel</li>
              <li><strong className="text-stone-700">18%</strong> — Most services, electronics, computers, software (most common)</li>
              <li><strong className="text-stone-700">28%</strong> — Luxury goods, automobiles, tobacco, aerated drinks</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
