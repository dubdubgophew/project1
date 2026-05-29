'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface Props {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const shareText = encodeURIComponent(`${title} — Try it free on Formly`);
  const shareUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-5 border-y border-gray-800 my-8">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
        <Share2 className="w-3.5 h-3.5" />
        Share
      </span>
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          aria-label="Share on X (Twitter)"
        >
          𝕏 Share on X
        </a>
        <a
          href={`https://wa.me/?text=${shareText}%0A${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-medium transition-colors"
          aria-label="Share on WhatsApp"
        >
          WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] text-xs font-medium transition-colors"
          aria-label="Share on LinkedIn"
        >
          LinkedIn
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] text-xs font-medium transition-colors"
          aria-label="Share on Facebook"
        >
          Facebook
        </a>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          aria-label="Copy link"
        >
          {copied
            ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
            : <><Copy className="w-3 h-3" />Copy Link</>
          }
        </button>
      </div>
    </div>
  );
}
