import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd, InArticleAd } from '@/components/shared/AdSense';
import { ToolFAQ } from '@/components/tools/ToolFAQ';
import Link from 'next/link';
import { ArrowLeft, Lock, Zap, Infinity } from 'lucide-react';

interface FAQ { q: string; a: string }

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  children: React.ReactNode;
  relatedTools?: { name: string; href: string; icon: string }[];
  showAds?: boolean;
  /** true = paystub-style per-plan daily limits; false (default) = free & unlimited */
  rateLimited?: boolean;
  /** Visible FAQ accordion rendered below the tool for SEO indexability */
  faqs?: FAQ[];
}

export function ToolLayout({
  title,
  description,
  icon,
  badge,
  children,
  relatedTools = [],
  showAds = true,
  rateLimited = false,
  faqs,
}: ToolLayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9F7F4] pt-[76px]">
        {/* Tool header */}
        <div className="border-b border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              All Tools
            </Link>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
                  {badge && (
                    <span className="badge-free text-xs">{badge}</span>
                  )}
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                    Free to Use
                  </span>
                </div>
                <p className="text-stone-500 mt-1 text-sm max-w-2xl">{description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Main tool area */}
            <div className="space-y-6">
              {children}

              {/* In-article ad between tool output and FAQs */}
              {showAds !== false && <InArticleAd className="my-2" />}

              {faqs && faqs.length > 0 && <ToolFAQ faqs={faqs} />}

              {/* Usage notice */}
              {rateLimited ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="text-amber-700 font-medium">Daily limits: </span>
                    <span className="text-stone-500">5/day without account · </span>
                    <Link href="/signup" className="text-orange-500 hover:text-orange-600 transition-colors">
                      Free account
                    </Link>
                    <span className="text-stone-500"> = 10/day · </span>
                    <Link href="/pricing" className="text-orange-500 hover:text-orange-600 transition-colors">
                      Pro
                    </Link>
                    <span className="text-stone-500"> = 200/day · </span>
                    <Link href="/pricing" className="text-orange-500 hover:text-orange-600 transition-colors">
                      Unlimited
                    </Link>
                    <span className="text-stone-500"> = no cap</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Infinity className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="text-emerald-700 font-medium">Free & unlimited — </span>
                    <span className="text-stone-500">no account needed. </span>
                    <Link href="/signup" className="text-orange-500 hover:text-orange-600 transition-colors">
                      Sign up
                    </Link>
                    <span className="text-stone-500"> to save history · </span>
                    <Link href="/pricing" className="text-orange-500 hover:text-orange-600 transition-colors">
                      Go Pro
                    </Link>
                    <span className="text-stone-500"> for advanced features</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Upgrade CTA */}
              <div className="card bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-semibold text-stone-900">Upgrade to Pro</h3>
                </div>
                <ul className="text-sm text-stone-600 space-y-1.5 mb-4">
                  <li>✓ 200 requests/day</li>
                  <li>✓ Priority AI processing</li>
                  <li>✓ Usage history & analytics</li>
                  <li>✓ Early access to new tools</li>
                </ul>
                <Link href="/pricing" className="btn-primary w-full justify-center text-sm py-2.5">
                  Start Pro — $9.99/month
                </Link>
              </div>

              {showAds !== false && <SidebarAd />}

              {/* Related tools */}
              {relatedTools.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-stone-900 mb-4">Related Tools</h3>
                  <div className="space-y-2">
                    {relatedTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors group"
                      >
                        <span className="text-lg">{tool.icon}</span>
                        <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
                          {tool.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Second sidebar ad below related tools */}
              {showAds !== false && relatedTools.length > 0 && <SidebarAd />}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}