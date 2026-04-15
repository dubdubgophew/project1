import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { SidebarAd } from '@/components/shared/AdSense';
import Link from 'next/link';
import { ArrowLeft, Lock, Zap } from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  children: React.ReactNode;
  relatedTools?: { name: string; href: string; icon: string }[];
}

export function ToolLayout({
  title,
  description,
  icon,
  badge,
  children,
  relatedTools = [],
}: ToolLayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 pt-16">
        {/* Tool header */}
        <div className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              All Tools
            </Link>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  {badge && (
                    <span className="badge-free text-xs">{badge}</span>
                  )}
                  <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                    Free to Use
                  </span>
                </div>
                <p className="text-gray-400 mt-1 text-sm max-w-2xl">{description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Main tool area */}
            <div className="space-y-6">
              {children}

              {/* Free tier notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="text-amber-300 font-medium">Free tier: </span>
                  <span className="text-gray-400">5 uses/day without signup · </span>
                  <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Sign up free
                  </Link>
                  <span className="text-gray-400"> for 10/day · </span>
                  <Link href="/pricing" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Go Pro
                  </Link>
                  <span className="text-gray-400"> for 200+/day</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Upgrade CTA */}
              <div className="card bg-gradient-to-br from-violet-600/10 to-purple-600/5 border-violet-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-white">Upgrade to Pro</h3>
                </div>
                <ul className="text-sm text-gray-400 space-y-1.5 mb-4">
                  <li>✓ 200 uses per day</li>
                  <li>✓ Longer text inputs</li>
                  <li>✓ Priority processing</li>
                  <li>✓ PDF downloads</li>
                </ul>
                <Link href="/pricing" className="btn-primary w-full justify-center text-sm py-2.5">
                  Start Pro — $9/month
                </Link>
              </div>

              {/* AdSense — sidebar */}
              <SidebarAd />

              {/* Related tools */}
              {relatedTools.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-4">Related Tools</h3>
                  <div className="space-y-2">
                    {relatedTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800 transition-colors group"
                      >
                        <span className="text-lg">{tool.icon}</span>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {tool.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
