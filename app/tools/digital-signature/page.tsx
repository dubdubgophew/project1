'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import {
  Download,
  Upload,
  RefreshCw,
  X,
  Type,
  PenLine,
  Shield,
  Check,
  Trash2,
  FileText,
  Save,
  Undo2,
  Calendar,
} from 'lucide-react';

/* ─────────────────────────── Constants ──────────────────────────── */

const FONTS = [
  { name: 'Signature',   css: '"Dancing Script", cursive',   google: 'Dancing+Script:wght@700' },
  { name: 'Classic',     css: '"Pacifico", cursive',         google: 'Pacifico' },
  { name: 'Elegant',     css: '"Pinyon Script", cursive',    google: 'Pinyon+Script' },
  { name: 'Bold Script', css: '"Permanent Marker", cursive', google: 'Permanent+Marker' },
  { name: 'Calligraphy', css: '"Satisfy", cursive',          google: 'Satisfy' },
  { name: 'Handwriting', css: '"Caveat", cursive',           google: 'Caveat:wght@700' },
];

const COLORS = [
  { name: 'Ink Black', hex: '#0a0a0a' },
  { name: 'Navy',      hex: '#1e3a5f' },
  { name: 'Violet',    hex: '#5b21b6' },
  { name: 'Forest',    hex: '#14532d' },
  { name: 'Crimson',   hex: '#9b1c1c' },
  { name: 'Midnight',  hex: '#312e81' },
];

/* ─────────────────────────── Helpers ────────────────────────────── */

function getCanvasPos(
  canvas: HTMLCanvasElement,
  e: React.PointerEvent,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (600 / rect.width),
    y: (e.clientY - rect.top) * (200 / rect.height),
  };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .join('.');
}

/* ─────────────────────────── Component ──────────────────────────── */

export default function DigitalSignaturePage() {
  /* State */
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [color, setColor] = useState('#0a0a0a');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [typeText, setTypeText] = useState('');
  const [selectedFont, setSelectedFont] = useState(0);
  const [includeDate, setIncludeDate] = useState(false);
  const [uploadedSig, setUploadedSig] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [savedSigs, setSavedSigs] = useState<{ id: string; dataUrl: string; label: string }[]>([]);
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [sigPos, setSigPos] = useState<{ x: number; y: number } | null>(null);
  const [sigScale, setSigScale] = useState(25);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredSig, setHoveredSig] = useState<string | null>(null);
  const [certId] = useState(() =>
    Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase(),
  );

  /* Refs */
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const typeCanvasRef    = useRef<HTMLCanvasElement>(null);
  const initialsCanvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef        = useRef<HTMLInputElement>(null);
  const docUploadRef     = useRef<HTMLInputElement>(null);
  const docContainerRef  = useRef<HTMLDivElement>(null);
  const pointsRef        = useRef<{ x: number; y: number }[]>([]);

  /* ── Load Google Fonts once ── */
  useEffect(() => {
    const families = FONTS.map(f => f.google).join('&family=');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  /* ── Load saved signatures from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('formly_signatures');
      if (raw) setSavedSigs(JSON.parse(raw));
    } catch {}
  }, []);

  /* ── Initialize draw canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 600, 200);
  }, []);

  /* ── Type canvas rendering ── */
  useEffect(() => {
    if (mode !== 'type') return;
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const fontCss = FONTS[selectedFont].css;

    const render = () => {
      ctx.clearRect(0, 0, 600, 200);
      if (!typeText) return;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold 72px ${fontCss}`;
      ctx.fillText(typeText, 300, includeDate ? 85 : 100);
      if (includeDate) {
        ctx.font = `16px ${fontCss}`;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.fillText(new Date().toLocaleDateString(), 300, 160);
        ctx.globalAlpha = 1;
      }
    };

    document.fonts.load(`bold 80px ${fontCss}`).then(render).catch(render);
  }, [mode, typeText, selectedFont, color, includeDate]);

  /* ── getCurrentSig ── */
  const getCurrentSig = useCallback((): string | null => {
    if (mode === 'draw') {
      if (!hasDrawing) return null;
      return canvasRef.current!.toDataURL();
    }
    if (mode === 'type') {
      if (!typeText) return null;
      return typeCanvasRef.current?.toDataURL() ?? null;
    }
    return uploadedSig;
  }, [mode, hasDrawing, typeText, uploadedSig]);

  /* ── Draw events ── */
  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Save snapshot for undo
    setHistory(prev => [...prev.slice(-9), canvas.toDataURL()]);

    const pos = getCanvasPos(canvas, e);
    pointsRef.current = [pos];

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
  }

  function doDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const pos = getCanvasPos(canvas, e);
    pointsRef.current.push(pos);
    const pts = pointsRef.current;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length >= 3) {
      const prev = pts[pts.length - 3];
      const mid1 = pts[pts.length - 2];
      const mid2 = { x: (mid1.x + pos.x) / 2, y: (mid1.y + pos.y) / 2 };
      ctx.beginPath();
      ctx.moveTo((prev.x + mid1.x) / 2, (prev.y + mid1.y) / 2);
      ctx.quadraticCurveTo(mid1.x, mid1.y, mid2.x, mid2.y);
      ctx.stroke();
    } else if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    setHasDrawing(true);
  }

  function endDraw() {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.closePath();
    setIsDrawing(false);
  }

  function undoDraw() {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 600, 200);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prev;
    if (history.length <= 1) setHasDrawing(false);
  }

  function clearDraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 600, 200);
    setHasDrawing(false);
    setHistory([]);
    pointsRef.current = [];
  }

  /* ── Upload sig handler ── */
  function handleSigUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadedSig(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  /* ── Download PNG ── */
  function downloadSig() {
    const sig = getCurrentSig();
    if (!sig) return;
    const a = document.createElement('a');
    a.href = sig;
    a.download = `signature-${Date.now()}.png`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  /* ── Save to localStorage ── */
  function saveSig() {
    const sig = getCurrentSig();
    if (!sig) return;
    const entry = {
      id: crypto.randomUUID(),
      dataUrl: sig,
      label: signerName || new Date().toLocaleDateString(),
    };
    setSavedSigs(prev => {
      const next = [entry, ...prev].slice(0, 6);
      try { localStorage.setItem('formly_signatures', JSON.stringify(next)); } catch {}
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  /* ── Delete saved sig ── */
  function deleteSig(id: string) {
    setSavedSigs(prev => {
      const next = prev.filter(s => s.id !== id);
      try { localStorage.setItem('formly_signatures', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  /* ── Load saved sig ── */
  function loadSavedSig(sig: { dataUrl: string }) {
    setUploadedSig(sig.dataUrl);
    setMode('upload');
  }

  /* ── Doc placement click ── */
  function handleDocClick(e: React.MouseEvent<HTMLDivElement>) {
    const container = docContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setSigPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  /* ── Doc upload handler ── */
  function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      setDocImage(ev.target?.result as string);
      setSigPos(null);
    };
    reader.readAsDataURL(file);
  }

  /* ── Download signed document ── */
  function downloadSignedDoc() {
    const sig = getCurrentSig();
    if (!docImage || !sig || !sigPos) return;

    const docImg = new Image();
    docImg.src = docImage;
    docImg.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = docImg.width;
      offscreen.height = docImg.height;
      const ctx = offscreen.getContext('2d')!;
      ctx.drawImage(docImg, 0, 0);

      const sigImg = new Image();
      sigImg.src = sig;
      sigImg.onload = () => {
        const sigW = (sigScale / 100) * docImg.width;
        const sigH = (sigImg.height / sigImg.width) * sigW;
        const sx = (sigPos.x / 100) * docImg.width - sigW / 2;
        const sy = (sigPos.y / 100) * docImg.height - sigH / 2;
        ctx.drawImage(sigImg, sx, sy, sigW, sigH);

        const a = document.createElement('a');
        a.href = offscreen.toDataURL('image/png');
        a.download = `signed-document-${Date.now()}.png`;
        a.click();
      };
    };
  }

  /* ── Initials canvas renderer ── */
  const renderInitials = useCallback(
    (fontIndex: number): Promise<string> => {
      return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 140;
        const ctx = canvas.getContext('2d')!;
        const initials = getInitials(signerName) || 'A.B.';
        const fontCss = FONTS[fontIndex].css;

        const render = () => {
          ctx.clearRect(0, 0, 400, 140);
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold 72px ${fontCss}`;
          ctx.fillText(initials, 200, 70);
          resolve(canvas.toDataURL());
        };

        document.fonts.load(`bold 72px ${fontCss}`).then(render).catch(render);
      });
    },
    [signerName, color],
  );

  function downloadInitials() {
    renderInitials(selectedFont).then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `initials-${Date.now()}.png`;
      a.click();
    });
  }

  /* ── Certificate text ── */
  const certText = [
    '=== DIGITAL SIGNATURE CERTIFICATE ===',
    '',
    `Signer Name : ${signerName || '(not provided)'}`,
    `Date & Time : ${new Date().toISOString()}`,
    `Certificate : ${certId}`,
    `Tool URL    : https://formly.tools/tools/digital-signature`,
    '',
    'This certificate confirms a signature was created using',
    'Formly Digital Signature Creator (client-side, no data transmitted).',
    '=====================================',
  ].join('\n');

  function copyCert() {
    navigator.clipboard.writeText(certText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadCert() {
    const blob = new Blob([certText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `signature-certificate-${certId}.txt`;
    a.click();
  }

  /* ── Sig exists? ── */
  const sigExists =
    (mode === 'draw' && hasDrawing) ||
    (mode === 'type' && typeText.length > 0) ||
    (mode === 'upload' && !!uploadedSig);

  /* ─────────────────────────── Render ──────────────────────────── */

  return (
    <ToolLayout
      title="Digital Signature Creator"
      description="Create a professional digital signature by drawing, typing, or uploading — then place it on any document. 100% free, no account needed, no data sent anywhere."
      icon="✍️"
      badge="Free"
      relatedTools={[
        { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
        { name: 'PDF Summarizer',     href: '/tools/pdf-summarizer',     icon: '📄' },
        { name: 'Resume Builder',     href: '/tools/resume-builder',     icon: '📋' },
      ]}
      rateLimited={false}
    >
      <div className="space-y-6">

        {/* ── 1. Signer Name ── */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Signer Name <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={signerName}
            onChange={e => setSignerName(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="input-field w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for certificate, saved signature labels, and initials generator.
          </p>
        </div>

        {/* ── 2. Main Signature Creation Card ── */}
        <div className="card">
          {/* Tab bar */}
          <div className="flex gap-1 mb-6 bg-gray-800/60 rounded-xl p-1">
            {([
              { id: 'draw',   label: 'Draw',   icon: <PenLine  className="w-4 h-4" /> },
              { id: 'type',   label: 'Type',   icon: <Type     className="w-4 h-4" /> },
              { id: 'upload', label: 'Upload', icon: <Upload   className="w-4 h-4" /> },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === tab.id
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── DRAW MODE ── */}
          {mode === 'draw' && (
            <div className="space-y-4">
              {/* Canvas */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="block w-full touch-none cursor-crosshair"
                  style={{ height: 'auto', maxHeight: 200 }}
                  onPointerDown={startDraw}
                  onPointerMove={doDraw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                />
              </div>
              {!hasDrawing && (
                <p className="text-center text-gray-500 text-sm -mt-2">
                  Draw your signature above
                </p>
              )}

              {/* Color picker */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Ink Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => setColor(c.hex)}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        background: c.hex,
                        borderColor: color === c.hex ? '#a78bfa' : 'transparent',
                        transform: color === c.hex ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: color === c.hex ? '0 0 0 2px #4c1d95' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke width */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Stroke Width: {strokeWidth}px
                </p>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={strokeWidth}
                  onChange={e => setStrokeWidth(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              {/* Undo + Clear */}
              <div className="flex gap-3">
                <button
                  onClick={undoDraw}
                  disabled={history.length === 0}
                  className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-40"
                >
                  <Undo2 className="w-4 h-4" />
                  Undo
                </button>
                <button
                  onClick={clearDraw}
                  disabled={!hasDrawing}
                  className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* ── TYPE MODE ── */}
          {mode === 'type' && (
            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">
                  Type your signature
                </label>
                <input
                  type="text"
                  value={typeText}
                  onChange={e => setTypeText(e.target.value)}
                  placeholder="Your name…"
                  className="input-field w-full"
                />
              </div>

              {/* Font previews */}
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">Choose a font</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FONTS.map((font, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFont(i)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        selectedFont === i
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-gray-700 hover:border-gray-500 bg-gray-800/40'
                      }`}
                    >
                      <p className="text-xs text-gray-500 mb-1">{font.name}</p>
                      <div
                        className="bg-white rounded-lg px-2 py-1 text-center overflow-hidden"
                        style={{ minHeight: 40 }}
                      >
                        <span
                          style={{
                            fontFamily: font.css,
                            fontSize: 22,
                            color: color,
                            lineHeight: 1.4,
                          }}
                        >
                          {typeText || 'Sign'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Ink Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => setColor(c.hex)}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        background: c.hex,
                        borderColor: color === c.hex ? '#a78bfa' : 'transparent',
                        transform: color === c.hex ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: color === c.hex ? '0 0 0 2px #4c1d95' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Include date */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setIncludeDate(v => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${includeDate ? 'bg-violet-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${includeDate ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Include date
                </span>
              </label>

              {/* Type canvas preview */}
              <div className="relative">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <canvas
                    ref={typeCanvasRef}
                    width={600}
                    height={200}
                    className="block w-full"
                    style={{ height: 'auto', maxHeight: 200 }}
                  />
                </div>
                {!typeText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-sm">Signature preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── UPLOAD MODE ── */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <input
                ref={uploadRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleSigUpload}
              />
              {uploadedSig ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-center">
                    <img
                      src={uploadedSig}
                      alt="Uploaded signature"
                      className="max-w-full max-h-48 object-contain"
                    />
                  </div>
                  <button
                    onClick={() => uploadRef.current?.click()}
                    className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Replace Signature
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => uploadRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-600 hover:border-violet-500 rounded-xl p-10 text-center transition-colors group"
                >
                  <Upload className="w-8 h-8 text-gray-500 group-hover:text-violet-400 mx-auto mb-3 transition-colors" />
                  <p className="text-gray-400 group-hover:text-gray-300 font-medium transition-colors">
                    Click to upload signature
                  </p>
                  <p className="text-xs text-gray-600 mt-1">PNG or JPG</p>
                </button>
              )}
            </div>
          )}

          {/* ── Action Buttons ── */}
          {sigExists && (
            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-800">
              <button
                onClick={downloadSig}
                className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
              >
                {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {downloaded ? 'Downloaded!' : 'Download PNG'}
              </button>
              <button
                onClick={saveSig}
                className="btn-secondary flex items-center gap-2 py-2.5 px-5 text-sm"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Signature'}
              </button>
            </div>
          )}
        </div>

        {/* ── 3. Saved Signatures ── */}
        {savedSigs.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">Saved Signatures</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {savedSigs.map(sig => (
                <div
                  key={sig.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredSig(sig.id)}
                  onMouseLeave={() => setHoveredSig(null)}
                  onClick={() => loadSavedSig(sig)}
                >
                  <div className="bg-white rounded-xl p-3 border-2 border-gray-700 hover:border-violet-500 transition-colors">
                    <img
                      src={sig.dataUrl}
                      alt={sig.label}
                      className="w-full max-h-16 object-contain"
                    />
                    <p className="text-xs text-gray-500 text-center mt-2 truncate">{sig.label}</p>
                  </div>
                  {hoveredSig === sig.id && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteSig(sig.id); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Click a saved signature to load it. Stored locally in your browser.
            </p>
          </div>
        )}

        {/* ── 4. Place on Document ── */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            Place on Document
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload a document image, then click where you want to place your signature.
          </p>

          <input
            ref={docUploadRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleDocUpload}
          />

          {!docImage ? (
            <button
              onClick={() => docUploadRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-600 hover:border-violet-500 rounded-xl p-10 text-center transition-colors group"
            >
              <Upload className="w-8 h-8 text-gray-500 group-hover:text-violet-400 mx-auto mb-3 transition-colors" />
              <p className="text-gray-400 group-hover:text-gray-300 font-medium transition-colors">
                Upload a document image
              </p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, or WEBP</p>
            </button>
          ) : (
            <div className="space-y-4">
              {/* Document with sig overlay */}
              <div
                ref={docContainerRef}
                onClick={handleDocClick}
                className="relative cursor-crosshair rounded-xl overflow-hidden border border-gray-700 select-none"
                style={{ userSelect: 'none' }}
              >
                <img
                  src={docImage}
                  alt="Document"
                  className="w-full block"
                  draggable={false}
                />
                {sigPos && sigExists && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${sigPos.x}%`,
                      top: `${sigPos.y}%`,
                      width: `${sigScale}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <img
                      src={getCurrentSig()!}
                      alt="Signature"
                      className="w-full"
                      draggable={false}
                    />
                  </div>
                )}
                {!sigPos && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
                      Click to place signature
                    </p>
                  </div>
                )}
              </div>

              {sigPos && (
                <p className="text-xs text-gray-500 text-center">
                  Re-click anywhere on the document to move the signature.
                </p>
              )}

              {/* Sig size slider */}
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Signature size: {sigScale}% of document width
                </label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={sigScale}
                  onChange={e => setSigScale(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadSignedDoc}
                  disabled={!sigPos || !sigExists}
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  Download Signed Document
                </button>
                <button
                  onClick={() => setSigPos(null)}
                  disabled={!sigPos}
                  className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                  Clear Placement
                </button>
                <button
                  onClick={() => { setDocImage(null); setDocName(''); setSigPos(null); }}
                  className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Replace Document
                </button>
              </div>

              {docName && (
                <p className="text-xs text-gray-600">Document: {docName}</p>
              )}
            </div>
          )}
        </div>

        {/* ── 5. Initials Generator ── */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Type className="w-5 h-5 text-violet-400" />
            Initials Generator
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Auto-generated from your signer name.
            {!signerName && ' Enter a name above to generate initials.'}
          </p>

          {signerName ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Initials: <span className="text-white font-semibold">{getInitials(signerName)}</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FONTS.map((font, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                      selectedFont === i
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedFont(i)}
                  >
                    <p className="text-xs text-gray-500 mb-1">{font.name}</p>
                    <div className="bg-white rounded-lg px-2 py-1 text-center">
                      <span
                        style={{
                          fontFamily: font.css,
                          fontSize: 24,
                          color: color,
                          lineHeight: 1.4,
                        }}
                      >
                        {getInitials(signerName)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hidden initials canvas */}
              <canvas ref={initialsCanvasRef} width={400} height={140} className="hidden" />

              <button
                onClick={downloadInitials}
                className="btn-secondary flex items-center gap-2 py-2.5 px-5 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Initials as PNG
              </button>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-700 p-8 text-center">
              <p className="text-gray-500 text-sm">Enter a signer name above to preview initials</p>
            </div>
          )}
        </div>

        {/* ── 6. Signature Certificate ── */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            Signature Certificate
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            A timestamped record you can attach to your signed document.
          </p>

          <pre className="bg-gray-800/60 rounded-xl p-4 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap border border-gray-700">
            {certText}
          </pre>

          <div className="flex gap-3 mt-4">
            <button
              onClick={copyCert}
              className="btn-secondary flex items-center gap-2 py-2.5 px-5 text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={downloadCert}
              className="btn-secondary flex items-center gap-2 py-2.5 px-5 text-sm"
            >
              <Download className="w-4 h-4" />
              Download .txt
            </button>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}
