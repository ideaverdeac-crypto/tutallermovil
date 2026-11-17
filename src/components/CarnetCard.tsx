'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Bike,
  Navigation,
  Star,
  Check,
  Award,
  Lock,
  Sparkles,
  Car
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

  // Datos públicos del técnico según el PRD
  const tecnico = {
    nombre: 'Carlos Mendoza',
    cedula: 'V-12.345.678',
    id: idOficial,
    rango: 'Mecánico 1 — Especialista Senior (OBD2 y Electrónica)',
    calificacion: '4.9 / 5.0',
    fotoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
    certificaciones: [
      'Diagnóstico OBD2',
      'Frenos e Hidráulica',
      'Inyección Eléctrica',
      'Puntualidad < 45 min'
    ],
    unidadTraslado: {
      tipo: 'Moto Yamaha FZ',
      color: 'Negro',
      placa: 'AB123CD'
    },
    ordenActiva: {
      vehiculo: 'Chevrolet Aveo LT',
      placa: 'AD456EF',
      cuadrante: 'Chacao'
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Credencial Oficial TTM - ${tecnico.nombre}`,
          text: `Credencial verificada de especialista en TuTallerMóvil: ${tecnico.nombre} (${tecnico.id})`,
          url: qrUrl
        });
      } catch (err) {
        // Cancelado por el usuario
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(qrUrl);
      alert('¡Enlace de credencial copiado al portapapeles!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0A1525] flex flex-col justify-center items-center p-4 sm:p-6 py-10 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Botones Superiores de Navegación */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A1525] bg-white border border-[#CBD5E1] px-3.5 py-1.5 rounded-xl transition-all shadow-xs hover:border-[#1E56B0]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E56B0] hover:text-[#0A1525] bg-white border border-[#CBD5E1] px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer hover:border-[#1E56B0]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Identificación estilo Apple Wallet / Corporate ID */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30, rotateX: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
        style={{ transformPerspective: 1200 }}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-[#CBD5E1] shadow-2xl overflow-hidden relative"
      >
        {/* Banda Holográfica / Cinta Superior Apple Wallet */}
        <div className="h-2.5 bg-gradient-to-r from-[#0A1525] via-[#1E56B0] to-[#CCFF00] w-full" />

        <div className="p-6 sm:p-7 space-y-6">
          
          {/* 1. Cabecera y Estatus */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0A1525] flex items-center justify-center text-[#CCFF00] font-black text-lg shadow-sm">
                TTM
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-[#0A1525] block leading-none">
                  TuTallerMóvil
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  Credencial Oficial
                </span>
              </div>
            </div>

            {/* Badge en color Verde Lima (#CCFF00) con texto oscuro */}
            <div className="inline-flex items-center gap-1 bg-[#CCFF00] text-[#0A1525] px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-tight border border-[#0A1525]/10 shadow-xs text-right">
              <Check className="w-3.5 h-3.5 text-[#0A1525] stroke-[3]" />
              <span>TÉCNICO VERIFICADO • ACTIVO</span>
            </div>
          </div>

          {/* 2. Identidad del Técnico (Grid 2 Columnas) */}
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Foto del técnico con uniforme */}
            <div className="col-span-4 sm:col-span-4 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-2xl overflow-hidden border-2 border-[#CBD5E1] shadow-md bg-slate-100 p-0.5">
                  <img
                    src={tecnico.fotoUrl}
                    alt={tecnico.nombre}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {/* Micro badge sobre la foto */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Datos Personales del Técnico */}
            <div className="col-span-8 sm:col-span-8 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight leading-tight">
                  {tecnico.nombre}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-slate-600">CI: {tecnico.cedula}</span>
                <span>•</span>
                <span className="font-mono font-extrabold text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {tecnico.id}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-semibold leading-snug pt-1">
                {tecnico.rango}
              </p>
            </div>
          </div>

          {/* 3. Insignias de Certificación & Calificación */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#1E56B0]" /> Certificaciones Aprobadas
              </span>

              {/* Calificación 4.9 / 5.0 ★ */}
              <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{tecnico.calificacion} ★</span>
              </div>
            </div>

            {/* Chips de Especialidades */}
            <div className="flex flex-wrap gap-1.5">
              {tecnico.certificaciones.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 bg-[#F8FAFC] text-slate-700 border border-[#CBD5E1] text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Unidad de Traslado (Autorización de Garita) */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
              <Bike className="w-5 h-5 text-[#0A1525]" />
            </div>
            <div className="text-xs leading-snug">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Autorización de Garita / Vigilancia
              </span>
              <p className="font-extrabold text-[#0A1525]">
                Unidad de Traslado: {tecnico.unidadTraslado.tipo} • Color {tecnico.unidadTraslado.color} • Placa{' '}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[#1E56B0]">
                  {tecnico.unidadTraslado.placa}
                </span>
              </p>
            </div>
          </div>

          {/* 5. Vinculación con Orden Activa */}
          <div className="bg-blue-50/70 border-2 border-[#1E56B0] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#1E56B0] flex items-center justify-center text-[#CCFF00] shrink-0 shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="text-xs leading-snug">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#1E56B0] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Despacho Oficial en Curso
              </span>
              <p className="font-extrabold text-[#0A1525] pt-0.5">
                Atendiendo a: {tecnico.ordenActiva.vehiculo} • Placa{' '}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-[#1E56B0]">
                  {tecnico.ordenActiva.placa}
                </span>{' '}
                • Cuadrante: {tecnico.ordenActiva.cuadrante}
              </p>
            </div>
          </div>

          {/* 6. Respaldo y QR Dinámico */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
            {/* Código QR con qrcode.react */}
            <div className="p-2.5 bg-white border-2 border-[#0A1525] rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={92}
                level="M"
                includeMargin={false}
                fgColor="#0A1525"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Sello de Garantía y Respaldo */}
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Garantía TuTallerMóvil</span>
              </div>
              <p className="text-xs font-bold text-[#0A1525] leading-snug">
                Servicio respaldado con Garantía Total TuTallerMóvil
              </p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">
                Escanea el código QR con cualquier teléfono para validar la autenticidad en tiempo real.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Corporativo estilo Apple Wallet */}
        <div className="bg-[#0A1525] text-white px-6 py-3 flex items-center justify-between text-[10px] font-bold tracking-wider">
          <span className="text-slate-400 uppercase">IDENTIFICACIÓN PÚBLICA OFICIAL</span>
          <span className="text-[#CCFF00] flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-[#CCFF00]" /> SEGURIDAD TTM
          </span>
        </div>

      </motion.div>

      {/* Nota Legal Inferior */}
      <p className="text-[11px] text-slate-400 mt-5 text-center max-w-sm">
        Esta credencial es emitida exclusivamente por TuTallerMóvil para validar al personal técnico autorizado en sitio.
      </p>

    </div>
  );
}
