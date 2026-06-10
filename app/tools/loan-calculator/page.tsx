'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';


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
        toolSlug="loan-calculator"
      title="Loan / EMI Calculator"
      description="Calculate monthly EMI, total interest, and full amortization schedule for any loan. Instantly see principal vs interest breakdown."
      icon="🏦"
      relatedTools={[
        { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
        { name: 'Pay Stub Generator', href: '/tools/paystub-generator', icon: '🧾' },
        { name: 'Unit Converter', href: '/tools/unit-converter', icon: '📐' },
      ]}
      faqs={[
        {
          q: 'Is this loan / EMI calculator free?',
          a: 'Yes, it is completely free. No sign-up or payment needed. You can calculate EMI for any loan amount, interest rate, and tenure instantly.',
        },
        {
          q: 'What types of loans can I calculate EMI for?',
          a: 'This is a generic loan EMI calculator suitable for personal loans, car loans, education loans, business loans, or any fixed-interest instalment loan. Enter the loan amount, annual interest rate, and tenure in months to get the monthly EMI.',
        },
        {
          q: 'How do I use the loan EMI calculator?',
          a: 'Enter three values: (1) Loan Amount — the principal you are borrowing, (2) Annual Interest Rate — the interest rate offered by your bank or lender, and (3) Tenure in months — the repayment period. The calculator instantly shows monthly EMI, total interest payable, total repayment amount, a principal vs interest breakdown chart, and a full amortization schedule for the first 12 months.',
        },
        {
          q: 'What does this calculator compute?',
          a: 'It calculates your monthly EMI using the standard reducing balance formula, total interest paid over the loan tenure, total amount repaid (principal + interest), the percentage split between principal and interest, and a month-by-month amortization schedule showing how much of each EMI goes towards principal vs interest.',
        },
        {
          q: 'How accurate is the EMI calculation?',
          a: 'The calculator uses the standard reducing balance (compound interest) formula used by banks: EMI = P × r × (1+r)^n / ((1+r)^n − 1). Results are accurate for fixed-rate loans. Floating rate loans, processing fees, prepayment penalties, or irregular payment schedules may cause actual EMI to differ. Always confirm final figures with your lender.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-stone-900">Loan Details</h2>
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
                <p className="text-3xl font-bold text-violet-600">${fmt(result.emi)}</p>
                <p className="text-sm text-stone-500 mt-1">Monthly EMI</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-3xl font-bold text-amber-700">${fmt(result.totalInterest)}</p>
                <p className="text-sm text-stone-500 mt-1">Total Interest</p>
              </div>
              <div className="card text-center py-5">
                <p className="text-3xl font-bold text-emerald-700">${fmt(result.total)}</p>
                <p className="text-sm text-stone-500 mt-1">Total Payment</p>
              </div>
            </div>

            {/* CSS Pie Chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Principal vs Interest Breakdown</h3>
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
                        <span className="text-stone-700">Principal</span>
                        <span className="text-white font-semibold">{result.principalPct}%</span>
                      </div>
                      <p className="text-xs text-stone-500">${fmt(parseFloat(loanAmount))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-700">Interest</span>
                        <span className="text-white font-semibold">{result.interestPct}%</span>
                      </div>
                      <p className="text-xs text-stone-500">${fmt(result.totalInterest)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">
                Amortization Schedule (first 12 months)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 px-3 text-stone-500 font-medium">Month</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Principal</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Interest</th>
                      <th className="text-right py-2 px-3 text-stone-500 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 12).map(row => (
                      <tr key={row.month} className="border-b border-stone-200 hover:bg-stone-50/30">
                        <td className="py-2 px-3 text-stone-500">{row.month}</td>
                        <td className="py-2 px-3 text-right text-violet-600">${fmt(row.principal)}</td>
                        <td className="py-2 px-3 text-right text-amber-700">${fmt(row.interest)}</td>
                        <td className="py-2 px-3 text-right text-stone-700">${fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.rows.length > 12 && (
                <p className="text-xs text-stone-600 mt-3 text-center">Showing first 12 of {result.rows.length} months</p>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
