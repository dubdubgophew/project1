'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, Hash } from 'lucide-react';

const PLATFORMS = ['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'Facebook'];
const COUNTS = ['15 hashtags', '20 hashtags', '30 hashtags'];

const RELATED = [
  { name: 'Bio Writer', href: '/tools/bio-writer', icon: '🪪' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
];

interface HashtagResult {
  popular: string[];
  niche: string[];
  branded: string[];
  all: string[];
}

export default function HashtagGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [count, setCount] = useState('20 hashtags');
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/tools/hashtag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, count: parseInt(count) }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
        toolSlug="hashtag-generator"
      title="AI Hashtag Generator"
      description="Generate perfectly curated hashtags for any topic and platform. Mix of popular, niche, and trending hashtags to maximize reach."
      icon="#️⃣"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Topic / Content Description</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe your post or topic… e.g., 'Morning workout routine for beginners, home gym, fitness motivation'"
            className="textarea min-h-[100px]"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    platform === p
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Number of Hashtags</label>
            <div className="flex gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    count === c
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={!topic.trim() || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating hashtags…</>
          ) : (
            <><Hash className="w-5 h-5" /> Generate Hashtags</>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Copy all */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Your Hashtags</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(result.all.join(' ')); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>

          {/* All hashtags copyable block */}
          <div className="card cursor-pointer" onClick={() => { navigator.clipboard.writeText(result.all.join(' ')); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            <p className="text-violet-300 text-sm leading-loose">{result.all.join(' ')}</p>
          </div>

          {/* Categories */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Popular', tags: result.popular, color: 'blue' },
              { label: 'Niche', tags: result.niche, color: 'violet' },
              { label: 'Targeted', tags: result.branded, color: 'emerald' },
            ].map(({ label, tags, color }) => (
              <div key={label} className="card">
                <h3 className={`text-xs font-semibold text-${color}-400 uppercase tracking-wider mb-3`}>{label}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => { navigator.clipboard.writeText(tag); }}
                      className={`text-xs px-2 py-1 rounded-md bg-${color}-500/10 text-${color}-300 border border-${color}-500/20 cursor-pointer hover:bg-${color}-500/20 transition-colors`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
