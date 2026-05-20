import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Pay Stub Generator — Create Professional Paystubs Online | Formly',
  description: 'Generate accurate pay stubs online for free. Supports USA (all 50 states), UK, Canada, India, Australia & more. Accurate 2025 tax calculations. Download PDF instantly.',
  keywords: ['pay stub generator', 'paystub generator free', 'free paycheck stub creator', 'online pay stub maker', 'paycheck generator', 'pay slip generator', 'salary stub generator', 'free paystub maker', 'create pay stub online', 'pay stub template free'],
  openGraph: { title: 'Free Pay Stub Generator | Formly', description: 'Create professional pay stubs instantly. Supports 8 countries with 2025 tax tables. Download as PDF.', url: 'https://formly.tools/tools/paystub-generator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Pay Stub Generator | Formly', description: 'Create accurate pay stubs in seconds. USA, UK, Canada, India, Australia supported. Free.' },
  alternates: { canonical: 'https://formly.tools/tools/paystub-generator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Pay Stub Generator"
        description="Free online pay stub generator with accurate 2025 tax calculations for USA, UK, Canada, India, Australia, New Zealand, Ireland, and Singapore."
        url="https://formly.tools/tools/paystub-generator"
        category="FinanceApplication"
        features={['Supports 8 countries with 2025 tax tables', 'All 50 US states supported', 'Employer & employee contributions', 'Professional PDF download', 'Live preview before download']}
        faqs={[
          { q: "Is the pay stub generator free to use?", a: "Yes — creating and previewing pay stubs is completely free. Downloading requires a free account. The generator supports USA (all 50 states), UK, Canada, India, Australia, New Zealand, Ireland, and Singapore." },
          { q: "Are the tax calculations accurate for 2025?", a: "Yes, tax tables are updated for 2025 including federal, state/provincial taxes, Social Security, Medicare, National Insurance, CPP/EI, and other jurisdiction-specific deductions." },
          { q: "Can I use generated pay stubs for official purposes?", a: "Formly pay stubs are for record-keeping and reference purposes. For official verification (bank loans, visa applications), check with the receiving institution about their requirements." },
          { q: "Does the pay stub generator support Indian pay slips?", a: "Yes — the generator supports Indian payroll including basic salary, HRA, special allowance, PF (12% employer + 12% employee), professional tax, and TDS based on income slabs." },
          { q: "What format is the pay stub downloaded in?", a: "Pay stubs are downloaded as print-ready PDFs with a professional layout including company details, employee information, earnings breakdown, deductions, and net pay." },
        ]}
      />
      {children}
    </>
  );
}
