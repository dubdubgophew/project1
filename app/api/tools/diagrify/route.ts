import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';

export const maxDuration = 30;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const SYSTEM_PROMPT = `You are an expert diagram generator. Generate a clean, well-structured diagram as a JSON array.

Element schema:
{
  "id": string,
  "type": "rect" | "ellipse" | "diamond" | "arrow",
  "x": number, "y": number, "w": number, "h": number,
  "label": string (2-4 words max),
  "stroke": string (hex),
  "fill": string (hex with alpha, e.g. "#3b82f640"),
  "lineWidth": 2,
  "seed": 1,
  // arrows ONLY — do NOT include for shapes:
  "fromX": number, "fromY": number, "toX": number, "toY": number
}

LAYOUT RULES (follow exactly):
- Viewport: 960x540
- LEFT-TO-RIGHT flow (use for most processes): first node at x=80,y=240; each next node x+=220
- TOP-TO-BOTTOM flow (use for hierarchies/trees): first node at x=430,y=60; each next node y+=150
- Shape sizes: rect=150×60, ellipse=130×55, diamond=140×80
- For decision branches: main path continues right/down; branch goes 140px perpendicular

ARROW RULES (critical — all shapes must connect):
- Left-to-right arrow: fromX=shape.x+150, fromY=shape.y+30, toX=nextShape.x, toY=nextShape.y+30
- Top-to-bottom arrow: fromX=shape.x+75, fromY=shape.y+60, toX=nextShape.x+75, toY=nextShape.y
- Diamond to branch: from diamond edge to the branching node
- EVERY non-terminal shape must have at least one outgoing arrow — no orphan shapes

COLOR CODING:
- Start/End oval: stroke="#10b981" fill="#ecfdf5"
- Process rect: stroke="#3b82f6" fill="#eff6ff"
- Decision diamond: stroke="#f59e0b" fill="#fffbeb"
- Database/Storage ellipse: stroke="#8b5cf6" fill="#f5f3ff"
- Error/Stop: stroke="#ef4444" fill="#fef2f2"

RULES:
- 5-10 elements total (shapes + arrows combined)
- Keep ALL labels short: 2-4 words maximum
- Simple linear flows → left-to-right; branching/hierarchical → top-to-bottom
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
          content: `Create a clean, connected diagram for: "${description.trim()}"

Choose layout direction first:
- For linear processes (A→B→C→D): LEFT-TO-RIGHT starting at x=80,y=240, increment x by 230 each step
- For branching flows (with decisions): TOP-TO-BOTTOM starting at x=480,y=60, increment y by 150

Example LEFT-TO-RIGHT coordinates for 4 shapes + 3 arrows:
Shape 1: x=80,  y=210, w=150, h=60  → arrow fromX=230, fromY=240, toX=310, toY=240
Shape 2: x=310, y=210, w=150, h=60  → arrow fromX=460, fromY=240, toX=540, toY=240
Shape 3: x=540, y=205, w=140, h=70  → arrow fromX=680, fromY=240, toX=710, toY=240
Shape 4: x=710, y=210, w=150, h=60

Rules: NEVER let shapes overlap (ensure x2 > x1+w1+20), use exactly the right coordinates, short labels only.
Output valid JSON array only.`,
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
    console.error('[diagrify AI]', err);
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 });
  }
}
