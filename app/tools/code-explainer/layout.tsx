import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Code Explainer — Understand Any Code Instantly | Formly',
  description: 'Explain any code snippet with AI. Get plain-English explanations for Python, JavaScript, TypeScript, Java, C++, Go and more. Free, no signup. Great for beginners and code reviews.',
  keywords: ["code explainer ai", "explain code online", "ai code explanation", "code explainer free", "understand code with ai", "python code explainer", "javascript code explainer", "code explanation tool", "ai code reader", "code to english explainer"],
  openGraph: { title: 'Free AI Code Explainer | Formly', description: 'Explain any code in plain English instantly. Python, JavaScript, Java, C++ and 20+ languages. Free.', url: 'https://formly.tools/tools/code-explainer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Code Explainer | Formly', description: 'Free AI code explainer — understand any code in plain English. No signup required.' },
  alternates: { canonical: 'https://formly.tools/tools/code-explainer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Code Explainer"
        description="Explain any code snippet with AI. Get plain-English explanations for Python, JavaScript, TypeScript, Java, C++, Go and more. Free, no signup. Great for beginners and code reviews."
        url="https://formly.tools/tools/code-explainer"
        category="DeveloperApplication"
        features={['Supports 20+ programming languages', 'Plain English explanations', 'Line-by-line breakdown available', 'Beginner-friendly and expert modes', 'No signup required']}
        faqs={[{ q: "What programming languages does it support?", a: "The AI code explainer supports Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, Bash, R, MATLAB, and more." }, { q: "Is it useful for beginners?", a: "Yes — it explains code in plain English without jargon. Perfect for coding students, bootcamp learners, and anyone reading unfamiliar codebases." }, { q: "Can it explain entire files or just snippets?", a: "It works best with focused snippets (functions, classes, algorithms). For large files, paste specific sections for the clearest explanations." }, { q: "Is it free?", a: "Yes — free to use 5 times/day without an account, 10 times/day with a free account." }]}
      />
      {children}
    </>
  );
}
