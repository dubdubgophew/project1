import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Code Reviewer — Get Instant Code Review & Quality Score | Formly',
  description: 'AI code review in seconds. Get bug detection, security issues, performance tips, grade (A-F), and improved code. Supports JavaScript, Python, TypeScript, Java & more. Free.',
  keywords: ["ai code reviewer", "code review tool free", "automated code review", "code quality checker", "code review ai", "free code reviewer online", "code bug detector", "code security checker ai", "code quality score", "ai code analysis"],
  openGraph: { title: 'Free AI Code Reviewer | Formly', description: 'Instant AI code review: bugs, security, performance, quality grade (A-F), improved code. Free.', url: 'https://formly.tools/tools/code-reviewer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Code Reviewer | Formly', description: 'Free AI code reviewer — bugs, security, quality score & improved code. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/code-reviewer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Code Reviewer"
        description="AI code review in seconds. Get bug detection, security issues, performance tips, grade (A-F), and improved code. Supports JavaScript, Python, TypeScript, Java & more. Free."
        url="https://formly.tools/tools/code-reviewer"
        category="DeveloperApplication"
        features={['Bug and logic error detection', 'Security vulnerability scanning', 'Performance optimization tips', 'Quality grade A-F', 'Improved code version generated']}
        faqs={[{ q: 'What does the AI code reviewer check for?', a: 'It checks for bugs and logic errors, security vulnerabilities (SQL injection, XSS, insecure dependencies), performance bottlenecks, code style issues, and best practice violations.' }, { q: 'What is the quality grade?', a: 'The grade (A to F) is a holistic score based on correctness, security, performance, and readability. A score of 80+ earns an A.' }, { q: 'Does it work for production code?', a: 'Yes — it's useful for quick pre-commit checks. For thorough security audits of production systems, combine AI review with manual security testing.' }, { q: 'Is it free?', a: 'Yes — free to use 5 times/day without signup, 10 times/day with a free account.' }]}
      />
      {children}
    </>
  );
}
