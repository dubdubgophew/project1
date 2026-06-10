'use client';

import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';

/* ── Types ── */
interface PDFItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
}

type Status = 'idle' | 'analyzing' | 'merging' | 'done';

/* ── Constants ── */
const RELATED = [
  { name: 'Image to PDF', href: '/tools/image-to-pdf', icon: '🖼️' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Digital Signature', href: '/tools/digital-signature', icon: '✍️' },
];

/* ── Helpers ── */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function getPDFPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import('pdf-lib');
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => mergedPdf.addPage(p));
  }
  return await mergedPdf.save();
}

/* ── Component ── */
export default function MergePdfPage() {
  const [pdfs, setPdfs] = useState<PDFItem[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Analyze page count (non-blocking per file) ── */
  async function analyzeFile(id: string, file: File) {
    try {
      const count = await getPDFPageCount(file);
      setPdfs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, pageCount: count } : p)),
      );
    } catch {
      // leave pageCount as null if analysis fails
    }
  }

  /* ── Add files ── */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(
      (f) => f.type === 'application/pdf',
    );
    if (arr.length === 0) {
      setError('Only PDF files are supported.');
      return;
    }
    setError('');
    setResultBytes(null);
    setStatus('idle');

    const newItems: PDFItem[] = arr.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      size: f.size,
      pageCount: null,
    }));

    setPdfs((prev) => [...prev, ...newItems]);

    // Analyze page counts in the background
    newItems.forEach((item) => analyzeFile(item.id, item.file));
  }, []);

  /* ── Drag & drop ── */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  /* ── Reorder ── */
  function moveUp(idx: number) {
    if (idx === 0) return;
    setPdfs((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
    setResultBytes(null);
    setStatus('idle');
  }

  function moveDown(idx: number) {
    setPdfs((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
    setResultBytes(null);
    setStatus('idle');
  }

  /* ── Remove ── */
  function removeFile(id: string) {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
    setResultBytes(null);
    setStatus('idle');
  }

  /* ── Merge ── */
  async function handleMerge() {
    if (pdfs.length < 2) {
      setError('Add at least 2 PDF files to merge.');
      return;
    }
    setStatus('merging');
    setError('');
    try {
      const bytes = await mergePDFs(pdfs.map((p) => p.file));
      setResultBytes(bytes);
      setStatus('done');
    } catch (err) {
      setError('Merge failed. One or more PDFs may be encrypted or corrupted.');
      setStatus('idle');
      console.error(err);
    }
  }

  /* ── Download ── */
  function handleDownload() {
    if (!resultBytes) return;
    const blob = new Blob([resultBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Computed totals ── */
  const totalKnownPages = pdfs.reduce(
    (sum, p) => sum + (p.pageCount ?? 0),
    0,
  );
  const allPagesKnown = pdfs.length > 0 && pdfs.every((p) => p.pageCount !== null);

  return (
    <ToolLayout
        toolSlug="merge-pdf"
      title="Merge PDF"
      icon="📎"
      description="Combine multiple PDF files into one. Reorder files, then download the merged PDF instantly. Free, no upload, works in your browser."
      relatedTools={RELATED}
      faqs={[
        {
          q: 'Is this PDF merger free?',
          a: 'Yes, completely free. No account required, no watermarks added, and no limit on the number of files you can merge.',
        },
        {
          q: 'How does the merge PDF tool work?',
          a: 'Upload two or more PDF files, drag them into your preferred order, and click Merge. The tool combines all pages from every file into a single PDF that you download instantly.',
        },
        {
          q: 'Are my PDF files uploaded to a server?',
          a: 'No. Merging happens entirely in your browser using pdf-lib. Your files never leave your device and are not stored anywhere.',
        },
        {
          q: 'Are there any file size limits?',
          a: 'There is no enforced limit — performance depends on your browser\'s available memory. Very large PDFs (hundreds of MB) may be slow to process.',
        },
        {
          q: 'How does this compare to paid PDF tools like Adobe Acrobat?',
          a: 'Adobe Acrobat and similar tools offer advanced editing, OCR, and cloud storage. This tool focuses on fast, private, browser-based merging at no cost — ideal when you just need to combine files without uploading them to a third-party service.',
        },
      ]}
    >
      <div className="space-y-5">

        {/* Drop zone */}
        <div className="card">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">
            Add PDF Files
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
            <div className="text-4xl">📎</div>
            <div className="text-center">
              <p className="text-sm font-medium text-stone-700">
                Drop PDF files here, or click to browse
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Multiple PDF files supported · No file size limit
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {/* PDF list */}
        {pdfs.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-stone-700">
                Files ({pdfs.length})
                {allPagesKnown && (
                  <span className="ml-2 text-xs font-normal text-stone-400">
                    · {totalKnownPages} total page{totalKnownPages !== 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <button
                onClick={() => {
                  setPdfs([]);
                  setResultBytes(null);
                  setStatus('idle');
                }}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {pdfs.map((pdf, idx) => (
                <div
                  key={pdf.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-stone-200 bg-stone-50 group"
                >
                  {/* PDF icon */}
                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <span className="text-lg">📄</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {pdf.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formatBytes(pdf.size)}
                      {pdf.pageCount !== null ? (
                        <> · {pdf.pageCount} page{pdf.pageCount !== 1 ? 's' : ''}</>
                      ) : (
                        <span className="ml-1 text-orange-400 animate-pulse">analyzing…</span>
                      )}
                    </p>
                  </div>

                  {/* Order badge */}
                  <span className="text-xs font-medium text-stone-400 w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === pdfs.length - 1}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFile(pdf.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add more */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-stone-300 text-sm text-stone-500 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50/40 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add more PDFs
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Merge button */}
        {pdfs.length > 0 && status !== 'done' && (
          <button
            onClick={handleMerge}
            disabled={status === 'merging' || pdfs.length < 2}
            className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-70"
          >
            {status === 'merging' ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Merging {pdfs.length} PDFs…
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Merge {pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        )}

        {pdfs.length === 1 && status !== 'done' && (
          <p className="text-xs text-stone-400 text-center">
            Add at least one more PDF to enable merging.
          </p>
        )}

        {/* Result */}
        {status === 'done' && resultBytes && (
          <div className="card border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-800">Merged PDF ready!</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {pdfs.length} files merged
                  {allPagesKnown ? ` · ${totalKnownPages} pages` : ''}
                  {' · '}{formatBytes(resultBytes.byteLength)}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Merged PDF
                </button>
                <button
                  onClick={() => { setResultBytes(null); setStatus('idle'); }}
                  className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Merge again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works / empty state */}
        {pdfs.length === 0 && (
          <div className="card bg-stone-50 border-stone-200">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">How it works</h3>
            <ol className="space-y-2 text-sm text-stone-500">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">1</span>
                Upload two or more PDF files
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">2</span>
                Reorder files using the up/down arrows to set the page order
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">3</span>
                Click Merge — the combined PDF downloads instantly in your browser
              </li>
            </ol>
            <p className="text-xs text-stone-400 mt-3">
              100% client-side · No upload · No file size limit · Supports encrypted-free PDFs
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center max-w-sm">
              {[
                { icon: '🔒', label: 'No upload', sub: 'Stays in browser' },
                { icon: '⚡', label: 'Instant', sub: 'pdf-lib powered' },
                { icon: '🆓', label: 'Free', sub: 'No limits' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white border border-stone-200 p-3">
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
