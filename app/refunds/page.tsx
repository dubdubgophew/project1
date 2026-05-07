import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = { title: 'Refund Policy — Formly', description: 'Formly refund policy. 7-day money-back guarantee on all paid plans.' };

export default function RefundsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">Refund Policy</h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: January 15, 2024</p>
          <div className="prose prose-sm max-w-none prose-invert prose-p:text-gray-400 prose-h2:text-white prose-h2:text-xl prose-h2:mt-8 prose-li:text-gray-400">
            <h2>7-Day Money-Back Guarantee</h2>
            <p>If you&apos;re not satisfied with Formly within 7 days of your first subscription payment, we&apos;ll issue a full refund — no questions asked.</p>
            <h2>How to Request a Refund</h2>
            <p>Email <a href="mailto:support@formly.tools" className="text-violet-400">support@formly.tools</a> with your account email and &quot;Refund Request&quot; in the subject line. We process refunds within 3-5 business days.</p>
            <h2>Refund Eligibility</h2>
            <ul>
              <li>First-time subscribers only (within 7 days of first payment)</li>
              <li>Refunds not available for subsequent monthly charges after the 7-day window</li>
              <li>Annual plans: 30-day money-back guarantee</li>
            </ul>
            <h2>Questions</h2>
            <p>Contact <a href="mailto:support@formly.tools" className="text-violet-400">support@formly.tools</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
