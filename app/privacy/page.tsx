import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Formly',
  description: 'Formly Privacy Policy. We do not store your content. Learn what data we collect and how we protect your privacy.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-10">Last updated: January 15, 2024</p>

          <div className="prose prose-sm max-w-none prose-invert prose-p:text-gray-400 prose-h2:text-white prose-h2:text-xl prose-h2:mt-8 prose-li:text-gray-400">
            <p>Formly (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights.</p>

            <h2>1. What We Collect</h2>
            <p><strong className="text-white">Account data:</strong> Email address and name when you create an account. Used only for authentication and account management.</p>
            <p><strong className="text-white">Usage data:</strong> We log which AI tool was used, the timestamp, and your IP address or user ID — solely for rate limiting (preventing abuse). We do NOT log the content of your requests.</p>
            <p><strong className="text-white">Payment data:</strong> Handled entirely by Stripe or Razorpay. We never see or store your card details.</p>
            <p><strong className="text-white">Analytics:</strong> Google Analytics collects anonymized usage data (page views, session duration). No personally identifiable information is sent to Google.</p>

            <h2>2. What We Do NOT Collect</h2>
            <ul>
              <li>The text, documents, or content you process through our AI tools</li>
              <li>Your uploaded PDF files (processed in memory, immediately discarded)</li>
              <li>Any biometric, health, or sensitive personal data</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To provide and improve our services</li>
              <li>To enforce daily usage limits (rate limiting)</li>
              <li>To send transactional emails (receipt, password reset)</li>
              <li>To send weekly newsletters (only if subscribed — unsubscribe anytime)</li>
            </ul>

            <h2>4. Data Storage</h2>
            <p>Your account data is stored in Supabase (hosted on AWS in the US/EU). Usage logs are automatically deleted after 90 days. Payment data is stored by Stripe/Razorpay under their respective privacy policies.</p>

            <h2>5. Your Rights (GDPR/DPDP)</h2>
            <p>You have the right to: access your data, correct inaccurate data, delete your account and all associated data, export your data. Email <a href="mailto:privacy@formly.tools" className="text-violet-400">privacy@formly.tools</a> to exercise these rights.</p>

            <h2>6. Cookies</h2>
            <p>We use essential cookies for authentication (session management) and analytics cookies (Google Analytics). No advertising cookies are used.</p>

            <h2>7. Third-Party Services</h2>
            <ul>
              <li><strong className="text-white">Groq:</strong> Processes AI requests. Your input is sent to Groq&apos;s API and not stored by us. See <a href="https://groq.com/privacy" className="text-violet-400">Groq Privacy Policy</a>.</li>
              <li><strong className="text-white">Supabase:</strong> Database and authentication.</li>
              <li><strong className="text-white">Stripe/Razorpay:</strong> Payment processing.</li>
              <li><strong className="text-white">Vercel:</strong> Hosting and edge functions.</li>
            </ul>

            <h2>8. Contact</h2>
            <p>For privacy concerns: <a href="mailto:privacy@formly.tools" className="text-violet-400">privacy@formly.tools</a>.<br />Formly, India.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
