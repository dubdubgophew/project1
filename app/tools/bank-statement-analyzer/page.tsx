'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  category: string;
}

interface TopCategory {
  name: string;
  amount: number;
  count: number;
}

interface AnalysisResult {
  accountHolder: string | null;
  bankName: string | null;
  period: string | null;
  currency: string;
  openingBalance: number | null;
  closingBalance: number | null;
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  transactionCount: number;
  topCategories: TopCategory[];
  largestExpenses: { description: string; amount: number; date: string }[];
  aiInsights: string;
  transactions: Transaction[];
}

type Status = 'idle' | 'analyzing' | 'done' | 'error';

type SortCol = 'date' | 'description' | 'debit' | 'credit' | 'balance' | null;

const CATEGORY_BADGE: Record<string, string> = {
  'Shopping': 'bg-purple-100 text-purple-700',
  'Food & Dining': 'bg-orange-100 text-orange-700',
  'Transport': 'bg-blue-100 text-blue-700',
  'Utilities': 'bg-gray-100 text-gray-700',
  'Healthcare': 'bg-red-100 text-red-700',
  'Entertainment': 'bg-pink-100 text-pink-700',
  'Salary/Income': 'bg-emerald-100 text-emerald-700',
  'Transfer': 'bg-cyan-100 text-cyan-700',
  'ATM/Cash': 'bg-yellow-100 text-yellow-700',
  'Housing': 'bg-amber-100 text-amber-700',
  'Investment': 'bg-teal-100 text-teal-700',
  'Insurance': 'bg-indigo-100 text-indigo-700',
  'Subscription': 'bg-violet-100 text-violet-700',
  'Tax': 'bg-rose-100 text-rose-700',
  'Other': 'bg-stone-100 text-stone-600',
};

const CATEGORY_BAR: Record<string, string> = {
  'Shopping': 'bg-purple-400',
  'Food & Dining': 'bg-orange-400',
  'Transport': 'bg-blue-400',
  'Utilities': 'bg-gray-400',
  'Healthcare': 'bg-red-400',
  'Entertainment': 'bg-pink-400',
  'Salary/Income': 'bg-emerald-400',
  'Transfer': 'bg-cyan-400',
  'ATM/Cash': 'bg-yellow-400',
  'Housing': 'bg-amber-400',
  'Investment': 'bg-teal-400',
  'Insurance': 'bg-indigo-400',
  'Subscription': 'bg-violet-400',
  'Tax': 'bg-rose-400',
  'Other': 'bg-stone-400',
};

const RELATED_TOOLS = [
  { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
  { name: 'Loan Calculator', href: '/tools/loan-calculator', icon: '🏦' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Pay Stub Generator', href: '/tools/paystub-generator', icon: '🧾' },
];

const FAQS = [
  { q: 'Is my bank statement data secure?', a: 'Your PDF is processed server-side to extract text and immediately discarded. We never store, log, or retain any financial data. Your statement never touches a database.' },
  { q: 'Which banks are supported?', a: 'Any bank that produces text-based PDF statements — Chase, Bank of America, HSBC, Barclays, HDFC, SBI, ANZ, TD Bank, RBC, and most global banks. Scanned PDFs are not supported.' },
  { q: 'How do I convert a bank statement to Excel?', a: 'Upload your PDF, click Analyze, then click the Excel button once results appear. You can also download CSV, which opens directly in Excel, Google Sheets, or Apple Numbers.' },
  { q: 'Does it work for credit card statements?', a: 'Yes. Credit card statements in PDF format work the same — purchases, payments, refunds, interest, and fees are all extracted and categorized.' },
  { q: 'How accurate is the transaction extraction?', a: 'Text-based PDFs extract at 90%+ accuracy. The AI cleans descriptions and standardizes date formats. Always verify totals against your original statement for accounting purposes.' },
  { q: 'What currencies are supported?', a: 'All major currencies are auto-detected: USD, GBP, EUR, INR, AUD, CAD, SGD, NZD, AED and more. The currency is identified from your statement automatically.' },
];

function fmt(amount: number | null, currency = 'USD'): string {
  if (amount === null) return '—';
  const symbols: Record<string, string> = {
    USD: '$', GBP: '£', EUR: '€', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$', NZD: 'NZ$',
  };
  const sym = symbols[currency] ?? `${currency} `;
  return `${sym}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BankStatementAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum 15 MB.');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
    setStatus('idle');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  async function handleAnalyze() {
    if (!file) return;
    setError('');
    setStatus('analyzing');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/tools/bank-statement', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        setStatus('error');
        return;
      }

      setResult(data as AnalysisResult);
      setStatus('done');
    } catch {
      setError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  function downloadCSV() {
    if (!result) return;
    const headers = ['Date', 'Description', 'Category', 'Debit', 'Credit', 'Balance'];
    const rows = result.transactions.map((t) => [
      t.date,
      t.description,
      t.category,
      t.debit !== null ? t.debit.toFixed(2) : '',
      t.credit !== null ? t.credit.toFixed(2) : '',
      t.balance !== null ? t.balance.toFixed(2) : '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-statement-${(file?.name ?? 'export').replace('.pdf', '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadExcel() {
    if (!result) return;
    const win = window as unknown as Record<string, unknown>;
    if (!win['XLSX']) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Excel library'));
        document.head.appendChild(script);
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const XLSX = (win as any)['XLSX'];

    const txData = [
      ['Date', 'Description', 'Category', 'Debit', 'Credit', 'Balance'],
      ...result.transactions.map((t) => [
        t.date, t.description, t.category,
        t.debit ?? '', t.credit ?? '', t.balance ?? '',
      ]),
    ];

    const summaryData = [
      ['Bank Statement Analysis — Formly Tools (formly.tools)'],
      [],
      ['Account Holder', result.accountHolder ?? '—'],
      ['Bank', result.bankName ?? '—'],
      ['Period', result.period ?? '—'],
      ['Currency', result.currency],
      [],
      ['Total Money In (Credits)', result.totalCredits],
      ['Total Money Out (Debits)', result.totalDebits],
      ['Net Change', result.netChange],
      ['Total Transactions', result.transactionCount],
      [],
      ['AI Insights'],
      [result.aiInsights],
      [],
      ['Top Spending Categories'],
      ['Category', 'Total Spent', 'Transactions'],
      ...result.topCategories.map((c) => [c.name, c.amount, c.count]),
    ];

    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const txSheet = XLSX.utils.aoa_to_sheet(txData);
    txSheet['!cols'] = [{ wch: 12 }, { wch: 42 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions');
    XLSX.writeFile(wb, `bank-statement-${(file?.name ?? 'export').replace('.pdf', '')}.xlsx`);
  }

  function toggleSort(col: SortCol) {
    if (!col) return;
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  }

  const filteredTx = (result?.transactions ?? [])
    .filter((t) =>
      !search ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.date.includes(search)
    )
    .sort((a, b) => {
      if (!sortCol) return 0;
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortCol === 'date') return dir * a.date.localeCompare(b.date);
      if (sortCol === 'description') return dir * a.description.localeCompare(b.description);
      if (sortCol === 'debit') return dir * ((a.debit ?? 0) - (b.debit ?? 0));
      if (sortCol === 'credit') return dir * ((a.credit ?? 0) - (b.credit ?? 0));
      if (sortCol === 'balance') return dir * ((a.balance ?? 0) - (b.balance ?? 0));
      return 0;
    });

  const SortArrow = ({ col }: { col: SortCol }) =>
    sortCol === col ? (
      <span className="ml-1 text-orange-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-stone-300">↕</span>
    );

  return (
    <ToolLayout
      title="Bank Statement Analyzer"
      description="Upload a PDF bank statement to extract all transactions, convert to Excel or CSV, and get an AI-powered financial summary."
      icon="🏦"
      badge="New"
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
      toolSlug="bank-statement-analyzer"
    >
      <div className="space-y-6">

        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-xl shrink-0">🔒</span>
          <p className="text-sm text-blue-800">
            <strong>Private &amp; secure.</strong> Your PDF is processed to extract text, then immediately discarded.
            No financial data is ever stored or logged.
          </p>
        </div>

        {/* Upload zone */}
        {status !== 'done' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver
                ? 'border-orange-400 bg-orange-50'
                : file
                ? 'border-emerald-400 bg-emerald-50 cursor-default'
                : 'border-stone-300 hover:border-orange-400 hover:bg-orange-50 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {file ? (
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <p className="font-semibold text-stone-800">{file.name}</p>
                <p className="text-sm text-stone-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setStatus('idle'); }}
                  className="text-xs text-stone-400 hover:text-stone-600 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📂</div>
                <div>
                  <p className="font-medium text-stone-700">Drop your bank statement PDF here</p>
                  <p className="text-sm text-stone-500 mt-1">or click to browse · max 15 MB</p>
                </div>
                <p className="text-xs text-stone-400">
                  Supports PDF statements from Chase, HDFC, HSBC, Barclays, ANZ, TD Bank, and most global banks
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Analyze button */}
        {file && (status === 'idle' || status === 'error') && (
          <button
            onClick={handleAnalyze}
            className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Analyze Bank Statement
          </button>
        )}

        {/* Loading */}
        {status === 'analyzing' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-stone-800">Analyzing your statement...</p>
              <p className="text-sm text-stone-500 mt-1">
                Extracting transactions, categorizing spending, generating insights
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <div className="space-y-6">

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs text-emerald-600 font-medium mb-1">Money In</p>
                <p className="text-lg font-bold text-emerald-700">{fmt(result.totalCredits, result.currency)}</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600 font-medium mb-1">Money Out</p>
                <p className="text-lg font-bold text-red-700">{fmt(result.totalDebits, result.currency)}</p>
              </div>
              <div className={`p-4 border rounded-xl ${result.netChange >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-xs font-medium mb-1 ${result.netChange >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  Net Change
                </p>
                <p className={`text-lg font-bold ${result.netChange >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {result.netChange >= 0 ? '+' : ''}{fmt(result.netChange, result.currency)}
                </p>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <p className="text-xs text-stone-500 font-medium mb-1">Transactions</p>
                <p className="text-lg font-bold text-stone-700">{result.transactionCount}</p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h3 className="font-semibold text-stone-800">AI Financial Insights</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{result.aiInsights}</p>
            </div>

            {/* Categories + account details */}
            <div className="grid sm:grid-cols-2 gap-4">
              {result.topCategories.length > 0 && (
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <h3 className="text-sm font-semibold text-stone-800 mb-3">Top Spending Categories</h3>
                  <div className="space-y-3">
                    {result.topCategories.slice(0, 5).map((cat) => {
                      const pct = result.totalDebits > 0 ? (cat.amount / result.totalDebits) * 100 : 0;
                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-stone-600">{cat.name}</span>
                            <span className="text-stone-500">
                              {fmt(cat.amount, result.currency)} · {pct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${CATEGORY_BAR[cat.name] ?? 'bg-orange-400'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <h3 className="text-sm font-semibold text-stone-800 mb-3">Statement Details</h3>
                <div className="space-y-2 text-sm">
                  {result.accountHolder && (
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500 shrink-0">Account Holder</span>
                      <span className="text-stone-800 font-medium text-right">{result.accountHolder}</span>
                    </div>
                  )}
                  {result.bankName && (
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500 shrink-0">Bank</span>
                      <span className="text-stone-800 font-medium text-right">{result.bankName}</span>
                    </div>
                  )}
                  {result.period && (
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500 shrink-0">Period</span>
                      <span className="text-stone-800 font-medium text-right">{result.period}</span>
                    </div>
                  )}
                  {result.openingBalance !== null && (
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500 shrink-0">Opening Balance</span>
                      <span className="text-stone-800 font-medium">{fmt(result.openingBalance, result.currency)}</span>
                    </div>
                  )}
                  {result.closingBalance !== null && (
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500 shrink-0">Closing Balance</span>
                      <span className="text-stone-800 font-medium">{fmt(result.closingBalance, result.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-500 shrink-0">Currency</span>
                    <span className="text-stone-800 font-medium">{result.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions table */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="font-semibold text-stone-800">
                  All Transactions{' '}
                  <span className="text-stone-400 font-normal text-sm">({filteredTx.length})</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 w-36"
                  />
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      {(
                        [
                          { key: 'date' as SortCol, label: 'Date' },
                          { key: 'description' as SortCol, label: 'Description' },
                          { key: null, label: 'Category' },
                          { key: 'debit' as SortCol, label: 'Debit (Out)' },
                          { key: 'credit' as SortCol, label: 'Credit (In)' },
                          { key: 'balance' as SortCol, label: 'Balance' },
                        ] as { key: SortCol; label: string }[]
                      ).map(({ key, label }) => (
                        <th
                          key={label}
                          onClick={() => toggleSort(key)}
                          className={`text-left px-3 py-2.5 text-xs font-semibold text-stone-600 whitespace-nowrap select-none ${key ? 'cursor-pointer hover:text-stone-900' : ''}`}
                        >
                          {label}
                          {key && <SortArrow col={key} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-stone-400 text-sm">
                          No transactions match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredTx.map((t, i) => (
                        <tr
                          key={i}
                          className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${i % 2 === 1 ? 'bg-stone-50/50' : ''}`}
                        >
                          <td className="px-3 py-2.5 text-stone-500 whitespace-nowrap font-mono text-xs">{t.date}</td>
                          <td className="px-3 py-2.5 text-stone-800 max-w-xs">
                            <span className="block truncate" title={t.description}>{t.description}</span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[t.category] ?? 'bg-stone-100 text-stone-600'}`}>
                              {t.category}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-red-600 font-medium whitespace-nowrap">
                            {t.debit !== null ? fmt(t.debit, result.currency) : ''}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-600 font-medium whitespace-nowrap">
                            {t.credit !== null ? fmt(t.credit, result.currency) : ''}
                          </td>
                          <td className="px-3 py-2.5 text-stone-500 whitespace-nowrap font-mono text-xs">
                            {t.balance !== null ? fmt(t.balance, result.currency) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setFile(null); setResult(null); setStatus('idle'); setError(''); setSearch(''); }}
              className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Analyze another statement
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
