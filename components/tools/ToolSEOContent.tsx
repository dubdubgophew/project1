import { getToolSEOData } from '@/lib/tool-seo-data';
import Link from 'next/link';

interface Props {
  toolSlug: string;
}

export function ToolSEOContent({ toolSlug }: Props) {
  const data = getToolSEOData(toolSlug);
  if (!data) return null;

  return (
    <section className="mt-10 pt-8 border-t border-stone-200 space-y-8" aria-label={`About ${data.name}`}>

      {/* What is it */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-3">What Is {data.name}?</h2>
        <p className="text-sm text-stone-600 leading-relaxed">{data.what}</p>
      </div>

      {/* Why choose Formly */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-3">Why Formly&apos;s {data.name} Is the Best Free Option</h2>
        <ul className="space-y-2">
          {data.why.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
              <span className="text-emerald-500 shrink-0 mt-0.5 font-bold">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Free alternative to */}
      {data.altTo.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-stone-900 mb-3">
            Free Alternative to {data.altTo.map(a => a.name).join(', ')}
          </h2>
          <div className="space-y-2">
            {data.altTo.map((alt, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                <span className="text-orange-400 shrink-0 mt-0.5">→</span>
                <span><strong className="text-stone-700">{alt.name}:</strong> {alt.why}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Who uses it */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-3">Who Uses {data.name}?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.usedBy.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-200">
              <p className="text-sm font-medium text-stone-900 mb-1">{item.who}</p>
              <p className="text-xs text-stone-500 leading-relaxed">{item.how}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Extra keywords paragraph (hidden to users but visible to crawlers) */}
      {data.extra && (
        <p className="text-xs text-stone-400 leading-relaxed">{data.extra}</p>
      )}

      {/* Internal link to blog guide */}
      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-4">
        <p className="text-sm text-stone-700">
          <span className="font-medium">Looking for a detailed guide?</span>{' '}
          Read our in-depth tutorial on using {data.name} for professional results.
        </p>
        <Link
          href="/blog"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap transition-colors"
        >
          Read Guide →
        </Link>
      </div>

    </section>
  );
}
