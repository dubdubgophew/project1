import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — Formly',
  description: 'Formly Terms of Service. Read our usage terms, subscription policies, and content guidelines.',
  alternates: { canonical: 'https://formly.tools/terms' },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: January 15, 2024</p>

          <div className="prose prose-sm max-w-none prose-invert prose-p:text-gray-400 prose-h2:text-white prose-h2:text-xl prose-h2:mt-8 prose-li:text-gray-400">
            <p>By using Formly (&quot;the Service&quot;), you agree to these Terms. Please read them carefully.</p>

            <h2>1. Acceptable Use</h2>
            <p>You may use Formly for lawful purposes only. You may not:</p>
            <ul>
              <li>Use the service to generate harmful, illegal, or abusive content</li>
              <li>Attempt to bypass rate limits or abuse the free tier</li>
              <li>Scrape, reverse-engineer, or resell our services</li>
              <li>Use our AI output to train competing AI models</li>
            </ul>

            <h2>2. Free Tier</h2>
            <p>The free tier provides 5 AI uses per day without an account, and 10 uses/day with a free account. We reserve the right to modify these limits at any time.</p>

            <h2>3. Subscriptions & Payments</h2>
            <p>Pro and Unlimited plans are billed monthly. You may cancel at any time; cancellation takes effect at the end of the billing period. We offer a 7-day money-back guarantee for first-time subscribers — email support@formly.tools within 7 days of payment.</p>

            <h2>4. AI Output Disclaimer</h2>
            <p>AI-generated content may contain errors, inaccuracies, or outdated information. Do not rely solely on AI output for legal, medical, financial, or safety-critical decisions. The Contract Generator produces templates for reference only — consult a qualified lawyer for binding agreements.</p>

            <h2>5. Intellectual Property</h2>
            <p>You retain full ownership of content you input and output you generate. We claim no rights over your AI-generated outputs.</p>

            <h2>6. Service Availability</h2>
            <p>We aim for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for losses due to service downtime.</p>

            <h2>7. Limitation of Liability</h2>
            <p>Formly&apos;s liability is limited to the amount you paid in the last 3 months. We are not liable for indirect, incidental, or consequential damages.</p>

            <h2>8. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Disputes shall be resolved in the courts of India.</p>

            <h2>9. Changes</h2>
            <p>We may update these Terms. Continued use after changes constitutes acceptance. Material changes will be notified via email.</p>

            <h2>10. Contact</h2>
            <p>Questions: <a href="mailto:support@formly.tools" className="text-violet-400">support@formly.tools</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
