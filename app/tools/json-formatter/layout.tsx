import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free JSON Formatter, Validator & Beautifier Online | Formly',
  description: 'Format, validate, and minify JSON instantly. Syntax highlighting, error detection with line numbers, key count and depth stats. Free online JSON tool — no signup needed.',
  keywords: ["json formatter", "json validator online", "json beautifier free", "json minifier", "format json online", "json pretty print", "json parser online", "validate json free", "json viewer online", "json formatter no signup"],
  openGraph: { title: 'Free JSON Formatter & Validator | Formly', description: 'Format, validate and minify JSON instantly. Error detection, stats, no signup. Free.', url: 'https://formly.tools/tools/json-formatter', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free JSON Formatter & Validator | Formly', description: 'Free JSON formatter & validator — beautify, minify, validate with error detection. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/json-formatter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="JSON Formatter & Validator"
        description="Format, validate, and minify JSON instantly. Syntax highlighting, error detection with line numbers, key count and depth stats. Free online JSON tool — no signup needed."
        url="https://formly.tools/tools/json-formatter"
        category="DeveloperApplication"
        features={['JSON formatting and beautification', 'JSON minification', 'Syntax validation with error line numbers', 'Key count, depth and array item stats', 'Copy formatted output']}
        faqs={[{ q: "What is a JSON formatter?", a: "A JSON formatter (also called a JSON beautifier) takes minified or poorly formatted JSON and adds proper indentation and line breaks to make it human-readable. Formly's formatter also validates the JSON and shows syntax errors with line numbers." }, { q: "What's the difference between format and minify?", a: "Format adds whitespace and indentation for readability. Minify removes all whitespace to produce the smallest possible JSON string — useful for APIs and data transfer." }, { q: "Does it show where JSON errors are?", a: "Yes — when your JSON has syntax errors, the validator shows the exact error message from the JavaScript parser, which typically includes the line and character position of the error." }, { q: "Is there a file size limit?", a: "The formatter works with JSON of any size in the browser. For extremely large files (>10MB), performance may vary depending on your browser." }]}
      />
      {children}
    </>
  );
}
