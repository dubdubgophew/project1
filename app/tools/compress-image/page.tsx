'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

/* ─── Types ─────────────────────────────────────────────────────────── */

type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp';

interface CompressedFile {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedSize: number | null;
  previewUrl: string | null;
  originalUrl: string;
  status: 'ready' | 'compressing' | 'done' | 'error';
  error?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getMimeType(format: OutputFormat, originalFile: File): string {
  if (format === 'original') return originalFile.type || 'image/jpeg';
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return 'image/webp';
}

function getExtension(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

function compressImage(
  file: File,
  quality: number,
  format: OutputFormat,
): Promise<Blob> {
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

      // For PNG output with transparency, fill transparent; for JPEG fill white
      const mime = getMimeType(format, file);
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      // PNG is lossless — quality param ignored by browser
      const q = mime === 'image/png' ? undefined : quality / 100;
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
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

export default function CompressImagePage() {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>('original');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Add files ── */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;

    const newEntries: CompressedFile[] = arr.map(f => ({
      id: crypto.randomUUID(),
      originalFile: f,
      originalSize: f.size,
      compressedBlob: null,
      compressedSize: null,
      previewUrl: null,
      originalUrl: URL.createObjectURL(f),
      status: 'ready',
    }));

    setFiles(prev => {
      const updated = [...prev, ...newEntries];
      return updated;
    });

    // Auto-select first if nothing selected
    setSelectedId(prev => prev ?? newEntries[0].id);
  }, []);

  /* ── Drag & drop ── */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  /* ── Compress one file ── */
  async function compressOne(id: string) {
    setFiles(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'compressing' } : f),
    );

    const entry = files.find(f => f.id === id);
    if (!entry) return;

    try {
      const blob = await compressImage(entry.originalFile, quality, format);
      const previewUrl = URL.createObjectURL(blob);

      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, compressedBlob: blob, compressedSize: blob.size, previewUrl, status: 'done' }
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

  /* ── Compress all ── */
  async function compressAll() {
    for (const f of files) {
      if (f.status === 'ready' || f.status === 'error') {
        await compressOne(f.id);
      }
    }
  }

  /* ── Download one ── */
  function downloadFile(entry: CompressedFile) {
    if (!entry.compressedBlob) return;
    const mime = getMimeType(format, entry.originalFile);
    const ext = getExtension(mime);
    const base = entry.originalFile.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(entry.compressedBlob);
    a.download = `${base}-compressed.${ext}`;
    a.click();
  }

  /* ── Remove file ── */
  function removeFile(id: string) {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      return updated;
    });
    setSelectedId(prev => {
      if (prev === id) return files.find(f => f.id !== id)?.id ?? null;
      return prev;
    });
  }

  const selected = files.find(f => f.id === selectedId) ?? files[0] ?? null;
  const savings =
    selected?.compressedSize != null && selected.originalSize > 0
      ? Math.round(((selected.originalSize - selected.compressedSize) / selected.originalSize) * 100)
      : null;

  return (
    <ToolLayout
        toolSlug="compress-image"
      title="Image Compressor"
      icon="🗜️"
      description="Compress JPG, PNG, and WebP images in your browser. No upload needed — 100% private and free."
      relatedTools={[
        { name: 'Image Converter', href: '/tools/image-converter', icon: '🔄' },
        { name: 'PDF to Markdown', href: '/tools/pdf-to-markdown', icon: '📄' },
        { name: 'QR Code Generator', href: '/tools/qr-code', icon: '⬛' },
      ]}
      faqs={[
        {
          q: 'Is this image compressor free?',
          a: 'Yes, 100% free with no file limits, no watermarks, and no account required.',
        },
        {
          q: 'How does the image compressor work?',
          a: 'Images are compressed entirely in your browser using the HTML5 Canvas API. You choose a quality level (10–100%) and an output format (original, JPEG, PNG, or WebP). JPEG and WebP support lossy compression for significant size reduction; PNG is lossless so quality affects speed but not visual output.',
        },
        {
          q: 'Are my images uploaded to a server?',
          a: 'No. All compression happens locally in your browser. Your images never leave your device and are not stored anywhere.',
        },
        {
          q: 'What file formats are supported?',
          a: 'You can upload JPG, PNG, and WebP images. You can output to any of those formats as well. GIF and other formats are not currently supported.',
        },
        {
          q: 'How does this compare to paid tools like TinyPNG or Squoosh?',
          a: 'Paid or freemium tools like TinyPNG upload your files to their servers and may apply more advanced compression algorithms. This tool is entirely client-side and free with no limits, making it ideal for everyday compression tasks where privacy matters.',
        },
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
          <div className="text-4xl mb-3">🗜️</div>
          <p className="text-stone-700 font-semibold text-lg">
            Drag &amp; drop images here or click to browse
          </p>
          <p className="text-stone-400 text-sm mt-1">
            Supports JPG, PNG, WebP — multiple files supported
          </p>
        </div>

        {/* ── Settings ── */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
            Compression Settings
          </h2>

          {/* Quality */}
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
            {format === 'png' && (
              <p className="text-xs text-stone-400 mt-1">
                PNG is lossless — quality setting affects file speed but not visual quality.
              </p>
            )}
          </div>

          {/* Output format */}
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">
              Output Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['original', 'jpeg', 'png', 'webp'] as OutputFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all capitalize ${
                    format === f
                      ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {f === 'original' ? 'Original' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Compress button */}
          {files.length > 0 && (
            <button
              onClick={compressAll}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {files.length === 1 ? 'Compress Image' : `Compress All (${files.length})`}
            </button>
          )}
        </div>

        {/* ── File list + Preview ── */}
        {files.length > 0 && (
          <div className="grid md:grid-cols-[280px_1fr] gap-4">

            {/* File list */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  Files ({files.length})
                </p>
              </div>
              <ul className="divide-y divide-stone-100">
                {files.map(entry => (
                  <li
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                      selectedId === entry.id
                        ? 'bg-orange-50'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <img
                        src={entry.originalUrl}
                        alt={entry.originalFile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700 truncate">
                        {entry.originalFile.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatBytes(entry.originalSize)}
                        {entry.compressedSize != null && (
                          <> → {formatBytes(entry.compressedSize)}</>
                        )}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      {entry.status === 'ready' && (
                        <span className="text-xs text-stone-400">Ready</span>
                      )}
                      {entry.status === 'compressing' && (
                        <span className="text-xs text-orange-500 animate-pulse">...</span>
                      )}
                      {entry.status === 'done' && (
                        <span className="text-xs text-emerald-600 font-semibold">✓</span>
                      )}
                      {entry.status === 'error' && (
                        <span className="text-xs text-red-500">Error</span>
                      )}

                      {/* Remove */}
                      <button
                        onClick={e => { e.stopPropagation(); removeFile(entry.id); }}
                        className="ml-1 text-stone-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preview / Result */}
            {selected && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">

                {/* Before / After sizes */}
                {selected.status === 'done' && selected.compressedSize != null && (
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
                      <p className="text-xs text-stone-400 mb-1">Original</p>
                      <p className="text-base font-bold text-stone-700">
                        {formatBytes(selected.originalSize)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
                      <p className="text-xs text-stone-400 mb-1">Compressed</p>
                      <p className="text-base font-bold text-stone-700">
                        {formatBytes(selected.compressedSize)}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 border ${
                      savings != null && savings > 0
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-stone-50 border-stone-200'
                    }`}>
                      <p className="text-xs text-stone-400 mb-1">Saved</p>
                      <p className={`text-base font-bold ${
                        savings != null && savings > 0 ? 'text-emerald-600' : 'text-stone-500'
                      }`}>
                        {savings != null && savings > 0 ? `${savings}%` : '—'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Image preview */}
                <div className="rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center min-h-48">
                  {selected.status === 'compressing' && (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-stone-400">Compressing…</p>
                    </div>
                  )}
                  {selected.status === 'done' && selected.previewUrl && (
                    <img
                      src={selected.previewUrl}
                      alt="Compressed preview"
                      className="max-w-full max-h-80 object-contain block"
                    />
                  )}
                  {selected.status === 'ready' && (
                    <img
                      src={selected.originalUrl}
                      alt="Original preview"
                      className="max-w-full max-h-80 object-contain block opacity-60"
                    />
                  )}
                  {selected.status === 'error' && (
                    <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
                      <span className="text-3xl">⚠️</span>
                      <p className="text-sm text-red-500">{selected.error}</p>
                    </div>
                  )}
                </div>

                {/* Per-file action buttons */}
                <div className="flex flex-wrap gap-3">
                  {(selected.status === 'ready' || selected.status === 'error') && (
                    <button
                      onClick={() => compressOne(selected.id)}
                      className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
                    >
                      Compress This Image
                    </button>
                  )}
                  {selected.status === 'done' && (
                    <>
                      <button
                        onClick={() => downloadFile(selected)}
                        className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        ⬇ Download Compressed
                      </button>
                      <button
                        onClick={() => {
                          setFiles(prev =>
                            prev.map(f =>
                              f.id === selected.id
                                ? {
                                    ...f,
                                    compressedBlob: null,
                                    compressedSize: null,
                                    previewUrl: null,
                                    status: 'ready',
                                  }
                                : f,
                            ),
                          );
                        }}
                        className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm transition-colors"
                      >
                        Re-compress
                      </button>
                    </>
                  )}
                </div>

                {selected.status === 'done' && (
                  <p className="text-xs text-stone-400">
                    Compressed in your browser — no data sent to any server.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Empty state hint ── */}
        {files.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
            <p className="text-stone-400 text-sm">
              Drop images above to get started. Supports JPG, PNG, and WebP.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center max-w-sm mx-auto">
              {[
                { icon: '🔒', label: 'No upload', sub: 'Works in browser' },
                { icon: '⚡', label: 'Instant', sub: 'Canvas-based' },
                { icon: '🆓', label: 'Free', sub: 'No limits' },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-stone-50 p-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-stone-700">{item.label}</p>
                  <p className="text-xs text-stone-400">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
