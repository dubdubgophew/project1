'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Formly really free? What are the limits?',
    a: 'Yes! You get 5 free AI requests per day across all tools — no credit card, no signup needed. Free accounts (with signup) get 10/day. Pro users get 200/day and Unlimited users get, well, unlimited.',
  },
  {
    q: 'What AI model powers Formly?',
    a: "We use Meta's LLaMA 3.1 70B — one of the world's most capable open-source AI models — served via Groq's blazing-fast infrastructure. It's the same quality as ChatGPT GPT-4 for most tasks, completely free.",
  },
  {
    q: 'Is my data safe? Do you store my content?',
    a: 'Your privacy is our priority. We do NOT store the content you process through our tools. Inputs are sent directly to the AI, output returned to you, and nothing is saved. We only store usage counts for rate limiting.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: "Yes, absolutely. Cancel anytime from your dashboard in one click. You'll keep access until the end of the billing period. We offer a 7-day money-back guarantee, no questions asked.",
  },
  {
    q: 'Do you support Indian payment methods?',
    a: 'Yes! We accept UPI, Debit/Credit cards, Net Banking, and Wallets via Razorpay. International users can pay via Stripe (all major cards + Apple Pay). Pricing in both USD and INR.',
  },
  {
    q: 'How accurate are the AI outputs?',
    a: 'LLaMA 3.1 70B produces excellent output for most tasks. For grammar checking, paraphrasing, summarization, and email writing, quality is comparable to premium tools like Grammarly or Jasper — at a fraction of the price.',
  },
  {
    q: 'Is there an API available?',
    a: "API access is coming soon for Unlimited plan subscribers. You'll be able to integrate Formly's AI tools into your own applications. Join the waitlist via your dashboard.",
  },
  {
    q: 'What languages are supported?',
    a: 'Formly works best in English, but LLaMA 3.1 supports 8 languages including Spanish, French, German, Italian, Portuguese, Hindi, and Arabic for many tasks.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section bg-gray-950" id="faq">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                open === i ? 'bg-gray-900 border-violet-500/30' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180 text-violet-400' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Schema.org FAQ structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
