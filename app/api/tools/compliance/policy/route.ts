import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const POLICY_GUIDANCE: Record<string, string> = {
  'infosec-policy': 'Comprehensive master Information Security Policy covering scope, roles & responsibilities (CISO, security team, all staff), asset classification, risk management process, control objectives, compliance obligations, and review cycle. Must reference ISO 27001, SOC 2, and relevant regulations.',
  'access-control': 'Access Control Policy covering: principle of least privilege, role-based access control (RBAC), user provisioning/deprovisioning SLAs (24h for terminations), privileged access management (PAM), MFA requirements, access review schedule (quarterly), guest/contractor access rules.',
  'encryption': 'Encryption Policy specifying: AES-256 for data at rest, TLS 1.2+ for data in transit, approved algorithms and key lengths, key management lifecycle, certificate management, prohibited algorithms (MD5, SHA-1, DES, RC4), database and backup encryption requirements.',
  'incident-response': 'Incident Response Policy covering: incident classification (P1-P4 severity), detection and reporting procedures, escalation matrix, containment/eradication steps, breach notification timelines (GDPR 72h to supervisory authority, 60 days for HIPAA), post-incident review process.',
  'vulnerability-mgmt': 'Vulnerability Management Policy covering: mandatory vulnerability scanning (monthly minimum), penetration testing (annual), patch management SLAs (critical 30 days, high 60 days, medium 90 days), remediation tracking, exception process, responsible disclosure.',
  'password': 'Password & Authentication Policy specifying: minimum length (14+ chars), complexity requirements, MFA mandatory for all production and admin access, password manager requirement, prohibited patterns, privileged account rotation (90 days), service account management.',
  'change-management': 'Change Management Policy covering: change advisory board (CAB) process, change classification (standard/normal/emergency), testing requirements (dev→staging→prod), change window scheduling, rollback procedures, post-implementation review, separation of duties.',
  'log-monitoring': 'Logging & Monitoring Policy covering: what must be logged (auth events, admin actions, data access, network changes), log retention (1 year minimum, 3 years for regulated data), log integrity protection, SIEM alerting rules, on-call response procedures, SOC/NOC escalation.',
  'data-privacy': 'Data Privacy Policy (GDPR/CCPA compliant) covering: lawful basis for processing, data subject rights (access, deletion, portability, rectification), privacy by design requirements, DPO role, cross-border transfer mechanisms (SCCs, adequacy decisions), privacy impact assessments.',
  'data-retention': 'Data Retention & Deletion Policy with retention schedules by data type (employee records 7 years, financial 7 years, contract 5+ years, customer data per agreement), legal hold procedures, secure deletion methods (NIST 800-88), certificate of destruction, annual retention review.',
  'data-classification': 'Data Classification Policy with 4-tier taxonomy: Public, Internal, Confidential, Restricted. For each tier: definition, examples, handling requirements (storage, transmission, printing, disposal), labeling standards, access control requirements, incident severity.',
  'cookie-policy': 'Cookie & Tracking Policy covering: cookie categories (strictly necessary, functional, analytics, marketing), consent management platform (CMP) requirements, opt-in vs opt-out by category, third-party cookie disclosure, do-not-track signals, cookie audit schedule, GDPR/ePrivacy compliance.',
  'dsr': 'Data Subject Rights Policy covering GDPR Articles 15-22: right of access (1 month response), right to rectification, right to erasure (right to be forgotten), right to restrict processing, right to data portability, right to object, automated decision-making. Includes request intake form, verification procedure, response workflow.',
  'data-breach': 'Data Breach Response Policy covering: what constitutes a reportable breach, initial assessment (within 1 hour), escalation to DPO/legal, supervisory authority notification (GDPR: 72 hours), individual notification (where required), documentation in breach register, post-breach review and remediation.',
  'acceptable-use': 'Acceptable Use Policy for company systems covering: permitted use guidelines, prohibited activities (personal use limits, illegal content, unauthorized software), internet usage monitoring disclosure, email retention and monitoring, social media guidelines, confidentiality obligations, policy violation consequences.',
  'remote-work': 'Remote Work Security Policy covering: approved home network requirements, mandatory VPN usage, screen lock (5 min), encrypted storage, public Wi-Fi prohibition without VPN, clean desk policy for video calls, physical document security, visitor access restrictions, dedicated work devices.',
  'byod': 'BYOD Policy covering: enrollment requirements (MDM/MAM), minimum OS versions, required security controls (passcode, encryption, remote wipe consent), approved apps list, prohibited actions (jail-breaking, corporate data sharing), incident reporting, device loss/theft procedure, offboarding process.',
  'code-of-conduct': 'Employee Code of Conduct covering: ethical behavior expectations, conflicts of interest disclosure, anti-bribery and corruption (ABAC), intellectual property protection, confidentiality obligations, harassment-free workplace, social media conduct, political activity, whistleblower protection.',
  'whistleblower': 'Whistleblower Policy covering: anonymous reporting channels (hotline, online portal), protection from retaliation, types of reportable concerns, investigation process, confidentiality commitments, escalation to board/audit committee, regulatory reporting obligations, record retention.',
  'vendor-mgmt': 'Vendor & Third-Party Risk Policy covering: vendor risk tiers (critical/high/medium/low) based on data access and criticality, pre-onboarding due diligence (security questionnaire, SOC 2 report review), contract requirements (DPA, SLA, right to audit), annual reassessment schedule, offboarding data return/deletion.',
  'dpa': 'Data Processing Agreement (GDPR Article 28 compliant) covering: processing instructions, data types and categories, sub-processor approval process, security measures (Art. 32), breach notification obligations (72h), audit rights, cross-border transfers, data deletion on termination, liability and indemnification.',
  'nda': 'Confidentiality & Non-Disclosure Agreement policy covering: definition of confidential information, obligations of receiving party, permitted disclosures (need-to-know basis), exclusions (public domain, prior knowledge), term and survival clauses, remedies for breach, employee NDA requirements, contractor NDA template.',
  'bcp': 'Business Continuity Plan covering: BIA (Business Impact Analysis) methodology, RPO/RTO targets by system criticality, crisis management team and roles, activation triggers, communication plan (internal and external), alternate work arrangements, supply chain contingencies, plan testing schedule (annual tabletop exercise).',
  'drp': 'Disaster Recovery Plan covering: DR scope and objectives, RTO/RPO by system tier, backup strategy (3-2-1 rule), failover procedures by system, DR testing schedule (quarterly restore tests, annual full DR test), data replication architecture, DR site requirements, runbooks for each critical system, escalation contacts.',
};

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'compliance-policy');
  if (!rl.allowed) {
    return NextResponse.json({ error: rl.reason, plan: rl.plan, limit: rl.limit, remaining: 0 }, { status: 429 });
  }

  try {
    const body = await req.json() as {
      policyId: string;
      policyName: string;
      companyInfo: {
        name: string;
        industry: string;
        size: string;
        region: string;
        frameworks: string[];
      };
    };

    const { policyId, policyName, companyInfo } = body;
    const guidance = POLICY_GUIDANCE[policyId] ?? `Comprehensive ${policyName} for a technology company.`;
    const frameworkList = companyInfo.frameworks?.join(', ') || 'ISO 27001, SOC 2';
    const companyRef = companyInfo.name || 'the Company';

    const content = await callAI([
      {
        role: 'system',
        content: `You are a senior compliance attorney and CISO who writes professional compliance policies for enterprise organizations. Write a complete, ready-to-use compliance policy document.

STYLE: Professional, clear, legally appropriate. Use defined terms in bold on first use. Write in third person ("The Company shall...").
FORMAT: HTML only. Use <h1> for document title, <h2> for sections, <h3> for subsections, <p> for paragraphs, <ul>/<ol> for lists, <table> for tables. No markdown.
LENGTH: 1,200-1,800 words of actual policy content.
STRUCTURE:
1. Document header (title, version 1.0, effective date, owner, classification: Internal)
2. Purpose & Scope
3. Policy Statement
4. Roles & Responsibilities
5. Policy Requirements (the main substance — 4-7 detailed sections)
6. Compliance & Enforcement
7. Review & Exceptions
8. References (relevant standards/regulations)
9. Document control table (version history)

Make it specific and actionable — not generic boilerplate. The policy should be immediately usable.`,
      },
      {
        role: 'user',
        content: `Write the "${policyName}" policy for:
Company: ${companyRef}
Industry: ${companyInfo.industry}
Size: ${companyInfo.size} employees
Region: ${companyInfo.region}
Compliance frameworks: ${frameworkList}

Policy content guidance: ${guidance}

Make the policy specific to this company's context, industry, and applicable frameworks.`,
      },
    ], { temperature: 0.3, maxTokens: 4000, model: 'llama-3.3-70b-versatile', skipCache: true });

    return NextResponse.json({
      content,
      policyName,
      remaining: rl.remaining,
      plan: rl.plan,
    });
  } catch (err) {
    console.error('[Compliance Policy] Error:', err);
    return NextResponse.json({ error: 'Policy generation failed. Please try again.' }, { status: 500 });
  }
}
