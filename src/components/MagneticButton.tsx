'use client';

import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // porcentaje máximo de desplazamiento (def 0.25)
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.25,
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < 80) {
      setPosition({
        x: deltaX * strength,
        y: deltaY * strength,
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 450);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative inline-block overflow-hidden rounded-card ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition:
          position.x === 0 && position.y === 0
            ? 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 80ms ease-out',
      }}
    >
      {/* Ripple de onda lima */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-[#CCFF00]/40 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 120,
            height: 120,
            animationDuration: '400ms',
          }}
        />
      ))}
      {children}
    </div>
  );
}
