import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Bio Writer — Professional Bio Generator for Any Platform | Formly',
  description: 'Generate a professional bio instantly with AI. Works for LinkedIn, Twitter, Instagram, website about pages, speaker bios and more. Multiple tones and lengths. Free, no signup.',
  keywords: ["bio generator", "professional bio writer", "instagram bio generator", "linkedin bio generator", "ai bio writer free", "personal bio generator", "twitter bio generator", "about me generator", "professional bio examples", "speaker bio generator"],
  openGraph: { title: 'Free AI Bio Writer | Formly', description: 'Write a professional bio in seconds. LinkedIn, Twitter, Instagram & speaker bios. Multiple tones. Free.', url: 'https://formly.tools/tools/bio-writer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Bio Writer | Formly', description: 'Free AI bio writer — professional bios for LinkedIn, Instagram, Twitter. Multiple tones, no signup.' },
  alternates: { canonical: 'https://formly.tools/tools/bio-writer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Bio Writer"
        description="Generate a professional bio instantly with AI. Works for LinkedIn, Twitter, Instagram, website about pages, speaker bios and more. Multiple tones and lengths. Free, no signup."
        url="https://formly.tools/tools/bio-writer"
        category="UtilitiesApplication"
        features={['Bios for LinkedIn, Instagram, Twitter, website', 'Multiple tones (professional, casual, creative)', 'Short (150 chars) and long (300 words) versions', 'Edit and customize output', 'No signup required']}
        faqs={[{ q: "What platforms does the bio generator support?", a: "Formly's bio writer creates bios optimized for LinkedIn, Twitter/X, Instagram, website About pages, speaker profiles, and general professional bios." }, { q: "How long should a professional bio be?", a: "Twitter bios are limited to 160 characters. LinkedIn summaries work best at 3-5 sentences (50-100 words). Website about pages can be longer (150-300 words). Formly generates the right length for each platform." }, { q: "Can I write a bio in third person?", a: "Yes — the bio writer can generate both first-person (I am...) and third-person (John is...) bios depending on your preference." }, { q: "Is it free?", a: "Yes — free to generate bios up to 5 times/day without an account." }]}
      />
      {children}
    </>
  );
}
