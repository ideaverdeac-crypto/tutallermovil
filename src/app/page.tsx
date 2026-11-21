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
  Shield
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
import BotonSoporteWhatsApp from '@/components/BotonSoporteWhatsApp';
import { SocialProof } from '@/components/SocialProof';

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
    <div className="min-h-screen bg-white text-brand-trust flex flex-col font-sans selection:bg-brand-primary selection:text-white">
      {/* 1. Barra Superior Informativa (Top Bar) */}
      <div className="bg-brand-trust text-white text-xs sm:text-small py-2 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div className="flex items-center gap-2 font-medium flex-wrap justify-center">
            {/* Punto de estado activo con verde brand.success */}
            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success" />
            </span>
            <span>
              Especialistas activos hoy en Caracas • Llegada en &lt; 45 min • Aceptamos Zelle, Pago Móvil y Cashea
            </span>
          </div>
        </div>
      </div>

      {/* 2. Header (Navegación) */}
      <header className="bg-white border-b border-brand-neutral-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Soporte WhatsApp en Header */}
            <BotonSoporteWhatsApp modo="header" className="hidden md:inline-flex" />

            {/* Si NO hay sesión: Botón Secundario 'Ingresar' */}
            {!session ? (
              <Link
                href="/login-cliente"
                className="h-10 px-3.5 text-xs sm:text-small font-semibold bg-white hover:bg-brand-neutral-50 text-brand-trust border border-brand-neutral-300 rounded-card transition-standard flex items-center gap-1.5 cursor-pointer shadow-card active:scale-[0.98]"
                title="Iniciar sesión en Tu Garaje"
              >
                <User className="w-4 h-4 text-brand-trust shrink-0" />
                <span>Ingresar</span>
              </Link>
            ) : (
              /* Si SÍ hay sesión: Botón Secundario 'Mi Garaje' */
              <Link
                href="/cliente/dashboard"
                className="h-10 px-3.5 text-xs sm:text-small font-semibold bg-brand-trust hover:bg-slate-800 text-white rounded-card transition-standard flex items-center gap-1.5 cursor-pointer shadow-card active:scale-[0.98]"
                title="Ir a Mi Garaje y Pasaporte Técnico"
              >
                <Car className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="hidden sm:inline">Mi Garaje</span>
                <span className="sm:hidden">Garaje</span>
              </Link>
            )}

            {/* Acceso Staff / Aliados */}
            <Link
              href="/login"
              className="w-10 h-10 rounded-card text-brand-neutral-400 hover:text-brand-trust hover:bg-brand-neutral-100 flex items-center justify-center transition-standard cursor-pointer border border-transparent hover:border-brand-neutral-200 active:scale-[0.98]"
              title="Acceso Staff & Aliados"
              aria-label="Acceso Staff & Aliados"
            >
              <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Arriba del Fold: Titular y Credencial QR Protagonista) */}
      <section className="relative bg-gradient-to-b from-white via-brand-neutral-50/60 to-brand-neutral-100 py-10 sm:py-14 lg:py-16 border-b border-brand-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Columna Izquierda: Titular y Acciones */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Insignia Oferta Gancho */}
              <div>
                <div className="inline-flex items-center gap-2 bg-brand-neutral-100 text-brand-trust px-3.5 py-1.5 rounded-full font-semibold text-xs sm:text-small border border-brand-neutral-300 shadow-card">
                  <Sparkles className="w-4 h-4 shrink-0 text-brand-primary" />
                  <span>
                    Diagnóstico a Domicilio $15 USD — 100% GRATIS si reparas &gt; $40 hoy
                  </span>
                </div>
              </div>

              {/* H1 Principal con Escala Display y Tracking Tight */}
              <h1 className="text-display tracking-tight text-brand-trust">
                Mecánica automotriz a domicilio{' '}
                <span className="text-brand-primary font-semibold">
                  en Caracas
                </span>
              </h1>

              {/* Subtítulo */}
              <p className="text-body text-brand-neutral-600 max-w-2xl mx-auto lg:mx-0 font-normal">
                Especialistas certificados en la puerta de tu casa u oficina con escaneo computarizado OBD2, repuestos garantizados y la única plataforma con <strong className="text-brand-trust font-semibold">Credencial Digital de Confianza QR</strong> para tu total seguridad.
              </p>

              {/* CTAs de acción rápida: Un solo botón primario naranja */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1 justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="h-12 px-8 text-body font-semibold bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] text-white rounded-card shadow-card hover:scale-[1.02] transition-spring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Wrench className="w-5 h-5 text-white" />
                  <span>PEDIR MECÁNICO HOY</span>
                </button>

                <Link
                  href="/carnet/CAR-8492"
                  className="h-12 px-6 text-body font-semibold bg-white hover:bg-brand-neutral-50 text-brand-trust border border-brand-neutral-300 rounded-card transition-standard flex items-center justify-center gap-2 cursor-pointer shadow-card active:scale-[0.98] hover:border-brand-primary"
                >
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                  <span>Ver Credencial QR</span>
                </Link>
              </div>

              {/* Beneficios directos de Confianza (4 Pilares) */}
              <div className="pt-4 grid grid-cols-2 gap-3 text-left border-t border-brand-neutral-200">
                <div className="flex items-center gap-2 text-small text-brand-neutral-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Llegada en &lt; 45 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-small text-brand-neutral-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Mecánicos Verificados con QR</span>
                </div>
                <div className="flex items-center gap-2 text-small text-brand-neutral-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Garantía de 90 Días por Escrito</span>
                </div>
                <div className="flex items-center gap-2 text-small text-brand-neutral-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Diagnóstico $15 Exonerable</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Credencial QR convertida en HÉROE VISUAL Arriba del Fold */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <motion.div
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-sm bg-white border border-brand-neutral-200 rounded-card shadow-elevated p-6 flex flex-col items-center text-center space-y-4"
              >
                {/* Badge Superior "Verificado" con brand.success */}
                <div className="w-full flex items-center justify-between pb-3 border-b border-brand-neutral-200">
                  <div className="flex items-center gap-1.5 text-left">
                    <img
                      src="/icon.svg"
                      alt="TuTallerMóvil"
                      width={28}
                      height={28}
                      className="h-7 w-auto object-contain"
                    />
                    <div>
                      <p className="text-caption font-semibold uppercase text-brand-trust tracking-wider leading-none">
                        CREDENCIAL OFICIAL
                      </p>
                      <p className="text-[10px] text-brand-neutral-500 font-medium">
                        Personal en Sitio
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 bg-brand-success text-white px-2.5 py-1 rounded-full text-caption font-semibold shadow-card">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Verificado</span>
                  </div>
                </div>

                {/* Foto y Datos del Especialista */}
                <div className="flex items-center gap-3 w-full bg-brand-neutral-50 border border-brand-neutral-200 rounded-card p-3 text-left">
                  <img
                    src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=160&q=80"
                    alt="Carlos E. Mendoza - Mecánico Senior"
                    width={52}
                    height={52}
                    className="w-13 h-13 rounded-card object-cover border border-brand-neutral-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-semibold text-brand-trust truncate leading-tight">
                      Carlos E. Mendoza
                    </p>
                    <p className="text-small text-brand-primary font-medium truncate">
                      Mecánico 1 — Senior
                    </p>
                    <p className="text-caption font-mono text-brand-neutral-500">
                      ID: <span className="text-brand-trust font-semibold">#TTM-CAR-8492</span>
                    </p>
                  </div>
                </div>

                {/* Código QR: El elemento más grande después del titular */}
                <div className="p-4 bg-brand-neutral-50 border border-brand-neutral-200 rounded-card flex flex-col items-center justify-center w-full">
                  <div className="p-3 bg-white border border-brand-neutral-300 rounded-card shadow-card">
                    <QRCodeSVG
                      value="https://tutallermovil.vercel.app/carnet/CAR-8492"
                      size={160}
                      level="M"
                      includeMargin={false}
                      fgColor="#0A1525"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-small font-semibold text-brand-trust flex items-center justify-center gap-1.5">
                      <QrCode className="w-4 h-4 text-brand-primary" />
                      Código QR Antifraude
                    </p>
                    <p className="text-caption text-brand-neutral-500 max-w-[220px]">
                      Escanea para confirmar identidad y póliza antes de autorizar acceso.
                    </p>
                  </div>
                </div>

                {/* Pie de la Credencial */}
                <div className="w-full pt-1 flex items-center justify-between text-caption text-brand-neutral-500">
                  <span className="flex items-center gap-1 font-semibold text-brand-success">
                    <span className="w-2 h-2 rounded-full bg-brand-success inline-block animate-pulse" />
                    En Ruta Activa
                  </span>
                  <span className="font-mono text-[11px] text-brand-neutral-400">
                    HASH: 7855-TTM
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Menú de 4 Tarjetas de Acción Rápida */}
      <section className="bg-white py-12 sm:py-16 border-b border-brand-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-h2 text-brand-trust">
              Acceso Rápido a Servicios
            </h2>
            <p className="text-small text-brand-neutral-600">
              Selecciona una opción para gestionar tu vehículo de inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Tarjeta 1: Pedir Mecánico (CTA Primario) */}
            <div className="bg-white border border-brand-neutral-200 rounded-card p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-card bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Wrench className="w-5 h-5 text-brand-primary" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-control">
                    <Clock className="w-3 h-3" /> Inmediato
                  </span>
                </div>
                <h3 className="text-h3 text-brand-trust mb-1">
                  PEDIR MECÁNICO HOY
                </h3>
                <p className="text-small text-brand-neutral-600 mb-5">
                  En tu casa en menos de 45 minutos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full h-11 text-small font-semibold bg-brand-primary hover:bg-brand-primary-hover active:scale-[0.98] text-white rounded-card shadow-card hover:scale-[1.02] transition-spring flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/35 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Agendar Servicio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tarjeta 2: Historial por Placa (Secundario) */}
            <div className="bg-white border border-brand-neutral-200 rounded-card p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-card bg-brand-neutral-100 flex items-center justify-center text-brand-trust">
                    <Search className="w-5 h-5 text-brand-trust" />
                  </div>
                  <span className="text-caption font-semibold uppercase tracking-wider text-brand-neutral-500 bg-brand-neutral-100 px-2 py-0.5 rounded-control">
                    Consulta
                  </span>
                </div>
                <h3 className="text-h3 text-brand-trust mb-1">
                  HISTORIAL POR PLACA
                </h3>
                <p className="text-small text-brand-neutral-600 mb-3">
                  Revisa servicios y diagnósticos previos.
                </p>
              </div>

              <form onSubmit={handleSearchPlate} className="space-y-2">
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ej. AD456EF"
                  className="w-full h-11 px-3 text-small uppercase font-mono font-medium rounded-control border border-brand-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white text-brand-trust"
                />
                <button
                  type="submit"
                  className="w-full h-11 text-small font-semibold bg-white hover:bg-brand-neutral-50 text-brand-trust border border-brand-neutral-300 rounded-card transition-standard shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-brand-primary"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
              </form>
            </div>

            {/* Tarjeta 3: Verificar Carnet QR (Secundario) */}
            <div className="bg-white border border-brand-neutral-200 rounded-card p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-card bg-brand-success/10 flex items-center justify-center text-brand-success">
                    <QrCode className="w-5 h-5 text-brand-success" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wider text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-control">
                    <ShieldCheck className="w-3 h-3" /> Seguro
                  </span>
                </div>
                <h3 className="text-h3 text-brand-trust mb-1">
                  VERIFICAR CARNET QR
                </h3>
                <p className="text-small text-brand-neutral-600 mb-5">
                  Valida a tu especialista antes de permitir el acceso.
                </p>
              </div>

              <Link
                href="/carnet/CAR-8492"
                className="w-full h-11 text-small font-semibold bg-white hover:bg-brand-neutral-50 text-brand-trust border border-brand-neutral-300 rounded-card transition-standard shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-brand-primary"
              >
                <span>Escanear Carnet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tarjeta 4: Portal de Aliados (Secundario) */}
            <div className="bg-white border border-brand-neutral-200 rounded-card p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-card bg-brand-neutral-100 flex items-center justify-center text-brand-neutral-700">
                    <UserCircle className="w-5 h-5 text-brand-neutral-700" />
                  </div>
                  <span className="text-caption font-semibold uppercase tracking-wider text-brand-neutral-600 bg-brand-neutral-100 px-2 py-0.5 rounded-control">
                    Red TTM
                  </span>
                </div>
                <h3 className="text-h3 text-brand-trust mb-1">
                  PORTAL DE ALIADOS
                </h3>
                <p className="text-small text-brand-neutral-600 mb-5">
                  Mecánicos, Talleres, Runners y Repuesteras.
                </p>
              </div>

              <Link
                href="/aliados/portal"
                className="w-full h-11 text-small font-semibold bg-white hover:bg-brand-neutral-50 text-brand-trust border border-brand-neutral-300 rounded-card transition-standard shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:border-brand-primary"
              >
                <span>Ingresar al Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TAREA 5: Nueva Sección de Prueba Social */}
      <SocialProof />

      {/* 6. Footer */}
      <footer className="bg-white border-t border-brand-neutral-200 py-6 text-center text-caption text-brand-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TuTallerMóvil (TTM). Titular: José Ángel Acosta Llovera. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-caption font-semibold">
            <Link href="/terminos" className="text-brand-primary hover:underline">
              Términos, Condiciones y Privacidad
            </Link>
            <span className="text-brand-neutral-300">•</span>
            <span className="text-brand-neutral-500">Caracas, Venezuela</span>
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
            className="fixed bottom-6 right-6 z-50 max-w-md bg-brand-trust text-white p-4 rounded-container shadow-elevated border border-brand-primary flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-card bg-brand-primary flex items-center justify-center text-white shrink-0 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-caption font-semibold text-brand-primary uppercase tracking-wider">
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
              className="text-brand-neutral-400 hover:text-white p-1 rounded-control hover:bg-slate-800 transition-standard cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
