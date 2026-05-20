import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free EMI & Loan Calculator — Monthly Payment, Amortization Table | Formly',
  description: 'Calculate your EMI, total interest, and full amortization schedule instantly. Supports home loans, car loans, personal loans. Free online loan calculator.',
  keywords: ["loan calculator", "emi calculator", "mortgage calculator", "loan emi calculator online free", "monthly payment calculator", "amortization calculator", "home loan calculator", "car loan calculator", "personal loan calculator", "interest calculator"],
  openGraph: { title: 'Free EMI & Loan Calculator | Formly', description: 'Calculate EMI, total interest and amortization schedule. Home, car & personal loans. Free.', url: 'https://formly.tools/tools/loan-calculator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free EMI & Loan Calculator | Formly', description: 'Free loan & EMI calculator — monthly payment, total interest, amortization table. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/loan-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="EMI & Loan Calculator"
        description="Calculate your EMI, total interest, and full amortization schedule instantly. Supports home loans, car loans, personal loans. Free online loan calculator."
        url="https://formly.tools/tools/loan-calculator"
        category="FinanceApplication"
        features={['Monthly EMI calculation', 'Full amortization schedule', 'Total interest and cost breakdown', 'Principal vs interest pie chart', 'Supports any loan type']}
        faqs={[{ q: 'How is EMI calculated?', a: 'EMI (Equated Monthly Installment) = [P × R × (1+R)^N] / [(1+R)^N – 1], where P = principal loan amount, R = monthly interest rate (annual rate ÷ 12 ÷ 100), N = loan tenure in months.' }, { q: 'What is an amortization schedule?', a: 'An amortization schedule shows each monthly payment broken down into principal repaid and interest charged, along with the remaining balance. It shows how your loan balance decreases over time.' }, { q: 'Is the loan calculator free?', a: 'Yes — completely free to use with no signup required. Calculate as many loan scenarios as you need.' }, { q: 'Can I calculate home loan EMI in India?', a: 'Yes — enter your loan amount in any currency, annual interest rate (e.g. 8.5% for SBI home loans), and tenure in months to get the exact EMI and total interest.' }]}
      />
      {children}
    </>
  );
}
