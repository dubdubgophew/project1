'use client';

import { useState, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, RefreshCw, Shield } from 'lucide-react';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = 'Il1O0o';

function generatePassword(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}): string {
  let charset = '';
  if (opts.upper) charset += UPPERCASE;
  if (opts.lower) charset += LOWERCASE;
  if (opts.numbers) charset += NUMBERS;
  if (opts.symbols) charset += SYMBOLS;
  if (opts.excludeAmbiguous) {
    charset = charset.split('').filter((c) => !AMBIGUOUS.includes(c)).join('');
  }
  if (!charset) charset = LOWERCASE;
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => charset[x % charset.length]).join('');
}

function entropyBits(length: number, charsetSize: number): number {
  return Math.floor(length * Math.log2(charsetSize));
}

function strengthLabel(bits: number): { label: string; color: string; width: string } {
  if (bits < 30) return { label: 'Very Weak', color: 'bg-red-500', width: 'w-[15%]' };
  if (bits < 50) return { label: 'Weak', color: 'bg-orange-500', width: 'w-[35%]' };
  if (bits < 70) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-[55%]' };
  if (bits < 100) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-[75%]' };
  return { label: 'Very Strong', color: 'bg-violet-500', width: 'w-full' };
}

function crackTime(bits: number): string {
  const seconds = Math.pow(2, bits) / 1e10; // assume 10B guesses/sec
  if (seconds < 1) return 'instantly';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hrs`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3.15e9) return `${Math.round(seconds / 31536000)} yrs`;
  return `${(seconds / 3.15e9).toExponential(1)} billion yrs`;
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const charsetSize = (upper ? 26 : 0) + (lower ? 26 : 0) + (numbers ? 10 : 0) + (symbols ? SYMBOLS.length : 0);
  const bits = entropyBits(length, Math.max(charsetSize, 1));
  const strength = strengthLabel(bits);

  const generate = useCallback(() => {
    const opts = { length, upper, lower, numbers, symbols, excludeAmbiguous };
    setPasswords(Array.from({ length: count }, () => generatePassword(opts)));
    setCopiedIdx(null);
  }, [length, upper, lower, numbers, symbols, excludeAmbiguous, count]);

  const handleCopy = (idx: number, pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <ToolLayout
        toolSlug="password-generator"
      title="Password Generator"
      description="Generate cryptographically secure passwords with custom rules. See entropy, strength, and estimated crack time."
      icon="🔑"
      relatedTools={[
        { name: 'Base64 Encoder/Decoder', href: '/tools/base64', icon: '🔐' },
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Text Case Converter', href: '/tools/text-case', icon: '🔤' },
      ]}
      faqs={[
        { q: 'Is this password generator free?', a: 'Yes, 100% free with no account or sign-up required. Generate as many passwords as you need.' },
        { q: 'How is the randomness generated?', a: 'Passwords are built using the Web Crypto API (crypto.getRandomValues), the same cryptographically secure random source used by security software. It is far stronger than Math.random().' },
        { q: 'How strong should my password be?', a: 'For most accounts, aim for at least 70 entropy bits (shown on screen). A 16-character password using uppercase, lowercase, numbers, and symbols typically exceeds 100 bits, which would take billions of years to crack with current hardware.' },
        { q: 'What are common use cases?', a: 'Creating strong passwords for new accounts, generating random API keys or secret tokens, producing passphrases for password managers, and bulk-generating temporary credentials for testing environments.' },
        { q: 'Are generated passwords stored anywhere?', a: 'No. Passwords are generated entirely in your browser and are never transmitted to any server. Close the tab and they are gone.' },
      ]}
    >
      <div className="space-y-6">
        {/* Settings */}
        <div className="card space-y-5">
          {/* Length */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="label mb-0">Length</label>
              <span className="text-violet-600 font-bold">{length}</span>
            </div>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-stone-600 mt-1">
              <span>8</span><span>128</span>
            </div>
          </div>

          {/* Character options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Uppercase (A-Z)', val: upper, set: setUpper },
              { label: 'Lowercase (a-z)', val: lower, set: setLower },
              { label: 'Numbers (0-9)', val: numbers, set: setNumbers },
              { label: 'Symbols (!@#$)', val: symbols, set: setSymbols },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-stone-700">{label}</span>
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="w-4 h-4 accent-violet-500" />
            <span className="text-sm text-stone-700">Exclude ambiguous characters (I, l, 1, O, 0)</span>
          </label>

          {/* Count */}
          <div className="flex items-center gap-3">
            <label className="label mb-0 whitespace-nowrap">Generate</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value))))}
              className="input w-20 text-center"
            />
            <span className="text-sm text-stone-500">passwords at once</span>
          </div>
        </div>

        {/* Strength indicator */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-500" />
              <span className="text-sm text-stone-700 font-medium">Strength: <span className="text-stone-900">{strength.label}</span></span>
            </div>
            <span className="text-xs text-stone-500">{bits} entropy bits · crack time: {crackTime(bits)}</span>
          </div>
          <div className="h-2 bg-stone-50 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
          </div>
        </div>

        {/* Generate button */}
        <button onClick={generate} className="btn-primary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Generate {count} Password{count !== 1 ? 's' : ''}
        </button>

        {/* Password list */}
        {passwords.length > 0 && (
          <div className="space-y-2">
            <label className="label">Generated Passwords</label>
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
                <code className="flex-1 text-sm font-mono text-emerald-300 break-all">{pw}</code>
                <button
                  onClick={() => handleCopy(i, pw)}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-1 px-2.5 shrink-0"
                >
                  {copiedIdx === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedIdx === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
            <button
              onClick={generate}
              className="btn-secondary w-full flex items-center gap-2 justify-center text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate All
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
