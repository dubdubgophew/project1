import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Meal Planner — 7-Day Meal Plan + Grocery List Generator | Formly',
  description: 'Generate a personalized 7-day meal plan with grocery list in 30 seconds. Keto, vegan, vegetarian, high-protein & more. Calorie targets, allergies, budget — all handled by AI. Free, no signup.',
  keywords: ["ai meal planner free", "meal plan generator", "7 day meal plan generator", "free meal planner with grocery list", "weekly meal plan generator", "keto meal plan generator free", "vegan meal planner", "high protein meal plan", "meal prep planner ai", "what should i eat this week"],
  openGraph: { title: 'Free AI Meal Planner — 7-Day Plan + Grocery List | Formly', description: 'Personalized weekly meal plan + grocery list in 30 seconds. Any diet, calorie target, or budget. Free.', url: 'https://formly.tools/tools/meal-planner', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Meal Planner | Formly', description: 'Stop deciding what to eat. AI generates your 7-day meal plan + grocery list in 30 seconds. Free, no signup.' },
  alternates: { canonical: 'https://formly.tools/tools/meal-planner' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Meal Planner"
        description="Generate a personalized 7-day meal plan with grocery list in 30 seconds. Keto, vegan, vegetarian, high-protein and more. Calorie targets, allergies, and budget handled by AI. Free, no signup."
        url="https://formly.tools/tools/meal-planner"
        category="LifestyleApplication"
        features={['7-day meal plan in 30 seconds', 'Supports keto, vegan, vegetarian, Mediterranean, high-protein diets', 'Automatic grocery list with quantities', 'Calorie and protein targets per meal', 'Respects allergies, dislikes, and budget', 'No signup required']}
        faqs={[
          { q: 'How does the AI meal planner work?', a: 'You set your diet type, daily calorie target, meals per day, allergies, and budget. The AI generates a complete 7-day plan with realistic dishes (under 40 minutes cooking time), per-meal calories and protein, plus a categorized grocery list with quantities.' },
          { q: 'Which diets does it support?', a: 'Anything, Vegetarian, Vegan, Keto, Mediterranean, High-Protein, Paleo, and Halal — plus a free-text field for allergies and ingredients you want to avoid.' },
          { q: 'Does it include a grocery list?', a: 'Yes. Every plan comes with a categorized grocery list (Produce, Protein, Grains & Pantry, Dairy, Other) with realistic quantities for one person for the week, optimized to reuse ingredients and reduce waste.' },
          { q: 'Is the meal planner free?', a: 'Yes — completely free with no account or signup required.' },
        ]}
      />
      {children}
    </>
  );
}
