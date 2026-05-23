import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AetherBoard — Free AI Whiteboard & Collaborative Diagramming Tool | Formly',
  description: 'Infinite canvas for brainstorming, diagramming, and visual thinking. AI text-to-diagram, sketchy/blueprint/clean modes, freehand drawing, shapes, arrows, sticky notes. Better than Excalidraw — free, no signup.',
  keywords: ['whiteboard online free', 'collaborative whiteboard', 'ai whiteboard', 'infinite canvas', 'diagram tool free', 'excalidraw alternative', 'text to diagram ai', 'online drawing tool', 'brainstorming tool', 'flowchart maker free', 'mind map tool', 'sketchy whiteboard'],
  openGraph: {
    title: 'AetherBoard — Free AI Whiteboard | Formly',
    description: 'Infinite canvas with AI text-to-diagram, sketchy mode, and beautiful collaborative tools. Free, no signup.',
    url: 'https://formly.tools/tools/aetherboard',
    type: 'website',
    siteName: 'Formly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AetherBoard — AI-Powered Infinite Whiteboard | Formly',
    description: 'Infinite canvas with AI, sketchy mode, shapes, and more. Free whiteboard tool by Formly.',
  },
  alternates: { canonical: 'https://formly.tools/tools/aetherboard' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
