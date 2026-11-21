'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  X
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
import BotonSoporteWhatsApp from '@/components/BotonSoporteWhatsApp';
import { SocialProof } from '@/components/SocialProof';
import { MagneticButton } from '@/components/MagneticButton';
import { SplitText } from '@/components/SplitText';
import { CountUp } from '@/components/CountUp';
import { TiltCard } from '@/components/TiltCard';
import { Marquee } from '@/components/Marquee';
import { HeroCredencialQR } from '@/components/HeroCredencialQR';

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
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#050B14]">
      {/* 1. Barra Superior Informativa (Top Bar) */}
      <div className="bg-[#0A1525] text-slate-300 text-xs sm:text-small py-2.5 px-4 relative z-50 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div className="flex items-center gap-2.5 font-medium flex-wrap justify-center">
            {/* Punto de estado activo con verde firma */}
            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
            </span>
            <span className="tracking-wide">
              Especialistas activos hoy en Caracas • Llegada en &lt; 45 min • Aceptamos Zelle, Pago Móvil y Cashea
            </span>
          </div>
        </div>
      </div>

      {/* 2. Header (Navegación Awwwards Dark) */}
      <header className="bg-[#050B14]/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo Oficial TTM */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/icon.svg"
              alt="TuTallerMóvil"
              width={160}
              height={50}
              className="h-[46px] sm:h-[54px] w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Acceso Clientes ('Ingresar' o 'Mi Garaje') y Staff / Aliados */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Botón Soporte WhatsApp en Header */}
            <BotonSoporteWhatsApp modo="header" className="hidden md:inline-flex" />

            {/* Si NO hay sesión: Botón Secundario 'Ingresar' */}
            {!session ? (
              <Link
                href="/login-cliente"
                className="h-10 px-4 text-xs sm:text-small font-semibold bg-[#0F1B2D] hover:bg-[#14233a] text-white border border-slate-700/80 rounded-card transition-fast flex items-center gap-1.5 cursor-pointer shadow-card active:scale-[0.98] hover:border-[#CCFF00]/40"
                title="Iniciar sesión en Tu Garaje"
              >
                <User className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span>Ingresar</span>
              </Link>
            ) : (
              /* Si SÍ hay sesión: Botón 'Mi Garaje' */
              <Link
                href="/cliente/dashboard"
                className="h-10 px-4 text-xs sm:text-small font-semibold bg-[#0F1B2D] hover:bg-[#14233a] text-white border border-[#CCFF00]/40 rounded-card transition-fast flex items-center gap-1.5 cursor-pointer shadow-card active:scale-[0.98]"
                title="Ir a Mi Garaje y Pasaporte Técnico"
              >
                <Car className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span className="hidden sm:inline">Mi Garaje</span>
                <span className="sm:hidden">Garaje</span>
              </Link>
            )}

            {/* Acceso Staff / Aliados */}
            <Link
              href="/login"
              className="w-10 h-10 rounded-card text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-center transition-fast cursor-pointer border border-transparent hover:border-slate-700 active:scale-[0.98]"
              title="Acceso Staff & Aliados"
              aria-label="Acceso Staff & Aliados"
            >
              <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Awwwards Dark + Lima Firma + Ocupación 60% Titular) */}
      <section className="relative bg-[#050B14] py-14 sm:py-20 lg:py-24 border-b border-slate-800/80 overflow-hidden">
        {/* Resplandores ambientales técnicos de fondo */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#00E5FF]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Columna Izquierda: Titular Awwwards (Ocupa el 60% de ancho en Desktop) */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Insignia Oferta Gancho con CountUp de $15 */}
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 bg-[#0F1B2D] text-white px-4 py-1.5 rounded-full font-medium text-xs sm:text-small border border-[#00E5FF]/25 shadow-card backdrop-blur-md">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#CCFF00]" />
                  <span>
                    Diagnóstico a Domicilio{' '}
                    <CountUp
                      value={15}
                      prefix="$"
                      suffix=" USD"
                      className="text-[#CCFF00]"
                      childrenAfter="— 100% GRATIS si reparas > $40 hoy"
                    />
                  </span>
                </div>
              </div>

              {/* Titular Principal Display-XL con SplitText Reveal */}
              <div className="max-w-3xl">
                <h1 className="sr-only">
                  Mecánica automotriz a domicilio en Caracas
                </h1>
                <SplitText
                  text="Mecánica automotriz a domicilio en Caracas"
                  as="h1"
                  className="text-display-xl tracking-tight text-white font-normal leading-[0.95]"
                />
              </div>

              {/* Subtítulo */}
              <p className="text-body text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Especialistas certificados en la puerta de tu casa u oficina con escaneo computarizado OBD2, repuestos garantizados y la única plataforma con <strong className="text-[#CCFF00] font-semibold">Credencial Digital de Confianza QR</strong> para tu total seguridad.
              </p>

              {/* CTAs de acción rápida: Botón Magnético "PEDIR MECÁNICO HOY" */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start items-center">
                <MagneticButton strength={0.25}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="h-14 px-9 text-body font-bold bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#050B14] rounded-card shadow-limeGlow hover:scale-[1.02] transition-spring flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none tracking-tight"
                  >
                    <Wrench className="w-5 h-5 text-[#050B14]" />
                    <span>PEDIR MECÁNICO HOY</span>
                  </button>
                </MagneticButton>

                <Link
                  href="/carnet/CAR-8492"
                  className="h-14 px-7 text-body font-medium bg-[#0F1B2D] hover:bg-[#14233a] text-white border border-slate-700/90 hover:border-[#CCFF00]/50 rounded-card transition-base flex items-center justify-center gap-2 cursor-pointer shadow-card active:scale-[0.98]"
                >
                  <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
                  <span>Ver Credencial QR</span>
                </Link>
              </div>

              {/* Beneficios directos de Confianza (4 Pilares) */}
              <div className="pt-6 grid grid-cols-2 gap-3 text-left border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-small text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <span>Llegada en &lt; 45 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-small text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <span>Mecánicos Verificados con QR</span>
                </div>
                <div className="flex items-center gap-2 text-small text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <span>Garantía de 90 Días por Escrito</span>
                </div>
                <div className="flex items-center gap-2 text-small text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <span>Diagnóstico $15 Exonerable</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Credencial QR con Morphing y Parallax */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <HeroCredencialQR />
            </div>

          </div>
        </div>
      </section>

      {/* 4. Marquee Horizontal Infinito entre Hero y Acceso Rápido */}
      <Marquee text="LLEGADA < 45 MIN · GARANTÍA 90 DÍAS · CARACAS · DIAGNÓSTICO $15 · ESPECIALISTAS OBD2 · CREDENCIAL QR ·" />

      {/* 5. Menú de 4 Tarjetas de Acción Rápida con Tilt 3D */}
      <section className="bg-[#0A1525] py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-h2 font-medium text-white tracking-tight">
              Acceso Rápido a Servicios
            </h2>
            <p className="text-small text-slate-400 mt-1">
              Selecciona una opción para gestionar tu vehículo de inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Tarjeta 1: Pedir Mecánico (CTA Primario) */}
            <TiltCard
              maxTiltDeg={6}
              className="bg-[#0F1B2D] border border-slate-800 rounded-card p-6 shadow-card flex flex-col justify-between h-full hover:border-[#CCFF00]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-card bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] group-hover:rotate-8 transition-transform duration-200">
                    <Wrench className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-caption font-mono uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-control">
                    <Clock className="w-3 h-3" /> Inmediato
                  </span>
                </div>
                <h3 className="text-h3 font-medium text-white mb-1 tracking-tight">
                  PEDIR MECÁNICO HOY
                </h3>
                <p className="text-small text-slate-400 mb-6">
                  En tu casa en menos de 45 minutos.
                </p>
              </div>

              <MagneticButton strength={0.2} className="w-full">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full h-12 text-small font-bold bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#050B14] rounded-card shadow-limeGlow hover:scale-[1.02] transition-spring flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span>Agendar Servicio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </MagneticButton>
            </TiltCard>

            {/* Tarjeta 2: Historial por Placa */}
            <TiltCard
              maxTiltDeg={6}
              className="bg-[#0F1B2D] border border-slate-800 rounded-card p-6 shadow-card flex flex-col justify-between h-full hover:border-[#00E5FF]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-card bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] group-hover:rotate-8 transition-transform duration-200">
                    <Search className="w-5 h-5 text-[#00E5FF]" />
                  </div>
                  <span className="text-caption font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-control">
                    Consulta
                  </span>
                </div>
                <h3 className="text-h3 font-medium text-white mb-1 tracking-tight">
                  HISTORIAL POR PLACA
                </h3>
                <p className="text-small text-slate-400 mb-4">
                  Revisa servicios y diagnósticos previos.
                </p>
              </div>

              <form onSubmit={handleSearchPlate} className="space-y-2.5">
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ej. AD456EF"
                  className="w-full h-11 px-3 text-small uppercase font-mono font-medium rounded-control border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] bg-[#050B14] text-white"
                />
                <button
                  type="submit"
                  className="w-full h-11 text-small font-medium bg-[#0A1525] hover:bg-[#14233a] text-white border border-slate-700 rounded-card transition-fast shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-[#CCFF00]/40"
                >
                  <Search className="w-4 h-4 text-[#CCFF00]" />
                  <span>Buscar</span>
                </button>
              </form>
            </TiltCard>

            {/* Tarjeta 3: Verificar Carnet QR */}
            <TiltCard
              maxTiltDeg={6}
              className="bg-[#0F1B2D] border border-slate-800 rounded-card p-6 shadow-card flex flex-col justify-between h-full hover:border-[#16A34A]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-card bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] group-hover:rotate-8 transition-transform duration-200">
                    <QrCode className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-caption font-mono uppercase tracking-wider text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-0.5 rounded-control">
                    <ShieldCheck className="w-3 h-3" /> Seguro
                  </span>
                </div>
                <h3 className="text-h3 font-medium text-white mb-1 tracking-tight">
                  VERIFICAR CARNET QR
                </h3>
                <p className="text-small text-slate-400 mb-6">
                  Valida a tu especialista antes de permitir el acceso.
                </p>
              </div>

              <Link
                href="/carnet/CAR-8492"
                className="w-full h-11 text-small font-medium bg-[#0A1525] hover:bg-[#14233a] text-white border border-slate-700 rounded-card transition-fast shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-[#CCFF00]/40"
              >
                <span>Escanear Carnet</span>
                <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </Link>
            </TiltCard>

            {/* Tarjeta 4: Portal de Aliados */}
            <TiltCard
              maxTiltDeg={6}
              className="bg-[#0F1B2D] border border-slate-800 rounded-card p-6 shadow-card flex flex-col justify-between h-full hover:border-[#FF006E]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-card bg-slate-800 flex items-center justify-center text-slate-300 group-hover:rotate-8 transition-transform duration-200">
                    <UserCircle className="w-5 h-5 text-slate-300" />
                  </div>
                  <span className="text-caption font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-control">
                    Red TTM
                  </span>
                </div>
                <h3 className="text-h3 font-medium text-white mb-1 tracking-tight">
                  PORTAL DE ALIADOS
                </h3>
                <p className="text-small text-slate-400 mb-6">
                  Mecánicos, Talleres, Runners y Repuesteras.
                </p>
              </div>

              <Link
                href="/aliados/portal"
                className="w-full h-11 text-small font-medium bg-[#0A1525] hover:bg-[#14233a] text-white border border-slate-700 rounded-card transition-fast shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-[#CCFF00]/40"
              >
                <span>Ingresar al Portal</span>
                <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </Link>
            </TiltCard>

          </div>
        </div>
      </section>

      {/* 6. Sección de Prueba Social (Con Tilt 3D y Clip-Path en Evidencias) */}
      <SocialProof />

      {/* 7. Footer */}
      <footer className="bg-[#050B14] border-t border-slate-800 py-8 text-center text-caption text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TuTallerMóvil (TTM). Titular: José Ángel Acosta Llovera. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-caption font-medium">
            <Link href="/terminos" className="text-[#CCFF00] hover:underline">
              Términos, Condiciones y Privacidad
            </Link>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Caracas, Venezuela</span>
          </div>
        </div>
      </footer>

      {/* Botón Flotante (FAB) Soporte WhatsApp */}
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
            className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F1B2D] text-white p-4 rounded-container shadow-elevated border border-[#CCFF00] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-card bg-[#CCFF00] flex items-center justify-center text-[#050B14] shrink-0 font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#050B14]" />
              </div>
              <div>
                <p className="text-caption font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
                  Orden Despachada
                </p>
                <p className="text-small font-medium text-white">
                  {toastMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-control hover:bg-slate-800 transition-fast cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
