'use client';

import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, FileText, Download, Eye, Pencil, Upload, X, Info } from 'lucide-react';

export const metadata = {
  title: 'PDF to Markdown Converter — Formly',
  description: 'Convert any PDF to clean, structured Markdown instantly. Perfect for feeding documents into AI tools.',
};

const RELATED = [
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📝' },
  { name: 'Resume Builder', href: '/tools/resume-builder', icon: '📋' },
];

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let text = '';
  for (let i = 0; i < bytes.length - 1; i++) {
    const b = bytes[i];
    if (b >= 32 && b <= 126) text += String.fromCharCode(b);
    else if (b === 10 || b === 13) text += '\n';
  }
  return text
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/ {3,}/g, '  ')
    .replace(/\n{4,}/g, '\n\n')
    .trim();
}

function simpleMarkdownToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

    if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h3 style="font-size:1rem;font-weight:700;margin:1.2em 0 .4em;color:#c4b5fd">${line.slice(4)}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2 style="font-size:1.15rem;font-weight:700;margin:1.5em 0 .5em;color:#a78bfa;border-bottom:1px solid #374151;padding-bottom:.3em">${line.slice(3)}</h2>`);
    } else if (line.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h1 style="font-size:1.4rem;font-weight:800;margin:0 0 .8em;color:#ede9fe">${line.slice(2)}</h1>`);
    } else if (/^[-*] /.test(line)) {
      if (!inList) { out.push('<ul style="list-style:disc;padding-left:1.5em;margin:.4em 0">'); inList = true; }
      out.push(`<li style="margin-bottom:.25em;color:#d1d5db">${line.slice(2)}</li>`);
    } else if (/^\d+\. /.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p style="margin:.15em 0;color:#d1d5db">${line}</p>`);
    } else if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<div style="height:.6em"></div>');
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p style="margin:.3em 0;color:#d1d5db;line-height:1.7">${line}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('');
}

export default function PdfToMarkdownPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith('.pdf')) { setError('Please upload a PDF file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return; }
    setFile(f);
    setError('');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setError('');
    setMarkdown('');
    try {
      const text = await extractTextFromPDF(file);
      if (text.length < 50) {
        setError('Could not extract readable text from this PDF. The file may be scanned or image-based.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/tools/pdf-to-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 50000), filename: file.name }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else setMarkdown(data.markdown ?? '');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name.replace(/\.pdf$/i, '') ?? 'document') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout
      title="PDF to Markdown Converter"
      description="Convert any PDF to clean, structured Markdown instantly. Perfect for feeding documents into AI tools with minimal token waste."
      icon="📄"
      relatedTools={RELATED}
    >
      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-violet-300 font-medium mb-1">Why use Markdown with AI?</p>
          <p className="text-gray-400">Markdown is far more token-efficient than HTML or raw PDF text. Converting your documents to Markdown before passing them to AI tools like ChatGPT or Claude can reduce token usage by 40–70%, cutting costs and allowing larger documents to fit in context windows.</p>
        </div>
      </div>

      {/* Upload zone */}
      <div className="card">
        <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-4">Upload PDF</h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
            dragOver ? 'border-violet-500 bg-violet-500/10' : 'border-gray-700 hover:border-violet-500/50 hover:bg-gray-800/30'
          }`}
        >
          <Upload className="w-8 h-8 text-gray-500" />
          <div className="text-center">
            <p className="text-sm text-gray-300 font-medium">Drop your PDF here, or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">PDF only · Max 10 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {file && (
          <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <FileText className="w-5 h-5 text-violet-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setFile(null); setMarkdown(''); setError(''); }} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || loading}
        className="btn-primary w-full justify-center py-3.5"
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting PDF to Markdown…</>
          : <><FileText className="w-5 h-5" /> Convert to Markdown</>}
      </button>

      {markdown && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-white">Markdown Output</h2>
            <div className="flex gap-2 flex-wrap">
              <div className="flex rounded-lg border border-gray-700 overflow-hidden text-sm">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'edit' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Markdown
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'preview' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all"
              >
                <Download className="w-4 h-4" /> Download .md
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <textarea
              readOnly
              value={markdown}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-300 text-xs leading-relaxed font-mono resize-y min-h-[400px] focus:outline-none"
            />
          ) : (
            <div
              className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 min-h-[200px] text-sm leading-relaxed overflow-auto"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(markdown) }}
            />
          )}

          <p className="text-xs text-gray-500 mt-3">
            {markdown.length.toLocaleString()} characters · ~{Math.round(markdown.length / 4).toLocaleString()} tokens
          </p>
        </div>
      )}
    </ToolLayout>
  );
}
