import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Gratuity Calculator India 2025 — Gratuity Act Formula | Formly',
  description: 'Calculate gratuity amount as per Payment of Gratuity Act, 1972. Find taxable and exempt gratuity. Supports both covered and non-covered employees. Free.',
  keywords: ['gratuity calculator india', 'gratuity calculator', 'payment of gratuity act calculator', 'gratuity formula india', 'gratuity calculation 5 years', 'gratuity exemption calculator', 'gratuity 2025 india', 'gratuity calculator online free'],
  openGraph: {
    title: 'Gratuity Calculator India 2025 | Formly',
    description: 'Gratuity calculator as per Gratuity Act, 1972. Covered & non-covered employees. Tax exemption up to ₹20L. Free.',
    url: 'https://formly.tools/tools/gratuity-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gratuity Calculator India 2025 | Formly',
    description: 'Free gratuity calculator — Payment of Gratuity Act formula, tax exemption, covered & non-covered employees.',
  },
  alternates: { canonical: 'https://formly.tools/tools/gratuity-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Gratuity Calculator"
        description="Calculate gratuity amount as per Payment of Gratuity Act, 1972. Find taxable and exempt gratuity for covered and non-covered employees."
        url="https://formly.tools/tools/gratuity-calculator"
        category="FinanceApplication"
        features={[
          'Payment of Gratuity Act, 1972 formula',
          'Covered and non-covered employee support',
          'Automatic ₹20,00,000 statutory cap',
          'Tax exemption calculation',
          '5-year eligibility check',
          'Death and disability exception handling',
        ]}
        faqs={[
          {
            q: 'What is the formula for gratuity calculation in India?',
            a: 'For employees covered under the Gratuity Act: Gratuity = (Basic + DA) × 15 × Years of Service ÷ 26. For non-covered employees: (Basic + DA) × 15 × Years ÷ 30. Fractions of a year equal to or more than 6 months are rounded up.',
          },
          {
            q: 'What is the minimum service period to be eligible for gratuity?',
            a: 'You need a minimum of 5 years of continuous service to be eligible for gratuity. This condition is waived in case of death or total disability of the employee.',
          },
          {
            q: 'What is the maximum gratuity limit in India?',
            a: 'The maximum tax-exempt gratuity is ₹20,00,000 (₹20 lakhs) as revised in 2024. Gratuity paid above this limit is added to income and taxed at applicable slab rates.',
          },
          {
            q: 'Is gratuity taxable in India?',
            a: 'For government employees, gratuity is fully tax-exempt. For private sector employees covered under the Gratuity Act, gratuity is exempt up to ₹20 lakhs. For non-covered employees, the exempt amount is the minimum of ₹20L, actual gratuity, or half month\'s salary per year of service.',
          },
        ]}
        steps={[
          { name: 'Enter salary', text: 'Enter your last drawn monthly basic salary plus Dearness Allowance (DA).' },
          { name: 'Enter years of service', text: 'Enter total years of continuous service (decimals allowed, e.g. 5.5 for 5 years 6 months).' },
          { name: 'Select employee type', text: 'Choose whether your organization is covered under the Payment of Gratuity Act (10+ employees).' },
          { name: 'Select reason for leaving', text: 'Choose resignation, retirement, death, or disability — this affects eligibility.' },
          { name: 'View gratuity', text: 'See the calculated gratuity, tax exempt amount, and taxable portion.' },
        ]}
      />
      {children}
    </>
  );
}
