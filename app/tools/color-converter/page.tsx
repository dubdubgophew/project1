'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check } from 'lucide-react';


// ─── Color Math ─────────────────────────────────────────────────────────────

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface HSV { h: number; s: number; v: number }
interface CMYK { c: number; m: number; y: number; k: number }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    case bn: h = ((rn - gn) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const hn = h / 360;
  return {
    r: Math.round(hue2rgb(hn + 1/3) * 255),
    g: Math.round(hue2rgb(hn) * 255),
    b: Math.round(hue2rgb(hn - 1/3) * 255),
  };
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

function parseColor(input: string): RGB | null {
  const trimmed = input.trim();
  // HEX
  if (/^#?[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    return hexToRgb(trimmed.startsWith('#') ? trimmed : '#' + trimmed);
  }
  // RGB
  const rgbMatch = trimmed.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1]));
    const g = Math.min(255, parseInt(rgbMatch[2]));
    const b = Math.min(255, parseInt(rgbMatch[3]));
    return { r, g, b };
  }
  // HSL
  const hslMatch = trimmed.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
  if (hslMatch) {
    return hslToRgb({ h: parseInt(hslMatch[1]), s: parseInt(hslMatch[2]), l: parseInt(hslMatch[3]) });
  }
  return null;
}

function lightenRgb(rgb: RGB, factor: number): RGB {
  return {
    r: Math.round(rgb.r + (255 - rgb.r) * factor),
    g: Math.round(rgb.g + (255 - rgb.g) * factor),
    b: Math.round(rgb.b + (255 - rgb.b) * factor),
  };
}

function darkenRgb(rgb: RGB, factor: number): RGB {
  return {
    r: Math.round(rgb.r * (1 - factor)),
    g: Math.round(rgb.g * (1 - factor)),
    b: Math.round(rgb.b * (1 - factor)),
  };
}

function complementary(hsl: HSL): RGB {
  return hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l });
}

function triadic(hsl: HSL): [RGB, RGB] {
  return [
    hslToRgb({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
    hslToRgb({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }),
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

function ColorSwatch({ hex, label, small }: { hex: string; label: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      title={hex}
      className={`group flex flex-col items-center gap-1 ${small ? '' : 'w-full'}`}
    >
      <div
        className={`rounded-lg border border-white/10 group-hover:scale-105 transition-transform ${small ? 'w-10 h-10' : 'w-full h-12'}`}
        style={{ background: hex }}
      />
      {!small && (
        <span className="text-xs text-gray-500 font-mono group-hover:text-gray-300 transition-colors">
          {copied ? 'Copied!' : label}
        </span>
      )}
      {small && copied && <span className="text-xs text-emerald-400">✓</span>}
    </button>
  );
}

export default function ColorConverterPage() {
  const [input, setInput] = useState('#7C3AED');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rgb = useMemo(() => parseColor(input), [input]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb) : null, [rgb]);
  const hsv = useMemo(() => rgb ? rgbToHsv(rgb) : null, [rgb]);
  const cmyk = useMemo(() => rgb ? rgbToCmyk(rgb) : null, [rgb]);
  const hex = useMemo(() => rgb ? rgbToHex(rgb) : null, [rgb]);

  const tints = useMemo(() => rgb ? [0.2, 0.4, 0.6, 0.8, 0.9].map(f => lightenRgb(rgb, f)) : [], [rgb]);
  const shades = useMemo(() => rgb ? [0.2, 0.4, 0.6, 0.8, 0.9].map(f => darkenRgb(rgb, f)) : [], [rgb]);
  const comp = useMemo(() => rgb && hsl ? complementary(hsl) : null, [rgb, hsl]);
  const [tri1, tri2] = useMemo(() => rgb && hsl ? triadic(hsl) : [null, null], [rgb, hsl]);

  const handleCopy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const formats = rgb && hex && hsl && hsv && cmyk ? [
    { key: 'hex', label: 'HEX', value: hex },
    { key: 'rgb', label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'hsl', label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { key: 'hsv', label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    { key: 'cmyk', label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ] : [];

  return (
    <ToolLayout
        toolSlug="color-converter"
      title="Color Converter"
      description="Convert colors between HEX, RGB, HSL, HSV, and CMYK. Generate tints, shades, complementary and triadic colors instantly."
      icon="🎨"
      relatedTools={[
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
        { name: 'Password Generator', href: '/tools/password-generator', icon: '🔑' },
      ]}
    >
      <div className="space-y-5">
        {/* Input + Preview */}
        <div className="card">
          <label className="label">Enter Color (HEX, RGB, or HSL)</label>
          <div className="flex gap-3 items-stretch">
            <input
              className="input flex-1 font-mono"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="#7C3AED or rgb(124,58,237) or hsl(262,84%,58%)"
              spellCheck={false}
            />
            <input
              type="color"
              className="w-12 h-12 rounded-xl border border-gray-700 bg-gray-800 cursor-pointer p-1"
              value={hex ?? '#000000'}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          {!rgb && input && (
            <p className="text-red-400 text-xs mt-2">Could not parse color. Try #RRGGBB, rgb(r,g,b), or hsl(h,s%,l%)</p>
          )}
        </div>

        {rgb && hex && (
          <>
            {/* Large preview */}
            <div
              className="w-full h-32 rounded-2xl border border-white/10 shadow-2xl transition-all"
              style={{ background: hex }}
            />

            {/* Format list */}
            <div className="card space-y-2">
              <h3 className="text-sm font-semibold text-white mb-3">Color Formats</h3>
              {formats.map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs font-semibold text-violet-400 w-10 shrink-0">{label}</span>
                  <span className="flex-1 font-mono text-sm text-gray-200">{value}</span>
                  <button
                    onClick={() => handleCopy(key, value)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shrink-0"
                  >
                    {copiedKey === key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>

            {/* Tints */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Tints (lighter)</h3>
              <div className="flex gap-2">
                {[rgb, ...tints].map((c, i) => (
                  <ColorSwatch key={i} hex={rgbToHex(c)} label={rgbToHex(c)} />
                ))}
              </div>
            </div>

            {/* Shades */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Shades (darker)</h3>
              <div className="flex gap-2">
                {[rgb, ...shades].map((c, i) => (
                  <ColorSwatch key={i} hex={rgbToHex(c)} label={rgbToHex(c)} />
                ))}
              </div>
            </div>

            {/* Harmonies */}
            {comp && tri1 && tri2 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Color Harmonies</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Complementary</p>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-lg border border-white/10" style={{ background: hex }} />
                        <span className="text-xs text-gray-500 font-mono">{hex}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-lg border border-white/10" style={{ background: rgbToHex(comp) }} />
                        <span className="text-xs text-gray-500 font-mono">{rgbToHex(comp)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Triadic</p>
                    <div className="flex gap-3">
                      {[rgb, tri1, tri2].map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-lg border border-white/10" style={{ background: rgbToHex(c) }} />
                          <span className="text-xs text-gray-500 font-mono">{rgbToHex(c)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
