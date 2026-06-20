/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'sharp'],
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // News RSS feed image sources
      { protocol: 'https', hostname: '**.bbci.co.uk' },
      { protocol: 'https', hostname: '**.bbc.co.uk' },
      { protocol: 'https', hostname: '**.npr.org' },
      { protocol: 'https', hostname: '**.abc.net.au' },
      { protocol: 'https', hostname: '**.cbc.ca' },
      { protocol: 'https', hostname: '**.thejakartapost.com' },
      { protocol: 'https', hostname: '**.japantimes.co.jp' },
      { protocol: 'https', hostname: '**.france24.com' },
      { protocol: 'https', hostname: '**.dw.com' },
      { protocol: 'https', hostname: '**.reuters.com' },
      { protocol: 'https', hostname: '**.indiatimes.com' },
      { protocol: 'https', hostname: '**.timesofindia.com' },
      { protocol: 'https', hostname: '**.ndtv.com' },
      { protocol: 'https', hostname: '**.thehindu.com' },
      { protocol: 'https', hostname: '**.jagran.com' },
      { protocol: 'https', hostname: '**.amarujala.com' },
      { protocol: 'https', hostname: '**.dinamalar.com' },
      { protocol: 'https', hostname: '**.spiegel.de' },
      { protocol: 'https', hostname: '**.lemonde.fr' },
      { protocol: 'https', hostname: '**.nhk.or.jp' },
      { protocol: 'https', hostname: '**.kompas.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://adservice.google.com https://ep1.adtrafficquality.google https://fundingchoicesmessages.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com https://*.googlesyndication.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://*.bbci.co.uk https://*.bbc.co.uk https://*.npr.org https://*.abc.net.au https://*.cbc.ca https://*.thejakartapost.com https://*.japantimes.co.jp https://*.france24.com https://*.dw.com https://*.reuters.com https://*.indiatimes.com https://*.timesofindia.com https://*.ndtv.com https://*.thehindu.com https://*.jagran.com https://*.amarujala.com https://*.dinamalar.com https://*.spiegel.de https://*.lemonde.fr https://*.nhk.or.jp https://*.kompas.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.dodopayments.com https://test.dodopayments.com https://live.dodopayments.com https://pagead2.googlesyndication.com https://*.google-analytics.com https://adservice.google.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://fundingchoicesmessages.google.com",
              "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://*.googlesyndication.com https://fundingchoicesmessages.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Long-lived immutable cache for Next.js static assets (Vercel adds this too, belt-and-suspenders)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },

      // ── Removed / renamed tools → nearest current equivalent ─────────────
      { source: '/tools/aetherboard',                 destination: '/tools/diagrify',              permanent: true },
      { source: '/tools/salary-calculator',           destination: '/tools/hand-salary-calculator', permanent: true },
      { source: '/tools/agreement-generator',         destination: '/tools/contract-generator',    permanent: true },
      { source: '/tools/summarizer',                  destination: '/tools/pdf-summarizer',        permanent: true },
      { source: '/tools/e-signature-verification',    destination: '/tools/digital-signature',     permanent: true },
      { source: '/tools/image-compressor',            destination: '/tools/compress-image',        permanent: true },
      { source: '/tools/tax-deduction-calculator',    destination: '/tools/income-tax-calculator', permanent: true },
      { source: '/tools/paraphrasing-tool',           destination: '/tools/paraphraser',           permanent: true },
      { source: '/tools/article-rewriter',            destination: '/tools/paraphraser',           permanent: true },
      { source: '/tools/invoice-generator',           destination: '/tools/contract-generator',    permanent: true },
      { source: '/tools/article-summarizer',          destination: '/tools/pdf-summarizer',        permanent: true },
      { source: '/tools/text-summarizer',             destination: '/tools/pdf-summarizer',        permanent: true },
      { source: '/tools/uk-vat-calculator',           destination: '/tools/gst-calculator',        permanent: true },
      { source: '/tools/data-encryption',             destination: '/tools',                       permanent: true },
      { source: '/tools/international-tax-comparator',destination: '/tools',                       permanent: true },
      { source: '/tools/text-generator',              destination: '/tools',                       permanent: true },
      { source: '/tools/language-translator',         destination: '/tools',                       permanent: true },

      // ── News deep-link path format → section (content expires; path format deprecated) ─
      { source: '/news/:id',    destination: '/news',    permanent: true },
      { source: '/ai-news/:id', destination: '/ai-news', permanent: true },

      // ── Stale blog slugs (deleted/renamed posts) → nearest current content ─
      { source: '/blog/explain-code-in-plain-english-for-free-using-ai-2026', destination: '/blog/teach-code',          permanent: true },
      { source: '/blog/explain-code-to-beginners-with-ai',                    destination: '/blog/teach-code',          permanent: true },
      { source: '/blog/use-paraphrase-tool-for-academic-writing',             destination: '/tools/paraphraser',        permanent: true },
      { source: '/blog/generate-instagram-hashtags-free-with-ai',            destination: '/blog/hashtag-generator',   permanent: true },
      { source: '/blog/free-mental-health-app-india',                         destination: '/tools/vibe-check',         permanent: true },
      { source: '/blog/free-mood-tracker-no-signup',                          destination: '/tools/vibe-check',         permanent: true },
      { source: '/blog/use-groq-llama-ai-tools-free',                        destination: '/tools',                    permanent: true },
    ];
  },
};

export default nextConfig;
