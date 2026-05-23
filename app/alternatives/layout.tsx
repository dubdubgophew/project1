import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '29 Free Alternatives to Grammarly, Excalidraw, DocuSign, Visio & More | Formly',
  description:
    'Find free online alternatives to expensive tools: Grammarly, Excalidraw, draw.io, DocuSign, QuillBot, Resume.io, ADP, and more. 29 free AI tools, no signup needed.',
  keywords: [
    'free grammarly alternative',
    'free excalidraw alternative',
    'free docusign alternative',
    'free visio alternative',
    'free draw io alternative',
    'free quillbot alternative',
    'free resume builder alternative',
    'free chatgpt alternative writing tools',
  ],
  alternates: { canonical: 'https://formly.tools/alternatives' },
  openGraph: {
    title: 'Free Alternatives to Grammarly, Excalidraw, DocuSign & 9 More Paid Tools',
    description:
      '29 free AI tools replacing expensive subscriptions. Grammar checker, diagram tool, digital signatures, resume builder — all free, no signup.',
    url: 'https://formly.tools/alternatives',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
