'use client';

import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Consent Mode v2 — default denied until the user accepts via the cookie banner
          var storedConsent = 'denied';
          try { storedConsent = localStorage.getItem('formly-cookie-consent') === 'granted' ? 'granted' : 'denied'; } catch (e) {}
          gtag('consent', 'default', {
            ad_storage: storedConsent,
            ad_user_data: storedConsent,
            ad_personalization: storedConsent,
            analytics_storage: storedConsent,
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

export function trackEvent(
  action: string,
  category: string,
  label: string,
  value?: number
) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
