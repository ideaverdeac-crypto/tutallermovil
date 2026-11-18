'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import {
  Wrench,
  Search,
  QrCode,
  UserCircle,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Car,
  Settings,
  X,
  Star,
  Check,
  Shield,
  Zap
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    // Obtener sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch((err) => console.error('Error al obtener sesión:', err));

    // Escuchar cambios de estado de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearchPlate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPlate = (plate || 'AD456EF').trim().toUpperCase();
    router.push(`/historial/${encodeURIComponent(cleanPlate)}`);
  };

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5500);
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
          {/* Logo Oficial TTM */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/icon.svg"
              alt="TuTallerMóvil"
              className="h-[50px] sm:h-[60px] w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Acceso Clientes ('Ingresar' o 'Mi Garaje') y Staff / Aliados */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Si NO hay sesión: Botón Secundario 'Ingresar' */}
            {!session ? (
              <Link
                href="/login-cliente"
                className="h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm font-extrabold bg-[#F8FAFC] hover:bg-slate-100 text-[#0A1525] hover:text-[#1E56B0] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-[#CBD5E1] shadow-2xs active:scale-95"
                title="Iniciar sesión en Tu Garaje"
              >
                <User className="w-4 h-4 text-[#1E56B0] shrink-0" />
                <span>Ingresar</span>
              </Link>
            ) : (
              /* Si SÍ hay sesión: Botón Principal 'Mi Garaje' */
              <Link
                href="/cliente/dashboard"
                className="h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm font-black bg-[#1E56B0] hover:bg-[#15448c] text-white rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md shadow-blue-900/10 active:scale-95 border border-blue-400/30"
                title="Ir a Mi Garaje y Pasaporte Técnico"
              >
                <Car className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span className="hidden sm:inline">Mi Garaje</span>
                <span className="sm:hidden">Garaje</span>
              </Link>
            )}

            {/* Acceso Staff / Aliados (Disimulado con icono de configuración sutil) */}
            <Link
              href="/login"
              className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#0A1525] hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-slate-200 active:scale-95 group/staff"
              title="Acceso Staff & Aliados"
              aria-label="Acceso Staff & Aliados"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover/staff:text-[#0A1525] transition-transform duration-300 group-hover/staff:rotate-45" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Fondos Claros, Galería de Especialistas y Mockup del Teléfono con Credencial Digital) */}
      <section className="relative bg-gradient-to-b from-white via-slate-50/70 to-[#F1F5F9] py-12 sm:py-16 lg:py-20 flex-1 flex items-center overflow-hidden border-b border-slate-200/80">
        {/* Patrón técnico de puntos sutil en el fondo claro */}
        <div 
          className="absolute inset-0 opacity-[0.45] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Resplandores ambientales tenues y suaves para profundidad */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#CCFF00]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Columna Izquierda: Entrada Cascada (Staggered Fade-up) */}
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              {/* Insignia Oferta Gancho */}
              <motion.div variants={heroItemVariants}>
                <div className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A1525] px-4 py-2 rounded-full font-black text-xs sm:text-sm border border-[#0A1525]/15 shadow-sm">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#0A1525]" />
                  <span>
                    Diagnóstico a Domicilio $15 USD — ¡100% GRATIS si reparas &gt; $40 hoy!
                  </span>
                </div>
              </motion.div>

              {/* H1 Principal con Enfásis Moderno */}
              <motion.h1
                variants={heroItemVariants}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0A1525] leading-[1.12]"
              >
                Mecánica Automotriz a Domicilio{' '}
                <span className="text-[#1E56B0] underline decoration-[#CCFF00] decoration-wavy decoration-2">
                  en Caracas
                </span>
              </motion.h1>

              {/* Subtítulo */}
              <motion.p
                variants={heroItemVariants}
                className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Especialistas certificados en la puerta de tu casa u oficina con escaneo computarizado OBD2, repuestos garantizados y la única plataforma con <strong className="text-[#0A1525] font-extrabold">Credencial Digital de Confianza QR</strong> para tu total seguridad.
              </motion.p>

              {/* CTAs de acción rápida */}
              <motion.div
                variants={heroItemVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center lg:justify-start"
              >
                <motion.button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-12 px-8 text-base font-black bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-all shadow-md shadow-lime-900/10 flex items-center justify-center gap-2 cursor-pointer border border-[#0A1525]/10 active:scale-95"
                >
                  <Wrench className="w-5 h-5 text-[#0A1525]" />
                  <span>Pedir Mecánico Ahora</span>
                </motion.button>

                <Link
                  href="/carnet/CAR-8492"
                  className="h-12 px-6 text-base font-bold bg-white hover:bg-slate-50 text-[#0A1525] border-2 border-[#CBD5E1] hover:border-[#1E56B0] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5 text-[#1E56B0]" />
                  <span>Ver Credencial QR</span>
                </Link>
              </motion.div>

              {/* Beneficios directos de Confianza (4 Pilares) */}
              <motion.div
                variants={heroItemVariants}
                className="pt-4 grid grid-cols-2 sm:grid-cols-2 gap-3 text-left border-t border-slate-200/80"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>Llegada en &lt; 45 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>Mecánicos Verificados con QR</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>Garantía de 90 Días por Escrito</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>Diagnóstico $15 Exonerable</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Columna Derecha: Composición de Fotos de Mecánicos + Mockup de Smartphone con Credencial Digital */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[540px] sm:min-h-[590px] lg:min-h-[630px] w-full py-6">

              {/* === CAPA TRASERA: Varias Imágenes Reales de Mecánicos en Taller y Campo === */}
              {/* Foto 1: Especialista en frenos y tren delantero (Arriba Derecha) */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -20, rotate: 3 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 3 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                whileHover={{ rotate: 0, scale: 1.03 }}
                className="absolute top-2 right-0 sm:right-2 w-48 sm:w-60 aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 z-0 transition-transform duration-300 group cursor-pointer"
                title="Mantenimiento de Frenos y Suspensión TuTallerMóvil"
              >
                <img
                  src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80"
                  alt="Mecánico especializado en frenos"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2 flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                  <span className="text-[10px] sm:text-[11px] font-black tracking-tight drop-shadow-sm">Frenos &amp; Suspensión</span>
                </div>
              </motion.div>

              {/* Foto 2: Escaneo Electrónico y Diagnóstico OBD2 con Tablet (Abajo Izquierda) */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 20, rotate: -4 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: -4 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                whileHover={{ rotate: 0, scale: 1.03 }}
                className="absolute bottom-2 left-0 sm:left-2 w-48 sm:w-56 aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 z-0 transition-transform duration-300 group cursor-pointer"
                title="Diagnóstico Electrónico OBD2"
              >
                <img
                  src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80"
                  alt="Escaneo computarizado OBD2 en vehículo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2 flex items-center gap-1.5 text-white">
                  <Zap className="w-3 h-3 text-[#CCFF00]" />
                  <span className="text-[10px] sm:text-[11px] font-black tracking-tight drop-shadow-sm">Escáner OBD2 en Vivo</span>
                </div>
              </motion.div>

              {/* Foto 3: Inspección de Motor Bajo Capó (Fondo Arriba Izquierda - Desktop) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                whileHover={{ rotate: 0, scale: 1.04 }}
                className="hidden sm:block absolute -top-4 left-6 w-36 aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100 z-0 transition-transform duration-300 group cursor-pointer opacity-90"
                title="Inspección de 25 Puntos de Seguridad"
              >
                <img
                  src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80"
                  alt="Inspección de motor a domicilio"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-1.5 left-2 text-white">
                  <span className="text-[9px] font-black tracking-tight">Inspección 25 Pts</span>
                </div>
              </motion.div>

              {/* === CAPA FRONTAL: EL MOCKUP DEL TELÉFONO CON LA CREDENCIAL DIGITAL === */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0],
                  scale: 1
                }}
                transition={{
                  opacity: { duration: 0.6, ease: "easeOut" },
                  scale: { duration: 0.6, ease: "easeOut" },
                  y: {
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ scale: 1.02 }}
                className="w-[285px] sm:w-[315px] bg-[#0A1525] p-2.5 sm:p-3 rounded-[46px] sm:rounded-[50px] shadow-[0_25px_60px_-15px_rgba(10,21,37,0.4),0_12px_24px_-8px_rgba(0,0,0,0.18)] border-[3.5px] border-slate-700/80 ring-1 ring-slate-800/80 relative z-20 will-change-transform select-none"
              >
                {/* Botones Físicos Laterales del Smartphone */}
                <div className="absolute -left-[5px] top-24 w-[3px] h-9 bg-slate-600 rounded-l-md" />
                <div className="absolute -left-[5px] top-36 w-[3px] h-9 bg-slate-600 rounded-l-md" />
                <div className="absolute -right-[5px] top-28 w-[3px] h-12 bg-slate-600 rounded-r-md" />

                {/* Brillo / Reflejo sutil de cristal en la esquina superior derecha */}
                <div className="absolute top-3 right-6 w-20 h-10 bg-gradient-to-b from-white/10 to-transparent rounded-full -rotate-45 pointer-events-none z-30" />

                {/* Pantalla del Teléfono (Fondo Blanco Limpio / Credencial Digital) */}
                <div className="bg-white rounded-[38px] sm:rounded-[42px] overflow-hidden border border-slate-200/90 flex flex-col relative text-[#0A1525] shadow-inner">
                  
                  {/* Barra de Estado con Dynamic Island (iOS Style) */}
                  <div className="pt-2.5 px-5 pb-1 flex items-center justify-between bg-white text-[11px] font-bold text-slate-800">
                    <span className="font-semibold tracking-tight">9:41</span>
                    {/* Dynamic Island */}
                    <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center px-2 gap-1.5 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-700" />
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-[9px] font-black">5G</span>
                      <div className="w-4 h-2 border border-slate-800 rounded-xs p-[0.5px] flex items-center">
                        <div className="w-full h-full bg-slate-800 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Encabezado del Carnet Oficial */}
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
                    <div className="flex items-center gap-1.5">
                      <img src="/icon.svg" alt="TuTallerMóvil" className="h-[28px] w-auto object-contain" />
                      <div className="leading-tight">
                        <p className="text-[9px] font-black tracking-wider uppercase text-[#0A1525]">CREDENCIAL</p>
                        <p className="text-[8px] font-bold text-[#1E56B0]">OFICIAL TTM</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>VERIFICADO</span>
                    </div>
                  </div>

                  {/* Tarjeta del Mecánico con Foto Real y Checkmark */}
                  <div className="p-3 sm:p-3.5 space-y-2.5">
                    <div className="flex items-center gap-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-2.5 shadow-2xs">
                      <div className="relative shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=240&q=80"
                          alt="Carlos Mendoza - Especialista"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#1E56B0] shadow-xs"
                        />
                        <span 
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#16a34a] border-2 border-white flex items-center justify-center shadow-xs"
                          title="Técnico Verificado Oficial"
                        >
                          <Check className="w-3 h-3 text-white stroke-[3.5]" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-[#0A1525] truncate leading-tight">
                          Carlos E. Mendoza
                        </h3>
                        <p className="text-[11px] font-bold text-[#1E56B0] truncate">
                          Mecánico 1 — Senior
                        </p>
                        <p className="text-[9px] font-mono font-semibold text-slate-500">
                          ID: <span className="text-[#0A1525] font-black">#TTM-CAR-8492</span> • V-12.345.678
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" /> 4.9 (148)
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En Ruta
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Dinámico con Generación Criptográfica Real */}
                    <div className="bg-white border-2 border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3 shadow-xs">
                      <div className="bg-[#0A1525] p-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-xs">
                        <QRCodeSVG
                          value="https://tutallermovil.vercel.app/carnet/CAR-8492"
                          size={62}
                          level="M"
                          fgColor="#CCFF00"
                          bgColor="#0A1525"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-[10px] font-black uppercase text-[#0A1525] tracking-wide flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-[#1E56B0]" /> QR Antifraude
                        </p>
                        <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                          Escanea para verificar la identidad antes de autorizar acceso.
                        </p>
                        <span className="inline-block mt-1 text-[8px] font-mono text-[#1E56B0] font-black bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                          HASH: 7855-TTM-VERIFIED
                        </span>
                      </div>
                    </div>

                    {/* Botón Dentro del Teléfono para Ver Credencial */}
                    <Link
                      href="/carnet/CAR-8492"
                      className="w-full py-2.5 px-3 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-[#0A1525]/15"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#0A1525]" />
                      <span>Validar Credencial Oficial</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0A1525]" />
                    </Link>
                  </div>

                  {/* Barra de Inicio (Home Indicator de iOS) */}
                  <div className="py-2 flex justify-center bg-slate-50 border-t border-slate-100">
                    <div className="w-24 h-1 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Insignia Flotante 1: Técnico en Ruta (Arriba a la Izquierda del Celular) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="absolute -top-1 left-2 sm:-left-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs font-bold text-[#0A1525]"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-black text-[#0A1525]">Llegada en &lt; 45 min</span>
              </motion.div>

              {/* Insignia Flotante 2: Garantía Escrita (Abajo a la Derecha del Celular) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="absolute -bottom-2 right-2 sm:-right-4 z-30 bg-[#0A1525] text-white border border-slate-700 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 text-xs font-bold"
              >
                <ShieldCheck className="w-5 h-5 text-[#CCFF00] shrink-0" />
                <div className="text-left">
                  <p className="text-[11px] font-black text-white leading-tight">Garantía Escrita</p>
                  <p className="text-[9px] text-slate-300">100% Repuestos y Mano de Obra</p>
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
                onClick={() => setModalOpen(true)}
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
          <p>© 2026 TuTallerMóvil (TTM). Titular: José Ángel Acosta Llovera. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/terminos" className="text-[#1E56B0] hover:underline">
              Términos, Condiciones y Privacidad
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Caracas, Venezuela</span>
          </div>
        </div>
      </footer>

      {/* Modal Dialog de Solicitud de Mecánico */}
      <SolicitarMecanicoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccessToast={handleShowToast}
      />

      {/* Notificación Toast en pantalla */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0A1525] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#CCFF00] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A1525] shrink-0 font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#0A1525]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-wider">
                  ¡Orden Despachada!
                </p>
                <p className="text-sm font-semibold text-white">
                  {toastMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
