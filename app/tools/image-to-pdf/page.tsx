'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Upload, X, ChevronUp, ChevronDown, Download, Loader2, ImageIcon, AlertCircle, FileDown } from 'lucide-react';

/* ── Types ── */
interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

type PageSize = 'A4' | 'Letter' | 'Fit';
type Orientation = 'Portrait' | 'Landscape';
type Margin = 'None' | 'Small' | 'Medium';
type Status = 'idle' | 'converting' | 'done';

/* ── Constants ── */
const RELATED = [
  { name: 'Merge PDF', href: '/tools/merge-pdf', icon: '📎' },
  { name: 'Digital Signature', href: '/tools/digital-signature', icon: '✍️' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
];

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/* ── WebP → PNG canvas helper ── */
async function webpToPngArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => blob!.arrayBuffer().then(resolve),
        'image/png',
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

/* ── Core conversion ── */
async function convertToPDF(
  imageFiles: File[],
  pageSize: PageSize,
  orientation: Orientation,
  margin: Margin,
): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    let arrayBuffer: ArrayBuffer;
    let img;

    if (file.type === 'image/jpeg') {
      arrayBuffer = await file.arrayBuffer();
      img = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/webp') {
      arrayBuffer = await webpToPngArrayBuffer(file);
      img = await pdfDoc.embedPng(arrayBuffer);
    } else {
      arrayBuffer = await file.arrayBuffer();
      img = await pdfDoc.embedPng(arrayBuffer);
    }

    let width: number;
    let height: number;

    if (pageSize === 'A4') {
      width = 595; height = 842;
    } else if (pageSize === 'Letter') {
      width = 612; height = 792;
    } else {
      width = img.width; height = img.height;
    }

    if (orientation === 'Landscape') {
      [width, height] = [height, width];
    }

    const page = pdfDoc.addPage([width, height]);
    const m = margin === 'None' ? 0 : margin === 'Small' ? 20 : 40;
    const drawW = width - 2 * m;
    const drawH = height - 2 * m;
    const scale = Math.min(drawW / img.width, drawH / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const x = m + (drawW - drawWidth) / 2;
    const y = m + (drawH - drawHeight) / 2;
    page.drawImage(img, { x, y, width: drawWidth, height: drawHeight });
  }

  return await pdfDoc.save();
}

/* ── Component ── */
export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('Portrait');
  const [margin, setMargin] = useState<Margin>('Small');
  const [status, setStatus] = useState<Status>('idle');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Add images ── */
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => ACCEPTED.includes(f.type));
    if (valid.length === 0) {
      setError('Only JPG, PNG, and WebP images are supported.');
      return;
    }
    setError('');
    setPdfBytes(null);
    setStatus('idle');
    const newItems: ImageItem[] = valid.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
    setPdfBytes(null);
    setStatus('idle');
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
    setPdfBytes(null);
    setStatus('idle');
  }

  function moveDown(idx: number) {
    setImages((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
    setPdfBytes(null);
    setStatus('idle');
  }

  /* ── Convert ── */
  async function handleConvert() {
    if (images.length === 0) return;
    setStatus('converting');
    setError('');
    try {
      const bytes = await convertToPDF(
        images.map((i) => i.file),
        pageSize,
        orientation,
        margin,
      );
      setPdfBytes(bytes);
      setStatus('done');
    } catch (err) {
      setError('Conversion failed. Please check your images and try again.');
      setStatus('idle');
      console.error(err);
    }
  }

  /* ── Download ── */
  function handleDownload() {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `images-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <ToolLayout
      title="Image to PDF"
      icon="🖼️"
      description="Convert JPG, PNG, and WebP images to a PDF document. Add multiple images, reorder them, and download instantly. Free, no upload."
      relatedTools={RELATED}
    >
      <div className="space-y-5">

        {/* Drop zone */}
        <div className="card">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">
            Add Images
          </h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
              dragOver
                ? 'border-orange-400 bg-orange-50'
                : 'border-stone-300 hover:border-orange-400 hover:bg-orange-50/40'
            }`}
          >
            <ImageIcon className="w-8 h-8 text-stone-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-stone-700">
                Drop images here, or click to browse
              </p>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG, WebP · Multiple files supported</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-stone-700">
                Images ({images.length})
              </h2>
              <button
                onClick={() => {
                  images.forEach((i) => URL.revokeObjectURL(i.preview));
                  setImages([]);
                  setPdfBytes(null);
                  setStatus('idle');
                }}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-stone-200 bg-stone-50 group"
                >
                  {/* Thumbnail */}
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-12 h-12 object-cover rounded-md shrink-0 border border-stone-200"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {img.file.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formatSize(img.file.size)} · {img.file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>

                  {/* Page number badge */}
                  <span className="text-xs font-medium text-stone-400 w-8 text-center shrink-0">
                    p.{idx + 1}
                  </span>

                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-stone-300 text-sm text-stone-500 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50/40 transition-all"
            >
              <Upload className="w-4 h-4" />
              Add more images
            </button>
          </div>
        )}

        {/* Options */}
        {images.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">PDF Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page size */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(e.target.value as PageSize); setPdfBytes(null); setStatus('idle'); }}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="A4">A4 (595 × 842 pt)</option>
                  <option value="Letter">Letter (612 × 792 pt)</option>
                  <option value="Fit">Fit to Image</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => { setOrientation(e.target.value as Orientation); setPdfBytes(null); setStatus('idle'); }}
                  disabled={pageSize === 'Fit'}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Portrait">Portrait</option>
                  <option value="Landscape">Landscape</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  Margin
                </label>
                <select
                  value={margin}
                  onChange={(e) => { setMargin(e.target.value as Margin); setPdfBytes(null); setStatus('idle'); }}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="None">None (0 pt)</option>
                  <option value="Small">Small (20 pt)</option>
                  <option value="Medium">Medium (40 pt)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Convert button */}
        {images.length > 0 && status !== 'done' && (
          <button
            onClick={handleConvert}
            disabled={status === 'converting'}
            className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-70"
          >
            {status === 'converting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting {images.length} image{images.length !== 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" />
                Convert {images.length} Image{images.length !== 1 ? 's' : ''} to PDF
              </>
            )}
          </button>
        )}

        {/* Result */}
        {status === 'done' && pdfBytes && (
          <div className="card border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-800">PDF ready!</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {images.length} page{images.length !== 1 ? 's' : ''} · {formatSize(pdfBytes.byteLength)}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => { setPdfBytes(null); setStatus('idle'); }}
                  className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Convert again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        {images.length === 0 && (
          <div className="card bg-stone-50 border-stone-200">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">How it works</h3>
            <ol className="space-y-2 text-sm text-stone-500">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">1</span>
                Upload one or more JPG, PNG, or WebP images
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">2</span>
                Reorder pages using the up/down arrows
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">3</span>
                Choose page size, orientation, and margin
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">4</span>
                Click Convert — PDF downloads instantly in your browser
              </li>
            </ol>
            <p className="text-xs text-stone-400 mt-3">
              100% client-side · No upload · No file size limit
            </p>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
