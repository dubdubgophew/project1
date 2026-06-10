'use client';

import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Upload, X, FileText, Image as ImageIcon, Download, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */

type DPI = 72 | 150 | 300;
type Format = 'JPG' | 'PNG';
type Status = 'idle' | 'loading' | 'converting' | 'done';

interface ConvertedImage {
  pageNum: number;
  dataUrl: string;
}

/* ─── PDF.js loader ──────────────────────────────────────────────────── */

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

async function loadPDFJS(): Promise<any> {
  return new Promise((resolve) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    document.head.appendChild(script);
  });
}

async function pdfToImages(
  file: File,
  dpi: DPI,
  format: Format,
  pageRange: number[],
  onProgress: (current: number, total: number) => void,
): Promise<ConvertedImage[]> {
  const pdfjsLib = await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const scale = dpi / 72;
  const images: ConvertedImage[] = [];

  for (let i = 0; i < pageRange.length; i++) {
    const pageNum = pageRange[i];
    if (pageNum < 1 || pageNum > pdf.numPages) continue;
    onProgress(i + 1, pageRange.length);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    images.push({ pageNum, dataUrl });
  }
  return images;
}

/* ─── Page range parser ──────────────────────────────────────────────── */

function parsePageRange(str: string, total: number): number[] {
  if (!str.trim()) return Array.from({ length: total }, (_, i) => i + 1);
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

/* ─── Related tools ──────────────────────────────────────────────────── */

const RELATED = [
  { name: 'Merge PDF',         href: '/tools/merge-pdf',        icon: '📎' },
  { name: 'Split PDF',         href: '/tools/split-pdf',        icon: '✂️' },
  { name: 'Image Compressor',  href: '/tools/compress-image',   icon: '🗜️' },
];

/* ─── Component ──────────────────────────────────────────────────────── */

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [dpi, setDpi] = useState<DPI>(150);
  const [format, setFormat] = useState<Format>('JPG');
  const [pageRangeStr, setPageRangeStr] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */
  async function handleFile(f: File) {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File must be under 50 MB.');
      return;
    }
    setError('');
    setImages([]);
    setStatus('loading');
    setFile(f);
    try {
      const pdfjsLib = await loadPDFJS();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
      setStatus('idle');
    } catch {
      setError('Could not read PDF. The file may be corrupted or password-protected.');
      setStatus('idle');
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
    setImages([]);
    setError('');
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
    setPageRangeStr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ── Convert ── */
  async function handleConvert() {
    if (!file || status === 'converting') return;
    setError('');
    setImages([]);

    const pageRange = parsePageRange(pageRangeStr, totalPages);
    if (pageRange.length === 0) {
      setError('No valid pages in the specified range.');
      return;
    }

    setStatus('converting');
    setProgress({ current: 0, total: pageRange.length });
    try {
      const result = await pdfToImages(file, dpi, format, pageRange, (current, total) => {
        setProgress({ current, total });
      });
      setImages(result);
      setStatus('done');
    } catch (e) {
      setError('Conversion failed. Please try again.');
      setStatus('idle');
    }
  }

  /* ── Download helpers ── */
  function downloadImage(img: ConvertedImage) {
    const ext = format.toLowerCase();
    const baseName = file?.name.replace(/\.pdf$/i, '') ?? 'page';
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `${baseName}-page-${img.pageNum}.${ext}`;
    a.click();
  }

  async function downloadAll() {
    for (let i = 0; i < images.length; i++) {
      downloadImage(images[i]);
      if (i < images.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  const isConverting = status === 'converting';
  const isLoading = status === 'loading';

  return (
    <ToolLayout
        toolSlug="pdf-to-jpg"
      title="PDF to JPG"
      icon="📄"
      description="Convert every page of a PDF into high-quality JPG images. Extract all pages or specific pages. Free, no upload, works in your browser."
      relatedTools={RELATED}
      faqs={[
        {
          q: 'Is this PDF-to-JPG converter free?',
          a: 'Yes, 100% free. No watermarks, no sign-up, and no page limits.',
        },
        {
          q: 'What does this tool do?',
          a: 'Upload a PDF and the tool renders each page as a high-quality image. You can convert all pages or specify a range (e.g. "1-3, 5"), choose 72, 150, or 300 DPI resolution, and output as JPG or PNG. Images download individually or as a ZIP.',
        },
        {
          q: 'Is my PDF uploaded to a server?',
          a: 'No. The conversion uses PDF.js, which runs entirely in your browser. Your PDF never leaves your device.',
        },
        {
          q: 'What is the maximum file size or page count?',
          a: 'There is no enforced limit. Very large PDFs or high DPI settings (300 DPI with many pages) may be slow due to browser memory constraints.',
        },
        {
          q: 'When should I use PNG vs JPG output?',
          a: 'Choose PNG for documents with sharp text, diagrams, or transparency — it is lossless. Choose JPG for scanned photos or presentations where a smaller file size is more important than pixel-perfect quality.',
        },
      ]}
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
                <p className="text-xs text-stone-400 mt-1">PDF only · Max 50 MB</p>
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
                  {(file.size / 1024).toFixed(1)} KB
                  {totalPages > 0 && ` · ${totalPages} page${totalPages !== 1 ? 's' : ''}`}
                  {isLoading && ' · Reading…'}
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
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Conversion Options</h2>

            {/* Image quality */}
            <div>
              <label className="label">Image Quality</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 72,  label: 'Low',    sub: '72 DPI' },
                  { value: 150, label: 'Medium',  sub: '150 DPI' },
                  { value: 300, label: 'High',    sub: '300 DPI' },
                ] as { value: DPI; label: string; sub: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDpi(opt.value)}
                    className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${
                      dpi === opt.value
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${dpi === opt.value ? 'text-orange-600' : 'text-stone-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Output format */}
            <div>
              <label className="label">Output Format</label>
              <div className="flex gap-3">
                {(['JPG', 'PNG'] as Format[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      format === f
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                {format === 'JPG' ? 'Smaller file size, great for photos and most use cases.' : 'Lossless quality, supports transparency.'}
              </p>
            </div>

            {/* Page range */}
            <div>
              <label className="label">
                Page Range{' '}
                <span className="font-normal text-stone-400">(leave blank for all {totalPages} pages)</span>
              </label>
              <input
                type="text"
                value={pageRangeStr}
                onChange={e => setPageRangeStr(e.target.value)}
                placeholder={`e.g. 1-3, 5, 7-9 (max ${totalPages})`}
                className="input"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Convert button */}
        {file && totalPages > 0 && (
          <button
            onClick={handleConvert}
            disabled={isConverting || isLoading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {isConverting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Converting page {progress.current} of {progress.total}…</>
            ) : (
              <><ImageIcon className="w-5 h-5" /> Convert to {format}</>
            )}
          </button>
        )}

        {/* Progress bar */}
        {isConverting && progress.total > 0 && (
          <div className="card py-4">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span>Converting page {progress.current} of {progress.total}</span>
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
        {images.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-semibold text-stone-900">
                {images.length} image{images.length !== 1 ? 's' : ''} converted
              </h2>
              <button
                onClick={downloadAll}
                className="btn-primary py-2 px-4 text-sm"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.pageNum} className="group relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                  <img
                    src={img.dataUrl}
                    alt={`Page ${img.pageNum}`}
                    className="w-full object-cover aspect-[3/4]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => downloadImage(img)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-stone-800 text-xs font-semibold shadow-lg hover:bg-orange-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-2.5">
                    <p className="text-xs text-white font-medium">Page {img.pageNum}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-stone-400 mt-4 flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5" />
              Hover over an image to download individually, or use Download All above.
            </p>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
