'use client';
import { useState } from 'react';

export function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-stone-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHidden(true)}
        itemProp="image"
      />
    </div>
  );
}
