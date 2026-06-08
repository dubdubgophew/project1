import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Compliance AI — SOC 2, ISO 27001, HIPAA, GDPR Checker & Policy Generator | Formly',
  description: 'Free AI compliance tool. Assess your SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, NIST CSF readiness instantly. Generate 16 policy templates. No signup. Better than Comp AI.',
  keywords: [
    'compliance ai tool free', 'soc 2 compliance checker', 'iso 27001 gap assessment', 'hipaa compliance checker free',
    'gdpr compliance tool', 'pci dss assessment', 'nist csf assessment', 'compliance gap analysis free',
    'security compliance tool', 'compliance policy generator', 'information security policy template',
    'soc 2 readiness assessment', 'iso 27001 checklist free', 'hipaa security rule checklist',
    'gdpr compliance checklist', 'ccpa compliance tool', 'sox compliance checklist', 'fedramp compliance',
    'cis controls assessment', 'owasp top 10 checker', 'compliance platform free',
    'compliance management tool', 'security policy generator free', 'compliance ai alternative',
  ],
  openGraph: {
    title: 'Compliance AI — SOC 2, ISO 27001, HIPAA, GDPR + Policy Generator | Formly',
    description: 'Assess compliance across 12 frameworks instantly. Generate 16 professional policy templates. Free, no signup. Covers US, EU, UK, India, Australia.',
    url: 'https://formly.tools/tools/compliance-ai',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compliance AI — SOC 2, ISO 27001, HIPAA, GDPR Free Tool | Formly',
    description: 'Instant compliance gap assessment for 12 frameworks. Generate policy documents free. No signup required.',
  },
  alternates: { canonical: 'https://formly.tools/tools/compliance-ai' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Compliance AI"
        url="https://formly.tools/tools/compliance-ai"
        description="Free AI-powered compliance platform. Assess readiness across 12 frameworks including SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, NIST CSF. Generate 16 professional policy templates instantly. No signup required."
        category="BusinessApplication"
        features={[
          'Compliance gap assessment for 12 frameworks',
          'SOC 2 Type II readiness assessment',
          'ISO 27001:2022 gap analysis',
          'HIPAA Security Rule checklist',
          'GDPR compliance assessment',
          'PCI DSS v4.0 readiness check',
          'NIST Cybersecurity Framework v2.0 assessment',
          'CCPA/CPRA compliance checker',
          'CIS Controls v8 assessment',
          'OWASP Top 10 security review',
          '16 professional policy templates',
          'Which framework do I need? recommender for beginners',
          'Plain-English framework explanations',
          'Compliance roadmap with phased actions',
          'Quick wins identification',
          'Risk register (premium)',
          'Vendor risk assessment (premium)',
          'No signup required — completely free',
        ]}
        faqs={[
          {
            q: 'What is SOC 2 and do I need it?',
            a: 'SOC 2 is a compliance certification that proves your company handles customer data securely. It is required by most enterprise companies before they will sign a contract with you. If you are a SaaS company or B2B technology provider, SOC 2 is typically your most important compliance milestone.',
          },
          {
            q: 'What is the difference between SOC 2 and ISO 27001?',
            a: 'SOC 2 is a US-specific audit standard primarily used for B2B software companies selling to American enterprises. ISO 27001 is a global standard recognized worldwide and is preferred for companies with European or international customers. Both cover similar security controls but have different audit processes and market recognition.',
          },
          {
            q: 'Do I need HIPAA compliance?',
            a: 'Yes, if your product or service handles Protected Health Information (PHI) including patient records, health data, or medical billing. This includes healthcare providers, health insurance companies, medical apps, and any software vendor that processes health data on behalf of healthcare organizations.',
          },
          {
            q: 'Does my company need GDPR compliance?',
            a: 'GDPR applies to any organization that collects or processes personal data of people in the European Union regardless of where your company is based. If you have EU website visitors, EU customers, or EU employees, you need GDPR compliance.',
          },
          {
            q: 'How long does SOC 2 certification take?',
            a: 'SOC 2 Type I (point-in-time assessment) typically takes 2-4 months to prepare and audit. SOC 2 Type II (continuous monitoring over 6-12 months) takes 8-14 months total. Using this tool helps you identify and close gaps before engaging an auditor, reducing your preparation time significantly.',
          },
          {
            q: 'Is this tool better than Comp AI (trycomp.ai)?',
            a: "Formly Compliance AI offers 12 frameworks vs Comp AI's 6, requires no signup or integrations, includes a risk register and vendor risk assessment, generates 16 policy templates, and is completely free. Comp AI costs $199-$997/month and requires company system integrations before providing any assessment.",
          },
        ]}
        steps={[
          { name: 'Select your framework', text: 'Choose from 12 compliance frameworks. Not sure which one? Use the Which framework do I need? helper to get a recommendation based on your situation.' },
          { name: 'Answer the assessment', text: 'Answer yes/no/partial to framework-specific controls. Each question includes a plain-English explanation of what it means and why it matters.' },
          { name: 'Get your gap analysis', text: 'Receive your compliance score, risk level, identified gaps with severity ratings, and a phased remediation roadmap.' },
          { name: 'Generate policy documents', text: 'Use the Policy Generator to create professional compliance policy documents tailored to your framework and organization.' },
        ]}
      />
      {children}
    </>
  );
}
