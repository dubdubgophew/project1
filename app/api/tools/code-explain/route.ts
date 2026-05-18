import { NextRequest, NextResponse } from 'next/server';
import { logUsage } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(5).max(10000),
  language: z.string().max(50).default('Auto-detect'),
  mode: z.enum(['explain', 'improve', 'debug', 'document']),
});

const modeSystemPrompts = {
  explain: `You are a senior software engineer explaining code to developers.
Explain the given code clearly:
1. What the code does (overview)
2. How it works (step-by-step walkthrough of key parts)
3. Key concepts used
4. Any important edge cases or assumptions
Use clear, plain English. Format with headers and bullet points.`,

  improve: `You are a code review expert identifying improvements.
Analyze the code and suggest improvements:
1. Performance improvements
2. Code readability & maintainability
3. Best practices not followed
4. Security considerations
5. Provide the improved version if significant changes needed
Be specific with line references and concrete suggestions.`,

  debug: `You are a debugging expert finding issues in code.
Analyze the code for:
1. Potential bugs and errors
2. Edge cases not handled
3. Race conditions or async issues
4. Security vulnerabilities
5. Memory leaks or performance issues
Be specific about what could go wrong and why.`,

  document: `You are a technical writer generating code documentation.
Generate comprehensive documentation:
1. Function/class description
2. Parameters with types and descriptions
3. Return values
4. Usage examples
5. JSDoc/docstring formatted comments ready to paste above the code
Format as proper documentation comments for the detected language.`,
};

export async function POST(req: NextRequest) {
  void logUsage(req, 'code-explain');

  try {
    const body = await req.json();
    const { code, language, mode } = schema.parse(body);

    const detectedLang = language === 'Auto-detect' ? '' : ` (${language})`;

    const result = await callAI([
      {
        role: 'system',
        content: modeSystemPrompts[mode],
      },
      {
        role: 'user',
        content: `Code${detectedLang}:\n\`\`\`\n${code}\n\`\`\``,
      },
    ], { temperature: 0.3, maxTokens: 2000 });

    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Code explain error:', err);
    return NextResponse.json({ error: 'Failed to analyze code. Please try again.' }, { status: 500 });
  }
}
