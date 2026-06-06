'use client';

import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Upload, X, FileText, Download, AlertCircle, Loader2, Scissors, CheckCircle2 } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────────────── */

type Mode = 'extract' | 'ranges' | 'every';
type Status = 'idle' | 'splitting' | 'done';

interface SplitResult {
  name: string;
  bytes: Uint8Array;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function parsePageRange(str: string, total: number): number[] {
  const pages = new Set<number>();
  str.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(n => parseInt(n.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= Math.min(b, total); i++) {
          if (i >= 1) pages.add(i);
        }
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= total) pages.add(n);
    }
  });
  return [...pages].sort((a, b) => a - b);
}

async function splitPDF(
  file: File,
  mode: Mode,
  rangeStr: string,
  onProgress?: (current: number, total: number) => void,
): Promise<SplitResult[]> {
  const { PDFDocument } = await import('pdf-lib');
  const sourceBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(sourceBytes);
  const totalPages = sourcePdf.getPageCount();

  if (mode === 'extract') {
    const pages = parsePageRange(rangeStr, totalPages);
    if (pages.length === 0) throw new Error('No valid pages in the specified range.');
    const newPdf = await PDFDocument.create();
    const copied = await newPdf.copyPages(sourcePdf, pages.map(p => p - 1));
    copied.forEach(p => newPdf.addPage(p));
    const bytes = await newPdf.save();
    return [{ name: 'extracted.pdf', bytes }];

  } else if (mode === 'ranges') {
    const groups = rangeStr.split('|').map(r => r.trim()).filter(Boolean);
    if (groups.length === 0) throw new Error('Please enter at least one page range.');
    const results: SplitResult[] = [];
    for (let i = 0; i < groups.length; i++) {
      const pages = parsePageRange(groups[i], totalPages);
      if (pages.length === 0) continue;
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(sourcePdf, pages.map(p => p - 1));
      copied.forEach(p => newPdf.addPage(p));
      const bytes = await newPdf.save();
      results.push({ name: `part-${i + 1}.pdf`, bytes });
    }
    if (results.length === 0) throw new Error('No valid pages found in any range.');
    return results;

  } else {
    // every page separately
    const results: SplitResult[] = [];
    for (let i = 0; i < totalPages; i++) {
      onProgress?.(i + 1, totalPages);
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(page);
      const bytes = await newPdf.save();
      results.push({ name: `page-${i + 1}.pdf`, bytes });
    }
    return results;
  }
}

function downloadPDF(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBytes(n: number) {
  return n < 1024 * 1024
    ? `${(n / 1024).toFixed(1)} KB`
    : `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/* ─── Related tools ─────────────────────────────────────────────────────── */

const RELATED = [
  { name: 'Merge PDF',       href: '/tools/merge-pdf',       icon: '📎' },
  { name: 'PDF to JPG',      href: '/tools/pdf-to-jpg',      icon: '📄' },
  { name: 'PDF Summarizer',  href: '/tools/pdf-summarizer',  icon: '🤖' },
  { name: 'Image to PDF',    href: '/tools/image-to-pdf',    icon: '🖼️' },
];

/* ─── Mode config ───────────────────────────────────────────────────────── */

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: 'extract',  label: 'Extract pages',         desc: 'Select specific pages → one PDF' },
  { value: 'ranges',   label: 'Split by range',         desc: 'Multiple ranges → one PDF per range' },
  { value: 'every',    label: 'Every page separately',  desc: 'Each page becomes its own PDF' },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [mode, setMode] = useState<Mode>('extract');
  const [rangeStr, setRangeStr] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */
  async function handleFile(f: File) {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError('File must be under 100 MB.');
      return;
    }
    setError('');
    setResults([]);
    setStatus('idle');
    setFile(f);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setTotalPages(pdf.getPageCount());
    } catch {
      setError('Could not read PDF. The file may be corrupted or password-protected.');
      setFile(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function clearFile() {
    setFile(null);
    setTotalPages(0);
    setResults([]);
    setError('');
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
    setRangeStr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ── Split ── */
  async function handleSplit() {
    if (!file || status === 'splitting') return;
    setError('');
    setResults([]);
    setProgress({ current: 0, total: 0 });
    setStatus('splitting');
    try {
      const output = await splitPDF(file, mode, rangeStr, (current, total) => {
        setProgress({ current, total });
      });
      setResults(output);
      setStatus('done');
    } catch (e: any) {
      setError(e?.message ?? 'Split failed. Please try again.');
      setStatus('idle');
    }
  }

  /* ── Download all ── */
  async function downloadAll() {
    for (let i = 0; i < results.length; i++) {
      downloadPDF(results[i].bytes, results[i].name);
      if (i < results.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  const isSplitting = status === 'splitting';

  /* ── Range input placeholder ── */
  const rangePlaceholder =
    mode === 'extract'
      ? `e.g. 1-3, 5, 7-9 (max ${totalPages})`
      : `e.g. 1-3 | 4-6 | 7-${totalPages}`;

  return (
    <ToolLayout
        toolSlug="split-pdf"
      title="Split PDF"
      icon="✂️"
      description="Split a PDF into separate files by page range. Extract individual pages or save every page as a separate PDF. Free, no upload."
      relatedTools={RELATED}
    >
      <div className="space-y-6">

        {/* Upload zone */}
        <div className="card">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Upload PDF</h2>

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all ${
                dragOver
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-stone-300 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                dragOver ? 'bg-orange-100' : 'bg-stone-100'
              }`}>
                <Upload className={`w-7 h-7 transition-colors ${dragOver ? 'text-orange-500' : 'text-stone-400'}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-stone-700">Drop your PDF here, or click to browse</p>
                <p className="text-xs text-stone-400 mt-1">PDF only · Max 100 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{file.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {formatBytes(file.size)}
                  {totalPages > 0 && ` · ${totalPages} page${totalPages !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                onClick={clearFile}
                className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Options */}
        {file && totalPages > 0 && (
          <div className="card space-y-5">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Split Options</h2>

            {/* Mode selector */}
            <div>
              <label className="label">Split Mode</label>
              <div className="space-y-2">
                {MODES.map(m => (
                  <button
                    key={m.value}
                    onClick={() => { setMode(m.value); setResults([]); setStatus('idle'); }}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      mode === m.value
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                      mode === m.value ? 'border-orange-400' : 'border-stone-300'
                    }`}>
                      {mode === m.value && (
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${mode === m.value ? 'text-orange-700' : 'text-stone-700'}`}>
                        {m.label}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page range input */}
            {(mode === 'extract' || mode === 'ranges') && (
              <div>
                <label className="label">
                  {mode === 'extract' ? (
                    <>Page Range <span className="font-normal text-stone-400">(e.g. 1-3, 5)</span></>
                  ) : (
                    <>Page Ranges <span className="font-normal text-stone-400">(separate groups with |)</span></>
                  )}
                </label>
                <input
                  type="text"
                  value={rangeStr}
                  onChange={e => { setRangeStr(e.target.value); setResults([]); setStatus('idle'); }}
                  placeholder={rangePlaceholder}
                  className="input"
                />
                {mode === 'ranges' && (
                  <p className="text-xs text-stone-400 mt-1.5">
                    Each group separated by <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-600">|</code> becomes a separate PDF.
                    Example: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-600">1-3 | 4-6 | 7-9</code>
                  </p>
                )}
              </div>
            )}

            {mode === 'every' && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                <Scissors className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This will create <strong>{totalPages} separate PDF files</strong>, one for each page.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Split button */}
        {file && totalPages > 0 && (
          <button
            onClick={handleSplit}
            disabled={isSplitting}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-70"
          >
            {isSplitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'every' && progress.total > 0
                  ? `Processing page ${progress.current} of ${progress.total}…`
                  : 'Splitting PDF…'}
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                Split PDF
              </>
            )}
          </button>
        )}

        {/* Progress bar (every page mode) */}
        {isSplitting && mode === 'every' && progress.total > 0 && (
          <div className="card py-4">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span>Processing page {progress.current} of {progress.total}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="font-semibold text-stone-900">
                  {results.length} PDF{results.length !== 1 ? 's' : ''} ready
                </h2>
              </div>
              {results.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              )}
            </div>

            <div className="space-y-2">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-orange-50/30 hover:border-orange-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{r.name}</p>
                    <p className="text-xs text-stone-400">{formatBytes(r.bytes.byteLength)}</p>
                  </div>
                  <button
                    onClick={() => downloadPDF(r.bytes, r.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 text-xs font-medium hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setResults([]); setStatus('idle'); setProgress({ current: 0, total: 0 }); }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-stone-300 text-sm text-stone-500 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50/40 transition-all"
            >
              <Scissors className="w-4 h-4" />
              Split again with different settings
            </button>
          </div>
        )}

        {/* How it works (empty state) */}
        {!file && (
          <div className="card bg-stone-50 border-stone-200">
            <h3 className="text-sm font-semibold text-stone-700 mb-3">How it works</h3>
            <ol className="space-y-2 text-sm text-stone-500">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">1</span>
                Upload a PDF file (up to 100 MB)
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">2</span>
                Choose a split mode: extract pages, split by ranges, or every page separately
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">3</span>
                Click Split PDF — output files are generated in your browser
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">4</span>
                Download individual files or all at once
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
