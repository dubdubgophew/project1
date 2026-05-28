import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Home Loan EMI Calculator India 2025 — Interest & Amortization | Formly',
  description:
    'Calculate home loan EMI, total interest, and amortization schedule for India. Includes tax benefits under Section 24b, LTV ratio, prepayment analysis. Free.',
  keywords: [
    'home loan emi calculator india',
    'home loan calculator india 2025',
    'emi calculator home loan',
    'housing loan emi calculator',
    'home loan interest calculator india',
    'mortgage calculator india',
    'home loan amortization calculator',
    'section 24b calculator',
    'home loan tax benefit calculator',
  ],
  openGraph: {
    title: 'Home Loan EMI Calculator India 2025 — Interest & Amortization | Formly',
    description:
      'Calculate home loan EMI, total interest, and amortization schedule for India. Includes tax benefits under Section 24b, LTV ratio, prepayment analysis. Free.',
    url: 'https://formly.tools/tools/home-loan-emi-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home Loan EMI Calculator India 2025 | Formly',
    description:
      'Free home loan EMI calculator — amortization, LTV, Section 24b tax benefits, prepayment analysis.',
  },
  alternates: { canonical: 'https://formly.tools/tools/home-loan-emi-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Home Loan EMI Calculator India"
        description="Calculate home loan EMI, total interest, and amortization schedule for India. Includes tax benefits under Section 24b, LTV ratio, prepayment analysis. Free."
        url="https://formly.tools/tools/home-loan-emi-calculator"
        category="FinanceApplication"
        features={[
          'Monthly EMI calculation with India defaults (8.75% SBI rate)',
          'Loan-to-Value (LTV) ratio with indicator',
          'Full amortization schedule year-by-year',
          'Prepayment analysis with tenure reduction',
          'Section 24b tax benefit calculator (old regime)',
          'Rate comparison: 8%, 8.5%, 9%, 9.5%, 10%',
          'India number formatting (₹)',
          'Down payment as amount or percentage',
        ]}
        faqs={[
          {
            q: 'How is home loan EMI calculated in India?',
            a: "EMI = [P × R × (1+R)^N] / [(1+R)^N – 1], where P = loan principal, R = monthly interest rate (annual rate ÷ 12 ÷ 100), N = tenure in months. For example, a ₹50 lakh loan at 8.75% for 20 years gives an EMI of approximately ₹44,986.",
          },
          {
            q: 'What is the current SBI home loan interest rate?',
            a: 'SBI home loan interest rates start from 8.50% p.a. (as of 2025). The calculator defaults to 8.75% which represents a common mid-range rate. Actual rates depend on loan amount, credit score, and scheme chosen.',
          },
          {
            q: 'What is LTV ratio for home loans in India?',
            a: "LTV (Loan-to-Value) is the loan amount as a percentage of property value. RBI guidelines mandate: for loans up to ₹30L — max 90% LTV; ₹30L–₹75L — max 80% LTV; above ₹75L — max 75% LTV. Lower LTV means better terms and lower risk.",
          },
          {
            q: 'How much tax can I save on home loan under Section 24b?',
            a: 'Under the old tax regime: Principal repayment up to ₹1.5 lakh/year is deductible under Section 80C. Interest paid up to ₹2 lakh/year is deductible under Section 24b for self-occupied property. At 30% tax slab + 4% cess, maximum annual tax saving = (₹1.5L + ₹2L) × 31.2% = ₹1,09,200.',
          },
          {
            q: 'Does prepayment reduce home loan tenure or EMI?',
            a: "Prepayment reduces your outstanding principal, which reduces total interest significantly. In this calculator, prepayment is applied to principal each month, calculating the actual reduced tenure while keeping EMI constant — which is the most common bank practice.",
          },
        ]}
        steps={[
          { name: 'Enter property details', text: 'Enter property value and down payment (as amount or percentage). Loan amount is auto-calculated.' },
          { name: 'Set loan parameters', text: 'Enter interest rate, tenure (5-30 years), and processing fee.' },
          { name: 'View EMI and breakdown', text: 'See monthly EMI, total interest, amortization schedule, and LTV ratio instantly.' },
          { name: 'Add advanced options', text: 'Optionally add prepayment amount or check tax benefits under old regime.' },
        ]}
      />
      {children}
    </>
  );
}
