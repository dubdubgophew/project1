import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'SIP Calculator India 2025 — Mutual Fund Returns & Wealth Calculator | Formly',
  description:
    'Calculate SIP returns for mutual fund investments. Find future value, wealth gained, and CAGR. Also lumpsum calculator. Free SIP calculator for India 2025.',
  keywords: [
    'sip calculator',
    'sip calculator india',
    'mutual fund sip calculator',
    'sip return calculator',
    'lumpsum calculator',
    'sip calculator 2025',
    'monthly sip calculator',
    'sip investment calculator india',
    'mutual fund return calculator',
    'sip vs lumpsum calculator',
  ],
  openGraph: {
    title: 'SIP Calculator India 2025 — Mutual Fund Returns & Wealth Calculator | Formly',
    description:
      'Calculate SIP returns for mutual fund investments. Find future value, wealth gained, and CAGR. Also lumpsum calculator. Free.',
    url: 'https://formly.tools/tools/sip-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIP Calculator India 2025 | Formly',
    description:
      'Free SIP & lumpsum calculator for India — future value, CAGR, wealth gained, year-by-year breakdown.',
  },
  alternates: { canonical: 'https://formly.tools/tools/sip-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="SIP Calculator India"
        description="Calculate SIP returns for mutual fund investments. Find future value, wealth gained, and CAGR. Also lumpsum calculator. Free SIP calculator for India 2025."
        url="https://formly.tools/tools/sip-calculator"
        category="FinanceApplication"
        features={[
          'SIP (Systematic Investment Plan) return calculator',
          'Step-up SIP with annual increase support',
          'Lumpsum investment calculator',
          'Year-by-year wealth growth table',
          'CAGR and absolute returns calculation',
          'Goal planning reverse calculator',
          'India number formatting (₹)',
        ]}
        faqs={[
          {
            q: 'What is SIP and how is SIP return calculated?',
            a: "SIP (Systematic Investment Plan) lets you invest a fixed amount monthly in mutual funds. Returns are calculated using the formula: FV = P × ((1+r)^n - 1) / r × (1+r), where P is monthly investment, r is monthly rate (annual rate ÷ 12 ÷ 100), and n is total months. The result shows how your regular investments compound over time.",
          },
          {
            q: 'What is a step-up SIP?',
            a: 'A step-up SIP (also called top-up SIP) increases your monthly investment by a fixed percentage each year. For example, a 10% step-up on ₹5,000 means you invest ₹5,000 in year 1, ₹5,500 in year 2, ₹6,050 in year 3, and so on. This accounts for income growth and significantly boosts long-term wealth.',
          },
          {
            q: 'What is the difference between SIP and Lumpsum investment?',
            a: 'In SIP you invest a fixed amount every month, averaging out market highs and lows (rupee cost averaging). In a lumpsum investment you invest the entire amount at once. SIP is suited for salaried investors building wealth gradually; lumpsum is ideal when you have a large sum ready to invest.',
          },
          {
            q: 'What is CAGR in mutual fund returns?',
            a: 'CAGR (Compound Annual Growth Rate) represents the steady yearly growth rate that would produce the same final value as your actual investment. For lumpsum it equals the annual return rate directly. For SIP it is calculated as ((FV / Total Invested)^(1/years) - 1) × 100.',
          },
        ]}
        steps={[
          { name: 'Choose investment type', text: 'Select SIP tab for monthly investments or Lumpsum tab for a one-time investment.' },
          { name: 'Enter investment details', text: 'Enter your monthly SIP amount (or lumpsum amount), expected annual return rate, and investment period.' },
          { name: 'Enable step-up (optional)', text: 'Toggle step-up SIP to add an annual percentage increase to your monthly SIP amount.' },
          { name: 'View results', text: 'See total invested, total returns, final corpus, CAGR, and year-by-year growth table instantly.' },
        ]}
      />
      {children}
    </>
  );
}
