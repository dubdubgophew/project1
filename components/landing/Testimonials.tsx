import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah K.',
    role: 'Freelance Writer',
    country: '🇺🇸 USA',
    avatar: 'SK',
    rating: 5,
    text: "I use Toolora's paraphraser and grammar checker daily. The AI output quality is incredible — honestly better than Grammarly Pro, and I'm on the free plan!",
    tool: 'Paraphraser + Grammar Checker',
  },
  {
    name: 'Rahul M.',
    role: 'Software Engineer',
    country: '🇮🇳 India',
    avatar: 'RM',
    rating: 5,
    text: 'The Code Explainer saved me hours of documentation reading. I paste in complex code and get a clear explanation in seconds. Pro plan at ₹699/month is a steal.',
    tool: 'Code Explainer',
  },
  {
    name: 'Emma L.',
    role: 'Marketing Manager',
    country: '🇬🇧 UK',
    avatar: 'EL',
    rating: 5,
    text: "The PDF Summarizer is my go-to for research. I upload lengthy reports and get crisp summaries with key insights. Saves me 2+ hours every day.",
    tool: 'PDF Summarizer',
  },
  {
    name: 'Carlos D.',
    role: 'Startup Founder',
    country: '🇧🇷 Brazil',
    avatar: 'CD',
    rating: 5,
    text: 'Generated our NDA and freelance contracts using the Contract Generator. Saved $2,000 in legal fees. Now all my emails go through the Email Writer too!',
    tool: 'Contract Generator + Email Writer',
  },
  {
    name: 'Priya S.',
    role: 'Content Creator',
    country: '🇮🇳 India',
    avatar: 'PS',
    rating: 5,
    text: "The Hashtag Generator understands context perfectly. My Instagram reach tripled after I started using it. The YouTube Summarizer is great for research too.",
    tool: 'Hashtag Generator + YouTube Summarizer',
  },
  {
    name: 'Thomas W.',
    role: 'Job Seeker',
    country: '🇩🇪 Germany',
    avatar: 'TW',
    rating: 5,
    text: 'Used the Resume Builder and Bio Writer to update all my professional profiles. Got 3 interview calls in the first week. Worth every cent of the Pro plan.',
    tool: 'Resume Builder + Bio Writer',
  },
];

export function Testimonials() {
  return (
    <section className="section bg-gray-950" id="reviews">
      <div className="container-wide">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Loved by 50,000+ Professionals
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From freelancers to Fortune 500 teams — here&apos;s what they say.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card-hover relative group">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-violet-500/20 group-hover:text-violet-500/30 transition-colors" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} · {t.country}</div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">{t.text}</p>

              <div className="text-xs text-violet-400 font-medium bg-violet-500/10 px-3 py-1.5 rounded-lg inline-block">
                Used: {t.tool}
              </div>
            </div>
          ))}
        </div>

        {/* Review schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'Toolora AI Tools Suite',
              description: 'Free AI-powered productivity tools',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '50000',
                bestRating: '5',
              },
            }),
          }}
        />
      </div>
    </section>
  );
}
