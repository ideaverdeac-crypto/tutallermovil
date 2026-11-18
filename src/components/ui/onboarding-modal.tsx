'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Kanban,
  Bike,
  Store,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  FileDown,
  Calculator,
  UserPlus,
  Radio,
  ClipboardCheck,
  Wallet,
  KeyRound,
  Lock,
  Package,
  Clock,
  Car,
  Compass
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'OPERADORA' | 'MECANICO' | 'RUNNER' | 'REPUESTOS';

interface SlideContent {
  badge: string;
  titulo: string;
  descripcion: string;
  resaltado: string;
  icono: React.ElementType;
}

const SLIDES_POR_ROL: Record<UserRole, SlideContent[]> = {
  MECANICO: [
    {
      badge: 'Paso 1 de 3 • Oportunidades en Tiempo Real',
      titulo: 'Bienvenido a tu Portal de Especialista',
      descripcion:
        'Visualiza solicitudes de diagnóstico y reparación técnica activas en tu zona en Caracas. Conectamos clientes cercanos calculando la distancia y tiempo de llegada en vivo.',
      resaltado: 'Fórmula Haversine GPS con cálculo de proximidad exacta',
      icono: Compass
    },
    {
      badge: 'Paso 2 de 3 • Estándar de Calidad Incondicional',
      titulo: 'Gestiona tus Servicios en Sitio',
      descripcion:
        'Al llegar, captura la fotografía del odómetro vehicular y completa el checklist digital de 18 puntos. Garantizamos total confianza y transparencia con el cliente.',
      resaltado: 'Fotos comprimidas al vuelo y checklist inmutable para garitas',
      icono: ClipboardCheck
    },
    {
      badge: 'Paso 3 de 3 • Tesorería y Cobro Inmediato',
      titulo: 'Cobra tus Ganancias sin Retrasos',
      descripcion:
        'Lleva el control de tus ingresos acumulados. Al finalizar, la central valida tu liquidación y el 3% protege el Fondo de Garantía QA para respaldo incondicional.',
      resaltado: 'Liquidaciones acreditadas a través de TuTallerMóvil Pay',
      icono: Wallet
    }
  ],
  OPERADORA: [
    {
      badge: 'Paso 1 de 3 • Torre de Control Central',
      titulo: 'Tu Centro de Comando y Despacho',
      descripcion:
        'Monitorea el ciclo completo de cada vehículo en el tablero táctico Kanban: desde diagnósticos agendados y compras de repuestos hasta la liquidación final con SLA de 45 minutos.',
      resaltado: 'Drag & Drop táctil con actualización en vivo vía Supabase Realtime',
      icono: Kanban
    },
    {
      badge: 'Paso 2 de 3 • Cotizador Oficial y Exportación',
      titulo: 'Cotiza en Segundos con Catálogo Oficial',
      descripcion:
        'Busca piezas originales en las casas de repuestos de Caracas. Aplica la regla P0 de exoneración ($40) y exporta cotizaciones formales en PDF con un solo clic.',
      resaltado: 'Generador automático de PDF A4 y cotizaciones oficiales',
      icono: Calculator
    },
    {
      badge: 'Paso 3 de 3 • Despacho sin Errores',
      titulo: 'Despacha sin Esperas ni Errores',
      descripcion:
        'Utiliza el Radar de Mecánicos para forzar asignaciones manuales en rutas críticas y coordina con los runners motorizados para entregas de piezas express.',
      resaltado: 'Bitácora de auditoría inmutable de cada acción de despacho',
      icono: UserPlus
    }
  ],
  RUNNER: [
    {
      badge: 'Paso 1 de 3 • Logística Express',
      titulo: 'Recoge las Piezas en el Mayorista',
      descripcion:
        'Tus órdenes te indican la Casa de Repuestos asignada (ej. AutoPartes Chacao) con dirección exacta y acceso directo para navegación en Waze o Google Maps.',
      resaltado: 'Interfaz Mobile-First diseñada para botones táctiles grandes en ruta',
      icono: Bike
    },
    {
      badge: 'Paso 2 de 3 • Seguridad de Inventario',
      titulo: 'Candado de Seguridad con Código PIN',
      descripcion:
        'Al presentarte en el mostrador del mayorista, suministra tu código PIN personal de 4 dígitos para autorizar el despacho seguro de las piezas de la orden.',
      resaltado: 'Candado de verificación estricto para proteger el inventario',
      icono: KeyRound
    },
    {
      badge: 'Paso 3 de 3 • Entrega al Mecánico',
      titulo: 'Inicia la Ruta y Entrega en Sitio',
      descripcion:
        'Conduce hacia la ubicación del cliente, entrega los repuestos al especialista asignado y pulsa "Entregado al Mecánico" para activar la ejecución de la obra.',
      resaltado: 'Tu saldo acumulado se actualiza en tiempo real por cada entrega',
      icono: CheckCircle2
    }
  ],
  REPUESTOS: [
    {
      badge: 'Paso 1 de 3 • Bandeja B2B de Pedidos',
      titulo: 'Recibe Pedidos de la Red TuTallerMóvil',
      descripcion:
        'Visualiza solicitudes de repuestos al instante cuando la central confirme un presupuesto con el cliente. Conoce la pieza, marca y modelo del vehículo a surtir.',
      resaltado: 'Bandeja estructurada con indicador de pedidos en tiempo real',
      icono: Store
    },
    {
      badge: 'Paso 2 de 3 • Mensajero Asignado',
      titulo: 'Monitorea la Llegada del Runner',
      descripcion:
        'Observa en vivo el nombre del motorizado, modelo de moto y placa para la garita, con tiempo de llegada aproximado de 5 a 8 minutos y llamada directa.',
      resaltado: 'Ficha logística detallada para entrega rápida en mostrador',
      icono: Package
    },
    {
      badge: 'Paso 3 de 3 • Despacho Seguro',
      titulo: 'Valida con PIN y Gestiona tu Catálogo',
      descripcion:
        'Solicita el PIN de 4 dígitos al runner para registrar el retiro. Además, puedes publicar o editar tus repuestos con fotos tomadas directamente con tu cámara.',
      resaltado: 'Carga fotográfica con compresión automática y control de stock',
      icono: Lock
    }
  ],
  ADMIN: [
    {
      badge: 'Paso 1 de 3 • Visión Ejecutiva 360°',
      titulo: 'Control Financiero y Tesorería C-Level',
      descripcion:
        'Supervisa en tiempo real los ingresos brutos, comisiones netas retenidas y el uso de la caja rotativa Cashea ($4,000.00 límite) con métricas consolidadas.',
      resaltado: 'Gráficos interactivos de 7 días y análisis de volumen por categoría',
      icono: Landmark
    },
    {
      badge: 'Paso 2 de 3 • Respaldo Absoluto',
      titulo: 'El Fondo de Garantía QA (3%)',
      descripcion:
        'La joya de la corona: cada liquidación concilia automáticamente el 3% en una bóveda intangible para respaldar la garantía incondicional de 30 días para el cliente.',
      resaltado: 'Custodia activa para que nada detenga las operaciones en calle',
      icono: ShieldCheck
    },
    {
      badge: 'Paso 3 de 3 • Trazabilidad Total',
      titulo: 'Bitácora Inmutable y Liquidaciones',
      descripcion:
        'Audita en tiempo real cada acción ejecutada por operadoras y libera pagos de mano de obra a especialistas certificados con un solo clic tras la validación de calidad.',
      resaltado: 'Trazabilidad criptográfica SHA-256 en cada movimiento de caja',
      icono: Sparkles
    }
  ]
};

interface OnboardingModalProps {
  rol: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function OnboardingModal({ rol, isOpen: isOpenProp, onClose: onCloseProp }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [slideActual, setSlideActual] = useState<number>(0);
  const [direccion, setDireccion] = useState<number>(1);

  const storageKey = `onboarding_seen_${rol.toLowerCase()}`;

  // Verificar si ya fue visto
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isOpenProp !== undefined) {
        setIsOpen(isOpenProp);
      } else {
        const visto = localStorage.getItem(storageKey);
        if (!visto) {
          setIsOpen(true);
        }
      }
    }
  }, [rol, isOpenProp, storageKey]);

  const slides = SLIDES_POR_ROL[rol] || SLIDES_POR_ROL.OPERADORA;
  const slide = slides[slideActual];
  const esUltimoSlide = slideActual === slides.length - 1;

  const handleCerrarOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    setIsOpen(false);
    if (onCloseProp) onCloseProp();
  };

  const handleSiguiente = () => {
    if (esUltimoSlide) {
      handleCerrarOnboarding();
    } else {
      setDireccion(1);
      setSlideActual((prev) => prev + 1);
    }
  };

  const handleAnterior = () => {
    if (slideActual > 0) {
      setDireccion(-1);
      setSlideActual((prev) => prev - 1);
    }
  };

  const IconoActual = slide.icono;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        
        {/* Backdrop con Blur Suave */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCerrarOnboarding}
          className="fixed inset-0 bg-[#0A1525]/65 backdrop-blur-sm"
        />

        {/* Tarjeta Modal Bento (Blanco Puro y Bordes Redondeados) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl bg-white rounded-3xl sm:rounded-4xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-9 flex flex-col justify-between overflow-hidden my-auto"
        >
          {/* Botón Saltar / Cerrar */}
          <button
            type="button"
            onClick={handleCerrarOnboarding}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Saltar tutorial"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ======================================================== */}
          {/* CONTENIDO DEL SLIDE (ANIMADO CON FRAMER MOTION) */}
          {/* ======================================================== */}
          <div className="min-h-[360px] sm:min-h-[380px] flex flex-col justify-center items-center text-center px-1 sm:px-4">
            <AnimatePresence mode="wait" custom={direccion}>
              <motion.div
                key={slideActual}
                custom={direccion}
                initial={{ opacity: 0, x: direccion > 0 ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direccion > 0 ? -50 : 50 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center"
              >
                {/* Badge de Rol y Progreso */}
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1E56B0]/10 text-[#1E56B0] text-[11px] font-black uppercase tracking-wider mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>{slide.badge}</span>
                </span>

                {/* Icono Inmenso Central con Fondo de Marca */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center shadow-xl border border-slate-700/60 relative group">
                    <IconoActual className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2]" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#CCFF00] border-2 border-white flex items-center justify-center text-[#0A1525] text-xs font-black shadow-xs">
                      {slideActual + 1}
                    </span>
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight leading-snug max-w-md">
                  {slide.titulo}
                </h3>

                {/* Párrafo Descriptivo */}
                <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed max-w-md mt-2.5">
                  {slide.descripcion}
                </p>

                {/* Tarjetita de Resaltado (Bento Chip) */}
                <div className="mt-4 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-bold text-[#1E56B0] max-w-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{slide.resaltado}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ======================================================== */}
          {/* FOOTER DEL MODAL: DOTS Y BOTÓN PRINCIPAL */}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Puntos de Paginación (Dots con Expansión a Píldora #CCFF00) */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => {
                const isActive = idx === slideActual;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDireccion(idx > slideActual ? 1 : -1);
                      setSlideActual(idx);
                    }}
                    className="focus:outline-none transition-all cursor-pointer p-1"
                    title={`Ir al paso ${idx + 1}`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-8 bg-[#CCFF00] border border-[#0A1525]/20 shadow-2xs'
                          : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Controles de Navegación */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {slideActual > 0 && (
                <button
                  type="button"
                  onClick={handleAnterior}
                  className="h-12 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
              )}

              {/* Botón Principal (Verde Lima #CCFF00) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSiguiente}
                className={`flex-1 sm:flex-initial h-12 px-6 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  esUltimoSlide
                    ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border border-[#0A1525]/15'
                    : 'bg-[#0A1525] hover:bg-[#1E56B0] text-white'
                }`}
              >
                <span>{esUltimoSlide ? '¡Empezar a Trabajar!' : 'Siguiente'}</span>
                {esUltimoSlide ? (
                  <Sparkles className="w-4 h-4 text-[#0A1525]" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                )}
              </motion.button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
