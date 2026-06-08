import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Bank Statement Analyzer — Convert PDF to Excel/CSV Free | Formly',
  description: 'Upload a PDF bank statement and convert it to Excel or CSV instantly. Get an AI-powered financial summary with spending categories, totals, and insights. Free, no signup.',
  keywords: [
    'bank statement to excel', 'convert bank statement pdf to csv', 'bank statement analyzer free',
    'bank statement converter online', 'pdf bank statement to spreadsheet', 'bank statement analysis tool',
    'extract transactions from bank statement', 'bank statement summary generator', 'free bank statement converter',
    'bank statement to csv free online', 'bank statement pdf reader', 'transaction extractor pdf free',
    'bank statement excel converter', 'analyse bank statement online free', 'bank statement categorizer',
    'convert pdf statement to excel free', 'bank account statement analyzer', 'spending analysis tool free',
    'bank statement OCR tool free', 'financial statement analyzer',
  ],
  openGraph: {
    title: 'Bank Statement Analyzer — PDF to Excel/CSV + AI Summary | Formly',
    description: 'Upload your bank statement PDF. Get all transactions in Excel/CSV format plus an AI spending summary. Free, private, no signup.',
    url: 'https://formly.tools/tools/bank-statement-analyzer',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bank Statement Analyzer — PDF to Excel Free | Formly',
    description: 'Convert bank statement PDF to Excel/CSV and get AI financial insights instantly. Free online tool.',
  },
  alternates: { canonical: 'https://formly.tools/tools/bank-statement-analyzer' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Bank Statement Analyzer"
        url="https://formly.tools/tools/bank-statement-analyzer"
        description="Free online bank statement analyzer. Upload a PDF bank statement to extract all transactions, convert to Excel or CSV, and get an AI-powered spending summary with category breakdowns and financial insights."
        category="FinanceApplication"
        features={[
          'PDF bank statement text extraction',
          'AI-powered transaction parsing for all major bank formats',
          'Automatic spending category classification (15 categories)',
          'Export to CSV (opens in Excel, Google Sheets, Apple Numbers)',
          'Export to native Excel (.xlsx) with summary sheet',
          'AI financial insights and spending analysis',
          'Top spending categories with visual breakdown',
          'Account holder, bank name, and period detection',
          'Opening and closing balance extraction',
          'Searchable and sortable transaction table',
          'Supports USD, GBP, EUR, INR, AUD, CAD, SGD and more',
          'No signup required — completely free',
          'Private: no financial data stored',
        ]}
        faqs={[
          {
            q: 'Is my bank statement data secure?',
            a: 'Yes. Your PDF is processed server-side to extract text and immediately discarded. We never store, log, or retain any financial data from your bank statement.',
          },
          {
            q: 'How do I convert a bank statement PDF to Excel?',
            a: 'Upload your PDF bank statement, click Analyze, and once processing completes click the Excel download button. You can also download as CSV which opens directly in Microsoft Excel.',
          },
          {
            q: 'Which banks are supported?',
            a: 'Any bank that produces text-based PDF statements is supported — including Chase, Bank of America, Wells Fargo, HSBC, Barclays, Lloyds, HDFC, SBI, ICICI, ANZ, Commonwealth Bank, TD Bank, RBC, and most others worldwide.',
          },
          {
            q: 'Does it work with credit card statements?',
            a: 'Yes. Credit card statements in PDF format work the same as bank statements. The tool extracts purchases, payments, refunds, interest charges, and fees.',
          },
          {
            q: 'What if my PDF is a scanned image?',
            a: 'The tool requires text-based PDFs (standard digital bank statements). Scanned or photographed statements where text cannot be selected are not supported, as they contain no machine-readable text.',
          },
          {
            q: 'What currencies does it support?',
            a: 'All major currencies are auto-detected: USD, GBP, EUR, INR, AUD, CAD, SGD, NZD, AED, and more. The currency symbol used in your statement is automatically identified.',
          },
        ]}
        steps={[
          { name: 'Upload your PDF', text: 'Drag and drop your bank statement PDF or click to browse. Supports files up to 15 MB.' },
          { name: 'Click Analyze', text: 'The AI extracts all transactions, parses dates, amounts, and descriptions, and classifies spending categories.' },
          { name: 'Review the summary', text: 'See total money in, total money out, net change, top spending categories, and AI financial insights.' },
          { name: 'Download your data', text: 'Export all transactions as a CSV file (for Excel/Google Sheets) or as a native .xlsx Excel file with a summary sheet.' },
        ]}
      />
      {children}
    </>
  );
}
