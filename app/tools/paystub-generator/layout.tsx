import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Pay Stub Generator — USA, UK, Canada 2025 | Formly',
  description: 'Free pay stub generator online — create accurate pay stubs for USA, UK, and Canada instantly. 2025 tax tables, all 50 US states, PDF download. No signup required.',
  keywords: ['free pay stub generator online', 'pay stub generator', 'paystub generator free', 'free paycheck stub creator', 'online pay stub maker', 'paycheck generator', 'pay slip generator', 'salary stub generator', 'free paystub maker', 'create pay stub online', 'pay stub template free', 'pay stub generator usa', 'pay stub generator canada', 'pay stub 2025'],
  openGraph: { title: 'Free Pay Stub Generator — USA, UK, Canada 2025 | Formly', description: 'Free pay stub generator online — create accurate pay stubs for USA, UK, and Canada. 2025 tax tables, PDF download. No signup required.', url: 'https://formly.tools/tools/paystub-generator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Pay Stub Generator — USA, UK, Canada 2025 | Formly', description: 'Free pay stub generator online — USA, UK, Canada, 2025 taxes. PDF download, no signup.' },
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
          { q: "Does the pay stub generator support Indian pay slips?", a: "Yes — the generator supports Indian payroll including Provident Fund (12% employer + 12% employee), ESI (0.75%), and income tax under the new tax regime with standard deductions." },
          { q: "What format is the pay stub downloaded in?", a: "Pay stubs are downloaded as print-ready PDFs with a professional layout including company details, employee information, earnings breakdown, deductions, and net pay." },
          { q: "How is Formly's pay stub generator different from paid services?", a: "Formly is completely free — unlike StubCreator ($4.99/stub) or ThePayStubs ($8.99/stub). Formly also supports 8 countries vs USA-only on most competitors, and includes live preview before downloading." },
          { q: "Can I generate pay stubs for contractors and freelancers?", a: "Yes — simply enter the contractor's name, your company name, and the payment amount. The generator works for both employees and independent contractors." },
        ]}
        steps={[
          { name: 'Select your country', text: 'Choose your country from USA, UK, Canada, India, Australia, New Zealand, Ireland, or Singapore to load the correct 2025 tax tables.' },
          { name: 'Enter pay details', text: 'Enter the gross pay amount and select your pay frequency (weekly, bi-weekly, semi-monthly, monthly, or annual).' },
          { name: 'Add employer and employee info', text: 'Enter company name, address, EIN/tax number, employee name, job title, and employee ID for a professional-looking stub.' },
          { name: 'Configure deductions (US only)', text: 'Optionally add 401(k) percentage, health insurance, dental, and HSA contributions to see pre-tax deduction impact.' },
          { name: 'Preview and download', text: 'See a live pay stub preview on screen. Click Download / Print PDF to open a print-ready PDF — save or print directly from your browser.' },
        ]}
      />
      {children}
    </>
  );
}
