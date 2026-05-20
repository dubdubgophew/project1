import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Email Writer — Write Professional Emails in Seconds | Formly',
  description: 'Generate professional emails instantly with AI. Cold emails, follow-ups, apology emails, job applications & more. Free, customizable tone. No signup needed.',
  keywords: ["ai email writer", "email generator free", "professional email writer", "write email with ai", "cold email generator", "business email writer", "email template generator ai", "free email writer online", "ai email composer", "email drafter free"],
  openGraph: { title: 'Free AI Email Writer | Formly', description: 'Write professional emails in seconds with AI. Cold emails, follow-ups, job applications & more. Free.', url: 'https://formly.tools/tools/email-writer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Email Writer | Formly', description: 'AI email writer — generate professional emails instantly. Free, no signup.' },
  alternates: { canonical: 'https://formly.tools/tools/email-writer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="AI Email Writer"
        description="Generate professional emails instantly with AI. Cold emails, follow-ups, apology emails, job applications & more. Free, customizable tone. No signup needed."
        url="https://formly.tools/tools/email-writer"
        category="BusinessApplication"
        features={['Multiple email types (cold, follow-up, apology, job application)', 'Customizable tone (formal, friendly, assertive)', 'Subject line suggestions', 'No signup required', 'Instant AI generation']}
        faqs={[{ q: 'What types of emails can it write?', a: 'Formly's AI email writer handles cold sales emails, follow-up emails, job application emails, apology emails, meeting requests, invoice follow-ups, thank you notes, and more.' }, { q: 'Can I customize the tone of the email?', a: 'Yes — choose from formal, friendly, concise, or assertive tones. You can also specify the context and key points to include.' }, { q: 'Is the email writer free?', a: 'Yes — free to use up to 5 times per day without signing up. Sign up for a free account to get 10 emails/day.' }, { q: 'Will the AI email sound robotic?', a: 'No — Formly uses advanced AI that writes natural, context-aware emails that sound human. You can always edit the output before sending.' }]}
      />
      {children}
    </>
  );
}
