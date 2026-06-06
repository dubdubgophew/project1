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
      description="Paste any YouTube URL and get a complete AI summary with key takeaways and timestamps in seconds. Save hours of watching."
      icon="▶️"
      badge="Trending"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">YouTube Video URL</label>
          <div className="relative">
            <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://youtube.com/watch?v=..."
              className="input pl-11"
              required
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Works with any public YouTube video that has auto-generated or manual captions enabled.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
                <h2 className="font-semibold text-white mb-1">{result.title}</h2>
                {result.duration && <span className="text-xs text-gray-500">Duration: {result.duration}</span>}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Summary</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Key points */}
          <div className="card">
            <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Key Takeaways</h3>
            <ul className="space-y-2.5">
              {result.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
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
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Topic Timeline</h3>
              <div className="space-y-2">
                {result.timestamps.map((ts, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-violet-400 text-xs bg-violet-500/10 px-2 py-1 rounded shrink-0">
                      {ts.time}
                    </span>
                    <span className="text-gray-300">{ts.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">Free YouTube Video Summarizer</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Stop wasting hours watching long videos. Our AI fetches the transcript and generates
          a comprehensive summary with key points and topic timestamps. Perfect for research,
          learning new skills, or quickly grasping the content of long lectures, tutorials, or talks.
        </p>
      </div>
    </ToolLayout>
  );
}
