import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Code Reviewer — Free Automated Code Review Tool | Formly',
  description: 'Review your code for bugs, security issues, and best practices with AI. Free automated code review for all languages — no signup required.',
  keywords: [
    'ai code reviewer',
    'code review tool',
    'automated code review free',
    'code quality checker',
    'free code review online',
    'ai code analysis',
    'code bug finder',
    'code security reviewer',
    'best practices code checker',
    'online code review tool',
  ],
  openGraph: {
    title: 'AI Code Reviewer — Free Automated Code Review | Formly',
    description: 'Get instant AI code review for bugs, security issues & best practices. Free, no signup. All programming languages.',
    url: 'https://formly.tools/tools/code-reviewer',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Reviewer — Free Automated Code Review | Formly',
    description: 'Get instant AI code review for bugs, security issues & best practices. Free, no signup.',
  },
  alternates: { canonical: 'https://formly.tools/tools/code-reviewer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'AI Code Reviewer',
            description: 'Review your code for bugs, security issues, and best practices with AI-powered automated analysis.',
            url: 'https://formly.tools/tools/code-reviewer',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
            featureList: [
              'Automated bug and error detection',
              'Security vulnerability analysis',
              'Code style and best practice suggestions',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
