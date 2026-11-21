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
          setTimeout(() => setMorphed(true), 150);
          setTimeout(() => setCheckDrawn(true), 450);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isReduced) return;
    if (window.innerWidth < 1024) return;

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const offset = Math.min(Math.max((scrolled / 500) * 15, -10), 20);
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
      className="w-full max-w-sm bg-[#0B0B0B] border border-[#CCFF00] rounded-sm p-5 flex flex-col items-center text-center space-y-4 relative will-change-transform font-mono shadow-[0_0_20px_rgba(204,255,0,0.15)] uppercase"
      style={{
        transform: `translate3d(0, ${scrollY}px, 0)`,
      }}
    >
      {/* Header técnico del carnet */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="text-left">
          <p className="text-[10px] text-[#CCFF00] font-bold tracking-widest leading-none">
            [ CREDENCIAL OFICIAL ]
          </p>
          <p className="text-[9px] text-neutral-400 mt-1">
            PERSONAL EN SITIO
          </p>
        </div>

        {/* Badge Morphing */}
        <div
          className={`flex items-center justify-center overflow-hidden transition-all duration-500 rounded-sm ${
            morphed
              ? 'px-2 py-0.5 bg-[#CCFF00] text-[#050505] font-bold text-[10px]'
              : 'w-2 h-2 bg-[#CCFF00]'
          }`}
        >
          {morphed ? (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[4]" />
              <span>VERIFICADO</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Foto y Datos del Especialista */}
      <div className="flex items-center gap-3 w-full bg-[#121212] border border-neutral-800 p-2.5 text-left rounded-sm">
        <img
          src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=160&q=80"
          alt="Carlos E. Mendoza"
          width={48}
          height={48}
          className="w-12 h-12 object-cover border border-[#CCFF00]/40 shrink-0 filter grayscale"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs font-bold text-white truncate">
            CARLOS E. MENDOZA
          </p>
          <p className="text-[10px] text-[#CCFF00] font-medium truncate mt-0.5">
            MECÁNICO 1 — SENIOR
          </p>
          <p className="text-[9px] text-neutral-400 mt-0.5">
            ID: <span className="text-white">#TTM-CAR-8492</span>
          </p>
        </div>
      </div>

      {/* Código QR brutalista */}
      <div className="p-3 bg-[#050505] border border-neutral-800 flex flex-col items-center justify-center w-full rounded-sm">
        <Link
          href="/carnet/CAR-8492"
          className="p-2 bg-white block border border-white hover:border-[#CCFF00] transition-colors"
          title="Ver credencial digital"
        >
          <QRCodeSVG
            value="https://tutallermovil.vercel.app/carnet/CAR-8492"
            size={140}
            level="M"
            includeMargin={false}
            fgColor="#050505"
            bgColor="#FFFFFF"
          />
        </Link>
        <div className="mt-2.5 space-y-0.5">
          <p className="text-[11px] font-bold text-white flex items-center justify-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>QR ANTIFRAUDE</span>
          </p>
          <p className="text-[9px] text-neutral-400 max-w-[210px] lowercase first-letter:uppercase">
            escanea para confirmar identidad antes de autorizar acceso.
          </p>
        </div>
      </div>

      {/* Pie técnico */}
      <div className="w-full pt-1 flex items-center justify-between text-[10px] text-neutral-400">
        <span className="flex items-center gap-1 text-[#CCFF00]">
          <span className="w-1.5 h-1.5 bg-[#CCFF00] inline-block animate-ping" />
          EN RUTA ACTIVA
        </span>
        <span className="text-[10px] text-neutral-500">
          HASH: 7855-TTM
        </span>
      </div>
    </div>
  );
}
