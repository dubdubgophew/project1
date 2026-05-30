import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Resume Builder 2026 — ATS-Optimized in Minutes | Formly Tools',
  description: 'Create an ATS-optimized resume in minutes with free AI. Get an ATS score 0-100, keyword tips, and PDF download — no signup needed. Better than Resume.io, Zety, or Kickresume for free.',
  keywords: ["free resume builder online", "ai resume builder", "free resume maker online", "ats resume builder", "resume generator ai", "free resume creator", "professional resume builder", "resume builder no signup", "ats friendly resume free", "resume builder download pdf", "ai cv builder free", "resume io alternative free", "zety alternative free", "resume builder 2026", "free ats resume builder 2026"],
  openGraph: { title: 'Free AI Resume Builder 2026 — ATS-Optimized in Minutes | Formly Tools', description: 'Create an ATS-optimized resume in minutes with AI. ATS score 0-100, keyword tips, PDF download. No signup needed.', url: 'https://formly.tools/tools/resume-builder', type: 'website', siteName: 'Formly Tools' },
  twitter: { card: 'summary_large_image', title: 'Free AI Resume Builder 2026 — ATS-Optimized | Formly Tools', description: 'Create an ATS-optimized resume with AI in minutes. ATS score, PDF download — no signup required.' },
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
        faqs={[
          { q: "What is an ATS score and why does it matter?", a: "ATS stands for Applicant Tracking System — software used by 99% of Fortune 500 companies and most mid-size employers to filter resumes before a human reads them. Formly's AI assigns an ATS score from 0-100 showing how well your resume matches standard ATS parsing. A score above 80 is considered strong for most roles." },
          { q: "Is the AI resume builder completely free?", a: "Yes — building, previewing, and editing your resume is completely free. Download as PDF with no subscription required. There is no freemium paywall on core features unlike Resume.io ($2.95/week) or Zety ($23.70/month)." },
          { q: "How do I optimize my resume for ATS systems in 2026?", a: "Use keywords from the specific job description (match at least 60-70% of required skills), use standard section headings (Work Experience, Education, Skills, Summary), avoid tables, graphics, headers/footers, text boxes, and columns — ATS parsers cannot read them reliably. Quantify achievements with numbers and percentages." },
          { q: "Can I edit the AI-generated resume content?", a: "Yes — after the AI generates your resume, every section is fully editable directly in the browser. You can rewrite bullet points, reorder sections, add or remove items, then see a live formatted preview before downloading." },
          { q: "What file format does the resume download in?", a: "Resumes download as print-ready PDFs — a universally accepted format for job applications. The PDF is formatted cleanly to render correctly in ATS systems. A Word (.docx) export is available for Pro users." },
          { q: "How is Formly Resume Builder different from Resume.io, Zety, and Kickresume?", a: "Formly's resume builder is completely free including PDF download — Resume.io, Zety, and Kickresume all charge $20-30/month to download. Formly also provides an actual ATS compatibility score, not just visual formatting, and works without creating an account." },
          { q: "Can the AI write resume bullet points for me?", a: "Yes. Enter your job title, company, dates, and a rough description of what you did — the AI transforms it into strong action-verb bullet points with quantified achievements following the 'accomplished X by doing Y resulting in Z' formula used by Google, Microsoft, and Amazon recruiters." },
        ]}
        steps={[
          { name: 'Enter your personal information', text: 'Fill in your name, target job title, email, phone, and location.' },
          { name: 'Write your professional summary', text: 'Add a brief description of your background and goals. AI will enhance it into a compelling summary.' },
          { name: 'Add work experience', text: 'Enter your companies, roles, durations, and key achievements. AI converts them into strong bullet points with metrics.' },
          { name: 'List your skills and education', text: 'Add your technical and soft skills (comma-separated) and education details.' },
          { name: 'Generate and download', text: 'Click Generate ATS Resume. Edit the output if needed, then download as a print-ready PDF.' },
        ]}
      />
      {children}
    </>
  );
}
