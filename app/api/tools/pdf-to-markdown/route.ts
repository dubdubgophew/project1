import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  void logUsage(req, 'pdf-to-markdown');

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10 MB.' }, { status: 400 });
    }

    // Extract text from PDF using pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      pdfText = parsed.text;
    } catch {
      return NextResponse.json(
        { error: 'Could not read PDF. Please ensure the file is not encrypted or corrupted.' },
        { status: 400 }
      );
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: 'No readable text found in this PDF. It may be image-only or encrypted.' },
        { status: 400 }
      );
    }

    // Truncate to fit in context (LLaMA 3.1 70B has 128K context)
    const maxChars = 80000;
    const truncated = pdfText.length > maxChars
      ? pdfText.slice(0, maxChars) + '\n[... document truncated ...]'
      : pdfText;

    const markdown = await callAI([
      {
        role: 'system',
        content: `You are a document conversion expert. Convert the provided PDF text content to clean, well-structured Markdown.

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
        content: `Convert the following extracted PDF text to clean Markdown (from file: ${file.name}):\n\n${truncated}`,
      },
    ], { temperature: 0.2, maxTokens: 4096 });

    return NextResponse.json({ markdown });
  } catch (err) {
    console.error('PDF to Markdown error:', err);
    return NextResponse.json({ error: 'Failed to convert PDF. Please try again.' }, { status: 500 });
  }
}
