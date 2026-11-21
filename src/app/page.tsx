'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Wrench,
  Search,
  QrCode,
  UserCircle,
  ArrowRight,
  ShieldCheck,
  X,
  CheckCircle2
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
import BotonSoporteWhatsApp from '@/components/BotonSoporteWhatsApp';
import { SocialProof } from '@/components/SocialProof';
import { Marquee } from '@/components/Marquee';
import { HeroCredencialQR } from '@/components/HeroCredencialQR';

export default function Home() {
  const router = useRouter();
  const [plate, setPlate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [bgOffsetY, setBgOffsetY] = useState(0);

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

    // Parallax sutil en fondo de imagen
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setBgOffsetY(scrolled * 0.25);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-mono selection:bg-[#CCFF00] selection:text-[#050505] uppercase">

      {/* TAREA 2 — Navegación Técnica (Header Brutalista) */}
      <header className="bg-[#050505]/95 border-b border-neutral-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo / Marca Técnica */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-sm sm:text-base font-bold tracking-widest text-[#CCFF00]">
              [ TUTALLERMÓVIL ]
            </span>
          </Link>

          {/* Menú de Enlaces Monoespaciados entre Corchetes */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium tracking-wider text-neutral-400">
            <Link href="/" className="hover:text-[#CCFF00] transition-colors">
              [ INICIO ]
            </Link>
            <a href="#servicios" className="hover:text-[#CCFF00] transition-colors">
              [ SERVICIOS ]
            </a>
            <a href="#precios" className="hover:text-[#CCFF00] transition-colors">
              [ PRECIOS ]
            </a>
            <a href="#contacto" className="hover:text-[#CCFF00] transition-colors">
              [ CONTACTO ]
            </a>
          </nav>

          {/* Acceso Clientes y WhatsApp */}
          <div className="flex items-center gap-3">
            <BotonSoporteWhatsApp modo="header" className="hidden sm:inline-flex" />

            {!session ? (
              <Link
                href="/login-cliente"
                className="h-9 px-3.5 text-xs font-mono font-bold border border-neutral-700 bg-neutral-900/80 text-white hover:text-[#050505] hover:bg-[#CCFF00] hover:border-[#CCFF00] transition-colors rounded-sm flex items-center gap-1.5"
                title="Iniciar sesión en Tu Garaje"
              >
                <span>[ INGRESAR ]</span>
              </Link>
            ) : (
              <Link
                href="/cliente/dashboard"
                className="h-9 px-3.5 text-xs font-mono font-bold bg-[#CCFF00] text-[#050505] border border-[#CCFF00] transition-colors rounded-sm flex items-center gap-1.5"
                title="Mi Garaje y Pasaporte Técnico"
              >
                <span>[ MI GARAJE ]</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* TAREA 1 — Rediseño del HERO (Efecto Cartel Editorial Brutalista) */}
      <section className="relative min-h-[90vh] lg:min-h-[95vh] flex flex-col justify-between overflow-hidden border-b border-neutral-800 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        
        {/* 1. Fondo de Imagen con Filtros Editoriales y Parallax */}
        <div
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(0, ${bgOffsetY}px, 0)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1920&q=80"
            alt="Taller y mecánica automotriz"
            className="w-full h-[120%] object-cover object-center brutalist-hero-image"
          />
        </div>

        {/* 2. Efecto Halftone (Trama de Puntos Radial) */}
        <div className="absolute inset-0 z-0 pointer-events-none halftone-overlay" />

        {/* Gradiente sutil para legibilidad editorial */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#050505]/80 via-[#050505]/40 to-[#050505]/90" />

        {/* 4. Metadata: Franja Superior */}
        <div className="relative z-10 w-full flex items-center justify-between text-xs tracking-widest text-neutral-400 font-mono animate-metadata">
          <div className="text-[#CCFF00] font-bold">
            [ TUTALLERMÓVIL ]
          </div>
          <div className="hidden sm:block text-neutral-300">
            [ DIAGNÓSTICO $15 USD · 100% EXONERABLE SI REPARAS &gt; $40 · GARANTÍA 90 DÍAS ]
          </div>
          <div>
            [ CCS / 2026 ]
          </div>
        </div>

        {/* 3. Titular Masivo Centrado y Superpuesto a la Imagen con Efecto Cortina */}
        <div className="relative z-10 my-auto py-12 sm:py-16 text-center flex flex-col items-center justify-center max-w-6xl mx-auto w-full animate-curtain">
          
          {/* Línea 1: Playfair Display itálica */}
          <span
            style={{ fontFamily: 'var(--font-serif)' }}
            className="italic text-white text-5xl md:text-7xl lg:text-8xl font-normal tracking-normal drop-shadow-md select-none lowercase first-letter:uppercase"
          >
            Llevamos tu
          </span>

          {/* Línea 2: Anton / Oswald pesada y condensada */}
          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mt-1 sm:mt-2 drop-shadow-2xl select-none"
          >
            MECÁNICA A DOMICILIO
          </h1>

          {/* Subtítulo técnico */}
          <p className="mt-5 max-w-xl text-neutral-300 text-xs sm:text-sm font-mono tracking-wider leading-relaxed px-4">
            Especialistas certificados con escáner OBD2 en la puerta de tu casa u oficina. Sin remolques ni costos ocultos.
          </p>

          {/* 5. CTA Principal Brutalista (Píldora con bordes casi rectos rounded-sm) */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="h-13 px-8 text-sm sm:text-base font-mono font-bold bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#050505] rounded-sm transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_24px_rgba(204,255,0,0.4)] hover:shadow-[0_0_32px_rgba(204,255,0,0.6)]"
            >
              <span>PEDIR MECÁNICO HOY</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <a
              href="#verificar-carnet"
              className="h-13 px-6 text-xs sm:text-sm font-mono font-bold bg-[#050505]/80 hover:bg-[#121212] text-white border border-neutral-700 hover:border-[#CCFF00] rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
              <span>[ VER CREDENCIAL QR ]</span>
            </a>
          </div>
        </div>

        {/* 4. Metadata: Franja Inferior (Esquinas y Centro) */}
        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs text-neutral-400 font-mono tracking-wider animate-metadata border-t border-neutral-800/60 pt-4">
          
          {/* Esquina Inferior Izquierda */}
          <div className="text-left font-bold text-white">
            [ 15+ MARCAS ATENDIDAS ]
          </div>

          {/* Centro Abajo: Pequeño Listado Vertical de Servicios */}
          <div className="text-left md:text-center text-[11px] text-neutral-300">
            <span className="text-[#CCFF00] font-bold block mb-0.5">[ SERVICIOS PRINCIPALES ]</span>
            <span className="tracking-widest">DIAGNÓSTICO / BATERÍA / FRENOS / MOTOR</span>
          </div>

          {/* Esquina Inferior Derecha */}
          <div className="text-left md:text-right font-bold text-white">
            [ CARACAS, VZLA — LLEGADA &lt; 45 MIN ]
          </div>

        </div>

      </section>

      {/* Marquee Divisor Brutalista */}
      <Marquee text="LLEGADA < 45 MIN · GARANTÍA 90 DÍAS · CARACAS · DIAGNÓSTICO $15 · ESPECIALISTAS OBD2 · CREDENCIAL QR ·" />

      {/* TAREA 4 — Sección de Credencial QR Flotante Brutalista */}
      <section id="verificar-carnet" className="py-16 sm:py-20 bg-[#050505] border-b border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <span className="text-xs text-[#CCFF00] font-bold tracking-widest">
              [ PROTOCOLO DE SEGURIDAD Y CONFIANZA ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              CREDENCIAL DIGITAL ANTIFRAUDE
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-mono">
              Cada especialista que llega a tu ubicación porta su credencial con código QR criptográfico. Escanéalo antes de autorizar el acceso para verificar identidad, estatus en tiempo real y póliza de garantía escrita.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-neutral-300">
              <span className="px-2.5 py-1 bg-[#121212] border border-neutral-800 rounded-sm">[ HASH INMUTABLE ]</span>
              <span className="px-2.5 py-1 bg-[#121212] border border-neutral-800 rounded-sm">[ PÓLIZA ACTIVA ]</span>
              <span className="px-2.5 py-1 bg-[#121212] border border-neutral-800 rounded-sm text-[#CCFF00]">[ VERIFICACIÓN EN VIVO ]</span>
            </div>
          </div>

          {/* Tarjeta de la Credencial enmarcada en verde lima */}
          <div className="w-full lg:w-auto flex justify-center">
            <HeroCredencialQR />
          </div>
        </div>
      </section>

      {/* Acceso Rápido a Servicios (Estilo Brutalista) */}
      <section id="servicios" className="bg-[#0B0B0B] py-16 sm:py-20 border-b border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs text-[#CCFF00] font-bold tracking-widest">[ PANEL RÁPIDO ]</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                SERVICIOS Y CONSULTAS EN LÍNEA
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Operatividad activa en todo el Distrito Capital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Tarjeta 1: Pedir Mecánico */}
            <div className="bg-[#121212] border border-neutral-800 rounded-sm p-6 flex flex-col justify-between hover:border-[#CCFF00] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-sm bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                    <Wrench className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#CCFF00]">
                    [ INMEDIATO ]
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  PEDIR MECÁNICO HOY
                </h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Atención en menos de 45 minutos en tu ubicación.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full h-11 text-xs font-bold bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#050505] rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>[ AGENDAR SERVICIO ]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tarjeta 2: Historial por Placa */}
            <div className="bg-[#121212] border border-neutral-800 rounded-sm p-6 flex flex-col justify-between hover:border-[#00E5FF] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-sm bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                    <Search className="w-5 h-5 text-[#00E5FF]" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400">
                    [ CONSULTA ]
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  HISTORIAL POR PLACA
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Revisa servicios, diagnósticos y Pasaporte Técnico.
                </p>
              </div>

              <form onSubmit={handleSearchPlate} className="space-y-2">
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="EJ. AD456EF"
                  className="w-full h-10 px-3 text-xs uppercase font-mono font-medium rounded-sm border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#CCFF00] bg-[#050505] text-white"
                />
                <button
                  type="submit"
                  className="w-full h-10 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-[#CCFF00] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Search className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>[ BUSCAR ]</span>
                </button>
              </form>
            </div>

            {/* Tarjeta 3: Verificar Carnet QR */}
            <div className="bg-[#121212] border border-neutral-800 rounded-sm p-6 flex flex-col justify-between hover:border-[#16A34A] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-sm bg-[#16A34A]/10 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A]">
                    <QrCode className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#16A34A]">
                    [ SEGURO ]
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  VERIFICAR CARNET QR
                </h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Valida a tu especialista antes de permitir el acceso.
                </p>
              </div>

              <Link
                href="/carnet/CAR-8492"
                className="w-full h-11 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-[#CCFF00] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>[ ESCANEAR CARNET ]</span>
                <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </Link>
            </div>

            {/* Tarjeta 4: Portal de Aliados */}
            <div className="bg-[#121212] border border-neutral-800 rounded-sm p-6 flex flex-col justify-between hover:border-neutral-500 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-sm bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                    <UserCircle className="w-5 h-5 text-neutral-300" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400">
                    [ RED TTM ]
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  PORTAL DE ALIADOS
                </h3>
                <p className="text-xs text-neutral-400 mb-6">
                  Mecánicos, Talleres, Runners y Repuesteras.
                </p>
              </div>

              <Link
                href="/aliados/portal"
                className="w-full h-11 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-[#CCFF00] rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>[ ENTRAR AL PORTAL ]</span>
                <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Sección de Prueba Social */}
      <SocialProof />

      {/* Footer Brutalista */}
      <footer id="contacto" className="bg-[#050505] border-t border-neutral-800 py-10 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TUTALLERMÓVIL (TTM) — TITULAR: JOSÉ ÁNGEL ACOSTA LLOVERA. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="text-[#CCFF00] hover:underline">
              [ TÉRMINOS Y PRIVACIDAD ]
            </Link>
            <span>·</span>
            <span>CARACAS, VENEZUELA</span>
          </div>
        </div>
      </footer>

      {/* Botón Flotante Soporte WhatsApp */}
      <BotonSoporteWhatsApp modo="fab" />

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
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0B0B0B] text-white p-4 rounded-sm shadow-2xl border border-[#CCFF00] flex items-center justify-between gap-4 font-mono uppercase"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-[#CCFF00] flex items-center justify-center text-[#050505] shrink-0 font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#050505]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#CCFF00] tracking-wider">
                  [ ORDEN DESPACHADA ]
                </p>
                <p className="text-xs text-white">
                  {toastMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
