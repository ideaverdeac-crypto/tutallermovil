'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Star,
  Wrench,
  Shield,
  Bike,
  Navigation,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Check
} from 'lucide-react';

interface CarnetCardProps {
  codigo: string;
}

export function CarnetCard({ codigo }: CarnetCardProps) {
  const codigoLimpio = codigo.toUpperCase();
  const idOficial = codigoLimpio.startsWith('#')
    ? codigoLimpio
    : codigoLimpio.startsWith('TTM-')
      ? `#${codigoLimpio}`
      : `#TTM-${codigoLimpio}`;

  const qrUrl = `https://tutallermovil.vercel.app/carnet/${encodeURIComponent(codigo)}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Credencial Oficial TTM - Carlos Mendoza`,
          text: `Credencial verificada de especialista en TuTallerMóvil: Carlos Mendoza (${idOficial})`,
          url: qrUrl
        });
      } catch {
        // Cancelado
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(qrUrl);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col justify-center items-center p-4 sm:p-6 py-8 sm:py-12 selection:bg-[#CCFF00] selection:text-[#050B14]">

      {/* Botones Superiores de Navegación */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0F1B2D] border border-slate-700 px-3.5 py-1.5 rounded-card transition-fast shadow-card hover:border-[#CCFF00]/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00] hover:text-[#b8e600] bg-[#0F1B2D] border border-slate-700 px-3.5 py-1.5 rounded-card transition-fast shadow-card cursor-pointer hover:border-[#CCFF00]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>

      {/* 2. La Tarjeta (Card): Fondo Awwwards dark elevated, max-w-md, rounded-card, sombra elevated */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#0F1B2D] rounded-section border border-slate-800 shadow-elevated overflow-hidden relative flex flex-col"
      >
        {/* Parte Superior: Foto Real Clara de Unsplash */}
        <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80"
            alt="Carlos Mendoza - Especialista TuTallerMóvil"
            className="w-full h-full object-cover object-center"
          />

          {/* Badge Flotante Arriba a la Derecha: Verde Lima Firma */}
          <div className="absolute top-4 right-4 z-20">
            <div className="inline-flex items-center gap-1 bg-[#CCFF00] text-[#050B14] px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-md">
              <Check className="w-3.5 h-3.5 stroke-[3.5] text-[#050B14]" />
              <span>VERIFICADO</span>
            </div>
          </div>

          {/* Logo TTM flotante arriba a la izquierda */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-[#050B14]/90 backdrop-blur-md px-2.5 py-1 rounded-card shadow-card border border-slate-700 flex items-center">
              <img src="/icon.svg" alt="TuTallerMóvil" className="h-[30px] w-auto object-contain" />
            </div>
          </div>

          {/* Degradado inferior hacia el fondo del card */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0F1B2D] via-[#0F1B2D]/80 to-transparent pointer-events-none" />
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="px-6 pb-6 pt-1 space-y-5 bg-[#0F1B2D] relative z-10 -mt-6">

          {/* 3. Identidad */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
                Carlos Mendoza
              </h1>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 shadow-card" title="Técnico Verificado Oficial">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3.5]" />
              </span>
            </div>

            <p className="text-sm font-medium text-slate-300">
              Mecánico 1 — Especialista Senior
            </p>

            <p className="text-xs font-mono font-semibold text-slate-400 pt-0.5">
              V-12.345.678 • <span className="text-[#CCFF00] font-bold">{idOficial}</span>
            </p>
          </div>

          {/* 4. Fila de Estadísticas: Fondo oscuro base, 3 columnas */}
          <div className="grid grid-cols-3 bg-[#0A1525] border border-slate-800 rounded-card py-3 text-center">
            {/* Columna 1: Rating */}
            <div className="border-r border-slate-800 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-white font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                <span>4.9</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Rating
              </span>
            </div>

            {/* Columna 2: Servicios */}
            <div className="border-r border-slate-800 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#CCFF00] font-bold text-base">
                <Wrench className="w-4 h-4 text-[#CCFF00]" />
                <span>124</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Servicios
              </span>
            </div>

            {/* Columna 3: Rango */}
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#00E5FF] font-bold text-base">
                <Shield className="w-4 h-4 text-[#00E5FF]" />
                <span>Senior</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Rango
              </span>
            </div>
          </div>

          {/* 5. Especialidades */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Especialidades Certificadas
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Diagnóstico OBD2',
                'Frenos e Hidráulica',
                'Inyección Eléctrica',
                'Puntualidad < 45 min'
              ].map((chip) => (
                <span
                  key={chip}
                  className="bg-[#0A1525] text-slate-200 text-xs font-medium rounded-full px-3 py-1 flex items-center gap-1.5 border border-slate-800"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
                    <Check className="w-2 h-2 text-white stroke-[3.5]" />
                  </span>
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 6. Unidad y Orden Activa */}
          <div className="space-y-2.5 pt-1">
            <div className="bg-[#0A1525] border border-slate-800 rounded-card p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-control bg-slate-800 flex items-center justify-center text-white shrink-0">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Unidad de Traslado (Garita)
                </span>
                <p className="font-semibold text-white">
                  Moto Yamaha FZ • Color Negro • Placa{' '}
                  <span className="font-mono bg-[#050B14] px-1.5 py-0.5 rounded border border-slate-700 text-[#00E5FF]">
                    AB123CD
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-[#0A1525] border border-slate-800 border-l-4 border-l-[#CCFF00] rounded-card p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-9 h-9 rounded-control bg-[#050B14] flex items-center justify-center text-[#CCFF00] shrink-0">
                <Navigation className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
                  Orden Activa en Curso
                </span>
                <p className="font-medium text-white pt-0.5">
                  Atendiendo a: Chevrolet Aveo LT • Cuadrante: Chacao
                </p>
              </div>
            </div>
          </div>

          {/* 7. Footer del Carnet (QR y Garantía) */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-4">
            <div className="p-2 bg-white rounded-card shadow-card shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={82}
                level="M"
                includeMargin={false}
                fgColor="#050B14"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/20">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Garantía Oficial TuTallerMóvil</span>
              </div>
              <p className="text-xs font-medium text-white leading-snug">
                Servicio 100% verificado y respaldado por TuTallerMóvil
              </p>
              <p className="text-[10px] text-slate-400 font-normal leading-tight">
                Escanea el código QR para validar la identidad y estatus en tiempo real.
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      <p className="text-[11px] text-slate-500 mt-5 text-center max-w-xs font-mono">
        TuTallerMóvil Caracas • Credencial pública verificada para personal en sitio.
      </p>

    </div>
  );
}
