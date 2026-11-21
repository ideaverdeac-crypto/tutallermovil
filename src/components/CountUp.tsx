'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
  childrenAfter?: React.ReactNode;
}

export function CountUp({
  value,
  prefix = '$',
  suffix = '',
  durationMs = 800,
  className = '',
  childrenAfter,
}: CountUpProps) {
  const [currentVal, setCurrentVal] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const elRef = useRef<HTMLSpanElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(rm);

    const alreadySeen = sessionStorage.getItem(`ttm_countup_${value}`);
    if (rm || alreadySeen) {
      setCurrentVal(value);
      setIsFinished(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sessionStorage.setItem(`ttm_countup_${value}`, 'true');
          const startTime = performance.now();

          const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // expoOut easing
            const easeExpo =
              progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const val = Math.round(easeExpo * value);
            setCurrentVal(val);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCurrentVal(value);
              setIsFinished(true);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (elRef.current) observer.observe(elRef.current);

    return () => observer.disconnect();
  }, [value, durationMs]);

  if (reducedMotion) {
    return (
      <span ref={elRef} className={className}>
        <span>{prefix}{value}{suffix}</span>
        {childrenAfter && <span className="ml-1.5">{childrenAfter}</span>}
      </span>
    );
  }

  return (
    <span ref={elRef} className={`inline-flex items-center ${className}`}>
      <span className="font-mono tracking-tight font-bold">
        {prefix}
        {currentVal}
        {suffix}
      </span>
      {childrenAfter && (
        <span
          className={`ml-1.5 transition-opacity duration-300 ${
            isFinished ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {childrenAfter}
        </span>
      )}
    </span>
  );
}
