'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Check } from 'lucide-react';

export function HeroCredencialQR() {
  const [morphed, setMorphed] = useState(false);
  const [checkDrawn, setCheckDrawn] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isReduced, setIsReduced] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Morphing del badge "Verificado"
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReduced(rm);

    const alreadyMorphed = sessionStorage.getItem('ttm_badge_morph_seen');
    if (rm || alreadyMorphed) {
      setMorphed(true);
      setCheckDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sessionStorage.setItem('ttm_badge_morph_seen', 'true');
          // Iniciar morph
          setTimeout(() => {
            setMorphed(true);
          }, 150);
          // Iniciar dibujo del check
          setTimeout(() => {
            setCheckDrawn(true);
          }, 450);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  // 2. Parallax sutil en Y respecto al scroll (20px máximo, solo desktop)
  useEffect(() => {
    if (typeof window === 'undefined' || isReduced) return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return;

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        // 20px de parallax relativo
        const offset = Math.min(Math.max((scrolled / 500) * 20, -10), 25);
        setScrollY(offset);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [isReduced]);

  return (
    <div
      ref={cardRef}
      className="w-full max-w-sm bg-[#0F1B2D]/95 backdrop-blur-xl border border-[#00E5FF]/20 rounded-card shadow-elevated p-6 flex flex-col items-center text-center space-y-4 relative will-change-transform group transition-all duration-300 hover:border-[#CCFF00]/40 hover:shadow-limeGlow"
      style={{
        transform: `translate3d(0, ${scrollY}px, 0)`,
      }}
    >
      {/* Resplandor ambiental de fondo */}
      <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#00E5FF]/10 via-[#CCFF00]/5 to-transparent rounded-card blur-md pointer-events-none -z-10" />

      {/* Badge Superior con técnica de Morphing */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-left">
          <img
            src="/icon.svg"
            alt="TuTallerMóvil"
            width={28}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <div>
            <p className="text-caption font-mono font-bold uppercase text-white tracking-widest leading-none">
              CREDENCIAL OFICIAL
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Personal en Sitio
            </p>
          </div>
        </div>

        {/* Morphing Badge: cuadrado 8px -> pill expandida con check dibujado */}
        <div
          className={`flex items-center justify-center overflow-hidden transition-all duration-700 ${
            morphed
              ? 'px-3 py-1 bg-[#CCFF00] text-[#050B14] rounded-full shadow-sm'
              : 'w-2 h-2 bg-[#CCFF00] rounded-none'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {morphed ? (
            <div className="flex items-center gap-1.5 text-caption font-bold tracking-tight">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M20 6L9 17L4 12"
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: checkDrawn ? 0 : 24,
                    transition:
                      'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </svg>
              <span>Verificado</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Foto y Datos del Especialista */}
      <div className="flex items-center gap-3 w-full bg-[#0A1525]/80 border border-slate-800 rounded-card p-3 text-left">
        <img
          src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=160&q=80"
          alt="Carlos E. Mendoza - Mecánico Senior"
          width={52}
          height={52}
          className="w-13 h-13 rounded-card object-cover border border-[#00E5FF]/30 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-white truncate leading-tight">
            Carlos E. Mendoza
          </p>
          <p className="text-small text-[#CCFF00] font-medium truncate">
            Mecánico 1 — Senior
          </p>
          <p className="text-caption font-mono text-slate-400">
            ID: <span className="text-white font-semibold">#TTM-CAR-8492</span>
          </p>
        </div>
      </div>

      {/* Código QR: El elemento protagonista */}
      <div className="p-4 bg-[#0A1525] border border-slate-800 rounded-card flex flex-col items-center justify-center w-full">
        <Link
          href="/carnet/CAR-8492"
          className="p-3 bg-white border-2 border-white rounded-card shadow-card block hover:scale-105 transition-transform"
          title="Ver credencial pública verificada"
        >
          <QRCodeSVG
            value="https://tutallermovil.vercel.app/carnet/CAR-8492"
            size={160}
            level="M"
            includeMargin={false}
            fgColor="#050B14"
            bgColor="#FFFFFF"
          />
        </Link>
        <div className="mt-3 space-y-1">
          <p className="text-small font-semibold text-white flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#CCFF00]" />
            Código QR Antifraude
          </p>
          <p className="text-caption text-slate-400 max-w-[220px]">
            Escanea para confirmar identidad y póliza antes de autorizar acceso.
          </p>
        </div>
      </div>

      {/* Pie de la Credencial */}
      <div className="w-full pt-1 flex items-center justify-between text-caption text-slate-400">
        <span className="flex items-center gap-1 font-semibold text-[#16A34A]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block animate-pulse" />
          En Ruta Activa
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          HASH: 7855-TTM
        </span>
      </div>
    </div>
  );
}
