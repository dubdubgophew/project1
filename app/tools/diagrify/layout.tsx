import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diagrify — Free AI Diagram & Whiteboard Tool | Make Flowcharts Online',
  description: 'Free online whiteboard with AI text-to-diagram. Create flowcharts, mind maps, wireframes, and diagrams instantly. Infinite canvas, sketchy mode, no signup needed. Better than draw.io for quick AI-powered diagrams.',
  keywords: [
    'diagrify', 'free diagram tool online', 'ai flowchart generator free', 'text to diagram ai',
    'online whiteboard free no signup', 'flowchart maker free', 'free excalidraw alternative',
    'ai diagram generator', 'online drawing tool free', 'mind map tool free', 'wireframe tool free',
    'infinite canvas whiteboard', 'draw.io alternative free', 'free visio alternative online',
    'flowchart creator free ai', 'diagram from text ai', 'free whiteboard tool',
    'ai whiteboard generator', 'flowchart ai free', 'diagram tool no login',
  ],
  openGraph: {
    title: 'Diagrify — Free AI-Powered Diagram & Whiteboard Tool',
    description: 'Type a description → get a diagram instantly. Free online whiteboard with AI, infinite canvas, flowcharts, mind maps. No signup.',
    url: 'https://formly.tools/tools/diagrify',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diagrify — Free AI Diagram Tool | Formly',
    description: 'Type a description → instant AI diagram. Free online whiteboard with infinite canvas, sketchy mode, flowcharts. No signup needed.',
  },
  alternates: { canonical: 'https://formly.tools/tools/diagrify' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Diagrify',
    url: 'https://formly.tools/tools/diagrify',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Free AI-powered diagram and whiteboard tool. Create flowcharts, mind maps, and diagrams from text descriptions using AI. Infinite canvas with sketchy and blueprint rendering modes.',
    featureList: [
      'AI text-to-diagram generation',
      'Infinite canvas whiteboard',
      'Flowchart and mind map creation',
      'Sketchy hand-drawn rendering mode',
      'Blueprint technical drawing mode',
      'Freehand pen drawing',
      'Shape tools: rectangles, ellipses, diamonds, triangles',
      'Arrow and connector tools',
      'Sticky notes',
      'PNG and SVG export',
      'Undo/redo history',
      'No signup required',
      'Auto-saves to browser storage',
    ],
    screenshot: 'https://formly.tools/og-diagrify.png',
    softwareVersion: '1.0',
    creator: { '@type': 'Organization', name: 'Formly', url: 'https://formly.tools' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Diagrify?',
        acceptedAnswer: { '@type': 'Answer', text: 'Diagrify is a free online whiteboard and AI diagram generator. You can type a description of any process or system and AI will instantly create a diagram. It also works as a full whiteboard for drawing shapes, flowcharts, mind maps, and more.' },
      },
      {
        '@type': 'Question',
        name: 'Is Diagrify free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, Diagrify is completely free with no signup required. Open the tool and start creating diagrams immediately. Your work auto-saves in your browser.' },
      },
      {
        '@type': 'Question',
        name: 'Does Diagrify save my work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Diagrify automatically saves your canvas to your browser\'s local storage every few seconds. When you return to the tool, your previous work is restored instantly — no account needed.' },
      },
      {
        '@type': 'Question',
        name: 'How does AI diagram generation work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Click "AI Generate" in Diagrify, type a description like "user login flow" or "microservices architecture", and the AI creates a structured diagram with proper shapes, labels, and connections within seconds.' },
      },
      {
        '@type': 'Question',
        name: 'Is Diagrify a good free alternative to Excalidraw or draw.io?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Diagrify offers the same infinite canvas and sketchy mode as Excalidraw, plus built-in AI text-to-diagram generation that neither Excalidraw nor draw.io offer for free. It\'s ideal for quick AI-powered diagrams and brainstorming.' },
      },
      {
        '@type': 'Question',
        name: 'Can I export diagrams from Diagrify?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Diagrify lets you export your diagrams as PNG (raster image) or SVG (scalable vector graphic) files with one click.' },
      },
    ],
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet" />
      {/* existing script tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
