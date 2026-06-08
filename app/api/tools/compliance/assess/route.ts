import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

/* ─── Framework control areas ─────────────────────────────────────────────── */
const FRAMEWORK_CONTEXT: Record<string, string> = {
  SOC2: 'SOC 2 Type II (Trust Service Criteria: Security CC, Availability A, Confidentiality C, Processing Integrity PI, Privacy P)',
  ISO27001: 'ISO/IEC 27001:2022 (11 Annex A domains, 93 controls)',
  HIPAA: 'HIPAA (Administrative Safeguards §164.308, Physical Safeguards §164.310, Technical Safeguards §164.312, Privacy Rule §164.500)',
  GDPR: 'GDPR (Articles 5-6 Principles, 13-14 Transparency, 17 Right to Erasure, 25 Data by Design, 28 Processors, 32-34 Security & Breach, 35 DPIA)',
  PCI_DSS: 'PCI DSS v4.0 (12 Requirements: Network Security, Cardholder Data, Vulnerability Management, Access Control, Monitoring, Security Policy)',
  CCPA: 'CCPA/CPRA (Consumer Rights: know, delete, opt-out, non-discrimination; Business Obligations: notices, contracts, security)',
  NIST_CSF: 'NIST Cybersecurity Framework v2.0 (Govern, Identify, Protect, Detect, Respond, Recover)',
  SOX: 'Sarbanes-Oxley Act (IT General Controls: ITGC, ICFR, Access Controls, Change Management, IT Operations)',
  FEDRAMP: 'FedRAMP Moderate (800-53 Rev 5, 325 controls: AC, AT, AU, CA, CM, CP, IA, IR, MA, PE, PL, PM, RA, SA, SC, SI)',
  CIS: 'CIS Controls v8 (18 control groups: IG1 Basic, IG2 Foundational, IG3 Organizational)',
  OWASP: 'OWASP Top 10 2021 (A01-A10: Broken Access Control, Crypto Failures, Injection, Insecure Design, Misconfiguration, Vulnerable Components, Auth Failures, Integrity Failures, Logging Failures, SSRF)',
  INTERNAL: 'Internal Company Compliance (HR policies, code of conduct, data handling, operational security, vendor management)',
};

const FRAMEWORK_CRITICAL_CONTROLS: Record<string, string[]> = {
  SOC2: ['CC6.1 Logical Access Security', 'CC6.2 Authentication Controls', 'CC6.3 Access Removal', 'CC7.1 Vulnerability Detection', 'CC7.2 Anomaly Detection', 'CC8.1 Change Management', 'CC9.2 Vendor Risk', 'A1.1 Availability Commitments', 'C1.1 Confidentiality Identification', 'PI1.1 Processing Completeness', 'P1.0 Privacy Notice'],
  ISO27001: ['A.5 Organizational Controls', 'A.6 People Controls', 'A.7 Physical Controls', 'A.8 Technological Controls (encryption, access, logging, malware, backup)'],
  HIPAA: ['§164.308(a)(1) Risk Analysis', '§164.308(a)(3) Workforce Training', '§164.308(a)(5) Security Awareness', '§164.312(a)(1) Access Control', '§164.312(a)(2) Encryption', '§164.312(b) Audit Controls', '§164.314(a) Business Associate Agreements'],
  GDPR: ['Art.5 Processing Principles', 'Art.6 Lawful Basis', 'Art.13 Privacy Notice', 'Art.17 Right to Erasure', 'Art.25 Data Protection by Design', 'Art.28 Data Processing Agreements', 'Art.32 Security Measures', 'Art.33 Breach Notification (72h)', 'Art.35 DPIA'],
  PCI_DSS: ['Req.1 Network Security Controls', 'Req.2 Secure Configurations', 'Req.3 Protect Account Data', 'Req.4 Encrypt Transmission', 'Req.5 Malware Protection', 'Req.6 Secure Development', 'Req.7 Restrict Access', 'Req.8 Identify Users', 'Req.10 Logging & Monitoring', 'Req.11 Security Testing', 'Req.12 Security Policy'],
  CCPA: ['Right to Know', 'Right to Delete', 'Right to Opt-Out', 'Non-Discrimination', 'Privacy Notice at Collection', 'Financial Incentive Notices', 'Data Security Requirements', 'Contractor Agreements'],
  NIST_CSF: ['GV.OC Organizational Context', 'ID.AM Asset Management', 'PR.AC Identity Management', 'PR.DS Data Security', 'DE.CM Continuous Monitoring', 'RS.RP Response Plan', 'RC.RP Recovery Plan'],
  SOX: ['ITGC Access Controls', 'ITGC Change Management', 'ITGC Operations Controls', 'ITGC Data Backup', 'Segregation of Duties', 'Privileged Access Management'],
  FEDRAMP: ['AC Access Control Family', 'AU Audit & Accountability', 'CA Assessment & Authorization', 'CM Configuration Management', 'CP Contingency Planning', 'IA Identification & Authentication', 'IR Incident Response', 'RA Risk Assessment', 'SC System & Communications', 'SI System & Information Integrity'],
  CIS: ['CIS 1 Asset Inventory', 'CIS 2 Software Asset Mgmt', 'CIS 3 Data Protection', 'CIS 4 Secure Configuration', 'CIS 5 Account Management', 'CIS 6 Access Control', 'CIS 7 Vulnerability Management', 'CIS 8 Audit Log Management', 'CIS 12 Network Monitoring', 'CIS 16 App Security', 'CIS 17 Incident Response'],
  OWASP: ['A01 Access Control', 'A02 Cryptographic Failures', 'A03 Injection', 'A04 Insecure Design', 'A05 Security Misconfiguration', 'A06 Vulnerable Components', 'A07 Identification & Auth Failures', 'A08 Software Integrity Failures', 'A09 Logging & Monitoring Failures', 'A10 SSRF'],
  INTERNAL: ['Data Handling Policy', 'Acceptable Use Policy', 'Code of Conduct', 'HR Security Procedures', 'Vendor Agreements', 'Operational Runbooks'],
};

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'compliance-assess');
  if (!rl.allowed) {
    return NextResponse.json({ error: rl.reason, plan: rl.plan, limit: rl.limit, remaining: 0 }, { status: 429 });
  }

  try {
    const body = await req.json() as {
      framework: string;
      companyProfile: { name: string; size: string; industry: string; region: string; dataTypes: string[] };
      answers: Record<string, string>; // questionId → 'yes'|'no'|'partial'
      baseScore: number;
    };

    const { framework, companyProfile, answers, baseScore } = body;
    const ctx = FRAMEWORK_CONTEXT[framework] ?? framework;
    const controls = (FRAMEWORK_CRITICAL_CONTROLS[framework] ?? []).join(', ');
    const yesAnswers = Object.entries(answers).filter(([, v]) => v === 'yes').map(([k]) => k).join(', ');
    const noAnswers = Object.entries(answers).filter(([, v]) => v === 'no').map(([k]) => k).join(', ');
    const partialAnswers = Object.entries(answers).filter(([, v]) => v === 'partial').map(([k]) => k).join(', ');

    const response = await callAI([
      {
        role: 'system',
        content: `You are a senior compliance consultant with 15+ years of experience in ${framework} audits. Analyze a company's compliance posture and provide a detailed gap analysis.

Return ONLY valid JSON with this exact structure:
{
  "score": ${baseScore},
  "level": "one of: Non-Compliant | At Risk | Partially Compliant | Substantially Compliant | Compliant",
  "summary": "2-3 sentence assessment",
  "criticalGaps": [
    { "control": "control ID", "title": "Gap Title", "description": "What is missing and why it matters", "priority": "Critical|High", "effort": "Low|Medium|High", "remediation": "Specific actionable fix with tools/vendors if relevant", "timeline": "e.g. 1-2 weeks" }
  ],
  "mediumGaps": [
    { "control": "control ID", "title": "Gap Title", "description": "...", "priority": "Medium|Low", "effort": "Low|Medium|High", "remediation": "...", "timeline": "..." }
  ],
  "strengths": ["What they're doing well (based on yes answers)"],
  "remediationRoadmap": [
    { "phase": 1, "title": "Quick Wins (0-30 days)", "description": "Focus area description", "items": ["specific action 1", "specific action 2"] },
    { "phase": 2, "title": "Core Controls (1-3 months)", "description": "...", "items": [...] },
    { "phase": 3, "title": "Advanced Maturity (3-6 months)", "description": "...", "items": [...] }
  ],
  "certificationTimeline": "e.g. 6-9 months with current trajectory",
  "estimatedBudget": "e.g. $15,000-$30,000 for tools and consultancy",
  "nextSteps": ["Immediate action 1", "Immediate action 2", "Immediate action 3"]
}`,
      },
      {
        role: 'user',
        content: `Framework: ${ctx}
Key controls: ${controls}

Company: ${companyProfile.name || 'The company'} | Industry: ${companyProfile.industry} | Size: ${companyProfile.size} employees | Region: ${companyProfile.region}
Data handled: ${companyProfile.dataTypes.join(', ') || 'General business data'}
Base compliance score: ${baseScore}/100

Assessment answers:
✅ Implemented: ${yesAnswers || 'none'}
⚠️ Partial: ${partialAnswers || 'none'}
❌ Not implemented: ${noAnswers || 'none'}

Generate a specific, actionable compliance gap analysis for this ${framework} assessment.`,
      },
    ], { temperature: 0.3, maxTokens: 3000, model: 'llama-3.3-70b-versatile', skipCache: true });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ ...result, remaining: rl.remaining, plan: rl.plan });
  } catch (err) {
    console.error('[Compliance Assess] Error:', err);
    return NextResponse.json({ error: 'Assessment failed. Please try again.' }, { status: 500 });
  }
}
