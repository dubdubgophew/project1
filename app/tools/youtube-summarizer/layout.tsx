import type { Metadata } from 'next';
import { ToolSchemas } from '@/components/shared/ToolSchemas';

export const metadata: Metadata = {
  title: 'Free YouTube Video Summarizer — Summarize Any YouTube Video with AI | Formly',
  description: 'Summarize any YouTube video instantly with AI. Paste the video URL and get key points, main ideas, and timestamps in seconds. Free, no signup required.',
  keywords: ['youtube summarizer', 'youtube video summarizer free', 'summarize youtube video ai', 'youtube transcript summary', 'ai youtube summary', 'youtube video to text', 'youtube key points extractor', 'summarize video online free', 'youtube summarizer no signup', 'ai video summarizer'],
  openGraph: { title: 'Free YouTube Summarizer | Formly', description: 'Summarize any YouTube video with AI. Paste the URL and get key points in seconds. Free.', url: 'https://formly.tools/tools/youtube-summarizer', type: 'website', siteName: 'Formly' },
  twitter: { card: 'summary_large_image', title: 'Free YouTube Video Summarizer | Formly', description: 'Get AI summaries of any YouTube video. Paste URL → get key points. Free.' },
  alternates: { canonical: 'https://formly.tools/tools/youtube-summarizer' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas
        name="YouTube Video Summarizer"
        description="AI-powered YouTube video summarizer that extracts and condenses video transcripts into key points, main ideas, and takeaways in seconds."
        url="https://formly.tools/tools/youtube-summarizer"
        category="UtilitiesApplication"
        features={['Summarize any public YouTube video', 'AI-generated key points and takeaways', 'Powered by Groq AI for fast results', 'No signup required', 'Works with English-language videos']}
        faqs={[
          { q: "How does the YouTube video summarizer work?", a: "Paste a YouTube video URL and our AI fetches the video's transcript (if available), then uses Groq AI to generate a structured summary with key points, main ideas, and important takeaways — in under 30 seconds." },
          { q: "Does it work on any YouTube video?", a: "The summarizer works on YouTube videos that have transcripts/captions enabled (auto-generated or manual). Most YouTube videos have auto-generated captions. Private or age-restricted videos are not supported." },
          { q: "What languages does the YouTube summarizer support?", a: "The AI summary is generated in English. The tool works best with English-language videos or videos with English auto-generated captions." },
          { q: "Is there a video length limit?", a: "The tool supports videos up to approximately 2 hours in length. Very long videos (lectures, podcasts, full courses) may be summarized at a higher level due to transcript length limits." },
          { q: "Can I use this to summarize online courses or educational content?", a: "Yes — the YouTube Summarizer is particularly useful for online courses, conference talks, TED talks, tutorials, and educational videos. Get the key points without watching the full video." },
        ]}
        steps={[
          { name: 'Paste the YouTube URL', text: 'Copy any YouTube video URL and paste it into the input field.' },
          { name: 'Click Summarize', text: 'Click the Summarize button. Our AI fetches the transcript and generates a summary in seconds.' },
          { name: 'Read and copy', text: 'Review the AI-generated key points and copy them to use in your notes, reports, or research.' },
        ]}
      />
      {children}
    </>
  );
}
