'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-7233937066598688';

// Slot IDs from AdSense dashboard — override via env vars if needed.
// Manual ad units won't render without a slot; Auto Ads (via script) still runs regardless.
const BANNER_SLOT  = process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT  ?? '3033779481'; // horizontalformlyad
const SIDEBAR_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT ?? '6973024493'; // verticalformly1
const IN_ARTICLE_1 = '6206737734'; // autorelaxed
const IN_ARTICLE_2 = '2267492727'; // autorelaxed

const FREE_PLANS = new Set(['free', null, undefined]);

/** Returns true for anonymous + free users, false for paid, null while loading. */
function useShowAds(): boolean | null {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setShow(true); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      setShow(FREE_PLANS.has(profile?.plan ?? null));
    });
  }, []);

  return show;
}

export function AdSenseScript() {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'autorelaxed';
  responsive?: boolean;
  className?: string;
}

export function AdUnit({ slot, format = 'auto', responsive = true, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const showAds = useShowAds();

  useEffect(() => {
    if (!ADSENSE_CLIENT || !showAds || !slot) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not ready yet
    }
  }, [showAds, slot]);

  // No slot configured or paid user — render nothing (Auto Ads still runs via script)
  if (!showAds || !slot) return null;

  return (
    <div ref={adRef} className={`adsense-container ${className}`}>
      <div className="w-full">
        <p className="text-xs text-gray-500 text-center mb-1">Sponsored</p>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          {...(format !== 'autorelaxed' && responsive ? { 'data-full-width-responsive': 'true' } : {})}
        />
      </div>
    </div>
  );
}

/** Horizontal banner — hidden for paid users */
export function BannerAd({ className }: { className?: string }) {
  return <AdUnit slot={BANNER_SLOT} format="horizontal" className={className} />;
}

/** Vertical sidebar rectangle — hidden for paid users */
export function SidebarAd({ className }: { className?: string }) {
  return <AdUnit slot={SIDEBAR_SLOT} format="rectangle" className={className} />;
}

/** In-article relaxed ad — hidden for paid users. variant=1 or 2 to alternate slots. */
export function InArticleAd({ variant = 1, className }: { variant?: 1 | 2; className?: string }) {
  return (
    <AdUnit
      slot={variant === 1 ? IN_ARTICLE_1 : IN_ARTICLE_2}
      format="autorelaxed"
      className={className}
    />
  );
}