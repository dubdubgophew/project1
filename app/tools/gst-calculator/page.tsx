'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const PRESET_RATES = [0, 5, 12, 18, 28];

export default function GSTCalculatorPage() {
  const [amount, setAmount] = useState('10000');
  const [gstRate, setGstRate] = useState(18);
  const [customRate, setCustomRate] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [txnType, setTxnType] = useState<'intra' | 'inter'>('intra');

  const effectiveRate = isCustom ? (parseFloat(customRate) || 0) : gstRate;

  const result = useMemo(() => {
    const base = parseFloat(amount);
    if (!base || isNaN(base) || base <= 0 || effectiveRate < 0) return null;

    let originalAmount: number;
    let gstAmount: number;
    let totalAmount: number;

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

    // Rate comparison table (using same input amount, same mode)
    const comparison = PRESET_RATES.map(rate => {
      let cmpGST: number;
      let cmpTotal: number;
      let cmpBase: number;
      if (mode === 'add') {
        cmpBase = base;
        cmpGST = base * rate / 100;
        cmpTotal = base + cmpGST;
      } else {
        cmpTotal = base;
        cmpBase = base * 100 / (100 + rate);
        cmpGST = base - cmpBase;
      }
      return { rate, gst: cmpGST, total: cmpTotal, base: cmpBase };
    });

    return { originalAmount, gstAmount, totalAmount, cgst, sgst, igst, halfRate, comparison };
  }, [amount, effectiveRate, mode, txnType]);

  return (
    <ToolLayout
      title="GST Calculator India"
      description="Calculate GST in India instantly. Add or remove GST from any amount at 5%, 12%, 18%, 28% rates. CGST, SGST, and IGST breakdown."
      icon="🧮"
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
          <h2 className="text-sm font-semibold text-white">GST Details</h2>

          {/* Amount */}
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

          {/* GST Rate buttons */}
          <div>
            <label className="label">GST Rate</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_RATES.map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => { setGstRate(rate); setIsCustom(false); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    !isCustom && gstRate === rate
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {rate}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  isCustom
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
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

          {/* Calculation mode */}
          <div>
            <label className="label">Calculation Type</label>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  mode === 'add'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Add GST to amount
              </button>
              <button
                type="button"
                onClick={() => setMode('remove')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  mode === 'remove'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Remove GST from amount
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {mode === 'add'
                ? 'Exclusive: the entered amount is pre-GST. GST will be added on top.'
                : 'Inclusive: the entered amount already includes GST. GST will be extracted.'}
            </p>
          </div>

          {/* Transaction type */}
          <div>
            <label className="label">Transaction Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTxnType('intra')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  txnType === 'intra'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Intra-state (CGST + SGST)
              </button>
              <button
                type="button"
                onClick={() => setTxnType('inter')}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  txnType === 'inter'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Inter-state (IGST)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Intra-state: buyer and seller in same state (CGST + SGST each at half rate). Inter-state: different states (IGST at full rate).
            </p>
          </div>
        </div>

        {result && (
          <>
            {/* Results */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">GST Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <p className="text-sm text-gray-300">
                    {mode === 'add' ? 'Original Amount (pre-GST)' : 'Original Amount (ex-GST)'}
                  </p>
                  <span className="text-sm font-medium text-gray-200">{fmtINR(result.originalAmount)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <p className="text-sm text-gray-300">GST Amount ({effectiveRate}%)</p>
                  <span className="text-sm font-semibold text-amber-400">{fmtINR(result.gstAmount)}</span>
                </div>

                {txnType === 'intra' ? (
                  <>
                    <div className="flex items-center justify-between py-1 pl-4">
                      <p className="text-xs text-gray-500">CGST ({result.halfRate}%)</p>
                      <span className="text-xs text-gray-400">{fmtINR(result.cgst)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 pl-4 border-b border-gray-800">
                      <p className="text-xs text-gray-500">SGST ({result.halfRate}%)</p>
                      <span className="text-xs text-gray-400">{fmtINR(result.sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between py-1 pl-4 border-b border-gray-800">
                    <p className="text-xs text-gray-500">IGST ({effectiveRate}%)</p>
                    <span className="text-xs text-gray-400">{fmtINR(result.igst)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 bg-violet-500/10 rounded-xl px-3 border border-violet-500/20">
                  <p className="text-sm font-semibold text-white">Total Amount (incl. GST)</p>
                  <span className="text-lg font-bold text-violet-400">{fmtINR(result.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Rate comparison table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">
                Rate Comparison — GST at different rates on {fmtINR(parseFloat(amount) || 0)}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">GST Rate</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">
                        {mode === 'add' ? 'Pre-GST' : 'Ex-GST'}
                      </th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">GST Amount</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparison.map(row => (
                      <tr
                        key={row.rate}
                        className={`border-b border-gray-800 hover:bg-gray-800/30 ${row.rate === effectiveRate && !isCustom ? 'bg-violet-500/5' : ''}`}
                      >
                        <td className="py-2 px-3">
                          <span className={`font-medium ${row.rate === effectiveRate && !isCustom ? 'text-violet-400' : 'text-gray-300'}`}>
                            {row.rate}%
                            {row.rate === effectiveRate && !isCustom && (
                              <span className="ml-2 text-xs text-violet-500">← current</span>
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-gray-400">{fmtINR(row.base)}</td>
                        <td className="py-2 px-3 text-right text-amber-400">{fmtINR(row.gst)}</td>
                        <td className="py-2 px-3 text-right text-emerald-400">{fmtINR(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GST info */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <span className="text-gray-400 text-lg shrink-0">ℹ️</span>
              <div className="text-sm text-gray-400">
                <p className="text-gray-300 font-medium mb-1">GST Quick Reference</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong className="text-gray-300">0%</strong> — Essential items: fresh food, health services, education</li>
                  <li><strong className="text-gray-300">5%</strong> — Packaged foods, transport, medicines</li>
                  <li><strong className="text-gray-300">12%</strong> — Processed foods, business class travel, mobile phones</li>
                  <li><strong className="text-gray-300">18%</strong> — Most services, electronics, computers, software (most common)</li>
                  <li><strong className="text-gray-300">28%</strong> — Luxury goods, automobiles, tobacco, aerated drinks</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
