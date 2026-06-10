'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Youtube } from 'lucide-react';

const RELATED = [
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'Hashtag Generator', href: '/tools/hashtag-generator', icon: '#️⃣' },
];

interface VideoSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  timestamps?: { time: string; topic: string }[];
  duration?: string;
}

export default function YouTubeSummarizerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<VideoSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function isValidYouTubeUrl(url: string) {
    return /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/.test(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/tools/youtube-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong. The video may not have captions enabled.');
      else setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fullText = result
    ? `${result.title}\n\nSUMMARY:\n${result.summary}\n\nKEY POINTS:\n${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : '';

  return (
    <ToolLayout
        toolSlug="youtube-summarizer"
      title="YouTube Video Summarizer"
      description="Paste any YouTube URL and get a complete AI summary with key takeaways and timestamps. Works with regular videos, Shorts, and live recordings. Free, no signup."
      icon="▶️"
      badge="Trending"
      relatedTools={RELATED}
      faqs={[
        { q: 'Is the YouTube summarizer free?', a: 'Yes — completely free. No account, no signup, no credit card required. Paste any public YouTube URL and get a full summary instantly.' },
        { q: 'What YouTube URLs does it support?', a: 'It supports standard watch URLs (youtube.com/watch?v=...), short links (youtu.be/...), YouTube Shorts (youtube.com/shorts/...), and live recordings. The video must be public and have captions enabled.' },
        { q: 'Why does it say "transcript unavailable"?', a: 'The video must have auto-generated or manually uploaded captions. Most videos published in the last few years have auto-captions. Age-restricted, private, or some live streams may not. Try a different video if one fails.' },
        { q: 'How accurate is the AI summary?', a: 'Accuracy depends on transcript quality. For well-captioned English videos, the summary captures the main arguments, key examples, and conclusions accurately. Always verify critical details by checking the original video.' },
        { q: 'Can it summarize non-English videos?', a: 'The tool works best with English transcripts. For other languages, YouTube\'s auto-captions must be available. The AI processes whatever transcript YouTube provides.' },
        { q: 'How does this compare to TubeSummary or Glasp?', a: 'Formly\'s YouTube summarizer is completely free with no daily limits, no login, and no browser extension required. TubeSummary limits free summaries. Just paste a URL and get results immediately.' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">YouTube Video URL</label>
          <div className="relative">
            <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://youtube.com/watch?v=..."
              className="input pl-11"
              required
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Works with regular videos, Shorts, and live recordings — any public video with captions.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={!url.trim() || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Fetching &amp; summarizing video…</>
          ) : (
            <><Youtube className="w-5 h-5" /> Summarize Video</>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-stone-900 mb-1">{result.title}</h2>
                {result.duration && <span className="text-xs text-stone-500">Duration: {result.duration}</span>}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3">Summary</h3>
            <p className="text-stone-700 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Key points */}
          <div className="card">
            <h3 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3">Key Takeaways</h3>
            <ul className="space-y-2.5">
              {result.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-stone-700">
                  <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Timestamps */}
          {result.timestamps && result.timestamps.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3">Topic Timeline</h3>
              <div className="space-y-2">
                {result.timestamps.map((ts, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-violet-600 text-xs bg-violet-50 px-2 py-1 rounded shrink-0">
                      {ts.time}
                    </span>
                    <span className="text-stone-700">{ts.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Free YouTube Video Summarizer</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Stop wasting hours watching long videos. Our AI fetches the transcript and generates
          a comprehensive summary with key points and topic timestamps. Perfect for research,
          learning new skills, or quickly grasping the content of long lectures, tutorials, or talks.
        </p>
      </div>
    </ToolLayout>
  );
}
