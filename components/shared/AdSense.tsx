'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-7233937066598688';

// Real ad slot IDs from AdSense dashboard → Ad units → copy "data-ad-slot" value.
// Without these env vars manual ad units won't render — Auto Ads (from the script) still runs.
const BANNER_SLOT = process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT ?? '';
const SIDEBAR_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT ?? '';

const FREE_PLANS = new Set(['free', null, undefined]);

/** Returns true only for anonymous visitors and free-plan users. null while loading. */
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
      strategy="afterInteractive"
    />
  );
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
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
      // AdSense not loaded yet
    }
  }, [showAds, slot]);

  // No slot configured or paid user — render nothing (Auto Ads still runs via script)
  if (!showAds || !slot) return null;

  return (
    <div ref={adRef} className={`adsense-container ${className}`}>
      <div className="w-full">
        <p className="text-xs text-gray-600 text-center mb-1">Sponsored</p>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}

/** Banner ad — hidden for pro/unlimited/day_pass users */
export function BannerAd({ className }: { className?: string }) {
  return <AdUnit slot={BANNER_SLOT} format="horizontal" className={className} />;
}

/** Sidebar ad — hidden for pro/unlimited/day_pass users */
export function SidebarAd({ className }: { className?: string }) {
  return <AdUnit slot={SIDEBAR_SLOT} format="rectangle" className={className} />;
}