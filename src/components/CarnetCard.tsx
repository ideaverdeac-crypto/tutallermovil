'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  Wrench,
  ArrowLeft,
  Share2,
  ExternalLink,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface CarnetCardProps {
  codigo: string;
}

export function CarnetCard({ codigo }: CarnetCardProps) {
  const codigoLimpio = codigo.toUpperCase();
  const idFormateado = codigoLimpio.startsWith('#')
    ? codigoLimpio
    : codigoLimpio.startsWith('TTM-')
    ? `#${codigoLimpio}`
    : `#TTM-${codigoLimpio}`;

  const qrUrl = `https://tutallermovil.vercel.app/carnet/${encodeURIComponent(codigo)}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Credencial Oficial TTM - ${idFormateado}`,
          text: `Verifica la credencial oficial de especialista en TuTallerMóvil: Carlos Mendoza (${idFormateado})`,
          url: qrUrl
        });
      } catch (err) {
        // Ignorar si canceló el share
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(qrUrl);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Botón superior de volver */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A1525] bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-lg transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E56B0] hover:text-[#0A1525] bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>

      {/* 4. Tarjeta con entrada suave (scale-up y fade-in) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-sm bg-white rounded-3xl border-2 border-[#CBD5E1] shadow-2xl relative overflow-hidden flex flex-col"
      >
        {/* Borde superior grueso en color verde lima (#CCFF00) */}
        <div className="h-3.5 bg-[#CCFF00] w-full border-b border-[#0A1525]/10" />

        {/* 3. Cabecera del Carnet */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-[#0A1525]">TTM</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-[#1E56B0] px-2 py-0.5 rounded border border-slate-200">
              TuTallerMóvil
            </span>
          </div>

          {/* Texto 'TÉCNICO OFICIAL VERIFICADO' con un icono de check */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-tight">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
            <span>TÉCNICO OFICIAL VERIFICADO</span>
          </div>
        </div>

        {/* Cuerpo del Carnet */}
        <div className="px-6 py-6 flex flex-col items-center text-center space-y-4">
          
          {/* Círculo grande con foto de placeholder */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#1E56B0] via-[#CCFF00] to-[#0A1525] shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-2 border-white relative">
                {/* Imagen del técnico Carlos Mendoza */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  alt="Carlos Mendoza"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Check flotante en el avatar */}
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Nombre, Especialidad e ID */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#0A1525] tracking-tight">
              Carlos Mendoza
            </h1>
            <p className="text-xs font-bold text-[#1E56B0] uppercase tracking-wider">
              Mecánica Ligera
            </p>
            <div className="pt-1">
              <span className="font-mono text-xs font-black bg-[#F8FAFC] text-[#0A1525] border border-[#CBD5E1] px-3 py-1 rounded-md tracking-wider">
                {idFormateado}
              </span>
            </div>
          </div>

          {/* Badge de Estado: '● ACTIVO EN RUTA' */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span>ACTIVO EN RUTA</span>
          </div>

          {/* Separador sutil */}
          <div className="w-full border-t border-dashed border-[#CBD5E1] my-2" />

          {/* Parte inferior: Código QR generado dinámicamente con qrcode.react */}
          <div className="flex flex-col items-center space-y-2.5 pt-1">
            <div className="p-3 bg-white border-2 border-[#0A1525] rounded-2xl shadow-sm flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={140}
                level="H"
                includeMargin={false}
                fgColor="#0A1525"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Texto de Garantía */}
            <p className="text-[11px] text-slate-500 font-medium max-w-[240px] leading-snug">
              Escanea este código para verificar la identidad del especialista
            </p>

            <span className="text-[9px] font-mono text-slate-400 font-semibold tracking-widest uppercase">
              Certificado Criptográfico TTM-ID
            </span>
          </div>

        </div>

        {/* Footer del Carnet */}
        <div className="bg-[#0A1525] text-white px-6 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-slate-400">Caracas, VE</span>
          <span className="text-[#CCFF00] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Seguro TTM Activo
          </span>
        </div>

      </motion.div>

      {/* Marca inferior */}
      <p className="text-[11px] text-slate-400 mt-4 text-center">
        TuTallerMóvil (TTM) • Plataforma de Auxilio y Mecánica a Domicilio
      </p>

    </div>
  );
}
