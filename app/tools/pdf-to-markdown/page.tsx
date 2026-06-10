'use client';

import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Loader2, AlertCircle, FileText, Download, Eye, Pencil, Upload, X, Info } from 'lucide-react';


const RELATED = [
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📝' },
  { name: 'Resume Builder', href: '/tools/resume-builder', icon: '📋' },
];


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
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/tools/pdf-to-markdown', {
        method: 'POST',
        body: formData,
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
        toolSlug="pdf-to-markdown"
      title="PDF to Markdown Converter"
      description="Convert any PDF to clean, structured Markdown instantly. Perfect for feeding documents into AI tools, Notion, GitHub, or any Markdown editor. Free, no signup."
      icon="📄"
      relatedTools={RELATED}
      faqs={[
        { q: 'Is the PDF to Markdown converter free?', a: 'Yes — completely free with no account, no signup, and no file limits. Upload any PDF up to 10MB and convert it to Markdown instantly.' },
        { q: 'Why convert PDF to Markdown?', a: 'Markdown is far more token-efficient than HTML or raw PDF text. When feeding documents into AI tools like ChatGPT or Claude, Markdown can reduce token usage by 40–70%, cutting costs and allowing larger documents to fit in context windows. It also works natively in Notion, GitHub, Obsidian, and most modern editors.' },
        { q: 'Does it preserve tables, headings, and lists?', a: 'Yes. The AI converter preserves document structure: heading hierarchy (H1/H2/H3), bullet lists, numbered lists, tables, and bold/italic formatting. Page headers, footers, and page numbers are automatically removed.' },
        { q: 'Does it work on scanned PDFs?', a: 'The tool reads digital text embedded in PDFs. Scanned PDFs (image-only, without OCR) will have limited accuracy since there is no embedded text to extract. For best results, use PDFs exported from Word, Google Docs, or academic publishers.' },
        { q: 'Is my PDF kept private?', a: 'Your PDF is processed in memory and never permanently stored on our servers. Files are discarded immediately after conversion. We do not retain, sell, or share your document content.' },
        { q: 'What is the maximum file size?', a: 'The free converter supports PDFs up to 10MB. Most documents, research papers, and reports fall well within this limit. For very large PDFs, split them into sections first.' },
      ]}
    >
      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15">
        <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-violet-700 font-medium mb-1">Why use Markdown with AI?</p>
          <p className="text-stone-500">Markdown is far more token-efficient than HTML or raw PDF text. Converting your documents to Markdown before passing them to AI tools like ChatGPT or Claude can reduce token usage by 40–70%, cutting costs and allowing larger documents to fit in context windows.</p>
        </div>
      </div>

      {/* Upload zone */}
      <div className="card">
        <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Upload PDF</h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all ${
            dragOver ? 'border-violet-500 bg-violet-50' : 'border-stone-200 hover:border-violet-500/50 hover:bg-stone-50/30'
          }`}
        >
          <Upload className="w-8 h-8 text-stone-500" />
          <div className="text-center">
            <p className="text-sm text-stone-700 font-medium">Drop your PDF here, or click to browse</p>
            <p className="text-xs text-stone-500 mt-1">PDF only · Max 10 MB</p>
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
          <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <FileText className="w-5 h-5 text-violet-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{file.name}</p>
              <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setFile(null); setMarkdown(''); setError(''); }} className="p-1 text-stone-600 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
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
            <h2 className="font-semibold text-stone-900">Markdown Output</h2>
            <div className="flex gap-2 flex-wrap">
              <div className="flex rounded-lg border border-stone-200 overflow-hidden text-sm">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'edit' ? 'bg-violet-600 text-white' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Markdown
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'preview' ? 'bg-violet-600 text-white' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <textarea
              readOnly
              value={markdown}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-700 text-xs leading-relaxed font-mono resize-y min-h-[400px] focus:outline-none"
            />
          ) : (
            <div
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 min-h-[200px] text-sm leading-relaxed overflow-auto"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(markdown) }}
            />
          )}

          <p className="text-xs text-stone-500 mt-3">
            {markdown.length.toLocaleString()} characters · ~{Math.round(markdown.length / 4).toLocaleString()} tokens
          </p>
        </div>
      )}
    </ToolLayout>
  );
}
