'use client';

import Link from 'next/link';
import { Check, Zap, Star, Building2 } from 'lucide-react';
const PLANS = [
  {
    name: 'Free',
    icon: Zap,
    priceUSD: 0,
    badge: null,
    description: 'Try every tool without a credit card.',
    features: [
      '5 AI requests per day',
      'All 10 AI tools',
      'No signup required',
      'Standard processing speed',
      'Copy & download output',
    ],
    cta: 'Start for Free',
    href: '/tools',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Star,
    priceUSD: 9.99,
    badge: 'Most Popular',
    description: 'For freelancers and power users.',
    features: [
      '200 AI requests per day',
      'All 10 AI tools',
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
  {
    name: 'Unlimited',
    icon: Building2,
    priceUSD: 19.99,
    badge: 'Best Value',
    description: 'For agencies and heavy users.',
    features: [
      'Unlimited AI requests',
      'All 10 AI tools',
      'Fastest processing priority',
      'Max text length (50K chars)',
      'API access (coming soon)',
      'Priority email & chat support',
      'White-label output',
      'Team workspace (coming soon)',
    ],
    cta: 'Go Unlimited',
    href: '/signup?plan=unlimited',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section className="section bg-gray-950" id="pricing">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-2">
            Start free, upgrade when you need more. Cancel anytime — no questions asked.
          </p>
          <p className="text-sm text-gray-600">All prices in USD · Local currency shown at checkout · All taxes included</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-violet-600/10 to-purple-600/5 border-violet-500/40 shadow-2xl shadow-violet-500/20'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-violet-500/20' : 'bg-gray-800'}`}>
                  <plan.icon className={`w-5 h-5 ${plan.highlighted ? 'text-violet-400' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <div className="mb-2">
                {plan.priceUSD === 0 ? (
                  <span className="text-4xl font-bold text-white">Free</span>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">${plan.priceUSD}</span>
                    <span className="text-gray-500 mb-1">/month</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-8">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
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

        <p className="text-center text-sm text-gray-600 mt-8">
          All plans include a 7-day money-back guarantee. Secure payment via DodoPayments · All taxes included.
        </p>
      </div>
    </section>
  );
}
