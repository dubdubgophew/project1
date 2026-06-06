'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Mail, MessageSquare, Clock, Check, Loader2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to send message');
      }

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please email us directly at support@formly.tools');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left column — contact info */}
            <div>
              <h1 className="text-4xl font-bold text-stone-900 mb-4">Contact Us</h1>
              <p className="text-stone-600 mb-8">
                Have a question, bug report, or want to partner? We&apos;re a small team based in India and typically respond within 24–48 hours.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Mail, title: 'Support', value: 'support@formly.tools', link: 'mailto:support@formly.tools', color: 'text-orange-500', bg: 'bg-orange-50 border border-orange-200' },
                  { icon: MessageSquare, title: 'General Enquiries', value: 'hello@formly.tools', link: 'mailto:hello@formly.tools', color: 'text-blue-500', bg: 'bg-blue-50 border border-blue-200' },
                  { icon: Clock, title: 'Response Time', value: '24–48 hours', link: null, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200' },
                ].map((item) => (
                  <div key={item.title} className={`flex items-center gap-4 p-4 rounded-2xl ${item.bg} bg-white`}>
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-0.5">{item.title}</p>
                      {item.link ? (
                        <a href={item.link} className="text-stone-700 hover:text-orange-600 transition-colors font-medium">{item.value}</a>
                      ) : (
                        <p className="text-stone-700 font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium mb-1">Common Questions</p>
                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                  <li>Billing issues → include your order email</li>
                  <li>Tool bug → describe the input and what went wrong</li>
                  <li>Feature requests → we read every one</li>
                  <li>Press / partnerships → hello@formly.tools</li>
                </ul>
              </div>
            </div>

            {/* Right column — form */}
            <div className="card bg-white">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mb-2">Message Sent!</h2>
                  <p className="text-stone-600 text-sm">We&apos;ll get back to you within 24–48 hours. Check your inbox for a confirmation email.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
                  <h2 className="text-lg font-semibold text-stone-900 mb-5">Send a Message</h2>

                  {error && (
                    <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="label">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="input"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="label">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="label">Subject</label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input"
                      required
                      aria-required="true"
                    >
                      <option value="">Select a topic…</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Billing / Subscription">Billing / Subscription</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Press Enquiry">Press Enquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="label">Message</label>
                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail…"
                      className="textarea"
                      rows={5}
                      required
                      aria-required="true"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>

                  <p className="text-xs text-stone-500 text-center">
                    By submitting, you agree to our{' '}
                    <a href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
