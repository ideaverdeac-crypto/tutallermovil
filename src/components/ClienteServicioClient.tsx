'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
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
  CheckCircle,
  Settings,
  Bike,
  Loader2,
  HelpCircle,
  ThumbsUp,
  CreditCard,
  Layers,
  PackageCheck,
  Tag
} from 'lucide-react';

export interface RepuestoDetallado {
  id: string;
  nombre: string;
  marca: string;
  referencia: string;
  foto_url: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  compatibilidad: string;
  garantia: string;
  estado_pieza: string;
}

const REPUESTOS_FALLBACK_DEFAULT: RepuestoDetallado[] = [
  {
    id: 'rep-01',
    nombre: 'Pastillas de Freno Delanteras Cerámicas',
    marca: 'Bosch Blue Edition',
    referencia: 'Ref: BP-1210-HD',
    foto_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80',
    cantidad: 1,
    precio_unitario: 25.0,
    precio_total: 25.0,
    compatibilidad: 'Toyota Corolla 2014-2022 / Matrix',
    garantia: 'Garantía QA 90 días / 5,000 km',
    estado_pieza: '100% Nuevo en Caja Sellada'
  },
  {
    id: 'rep-02',
    nombre: 'Líquido de Frenos Sintético DOT 4 (500 ml)',
    marca: 'Motul Brake Fluid',
    referencia: 'Ref: MOT-DOT4-500',
    foto_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80',
    cantidad: 1,
    precio_unitario: 10.0,
    precio_total: 10.0,
    compatibilidad: 'Especificación SAE J1704 / ISO 4925',
    garantia: 'Certificado Sellado de Fábrica',
    estado_pieza: 'Insumo Nuevo Grado Automotriz'
  }
];

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
  estado: 'COTIZADO',
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
  const [minutosLlegada, setMinutosLlegada] = useState<number>(14);
  const [segundosLlegada, setSegundosLlegada] = useState<number>(30);

  // Modales y paneles interactivos
  const [modalCarnetOpen, setModalCarnetOpen] = useState<boolean>(false);
  const [modalFotoZoom, setModalFotoZoom] = useState<string | null>(null);
  const [modalAprobarPresupuesto, setModalAprobarPresupuesto] = useState<boolean>(false);
  const [modalPagoOpen, setModalPagoOpen] = useState<boolean>(false);
  const [modalCalificacionOpen, setModalCalificacionOpen] = useState<boolean>(false);

  // Estados de acciones
  const [guardandoAprobacion, setGuardandoAprobacion] = useState<boolean>(false);
  const [presupuestoRechazado, setPresupuestoRechazado] = useState<boolean>(false);
  const [subiendoComprobante, setSubiendoComprobante] = useState<boolean>(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [confirmandoPago, setConfirmandoPago] = useState<boolean>(false);

  // Encuesta de calificación
  const [calificacionEstrellas, setCalificacionEstrellas] = useState<number>(5);
  const [comentarioCalificacion, setComentarioCalificacion] = useState<string>('');
  const [calificacionEnviada, setCalificacionEnviada] = useState<boolean>(false);

  // Lista detallada de repuestos que se van a instalar en el vehículo
  const [repuestosDetallados, setRepuestosDetallados] = useState<RepuestoDetallado[]>(REPUESTOS_FALLBACK_DEFAULT);

  // Referencia para input de archivo comprobante
  const inputComprobanteRef = useRef<HTMLInputElement>(null);

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

  // 3. Conexión en Tiempo Real con Supabase Realtime
  useEffect(() => {
    const cargarOrden = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('ordenes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          setOrden({
            id: data.id,
            cliente_nombre: data.cliente_nombre || 'Cliente TTM',
            cliente_telefono: data.cliente_telefono || null,
            vehiculo_marca: data.vehiculo_marca || 'Vehículo',
            vehiculo_modelo: data.vehiculo_modelo || 'Toyota Corolla',
            vehiculo_anio: data.vehiculo_anio || 2018,
            placa: data.placa || 'AB123CD',
            falla_reportada: data.falla_reportada || 'Servicio de mantenimiento automotriz',
            sector: data.sector || 'Caracas',
            estado: data.estado || 'COTIZADO',
            ganancia_estimada: data.ganancia_estimada || 65.0,
            foto_odometro_url: data.foto_odometro_url || null,
            created_at: data.created_at || new Date().toISOString(),
            mecanico_id: data.mecanico_id || null
          });

          // Consultar repuestos asociados a la orden en orden_repuestos
          try {
            const { data: repuestosData } = await supabase
              .from('orden_repuestos')
              .select('id, repuesto_id, cantidad, precio_al_momento, repuestos(*)')
              .eq('orden_id', id);

            if (repuestosData && repuestosData.length > 0) {
              const formateados: RepuestoDetallado[] = repuestosData.map((item: any) => ({
                id: item.id || item.repuesto_id,
                nombre: item.repuestos?.nombre_repuesto || 'Repuesto Original Certificado',
                marca: item.repuestos?.marca || 'Marca Oficial',
                referencia: item.repuestos?.id ? `Ref: TTM-${String(item.repuestos.id).slice(0, 6).toUpperCase()}` : 'OEM Genuino',
                foto_url: item.repuestos?.foto_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80',
                cantidad: item.cantidad || 1,
                precio_unitario: Number(item.precio_al_momento) || 25.0,
                precio_total: (Number(item.precio_al_momento) || 25.0) * (item.cantidad || 1),
                compatibilidad: item.repuestos?.compatibilidad || `${data.vehiculo_modelo || 'Vehículo'} • Especificación OEM`,
                garantia: 'Garantía QA 90 días / 5,000 km',
                estado_pieza: '100% Nuevo en Caja Sellada'
              }));
              setRepuestosDetallados(formateados);
            }
          } catch (errRep) {
            console.warn('Usando catálogo descriptivo de repuestos para demostración:', errRep);
          }
        }
      } catch (err) {
        console.warn('Cargando orden con valores por defecto para demostración:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarOrden();

    // Supabase Realtime: Escuchar cambios de estado ejecutados por Operadora / Mecánico / Runner
    const supabase = createClient();
    const channel = supabase
      .channel(`cliente_realtime_orden_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('⚡ Actualización en vivo recibida en Portal Cliente:', payload);
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

  // Cálculos de Cotización y Repuestos
  const repuestosTotal = useMemo(() => {
    return repuestosDetallados.reduce((acc, curr) => acc + curr.precio_total, 0);
  }, [repuestosDetallados]);

  const totalCotizado = useMemo(() => {
    const val = typeof orden.ganancia_estimada === 'number' && orden.ganancia_estimada > 0
      ? Number(orden.ganancia_estimada)
      : parseFloat(String(orden.ganancia_estimada || '65')) || 65.0;
    return val;
  }, [orden.ganancia_estimada]);

  const manoDeObra = useMemo(() => {
    const calculada = totalCotizado - repuestosTotal;
    return calculada > 0 ? Math.round(calculada * 100) / 100 : Math.round(totalCotizado * 0.45 * 100) / 100;
  }, [totalCotizado, repuestosTotal]);

  const exoneraDiagnostico = totalCotizado > 40;

  // Mapeo dinámico del estado según regla de negocio
  const configuracionEstado = useMemo(() => {
    switch (orden.estado) {
      case 'EN_INSPECCION':
      case 'ASIGNADO':
      case 'DIAGNOSTICO_AGENDADO':
        return {
          etapaIndex: 0,
          titulo: 'El mecánico está revisando tu vehículo',
          subtitulo: `${MECANICO_INFO.nombre} está en sitio realizando la inspección técnica de 25 puntos y captura del odómetro.`,
          icono: Wrench,
          iconoAnimacion: {
            rotate: [-10, 10, -10],
            transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          } as TargetAndTransition,
          colorBadge: 'bg-blue-100 text-[#1E56B0] border-blue-200'
        };
      case 'COTIZADO':
      case 'ESPERANDO_APROBACION':
        return {
          etapaIndex: 1,
          titulo: '¡Tu presupuesto está listo!',
          subtitulo: 'Revisa el desglose de mano de obra y repuestos originales. Tu aprobación inicia el despacho.',
          icono: FileText,
          iconoAnimacion: {
            scale: [1, 1.08, 1],
            transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
          } as TargetAndTransition,
          colorBadge: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      case 'REPUESTOS_EN_RUTA':
      case 'RUNNER_ASIGNADO':
      case 'APROBADO':
        return {
          etapaIndex: 2,
          titulo: 'Buscando tus repuestos',
          subtitulo: 'El runner oficial va en ruta trasladando los repuestos certificados al punto de servicio.',
          icono: Bike,
          iconoAnimacion: {
            x: [-4, 4, -4],
            transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
          } as TargetAndTransition,
          colorBadge: 'bg-sky-100 text-sky-800 border-sky-300'
        };
      case 'EN_EJECUCION':
      case 'EN_SERVICIO':
        return {
          etapaIndex: 3,
          titulo: 'Reparando tu vehículo',
          subtitulo: 'El técnico especialista está instalando las piezas nuevas bajo protocolo de garantía QA.',
          icono: Settings,
          iconoAnimacion: {
            rotate: 360,
            transition: { repeat: Infinity, duration: 4.5, ease: 'linear' }
          } as TargetAndTransition,
          colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        };
      case 'PENDIENTE_PAGO':
      case 'LIQUIDACION_PENDIENTE':
      case 'TRABAJO_TERMINADO':
        return {
          etapaIndex: 4,
          titulo: '¡Tu vehículo está listo!',
          subtitulo: 'La reparación y prueba de ruta han culminado exitosamente. Realiza el pago para liberar la garantía oficial.',
          icono: CheckCircle,
          iconoAnimacion: {
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 2 }
          } as TargetAndTransition,
          colorBadge: 'bg-purple-100 text-purple-900 border-purple-300'
        };
      case 'PAGADO':
      case 'FINALIZADO':
        return {
          etapaIndex: 4,
          titulo: '¡Servicio Pagado y Garantizado!',
          subtitulo: 'Gracias por confiar en TuTallerMóvil. Tu garantía QA del 3% está respaldada por 90 días.',
          icono: ShieldCheck,
          iconoAnimacion: { scale: 1 } as TargetAndTransition,
          colorBadge: 'bg-[#CCFF00] text-[#0A1525] border-[#0A1525]/20'
        };
      default:
        return {
          etapaIndex: 0,
          titulo: 'Buscando Especialista',
          subtitulo: 'Asignando el taller móvil con mejor puntuación disponible en tu zona.',
          icono: Car,
          iconoAnimacion: { y: [0, -6, 0] } as TargetAndTransition,
          colorBadge: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  }, [orden.estado]);

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

  // Lógica de Aprobación de Cotización (UPDATE a ordenes con estado: APROBADO)
  const handleAprobarPresupuesto = async () => {
    setGuardandoAprobacion(true);
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({ estado: 'APROBADO' })
        .eq('id', id);

      setOrden((prev) => ({ ...prev, estado: 'APROBADO' }));
      setModalAprobarPresupuesto(false);

      // Pequeño confeti de confirmación
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#CCFF00', '#1E56B0', '#0A1525']
        });
      } catch (e) {
        // Fallback silencioso si el canvas no está montado
      }
    } catch (err) {
      console.error('Error al aprobar presupuesto en Supabase:', err);
    } finally {
      setGuardandoAprobacion(false);
    }
  };

  const handleRechazarPresupuesto = () => {
    setPresupuestoRechazado(true);
    setModalAprobarPresupuesto(false);
  };

  // Subir Comprobante al bucket 'evidencias'
  const handleSubirComprobante = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoComprobante(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanId = id ? id.replace(/[^a-zA-Z0-9_-]/g, '_') : 'orden';
      const fileName = `comprobante_pago_${cleanId}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('evidencias')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message || 'Error al subir comprobante');
      }

      const { data: publicUrlData } = supabase.storage
        .from('evidencias')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        setComprobanteUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      console.error('Error al subir comprobante:', err);
      alert('No se pudo subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setSubiendoComprobante(false);
    }
  };

  // Confirmar Pago (Pasa a PAGADO, dispara Confeti y abre Encuesta 5 estrellas)
  const handleConfirmarPago = async () => {
    setConfirmandoPago(true);
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({ estado: 'PAGADO' })
        .eq('id', id);

      setOrden((prev) => ({ ...prev, estado: 'PAGADO' }));
      setModalPagoOpen(false);

      // Lanzar Confeti Festivo
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#CCFF00', '#1E56B0', '#0A1525', '#16A34A', '#F59E0B']
        });
      } catch (e) {
        console.warn('Confetti trigger:', e);
      }

      // Abrir encuesta de satisfacción de 5 estrellas
      setModalCalificacionOpen(true);
    } catch (err) {
      console.error('Error al confirmar pago en Supabase:', err);
    } finally {
      setConfirmandoPago(false);
    }
  };

  // Enviar Calificación del Mecánico
  const handleEnviarCalificacion = () => {
    setCalificacionEnviada(true);
    console.log('[CLIENTE CALIFICACIÓN] Mecánico evaluado exitosamente:', {
      ordenId: id,
      mecanico: MECANICO_INFO.nombre,
      estrellas: calificacionEstrellas,
      comentario: comentarioCalificacion,
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      setModalCalificacionOpen(false);
    }, 2200);
  };

  const IconoHero = configuracionEstado.icono;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A1525] font-sans antialiased selection:bg-[#CCFF00] selection:text-[#0A1525] pb-44">
      
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

          {/* Botón de Soporte WhatsApp */}
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
      {/* 2. HERO SECTION: Estado Actual Dinámico e Icono Animado  */}
      {/* ======================================================== */}
      <section className="max-w-md mx-auto px-4 pt-4 pb-6 text-center space-y-4">
        
        {/* Ilustración 3D de Auto / Icono Flotante en Bucle Suave */}
        <div className="relative py-2 flex items-center justify-center">
          
          {/* Resplandor de Fondo */}
          <div className="absolute inset-0 max-w-[260px] mx-auto bg-gradient-to-tr from-[#CCFF00]/30 to-[#1E56B0]/20 rounded-full blur-2xl pointer-events-none -z-10" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#0A1525] via-[#1E56B0] to-[#0A1525] p-1 shadow-2xl flex items-center justify-center border-2 border-white/40">
              <div className="w-full h-full rounded-[22px] bg-[#0A1525] flex flex-col items-center justify-center relative overflow-hidden">
                <motion.div animate={configuracionEstado.iconoAnimacion}>
                  <IconoHero className="w-13 h-13 text-[#CCFF00] stroke-[2] drop-shadow-md" />
                </motion.div>
                <span className="absolute bottom-2 text-[9px] font-mono font-black uppercase text-white/70 tracking-widest">
                  TTM • GPS
                </span>
              </div>
            </div>

            {/* Sombra Dinámica Debajo del Auto */}
            <motion.div
              animate={{ scale: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-20 h-3 bg-black/40 rounded-full mx-auto blur-xs mt-3"
            />
          </motion.div>
        </div>

        {/* Textos de Estado Dinámicos */}
        <motion.div
          key={orden.estado}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-2"
        >
          {/* Badge del Estado */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-2xs">
            <span className={`px-3 py-1 rounded-full border ${configuracionEstado.colorBadge}`}>
              {orden.estado.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Tipografía Extra Grande para el Estado */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A1525] leading-tight px-2">
            {configuracionEstado.titulo}
          </h1>

          {/* Subtítulo Descriptivo */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
            {configuracionEstado.subtitulo}
          </p>

          {/* Cronómetro en Vivo de Llegada Estimada */}
          {orden.estado !== 'FINALIZADO' && orden.estado !== 'PAGADO' && (
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-4 py-2 rounded-2xl shadow-2xs">
                <Clock className="w-4 h-4 text-[#1E56B0] animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-bold text-slate-700">
                  Tiempo estimado:{' '}
                  <strong className="text-[#0A1525] font-mono font-black text-sm">
                    {minutosLlegada}:{segundosLlegada < 10 ? `0${segundosLlegada}` : segundosLlegada} min
                  </strong>
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 3. LÍNEA DE TIEMPO VISUAL: 5 Pasos del Ciclo de Vida     */}
      {/* ======================================================== */}
      <section className="max-w-md mx-auto px-4 py-2">
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 sm:p-5 shadow-xs">
          
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Progreso Operativo
            </span>
            <span className="text-xs font-mono font-bold text-[#1E56B0]">
              Fase {configuracionEstado.etapaIndex + 1} de 5
            </span>
          </div>

          <div className="relative flex items-center justify-between">
            
            {/* Barra de Fondo */}
            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0" />

            {/* Barra de Progreso Dinámica */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{
                width: `${(configuracionEstado.etapaIndex / 4) * 100}%`
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#1E56B0] via-[#3B82F6] to-[#CCFF00] rounded-full z-0 shadow-xs"
            />

            {/* 5 Pasos */}
            {[
              { id: 0, label: 'Inspección', icon: Wrench },
              { id: 1, label: 'Presupuesto', icon: FileText },
              { id: 2, label: 'Repuestos', icon: Bike },
              { id: 3, label: 'Reparación', icon: Settings },
              { id: 4, label: 'Listo', icon: CheckCircle2 }
            ].map((paso) => {
              const isPassed = configuracionEstado.etapaIndex > paso.id;
              const isActive = configuracionEstado.etapaIndex === paso.id;
              const IconComponent = paso.icon;

              return (
                <div key={paso.id} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#CCFF00] text-[#0A1525] ring-4 ring-[#CCFF00]/40 shadow-lg scale-110'
                        : isPassed
                        ? 'bg-[#1E56B0] text-white shadow-sm'
                        : 'bg-white text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isActive ? (
                      <IconComponent className="w-4 h-4 text-[#0A1525] stroke-[2.5]" />
                    ) : isPassed ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <IconComponent className="w-3.5 h-3.5 stroke-[2]" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-extrabold tracking-tight text-center ${
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
      {/* 4. TARJETA FLOTANTE GIGANTE: Aprobación de Cotización    */}
      {/* (Visible destacada en estado COTIZADO)                   */}
      {/* ======================================================== */}
      {(orden.estado === 'COTIZADO' || orden.estado === 'ESPERANDO_APROBACION') && !presupuestoRechazado && (
        <section className="max-w-md mx-auto px-4 py-2">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-5 border-2 border-[#1E56B0] shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs">
                  <FileText className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E56B0] block">
                    Cotización Lista para Aprobación
                  </span>
                  <h3 className="text-base font-black text-[#0A1525]">
                    Presupuesto Oficial de Servicio
                  </h3>
                </div>
              </div>
            </div>

            {/* Desglose Financiero con Detalle de Repuestos */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 space-y-3.5 text-xs">
              
              {/* 1. Detalle de Cada Repuesto a Instalar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="font-extrabold text-[#0A1525] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Repuestos Certificados a Instalar ({repuestosDetallados.length})</span>
                  </span>
                  <span className="font-mono font-bold text-[#1E56B0] text-xs">
                    Subtotal: ${repuestosTotal.toFixed(2)} USD
                  </span>
                </div>

                <div className="space-y-2.5">
                  {repuestosDetallados.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 transition-all hover:border-[#1E56B0]"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={rep.foto_url}
                          alt={rep.nombre}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-black text-xs text-[#0A1525] leading-snug">
                              {rep.nombre}
                            </h4>
                            <span className="font-mono font-black text-xs text-[#0A1525] shrink-0">
                              ${rep.precio_total.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1E56B0] border border-blue-100">
                              {rep.marca}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {rep.referencia}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 font-medium truncate pt-0.5">
                            {rep.compatibilidad}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{rep.estado_pieza}</span>
                        </span>
                        <span className="font-semibold text-slate-500">
                          Cant: <strong className="text-[#0A1525]">{rep.cantidad}</strong> (${rep.precio_unitario.toFixed(2)} c/u)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Mano de Obra Certificada */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between items-start py-1">
                  <div className="space-y-0.5">
                    <span className="text-slate-700 font-bold block text-xs">Mano de Obra Certificada</span>
                    <span className="text-[10px] text-slate-400 block">
                      Instalación en sitio, ajuste de torque según manual y prueba OBD2
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#0A1525] text-xs">
                    ${manoDeObra.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* 3. Diagnóstico Exonerado */}
              {exoneraDiagnostico && (
                <div className="flex items-center justify-between py-1.5 text-emerald-800 bg-emerald-50 px-2.5 rounded-xl border border-emerald-200 font-bold text-[11px]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Diagnóstico Inicial OBD2 (Regla &gt;$40)</span>
                  </span>
                  <span>✓ Exonerado ($15 GRATIS)</span>
                </div>
              )}

              {/* 4. Total Facturable */}
              <div className="flex justify-between items-baseline pt-2.5 border-t-2 border-slate-300 text-sm font-black text-[#0A1525]">
                <span>Total Facturable:</span>
                <span className="font-mono text-lg text-[#1E56B0]">
                  ${totalCotizado.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Dos Botones Gigantes: Aprobar y Reparar (#CCFF00) vs Rechazar */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={guardandoAprobacion}
                onClick={handleAprobarPresupuesto}
                className="w-full h-13 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/30 transition-all cursor-pointer active:scale-95 border border-[#0A1525]/10"
              >
                {guardandoAprobacion ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#0A1525]" />
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Aprobar y Reparar (${totalCotizado.toFixed(2)} USD)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRechazarPresupuesto}
                className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Rechazar o Modificar Cotización
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 5. PANEL DE PAGO (Estado PENDIENTE_PAGO)                  */}
      {/* ======================================================== */}
      {(orden.estado === 'PENDIENTE_PAGO' || orden.estado === 'LIQUIDACION_PENDIENTE' || orden.estado === 'TRABAJO_TERMINADO') && (
        <section className="max-w-md mx-auto px-4 py-2">
          <div className="bg-white rounded-3xl p-5 border-2 border-[#1E56B0] shadow-xl space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1E56B0] text-white flex items-center justify-center font-black shadow-xs">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Pago Requerido para Entrega
                </span>
                <h3 className="text-base font-black text-[#0A1525]">
                  Liquidación Final del Servicio
                </h3>
              </div>
            </div>

            {/* Datos Bancarios Pago Móvil y Zelle */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-baseline pb-2 border-b border-slate-200">
                <span className="font-extrabold text-slate-700">Monto Total a Conciliar:</span>
                <span className="font-mono text-base font-black text-[#0A1525]">
                  ${totalCotizado.toFixed(2)} USD
                </span>
              </div>
              <div className="space-y-1 text-slate-600 pt-1">
                <p className="font-bold text-[#0A1525]">Pago Móvil Banesco (0134)</p>
                <p>CI/RIF: <strong className="text-slate-800">J-501234567</strong></p>
                <p>Teléfono: <strong className="text-slate-800">0414-9876543</strong></p>
                <p className="text-[11px] text-slate-500 pt-0.5">Zelle: <strong className="text-slate-800">pagos@tutallermovil.com</strong></p>
              </div>
            </div>

            {/* Input escondido y Botón de Subir Comprobante */}
            <input
              type="file"
              ref={inputComprobanteRef}
              accept="image/*"
              className="hidden"
              onChange={handleSubirComprobante}
            />

            {subiendoComprobante ? (
              <div className="h-20 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-[#1E56B0] animate-spin" />
                <span className="text-xs font-bold text-[#0A1525]">Subiendo comprobante al bucket evidencias...</span>
              </div>
            ) : comprobanteUrl ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={comprobanteUrl}
                    alt="Comprobante"
                    className="w-14 h-14 rounded-xl object-cover border border-emerald-400"
                  />
                  <div>
                    <span className="text-xs font-black text-emerald-900 block">✓ Comprobante Cargado</span>
                    <span className="text-[10px] text-slate-500 font-mono">Bucket: evidencias</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => inputComprobanteRef.current?.click()}
                  className="text-xs font-bold text-slate-600 underline cursor-pointer p-1"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputComprobanteRef.current?.click()}
                className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1E56B0] bg-slate-50 hover:bg-blue-50/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Upload className="w-5 h-5 text-[#1E56B0]" />
                <div className="text-left">
                  <span className="text-xs font-black text-[#0A1525] block">Subir Comprobante de Pago</span>
                  <span className="text-[10px] text-slate-400">Captura de pantalla o recibo bancario</span>
                </div>
              </button>
            )}

            {/* Botón Confirmar Pago */}
            <button
              type="button"
              disabled={confirmandoPago}
              onClick={handleConfirmarPago}
              className="w-full h-12 bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              {confirmandoPago ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] group-hover:text-[#0A1525]" />
                  <span>Confirmar Pago y Liberar Vehículo</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 6. BENTO GRID: La Tarjeta del Mecánico + Vehículo         */}
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
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 shadow-2xs flex flex-col justify-between">
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
          </div>

          {/* Tarjeta Pequeña 2: Falla Reportada */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 shadow-2xs flex flex-col justify-between">
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
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. GALERÍA DE EVIDENCIAS: Carrusel Snap                   */}
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
      {/* 8. BOTTOM ACTION BAR: Fijo e Inmersivo (Glassmorphism)   */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-white/90 border-t border-slate-200/80 shadow-2xl rounded-t-3xl p-4 pb-8 sm:pb-6">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          
          {/* Si está en PENDIENTE_PAGO */}
          {orden.estado === 'PENDIENTE_PAGO' || orden.estado === 'LIQUIDACION_PENDIENTE' || orden.estado === 'TRABAJO_TERMINADO' ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalPagoOpen(true)}
              className="w-full h-14 bg-[#1E56B0] hover:bg-[#164388] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer border border-blue-500/30"
            >
              <CreditCard className="w-5 h-5 text-[#CCFF00]" />
              <span>Pagar Servicio (${totalCotizado.toFixed(2)} USD)</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </motion.button>
          ) : orden.estado === 'COTIZADO' || orden.estado === 'ESPERANDO_APROBACION' ? (
            /* Botón de Presupuesto Listo */
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalAprobarPresupuesto(true)}
              className="w-full h-14 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/40 transition-all cursor-pointer border border-[#0A1525]/10 animate-pulse-subtle"
            >
              <Sparkles className="w-5 h-5 text-[#0A1525]" />
              <span>Ver y Aprobar Presupuesto (${totalCotizado.toFixed(2)} USD)</span>
              <ChevronRight className="w-4 h-4 text-[#0A1525]" />
            </motion.button>
          ) : orden.estado === 'PAGADO' || orden.estado === 'FINALIZADO' ? (
            /* Servicio Pagado y Garantizado */
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-14 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pago Conciliado • Garantía 90 Días</span>
              </div>
              <button
                type="button"
                onClick={() => setModalCalificacionOpen(true)}
                className="h-14 px-4 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Calificar</span>
              </button>
            </div>
          ) : (
            /* Estado en curso (Inspección, Runner o Reparación) */
            <div className="flex items-center gap-2 w-full">
              <a
                href={`https://wa.me/${MECANICO_INFO.whatsapp}?text=Hola%20Carlos,%20quisiera%20consultar%20el%20avance%20de%20mi%20servicio%20${orden.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-14 bg-[#0A1525] hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#CCFF00]" />
                <span>Chat con {MECANICO_INFO.nombre.split(' ')[0]}</span>
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
              className="w-full max-w-lg bg-white rounded-3xl p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalAprobarPresupuesto(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-md">
                <FileText className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  Aprobar Presupuesto Detallado
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Revisa los repuestos e insumos certificados a montar en tu {orden.vehiculo_modelo}
                </p>
              </div>

              {/* Desglose con Repuestos Detallados */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-left space-y-3.5 text-xs">
                
                {/* Repuestos a Instalar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-extrabold text-[#0A1525] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Repuestos Certificados a Instalar ({repuestosDetallados.length})</span>
                    </span>
                    <span className="font-mono font-bold text-[#1E56B0]">
                      ${repuestosTotal.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {repuestosDetallados.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={rep.foto_url}
                            alt={rep.nombre}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="font-black text-xs text-[#0A1525] leading-snug">
                                {rep.nombre}
                              </h4>
                              <span className="font-mono font-black text-xs text-[#0A1525] shrink-0">
                                ${rep.precio_total.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1E56B0] border border-blue-100">
                                {rep.marca}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {rep.referencia}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 font-medium truncate pt-0.5">
                              {rep.compatibilidad}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                          <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>{rep.estado_pieza}</span>
                          </span>
                          <span className="font-semibold text-slate-500">
                            Cant: <strong className="text-[#0A1525]">{rep.cantidad}</strong> (${rep.precio_unitario.toFixed(2)} c/u)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mano de Obra */}
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between items-start py-1">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 font-bold block text-xs">Mano de Obra Certificada</span>
                      <span className="text-[10px] text-slate-400 block">
                        Instalación en sitio, ajuste de torque según manual y prueba OBD2
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#0A1525] text-xs">
                      ${manoDeObra.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Exoneración Diagnóstico */}
                {exoneraDiagnostico && (
                  <div className="flex items-center justify-between py-1.5 text-emerald-800 bg-emerald-50 px-2.5 rounded-xl border border-emerald-200 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Diagnóstico Inicial OBD2 (Regla &gt;$40)</span>
                    </span>
                    <span>✓ Exonerado ($15 GRATIS)</span>
                  </div>
                )}

                {/* Total Final */}
                <div className="flex justify-between items-baseline pt-2.5 border-t-2 border-slate-300 text-sm font-black text-[#0A1525]">
                  <span>Total Facturable:</span>
                  <span className="font-mono text-lg text-[#1E56B0]">${totalCotizado.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={guardandoAprobacion}
                  onClick={handleAprobarPresupuesto}
                  className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 border border-[#0A1525]/10"
                >
                  {guardandoAprobacion ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#0A1525]" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Aprobar y Reparar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRechazarPresupuesto}
                  className="w-full h-10 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Rechazar
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
                  Monto a pagar:{' '}
                  <strong className="text-[#0A1525] font-mono text-sm">
                    ${totalCotizado.toFixed(2)} USD
                  </strong>{' '}
                  (o al cambio en Bs tasa oficial)
                </p>
              </div>

              {/* Datos Bancarios TTM */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 text-left text-xs space-y-1">
                <p className="font-bold text-[#0A1525]">Pago Móvil Banesco (0134)</p>
                <p className="text-slate-600">CI/RIF: <strong className="text-slate-800">J-501234567</strong></p>
                <p className="text-slate-600">Teléfono: <strong className="text-slate-800">0414-9876543</strong></p>
                <p className="text-[11px] text-slate-400 pt-0.5">Zelle: <strong className="text-slate-700">pagos@tutallermovil.com</strong></p>
              </div>

              {/* Botón de Selección de Comprobante */}
              {subiendoComprobante ? (
                <div className="h-20 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#1E56B0] animate-spin" />
                  <span className="text-xs font-bold text-[#0A1525]">Subiendo comprobante...</span>
                </div>
              ) : comprobanteUrl ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comprobanteUrl}
                      alt="Comprobante"
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
                    />
                    <div className="text-left">
                      <span className="text-xs font-black text-emerald-900 block">✓ Comprobante Cargado</span>
                      <span className="text-[10px] text-slate-500">Guardado en evidencias</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => inputComprobanteRef.current?.click()}
                    className="text-xs font-bold text-slate-600 underline cursor-pointer p-1"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => inputComprobanteRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-4 hover:border-[#1E56B0] transition-colors cursor-pointer bg-slate-50"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#0A1525] block">
                    Subir Comprobante (Evidencias)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Captura JPG o PNG de la transferencia
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={confirmandoPago}
                  onClick={handleConfirmarPago}
                  className="w-full h-12 bg-[#1E56B0] hover:bg-[#164388] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  {confirmandoPago ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar Pago</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 5: CELEBRACIÓN CON CONFETI Y ENCUESTA 5 ESTRELLAS  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalCalificacionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/30 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 rounded-3xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-lg shadow-[#CCFF00]/40">
                <Sparkles className="w-8 h-8 text-[#0A1525] stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ¡Pago Verificado y Conciliado!
                </span>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight mt-1.5">
                  ¿Cómo estuvo tu experiencia con {MECANICO_INFO.nombre}?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tu calificación ayuda a premiar a los mejores técnicos certificados de Caracas.
                </p>
              </div>

              {/* Selector Interactivo de 5 Estrellas */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((estrella) => (
                  <button
                    key={estrella}
                    type="button"
                    onClick={() => setCalificacionEstrellas(estrella)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        estrella <= calificacionEstrellas
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-xs'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Caja de Comentario */}
              <textarea
                value={comentarioCalificacion}
                onChange={(e) => setComentarioCalificacion(e.target.value)}
                placeholder="Deja un comentario para Carlos Mendoza (opcional)..."
                rows={2}
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-[#0A1525] focus:outline-none focus:border-[#1E56B0] resize-none"
              />

              {calificacionEnviada ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Gracias! Tu reseña ha sido registrada.</span>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleEnviarCalificacion}
                    className="w-full h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    Enviar Calificación
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalCalificacionOpen(false)}
                    className="w-full h-9 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Omitir por ahora
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ClienteServicioClient;
