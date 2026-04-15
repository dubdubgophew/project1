import { Upload, Cpu, Download } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    title: 'Paste or Upload',
    description: 'Enter your text, upload a PDF, paste a YouTube URL, or fill in a simple form — takes 10 seconds.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    step: '01',
  },
  {
    icon: Cpu,
    title: 'AI Processes Instantly',
    description: "Our LLaMA 3 70B AI analyzes your input and generates high-quality output in under 10 seconds.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    step: '02',
  },
  {
    icon: Download,
    title: 'Copy, Download & Use',
    description: 'Get professional-quality output. Copy with one click or download as a file. Use immediately.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    step: '03',
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-gray-950">
      <div className="container-wide">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From Input to Output in Under 30 Seconds
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            No complex setup. No learning curve. Just paste and get results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-gray-700 to-gray-800 z-0" />
              )}

              <div className="relative z-10 card-hover group text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-7 h-7 ${step.color}`} />
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Step {step.step}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
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
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
              <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
