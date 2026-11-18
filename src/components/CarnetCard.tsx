'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  BadgeCheck,
  Star,
  Wrench,
  Shield,
  Bike,
  Navigation,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Check,
  CheckCircle2
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
      } catch (err) {
        // Cancelado
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(qrUrl);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    // 1. Fondo de la página: Gris muy claro (#F8FAFC) modo claro puro
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col justify-center items-center p-4 sm:p-6 py-8 sm:py-12 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Botones Superiores de Navegación */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A1525] bg-white border border-[#CBD5E1] px-3.5 py-1.5 rounded-xl transition-all shadow-xs hover:border-[#1E56B0]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E56B0] hover:text-[#0A1525] bg-white border border-[#CBD5E1] px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer hover:border-[#1E56B0]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>

      {/* 2. La Tarjeta (Card): Fondo blanco puro, max-w-md, rounded-3xl, sombra sutil pero profunda */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl overflow-hidden relative flex flex-col"
      >
        {/* Parte Superior: Foto Real Clara de Unsplash (40% de la tarjeta) */}
        <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80"
            alt="Carlos Mendoza - Especialista TuTallerMóvil"
            className="w-full h-full object-cover object-center"
          />

          {/* Badge Flotante Arriba a la Derecha: Verde Lima (#CCFF00) con texto oscuro */}
          <div className="absolute top-4 right-4 z-20">
            <div className="inline-flex items-center gap-1 bg-[#CCFF00] text-[#0A1525] px-3 py-1 rounded-full text-xs font-black tracking-tight shadow-md border border-[#0A1525]/15">
              <Check className="w-3.5 h-3.5 stroke-[3] text-[#0A1525]" />
              <span>VERIFICADO</span>
            </div>
          </div>

          {/* Logo TTM flotante arriba a la izquierda */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-[#CBD5E1] flex items-center">
              <img src="/icon.svg" alt="TuTallerMóvil" className="h-[30px] w-auto object-contain" />
            </div>
          </div>

          {/* Degradado solo en la parte inferior para transición suave al fondo blanco */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        </div>

        {/* Cuerpo de la Tarjeta en Fondo Blanco */}
        <div className="px-6 pb-6 pt-1 space-y-5 bg-white relative z-10 -mt-6">
          
          {/* 3. Identidad (Texto Oscuro) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                Carlos Mendoza
              </h1>
              {/* Check Verde Oficial Sólido con tilde blanca (Idéntico a la referencia) */}
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0 shadow-xs" title="Técnico Verificado Oficial">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3.5]" />
              </span>
            </div>

            <p className="text-sm font-semibold text-[#475569]">
              Mecánico 1 — Especialista Senior
            </p>

            <p className="text-xs font-mono font-bold text-slate-600 pt-0.5">
              V-12.345.678 • <span className="text-[#1E56B0] font-black">{idOficial}</span>
            </p>
          </div>

          {/* 4. Fila de Estadísticas: Fondo gris claro (#F1F5F9), 3 columnas */}
          <div className="grid grid-cols-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl py-3 text-center">
            {/* Columna 1: Rating */}
            <div className="border-r border-[#CBD5E1] px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#0A1525] font-black text-base">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                <span>4.9</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Rating
              </span>
            </div>

            {/* Columna 2: Servicios */}
            <div className="border-r border-[#CBD5E1] px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#0A1525] font-black text-base">
                <Wrench className="w-4 h-4 text-[#1E56B0]" />
                <span>124</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Servicios
              </span>
            </div>

            {/* Columna 3: Rango */}
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#0A1525] font-black text-base">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Senior</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Rango
              </span>
            </div>
          </div>

          {/* 5. Especialidades: Etiquetas elegantes con círculo verde relleno y check blanco exacto a la referencia */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
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
                  className="bg-[#F1F5F9] text-[#0A1525] text-sm font-semibold rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xs"
                >
                  <span className="w-4 h-4 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                  </span>
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 6. Unidad y Orden Activa: Recuadros con fondo #F8FAFC, borde #CBD5E1 y texto oscuro */}
          <div className="space-y-2.5 pt-1">
            {/* Recuadro A: Unidad de Traslado */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                <Bike className="w-5 h-5 text-[#0A1525]" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Unidad de Traslado (Garita)
                </span>
                <p className="font-extrabold text-[#0A1525]">
                  Moto Yamaha FZ • Color Negro • Placa{' '}
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[#1E56B0]">
                    AB123CD
                  </span>
                </p>
              </div>
            </div>

            {/* Recuadro B: Orden Activa (Texto exacto sin placa, con borde izquierdo verde lima) */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] border-l-4 border-l-[#CCFF00] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#0A1525] flex items-center justify-center text-[#CCFF00] shrink-0">
                <Navigation className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E56B0] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Orden Activa en Curso
                </span>
                <p className="font-extrabold text-[#0A1525] pt-0.5">
                  Atendiendo a: Chevrolet Aveo LT • Cuadrante: Chacao
                </p>
              </div>
            </div>
          </div>

          {/* 7. Footer del Carnet (QR y Garantía): Separado por línea sutil, fondo blanco */}
          <div className="border-t border-[#CBD5E1] pt-4 flex items-center justify-between gap-4">
            {/* Código QR a la izquierda */}
            <div className="p-2 bg-white border-2 border-[#0A1525] rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={82}
                level="M"
                includeMargin={false}
                fgColor="#0A1525"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Texto de Garantía a la derecha */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Garantía Oficial TuTallerMóvil</span>
              </div>
              <p className="text-xs font-black text-[#0A1525] leading-snug">
                Servicio 100% verificado y respaldado por TuTallerMóvil
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Escanea el código QR para validar la identidad y estatus en tiempo real.
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Nota legal al pie */}
      <p className="text-[11px] text-slate-400 mt-5 text-center max-w-xs">
        TuTallerMóvil CCS • Credencial pública verificada para personal en sitio.
      </p>

    </div>
  );
}
