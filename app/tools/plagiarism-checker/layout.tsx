import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Plagiarism Checker Online 2026 — AI-Powered Detection | Formly Tools',
  description: 'Free AI plagiarism checker: detect copied content, get segment-level risk scores, and fix originality issues instantly. No signup required. Better than basic checkers.',
  keywords: ['plagiarism checker free', 'plagiarism detector online', 'check for plagiarism free', 'plagiarism checker no signup', 'ai plagiarism detector', 'originality checker free', 'plagiarism checker 2026', 'free plagiarism tool', 'plagiarism checker for students', 'turnitin alternative free', 'copyscape alternative free', 'plagiarism scanner online'],
  openGraph: {
    title: 'Free AI Plagiarism Checker 2026 — Instant Originality Detection | Formly Tools',
    description: 'Check your text for plagiarism instantly. AI-powered segment-level detection, originality score, and rewriting suggestions. No account needed.',
    url: 'https://formly.tools/tools/plagiarism-checker',
    type: 'website',
    siteName: 'Formly Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Plagiarism Checker 2026 | Formly Tools',
    description: 'AI plagiarism detector: originality score, segment-level risk, fix suggestions. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/plagiarism-checker' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Free Plagiarism Checker"
        description="AI-powered plagiarism detector that analyzes text for copied content, gives a segment-level originality score, and suggests improvements. Free, no signup needed."
        url="https://formly.tools/tools/plagiarism-checker"
        category="UtilitiesApplication"
        features={[
          'AI-powered segment-level plagiarism detection',
          'Originality score (0–100)',
          'Specific rewriting suggestions for flagged segments',
          'Search queries to verify suspected sources',
          'No signup or account required',
        ]}
        faqs={[
          { q: 'Is this plagiarism checker completely free?', a: "Yes — Formly's plagiarism checker is completely free with no signup, no word limit paywall, and no hidden fees. Paste your text and get an instant originality analysis." },
          { q: 'How accurate is AI-based plagiarism detection?', a: 'The AI detects style inconsistencies, common phrasing from known texts, and segments that appear paraphrased rather than originally written. It is not a database comparison like Turnitin, but is useful for identifying risk areas and getting suggestions to improve originality.' },
          { q: 'Is this a Turnitin alternative?', a: 'This is a free alternative for general originality checks. Turnitin compares against institutional databases. Our AI analyzes text patterns, style consistency, and known source phrasing — useful for self-checking before submitting to Turnitin.' },
          { q: 'Can students use this for academic work?', a: 'Yes. It is designed to help students identify passages that need rewriting before submitting assignments. Use it as a self-check tool to improve originality before final submission.' },
          { q: 'Is my text stored or shared?', a: 'Your text is sent only for AI processing and is never stored, logged, or shared with third parties. No account is needed, so your content stays private.' },
          { q: 'What does the originality score mean?', a: 'A score of 100 means the text appears fully original. 75–99 is low risk. 40–74 is medium risk (some sentences may need rewriting). Below 40 is high risk (significant rewriting recommended).' },
        ]}
        steps={[
          { name: 'Paste your text', text: 'Paste the text you want to check — essay, article, blog post, or any written content.' },
          { name: 'Click Check for Plagiarism', text: 'The AI analyzes each segment for originality, style consistency, and common source phrasing.' },
          { name: 'Review results', text: 'See your originality score, color-coded risk segments, and specific rewriting suggestions.' },
        ]}
      />
      {children}
    </>
  );
}
