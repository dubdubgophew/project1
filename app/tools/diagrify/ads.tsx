'use client';

export function DiagrifySidebarAd() {
  return (
    <div className="mx-3 my-2 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden" style={{ minHeight: 90 }}>
      {/* Google AdSense — replace data-ad-slot with your slot ID */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 90 }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
      <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
  );
}

export function DiagrifBottomAd() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80">
      {/* Ezoic — placeholder, configure slot in Ezoic dashboard */}
      {/* <div id="ezoic-pub-ad-placeholder-XXX" /> */}
    </div>
  );
}
