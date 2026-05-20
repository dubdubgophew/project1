import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Cover Letter Generator — Write Job-Winning Cover Letters | Formly',
  description: 'Generate a professional, tailored cover letter with AI in seconds. Customize by job role, company, and tone. Download as PDF. Free, no signup required.',
  keywords: ["cover letter generator", "ai cover letter writer", "free cover letter builder", "cover letter maker online", "professional cover letter ai", "job application cover letter generator", "cover letter template free", "ai cover letter no signup", "cover letter writer free", "best cover letter generator"],
  openGraph: { title: 'Free AI Cover Letter Generator | Formly', description: 'Write a job-winning cover letter with AI. Tailored to your role and company. Download PDF free.', url: 'https://formly.tools/tools/cover-letter', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Cover Letter Generator | Formly', description: 'Free AI cover letter generator — tailored, professional, PDF download. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/cover-letter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Cover Letter Generator"
        description="Generate a professional, tailored cover letter with AI in seconds. Customize by job role, company, and tone. Download as PDF. Free, no signup required."
        url="https://formly.tools/tools/cover-letter"
        category="BusinessApplication"
        features={['Tailored to job role and company', 'Professional, enthusiastic, or concise tones', 'Edit and preview online', 'PDF download with letter formatting', 'Instant AI generation']}
        faqs={[{ q: 'How does the AI cover letter generator work?', a: 'Enter the job title, company name, your key skills, and desired tone. The AI writes a fully customized cover letter in seconds — no templates or copy-paste required.' }, { q: 'Is it free to generate a cover letter?', a: 'Yes — free to use up to 5 times per day. Sign up for a free account for 10/day. No subscription needed for basic use.' }, { q: 'Can I download the cover letter as PDF?', a: 'Yes — switch to Preview mode to see the formatted letter, then click Download PDF to get a clean, print-ready document.' }, { q: 'How do I make the cover letter sound more personal?', a: 'Add specific achievements and experiences in the 'key highlights' field. Mention specific products, projects, or values of the target company for the most personalized result.' }]}
      />
      {children}
    </>
  );
}
