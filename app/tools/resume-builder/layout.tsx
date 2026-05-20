import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Resume Builder — ATS-Optimized Resume Generator | Formly',
  description: 'Build a professional, ATS-friendly resume with AI in minutes. Get an ATS score, keyword suggestions, and download as PDF. Free resume builder — no signup needed.',
  keywords: ["ai resume builder", "free resume maker online", "ats resume builder", "resume generator ai", "free resume creator", "professional resume builder", "resume builder no signup", "ats friendly resume free", "resume builder download pdf", "ai cv builder free"],
  openGraph: { title: 'Free AI Resume Builder | Formly', description: 'Build an ATS-optimized resume with AI. ATS score, keyword suggestions, PDF download. Free.', url: 'https://formly.tools/tools/resume-builder', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Resume Builder | Formly', description: 'Free AI resume builder — ATS-optimized, PDF download, no signup required.' },
  alternates: { canonical: 'https://formly.tools/tools/resume-builder' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Resume Builder"
        description="Build a professional, ATS-friendly resume with AI in minutes. Get an ATS score, keyword suggestions, and download as PDF. Free resume builder — no signup needed."
        url="https://formly.tools/tools/resume-builder"
        category="BusinessApplication"
        features={['ATS compatibility score (0-100)', 'AI-powered content generation', 'Professional PDF download', 'Keyword optimization suggestions', 'Edit and preview before download']}
        faqs={[{ q: "What is an ATS score?", a: "ATS stands for Applicant Tracking System — software used by employers to filter resumes before a human reads them. An ATS score shows how likely your resume is to pass these filters. A score above 80 is considered strong." }, { q: "Is the AI resume builder free?", a: "Yes — building and previewing your resume is completely free. Download as PDF with a free account. No subscription required for basic use." }, { q: "How do I optimize my resume for ATS?", a: "Include relevant keywords from the job description, use standard section headings (Work Experience, Education, Skills), avoid tables and graphics in the ATS version, and quantify achievements with numbers." }, { q: "Can I edit the AI-generated resume?", a: "Yes — after generation you can edit every section directly in the browser before downloading. Switch between edit and preview modes to see the formatted output." }]}
      />
      {children}
    </>
  );
}
