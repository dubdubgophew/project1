import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  contractType: z.string().min(2).max(100),
  party1: z.string().min(2).max(200),
  party2: z.string().min(2).max(200),
  scope: z.string().min(10).max(3000),
  payment: z.string().max(500).optional(),
  duration: z.string().max(200).optional(),
  jurisdiction: z.string().max(100).default('India (General)'),
  additionalTerms: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  void logUsage(req, 'contract');

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const contract = await callAI([
      {
        role: 'system',
        content: `You are a professional legal document drafter. Create a comprehensive, well-structured ${data.contractType}.

The contract must include:
1. Header with title, date, and parties
2. Recitals/Background
3. Definitions (key terms)
4. Scope of work/services
5. Payment terms (if applicable)
6. Duration and termination
7. Intellectual property rights
8. Confidentiality clause
9. Warranties and representations
10. Limitation of liability
11. Dispute resolution (${data.jurisdiction})
12. General provisions (force majeure, entire agreement, severability)
13. Signature block for both parties

Use clear, professional legal language. This is governed by the laws of ${data.jurisdiction}.
Format cleanly with proper section numbering and indentation.
Include today's date: ${today}`,
      },
      {
        role: 'user',
        content: `Create a ${data.contractType} with these details:

PARTIES:
- Party 1 (Service Provider/Discloser): ${data.party1}
- Party 2 (Client/Recipient): ${data.party2}

SCOPE: ${data.scope}

PAYMENT TERMS: ${data.payment || 'To be mutually agreed'}
DURATION: ${data.duration || 'As specified in scope'}
JURISDICTION: ${data.jurisdiction}

ADDITIONAL TERMS: ${data.additionalTerms || 'Standard terms apply'}`,
      },
    ], { temperature: 0.2, maxTokens: 3000 });

    return NextResponse.json({ contract });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Contract generator error:', err);
    return NextResponse.json({ error: 'Failed to generate contract. Please try again.' }, { status: 500 });
  }
}
