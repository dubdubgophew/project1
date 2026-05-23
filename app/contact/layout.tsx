import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Formly — Support & Feedback | Formly',
  description: 'Contact Formly for support, feature requests, bug reports, or partnership inquiries. We respond within 24 hours.',
  alternates: { canonical: 'https://formly.tools/contact' },
  openGraph: {
    title: 'Contact Formly',
    description: 'Get in touch with the Formly team for support or feedback.',
    url: 'https://formly.tools/contact',
    type: 'website',
    siteName: 'Formly',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
