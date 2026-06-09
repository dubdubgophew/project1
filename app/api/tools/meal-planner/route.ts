import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI, sanitizeJsonString } from '@/lib/ai';
import { z } from 'zod';

export const maxDuration = 60;

const schema = z.object({
  diet: z.string().max(40).default('Anything'),
  calories: z.number().int().min(1000).max(5000).default(2000),
  mealsPerDay: z.number().int().min(2).max(4).default(3),
  dislikes: z.string().max(500).optional().default(''),
  cuisine: z.string().max(60).optional().default(''),
  budget: z.enum(['budget', 'moderate', 'premium']).default('moderate'),
});

interface MealPlan {
  days: { day: string; meals: { meal: string; name: string; description: string; calories: number; protein_g: number }[] }[];
  grocery_list: { category: string; items: string[] }[];
  tips: string[];
}

/** Extracts the first balanced JSON object from a model response. */
function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return raw.slice(start, i + 1); }
  }
  return null;
}

export async function POST(req: NextRequest) {
  void logUsage(req, 'meal-planner');

  try {
    const body = await req.json();
    const { diet, calories, mealsPerDay, dislikes, cuisine, budget } = schema.parse(body);

    const mealNames = mealsPerDay === 2 ? 'Lunch, Dinner'
      : mealsPerDay === 3 ? 'Breakfast, Lunch, Dinner'
      : 'Breakfast, Lunch, Snack, Dinner';

    const prompt = `Create a 7-day meal plan.

Requirements:
- Diet: ${diet}
- Daily calorie target: ~${calories} kcal (split sensibly across meals)
- ${mealsPerDay} meals per day: ${mealNames}
- Budget level: ${budget}
${cuisine ? `- Cuisine preference: ${cuisine}` : ''}
${dislikes ? `- MUST AVOID (allergies/dislikes): ${dislikes}` : ''}
- Realistic, popular dishes a busy person can cook in under 40 minutes (breakfast under 15)
- Reuse ingredients across the week to minimize waste and shopping cost
- Vary dishes — no meal repeated more than twice in the week

Respond ONLY with a valid JSON object, no markdown:
{
  "days": [
    { "day": "Monday", "meals": [ { "meal": "Breakfast", "name": "dish name", "description": "one appetizing sentence, max 18 words", "calories": 450, "protein_g": 25 } ] }
  ],
  "grocery_list": [ { "category": "Produce", "items": ["2 onions", "1 bag spinach"] } ],
  "tips": ["3 short meal-prep tips, max 15 words each"]
}
Include all 7 days (Monday-Sunday), ${mealsPerDay} meals each. Grocery list categories: Produce, Protein, Grains & Pantry, Dairy, Other — with realistic quantities for one person for the week.`;

    const raw = await callAI(
      [
        { role: 'system', content: 'You are a professional nutritionist and meal-prep chef. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 5500, temperature: 0.6, skipCache: true }
    );

    const jsonStr = extractJsonObject(raw);
    if (!jsonStr) throw new Error('No JSON in AI response');
    const plan = JSON.parse(sanitizeJsonString(jsonStr)) as MealPlan;
    if (!Array.isArray(plan.days) || plan.days.length === 0) throw new Error('Malformed plan');

    return NextResponse.json({ plan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Meal planner error:', err);
    return NextResponse.json({ error: 'Failed to generate meal plan. Please try again.' }, { status: 500 });
  }
}
