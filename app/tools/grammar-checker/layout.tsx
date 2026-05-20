import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Grammar Checker & Corrector Online — Better Than Grammarly | Formly',
  description: 'Check and fix grammar, spelling, punctuation and style errors instantly. Free AI grammar checker — no signup needed. Supports formal and casual writing styles.',
  keywords: ["grammar checker", "free grammar check online", "grammar corrector", "spell checker free", "grammar fixer online", "punctuation checker", "english grammar checker", "grammar check no signup", "ai grammar corrector", "sentence grammar checker"],
  openGraph: { title: 'Free Grammar Checker | Formly', description: 'Fix grammar, spelling and punctuation instantly. AI-powered, free, no signup.', url: 'https://formly.tools/tools/grammar-checker', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Grammar Checker | Formly', description: 'Free AI grammar checker — fix errors instantly. No signup required.' },
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
        faqs={[{ q: 'Is this grammar checker completely free?', a: 'Yes — Formly's grammar checker is free with up to 5 checks per day without an account. Sign up free for 10/day. No credit card required.' }, { q: 'What types of errors does it catch?', a: 'The AI catches grammar errors, spelling mistakes, punctuation issues, run-on sentences, passive voice, subject-verb disagreement, and style/clarity suggestions.' }, { q: 'How does it compare to Grammarly?', a: 'Formly's grammar checker is completely free with no word limits or premium paywalls for basic corrections. It's ideal for quick checks on emails, essays, and professional writing.' }, { q: 'Does it work for non-native English speakers?', a: 'Yes — it's especially useful for ESL writers. The AI explains corrections in simple terms and suggests natural-sounding alternatives.' }]}
      />
      {children}
    </>
  );
}
