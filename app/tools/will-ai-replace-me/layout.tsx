import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Will AI Replace Me? — Free AI Job Displacement Risk Calculator | Formly',
  description: 'Find out if AI will replace your job. Get your AI replacement risk %, timeline, at-risk tasks, safe skills, and a personalised action plan. Free, instant, brutally honest. Used by professionals in USA, India, UK, Canada, Australia.',
  keywords: [
    'will ai replace my job', 'ai job replacement calculator', 'will ai take my job',
    'ai job risk checker', 'ai automation risk', 'future of work ai', 'ai job displacement',
    'will robots replace me', 'ai career risk assessment', 'jobs replaced by ai',
    'ai job replacement india', 'ai job replacement usa', 'ai automation risk calculator free',
    'which jobs will ai replace', 'job ai risk score',
  ],
  alternates: { canonical: 'https://formly.tools/tools/will-ai-replace-me' },
  openGraph: {
    title: 'Will AI Replace Me? — Free AI Job Risk Calculator',
    description: 'Find out your exact AI replacement risk %, timeline, and what skills will keep you safe. Instant. Free. Brutally honest.',
    type: 'website',
    url: 'https://formly.tools/tools/will-ai-replace-me',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
