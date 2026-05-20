import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Expense Splitter & Bill Calculator — Split Bills Fairly | Formly',
  description: 'Split bills and expenses fairly between friends. Automatic debt simplification shows who owes whom. Great for trips, roommates and group dinners. Free, no signup needed.',
  keywords: ["expense splitter", "bill splitter calculator", "split expenses online", "group expense calculator", "roommate expense splitter", "trip expense calculator", "splitwise alternative", "split bill calculator free", "who owes whom calculator", "group bill splitter"],
  openGraph: { title: 'Free Expense Splitter | Formly', description: 'Split bills between friends fairly. Auto debt simplification — who owes whom. Free Splitwise alternative.', url: 'https://formly.tools/tools/expense-splitter', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Expense Splitter | Formly', description: 'Free expense splitter — split bills, auto debt simplification, no signup. Splitwise alternative.' },
  alternates: { canonical: 'https://formly.tools/tools/expense-splitter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Expense Splitter"
        description="Split bills and expenses fairly between friends. Automatic debt simplification shows who owes whom. Great for trips, roommates and group dinners. Free, no signup needed."
        url="https://formly.tools/tools/expense-splitter"
        category="FinanceApplication"
        features={['Add multiple people and expenses', 'Automatic debt simplification algorithm', 'Per-person total calculation', 'Settlement summary', 'Free Splitwise alternative']}
        faqs={[{ q: "How does the debt simplification work?", a: "The expense splitter uses a debt simplification algorithm to minimize the number of transactions needed to settle all debts. Instead of multiple back-and-forth payments, it calculates the optimal set of transfers." }, { q: "Is this a free alternative to Splitwise?", a: "Yes — Formly's expense splitter offers core bill-splitting functionality for free with no account required. It's perfect for trips, group dinners, and shared household expenses." }, { q: "Can I split expenses unevenly?", a: "Currently the splitter divides shared expenses equally. For unequal splits, you can add separate expense entries for each person's share." }, { q: "Is my expense data saved?", a: "No — all calculations happen in your browser and nothing is stored on our servers. Your financial data stays private." }]}
      />
      {children}
    </>
  );
}
