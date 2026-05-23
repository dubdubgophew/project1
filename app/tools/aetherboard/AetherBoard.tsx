'use client';

import {
  useRef, useState, useEffect, useCallback, useLayoutEffect,
} from 'react';
import {
  MousePointer2, Hand, Square, Circle, Diamond, Triangle,
  Minus, MoveRight, Type, Pen, StickyNote, Eraser,
  Undo2, Redo2, Trash2, Download, Upload, ZoomIn, ZoomOut,
  Maximize2, Sparkles, X, ChevronDown, AlignCenter,
  Bold, Italic, Lock, Unlock, Copy, Layers, Settings,
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
  type:    'move' | 'resize' | 'draw' | 'pan' | 'select-box';
  startX:  number;
  startY:  number;
  origX?:  number;
  origY?:  number;
  origW?:  number;
  origH?:  number;
  handle?: string;
  ids?:    string[];
  snapX?:  number[];
  snapY?:  number[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HANDLE_SIZE   = 8;
const MIN_SIZE      = 10;
const GRID_SIZE     = 20;
const SNAP_DIST     = 8;

const STROKE_PRESETS = ['#f9fafb', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#000000'];
const FILL_PRESETS   = ['transparent', '#7c3aed20', '#3b82f620', '#10b98120', '#f59e0b20', '#f43f5e20', '#ffffff10', '#1f2937'];

const DEFAULT_STYLE: Pick<Elem, 'stroke' | 'fill' | 'lineWidth' | 'opacity' | 'fontSize'> = {
  stroke:    '#a855f7',
  fill:      '#7c3aed20',
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
    ctx.fillStyle = '#030712';
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
    // Dots
    const dotSize = mode === 'sketchy' ? 1.5 : 1;
    ctx.fillStyle = mode === 'sketchy' ? '#2d2540' : '#1f2937';
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
  ctx.font = `${style}${weight}${fs}px -apple-system, Inter, sans-serif`;
  ctx.fillStyle = mode === 'blueprint' ? '#93c5fd' : (el.fill === 'transparent' ? el.stroke : '#f9fafb');
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
      ctx.fillStyle = el.fill === 'transparent' ? '#fef08a' : el.fill;
      ctx.strokeStyle = mode === 'blueprint' ? '#60a5fa' : (el.stroke === '#f9fafb' ? '#ca8a04' : el.stroke);
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
      ctx.font = `${st}${weight}${fs}px -apple-system, Inter, sans-serif`;
      ctx.fillStyle = mode === 'blueprint' ? '#93c5fd' : el.stroke;
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
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
  ctx.setLineDash([]);

  const hs = HANDLE_SIZE / zoom;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#7c3aed';
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
  ctx.fillStyle = '#7c3aed18';
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 2]);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AetherBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const [elements, setElements] = useState<Elem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool,    setTool]    = useState<Tool>('select');
  const [mode,    setMode]    = useState<Mode>('clean');
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

  // Drawing state (mutable, no re-render needed)
  const drag    = useRef<DragState | null>(null);
  const drawing = useRef<Elem | null>(null);
  const selectBox = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const lastPan = useRef<Pt>({ x: 0, y: 0 });

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
        if (e.shiftKey) {
          setSelectedIds(prev =>
            prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]
          );
        } else {
          if (!selectedIds.includes(el.id)) setSelectedIds([el.id]);
        }
        const snapX = elements.filter(x => x.id !== el.id).flatMap(x => [x.x, x.x + x.w, x.x + x.w / 2]);
        const snapY = elements.filter(x => x.id !== el.id).flatMap(x => [x.y, x.y + x.h, x.y + x.h / 2]);
        const ids = e.shiftKey ? [...selectedIds, el.id] : selectedIds.includes(el.id) ? selectedIds : [el.id];
        drag.current = {
          type: 'move', startX: wx, startY: wy,
          origX: el.x, origY: el.y,
          ids,
          snapX, snapY,
        };
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
        let nx = (d.origX ?? el.x) + dx;
        let ny = (d.origY ?? el.y) + dy;
        // Snap to grid
        if (e.shiftKey) {
          nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
          ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
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
      }
      if ((el.type === 'pen') && (!el.pts || el.pts.length < 4)) {
        drawing.current = null;
        return;
      }
      drawing.current = null;
      addElements([el]);

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
      if (mod && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key === 'y') { e.preventDefault(); redo(); return; }
      if (mod && e.key === 'a') { e.preventDefault(); setSelectedIds(elements.map(el => el.id)); return; }
      if (mod && e.key === 'c') { /* copy — could implement later */ return; }
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
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingId, undo, redo, deleteSelected, selectedIds, elements]);

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
      const res = await fetch('/api/tools/aetherboard', {
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
        newElems.forEach(e => { e.x += offX; e.y += offY; });
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
    a.href = url; a.download = 'aetherboard.png'; a.click();
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
    svg += `<rect x="${minX}" y="${minY}" width="${svgW}" height="${svgH}" fill="#030712"/>`;
    elements.forEach(el => {
      if (el.type === 'rect' || el.type === 'sticky') {
        svg += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.lineWidth}" rx="4"/>`;
        if (el.label) svg += `<text x="${el.x + el.w/2}" y="${el.y + el.h/2}" text-anchor="middle" dominant-baseline="middle" fill="#f9fafb" font-size="${el.fontSize ?? 15}" font-family="sans-serif">${el.label}</text>`;
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
    a.href = url; a.download = 'aetherboard.svg'; a.click();
    URL.revokeObjectURL(url);
  }, [elements]);

  const clearAll = useCallback(() => {
    setElements([]);
    pushHistory([]);
    setSelectedIds([]);
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
    <div className="w-screen h-screen bg-[#030712] flex flex-col overflow-hidden" style={{ fontFamily: '-apple-system, Inter, sans-serif' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-[#1f2937] bg-[#0a0f1a] shrink-0 z-20">
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <a href="/tools" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-xs">
            <Home className="w-3.5 h-3.5" />
            <span>Formly</span>
          </a>
          <span className="text-gray-700">/</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-white">AetherBoard</span>
            <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-1.5 py-0.5 rounded-full">BETA</span>
          </div>
        </div>

        {/* Center: mode selector */}
        <div className="flex items-center gap-1 bg-[#111827] border border-[#1f2937] rounded-xl p-1">
          {(['clean', 'sketchy', 'blueprint'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                mode === m
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              {m === 'clean' ? '✦ Clean' : m === 'sketchy' ? '✏️ Sketchy' : '📐 Blueprint'}
            </button>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showAI
                ? 'bg-violet-600 text-white'
                : 'bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/25'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate
          </button>
          <button onClick={undo} disabled={histIdx <= 0} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1f2937] disabled:opacity-30 transition-colors" title="Undo (Cmd+Z)">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1f2937] disabled:opacity-30 transition-colors" title="Redo (Cmd+Shift+Z)">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#1f2937]" />
          <button onClick={exportPNG} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1f2937] transition-colors" title="Export PNG">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={exportSVG} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1f2937] transition-colors" title="Export SVG">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button onClick={clearAll} className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Clear all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Left toolbar ── */}
        <div className="flex flex-col items-center gap-1 w-14 py-3 border-r border-[#1f2937] bg-[#0a0f1a] shrink-0 z-10 overflow-y-auto">
          {TOOLS.map(({ id, icon: Icon, label, key }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              title={`${label} (${key})`}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                tool === id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-gray-500 hover:bg-[#1f2937] hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f2937] border border-[#374151] rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                {label}
                <span className="ml-1.5 text-gray-500 font-mono">{key}</span>
              </div>
            </button>
          ))}

          <div className="w-8 h-px bg-[#1f2937] my-1" />

          <button
            onClick={() => setShowLayers(l => !l)}
            title="Layers"
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              showLayers ? 'bg-[#1f2937] text-violet-400' : 'text-gray-500 hover:bg-[#1f2937] hover:text-white'
            }`}
          >
            <Layers style={{ width: 18, height: 18 }} />
          </button>

          {/* Zoom controls */}
          <div className="w-8 h-px bg-[#1f2937] my-1" />
          <button onClick={() => setZoom(z => clamp(z * 1.2, 0.05, 8))} className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-[#1f2937] hover:text-white transition-all" title="Zoom In (+)">
            <ZoomIn style={{ width: 18, height: 18 }} />
          </button>
          <div className="text-[10px] text-gray-600 font-mono">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(z => clamp(z * 0.83, 0.05, 8))} className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-[#1f2937] hover:text-white transition-all" title="Zoom Out (-)">
            <ZoomOut style={{ width: 18, height: 18 }} />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-[#1f2937] hover:text-white transition-all" title="Reset View (Cmd+0)">
            <Maximize2 style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* ── Canvas area ── */}
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
                className="w-full h-full resize-none bg-transparent border-none outline-none text-white text-center"
                style={{
                  fontSize: `${(elements.find(e => e.id === editingId)?.fontSize ?? 15) * zoom}px`,
                  fontFamily: '-apple-system, Inter, sans-serif',
                  caretColor: '#a855f7',
                  padding: '4px',
                }}
                placeholder="Type here…"
              />
            </div>
          )}

          {/* Element count */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-gray-600 pointer-events-none select-none">
            <span>{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
            {selCount > 0 && <span className="text-violet-400">{selCount} selected</span>}
          </div>
        </div>

        {/* ── Right panel (style + properties) ── */}
        <div className="w-60 border-l border-[#1f2937] bg-[#0a0f1a] shrink-0 flex flex-col overflow-y-auto z-10">

          {/* Style panel */}
          <div className="p-4 border-b border-[#1f2937]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Style</p>

            {/* Stroke color */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Stroke</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {STROKE_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setStroke(c); applyStylePatch({ stroke: c }); }}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c === 'transparent' ? undefined : c, borderColor: stroke === c ? '#a855f7' : '#374151' }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={stroke === 'transparent' ? '#f9fafb' : stroke}
                  onChange={e => { setStroke(e.target.value); applyStylePatch({ stroke: e.target.value }); }}
                  className="w-7 h-7 rounded cursor-pointer border border-[#374151] bg-transparent"
                />
                <input
                  type="text"
                  value={stroke}
                  onChange={e => { setStroke(e.target.value); applyStylePatch({ stroke: e.target.value }); }}
                  className="flex-1 text-xs bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300 font-mono"
                />
              </div>
            </div>

            {/* Fill color */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Fill</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {FILL_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setFill(c); applyStylePatch({ fill: c }); }}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 relative"
                    style={{
                      backgroundColor: c === 'transparent' ? undefined : c,
                      borderColor: fill === c ? '#a855f7' : '#374151',
                    }}
                    title={c}
                  >
                    {c === 'transparent' && <span className="absolute inset-0 flex items-center justify-center text-red-400 text-[10px] font-bold">∅</span>}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fill === 'transparent' ? '#000000' : fill.slice(0, 7)}
                  onChange={e => { const v = e.target.value + '33'; setFill(v); applyStylePatch({ fill: v }); }}
                  className="w-7 h-7 rounded cursor-pointer border border-[#374151] bg-transparent"
                />
                <input
                  type="text"
                  value={fill}
                  onChange={e => { setFill(e.target.value); applyStylePatch({ fill: e.target.value }); }}
                  className="flex-1 text-xs bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300 font-mono"
                />
              </div>
            </div>

            {/* Stroke width */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Stroke width</p>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 8].map(w => (
                  <button
                    key={w}
                    onClick={() => { setLineWidth(w); applyStylePatch({ lineWidth: w }); }}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      lineWidth === w ? 'bg-violet-600 text-white border-violet-500' : 'text-gray-400 border-[#1f2937] hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size (for text/shapes with labels) */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Font size</p>
              <div className="flex gap-1">
                {[11, 13, 15, 18, 24, 32].map(s => (
                  <button
                    key={s}
                    onClick={() => { setFontSize(s); applyStylePatch({ fontSize: s }); }}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      fontSize === s ? 'bg-violet-600 text-white border-violet-500' : 'text-gray-400 border-[#1f2937] hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {/* Bold / Italic */}
              <div className="flex gap-1 mt-2">
                <button onClick={() => { setBold(b => !b); applyStylePatch({ bold: !bold }); }}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${bold ? 'bg-violet-600 text-white border-violet-500' : 'text-gray-400 border-[#1f2937] hover:text-white'}`}>
                  <Bold style={{ width: 14, height: 14 }} />
                </button>
                <button onClick={() => { setItalic(it => !it); applyStylePatch({ italic: !italic }); }}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${italic ? 'bg-violet-600 text-white border-violet-500' : 'text-gray-400 border-[#1f2937] hover:text-white'}`}>
                  <Italic style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>

          {/* Selection properties */}
          {selEl && (
            <div className="p-4 border-b border-[#1f2937]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Element</p>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <label className="text-gray-500 w-6">X</label>
                  <input type="number" value={Math.round(selEl.x)} onChange={e => updateElement(selEl.id, { x: Number(e.target.value) })}
                    className="flex-1 bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300 font-mono" />
                </div>
                <div className="flex gap-2">
                  <label className="text-gray-500 w-6">Y</label>
                  <input type="number" value={Math.round(selEl.y)} onChange={e => updateElement(selEl.id, { y: Number(e.target.value) })}
                    className="flex-1 bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300 font-mono" />
                </div>
                {selEl.type !== 'pen' && selEl.type !== 'arrow' && selEl.type !== 'line' && (
                  <>
                    <div className="flex gap-2">
                      <label className="text-gray-500 w-6">W</label>
                      <input type="number" value={Math.round(selEl.w)} onChange={e => updateElement(selEl.id, { w: Math.max(10, Number(e.target.value)) })}
                        className="flex-1 bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300 font-mono" />
                    </div>
                    <div className="flex gap-2">
                      <label className="text-gray-500 w-6">H</label>
                      <input type="number" value={Math.round(selEl.h)} onChange={e => updateElement(selEl.id, { h: Math.max(10, Number(e.target.value)) })}
                        className="flex-1 bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300 font-mono" />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <label className="text-gray-500 w-12">Opacity</label>
                  <input type="range" min="0" max="1" step="0.05" value={selEl.opacity}
                    onChange={e => { updateElement(selEl.id, { opacity: Number(e.target.value) }); }}
                    className="flex-1 accent-violet-500" />
                  <span className="text-gray-400 w-8 text-right">{Math.round(selEl.opacity * 100)}%</span>
                </div>
                {selEl.label !== undefined && (
                  <div>
                    <label className="text-gray-500 block mb-1">Label</label>
                    <input type="text" value={selEl.label ?? ''}
                      onChange={e => updateElement(selEl.id, { label: e.target.value })}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded px-2 py-1 text-gray-300"
                      placeholder="Label…"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 mt-3">
                <button onClick={() => { const el = elements.find(x => x.id === selEl.id); if (el) addElements([{ ...el, id: uid(), x: el.x + 20, y: el.y + 20 }]); }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1f2937] transition-colors">
                  <Copy style={{ width: 12, height: 12 }} /> Dupe
                </button>
                <button onClick={() => updateElement(selEl.id, { locked: !selEl.locked })}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1f2937] transition-colors">
                  {selEl.locked ? <Unlock style={{ width: 12, height: 12 }} /> : <Lock style={{ width: 12, height: 12 }} />}
                  {selEl.locked ? 'Unlock' : 'Lock'}
                </button>
                <button onClick={deleteSelected}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto">
                  <Trash2 style={{ width: 12, height: 12 }} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Layers panel */}
          {showLayers && (
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Layers ({elements.length})</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {[...elements].reverse().map((el, i) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedIds([el.id])}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                      selectedIds.includes(el.id) ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'
                    }`}
                  >
                    <span className="text-gray-600 font-mono w-4">{elements.length - i}</span>
                    <span className="capitalize">{el.type}</span>
                    <span className="text-gray-600 truncate ml-auto">{el.label ?? el.text ?? ''}</span>
                    {el.locked && <Lock style={{ width: 10, height: 10 }} className="text-amber-400 shrink-0" />}
                  </div>
                ))}
                {elements.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-4">No elements yet</p>
                )}
              </div>
            </div>
          )}

          {/* Quick shapes */}
          {!showLayers && elements.length === 0 && (
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick start</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                {[
                  '⌨️ Press R for rectangle',
                  '⌨️ Press E for ellipse',
                  '⌨️ Press A for arrow',
                  '⌨️ Press P to draw freely',
                  '⌨️ Press N for sticky note',
                  '🤖 Click AI Generate above',
                  '🖱️ Scroll to zoom, drag to pan',
                ].map(tip => (
                  <p key={tip} className="leading-relaxed">{tip}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── AI Panel (floating overlay) ── */}
        {showAI && (
          <div className="absolute top-4 right-[248px] w-80 bg-[#0d1117] border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 z-30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937] bg-gradient-to-r from-violet-900/20 to-purple-900/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">AI Diagram Generator</span>
              </div>
              <button onClick={() => setShowAI(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                Describe a diagram in plain English — AetherBoard&apos;s AI will generate it instantly.
              </p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateDiagram(); e.stopPropagation(); }}
                placeholder="e.g. &quot;User registration flow with email verification&quot;, &quot;Microservices architecture with API gateway&quot;, &quot;Database schema for e-commerce&quot;"
                className="w-full h-28 bg-[#111827] border border-[#1f2937] focus:border-violet-500/50 rounded-xl px-3 py-2.5 text-sm text-gray-200 resize-none outline-none placeholder-gray-600 transition-colors"
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
                  'Mind map',
                  'ERD schema',
                  'System design',
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => setAiPrompt(s)}
                    className="text-[11px] px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={generateDiagram}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {aiLoading ? (
                  <><span className="animate-spin">⟳</span> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Diagram</>
                )}
              </button>
              <p className="text-[10px] text-gray-600 mt-2 text-center">Powered by Groq AI · Cmd+Enter to generate</p>
            </div>
          </div>
        )}

        {/* Layers button shortcut */}
        <div className="absolute bottom-4 left-20 flex items-center gap-1 text-[10px] text-gray-700 pointer-events-none select-none">
          <span className="font-mono">Ctrl+Scroll</span>
          <span>zoom ·</span>
          <span className="font-mono">H</span>
          <span>pan ·</span>
          <span className="font-mono">Cmd+Z</span>
          <span>undo</span>
        </div>
      </div>
    </div>
  );
}
