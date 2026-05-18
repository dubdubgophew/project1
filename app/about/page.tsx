import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Zap, Target, Heart, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Formly — Our Mission & Story',
  description: 'Formly is a free AI tools platform built in India. Our mission: give everyone access to powerful AI tools without expensive subscriptions.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">About Formly</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              We&apos;re making professional AI tools accessible to everyone — not just
              those who can afford $100/month subscriptions.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: Target,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
                title: 'Our Mission',
                text: 'Formly was built to democratize AI tools. The best writing assistants, grammar checkers, and AI utilities were locked behind expensive paywalls. We changed that — 10 professional-grade AI tools, free to try, forever.',
              },
              {
                icon: Zap,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                title: 'Why We Built This',
                text: "We were frustrated with tools that charge $30-100/month for basic AI features. Using Groq's blazing-fast AI infrastructure, we deliver premium quality at a fraction of the price — $9.99/month for Pro, or completely free for casual use.",
              },
              {
                icon: Heart,
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
                title: 'Built in India 🇮🇳',
                text: 'Formly is proudly built and operated from India. We understand the pain of USD pricing for Indian users — that\'s why we use DodoPayments which automatically shows your local currency at checkout — UPI, cards, net banking, and all major wallets supported. All taxes handled automatically.',
              },
              {
                icon: Shield,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                title: 'Privacy First',
                text: 'We do not store your content. Nothing you process through our AI tools is saved, used for training, or shared. Inputs are processed in real-time and discarded. We only store usage counts for rate limiting — nothing else.',
              },
            ].map((item) => (
              <div key={item.title} className="card flex gap-5">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/5 border border-violet-500/20 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Join 50,000+ Users</h2>
            <p className="text-gray-400 text-sm mb-4">Start using Formly free — no credit card required.</p>
            <a href="/tools" className="btn-primary inline-flex">Try All 10 Tools Free →</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
