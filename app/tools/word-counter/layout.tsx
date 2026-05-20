import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Word Counter & Character Count Tool Online | Formly',
  description: 'Count words, characters, sentences, paragraphs and reading time instantly. Keyword frequency analysis, Flesch readability score. Free word counter — no signup needed.',
  keywords: ["word counter", "character counter online", "word count tool", "free word counter", "character count online", "reading time calculator", "word frequency counter", "text analyser online", "word count checker", "sentence counter"],
  openGraph: { title: 'Free Word Counter | Formly', description: 'Count words, characters, sentences, reading time. Keyword frequency and readability score. Free.', url: 'https://formly.tools/tools/word-counter', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Word Counter | Formly', description: 'Free word counter — words, characters, sentences, reading time, keyword frequency. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/word-counter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Word Counter"
        description="Count words, characters, sentences, paragraphs and reading time instantly. Keyword frequency analysis, Flesch readability score. Free word counter — no signup needed."
        url="https://formly.tools/tools/word-counter"
        category="UtilitiesApplication"
        features={['Word, character, sentence and paragraph count', 'Reading time estimate', 'Keyword frequency analysis', 'Flesch reading ease score', 'No signup required']}
        faqs={[{ q: 'How accurate is the word count?', a: 'The word counter splits text on whitespace and punctuation, matching how most word processors (Microsoft Word, Google Docs) count words. Results are typically identical to Word/Docs.' }, { q: 'How is reading time calculated?', a: 'Reading time is estimated at 200 words per minute — the average adult reading speed. For dense technical content, the actual time may be longer.' }, { q: 'What is the Flesch readability score?', a: 'The Flesch Reading Ease score (0-100) measures how easy text is to read. 90-100 = very easy (5th grade), 60-70 = standard (8th-9th grade), 0-30 = very difficult (college graduate). Higher is easier to read.' }, { q: 'Is there a word limit?', a: 'No — you can paste text of any length. The counter processes entirely in your browser with no data sent to servers.' }]}
      />
      {children}
    </>
  );
}
