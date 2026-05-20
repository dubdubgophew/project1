import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free PDF to Markdown Converter — Extract & Convert PDF Text | Formly',
  description: 'Convert any PDF to clean, structured Markdown instantly. Preserves headings, lists, and formatting. Perfect for AI workflows — reduces token usage by 40-70%. Free, no signup.',
  keywords: ["pdf to markdown converter", "convert pdf to markdown", "pdf to md free", "pdf text extractor", "pdf to markdown online", "extract text from pdf", "pdf markdown converter", "convert pdf for ai", "pdf to text converter", "pdf to md tool"],
  openGraph: { title: 'Free PDF to Markdown Converter | Formly', description: 'Convert PDFs to clean Markdown. Perfect for AI workflows — reduces token usage 40-70%. Free.', url: 'https://formly.tools/tools/pdf-to-markdown', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free PDF to Markdown Converter | Formly', description: 'Free PDF to Markdown converter — clean output for AI tools. Saves 40-70% tokens. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/pdf-to-markdown' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="PDF to Markdown Converter"
        description="Convert any PDF to clean, structured Markdown instantly. Preserves headings, lists, and formatting. Perfect for AI workflows — reduces token usage by 40-70%. Free, no signup."
        url="https://formly.tools/tools/pdf-to-markdown"
        category="DeveloperApplication"
        features={['Server-side PDF text extraction', 'AI-powered Markdown structuring', 'Preserves headings and lists', 'Download as .md file', 'Ideal for AI/LLM workflows']}
        faqs={[{ q: "Why convert PDF to Markdown for AI?", a: "Markdown is far more token-efficient than HTML or raw PDF text. Converting your documents to Markdown before passing them to AI tools like ChatGPT or Claude can reduce token usage by 40-70%, cutting API costs and allowing larger documents to fit in context windows." }, { q: "What types of PDFs work best?", a: "The converter works best with text-based PDFs (documents, reports, research papers). Image-only PDFs (scanned documents without OCR) cannot have text extracted — you'd need an OCR tool first." }, { q: "How large a PDF can I convert?", a: "Files up to 10MB are supported. For larger documents, split them into sections first." }, { q: "What does the Markdown output look like?", a: "The AI structures the content with proper heading hierarchy (# for main title, ## for sections), bullet lists, numbered lists, bold text, and tables where applicable." }]}
      />
      {children}
    </>
  );
}
