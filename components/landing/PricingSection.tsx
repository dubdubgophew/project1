'use client';

import Link from 'next/link';
import { Check, Zap, Star, Flame } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    icon: Zap,
    priceUSD: 0,
    priceSuffix: '',
    badge: null,
    description: 'Try every tool without a credit card.',
    features: [
      '5 AI requests per day',
      'All 40 AI tools',
      'No signup required',
      'Standard processing speed',
      'Copy & download output',
    ],
    cta: 'Start for Free',
    href: '/tools',
    highlighted: false,
  },
  {
    name: 'Day Pass',
    icon: Flame,
    priceUSD: 3.99,
    priceSuffix: ' one-time',
    badge: 'No Subscription',
    description: 'Full Pro access for 24 hours.',
    features: [
      '200 AI requests for 24 hours',
      'All 40 AI tools',
      'Priority processing speed',
      'Longer text inputs (10K chars)',
      'PDF downloads',
      'No recurring charges',
    ],
    cta: 'Buy Day Pass',
    href: '/pricing',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Star,
    priceUSD: 5.99,
    priceSuffix: '/month',
    badge: 'Most Popular',
    description: 'For freelancers and power users.',
    features: [
      '200 AI requests per day',
      'All 40 AI tools',
      'Priority processing speed',
      'Longer text inputs (10K chars)',
      'PDF download for resumes',
      'Email support',
      'Usage analytics dashboard',
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section className="section bg-white" id="pricing">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto mb-2">
            Start free, upgrade when you need more. Cancel anytime — no questions asked.
          </p>
          <p className="text-sm text-stone-500">All prices in USD · Local currency shown at checkout · All taxes included</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-orange-50 to-amber-50/30 border-orange-300 shadow-xl shadow-orange-500/10 ring-1 ring-orange-200'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-md'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge-pro px-4 py-1 text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-orange-100' : 'bg-stone-100'}`}>
                  <plan.icon className={`w-5 h-5 ${plan.highlighted ? 'text-orange-500' : 'text-stone-500'}`} />
                </div>
                <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
              </div>

              <div className="mb-2">
                {plan.priceUSD === 0 ? (
                  <span className="text-4xl font-bold text-stone-900">Free</span>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-stone-900">${plan.priceUSD}</span>
                    <span className="text-stone-500 mb-1">{plan.priceSuffix}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-stone-500 mb-8">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full justify-center ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-stone-500 mt-8">
          All plans include a 7-day money-back guarantee. Secure payment via DodoPayments · All taxes included.
        </p>
      </div>
    </section>
  );
}
