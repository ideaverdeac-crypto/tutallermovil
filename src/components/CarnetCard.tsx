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
  Sparkles
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
      alert('¡Enlace de credencial copiado al portapapeles!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070E1A] text-white flex flex-col justify-center items-center p-4 sm:p-6 py-10 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Botones Superiores de Navegación */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-1.5 rounded-xl transition-all shadow-xs backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#CCFF00] hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-1.5 rounded-xl transition-all shadow-xs backdrop-blur-md cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>

      {/* Tarjeta Vertical Dribbble Style con Entrada 3D */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
        style={{ transformPerspective: 1200 }}
        className="w-full max-w-sm bg-[#0A1525] rounded-3xl border border-white/15 shadow-2xl overflow-hidden relative flex flex-col"
      >
        {/* 1. Imagen de Fondo Inmersiva y Degradado */}
        <div className="relative min-h-[260px] sm:min-h-[290px] w-full flex flex-col justify-between p-5 overflow-hidden">
          {/* Fotografía de Fondo */}
          <img
            src="https://images.unsplash.com/photo-1613214150384-4b12d2a50125?q=80&w=600&auto=format&fit=crop"
            alt="Carlos Mendoza - Especialista TuTallerMóvil"
            className="absolute inset-0 w-full h-full object-cover object-top scale-105"
          />

          {/* Degradado Superpuesto Inmersivo */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1525] via-[#0A1525]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          {/* Barra Superior sobre la foto: Logo y Badge */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-[#0A1525]/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15">
              <span className="font-black text-sm tracking-tighter text-[#CCFF00]">TTM</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">TuTallerMóvil</span>
            </div>

            {/* Badge de la Marca: Verde Lima (#CCFF00), texto oscuro */}
            <div className="inline-flex items-center gap-1 bg-[#CCFF00] text-[#0A1525] px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight shadow-md">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>TÉCNICO VERIFICADO</span>
            </div>
          </div>

          {/* 2. Identidad (Parte inferior de la imagen) */}
          <div className="relative z-10 space-y-1 pt-12">
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                Carlos Mendoza
              </h1>
              <BadgeCheck className="w-6 h-6 text-[#1E56B0] fill-white shrink-0" />
            </div>

            <p className="text-xs text-slate-300 font-semibold leading-tight drop-shadow-xs">
              Mecánico 1 — Especialista Senior (OBD2 y Electrónica)
            </p>

            <div className="pt-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-400">
                V-12.345.678 • <strong className="text-[#CCFF00]">{idOficial}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Contenido Interior del Carnet */}
        <div className="px-5 pb-5 pt-3 space-y-4 bg-[#0A1525]">
          
          {/* 3. Fila de Estadísticas */}
          <div className="grid grid-cols-3 bg-white/5 border border-white/10 rounded-2xl py-3 text-center backdrop-blur-xs">
            {/* Columna 1: Rating */}
            <div className="border-r border-white/20 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-base">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.9</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Rating
              </span>
            </div>

            {/* Columna 2: Servicios */}
            <div className="border-r border-white/20 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#CCFF00] font-black text-base">
                <Wrench className="w-4 h-4 text-[#CCFF00]" />
                <span>124</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Servicios
              </span>
            </div>

            {/* Columna 3: Rango */}
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-black text-base">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Senior</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Rango
              </span>
            </div>
          </div>

          {/* 4. Insignias de Certificación (Chips con white/10 y borde white/20) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Especialidades Certificadas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Diagnóstico OBD2', 'Frenos e Hidráulica', 'Inyección Eléctrica', 'Puntualidad < 45 min'].map((chip) => (
                <span
                  key={chip}
                  className="bg-white/10 border border-white/20 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* 5. Seguridad y Logística (Tarjetas translúcidas) */}
          <div className="space-y-2">
            {/* Recuadro A (Unidad) */}
            <div className="backdrop-blur-md bg-white/10 border border-white/15 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                <Bike className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Unidad de Traslado (Garita)
                </span>
                <p className="font-bold text-white">
                  Moto Yamaha FZ • Negro • Placa <span className="font-mono text-[#CCFF00]">AB123CD</span>
                </p>
              </div>
            </div>

            {/* Recuadro B (Orden Activa - con borde izquierdo verde lima) */}
            <div className="backdrop-blur-md bg-white/10 border border-white/15 border-l-4 border-l-[#CCFF00] rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-[#CCFF00] shrink-0">
                <Navigation className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] block">
                  Orden Activa en Curso
                </span>
                <p className="font-bold text-white">
                  Atendiendo: Chevrolet Aveo • <span className="font-mono text-slate-200">AD456EF</span> • Chacao
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 6. Footer del Carnet (Fondo Blanco Puro con QR y Garantía) */}
        <div className="bg-white text-[#0A1525] p-4 sm:p-5 flex items-center justify-between gap-4 border-t-2 border-[#CCFF00]">
          {/* Código QR a la izquierda */}
          <div className="p-1.5 bg-white border-2 border-[#0A1525] rounded-xl shadow-xs shrink-0 flex items-center justify-center">
            <QRCodeSVG
              value={qrUrl}
              size={76}
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
              <span>Garantía Oficial</span>
            </div>
            <p className="text-xs font-black text-[#0A1525] leading-snug">
              Servicio respaldado con Garantía Total TuTallerMóvil
            </p>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              Escanea el QR para validar credencial oficial en vivo.
            </p>
          </div>
        </div>

      </motion.div>

      {/* Nota legal y copyright */}
      <p className="text-[11px] text-slate-500 mt-4 text-center max-w-xs">
        TuTallerMóvil CCS • Credencial pública verificada mediante clave única.
      </p>

    </div>
  );
}
