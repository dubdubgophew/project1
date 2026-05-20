import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Strong Password Generator — Secure Random Passwords | Formly',
  description: 'Generate cryptographically secure passwords instantly. Customize length, character sets, and generate up to 50 passwords at once. Entropy and crack time shown. Free.',
  keywords: ["password generator", "strong password generator", "random password generator", "secure password maker", "free password generator", "password creator online", "complex password generator", "bulk password generator", "password with symbols generator", "cryptographic password generator"],
  openGraph: { title: 'Free Strong Password Generator | Formly', description: 'Generate cryptographically secure passwords. Entropy score, crack time, bulk generation. Free.', url: 'https://formly.tools/tools/password-generator', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Strong Password Generator | Formly', description: 'Free password generator — strong, random, secure. Entropy score and crack time shown.' },
  alternates: { canonical: 'https://formly.tools/tools/password-generator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Strong Password Generator"
        description="Generate cryptographically secure passwords instantly. Customize length, character sets, and generate up to 50 passwords at once. Entropy and crack time shown. Free."
        url="https://formly.tools/tools/password-generator"
        category="SecurityApplication"
        features={['Cryptographically secure random generation', 'Customizable length and character sets', 'Entropy and crack time display', 'Bulk generation (up to 50 passwords)', 'Copy to clipboard instantly']}
        faqs={[{ q: "Are generated passwords truly random?", a: "Yes — Formly uses the browser's cryptographically secure random number generator (window.crypto), the same standard used by security professionals and password managers." }, { q: "What makes a password strong?", a: "A strong password has: 12+ characters, a mix of uppercase and lowercase letters, numbers, and symbols, no dictionary words, and is unique to each account. Our generator creates passwords meeting all these criteria." }, { q: "What is entropy?", a: "Password entropy measures how unpredictable a password is in bits. Higher entropy = harder to crack. A 128-bit entropy password would take longer than the age of the universe to brute-force." }, { q: "Should I store generated passwords in a browser?", a: "For maximum security, store passwords in a dedicated password manager (Bitwarden, 1Password, etc.) rather than your browser, which can be compromised by extensions." }]}
      />
      {children}
    </>
  );
}
