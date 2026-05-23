import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Contract Generator — NDA, Freelance & Consulting Agreements | Formly',
  description: 'Generate professional legal contracts with AI in minutes. NDAs, freelance agreements, consulting contracts, service agreements & more. Free, edit online, download PDF.',
  keywords: ["contract generator", "free contract template", "ai contract writer", "nda generator free", "freelance contract generator", "service agreement generator", "consulting contract template", "legal contract generator", "contract maker online free", "ai legal document generator"],
  openGraph: { title: 'Free AI Contract Generator | Formly', description: 'Generate NDAs, freelance contracts, consulting agreements with AI. Edit online, download PDF. Free.', url: 'https://formly.tools/tools/contract-generator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Contract Generator | Formly', description: 'Free AI contract generator — NDAs, freelance & service agreements. Edit online, PDF download.' },
  alternates: { canonical: 'https://formly.tools/tools/contract-generator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Contract Generator"
        description="Generate professional legal contracts with AI in minutes. NDAs, freelance agreements, consulting contracts, service agreements & more. Free, edit online, download PDF."
        url="https://formly.tools/tools/contract-generator"
        category="BusinessApplication"
        features={['10 contract types (NDA, freelance, consulting & more)', 'Jurisdiction-specific clauses (US, UK, India, Canada)', 'Edit and preview online', 'Professional PDF with signature blocks', 'Party names and terms customization']}
        faqs={[{ q: "What types of contracts can it generate?", a: "Formly generates Freelance Service Agreements, NDAs, Software Development Contracts, Consulting Agreements, Employment Offer Letters, Website Design Contracts, Content Creation Agreements, Partnership Agreements, Photography Contracts, and Social Media Management Contracts." }, { q: "Are AI-generated contracts legally binding?", a: "AI-generated contracts can be legally binding when properly signed by all parties. However, for high-value or complex agreements, we recommend having a lawyer review the final document. Formly contracts are a professional starting point that saves hours of drafting time." }, { q: "Which jurisdictions are supported?", a: "The contract generator supports India, United States, United Kingdom, European Union, Canada, and Australia with jurisdiction-appropriate clauses." }, { q: "Can I edit the contract after generation?", a: "Yes — the contract opens in an editable text view. Make any changes, then switch to Preview to see the formatted legal document with signature blocks before downloading as PDF." }]}
        steps={[
          { name: 'Select contract type and jurisdiction', text: 'Choose from 10 contract types (NDA, freelance agreement, consulting, etc.) and your governing jurisdiction.' },
          { name: 'Enter party details', text: 'Enter the names of both parties — your name/company and the client or other party.' },
          { name: 'Describe scope and terms', text: 'Describe the scope of work, payment terms, contract duration, and any special clauses.' },
          { name: 'Generate and review', text: 'Click Generate Contract. Review the AI-drafted contract in edit mode, then switch to Preview to see the formatted document.' },
          { name: 'Download or copy', text: 'Download as a PDF with signature blocks or copy the text to your own document system.' },
        ]}
      />
      {children}
    </>
  );
}
