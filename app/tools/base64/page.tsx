'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Copy, Check, Upload, Download } from 'lucide-react';

export default function Base64Page() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback((text: string, currentMode: 'encode' | 'decode') => {
    setError('');
    if (!text.trim()) { setOutput(''); return; }
    try {
      if (currentMode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(text))));
      } else {
        setOutput(decodeURIComponent(escape(atob(text.trim()))));
      }
    } catch {
      setError(currentMode === 'encode' ? 'Encoding failed.' : 'Invalid Base64 string.');
      setOutput('');
    }
  }, []);

  const handleInputChange = (val: string) => {
    setInput(val);
    convert(val, mode);
  };

  const handleModeSwitch = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    convert(input, newMode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like "data:image/png;base64,iVBOR..."
      const base64 = result.split(',')[1] ?? result;
      setInput(base64);
      setOutput(base64);
      setMode('encode');
    };
    reader.readAsDataURL(file);
  };

  const isLikelyFile = output.length > 100 && mode === 'decode';

  const handleDownload = () => {
    try {
      const binary = atob(input.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded-file';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not decode as binary file.');
    }
  };

  return (
    <ToolLayout
        toolSlug="base64"
      title="Base64 Encoder / Decoder"
      description="Encode text or files to Base64, or decode Base64 strings back to text or downloadable files. Real-time conversion."
      icon="🔐"
      relatedTools={[
        { name: 'JSON Formatter', href: '/tools/json-formatter', icon: '{}' },
        { name: 'Password Generator', href: '/tools/password-generator', icon: '🔑' },
        { name: 'Regex Tester', href: '/tools/regex-tester', icon: '🔍' },
      ]}
      faqs={[
        { q: 'Is this Base64 encoder free?', a: 'Yes, completely free with no account or sign-up required. Encode and decode as much as you like.' },
        { q: 'What does Base64 encoding do?', a: 'Base64 converts binary or text data into a string of 64 printable ASCII characters. It is the standard (RFC 4648) used to embed images in HTML/CSS, transmit data in JSON APIs, and encode email attachments in MIME format.' },
        { q: 'Can it handle files as well as text?', a: 'Yes. You can upload any file and get its Base64 data URI output, useful for embedding images directly into HTML or CSS. When decoding, the tool can download the result as a binary file.' },
        { q: 'What are common use cases?', a: 'Encoding images to embed in HTML emails, passing binary data through text-only channels like JSON or XML, storing small assets inline in CSS, and decoding Base64 payloads from API responses or JWT tokens.' },
        { q: 'Is my data private?', a: 'Yes. Encoding and decoding both happen entirely in your browser using the built-in btoa/atob functions — your data is never sent to any server.' },
      ]}
    >
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => handleModeSwitch('encode')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-violet-600 text-white' : 'bg-stone-50 text-stone-500 hover:text-stone-900'}`}
          >
            Encode → Base64
          </button>
          <button
            onClick={() => handleModeSwitch('decode')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-violet-600 text-white' : 'bg-stone-50 text-stone-500 hover:text-stone-900'}`}
          >
            Decode ← Base64
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <label className="label">{mode === 'encode' ? 'Plain Text / Input' : 'Base64 String'}</label>
            <textarea
              className="textarea font-mono text-sm h-48"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            {/* File upload */}
            <div>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-secondary flex items-center gap-2 text-sm w-full justify-center"
              >
                <Upload className="w-4 h-4" />
                {fileName ? fileName : 'Upload file (encode to Base64)'}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</label>
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-1.5 text-xs py-1 px-2.5">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="relative">
              <pre className="bg-stone-100 border border-stone-200 rounded-xl p-4 h-48 overflow-auto text-sm font-mono text-emerald-300 whitespace-pre-wrap break-all">
                {output || <span className="text-stone-600">Output will appear here...</span>}
              </pre>
            </div>
            {isLikelyFile && (
              <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 text-sm w-full justify-center">
                <Download className="w-4 h-4" />
                Download as file
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        {(input || output) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center py-3">
              <p className="text-xl font-bold text-violet-600">{input.length.toLocaleString()}</p>
              <p className="text-xs text-stone-500 mt-1">Input chars</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-xl font-bold text-blue-700">{output.length.toLocaleString()}</p>
              <p className="text-xs text-stone-500 mt-1">Output chars</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
