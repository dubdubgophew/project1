import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const CULTURAL_CTX: Record<string, string> = {
  IN: 'India: family-centered, spiritual, collective wellbeing. Mention yoga/pranayama naturally where fit. Acknowledge joint-family pressures, career expectations from parents, societal comparisons.',
  PK: 'Pakistan: faith-centered (Islam), family-honor culture, strong community bonds. Be sensitive to religious context and gender dynamics.',
  BD: 'Bangladesh: community-focused, resilient, faith matters. Real economic and social pressures are common.',
  JP: 'Japan: harmony, perseverance (gaman), group identity. Avoid direct confrontation framing. Ikigai, wabi-sabi resonate. High work-pressure (karoshi culture is real).',
  KR: 'South Korea: intense achievement pressure (education, career), ppalli-ppalli culture, high social comparison. Acknowledge exhaustion and burnout are very common.',
  PH: 'Philippines: bayanihan community spirit, faith-driven (predominantly Catholic), warm and expressive culture, OFW family separation is a real stressor.',
  ID: 'Indonesia: collective, majority Muslim, gotong royong (mutual cooperation) is core. Community harmony valued over individual expression.',
  MY: 'Malaysia: multicultural (Malay, Chinese, Indian communities), faith matters, community values. High career pressure in urban areas.',
  SG: 'Singapore: high-achieving, multicultural, pragmatic, intense academic/career pressure (kiasu culture). Fast-paced city life stress.',
  US: 'USA: individualistic, solution-focused, direct. CBT and self-help culture familiar. Hustle culture, loneliness epidemic, healthcare anxiety.',
  GB: 'UK: understated, practical, dry. Stiff upper lip culture means feelings are often suppressed. NHS mental health wait times are a real stressor.',
  CA: 'Canada: multicultural, community-oriented, inclusive. Similar to US but with more collective values. Seasonal affective disorder common.',
  AU: 'Australia: direct, practical, outdoors/nature references resonate. Laconic humor OK. FIFO work, isolation, drought stress in rural areas.',
  NZ: 'New Zealand: community, nature, Maori hauora (holistic wellbeing) concept respected. High youth mental health challenges.',
  NG: 'Nigeria: resilient, faith-driven (Christianity/Islam), community-first. Ubuntu values. Acknowledge real economic hardship and family obligation pressures.',
  KE: 'Kenya: community values, faith, ubuntu philosophy, practical resilience. Real economic pressures are common.',
  ZA: 'South Africa: diverse, ubuntu (I am because we are) philosophy, strong community resilience. Crime and inequality are real stressors.',
  EG: 'Egypt: faith-centered (Islam), family honor, community values, generational living. Economic pressures very real.',
  SA: 'Saudi Arabia: faith central (Islam), family honor, gender dynamics, rapid modernization stress. Be respectful of Islamic framework.',
  AE: 'UAE: diverse expat population, high-achieving, multicultural. Loneliness of expat life, work-visa pressure, cultural displacement common.',
  BR: 'Brazil: jogo bonito spirit, warm, expressive, community-oriented. Family (familia) is central. Economic inequality is a real stressor.',
  MX: 'Mexico: familismo (family above all), warmth (carino), resilience, faith matters. Economic pressures and safety concerns are real.',
  DE: 'Germany: structured, direct, work-life balance valued (Feierabend). Efficiency and problem-solving mindset. Acknowledge Ordnungsliebe and perfectionism stress.',
  FR: 'France: philosophical, intellectual pride, joie de vivre values. Work-life balance legally protected. Existential framing appreciated.',
  IE: 'Ireland: warm, community-oriented, wit and storytelling culture. Post-Celtic Tiger economic anxieties. Rural isolation is common.',
};

const CRISIS: Record<string, { name: string; number: string; url: string }> = {
  IN: { name: 'iCall India', number: '9152987821', url: 'https://icallhelpline.org' },
  US: { name: '988 Suicide & Crisis Lifeline', number: '988', url: 'https://988lifeline.org' },
  GB: { name: 'Samaritans UK', number: '116 123', url: 'https://www.samaritans.org' },
  CA: { name: 'Crisis Services Canada', number: '1-833-456-4566', url: 'https://www.crisisservicescanada.ca' },
  AU: { name: 'Lifeline Australia', number: '13 11 14', url: 'https://www.lifeline.org.au' },
  NZ: { name: 'Lifeline NZ', number: '0800 543 354', url: 'https://www.lifeline.org.nz' },
  ZA: { name: 'SADAG South Africa', number: '0800 456 789', url: 'https://www.sadag.org' },
  DEFAULT: { name: 'Find a Helpline (Global)', number: '', url: 'https://findahelpline.com' },
};

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'vibe-check');
  if (!limit.allowed) return NextResponse.json({ error: limit.reason }, { status: 429 });

  const { mood, moodGroup, area, country, context, history } = await req.json();
  if (!mood) return NextResponse.json({ error: 'Mood is required' }, { status: 400 });

  const cultural = CULTURAL_CTX[country ?? ''] ?? 'Use warm, universal language accessible to anyone worldwide.';
  const historyCtx = history?.length > 0
    ? `Recent mood pattern (${history.length} check-ins): ${history.map((h: { date: string; mood: string }) => `${h.date}: ${h.mood}`).join(', ')}. Gently reference patterns if relevant.`
    : 'First check-in — welcome them warmly.';

  const response = await callAI([
    {
      role: 'system',
      content: `You are Vibe — a warm, wise, emotionally intelligent companion. Like the most caring, insightful friend anyone could have, who also deeply understands psychology.

You use CBT, DBT, ACT, and mindfulness — but NEVER sound clinical or robotic. You make people feel genuinely seen.
Cultural context: ${cultural}

SAFETY (non-negotiable):
- Any sign of self-harm, suicidal thoughts, or crisis → safetyFlag=true, respond with warm support
- Never diagnose, never recommend anything harmful/illegal/socially unacceptable
- For repeated difficult moods, gently suggest professional support

Respond ONLY with this exact JSON (no markdown):
{
  "insight": "2-3 warm sentences written specifically for this person. Reference their exact mood and context.",
  "reframe": "One powerful perspective shift. 1-2 sentences. Culturally aware.",
  "action": "One specific micro-action they can do RIGHT NOW in 2-5 minutes. Be concrete.",
  "actionType": "breathing|grounding|movement|journaling|social|cognitive",
  "affirmation": "8 words or less. Authentic, not cheesy.",
  "followUp": "One gentle self-reflection question.",
  "safetyFlag": false
}`,
    },
    {
      role: 'user',
      content: `Feeling: ${mood} (${moodGroup ?? 'unknown'} group)\nArea: ${area ?? 'General'}\nContext: ${context?.trim() || 'Not shared'}\nCountry: ${country ?? 'Not specified'}\n${historyCtx}`,
    },
  ], { temperature: 0.72, maxTokens: 520 });

  const match = response.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ error: 'Could not generate insight. Please try again.' }, { status: 500 });

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(match[0]); }
  catch { return NextResponse.json({ error: 'Response error. Please try again.' }, { status: 500 }); }

  const crisis = CRISIS[country ?? ''] ?? CRISIS.DEFAULT;

  // ── Save to Supabase for logged-in users ──────────────────────────────────
  let savedToAccount = false;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const admin = createAdminClient();
      await admin.from('vibe_checkins').upsert({
        user_id: user.id,
        mood,
        mood_group: moodGroup ?? null,
        area: area ?? null,
        country: country ?? null,
        insight: parsed.insight as string,
        affirmation: parsed.affirmation as string,
        action_type: parsed.actionType as string,
        // upsert on today's date so re-check-ins update the row rather than fail
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,DATE(created_at)', ignoreDuplicates: false });
      savedToAccount = true;
    }
  } catch {
    // Non-fatal — never block the response for a save failure
  }

  return NextResponse.json({ ...parsed, crisis, savedToAccount, remaining: limit.remaining });
}