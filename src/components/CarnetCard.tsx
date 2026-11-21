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
    // 1. Fondo de la página: Gris neutro (#F8FAFC)
    <div className="min-h-screen bg-brand-neutral-50 text-brand-trust flex flex-col justify-center items-center p-4 sm:p-6 py-8 sm:py-12 selection:bg-brand-primary selection:text-white">

      {/* Botones Superiores de Navegación */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-neutral-600 hover:text-brand-trust bg-white border border-brand-neutral-300 px-3.5 py-1.5 rounded-card transition-standard shadow-card hover:border-brand-primary"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover bg-white border border-brand-neutral-300 px-3.5 py-1.5 rounded-card transition-standard shadow-card cursor-pointer hover:border-brand-primary"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>

      {/* 2. La Tarjeta (Card): Fondo blanco puro, max-w-md, rounded-container, sombra elevated */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md bg-white rounded-container border border-brand-neutral-200 shadow-elevated overflow-hidden relative flex flex-col"
      >
        {/* Parte Superior: Foto Real Clara de Unsplash */}
        <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-brand-neutral-100">
          <img
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80"
            alt="Carlos Mendoza - Especialista TuTallerMóvil"
            className="w-full h-full object-cover object-center"
          />

          {/* Badge Flotante Arriba a la Derecha: Verde Brand Success */}
          <div className="absolute top-4 right-4 z-20">
            <div className="inline-flex items-center gap-1 bg-brand-success text-white px-3 py-1 rounded-full text-xs font-semibold tracking-tight shadow-card">
              <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
              <span>VERIFICADO</span>
            </div>
          </div>

          {/* Logo TTM flotante arriba a la izquierda */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-card shadow-card border border-brand-neutral-200 flex items-center">
              <img src="/icon.svg" alt="TuTallerMóvil" className="h-[30px] w-auto object-contain" />
            </div>
          </div>

          {/* Degradado inferior */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        </div>

        {/* Cuerpo de la Tarjeta en Fondo Blanco */}
        <div className="px-6 pb-6 pt-1 space-y-5 bg-white relative z-10 -mt-6">

          {/* 3. Identidad */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-brand-trust tracking-tight">
                Carlos Mendoza
              </h1>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-success flex items-center justify-center shrink-0 shadow-card" title="Técnico Verificado Oficial">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3.5]" />
              </span>
            </div>

            <p className="text-sm font-medium text-brand-neutral-600">
              Mecánico 1 — Especialista Senior
            </p>

            <p className="text-xs font-mono font-semibold text-brand-neutral-600 pt-0.5">
              V-12.345.678 • <span className="text-brand-primary font-bold">{idOficial}</span>
            </p>
          </div>

          {/* 4. Fila de Estadísticas: Fondo gris claro, 3 columnas */}
          <div className="grid grid-cols-3 bg-brand-neutral-50 border border-brand-neutral-200 rounded-card py-3 text-center">
            {/* Columna 1: Rating */}
            <div className="border-r border-brand-neutral-200 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-brand-trust font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                <span>4.9</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-neutral-500 block">
                Rating
              </span>
            </div>

            {/* Columna 2: Servicios */}
            <div className="border-r border-brand-neutral-200 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-brand-trust font-bold text-base">
                <Wrench className="w-4 h-4 text-brand-primary" />
                <span>124</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-neutral-500 block">
                Servicios
              </span>
            </div>

            {/* Columna 3: Rango */}
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-brand-trust font-bold text-base">
                <Shield className="w-4 h-4 text-brand-success" />
                <span>Senior</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-neutral-500 block">
                Rango
              </span>
            </div>
          </div>

          {/* 5. Especialidades */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-neutral-500 block">
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
                  className="bg-brand-neutral-100 text-brand-trust text-xs font-medium rounded-full px-3 py-1 flex items-center gap-1.5"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-brand-success flex items-center justify-center shrink-0">
                    <Check className="w-2 h-2 text-white stroke-[3.5]" />
                  </span>
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 6. Unidad y Orden Activa */}
          <div className="space-y-2.5 pt-1">
            <div className="bg-brand-neutral-50 border border-brand-neutral-200 rounded-card p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-control bg-brand-neutral-200 flex items-center justify-center text-brand-trust shrink-0">
                <Bike className="w-5 h-5 text-brand-trust" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-neutral-500 block">
                  Unidad de Traslado (Garita)
                </span>
                <p className="font-semibold text-brand-trust">
                  Moto Yamaha FZ • Color Negro • Placa{' '}
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-brand-neutral-300 text-brand-trust">
                    AB123CD
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-brand-neutral-50 border border-brand-neutral-200 border-l-4 border-l-brand-success rounded-card p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-9 h-9 rounded-control bg-brand-trust flex items-center justify-center text-brand-success shrink-0">
                <Navigation className="w-4 h-4 text-brand-success" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-ping" />
                  Orden Activa en Curso
                </span>
                <p className="font-semibold text-brand-trust pt-0.5">
                  Atendiendo a: Chevrolet Aveo LT • Cuadrante: Chacao
                </p>
              </div>
            </div>
          </div>

          {/* 7. Footer del Carnet (QR y Garantía) */}
          <div className="border-t border-brand-neutral-200 pt-4 flex items-center justify-between gap-4">
            <div className="p-2 bg-white border border-brand-neutral-300 rounded-card shadow-card shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={82}
                level="M"
                includeMargin={false}
                fgColor="#0A1525"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-success bg-brand-success/10 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                <span>Garantía Oficial TuTallerMóvil</span>
              </div>
              <p className="text-xs font-semibold text-brand-trust leading-snug">
                Servicio 100% verificado y respaldado por TuTallerMóvil
              </p>
              <p className="text-[10px] text-brand-neutral-500 font-normal leading-tight">
                Escanea el código QR para validar la identidad y estatus en tiempo real.
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      <p className="text-[11px] text-brand-neutral-500 mt-5 text-center max-w-xs">
        TuTallerMóvil Caracas • Credencial pública verificada para personal en sitio.
      </p>

    </div>
  );
}
