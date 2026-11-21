'use client';

import React from 'react';

interface MarqueeProps {
  text?: string;
  className?: string;
}

export function Marquee({
  text = 'LLEGADA < 45 MIN · GARANTÍA 90 DÍAS · CARACAS · DIAGNÓSTICO $15 ·',
  className = '',
}: MarqueeProps) {
  const repeatedText = `${text} `.repeat(8);

  return (
    <div
      className={`w-full overflow-hidden bg-[#050B14] border-y border-[#00E5FF]/20 py-3 relative z-20 ${className}`}
      aria-label={text}
    >
      <div className="animate-marquee select-none flex items-center gap-6 whitespace-nowrap">
        <span className="text-caption font-mono font-bold tracking-widest text-[#CCFF00] uppercase flex items-center gap-6">
          {repeatedText}
        </span>
        <span
          className="text-caption font-mono font-bold tracking-widest text-[#CCFF00] uppercase flex items-center gap-6"
          aria-hidden="true"
        >
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
