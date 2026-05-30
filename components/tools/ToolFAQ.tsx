interface FAQ { q: string; a: string }

export function ToolFAQ({ faqs, heading = 'Frequently Asked Questions' }: { faqs: FAQ[]; heading?: string }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{heading}</h2>
      <div className="space-y-2">
        {faqs.map(({ q, a }, i) => (
          <details key={i} className="group rounded-xl border border-stone-200 bg-white overflow-hidden">
            <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-stone-50 transition-colors">
              <span className="text-sm font-medium text-stone-800">{q}</span>
              <span className="text-stone-400 group-open:rotate-180 transition-transform shrink-0 text-lg leading-none">
                ›
              </span>
            </summary>
            <div className="px-5 pb-4 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
              {a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
