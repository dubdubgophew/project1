'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, UserCircle2 } from 'lucide-react';

const PLATFORMS = ['LinkedIn', 'Twitter/X', 'Instagram', 'Personal Website', 'GitHub', 'Tinder/Dating', 'Speaker Bio'];
const TONES = ['Professional', 'Friendly', 'Creative', 'Authoritative', 'Humble'];
const LENGTHS = [
  { id: 'short', label: 'Short', chars: '~150 chars' },
  { id: 'medium', label: 'Medium', chars: '~300 chars' },
  { id: 'long', label: 'Long', chars: '~500 chars' },
];

const RELATED = [
  { name: 'Resume Builder', href: '/tools/resume-builder', icon: '📋' },
  { name: 'Email Writer', href: '/tools/email-writer', icon: '📧' },
  { name: 'Hashtag Generator', href: '/tools/hashtag-generator', icon: '#️⃣' },
];

export default function BioWriterPage() {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [achievements, setAchievements] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/tools/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profession, achievements, platform, tone, length }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setOutput(data.bio);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      title="AI Bio Writer"
      description="Create compelling professional bios for LinkedIn, Twitter, Instagram, and personal websites. Make a powerful first impression."
      icon="🪪"
      relatedTools={RELATED}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Johnson" className="input" required />
          </div>
          <div>
            <label className="label">Profession / Role</label>
            <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="UX Designer & Product Lead" className="input" required />
          </div>
        </div>

        <div>
          <label className="label">Key Achievements, Skills & Personality</label>
          <textarea
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="Include: years of experience, notable achievements, companies worked at, skills, passions, education, what makes you unique…"
            className="textarea min-h-[120px]"
            required
          />
        </div>

        <div>
          <label className="label">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
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

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                    tone === t
                      ? 'bg-violet-600/20 border-violet-500/50 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Length</label>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLength(l.id as typeof length)}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    length === l.id
                      ? 'bg-violet-600/20 border-violet-500/50 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">{l.label}</div>
                  <div className="text-xs text-gray-500">{l.chars}</div>
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

        <button type="submit" disabled={!name || !profession || !achievements || loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Writing your bio…</>
          ) : (
            <><UserCircle2 className="w-5 h-5" /> Generate Bio</>
          )}
        </button>
      </form>

      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white">Your {platform} Bio</h2>
              <p className="text-xs text-gray-500 mt-0.5">{output.length} characters</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-800/50 rounded-xl p-4">
            {output}
          </div>
        </div>
      )}

      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">Free Professional Bio Writer</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Your bio is your first impression. A great bio opens doors to opportunities, clients, and connections.
          Our AI crafts bios optimized for each platform — short and punchy for Twitter, detailed and keyword-rich
          for LinkedIn, creative and engaging for Instagram. Takes 30 seconds, not 30 minutes.
        </p>
      </div>
    </ToolLayout>
  );
}
