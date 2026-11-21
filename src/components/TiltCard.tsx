'use client';

import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTiltDeg?: number;
}

export function TiltCard({
  children,
  className = '',
  maxTiltDeg = 6,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      setIsTouchOrReduced(isCoarse || isReduced);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchOrReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTiltDeg;
    const rotateY = ((x - centerX) / centerX) * maxTiltDeg;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  if (isTouchOrReduced) {
    return (
      <div
        className={`transition-transform duration-200 hover:scale-[1.02] group ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`will-change-transform group transition-all ${className}`}
        style={{
          transform: isHovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.01)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered
            ? 'transform 100ms ease-out'
            : 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
