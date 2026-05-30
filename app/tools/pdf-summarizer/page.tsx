'use client';

import { useState, useRef } from 'react';
import type { Metadata } from 'next';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Upload, FileText, Copy, Check, Loader2, AlertCircle, Trash2 } from 'lucide-react';

const RELATED = [
  { name: 'AI Paraphraser', href: '/tools/paraphraser', icon: '✍️' },
  { name: 'YouTube Summarizer', href: '/tools/youtube-summarizer', icon: '▶️' },
  { name: 'Grammar Checker', href: '/tools/grammar-checker', icon: '✅' },
];

export default function PDFSummarizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);
    setError('');
    setSummary('');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('length', length);

      const res = await fetch('/api/tools/pdf-summarize', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setSummary(data.summary);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout
      title="AI PDF Summarizer"
      description="Upload any PDF — research papers, reports, books, contracts — and get a concise AI-powered summary with key points extracted instantly."
      icon="📄"
      badge="Free"
      relatedTools={RELATED}
      faqs={[
        { q: 'How does the free PDF summarizer work?', a: 'Upload your PDF and the AI extracts the digital text, then generates a structured summary with key points, findings, and conclusions — in under 30 seconds. No software installation required.' },
        { q: 'What is the maximum file size?', a: 'The free PDF summarizer supports files up to 10MB. Most research papers, contracts, and business reports fall within this limit. For larger files, split the PDF into sections first.' },
        { q: 'Do I need an account to summarize a PDF?', a: 'No. You can summarize PDFs completely free without creating an account, entering an email, or providing a credit card. Open the tool and start immediately.' },
        { q: 'Can it summarize research papers and academic PDFs?', a: 'Yes — the AI is especially effective for research papers, scientific reports, legal documents, and business reports. It preserves key statistics, findings, citations, and section structure in the output.' },
        { q: 'Is my PDF kept private?', a: 'Your PDF is processed in memory and never permanently stored. Files are discarded immediately after summarization. Formly does not retain, sell, or share your document content.' },
        { q: 'What languages does it support?', a: 'The summarizer can process PDFs written in English, Spanish, French, German, Hindi, and most major European languages. Output is generated in English by default.' },
        { q: 'Does it work on scanned PDFs?', a: 'The tool reads digital text embedded in PDFs, not images. Scanned PDFs (image-only) without OCR text will have reduced accuracy. For best results, use PDFs exported from Word, Google Docs, or academic publishers.' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-violet-500 bg-violet-500/10'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-gray-700 hover:border-violet-500/50 hover:bg-gray-800/50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <>
              <FileText className="w-10 h-10 text-emerald-400" />
              <div className="text-center">
                <p className="font-semibold text-white">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setSummary(''); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-600" />
              <div className="text-center">
                <p className="font-semibold text-gray-300">Drop PDF here or click to upload</p>
                <p className="text-sm text-gray-600 mt-1">Max 10 MB · PDF only</p>
              </div>
            </>
          )}
        </div>

        {/* Summary length */}
        <div>
          <label className="label">Summary Length</label>
          <div className="flex gap-2">
            {(['short', 'medium', 'detailed'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLength(l)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                  length === l
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary w-full justify-center py-3.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Summarizing your PDF…
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Summarize PDF
            </>
          )}
        </button>
      </form>

      {/* Output */}
      {summary && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Summary</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="prose-dark text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}

      {/* SEO content */}
      <div className="card bg-gray-900/50">
        <h2 className="text-lg font-semibold text-white mb-3">How to Use the AI PDF Summarizer</h2>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Upload your PDF (research papers, reports, books, contracts — any PDF up to 10 MB)</li>
          <li>Select summary length: Short (3-5 bullets), Medium (1 page), Detailed (2-3 pages)</li>
          <li>Click &quot;Summarize PDF&quot; and get your AI summary in under 15 seconds</li>
          <li>Copy or download the summary</li>
        </ol>
        <p className="text-sm text-gray-500 mt-4">
          Powered by Groq AI — extracts key insights, main arguments, and important data points.
          Better than manual reading for quick comprehension.
        </p>
      </div>
    </ToolLayout>
  );
}
