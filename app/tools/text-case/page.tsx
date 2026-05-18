'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check } from 'lucide-react';


function toTitleCase(str: string): string {
  const minors = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','up','as','is']);
  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (i === 0 || !minors.has(word)) return word.charAt(0).toUpperCase() + word.slice(1);
      return word;
    })
    .join(' ');
}

function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const TRANSFORMS: { label: string; fn: (s: string) => string; example: string }[] = [
  { label: 'UPPERCASE', fn: s => s.toUpperCase(), example: 'HELLO WORLD' },
  { label: 'lowercase', fn: s => s.toLowerCase(), example: 'hello world' },
  { label: 'Title Case', fn: toTitleCase, example: 'Hello World' },
  { label: 'Sentence case', fn: toSentenceCase, example: 'Hello world. Second sentence.' },
  { label: 'camelCase', fn: toCamelCase, example: 'helloWorld' },
  { label: 'PascalCase', fn: toPascalCase, example: 'HelloWorld' },
  { label: 'snake_case', fn: toSnakeCase, example: 'hello_world' },
  { label: 'kebab-case', fn: toKebabCase, example: 'hello-world' },
  { label: 'Trim Spaces', fn: s => s.replace(/\s+/g, ' ').trim(), example: 'removes extra spaces' },
  { label: 'Remove Line Breaks', fn: s => s.replace(/[\r\n]+/g, ' ').trim(), example: 'single line output' },
];

export default function TextCasePage() {
  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  const handleCopy = useCallback((idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and more — instantly with one click."
      icon="🔤"
      relatedTools={[
        { name: 'Word Counter', href: '/tools/word-counter', icon: '📊' },
        { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
        { name: 'Diff Checker', href: '/tools/diff-checker', icon: '↔️' },
      ]}
    >
      <div className="space-y-5">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Input Text</label>
            <span className="text-xs text-gray-500">{wordCount} words · {charCount} chars</span>
          </div>
          <textarea
            className="textarea min-h-[140px] text-sm"
            placeholder="Type or paste your text here…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>

        {/* Transformation buttons + output */}
        {input.trim() ? (
          <div className="space-y-3">
            {TRANSFORMS.map(({ label, fn }, idx) => {
              const output = fn(input);
              return (
                <div key={label} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">{label}</span>
                    <button
                      onClick={() => handleCopy(idx, output)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIdx === idx ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-200 text-sm break-all leading-relaxed font-mono whitespace-pre-wrap">
                    {output}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRANSFORMS.map(({ label, example }) => (
              <div key={label} className="card py-3 text-center">
                <p className="text-xs font-semibold text-violet-400 mb-1">{label}</p>
                <p className="text-xs text-gray-500 font-mono">{example}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
