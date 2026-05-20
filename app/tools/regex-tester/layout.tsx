import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Regex Tester & Debugger Online — Test Regular Expressions | Formly',
  description: 'Test and debug regular expressions live with match highlighting. Supports flags (global, multiline, case-insensitive), replace mode, and common regex patterns library. Free.',
  keywords: ["regex tester", "regular expression tester online", "regex validator", "regex debugger online", "test regex online free", "regex match tester", "javascript regex tester", "regex pattern tester", "regex checker free", "online regex tool"],
  openGraph: { title: 'Free Regex Tester | Formly', description: 'Test regular expressions live with match highlighting. Replace mode, flags, pattern library. Free.', url: 'https://formly.tools/tools/regex-tester', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Regex Tester | Formly', description: 'Free regex tester — live match highlighting, replace mode, common patterns library. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/regex-tester' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Regex Tester"
        description="Test and debug regular expressions live with match highlighting. Supports flags (global, multiline, case-insensitive), replace mode, and common regex patterns library. Free."
        url="https://formly.tools/tools/regex-tester"
        category="DeveloperApplication"
        features={['Live match highlighting', 'Replace mode with substitution preview', 'All regex flags (g, i, m, s)', 'Quick patterns library (email, URL, phone, etc.)', 'Match count and position display']}
        faqs={[{ q: "What regex flavors does it support?", a: "Formly's regex tester uses JavaScript's native RegExp engine, which supports standard regex syntax compatible with most modern languages." }, { q: "How do I test a regex?", a: "Type or paste your regular expression in the Pattern field, add any flags (g for global, i for case-insensitive, m for multiline), then paste your test string. Matches are highlighted in real time." }, { q: "Can I test regex replacements?", a: "Yes — enable Replace mode and enter a replacement string to preview the result of regex substitution before using it in code." }, { q: "Is there a library of common patterns?", a: "Yes — the Quick Patterns library includes ready-to-use patterns for email addresses, URLs, phone numbers, IP addresses, dates, credit cards, and more." }]}
      />
      {children}
    </>
  );
}
