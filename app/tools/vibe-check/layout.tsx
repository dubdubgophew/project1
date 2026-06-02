import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vibe Check — Free Daily Mental Wellness Check-In | Formly',
  description: 'A 60-second AI emotional check-in that actually gets you. Understand your feelings, track mood patterns, and get personalized micro-actions. Free, private, no signup. Works in 25+ countries.',
  keywords: ['mental wellness tool', 'mood tracker free', 'emotional check-in', 'free mental health app', 'daily vibe check', 'mindfulness tool online', 'AI mental health', 'mood tracking free no signup'],
  alternates: { canonical: 'https://formly.tools/tools/vibe-check' },
  openGraph: {
    title: 'Vibe Check — AI Mental Wellness Check-In | Free',
    description: '60-second daily check-in. Understand your feelings, track mood patterns, get personalized insights and micro-actions. Free forever. 25+ countries.',
    type: 'website',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is Vibe Check free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — completely free with no account required. 5 AI check-ins per day without signup, 10 with a free account, 200 per day on Pro.' } },
    { '@type': 'Question', name: 'Does Vibe Check replace therapy?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Vibe Check is a self-reflection tool for everyday emotional wellness, not a clinical tool or therapy substitute. For mental health conditions or crisis, please seek professional support.' } },
    { '@type': 'Question', name: 'Which countries does Vibe Check support?',
      acceptedAnswer: { '@type': 'Answer', text: 'Vibe Check supports 25+ countries including India, USA, UK, Canada, Australia, Nigeria, Philippines, Japan, South Korea, Brazil, UAE, and more — each with culturally tailored AI insights.' } },
    { '@type': 'Question', name: 'Is my mood history private?',
      acceptedAnswer: { '@type': 'Answer', text: "Your check-in history is stored only in your browser localStorage — nothing is saved on our servers. Only your current check-in text is sent to the AI." } },
    { '@type': 'Question', name: 'What micro-exercises does Vibe Check offer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Based on your mood: animated box breathing (4-4-4-4 cycle), interactive 5-4-3-2-1 grounding, movement prompts, journaling questions, or cognitive reframing exercises.' } },
    { '@type': 'Question', name: 'How does Vibe Check personalize insights by country?',
      acceptedAnswer: { '@type': 'Answer', text: 'Selecting your country activates cultural framing — Indian users get family-centered and yoga-informed advice, Korean users get acknowledgment of achievement pressure, Nigerian users get ubuntu community framing, and so on.' } },
    { '@type': 'Question', name: 'Can I track my mood every day?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — daily check-ins build emotional pattern awareness. The streak counter tracks consistency and the emoji history shows your journey over 14 days.' } },
    { '@type': 'Question', name: 'What happens if I am having dark thoughts?',
      acceptedAnswer: { '@type': 'Answer', text: 'If the AI detects distress, it shows crisis resources for your country — iCall (9152987821) for India, 988 Lifeline for USA, Samaritans (116 123) for UK. Vibe Check is safety-first.' } },
  ],
};

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vibe Check — Daily Emotional Check-In',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  url: 'https://formly.tools/tools/vibe-check',
  description: 'Free AI-powered 60-second daily emotional check-in. 20 emotions, culturally personalized insights, micro-exercises, 14-day mood history. Supports 25+ countries. No signup.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  creator: { '@type': 'Organization', name: 'Formly Tools', url: 'https://formly.tools' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }} />
      {children}
    </>
  );
}