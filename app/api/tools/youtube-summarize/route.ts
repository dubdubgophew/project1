import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai';
import { z } from 'zod';

export const maxDuration = 60;

const schema = z.object({
  url: z.string().url(),
});

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(req, 'youtube-summarize');
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { url } = schema.parse(body);

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });
    }

    // Fetch transcript using youtube-transcript
    let transcript = '';
    let title = 'YouTube Video';

    try {
      const { YoutubeTranscript } = await import('youtube-transcript');
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      });
      transcript = transcriptData.map((t) => t.text).join(' ');
    } catch {
      return NextResponse.json(
        {
          error:
            'Could not fetch transcript. The video may not have captions enabled, or it may be age-restricted.',
        },
        { status: 400 }
      );
    }

    if (!transcript || transcript.length < 100) {
      return NextResponse.json(
        { error: 'Transcript too short or unavailable.' },
        { status: 400 }
      );
    }

    // Truncate to fit context
    const maxChars = 50000;
    const truncated =
      transcript.length > maxChars ? transcript.slice(0, maxChars) + '...' : transcript;

    const result = await callAI(
      [
        {
          role: 'system',
          content: `You are an expert content analyst. Summarize the YouTube video transcript precisely.

Return ONLY valid JSON in this exact format:
{
  "title": "Inferred video title or topic (max 80 chars)",
  "summary": "2-3 paragraph comprehensive summary covering the main argument, key findings, and conclusion",
  "keyPoints": ["Specific actionable point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7", "Point 8"],
  "timestamps": [
    {"time": "0:00", "topic": "Introduction — what is covered"},
    {"time": "2:30", "topic": "Second major topic or section"}
  ]
}

Rules:
- Summary must cover the ENTIRE video, not just the beginning
- Key points must be specific and actionable — not vague
- Include at least 5 timestamps for videos with multiple sections
- If the video is very short (<5 min), fewer timestamps are OK`,
        },
        {
          role: 'user',
          content: `Video transcript:\n\n${truncated}`,
        },
      ],
      { temperature: 0.3, maxTokens: 2000 }
    );

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      title: parsed.title ?? title,
      summary: parsed.summary ?? '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [],
      remaining: limit.remaining,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('YouTube summarize error:', err);
    return NextResponse.json(
      { error: 'Failed to summarize video. Please try again.' },
      { status: 500 }
    );
  }
}
