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
      faqs={[
        {
          q: 'Is the AI Hashtag Generator free?',
          a: 'Yes, completely free. No account or sign-up required. Generate up to 30 hashtags per request as many times as you need.',
        },
        {
          q: 'Which social media platforms are supported?',
          a: 'It generates platform-optimized hashtags for Instagram, Twitter/X, LinkedIn, TikTok, YouTube, Pinterest, and Facebook. Each platform has different hashtag conventions and the AI tailors its output accordingly.',
        },
        {
          q: 'How does this compare to paid tools like Flick or Hashtagify?',
          a: 'Flick and Hashtagify charge $14–$49/month for hashtag research. Our tool is free, AI-powered, and generates a ready-to-use mix of popular, niche, and targeted hashtags in seconds — no subscription needed.',
        },
        {
          q: 'What is the difference between popular, niche, and targeted hashtags?',
          a: 'Popular hashtags have millions of posts and maximize exposure but are competitive. Niche hashtags have smaller, more engaged audiences. Targeted hashtags are specific to your topic or brand. Using a mix of all three is the recommended strategy for best reach.',
        },
        {
          q: 'How many hashtags should I use on Instagram vs other platforms?',
          a: 'Instagram allows up to 30 hashtags — 15–20 is a common sweet spot. Twitter/X works best with 1–2. LinkedIn recommends 3–5. TikTok allows many but 5–10 is typical. The tool generates the right volume per platform by default.',
        },
        {
          q: 'Can I use this for a business or brand account?',
          a: 'Yes. Describe your product, niche, or content topic in detail and the AI will generate a relevant mix including community, industry, and brand-appropriate hashtags to grow your account organically.',
        },
      ]}
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
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
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
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
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
            <h2 className="font-semibold text-stone-900">Your Hashtags</h2>
            <button
              onClick={() => { navigator.clipboard.writeText(result.all.join(' ')); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>

          {/* All hashtags copyable block */}
          <div
            className="card cursor-pointer border-2 border-dashed border-stone-200 hover:border-violet-300 transition-colors"
            onClick={() => { navigator.clipboard.writeText(result.all.join(' ')); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          >
            <p className="text-xs text-stone-400 mb-2">Click to copy all</p>
            <p className="text-violet-700 text-sm leading-loose">{result.all.join(' ')}</p>
          </div>

          {/* Categories */}
          <div className="grid sm:grid-cols-3 gap-4">
            {([
              { label: 'Popular', tags: result.popular, headerClass: 'text-blue-700', tagClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
              { label: 'Niche', tags: result.niche, headerClass: 'text-violet-600', tagClass: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
              { label: 'Targeted', tags: result.branded, headerClass: 'text-emerald-700', tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
            ] as const).map(({ label, tags, headerClass, tagClass }) => (
              <div key={label} className="card">
                <h3 className={`text-xs font-semibold ${headerClass} uppercase tracking-wider mb-3`}>{label}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => { navigator.clipboard.writeText(tag); }}
                      className={`text-xs px-2 py-1 rounded-md border cursor-pointer transition-colors ${tagClass}`}
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
