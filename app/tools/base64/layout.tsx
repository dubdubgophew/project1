import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free Base64 Encoder & Decoder Online — Text & File Support | Formly',
  description: 'Encode and decode Base64 instantly. Supports text strings and file uploads (images, PDFs, binary). URL-safe Base64 mode. Free online Base64 tool — no signup needed.',
  keywords: ["base64 encoder decoder", "encode base64 online", "base64 converter free", "base64 decode online", "base64 encode text", "base64 file encoder", "url safe base64", "base64 to text converter", "online base64 tool", "image to base64 converter"],
  openGraph: { title: 'Free Base64 Encoder/Decoder | Formly', description: 'Encode/decode Base64 instantly. Text and file support, URL-safe mode. Free, no signup.', url: 'https://formly.tools/tools/base64', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free Base64 Encoder/Decoder | Formly', description: 'Free Base64 encoder/decoder — text and file support, URL-safe mode. No signup required.' },
  alternates: { canonical: 'https://formly.tools/tools/base64' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="Base64 Encoder/Decoder"
        description="Encode and decode Base64 instantly. Supports text strings and file uploads (images, PDFs, binary). URL-safe Base64 mode. Free online Base64 tool — no signup needed."
        url="https://formly.tools/tools/base64"
        category="DeveloperApplication"
        features={['Text and file Base64 encoding/decoding', 'URL-safe Base64 mode', 'Binary file support (images, PDFs)', 'Copy result instantly', 'No signup required']}
        faqs={[{ q: 'What is Base64 encoding?', a: 'Base64 is an encoding scheme that converts binary data (or any bytes) to ASCII text using 64 characters (A-Z, a-z, 0-9, +, /). It's used to safely transmit binary data in text-based systems like email, JSON, and HTTP headers.' }, { q: 'When would I need to decode Base64?', a: 'Common use cases: decoding JWT tokens (which are Base64-encoded), reading API responses, decoding email attachments, and working with data URIs for images.' }, { q: 'What is URL-safe Base64?', a: 'URL-safe Base64 replaces + with - and / with _ to make the encoded string safe to use in URLs without percent-encoding. Used in JWT tokens and many web APIs.' }, { q: 'Can I encode images to Base64?', a: 'Yes — upload any image file and get its Base64 data URI, which you can embed directly in HTML or CSS without a separate image request.' }]}
      />
      {children}
    </>
  );
}
