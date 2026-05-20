import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Text Case Converter — UPPER, lower, Title, camelCase Online | Formly',
  description: 'Convert text between 10 case formats instantly: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and more. Free.',
  keywords: ["text case converter", "uppercase to lowercase", "camelcase converter", "snake case converter", "title case converter", "text formatter online", "case converter free", "string case converter", "text transform tool", "capitalization converter"],
  openGraph: { title: 'Free Text Case Converter | Formly', description: 'Convert text to UPPER, lower, Title, camelCase, snake_case and 6 more formats. Free, instant.', url: 'https://formly.tools/tools/text-case', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Text Case Converter | Formly', description: 'Free text case converter — 10 formats including camelCase, snake_case, Title Case. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/text-case' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Text Case Converter"
        description="Convert text between 10 case formats instantly: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and more. Free."
        url="https://formly.tools/tools/text-case"
        category="UtilitiesApplication"
        features={['10 case transformations', 'camelCase, PascalCase, snake_case, kebab-case', 'UPPER, lower, Title, Sentence, Alternate, Inverse', 'Instant conversion', 'Copy to clipboard']}
        faqs={[{ q: 'What case formats are supported?', a: 'Formly supports UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, alternating case, and inverse case.' }, { q: 'What is camelCase?', a: 'camelCase capitalizes the first letter of each word except the first: 'helloWorldExample'. Used in JavaScript variable names, JSON keys, and many programming languages.' }, { q: 'What is snake_case vs kebab-case?', a: 'snake_case separates words with underscores (hello_world) — common in Python, SQL, and Ruby. kebab-case uses hyphens (hello-world) — common in CSS, HTML, and URL slugs.' }, { q: 'Is it free?', a: 'Yes — completely free with no signup, no word limits, and no restrictions.' }]}
      />
      {children}
    </>
  );
}
