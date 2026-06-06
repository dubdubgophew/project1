import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Formly Tools',
  description:
    'Formly Privacy Policy. Learn what data we collect, how we use it, our advertising disclosure, and your rights under GDPR and India DPDP Act.',
  alternates: { canonical: 'https://formly.tools/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
          <p className="text-stone-500 text-sm mb-10">Last updated: June 6, 2026</p>

          <div className="legal-content space-y-0">
            <p>
              Formly (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the website{' '}
              <a href="https://formly.tools" className="text-orange-500">formly.tools</a> and is
              committed to protecting your privacy. This policy explains what personal information we
              collect, how we use it, how third-party advertising works on our site, and your rights.
            </p>

            <h2>1. Information We Collect</h2>

            <p>
              <strong className="text-stone-900">Account data (optional):</strong> If you create a
              free or Pro account, we collect your email address and display name. This is used only
              for authentication, sending transactional emails (receipts, password resets), and
              managing your subscription.
            </p>
            <p>
              <strong className="text-stone-900">Usage data (rate limiting):</strong> When you use a
              tool, we log which tool was used, the timestamp, and a hashed identifier (IP address or
              user ID). This is used <em>solely</em> to enforce daily free usage limits. We do{' '}
              <strong className="text-stone-900">not</strong> log the content of your requests —
              your text, documents, and uploaded files are processed in memory and immediately
              discarded.
            </p>
            <p>
              <strong className="text-stone-900">Payment data:</strong> All payment processing is
              handled by DodoPayments (our Merchant of Record). We never see, process, or store your
              card number, UPI handle, or banking credentials.
            </p>
            <p>
              <strong className="text-stone-900">Analytics data:</strong> We use Google Analytics to
              understand how visitors use the site (page views, session duration, device type). This
              data is aggregated and does not personally identify you. You can opt out via{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-orange-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics Opt-out
              </a>
              .
            </p>

            <h2>2. Information We Do NOT Collect</h2>
            <ul>
              <li>The text, resumes, PDFs, or documents you process through our AI tools</li>
              <li>Files uploaded for processing (handled in browser memory or server memory only, never stored)</li>
              <li>Biometric, health, financial, or sensitive personal data</li>
              <li>Location data beyond the country level (for tax calculation features, which you enter manually)</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To provide and improve our AI tool services</li>
              <li>To enforce daily free usage rate limits (preventing abuse)</li>
              <li>To process Pro plan subscriptions and send payment receipts</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To send our newsletter (only if you explicitly subscribed — unsubscribe any time)</li>
              <li>To analyze usage patterns and improve our tools</li>
            </ul>

            <h2>4. Advertising — Google AdSense Disclosure</h2>
            <p>
              We use <strong className="text-stone-900">Google AdSense</strong> to display
              advertisements on formly.tools. Google AdSense uses cookies and tracking technologies
              to serve ads that are relevant to your interests based on your browsing activity,
              including visits to this and other websites.
            </p>
            <p>
              <strong className="text-stone-900">How Google uses this data:</strong> Google, as a
              third-party vendor, uses cookies (including the DoubleClick cookie) to serve ads on
              our site. Google&rsquo;s use of advertising cookies enables it and its partners to
              serve ads based on your visit to our site and/or other sites on the internet.
            </p>
            <p>
              <strong className="text-stone-900">Opt out of personalized ads:</strong> You may opt
              out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                className="text-orange-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ads Settings
              </a>
              . Alternatively, you can opt out of third-party vendor use of cookies for personalized
              advertising by visiting{' '}
              <a
                href="http://www.aboutads.info/choices/"
                className="text-orange-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.aboutads.info/choices
              </a>
              .
            </p>
            <p>
              For more information on how Google uses data when you use our site, see:{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                className="text-orange-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                How Google uses data when you use our partners&rsquo; sites or apps
              </a>
              .
            </p>

            <h2>5. Cookies</h2>
            <p>We use the following types of cookies:</p>
            <ul>
              <li>
                <strong className="text-stone-900">Essential cookies:</strong> Required for
                authentication (login session management). Cannot be disabled without breaking core
                functionality.
              </li>
              <li>
                <strong className="text-stone-900">Analytics cookies:</strong> Google Analytics
                cookies (_ga, _gid) that help us understand site usage. You can block these via your
                browser settings or the Google opt-out tool above.
              </li>
              <li>
                <strong className="text-stone-900">Advertising cookies:</strong> Google AdSense and
                DoubleClick cookies used to serve relevant ads. You can opt out via Google Ads
                Settings (link above).
              </li>
            </ul>
            <p>
              Most browsers allow you to control cookies via their settings. Note that disabling
              cookies may affect site functionality.
            </p>

            <h2>6. Data Storage &amp; Retention</h2>
            <p>
              Account data is stored in Supabase (hosted on AWS in the United States). Usage logs
              (for rate limiting) are automatically deleted after 90 days. Payment data is stored
              and managed by DodoPayments under their own privacy policy. Newsletter subscription
              records are retained until you unsubscribe.
            </p>

            <h2>7. Third-Party Services</h2>
            <ul>
              <li>
                <strong className="text-stone-900">Groq AI:</strong> Processes AI requests. Your
                input text is sent to Groq&rsquo;s API for processing and is not stored by us. See{' '}
                <a href="https://groq.com/privacy" className="text-orange-500" target="_blank" rel="noopener noreferrer">
                  Groq Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-stone-900">Supabase:</strong> Database and authentication.
                Data stored in the United States.
              </li>
              <li>
                <strong className="text-stone-900">DodoPayments:</strong> Payment processing and
                subscription management. See{' '}
                <a href="https://dodopayments.com/privacy" className="text-orange-500" target="_blank" rel="noopener noreferrer">
                  DodoPayments Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-stone-900">Vercel:</strong> Website hosting and serverless
                functions. Infrastructure in the United States and globally.
              </li>
              <li>
                <strong className="text-stone-900">Google Analytics:</strong> Website traffic
                analytics. See{' '}
                <a href="https://policies.google.com/privacy" className="text-orange-500" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-stone-900">Google AdSense:</strong> Advertising network.
                See{' '}
                <a href="https://policies.google.com/privacy" className="text-orange-500" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
                .
              </li>
            </ul>

            <h2>8. Your Rights (GDPR / India DPDP Act)</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal
              data:
            </p>
            <ul>
              <li>
                <strong className="text-stone-900">Access:</strong> Request a copy of the personal
                data we hold about you
              </li>
              <li>
                <strong className="text-stone-900">Correction:</strong> Request correction of
                inaccurate personal data
              </li>
              <li>
                <strong className="text-stone-900">Deletion:</strong> Request deletion of your
                account and all associated personal data
              </li>
              <li>
                <strong className="text-stone-900">Portability:</strong> Request an export of your
                data in a machine-readable format
              </li>
              <li>
                <strong className="text-stone-900">Objection:</strong> Object to processing of your
                data for certain purposes
              </li>
              <li>
                <strong className="text-stone-900">Opt-out of ads:</strong> Opt out of personalized
                advertising as described in Section 4 above
              </li>
            </ul>
            <p>
              To exercise these rights, email{' '}
              <a href="mailto:privacy@formly.tools" className="text-orange-500">
                privacy@formly.tools
              </a>
              . We will respond within 30 days.
            </p>

            <h2>9. Children&rsquo;s Privacy</h2>
            <p>
              Formly is not directed at children under 13 years of age. We do not knowingly collect
              personal information from children. If you believe a child has provided us personal
              information, contact us and we will delete it promptly.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy occasionally. When we make material changes, we will
              update the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of
              formly.tools after changes constitutes acceptance of the revised policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights:
              <br />
              <strong className="text-stone-900">Email:</strong>{' '}
              <a href="mailto:privacy@formly.tools" className="text-orange-500">
                privacy@formly.tools
              </a>
              <br />
              <strong className="text-stone-900">General support:</strong>{' '}
              <a href="mailto:support@formly.tools" className="text-orange-500">
                support@formly.tools
              </a>
              <br />
              <strong className="text-stone-900">Operator:</strong> Formly, India
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
