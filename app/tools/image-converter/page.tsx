'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

/* ─── Types ─────────────────────────────────────────────────────────── */

type TargetFormat = 'jpeg' | 'png' | 'webp';

type FileStatus = 'ready' | 'converting' | 'done' | 'error';

interface ConvertFile {
  id: string;
  name: string;
  originalFile: File;
  originalSize: number;
  originalFormat: string;
  convertedBlob: Blob | null;
  convertedSize: number | null;
  status: FileStatus;
  error?: string;
  objectUrl: string; // for thumbnail
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getOriginalFormat(file: File): string {
  const mime = file.type;
  if (mime === 'image/jpeg') return 'JPG';
  if (mime === 'image/png') return 'PNG';
  if (mime === 'image/webp') return 'WebP';
  if (mime === 'image/gif') return 'GIF';
  if (mime === 'image/bmp') return 'BMP';
  if (mime === 'image/tiff') return 'TIFF';
  if (mime === 'image/avif') return 'AVIF';
  const ext = file.name.split('.').pop()?.toUpperCase() ?? 'IMG';
  return ext;
}

function getMimeType(format: TargetFormat): string {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return 'image/webp';
}

function getExtension(format: TargetFormat): string {
  if (format === 'jpeg') return 'jpg';
  if (format === 'png') return 'png';
  return 'webp';
}

function convertImage(file: File, targetFormat: TargetFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }

      // For JPEG, fill background white (no transparency support)
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const mime = getMimeType(targetFormat);
      // PNG is lossless; quality only applies to JPEG/WebP
      const q = targetFormat === 'png' ? undefined : quality / 100;
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
        },
        mime,
        q,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/* ─── Component ──────────────────────────────────────────────────────── */

export default function ImageConverterPage() {
  const [files, setFiles] = useState<ConvertFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('webp');
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Add files ── */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;

    const newEntries: ConvertFile[] = arr.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      originalFile: f,
      originalSize: f.size,
      originalFormat: getOriginalFormat(f),
      convertedBlob: null,
      convertedSize: null,
      status: 'ready',
      objectUrl: URL.createObjectURL(f),
    }));

    setFiles(prev => [...prev, ...newEntries]);
  }, []);

  /* ── Drag & drop handlers ── */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  /* ── Convert single file ── */
  async function convertOne(id: string, fmt: TargetFormat, q: number) {
    const entry = files.find(f => f.id === id);
    if (!entry) return;

    setFiles(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'converting', convertedBlob: null, convertedSize: null } : f),
    );

    try {
      const blob = await convertImage(entry.originalFile, fmt, q);
      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, convertedBlob: blob, convertedSize: blob.size, status: 'done' }
            : f,
        ),
      );
    } catch (err) {
      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' }
            : f,
        ),
      );
    }
  }

  /* ── Convert all ── */
  async function convertAll() {
    for (const f of files) {
      if (f.status !== 'converting') {
        await convertOne(f.id, targetFormat, quality);
      }
    }
  }

  /* ── Download single file ── */
  function downloadOne(entry: ConvertFile) {
    if (!entry.convertedBlob) return;
    const base = entry.name.replace(/\.[^/.]+$/, '');
    const ext = getExtension(targetFormat);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(entry.convertedBlob);
    a.download = `${base}.${ext}`;
    a.click();
  }

  /* ── Remove file ── */
  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  const doneCount = files.filter(f => f.status === 'done').length;
  const isConverting = files.some(f => f.status === 'converting');
  const showQuality = targetFormat !== 'png';

  return (
    <ToolLayout
        toolSlug="image-converter"
      title="Image Converter"
      icon="🔄"
      description="Convert images between JPG, PNG, and WebP formats instantly in your browser. No upload, 100% private."
      relatedTools={[
        { name: 'Image Compressor', href: '/tools/compress-image', icon: '🗜️' },
        { name: 'PDF to Markdown', href: '/tools/pdf-to-markdown', icon: '📄' },
        { name: 'QR Code Generator', href: '/tools/qr-code', icon: '⬛' },
      ]}
    >
      <div className="space-y-6">

        {/* ── Drop Zone ── */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10 text-center select-none ${
            isDragging
              ? 'border-orange-400 bg-orange-50'
              : 'border-stone-300 bg-white hover:border-orange-300 hover:bg-orange-50/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && addFiles(e.target.files)}
          />
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-stone-700 font-semibold text-lg">
            Drag &amp; drop images here or click to browse
          </p>
          <p className="text-stone-400 text-sm mt-1">
            Supports JPG, PNG, WebP, GIF, BMP — multiple files supported
          </p>
        </div>

        {/* ── Conversion Settings ── */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
            Conversion Settings
          </h2>

          {/* Target format */}
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">
              Convert to
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['jpeg', 'png', 'webp'] as TargetFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                    targetFormat === f
                      ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {f === 'jpeg' ? 'JPEG' : f.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">
              {targetFormat === 'webp' && 'WebP — best compression, widely supported in modern browsers.'}
              {targetFormat === 'jpeg' && 'JPEG — universal compatibility, great for photos. Transparent areas become white.'}
              {targetFormat === 'png' && 'PNG — lossless with transparency support. Larger file size.'}
            </p>
          </div>

          {/* Quality slider (JPEG / WebP only) */}
          {showQuality && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-stone-700">Quality</label>
                <span className="text-sm font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          )}

          {/* Convert All button */}
          {files.length > 0 && (
            <button
              onClick={convertAll}
              disabled={isConverting}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {isConverting
                ? 'Converting…'
                : files.length === 1
                ? `Convert to ${targetFormat === 'jpeg' ? 'JPEG' : targetFormat.toUpperCase()}`
                : `Convert All (${files.length}) to ${targetFormat === 'jpeg' ? 'JPEG' : targetFormat.toUpperCase()}`}
            </button>
          )}
        </div>

        {/* ── File list ── */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Files ({files.length})
                {doneCount > 0 && (
                  <span className="ml-2 text-emerald-600">{doneCount} converted</span>
                )}
              </p>
              {files.length > 0 && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-stone-400 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <ul className="divide-y divide-stone-100">
              {files.map(entry => (
                <li key={entry.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-stone-50 transition-colors">

                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                    <img
                      src={entry.objectUrl}
                      alt={entry.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{entry.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-400">
                      <span className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">
                        {entry.originalFormat}
                      </span>
                      <span>{formatBytes(entry.originalSize)}</span>
                      {entry.status === 'done' && entry.convertedSize != null && (
                        <>
                          <span className="text-stone-300">→</span>
                          <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                            {targetFormat === 'jpeg' ? 'JPG' : targetFormat.toUpperCase()}
                          </span>
                          <span>{formatBytes(entry.convertedSize)}</span>
                          {entry.convertedSize < entry.originalSize && (
                            <span className="text-emerald-600 font-semibold">
                              −{Math.round(((entry.originalSize - entry.convertedSize) / entry.originalSize) * 100)}%
                            </span>
                          )}
                          {entry.convertedSize > entry.originalSize && (
                            <span className="text-amber-500 font-semibold">
                              +{Math.round(((entry.convertedSize - entry.originalSize) / entry.originalSize) * 100)}%
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {entry.status === 'ready' && (
                      <>
                        <span className="text-xs text-stone-400">Ready</span>
                        <button
                          onClick={() => convertOne(entry.id, targetFormat, quality)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
                        >
                          Convert
                        </button>
                      </>
                    )}
                    {entry.status === 'converting' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-orange-500">Converting…</span>
                      </div>
                    )}
                    {entry.status === 'done' && (
                      <>
                        <span className="text-xs text-emerald-600 font-semibold">✓ Done</span>
                        <button
                          onClick={() => downloadOne(entry)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center gap-1"
                        >
                          ⬇ Download
                        </button>
                        <button
                          onClick={() => convertOne(entry.id, targetFormat, quality)}
                          className="text-xs px-2 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
                          title="Re-convert"
                        >
                          ↺
                        </button>
                      </>
                    )}
                    {entry.status === 'error' && (
                      <>
                        <span className="text-xs text-red-500" title={entry.error}>Error</span>
                        <button
                          onClick={() => convertOne(entry.id, targetFormat, quality)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    )}

                    {/* Remove */}
                    <button
                      onClick={() => removeFile(entry.id)}
                      className="text-stone-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Download all (if multiple done) */}
            {doneCount > 1 && (
              <div className="px-5 py-4 border-t border-stone-100 bg-stone-50">
                <p className="text-xs text-stone-500 mb-3">
                  {doneCount} files converted — download individually above, or use the buttons below.
                </p>
                <div className="flex flex-wrap gap-2">
                  {files.filter(f => f.status === 'done').map(f => (
                    <button
                      key={f.id}
                      onClick={() => downloadOne(f)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-600 transition-colors truncate max-w-[200px]"
                      title={`Download ${f.name.replace(/\.[^/.]+$/, '')}.${getExtension(targetFormat)}`}
                    >
                      ⬇ {f.name.replace(/\.[^/.]+$/, '').slice(0, 20)}.{getExtension(targetFormat)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {files.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
            <p className="text-stone-400 text-sm">
              Drop images above to get started. Convert between JPG, PNG, and WebP instantly.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center max-w-sm mx-auto">
              {[
                { icon: '🔒', label: 'No upload', sub: 'Works in browser' },
                { icon: '⚡', label: 'Instant', sub: 'Canvas-based' },
                { icon: '📦', label: 'Batch', sub: 'Multiple files' },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-stone-50 p-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-stone-700">{item.label}</p>
                  <p className="text-xs text-stone-400">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Format comparison table */}
            <div className="mt-6 text-left rounded-xl border border-stone-100 overflow-hidden max-w-md mx-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="px-3 py-2 text-left text-stone-500 font-semibold">Format</th>
                    <th className="px-3 py-2 text-left text-stone-500 font-semibold">Best for</th>
                    <th className="px-3 py-2 text-left text-stone-500 font-semibold">Transparency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="px-3 py-2 font-medium text-stone-700">WebP</td>
                    <td className="px-3 py-2 text-stone-500">Web, all uses</td>
                    <td className="px-3 py-2 text-emerald-600">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-stone-700">PNG</td>
                    <td className="px-3 py-2 text-stone-500">Logos, icons</td>
                    <td className="px-3 py-2 text-emerald-600">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-stone-700">JPEG</td>
                    <td className="px-3 py-2 text-stone-500">Photos, prints</td>
                    <td className="px-3 py-2 text-stone-400">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
