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
        model: 'llama3-8b-8192',
        messages,
        max_tokens: maxTokens,
        temperature,
      });
      return fallback.choices[0]?.message?.content ?? '';
    }
    throw error;
  }
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
