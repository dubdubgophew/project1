import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Terms of Service Simplifier — Plain English T&C Explainer | Formly',
  description: 'Understand any Terms of Service or Privacy Policy in seconds. AI breaks it down into plain English with red flags, privacy score, and what the company can do with your data.',
  keywords: ["terms of service summarizer", "privacy policy explainer", "tos simplifier", "terms and conditions summarizer", "privacy policy summarizer free", "what does tos mean", "terms of service explained", "terms checker ai", "privacy policy analyser", "tos reader free"],
  openGraph: { title: 'Free Terms of Service Simplifier | Formly', description: 'Understand any T&C or privacy policy in plain English. Red flags, privacy score, data rights. Free.', url: 'https://formly.tools/tools/terms-simplifier', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Terms of Service Simplifier | Formly', description: 'Free T&C simplifier — plain English, privacy score, red flags detected. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/terms-simplifier' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Terms of Service Simplifier"
        description="Understand any Terms of Service or Privacy Policy in seconds. AI breaks it down into plain English with red flags, privacy score, and what the company can do with your data."
        url="https://formly.tools/tools/terms-simplifier"
        category="UtilitiesApplication"
        features={['Plain English summary of T&C', 'Privacy score (1-10)', 'Red flag detection', 'What the company can/cannot do', 'Your rights explained']}
        faqs={[{ q: "How does the Terms Simplifier work?", a: "Paste the Terms of Service or Privacy Policy text, and the AI analyzes it to extract: a plain-English summary, what the company is allowed to do with your data, your rights, concerning clauses (red flags), and a privacy score from 1-10." }, { q: "What is the privacy score?", a: "The privacy score (1-10) reflects how privacy-friendly the terms are. 1 = extremely invasive, 10 = very privacy-friendly. It's based on data collection practices, third-party sharing, data retention policies, and user rights." }, { q: "What are red flags?", a: "Red flags are concerning clauses that could harm users — like 'we can sell your data to third parties', 'you waive your right to class action lawsuits', 'we can change terms without notice', etc." }, { q: "Is it free?", a: "Yes — free to use 5 times/day without an account." }]}
      />
      {children}
    </>
  );
}
