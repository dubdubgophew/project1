'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check } from 'lucide-react';


const QUICK_PATTERNS = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*', flags: 'gi' },
  { label: 'Phone (US)', pattern: '(\\+?1[\\s.-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}', flags: 'g' },
  { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { label: 'Hashtag', pattern: '#[a-zA-Z]\\w{1,30}', flags: 'g' },
  { label: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
  { label: 'HTML Tag', pattern: '<[^>]+>', flags: 'gi' },
];

type FlagKey = 'g' | 'i' | 'm' | 's';

function buildRegex(pattern: string, flags: Record<FlagKey, boolean>): { regex: RegExp; error: string } | { regex: null; error: string } {
  const flagStr = (Object.keys(flags) as FlagKey[]).filter(f => flags[f]).join('');
  try {
    return { regex: new RegExp(pattern, flagStr), error: '' };
  } catch (e) {
    return { regex: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>({ g: true, i: false, m: false, s: false });
  const [testStr, setTestStr] = useState('');
  const [replacement, setReplacement] = useState('');
  const [mode, setMode] = useState<'match' | 'replace'>('match');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleFlag = (f: FlagKey) => setFlags(prev => ({ ...prev, [f]: !prev[f] }));

  const { regex, error, matches, replaceResult, highlighted } = useMemo(() => {
    if (!pattern) return { regex: null, error: '', matches: [], replaceResult: '', highlighted: null };
    const built = buildRegex(pattern, flags);
    if (!built.regex) return { regex: null, error: built.error, matches: [], replaceResult: '', highlighted: null };
    const regex = built.regex;

    // Reset lastIndex
    regex.lastIndex = 0;

    // Find matches
    const matches: { index: number; match: string; groups: string[] }[] = [];
    if (testStr) {
      let m: RegExpExecArray | null;
      const r = new RegExp(regex.source, regex.flags);
      while ((m = r.exec(testStr)) !== null) {
        matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1).map(g => g ?? 'undefined'),
        });
        if (!flags.g) break;
        if (m[0].length === 0) r.lastIndex++;
      }
    }

    // Replace result
    let replaceResult = '';
    if (mode === 'replace' && testStr) {
      try {
        const r2 = new RegExp(regex.source, regex.flags);
        replaceResult = testStr.replace(r2, replacement);
      } catch {
        replaceResult = '';
      }
    }

    // Highlighted (split into parts)
    let highlighted: { text: string; match: boolean }[] | null = null;
    if (testStr && matches.length > 0) {
      highlighted = [];
      let lastIdx = 0;
      matches.forEach(m => {
        if (m.index > lastIdx) highlighted!.push({ text: testStr.slice(lastIdx, m.index), match: false });
        highlighted!.push({ text: m.match, match: true });
        lastIdx = m.index + m.match.length;
      });
      if (lastIdx < testStr.length) highlighted.push({ text: testStr.slice(lastIdx), match: false });
    }

    return { regex, error: '', matches, replaceResult, highlighted };
  }, [pattern, flags, testStr, replacement, mode]);

  const handleCopy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions live. Highlight matches, inspect groups, use replace mode, and pick from a library of common patterns."
      icon="🔍"
      relatedTools={[
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Diff Checker', href: '/tools/diff-checker', icon: '↔️' },
        { name: 'Text Case Converter', href: '/tools/text-case', icon: '🔤' },
      ]}
    >
      <div className="space-y-5">
        {/* Pattern + flags */}
        <div className="card space-y-3">
          <div>
            <label className="label">Pattern</label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2.5 bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl text-gray-400 font-mono text-sm">/</span>
              <input
                className="input rounded-none flex-1 font-mono"
                placeholder="[a-z]+"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                spellCheck={false}
              />
              <span className="px-3 py-2.5 bg-gray-800 border border-l-0 border-gray-700 rounded-r-xl text-gray-400 font-mono text-sm">
                /{(Object.keys(flags) as FlagKey[]).filter(f => flags[f]).join('')}
              </span>
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5 font-mono">{error}</p>}
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            {(['g', 'i', 'm', 's'] as FlagKey[]).map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags[f]}
                  onChange={() => toggleFlag(f)}
                  className="w-4 h-4 accent-violet-500"
                />
                <span className="text-sm text-gray-300 font-mono">
                  {f} — {f === 'g' ? 'global' : f === 'i' ? 'case insensitive' : f === 'm' ? 'multiline' : 'dot all'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quick patterns */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Patterns</h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_PATTERNS.map(qp => (
              <button
                key={qp.label}
                onClick={() => {
                  setPattern(qp.pattern);
                  const f: Record<FlagKey, boolean> = { g: false, i: false, m: false, s: false };
                  qp.flags.split('').forEach(fl => { if (fl in f) (f as Record<string, boolean>)[fl] = true; });
                  setFlags(f);
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-800 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg border border-gray-700 overflow-hidden text-sm w-fit">
          {(['match', 'replace'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 transition-colors ${mode === m ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {m === 'match' ? 'Match Mode' : 'Replace Mode'}
            </button>
          ))}
        </div>

        {/* Test string */}
        <div>
          <label className="label">Test String</label>
          <textarea
            className="textarea min-h-[130px] font-mono text-sm"
            placeholder="Paste your test string here…"
            value={testStr}
            onChange={e => setTestStr(e.target.value)}
          />
        </div>

        {/* Replace input */}
        {mode === 'replace' && (
          <div>
            <label className="label">Replacement</label>
            <input
              className="input font-mono"
              placeholder="Replacement string (use $1, $2 for groups)"
              value={replacement}
              onChange={e => setReplacement(e.target.value)}
            />
          </div>
        )}

        {/* Results */}
        {pattern && testStr && (
          <>
            {/* Highlighted preview */}
            {mode === 'match' && (
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">
                    Matches: <span className={matches.length > 0 ? 'text-emerald-400' : 'text-red-400'}>{matches.length}</span>
                  </h3>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                  {highlighted ? (
                    highlighted.map((part, i) => (
                      <span
                        key={i}
                        className={part.match ? 'bg-yellow-400/30 text-yellow-200 rounded px-0.5 outline outline-1 outline-yellow-400/50' : 'text-gray-300'}
                      >
                        {part.text}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No matches found</span>
                  )}
                </div>
              </div>
            )}

            {/* Match list */}
            {mode === 'match' && matches.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Match Details</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matches.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 bg-gray-800/50 rounded-lg text-sm">
                      <span className="text-gray-600 w-6 text-right shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <code className="text-yellow-300 font-mono break-all">{m.match}</code>
                        <p className="text-gray-500 text-xs mt-0.5">Index: {m.index}</p>
                        {m.groups.length > 0 && (
                          <p className="text-gray-500 text-xs">Groups: {m.groups.map((g, gi) => `$${gi + 1}="${g}"`).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replace result */}
            {mode === 'replace' && replaceResult !== undefined && (
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">Replace Result</h3>
                  <button
                    onClick={() => handleCopy('replace', replaceResult)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    {copiedKey === 'replace' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-emerald-300 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                  {replaceResult}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
