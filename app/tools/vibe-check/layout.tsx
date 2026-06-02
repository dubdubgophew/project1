import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vibe Check — Free Daily Mental Wellness Check-In | Formly',
  description: 'A 60-second AI emotional check-in that actually gets you. Understand your feelings, track mood patterns, and get personalized micro-actions. Free, private, no signup. Works in 25+ countries.',
  keywords: ['mental wellness tool', 'mood tracker free', 'emotional check-in', 'free mental health app', 'daily vibe check', 'mood journal', 'mindfulness tool online', 'AI mental health', 'mood tracking free no signup', 'vibe check tool'],
  alternates: { canonical: 'https://formly.tools/tools/vibe-check' },
  openGraph: {
    title: 'Vibe Check — AI Mental Wellness Check-In | Free',
    description: '60-second daily check-in. Understand your feelings, track mood patterns, get personalized insights and micro-actions. Free forever. Works in 25+ countries.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}