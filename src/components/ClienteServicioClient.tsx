'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import {
  Car,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  Check,
  X,
  ChevronRight,
  QrCode,
  BadgeCheck,
  Camera,
  Upload,
  Share2,
  FileText,
  DollarSign,
  AlertCircle,
  Navigation,
  Eye,
  ZoomIn,
  MessageCircle,
  Shield,
  Star,
  Receipt,
  CheckCircle
} from 'lucide-react';

interface OrdenCliente {
  id: string;
  cliente_nombre: string;
  cliente_telefono?: string | null;
  vehiculo_marca?: string | null;
  vehiculo_modelo: string;
  vehiculo_anio?: number | string | null;
  placa?: string | null;
  falla_reportada: string;
  sector: string;
  estado: string;
  ganancia_estimada?: number | string | null;
  foto_odometro_url?: string | null;
  created_at?: string;
  mecanico_id?: string | null;
}

// Datos por defecto si la orden es de prueba o nueva
const DATOS_DEFAULT: OrdenCliente = {
  id: 'TTM-ORD-7892',
  cliente_nombre: 'María Rodríguez',
  vehiculo_marca: 'Toyota',
  vehiculo_modelo: 'Toyota Corolla 2018',
  vehiculo_anio: 2018,
  placa: 'AB123CD',
  falla_reportada: 'Chirrido agudo al frenar y pedal de freno esponjoso',
  sector: 'Chacao — Calle El Retiro, Qta. Milagrosa',
  estado: 'EN_EJECUCION',
  ganancia_estimada: 65.0,
  foto_odometro_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
  created_at: new Date().toISOString()
};

const MECANICO_INFO = {
  nombre: 'Carlos Mendoza',
  codigo: '#TTM-0842',
  especialidad: 'Especialista Máster en Frenos y Tren Delantero',
  rating: 4.95,
  serviciosCompletados: 124,
  ranking: 'Top 5% Caracas',
  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  telefono: '+58 412 123 4567',
  whatsapp: '584121234567'
};

const FOTOS_EVIDENCIAS_DEMO = [
  {
    titulo: 'Odómetro Inicial',
    tipo: 'Verificación de Kilometraje',
    url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    titulo: 'Pastillas Desgastadas (Antes)',
    tipo: 'Diagnóstico Visual',
    url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80'
  },
  {
    titulo: 'Pastillas Cerámicas Nuevas (Después)',
    tipo: 'Repuesto Instalado',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'
  }
];

export function ClienteServicioClient({ id }: { id: string }) {
  const [orden, setOrden] = useState<OrdenCliente>({ ...DATOS_DEFAULT, id });
  const [cargando, setCargando] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [minutosLlegada, setMinutosLlegada] = useState<number>(18);
  const [segundosLlegada, setSegundosLlegada] = useState<number>(42);

  // Modales
  const [modalCarnetOpen, setModalCarnetOpen] = useState<boolean>(false);
  const [modalFotoZoom, setModalFotoZoom] = useState<string | null>(null);
  const [modalAprobarPresupuesto, setModalAprobarPresupuesto] = useState<boolean>(false);
  const [modalPagoOpen, setModalPagoOpen] = useState<boolean>(false);
  const [presupuestoAprobado, setPresupuestoAprobado] = useState<boolean>(false);
  const [pagoEnviado, setPagoEnviado] = useState<boolean>(false);

  // 1. Detección de Scroll para Header con Glassmorphism Dinámico
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Cronómetro regresivo simulado en vivo (ETA de llegada)
  useEffect(() => {
    const timer = setInterval(() => {
      setSegundosLlegada((prev) => {
        if (prev > 0) return prev - 1;
        setMinutosLlegada((min) => (min > 0 ? min - 1 : 0));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Consulta y Realtime con Supabase
  useEffect(() => {
    const cargarOrden = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('ordenes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          setOrden({
            id: data.id,
            cliente_nombre: data.cliente_nombre || 'Cliente TTM',
            cliente_telefono: data.cliente_telefono || null,
            vehiculo_marca: data.vehiculo_marca || 'Vehículo',
            vehiculo_modelo: data.vehiculo_modelo || 'Toyota Corolla',
            vehiculo_anio: data.vehiculo_anio || 2018,
            placa: data.placa || 'AB123CD',
            falla_reportada: data.falla_reportada || 'Servicio de mantenimiento',
            sector: data.sector || 'Caracas',
            estado: data.estado || 'EN_EJECUCION',
            ganancia_estimada: data.ganancia_estimada || 65.0,
            foto_odometro_url: data.foto_odometro_url || null,
            created_at: data.created_at || new Date().toISOString(),
            mecanico_id: data.mecanico_id || null
          });
        }
      } catch (err) {
        console.warn('Cargando orden con valores por defecto para demostración:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarOrden();

    // Supabase Realtime para cambios de estado en vivo
    const supabase = createClient();
    const channel = supabase
      .channel(`cliente_orden_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('⚡ Actualización de orden en tiempo real:', payload);
          if (payload.new) {
            setOrden((prev) => ({
              ...prev,
              ...(payload.new as OrdenCliente)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Mapeo del estado a etapas de la línea de tiempo
  const etapaActiva = useMemo(() => {
    switch (orden.estado) {
      case 'LEAD_NUEVO':
      case 'DISPONIBLE':
      case 'DIAGNOSTICO_AGENDADO':
        return 0; // Confirmado / Buscando
      case 'ASIGNADO':
      case 'REPUESTOS_EN_RUTA':
        return 1; // En Ruta
      case 'EN_EJECUCION':
      case 'EN_SERVICIO':
        return 2; // En Reparación
      case 'PENDIENTE_PAGO':
      case 'LIQUIDACION_PENDIENTE':
      case 'FINALIZADO':
        return 3; // Listo
      default:
        return 2;
    }
  }, [orden.estado]);

  // Título e indicador Hero
  const estadoHero = useMemo(() => {
    switch (orden.estado) {
      case 'LEAD_NUEVO':
      case 'DISPONIBLE':
        return {
          titulo: 'Buscando Especialista',
          subtitulo: 'Localizando el taller móvil más cercano a tu ubicación...',
          colorBadge: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      case 'ASIGNADO':
        return {
          titulo: 'Especialista en Camino',
          subtitulo: `${MECANICO_INFO.nombre} va en ruta hacia ${orden.sector}`,
          colorBadge: 'bg-blue-100 text-[#1E56B0] border-blue-200'
        };
      case 'REPUESTOS_EN_RUTA':
        return {
          titulo: 'Repuestos en Ruta',
          subtitulo: 'Runner TTM despachando repuestos originales certificados',
          colorBadge: 'bg-sky-100 text-sky-800 border-sky-300'
        };
      case 'EN_EJECUCION':
      case 'EN_SERVICIO':
        return {
          titulo: 'Servicio en Ejecución',
          subtitulo: 'Diagnóstico en sitio e inspección técnica de 25 puntos activa',
          colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        };
      case 'PENDIENTE_PAGO':
      case 'LIQUIDACION_PENDIENTE':
        return {
          titulo: 'Servicio Finalizado',
          subtitulo: 'Revisa tu diagnóstico y aprueba el comprobante de pago',
          colorBadge: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      case 'FINALIZADO':
        return {
          titulo: '¡Servicio Garantizado!',
          subtitulo: 'Tu vehículo ha sido reparado con garantía de satisfacción',
          colorBadge: 'bg-[#CCFF00] text-[#0A1525] border-[#0A1525]/20'
        };
      default:
        return {
          titulo: 'Servicio en Proceso',
          subtitulo: 'Tu vehículo está siendo atendido por profesionales certificados',
          colorBadge: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  }, [orden.estado, orden.sector]);

  // Lista de fotos de evidencias combinadas (odómetro real + fotos técnicas)
  const listaEvidencias = useMemo(() => {
    const list = [...FOTOS_EVIDENCIAS_DEMO];
    if (orden.foto_odometro_url) {
      list[0] = {
        titulo: 'Odómetro Real (Subido en Sitio)',
        tipo: 'Evidencia Certificada TTM',
        url: orden.foto_odometro_url
      };
    }
    return list;
  }, [orden.foto_odometro_url]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A1525] font-sans antialiased selection:bg-[#CCFF00] selection:text-[#0A1525] pb-40">
      
      {/* ======================================================== */}
      {/* 1. HEADER INMERSIVO (Glassmorphism + Parallax Scroll)   */}
      {/* ======================================================== */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-md bg-white/85 py-3 border-b border-[#CBD5E1]/60 shadow-md'
            : 'backdrop-blur-xs bg-white/70 py-4 border-b border-transparent'
        }`}
      >
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          
          {/* Logo TTM */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#0A1525] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-2xs group-hover:bg-[#1E56B0] transition-colors">
              <span className="text-[#CCFF00]">T</span>TM
            </div>
            <div className="leading-tight">
              <span className="text-sm font-black text-[#0A1525] tracking-tight block">
                TuTallerMóvil
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Asistencia en Vivo
              </span>
            </div>
          </Link>

          {/* Botón de Soporte */}
          <a
            href={`https://wa.me/${MECANICO_INFO.whatsapp}?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20servicio%20${orden.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 rounded-full bg-[#F8FAFC] hover:bg-slate-100 border border-[#CBD5E1] text-[#0A1525] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Soporte</span>
          </a>

        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION: Estado Actual Dinámico y Auto 3D Flotante */}
      {/* ======================================================== */}
      <section className="max-w-md mx-auto px-4 pt-4 pb-6 text-center space-y-4">
        
        {/* Ilustración 3D de Auto Flotante en Bucle Suave */}
        <div className="relative py-2 flex items-center justify-center">
          
          {/* Resplandor de Fondo */}
          <div className="absolute inset-0 max-w-[260px] mx-auto bg-gradient-to-tr from-[#CCFF00]/30 to-[#1E56B0]/20 rounded-full blur-2xl pointer-events-none -z-10" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#0A1525] via-[#1E56B0] to-[#0A1525] p-1 shadow-2xl flex items-center justify-center border-2 border-white/40">
              <div className="w-full h-full rounded-[22px] bg-[#0A1525] flex flex-col items-center justify-center relative overflow-hidden">
                <Car className="w-14 h-14 text-[#CCFF00] stroke-[1.8] drop-shadow-md" />
                <span className="absolute bottom-2 text-[9px] font-mono font-black uppercase text-white/70 tracking-widest">
                  TTM • GPS
                </span>
              </div>
            </div>

            {/* Sombra Dinámica Debajo del Auto */}
            <motion.div
              animate={{ scale: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-20 h-3 bg-black/40 rounded-full mx-auto blur-xs mt-3"
            />
          </motion.div>
        </div>

        {/* Textos de Estado con Efecto Cascada (Stagger) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
          className="space-y-2"
        >
          {/* Badge del Estado */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-2xs"
          >
            <span className={`px-3 py-1 rounded-full border ${estadoHero.colorBadge}`}>
              {estadoHero.titulo}
            </span>
          </motion.div>

          {/* Tipografía Extra Grande para el Estado */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-[#0A1525] leading-tight"
          >
            {estadoHero.titulo}
          </motion.h1>

          {/* Subtítulo Descriptivo */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="text-xs sm:text-sm text-slate-600 font-medium max-w-xs mx-auto leading-relaxed"
          >
            {estadoHero.subtitulo}
          </motion.p>

          {/* Cronómetro en Vivo de Llegada Estimada */}
          {orden.estado !== 'FINALIZADO' && (
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="pt-1"
            >
              <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-4 py-2 rounded-2xl shadow-2xs">
                <Clock className="w-4 h-4 text-[#1E56B0] animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-bold text-slate-700">
                  Llegada estimada:{' '}
                  <strong className="text-[#0A1525] font-mono font-black text-sm">
                    {minutosLlegada}:{segundosLlegada < 10 ? `0${segundosLlegada}` : segundosLlegada} min
                  </strong>
                </span>
              </div>
            </motion.div>
          )}

        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 4. LÍNEA DE TIEMPO VISUAL: Progreso Horizontal Interactivo */}
      {/* ======================================================== */}
      <section className="max-w-md mx-auto px-4 py-4">
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 sm:p-5 shadow-xs">
          
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Progreso del Servicio
            </span>
            <span className="text-xs font-mono font-bold text-[#1E56B0]">
              Paso {etapaActiva + 1} de 4
            </span>
          </div>

          <div className="relative flex items-center justify-between">
            
            {/* Barra de Fondo */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0" />

            {/* Barra de Progreso Dinámica con Rayo de Luz */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{
                width: `${(etapaActiva / 3) * 100}%`
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#1E56B0] via-[#3B82F6] to-[#CCFF00] rounded-full z-0 shadow-xs"
            />

            {/* 4 Pasos */}
            {[
              { id: 0, label: 'Confirmado', icon: CheckCircle2 },
              { id: 1, label: 'En Ruta', icon: Navigation },
              { id: 2, label: 'Reparación', icon: Wrench },
              { id: 3, label: 'Listo', icon: Sparkles }
            ].map((paso) => {
              const isPassed = etapaActiva > paso.id;
              const isActive = etapaActiva === paso.id;
              const IconComponent = paso.icon;

              return (
                <div key={paso.id} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#CCFF00] text-[#0A1525] ring-4 ring-[#CCFF00]/40 shadow-lg scale-110'
                        : isPassed
                        ? 'bg-[#1E56B0] text-white shadow-sm'
                        : 'bg-white text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isActive ? (
                      <span className="relative flex h-full w-full items-center justify-center">
                        <IconComponent className="w-4 h-4 text-[#0A1525] stroke-[2.5]" />
                      </span>
                    ) : isPassed ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold tracking-tight text-center ${
                      isActive
                        ? 'text-[#0A1525] font-black'
                        : isPassed
                        ? 'text-[#1E56B0]'
                        : 'text-slate-400'
                    }`}
                  >
                    {paso.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. BENTO GRID: La Información del Servicio               */}
      {/* ======================================================== */}
      <section className="max-w-md mx-auto px-4 py-2 space-y-3.5">
        
        {/* Bento Grid Principal: 2 Columnas */}
        <div className="grid grid-cols-2 gap-3.5">

          {/* Tarjeta Grande: El Mecánico (col-span-2, Dark Mode #0A1525) */}
          <motion.div
            whileHover={{ y: -2 }}
            className="col-span-2 bg-[#0A1525] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden"
          >
            {/* Acento Sutil de Fondo */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#1E56B0]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Cabecera Mecánico */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={MECANICO_INFO.foto}
                    alt={MECANICO_INFO.nombre}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#CCFF00] shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center font-black shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {MECANICO_INFO.nombre}
                    </h3>
                    <BadgeCheck className="w-4 h-4 text-[#CCFF00]" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {MECANICO_INFO.especialidad}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5 text-xs">
                    <span className="flex items-center gap-1 text-amber-300 font-black">
                      <Star className="w-3 h-3 fill-amber-300" />
                      {MECANICO_INFO.rating}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-[#CCFF00] font-bold">
                      {MECANICO_INFO.ranking}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Llamar Directo */}
              <a
                href={`tel:${MECANICO_INFO.telefono}`}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-[#CCFF00] hover:text-[#0A1525] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Llamar al Mecánico"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Botón Gigante en Verde Lima: Verificar Carnet QR */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalCarnetOpen(true)}
              className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/20 transition-all cursor-pointer active:scale-95 border border-[#0A1525]/10 relative z-10"
            >
              <QrCode className="w-4 h-4 text-[#0A1525] stroke-[2.5]" />
              <span>Verificar Carnet QR Oficial</span>
              <ShieldCheck className="w-4 h-4 text-[#0A1525]" />
            </motion.button>
          </motion.div>

          {/* Tarjeta Pequeña 1: Vehículo */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 shadow-2xs hover:border-[#1E56B0] transition-all flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center mb-3 shadow-2xs">
              <Car className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Vehículo
              </span>
              <h4 className="text-xs sm:text-sm font-black text-[#0A1525] leading-tight line-clamp-2">
                {[orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                  .filter(Boolean)
                  .join(' ') || orden.vehiculo_modelo}
              </h4>
              <p className="text-[11px] font-mono font-bold text-slate-600 pt-1">
                Placa: <strong className="text-[#0A1525]">{orden.placa || 'AB123CD'}</strong>
              </p>
            </div>
          </motion.div>

          {/* Tarjeta Pequeña 2: Falla Reportada */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 shadow-2xs hover:border-[#1E56B0] transition-all flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 shadow-2xs">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Síntoma Reportado
              </span>
              <p className="text-xs font-bold text-[#0A1525] leading-snug line-clamp-3">
                {orden.falla_reportada}
              </p>
              <span className="text-[10px] text-emerald-700 font-extrabold block pt-1">
                ✓ Garantía QA 3% activa
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. GALERÍA DE EVIDENCIAS: Carrusel Horizontal Snap       */}
      {/* ======================================================== */}
      <section className="max-w-md mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#1E56B0]" />
            <h3 className="text-sm font-black tracking-tight text-[#0A1525]">
              Evidencias del Mecánico
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            {listaEvidencias.length} fotos registradas
          </span>
        </div>

        {/* Carrusel Horizontal Snap */}
        <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
          {listaEvidencias.map((foto, index) => (
            <motion.div
              key={index}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModalFotoZoom(foto.url)}
              className="snap-start shrink-0 w-64 sm:w-72 bg-white rounded-3xl border border-[#CBD5E1] overflow-hidden shadow-xs hover:border-[#1E56B0] transition-all cursor-pointer group"
            >
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={foto.url}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0A1525]/85 backdrop-blur-xs text-[#CCFF00] font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {foto.tipo}
                </div>
                <div className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-white/90 text-[#0A1525] flex items-center justify-center shadow-xs">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="text-xs font-black text-[#0A1525] line-clamp-1">
                  {foto.titulo}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Subido en sitio • Certificado TTM
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. BOTTOM ACTION BAR: Fijo e Inmersivo (Glassmorphism)   */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-white/90 border-t border-slate-200/80 shadow-2xl rounded-t-3xl p-4 pb-8 sm:pb-6">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          
          {/* Si está pendiente de pago */}
          {orden.estado === 'PENDIENTE_PAGO' || orden.estado === 'LIQUIDACION_PENDIENTE' ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalPagoOpen(true)}
              className="w-full h-14 bg-[#1E56B0] hover:bg-[#164388] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer border border-blue-500/30"
            >
              <Receipt className="w-5 h-5" />
              <span>Subir Comprobante de Pago</span>
              <ChevronRight className="w-4 h-4 text-blue-200" />
            </motion.button>
          ) : !presupuestoAprobado ? (
            /* Botón Principal: Aprobar Presupuesto con Brillo Verde Lima */
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalAprobarPresupuesto(true)}
              className="w-full h-14 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/40 transition-all cursor-pointer border border-[#0A1525]/10 animate-pulse-subtle"
            >
              <Sparkles className="w-5 h-5 text-[#0A1525]" />
              <span>Aprobar Presupuesto ($65.00 USD)</span>
              <ChevronRight className="w-4 h-4 text-[#0A1525]" />
            </motion.button>
          ) : (
            /* Presupuesto Ya Aprobado: Contactar y Ver Estado */
            <div className="flex items-center gap-2 w-full">
              <a
                href={`https://wa.me/${MECANICO_INFO.whatsapp}?text=Hola%20Carlos,%20he%20aprobado%20el%20presupuesto%20de%20mi%20servicio%20${orden.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-14 bg-[#0A1525] hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#CCFF00]" />
                <span>Chat con Carlos</span>
              </a>

              <button
                type="button"
                onClick={() => setModalCarnetOpen(true)}
                className="h-14 px-4 bg-[#F8FAFC] hover:bg-slate-100 border border-[#CBD5E1] text-[#0A1525] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#1E56B0]" />
                <span>Carnet</span>
              </button>
            </div>
          )}

        </div>
      </nav>

      {/* ======================================================== */}
      {/* MODAL 1: VERIFICAR CARNET QR DEL MECÁNICO                */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalCarnetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setModalCarnetOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Credencial Oficial Verificada
                </span>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight mt-1.5">
                  {MECANICO_INFO.nombre}
                </h3>
                <p className="text-xs font-mono font-bold text-slate-500">
                  {MECANICO_INFO.codigo} • Especialista TTM
                </p>
              </div>

              {/* QR Escaneable */}
              <div className="bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-center">
                <QRCodeSVG
                  value={`https://tutallermovil.vercel.app/carnet/${encodeURIComponent('TTM-0842')}`}
                  size={170}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-[11px] text-slate-500 font-semibold mt-2">
                  Escanea con la cámara para validar carnet en línea
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/carnet/TTM-0842"
                  className="w-full h-11 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Ver Carnet Completo en Pantalla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setModalCarnetOpen(false)}
                  className="w-full h-10 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: ZOOM DE FOTO DE EVIDENCIA                       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalFotoZoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full bg-[#0A1525] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setModalFotoZoom(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-[#0A1525] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={modalFotoZoom}
                alt="Evidencia ampliada"
                className="w-full h-auto max-h-[75vh] object-contain"
              />

              <div className="p-4 bg-[#0A1525] text-center border-t border-slate-800">
                <p className="text-xs font-bold text-slate-300">
                  Evidencia fotográfica en alta resolución • TuTallerMóvil QA
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: APROBAR PRESUPUESTO                            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalAprobarPresupuesto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-md">
                <FileText className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  Aprobar Presupuesto
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Desglose formal del servicio para {orden.vehiculo_modelo}
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Pastillas de Freno Delanteras (Bosch)</span>
                  <span className="font-mono font-bold text-[#0A1525]">$35.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Mano de Obra Certificada</span>
                  <span className="font-mono font-bold text-[#0A1525]">$30.00</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                  <span>Diagnóstico Inicial</span>
                  <span>GRATIS (Exonerado)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black text-[#0A1525]">
                  <span>Total Final:</span>
                  <span className="font-mono text-base text-[#1E56B0]">$65.00 USD</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPresupuestoAprobado(true);
                    setModalAprobarPresupuesto(false);
                  }}
                  className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar y Autorizar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalAprobarPresupuesto(false)}
                  className="w-full h-10 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Revisar después
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 4: SUBIR COMPROBANTE DE PAGO                       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalPagoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setModalPagoOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#1E56B0] text-white flex items-center justify-center mx-auto shadow-md">
                <Receipt className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  Reportar Pago
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Monto a pagar: <strong className="text-[#0A1525] font-mono text-sm">$65.00 USD</strong> (o en Bs tasa BCV)
                </p>
              </div>

              {/* Datos Bancarios TTM */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 text-left text-xs space-y-1">
                <p className="font-bold text-[#0A1525]">Pago Móvil Banesco (0134)</p>
                <p className="text-slate-600">CI/RIF: <strong className="text-slate-800">J-501234567</strong></p>
                <p className="text-slate-600">Teléfono: <strong className="text-slate-800">0414-9876543</strong></p>
                <p className="text-[11px] text-slate-400 pt-0.5">Zelle: pagos@tutallermovil.com</p>
              </div>

              {/* Selector de Archivo de Comprobante */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 hover:border-[#1E56B0] transition-colors cursor-pointer bg-slate-50">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-[#0A1525] block">
                  Adjuntar captura de pantalla
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG o PDF de la transferencia
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPagoEnviado(true);
                    setModalPagoOpen(false);
                    alert('¡Comprobante enviado con éxito! Despacho central confirmará tu pago en breve.');
                  }}
                  className="w-full h-12 bg-[#1E56B0] hover:bg-[#164388] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Enviar Comprobante</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
export default ClienteServicioClient;
