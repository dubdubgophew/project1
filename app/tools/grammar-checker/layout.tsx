import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Grammar Checker Online 2026 — Fix Errors Instantly | Formly Tools',
  description: 'Free AI grammar checker: fix grammar, spelling, punctuation & style errors instantly with explanations for every correction. Better than basic spellcheck. No account needed — works in your browser.',
  keywords: ["free grammar checker online", "grammar checker", "free grammar check online", "grammar corrector", "spell checker free", "grammar fixer online", "punctuation checker", "english grammar checker", "grammar check no signup", "ai grammar corrector", "sentence grammar checker", "grammarly alternative free", "grammar check tool", "fix grammar online free", "ai grammar checker 2026"],
  openGraph: { title: 'Free AI Grammar Checker 2026 — Fix Errors Instantly | Formly Tools', description: 'Free grammar checker — fix grammar, spelling, punctuation & style errors instantly with AI explanations. No account needed.', url: 'https://formly.tools/tools/grammar-checker', type: 'website', siteName: 'Formly Tools' },
  twitter: { card: 'summary_large_image', title: 'Free Grammar Checker 2026 — Fix Errors Instantly | Formly Tools', description: 'Free AI grammar checker — fix errors instantly with explanations for every correction. No signup required.' },
  alternates: { canonical: 'https://formly.tools/tools/grammar-checker' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Grammar Checker"
        description="Check and fix grammar, spelling, punctuation and style errors instantly. Free AI grammar checker — no signup needed. Supports formal and casual writing styles."
        url="https://formly.tools/tools/grammar-checker"
        category="UtilitiesApplication"
        features={['Grammar, spelling and punctuation corrections', 'Style and clarity suggestions', 'Formal and casual modes', 'Instant AI feedback', 'No signup required']}
        faqs={[
          { q: "Is this grammar checker completely free?", a: "Yes — Formly's grammar checker is completely free with no word count limits and no premium paywall for corrections. No signup or credit card required. Open the tool and start checking immediately." },
          { q: "What types of errors does the AI grammar checker catch?", a: "The AI catches grammar errors, spelling mistakes, punctuation issues, run-on sentences, passive voice overuse, subject-verb disagreement, comma splices, dangling modifiers, and style/clarity suggestions. Every correction includes an explanation of why it was flagged." },
          { q: "How does Formly Grammar Checker compare to Grammarly?", a: "Formly's grammar checker is completely free with no premium tier required for basic corrections — Grammarly locks most suggestions behind a $12/month subscription. Formly is ideal for quick checks on emails, essays, and professional writing without creating an account." },
          { q: "Does it work for non-native English speakers?", a: "Yes — it's especially useful for ESL writers. The AI explains every correction in plain language and suggests natural-sounding alternatives, making it easier to learn correct English usage, not just fix the current document." },
          { q: "Can I use this grammar checker for academic writing?", a: "Yes. The grammar checker works well for academic essays, research papers, dissertations, and reports. It identifies passive voice overuse (common in academic writing), awkward phrasing, and formal grammar violations. It does not check for plagiarism." },
          { q: "Does the grammar checker support British English?", a: "Yes. The tool understands both American English (US) and British English (UK) conventions. It will not flag British spellings like 'colour', 'organise', or 'programme' as errors." },
          { q: "Is my text stored or shared when I use the grammar checker?", a: "Your text is sent only for AI processing and is not stored, logged, or used for training. The connection is encrypted (HTTPS) and no account is needed, so your writing stays private." },
        ]}
        steps={[
          { name: 'Paste or type your text', text: 'Enter any text — email, essay, document, or message — into the input area.' },
          { name: 'Click Check Grammar', text: 'Click the Check Grammar button. AI analyzes your text for grammar, spelling, punctuation, and style errors.' },
          { name: 'Review corrections', text: 'See the corrected text with improvements highlighted. Copy the result or download it.' },
        ]}
      />
      {children}
    </>
  );
}
