'use client';

import React, { useEffect, useState, useRef } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  staggerMs?: number;
}

export function SplitText({
  text,
  className = '',
  as: Component = 'h1',
  staggerMs = 80,
}: SplitTextProps) {
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const elRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(rm);
      if (rm) {
        setInView(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (elRef.current) {
      observer.observe(elRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const lines = text.split('\n');

  if (reducedMotion) {
    return (
      <Component ref={elRef as any} className={className} aria-label={text}>
        {text}
      </Component>
    );
  }

  return (
    <Component
      ref={elRef as any}
      className={`${className} overflow-hidden`}
      aria-label={text}
    >
      {lines.map((line, idx) => (
        <span
          key={idx}
          className="block will-change-transform"
          style={{
            clipPath: inView ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
            transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 40%, 0)',
            opacity: inView ? 1 : 0,
            transition: `clip-path 800ms cubic-bezier(0.16, 1, 0.3, 1) ${
              idx * staggerMs
            }ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) ${
              idx * staggerMs
            }ms, opacity 600ms ease-out ${idx * staggerMs}ms`,
          }}
          aria-hidden="true"
        >
          {line}
        </span>
      ))}
    </Component>
  );
}
