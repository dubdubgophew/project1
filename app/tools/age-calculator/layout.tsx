import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Age Calculator — Calculate Exact Age from Date of Birth | Formly',
  description: 'Calculate your exact age in years, months, days, hours and seconds. Live countdown to next birthday, zodiac sign, day of week born. Free online age calculator.',
  keywords: ["age calculator", "how old am i calculator", "date of birth calculator", "age calculator online free", "exact age calculator", "birthday calculator", "days alive calculator", "age in days calculator", "next birthday countdown", "zodiac sign calculator"],
  openGraph: { title: 'Free Age Calculator | Formly', description: 'Calculate exact age from DOB — years, months, days, hours. Birthday countdown, zodiac sign. Free.', url: 'https://formly.tools/tools/age-calculator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Age Calculator | Formly', description: 'Free age calculator — exact age, birthday countdown, zodiac sign, days alive. No signup.' },
  alternates: { canonical: 'https://formly.tools/tools/age-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Age Calculator"
        description="Calculate your exact age in years, months, days, hours and seconds. Live countdown to next birthday, zodiac sign, day of week born. Free online age calculator."
        url="https://formly.tools/tools/age-calculator"
        category="UtilitiesApplication"
        features={['Exact age in years, months, days, hours, minutes', 'Live countdown to next birthday', 'Zodiac sign calculation', 'Day of the week you were born', 'Multiple date comparison']}
        faqs={[{ q: 'How does the age calculator work?', a: 'Enter your date of birth and the calculator computes your exact age by comparing it to today's date (or any target date you choose). It accounts for leap years and gives results in years, months, days, hours, minutes and seconds.' }, { q: 'Can I calculate the age between two specific dates?', a: 'Yes — you can set a custom target date instead of today to calculate age between any two dates.' }, { q: 'What is the zodiac sign calculation based on?', a: 'Zodiac signs are based on Western astrology: Aries (Mar 21 – Apr 19), Taurus (Apr 20 – May 20), etc. The calculator automatically determines your sign from your date of birth.' }, { q: 'Is it free?', a: 'Yes — completely free with no signup required.' }]}
      />
      {children}
    </>
  );
}
