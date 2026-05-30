import { Upload, Cpu, Download } from 'lucide-react';

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use Formly AI Tools',
  description: "Get professional results from any of Formly's 37 free AI tools in three steps",
  totalTime: 'PT2M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a tool', text: 'Select from 37 free AI tools — pay stub generator, resume builder, grammar checker, paraphraser, PDF summarizer, and more.' },
    { '@type': 'HowToStep', position: 2, name: 'Enter your information', text: 'Fill in the relevant fields or paste your text. No account required for the first 5–10 uses per day.' },
    { '@type': 'HowToStep', position: 3, name: 'Get your result instantly', text: 'Receive AI-generated output in seconds. Download as PDF, copy to clipboard, or continue editing.' },
  ],
};

const STEPS = [
  {
    icon: Upload,
    title: 'Paste or Upload',
    description: 'Enter your text, upload a PDF, fill in a simple form — takes 10 seconds to get started.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    step: '01',
  },
  {
    icon: Cpu,
    title: 'AI Processes Instantly',
    description: 'Groq AI analyzes your input and generates high-quality output in under 10 seconds.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    step: '02',
  },
  {
    icon: Download,
    title: 'Copy, Download & Use',
    description: 'Get professional-quality output. Copy with one click or download as a file. Use immediately.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    step: '03',
  },
];

export function HowItWorks() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              From Input to Output in Under 30 Seconds
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              No complex setup. No learning curve. Just paste and get results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-stone-200 to-stone-100 z-0" />
                )}

                <div className="relative z-10 bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-md transition-all duration-200 text-center group">
                  <div className="flex items-center justify-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <step.icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                  </div>

                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Step {step.step}</div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-3">{step.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '< 10s', label: 'Average processing time' },
              { value: '5M+', label: 'AI requests processed' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '0', label: 'Data stored (privacy-first)' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-stone-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
