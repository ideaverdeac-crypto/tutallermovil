'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Solo desktop (puntero fino) y si NO tiene prefers-reduced-motion
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!isFinePointer || prefersReducedMotion) {
      return;
    }

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const checkHoverTarget = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactiveEl = target.closest(
        'a, button, [data-cursor="hover"], input, select, textarea, [role="button"]'
      );
      setIsHovered(!!interactiveEl);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', checkHoverTarget, { passive: true });
    document.documentElement.addEventListener('mouseenter', onMouseEnter);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    // Animación suave del cursor con spring / lerp GPU
    const updatePosition = () => {
      const ease = 0.22;
      posRef.current.x += (targetRef.current.x - posRef.current.x) * ease;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(updatePosition);
    };

    rafId.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', checkHoverTarget);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform mix-blend-difference transition-[width,height,background-color,border-color] duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${
        isHovered
          ? 'w-10 h-10 border-2 border-[#CCFF00] bg-transparent'
          : 'w-2.5 h-2.5 bg-[#CCFF00] border-transparent'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    />
  );
}
