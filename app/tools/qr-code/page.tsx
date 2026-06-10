'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Download, Upload, RefreshCw, X, Palette, Image as ImageIcon, Zap } from 'lucide-react';
import QRCode from 'qrcode';

type Style = 'classic' | 'rounded' | 'dots' | 'artistic';
type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

const PRESETS = [
  { name: 'Midnight', fg: '#7c3aed', bg: '#0f0f1a', gradient: true, gEnd: '#ec4899' },
  { name: 'Sunset',  fg: '#f97316', bg: '#ffffff', gradient: true, gEnd: '#facc15' },
  { name: 'Forest',  fg: '#16a34a', bg: '#f0fdf4', gradient: false, gEnd: '#16a34a' },
  { name: 'Ocean',   fg: '#0ea5e9', bg: '#f0f9ff', gradient: true,  gEnd: '#6366f1' },
  { name: 'Classic', fg: '#000000', bg: '#ffffff', gradient: false, gEnd: '#000000' },
  { name: 'Neon',    fg: '#a3e635', bg: '#09090b', gradient: false, gEnd: '#a3e635' },
];

function getQRMatrix(text: string, level: ErrorLevel): { data: Uint8Array; size: number } | null {
  try {
    const qr = (QRCode as any).create(text, { errorCorrectionLevel: level });
    return { data: qr.modules.data, size: qr.modules.size };
  } catch {
    return null;
  }
}

function isFinderPattern(row: number, col: number, size: number): boolean {
  const inFinder = (r: number, c: number) =>
    (r < 9 && c < 9) || (r < 9 && c >= size - 8) || (r >= size - 8 && c < 9);
  return inFinder(row, col);
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  style: Style, dark: boolean, finderArea: boolean
) {
  if (!dark) return;
  const pad = style === 'dots' ? size * 0.15 : style === 'rounded' ? size * 0.05 : 0;
  const s = size - pad * 2;
  const cx = x + size / 2;
  const cy = y + size / 2;

  if (style === 'dots' && !finderArea) {
    ctx.beginPath();
    ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'rounded' && !finderArea) {
    const r = s * 0.35;
    ctx.beginPath();
    ctx.moveTo(x + pad + r, y + pad);
    ctx.lineTo(x + pad + s - r, y + pad);
    ctx.quadraticCurveTo(x + pad + s, y + pad, x + pad + s, y + pad + r);
    ctx.lineTo(x + pad + s, y + pad + s - r);
    ctx.quadraticCurveTo(x + pad + s, y + pad + s, x + pad + s - r, y + pad + s);
    ctx.lineTo(x + pad + r, y + pad + s);
    ctx.quadraticCurveTo(x + pad, y + pad + s, x + pad, y + pad + s - r);
    ctx.lineTo(x + pad, y + pad + r);
    ctx.quadraticCurveTo(x + pad, y + pad, x + pad + r, y + pad);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(x + pad, y + pad, s, s);
  }
}

export default function QRCodePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('https://formly.tools');
  const [style, setStyle] = useState<Style>('rounded');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('H');
  const [fgColor, setFgColor] = useState('#7c3aed');
  const [bgColor, setBgColor] = useState('#0f0f1a');
  const [useGradient, setUseGradient] = useState(true);
  const [gradientEnd, setGradientEnd] = useState('#ec4899');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [photoBlend, setPhotoBlend] = useState(0.65);
  const [size] = useState(400);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const inputText = text.trim() || 'https://formly.tools';
    const matrix = getQRMatrix(inputText, errorLevel);
    if (!matrix) { setError('Invalid input'); return; }
    setError('');

    const ctx = canvas.getContext('2d')!;
    const { data, size: qSize } = matrix;
    const moduleSize = size / qSize;
    canvas.width = size;
    canvas.height = size;

    if (style === 'artistic' && photoUrl) {
      // ── Artistic: colored circles drawn over full-quality image ──────────
      // photoBlend repurposed as dot radius factor (0.4→small gaps, 0.9→large dots)
      const img = new window.Image();
      img.onload = () => {
        // 1. Full-color image background — untouched in light areas
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size);

        // 2. Draw dark data modules as colored circles sampled from image
        //    dotR mapped from slider: photoBlend 0.4→r=0.36*m, 0.9→r=0.48*m
        const dotR = moduleSize * (0.36 + (photoBlend - 0.4) * 0.24);
        for (let row = 0; row < qSize; row++) {
          for (let col = 0; col < qSize; col++) {
            if (!data[row * qSize + col] || isFinderPattern(row, col, qSize)) continue;
            const cx = col * moduleSize + moduleSize / 2;
            const cy = row * moduleSize + moduleSize / 2;
            // Sample image pixel at circle center for hue
            const px = Math.min(Math.floor(cx), size - 1);
            const py = Math.min(Math.floor(cy), size - 1);
            const i = (py * size + px) * 4;
            // Darken sampled color to ~12% luminance so dot reads as dark
            const r = Math.floor(imgData.data[i] * 0.12);
            const g = Math.floor(imgData.data[i + 1] * 0.12);
            const b = Math.floor(imgData.data[i + 2] * 0.12);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 3. Styled finder patterns — rounded square borders over image
        const fm = moduleSize;
        const cornerRadius = fm * 0.3;
        for (const [fr, fc] of [[0, 0], [0, qSize - 7], [qSize - 7, 0]] as [number, number][]) {
          const fx = fc * fm;
          const fy = fr * fm;
          // Outer dark rounded square
          ctx.fillStyle = 'rgba(8,8,8,0.96)';
          ctx.beginPath();
          ctx.roundRect(fx, fy, 7 * fm, 7 * fm, cornerRadius * 1.5);
          ctx.fill();
          // White ring
          ctx.fillStyle = 'rgba(255,255,255,0.97)';
          ctx.beginPath();
          ctx.roundRect(fx + fm, fy + fm, 5 * fm, 5 * fm, cornerRadius);
          ctx.fill();
          // Inner dark square
          ctx.fillStyle = 'rgba(8,8,8,0.96)';
          ctx.beginPath();
          ctx.roundRect(fx + 2 * fm, fy + 2 * fm, 3 * fm, 3 * fm, cornerRadius * 0.6);
          ctx.fill();
        }

        drawLogoOverlay(ctx, size);
      };
      img.src = photoUrl;
    } else {
      // ── Classic / Rounded / Dots ─────────────────────────────────────────
      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Foreground colour / gradient
      let fillStyle: string | CanvasGradient = fgColor;
      if (useGradient) {
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, fgColor);
        grad.addColorStop(1, gradientEnd);
        fillStyle = grad;
      }
      ctx.fillStyle = fillStyle;

      for (let row = 0; row < qSize; row++) {
        for (let col = 0; col < qSize; col++) {
          const dark = data[row * qSize + col] === 1;
          const x = col * moduleSize;
          const y = row * moduleSize;
          const finder = isFinderPattern(row, col, qSize);
          drawModule(ctx, x, y, moduleSize, style, dark, finder);
        }
      }
      drawLogoOverlay(ctx, size);
    }
  }, [text, style, errorLevel, fgColor, bgColor, useGradient, gradientEnd, photoUrl, logoUrl, photoBlend, size]);

  function drawLogoOverlay(ctx: CanvasRenderingContext2D, sz: number) {
    const logo = logoImgRef.current;
    if (!logo) return;
    // Cap logo at 18% of canvas — keeps it inside H error correction's 30% capacity
    const lSize = sz * 0.18;
    const lX = (sz - lSize) / 2;
    const lY = (sz - lSize) / 2;
    const pad = 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(lX - pad, lY - pad, lSize + pad * 2, lSize + pad * 2, 10);
    ctx.fill();
    ctx.drawImage(logo, lX, lY, lSize, lSize);
  }

  // Pre-load logo so drawLogoOverlay can draw synchronously
  useEffect(() => {
    if (!logoUrl) { logoImgRef.current = null; return; }
    const img = new window.Image();
    img.onload = () => { logoImgRef.current = img; render(); };
    img.src = logoUrl;
  }, [logoUrl]); // render intentionally excluded — called manually after load

  // Force H error correction when logo is present (logo covers ~20% of QR area)
  useEffect(() => {
    if (logoUrl && errorLevel !== 'H') setErrorLevel('H');
  }, [logoUrl]);

  useEffect(() => { render(); }, [render]);

  function applyPreset(p: typeof PRESETS[0]) {
    setFgColor(p.fg);
    setBgColor(p.bg);
    setUseGradient(p.gradient);
    setGradientEnd(p.gEnd);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setStyle('artistic');
    setErrorLevel('H');
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUrl(URL.createObjectURL(file));
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'formly-qr.png';
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  return (
    <ToolLayout
        toolSlug="qr-code"
      title="QR Code Generator"
      description="Generate beautiful, artistic QR codes — upload your photo to create a QR code that looks like your image."
      icon="⬛"
      badge="Free"
      relatedTools={[
        { name: 'Base64 Encoder', href: '/tools/base64', icon: '🔐' },
        { name: 'Password Generator', href: '/tools/password-generator', icon: '🔑' },
        { name: 'Color Converter', href: '/tools/color-converter', icon: '🎨' },
      ]}
      faqs={[
        { q: 'Is this QR code generator free?', a: 'Yes, completely free with no watermark, no account, and no usage limits. Download as many QR codes as you need.' },
        { q: 'What can I encode in a QR code?', a: 'Any text up to a few thousand characters — URLs, plain text, email addresses, phone numbers, Wi-Fi credentials, vCard contacts, or any other string. URLs are the most common use case.' },
        { q: 'What do the error correction levels mean?', a: 'Error correction lets a QR code be read even if part of it is obscured. L=7%, M=15%, Q=25%, H=30% of the code can be damaged and it will still scan. Use H when adding a logo overlay or printing on uneven surfaces.' },
        { q: 'What are common use cases?', a: 'Linking print materials to websites, sharing Wi-Fi passwords, adding contact details to business cards, directing customers to app store listings, and creating branded QR codes for marketing campaigns.' },
        { q: 'Can I use the generated QR codes commercially?', a: 'Yes. The QR codes are generated locally in your browser using the open-source qrcode library. There are no licensing restrictions on the output images.' },
      ]}
    >
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Controls */}
        <div className="space-y-5">
          {/* Input */}
          <div>
            <label className="label">URL or Text</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={2}
              className="input resize-none font-mono text-sm"
              placeholder="https://your-website.com or any text…"
            />
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          </div>

          {/* Style tabs */}
          <div>
            <label className="label">Style</label>
            <div className="grid grid-cols-4 gap-2">
              {(['classic', 'rounded', 'dots', 'artistic'] as Style[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all capitalize ${
                    style === s
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-700'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {s === 'artistic' ? '🎨 Art' : s === 'dots' ? '⚫ Dots' : s === 'rounded' ? '🔲 Round' : '⬛ Classic'}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload for artistic */}
          <div className={`rounded-2xl border-2 border-dashed transition-all ${
            style === 'artistic' ? 'border-violet-500/40 bg-violet-500/5' : 'border-stone-200 bg-stone-100/30'
          }`}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <ImageIcon className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-sm font-semibold text-stone-900">Artistic Photo QR</p>
                  <p className="text-xs text-stone-500">Upload a photo — your QR code will look like your image</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoUrl && (
                  <button onClick={() => { setPhotoUrl(null); setStyle('rounded'); }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-stone-500 hover:text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {photoUrl && (
                  <img src={photoUrl} className="w-10 h-10 rounded-lg object-cover" alt="preview" />
                )}
              </div>
              {style === 'artistic' && photoUrl && (
                <div className="mt-3">
                  <label className="text-xs text-stone-500 block mb-1">
                    Dot size: {Math.round((0.36 + (photoBlend - 0.4) * 0.24) * 100)}% of cell
                  </label>
                  <input
                    type="range" min="0.4" max="0.9" step="0.05"
                    value={photoBlend}
                    onChange={e => setPhotoBlend(parseFloat(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-stone-600 mt-0.5">
                    <span>Smaller dots</span><span>Larger dots</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colors & Presets (hidden in artistic mode) */}
          {style !== 'artistic' && (
            <>
              <div>
                <label className="label flex items-center gap-2"><Palette className="w-4 h-4" /> Colour Presets</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 hover:border-violet-500/40 transition-colors"
                      style={{ background: p.bg, color: p.fg }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200 bg-transparent" />
                    <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)}
                      className="input py-2 text-sm font-mono flex-1" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200 bg-transparent" />
                    <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)}
                      className="input py-2 text-sm font-mono flex-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setUseGradient(g => !g)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${useGradient ? 'bg-violet-600' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${useGradient ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-stone-700">Gradient</span>
                </label>
                {useGradient && (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 bg-transparent" />
                    <span className="text-xs text-stone-500">End colour</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Logo overlay */}
          <div>
            <label className="label text-xs flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Centre Logo / Icon (optional)
            </label>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            <div className="flex items-center gap-2">
              <button onClick={() => logoRef.current?.click()} className="btn-secondary py-2 px-3 text-xs">
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
              {logoUrl && (
                <>
                  <img src={logoUrl} className="w-8 h-8 rounded object-cover" alt="logo" />
                  <button onClick={() => setLogoUrl(null)} className="p-1 text-stone-500 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error correction */}
          <div>
            <label className="label text-xs">Error Correction (higher = more resilient)</label>
            <div className="flex gap-2">
              {(['L', 'M', 'Q', 'H'] as ErrorLevel[]).map(l => (
                <button key={l} onClick={() => setErrorLevel(l)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    errorLevel === l
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-700'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}>
                  {l} {l === 'L' ? '7%' : l === 'M' ? '15%' : l === 'Q' ? '25%' : '30%'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={render} className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Regenerate
          </button>
        </div>

        {/* Preview + download */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24">
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-2xl shadow-violet-500/10 bg-stone-100 p-3">
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              className="rounded-xl"
              style={{ width: '100%', maxWidth: 360, height: 'auto', display: 'block' }}
            />
          </div>

          <button
            onClick={download}
            className="btn-primary w-full max-w-sm py-3 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {downloaded ? 'Downloaded!' : 'Download PNG'}
          </button>

          <div className="text-xs text-stone-600 text-center max-w-xs">
            {style === 'artistic'
              ? 'Use error correction H for best results with artistic QR codes. Always test scan before printing.'
              : 'Free to use commercially. No watermark.'}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
