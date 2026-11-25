import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  eager?: boolean;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  eager = false,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFE2CC] via-[#F8F1E6] to-[#E5D3B8] text-[#23483D]/70 p-6 text-center ${className}`}
      >
        <BookOpen className="w-7 h-7 mb-2 text-[#B69A61]" strokeWidth={1.4} />
        {fallbackTitle && (
          <span className="font-display text-lg font-medium text-[#40352D]/85 leading-snug max-w-[16ch]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
