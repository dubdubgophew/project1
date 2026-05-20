import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Text Diff Checker — Compare Two Texts Online | Formly',
  description: 'Compare two texts and highlight differences line by line. Green for additions, red for deletions. Copy as patch, word-level diff. Free online text comparison tool.',
  keywords: ["diff checker", "text comparison tool", "compare two texts online", "text diff tool free", "online diff checker", "file diff checker", "find differences in text", "text compare online free", "diff tool online", "code diff checker"],
  openGraph: { title: 'Free Text Diff Checker | Formly', description: 'Compare two texts and see differences highlighted. Line-by-line diff, green/red output. Free.', url: 'https://formly.tools/tools/diff-checker', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Text Diff Checker | Formly', description: 'Free text diff checker — compare texts, highlight differences, copy as patch. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/diff-checker' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Text Diff Checker"
        description="Compare two texts and highlight differences line by line. Green for additions, red for deletions. Copy as patch, word-level diff. Free online text comparison tool."
        url="https://formly.tools/tools/diff-checker"
        category="DeveloperApplication"
        features={['Line-by-line diff with color highlighting', 'Green for additions, red for deletions, gray for context', 'Copy output as patch/diff format', 'Supports code and plain text', 'LCS algorithm for accurate comparison']}
        faqs={[{ q: "How does the diff checker work?", a: "Formly uses the Longest Common Subsequence (LCS) algorithm to find the differences between two texts. It highlights additions in green and deletions in red, line by line." }, { q: "Can I compare code files?", a: "Yes — paste code from any language into both panels. The diff checker works on any plain text, including source code, JSON, markdown, and configuration files." }, { q: "What does 'copy as patch' do?", a: "Copying as patch gives you a unified diff format (like what git shows) that can be applied with the 'patch' command or viewed in diff-aware tools." }, { q: "Is there a size limit?", a: "No — the diff checker works with text of any length in the browser without sending data to servers." }]}
      />
      {children}
    </>
  );
}
