import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'HRA Exemption Calculator India 2025 — Section 10(13A) | Formly',
  description: 'Calculate HRA exemption from income tax under Section 10(13A). Find exempt vs taxable HRA for metro and non-metro cities. Free, instant calculation.',
  keywords: ['hra calculator india', 'hra exemption calculator', 'house rent allowance calculator', 'hra tax exemption calculator', 'section 10 13a calculator', 'hra calculator 2025', 'taxable hra calculator', 'hra exemption formula india'],
  openGraph: {
    title: 'HRA Exemption Calculator India 2025 | Formly',
    description: 'Calculate HRA exemption under Section 10(13A). Metro & non-metro cities. Old vs new tax regime. Free, instant.',
    url: 'https://formly.tools/tools/hra-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HRA Exemption Calculator India 2025 | Formly',
    description: 'Free HRA exemption calculator — Section 10(13A), metro & non-metro, old tax regime. No signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/hra-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="HRA Exemption Calculator"
        description="Calculate HRA exemption from income tax under Section 10(13A). Find exempt vs taxable HRA for metro and non-metro cities."
        url="https://formly.tools/tools/hra-calculator"
        category="FinanceApplication"
        features={[
          'Section 10(13A) HRA exemption calculation',
          'Metro and non-metro city support',
          'All three exemption components shown',
          'Tax saving at 20% and 30% slabs',
          'Old vs New tax regime guidance',
        ]}
        faqs={[
          {
            q: 'How is HRA exemption calculated?',
            a: 'HRA exemption under Section 10(13A) is the minimum of: (1) Actual HRA received annually, (2) Annual rent paid minus 10% of annual basic salary, and (3) 50% of annual basic salary for metro cities or 40% for non-metro cities.',
          },
          {
            q: 'Which cities are considered metro cities for HRA?',
            a: 'For HRA exemption purposes, only four cities are classified as metro: Delhi, Mumbai, Chennai, and Kolkata. For these cities, the exemption limit is 50% of basic salary. All other cities are non-metro with a 40% limit.',
          },
          {
            q: 'Is HRA exemption available under the new tax regime?',
            a: 'No. HRA exemption under Section 10(13A) is only available if you opt for the Old Tax Regime. Under the New Tax Regime (default from FY 2023-24), HRA is fully taxable.',
          },
          {
            q: 'Do I need to submit rent receipts to claim HRA exemption?',
            a: 'Yes. You must submit rent receipts to your employer to claim HRA exemption. If annual rent exceeds ₹1,00,000, you also need to provide the landlord\'s PAN card details.',
          },
        ]}
        steps={[
          { name: 'Enter basic salary', text: 'Enter your monthly basic salary (excluding HRA, DA, and other allowances).' },
          { name: 'Enter HRA received', text: 'Enter the HRA component shown in your monthly salary slip.' },
          { name: 'Enter rent paid', text: 'Enter the actual monthly rent you pay to your landlord.' },
          { name: 'Select city type', text: 'Choose Metro (Delhi/Mumbai/Chennai/Kolkata) or Non-Metro to apply the correct percentage.' },
          { name: 'View exemption', text: 'See all three components, the minimum (your HRA exemption), taxable HRA, and estimated tax savings.' },
        ]}
      />
      {children}
    </>
  );
}
