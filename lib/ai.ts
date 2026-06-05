import Groq from 'groq-sdk';

let _groq: Groq | null = null;

function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  return _groq;
}

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function callAI(
  messages: AIMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const {
    model = 'llama-3.3-70b-versatile',
    maxTokens = 2048,
    temperature = 0.7,
  } = options;

  try {
    const completion = await getGroq().chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });
    return completion.choices[0]?.message?.content ?? '';
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes('rate_limit') || error.message.includes('429'))
    ) {
      const fallback = await getGroq().chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: maxTokens,
        temperature,
      });
      return fallback.choices[0]?.message?.content ?? '';
    }
    throw error;
  }
}

/**
 * Escapes literal control characters (newlines, tabs, etc.) that the model
 * writes inside JSON string values, making them valid for JSON.parse.
 */
export function sanitizeJsonString(s: string): string {
  let result = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const code = s.charCodeAt(i);
    if (escape)              { escape = false; result += ch; continue; }
    if (ch === '\\' && inString) { escape = true; result += ch; continue; }
    if (ch === '"')          { inString = !inString; result += ch; continue; }
    if (inString) {
      if (code === 0x0a)     { result += '\\n'; continue; }
      if (code === 0x0d)     { result += '\\r'; continue; }
      if (code === 0x09)     { result += '\\t'; continue; }
      if (code < 0x20)       { result += `\\u${code.toString(16).padStart(4, '0')}`; continue; }
    }
    result += ch;
  }
  return result;
}

/**
 * Robustly extracts the first complete JSON array of objects from an AI response.
 * Skips any '[' that isn't the start of a real JSON array (e.g. inline brackets
 * in model preamble like "headlines [from Reddit]:"). Falls back through every
 * '[' position until one parses cleanly.
 */
export function extractJsonArray(raw: string): string | null {
  let searchFrom = 0;
  while (searchFrom < raw.length) {
    const start = raw.indexOf('[', searchFrom);
    if (start === -1) return null;

    // Only consider '[' that's followed (after whitespace) by '{' — i.e. an array of objects
    const peek = raw.slice(start + 1).trimStart();
    if (!peek.startsWith('{')) { searchFrom = start + 1; continue; }

    // Walk forward with balanced bracket counting
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let i = start; i < raw.length; i++) {
      const c = raw[i];
      if (escape)            { escape = false; continue; }
      if (c === '\\' && inString) { escape = true; continue; }
      if (c === '"')         { inString = !inString; continue; }
      if (inString)          continue;
      if (c === '[' || c === '{') depth++;
      else if (c === ']' || c === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end === -1) return null; // unclosed array — give up

    const candidate = sanitizeJsonString(raw.slice(start, end + 1));
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return candidate;
    } catch { /* bad bracket match — try next '[' */ }

    searchFrom = start + 1;
  }
  return null;
}

export async function streamAI(
  messages: AIMessage[],
  onChunk: (text: string) => void,
  options: { model?: string; maxTokens?: number } = {}
): Promise<void> {
  const { model = 'llama-3.3-70b-versatile', maxTokens = 2048 } = options;

  const stream = await getGroq().chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? '';
    if (text) onChunk(text);
  }
}
