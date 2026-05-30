import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Iron Core: 30-Day Military Calisthenics Workout Tracker — Free | Formly',
  description: 'Complete 30-day military calisthenics program. Track your Iron Core workout journey — 3-phase progressive training, vegetarian meal plan, ancient wisdom, and streak tracking. No equipment needed.',
  keywords: [
    'military calisthenics workout',
    '30 day calisthenics challenge',
    'iron core workout tracker',
    'free workout tracker online',
    'calisthenics program beginner',
    'plank challenge 30 days',
    'military fitness program india',
    'bodyweight workout tracker',
    'ab workout tracker',
    'calisthenics tracker india',
    '30 day plank challenge',
    'military fitness training',
  ],
  openGraph: {
    title: 'Iron Core: 30-Day Military Calisthenics — Free Workout Tracker',
    description: '30-day progressive calisthenics program with diet plan, ancient wisdom, and streak tracking. No equipment. Track everything in your browser.',
    url: 'https://formly.tools/tools/iron-core-workout',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iron Core: 30-Day Military Calisthenics | Formly',
    description: 'Free 30-day military calisthenics tracker. Exercises, streaks, diet, ancient wisdom practices.',
  },
  alternates: { canonical: 'https://formly.tools/tools/iron-core-workout' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Iron Core: 30-Day Military Calisthenics Workout Tracker"
        description="Complete 30-day military calisthenics program with progressive training phases, diet plan, habit protocol, and streak tracking. No equipment needed — bodyweight only."
        url="https://formly.tools/tools/iron-core-workout"
        category="HealthApplication"
        features={[
          '30-day progressive calisthenics program',
          '3 training phases: Foundation, Endurance, Iron Core',
          'Enhanced exercise diagrams with form cues',
          'Adjustable rest timer between sets',
          'Streak and completion tracking',
          '4-week vegetarian Indian meal plan',
          'Morning & evening habit protocol',
          'Ancient wisdom: Vedic, Japanese, Buddhist practices',
          'Motivational fire quotes',
          'Progress persists in browser — no signup needed',
          'Personal records tracking',
          'Per-day workout notes',
        ]}
        faqs={[
          { q: 'What equipment do I need for this calisthenics program?', a: 'Zero equipment. Iron Core is entirely bodyweight — planks, hollow body holds, leg raises, bicycle crunches, flutter kicks, V-sit holds. Only a floor mat is helpful.' },
          { q: 'Is this suitable for beginners?', a: 'Yes. Phase 1 (Days 1-10) starts with accessible exercises and low volume. Each phase progressively increases intensity following overload principles.' },
          { q: 'Will my progress be saved?', a: 'Yes. Progress, streak, and completed days are saved automatically in your browser. No account needed.' },
          { q: 'How long does each session take?', a: 'Phase 1: 20-30 min. Phase 2: 30-45 min. Phase 3: 40-60 min. Rest timer between sets is adjustable.' },
          { q: 'What is military calisthenics?', a: 'Bodyweight training used by armed forces — strict form, progressive overload, timed holds, high-rep endurance. Focus on core strength and mental discipline.' },
        ]}
        steps={[
          { name: "Check today's mission", text: "Open the WORKOUT tab to see your current day's exercises, sets, and reps." },
          { name: 'View form guide', text: "Tap the 👁 icon on any exercise to see an animated diagram and coaching cues." },
          { name: 'Check off exercises', text: 'Tap each exercise row to mark it complete as you finish.' },
          { name: 'Use the rest timer', text: 'Start the countdown timer between sets — set 30s to 90s rest.' },
          { name: 'Advance to next day', text: "Complete all exercises and click 'Next Mission' to progress your day count." },
        ]}
      />
      {children}
    </>
  );
}
