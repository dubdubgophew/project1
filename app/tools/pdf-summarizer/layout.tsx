import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free PDF Summarizer 2026 — Get Key Points in Seconds | Formly Tools',
  description: 'Upload any PDF and get AI-generated key points in under 30 seconds. Research papers, contracts, reports, ebooks — summarized accurately. Free, no signup required. Works in your browser.',
  keywords: ['pdf summarizer free online', 'pdf summarizer', 'summarize pdf online free', 'ai pdf summarizer', 'pdf summary tool', 'summarize document ai', 'pdf text extractor', 'research paper summarizer', 'free pdf reader ai', 'extract key points pdf', 'pdf summarizer no signup', 'summarize pdf free', 'pdf key points extractor', 'document summarizer online', 'ai pdf summarizer 2026'],
  openGraph: { title: 'Free AI PDF Summarizer 2026 — Key Points in Seconds | Formly Tools', description: 'Upload any PDF → get key points in under 30 seconds. Research papers, contracts, reports. AI-powered. No signup required.', url: 'https://formly.tools/tools/pdf-summarizer', type: 'website', siteName: 'Formly Tools' },
  twitter: { card: 'summary_large_image', title: 'Free PDF Summarizer 2026 — Key Points Instantly | Formly Tools', description: 'Upload any PDF and get AI-generated key points in under 30 seconds. No signup required.' },
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
          { q: "How does the free PDF summarizer work?", a: "Upload your PDF and our AI (powered by Groq's LLaMA 3.3 70B model) extracts the text and generates a structured summary with key points, important findings, and main conclusions — in under 30 seconds. No software installation required." },
          { q: "Is there a file size limit for PDF summarization?", a: "The free PDF summarizer supports files up to 10MB. For larger documents, try splitting the PDF into sections first. Most research papers, contracts, and business reports fall well within this limit." },
          { q: "Do I need to create an account to summarize a PDF?", a: "No. You can summarize PDFs completely free without creating an account. There is no signup form, no email required, and no credit card needed — open the tool and start immediately." },
          { q: "Can it summarize research papers and academic PDFs?", a: "Yes — the AI is especially effective for research papers, scientific reports, legal documents, and business reports. It preserves key statistics, findings, citations, and section structure in the summary output." },
          { q: "Is my PDF data kept private?", a: "Your PDF is processed in memory and never permanently stored. Files are discarded immediately after summarization is complete. Formly does not retain, sell, or share your document content." },
          { q: "What languages does the PDF summarizer support?", a: "The summarizer can extract and summarize PDFs written in English, Spanish, French, German, Hindi, and most major European languages. The summary output is generated in English by default." },
          { q: "How accurate is the AI PDF summary?", a: "The AI achieves high accuracy for well-formatted PDFs with standard text. Scanned PDFs (image-only, non-OCR) may have reduced accuracy since the tool reads digital text, not images. For best results, use PDFs exported from Word, Google Docs, or academic publishers." },
        ]}
      />
      {children}
    </>
  );
}
