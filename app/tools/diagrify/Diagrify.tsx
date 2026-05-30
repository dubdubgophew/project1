'use client';

import {
  useRef, useState, useEffect, useCallback, useLayoutEffect,
} from 'react';
import {
  MousePointer2, Hand, Square, Circle, Diamond, Triangle,
  Minus, MoveRight, Type, Pen, StickyNote, Eraser,
  Undo2, Redo2, Trash2, Download, Upload, ZoomIn, ZoomOut,
  Maximize2, Sparkles, X, ChevronDown, AlignCenter,
  Bold, Italic, Lock, Unlock, Copy, Settings,
  Home, ExternalLink,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ElemType = 'rect' | 'ellipse' | 'diamond' | 'triangle' | 'arrow' | 'line' | 'text' | 'pen' | 'sticky';
type Tool     = 'select' | 'hand' | 'rect' | 'ellipse' | 'diamond' | 'triangle' | 'arrow' | 'line' | 'text' | 'pen' | 'sticky' | 'eraser';
type Mode     = 'clean' | 'sketchy' | 'blueprint';
interface Pt  { x: number; y: number }

interface Elem {
  id:        string;
  type:      ElemType;
  x:         number;
  y:         number;
  w:         number;
  h:         number;
  pts?:      number[];        // flat [x1,y1,x2,y2,...] for pen/arrow/line
  text?:     string;
  label?:    string;
  stroke:    string;
  fill:      string;
  lineWidth: number;
  opacity:   number;
  fontSize?: number;
  bold?:     boolean;
  italic?:   boolean;
  locked?:   boolean;
  seed:      number;
}

interface DragState {
  type:           'move' | 'resize' | 'draw' | 'pan' | 'select-box';
  startX:         number;
  startY:         number;
  origX?:         number;
  origY?:         number;
  origW?:         number;
  origH?:         number;
  handle?:        string;
  ids?:           string[];
  snapX?:         number[];
  snapY?:         number[];
  origPositions?: Record<string, { x: number; y: number; pts?: number[] }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HANDLE_SIZE   = 8;
const MIN_SIZE      = 10;
const GRID_SIZE     = 20;
const SNAP_DIST     = 8;

const STROKE_PRESETS = ['#1e1e2e', '#5c7cfa', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#64748b'];
const FILL_PRESETS   = ['transparent', '#fff7ed', '#dbeafe', '#d1fae5', '#fef3c7', '#fee2e2', '#fce7f3', '#f1f5f9'];

const DEFAULT_STYLE: Pick<Elem, 'stroke' | 'fill' | 'lineWidth' | 'opacity' | 'fontSize'> = {
  stroke:    '#1e1e2e',
  fill:      'transparent',
  lineWidth: 2,
  opacity:   1,
  fontSize:  15,
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function uid(): string { return Math.random().toString(36).slice(2, 10); }
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0x100000000);
  };
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

function screenToWorld(sx: number, sy: number, pan: Pt, zoom: number): Pt {
  return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
}

function getElementBounds(el: Elem): { x: number; y: number; w: number; h: number } {
  if ((el.type === 'pen') && el.pts && el.pts.length >= 2) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < el.pts.length; i += 2) {
      minX = Math.min(minX, el.pts[i]);
      minY = Math.min(minY, el.pts[i + 1]);
      maxX = Math.max(maxX, el.pts[i]);
      maxY = Math.max(maxY, el.pts[i + 1]);
    }
    return { x: minX - 4, y: minY - 4, w: maxX - minX + 8, h: maxY - minY + 8 };
  }
  if ((el.type === 'arrow' || el.type === 'line') && el.pts && el.pts.length >= 4) {
    const [x1, y1, x2, y2] = el.pts;
    return { x: Math.min(x1, x2) - 4, y: Math.min(y1, y2) - 4, w: Math.abs(x2 - x1) + 8, h: Math.abs(y2 - y1) + 8 };
  }
  return { x: el.x, y: el.y, w: el.w, h: el.h };
}

function hitTest(el: Elem, wx: number, wy: number): boolean {
  const b = getElementBounds(el);
  if (wx < b.x - 4 || wx > b.x + b.w + 4 || wy < b.y - 4 || wy > b.y + b.h + 4) return false;
  if (el.type === 'pen' || el.type === 'arrow' || el.type === 'line') {
    if (!el.pts || el.pts.length < 4) return false;
    for (let i = 0; i < el.pts.length - 2; i += 2) {
      const dx = el.pts[i + 2] - el.pts[i];
      const dy = el.pts[i + 3] - el.pts[i + 1];
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) continue;
      const t = clamp(((wx - el.pts[i]) * dx + (wy - el.pts[i + 1]) * dy) / len2, 0, 1);
      const px = el.pts[i] + t * dx - wx;
      const py = el.pts[i + 1] + t * dy - wy;
      if (px * px + py * py < 144) return true;
    }
    return false;
  }
  return true;
}

function getHandles(el: Elem): { id: string; x: number; y: number }[] {
  const b = getElementBounds(el);
  if (el.type === 'arrow' || el.type === 'line') {
    const [x1, y1, x2, y2] = el.pts ?? [el.x, el.y, el.x + el.w, el.y + el.h];
    return [
      { id: 'p0', x: x1, y: y1 },
      { id: 'p1', x: x2, y: y2 },
    ];
  }
  const { x, y, w, h } = b;
  return [
    { id: 'nw', x, y },
    { id: 'n', x: x + w / 2, y },
    { id: 'ne', x: x + w, y },
    { id: 'e', x: x + w, y: y + h / 2 },
    { id: 'se', x: x + w, y: y + h },
    { id: 's', x: x + w / 2, y: y + h },
    { id: 'sw', x, y: y + h },
    { id: 'w', x, y: y + h / 2 },
  ];
}

function getResizeCursor(handle: string): string {
  const map: Record<string, string> = {
    nw: 'nw-resize', ne: 'ne-resize', se: 'se-resize', sw: 'sw-resize',
    n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
  };
  return map[handle] ?? 'default';
}

// ─── Canvas Rendering ─────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, pan: Pt, zoom: number, mode: Mode) {
  ctx.clearRect(0, 0, w, h);
  if (mode === 'blueprint') {
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }

  const gs = GRID_SIZE * zoom;
  const ox = ((pan.x % gs) + gs) % gs;
  const oy = ((pan.y % gs) + gs) % gs;

  if (mode === 'blueprint') {
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 0.5;
    for (let x = ox; x < w; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = oy; y < h; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // Major grid every 4 cells
    ctx.strokeStyle = '#2a4f7a';
    ctx.lineWidth = 1;
    for (let x = ox; x < w; x += gs * 4) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = oy; y < h; y += gs * 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  } else {
    // Dots — light gray on white canvas
    const dotSize = 1;
    ctx.fillStyle = '#e5e7eb';
    for (let x = ox; x < w; x += gs) {
      for (let y = oy; y < h; y += gs) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function applyStyle(ctx: CanvasRenderingContext2D, el: Elem, mode: Mode) {
  ctx.globalAlpha = el.opacity;
  if (mode === 'blueprint') {
    ctx.strokeStyle = '#60a5fa';
    ctx.fillStyle = '#3b82f615';
    ctx.lineWidth = el.lineWidth;
  } else {
    ctx.strokeStyle = el.stroke;
    ctx.fillStyle = el.fill === 'transparent' ? 'rgba(0,0,0,0)' : el.fill;
    ctx.lineWidth = el.lineWidth;
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (mode === 'sketchy') {
    ctx.lineWidth = el.lineWidth + 0.5;
  }
}

function sketchLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, rng: () => number, r = 2.5) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(2, Math.floor(len / 15));
  ctx.beginPath();
  ctx.moveTo(x1 + (rng() - 0.5) * r, y1 + (rng() - 0.5) * r);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    ctx.lineTo(lerp(x1, x2, t) + (rng() - 0.5) * r * 1.8, lerp(y1, y2, t) + (rng() - 0.5) * r * 1.8);
  }
  ctx.lineTo(x2 + (rng() - 0.5) * r, y2 + (rng() - 0.5) * r);
  ctx.stroke();
  // Second pass slightly offset
  ctx.beginPath();
  ctx.moveTo(x1 + (rng() - 0.5) * r * 0.6, y1 + (rng() - 0.5) * r * 0.6);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    ctx.lineTo(lerp(x1, x2, t) + (rng() - 0.5) * r * 0.9, lerp(y1, y2, t) + (rng() - 0.5) * r * 0.9);
  }
  ctx.lineTo(x2 + (rng() - 0.5) * r * 0.6, y2 + (rng() - 0.5) * r * 0.6);
  ctx.stroke();
}

function drawArrowHead(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, size = 12) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - 0.4), y2 - size * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - size * Math.cos(angle + 0.4), y2 - size * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

function drawLabel(ctx: CanvasRenderingContext2D, label: string, cx: number, cy: number, el: Elem, mode: Mode) {
  if (!label) return;
  const fs = el.fontSize ?? 15;
  const weight = el.bold ? 'bold ' : '';
  const style  = el.italic ? 'italic ' : '';
  const fontFamily = mode === 'sketchy' ? "'Caveat', cursive" : "-apple-system, Inter, sans-serif";
  const fontSizePx = mode === 'sketchy' ? fs * 1.05 : fs; // Caveat renders at near-normal size
  ctx.font = `${style}${weight}${fontSizePx}px ${fontFamily}`;
  ctx.fillStyle = mode === 'blueprint' ? '#93c5fd' : '#1e1e2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = el.opacity;
  // Wrap text if needed
  const maxW = el.w - 12;
  const words = label.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line); line = word;
    } else { line = test; }
  }
  if (line) lines.push(line);
  const lineH = fs * 1.3;
  const totalH = lines.length * lineH;
  lines.forEach((l, i) => {
    ctx.fillText(l, cx, cy - totalH / 2 + i * lineH + lineH / 2);
  });
}

function drawElement(ctx: CanvasRenderingContext2D, el: Elem, mode: Mode) {
  ctx.save();
  applyStyle(ctx, el, mode);
  const rng = seededRng(el.seed);
  const sketchy = mode === 'sketchy';

  if (el.type === 'rect' || el.type === 'sticky') {
    const { x, y, w, h } = el;
    const isSolid = el.type === 'sticky';

    if (isSolid) {
      ctx.fillStyle = el.fill === 'transparent' ? '#fef9c3' : el.fill;
      ctx.strokeStyle = mode === 'blueprint' ? '#60a5fa' : el.stroke;
    }

    if (sketchy) {
      const r = 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y + r);
      ctx.lineTo(x + w - r, y + r);
      ctx.lineTo(x + w - r, y + h - r);
      ctx.lineTo(x + r, y + h - r);
      ctx.closePath();
      ctx.fill();
      sketchLine(ctx, x, y, x + w, y, rng);
      sketchLine(ctx, x + w, y, x + w, y + h, rng);
      sketchLine(ctx, x + w, y + h, x, y + h, rng);
      sketchLine(ctx, x, y + h, x, y, rng);
    } else {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, mode === 'blueprint' ? 0 : 4);
      ctx.fill();
      ctx.stroke();
    }
    const label = el.label ?? el.text ?? '';
    drawLabel(ctx, label, x + w / 2, y + h / 2, el, mode);
  }

  else if (el.type === 'ellipse') {
    const { x, y, w, h } = el;
    const cx = x + w / 2, cy = y + h / 2;
    if (sketchy) {
      const rx = w / 2, ry = h / 2;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const ang = (i / 60) * Math.PI * 2;
        const ex = cx + (rx + (rng() - 0.5) * 3) * Math.cos(ang);
        const ey = cy + (ry + (rng() - 0.5) * 3) * Math.sin(ang);
        if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    drawLabel(ctx, el.label ?? '', cx, cy, el, mode);
  }

  else if (el.type === 'diamond') {
    const { x, y, w, h } = el;
    const mx = x + w / 2, my = y + h / 2;
    if (sketchy) {
      sketchLine(ctx, mx, y, x + w, my, rng);
      sketchLine(ctx, x + w, my, mx, y + h, rng);
      sketchLine(ctx, mx, y + h, x, my, rng);
      sketchLine(ctx, x, my, mx, y, rng);
    } else {
      ctx.beginPath();
      ctx.moveTo(mx, y);
      ctx.lineTo(x + w, my);
      ctx.lineTo(mx, y + h);
      ctx.lineTo(x, my);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    drawLabel(ctx, el.label ?? '', mx, my, el, mode);
  }

  else if (el.type === 'triangle') {
    const { x, y, w, h } = el;
    const mx = x + w / 2;
    if (sketchy) {
      sketchLine(ctx, mx, y, x + w, y + h, rng);
      sketchLine(ctx, x + w, y + h, x, y + h, rng);
      sketchLine(ctx, x, y + h, mx, y, rng);
    } else {
      ctx.beginPath();
      ctx.moveTo(mx, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    drawLabel(ctx, el.label ?? '', mx, y + h * 0.65, el, mode);
  }

  else if (el.type === 'arrow' || el.type === 'line') {
    if (!el.pts || el.pts.length < 4) { ctx.restore(); return; }
    const [x1, y1, x2, y2] = el.pts;
    if (sketchy) {
      sketchLine(ctx, x1, y1, x2, y2, rng);
    } else {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    if (el.type === 'arrow') {
      ctx.fillStyle = mode === 'blueprint' ? '#60a5fa' : el.stroke;
      drawArrowHead(ctx, x1, y1, x2, y2, 12 + el.lineWidth);
    }
    if (el.label) {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const fake = { ...el, x: mx - 40, y: my - 12, w: 80, h: 24 };
      drawLabel(ctx, el.label, mx, my - 10, fake as Elem, mode);
    }
  }

  else if (el.type === 'pen') {
    if (!el.pts || el.pts.length < 4) { ctx.restore(); return; }
    ctx.fillStyle = 'transparent';
    ctx.beginPath();
    ctx.moveTo(el.pts[0], el.pts[1]);
    for (let i = 2; i < el.pts.length; i += 2) {
      const px = (el.pts[i - 2] + el.pts[i]) / 2;
      const py = (el.pts[i - 1] + el.pts[i + 1]) / 2;
      ctx.quadraticCurveTo(el.pts[i - 2], el.pts[i - 1], px, py);
    }
    ctx.lineTo(el.pts[el.pts.length - 2], el.pts[el.pts.length - 1]);
    ctx.stroke();
  }

  else if (el.type === 'text') {
    const { x, y, w, h } = el;
    const text = el.text ?? el.label ?? '';
    if (text) {
      const fs = el.fontSize ?? 16;
      const weight = el.bold ? 'bold ' : '';
      const st = el.italic ? 'italic ' : '';
      const fontFamily = mode === 'sketchy' ? "'Caveat', cursive" : "-apple-system, Inter, sans-serif";
      const fontSizePx = mode === 'sketchy' ? fs * 1.2 : fs;
      ctx.font = `${st}${weight}${fontSizePx}px ${fontFamily}`;
      ctx.fillStyle = mode === 'blueprint' ? '#93c5fd' : '#1e1e2e';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      // Word wrap
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > w - 8 && line) {
          lines.push(line); line = word;
        } else { line = test; }
      }
      if (line) lines.push(line);
      const lineH = fs * 1.4;
      lines.forEach((l, i) => ctx.fillText(l, x + 4, y + 4 + i * lineH));
    }
  }

  ctx.restore();
}

function drawSelectionBox(ctx: CanvasRenderingContext2D, el: Elem, zoom: number) {
  if (el.locked) return;
  const b = getElementBounds(el);
  const pad = 4;
  ctx.save();
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
  ctx.setLineDash([]);

  const hs = HANDLE_SIZE / zoom;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 1.5;
  getHandles(el).forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, hs, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function drawSelectRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#f9731618';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 2]);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Diagrify() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const [elements, setElements] = useState<Elem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool,    setTool]    = useState<Tool>('select');
  const [mode,    setMode]    = useState<Mode>('sketchy');
  const [pan,     setPan]     = useState<Pt>({ x: 0, y: 0 });
  const [zoom,    setZoom]    = useState(1);
  const [history, setHistory] = useState<Elem[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);

  // Style state
  const [stroke,    setStroke]    = useState(DEFAULT_STYLE.stroke);
  const [fill,      setFill]      = useState(DEFAULT_STYLE.fill);
  const [lineWidth, setLineWidth] = useState(DEFAULT_STYLE.lineWidth);
  const [fontSize,  setFontSize]  = useState(DEFAULT_STYLE.fontSize!);
  const [bold,      setBold]      = useState(false);
  const [italic,    setItalic]    = useState(false);

  // UI state
  const [showAI,     setShowAI]     = useState(false);
  const [aiPrompt,   setAiPrompt]   = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState('');
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState('');
  const [showLayers, setShowLayers] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Drawing state (mutable, no re-render needed)
  const drag    = useRef<DragState | null>(null);
  const drawing = useRef<Elem | null>(null);
  const selectBox = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const lastPan = useRef<Pt>({ x: 0, y: 0 });

  // Space-to-pan and clipboard refs
  const prevToolRef = useRef<Tool>('select');
  const spaceHeld = useRef(false);
  const clipboardRef = useRef<Elem[]>([]);
  const toolRef = useRef<Tool>(tool);
  useEffect(() => { toolRef.current = tool; }, [tool]);

  // DPR
  const dpr = useRef(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1);

  // ─── Canvas size ──────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width  = width  * dpr.current;
      canvas.height = height * dpr.current;
      canvas.style.width  = width  + 'px';
      canvas.style.height = height + 'px';
      render();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width / dpr.current;
    const h = canvas.height / dpr.current;

    ctx.save();
    ctx.scale(dpr.current, dpr.current);
    drawBackground(ctx, w, h, pan, zoom, mode);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw all elements
    elements.forEach(el => drawElement(ctx, el, mode));

    // Draw preview shape
    if (drawing.current) drawElement(ctx, drawing.current, mode);

    // Selection overlays (in world space)
    if (selectedIds.length > 0) {
      elements.filter(e => selectedIds.includes(e.id)).forEach(e => drawSelectionBox(ctx, e, zoom));
    }

    // Select box
    if (selectBox.current) {
      const { x, y, w: sw, h: sh } = selectBox.current;
      drawSelectRect(ctx, x, y, sw, sh);
    }

    ctx.restore();
    ctx.restore();
  }, [elements, selectedIds, pan, zoom, mode]);

  useEffect(() => { render(); }, [render]);

  // Load canvas state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('diagrify_canvas');
      if (saved) {
        const { elements: savedElems, pan: savedPan, zoom: savedZoom } = JSON.parse(saved);
        if (Array.isArray(savedElems) && savedElems.length > 0) {
          setElements(savedElems);
          if (savedPan && typeof savedPan.x === 'number') setPan(savedPan);
          if (typeof savedZoom === 'number' && savedZoom > 0) setZoom(savedZoom);
        }
      }
    } catch { /* ignore parse errors */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist canvas state to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('diagrify_canvas', JSON.stringify({ elements, pan, zoom }));
        setSaveIndicator(true);
        setTimeout(() => setSaveIndicator(false), 1500);
      } catch { /* storage full or unavailable */ }
    }, 800);
    return () => clearTimeout(timer);
  }, [elements, pan, zoom]);

  // ─── History ──────────────────────────────────────────────────────────────

  const pushHistory = useCallback((elems: Elem[]) => {
    setHistory(h => {
      const next = h.slice(0, histIdx + 1);
      next.push(elems);
      return next.slice(-50); // keep last 50 states
    });
    setHistIdx(i => Math.min(i + 1, 49));
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const idx = histIdx - 1;
    setHistIdx(idx);
    setElements(history[idx]);
    setSelectedIds([]);
  }, [histIdx, history]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    const idx = histIdx + 1;
    setHistIdx(idx);
    setElements(history[idx]);
    setSelectedIds([]);
  }, [histIdx, history]);

  // ─── Element helpers ──────────────────────────────────────────────────────

  const makeElem = useCallback((type: ElemType, x: number, y: number, w: number, h: number): Elem => ({
    id: uid(), type, x, y, w, h,
    stroke,
    fill: type === 'pen' || type === 'arrow' || type === 'line' ? 'transparent' : fill,
    lineWidth, opacity: 1, fontSize, bold, italic,
    label: type === 'text' ? '' : '',
    seed: Math.floor(Math.random() * 100000),
  }), [stroke, fill, lineWidth, fontSize, bold, italic]);

  const addElements = useCallback((newEls: Elem[]) => {
    setElements(prev => {
      const next = [...prev, ...newEls];
      pushHistory(next);
      return next;
    });
    setSelectedIds(newEls.map(e => e.id));
  }, [pushHistory]);

  const updateElement = useCallback((id: string, patch: Partial<Elem>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    setElements(prev => {
      const next = prev.filter(e => !selectedIds.includes(e.id));
      pushHistory(next);
      return next;
    });
    setSelectedIds([]);
  }, [selectedIds, pushHistory]);

  // ─── Coordinate helpers ───────────────────────────────────────────────────

  const getCanvasXY = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }, []);

  const toWorld = useCallback((sx: number, sy: number) => screenToWorld(sx, sy, pan, zoom), [pan, zoom]);

  // ─── Hit testing ──────────────────────────────────────────────────────────

  const findHandle = useCallback((wx: number, wy: number): { elId: string; handle: string } | null => {
    if (selectedIds.length !== 1) return null;
    const el = elements.find(e => e.id === selectedIds[0]);
    if (!el || el.locked) return null;
    const hs = (HANDLE_SIZE + 4) / zoom;
    for (const h of getHandles(el)) {
      const dx = wx - h.x, dy = wy - h.y;
      if (dx * dx + dy * dy < hs * hs) return { elId: el.id, handle: h.id };
    }
    return null;
  }, [selectedIds, elements, zoom]);

  const findElement = useCallback((wx: number, wy: number): Elem | null => {
    // Reverse order — topmost element first
    for (let i = elements.length - 1; i >= 0; i--) {
      if (hitTest(elements[i], wx, wy)) return elements[i];
    }
    return null;
  }, [elements]);

  // ─── Mouse events ─────────────────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    const { sx, sy } = getCanvasXY(e);
    const { x: wx, y: wy } = toWorld(sx, sy);

    // Middle mouse → pan
    if (e.button === 1 || tool === 'hand') {
      drag.current = { type: 'pan', startX: sx, startY: sy };
      lastPan.current = { ...pan };
      return;
    }

    if (tool === 'eraser') {
      const el = findElement(wx, wy);
      if (el) {
        setElements(prev => {
          const next = prev.filter(x => x.id !== el.id);
          pushHistory(next);
          return next;
        });
        setSelectedIds(p => p.filter(id => id !== el.id));
      }
      return;
    }

    if (tool === 'select') {
      // Check handle first
      const h = findHandle(wx, wy);
      if (h) {
        const el = elements.find(ex => ex.id === h.elId)!;
        const b = getElementBounds(el);
        drag.current = {
          type: 'resize', startX: wx, startY: wy, handle: h.handle,
          origX: b.x, origY: b.y, origW: b.w, origH: b.h, ids: [h.elId],
        };
        return;
      }

      const el = findElement(wx, wy);
      if (el) {
        // If already selected (single selection) and not locked — click again opens text editor
        if (selectedIds.length === 1 && selectedIds.includes(el.id) && !e.shiftKey && !el.locked &&
            (el.type === 'rect' || el.type === 'ellipse' || el.type === 'diamond' ||
             el.type === 'triangle' || el.type === 'sticky' || el.type === 'text')) {
          setEditingId(el.id);
          setEditText(el.text ?? el.label ?? '');
          return;
        }
        if (e.shiftKey) {
          setSelectedIds(prev =>
            prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]
          );
        } else {
          if (!selectedIds.includes(el.id)) setSelectedIds([el.id]);
        }
        const snapX = elements.filter(x => x.id !== el.id).flatMap(x => [x.x, x.x + x.w, x.x + x.w / 2]);
        const snapY = elements.filter(x => x.id !== el.id).flatMap(x => [x.y, x.y + x.h, x.y + x.h / 2]);
        const moveIds = e.shiftKey
          ? (selectedIds.includes(el.id) ? selectedIds : [...selectedIds, el.id])
          : (selectedIds.includes(el.id) ? selectedIds : [el.id]);
        const origPositions: Record<string, { x: number; y: number; pts?: number[] }> = {};
        moveIds.forEach(id => {
          const elem = elements.find(ex => ex.id === id);
          if (elem) origPositions[id] = { x: elem.x, y: elem.y, pts: elem.pts ? [...elem.pts] : undefined };
        });
        drag.current = { type: 'move', startX: wx, startY: wy, origPositions, ids: moveIds, snapX, snapY };
        return;
      }
      // Start selection box
      setSelectedIds([]);
      selectBox.current = { x: wx, y: wy, w: 0, h: 0 };
      drag.current = { type: 'select-box', startX: wx, startY: wy };
      return;
    }

    if (tool === 'text') {
      const el = findElement(wx, wy);
      if (el && (el.type === 'text' || el.label !== undefined)) {
        setEditingId(el.id);
        setEditText(el.text ?? el.label ?? '');
        return;
      }
      // Create new text
      const newEl = makeElem('text', wx - 80, wy - 20, 200, 40);
      newEl.text = '';
      newEl.fill = 'transparent';
      addElements([newEl]);
      setEditingId(newEl.id);
      setEditText('');
      return;
    }

    // Drawing tools
    const typeMap: Partial<Record<Tool, ElemType>> = {
      rect: 'rect', ellipse: 'ellipse', diamond: 'diamond',
      triangle: 'triangle', arrow: 'arrow', line: 'line',
      pen: 'pen', sticky: 'sticky',
    };
    const elType = typeMap[tool];
    if (!elType) return;

    if (elType === 'arrow' || elType === 'line') {
      const newEl = makeElem(elType, wx, wy, 0, 0);
      newEl.pts = [wx, wy, wx, wy];
      drawing.current = newEl;
      drag.current = { type: 'draw', startX: wx, startY: wy };
    } else if (elType === 'pen') {
      const newEl = makeElem('pen', wx, wy, 0, 0);
      newEl.pts = [wx, wy];
      newEl.fill = 'transparent';
      drawing.current = newEl;
      drag.current = { type: 'draw', startX: wx, startY: wy };
    } else {
      const newEl = makeElem(elType, wx, wy, 0, 0);
      drawing.current = newEl;
      drag.current = { type: 'draw', startX: wx, startY: wy };
    }
  }, [tool, getCanvasXY, toWorld, pan, findHandle, findElement, elements, selectedIds, makeElem, addElements, pushHistory]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = getCanvasXY(e);
    const { x: wx, y: wy } = toWorld(sx, sy);
    const d = drag.current;
    if (!d) return;

    if (d.type === 'pan') {
      const dx = sx - d.startX, dy = sy - d.startY;
      setPan({ x: lastPan.current.x + dx, y: lastPan.current.y + dy });
      return;
    }

    if (d.type === 'select-box') {
      const x = Math.min(wx, d.startX);
      const y = Math.min(wy, d.startY);
      const bw = Math.abs(wx - d.startX);
      const bh = Math.abs(wy - d.startY);
      selectBox.current = { x, y, w: bw, h: bh };
      render();
      return;
    }

    if (d.type === 'move') {
      const dx = wx - d.startX, dy = wy - d.startY;
      setElements(prev => prev.map(el => {
        if (!d.ids?.includes(el.id) || el.locked) return el;
        const orig = d.origPositions?.[el.id];
        let nx = (orig?.x ?? el.x) + dx;
        let ny = (orig?.y ?? el.y) + dy;
        if (e.shiftKey) {
          nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
          ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
        }
        if ((el.type === 'arrow' || el.type === 'line' || el.type === 'pen') && orig?.pts) {
          const newPts = [...orig.pts];
          for (let i = 0; i < newPts.length; i += 2) newPts[i] += dx;
          for (let i = 1; i < newPts.length; i += 2) newPts[i] += dy;
          return { ...el, x: nx, y: ny, pts: newPts };
        }
        return { ...el, x: nx, y: ny };
      }));
      return;
    }

    if (d.type === 'resize') {
      const el = elements.find(ex => ex.id === d.ids?.[0]);
      if (!el) return;
      const dx = wx - d.startX, dy = wy - d.startY;
      const ox = d.origX!, oy = d.origY!, ow = d.origW!, oh = d.origH!;

      // Handle arrow/line endpoint dragging
      if ((el.type === 'arrow' || el.type === 'line') && d.handle) {
        const pts = [...(el.pts ?? [ox, oy, ox + ow, oy + oh])];
        if (d.handle === 'p0') { pts[0] = wx; pts[1] = wy; }
        else { pts[2] = wx; pts[3] = wy; }
        updateElement(el.id, { pts });
        return;
      }

      let nx = ox, ny = oy, nw = ow, nh = oh;
      const h = d.handle ?? 'se';

      if (h.includes('e')) nw = Math.max(MIN_SIZE, ow + dx);
      if (h.includes('s')) nh = Math.max(MIN_SIZE, oh + dy);
      if (h.includes('w')) { nx = ox + dx; nw = Math.max(MIN_SIZE, ow - dx); }
      if (h.includes('n')) { ny = oy + dy; nh = Math.max(MIN_SIZE, oh - dy); }

      updateElement(el.id, { x: nx, y: ny, w: nw, h: nh });
      return;
    }

    if (d.type === 'draw' && drawing.current) {
      const el = drawing.current;
      if (el.type === 'pen') {
        el.pts = [...(el.pts ?? []), wx, wy];
      } else if (el.type === 'arrow' || el.type === 'line') {
        const pts = [...(el.pts ?? [d.startX, d.startY, wx, wy])];
        pts[2] = wx; pts[3] = wy;
        el.pts = pts;
      } else {
        const sx2 = d.startX, sy2 = d.startY;
        el.x = Math.min(sx2, wx);
        el.y = Math.min(sy2, wy);
        el.w = Math.abs(wx - sx2);
        el.h = Math.abs(wy - sy2);
        // Hold shift for square
        if (e.shiftKey && el.type !== 'triangle') {
          const side = Math.max(el.w, el.h);
          el.w = side; el.h = side;
          if (wx < sx2) el.x = sx2 - side;
          if (wy < sy2) el.y = sy2 - side;
        }
      }
      render();
    }
  }, [getCanvasXY, toWorld, elements, updateElement, render]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    drag.current = null;

    if (d?.type === 'pan') return;

    if (d?.type === 'select-box' && selectBox.current) {
      const { x, y, w: bw, h: bh } = selectBox.current;
      const hit = elements.filter(el => {
        const b = getElementBounds(el);
        return b.x + b.w > x && b.x < x + bw && b.y + b.h > y && b.y < y + bh;
      });
      setSelectedIds(hit.map(el => el.id));
      selectBox.current = null;
      render();
      return;
    }

    if (d?.type === 'move') {
      pushHistory(elements);
      return;
    }

    if (d?.type === 'resize') {
      pushHistory(elements);
      return;
    }

    if (d?.type === 'draw' && drawing.current) {
      const el = drawing.current;
      // Discard tiny elements
      const b = getElementBounds(el);
      if (b.w < MIN_SIZE && b.h < MIN_SIZE && el.type !== 'pen') {
        // Click without drag → create default-sized element
        if (el.type !== 'arrow' && el.type !== 'line') {
          el.w = el.type === 'sticky' ? 140 : 140;
          el.h = el.type === 'sticky' ? 80 : 60;
        }
        // Auto-switch back to select tool (like Excalidraw)
        setTool('select');
      }
      if ((el.type === 'pen') && (!el.pts || el.pts.length < 4)) {
        drawing.current = null;
        return;
      }
      drawing.current = null;
      addElements([el]);

      // Auto-switch back to select tool (like Excalidraw)
      if (el.type !== 'pen') {
        setTool('select');
      }

      // Auto-open text editing for sticky notes
      if (el.type === 'sticky' || el.type === 'text') {
        setEditingId(el.id);
        setEditText('');
      }
    }
  }, [elements, addElements, pushHistory, render]);

  // ─── Wheel (zoom) ─────────────────────────────────────────────────────────

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const { sx, sy } = getCanvasXY(e as unknown as React.MouseEvent<HTMLCanvasElement>);
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = clamp(zoom * factor, 0.05, 8);
      setPan(p => ({
        x: sx - (sx - p.x) * (newZoom / zoom),
        y: sy - (sy - p.y) * (newZoom / zoom),
      }));
      setZoom(newZoom);
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, [zoom, getCanvasXY]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingId) return;
      const mod = e.metaKey || e.ctrlKey;

      // Space bar to pan temporarily (handled via keyup below)
      if (e.key === ' ' && !spaceHeld.current) {
        e.preventDefault();
        spaceHeld.current = true;
        prevToolRef.current = toolRef.current;
        setTool('hand');
        return;
      }

      // Enter to edit selected element
      if (e.key === 'Enter' && selectedIds.length === 1 && !editingId) {
        e.preventDefault();
        const selEl = elements.find(x => x.id === selectedIds[0]);
        if (selEl && selEl.type !== 'pen' && selEl.type !== 'arrow' && selEl.type !== 'line') {
          setEditingId(selEl.id);
          setEditText(selEl.text ?? selEl.label ?? '');
        }
        return;
      }

      if (mod && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key === 'y') { e.preventDefault(); redo(); return; }
      if (mod && e.key === 'a') { e.preventDefault(); setSelectedIds(elements.map(el => el.id)); return; }
      if (mod && e.key === 'c') {
        e.preventDefault();
        clipboardRef.current = elements.filter(el => selectedIds.includes(el.id)).map(el => ({...el}));
        return;
      }
      if (mod && e.key === 'v') {
        e.preventDefault();
        if (clipboardRef.current.length) {
          const pasted = clipboardRef.current.map(el => ({
            ...el, id: uid(),
            x: el.x + 20, y: el.y + 20,
            seed: Math.floor(Math.random() * 100000),
          }));
          addElements(pasted);
        }
        return;
      }
      if (mod && e.key === 'd') {
        e.preventDefault();
        const duped = elements.filter(el => selectedIds.includes(el.id)).map(el => ({
          ...el, id: uid(),
          x: el.x + 20, y: el.y + 20,
          seed: Math.floor(Math.random() * 100000),
        }));
        if (duped.length) addElements(duped);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault(); deleteSelected(); return;
      }
      if (e.key === 'Escape') { setSelectedIds([]); return; }
      if (e.key === '+' || e.key === '=') { setZoom(z => clamp(z * 1.15, 0.05, 8)); return; }
      if (e.key === '-') { setZoom(z => clamp(z * 0.87, 0.05, 8)); return; }
      if (e.key === '0' && mod) { setZoom(1); setPan({ x: 0, y: 0 }); return; }
      // Tool shortcuts
      const toolMap: Record<string, Tool> = {
        v: 'select', h: 'hand', r: 'rect', e: 'ellipse',
        d: 'diamond', t: 'triangle', a: 'arrow', l: 'line',
        p: 'pen', x: 'text', n: 'sticky', Backspace: 'eraser',
      };
      if (!mod && toolMap[e.key]) { setTool(toolMap[e.key]); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && spaceHeld.current) {
        spaceHeld.current = false;
        setTool(prevToolRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [editingId, undo, redo, deleteSelected, selectedIds, elements, addElements]);

  // ─── Text editing ─────────────────────────────────────────────────────────

  const finishEdit = useCallback(() => {
    if (!editingId) return;
    updateElement(editingId, { text: editText, label: editText });
    pushHistory(elements.map(e => e.id === editingId ? { ...e, text: editText, label: editText } : e));
    setEditingId(null);
    setEditText('');
  }, [editingId, editText, updateElement, pushHistory, elements]);

  // Get text editor position
  const getEditorStyle = useCallback((): React.CSSProperties => {
    if (!editingId) return { display: 'none' };
    const el = elements.find(x => x.id === editingId);
    if (!el) return { display: 'none' };
    const b = getElementBounds(el);
    const left  = b.x * zoom + pan.x;
    const top   = b.y * zoom + pan.y;
    const width = Math.max(b.w * zoom, 120);
    const height = Math.max(b.h * zoom, 40);
    return { position: 'absolute', left, top, width, height, display: 'flex' };
  }, [editingId, elements, zoom, pan]);

  // ─── AI text-to-diagram ───────────────────────────────────────────────────

  const generateDiagram = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/tools/diagrify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const { elements: aiElems, error } = await res.json();
      if (error) throw new Error(error);

      // Map AI elements to our Elem format
      const newElems: Elem[] = aiElems.map((ae: Record<string, unknown>) => {
        const base: Elem = {
          id:        uid(),
          type:      (ae.type as ElemType) || 'rect',
          x:         Number(ae.x) || 100,
          y:         Number(ae.y) || 100,
          w:         Number(ae.w) || 140,
          h:         Number(ae.h) || 60,
          stroke:    String(ae.stroke || stroke),
          fill:      String(ae.fill || fill),
          lineWidth: Number(ae.lineWidth || 2),
          opacity:   1,
          fontSize,
          label:     String(ae.label || ''),
          seed:      Math.floor(Math.random() * 100000),
        };
        if (ae.type === 'arrow' || ae.type === 'line') {
          base.pts = [
            Number(ae.fromX ?? ae.x), Number(ae.fromY ?? ae.y),
            Number(ae.toX ?? ((ae.x as number) + 100)), Number(ae.toY ?? ae.y),
          ];
          base.fill = 'transparent';
        }
        return base;
      });

      // Center the generated diagram in the viewport
      if (newElems.length > 0) {
        const canvas = canvasRef.current;
        const vw = canvas ? canvas.width / dpr.current : 800;
        const vh = canvas ? canvas.height / dpr.current : 600;
        const xs = newElems.map(e => e.x), ys = newElems.map(e => e.y);
        const ws = newElems.map(e => e.x + e.w), hs2 = newElems.map(e => e.y + e.h);
        const cx = (Math.min(...xs) + Math.max(...ws)) / 2;
        const cy = (Math.min(...ys) + Math.max(...hs2)) / 2;
        const offX = vw / 2 / zoom - cx + (pan.x === 0 ? 0 : pan.x / zoom);
        const offY = vh / 2 / zoom - cy + (pan.y === 0 ? 0 : pan.y / zoom);
        newElems.forEach(e => {
          e.x += offX;
          e.y += offY;
          if (e.pts && e.pts.length >= 2) {
            for (let i = 0; i < e.pts.length; i += 2) e.pts[i] += offX;
            for (let i = 1; i < e.pts.length; i += 2) e.pts[i] += offY;
          }
        });

        // Snap arrows to shape edges
        const shapes = newElems.filter(e => e.type !== 'arrow' && e.type !== 'line' && e.type !== 'pen');
        newElems.forEach(e => {
          if ((e.type !== 'arrow' && e.type !== 'line') || !e.pts || e.pts.length < 4) return;
          const [fx, fy, tx, ty] = e.pts;
          // Find closest shape to each endpoint
          const nearest = (px: number, py: number) => {
            let best: Elem | null = null;
            let bestD = Infinity;
            shapes.forEach(s => {
              const ecx = s.x + s.w / 2, ecy = s.y + s.h / 2;
              const d = Math.hypot(px - ecx, py - ecy);
              if (d < bestD) { bestD = d; best = s; }
            });
            return best;
          };
          const fromEl = nearest(fx, fy) as Elem | null;
          const toEl = nearest(tx, ty) as Elem | null;
          if (fromEl && toEl && fromEl !== toEl) {
            // Connect center-to-center (edge points computed at draw time visually)
            e.pts[0] = (fromEl as Elem).x + (fromEl as Elem).w / 2;
            e.pts[1] = (fromEl as Elem).y + (fromEl as Elem).h / 2;
            e.pts[2] = (toEl as Elem).x + (toEl as Elem).w / 2;
            e.pts[3] = (toEl as Elem).y + (toEl as Elem).h / 2;
          }
        });
      }

      addElements(newElems);
      setAiPrompt('');
      setShowAI(false);
    } catch (err) {
      setAiError(String(err));
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, stroke, fill, fontSize, zoom, pan, addElements]);

  // ─── Export ───────────────────────────────────────────────────────────────

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'diagrify.png'; a.click();
  }, []);

  const exportSVG = useCallback(() => {
    if (elements.length === 0) return;
    const xs = elements.map(e => e.x), ys = elements.map(e => e.y);
    const ws = elements.map(e => e.x + e.w), hs2 = elements.map(e => e.y + e.h);
    const minX = Math.min(...xs) - 20;
    const minY = Math.min(...ys) - 20;
    const maxX = Math.max(...ws) + 20;
    const maxY = Math.max(...hs2) + 20;
    const svgW = maxX - minX, svgH = maxY - minY;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="${minX} ${minY} ${svgW} ${svgH}">`;
    svg += `<rect x="${minX}" y="${minY}" width="${svgW}" height="${svgH}" fill="#ffffff"/>`;
    elements.forEach(el => {
      if (el.type === 'rect' || el.type === 'sticky') {
        svg += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.lineWidth}" rx="4"/>`;
        if (el.label) svg += `<text x="${el.x + el.w/2}" y="${el.y + el.h/2}" text-anchor="middle" dominant-baseline="middle" fill="#1e1e2e" font-size="${el.fontSize ?? 15}" font-family="sans-serif">${el.label}</text>`;
      } else if (el.type === 'ellipse') {
        svg += `<ellipse cx="${el.x+el.w/2}" cy="${el.y+el.h/2}" rx="${el.w/2}" ry="${el.h/2}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.lineWidth}"/>`;
      } else if (el.type === 'arrow') {
        const [x1,y1,x2,y2] = el.pts ?? [el.x,el.y,el.x+el.w,el.y+el.h];
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${el.stroke}" stroke-width="${el.lineWidth}" marker-end="url(#arrow)"/>`;
      } else if (el.type === 'text') {
        svg += `<text x="${el.x+4}" y="${el.y + (el.fontSize ?? 16)}" fill="${el.stroke}" font-size="${el.fontSize ?? 16}" font-family="sans-serif">${el.text ?? ''}</text>`;
      }
    });
    svg += '</svg>';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'diagrify.svg'; a.click();
    URL.revokeObjectURL(url);
  }, [elements]);

  const clearAll = useCallback(() => {
    setElements([]);
    pushHistory([]);
    setSelectedIds([]);
    localStorage.removeItem('diagrify_canvas');
  }, [pushHistory]);

  // ─── Selection style sync ─────────────────────────────────────────────────

  useEffect(() => {
    if (selectedIds.length !== 1) return;
    const el = elements.find(x => x.id === selectedIds[0]);
    if (!el) return;
    setStroke(el.stroke);
    setFill(el.fill);
    setLineWidth(el.lineWidth);
    if (el.fontSize) setFontSize(el.fontSize);
    if (el.bold !== undefined) setBold(el.bold);
    if (el.italic !== undefined) setItalic(el.italic);
  }, [selectedIds, elements]);

  // Apply style changes to selected elements
  const applyStylePatch = useCallback((patch: Partial<Elem>) => {
    if (!selectedIds.length) return;
    setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, ...patch } : el));
    pushHistory(elements.map(el => selectedIds.includes(el.id) ? { ...el, ...patch } : el));
  }, [selectedIds, elements, pushHistory]);

  // ─── Cursor ───────────────────────────────────────────────────────────────

  const getCursor = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = getCanvasXY(e);
    const { x: wx, y: wy } = toWorld(sx, sy);
    if (tool === 'hand') return drag.current ? 'grabbing' : 'grab';
    if (tool === 'eraser') return 'crosshair';
    if (tool !== 'select') return 'crosshair';
    const h = findHandle(wx, wy);
    if (h) return getResizeCursor(h.handle);
    const el = findElement(wx, wy);
    return el ? (drag.current?.type === 'move' ? 'grabbing' : 'move') : 'default';
  }, [tool, getCanvasXY, toWorld, findHandle, findElement]);

  const [cursor, setCursor] = useState('default');
  const onMouseMoveWrap = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setCursor(getCursor(e));
    onMouseMove(e);
  }, [getCursor, onMouseMove]);

  // ─── Selected element ─────────────────────────────────────────────────────

  const selEl = selectedIds.length === 1 ? elements.find(e => e.id === selectedIds[0]) : null;
  const selCount = selectedIds.length;

  // ─── UI ───────────────────────────────────────────────────────────────────

  const TOOLS: { id: Tool; icon: React.ElementType; label: string; key: string }[] = [
    { id: 'select',   icon: MousePointer2, label: 'Select',    key: 'V' },
    { id: 'hand',     icon: Hand,          label: 'Pan',       key: 'H' },
    { id: 'rect',     icon: Square,        label: 'Rectangle', key: 'R' },
    { id: 'ellipse',  icon: Circle,        label: 'Ellipse',   key: 'E' },
    { id: 'diamond',  icon: Diamond,       label: 'Diamond',   key: 'D' },
    { id: 'triangle', icon: Triangle,      label: 'Triangle',  key: 'T' },
    { id: 'arrow',    icon: MoveRight,     label: 'Arrow',     key: 'A' },
    { id: 'line',     icon: Minus,         label: 'Line',      key: 'L' },
    { id: 'pen',      icon: Pen,           label: 'Draw',      key: 'P' },
    { id: 'text',     icon: Type,          label: 'Text',      key: 'X' },
    { id: 'sticky',   icon: StickyNote,    label: 'Sticky',    key: 'N' },
    { id: 'eraser',   icon: Eraser,        label: 'Eraser',    key: '⌫' },
  ];

  return (
    <div className="w-screen h-screen bg-white flex flex-col overflow-hidden" style={{ fontFamily: '-apple-system, Inter, sans-serif' }}>

      {/* ── Top bar (Excalidraw-style) ── */}
      <div className="flex items-center h-12 border-b border-stone-200 bg-white shrink-0 z-20 px-3 gap-2">
        {/* Logo left */}
        <div className="flex items-center gap-2 shrink-0">
          <a href="/tools" title="All Formly Tools">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm hover:shadow-orange-500/30 transition-shadow">
              <span className="text-white text-xs font-bold">D</span>
            </div>
          </a>
          <span className="text-sm font-semibold text-stone-700 hidden sm:block">Diagrify</span>
          {saveIndicator && <span className="text-[10px] text-emerald-500 font-medium animate-pulse">● saved</span>}
        </div>

        <div className="w-px h-6 bg-stone-200 shrink-0" />

        {/* Center: Horizontal tool bar */}
        <div className="flex flex-1 justify-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-0.5 bg-white border border-stone-200 rounded-xl px-1.5 py-1 shadow-sm shrink-0">
            {TOOLS.map(({ id, icon: Icon, label, key }) => (
              <button
                key={id}
                onClick={() => setTool(id)}
                title={`${label} (${key})`}
                className={`group relative flex items-center justify-center w-9 h-8 rounded-lg transition-all ${
                  tool === id
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon style={{ width: 16, height: 16 }} />
                <div className="absolute top-full mt-1.5 px-2 py-1 bg-stone-800 rounded-lg text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  {label} <span className="text-stone-400 font-mono ml-1">{key}</span>
                </div>
              </button>
            ))}
            <div className="w-px h-5 bg-stone-200 mx-1 shrink-0" />
            {(['clean', 'sketchy'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                title={m === 'clean' ? 'Clean mode' : 'Sketchy mode'}
                className={`flex items-center justify-center w-9 h-8 rounded-lg text-sm transition-all ${
                  mode === m ? 'bg-orange-100 text-orange-600' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
                }`}
              >
                {m === 'clean' ? '✦' : '✏️'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-stone-200 shrink-0" />

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showAI
                ? 'bg-orange-500 text-white'
                : 'bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Generate</span>
            <span className="sm:hidden">AI</span>
          </button>
          <button onClick={undo} disabled={histIdx <= 0} className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition-colors" title="Undo (Cmd+Z)">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 transition-colors" title="Redo">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-stone-200" />
          <button onClick={exportPNG} className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors" title="Export PNG">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearAll} className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Clear all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Canvas (full width, no sidebar) ── */}
      <div ref={wrapRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ cursor, display: 'block' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMoveWrap}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onDoubleClick={(e) => {
            const { sx, sy } = getCanvasXY(e);
            const { x: wx, y: wy } = toWorld(sx, sy);
            const el = findElement(wx, wy);
            if (el && el.type !== 'pen') {
              setEditingId(el.id);
              setEditText(el.text ?? el.label ?? '');
            }
          }}
        />

        {/* Inline text editor */}
        {editingId && (
          <div style={getEditorStyle()}>
            <textarea
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={finishEdit}
              onKeyDown={e => {
                if (e.key === 'Escape') { e.preventDefault(); finishEdit(); }
                if (e.key === 'Enter' && !e.shiftKey && !(e.currentTarget.closest('[data-text]'))) {
                  // Allow Enter in text boxes
                }
                e.stopPropagation();
              }}
              className="w-full h-full resize-none bg-transparent border-none outline-none text-gray-900 text-center"
              style={{
                fontFamily: mode === 'sketchy' ? "'Caveat', cursive" : "-apple-system, Inter, sans-serif",
                fontSize: `${(elements.find(e => e.id === editingId)?.fontSize ?? 15) * (mode === 'sketchy' ? 1.2 : 1) * zoom}px`,
                caretColor: '#f97316',
                padding: '4px',
              }}
              placeholder="Type here…"
            />
          </div>
        )}

        {/* Status bar — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs text-stone-400 pointer-events-none select-none bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 border border-stone-200 shadow-sm">
          <span>{Math.round(zoom * 100)}%</span>
          <span className="text-stone-300">·</span>
          <span>{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
          {selCount > 0 && <><span className="text-stone-300">·</span><span className="text-orange-600">{selCount} selected</span></>}
        </div>

        {/* Zoom controls — bottom left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-0.5 bg-white border border-stone-200 rounded-xl px-1 py-1 shadow-sm">
          <button onClick={() => setZoom(z => clamp(z * 0.83, 0.05, 8))} className="flex items-center justify-center w-8 h-7 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all" title="Zoom Out (-)">
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="flex items-center justify-center w-8 h-7 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all" title="Reset View">
            <Maximize2 style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={() => setZoom(z => clamp(z * 1.2, 0.05, 8))} className="flex items-center justify-center w-8 h-7 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all" title="Zoom In (+)">
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Shortcuts — bottom right */}
        <div className="absolute bottom-4 right-4 text-[10px] text-stone-400 pointer-events-none select-none">
          <span className="font-mono">Ctrl+Scroll</span> zoom · <span className="font-mono">H</span> pan · <span className="font-mono">Cmd+Z</span> undo
        </div>

        {/* ── Floating style panel (right side, only when element selected and AI panel closed) ── */}
        {selEl && !showAI && (
          <div className="absolute top-3 right-3 w-52 bg-white border border-stone-200 rounded-2xl shadow-lg z-10 overflow-hidden">
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Style</p>
              {/* Stroke */}
              <div>
                <p className="text-xs text-stone-500 mb-1.5">Stroke</p>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {STROKE_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => { setStroke(c); applyStylePatch({ stroke: c }); }}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: c, borderColor: stroke === c ? '#f97316' : '#e5e7eb' }}
                    />
                  ))}
                </div>
                <input type="color" value={stroke === 'transparent' ? '#1e1e2e' : stroke}
                  onChange={e => { setStroke(e.target.value); applyStylePatch({ stroke: e.target.value }); }}
                  className="w-7 h-7 rounded cursor-pointer border border-stone-200 bg-transparent" />
              </div>
              {/* Fill */}
              <div>
                <p className="text-xs text-stone-500 mb-1.5">Fill</p>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {FILL_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => { setFill(c); applyStylePatch({ fill: c }); }}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c === 'transparent' ? undefined : c, borderColor: fill === c ? '#f97316' : '#e5e7eb' }}
                    >
                      {c === 'transparent' && <span className="absolute inset-0 flex items-center justify-center text-red-400 text-[10px] font-bold">∅</span>}
                    </button>
                  ))}
                </div>
                <input type="color" value={fill === 'transparent' ? '#000000' : fill.slice(0, 7)}
                  onChange={e => { const v = e.target.value + '33'; setFill(v); applyStylePatch({ fill: v }); }}
                  className="w-7 h-7 rounded cursor-pointer border border-stone-200 bg-transparent" />
              </div>
              {/* Stroke width */}
              <div>
                <p className="text-xs text-stone-500 mb-1.5">Stroke width</p>
                <div className="flex gap-1">
                  {([{ label: 'Thin', w: 1 }, { label: 'Normal', w: 2 }, { label: 'Thick', w: 4 }] as { label: string; w: number }[]).map(({ label, w }) => (
                    <button
                      key={w}
                      onClick={() => { setLineWidth(w); applyStylePatch({ lineWidth: w }); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        lineWidth === w ? 'bg-orange-500 text-white border-orange-400' : 'text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Font size */}
              <div>
                <p className="text-xs text-stone-500 mb-1.5">Font size</p>
                <div className="flex gap-1 flex-wrap">
                  {[11, 13, 15, 18, 24, 32].map(s => (
                    <button
                      key={s}
                      onClick={() => { setFontSize(s); applyStylePatch({ fontSize: s }); }}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                        fontSize === s ? 'bg-orange-500 text-white border-orange-400' : 'text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 mt-1.5">
                  <button onClick={() => { setBold(b => !b); applyStylePatch({ bold: !bold }); }}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${bold ? 'bg-orange-500 text-white border-orange-400' : 'text-stone-500 border-stone-200 hover:text-stone-900'}`}>
                    <Bold style={{ width: 14, height: 14 }} />
                  </button>
                  <button onClick={() => { setItalic(it => !it); applyStylePatch({ italic: !italic }); }}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${italic ? 'bg-orange-500 text-white border-orange-400' : 'text-stone-500 border-stone-200 hover:text-stone-900'}`}>
                    <Italic style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
              {/* Opacity */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 shrink-0 w-12">Opacity</span>
                <input type="range" min="0" max="1" step="0.05" value={selEl.opacity}
                  onChange={e => { updateElement(selEl.id, { opacity: Number(e.target.value) }); }}
                  className="flex-1 accent-orange-500" />
                <span className="text-stone-400 w-8 text-right">{Math.round(selEl.opacity * 100)}%</span>
              </div>
              {/* Actions */}
              <div className="flex gap-1 pt-2 border-t border-stone-100">
                <button onClick={() => updateElement(selEl.id, { locked: !selEl.locked })}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors">
                  {selEl.locked ? <Unlock style={{ width: 12, height: 12 }} /> : <Lock style={{ width: 12, height: 12 }} />}
                  {selEl.locked ? 'Unlock' : 'Lock'}
                </button>
                <button onClick={deleteSelected}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto">
                  <Trash2 style={{ width: 12, height: 12 }} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI Panel (floating) ── */}
        {showAI && (
          <div className="absolute top-3 right-3 w-80 bg-white border border-stone-200 rounded-2xl shadow-2xl shadow-stone-200/80 z-30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-stone-900">AI Diagram Generator</span>
              </div>
              <button onClick={() => setShowAI(false)} className="text-stone-400 hover:text-stone-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                Describe a diagram — AI generates it with proper shapes and connections.
              </p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateDiagram(); e.stopPropagation(); }}
                placeholder="e.g. &quot;User login flow&quot;, &quot;CI/CD pipeline&quot;, &quot;Microservices architecture&quot;"
                className="w-full h-24 bg-stone-50 border border-stone-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm text-stone-800 resize-none outline-none placeholder-stone-400 transition-colors"
              />
              {aiError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                  <span>⚠</span> {aiError}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                {[
                  'Login flow',
                  'REST API',
                  'CI/CD pipeline',
                  'ERD schema',
                  'System design',
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => setAiPrompt(s)}
                    className="text-[11px] px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={generateDiagram}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {aiLoading ? (
                  <><span className="animate-spin">⟳</span> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Diagram</>
                )}
              </button>
              <p className="text-[10px] text-stone-400 mt-2 text-center">Powered by Groq AI · Cmd+Enter to generate</p>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {elements.length === 0 && !showAI && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="text-center">
              <p className="text-stone-300 text-sm mb-1">Pick a tool & start drawing</p>
              <p className="text-stone-200 text-xs">or click <span className="text-orange-300 font-medium">✦ AI Generate</span> above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
