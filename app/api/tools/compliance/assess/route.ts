import { NextRequest, NextResponse } from 'next/server';
import { callAI, sanitizeJsonString } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const FRAMEWORK_NAMES: Record<string, string> = {
  soc2: 'SOC 2 Type II',
  iso27001: 'ISO 27001:2022',
  hipaa: 'HIPAA Security Rule',
  gdpr: 'GDPR (General Data Protection Regulation)',
  pcidss: 'PCI DSS v4.0',
  ccpa: 'CCPA/CPRA',
  nistcsf: 'NIST Cybersecurity Framework v2.0',
  sox: 'SOX (Sarbanes-Oxley Act)',
  fedramp: 'FedRAMP',
  cis: 'CIS Controls v8',
  owasp: 'OWASP Top 10',
  internal: 'Internal Compliance Program',
};

interface Answer {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'partial';
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, 'compliance-assess');
  if (!rl.allowed) {
    return NextResponse.json({ error: rl.reason, plan: rl.plan, limit: rl.limit, remaining: 0 }, { status: 429 });
  }

  const isPremium = rl.plan === 'day_pass' || rl.plan === 'pro' || rl.plan === 'unlimited';

  try {
    const body = await req.json();
    const { framework, companyName, industry, size, answers } = body as {
      framework: string;
      companyName: string;
      industry: string;
      size: string;
      answers: Answer[];
    };

    if (!framework || !FRAMEWORK_NAMES[framework]) {
      return NextResponse.json({ error: 'Invalid framework selected.' }, { status: 400 });
    }
    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'No assessment answers provided.' }, { status: 400 });
    }

    const yesCount = answers.filter(a => a.answer === 'yes').length;
    const partialCount = answers.filter(a => a.answer === 'partial').length;
    const total = answers.length;
    const score = Math.round((yesCount + partialCount * 0.5) / total * 100);
    const nonCompliantItems = answers.filter(a => a.answer === 'no' || a.answer === 'partial');
    const frameworkName = FRAMEWORK_NAMES[framework];

    const systemPrompt = `You are a senior compliance consultant with 15+ years of experience in ${frameworkName} audits and implementations. You provide precise, actionable compliance gap assessments. Always respond with valid JSON only — no markdown, no preamble, no trailing text.`;

    const userPrompt = `Analyze this ${frameworkName} compliance assessment and produce a detailed gap analysis.

Company: ${companyName || 'The organization'}
Industry: ${industry || 'Technology'}
Size: ${size || '11-50 employees'}
Compliance Score: ${score}/100 (${yesCount} compliant, ${partialCount} partial, ${total - yesCount - partialCount} non-compliant out of ${total} controls)

All Answers:
${answers.map(a => `- [${a.answer.toUpperCase()}] ${a.question}`).join('\n')}

Non-compliant / Partial controls requiring attention:
${nonCompliantItems.map(a => `- [${a.answer.toUpperCase()}] ${a.question}`).join('\n')}

Respond with exactly this JSON structure:
{
  "overallScore": ${score},
  "riskLevel": "${score >= 80 ? 'Low' : score >= 60 ? 'Medium' : score >= 40 ? 'High' : 'Critical'}",
  "grade": "${score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : score >= 50 ? 'D' : 'F'}",
  "certificationReadiness": "1-2 sentences on readiness for ${frameworkName} audit/certification",
  "executiveSummary": "${isPremium ? '3-4' : '2'} sentences on compliance posture, primary risks, and urgent priorities specific to ${frameworkName} requirements",
  "gaps": [
    {
      "title": "concise gap title",
      "severity": "Critical|High|Medium|Low",
      "description": "what the gap is and why it matters for ${frameworkName}",
      "recommendation": "specific, actionable remediation step"${isPremium ? ',\n      "estimatedEffort": "e.g. 1-2 weeks",\n      "costImpact": "Low|Medium|High"' : ''}
    }
  ],
  "quickWins": ["immediate action <1 week", "immediate action <1 week", "immediate action <1 week"${isPremium ? ', "immediate action", "immediate action"' : ''}],
  "roadmap": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "Month 1-2",
      "priority": "Critical",
      "actions": ["action1", "action2", "action3"]
    },
    {
      "phase": "Phase 2: Implementation",
      "duration": "Month 3-4",
      "priority": "High",
      "actions": ["action1", "action2", "action3"]
    },
    {
      "phase": "Phase 3: Audit Readiness",
      "duration": "Month 5-6",
      "priority": "Medium",
      "actions": ["action1", "action2", "action3"]
    }
  ]${isPremium ? `,
  "riskRegister": [
    {
      "risk": "risk name",
      "likelihood": "High|Medium|Low",
      "impact": "High|Medium|Low",
      "inherentRisk": "High|Medium|Low",
      "mitigationStrategy": "specific mitigation"
    }
  ],
  "vendorRisks": "2-3 sentences on third-party/vendor compliance risks relevant to this industry and framework",
  "auditPrepSteps": ["step1", "step2", "step3", "step4"]` : ''}
}

Base gaps on the actual non-compliant items. Be specific to ${frameworkName}, not generic. Include ${isPremium ? '5-8' : '3-5'} gaps ordered by severity.`;

    const raw = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'llama-3.3-70b-versatile',
        maxTokens: isPremium ? 4096 : 2048,
        temperature: 0.3,
        skipCache: isPremium,
      }
    );

    let result: Record<string, unknown>;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(sanitizeJsonString(jsonMatch[0]));
    } catch {
      return NextResponse.json({ error: 'Failed to parse assessment. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ...result, isPremium, plan: rl.plan });
  } catch (err) {
    console.error('Compliance assess error:', err);
    return NextResponse.json({ error: 'Assessment failed. Please try again.' }, { status: 500 });
  }
}
