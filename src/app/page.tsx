'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wrench,
  Search,
  QrCode,
  UserCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Car
} from 'lucide-react';

const heroContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [plate, setPlate] = useState('');

  const handleSearchPlate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPlate = (plate || 'AD456EF').trim().toUpperCase();
    router.push(`/historial/${encodeURIComponent(cleanPlate)}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">
      {/* 1. Barra Superior Informativa (Top Bar) */}
      <div className="bg-[#0A1525] text-white text-xs sm:text-sm py-2.5 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div className="flex items-center gap-2.5 font-medium flex-wrap justify-center">
            {/* Punto Pulsante con Framer Motion */}
            <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
              <motion.span
                animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inline-flex h-full w-full rounded-full bg-[#CCFF00]"
              />
              <motion.span
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]"
              />
            </span>
            <span>
              Especialistas activos hoy en Caracas • Llegada en &lt; 45 min • Aceptamos Zelle, Pago Móvil y Cashea
            </span>
          </div>
        </div>
      </div>

      {/* 2. Header (Navegación) */}
      <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo TTM */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#0A1525]">
              TTM
            </span>
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-0.5 rounded text-[#1E56B0]">
              TuTallerMóvil
            </span>
          </div>

          {/* Acceso Staff / Aliados */}
          <Link
            href="/aliados/portal"
            className="h-12 px-5 text-base font-semibold border border-[#CBD5E1] text-[#0A1525] hover:bg-[#F8FAFC] hover:border-[#1E56B0] hover:text-[#1E56B0] rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <UserCircle className="w-5 h-5 text-[#1E56B0]" />
            <span>Acceso Staff/Aliados</span>
          </Link>
        </div>
      </header>

      {/* 3. Hero Section (Sección Principal con Staggered Fade-up y Carnet Flotante) */}
      <section className="bg-white py-12 sm:py-16 lg:py-24 flex-1 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Columna Izquierda: Entrada Cascada (Staggered Fade-up) */}
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Insignia Oferta Gancho */}
              <motion.div variants={heroItemVariants}>
                <div className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A1525] px-4 py-2 rounded-lg font-bold text-xs sm:text-sm border border-[#0A1525]/15 shadow-sm">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#0A1525]" />
                  <span>
                    Diagnóstico a Domicilio $15 USD — ¡100% GRATIS si reparas &gt; $40 hoy!
                  </span>
                </div>
              </motion.div>

              {/* H1 Principal */}
              <motion.h1
                variants={heroItemVariants}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0A1525] leading-[1.12]"
              >
                Tu mecánico de confianza, directo en la puerta de tu casa u oficina.
              </motion.h1>

              {/* Subtítulo */}
              <motion.p
                variants={heroItemVariants}
                className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Mecánica especializada a domicilio en Caracas con escaneo computarizado, repuestos verificados y garantía por escrito en cada intervención.
              </motion.p>

              {/* CTAs de acción rápida */}
              <motion.div
                variants={heroItemVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center lg:justify-start"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-12 px-8 text-base font-bold bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-5 h-5 text-[#0A1525]" />
                  <span>Pedir Mecánico Ahora</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-12 px-6 text-base font-semibold bg-[#F8FAFC] hover:bg-slate-100 text-[#0A1525] border border-[#CBD5E1] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Car className="w-5 h-5 text-[#1E56B0]" />
                  <span>Ver Servicios y Precios</span>
                </motion.button>
              </motion.div>

              {/* Beneficios directos */}
              <motion.div
                variants={heroItemVariants}
                className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left border-t border-slate-100"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mecánicos certificados</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Precio claro sin sorpresas</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Garantía de 90 días</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Columna Derecha: Tarjeta de Carnet Digital con Flotación Continua */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: [0, -6, 0]
                }}
                transition={{
                  opacity: { duration: 0.6, ease: "easeOut" },
                  y: {
                    repeat: Infinity,
                    duration: 4.5,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ scale: 1.015 }}
                className="w-full max-w-sm bg-white border-2 border-[#CBD5E1] rounded-2xl p-6 shadow-xl relative overflow-hidden will-change-transform"
              >
                {/* Franja superior decorativa de marca */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0A1525] via-[#1E56B0] to-[#CCFF00]"></div>

                {/* Encabezado del Carnet */}
                <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-4 mb-5 pt-1">
                  <div>
                    <span className="text-xl font-black tracking-tight text-[#0A1525]">TTM</span>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Credencial Digital</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>TÉCNICO OFICIAL VERIFICADO</span>
                  </div>
                </div>

                {/* Foto / Placeholder Técnico */}
                <div className="space-y-4">
                  <div className="bg-slate-100 border border-[#CBD5E1] rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <UserCircle className="w-16 h-16 text-slate-300 stroke-[1.5]" />
                    <span className="text-xs font-semibold text-slate-500 mt-2">
                      FOTOGRAFÍA DEL ESPECIALISTA
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ID: TTM-CAR-8492
                    </span>
                  </div>

                  {/* Datos del Especialista */}
                  <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-3 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Especialista:</span>
                      <span className="font-bold text-[#0A1525]">Carlos E. Mendoza</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Especialidad:</span>
                      <span className="font-semibold text-[#1E56B0]">Diagnóstico &amp; Inyección</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Estatus:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activo en Ruta
                      </span>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="border border-[#CBD5E1] rounded-xl p-4 bg-white flex items-center gap-4">
                    <div className="bg-[#0A1525] p-2.5 rounded-lg text-white shrink-0 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-[#CCFF00]" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#0A1525]">
                        Código QR Dinámico
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Escanea al recibir al técnico para verificar su carnet oficial.
                      </p>
                      <span className="inline-block text-[10px] font-mono text-[#1E56B0] font-semibold">
                        HASH: 7855-TTM-VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer del Carnet */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>TuTallerMóvil CCS</span>
                  <span>Seguridad Garantizada</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Menú de 4 Tarjetas de Acción Rápida (Justo debajo del Hero, antes del Footer) */}
      <section className="bg-[#F8FAFC] py-12 sm:py-16 border-t border-b border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A1525]">
              Acceso Rápido a Servicios
            </h2>
            <p className="text-sm text-slate-600">
              Selecciona una opción para gestionar tu vehículo de inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            
            {/* Tarjeta 1: Pedir Mecánico */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                boxShadow: "0 14px 28px -6px rgba(10, 21, 37, 0.09), 0 10px 10px -5px rgba(10, 21, 37, 0.04)"
              }}
              className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors will-change-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#CCFF00]/25 flex items-center justify-center text-[#0A1525]">
                    <Wrench className="w-5 h-5 text-[#0A1525]" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#1E56B0] bg-[#1E56B0]/10 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" /> Inmediato
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0A1525] tracking-tight mb-1">
                  PEDIR MECÁNICO HOY
                </h3>
                <p className="text-sm text-slate-600 mb-5">
                  En tu casa en &lt; 45 min
                </p>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 text-base font-semibold bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Agendar</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Tarjeta 2: Historial por Placa */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                boxShadow: "0 14px 28px -6px rgba(10, 21, 37, 0.09), 0 10px 10px -5px rgba(10, 21, 37, 0.04)"
              }}
              className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors will-change-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E56B0]/10 flex items-center justify-center text-[#1E56B0]">
                    <Search className="w-5 h-5 text-[#1E56B0]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Consulta
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0A1525] tracking-tight mb-1">
                  HISTORIAL POR PLACA
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Revisa servicios y diagnósticos previos.
                </p>
              </div>

              <form onSubmit={handleSearchPlate} className="space-y-2">
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ej. AD456EF"
                  className="w-full h-12 px-3.5 text-base uppercase font-mono font-medium rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E56B0] focus:border-transparent bg-white text-[#0A1525]"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 text-base font-semibold bg-[#1E56B0] hover:bg-[#16448c] text-white rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </motion.button>
              </form>
            </motion.div>

            {/* Tarjeta 3: Verificar Carnet QR */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                boxShadow: "0 14px 28px -6px rgba(10, 21, 37, 0.09), 0 10px 10px -5px rgba(10, 21, 37, 0.04)"
              }}
              className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors will-change-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" /> Seguro
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0A1525] tracking-tight mb-1">
                  VERIFICAR CARNET QR
                </h3>
                <p className="text-sm text-slate-600 mb-5">
                  Valida a tu especialista y confirma su identidad antes de abrir la puerta.
                </p>
              </div>

              <motion.a
                href="#verificar-carnet"
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 text-base font-semibold border border-[#CBD5E1] hover:border-[#1E56B0] text-[#1E56B0] hover:bg-[#F8FAFC] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Escanear Carnet</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>

            {/* Tarjeta 4: Portal de Aliados */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                boxShadow: "0 14px 28px -6px rgba(10, 21, 37, 0.09), 0 10px 10px -5px rgba(10, 21, 37, 0.04)"
              }}
              className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors will-change-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Red TTM
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0A1525] tracking-tight mb-1">
                  PORTAL DE ALIADOS
                </h3>
                <p className="text-sm text-slate-600 mb-5">
                  Mecánicos, Talleres, Runners
                </p>
              </div>

              <Link
                href="/aliados/portal"
                className="w-full h-12 text-base font-semibold bg-[#F8FAFC] hover:bg-slate-100 text-[#0A1525] border border-[#CBD5E1] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Ingresar al Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-[#CBD5E1] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025 TuTallerMóvil (TTM). Todos los derechos reservados.</p>
          <p className="text-slate-400">Caracas, Venezuela • Servicio mecánico a domicilio</p>
        </div>
      </footer>
    </div>
  );
}
