import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI PDF Summarizer — Summarize Any PDF Online | Formly',
  description: 'Summarize any PDF instantly with AI. Get key points from research papers, reports, contracts & ebooks in seconds. Free, no signup required. Powered by Groq AI.',
  keywords: ['pdf summarizer', 'summarize pdf online free', 'ai pdf summarizer', 'pdf summary tool', 'summarize document ai', 'pdf text extractor', 'research paper summarizer', 'free pdf reader ai', 'extract key points pdf', 'pdf summarizer no signup'],
  openGraph: { title: 'Free AI PDF Summarizer | Formly', description: 'Summarize any PDF instantly with AI. Free, no signup. Key insights from any document in seconds.', url: 'https://formly.tools/tools/pdf-summarizer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI PDF Summarizer | Formly', description: 'Summarize any PDF with AI in seconds. Free, no signup required.' },
  alternates: { canonical: 'https://formly.tools/tools/pdf-summarizer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="PDF Summarizer"
        description="AI-powered PDF summarizer that extracts key points from any document in seconds. Free, no signup required."
        url="https://formly.tools/tools/pdf-summarizer"
        category="UtilitiesApplication"
        features={['AI-powered summarization', 'Supports any PDF up to 10MB', 'Short, medium or detailed summaries', 'No signup required', 'Research paper & report summarizer']}
        faqs={[
          { q: 'How does the free PDF summarizer work?', a: 'Upload your PDF and our AI (powered by Groq) extracts the text and generates a structured summary with key points, important findings, and main conclusions — in under 30 seconds.' },
          { q: 'Is there a file size limit for PDF summarization?', a: 'Yes, the free PDF summarizer supports files up to 10MB. For larger documents, try splitting the PDF into sections first.' },
          { q: 'Do I need to create an account to summarize a PDF?', a: 'No, you can summarize up to 5 PDFs per day completely free without creating an account. Sign up free for 10/day or upgrade to Pro for unlimited summarizations.' },
          { q: 'Can it summarize research papers and academic PDFs?', a: 'Yes — the AI is especially good at research papers, scientific reports, legal documents, and business reports. It preserves key statistics, findings, and citations.' },
          { q: 'Is my PDF data kept private?', a: 'Your PDF is processed temporarily and never stored. Files are deleted immediately after summarization. We do not retain any document content.' },
        ]}
      />
      {children}
    </>
  );
}
