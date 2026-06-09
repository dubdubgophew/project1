'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'formly-cookie-consent';

type ConsentValue = 'granted' | 'denied';

function applyConsent(value: ConsentValue) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

/**
 * GDPR/Consent Mode v2 cookie banner.
 * Defaults are set to 'denied' in GoogleAnalytics before gtag config loads;
 * this banner updates consent on user choice and remembers it.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'granted' || stored === 'denied') {
      applyConsent(stored);
    } else {
      setVisible(true);
    }
  }, []);

  function choose(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, value);
    applyConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-5"
    >
      <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-2xl shadow-2xl p-5 sm:flex sm:items-center sm:gap-5">
        <p className="text-sm text-stone-600 leading-relaxed flex-1">
          <span className="font-semibold text-stone-900">🍪 We value your privacy.</span>{' '}
          We use cookies for analytics and to show personalized ads that keep our 50 tools free.
          You can accept or decline — the tools work either way. See our{' '}
          <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 mt-4 sm:mt-0 shrink-0">
          <button
            onClick={() => choose('denied')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose('granted')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
