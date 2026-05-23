import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Paraphrasing Tool — Rewrite Text in 5 Styles | Formly',
  description: 'Free paraphrasing tool online — rewrite any text in 5 styles instantly. Academic, fluent, simple, creative, and formal modes. QuillBot alternative. No signup needed.',
  keywords: ["free paraphrasing tool online", "paraphrasing tool", "paraphrase online free", "reword text online", "ai paraphraser", "sentence rewriter free", "text paraphraser", "essay rewriter", "paraphrase tool academic", "rewrite paragraph ai", "best free paraphraser", "quillbot alternative free", "paraphrase generator free", "online paraphraser no signup"],
  openGraph: { title: 'Free Paraphrasing Tool — Rewrite Text in 5 Styles | Formly', description: 'Free paraphrasing tool online — rewrite any text in 5 styles instantly. Academic, fluent, simple & more. QuillBot alternative. No signup needed.', url: 'https://formly.tools/tools/paraphraser', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Paraphrasing Tool — Rewrite Text in 5 Styles | Formly', description: 'Free paraphrasing tool online — reword any text in 5 styles. QuillBot alternative, no signup.' },
  alternates: { canonical: 'https://formly.tools/tools/paraphraser' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Paraphrasing Tool"
        description="Paraphrase any text instantly with AI. Rewrite sentences, paragraphs or essays in multiple tones — academic, fluent, simple. Free, no signup needed."
        url="https://formly.tools/tools/paraphraser"
        category="UtilitiesApplication"
        features={['Multiple rewriting tones (Academic, Fluent, Simple, Creative)', 'Preserves original meaning', 'Supports paragraphs and essays', 'No signup required', 'Instant AI-powered rewriting']}
        faqs={[{ q: "What is an AI paraphrasing tool?", a: "An AI paraphrasing tool rewrites text while preserving the original meaning. Formly's paraphraser uses advanced AI to rephrase sentences, paragraphs, or entire essays in different tones — academic, fluent, creative, or simple." }, { q: "Is the paraphrasing tool free to use?", a: "Yes — you can paraphrase up to 5 times per day for free without signing up. Create a free account for 10 uses/day, or go Pro for unlimited paraphrasing." }, { q: "Can I use it for academic writing?", a: "Yes — the Academic mode rephrases text in a formal, scholarly tone while maintaining technical accuracy. Always verify AI-paraphrased content before submitting academic work." }, { q: "How is it different from just using a thesaurus?", a: "Unlike a thesaurus, our AI rewrites entire sentence structures, not just individual words, producing naturally readable output that doesn't sound robotic or awkward." }]}
        steps={[
          { name: 'Paste your text', text: 'Paste any text you want paraphrased — essay, paragraph, sentence, or full document.' },
          { name: 'Select a tone', text: 'Choose your rewriting tone: Formal, Casual, Academic, Creative, or Simple.' },
          { name: 'Click Paraphrase', text: 'Click the Paraphrase button. The AI rewrites your text preserving the meaning while improving flow and changing phrasing.' },
          { name: 'Copy the result', text: 'Copy the paraphrased text or click Retry for another version.' },
        ]}
      />
      {children}
    </>
  );
}
