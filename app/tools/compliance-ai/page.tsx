'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Shield, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lock, Zap, Download, FileText, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';

interface Gap {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  estimatedEffort?: string;
  costImpact?: string;
}

interface RoadmapPhase {
  phase: string;
  duration: string;
  priority: string;
  actions: string[];
}

interface RiskItem {
  risk: string;
  likelihood: string;
  impact: string;
  inherentRisk: string;
  mitigationStrategy: string;
}

interface AssessResult {
  overallScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  grade: string;
  certificationReadiness: string;
  executiveSummary: string;
  gaps: Gap[];
  quickWins: string[];
  roadmap: RoadmapPhase[];
  riskRegister?: RiskItem[];
  vendorRisks?: string;
  auditPrepSteps?: string[];
  isPremium: boolean;
  plan: string;
}

interface PolicyResult {
  policy: string;
  policyName: string;
  frameworkName: string;
  companyName: string;
  generatedAt: string;
  isPremium: boolean;
}

type AnswerValue = 'yes' | 'no' | 'partial' | '';

const FRAMEWORKS = [
  {
    id: 'soc2', name: 'SOC 2', fullName: 'SOC 2 Type II', emoji: '🏆',
    tagline: 'Your enterprise sales certificate',
    plainEnglish: "A US audit standard that proves to enterprise customers that your company handles their data securely. Think of it as a \"trust badge\" that unlocks deals with large companies. Without it, many US enterprises won't sign contracts with SaaS vendors.",
    whoNeeds: 'SaaS companies, B2B tech providers, cloud service companies',
    avgTimeline: '8–14 months (Type II)', region: 'US-primary',
    color: 'from-blue-500/15 to-blue-600/5 border-blue-500/25 hover:border-blue-500/50',
    badge: 'Most Requested',
  },
  {
    id: 'iso27001', name: 'ISO 27001', fullName: 'ISO 27001:2022', emoji: '🌍',
    tagline: 'The global gold standard for security',
    plainEnglish: 'An internationally recognized certification that shows your company has a formal system for managing information security risks. Recognized in 160+ countries. If SOC 2 is the US standard, ISO 27001 is the global equivalent.',
    whoNeeds: 'Companies with EU/global customers, enterprises, government contractors',
    avgTimeline: '6–12 months', region: 'Global',
    color: 'from-indigo-500/15 to-indigo-600/5 border-indigo-500/25 hover:border-indigo-500/50',
    badge: 'Global Standard',
  },
  {
    id: 'hipaa', name: 'HIPAA', fullName: 'HIPAA Security Rule', emoji: '🏥',
    tagline: 'The US healthcare privacy law',
    plainEnglish: 'A US federal law that sets strict rules for protecting patient health information (PHI). If your product or service touches any medical data — health records, insurance data, lab results — you are legally required to comply. Violations carry fines of up to $1.9M per violation type per year.',
    whoNeeds: 'Health tech, medical apps, healthcare providers, health insurers, their software vendors',
    avgTimeline: '3–6 months', region: 'USA',
    color: 'from-rose-500/15 to-rose-600/5 border-rose-500/25 hover:border-rose-500/50',
    badge: 'Legal Requirement',
  },
  {
    id: 'gdpr', name: 'GDPR', fullName: 'General Data Protection Regulation', emoji: '🇪🇺',
    tagline: "Europe's strict data privacy law",
    plainEnglish: "A European Union law that gives people control over their personal data. If you collect email addresses, IP addresses, or any other data from EU residents — even just website visitors — you must comply. Fines can reach €20M or 4% of global revenue, whichever is higher.",
    whoNeeds: 'Any company with EU customers, EU website visitors, or EU employees',
    avgTimeline: '2–5 months', region: 'EU/EEA',
    color: 'from-yellow-500/15 to-yellow-600/5 border-yellow-500/25 hover:border-yellow-500/50',
    badge: 'Legal Requirement',
  },
  {
    id: 'pcidss', name: 'PCI DSS', fullName: 'PCI DSS v4.0', emoji: '💳',
    tagline: 'The credit card security standard',
    plainEnglish: 'A security standard required by Visa, Mastercard, and other card networks for any company that processes, stores, or transmits payment card data. Non-compliance can result in losing the ability to accept card payments entirely.',
    whoNeeds: 'E-commerce, payment processors, fintech, any business processing card payments',
    avgTimeline: '3–9 months', region: 'Global',
    color: 'from-green-500/15 to-green-600/5 border-green-500/25 hover:border-green-500/50',
    badge: 'Payment Compliance',
  },
  {
    id: 'ccpa', name: 'CCPA/CPRA', fullName: 'California Consumer Privacy Act', emoji: '🌴',
    tagline: "California's consumer privacy law",
    plainEnglish: "A California state law that gives California residents rights over their personal data — the right to know, delete, and opt out of the sale of their data. If you have California customers (likely, given California's 39M population), this applies to you.",
    whoNeeds: 'Companies with California customers, annual revenue >$25M, or handling data of >100K CA residents',
    avgTimeline: '1–3 months', region: 'USA (California)',
    color: 'from-orange-500/15 to-orange-600/5 border-orange-500/25 hover:border-orange-500/50',
    badge: 'US Privacy Law',
  },
  {
    id: 'nistcsf', name: 'NIST CSF', fullName: 'NIST Cybersecurity Framework v2.0', emoji: '🏛️',
    tagline: 'The US federal cybersecurity blueprint',
    plainEnglish: 'A voluntary (but widely adopted) framework developed by the US government to help organizations manage cybersecurity risk. It organizes security activities into 6 functions: Govern, Identify, Protect, Detect, Respond, Recover. Popular as a baseline security improvement program.',
    whoNeeds: 'US government contractors, critical infrastructure, companies wanting a security improvement roadmap',
    avgTimeline: '3–6 months', region: 'USA',
    color: 'from-cyan-500/15 to-cyan-600/5 border-cyan-500/25 hover:border-cyan-500/50',
    badge: 'Federal Standard',
  },
  {
    id: 'sox', name: 'SOX', fullName: 'Sarbanes-Oxley Act', emoji: '📈',
    tagline: 'The public company financial accountability law',
    plainEnglish: "A US federal law passed after the Enron scandal that requires public companies to maintain accurate financial records and have internal controls over financial reporting. If you're going public (IPO), your auditors will check SOX compliance. IT controls are a key part.",
    whoNeeds: 'US public companies, pre-IPO companies, subsidiaries of public companies',
    avgTimeline: '6–12 months', region: 'USA',
    color: 'from-amber-500/15 to-amber-600/5 border-amber-500/25 hover:border-amber-500/50',
    badge: 'Public Companies',
  },
  {
    id: 'fedramp', name: 'FedRAMP', fullName: 'Federal Risk and Authorization Management Program', emoji: '🦅',
    tagline: 'The US government cloud certification',
    plainEnglish: 'A US government program that authorizes cloud service providers to sell to federal agencies. Without FedRAMP authorization, you cannot sell cloud software to US government departments. It is rigorous, expensive, and time-consuming — but required to access the $100B+ US federal IT market.',
    whoNeeds: 'Cloud providers selling to US federal government agencies',
    avgTimeline: '12–24 months', region: 'USA',
    color: 'from-slate-500/15 to-slate-600/5 border-slate-500/25 hover:border-slate-500/50',
    badge: 'Gov Cloud',
  },
  {
    id: 'cis', name: 'CIS Controls', fullName: 'CIS Controls v8', emoji: '🛡️',
    tagline: 'The practical security checklist',
    plainEnglish: '18 prioritized security best practices developed by security experts. Unlike compliance frameworks, CIS Controls are about actually improving your security posture — not just passing an audit. Great as a starting point for companies with no formal security program.',
    whoNeeds: 'Any organization wanting to improve security, small businesses, companies new to security',
    avgTimeline: '2–6 months', region: 'Global',
    color: 'from-violet-500/15 to-violet-600/5 border-violet-500/25 hover:border-violet-500/50',
    badge: 'Best Practices',
  },
  {
    id: 'owasp', name: 'OWASP Top 10', fullName: 'OWASP Top 10 (2021)', emoji: '🔐',
    tagline: 'The web security vulnerabilities checklist',
    plainEnglish: 'A list of the 10 most critical web application security risks, maintained by security researchers worldwide. If you build web apps or APIs, these are the vulnerabilities hackers most commonly exploit. Essential for any software development team.',
    whoNeeds: 'Software companies, web app developers, API providers, SaaS products',
    avgTimeline: '1–3 months', region: 'Global',
    color: 'from-red-500/15 to-red-600/5 border-red-500/25 hover:border-red-500/50',
    badge: 'Developer Security',
  },
  {
    id: 'internal', name: 'Internal', fullName: 'Internal Compliance Program', emoji: '🏢',
    tagline: "Your company's own policies and rules",
    plainEnglish: "The foundational compliance program every company needs — internal policies, procedures, and controls that define how your business operates. This includes HR policies, acceptable use, code of conduct, data handling, and financial controls. It's the baseline before pursuing any external certification.",
    whoNeeds: 'All businesses, especially growing startups creating their first formal policies',
    avgTimeline: '1–3 months', region: 'All regions',
    color: 'from-teal-500/15 to-teal-600/5 border-teal-500/25 hover:border-teal-500/50',
    badge: 'All Businesses',
  },
];

const QUESTIONS: Record<string, { id: string; question: string; why: string; category: string }[]> = {
  soc2: [
    { id: 'q1', category: 'Security Policy', question: 'Do you have a written information security policy?', why: 'SOC 2 requires documented policies as evidence that security is managed formally, not ad hoc.' },
    { id: 'q2', category: 'Access Control', question: 'Is access to production systems based on least privilege (minimum necessary access)?', why: 'Trust Services Criteria CC6.1 requires limiting access to only what each person needs.' },
    { id: 'q3', category: 'Access Control', question: 'Do you use multi-factor authentication (MFA) on all critical systems?', why: 'MFA is one of the most-cited SOC 2 deficiencies. Auditors specifically check for MFA on production access.' },
    { id: 'q4', category: 'Access Control', question: 'Do you review and revoke access when employees leave or change roles?', why: 'Stale access accounts are a top audit finding. CC6.2 requires formal offboarding and access review procedures.' },
    { id: 'q5', category: 'Monitoring', question: 'Do you log and monitor access to systems and data?', why: 'CC7.1-CC7.2 require system monitoring to detect anomalous activity and unauthorized access attempts.' },
    { id: 'q6', category: 'Vulnerability Management', question: 'Do you perform regular vulnerability scans or penetration testing?', why: 'SOC 2 requires evidence of proactive vulnerability identification and remediation.' },
    { id: 'q7', category: 'Encryption', question: 'Is all sensitive data encrypted in transit (HTTPS/TLS) and at rest?', why: 'CC6.7 requires encryption of sensitive data. This is a fundamental control that auditors verify.' },
    { id: 'q8', category: 'Change Management', question: 'Do you have a change management process for code deployments?', why: 'CC8.1 requires controlled, tested changes to prevent unauthorized or poorly-tested code from reaching production.' },
    { id: 'q9', category: 'Incident Response', question: 'Do you have a documented incident response plan?', why: 'CC7.3-CC7.5 require formal procedures for detecting, responding to, and communicating security incidents.' },
    { id: 'q10', category: 'Vendor Management', question: 'Do you assess the security of third-party vendors who access your data?', why: 'CC9.2 requires vendor risk management. Supply chain attacks make this increasingly important.' },
    { id: 'q11', category: 'Availability', question: 'Do you have a disaster recovery or business continuity plan?', why: 'If you offer the Availability Trust Service Criteria, CC9.1 requires DR planning and testing.' },
    { id: 'q12', category: 'HR & Background', question: 'Do you perform background checks on employees with system access?', why: 'CC1.4 requires controls around employee hiring, including background screening for sensitive roles.' },
  ],
  iso27001: [
    { id: 'q1', category: 'ISMS', question: 'Do you have a documented Information Security Management System (ISMS)?', why: 'ISO 27001 is built around an ISMS — the set of policies, procedures, and processes that govern your security program.' },
    { id: 'q2', category: 'Risk Assessment', question: 'Do you perform formal information security risk assessments?', why: 'Clause 6.1.2 requires identifying, analyzing, and evaluating information security risks on a regular schedule.' },
    { id: 'q3', category: 'Risk Treatment', question: 'Do you have a risk treatment plan addressing identified risks?', why: 'Clause 6.1.3 requires documented risk treatment decisions — accept, mitigate, transfer, or avoid each risk.' },
    { id: 'q4', category: 'ISMS', question: 'Do you have a Statement of Applicability (SoA) listing Annex A controls?', why: 'The SoA is a mandatory ISO 27001 document listing all 93 Annex A controls and whether they apply to your organization.' },
    { id: 'q5', category: 'Access Control', question: 'Do you have formal access control policies enforced technically?', why: 'Annex A 5.15-5.18 require formal access management including provisioning, review, and revocation.' },
    { id: 'q6', category: 'Cryptography', question: 'Do you have an encryption and key management policy?', why: 'Annex A 8.24 requires policies for cryptographic controls including which algorithms to use and how to manage keys.' },
    { id: 'q7', category: 'Physical Security', question: 'Do you have physical security controls for offices and data centers?', why: 'Annex A 7.1-7.14 require physical security perimeters, visitor controls, and protection of equipment.' },
    { id: 'q8', category: 'Operations', question: 'Do you have change management and configuration management procedures?', why: 'Annex A 8.32 requires controlled change procedures to prevent unauthorized changes to systems.' },
    { id: 'q9', category: 'Incident Management', question: 'Do you have a security incident management procedure?', why: 'Annex A 5.24-5.28 require formal incident reporting, response, and post-incident learning processes.' },
    { id: 'q10', category: 'Business Continuity', question: 'Do you have business continuity plans tested at least annually?', why: 'Annex A 5.29-5.30 require ICT continuity plans that are tested to verify they actually work.' },
    { id: 'q11', category: 'Compliance', question: 'Do you have a process for identifying and complying with legal/regulatory requirements?', why: 'Annex A 5.31-5.36 require you to identify applicable laws and monitor compliance.' },
    { id: 'q12', category: 'Awareness', question: 'Do employees receive regular information security awareness training?', why: 'Clause 7.2 requires documented competence and training records for all personnel handling information.' },
  ],
  hipaa: [
    { id: 'q1', category: 'Administrative', question: 'Have you designated a HIPAA Privacy Officer and Security Officer?', why: 'HIPAA requires covered entities to designate a Privacy Officer (45 CFR 164.530) and Security Officer (164.308). These are named roles, not just concepts.' },
    { id: 'q2', category: 'Administrative', question: 'Have you signed Business Associate Agreements (BAAs) with all vendors who handle PHI?', why: 'A BAA is a legally required contract (45 CFR 164.308) with every vendor that touches PHI. Missing BAAs are among the most common HIPAA violation findings.' },
    { id: 'q3', category: 'Administrative', question: 'Do you conduct a regular Security Risk Assessment (SRA) at least annually?', why: 'The Security Risk Analysis (45 CFR 164.308(a)(1)) is the foundational HIPAA requirement. HHS has fined organizations specifically for missing or inadequate SRAs.' },
    { id: 'q4', category: 'Technical', question: 'Is all Protected Health Information (PHI) encrypted in transit and at rest?', why: 'Encryption is an Addressable (strongly recommended) safeguard in HIPAA. While technically not 100% mandatory, unencrypted PHI breaches result in significantly higher fines.' },
    { id: 'q5', category: 'Technical', question: 'Do you have access controls limiting PHI access to only those who need it?', why: 'Minimum Necessary (45 CFR 164.502) requires limiting PHI access to the minimum needed. Technical access controls are required under the Security Rule.' },
    { id: 'q6', category: 'Technical', question: 'Do you maintain audit logs of who accessed, modified, or transmitted PHI?', why: 'The Audit Controls standard (45 CFR 164.312(b)) requires hardware, software, or procedural mechanisms to record PHI access activity.' },
    { id: 'q7', category: 'Administrative', question: 'Do employees receive HIPAA training at hire and annually?', why: 'Training is required (45 CFR 164.308(a)(5)). Documented training records are the first thing HHS requests during a compliance review.' },
    { id: 'q8', category: 'Administrative', question: 'Do you have a documented Breach Notification procedure (60-day rule)?', why: 'HITECH requires notifying affected individuals within 60 days of discovering a PHI breach, plus notifying HHS and potentially media.' },
    { id: 'q9', category: 'Physical', question: 'Are there physical safeguards controlling access to facilities with PHI?', why: 'HIPAA Physical Safeguards (45 CFR 164.310) require facility access controls, workstation security, and device/media controls.' },
    { id: 'q10', category: 'Administrative', question: 'Do you have documented policies for PHI disposal (shredding, wiping)?', why: 'Improper disposal of PHI (paper or digital) triggers HIPAA enforcement. You need documented procedures and evidence of proper disposal.' },
  ],
  gdpr: [
    { id: 'q1', category: 'Legal Basis', question: 'Have you documented a lawful legal basis for each type of personal data you process?', why: 'Article 6 requires a legal basis (consent, contract, legal obligation, legitimate interest, etc.) for every data processing activity. Processing without a legal basis is illegal.' },
    { id: 'q2', category: 'Transparency', question: 'Do you have a clear, GDPR-compliant privacy notice/policy?', why: 'Articles 13-14 require informing data subjects about how their data is used. The notice must be concise, transparent, and easily accessible.' },
    { id: 'q3', category: 'Data Subject Rights', question: 'Do you have processes to handle data subject requests (access, deletion, portability)?', why: 'GDPR gives individuals 8 rights including Right of Access (Article 15) and Right to Erasure (Article 17). You must respond within 30 days and have systems to fulfill these requests.' },
    { id: 'q4', category: 'Data Mapping', question: 'Do you maintain a Record of Processing Activities (ROPA)?', why: 'Article 30 requires organizations with >250 employees (or processing risky data) to maintain a register of all data processing activities.' },
    { id: 'q5', category: 'Data Protection', question: 'Do you have Data Processing Agreements (DPAs) with all data processors (vendors)?', why: 'Article 28 requires a written contract with every vendor that processes personal data on your behalf. Missing DPAs are a top enforcement finding.' },
    { id: 'q6', category: 'Risk Assessment', question: 'Do you conduct Data Protection Impact Assessments (DPIAs) for high-risk processing?', why: 'Article 35 requires DPIAs before starting processing that poses a high risk to individuals — large-scale profiling, monitoring, or sensitive data processing.' },
    { id: 'q7', category: 'Breach Response', question: 'Do you have a data breach notification process (72-hour rule)?', why: 'Article 33 requires reporting breaches to the supervisory authority within 72 hours of discovery. Article 34 may require notifying affected individuals.' },
    { id: 'q8', category: 'DPO', question: 'Have you assessed whether you need a Data Protection Officer (DPO)?', why: 'Article 37 mandates a DPO for public authorities, large-scale systematic monitoring, or large-scale sensitive data processing.' },
    { id: 'q9', category: 'Consent', question: 'Where you rely on consent, is it freely given, specific, informed, and unambiguous?', why: 'Article 7 sets strict standards for consent. Pre-ticked boxes, bundled consent, or consent as a condition of service are invalid under GDPR.' },
    { id: 'q10', category: 'International Transfers', question: 'Do you have appropriate safeguards for transferring data outside the EU/EEA?', why: 'Chapter V restricts transfers to non-adequate countries. Standard Contractual Clauses (SCCs) are the most common mechanism.' },
  ],
  pcidss: [
    { id: 'q1', category: 'Network Security', question: 'Do you have firewalls configured to protect the cardholder data environment (CDE)?', why: 'Requirement 1 mandates network security controls. Your CDE must be isolated from other networks with properly configured firewalls.' },
    { id: 'q2', category: 'Data Protection', question: 'Do you avoid storing sensitive authentication data after authorization?', why: 'Requirement 3 prohibits storing CVV/CVV2, PIN blocks, or full magnetic stripe data after authorization. Storing these is one of the most serious PCI violations.' },
    { id: 'q3', category: 'Encryption', question: 'Is all cardholder data encrypted in transit using strong cryptography (TLS 1.2+)?', why: 'Requirement 4 mandates TLS 1.2 or higher for all cardholder data transmission. TLS 1.0 and 1.1 are prohibited.' },
    { id: 'q4', category: 'Vulnerability Management', question: 'Do you use and regularly update anti-malware software?', why: 'Requirement 5 mandates anti-malware solutions on all systems in scope. Signatures must be kept current.' },
    { id: 'q5', category: 'Vulnerability Management', question: 'Do you patch systems within defined timeframes (critical: 30 days)?', why: 'Requirement 6.3.3 requires all system components to be protected from known vulnerabilities via patching.' },
    { id: 'q6', category: 'Access Control', question: 'Is access to cardholder data restricted to those with a business need to know?', why: 'Requirement 7 requires restricting access to system components and cardholder data on a need-to-know basis.' },
    { id: 'q7', category: 'Access Control', question: 'Does every user have a unique ID, and do you prohibit shared/group accounts?', why: 'Requirement 8 requires unique user IDs for all access to system components. Shared accounts make audit trails useless.' },
    { id: 'q8', category: 'Monitoring', question: 'Do you log all access to network resources and cardholder data?', why: 'Requirement 10 mandates logging and monitoring all access. Logs must be retained for at least 12 months.' },
    { id: 'q9', category: 'Testing', question: 'Do you conduct regular security testing (vulnerability scans, penetration tests)?', why: 'Requirement 11 mandates quarterly external vulnerability scans plus annual penetration testing.' },
    { id: 'q10', category: 'Policy', question: 'Do you have a documented security policy reviewed annually?', why: 'Requirement 12 requires a comprehensive security policy addressing all PCI DSS requirements, reviewed and distributed at least annually.' },
  ],
  ccpa: [
    { id: 'q1', category: 'Privacy Notice', question: 'Do you have a CCPA/CPRA-compliant privacy policy describing all data collection?', why: 'CCPA requires disclosing at or before the point of data collection: what categories you collect, the purpose, and consumer rights.' },
    { id: 'q2', category: 'Consumer Rights', question: 'Do you have a process for handling Right to Know requests (within 45 days)?', why: 'Consumers can request to know what personal information you have collected about them. You must respond within 45 days.' },
    { id: 'q3', category: 'Consumer Rights', question: 'Do you have a process for handling Right to Delete requests?', why: 'Consumers can request deletion of their personal information. You must delete and instruct service providers to delete within 45 days.' },
    { id: 'q4', category: 'Opt-Out', question: 'If you sell or share personal data, do you have a "Do Not Sell or Share" link?', why: 'CCPA requires a clear opt-out mechanism for selling or sharing personal information. This must be a prominent link on your homepage.' },
    { id: 'q5', category: 'Service Providers', question: 'Do you have data processing contracts with all service providers?', why: 'CCPA requires contracts with service providers prohibiting them from using personal information for any purpose other than the contracted service.' },
    { id: 'q6', category: 'Sensitive Data', question: 'Do you obtain opt-in consent before processing sensitive personal information?', why: 'CPRA added a new category of Sensitive Personal Information (SSN, health data, precise geolocation, etc.) requiring opt-in consent.' },
    { id: 'q7', category: 'Data Minimization', question: 'Do you collect only personal information necessary for the disclosed purpose?', why: 'CPRA added data minimization requirements — you cannot collect more data than necessary for the stated purpose.' },
    { id: 'q8', category: 'Employee Rights', question: 'Are employee privacy rights addressed (CPRA extended to employees)?', why: 'CPRA removed the temporary employee exemption. Employee personal information now has full CCPA protections as of January 2023.' },
  ],
  nistcsf: [
    { id: 'q1', category: 'Govern', question: 'Do you have documented cybersecurity policies and a defined risk management strategy?', why: "NIST CSF v2.0 added Govern as a new core function. Leadership must establish and communicate the organization's cybersecurity risk management strategy." },
    { id: 'q2', category: 'Identify', question: 'Do you maintain an inventory of all hardware, software, and data assets?', why: 'ID.AM (Asset Management) requires knowing what you own before you can protect it. Asset discovery is foundational to all other security activities.' },
    { id: 'q3', category: 'Identify', question: 'Do you conduct cybersecurity risk assessments identifying threats and vulnerabilities?', why: 'ID.RA (Risk Assessment) requires identifying and assessing risks to organizational operations, assets, and individuals from cyber threats.' },
    { id: 'q4', category: 'Protect', question: 'Do you have identity management and access control programs in place?', why: 'PR.AA (Identity Management) requires managing identities and credentials for authorized users, devices, and services.' },
    { id: 'q5', category: 'Protect', question: 'Do you conduct security awareness training for all employees?', why: 'PR.AT (Awareness and Training) requires that personnel understand their security responsibilities and are trained to perform them.' },
    { id: 'q6', category: 'Protect', question: 'Do you protect data through encryption, backups, and secure disposal?', why: 'PR.DS (Data Security) requires protecting information throughout its lifecycle including creation, use, storage, and disposal.' },
    { id: 'q7', category: 'Detect', question: 'Do you have continuous monitoring for anomalous activity or security events?', why: 'DE.CM (Continuous Monitoring) requires ongoing monitoring of organizational assets to detect cybersecurity events.' },
    { id: 'q8', category: 'Respond', question: 'Do you have a documented and tested incident response plan?', why: 'RS.RP (Incident Response Plan Execution) requires executing response processes when cybersecurity events are detected.' },
    { id: 'q9', category: 'Recover', question: 'Do you have recovery procedures and tested backups?', why: 'RC.RP (Incident Recovery Plan Execution) requires restoring systems and services after a cybersecurity incident.' },
    { id: 'q10', category: 'Govern', question: 'Does leadership actively support and fund cybersecurity programs?', why: "GV.OC (Organizational Context) requires cybersecurity to be integrated into enterprise risk management with executive buy-in." },
  ],
  sox: [
    { id: 'q1', category: 'Financial Controls', question: 'Do you have documented internal controls over financial reporting (ICFR)?', why: 'SOX Section 404 requires management to assess and report on the effectiveness of ICFR. Documented controls are the foundation.' },
    { id: 'q2', category: 'IT General Controls', question: 'Do you have IT General Controls (ITGCs) over financial systems?', why: 'ITGCs cover change management, access controls, and operations for systems that support financial reporting. Weak ITGCs undermine all financial controls.' },
    { id: 'q3', category: 'Access Control', question: 'Is access to financial systems restricted based on role, with regular access reviews?', why: 'Unauthorized access to financial systems is a top ITGC deficiency. Quarterly or semi-annual access reviews are standard.' },
    { id: 'q4', category: 'Change Management', question: 'Do you have a documented change management process for financial system changes?', why: 'Uncontrolled changes to financial systems can compromise financial data integrity. SOX requires evidence of testing and approval before deploying changes.' },
    { id: 'q5', category: 'Segregation of Duties', question: 'Do you have segregation of duties (no single person can both initiate and approve transactions)?', why: 'SoD prevents fraud. A single person controlling an entire transaction process is a critical control weakness.' },
    { id: 'q6', category: 'Audit Trail', question: 'Do financial systems maintain complete, tamper-evident audit trails?', why: 'SOX requires audit trails for all transactions in financial systems. Logs must be protected from modification.' },
    { id: 'q7', category: 'Backup & Recovery', question: 'Do you have tested backup and recovery procedures for financial systems?', why: 'Financial data must be protected against loss. Recovery procedures must be documented and tested to ensure financial data availability.' },
    { id: 'q8', category: 'Governance', question: 'Does your Audit Committee include independent directors?', why: 'SOX Section 301 requires public companies to have an independent Audit Committee responsible for overseeing financial reporting.' },
  ],
  fedramp: [
    { id: 'q1', category: 'Authorization', question: 'Do you have a System Security Plan (SSP) covering all FedRAMP controls?', why: 'The SSP is the primary FedRAMP authorization document. It must document how your cloud service implements all applicable NIST 800-53 security controls.' },
    { id: 'q2', category: 'Continuous Monitoring', question: 'Do you have a continuous monitoring program meeting FedRAMP requirements?', why: 'FedRAMP requires monthly vulnerability scanning, annual penetration testing, and ongoing control assessments.' },
    { id: 'q3', category: 'Incident Response', question: 'Can you report security incidents to US-CERT within 1 hour of detection?', why: 'FedRAMP has strict incident reporting timelines — 1 hour for major incidents. This requires 24/7 monitoring and a very mature incident response capability.' },
    { id: 'q4', category: 'Personnel', question: 'Do US personnel requirements apply to all staff with access to federal data?', why: 'FedRAMP requires background checks and citizenship requirements for personnel accessing federal data.' },
    { id: 'q5', category: 'Data Location', question: 'Is federal data stored only within the continental US?', why: 'Most FedRAMP authorizations require data storage within the continental US. Data residency is strictly enforced.' },
    { id: 'q6', category: 'Supply Chain', question: 'Do you have SCRM (Supply Chain Risk Management) controls for hardware and software?', why: 'FedRAMP now requires supply chain risk management per NIST 800-161.' },
    { id: 'q7', category: 'Encryption', question: 'Do you use only FIPS 140-2/140-3 validated encryption modules?', why: 'FedRAMP requires FIPS-validated cryptographic modules for all data encryption. Commercial TLS implementations often do not meet this requirement.' },
    { id: 'q8', category: 'Assessment', question: 'Have you engaged a 3PAO (Third Party Assessment Organization) for your assessment?', why: 'FedRAMP requires an independent assessment by a FedRAMP-authorized 3PAO. This is mandatory.' },
  ],
  cis: [
    { id: 'q1', category: 'IG1', question: 'Do you maintain an inventory of enterprise and software assets?', why: 'CIS Controls 1 & 2 (IG1): You cannot protect what you do not know you have. Asset inventory is the absolute foundation of any security program.' },
    { id: 'q2', category: 'IG1', question: 'Do you have secure configurations applied to all devices and software?', why: 'CIS Control 4 (IG1): Default configurations are designed for ease of use, not security. Hardening reduces your attack surface significantly.' },
    { id: 'q3', category: 'IG1', question: 'Do you manage accounts and privileges, removing unnecessary accounts?', why: 'CIS Control 5 & 6 (IG1): Account hygiene — removing unused accounts, enforcing MFA, and managing admin privileges — prevents unauthorized access.' },
    { id: 'q4', category: 'IG1', question: 'Are email and web browser security configurations in place?', why: 'CIS Control 9 (IG1): Email and web are the top attack vectors. Filtering, anti-phishing controls, and secure browser settings stop most commodity attacks.' },
    { id: 'q5', category: 'IG1', question: 'Do you perform regular data backups (3-2-1 rule) and test restores?', why: 'CIS Control 11 (IG1): Backups are your last line of defense against ransomware. Untested backups often fail when needed most.' },
    { id: 'q6', category: 'IG2', question: 'Do you scan for vulnerabilities and patch based on risk?', why: 'CIS Control 7 (IG2): Unpatched systems are the most exploited attack vector. A formal patching program with risk-based prioritization is essential.' },
    { id: 'q7', category: 'IG2', question: 'Do you audit, collect, and retain logs from systems and network devices?', why: 'CIS Control 8 (IG2): Without logs, you cannot detect attacks or investigate incidents. Centralized logging with at least 90-day retention is recommended.' },
    { id: 'q8', category: 'IG2', question: 'Do you run security awareness training including phishing simulations?', why: 'CIS Control 14 (IG2): Human error causes 82% of breaches. Regular training and simulated phishing dramatically reduce click rates.' },
    { id: 'q9', category: 'IG2', question: 'Do you monitor network traffic for threats (IDS/IPS)?', why: 'CIS Control 13 (IG2): Network monitoring detects lateral movement, data exfiltration, and command-and-control communications.' },
    { id: 'q10', category: 'IG3', question: 'Do you have an incident response team with defined roles and a tested plan?', why: 'CIS Control 17 (IG3): Having a plan before an incident occurs dramatically reduces response time and business impact.' },
  ],
  owasp: [
    { id: 'q1', category: 'A01', question: 'Do you test for and prevent broken access control (IDOR, privilege escalation)?', why: "A01:2021 - Broken Access Control is the #1 OWASP risk. Users accessing resources they should not (e.g., viewing other users' data by changing URL parameters)." },
    { id: 'q2', category: 'A02', question: 'Do you use strong, up-to-date cryptographic algorithms (no MD5, SHA1, DES)?', why: 'A02:2021 - Cryptographic Failures. Using weak encryption exposes sensitive data. Ensure TLS 1.2+, AES-256, SHA-256+.' },
    { id: 'q3', category: 'A03', question: 'Do you validate and sanitize all user inputs to prevent injection attacks (SQL, command, LDAP)?', why: 'A03:2021 - Injection. SQL injection alone has caused billions in damages. Parameterized queries and input validation prevent this entirely.' },
    { id: 'q4', category: 'A04', question: 'Is your application designed with security from the start (threat modeling, security reviews)?', why: 'A04:2021 - Insecure Design. Security bolted on after development is expensive and often ineffective. Design with security requirements from day one.' },
    { id: 'q5', category: 'A05', question: 'Do you regularly check for security misconfigurations (default credentials, exposed admin panels, verbose errors)?', why: 'A05:2021 - Security Misconfiguration. Default passwords, unnecessary features, and verbose error messages are commonly exploited.' },
    { id: 'q6', category: 'A06', question: 'Do you track and update all dependencies and libraries (SCA/software composition analysis)?', why: 'A06:2021 - Vulnerable and Outdated Components. Most modern apps use 100+ dependencies. Tools like Snyk or Dependabot automate vulnerability detection.' },
    { id: 'q7', category: 'A07', question: 'Do you have secure authentication (MFA, account lockout, no credential stuffing vulnerability)?', why: 'A07:2021 - Identification and Authentication Failures. Weak authentication is how most account takeovers happen.' },
    { id: 'q8', category: 'A08', question: 'Do you protect against deserialization attacks and ensure software integrity?', why: 'A08:2021 - Software and Data Integrity Failures. Insecure deserialization and CI/CD pipeline compromises can lead to remote code execution.' },
    { id: 'q9', category: 'A09', question: 'Do you log security events and monitor/alert on anomalies?', why: 'A09:2021 - Security Logging and Monitoring Failures. Without logging, attacks go undetected for an average of 277 days.' },
    { id: 'q10', category: 'A10', question: 'Do you prevent Server-Side Request Forgery (SSRF) attacks?', why: 'A10:2021 - SSRF. Attackers trick the server into making requests to internal services. Validate and allowlist all URLs fetched server-side.' },
  ],
  internal: [
    { id: 'q1', category: 'Policies', question: 'Do you have written HR policies (code of conduct, disciplinary procedures)?', why: 'Documented HR policies establish expectations, protect employees, and are required for employment law compliance in most jurisdictions.' },
    { id: 'q2', category: 'Policies', question: 'Do you have an Acceptable Use Policy for company devices and systems?', why: 'An AUP defines what employees can and cannot do with company technology. Essential for security incident investigations and liability protection.' },
    { id: 'q3', category: 'Data Governance', question: 'Do you have a data classification policy (public, internal, confidential, restricted)?', why: 'Data classification determines how different information should be handled and protected. Without it, all data gets treated the same (usually poorly).' },
    { id: 'q4', category: 'Finance', question: 'Do you have financial controls and approval limits documented?', why: 'Financial controls prevent fraud and errors. Approval hierarchies for spending, vendor payments, and expense reports are fundamental internal controls.' },
    { id: 'q5', category: 'Onboarding', question: 'Do you have a documented onboarding and offboarding process?', why: 'Formal processes ensure new employees get the right access and training, and departing employees have all access revoked — preventing data theft.' },
    { id: 'q6', category: 'Contracts', question: 'Do you have standard contracts for customers, vendors, and employees reviewed by legal?', why: 'Inconsistent or missing contracts expose the company to liability. Standard templates reviewed by legal ensure consistent risk allocation.' },
    { id: 'q7', category: 'Privacy', question: 'Do you have a privacy policy and data handling procedures?', why: "Even small companies with a website collecting email addresses need a privacy policy. It's required by multiple laws and builds customer trust." },
    { id: 'q8', category: 'Security', question: 'Do you have basic security policies (password policy, MFA requirement, data encryption)?', why: 'Basic security policies are the minimum foundation. Without them, employees have no guidance on how to protect company data.' },
    { id: 'q9', category: 'Compliance', question: 'Do you track regulatory requirements applicable to your industry?', why: 'Different industries have different legal requirements. Tracking these prevents surprise violations.' },
    { id: 'q10', category: 'Review', question: 'Are policies reviewed and updated at least annually?', why: 'Stale policies are worse than no policies — they may not reflect current practices or laws. Annual review keeps policies relevant and defensible.' },
  ],
};

const POLICY_TYPES = [
  { id: 'information-security', name: 'Information Security Policy', emoji: '🔒' },
  { id: 'data-privacy', name: 'Data Privacy & Protection Policy', emoji: '🛡️' },
  { id: 'access-control', name: 'Access Control Policy', emoji: '🔑' },
  { id: 'incident-response', name: 'Incident Response Plan', emoji: '🚨' },
  { id: 'acceptable-use', name: 'Acceptable Use Policy', emoji: '📋' },
  { id: 'data-retention', name: 'Data Retention & Disposal Policy', emoji: '🗂️' },
  { id: 'vendor-management', name: 'Vendor Risk Management Policy', emoji: '🤝' },
  { id: 'business-continuity', name: 'Business Continuity & DR Plan', emoji: '♻️' },
  { id: 'change-management', name: 'Change Management Policy', emoji: '⚙️' },
  { id: 'vulnerability-management', name: 'Vulnerability Management Policy', emoji: '🔍' },
  { id: 'encryption', name: 'Encryption & Key Management Policy', emoji: '🔐' },
  { id: 'byod', name: 'BYOD & Remote Work Policy', emoji: '💻' },
  { id: 'risk-assessment', name: 'Risk Assessment Policy', emoji: '⚖️' },
  { id: 'employee-security', name: 'Employee Security Awareness Policy', emoji: '👥' },
  { id: 'data-breach', name: 'Data Breach Notification Procedure', emoji: '⚠️' },
  { id: 'physical-security', name: 'Physical Security Policy', emoji: '🏢' },
];

const INDUSTRIES = [
  'SaaS / Cloud Software', 'FinTech / Banking', 'Healthcare / MedTech', 'E-Commerce / Retail',
  'Government / Public Sector', 'Legal / Professional Services', 'Education / EdTech',
  'Manufacturing / Industrial', 'Insurance', 'Telecommunications', 'Media / Entertainment',
  'Non-Profit', 'Other Technology', 'Other',
];

const SIZES = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];

const FAQS = [
  { q: 'What is compliance and why does my company need it?', a: "Compliance means following specific rules, laws, or standards that govern how your business operates — especially around data security and privacy. You need it because: (1) Laws like GDPR and HIPAA require it and carry fines for violations, (2) Enterprise customers require it as a condition of doing business, and (3) It protects your company and customers from data breaches." },
  { q: 'Which compliance framework should I start with?', a: "It depends on your situation. If you're a SaaS company with US enterprise customers → start with SOC 2. If you have EU customers → add GDPR. If you handle health data → HIPAA is legally required. If you're just starting out → Internal Compliance + CIS Controls is the right foundation. Use our 'Which framework do I need?' tool above for a personalized recommendation." },
  { q: 'Is this better than Comp AI (trycomp.ai)?', a: "Formly Compliance AI is free with no signup, covers 12 frameworks (vs Comp AI's 6), includes a risk register and vendor risk assessment for premium users, generates 16 policy templates, and gives you results instantly without any integrations. Comp AI starts at $199/month and requires you to integrate your systems before providing an assessment." },
  { q: 'Are the policy documents legally binding?', a: 'The generated policy documents are professional, legally-structured templates aligned with the selected framework requirements. They should be reviewed by legal counsel before being adopted as official company policies, especially for HIPAA, GDPR, and other legally-regulated frameworks. They provide an excellent starting point that significantly reduces legal fees.' },
  { q: 'How accurate is the compliance assessment?', a: 'The assessment is based on well-established compliance controls for each framework and uses AI to analyze your specific situation. For critical compliance programs (SOC 2 Type II, FedRAMP, HIPAA), the assessment should be used as a starting point and complemented by a qualified compliance auditor.' },
  { q: 'Do you store any of my company information?', a: 'No. Your company name, industry, and assessment answers are sent to our AI only for the duration of the request and are not stored or retained. We do not collect your company information for any other purpose.' },
];

function ScoreCircle({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ * (1 - pct / 100);
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#f97316' : '#ef4444';
  const label = pct >= 80 ? 'Strong' : pct >= 60 ? 'Moderate' : pct >= 40 ? 'At Risk' : 'Critical';
  return (
    <svg width={130} height={130} className="drop-shadow-lg">
      <circle cx={65} cy={65} r={r} fill="none" stroke="#e5e7eb" strokeWidth={12} />
      <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x={65} y={58} textAnchor="middle" fontSize={28} fontWeight="700" fill={color}>{pct}</text>
      <text x={65} y={76} textAnchor="middle" fontSize={11} fill="#6b7280">{label}</text>
    </svg>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border border-red-200',
    High: 'bg-orange-100 text-orange-700 border border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low: 'bg-green-100 text-green-700 border border-green-200',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[severity] ?? styles.Medium}`}>
      {severity}
    </span>
  );
}

export default function ComplianceAIPage() {
  const [activeTab, setActiveTab] = useState<'assess' | 'policy'>('assess');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [result, setResult] = useState<AssessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedGaps, setExpandedGaps] = useState<Set<number>>(new Set());
  const [showRecommender, setShowRecommender] = useState(false);
  const [recommenderAnswers, setRecommenderAnswers] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const [policyFramework, setPolicyFramework] = useState('soc2');
  const [policyType, setPolicyType] = useState('');
  const [policyCompanyName, setPolicyCompanyName] = useState('');
  const [policyIndustry, setPolicyIndustry] = useState('');
  const [policySize, setPolicySize] = useState('');
  const [policyResult, setPolicyResult] = useState<PolicyResult | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState('');

  const framework = FRAMEWORKS.find(f => f.id === selectedFramework);
  const questions = selectedFramework ? (QUESTIONS[selectedFramework] ?? []) : [];

  function computeRecommendations(): string[] {
    const { orgType, dataTypes, ipo, goal } = recommenderAnswers;
    const recs: string[] = [];
    if (dataTypes?.includes('health')) recs.push('hipaa');
    if (dataTypes?.includes('payment')) recs.push('pcidss');
    if (dataTypes?.includes('eu')) recs.push('gdpr');
    if (dataTypes?.includes('ca') && !recs.includes('ccpa')) recs.push('ccpa');
    if (orgType === 'gov' || goal === 'gov-contract') recs.push('fedramp');
    if (ipo === 'yes') recs.push('sox');
    if (goal === 'enterprise-sales' || goal === 'customer-req') {
      if (!recs.includes('soc2')) recs.push('soc2');
    }
    if (recs.length === 0) { recs.push('cis', 'internal', 'soc2'); }
    else if (!recs.includes('soc2') && (orgType === 'saas' || orgType === 'startup')) recs.unshift('soc2');
    return [...new Set(recs)].slice(0, 4);
  }

  async function handleAssess() {
    if (!selectedFramework) return;
    const answeredCount = Object.values(answers).filter(v => v !== '').length;
    if (answeredCount < questions.length) {
      setError(`Please answer all ${questions.length} questions before assessing.`);
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/compliance/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: selectedFramework, companyName, industry, size,
          answers: questions.map(q => ({ id: q.id, question: q.question, answer: answers[q.id] || 'no' })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Assessment failed. Please try again.'); return; }
      setResult(data as AssessResult);
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  async function handleGeneratePolicy() {
    if (!policyType) { setPolicyError('Please select a policy type.'); return; }
    setPolicyLoading(true); setPolicyError(''); setPolicyResult(null);
    try {
      const res = await fetch('/api/tools/compliance/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framework: policyFramework, policyType, companyName: policyCompanyName, industry: policyIndustry, size: policySize }),
      });
      const data = await res.json();
      if (!res.ok) { setPolicyError(data.error || 'Generation failed.'); return; }
      setPolicyResult(data as PolicyResult);
      setTimeout(() => document.getElementById('policy-output')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { setPolicyError('Network error. Please try again.'); }
    finally { setPolicyLoading(false); }
  }

  function downloadPolicy() {
    if (!policyResult) return;
    const blob = new Blob([policyResult.policy], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${policyResult.policyName.replace(/\s+/g, '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function setAnswer(id: string, value: AnswerValue) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function selectFramework(id: string) {
    setSelectedFramework(id); setAnswers({}); setResult(null); setError('');
    setTimeout(() => document.getElementById('assessment-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  const answeredCount = Object.values(answers).filter(v => v !== '').length;
  const categories = [...new Set(questions.map(q => q.category))];

  return (
    <ToolLayout
      title="Compliance AI"
      description="Assess compliance readiness across 12 frameworks. Generate 16 professional policy templates. Free, no signup."
      icon="⚖️"
      badge="New"
      rateLimited
      toolSlug="compliance-ai"
      faqs={FAQS}
      relatedTools={[
        { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
        { name: 'Terms Simplifier', href: '/tools/terms-simplifier', icon: '⚖️' },
        { name: 'Digital Signature', href: '/tools/digital-signature', icon: '✍️' },
      ]}
    >
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="flex border-b border-stone-200">
          <button onClick={() => setActiveTab('assess')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'assess' ? 'bg-violet-600 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`}>
            <Shield className="w-4 h-4 inline mr-2" />Assess My Compliance
          </button>
          <button onClick={() => setActiveTab('policy')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'policy' ? 'bg-violet-600 text-white' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`}>
            <FileText className="w-4 h-4 inline mr-2" />Generate Policy Document
          </button>
        </div>

        {activeTab === 'assess' && (
          <div className="p-6 space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-blue-800 mb-1">New to compliance? Start here.</p>
              <p className="text-sm text-blue-700">Compliance means following specific rules and standards about data security and privacy. Select a framework below, answer the checklist questions, and get an instant gap analysis with a step-by-step remediation roadmap. Each question has a plain-English explanation.</p>
            </div>

            <div>
              <button onClick={() => setShowRecommender(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
                <HelpCircle className="w-4 h-4" />
                Which framework do I need?
                {showRecommender ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showRecommender && (
                <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl p-5 space-y-4">
                  <p className="text-sm text-violet-700 font-medium">Answer 4 quick questions for a personalized recommendation:</p>
                  <div>
                    <p className="text-sm font-semibold text-stone-700 mb-2">What type of organization are you?</p>
                    <div className="flex flex-wrap gap-2">
                      {[['startup', 'Startup / SMB'], ['saas', 'SaaS / Cloud'], ['enterprise', 'Enterprise'], ['gov', 'Government']].map(([v, l]) => (
                        <button key={v} onClick={() => setRecommenderAnswers(p => ({ ...p, orgType: v }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${recommenderAnswers.orgType === v ? 'bg-violet-600 text-white border-violet-600' : 'border-stone-300 text-stone-600 hover:border-violet-400'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700 mb-2">Do you handle any of these? (select all that apply)</p>
                    <div className="flex flex-wrap gap-2">
                      {[['health', 'Health / Medical data'], ['payment', 'Payment card data'], ['eu', "EU residents' data"], ['ca', "California residents' data"], ['none', 'None of these']].map(([v, l]) => {
                        const current = recommenderAnswers.dataTypes ?? '';
                        const selected = current.includes(v);
                        return (
                          <button key={v} onClick={() => {
                            const arr = current ? current.split(',') : [];
                            const next = selected ? arr.filter(x => x !== v) : [...arr, v];
                            setRecommenderAnswers(p => ({ ...p, dataTypes: next.join(',') }));
                          }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-violet-600 text-white border-violet-600' : 'border-stone-300 text-stone-600 hover:border-violet-400'}`}>{l}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700 mb-2">Why are you pursuing compliance?</p>
                    <div className="flex flex-wrap gap-2">
                      {[['customer-req', 'Enterprise customer required it'], ['legal', 'Legal obligation'], ['enterprise-sales', 'Unlock enterprise sales'], ['gov-contract', 'Government contract'], ['risk', 'Reduce security risk']].map(([v, l]) => (
                        <button key={v} onClick={() => setRecommenderAnswers(p => ({ ...p, goal: v }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${recommenderAnswers.goal === v ? 'bg-violet-600 text-white border-violet-600' : 'border-stone-300 text-stone-600 hover:border-violet-400'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700 mb-2">Are you (or planning to be) publicly traded?</p>
                    <div className="flex gap-2">
                      {[['yes', 'Yes / Pre-IPO'], ['no', 'No']].map(([v, l]) => (
                        <button key={v} onClick={() => setRecommenderAnswers(p => ({ ...p, ipo: v }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${recommenderAnswers.ipo === v ? 'bg-violet-600 text-white border-violet-600' : 'border-stone-300 text-stone-600 hover:border-violet-400'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setRecommendations(computeRecommendations())}
                    className="bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-700 transition-colors">
                    Get My Recommendation
                  </button>
                  {recommendations.length > 0 && (
                    <div className="bg-white border border-violet-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-stone-800 mb-3">Recommended frameworks for you:</p>
                      <div className="space-y-2">
                        {recommendations.map((fId, i) => {
                          const f = FRAMEWORKS.find(x => x.id === fId);
                          if (!f) return null;
                          return (
                            <div key={fId} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-violet-600 w-4">{i + 1}.</span>
                                <span className="text-lg">{f.emoji}</span>
                                <span className="text-sm font-semibold text-stone-800">{f.name}</span>
                                <span className="text-xs text-stone-500">— {f.tagline}</span>
                              </div>
                              <button onClick={() => selectFramework(fId)}
                                className="text-xs font-semibold text-violet-600 hover:text-violet-800 whitespace-nowrap">Assess →</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-stone-900 mb-4">Select a Framework to Assess</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FRAMEWORKS.map(f => (
                  <button key={f.id} onClick={() => selectFramework(f.id)}
                    className={`text-left p-4 rounded-xl border-2 bg-gradient-to-br transition-all ${f.color} ${selectedFramework === f.id ? 'ring-2 ring-violet-500 ring-offset-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{f.emoji}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.badge === 'Legal Requirement' ? 'bg-red-100 text-red-700' : f.badge === 'Most Requested' ? 'bg-violet-100 text-violet-700' : 'bg-stone-100 text-stone-600'}`}>
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-stone-900">{f.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5 italic">{f.tagline}</p>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2">{f.plainEnglish.split('.')[0]}.</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
                      <span>⏱</span><span>{f.avgTimeline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedFramework && framework && (
              <div id="assessment-form" className="space-y-6">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{framework.emoji}</span>
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">{framework.fullName}</h2>
                      <p className="text-xs text-stone-500">{framework.region} · {framework.avgTimeline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-stone-700 mb-3">{framework.plainEnglish}</p>
                  <p className="text-xs text-stone-500"><strong className="text-stone-700">Who needs this:</strong> {framework.whoNeeds}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-900 mb-3">Company Profile <span className="text-stone-400 font-normal">(optional — improves AI analysis)</span></h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name"
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <select value={industry} onChange={e => setIndustry(e.target.value)}
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="">Industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select value={size} onChange={e => setSize(e.target.value)}
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                      <option value="">Company size</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-stone-900">
                      Compliance Assessment <span className="text-stone-400 font-normal">({answeredCount}/{questions.length} answered)</span>
                    </h3>
                    <div className="h-2 w-32 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    {categories.map(cat => (
                      <div key={cat}>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">{cat}</p>
                        <div className="space-y-3">
                          {questions.filter(q => q.category === cat).map(q => (
                            <div key={q.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                              <p className="text-sm font-medium text-stone-800 mb-1">{q.question}</p>
                              <p className="text-xs text-stone-500 mb-3 italic">{q.why}</p>
                              <div className="flex gap-2">
                                {(['yes', 'partial', 'no'] as AnswerValue[]).map(v => {
                                  const styles: Record<string, string> = {
                                    yes: answers[q.id] === 'yes' ? 'bg-green-600 text-white border-green-600' : 'border-stone-300 text-stone-600 hover:border-green-400 hover:text-green-600',
                                    partial: answers[q.id] === 'partial' ? 'bg-amber-500 text-white border-amber-500' : 'border-stone-300 text-stone-600 hover:border-amber-400 hover:text-amber-600',
                                    no: answers[q.id] === 'no' ? 'bg-red-600 text-white border-red-600' : 'border-stone-300 text-stone-600 hover:border-red-400 hover:text-red-600',
                                  };
                                  const labels: Record<string, string> = { yes: '✓ Yes', partial: '~ Partial', no: '✗ No' };
                                  return (
                                    <button key={v as string} onClick={() => setAnswer(q.id, v)}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${styles[v as string]}`}>
                                      {labels[v as string]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                <button onClick={handleAssess} disabled={loading || answeredCount < questions.length}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing compliance gaps...</>
                  ) : (
                    <><Zap className="w-4 h-4" />Assess My {framework.name} Compliance</>
                  )}
                </button>
              </div>
            )}

            {result && (
              <div id="results" className="space-y-6">
                <div className="border-t border-stone-200 pt-6">
                  <h2 className="text-lg font-bold text-stone-900 mb-6">{framework?.fullName} Compliance Assessment Results</h2>
                  <div className="bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 rounded-xl p-6">
                    <div className="flex flex-wrap items-center gap-6">
                      <ScoreCircle score={result.overallScore} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-3xl font-black text-stone-900">{result.grade}</span>
                          <SeverityBadge severity={result.riskLevel} />
                          {result.isPremium && <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">Premium Analysis</span>}
                        </div>
                        <p className="text-sm text-stone-700 font-medium mb-2">{result.certificationReadiness}</p>
                        <p className="text-sm text-stone-600">{result.executiveSummary}</p>
                      </div>
                    </div>
                  </div>

                  {result.quickWins?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-green-700" />
                        <h3 className="text-sm font-bold text-green-800">Quick Wins — Do These This Week</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.quickWins.map((win, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{win}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.gaps?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />Compliance Gaps ({result.gaps.length})
                      </h3>
                      <div className="space-y-3">
                        {result.gaps.map((gap, i) => (
                          <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedGaps(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                              className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-stone-50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <SeverityBadge severity={gap.severity} />
                                <span className="text-sm font-semibold text-stone-800 truncate">{gap.title}</span>
                              </div>
                              {expandedGaps.has(i) ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                            </button>
                            {expandedGaps.has(i) && (
                              <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3">
                                <p className="text-sm text-stone-600">{gap.description}</p>
                                <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-violet-700 mb-1">Recommended Action</p>
                                  <p className="text-sm text-violet-800">{gap.recommendation}</p>
                                </div>
                                {gap.estimatedEffort && (
                                  <div className="flex gap-4 text-xs text-stone-500">
                                    <span>⏱ Effort: <strong className="text-stone-700">{gap.estimatedEffort}</strong></span>
                                    {gap.costImpact && <span>💰 Cost: <strong className="text-stone-700">{gap.costImpact}</strong></span>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.roadmap?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-500" />Remediation Roadmap
                      </h3>
                      <div className="space-y-3">
                        {result.roadmap.map((phase, i) => (
                          <div key={i} className="border border-stone-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xs font-bold text-white bg-violet-600 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                              <div>
                                <p className="text-sm font-bold text-stone-900">{phase.phase}</p>
                                <p className="text-xs text-stone-500">{phase.duration}</p>
                              </div>
                              <SeverityBadge severity={phase.priority} />
                            </div>
                            <ul className="space-y-1.5 ml-9">
                              {phase.actions.map((action, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-stone-600">
                                  <span className="text-violet-400 shrink-0">→</span>{action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.riskRegister && result.riskRegister.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-violet-500" />Risk Register
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Premium</span>
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-stone-200 rounded-xl overflow-hidden">
                          <thead>
                            <tr className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wider">
                              <th className="text-left p-3 font-semibold">Risk</th>
                              <th className="text-left p-3 font-semibold">Likelihood</th>
                              <th className="text-left p-3 font-semibold">Impact</th>
                              <th className="text-left p-3 font-semibold">Inherent Risk</th>
                              <th className="text-left p-3 font-semibold">Mitigation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.riskRegister.map((r, i) => (
                              <tr key={i} className="border-t border-stone-100">
                                <td className="p-3 font-medium text-stone-800">{r.risk}</td>
                                <td className="p-3"><SeverityBadge severity={r.likelihood} /></td>
                                <td className="p-3"><SeverityBadge severity={r.impact} /></td>
                                <td className="p-3"><SeverityBadge severity={r.inherentRisk} /></td>
                                <td className="p-3 text-stone-600 text-xs">{r.mitigationStrategy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {result.vendorRisks && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />Third-Party / Vendor Risk Assessment
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Premium</span>
                      </h3>
                      <p className="text-sm text-amber-800">{result.vendorRisks}</p>
                    </div>
                  )}

                  {result.auditPrepSteps && result.auditPrepSteps.length > 0 && (
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-violet-500" />Audit Preparation Steps
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Premium</span>
                      </h3>
                      <ol className="space-y-2">
                        {result.auditPrepSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                            <span className="font-bold text-violet-600 shrink-0">{i + 1}.</span>{step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {!result.isPremium && (
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-5 text-center">
                      <Lock className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-stone-800 mb-1">Unlock Premium Analysis</p>
                      <p className="text-xs text-stone-600 mb-3">Day Pass ($4.99) or Pro plan includes: expanded gaps, risk register, vendor risk assessment, 5 quick wins, audit prep steps, and detailed effort estimates.</p>
                      <a href="/pricing" className="inline-block bg-violet-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-violet-700 transition-colors">Upgrade for Full Analysis</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">Generate professional compliance policy documents</p>
              <p className="text-sm text-blue-700">Choose a framework and policy type. The AI writes a complete, structured policy document aligned to audit requirements. Ready to review and adopt with minimal editing.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Compliance Framework</label>
                <select value={policyFramework} onChange={e => setPolicyFramework(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  {FRAMEWORKS.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Company Name</label>
                <input value={policyCompanyName} onChange={e => setPolicyCompanyName(e.target.value)} placeholder="Acme Corp"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Industry</label>
                <select value={policyIndustry} onChange={e => setPolicyIndustry(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Company Size</label>
                <select value={policySize} onChange={e => setPolicySize(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  <option value="">Select size</option>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">Policy Type <span className="text-stone-400 font-normal">(select one)</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POLICY_TYPES.map(p => (
                  <button key={p.id} onClick={() => setPolicyType(p.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${policyType === p.id ? 'border-violet-500 bg-violet-50' : 'border-stone-200 hover:border-violet-300'}`}>
                    <span className="text-xl block mb-1">{p.emoji}</span>
                    <span className="text-xs font-semibold text-stone-700 leading-tight block">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {policyError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />{policyError}
              </div>
            )}
            <button onClick={handleGeneratePolicy} disabled={policyLoading || !policyType}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {policyLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Writing policy document...</>
              ) : (
                <><FileText className="w-4 h-4" />Generate Policy Document</>
              )}
            </button>
            {policyResult && (
              <div id="policy-output" className="border-t border-stone-200 pt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{policyResult.policyName}</h3>
                    <p className="text-xs text-stone-500">{policyResult.frameworkName} · {policyResult.companyName}</p>
                  </div>
                  <button onClick={downloadPolicy}
                    className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />Download .txt
                  </button>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 max-h-[600px] overflow-y-auto">
                  <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{policyResult.policy}</pre>
                </div>
                {!policyResult.isPremium && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-stone-800 mb-1">Get More Detailed Policies</p>
                    <p className="text-xs text-stone-600 mb-2">Upgrade to Pro or Day Pass for 800–1200 word comprehensive policies with full sub-sections, exceptions, and detailed procedures.</p>
                    <a href="/pricing" className="inline-block bg-violet-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-700 transition-colors">Upgrade</a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                <span className="text-sm font-semibold text-stone-800">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-stone-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
