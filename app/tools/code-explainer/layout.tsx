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
        faqs={[
          { q: "What programming languages does the code explainer support?", a: "The AI code explainer supports Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, Bash/Shell, R, MATLAB, HTML, CSS, and more." },
          { q: "Is it useful for beginners learning to code?", a: "Yes — it explains code in plain English without jargon. Perfect for coding students, bootcamp learners, self-taught developers, and anyone reading unfamiliar codebases." },
          { q: "Can it explain entire files or just snippets?", a: "It works best with focused snippets — functions, classes, algorithms, or blocks of 10–100 lines. For large files, paste specific sections for the clearest explanations." },
          { q: "Is it free to use?", a: "Yes — free to use 5 times/day without an account, 10 times/day with a free Formly account. No credit card required." },
          { q: "Can it explain code written by someone else?", a: "Yes — paste any code snippet regardless of who wrote it. This is useful for code review, onboarding to new codebases, understanding legacy code, and open source exploration." },
        ]}
        steps={[
          { name: 'Paste your code', text: 'Copy any code snippet and paste it into the input field. The tool supports 20+ programming languages.' },
          { name: 'Select the language', text: 'Select the programming language from the dropdown for more accurate explanations.' },
          { name: 'Click Explain Code', text: 'Click the Explain Code button. The AI reads your code and generates a plain-English explanation in seconds.' },
          { name: 'Read the explanation', text: 'The explanation covers what the code does, how it works, and any notable patterns or potential issues.' },
        ]}
      />
      {children}
    </>
  );
}
