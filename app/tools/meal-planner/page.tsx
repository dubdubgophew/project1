'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, UtensilsCrossed, ShoppingCart, Printer } from 'lucide-react';

const DIETS = ['Anything', 'Vegetarian', 'Vegan', 'Keto', 'Mediterranean', 'High-Protein', 'Paleo', 'Halal'];
const BUDGETS = [
  { id: 'budget', label: '💸 Budget', desc: 'Cheap staples' },
  { id: 'moderate', label: '🛒 Moderate', desc: 'Everyday groceries' },
  { id: 'premium', label: '✨ Premium', desc: 'No expense spared' },
] as const;

const RELATED = [
  { name: 'Iron Core Workout', href: '/tools/iron-core-workout', icon: '💪' },
  { name: 'Expense Splitter', href: '/tools/expense-splitter', icon: '💰' },
  { name: 'Vibe Check', href: '/tools/vibe-check', icon: '🔮' },
];

interface Meal { meal: string; name: string; description: string; calories: number; protein_g: number }
interface Plan {
  days: { day: string; meals: Meal[] }[];
  grocery_list: { category: string; items: string[] }[];
  tips: string[];
}

export default function MealPlannerPage() {
  const [diet, setDiet]               = useState('Anything');
  const [calories, setCalories]       = useState(2000);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [dislikes, setDislikes]       = useState('');
  const [cuisine, setCuisine]         = useState('');
  const [budget, setBudget]           = useState<'budget' | 'moderate' | 'premium'>('moderate');
  const [plan, setPlan]               = useState<Plan | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [copied, setCopied]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const res = await fetch('/api/tools/meal-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diet, calories, mealsPerDay, dislikes, cuisine, budget }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setPlan(data.plan);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyGroceryList() {
    if (!plan) return;
    const text = plan.grocery_list
      .map(g => `${g.category}:\n${g.items.map(i => `  • ${i}`).join('\n')}`)
      .join('\n\n');
    navigator.clipboard.writeText(`🛒 Weekly Grocery List (via formly.tools/tools/meal-planner)\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout
      toolSlug="meal-planner"
      title="AI Meal Planner"
      description="Stop deciding what to eat. Get a personalized 7-day meal plan with calories, protein, and a ready-made grocery list — in 30 seconds."
      icon="🍽️"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Diet Type</label>
          <div className="flex flex-wrap gap-2">
            {DIETS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDiet(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  diet === d
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Daily Calories: {calories} kcal</label>
            <input
              type="range" min={1200} max={4000} step={100}
              value={calories}
              onChange={e => setCalories(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500"><span>1,200</span><span>4,000</span></div>
          </div>
          <div>
            <label className="label">Meals Per Day</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMealsPerDay(n)}
                  className={`flex-1 p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                    mealsPerDay === n
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Allergies / Dislikes <span className="text-gray-500 font-normal">(optional)</span></label>
            <input
              type="text" value={dislikes} onChange={e => setDislikes(e.target.value)}
              placeholder="e.g. peanuts, mushrooms, cilantro" className="input"
            />
          </div>
          <div>
            <label className="label">Cuisine Preference <span className="text-gray-500 font-normal">(optional)</span></label>
            <input
              type="text" value={cuisine} onChange={e => setCuisine(e.target.value)}
              placeholder="e.g. Indian, Italian, Mexican mix" className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Grocery Budget</label>
          <div className="flex gap-2">
            {BUDGETS.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBudget(b.id)}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  budget === b.id
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium">{b.label}</div>
                <div className="text-xs text-gray-500">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Cooking up your week…</>
          ) : (
            <><UtensilsCrossed className="w-5 h-5" /> Generate My 7-Day Plan</>
          )}
        </button>
      </form>

      {plan && (
        <>
          {/* Weekly plan */}
          <div className="space-y-3">
            {plan.days.map(day => (
              <div key={day.day} className="card">
                <h2 className="font-bold text-white mb-3">{day.day}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {day.meals.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-800/50">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">{m.meal}</p>
                      <p className="text-sm font-semibold text-white leading-snug">{m.name}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{m.description}</p>
                      <p className="text-[11px] text-gray-500 mt-2">{m.calories} kcal · {m.protein_g}g protein</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Grocery list */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" /> Weekly Grocery List
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyGroceryList}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy list'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.grocery_list.map(g => (
                <div key={g.category}>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{g.category}</p>
                  <ul className="space-y-1">
                    {g.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {plan.tips?.length > 0 && (
            <div className="card bg-emerald-500/5 border-emerald-500/20">
              <h2 className="font-semibold text-white mb-2">💡 Meal-Prep Tips</h2>
              <ul className="space-y-1.5">
                {plan.tips.map((t, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">Free AI Meal Plan Generator with Grocery List</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          The average person spends 37 minutes a day deciding what to eat. This planner kills that decision
          fatigue: pick your diet — keto, vegan, vegetarian, Mediterranean, high-protein, or anything — set a
          calorie target, list what you hate, and get a complete 7-day plan with per-meal calories and protein,
          plus a categorized grocery list with real quantities. Dishes are chosen to reuse ingredients across
          the week, so you buy less and waste nothing. Regenerate as many times as you like — it&apos;s free,
          with no signup.
        </p>
      </div>
    </ToolLayout>
  );
}
