'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Mail, MessageSquare, Clock, Check, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In production, send to Resend API
    await new Promise((r) => setTimeout(r, 1200)); // Simulate send
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h1 className="text-4xl font-bold text-stone-900 mb-4">Contact Us</h1>
              <p className="text-gray-400 mb-8">
                Have a question, issue, or just want to say hi? We&apos;re based in India and typically respond within 24-48 hours.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Mail, title: 'Email', value: 'support@formly.tools', link: 'mailto:support@formly.tools', color: 'text-orange-500', bg: 'bg-violet-500/10' },
                  { icon: MessageSquare, title: 'General', value: 'hello@formly.tools', link: 'mailto:hello@formly.tools', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: Clock, title: 'Response Time', value: '24-48 hours', link: null, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-900 border border-stone-200">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{item.title}</p>
                      {item.link ? (
                        <a href={item.link} className="text-stone-700 hover:text-white transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-stone-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mb-2">Message Sent!</h2>
                  <p className="text-gray-400 text-sm">We&apos;ll get back to you within 24-48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold text-stone-900 mb-5">Send a Message</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" required />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input" required>
                      <option value="">Select a topic…</option>
                      <option>Technical Issue</option>
                      <option>Billing / Subscription</option>
                      <option>Feature Request</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or question…" className="textarea" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
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
