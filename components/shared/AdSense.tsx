'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
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

/**
 * AdSense ad unit — integrated naturally in content, NOT spam-style.
 * Wrapped in a "Sponsored" label for transparency.
 */
export function AdUnit({ slot, format = 'auto', responsive = true, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  if (!ADSENSE_CLIENT) return null;

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

/** Banner ad — shown between tool sections */
export function BannerAd({ className }: { className?: string }) {
  return (
    <AdUnit
      slot="1234567890"
      format="horizontal"
      className={className}
    />
  );
}

/** Sidebar ad */
export function SidebarAd({ className }: { className?: string }) {
  return (
    <AdUnit
      slot="0987654321"
      format="rectangle"
      className={className}
    />
  );
}
