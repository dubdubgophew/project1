'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { AlertCircle, CheckCircle2, Clock, Download, Loader2, Lock, RefreshCw, X, ChevronDown, ChevronRight, Zap } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface CompanyProfile { name: string; industry: string; size: string; region: string; dataTypes: string[] }
interface Question { id: string; text: string; category: string; weight: number; frameworks: string[] }
interface PolicyTemplate { id: string; name: string; icon: string; desc: string; category: string; frameworks: string[]; freeIncluded: boolean }
type Answer = 'yes' | 'no' | 'partial' | null;
interface Gap { control: string; title: string; description: string; priority: string; effort: string; remediation: string; timeline: string }
interface RoadmapPhase { phase: number; title: string; description: string; items: string[] }
interface AssessResult {
  score: number; level: string; summary: string;
  criticalGaps: Gap[]; mediumGaps: Gap[];
  strengths: string[];
  remediationRoadmap: RoadmapPhase[];
  certificationTimeline: string;
  estimatedBudget: string;
  nextSteps: string[];
}
type Tab = 'scan' | 'policies' | 'multi' | 'risk' | 'reports';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const FRAMEWORKS = [
  { id: 'SOC2', name: 'SOC 2', color: 'blue', desc: 'Security, Availability, Confidentiality, Processing Integrity, Privacy' },
  { id: 'ISO27001', name: 'ISO 27001', color: 'green', desc: '93 controls across 11 domains — global ISMS standard' },
  { id: 'HIPAA', name: 'HIPAA', color: 'purple', desc: 'US healthcare — PHI privacy, security & breach notification rules' },
  { id: 'GDPR', name: 'GDPR', color: 'orange', desc: 'EU data protection — 99 articles, data subject rights, DPO' },
  { id: 'PCI_DSS', name: 'PCI DSS', color: 'red', desc: 'Payment card data security — 12 requirements, v4.0' },
  { id: 'CCPA', name: 'CCPA/CPRA', color: 'indigo', desc: 'California consumer privacy rights and business obligations' },
  { id: 'NIST_CSF', name: 'NIST CSF', color: 'teal', desc: 'Cybersecurity Framework v2.0 — Govern, Identify, Protect, Detect, Respond, Recover' },
  { id: 'SOX', name: 'SOX', color: 'amber', desc: 'Sarbanes-Oxley IT General Controls for public companies' },
  { id: 'FEDRAMP', name: 'FedRAMP', color: 'slate', desc: 'US federal cloud security — 325 NIST 800-53 controls' },
  { id: 'CIS', name: 'CIS Controls', color: 'cyan', desc: 'v8 — 18 control groups from basic to organizational' },
  { id: 'OWASP', name: 'OWASP Top 10', color: 'rose', desc: 'Web application security risks — A01 through A10' },
  { id: 'INTERNAL', name: 'Internal Compliance', color: 'stone', desc: 'Company HR, operations, data handling, and vendor policies' },
];

const FW_COLOR: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  purple: 'bg-violet-100 text-violet-700 border-violet-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  stone: 'bg-stone-100 text-stone-600 border-stone-200',
};

const QUESTIONS: Question[] = [
  { id: 'mfa', text: 'Is multi-factor authentication (MFA) enforced on all critical systems and admin accounts?', category: 'Identity & Access Management', weight: 5, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','NIST_CSF','GDPR','FEDRAMP','CIS'] },
  { id: 'rbac', text: 'Is access granted on a least-privilege basis using role-based access control (RBAC)?', category: 'Identity & Access Management', weight: 5, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','NIST_CSF','FEDRAMP','CIS'] },
  { id: 'offboarding', text: 'Are user accounts deprovisioned within 24 hours of employee/contractor termination?', category: 'Identity & Access Management', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF','CIS'] },
  { id: 'access_review', text: 'Are user access rights formally reviewed at least every 90 days?', category: 'Identity & Access Management', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','FEDRAMP'] },
  { id: 'encryption_rest', text: 'Is all sensitive data encrypted at rest using AES-256 or equivalent?', category: 'Encryption & Data Protection', weight: 5, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','GDPR','NIST_CSF','FEDRAMP','CIS'] },
  { id: 'encryption_transit', text: 'Is all data in transit protected using TLS 1.2 or higher?', category: 'Encryption & Data Protection', weight: 5, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','GDPR','NIST_CSF','FEDRAMP','CIS'] },
  { id: 'key_mgmt', text: 'Is there a documented key management process for all cryptographic keys?', category: 'Encryption & Data Protection', weight: 3, frameworks: ['SOC2','ISO27001','PCI_DSS','NIST_CSF','FEDRAMP'] },
  { id: 'patch_mgmt', text: 'Are critical security patches applied within 30 days and high-severity within 60 days?', category: 'Vulnerability Management', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','NIST_CSF','CIS','FEDRAMP'] },
  { id: 'vuln_scans', text: 'Are automated vulnerability scans run at least monthly on all production systems?', category: 'Vulnerability Management', weight: 4, frameworks: ['SOC2','ISO27001','PCI_DSS','NIST_CSF','CIS','FEDRAMP'] },
  { id: 'pen_testing', text: 'Is penetration testing conducted at least annually by qualified third-party personnel?', category: 'Vulnerability Management', weight: 3, frameworks: ['SOC2','ISO27001','PCI_DSS','NIST_CSF','FEDRAMP'] },
  { id: 'ir_plan', text: 'Is there a documented, board-approved incident response plan with defined roles?', category: 'Incident Response', weight: 5, frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF','GDPR','CIS','FEDRAMP'] },
  { id: 'breach_notify', text: 'Are breach notification procedures defined with regulatory timelines (GDPR 72h, HIPAA 60 days)?', category: 'Incident Response', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','GDPR','CCPA'] },
  { id: 'ir_testing', text: 'Is the incident response plan tested via tabletop exercises at least annually?', category: 'Incident Response', weight: 3, frameworks: ['SOC2','ISO27001','NIST_CSF','FEDRAMP'] },
  { id: 'centralized_logs', text: 'Is centralized logging in place for all production systems with at least 1-year retention?', category: 'Logging & Monitoring', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','NIST_CSF','CIS','FEDRAMP','SOX'] },
  { id: 'siem', text: 'Is there 24/7 security monitoring or SIEM alerting for anomalous activity?', category: 'Logging & Monitoring', weight: 4, frameworks: ['SOC2','ISO27001','PCI_DSS','NIST_CSF','CIS','FEDRAMP'] },
  { id: 'privacy_policy', text: 'Is there a published, current privacy policy disclosing all data processing activities?', category: 'Data Privacy', weight: 4, frameworks: ['GDPR','CCPA','ISO27001','HIPAA'] },
  { id: 'data_mapping', text: 'Have you documented a data flow map showing where all personal/sensitive data is stored and processed?', category: 'Data Privacy', weight: 4, frameworks: ['GDPR','CCPA','HIPAA','ISO27001','FEDRAMP'] },
  { id: 'consent', text: 'Is explicit, documented consent obtained before collecting personal data where required?', category: 'Data Privacy', weight: 4, frameworks: ['GDPR','CCPA'] },
  { id: 'backup', text: 'Are all critical systems backed up at least daily, with backups tested monthly?', category: 'Business Continuity', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF','CIS','FEDRAMP'] },
  { id: 'bcp', text: 'Is there a documented, tested Business Continuity Plan (BCP) with defined RTO/RPO targets?', category: 'Business Continuity', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF','FEDRAMP'] },
  { id: 'vendor_risk', text: 'Are third-party vendors assessed for security posture before onboarding and annually thereafter?', category: 'Vendor & Third-Party Risk', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','GDPR','NIST_CSF','FEDRAMP'] },
  { id: 'security_training', text: 'Do all employees complete security awareness training at least annually?', category: 'Security Culture', weight: 3, frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF','CIS','FEDRAMP','SOX'] },
  { id: 'sdlc', text: 'Is security integrated into the software development lifecycle (SAST, DAST, code review)?', category: 'Application Security', weight: 3, frameworks: ['SOC2','ISO27001','OWASP','NIST_CSF','FEDRAMP','PCI_DSS'] },
  { id: 'config_mgmt', text: 'Are hardened configuration baselines applied and enforced on all systems?', category: 'Configuration Management', weight: 3, frameworks: ['SOC2','ISO27001','CIS','NIST_CSF','FEDRAMP','PCI_DSS'] },
  { id: 'risk_assessment', text: 'Is a formal risk assessment conducted at least annually with results tracked to closure?', category: 'Risk Management', weight: 4, frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF','GDPR','FEDRAMP','SOX'] },
];

const FREE_POLICY_IDS = ['infosec-policy', 'access-control', 'incident-response'];

const POLICY_TEMPLATES: PolicyTemplate[] = [
  // Security (8)
  { id: 'infosec-policy', name: 'Information Security Policy', icon: '🔒', desc: 'Master policy covering controls, roles, risk management, and compliance', category: 'Security', frameworks: ['SOC2','ISO27001','HIPAA'], freeIncluded: true },
  { id: 'access-control', name: 'Access Control Policy', icon: '🔑', desc: 'Least-privilege, RBAC, MFA, provisioning/deprovisioning SLAs', category: 'Security', frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS'], freeIncluded: true },
  { id: 'encryption', name: 'Encryption Policy', icon: '🛡️', desc: 'AES-256 at rest, TLS 1.2+ in transit, key management lifecycle', category: 'Security', frameworks: ['ISO27001','HIPAA','PCI_DSS','GDPR'], freeIncluded: false },
  { id: 'incident-response', name: 'Incident Response Policy', icon: '🚨', desc: 'Severity classification, escalation, breach notification timelines', category: 'Security', frameworks: ['SOC2','ISO27001','HIPAA','GDPR'], freeIncluded: true },
  { id: 'vulnerability-mgmt', name: 'Vulnerability Management Policy', icon: '🔍', desc: 'Patch SLAs, scanning schedules, pen testing, remediation tracking', category: 'Security', frameworks: ['SOC2','ISO27001','PCI_DSS','NIST_CSF'], freeIncluded: false },
  { id: 'password', name: 'Password & Authentication Policy', icon: '🔐', desc: 'Complexity requirements, rotation schedules, privileged access rules', category: 'Security', frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS'], freeIncluded: false },
  { id: 'change-management', name: 'Change Management Policy', icon: '⚙️', desc: 'CAB process, change types, testing requirements, rollback procedures', category: 'Security', frameworks: ['SOC2','ISO27001','PCI_DSS','SOX'], freeIncluded: false },
  { id: 'log-monitoring', name: 'Logging & Monitoring Policy', icon: '📊', desc: 'What to log, retention periods, SIEM alerts, escalation procedures', category: 'Security', frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS'], freeIncluded: false },
  // Privacy (6)
  { id: 'data-privacy', name: 'Data Privacy Policy', icon: '🔏', desc: 'GDPR/CCPA-compliant: lawful basis, data subject rights, DPO, transfers', category: 'Privacy', frameworks: ['GDPR','CCPA','ISO27001'], freeIncluded: false },
  { id: 'data-retention', name: 'Data Retention & Deletion Policy', icon: '🗂️', desc: 'Retention schedules by data type, legal holds, secure deletion (NIST 800-88)', category: 'Privacy', frameworks: ['GDPR','CCPA','HIPAA','ISO27001'], freeIncluded: false },
  { id: 'data-classification', name: 'Data Classification Policy', icon: '🏷️', desc: 'Public/Internal/Confidential/Restricted tiers with handling requirements', category: 'Privacy', frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','GDPR'], freeIncluded: false },
  { id: 'cookie-policy', name: 'Cookie & Tracking Policy', icon: '🍪', desc: 'Cookie categories, consent management, opt-in/opt-out, third-party disclosure', category: 'Privacy', frameworks: ['GDPR','CCPA'], freeIncluded: false },
  { id: 'dsr', name: 'Data Subject Rights Policy', icon: '👤', desc: 'GDPR Arts 15-22: access, erasure, portability, objection — response workflows', category: 'Privacy', frameworks: ['GDPR','CCPA'], freeIncluded: false },
  { id: 'data-breach', name: 'Data Breach Response Policy', icon: '⚠️', desc: 'Detection, containment, notification procedures, breach register template', category: 'Privacy', frameworks: ['GDPR','HIPAA','CCPA','ISO27001'], freeIncluded: false },
  // HR & Operations (5)
  { id: 'acceptable-use', name: 'Acceptable Use Policy', icon: '💻', desc: 'Systems usage rules, prohibited activities, monitoring disclosure, consequences', category: 'HR & Operations', frameworks: ['SOC2','ISO27001','HIPAA'], freeIncluded: false },
  { id: 'remote-work', name: 'Remote Work Security Policy', icon: '🏠', desc: 'WFH security requirements, VPN, screen lock, public Wi-Fi, device standards', category: 'HR & Operations', frameworks: ['SOC2','ISO27001','HIPAA'], freeIncluded: false },
  { id: 'byod', name: 'BYOD Policy', icon: '📱', desc: 'MDM enrollment, OS requirements, permitted apps, remote wipe consent', category: 'HR & Operations', frameworks: ['SOC2','ISO27001','HIPAA'], freeIncluded: false },
  { id: 'code-of-conduct', name: 'Employee Code of Conduct', icon: '📋', desc: 'Ethics, conflicts of interest, anti-bribery, IP protection, reporting obligations', category: 'HR & Operations', frameworks: ['SOX','ISO27001'], freeIncluded: false },
  { id: 'whistleblower', name: 'Whistleblower Policy', icon: '📢', desc: 'Anonymous reporting, anti-retaliation, investigation process, board escalation', category: 'HR & Operations', frameworks: ['SOX','ISO27001'], freeIncluded: false },
  // Vendor & Third-Party (3)
  { id: 'vendor-mgmt', name: 'Vendor & Third-Party Risk Policy', icon: '🤝', desc: 'Risk tiers, due diligence questionnaire, SLAs, right-to-audit, annual reassessment', category: 'Vendor & Third-Party', frameworks: ['SOC2','ISO27001','HIPAA','PCI_DSS','GDPR'], freeIncluded: false },
  { id: 'dpa', name: 'Data Processing Agreement (DPA)', icon: '📝', desc: 'GDPR Art. 28 — processing instructions, sub-processors, security, audit rights', category: 'Vendor & Third-Party', frameworks: ['GDPR'], freeIncluded: false },
  { id: 'nda', name: 'Confidentiality & NDA Policy', icon: '🤐', desc: 'Confidential info definition, obligations, exclusions, breach remedies', category: 'Vendor & Third-Party', frameworks: ['SOC2','ISO27001'], freeIncluded: false },
  // Business Continuity (2)
  { id: 'bcp', name: 'Business Continuity Plan (BCP)', icon: '🏗️', desc: 'BIA, RTO/RPO targets, crisis team, activation triggers, communication plan', category: 'Business Continuity', frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF'], freeIncluded: false },
  { id: 'drp', name: 'Disaster Recovery Plan (DRP)', icon: '🔄', desc: 'DR scope, recovery runbooks, backup strategy, failover procedures, DR testing', category: 'Business Continuity', frameworks: ['SOC2','ISO27001','HIPAA','NIST_CSF'], freeIncluded: false },
];

const POLICY_CATEGORIES = ['Security', 'Privacy', 'HR & Operations', 'Vendor & Third-Party', 'Business Continuity'];

const INDUSTRIES = ['Technology / SaaS', 'Healthcare', 'Financial Services', 'E-Commerce / Retail', 'Education', 'Government / Public Sector', 'Manufacturing', 'Legal / Professional Services', 'Non-Profit', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1,000', '1,001-5,000', '5,000+'];
const REGIONS = ['United States', 'European Union', 'United Kingdom', 'India', 'Canada', 'Australia', 'Global / Multiple'];
const DATA_TYPES = ['Personal Data (PII)', 'Health / Medical Data (PHI)', 'Payment Card Data (PCI)', 'Employee Data', 'Financial Records', 'Government / Federal Data', 'Biometric Data', 'Children\'s Data'];

const RELATED_TOOLS = [
  { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
  { name: 'Terms Simplifier', href: '/tools/terms-simplifier', icon: '⚖️' },
  { name: 'PDF Summarizer', href: '/tools/pdf-summarizer', icon: '📄' },
  { name: 'Digital Signature', href: '/tools/digital-signature', icon: '✍️' },
];

const FAQS = [
  { q: 'Which compliance frameworks does this tool cover?', a: 'The tool covers 12 major frameworks: SOC 2 Type I/II, ISO 27001:2022, HIPAA, GDPR, PCI DSS v4.0, CCPA/CPRA, NIST CSF v2.0, SOX IT General Controls, FedRAMP, CIS Controls v8, OWASP Top 10, and Internal Company Compliance.' },
  { q: 'How accurate is the compliance gap analysis?', a: 'The gap analysis is based on 25 evidence-based control questions mapped to official framework requirements. It provides directional guidance and identifies real gaps. For formal audit certification, engage a qualified auditor (QSA for PCI DSS, CPA firm for SOC 2, UKAS/accredited body for ISO 27001).' },
  { q: 'Are the generated policies legally binding?', a: 'The generated policies are professional-quality templates that follow industry best practices and regulatory guidance. They should be reviewed by your legal counsel before formal adoption, particularly for GDPR Data Processing Agreements and HIPAA Business Associate Agreements.' },
  { q: 'Is my company data secure when using this tool?', a: 'Your company information is only used to customize the assessment and generate policies. No data is stored in our database. All processing happens in real-time and is discarded after your session.' },
  { q: 'What is the difference between SOC 2 Type I and Type II?', a: 'SOC 2 Type I assesses whether your security controls are suitably designed at a specific point in time. SOC 2 Type II assesses whether those controls operated effectively over a period (typically 6-12 months). Type II is significantly more valuable to enterprise customers.' },
  { q: 'Can this replace a real compliance consultant?', a: 'This tool gives you a detailed roadmap, framework-specific gap analysis, and ready-to-use policy documents — work that would normally cost $5,000-$20,000 from a consultant. However, for formal certification (SOC 2 audit, ISO 27001 certification, HIPAA compliance attestation), you will still need an accredited auditor or assessor.' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  if (score >= 40) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}

function priorityBadge(p: string) {
  const map: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-stone-100 text-stone-600',
  };
  return map[p] ?? 'bg-stone-100 text-stone-600';
}

function effortBadge(e: string) {
  const map: Record<string, string> = { Low: 'text-emerald-600', Medium: 'text-amber-600', High: 'text-red-600' };
  return map[e] ?? 'text-stone-500';
}

function calcBaseScore(answers: Record<string, Answer>, frameworkId: string): number {
  const relevant = QUESTIONS.filter(q => q.frameworks.includes(frameworkId));
  if (relevant.length === 0) return 0;
  const maxPoints = relevant.reduce((s, q) => s + q.weight, 0);
  const earned = relevant.reduce((s, q) => {
    const a = answers[q.id];
    if (a === 'yes') return s + q.weight;
    if (a === 'partial') return s + q.weight * 0.5;
    return s;
  }, 0);
  return Math.round((earned / maxPoints) * 100);
}

/* ─── Premium Gate Overlay ───────────────────────────────────────────────── */
function PremiumGate({ feature }: { feature: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200">
      {/* Blurred preview content */}
      <div className="blur-sm pointer-events-none select-none p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {FRAMEWORKS.slice(0, 6).map(fw => (
            <div key={fw.id} className={`p-4 rounded-xl border ${FW_COLOR[fw.color]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{fw.name}</span>
                <span className="text-lg font-bold">{[72, 58, 84, 41, 67, 91][FRAMEWORKS.indexOf(fw)]}%</span>
              </div>
              <div className="h-1.5 bg-stone-200 rounded-full"><div className="h-full bg-current rounded-full" style={{ width: '70%' }} /></div>
            </div>
          ))}
        </div>
        <div className="h-32 bg-stone-50 rounded-xl border border-stone-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-stone-50 rounded-xl border" />
          <div className="h-24 bg-stone-50 rounded-xl border" />
        </div>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">{feature}</h3>
          <p className="text-sm text-stone-600 mb-6">Unlock all 12 frameworks, risk registers, cross-framework control mapping, and downloadable audit reports.</p>
          <div className="space-y-2">
            <Link href="/pricing" className="block w-full py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors text-center">
              Upgrade to Pro — $9.99/month
            </Link>
            <Link href="/pricing" className="block w-full py-2 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl transition-colors text-center">
              Day Pass — $3.99
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Score Circle ───────────────────────────────────────────────────────── */
function ScoreCircle({ score, size = 100 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.08} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth={size * 0.08}
        strokeDasharray={`${filled} ${c - filled}`} strokeDashoffset={c * 0.25} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.22} fontWeight="700" fill={strokeColor}>{score}</text>
    </svg>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ComplianceAIPage() {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [profile, setProfile] = useState<CompanyProfile>({ name: '', industry: '', size: '11-50', region: 'United States', dataTypes: [] });
  const [profileOpen, setProfileOpen] = useState(true);

  // Quick Scan
  const [scanFramework, setScanFramework] = useState('SOC2');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AssessResult | null>(null);
  const [scanError, setScanError] = useState('');
  const [openGap, setOpenGap] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Policy Generator
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [policyCategory, setPolicyCategory] = useState('Security');
  const [generatingPolicy, setGeneratingPolicy] = useState(false);
  const [policyContent, setPolicyContent] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [policyError, setPolicyError] = useState('');
  const [policiesUsed, setPoliciesUsed] = useState(0);

  const frameworkQuestions = QUESTIONS.filter(q => q.frameworks.includes(scanFramework));
  const answeredCount = frameworkQuestions.filter(q => answers[q.id] !== null && answers[q.id] !== undefined).length;
  const allAnswered = answeredCount === frameworkQuestions.length;
  const liveScore = allAnswered ? calcBaseScore(answers, scanFramework) : null;

  async function runScan() {
    if (!allAnswered) return;
    setScanning(true);
    setScanError('');
    try {
      const base = calcBaseScore(answers, scanFramework);
      const res = await fetch('/api/tools/compliance/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framework: scanFramework, companyProfile: profile, answers, baseScore: base }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setScanError(data.error ?? 'Assessment failed.'); return; }
      setScanResult(data as AssessResult);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch { setScanError('Network error. Please try again.'); }
    finally { setScanning(false); }
  }

  async function generatePolicy(p: PolicyTemplate) {
    const isFree = p.freeIncluded;
    if (!isFree && policiesUsed >= 3) return; // gate after 3 for paid
    setSelectedPolicyId(p.id);
    setGeneratingPolicy(true);
    setPolicyContent('');
    setPolicyError('');
    setPolicyName(p.name);
    try {
      const res = await fetch('/api/tools/compliance/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId: p.id, policyName: p.name, companyInfo: { ...profile, frameworks: p.frameworks } }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setPolicyError(data.error ?? 'Generation failed.'); return; }
      setPolicyContent(data.content);
      if (!isFree) setPoliciesUsed(n => n + 1);
    } catch { setPolicyError('Network error. Please try again.'); }
    finally { setGeneratingPolicy(false); }
  }

  function downloadPolicy() {
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${policyName}</title><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto;padding:40px;color:#1c1917;} h1{font-size:1.8rem;} h2{margin-top:2rem;font-size:1.2rem;color:#292524;border-bottom:1px solid #e7e5e4;padding-bottom:.5rem;} h3{color:#44403c;} table{width:100%;border-collapse:collapse;} td,th{border:1px solid #e7e5e4;padding:8px;text-align:left;} p{line-height:1.6;} ul,ol{line-height:1.8;}</style></head><body>${policyContent}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policyName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { id: Tab; label: string; locked: boolean }[] = [
    { id: 'scan', label: 'Quick Scan', locked: false },
    { id: 'policies', label: 'Policy Builder', locked: false },
    { id: 'multi', label: 'Multi-Framework', locked: true },
    { id: 'risk', label: 'Risk Register', locked: true },
    { id: 'reports', label: 'Audit Reports', locked: true },
  ];

  return (
    <ToolLayout
      title="Compliance AI"
      description="Enterprise compliance platform covering SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, CCPA, NIST CSF and 6 more frameworks. Gap analysis, policy generator, risk register & audit reports."
      icon="🛡️"
      badge="New"
      relatedTools={RELATED_TOOLS}
      faqs={FAQS}
      toolSlug="compliance-ai"
      rateLimited
    >
      <div className="space-y-5">

        {/* Plan banner */}
        <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
          <Zap className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-sm text-stone-700">
            <strong className="text-stone-900">Free tier:</strong> Quick Scan (all frameworks) + 3 policy templates.{' '}
            <Link href="/pricing" className="text-orange-600 hover:text-orange-700 font-medium">Day Pass $3.99</Link>
            {' '}or <Link href="/pricing" className="text-orange-600 hover:text-orange-700 font-medium">Pro $9.99/mo</Link>
            {' '}unlocks multi-framework, risk register, audit reports & all 24 policies.
          </p>
        </div>

        {/* Company profile (collapsible) */}
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800">Company Profile</span>
              {profile.name && <span className="text-xs text-stone-500">— {profile.name} · {profile.industry} · {profile.size} employees</span>}
            </div>
            {profileOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
          </button>
          {profileOpen && (
            <div className="p-4 grid sm:grid-cols-2 gap-4 border-t border-stone-200">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Company Name (optional)</label>
                <input type="text" placeholder="Acme Corp" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Industry</label>
                <select value={profile.industry} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Company Size</label>
                <select value={profile.size} onChange={e => setProfile(p => ({ ...p, size: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Primary Region</label>
                <select value={profile.region} onChange={e => setProfile(p => ({ ...p, region: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-stone-600 mb-1.5 block">Data Types Processed</label>
                <div className="flex flex-wrap gap-2">
                  {DATA_TYPES.map(dt => (
                    <button
                      key={dt}
                      onClick={() => setProfile(p => ({ ...p, dataTypes: p.dataTypes.includes(dt) ? p.dataTypes.filter(d => d !== dt) : [...p.dataTypes, dt] }))}
                      className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${profile.dataTypes.includes(dt) ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-orange-300'}`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.locked && <Lock className="w-3 h-3" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── QUICK SCAN TAB ─────────────────────────────────────────────── */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Framework selector */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-3">Select Compliance Framework</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FRAMEWORKS.map(fw => (
                  <button
                    key={fw.id}
                    onClick={() => { setScanFramework(fw.id); setScanResult(null); setAnswers({}); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scanFramework === fw.id
                        ? `${FW_COLOR[fw.color]} ring-2 ring-offset-1 ring-current`
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <p className="font-semibold text-sm leading-tight">{fw.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">{fw.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-medium">{answeredCount} / {frameworkQuestions.length} questions answered</span>
              {liveScore !== null && (
                <span className={`font-bold ${scoreColor(liveScore)}`}>Score: {liveScore}/100</span>
              )}
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${frameworkQuestions.length > 0 ? (answeredCount / frameworkQuestions.length) * 100 : 0}%` }} />
            </div>

            {/* Questions grouped by category */}
            {Object.entries(
              frameworkQuestions.reduce((acc, q) => ({ ...acc, [q.category]: [...(acc[q.category] ?? []), q] }), {} as Record<string, Question[]>)
            ).map(([category, qs]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{category}</h3>
                <div className="space-y-3">
                  {qs.map(q => (
                    <div key={q.id} className={`p-4 rounded-xl border transition-colors ${answers[q.id] ? 'border-stone-200 bg-stone-50' : 'border-stone-200 bg-white'}`}>
                      <p className="text-sm text-stone-800 mb-3 leading-snug">{q.text}</p>
                      <div className="flex gap-2">
                        {(['yes', 'partial', 'no'] as const).map(a => (
                          <button
                            key={a}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: a }))}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                              answers[q.id] === a
                                ? a === 'yes' ? 'bg-emerald-500 text-white border-emerald-500'
                                  : a === 'partial' ? 'bg-amber-400 text-white border-amber-400'
                                  : 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            {a === 'yes' ? '✓ Yes' : a === 'partial' ? '~ Partial' : '✗ No'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Run button */}
            {scanError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {scanError}
              </div>
            )}
            <button
              onClick={runScan}
              disabled={!allAnswered || scanning}
              className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {scanning ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing compliance posture...</> : `Run ${FRAMEWORKS.find(f => f.id === scanFramework)?.name} Assessment`}
            </button>

            {/* Results */}
            {scanResult && (
              <div ref={resultRef} className="space-y-5 pt-2">
                <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-stone-700">Assessment Complete</span>
                </div>

                {/* Score header */}
                <div className={`flex items-center gap-5 p-5 rounded-2xl border ${scoreBg(scanResult.score)}`}>
                  <ScoreCircle score={scanResult.score} size={90} />
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-0.5">
                      {FRAMEWORKS.find(f => f.id === scanFramework)?.name} Compliance Score
                    </p>
                    <p className={`text-2xl font-black ${scoreColor(scanResult.score)}`}>{scanResult.level}</p>
                    <p className="text-sm text-stone-600 mt-1 max-w-md leading-snug">{scanResult.summary}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-xl font-black text-red-600">{scanResult.criticalGaps.length}</p>
                    <p className="text-xs text-red-600 font-medium">Critical Gaps</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="text-xl font-black text-amber-600">{scanResult.mediumGaps.length}</p>
                    <p className="text-xs text-amber-600 font-medium">Medium Gaps</p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-xl font-black text-emerald-600">{scanResult.strengths.length}</p>
                    <p className="text-xs text-emerald-600 font-medium">Strengths</p>
                  </div>
                </div>

                {/* Critical gaps */}
                {scanResult.criticalGaps.length > 0 && (
                  <div>
                    <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                      Critical & High Priority Gaps
                    </h3>
                    <div className="space-y-2">
                      {scanResult.criticalGaps.map((gap, i) => (
                        <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenGap(openGap === `c${i}` ? null : `c${i}`)}
                            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priorityBadge(gap.priority)}`}>{gap.priority}</span>
                              <span className="text-sm font-semibold text-stone-800">{gap.title}</span>
                              <span className="text-xs text-stone-400 hidden sm:block">{gap.control}</span>
                            </div>
                            {openGap === `c${i}` ? <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
                          </button>
                          {openGap === `c${i}` && (
                            <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3">
                              <p className="text-sm text-stone-600">{gap.description}</p>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs font-semibold text-blue-700 mb-1">Remediation</p>
                                <p className="text-sm text-blue-800">{gap.remediation}</p>
                              </div>
                              <div className="flex gap-4 text-xs">
                                <span>Effort: <span className={`font-semibold ${effortBadge(gap.effort)}`}>{gap.effort}</span></span>
                                <span className="flex items-center gap-1 text-stone-500"><Clock className="w-3 h-3" />{gap.timeline}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medium gaps */}
                {scanResult.mediumGaps.length > 0 && (
                  <div>
                    <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />
                      Medium & Low Priority Gaps
                    </h3>
                    <div className="space-y-2">
                      {scanResult.mediumGaps.map((gap, i) => (
                        <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenGap(openGap === `m${i}` ? null : `m${i}`)}
                            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priorityBadge(gap.priority)}`}>{gap.priority}</span>
                              <span className="text-sm font-semibold text-stone-800">{gap.title}</span>
                            </div>
                            {openGap === `m${i}` ? <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
                          </button>
                          {openGap === `m${i}` && (
                            <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-2">
                              <p className="text-sm text-stone-600">{gap.description}</p>
                              <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-lg">{gap.remediation}</p>
                              <p className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" />{gap.timeline}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {scanResult.strengths.length > 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> What You&apos;re Doing Well
                    </h3>
                    <ul className="space-y-1.5">
                      {scanResult.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                          <span className="text-emerald-500 shrink-0 font-bold mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Remediation roadmap */}
                {scanResult.remediationRoadmap.length > 0 && (
                  <div>
                    <h3 className="font-bold text-stone-800 mb-3">Remediation Roadmap</h3>
                    <div className="space-y-3">
                      {scanResult.remediationRoadmap.map((phase) => (
                        <div key={phase.phase} className="p-4 border border-stone-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 bg-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">{phase.phase}</span>
                            <h4 className="font-semibold text-stone-800 text-sm">{phase.title}</h4>
                          </div>
                          {phase.description && <p className="text-xs text-stone-500 mb-2">{phase.description}</p>}
                          <ul className="space-y-1">
                            {phase.items.map((item, i) => (
                              <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                                <span className="text-orange-400 shrink-0 mt-0.5">→</span>{item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline + budget */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {scanResult.certificationTimeline && (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                      <p className="text-xs text-stone-500 font-medium mb-1">Estimated Certification Timeline</p>
                      <p className="text-sm font-bold text-stone-800">{scanResult.certificationTimeline}</p>
                    </div>
                  )}
                  {scanResult.estimatedBudget && (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                      <p className="text-xs text-stone-500 font-medium mb-1">Estimated Budget</p>
                      <p className="text-sm font-bold text-stone-800">{scanResult.estimatedBudget}</p>
                    </div>
                  )}
                </div>

                {/* Next steps */}
                {scanResult.nextSteps.length > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <h3 className="font-bold text-orange-800 mb-2 text-sm">Immediate Next Steps</h3>
                    <ol className="space-y-1.5">
                      {scanResult.nextSteps.map((step, i) => (
                        <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                          <span className="font-black shrink-0">{i + 1}.</span>{step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <button
                  onClick={() => { setScanResult(null); setAnswers({}); }}
                  className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New assessment
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── POLICY BUILDER TAB ─────────────────────────────────────────── */}
        {activeTab === 'policies' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-600">
                Generate professional, ready-to-use compliance policies customized for your company.{' '}
                <span className="text-orange-600 font-medium">3 policies free</span>, then <Link href="/pricing" className="text-orange-600 hover:underline">upgrade</Link>.
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {POLICY_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setPolicyCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${policyCategory === cat ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Policy cards */}
            <div className="grid sm:grid-cols-2 gap-3">
              {POLICY_TEMPLATES.filter(p => p.category === policyCategory).map(p => {
                const isLocked = !p.freeIncluded && policiesUsed >= 3;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedPolicyId === p.id ? 'border-orange-400 bg-orange-50' :
                      isLocked ? 'border-stone-200 bg-stone-50 opacity-70' :
                      'border-stone-200 bg-white hover:border-orange-300 hover:shadow-sm'
                    }`}
                    onClick={() => !isLocked && generatePolicy(p)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl leading-none mt-0.5">{p.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-sm text-stone-800">{p.name}</p>
                            {p.freeIncluded && <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Free</span>}
                          </div>
                          <p className="text-xs text-stone-500 leading-snug">{p.desc}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.frameworks.slice(0, 3).map(fw => {
                              const fwDef = FRAMEWORKS.find(f => f.id === fw);
                              return <span key={fw} className={`text-xs px-1.5 py-0.5 rounded border font-medium ${fwDef ? FW_COLOR[fwDef.color] : 'bg-stone-100 text-stone-600 border-stone-200'}`}>{fwDef?.name ?? fw}</span>;
                            })}
                          </div>
                        </div>
                      </div>
                      {isLocked && (
                        <div className="flex flex-col items-center gap-1">
                          <Lock className="w-4 h-4 text-stone-400" />
                          <Link href="/pricing" className="text-xs text-orange-600 hover:underline whitespace-nowrap" onClick={e => e.stopPropagation()}>Upgrade</Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generated policy */}
            {(generatingPolicy || policyContent || policyError) && (
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
                  <span className="text-sm font-semibold text-stone-800">{policyName}</span>
                  <div className="flex items-center gap-2">
                    {policyContent && (
                      <button onClick={downloadPolicy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-medium transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download HTML
                      </button>
                    )}
                    <button onClick={() => { setPolicyContent(''); setSelectedPolicyId(''); }} className="text-stone-400 hover:text-stone-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 max-h-[600px] overflow-y-auto">
                  {generatingPolicy && (
                    <div className="flex items-center gap-3 py-8 justify-center">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                      <p className="text-sm text-stone-600">Generating policy document...</p>
                    </div>
                  )}
                  {policyError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />{policyError}
                    </div>
                  )}
                  {policyContent && (
                    <div className="prose prose-sm max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-li:text-stone-700"
                      dangerouslySetInnerHTML={{ __html: policyContent }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MULTI-FRAMEWORK TAB (PREMIUM) ──────────────────────────────── */}
        {activeTab === 'multi' && (
          <PremiumGate feature="Multi-Framework Assessment" />
        )}

        {/* ── RISK REGISTER TAB (PREMIUM) ────────────────────────────────── */}
        {activeTab === 'risk' && (
          <PremiumGate feature="AI Risk Register" />
        )}

        {/* ── REPORTS TAB (PREMIUM) ──────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <PremiumGate feature="Audit-Ready Compliance Reports" />
        )}
      </div>
    </ToolLayout>
  );
}
