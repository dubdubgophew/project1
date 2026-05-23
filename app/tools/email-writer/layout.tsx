import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free AI Email Writer — Professional Emails Instantly | Formly',
  description: 'AI email writer free — generate professional emails in seconds. Cold emails, follow-ups, job applications, and apologies in any tone. Better than templates. No signup needed.',
  keywords: ["ai email writer free", "ai email writer", "email generator free", "professional email writer", "write email with ai", "cold email generator", "business email writer", "email template generator ai", "free email writer online", "ai email composer", "email drafter free", "cold outreach email generator", "follow up email generator ai", "job application email writer"],
  openGraph: { title: 'Free AI Email Writer — Professional Emails Instantly | Formly', description: 'AI email writer free — generate professional emails in seconds. Cold emails, follow-ups, job applications in any tone. Better than templates. No signup needed.', url: 'https://formly.tools/tools/email-writer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free AI Email Writer — Professional Emails Instantly | Formly', description: 'AI email writer free — professional emails in seconds. Any tone, any type. No signup.' },
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
        faqs={[{ q: "What types of emails can it write?", a: "Formly's AI email writer handles cold sales emails, follow-up emails, job application emails, apology emails, meeting requests, invoice follow-ups, thank you notes, and more." }, { q: "Can I customize the tone of the email?", a: "Yes — choose from formal, friendly, concise, or assertive tones. You can also specify the context and key points to include." }, { q: "Is the email writer free?", a: "Yes — free to use up to 5 times per day without signing up. Sign up for a free account to get 10 emails/day." }, { q: "Will the AI email sound robotic?", a: "No — Formly uses advanced AI that writes natural, context-aware emails that sound human. You can always edit the output before sending." }]}
        steps={[
          { name: 'Select email type and tone', text: 'Choose the email purpose (cold outreach, follow-up, apology, complaint, etc.) and tone (Professional, Friendly, Assertive, Empathetic).' },
          { name: 'Describe the context', text: 'Briefly describe what the email is about — recipient, purpose, key points to include.' },
          { name: 'Generate and edit', text: 'Click Write Email. Review the generated email, edit as needed, then copy or export.' },
        ]}
      />
      {children}
    </>
  );
}
