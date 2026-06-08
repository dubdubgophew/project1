import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Compliance AI — SOC 2, ISO 27001, HIPAA, GDPR Compliance Tool Free | Formly',
  description: 'AI-powered compliance platform covering 12 frameworks: SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, CCPA, NIST CSF, SOX, FedRAMP, CIS Controls & more. Gap analysis, 24 policy templates, risk register. Free & Pro.',
  keywords: [
    'compliance ai tool free', 'soc 2 compliance tool', 'iso 27001 gap analysis free', 'hipaa compliance checker',
    'gdpr compliance tool free', 'pci dss compliance checklist', 'ccpa compliance tool', 'nist csf assessment free',
    'compliance gap analysis ai', 'information security policy generator', 'compliance management platform free',
    'sox it general controls', 'fedramp compliance tool', 'cis controls assessment', 'owasp compliance checker',
    'data protection policy generator free', 'incident response policy template', 'access control policy template',
    'trycomp ai alternative free', 'vanta alternative free', 'drata alternative free', 'compliance software free',
    'soc 2 readiness assessment free', 'iso 27001 readiness tool', 'hipaa risk assessment free',
    'gdpr gap analysis free online', 'compliance policy generator ai', 'enterprise compliance tool free',
    'security compliance platform', 'compliance audit tool', 'compliance framework comparison tool',
  ],
  openGraph: {
    title: 'Compliance AI — SOC 2, ISO 27001, HIPAA, GDPR & 9 More Frameworks | Formly',
    description: 'Free AI compliance platform. Gap analysis for 12 frameworks, 24 policy templates, risk register, audit prep. More advanced than Comp AI — no signup required.',
    url: 'https://formly.tools/tools/compliance-ai',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compliance AI — SOC 2, HIPAA, GDPR, ISO 27001 & More | Free | Formly',
    description: 'AI gap analysis for 12 compliance frameworks + 24 policy templates + risk register. Free tier available. No signup required.',
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
        description="Enterprise AI compliance platform covering 12 frameworks including SOC 2 Type I/II, ISO 27001:2022, HIPAA, GDPR, PCI DSS v4.0, CCPA/CPRA, NIST CSF v2.0, SOX, FedRAMP, CIS Controls v8, OWASP Top 10, and Internal Compliance. Features 25-question gap assessments, AI-generated compliance reports, 24 ready-to-use policy templates, risk register, and audit preparation kits."
        category="BusinessApplication"
        features={[
          'SOC 2 Type I/II gap analysis and readiness assessment',
          'ISO 27001:2022 control assessment (93 controls, 11 domains)',
          'HIPAA Administrative, Physical & Technical Safeguards assessment',
          'GDPR compliance gap analysis (99 articles, data subject rights)',
          'PCI DSS v4.0 12-requirement assessment',
          'CCPA/CPRA consumer rights compliance checker',
          'NIST Cybersecurity Framework v2.0 assessment',
          'SOX IT General Controls assessment',
          'FedRAMP Moderate baseline assessment',
          'CIS Controls v8 implementation assessment',
          'OWASP Top 10 application security assessment',
          'Internal company compliance assessment',
          '25-question evidence-based compliance questionnaire',
          'AI-powered gap analysis with remediation roadmap',
          'Priority-scored gap register (Critical/High/Medium/Low)',
          '24 professional policy templates (Security, Privacy, HR, Vendor, BCP)',
          'Information Security Policy, Incident Response Policy, Access Control Policy',
          'GDPR Data Processing Agreement (DPA) generator',
          'Business Continuity Plan and Disaster Recovery Plan templates',
          'Compliance score (0-100) with level classification',
          'Estimated certification timeline and budget guidance',
          '3-phase remediation roadmap (Quick Wins, Core Controls, Advanced Maturity)',
          'Company profile customization (industry, size, region, data types)',
          'HTML policy document download',
          'Free tier: Quick Scan for all frameworks + 3 policy templates',
          'No signup required for free features',
        ]}
        faqs={[
          {
            q: 'Which compliance frameworks does Formly Compliance AI cover?',
            a: 'Formly Compliance AI covers 12 frameworks: SOC 2 Type I/II, ISO/IEC 27001:2022, HIPAA (Privacy, Security, Breach Notification Rules), GDPR, PCI DSS v4.0, CCPA/CPRA, NIST Cybersecurity Framework v2.0, SOX IT General Controls, FedRAMP Moderate, CIS Controls v8, OWASP Top 10, and Internal Company Compliance.',
          },
          {
            q: 'Is the compliance gap analysis free?',
            a: 'Yes. The Quick Scan (25 questions, any of the 12 frameworks) is free for all users with no signup required. The AI-powered detailed gap analysis with remediation roadmap, budget estimates, and certification timeline is also included in the free tier.',
          },
          {
            q: 'How is this different from Comp AI (trycomp.ai) or Vanta?',
            a: 'Vanta and Drata require long integrations, agent installations, and enterprise contracts ($7,500-$20,000/year). Comp AI requires signup and system integration. Formly Compliance AI works instantly with no signup — you answer 25 targeted questions and get a detailed AI-powered gap analysis and professional policy documents in under 2 minutes.',
          },
          {
            q: 'Are the policy templates legally compliant?',
            a: 'The generated policies follow official guidance from NIST, ISO, GDPR supervisory authorities, HHS (HIPAA), and PCI SSC. They are professional-quality starting points that should be reviewed by your legal counsel before formal adoption, especially for regulatory-specific documents like GDPR Data Processing Agreements.',
          },
          {
            q: 'What is a SOC 2 gap analysis?',
            a: 'A SOC 2 gap analysis compares your current security controls against the AICPA Trust Service Criteria (TSC) requirements. It identifies which controls you have implemented, which are partially in place, and which are missing — with a prioritized remediation plan to achieve SOC 2 readiness.',
          },
          {
            q: 'How long does SOC 2 certification take?',
            a: 'SOC 2 Type I typically takes 3-6 months to achieve from gap analysis completion. Type II (which covers a 6-12 month observation period) typically takes 9-18 months total. The actual timeline depends on how many gaps need remediation and your organization\'s size and complexity.',
          },
        ]}
        steps={[
          { name: 'Set up your company profile', text: 'Enter your company name, industry, size, region, and the types of data you process to customize the assessment.' },
          { name: 'Select a compliance framework', text: 'Choose from 12 frameworks including SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, CCPA, NIST CSF, SOX, FedRAMP, CIS Controls, OWASP, or Internal Compliance.' },
          { name: 'Answer the 25-question assessment', text: 'Answer each control question as Yes (fully implemented), Partial (partially implemented), or No (not implemented). Your live score updates as you go.' },
          { name: 'Get your AI gap analysis', text: 'Click Run Assessment to receive a detailed gap analysis with critical and medium gaps, remediation steps, a 3-phase roadmap, estimated timeline, and budget guidance.' },
          { name: 'Generate compliance policies', text: 'Switch to the Policy Builder tab to generate any of 24 professional policy templates customized for your company. Download as HTML documents ready for review and adoption.' },
        ]}
      />
      {children}
    </>
  );
}
