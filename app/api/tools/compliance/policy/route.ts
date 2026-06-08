import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const FRAMEWORK_NAMES: Record<string, string> = {
  soc2: 'SOC 2 Type II', iso27001: 'ISO 27001:2022', hipaa: 'HIPAA',
  gdpr: 'GDPR', pcidss: 'PCI DSS v4.0', ccpa: 'CCPA/CPRA',
  nistcsf: 'NIST CSF v2.0', sox: 'SOX', fedramp: 'FedRAMP',
  cis: 'CIS Controls v8', owasp: 'OWASP Top 10', internal: 'Internal Compliance',
};

const POLICY_NAMES: Record<string, string> = {
  'information-security': 'Information Security Policy',
  'data-privacy': 'Data Privacy & Protection Policy',
  'access-control': 'Access Control & Identity Management Policy',
  'incident-response': 'Incident Response Plan',
  'acceptable-use': 'Acceptable Use Policy (AUP)',
  'data-retention': 'Data Retention & Disposal Policy',
  'vendor-management': 'Third-Party Vendor Risk Management Policy',
  'business-continuity': 'Business Continuity & Disaster Recovery Plan',
  'change-management': 'Change Management Policy',
  'vulnerability-management': 'Vulnerability Management Policy',
  'encryption': 'Encryption & Key Management Policy',
  'byod': 'BYOD & Remote Work Security Policy',
  'risk-assessment': 'Risk Assessment & Treatment Policy',
  'employee-security': 'Employee Security Awareness Policy',
  'data-breach': 'Data Breach Notification Procedure',
  'physical-security': 'Physical Security Policy',
};

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'compliance-policy');
  if (!rl.allowed) {
    return NextResponse.json({ error: rl.reason, plan: rl.plan, limit: rl.limit, remaining: 0 }, { status: 429 });
  }

  const isPremium = rl.plan === 'day_pass' || rl.plan === 'pro' || rl.plan === 'unlimited';

  try {
    const body = await req.json();
    const { framework, policyType, companyName, industry, size } = body as {
      framework: string;
      policyType: string;
      companyName: string;
      industry: string;
      size: string;
    };

    if (!POLICY_NAMES[policyType]) {
      return NextResponse.json({ error: 'Invalid policy type.' }, { status: 400 });
    }

    const frameworkName = FRAMEWORK_NAMES[framework] ?? 'General Security';
    const policyName = POLICY_NAMES[policyType];
    const org = companyName || 'The Organization';
    const ind = industry || 'Technology';
    const sz = size || '11-50 employees';

    const systemPrompt = `You are a senior compliance attorney and information security consultant. You write professional, legally-sound policy documents that pass ${frameworkName} audits. Write in clear, professional language. Use proper document structure with numbered sections.`;

    const userPrompt = `Write a complete, professional "${policyName}" for:

Organization: ${org}
Industry: ${ind}
Size: ${sz}
Compliance Framework: ${frameworkName}

Requirements:
- This policy must satisfy ${frameworkName} audit requirements
- Write in professional policy language (not a template with placeholders -- write real content)
- Include all sections required by ${frameworkName} for this policy type
- ${isPremium ? 'Write a comprehensive, detailed policy of 800-1200 words covering all sub-sections thoroughly' : 'Write a complete policy of 500-800 words with key sections'}
- Use numbered sections (1.0 Purpose, 2.0 Scope, etc.)
- Include specific technical requirements and procedures, not just general statements
- Tailor content to ${ind} industry practices
- End with version history table and approval signature lines

Structure:
1.0 Purpose
2.0 Scope
3.0 Policy Statement
4.0 Roles & Responsibilities
5.0 [Core policy sections specific to "${policyName}"]
${isPremium ? '6.0 Exceptions & Waivers\n7.0 Compliance & Enforcement\n8.0 Review & Revision\n9.0 References\n10.0 Document History' : '6.0 Enforcement & Review\n7.0 Document History'}

Write the complete policy document now. No preamble -- start with the document title.`;

    const policyText = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'llama-3.3-70b-versatile',
        maxTokens: isPremium ? 5000 : 2500,
        temperature: 0.4,
        skipCache: true,
      }
    );

    if (!policyText?.trim()) {
      return NextResponse.json({ error: 'Policy generation failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      policy: policyText.trim(),
      policyName,
      frameworkName,
      companyName: org,
      generatedAt: new Date().toISOString(),
      isPremium,
      plan: rl.plan,
    });
  } catch (err) {
    console.error('Compliance policy error:', err);
    return NextResponse.json({ error: 'Policy generation failed. Please try again.' }, { status: 500 });
  }
}
