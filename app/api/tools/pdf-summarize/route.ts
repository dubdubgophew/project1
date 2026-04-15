import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Rate limiting
  const limit = await checkRateLimit(req, 'pdf-summarize');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const length = (formData.get('length') as string) || 'medium';

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
    const truncated = pdfText.length > maxChars ? pdfText.slice(0, maxChars) + '\n[... document truncated ...]' : pdfText;

    const lengthInstructions = {
      short: 'Write a SHORT summary: 5-8 bullet points with the most critical information only.',
      medium: 'Write a MEDIUM summary: 2-3 paragraph overview + 10-12 key bullet points.',
      detailed: 'Write a DETAILED summary: comprehensive overview (4-5 paragraphs) + 15-20 key points + important statistics/data.',
    };

    const summary = await callAI([
      {
        role: 'system',
        content: `You are an expert document analyst. ${lengthInstructions[length as keyof typeof lengthInstructions]}

Format your response with:
- A clear opening line about what the document is
- Well-organized bullet points using • symbol
- Bold key terms using **term**
- Highlight any important numbers, dates, or statistics
Be accurate, concise, and informative.`,
      },
      {
        role: 'user',
        content: `Please summarize the following document:\n\n${truncated}`,
      },
    ], { maxTokens: 1500, temperature: 0.3 });

    return NextResponse.json({ summary, remaining: limit.remaining });
  } catch (err) {
    console.error('PDF summarize error:', err);
    return NextResponse.json(
      { error: 'Failed to summarize PDF. Please try again.' },
      { status: 500 }
    );
  }
}
