'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Check, Zap, Star, Building2, HelpCircle, Loader2, Flame } from 'lucide-react';
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
      'All 28 AI tools',
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
    priceUSD: 9.99,
    description: 'For freelancers and power users.',
    features: [
      '200 AI uses per day',
      'All 28 AI tools',
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
    priceUSD: 19.99,
    description: 'For agencies and heavy users.',
    features: [
      'Unlimited AI uses per day',
      'All 28 AI tools',
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
  {
    id: 'day_pass',
    name: 'Day Pass',
    icon: Flame,
    priceUSD: 1.99,
    description: 'Full Pro access for 24 hours. One-time payment.',
    features: [
      '200 AI uses for 24 hours',
      'All 28 AI tools',
      'Priority processing (2× faster)',
      'Longer text inputs (10K chars)',
      'PDF downloads for resumes',
      'No subscription needed',
    ],
    notIncluded: ['Usage analytics dashboard', 'API access'],
    cta: 'Buy Day Pass',
    highlighted: false,
    badge: 'One-Time',
    oneTime: true,
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
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-4">
              Start free. Upgrade when you need more. Cancel anytime — 7-day money-back guarantee.
            </p>
            <p className="text-sm text-gray-600">
              All prices in USD · Local currency shown at checkout · All taxes included
            </p>
          </div>

          {/* Plans */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border transition-all duration-300 flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-orange-50 to-amber-50/30 border-orange-300 shadow-xl shadow-orange-500/10 ring-1 ring-orange-200'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      plan.highlighted
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-orange-100' : 'bg-stone-100'}`}>
                    <plan.icon className={`w-5 h-5 ${plan.highlighted ? 'text-orange-500' : 'text-stone-400'}`} />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">{plan.name}</h2>
                </div>

                <div className="mb-2">
                  {plan.priceUSD === 0 ? (
                    <span className="text-5xl font-bold text-stone-900">Free</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold text-stone-900">${plan.priceUSD}</span>
                      <span className="text-gray-500 mb-2">
                        {(plan as any).oneTime ? ' one-time' : '/mo'}
                      </span>
                    </div>
                  )}
                </div>
                {plan.priceUSD > 0 && (
                  <p className="text-xs text-stone-400 mb-3">
                    {(plan as any).oneTime
                      ? '24h Pro access · No subscription'
                      : 'Billed monthly · 10% off with annual · Cancel anytime'}
                  </p>
                )}

                <p className="text-stone-500 text-sm mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-stone-700">{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <span className="w-4 h-4 mt-0.5 shrink-0 text-center text-gray-600 text-xs font-bold">✕</span>
                      <span className="text-sm text-stone-400 line-through">{f}</span>
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
            <h2 className="text-xl font-bold text-stone-900 mb-6">Full Comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 pr-4 text-stone-500 font-medium w-2/5">Feature</th>
                  <th className="text-center py-3 px-2 text-stone-500 font-medium">Free</th>
                  <th className="text-center py-3 px-2 text-orange-400 font-medium">Day Pass</th>
                  <th className="text-center py-3 px-2 text-orange-500 font-semibold">Pro</th>
                  <th className="text-center py-3 px-2 text-amber-400 font-medium">Unlimited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {[
                  ['AI uses', '5–10/day', '200 (24h)', '200/day', 'Unlimited'],
                  ['All 28 AI tools', '✓', '✓', '✓', '✓'],
                  ['Max input length', '2,000 chars', '10,000 chars', '10,000 chars', '50,000 chars'],
                  ['Processing speed', 'Standard', 'Priority (2×)', 'Priority (2×)', 'Fastest (3×)'],
                  ['PDF downloads', '✗', '✓', '✓', '✓'],
                  ['Usage dashboard', '✗', '✗', '✓', '✓'],
                  ['White-label output', '✗', '✗', '✗', '✓'],
                  ['API access', '✗', '✗', '✗', 'Coming soon'],
                  ['Support', 'Community', 'Community', 'Email (48h)', 'Priority (24h)'],
                  ['Billing', 'Free', '$1.99 once', '$9.99/mo', '$19.99/mo'],
                ].map(([feature, free, dayPass, pro, unlim]) => (
                  <tr key={feature}>
                    <td className="py-3 pr-4 text-stone-500">{feature}</td>
                    <td className="text-center py-3 px-2 text-stone-400">{free}</td>
                    <td className="text-center py-3 px-2 text-stone-600">{dayPass}</td>
                    <td className="text-center py-3 px-2 text-stone-600">{pro}</td>
                    <td className="text-center py-3 px-2 text-stone-600">{unlim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-stone-900 text-center mb-8">Pricing FAQ</h2>
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
                  a: 'Yes — 50% off the Pro or Unlimited monthly plan. Email support@formly.tools with proof of student status (college ID or .edu email) or NGO registration. Discounts apply to subscriptions only and are not available on the Day Pass, which is already a low-cost one-time purchase.',
                },
                {
                  q: 'Can I upgrade or downgrade my plan?',
                  a: 'Yes. You can upgrade at any time and the new plan takes effect immediately. Downgrading takes effect at the end of your current billing period. Your data and history are always preserved.',
                },
                {
                  q: 'What happens to my access when I cancel?',
                  a: 'Nothing changes immediately. You keep full access to all features until the end of your paid billing period. After that, your account switches to the Free plan automatically. There are no cancellation fees.',
                },
              ].map((faq) => (
                <div key={faq.q} className="card">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900 mb-2">{faq.q}</p>
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
