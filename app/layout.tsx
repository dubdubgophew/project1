import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@/components/shared/GoogleAnalytics';
import { AdSenseScript } from '@/components/shared/AdSense';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800'], // dropped 300 (light) — unused
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false, // only used in code-display pages, defer
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: false, // only used in Hero headline, defer
  weight: '400',
  style: 'normal', // dropped italic — only normal weight used in Hero
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools'),
  title: {
    default: 'Formly Tools — 42 Free AI Tools Online | No Signup Required',
    template: '%s | Formly Tools',
  },
  description:
    'Free AI tools online — pay stub generator, resume builder, grammar checker, paraphraser, contract generator, PDF summarizer, diagrams & 30 more. No signup. No credit card. Used by 50,000+ professionals.',
  keywords: [
    'free ai tools online',
    'free tools no signup',
    'pay stub generator free',
    'paystub maker online',
    'ai paraphraser free',
    'grammar checker free online',
    'ai resume builder free',
    'free contract generator',
    'pdf summarizer ai free',
    'ai email writer free',
    'cover letter generator free',
    'qr code generator free',
    'ai code reviewer',
    'free diagram generator',
    'digital signature online free',
    'free password generator',
    'free ai writing tools',
    'developer tools online free',
    'formly tools',
    'ai tools no signup',
    'free paystub creator 2026',
    'loan emi calculator',
    'income tax calculator india',
    'gst calculator free',
    'sip calculator india',
  ],
  authors: [{ name: 'Formly Tools', url: 'https://formly.tools' }],
  creator: 'Formly Tools',
  publisher: 'Formly Tools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://formly.tools',
    siteName: 'Formly Tools',
    title: 'Formly Tools — 42 Free AI Tools Online | No Signup',
    description:
      'Free AI tools: pay stub generator, resume builder, grammar checker, paraphraser, contract generator, PDF summarizer, AI diagrams & 30 more. No signup required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Formly Tools — 42 Free AI Tools Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formly Tools — 42 Free AI Tools Online',
    description: 'Free AI tools: pay stubs, resume builder, grammar checker, diagrams, contracts & 32 more. No signup required.',
    images: ['/og-image.png'],
    creator: '@formlytools',
    site: '@formlytools',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  // Verification tags (add actual values when available)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? '',
  },
};

export const viewport: Viewport = {
  themeColor: '#F9F7F4',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7233937066598688" />
        <AdSenseScript />
        <meta name="monetag" content="701dad6c34191d949e21404ca1901f4f" />
        {/* hreflang — geo targeting for English-speaking markets */}
        <link rel="alternate" hrefLang="en" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-US" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-GB" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-IN" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-AU" href="https://formly.tools" />
        <link rel="alternate" hrefLang="en-CA" href="https://formly.tools" />
        <link rel="alternate" hrefLang="x-default" href="https://formly.tools" />

        {/* Schema: WebSite + SiteLinksSearchBox — helps Google show search box in results */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Formly Tools',
          alternateName: ['Formly', 'formly.tools'],
          url: 'https://formly.tools',
          description: 'Formly Tools provides 37 free AI-powered tools for professionals worldwide — pay stub generator, resume builder, grammar checker, AI paraphraser, contract generator, PDF summarizer, diagram maker, and more. No signup required. Used by 50,000+ professionals in the USA, UK, India, Australia, and Canada.',
          inLanguage: ['en-US', 'en-GB', 'en-IN', 'en-AU', 'en-CA'],
          dateModified: '2026-05-31',
          publisher: { '@type': 'Organization', name: 'Formly Tools', url: 'https://formly.tools' },
          audience: {
            '@type': 'Audience',
            audienceType: 'Professionals, Freelancers, Students, Small Business Owners',
            geographicArea: { '@type': 'AdministrativeArea', name: 'Worldwide — USA, United Kingdom, India, Australia, Canada, New Zealand, Singapore, Ireland' },
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://formly.tools/tools?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        }) }} />

        {/* Schema: Organization — full entity graph for AI engines and Knowledge Panel */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Formly Tools',
          alternateName: 'Formly',
          url: 'https://formly.tools',
          logo: { '@type': 'ImageObject', url: 'https://formly.tools/favicon.svg', width: 512, height: 512 },
          description: 'Formly Tools is a free AI tools platform used by 50,000+ professionals. It offers 37 free tools including a pay stub generator, AI resume builder, grammar checker, paraphraser, contract generator, PDF summarizer, AI diagram generator (Diagrify), QR code generator, digital signature, income tax calculators for India, and developer utilities — all free with no signup required.',
          foundingDate: '2024',
          sameAs: ['https://twitter.com/formlytools'],
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://formly.tools/contact', availableLanguage: 'English' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Free AI Tools — No Signup Required',
            numberOfItems: 42,
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Free Pay Stub Generator', description: 'Generate pay stubs for USA, UK, Canada, India, Australia. 2026 tax tables.', url: 'https://formly.tools/tools/paystub-generator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI Resume Builder', description: 'Build ATS-optimized resumes with AI. Free, no signup.', url: 'https://formly.tools/tools/resume-builder' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Free Contract Generator', description: 'Generate freelance contracts, NDAs, service agreements instantly.', url: 'https://formly.tools/tools/contract-generator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Terms of Service Simplifier', description: 'Paste any Terms of Service and get a plain-English summary.', url: 'https://formly.tools/tools/terms-simplifier' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI PDF Summarizer', description: 'Upload any PDF and get a bullet-point summary with key insights.', url: 'https://formly.tools/tools/pdf-summarizer' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI Paraphraser', description: 'Rewrite text in 5 styles: Standard, Formal, Creative, Academic, Simple.', url: 'https://formly.tools/tools/paraphraser' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Free Grammar Checker', description: 'Fix grammar, spelling, and style errors instantly with AI explanations.', url: 'https://formly.tools/tools/grammar-checker' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI Email Writer', description: 'Generate professional emails in seconds. Formal, casual, or persuasive.', url: 'https://formly.tools/tools/email-writer' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Hashtag Generator', description: 'Generate viral hashtags for Instagram, Twitter, LinkedIn, TikTok.', url: 'https://formly.tools/tools/hashtag-generator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI Bio Writer', description: 'Create professional bios for LinkedIn, Twitter, Instagram, websites.', url: 'https://formly.tools/tools/bio-writer' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Cover Letter Generator', description: 'Generate tailored cover letters matching job descriptions.', url: 'https://formly.tools/tools/cover-letter' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'PDF to Markdown Converter', description: 'Convert PDFs to clean Markdown format preserving structure.', url: 'https://formly.tools/tools/pdf-to-markdown' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Code Explainer', description: 'Explain any code in plain English. Supports 20+ languages.', url: 'https://formly.tools/tools/code-explainer' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'AI Code Reviewer', description: 'Instant AI code review — issues, quality score, performance tips.', url: 'https://formly.tools/tools/code-reviewer' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'JSON Formatter', description: 'Format, minify, and validate JSON instantly.', url: 'https://formly.tools/tools/json-formatter' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Base64 Encoder Decoder', description: 'Encode and decode Base64 strings and files instantly.', url: 'https://formly.tools/tools/base64' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Color Converter', description: 'Convert colors between HEX, RGB, HSL, HSV, CMYK formats.', url: 'https://formly.tools/tools/color-converter' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Regex Tester', description: 'Test regular expressions live with match highlighting.', url: 'https://formly.tools/tools/regex-tester' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Diff Checker', description: 'Compare two texts side by side with color-coded changes.', url: 'https://formly.tools/tools/diff-checker' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Expense Splitter', description: 'Split group expenses fairly with debt settlement calculation.', url: 'https://formly.tools/tools/expense-splitter' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Loan EMI Calculator', description: 'Calculate monthly EMI, total interest, and amortization schedule.', url: 'https://formly.tools/tools/loan-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Free Password Generator', description: 'Generate cryptographically secure passwords with strength analysis.', url: 'https://formly.tools/tools/password-generator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Word Counter', description: 'Count words, characters, sentences in real time with reading time.', url: 'https://formly.tools/tools/word-counter' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Unit Converter', description: 'Convert length, weight, temperature, area, volume, speed, and more.', url: 'https://formly.tools/tools/unit-converter' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Age Calculator', description: 'Calculate exact age, next birthday countdown, zodiac sign.', url: 'https://formly.tools/tools/age-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Text Case Converter', description: 'Convert text to UPPERCASE, lowercase, camelCase, snake_case and more.', url: 'https://formly.tools/tools/text-case' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'QR Code Generator', description: 'Generate artistic QR codes with custom colors and logos.', url: 'https://formly.tools/tools/qr-code' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Free Digital Signature', description: 'Create e-signatures by drawing, typing, or uploading.', url: 'https://formly.tools/tools/digital-signature' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Diagrify — AI Diagram Maker', description: 'Free AI whiteboard and diagram generator. Type description, get flowchart.', url: 'https://formly.tools/tools/diagrify' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Hand Salary Calculator India', description: 'Calculate take-home salary in India after PF, professional tax, income tax.', url: 'https://formly.tools/tools/hand-salary-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Income Tax Calculator India 2026', description: 'India income tax FY 2025-26. New vs old regime, Budget 2025 slabs.', url: 'https://formly.tools/tools/income-tax-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'HRA Exemption Calculator', description: 'Calculate HRA exemption under Section 10(13A). Metro vs non-metro.', url: 'https://formly.tools/tools/hra-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Gratuity Calculator India', description: 'Calculate gratuity under Payment of Gratuity Act 1972.', url: 'https://formly.tools/tools/gratuity-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'GST Calculator', description: 'Calculate GST for any amount. Add or remove GST, CGST+SGST vs IGST.', url: 'https://formly.tools/tools/gst-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'SIP Calculator India', description: 'Calculate mutual fund SIP returns with step-up SIP and goal planner.', url: 'https://formly.tools/tools/sip-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Home Loan EMI Calculator', description: 'Calculate home loan EMI, total interest, Section 24b tax benefit.', url: 'https://formly.tools/tools/home-loan-emi-calculator' } },
              { '@type': 'Offer', itemOffered: { '@type': 'WebApplication', name: 'Iron Core Military Workout', description: '30-day military calisthenics program. No equipment needed.', url: 'https://formly.tools/tools/iron-core-workout' } },
            ],
          },
        }) }} />

        {/* Schema: SiteNavigationElement — helps AI understand site structure */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Formly Tools — Free AI Tool Categories',
          description: 'Browse 37 free AI tools organized by category: AI Writing, Payroll & Legal, Developer Tools, Finance, Utilities, and more.',
          url: 'https://formly.tools/tools',
          numberOfItems: 42,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'AI Writing Tools', item: 'https://formly.tools/tools#writing' },
            { '@type': 'ListItem', position: 2, name: 'Payroll & Legal Tools', item: 'https://formly.tools/tools#payroll' },
            { '@type': 'ListItem', position: 3, name: 'Developer Tools', item: 'https://formly.tools/tools#developer' },
            { '@type': 'ListItem', position: 4, name: 'Indian Finance Calculators', item: 'https://formly.tools/tools#calculators' },
            { '@type': 'ListItem', position: 5, name: 'Utility Tools', item: 'https://formly.tools/tools#utilities' },
            { '@type': 'ListItem', position: 6, name: 'Design & Diagrams', item: 'https://formly.tools/tools#design' },
          ],
        }) }} />

        {/* Schema: AggregateRating — trust signal across all tools */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Formly Tools — Free AI Tools Suite',
          description: 'Free AI-powered productivity tools for professionals, freelancers, and students worldwide.',
          brand: { '@type': 'Brand', name: 'Formly Tools' },
          url: 'https://formly.tools',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '3241',
            bestRating: '5',
            worstRating: '1',
          },
        }) }} />
      </head>
      <body className="font-sans antialiased bg-[#F9F7F4] text-stone-900 min-h-screen">
        <GoogleAnalytics />
        {children}
        {/* Monetag — lazyOnload so it never blocks initial render */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="242055"
          data-cfasync="false"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
