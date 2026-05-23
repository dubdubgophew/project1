import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';

export const maxDuration = 30;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const SYSTEM_PROMPT = `You are an expert diagram generator. Given a description, output a clean JSON array of diagram elements.

Element schema:
{
  "id": string,
  "type": "rect" | "ellipse" | "diamond" | "arrow" | "text" | "sticky",
  "x": number,
  "y": number,
  "w": number,
  "h": number,
  "label": string,
  "stroke": string (hex),
  "fill": string (hex with alpha, e.g. "#3b82f640"),
  "lineWidth": number,
  // arrows only:
  "fromX": number, "fromY": number, "toX": number, "toY": number,
  "seed": number
}

Layout rules:
- Use a 960x600 viewport, center diagrams around (480, 300)
- Rects: 140x55, Ellipses: 120x50, Diamonds: 130x70, Stickies: 130x80
- Space horizontally: 220px gap center-to-center; vertically: 140px gap
- For arrows: fromX/fromY/toX/toY are the line endpoints (connect shape edges)
- Use attractive colors: fills with low opacity (~25-40 hex alpha), vivid strokes
- Color coding: blue (#3b82f6) for processes, violet (#7c3aed) for decisions, emerald (#10b981) for data/storage, amber (#f59e0b) for external systems, rose (#f43f5e) for errors/stops
- Always add descriptive labels
- Generate 4-12 elements for clear diagrams
- Respond ONLY with a valid JSON array, no markdown, no explanation`;

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const raw = await callAI(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Create a clear, well-laid-out diagram for: "${description.trim()}"

Make it informative with proper connections between elements. Use appropriate shapes (diamonds for decisions, cylinders/ellipses for storage, rectangles for processes).`,
        },
      ],
      { model: 'llama-3.3-70b-versatile', maxTokens: 2000, temperature: 0.4 }
    );

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');

    const elements = JSON.parse(match[0]);
    if (!Array.isArray(elements)) throw new Error('Not an array');

    // Ensure unique IDs and seeds
    const enriched = elements.map((el: Record<string, unknown>) => ({
      ...el,
      id: generateId(),
      seed: Math.floor(Math.random() * 100000),
    }));

    return NextResponse.json({ elements: enriched });
  } catch (err) {
    console.error('[aetherboard AI]', err);
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 });
  }
}
