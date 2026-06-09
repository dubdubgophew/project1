import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free FIRE Calculator — When Can I Retire Early? | Formly',
  description: 'Calculate your FIRE number and exact early retirement age. Lean FIRE, Fat FIRE, Coast FIRE — with the 4% rule, compound growth projections, and year-by-year milestones. Free, no signup.',
  keywords: ["fire calculator", "when can i retire calculator", "early retirement calculator", "fire number calculator", "financial independence calculator", "4 percent rule calculator", "coast fire calculator", "lean fire calculator", "fat fire calculator", "retire early calculator free"],
  openGraph: { title: 'Free FIRE Calculator — When Can I Retire Early? | Formly', description: 'Find your FIRE number and early retirement age with the 4% rule. Lean, Fat & Coast FIRE included. Free.', url: 'https://formly.tools/tools/fire-calculator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free FIRE Calculator | Formly', description: 'When can you retire early? Get your FIRE number, retirement age, and savings milestones — free, no signup.' },
  alternates: { canonical: 'https://formly.tools/tools/fire-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="FIRE Calculator — Early Retirement Calculator"
        description="Calculate your FIRE number and exact early retirement age. Lean FIRE, Fat FIRE, Coast FIRE — with the 4% rule, compound growth projections, and year-by-year milestones. Free, no signup."
        url="https://formly.tools/tools/fire-calculator"
        category="FinanceApplication"
        features={['FIRE number using the 4% safe withdrawal rule', 'Exact retirement age and years-to-FIRE projection', 'Lean FIRE, Fat FIRE, and Coast FIRE variants', 'Adjustable return, inflation, and withdrawal rates', 'Live interactive sliders — no signup required']}
        faqs={[
          { q: 'What is a FIRE number?', a: 'Your FIRE number is the investment portfolio size that lets you live off withdrawals forever. Using the 4% rule, it equals your annual expenses multiplied by 25. Spend $40,000/year and your FIRE number is $1,000,000.' },
          { q: 'What is the 4% rule?', a: 'The 4% rule, based on the Trinity Study, says you can withdraw 4% of your portfolio in year one of retirement (adjusting for inflation afterward) with a very high probability of never running out of money over 30+ years.' },
          { q: 'What is the difference between Lean FIRE, Fat FIRE, and Coast FIRE?', a: 'Lean FIRE means retiring on a minimal budget (roughly 60% of your current expenses). Fat FIRE means retiring with a luxury budget (about 150% or more). Coast FIRE means you have saved enough that compound growth alone will fund a normal retirement at 65 — you only need to cover current living costs.' },
          { q: 'Is this FIRE calculator free?', a: 'Yes — completely free, runs entirely in your browser, and requires no account or signup. Your financial data never leaves your device.' },
        ]}
      />
      {children}
    </>
  );
}
