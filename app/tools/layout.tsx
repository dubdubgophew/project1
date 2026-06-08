import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All 49 Free AI Tools — Image Compressor, PDF Merger, Resume Builder & More | Formly',
  description: 'Browse all 49 free tools on Formly: image compressor, merge PDF, split PDF, image converter, pay stub generator, resume builder, grammar checker, PDF summarizer & more. No signup needed.',
  keywords: ['free ai tools online', 'image compressor free', 'merge pdf online free', 'split pdf online', 'pdf to jpg converter', 'pay stub generator free', 'ai resume builder', 'free grammar checker', 'ai paraphraser', 'pdf summarizer free', 'free code reviewer', 'contract generator online', 'image converter online free'],
  openGraph: {
    title: 'All 49 Free AI Tools | Formly',
    description: 'Image compressor, merge PDF, split PDF, PDF to JPG, pay stub generator, resume builder, grammar checker & 40 more free tools.',
    url: 'https://formly.tools/tools',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 49 Free AI Tools | Formly',
    description: '49 free tools: image compressor, merge PDF, split PDF, pay stub generator, resume builder, paraphraser, grammar checker & more. No signup needed.',
  },
  alternates: { canonical: 'https://formly.tools/tools' },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Formly Free AI Tools',
            description: 'Complete list of 49 free tools available on Formly — AI tools, file converters, PDF tools, calculators & more',
            url: 'https://formly.tools/tools',
            numberOfItems: 49,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Pay Stub Generator', url: 'https://formly.tools/tools/paystub-generator', description: 'Free pay stub maker with 2025 tax calculations for USA, UK, Canada, India, Australia' },
              { '@type': 'ListItem', position: 2, name: 'Resume Builder', url: 'https://formly.tools/tools/resume-builder', description: 'AI-powered ATS-optimized resume creator with real-time ATS score' },
              { '@type': 'ListItem', position: 3, name: 'Contract Generator', url: 'https://formly.tools/tools/contract-generator', description: 'Professional contract generator for freelancers — NDAs, service agreements, consulting contracts' },
              { '@type': 'ListItem', position: 4, name: 'PDF Summarizer', url: 'https://formly.tools/tools/pdf-summarizer', description: 'AI tool to summarize any PDF in seconds — research papers, reports, ebooks' },
              { '@type': 'ListItem', position: 5, name: 'AI Paraphraser', url: 'https://formly.tools/tools/paraphraser', description: 'Free AI paraphraser with 5 tones — no word limit' },
              { '@type': 'ListItem', position: 6, name: 'Grammar Checker', url: 'https://formly.tools/tools/grammar-checker', description: 'Free AI grammar and spelling checker' },
              { '@type': 'ListItem', position: 7, name: 'Email Writer', url: 'https://formly.tools/tools/email-writer', description: 'AI professional email generator for any context' },
              { '@type': 'ListItem', position: 8, name: 'Cover Letter Generator', url: 'https://formly.tools/tools/cover-letter', description: 'AI cover letter writer with PDF download' },
              { '@type': 'ListItem', position: 9, name: 'Code Explainer', url: 'https://formly.tools/tools/code-explainer', description: 'AI explains any code in plain English — 15+ languages' },
              { '@type': 'ListItem', position: 10, name: 'Code Reviewer', url: 'https://formly.tools/tools/code-reviewer', description: 'AI code review for bugs, security issues, and best practices' },
              { '@type': 'ListItem', position: 11, name: 'QR Code Generator', url: 'https://formly.tools/tools/qr-code', description: 'Free QR code generator for URLs, text, WiFi, vCards' },
              { '@type': 'ListItem', position: 12, name: 'Digital Signature', url: 'https://formly.tools/tools/digital-signature', description: 'Draw, type, or upload digital signatures — download PNG/SVG' },
              { '@type': 'ListItem', position: 13, name: 'PDF to Markdown', url: 'https://formly.tools/tools/pdf-to-markdown', description: 'Convert PDF files to clean Markdown text' },
              { '@type': 'ListItem', position: 14, name: 'YouTube Summarizer', url: 'https://formly.tools/tools/youtube-summarizer', description: 'Summarize any YouTube video from URL' },
              { '@type': 'ListItem', position: 15, name: 'Bio Writer', url: 'https://formly.tools/tools/bio-writer', description: 'Professional bio generator for LinkedIn, Twitter, resumes' },
              { '@type': 'ListItem', position: 16, name: 'Hashtag Generator', url: 'https://formly.tools/tools/hashtag-generator', description: 'AI hashtag generator for Instagram, Twitter, LinkedIn, TikTok' },
              { '@type': 'ListItem', position: 17, name: 'JSON Formatter', url: 'https://formly.tools/tools/json-formatter', description: 'Format, validate, and minify JSON in browser' },
              { '@type': 'ListItem', position: 18, name: 'Base64', url: 'https://formly.tools/tools/base64', description: 'Encode and decode Base64 text and files' },
              { '@type': 'ListItem', position: 19, name: 'Password Generator', url: 'https://formly.tools/tools/password-generator', description: 'Strong password generator with strength meter' },
              { '@type': 'ListItem', position: 20, name: 'Word Counter', url: 'https://formly.tools/tools/word-counter', description: 'Word, character, sentence, and reading time counter' },
              { '@type': 'ListItem', position: 21, name: 'Color Converter', url: 'https://formly.tools/tools/color-converter', description: 'Convert colors between HEX, RGB, HSL, HSV formats' },
              { '@type': 'ListItem', position: 22, name: 'Unit Converter', url: 'https://formly.tools/tools/unit-converter', description: 'Length, weight, temperature, volume unit converter' },
              { '@type': 'ListItem', position: 23, name: 'Loan Calculator', url: 'https://formly.tools/tools/loan-calculator', description: 'EMI calculator with full amortization schedule' },
              { '@type': 'ListItem', position: 24, name: 'Expense Splitter', url: 'https://formly.tools/tools/expense-splitter', description: 'Split bills fairly among multiple people' },
              { '@type': 'ListItem', position: 25, name: 'Age Calculator', url: 'https://formly.tools/tools/age-calculator', description: 'Exact age in years, months, days from birth date' },
              { '@type': 'ListItem', position: 26, name: 'Regex Tester', url: 'https://formly.tools/tools/regex-tester', description: 'Regular expression tester with real-time highlighting' },
              { '@type': 'ListItem', position: 27, name: 'Diff Checker', url: 'https://formly.tools/tools/diff-checker', description: 'Compare two texts and highlight differences' },
              { '@type': 'ListItem', position: 28, name: 'Text Case', url: 'https://formly.tools/tools/text-case', description: 'Convert text between UPPER, lower, Title, camelCase, snake_case' },
              { '@type': 'ListItem', position: 29, name: 'Terms Simplifier', url: 'https://formly.tools/tools/terms-simplifier', description: 'AI simplifies legal terms and privacy policies into plain English' },
              { '@type': 'ListItem', position: 30, name: 'Image Compressor', url: 'https://formly.tools/tools/compress-image', description: 'Compress JPG, PNG, WebP images by up to 90% — no upload, browser-only' },
              { '@type': 'ListItem', position: 31, name: 'Image Converter', url: 'https://formly.tools/tools/image-converter', description: 'Convert images between JPG, PNG, WebP formats — batch, no upload' },
              { '@type': 'ListItem', position: 32, name: 'Image to PDF', url: 'https://formly.tools/tools/image-to-pdf', description: 'Convert multiple images to a single PDF document' },
              { '@type': 'ListItem', position: 33, name: 'Merge PDF', url: 'https://formly.tools/tools/merge-pdf', description: 'Combine multiple PDF files into one — free Smallpdf alternative' },
              { '@type': 'ListItem', position: 34, name: 'PDF to JPG', url: 'https://formly.tools/tools/pdf-to-jpg', description: 'Convert PDF pages to JPG or PNG images — choose DPI, extract pages' },
              { '@type': 'ListItem', position: 35, name: 'Split PDF', url: 'https://formly.tools/tools/split-pdf', description: 'Split PDF by page range, extract pages, or save each page separately' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
