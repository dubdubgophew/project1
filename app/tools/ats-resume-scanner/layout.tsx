import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free ATS Resume Scanner — Check Your Resume Score Instantly | Formly',
  description: 'Scan your resume against any job description instantly. Get your ATS match score, missing keywords, formatting issues, and actionable fixes. Free — no signup. Used by job seekers in USA, India, UK, Canada, Australia.',
  keywords: [
    'ats resume scanner free', 'resume ats checker', 'ats score checker', 'resume keyword scanner',
    'free resume checker online', 'jobscan alternative free', 'ats resume test', 'resume match score',
    'resume keyword checker', 'ats friendly resume checker', 'resume scanner no signup',
    'ats resume scanner india', 'ats resume checker usa', 'ats resume score uk',
    'check resume for ats free', 'resume job description match',
  ],
  alternates: { canonical: 'https://formly.tools/tools/ats-resume-scanner' },
  openGraph: {
    title: 'Free ATS Resume Scanner — Instant Resume Score & Keyword Analysis',
    description: 'Paste your resume + job description. Get ATS match score, missing keywords, section grades, and exact fixes. Free. No signup. Works globally.',
    type: 'website',
    url: 'https://formly.tools/tools/ats-resume-scanner',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
