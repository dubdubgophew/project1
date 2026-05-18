'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Braces, Minimize2, CheckCircle, XCircle } from 'lucide-react';

export const metadata = undefined; // metadata exported from server components only

function countKeys(obj: unknown): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  if (Array.isArray(obj)) return obj.reduce((acc: number, v) => acc + countKeys(v), 0);
  return Object.keys(obj).length + Object.values(obj).reduce((acc: number, v) => acc + countKeys(v), 0);
}

function maxDepth(obj: unknown, depth = 0): number {
  if (typeof obj !== 'object' || obj === null) return depth;
  const children = Array.isArray(obj) ? obj : Object.values(obj);
  if (children.length === 0) return depth;
  return Math.max(...children.map((v) => maxDepth(v, depth + 1)));
}

function countArrayItems(obj: unknown): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  if (Array.isArray(obj)) return obj.length + obj.reduce((acc: number, v) => acc + countArrayItems(v), 0);
  return Object.values(obj).reduce((acc: number, v) => acc + countArrayItems(v), 0);
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [stats, setStats] = useState<{ keys: number; depth: number; arrays: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setStatus({ type: 'success', message: 'Valid JSON' });
      setStats({
        keys: countKeys(parsed),
        depth: maxDepth(parsed),
        arrays: countArrayItems(parsed),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput('');
      setStatus({ type: 'error', message: msg });
      setStats(null);
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setStatus({ type: 'success', message: 'Valid JSON — minified' });
      setStats({
        keys: countKeys(parsed),
        depth: maxDepth(parsed),
        arrays: countArrayItems(parsed),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput('');
      setStatus({ type: 'error', message: msg });
      setStats(null);
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setStatus({ type: 'success', message: '✅ Valid JSON' });
      setStats({
        keys: countKeys(parsed),
        depth: maxDepth(parsed),
        arrays: countArrayItems(parsed),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ type: 'error', message: `❌ ${msg}` });
      setStats(null);
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format, minify, and validate JSON instantly. See detailed stats, error messages with line numbers, and copy the result."
      icon="{}"
      relatedTools={[
        { name: 'Base64 Encoder/Decoder', href: '/tools/base64', icon: '🔐' },
        { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
        { name: 'Diff Checker', href: '/tools/diff-checker', icon: '↔️' },
      ]}
    >
      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="label">Paste JSON</label>
          <textarea
            className="textarea font-mono text-sm h-64"
            placeholder={'{\n  "name": "John",\n  "age": 30\n}'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleFormat} className="btn-primary flex items-center gap-2">
            <Braces className="w-4 h-4" />
            Format
          </button>
          <button onClick={handleMinify} className="btn-secondary flex items-center gap-2">
            <Minimize2 className="w-4 h-4" />
            Minify
          </button>
          <button onClick={handleValidate} className="btn-secondary flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Validate
          </button>
        </div>

        {/* Validation status */}
        {status.type && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
            {status.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span className="font-mono">{status.message}</span>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center py-3">
              <p className="text-2xl font-bold text-violet-400">{stats.keys}</p>
              <p className="text-xs text-gray-500 mt-1">Total Keys</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-2xl font-bold text-blue-400">{stats.depth}</p>
              <p className="text-xs text-gray-500 mt-1">Max Depth</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-2xl font-bold text-amber-400">{stats.arrays}</p>
              <p className="text-xs text-gray-500 mt-1">Array Items</p>
            </div>
          </div>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Output</label>
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 overflow-x-auto text-sm font-mono text-emerald-300 max-h-96 overflow-y-auto whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
