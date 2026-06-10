'use client';

import { useState, useMemo } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';


const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','was','are','were','be','been','being','have','has','had','do','does','did',
  'will','would','could','should','may','might','shall','can','need','dare','ought',
  'i','you','he','she','it','we','they','me','him','her','us','them','my','your',
  'his','its','our','their','this','that','these','those','which','who','whom',
  'what','when','where','why','how','all','both','each','few','more','most','other',
  'some','such','no','not','only','same','so','than','too','very','s','t','just',
  'as','if','up','out','about','into','through','after','before','between',
]);

function analyze(text: string) {
  const words = text.trim() === '' ? [] : text.trim().split(/\s+/).filter(w => w.length > 0);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) ?? []).length || (text.trim().length > 0 ? 1 : 0);
  const paragraphs = text.trim() === '' ? 0 : text.trim().split(/\n\s*\n+/).filter(p => p.trim()).length;
  const lines = text.trim() === '' ? 0 : text.split('\n').filter(l => l.trim()).length;
  const readingTime = Math.max(1, Math.ceil(words.length / 238));
  const speakingTime = Math.max(1, Math.ceil(words.length / 130));

  // Top words
  const freq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 1 && !STOPWORDS.has(clean)) {
      freq[clean] = (freq[clean] ?? 0) + 1;
    }
  });
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return { words: words.length, chars, charsNoSpaces, sentences, paragraphs, lines, readingTime, speakingTime, topWords };
}

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const stats = useMemo(() => analyze(text), [text]);

  return (
    <ToolLayout
        toolSlug="word-counter"
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs in real time. Get reading/speaking time estimates and top word frequency."
      icon="📊"
      relatedTools={[
        { name: 'Text Case Converter', href: '/tools/text-case', icon: '🔤' },
        { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
        { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
      ]}
      faqs={[
        { q: 'Is this word counter free?', a: 'Yes, completely free with no account or sign-up required. Paste as much text as you like.' },
        { q: 'What does it count?', a: 'Words, characters (with and without spaces), sentences, paragraphs, and non-empty lines. It also estimates reading time (based on 238 wpm average) and speaking time (130 wpm average).' },
        { q: 'How accurate is the word count?', a: 'Words are split on whitespace, which matches how most publishers and word processors count them. Hyphenated words like "well-being" are counted as one word, consistent with Microsoft Word and Google Docs behaviour.' },
        { q: 'What are common use cases?', a: 'Checking essay or article word limits, estimating blog post read time, meeting character limits for social media posts, and analysing keyword frequency in SEO content.' },
        { q: 'Is my text kept private?', a: 'Yes. All counting happens instantly in your browser — your text is never sent to any server.' },
      ]}
    >
      <div className="space-y-5">
        <div>
          <label className="label">Paste or type your text</label>
          <textarea
            className="textarea min-h-[220px] text-sm"
            placeholder="Start typing or paste your text here…"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Words', value: stats.words, color: 'text-violet-600' },
            { label: 'Characters', value: stats.chars, color: 'text-blue-700' },
            { label: 'Chars (no spaces)', value: stats.charsNoSpaces, color: 'text-cyan-400' },
            { label: 'Sentences', value: stats.sentences, color: 'text-emerald-700' },
            { label: 'Paragraphs', value: stats.paragraphs, color: 'text-amber-700' },
            { label: 'Lines', value: stats.lines, color: 'text-orange-400' },
            { label: `Reading time`, value: `${stats.readingTime} min`, color: 'text-pink-400' },
            { label: `Speaking time`, value: `${stats.speakingTime} min`, color: 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-stone-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top words */}
        {stats.topWords.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Top 10 Words (stopwords excluded)</h3>
            <div className="space-y-2">
              {stats.topWords.map(([word, count], i) => {
                const pct = stats.topWords[0][1] > 0 ? (count / stats.topWords[0][1]) * 100 : 0;
                return (
                  <div key={word} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-stone-600 text-right shrink-0">{i + 1}</span>
                    <span className="w-28 text-sm text-stone-700 font-mono truncate">{word}</span>
                    <div className="flex-1 h-2 bg-stone-50 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-stone-500 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
