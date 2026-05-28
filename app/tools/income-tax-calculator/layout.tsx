import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Income Tax Calculator India FY 2025-26 — New vs Old Regime | Formly',
  description: 'Calculate income tax for FY 2025-26. Compare new vs old tax regime, find which saves more. Includes Budget 2025 slabs, surcharge, 87A rebate. Free, instant.',
  keywords: [
    'income tax calculator india 2025-26',
    'income tax calculator new regime',
    'income tax calculator old regime',
    'tax calculator india 2025',
    'income tax india fy 2025-26',
    'new tax regime calculator',
    'tax slab calculator india',
    'itr calculator india',
  ],
  openGraph: {
    title: 'Income Tax Calculator India FY 2025-26 — New vs Old Regime | Formly',
    description: 'Calculate income tax for FY 2025-26. Compare new vs old tax regime with Budget 2025 slabs, 87A rebate & surcharge. Free, instant.',
    url: 'https://formly.tools/tools/income-tax-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Income Tax Calculator India FY 2025-26 | Formly',
    description: 'Free income tax calculator — new vs old regime comparison, Budget 2025 slabs, 87A rebate, surcharge. FY 2025-26.',
  },
  alternates: { canonical: 'https://formly.tools/tools/income-tax-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Income Tax Calculator India FY 2025-26"
        description="Calculate income tax for FY 2025-26. Compare new vs old tax regime, find which saves more. Includes Budget 2025 slabs, surcharge, 87A rebate. Free, instant."
        url="https://formly.tools/tools/income-tax-calculator"
        category="FinanceApplication"
        features={[
          'New vs Old regime side-by-side comparison',
          'FY 2025-26 Budget 2025 tax slabs',
          'Section 87A rebate (zero tax up to ₹12L new regime)',
          'Surcharge calculation (10% to 37%)',
          'Health & Education Cess (4%)',
          'All major deductions: 80C, 80D, 24b, 80CCD(1B)',
          'Senior & Super Senior Citizen exemptions',
          'Slab-wise tax breakdown table',
          'Monthly TDS calculation',
          'Indian number formatting (₹1,00,000)',
        ]}
        faqs={[
          {
            q: 'What are the new income tax slabs for FY 2025-26?',
            a: 'Under the new regime (Budget 2025): 0% up to ₹4L, 5% from ₹4L-8L, 10% from ₹8L-12L, 15% from ₹12L-16L, 20% from ₹16L-20L, 25% from ₹20L-24L, and 30% above ₹24L. With the Section 87A rebate, there is effectively zero tax for income up to ₹12 lakh.',
          },
          {
            q: 'Should I choose new regime or old regime in FY 2025-26?',
            a: 'The new regime is generally better unless you have significant deductions. You would need deductions exceeding roughly ₹3.75L (for someone earning ₹15L) to make the old regime beneficial. Use this calculator to compare both for your specific income and deductions.',
          },
          {
            q: 'What is Section 87A rebate?',
            a: 'Section 87A provides a full tax rebate. Under the new regime, if your net taxable income is ₹12 lakh or less, you pay zero income tax. Under the old regime, the rebate applies if taxable income is ₹5 lakh or less.',
          },
          {
            q: 'What deductions can I claim under the old regime?',
            a: 'Under the old regime you can claim: Standard deduction ₹50,000, Section 80C up to ₹1,50,000 (PPF, ELSS, LIC, EPF), Section 80D health insurance up to ₹25,000 (₹50,000 for senior citizens), HRA exemption, Home loan interest under Section 24b up to ₹2,00,000, NPS under 80CCD(1B) up to ₹50,000, and more.',
          },
          {
            q: 'How is surcharge calculated on income tax in India?',
            a: 'Surcharge is levied on the income tax amount (not income): 10% for income ₹50L-1Cr, 15% for ₹1Cr-2Cr, 25% for ₹2Cr-5Cr. Above ₹5Cr: 25% under new regime, 37% under old regime. Then 4% Health & Education Cess is applied on (tax + surcharge).',
          },
          {
            q: 'What is the income tax exemption limit for senior citizens?',
            a: 'Under the old regime: Senior citizens (60-80 years) have a basic exemption of ₹3,00,000. Super senior citizens (80+ years) have an exemption of ₹5,00,000. Under the new regime, the same slabs apply for all ages but senior citizens still benefit from higher deductions under 80D.',
          },
        ]}
        steps={[
          { name: 'Choose tax regime', text: 'Select New Regime (default for FY 2025-26) or Old Regime.' },
          { name: 'Enter your income', text: 'Enter annual gross salary and any other income (rent, interest).' },
          { name: 'Select age group', text: 'Choose your age group for correct exemption limits.' },
          { name: 'Add deductions (Old Regime)', text: 'If using old regime, enter your 80C, 80D, HRA, home loan and other deductions.' },
          { name: 'Compare and decide', text: 'View side-by-side comparison and see which regime saves more tax.' },
        ]}
      />
      {children}
    </>
  );
}
