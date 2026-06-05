import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Refund Policy — Formly',
  description: 'Formly refund policy. 7-day money-back guarantee on Pro plan. Day Pass is non-refundable.',
  alternates: { canonical: 'https://formly.tools/refunds' },
};

export default function RefundsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">Refund Policy</h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: June 5, 2026</p>
          <div className="prose prose-sm max-w-none prose-invert prose-p:text-gray-400 prose-h2:text-white prose-h2:text-xl prose-h2:mt-8 prose-li:text-stone-500">
            <h2>Pro Plan — 7-Day Money-Back Guarantee</h2>
            <p>If you&apos;re not satisfied with your Formly Pro subscription ($5.99/month) within 7 days of your first payment, we&apos;ll issue a full refund — no questions asked.</p>
            <h2>Day Pass — No Refunds</h2>
            <p>The Day Pass ($3.99, one-time) grants immediate 24-hour Pro access. Because access is granted instantly, Day Pass purchases are non-refundable.</p>
            <h2>How to Request a Refund</h2>
            <p>Email <a href="mailto:support@formly.tools" className="text-orange-500">support@formly.tools</a> with your account email and &quot;Refund Request&quot; in the subject line. We process refunds within 3–5 business days.</p>
            <h2>Refund Eligibility</h2>
            <ul>
              <li>Pro plan first-time subscribers only (within 7 days of first payment)</li>
              <li>Refunds not available for subsequent monthly charges after the 7-day window</li>
              <li>Day Pass purchases are non-refundable</li>
            </ul>
            <h2>Questions</h2>
            <p>Contact <a href="mailto:support@formly.tools" className="text-orange-500">support@formly.tools</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
