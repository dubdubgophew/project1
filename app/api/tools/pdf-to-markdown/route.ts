import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  text: z.string().min(10).max(50000),
  filename: z.string().max(255).optional(),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'pdf-to-markdown');

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const markdown = await callAI([
      {
        role: 'system',
        content: `You are a document conversion expert. The user has provided a PDF document's extracted text content. Convert it to clean, well-structured Markdown.

Rules:
- Use proper heading hierarchy (# for main title, ## for sections, ### for subsections)
- Convert lists to markdown lists (- or 1.)
- Preserve tables as markdown tables
- Bold important terms and headers
- Keep all content — do not summarize
- Remove page headers/footers/page numbers
- Output ONLY the markdown, no explanation`,
      },
      {
        role: 'user',
        content: `Convert the following extracted PDF text to clean Markdown${data.filename ? ` (from file: ${data.filename})` : ''}:\n\n${data.text}`,
      },
    ], { temperature: 0.2, maxTokens: 4096 });

    return NextResponse.json({ markdown });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('PDF to Markdown error:', err);
    return NextResponse.json({ error: 'Failed to convert PDF. Please try again.' }, { status: 500 });
  }
}
