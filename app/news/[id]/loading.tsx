import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function ArticleLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 animate-pulse">
          {/* Back link skeleton */}
          <div className="h-4 w-24 bg-stone-200 rounded mb-6" />

          {/* Category bar */}
          <div className="h-1.5 w-full bg-stone-200 rounded-full mb-5" />

          {/* Meta row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-20 bg-stone-200 rounded-full" />
            <div className="h-4 w-16 bg-stone-200 rounded" />
            <div className="h-4 w-12 bg-stone-200 rounded" />
          </div>

          {/* Headline */}
          <div className="space-y-2 mb-5">
            <div className="h-8 w-full bg-stone-200 rounded" />
            <div className="h-8 w-4/5 bg-stone-200 rounded" />
          </div>

          {/* Hero image placeholder */}
          <div className="w-full aspect-video bg-stone-200 rounded-2xl mb-6" />

          {/* Analysis box */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-5">
            <div className="h-3 w-20 bg-stone-200 rounded mb-3" />
            <div className="space-y-2">
              {[100, 97, 95, 92, 88, 85, 80, 75].map(w => (
                <div key={w} className="h-4 bg-stone-200 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>

          {/* Deep Analysis sections */}
          <div className="mb-5">
            <div className="h-3 w-24 bg-stone-200 rounded mb-3" />
            <div className="space-y-2.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="border border-stone-200 rounded-xl p-4 bg-white">
                  <div className="h-2.5 w-24 bg-stone-200 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-stone-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Source box */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 bg-stone-200 rounded" />
              <div className="h-4 w-32 bg-stone-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-stone-200 rounded" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
