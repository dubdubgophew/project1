'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export const metadata = undefined;

function calcEMI(principal: number, annualRate: number, months: number) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

interface AmortRow { month: number; principal: number; interest: number; balance: number }

function buildAmortization(principal: number, annualRate: number, months: number, emi: number): AmortRow[] {
  const r = annualRate / 12 / 100;
  const rows: AmortRow[] = [];
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({
      month: m,
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }
  return rows;
}

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenure, setTenure] = useState('60');

  const result = useMemo(() => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate);
    const n = parseInt(tenure);
    if (!P || !n || isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0 || r < 0) return null;
    const emi = calcEMI(P, r, n);
    const total = emi * n;
    const totalInterest = total - P;
    const rows = buildAmortization(P, r, n, emi);
    const principalPct = Math.round((P / total) * 100);
    const interestPct = 100 - principalPct;
    return { emi, total, totalInterest, rows, principalPct, interestPct };
  }, [loanAmount, interestRate, tenure]);

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolLayout
      title="Loan / EMI Calculator"
      description="Calculate monthly EMI, total interest, and full amortization schedule for any loan. Instantly see principal vs interest breakdown."
      icon="🏦"
      relatedTools={[
        { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
        { name: 'Pay Stub Generator', href: '/tools/paystub-generator', icon: '🧾' },
        { name: 'Unit Converter', href: '/tools/unit-converter', icon: '📐' },
      ]}
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">Loan Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Loan Amount ($)</label>
              <input className="input" type="number" min="1" placeholder="100000" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
            </div>
            <div>
              <label className="label">Annual Interest Rate (%)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="8.5" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
            </div>
            <div>
              <label className="label">Tenure (months)</label>
              <input className="input" type="number" min="1" placeholder="60" value={tenure} onChange={e => setTenure(e.target.value)} />
            </div>
          </div>
        </div>

        {result && (
          <>
            {/* Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card text-center py-5">
                <p className="text-3xl font-bold text-violet-400">${fmt(result.emi)}</p>
                <p className="text-sm text-gray-400 mt-1">Monthly EMI</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-3xl font-bold text-amber-400">${fmt(result.totalInterest)}</p>
                <p className="text-sm text-gray-400 mt-1">Total Interest</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-3xl font-bold text-emerald-400">${fmt(result.total)}</p>
                <p className="text-sm text-gray-400 mt-1">Total Payment</p>
              </div>
            </div>

            {/* CSS Pie Chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-4">Principal vs Interest Breakdown</h3>
              <div className="flex items-center gap-8">
                <div
                  className="w-32 h-32 rounded-full shrink-0"
                  style={{
                    background: `conic-gradient(#8b5cf6 0% ${result.principalPct}%, #f59e0b ${result.principalPct}% 100%)`,
                  }}
                />
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm bg-violet-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Principal</span>
                        <span className="text-white font-semibold">{result.principalPct}%</span>
                      </div>
                      <p className="text-xs text-gray-500">${fmt(parseFloat(loanAmount))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Interest</span>
                        <span className="text-white font-semibold">{result.interestPct}%</span>
                      </div>
                      <p className="text-xs text-gray-500">${fmt(result.totalInterest)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">
                Amortization Schedule (first 12 months)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-400 font-medium">Month</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Principal</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Interest</th>
                      <th className="text-right py-2 px-3 text-gray-400 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 12).map(row => (
                      <tr key={row.month} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-2 px-3 text-gray-400">{row.month}</td>
                        <td className="py-2 px-3 text-right text-violet-400">${fmt(row.principal)}</td>
                        <td className="py-2 px-3 text-right text-amber-400">${fmt(row.interest)}</td>
                        <td className="py-2 px-3 text-right text-gray-300">${fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.rows.length > 12 && (
                <p className="text-xs text-gray-600 mt-3 text-center">Showing first 12 of {result.rows.length} months</p>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
