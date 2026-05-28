import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Hand Salary Calculator India 2025 — Take Home Pay After Tax | Formly',
  description: 'Calculate your in-hand take-home salary in India for FY 2025-26. CTC to take-home breakdown, PF, HRA, professional tax, income tax. Free, instant.',
  keywords: [
    'hand salary calculator india',
    'take home salary calculator',
    'ctc to in hand salary calculator',
    'salary calculator india 2025',
    'in hand salary calculator india',
    'net salary calculator india',
    'monthly salary calculator india',
    'salary breakup calculator',
  ],
  openGraph: {
    title: 'Hand Salary Calculator India 2025 — Take Home Pay | Formly',
    description: 'Calculate your in-hand take-home salary for FY 2025-26. Full CTC breakdown: PF, HRA, professional tax, income tax. Free, instant.',
    url: 'https://formly.tools/tools/hand-salary-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hand Salary Calculator India 2025 | Formly',
    description: 'Free in-hand salary calculator India — CTC to take-home with PF, HRA, income tax breakdown. FY 2025-26.',
  },
  alternates: { canonical: 'https://formly.tools/tools/hand-salary-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Hand Salary Calculator India 2025"
        description="Calculate your in-hand take-home salary in India for FY 2025-26. CTC to take-home breakdown including PF, HRA, professional tax, and income tax under new & old regime."
        url="https://formly.tools/tools/hand-salary-calculator"
        category="FinanceApplication"
        features={[
          'CTC to take-home salary conversion',
          'FY 2025-26 tax slabs (Budget 2025)',
          'New vs Old regime comparison',
          'HRA exemption calculation',
          'PF employee & employer breakdown',
          'Professional tax deduction',
          'Section 87A rebate',
          'Indian number formatting (₹1,00,000)',
        ]}
        faqs={[
          {
            q: 'How is in-hand salary calculated from CTC in India?',
            a: 'In-hand salary = Gross Salary − PF Employee Contribution − Professional Tax − Income Tax. Gross salary includes Basic, HRA, Special Allowance, and Other Allowances. PF employee is 12% of basic (capped at ₹1,800/month). Income tax depends on the regime chosen.',
          },
          {
            q: 'What is the difference between CTC and in-hand salary?',
            a: 'CTC (Cost to Company) includes all costs the employer bears — Basic, HRA, allowances, employer PF, and gratuity. In-hand or take-home salary is what you actually receive after deducting employee PF, professional tax, and income tax.',
          },
          {
            q: 'Which tax regime is better in FY 2025-26?',
            a: 'It depends on your deductions. The new regime (default) offers a ₹75,000 standard deduction and zero tax up to ₹12L income with 87A rebate. The old regime lets you claim HRA, 80C (₹1.5L), and other deductions. The calculator shows which saves more for your specific situation.',
          },
          {
            q: 'What is the PF contribution limit in 2025?',
            a: 'Employee and employer each contribute 12% of basic salary to EPF. The contribution is capped based on ₹15,000 statutory wage ceiling — so maximum PF is ₹1,800/month (₹21,600/year) per the EPF Act.',
          },
          {
            q: 'Is professional tax deductible from income tax?',
            a: 'Yes, professional tax paid is deductible under Section 16(iii) of the Income Tax Act when calculating taxable income. It is capped at ₹2,500 per year across India.',
          },
        ]}
        steps={[
          { name: 'Enter your CTC', text: 'Type your annual Cost to Company (CTC) figure from your offer letter.' },
          { name: 'Set salary structure', text: 'Adjust Basic %, HRA %, and Other Allowances using the sliders.' },
          { name: 'Enter rent and city', text: 'Add your monthly rent and select Metro or Non-Metro for HRA exemption.' },
          { name: 'Choose tax regime', text: 'Select New Regime (default, better for most) or Old Regime.' },
          { name: 'View take-home', text: 'Instantly see monthly and annual take-home salary with full breakdown.' },
        ]}
      />
      {children}
    </>
  );
}
