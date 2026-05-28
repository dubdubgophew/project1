import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'GST Calculator India 2025 — Add/Remove GST Instantly | Formly',
  description: 'Calculate GST in India instantly. Add or remove GST from any amount at 5%, 12%, 18%, 28% rates. CGST, SGST, IGST breakdown. Free GST calculator 2025.',
  keywords: ['gst calculator india', 'gst calculator online', 'gst calculator 2025', 'add gst calculator', 'remove gst from amount', 'gst inclusive exclusive calculator', 'cgst sgst calculator', 'igst calculator', '18% gst calculator', 'gst amount calculator'],
  openGraph: {
    title: 'GST Calculator India 2025 | Formly',
    description: 'Add or remove GST at any rate. CGST + SGST or IGST breakdown. Rate comparison table. Free.',
    url: 'https://formly.tools/tools/gst-calculator',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GST Calculator India 2025 | Formly',
    description: 'Free GST calculator — add/remove GST, CGST SGST IGST breakdown, rate comparison. No signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/gst-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="GST Calculator India"
        description="Calculate GST in India instantly. Add or remove GST from any amount at 5%, 12%, 18%, 28% rates. CGST, SGST, IGST breakdown."
        url="https://formly.tools/tools/gst-calculator"
        category="FinanceApplication"
        features={[
          'Add GST (exclusive) and Remove GST (inclusive) modes',
          'Preset rates: 0%, 5%, 12%, 18%, 28% plus custom rate',
          'CGST + SGST for intra-state transactions',
          'IGST for inter-state transactions',
          'Rate comparison table across all GST slabs',
        ]}
        faqs={[
          {
            q: 'How do I calculate GST on an amount?',
            a: 'To add GST: GST Amount = Amount × Rate ÷ 100, Total = Amount + GST. To remove GST from an inclusive amount: Original = Total × 100 ÷ (100 + Rate), GST = Total − Original.',
          },
          {
            q: 'What is the difference between CGST, SGST, and IGST?',
            a: 'For intra-state transactions (buyer and seller in same state), GST is split equally into CGST (Central GST) and SGST (State GST). For inter-state transactions, IGST (Integrated GST) is charged at the full rate and later distributed between centre and destination state.',
          },
          {
            q: 'What are the GST rate slabs in India?',
            a: 'India has five GST slabs: 0% (essentials like fresh food, health, education), 5% (packaged foods, medicines), 12% (processed foods, mobile phones), 18% (most services and electronics — the most common rate), and 28% (luxury goods, automobiles, tobacco).',
          },
          {
            q: 'How to find the original price after removing GST?',
            a: 'Original Price = GST-inclusive price × 100 ÷ (100 + GST Rate). For example, if an item costs ₹1,180 including 18% GST, the original price = 1180 × 100 ÷ 118 = ₹1,000.',
          },
        ]}
        steps={[
          { name: 'Enter amount', text: 'Enter the amount in rupees for which you want to calculate GST.' },
          { name: 'Select GST rate', text: 'Click a preset rate (0%, 5%, 12%, 18%, 28%) or choose Custom to enter any rate.' },
          { name: 'Choose calculation mode', text: 'Select "Add GST" if your amount is pre-GST, or "Remove GST" if the amount already includes GST.' },
          { name: 'Select transaction type', text: 'Choose Intra-state for CGST+SGST split, or Inter-state for IGST.' },
          { name: 'View results', text: 'See the GST amount, component breakdown (CGST/SGST or IGST), total, and rate comparison table.' },
        ]}
      />
      {children}
    </>
  );
}
