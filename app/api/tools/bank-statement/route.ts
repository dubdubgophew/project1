import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { logUsage } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 120;

const CATEGORIES = [
  'Shopping', 'Food & Dining', 'Transport', 'Utilities', 'Healthcare',
  'Entertainment', 'Salary/Income', 'Transfer', 'ATM/Cash', 'Housing',
  'Investment', 'Insurance', 'Subscription', 'Tax', 'Other',
] as const;

type Category = typeof CATEGORIES[number];

interface RawTransaction {
  date?: unknown;
  description?: unknown;
  debit?: unknown;
  credit?: unknown;
  balance?: unknown;
  category?: unknown;
}

interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  category: Category;
}

interface ExtractionResult {
  accountHolder?: string | null;
  bankName?: string | null;
  period?: string | null;
  currency?: string;
  openingBalance?: number | null;
  closingBalance?: number | null;
  transactions: RawTransaction[];
}

interface TopCategory {
  name: string;
  amount: number;
  count: number;
}

export async function POST(req: NextRequest) {
  void logUsage(req, 'bank-statement');

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf'))
      return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 });
    if (file.size > 15 * 1024 * 1024)
      return NextResponse.json({ error: 'File is too large. Maximum 15 MB.' }, { status: 400 });

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let pdfText = '';

    try {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      pdfText = parsed.text;
    } catch {
      return NextResponse.json(
        { error: 'Could not read this PDF. Ensure it is not encrypted, password-protected, or an image scan.' },
        { status: 400 }
      );
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: 'No readable text found. This PDF may be scanned or image-based — only digital bank statement PDFs are supported.' },
        { status: 400 }
      );
    }

    // Truncate to fit context window
    const maxChars = 60000;
    const truncated = pdfText.length > maxChars
      ? pdfText.slice(0, maxChars) + '\n[DOCUMENT TRUNCATED]'
      : pdfText;

    // Step 1: AI transaction extraction
    const rawExtraction = await callAI([
      {
        role: 'system',
        content: `You are a financial data extraction expert. Parse a bank statement and return ALL transactions as JSON.

Return ONLY valid JSON — no markdown, no explanation, no backticks:
{
  "accountHolder": "Full Name or null",
  "bankName": "Bank Name or null",
  "period": "e.g. January 2026 or null",
  "currency": "USD",
  "openingBalance": 1234.56,
  "closingBalance": 2345.67,
  "transactions": [
    {
      "date": "2026-01-15",
      "description": "AMAZON.COM PURCHASE",
      "debit": 45.99,
      "credit": null,
      "balance": 2100.00,
      "category": "Shopping"
    }
  ]
}

Rules:
- Extract EVERY transaction in the document
- Parse all date formats to YYYY-MM-DD
- Debit = money going OUT (expenses/withdrawals) — positive number or null
- Credit = money coming IN (deposits/income) — positive number or null
- Combined Amount column: negative = debit, positive = credit
- Clean descriptions: remove codes and extra spaces, keep merchant names
- Balance: running balance after transaction, or null if not shown
- Currency: detect from symbols ($ USD, £ GBP, € EUR, ₹ INR, A$ AUD, C$ CAD, S$ SGD)
- Category must be one of: ${CATEGORIES.join(', ')}
- openingBalance/closingBalance/accountHolder/bankName/period: null if not found`,
      },
      {
        role: 'user',
        content: `Bank statement text:\n\n${truncated}`,
      },
    ], { temperature: 0.1, maxTokens: 8000, model: 'llama-3.3-70b-versatile', skipCache: true });

    // Parse extraction result
    let extracted: ExtractionResult;
    try {
      const jsonMatch = rawExtraction.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      extracted = JSON.parse(jsonMatch[0]) as ExtractionResult;
      if (!Array.isArray(extracted.transactions)) throw new Error('Missing transactions array');
    } catch (err) {
      console.error('[BankStatement] Parse error:', String(err), rawExtraction.slice(0, 300));
      return NextResponse.json(
        { error: 'Could not parse transaction data. Please ensure this is a standard digital bank statement PDF (not a scanned image).' },
        { status: 422 }
      );
    }

    // Normalise and validate each transaction
    const transactions: Transaction[] = extracted.transactions
      .map((t) => ({
        date: String(t.date ?? '').trim(),
        description: String(t.description ?? '').trim().slice(0, 100),
        debit: typeof t.debit === 'number' && !isNaN(t.debit as number) ? Math.abs(t.debit as number) : null,
        credit: typeof t.credit === 'number' && !isNaN(t.credit as number) ? Math.abs(t.credit as number) : null,
        balance: typeof t.balance === 'number' && !isNaN(t.balance as number) ? (t.balance as number) : null,
        category: (CATEGORIES as readonly string[]).includes(String(t.category)) ? (t.category as Category) : 'Other',
      }))
      .filter((t) => t.date || t.description);

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions could be extracted. Please check that the file is a valid bank statement PDF.' },
        { status: 422 }
      );
    }

    // Step 2: Calculate totals programmatically
    const totalCredits = transactions.reduce((s, t) => s + (t.credit ?? 0), 0);
    const totalDebits = transactions.reduce((s, t) => s + (t.debit ?? 0), 0);
    const netChange = totalCredits - totalDebits;
    const currency = extracted.currency ?? 'USD';

    // Aggregate spending by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    for (const t of transactions) {
      if (t.debit !== null && t.debit > 0) {
        const existing = categoryMap.get(t.category) ?? { amount: 0, count: 0 };
        categoryMap.set(t.category, { amount: existing.amount + t.debit, count: existing.count + 1 });
      }
    }
    const topCategories: TopCategory[] = [...categoryMap.entries()]
      .map(([name, v]) => ({ name, amount: Math.round(v.amount * 100) / 100, count: v.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const largestExpenses = [...transactions]
      .filter((t) => t.debit !== null && t.debit > 0)
      .sort((a, b) => (b.debit ?? 0) - (a.debit ?? 0))
      .slice(0, 5)
      .map((t) => ({ description: t.description, amount: t.debit!, date: t.date }));

    // Step 3: AI insights paragraph
    const categorySummary = topCategories
      .map((c) => `${c.name}: ${currency} ${c.amount.toFixed(2)} (${c.count} txns)`)
      .join(', ');

    const aiInsights = await callAI([
      {
        role: 'system',
        content: `You are a personal finance advisor. Write exactly 3 sentences of financial insight based on a bank statement summary. Be specific to the numbers provided. No preamble. No generic advice. Start directly with the observation.`,
      },
      {
        role: 'user',
        content: `Statement summary:
- Period: ${extracted.period ?? 'Unknown'}
- Total in (credits): ${currency} ${totalCredits.toFixed(2)}
- Total out (debits): ${currency} ${totalDebits.toFixed(2)}
- Net change: ${netChange >= 0 ? '+' : ''}${netChange.toFixed(2)}
- Transactions: ${transactions.length}
- Top categories: ${categorySummary || 'N/A'}
- Largest expense: ${largestExpenses[0] ? `${largestExpenses[0].description} (${currency} ${largestExpenses[0].amount.toFixed(2)})` : 'N/A'}

Write 3 sentences of insight.`,
      },
    ], { temperature: 0.6, maxTokens: 250 });

    return NextResponse.json({
      accountHolder: extracted.accountHolder ?? null,
      bankName: extracted.bankName ?? null,
      period: extracted.period ?? null,
      currency,
      openingBalance: typeof extracted.openingBalance === 'number' ? extracted.openingBalance : null,
      closingBalance: typeof extracted.closingBalance === 'number' ? extracted.closingBalance : null,
      totalCredits: Math.round(totalCredits * 100) / 100,
      totalDebits: Math.round(totalDebits * 100) / 100,
      netChange: Math.round(netChange * 100) / 100,
      transactionCount: transactions.length,
      topCategories,
      largestExpenses,
      aiInsights: aiInsights.trim(),
      transactions,
    });
  } catch (err) {
    console.error('[BankStatement] Unhandled error:', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
