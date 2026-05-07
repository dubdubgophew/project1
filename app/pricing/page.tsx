'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Check, Zap, Star, Building2, HelpCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    priceUSD: 0,
    description: 'Perfect for trying Formly.',
    features: [
      '5 AI uses per day (no signup)',
      '10 uses/day with free account',
      'All 10 AI tools',
      'Copy & download output',
      'Standard AI speed',
      'Community support',
    ],
    notIncluded: ['Longer inputs', 'Priority speed', 'PDF downloads', 'API access'],
    cta: 'Start for Free',
    href: '/tools',
    highlighted: false,
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Star,
    priceUSD: 9,
    description: 'For freelancers and power users.',
    features: [
      '200 AI uses per day',
      'All 10 AI tools',
      'Priority processing (2× faster)',
      'Longer text inputs (10K chars)',
      'PDF downloads for resumes',
      'Advanced output formatting',
      'Usage analytics dashboard',
      'Email support (48h response)',
    ],
    notIncluded: ['API access', 'White-label output'],
    cta: 'Start Pro',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    icon: Building2,
    priceUSD: 19,
    description: 'For agencies and heavy users.',
    features: [
      'Unlimited AI uses per day',
      'All 10 AI tools',
      'Fastest processing priority',
      'Max text length (50K chars)',
      'All Pro features included',
      'White-label output',
      'API access (coming soon)',
      'Priority email support (24h)',
      'Team workspace (coming soon)',
    ],
    notIncluded: [],
    cta: 'Go Unlimited',
    highlighted: false,
    badge: 'Best Value',
  },
];

export default function PricingPage() {
  const [billingLoading, setBillingLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    if (planId === 'free') {
      window.location.href = '/tools';
      return;
    }

    setBillingLoading(planId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/signup?plan=${planId}`;
        return;
      }

      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? 'Checkout setup failed. Please try again.');
      }
    } finally {
      setBillingLoading(null);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
              Start free. Upgrade when you need more. Cancel anytime — 7-day money-back guarantee.
            </p>
            <p className="text-sm text-gray-600">
              All prices in USD · Local currency shown at checkout · All taxes included
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border transition-all duration-300 flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-violet-600/10 to-purple-600/5 border-violet-500/40 shadow-2xl shadow-violet-500/20'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      plan.highlighted
                        ? 'bg-violet-600 text-white'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-violet-500/20' : 'bg-gray-800'}`}>
                    <plan.icon className={`w-5 h-5 ${plan.highlighted ? 'text-violet-400' : 'text-gray-400'}`} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                </div>

                <div className="mb-2">
                  {plan.priceUSD === 0 ? (
                    <span className="text-5xl font-bold text-white">Free</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold text-white">${plan.priceUSD}</span>
                      <span className="text-gray-500 mb-2">/mo</span>
                    </div>
                  )}
                </div>
                {plan.priceUSD > 0 && (
                  <p className="text-xs text-gray-600 mb-3">
                    Billed monthly · Cancel anytime
                  </p>
                )}

                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300">{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <span className="w-4 h-4 mt-0.5 shrink-0 text-center text-gray-600 text-xs font-bold">✕</span>
                      <span className="text-sm text-gray-500 line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={billingLoading === plan.id}
                  className={`w-full justify-center py-3.5 ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {billingLoading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="card mb-16 overflow-x-auto">
            <h2 className="text-xl font-bold text-white mb-6">Full Comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 pr-4 text-gray-400 font-medium w-1/2">Feature</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Free</th>
                  <th className="text-center py-3 px-4 text-violet-400 font-semibold">Pro</th>
                  <th className="text-center py-3 px-4 text-amber-400 font-medium">Unlimited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {[
                  ['Daily AI uses', '5 (10 with account)', '200', 'Unlimited'],
                  ['All 10 AI tools', '✓', '✓', '✓'],
                  ['Max input length', '2,000 chars', '10,000 chars', '50,000 chars'],
                  ['Processing speed', 'Standard', 'Priority (2×)', 'Fastest (3×)'],
                  ['PDF downloads', '✗', '✓', '✓'],
                  ['Usage dashboard', '✗', '✓', '✓'],
                  ['White-label output', '✗', '✗', '✓'],
                  ['API access', '✗', '✗', 'Coming soon'],
                  ['Support', 'Community', 'Email (48h)', 'Priority (24h)'],
                ].map(([feature, free, pro, unlim]) => (
                  <tr key={feature}>
                    <td className="py-3 pr-4 text-gray-400">{feature}</td>
                    <td className="text-center py-3 px-4 text-gray-500">{free}</td>
                    <td className="text-center py-3 px-4 text-gray-300">{pro}</td>
                    <td className="text-center py-3 px-4 text-gray-300">{unlim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Pricing FAQ</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'What payment methods do you accept?',
                  a: 'Cards (Visa, Mastercard, Amex), UPI, net banking, Apple Pay, Google Pay, and more — via DodoPayments. Your local currency is shown at checkout. All taxes included.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes. Cancel with one click from your dashboard settings. You keep access until the end of the billing period. No cancellation fees.',
                },
                {
                  q: "What's the money-back guarantee?",
                  a: "If you're not satisfied within 7 days of your first payment, email support@formly.tools for a full refund — no questions asked.",
                },
                {
                  q: 'Do unused credits roll over?',
                  a: "Daily limits reset at midnight UTC. They don't roll over — but with 200-unlimited uses/day on paid plans, you'll rarely hit the limit.",
                },
                {
                  q: 'Is there a student or NGO discount?',
                  a: 'Yes! Email support@formly.tools with proof of student status or NGO registration for 50% off Pro.',
                },
              ].map((faq) => (
                <div key={faq.q} className="card">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white mb-2">{faq.q}</p>
                      <p className="text-sm text-gray-400">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-600">
              🔒 Payments secured by DodoPayments · 🌍 All taxes & GST included · 🛡️ 7-day money-back guarantee · Built in India 🇮🇳
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
