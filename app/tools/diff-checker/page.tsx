'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check } from 'lucide-react';


// ─── LCS-based line diff ─────────────────────────────────────────────────────

type DiffLine = { type: 'unchanged' | 'added' | 'removed'; text: string };

function computeDiff(original: string, modified: string): DiffLine[] {
  const aLines = original === '' ? [] : original.split('\n');
  const bLines = modified === '' ? [] : modified.split('\n');
  const m = aLines.length, n = bLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = aLines[i - 1] === bLines[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack
  const result: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      result.push({ type: 'unchanged', text: aLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'added', text: bLines[j - 1] });
      j--;
    } else {
      result.push({ type: 'removed', text: aLines[i - 1] });
      i--;
    }
  }
  return result.reverse();
}

export default function DiffCheckerPage() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const diff = useMemo(() => computeDiff(original, modified), [original, modified]);

  const added = diff.filter(l => l.type === 'added').length;
  const removed = diff.filter(l => l.type === 'removed').length;
  const unchanged = diff.filter(l => l.type === 'unchanged').length;

  const handleCopy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const diffText = diff.map(l => `${l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '} ${l.text}`).join('\n');

  const hasDiff = original || modified;

  return (
    <ToolLayout
        toolSlug="diff-checker"
      title="Diff Checker"
      description="Compare two texts and see exactly what changed — added lines in green, removed lines in red. Uses LCS algorithm for accurate diffing."
      icon="↔️"
      relatedTools={[
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
        { name: 'Text Case Converter', href: '/tools/text-case', icon: '🔤' },
      ]}
    >
      <div className="space-y-5">
        {/* Two text areas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Original</label>
            <textarea
              className="textarea min-h-[220px] font-mono text-sm"
              placeholder="Paste original text here…"
              value={original}
              onChange={e => setOriginal(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Modified</label>
            <textarea
              className="textarea min-h-[220px] font-mono text-sm"
              placeholder="Paste modified text here…"
              value={modified}
              onChange={e => setModified(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        {hasDiff && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center py-3 border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">+{added}</p>
              <p className="text-xs text-gray-500 mt-1">Lines Added</p>
            </div>
            <div className="card text-center py-3 border-red-500/20">
              <p className="text-2xl font-bold text-red-400">-{removed}</p>
              <p className="text-xs text-gray-500 mt-1">Lines Removed</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-2xl font-bold text-gray-400">{unchanged}</p>
              <p className="text-xs text-gray-500 mt-1">Unchanged</p>
            </div>
          </div>
        )}

        {/* Diff output */}
        {hasDiff && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Diff Result</h3>
              <button
                onClick={() => handleCopy('diff', diffText)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                {copiedKey === 'diff' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'diff' ? 'Copied!' : 'Copy Diff'}
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 max-h-[600px] overflow-y-auto">
              {diff.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm font-mono">Both inputs are empty.</p>
              ) : diff.every(l => l.type === 'unchanged') ? (
                <p className="p-4 text-emerald-400 text-sm font-mono">No differences found — texts are identical.</p>
              ) : (
                <table className="w-full text-sm font-mono border-collapse">
                  <tbody>
                    {diff.map((line, i) => (
                      <tr
                        key={i}
                        className={
                          line.type === 'added'
                            ? 'bg-emerald-500/10 border-l-2 border-emerald-500'
                            : line.type === 'removed'
                            ? 'bg-red-500/10 border-l-2 border-red-500'
                            : 'border-l-2 border-transparent'
                        }
                      >
                        <td className="px-2 py-0.5 text-gray-600 select-none text-right w-10 text-xs border-r border-gray-800">
                          {i + 1}
                        </td>
                        <td className="px-2 py-0.5 w-5 text-center select-none">
                          <span className={
                            line.type === 'added' ? 'text-emerald-400' :
                            line.type === 'removed' ? 'text-red-400' :
                            'text-gray-700'
                          }>
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                          </span>
                        </td>
                        <td className={`px-3 py-0.5 whitespace-pre-wrap break-all ${
                          line.type === 'added' ? 'text-emerald-300' :
                          line.type === 'removed' ? 'text-red-300' :
                          'text-gray-400'
                        }`}>
                          {line.text || ' '}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/60" />
                Added lines
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500/60" />
                Removed lines
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-700" />
                Unchanged
              </span>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
