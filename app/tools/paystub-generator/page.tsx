'use client';

import { useState, useMemo, useEffect } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { UsageBanner } from '@/components/shared/UsageBanner';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

// ─── TAX TABLES 2025/2026 ────────────────────────────────────────────────────

type Bracket = [number, number];

function applyBrackets(income: number, brackets: Bracket[]): number {
  let tax = 0, prev = 0;
  for (const [upper, rate] of brackets) {
    if (income <= prev) break;
    tax += (Math.min(income, upper) - prev) * rate;
    prev = upper;
    if (upper === Infinity) break;
  }
  return Math.max(0, tax);
}

const USA_FED: Record<string, Bracket[]> = {
  single:  [[11600,.10],[47150,.12],[100525,.22],[191950,.24],[243725,.32],[609350,.35],[Infinity,.37]],
  married: [[23200,.10],[94300,.12],[201050,.22],[383900,.24],[487450,.32],[731200,.35],[Infinity,.37]],
  hoh:     [[16550,.10],[63100,.12],[100500,.22],[191950,.24],[243700,.32],[609350,.35],[Infinity,.37]],
};
const USA_STD: Record<string, number> = { single: 14600, married: 29200, hoh: 21900 };
const USA_STATES: [string, string, number][] = [
  ['AK','Alaska',0],['AL','Alabama',.05],['AR','Arkansas',.047],['AZ','Arizona',.025],
  ['CA','California',.093],['CO','Colorado',.044],['CT','Connecticut',.0699],
  ['DC','Washington D.C.',.0895],['DE','Delaware',.066],['FL','Florida',0],
  ['GA','Georgia',.0549],['HI','Hawaii',.0825],['IA','Iowa',.057],['ID','Idaho',.058],
  ['IL','Illinois',.0495],['IN','Indiana',.03],['KS','Kansas',.057],['KY','Kentucky',.04],
  ['LA','Louisiana',.035],['MA','Massachusetts',.05],['MD','Maryland',.0575],
  ['ME','Maine',.075],['MI','Michigan',.0425],['MN','Minnesota',.0985],
  ['MO','Missouri',.048],['MS','Mississippi',.047],['MT','Montana',.069],
  ['NC','North Carolina',.0475],['ND','North Dakota',.025],['NE','Nebraska',.0664],
  ['NH','New Hampshire',0],['NJ','New Jersey',.0897],['NM','New Mexico',.059],
  ['NV','Nevada',0],['NY','New York',.0685],['OH','Ohio',.0399],['OK','Oklahoma',.0475],
  ['OR','Oregon',.099],['PA','Pennsylvania',.0307],['RI','Rhode Island',.0599],
  ['SC','South Carolina',.065],['SD','South Dakota',0],['TN','Tennessee',0],
  ['TX','Texas',0],['UT','Utah',.0465],['VA','Virginia',.0575],['VT','Vermont',.0875],
  ['WA','Washington',0],['WI','Wisconsin',.0765],['WV','West Virginia',.065],['WY','Wyoming',0],
];

const GB_IT: Bracket[] = [[12570,0],[50270,.20],[125140,.40],[Infinity,.45]];
const GB_NI: Bracket[] = [[12570,0],[50270,.08],[Infinity,.02]];
const CA_FED: Bracket[] = [[55867,.15],[111733,.205],[154906,.26],[220000,.29],[Infinity,.33]];
const CA_PROVS: [string, string, number][] = [
  ['AB','Alberta',.10],['BC','British Columbia',.0706],['MB','Manitoba',.108],
  ['NB','New Brunswick',.094],['NL','Newfoundland',.087],['NS','Nova Scotia',.0879],
  ['NT','Northwest Territories',.059],['NU','Nunavut',.04],['ON','Ontario',.0505],
  ['PE','Prince Edward Island',.098],['QC','Quebec',.14],['SK','Saskatchewan',.105],['YT','Yukon',.064],
];
const AU_IT: Bracket[] = [[18200,0],[45000,.19],[120000,.325],[180000,.37],[Infinity,.45]];
const IN_IT: Bracket[] = [[300000,0],[600000,.05],[900000,.10],[1200000,.15],[1500000,.20],[Infinity,.30]];
const NZ_IT: Bracket[] = [[14000,.105],[48000,.175],[70000,.30],[180000,.33],[Infinity,.39]];
const IE_IT: Bracket[] = [[42000,.20],[Infinity,.40]];
const SG_IT: Bracket[] = [
  [20000,0],[30000,.02],[40000,.035],[80000,.07],[120000,.115],
  [160000,.15],[200000,.18],[240000,.19],[280000,.195],[320000,.20],[Infinity,.22],
];

// ─── CALCULATION ENGINE ──────────────────────────────────────────────────────

interface Line { label: string; amount: number; note?: string; }
interface Calc {
  gross: number; preTaxLines: Line[]; taxableGross: number;
  taxLines: Line[]; postTaxLines: Line[]; employerLines: Line[];
  totalWithheld: number; net: number; effectiveRate: number;
}

function calculate(
  country: string, annualGross: number, mult: number,
  filing: string, usState: string, caProv: string,
  k401: number, health: number, dental: number, hsa: number, otherPost: number
): Calc {
  const gross = annualGross / mult;
  const preTaxLines: Line[] = [], taxLines: Line[] = [], postTaxLines: Line[] = [], employerLines: Line[] = [];
  let annPre = 0;

  if (country === 'US') {
    const annK = annualGross * (k401 / 100);
    const annH = health * mult, annD = dental * mult, annHSA = hsa * mult;
    annPre = annK + annH + annD + annHSA;
    if (annK > 0) preTaxLines.push({ label: `401(k) ${k401}%`, amount: annK / mult });
    if (annH > 0) preTaxLines.push({ label: 'Health Insurance', amount: health });
    if (annD > 0) preTaxLines.push({ label: 'Dental / Vision', amount: dental });
    if (annHSA > 0) preTaxLines.push({ label: 'HSA Contribution', amount: hsa });
    const taxable = Math.max(0, annualGross - (USA_STD[filing] ?? 14600) - annPre);
    const fed = applyBrackets(taxable, USA_FED[filing] ?? USA_FED.single);
    const stRate = USA_STATES.find(s => s[0] === usState)?.[2] ?? 0;
    const st = Math.max(0, annualGross - annPre) * stRate;
    const ss = Math.min(annualGross, 168600) * 0.062;
    const med = annualGross * 0.0145 + Math.max(0, annualGross - 200000) * 0.009;
    taxLines.push({ label: 'Federal Income Tax', amount: fed / mult });
    if (stRate > 0) taxLines.push({ label: `${USA_STATES.find(s=>s[0]===usState)?.[1]??'State'} Tax`, amount: st / mult });
    taxLines.push({ label: 'Social Security (6.2%)', amount: ss / mult, note: 'FICA' });
    taxLines.push({ label: 'Medicare (1.45%)', amount: med / mult, note: 'FICA' });
    employerLines.push({ label: 'Social Security (6.2%)', amount: ss / mult });
    employerLines.push({ label: 'Medicare (1.45%)', amount: annualGross * 0.0145 / mult });
    employerLines.push({ label: 'FUTA (0.6%)', amount: Math.min(annualGross, 7000) * 0.006 / mult });
  } else if (country === 'GB') {
    taxLines.push({ label: 'Income Tax (PAYE)', amount: applyBrackets(annualGross, GB_IT) / mult });
    taxLines.push({ label: 'National Insurance (Employee)', amount: applyBrackets(annualGross, GB_NI) / mult });
    employerLines.push({ label: 'Employer NI (13.8%)', amount: Math.max(0, annualGross - 9100) * 0.138 / mult });
  } else if (country === 'CA') {
    const taxable = Math.max(0, annualGross - 15705);
    const fed = applyBrackets(taxable, CA_FED);
    const provRate = CA_PROVS.find(p => p[0] === caProv)?.[2] ?? 0.1;
    const cpp = Math.max(0, Math.min(annualGross, 73200) - 3500) * 0.0595;
    const ei = Math.min(annualGross, 63200) * 0.0166;
    taxLines.push({ label: 'Federal Income Tax', amount: fed / mult });
    taxLines.push({ label: `${CA_PROVS.find(p=>p[0]===caProv)?.[1]??'Provincial'} Tax`, amount: taxable * provRate / mult });
    taxLines.push({ label: 'CPP Contributions (5.95%)', amount: cpp / mult });
    taxLines.push({ label: 'EI Premiums (1.66%)', amount: ei / mult });
    employerLines.push({ label: 'Employer CPP (5.95%)', amount: cpp / mult });
    employerLines.push({ label: 'Employer EI (2.32%)', amount: Math.min(annualGross, 63200) * 0.0232 / mult });
  } else if (country === 'AU') {
    const rawIT = applyBrackets(annualGross, AU_IT);
    const lito = annualGross <= 37500 ? 700 : annualGross <= 45000 ? 700 - (annualGross-37500)*0.05
      : annualGross <= 66667 ? 325 - (annualGross-45000)*0.015 : 0;
    const medicare = annualGross > 26000 ? annualGross * 0.02 : 0;
    taxLines.push({ label: 'Income Tax', amount: Math.max(0, rawIT - lito) / mult });
    taxLines.push({ label: 'Medicare Levy (2%)', amount: medicare / mult });
    employerLines.push({ label: 'Superannuation (11.5%)', amount: annualGross * 0.115 / mult, note: 'Employer pays' });
  } else if (country === 'IN') {
    const taxable = Math.max(0, annualGross - 75000);
    const base = applyBrackets(taxable, IN_IT);
    const pf = Math.min(annualGross * 0.12, 21600);
    const esi = annualGross <= 840000 ? annualGross * 0.0075 : 0;
    preTaxLines.push({ label: 'Provident Fund (12%)', amount: pf / mult });
    taxLines.push({ label: 'Income Tax + Health & Edu Cess', amount: (base * 1.04) / mult });
    if (esi > 0) taxLines.push({ label: 'ESI (0.75%)', amount: esi / mult });
    annPre = pf;
  } else if (country === 'NZ') {
    taxLines.push({ label: 'PAYE Income Tax', amount: applyBrackets(annualGross, NZ_IT) / mult });
    taxLines.push({ label: 'ACC Earners Levy (1.6%)', amount: Math.min(annualGross, 142283) * 0.016 / mult });
  } else if (country === 'IE') {
    const it = applyBrackets(annualGross, IE_IT);
    const prsi = annualGross * 0.04;
    const usc = annualGross <= 12012 ? 0 : annualGross <= 22920 ? (annualGross-12012)*0.02
      : annualGross <= 70044 ? 10908*0.02+(annualGross-22920)*0.04
      : 10908*0.02+47124*0.04+(annualGross-70044)*0.08;
    taxLines.push({ label: 'Income Tax (PAYE)', amount: it / mult });
    taxLines.push({ label: 'PRSI (4%)', amount: prsi / mult });
    taxLines.push({ label: 'USC', amount: usc / mult });
  } else if (country === 'SG') {
    taxLines.push({ label: 'Income Tax', amount: applyBrackets(annualGross, SG_IT) / mult });
    taxLines.push({ label: 'CPF Employee (20%)', amount: Math.min(annualGross, 102000) * 0.20 / mult });
    employerLines.push({ label: 'CPF Employer (17%)', amount: Math.min(annualGross, 102000) * 0.17 / mult });
  }

  if (otherPost > 0) postTaxLines.push({ label: 'Other Post-Tax Deduction', amount: otherPost });

  const totalPre = preTaxLines.reduce((s, l) => s + l.amount, 0);
  const totalTax = taxLines.reduce((s, l) => s + l.amount, 0);
  const totalPost = postTaxLines.reduce((s, l) => s + l.amount, 0);
  const totalWithheld = totalPre + totalTax + totalPost;

  return {
    gross, preTaxLines, taxableGross: gross - totalPre,
    taxLines, postTaxLines, employerLines,
    totalWithheld, net: Math.max(0, gross - totalWithheld),
    effectiveRate: gross > 0 ? totalTax / gross : 0,
  };
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'classic',   name: 'Classic',   headerBg: '#1a2332', accent: '#1a5276' },
  { id: 'modern',    name: 'Modern',    headerBg: '#7c3aed', accent: '#6d28d9' },
  { id: 'executive', name: 'Executive', headerBg: '#111827', accent: '#b45309' },
  { id: 'minimal',   name: 'Minimal',   headerBg: '#f3f4f6', accent: '#374151' },
  { id: 'corporate', name: 'Corporate', headerBg: '#14532d', accent: '#166534' },
];

const TEMPLATE_CSS: Record<string, string> = {
  classic: `body{font-family:'Calibri',Arial,sans-serif;font-size:11px;background:#fff;color:#111}
.page{max-width:680px;margin:24px auto;border:1px solid #d1d5db;border-top:4px solid #1a5276}
.hdr{background:#1a2332;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:flex-start}
.co-name{font-size:16px;font-weight:700;color:#fff}
.co-detail{color:#9ca3af;font-size:10px;margin-top:3px}
.pay-label{color:#7fb3d3;font-weight:700;font-size:13px;text-align:right}
.pay-meta{color:#9ca3af;font-size:10px;text-align:right;margin-top:3px}
.emp{padding:12px 24px;background:#f9fafb;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start}
.emp-name{font-weight:700;font-size:13px;color:#1a2332}
.emp-detail{color:#6b7280;font-size:10px;margin-top:2px}
.sec{padding:10px 24px;border-top:1px solid #f3f4f6}
.sec-hdr{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1a2332;border-bottom:1px solid #e5e7eb;padding-bottom:5px;margin-bottom:6px;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse}
td{padding:3px 0;font-size:11px}
td.lbl{color:#4b5563}
td.amt{text-align:right;font-weight:500}
td.ded{color:#dc2626}
.note{color:#9ca3af;font-size:9px}
.total-row td{border-top:1px solid #f3f4f6;font-weight:700;padding-top:5px}
.net{background:#1a5276;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.net-lbl{font-weight:700;font-size:13px}
.net-sub{color:#aed6f1;font-size:10px;margin-top:2px}
.net-amt{font-size:22px;font-weight:700}
.empr{padding:10px 24px;background:#f9fafb;border-top:1px solid #e5e7eb}
.empr-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:5px}
td.g{color:#6b7280}
.summary{display:flex;border-top:1px solid #e5e7eb}
.sum-item{flex:1;padding:10px 24px;text-align:center;border-right:1px solid #f3f4f6}
.sum-item:last-child{border-right:none}
.sum-lbl{font-size:10px;color:#6b7280}
.sum-val{font-size:13px;font-weight:700;margin-top:2px}
.sum-val.red{color:#dc2626}.sum-val.grn{color:#15803d}
.footer{padding:8px 24px;border-top:1px solid #f3f4f6;text-align:center;font-size:10px;color:#9ca3af}
@media print{body{margin:0}.page{border:none;max-width:100%;margin:0}}`,

  modern: `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:11px;background:#fff;color:#111}
.page{max-width:680px;margin:24px auto;border:1px solid #e9d5ff;border-top:4px solid #7c3aed}
.hdr{background:#7c3aed;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:flex-start}
.co-name{font-size:16px;font-weight:700;color:#fff}
.co-detail{color:#ddd6fe;font-size:10px;margin-top:3px}
.pay-label{color:#e9d5ff;font-weight:700;font-size:13px;text-align:right}
.pay-meta{color:#ddd6fe;font-size:10px;text-align:right;margin-top:3px}
.emp{padding:12px 24px;background:#faf5ff;border-bottom:1px solid #e9d5ff;display:flex;justify-content:space-between;align-items:flex-start}
.emp-name{font-weight:700;font-size:13px;color:#5b21b6}
.emp-detail{color:#6b7280;font-size:10px;margin-top:2px}
.sec{padding:10px 24px;border-top:1px solid #f3f4f6}
.sec-hdr{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #ede9fe;padding-bottom:5px;margin-bottom:6px;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse}
td{padding:3px 0;font-size:11px}
td.lbl{color:#4b5563}
td.amt{text-align:right;font-weight:500}
td.ded{color:#dc2626}
.note{color:#9ca3af;font-size:9px}
.total-row td{border-top:1px solid #ede9fe;font-weight:700;padding-top:5px}
.net{background:#6d28d9;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.net-lbl{font-weight:700;font-size:13px}
.net-sub{color:#ddd6fe;font-size:10px;margin-top:2px}
.net-amt{font-size:22px;font-weight:700}
.empr{padding:10px 24px;background:#faf5ff;border-top:1px solid #e9d5ff}
.empr-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7c3aed;margin-bottom:5px}
td.g{color:#6b7280}
.summary{display:flex;border-top:1px solid #e9d5ff}
.sum-item{flex:1;padding:10px 24px;text-align:center;border-right:1px solid #ede9fe}
.sum-item:last-child{border-right:none}
.sum-lbl{font-size:10px;color:#6b7280}
.sum-val{font-size:13px;font-weight:700;margin-top:2px}
.sum-val.red{color:#dc2626}.sum-val.grn{color:#15803d}
.footer{padding:8px 24px;border-top:1px solid #ede9fe;text-align:center;font-size:10px;color:#9ca3af}
@media print{body{margin:0}.page{border:none;max-width:100%;margin:0}}`,

  executive: `body{font-family:Georgia,'Times New Roman',serif;font-size:11px;background:#fff;color:#111}
.page{max-width:680px;margin:24px auto;border:1px solid #d6d3d1;border-top:4px solid #b45309}
.hdr{background:#111827;color:#fff;padding:22px 26px;display:flex;justify-content:space-between;align-items:flex-start}
.co-name{font-size:16px;font-weight:700;color:#fbbf24;letter-spacing:.5px}
.co-detail{color:#9ca3af;font-size:10px;margin-top:3px}
.pay-label{color:#fcd34d;font-weight:700;font-size:13px;text-align:right;letter-spacing:.5px}
.pay-meta{color:#9ca3af;font-size:10px;text-align:right;margin-top:3px}
.emp{padding:12px 26px;background:#fffbeb;border-bottom:1px solid #fde68a;display:flex;justify-content:space-between;align-items:flex-start}
.emp-name{font-weight:700;font-size:13px;color:#111827}
.emp-detail{color:#6b7280;font-size:10px;margin-top:2px}
.sec{padding:10px 26px;border-top:1px solid #f3f4f6}
.sec-hdr{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#92400e;border-bottom:1px solid #fde68a;padding-bottom:5px;margin-bottom:6px;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse}
td{padding:3px 0;font-size:11px}
td.lbl{color:#4b5563}
td.amt{text-align:right;font-weight:600}
td.ded{color:#dc2626}
.note{color:#9ca3af;font-size:9px}
.total-row td{border-top:1px solid #fde68a;font-weight:700;padding-top:5px}
.net{background:#111827;color:#fff;padding:16px 26px;display:flex;justify-content:space-between;align-items:center;border-top:3px solid #b45309}
.net-lbl{font-weight:700;font-size:13px;color:#fbbf24}
.net-sub{color:#9ca3af;font-size:10px;margin-top:2px}
.net-amt{font-size:22px;font-weight:700;color:#fcd34d}
.empr{padding:10px 26px;background:#fffbeb;border-top:1px solid #fde68a}
.empr-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#92400e;margin-bottom:5px}
td.g{color:#6b7280}
.summary{display:flex;border-top:1px solid #fde68a}
.sum-item{flex:1;padding:10px 24px;text-align:center;border-right:1px solid #fef3c7}
.sum-item:last-child{border-right:none}
.sum-lbl{font-size:10px;color:#6b7280}
.sum-val{font-size:13px;font-weight:700;margin-top:2px}
.sum-val.red{color:#dc2626}.sum-val.grn{color:#15803d}
.footer{padding:8px 24px;border-top:1px solid #fef3c7;text-align:center;font-size:10px;color:#9ca3af}
@media print{body{margin:0}.page{border:none;max-width:100%;margin:0}}`,

  minimal: `body{font-family:Arial,Helvetica,sans-serif;font-size:11px;background:#fff;color:#111}
.page{max-width:680px;margin:24px auto;border:1.5px solid #111}
.hdr{background:#fff;color:#111;padding:20px 24px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid #111}
.co-name{font-size:16px;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:1px}
.co-detail{color:#6b7280;font-size:10px;margin-top:3px}
.pay-label{color:#111;font-weight:700;font-size:13px;text-align:right;text-transform:uppercase;letter-spacing:.5px}
.pay-meta{color:#6b7280;font-size:10px;text-align:right;margin-top:3px}
.emp{padding:12px 24px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start}
.emp-name{font-weight:700;font-size:13px;color:#111}
.emp-detail{color:#6b7280;font-size:10px;margin-top:2px}
.sec{padding:10px 24px;border-top:1px solid #e5e7eb}
.sec-hdr{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#111;border-bottom:1px solid #111;padding-bottom:4px;margin-bottom:6px;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse}
td{padding:3px 0;font-size:11px}
td.lbl{color:#374151}
td.amt{text-align:right;font-weight:500}
td.ded{color:#374151}
.note{color:#9ca3af;font-size:9px}
.total-row td{border-top:1px solid #d1d5db;font-weight:700;padding-top:5px}
.net{background:#111;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.net-lbl{font-weight:700;font-size:13px}
.net-sub{color:#d1d5db;font-size:10px;margin-top:2px}
.net-amt{font-size:22px;font-weight:700}
.empr{padding:10px 24px;background:#f9fafb;border-top:1px solid #e5e7eb}
.empr-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin-bottom:5px}
td.g{color:#6b7280}
.summary{display:flex;border-top:1px solid #e5e7eb}
.sum-item{flex:1;padding:10px 24px;text-align:center;border-right:1px solid #e5e7eb}
.sum-item:last-child{border-right:none}
.sum-lbl{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}
.sum-val{font-size:13px;font-weight:700;margin-top:2px}
.sum-val.red{color:#374151}.sum-val.grn{color:#111;text-decoration:underline}
.footer{padding:8px 24px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af}
@media print{body{margin:0}.page{border:none;max-width:100%;margin:0}}`,

  corporate: `body{font-family:'Calibri',Arial,sans-serif;font-size:11px;background:#fff;color:#111}
.page{max-width:680px;margin:24px auto;border:1px solid #bbf7d0;border-top:4px solid #166534}
.hdr{background:#14532d;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:flex-start}
.co-name{font-size:16px;font-weight:700;color:#fff}
.co-detail{color:#86efac;font-size:10px;margin-top:3px}
.pay-label{color:#bbf7d0;font-weight:700;font-size:13px;text-align:right}
.pay-meta{color:#86efac;font-size:10px;text-align:right;margin-top:3px}
.emp{padding:12px 24px;background:#f0fdf4;border-bottom:1px solid #bbf7d0;display:flex;justify-content:space-between;align-items:flex-start}
.emp-name{font-weight:700;font-size:13px;color:#14532d}
.emp-detail{color:#6b7280;font-size:10px;margin-top:2px}
.sec{padding:10px 24px;border-top:1px solid #f0fdf4}
.sec-hdr{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#166534;border-bottom:1px solid #bbf7d0;padding-bottom:5px;margin-bottom:6px;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse}
td{padding:3px 0;font-size:11px}
td.lbl{color:#4b5563}
td.amt{text-align:right;font-weight:500}
td.ded{color:#dc2626}
.note{color:#9ca3af;font-size:9px}
.total-row td{border-top:1px solid #d1fae5;font-weight:700;padding-top:5px}
.net{background:#166534;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.net-lbl{font-weight:700;font-size:13px}
.net-sub{color:#bbf7d0;font-size:10px;margin-top:2px}
.net-amt{font-size:22px;font-weight:700}
.empr{padding:10px 24px;background:#f0fdf4;border-top:1px solid #bbf7d0}
.empr-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#166534;margin-bottom:5px}
td.g{color:#6b7280}
.summary{display:flex;border-top:1px solid #bbf7d0}
.sum-item{flex:1;padding:10px 24px;text-align:center;border-right:1px solid #d1fae5}
.sum-item:last-child{border-right:none}
.sum-lbl{font-size:10px;color:#6b7280}
.sum-val{font-size:13px;font-weight:700;margin-top:2px}
.sum-val.red{color:#dc2626}.sum-val.grn{color:#166534}
.footer{padding:8px 24px;border-top:1px solid #d1fae5;text-align:center;font-size:10px;color:#9ca3af}
@media print{body{margin:0}.page{border:none;max-width:100%;margin:0}}`,
};

function TemplatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3">Template</h2>
      <div className="grid grid-cols-5 gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
              value === t.id
                ? 'border-violet-500 bg-violet-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="w-full rounded overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
              <div className="w-full h-3.5" style={{ background: t.headerBg }} />
              <div className="px-1 py-1 space-y-0.5">
                <div className="h-1 rounded" style={{ background: t.accent, width: '55%' }} />
                <div className="h-0.5 rounded bg-gray-200 w-full" />
                <div className="h-0.5 rounded bg-gray-200 w-4/5" />
                <div className="h-0.5 rounded bg-gray-200 w-3/5" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-stone-700">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PDF GENERATOR ───────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildPaystubHTML(
  calc: Calc, sym: string,
  coName: string, coAddr: string, ein: string, country: string,
  empName: string, empTitle: string, empAddr: string, empId: string,
  payDate: string, periStart: string, periEnd: string, periodLabel: string,
  template: string = 'classic'
): string {
  const css = TEMPLATE_CSS[template] ?? TEMPLATE_CSS.classic;

  const fmt = (n: number) => `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const deductRows = (lines: Line[]) => lines.map(l =>
    `<tr><td class="lbl">${esc(l.label)}${l.note ? ` <span class="note">(${esc(l.note)})</span>` : ''}</td>
     <td class="amt ded">-${fmt(l.amount)}</td></tr>`
  ).join('');

  const empRows = calc.employerLines.map(l =>
    `<tr><td class="lbl g">${esc(l.label)}${l.note ? ` (${esc(l.note)})` : ''}</td><td class="amt g">${fmt(l.amount)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Pay Stub — ${esc(empName || 'Employee')}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
${css}
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div>
      <div class="co-name">${esc(coName || 'Company Name')}</div>
      ${coAddr ? `<div class="co-detail">${esc(coAddr)}</div>` : ''}
      ${ein ? `<div class="co-detail">${country === 'US' ? 'EIN' : 'Reg No'}: ${esc(ein)}</div>` : ''}
    </div>
    <div>
      <div class="pay-label">PAY STATEMENT</div>
      <div class="pay-meta">Pay Date: ${esc(payDate || '—')}</div>
      ${periStart && periEnd ? `<div class="pay-meta">${esc(periStart)} – ${esc(periEnd)}</div>` : ''}
      <div class="pay-meta">${esc(periodLabel)}</div>
    </div>
  </div>

  <div class="emp">
    <div>
      <div class="emp-name">${esc(empName || 'Employee Name')}</div>
      ${empTitle ? `<div class="emp-detail">${esc(empTitle)}</div>` : ''}
      ${empAddr ? `<div class="emp-detail">${esc(empAddr)}</div>` : ''}
    </div>
    ${empId ? `<div class="emp-detail">ID: ${esc(empId)}</div>` : ''}
  </div>

  <div class="sec">
    <div class="sec-hdr"><span>EARNINGS</span><span>AMOUNT</span></div>
    <table>
      <tr><td class="lbl">Regular Pay (${esc(periodLabel)})</td><td class="amt">${fmt(calc.gross)}</td></tr>
      <tr class="total-row"><td class="lbl">Gross Pay</td><td class="amt">${fmt(calc.gross)}</td></tr>
    </table>
  </div>

  ${calc.preTaxLines.length > 0 ? `
  <div class="sec">
    <div class="sec-hdr"><span>PRE-TAX DEDUCTIONS</span><span>AMOUNT</span></div>
    <table>
      ${deductRows(calc.preTaxLines)}
      <tr class="total-row"><td class="lbl">Taxable Gross</td><td class="amt">${fmt(calc.taxableGross)}</td></tr>
    </table>
  </div>` : ''}

  <div class="sec">
    <div class="sec-hdr"><span>TAXES &amp; WITHHOLDING</span><span>AMOUNT</span></div>
    <table>${deductRows(calc.taxLines)}</table>
  </div>

  ${calc.postTaxLines.length > 0 ? `
  <div class="sec">
    <div class="sec-hdr"><span>POST-TAX DEDUCTIONS</span><span>AMOUNT</span></div>
    <table>${deductRows(calc.postTaxLines)}</table>
  </div>` : ''}

  <div class="net">
    <div>
      <div class="net-lbl">NET PAY</div>
      <div class="net-sub">Effective tax rate: ${(calc.effectiveRate * 100).toFixed(1)}%</div>
    </div>
    <div class="net-amt">${fmt(calc.net)}</div>
  </div>

  ${calc.employerLines.length > 0 ? `
  <div class="empr">
    <div class="empr-title">Employer Contributions (not deducted from employee pay)</div>
    <table>${empRows}</table>
  </div>` : ''}

  <div class="summary">
    <div class="sum-item"><div class="sum-lbl">Gross Pay</div><div class="sum-val">${fmt(calc.gross)}</div></div>
    <div class="sum-item"><div class="sum-lbl">Total Deducted</div><div class="sum-val red">-${fmt(calc.totalWithheld)}</div></div>
    <div class="sum-item"><div class="sum-lbl">Net Pay</div><div class="sum-val grn">${fmt(calc.net)}</div></div>
  </div>

  <div class="footer">Free pay stub generated on Formly Tools · formly.tools · Tax tables 2026</div>
</div>
</body>
</html>`;
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', symbol: '£' },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦', symbol: 'CA$' },
  { code: 'AU', name: 'Australia',      flag: '🇦🇺', symbol: 'A$' },
  { code: 'IN', name: 'India',          flag: '🇮🇳', symbol: '₹' },
  { code: 'NZ', name: 'New Zealand',    flag: '🇳🇿', symbol: 'NZ$' },
  { code: 'IE', name: 'Ireland',        flag: '🇮🇪', symbol: '€' },
  { code: 'SG', name: 'Singapore',      flag: '🇸🇬', symbol: 'S$' },
];

const PERIODS = [
  { key: 'weekly',      label: 'Weekly',      perYear: 52 },
  { key: 'biweekly',   label: 'Bi-Weekly',   perYear: 26 },
  { key: 'semimonthly',label: 'Semi-Monthly',perYear: 24 },
  { key: 'monthly',    label: 'Monthly',     perYear: 12 },
  { key: 'annual',     label: 'Annual',      perYear: 1  },
];

const RELATED = [
  { name: 'Resume Builder',     href: '/tools/resume-builder',     icon: '📋' },
  { name: 'Contract Generator', href: '/tools/contract-generator', icon: '📜' },
  { name: 'Email Writer',       href: '/tools/email-writer',       icon: '📧' },
];

function money(n: number, sym: string) {
  return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function NumInput({ label, value, onChange, prefix, min = 0, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; min?: number; step?: number;
}) {
  return (
    <div>
      <label className="label text-xs">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{prefix}</span>}
        <input
          type="number" min={min} step={step} value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`input text-sm ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface UsageState { remaining: number; limit: number; plan: string; }

export default function PaystubGeneratorPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [usage, setUsage] = useState<UsageState | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user ?? null));
    fetch('/api/user/usage')
      .then(r => r.json())
      .then(d => {
        if (d.remaining !== null && d.remaining !== undefined) {
          setUsage({ remaining: d.remaining, limit: d.limit, plan: d.plan });
        }
      })
      .catch(() => {});
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const [template, setTemplate] = useState('classic');
  const [country, setCountry] = useState('US');
  const [period, setPeriod]   = useState('biweekly');
  const [grossPay, setGrossPay] = useState('');
  const [payDate, setPayDate]   = useState(today);
  const [periStart, setPeriStart] = useState('');
  const [periEnd, setPeriEnd]     = useState('');

  const [coName,   setCoName]   = useState('');
  const [coAddr,   setCoAddr]   = useState('');
  const [ein,      setEin]      = useState('');
  const [empName,  setEmpName]  = useState('');
  const [empId,    setEmpId]    = useState('');
  const [empTitle, setEmpTitle] = useState('');
  const [empAddr,  setEmpAddr]  = useState('');

  const [filing,    setFiling]    = useState('single');
  const [usState,   setUsState]   = useState('CA');
  const [caProv,    setCaProv]    = useState('ON');
  const [k401,      setK401]      = useState(0);
  const [health,    setHealth]    = useState(0);
  const [dental,    setDental]    = useState(0);
  const [hsa,       setHsa]       = useState(0);
  const [otherPost, setOtherPost] = useState(0);

  const [dlLoading, setDlLoading] = useState(false);
  const [dlError,   setDlError]   = useState('');

  const sym  = COUNTRIES.find(c => c.code === country)?.symbol ?? '$';
  const mult = PERIODS.find(p => p.key === period)?.perYear ?? 26;
  const gross = parseFloat(grossPay) || 0;

  const calc = useMemo(() => {
    if (!gross) return null;
    return calculate(country, gross * mult, mult, filing, usState, caProv, k401, health, dental, hsa, otherPost);
  }, [country, gross, mult, filing, usState, caProv, k401, health, dental, hsa, otherPost]);

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';

  async function handleDownload() {
    if (!calc) return;
    setDlLoading(true);
    setDlError('');
    try {
      const res = await fetch('/api/tools/paystub', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setDlError(data.error ?? 'Download failed. Please try again.');
        if (data.remaining !== undefined && data.limit !== undefined) {
          setUsage({ remaining: 0, limit: data.limit, plan: data.plan ?? 'anonymous' });
        }
        return;
      }
      if (data.remaining !== undefined && data.limit !== undefined) {
        setUsage({ remaining: data.remaining, limit: data.limit, plan: data.plan ?? 'anonymous' });
      }
    } catch {
      setDlError('Network error. Please try again.');
      return;
    } finally {
      setDlLoading(false);
    }

    const html = buildPaystubHTML(calc, sym, coName, coAddr, ein, country, empName, empTitle, empAddr, empId, payDate, periStart, periEnd, periodLabel, template);
    const win = window.open('', '_blank');
    if (!win) { setDlError('Popup blocked — please allow popups for this site.'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 350);
  }

  if (user === undefined) {
    return (
      <ToolLayout
        toolSlug="paystub-generator"
        title="Pay Stub Generator"
        description="Generate professional pay stubs with accurate 2025/2026 tax calculations for USA, UK, Canada, Australia, India, and more."
        icon="🧾"
        relatedTools={RELATED}
        showAds={false}
        rateLimited={true}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-stone-50 rounded-xl w-3/4" />
          <div className="h-32 bg-stone-50 rounded-xl" />
          <div className="h-32 bg-stone-50 rounded-xl" />
        </div>
      </ToolLayout>
    );
  }

  if (user === null) {
    return (
      <ToolLayout
        title="Pay Stub Generator"
        description="Generate professional pay stubs with accurate 2025/2026 tax calculations for USA, UK, Canada, Australia, India, and more."
        icon="🧾"
        relatedTools={RELATED}
        showAds={false}
        rateLimited={true}
      >
        <div className="space-y-6">
          <div className="card text-center py-12 px-6">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Sign in to generate pay stubs</h2>
            <p className="text-stone-500 mb-6">Pay Stub Generator requires a free account. Takes 30 seconds.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="btn-secondary px-8 py-3">Sign In</Link>
              <Link href="/signup" className="btn-primary px-8 py-3">Create Free Account</Link>
            </div>
          </div>

          {/* Blurred preview showing value */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="pointer-events-none select-none blur-sm opacity-60">
              <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl text-xs">
                <div className="bg-[#1a2332] text-white px-5 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base">Acme Corporation</div>
                      <div className="text-stone-500 text-xs mt-0.5">123 Business Ave, New York, NY</div>
                      <div className="text-stone-500 text-xs">EIN: 12-3456789</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#7fb3d3] font-bold text-sm">PAY STATEMENT</div>
                      <div className="text-stone-500 text-xs mt-0.5">Pay Date: 2025-01-15</div>
                      <div className="text-stone-500 text-xs">Bi-Weekly</div>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between">
                  <div>
                    <div className="font-semibold text-sm">Jane Smith</div>
                    <div className="text-stone-500">Software Engineer</div>
                  </div>
                  <div className="text-stone-500">ID: EMP-0042</div>
                </div>
                <div className="px-5 py-3">
                  <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs tracking-wider uppercase">
                    <span>Earnings</span><span>Amount</span>
                  </div>
                  <div className="flex justify-between py-1"><span className="text-stone-600">Regular Pay (Bi-Weekly)</span><span>$3,846.15</span></div>
                  <div className="flex justify-between py-1 border-t border-gray-100 font-semibold"><span>Gross Pay</span><span>$3,846.15</span></div>
                </div>
                <div className="px-5 py-3 border-t border-gray-100">
                  <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs tracking-wider uppercase">
                    <span>Taxes &amp; Withholding</span><span>Amount</span>
                  </div>
                  <div className="flex justify-between py-1 text-stone-600"><span>Federal Income Tax</span><span className="text-red-600">-$476.00</span></div>
                  <div className="flex justify-between py-1 text-stone-600"><span>California Tax</span><span className="text-red-600">-$213.00</span></div>
                  <div className="flex justify-between py-1 text-stone-600"><span>Social Security (6.2%)</span><span className="text-red-600">-$238.46</span></div>
                  <div className="flex justify-between py-1 text-stone-600"><span>Medicare (1.45%)</span><span className="text-red-600">-$55.77</span></div>
                </div>
                <div className="px-5 py-4 bg-[#1a5276] text-stone-900">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">NET PAY</div>
                      <div className="text-[#aed6f1] text-xs">Effective rate: 25.8%</div>
                    </div>
                    <div className="text-2xl font-bold">$2,862.92</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950/40 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-white font-semibold text-sm">Sign in to unlock</p>
              </div>
            </div>
          </div>
        </div>
      </ToolLayout>
    );
  }

  const limitExhausted = usage !== null && usage.remaining === 0;

  return (
    <ToolLayout
      title="Pay Stub Generator"
      description="Generate professional pay stubs with accurate 2026 tax calculations for USA, UK, Canada, Australia, India, and more. Includes all deductions and employer contributions."
      icon="🧾"
      relatedTools={RELATED}
      showAds={false}
      rateLimited={true}
      faqs={[
        { q: 'Is the pay stub generator free?', a: 'Yes. Creating, previewing, and downloading pay stubs is free. The generator supports USA (all 50 states), UK, Canada, India, Australia, New Zealand, Ireland, and Singapore with 2026 tax tables.' },
        { q: 'Are the tax calculations accurate for 2026?', a: 'Yes. Tax tables are updated for 2026 including US federal and state taxes, Social Security (6.2%), Medicare (1.45%), UK National Insurance, Canadian CPP/EI, Indian PF/ESI, and other jurisdiction-specific deductions.' },
        { q: 'How do I create a pay stub for a contractor or freelancer?', a: 'Enter the contractor\'s name, your company name, and the payment amount. Select your country and pay frequency. The generator works for both employees and independent contractors.' },
        { q: 'Can I use these pay stubs for bank loan applications?', a: 'Pay stubs generated by Formly are for record-keeping and reference purposes. For formal verification (bank loans, visa applications, rental applications), check with the institution whether self-generated stubs are accepted.' },
        { q: 'Does it support Indian payroll with PF and ESI?', a: 'Yes. The generator supports Indian payroll including Provident Fund (12% employer + 12% employee), ESI (0.75% employee, 3.25% employer), professional tax, and income tax under the new 2026 tax regime.' },
        { q: 'How is this different from paid pay stub services?', a: 'Formly is free — unlike StubCreator ($4.99/stub) or ThePayStubs ($8.99/stub). Formly supports 8 countries vs USA-only on most competitors, includes live preview before downloading, and requires no account.' },
      ]}
    >
      {usage && <UsageBanner remaining={usage.remaining} limit={usage.limit} plan={usage.plan} />}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">

        {/* ── FORM ── */}
        <div className="space-y-5">

          <TemplatePicker value={template} onChange={setTemplate} />

          <div className="card">
            <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Country / Region</h2>
            <div className="grid grid-cols-4 gap-2">
              {COUNTRIES.map(c => (
                <button key={c.code} type="button" onClick={() => setCountry(c.code)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                    country === c.code
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-700'
                      : 'bg-stone-50/40 border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                  }`}>
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-xs font-medium leading-tight">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Pay Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">Gross Pay This Period ({sym})</label>
                <input type="number" min={0} value={grossPay} onChange={e => setGrossPay(e.target.value)} placeholder="e.g. 3500" className="input text-sm" />
              </div>
              <div>
                <label className="label text-xs">Pay Frequency</label>
                <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm">
                  {PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Pay Date</label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="input text-sm" />
              </div>
              <div>
                <label className="label text-xs">Period Start</label>
                <input type="date" value={periStart} onChange={e => setPeriStart(e.target.value)} className="input text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="label text-xs">Period End</label>
                <input type="date" value={periEnd} onChange={e => setPeriEnd(e.target.value)} className="input text-sm" />
              </div>
            </div>
          </div>

          {country === 'US' && (
            <div className="card">
              <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Tax Settings (USA)</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Filing Status</label>
                  <select value={filing} onChange={e => setFiling(e.target.value)} className="input text-sm">
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                    <option value="hoh">Head of Household</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">State</label>
                  <select value={usState} onChange={e => setUsState(e.target.value)} className="input text-sm">
                    {USA_STATES.map(([code, name, rate]) => (
                      <option key={code} value={code}>{name}{rate === 0 ? ' ★' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {country === 'CA' && (
            <div className="card">
              <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Tax Settings (Canada)</h2>
              <div>
                <label className="label text-xs">Province / Territory</label>
                <select value={caProv} onChange={e => setCaProv(e.target.value)} className="input text-sm">
                  {CA_PROVS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </div>
            </div>
          )}

          {country === 'US' && (
            <div className="card">
              <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Pre-Tax Deductions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumInput label="401(k) %" value={k401} onChange={setK401} min={0} step={0.5} />
                <NumInput label="Health Insurance (per period)" value={health} onChange={setHealth} prefix={sym} />
                <NumInput label="Dental / Vision (per period)" value={dental} onChange={setDental} prefix={sym} />
                <NumInput label="HSA (per period)" value={hsa} onChange={setHsa} prefix={sym} />
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Post-Tax Deductions (optional)</h2>
            <NumInput label="Other Deductions (per period)" value={otherPost} onChange={setOtherPost} prefix={sym} />
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Employer Information</h2>
            <div className="space-y-3">
              <input value={coName} onChange={e => setCoName(e.target.value)} placeholder="Company Name" className="input text-sm" />
              <input value={coAddr} onChange={e => setCoAddr(e.target.value)} placeholder="Company Address" className="input text-sm" />
              <input value={ein} onChange={e => setEin(e.target.value)} placeholder={country === 'US' ? 'EIN: XX-XXXXXXX' : 'Tax / Registration Number'} className="input text-sm" />
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4">Employee Information</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={empName}  onChange={e => setEmpName(e.target.value)}  placeholder="Employee Full Name" className="input text-sm" />
              <input value={empTitle} onChange={e => setEmpTitle(e.target.value)} placeholder="Job Title" className="input text-sm" />
              <input value={empId}    onChange={e => setEmpId(e.target.value)}    placeholder="Employee ID (optional)" className="input text-sm" />
              <input value={empAddr}  onChange={e => setEmpAddr(e.target.value)}  placeholder="Employee Address (optional)" className="input text-sm" />
            </div>
          </div>
        </div>

        {/* ── LIVE PREVIEW ── */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
          {calc ? (
            <>
              <button
                type="button"
                onClick={handleDownload}
                disabled={dlLoading || limitExhausted}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {dlLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
                  : limitExhausted
                    ? 'Daily limit reached'
                    : <><Download className="w-4 h-4" /> Download / Print PDF</>}
              </button>

              {dlError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{dlError}
                </div>
              )}

              {(() => {
                const pt = TEMPLATES.find(t => t.id === template) ?? TEMPLATES[0];
                const isMinimal = template === 'minimal';
                return (
              <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl text-xs">
                <div className="px-5 py-4" style={{ background: pt.headerBg, color: isMinimal ? '#111' : '#fff' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base">{coName || 'Company Name'}</div>
                      <div className="text-xs mt-0.5" style={{ color: isMinimal ? '#6b7280' : '#9ca3af' }}>{coAddr || ''}</div>
                      {ein && <div className="text-xs" style={{ color: isMinimal ? '#6b7280' : '#9ca3af' }}>{country === 'US' ? 'EIN' : 'Reg No'}: {ein}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm" style={{ color: isMinimal ? '#374151' : pt.accent === '#6d28d9' ? '#ddd6fe' : pt.accent === '#b45309' ? '#fbbf24' : pt.accent === '#166534' ? '#bbf7d0' : '#7fb3d3' }}>PAY STATEMENT</div>
                      <div className="text-xs mt-0.5" style={{ color: isMinimal ? '#6b7280' : '#9ca3af' }}>Pay Date: {payDate || '—'}</div>
                      {periStart && periEnd && <div className="text-xs" style={{ color: isMinimal ? '#6b7280' : '#9ca3af' }}>{periStart} – {periEnd}</div>}
                      <div className="text-xs" style={{ color: isMinimal ? '#6b7280' : '#9ca3af' }}>{periodLabel}</div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between">
                  <div>
                    <div className="font-semibold text-sm">{empName || 'Employee Name'}</div>
                    {empTitle && <div className="text-stone-500">{empTitle}</div>}
                    {empAddr && <div className="text-stone-500">{empAddr}</div>}
                  </div>
                  {empId && <div className="text-stone-500">ID: {empId}</div>}
                </div>

                <div className="px-5 py-3">
                  <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs tracking-wider uppercase">
                    <span>Earnings</span><span>Amount</span>
                  </div>
                  <div className="flex justify-between py-1"><span className="text-stone-600">Regular Pay ({periodLabel})</span><span>{money(calc.gross, sym)}</span></div>
                  <div className="flex justify-between py-1 border-t border-gray-100 font-semibold"><span>Gross Pay</span><span>{money(calc.gross, sym)}</span></div>
                </div>

                {calc.preTaxLines.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100">
                    <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs tracking-wider uppercase">
                      <span>Pre-Tax Deductions</span><span>Amount</span>
                    </div>
                    {calc.preTaxLines.map((l, i) => (
                      <div key={i} className="flex justify-between py-1 text-stone-600">
                        <span>{l.label}</span><span className="text-red-600">-{money(l.amount, sym)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-1 border-t border-gray-100 text-stone-600">
                      <span>Taxable Gross</span><span className="font-medium">{money(calc.taxableGross, sym)}</span>
                    </div>
                  </div>
                )}

                <div className="px-5 py-3 border-t border-gray-100">
                  <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs tracking-wider uppercase">
                    <span>Taxes &amp; Withholding</span><span>Amount</span>
                  </div>
                  {calc.taxLines.map((l, i) => (
                    <div key={i} className="flex justify-between py-1 text-stone-600">
                      <span>{l.label}{l.note && <span className="text-stone-500 ml-1 text-xs">({l.note})</span>}</span>
                      <span className="text-red-600">-{money(l.amount, sym)}</span>
                    </div>
                  ))}
                </div>

                {calc.postTaxLines.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100">
                    <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs tracking-wider uppercase">
                      <span>Post-Tax Deductions</span><span>Amount</span>
                    </div>
                    {calc.postTaxLines.map((l, i) => (
                      <div key={i} className="flex justify-between py-1 text-stone-600">
                        <span>{l.label}</span><span className="text-red-600">-{money(l.amount, sym)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 py-4 text-white" style={{ background: pt.accent }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">NET PAY</div>
                      <div className="text-xs opacity-80">Effective rate: {(calc.effectiveRate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-2xl font-bold">{money(calc.net, sym)}</div>
                  </div>
                </div>

                {calc.employerLines.length > 0 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Employer Contributions (not deducted from your pay)</div>
                    {calc.employerLines.map((l, i) => (
                      <div key={i} className="flex justify-between py-0.5 text-stone-500 text-xs">
                        <span>{l.label}{l.note ? ` (${l.note})` : ''}</span><span>{money(l.amount, sym)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-stone-500 text-xs">Gross Pay</div><div className="font-semibold text-sm">{money(calc.gross, sym)}</div></div>
                  <div><div className="text-stone-500 text-xs">Total Deducted</div><div className="font-semibold text-sm text-red-600">-{money(calc.totalWithheld, sym)}</div></div>
                  <div><div className="text-stone-500 text-xs">Net Pay</div><div className="font-semibold text-sm text-green-700">{money(calc.net, sym)}</div></div>
                </div>

                <div className="px-5 py-2 text-center text-stone-500 text-xs border-t border-gray-100">
                  Free pay stub generated on Formly Tools · formly.tools · Tax tables 2026
                </div>
              </div>
                );
              })()}
            </>
          ) : (
            <div className="card border-dashed border-stone-200 text-center py-16">
              <div className="text-4xl mb-3">🧾</div>
              <p className="text-stone-500 text-sm">Enter gross pay above to see your live pay stub preview</p>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-amber-500/5 border-amber-500/20 mt-2">
        <p className="text-xs text-amber-300">
          <strong>2025/2026 Tax Tables.</strong> Calculations use annualized withholding method with standard deductions.
          State/provincial rates are simplified estimates. For payroll compliance, use certified payroll software.
          This tool is for estimation and reference only.
        </p>
      </div>
    </ToolLayout>
  );
}
