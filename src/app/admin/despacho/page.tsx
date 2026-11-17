'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Kanban,
  ArrowLeft,
  Radio,
  Clock,
  Car,
  Wrench,
  User,
  MapPin,
  ArrowRight,
  Calculator,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Check,
  FileText,
  BadgeCheck,
  GripVertical,
  Bike,
  ClipboardCheck,
  Shield,
  Phone,
  Star,
  UserPlus
} from 'lucide-react';

interface OrdenKanban {
  id: string;
  cliente_nombre: string;
  vehiculo_marca?: string | null;
  vehiculo_modelo: string;
  vehiculo_anio?: number | string | null;
  falla_reportada: string;
  sector: string;
  ganancia_estimada: number | string;
  estado: string;
  mecanico_id?: string | null;
  created_at?: string;
}

// Mecánicos disponibles para asignación
const MECANICOS_DISPONIBLES = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Carlos Mendoza',
    iniciales: 'CM',
    credencial: '#TTM-0842',
    especialidad: 'Especialista Senior (OBD2 & Inyección)',
    unidad: 'Moto Yamaha FZ • AB123CD',
    rating: '4.9 ★',
    foto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    nombre: 'Alejandro Blanco',
    iniciales: 'AB',
    credencial: '#TTM-0912',
    especialidad: 'Mecánica Ligera & Frenos',
    unidad: 'Moto Suzuki GN • AC456DF',
    rating: '4.95 ★',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    nombre: 'Roberto Páez',
    iniciales: 'RP',
    credencial: '#TTM-0341',
    especialidad: 'Electricidad Automotriz & Baterías',
    unidad: 'Moto Bera SBR • AE789GH',
    rating: '4.8 ★',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  }
];

// Mecánicos en el Radar táctil con cálculo de distancia y disponibilidad
const MECANICOS_RADAR = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Carlos Mendoza',
    iniciales: 'CM',
    credencial: '#TTM-0842',
    especialidad: 'Especialista Senior (OBD2 & Inyección)',
    distancia: '1.2 km (8 min)',
    disponible: true,
    foto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    nombre: 'Alejandro Blanco',
    iniciales: 'AB',
    credencial: '#TTM-0912',
    especialidad: 'Mecánica Ligera & Frenos',
    distancia: '3.4 km (18 min)',
    disponible: true,
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    nombre: 'Roberto Páez',
    iniciales: 'RP',
    credencial: '#TTM-0341',
    especialidad: 'Electricidad Automotriz & Baterías',
    distancia: '6.1 km (35 min)',
    disponible: false,
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  }
];

// Motorizados de Delivery de Repuestos (Runners)
const MOTORIZADOS_RUNNER = [
  {
    id: 'runner_luis',
    nombre: 'Luis',
    unidad: 'Moto Bera SBR Negra (Placa AB987CD)',
    estado: 'A 5 min de la repuestera'
  },
  {
    id: 'runner_pedro',
    nombre: 'Pedro',
    unidad: 'Moto Yamaha Roja (Placa XY456ZW)',
    estado: 'En zona Altamira'
  }
];

// Definición de las 6 Columnas del Kanban según el PRD para Drag & Drop y Snap
const COLUMNAS = [
  {
    id: 'LEAD_NUEVO',
    titulo: '1. NUEVOS LEADS',
    colorDot: 'bg-slate-400',
    colorBorder: 'hover:border-slate-400',
    colorDragOver: 'ring-2 ring-slate-400 border-slate-400 bg-slate-50/90',
    estadosValidos: ['LEAD_NUEVO', 'DISPONIBLE'],
    estadoDestino: 'LEAD_NUEVO',
    estadoSiguiente: 'DIAGNOSTICO_AGENDADO',
    textoVacio: 'Sin nuevos leads por ahora'
  },
  {
    id: 'DIAGNOSTICO_AGENDADO',
    titulo: '2. DIAGNÓSTICO',
    colorDot: 'bg-[#1E56B0]',
    colorBorder: 'hover:border-[#1E56B0]',
    colorDragOver: 'ring-2 ring-[#1E56B0] border-[#1E56B0] bg-blue-50/60',
    estadosValidos: ['DIAGNOSTICO_AGENDADO'],
    estadoDestino: 'DIAGNOSTICO_AGENDADO',
    estadoSiguiente: 'ASIGNADO',
    textoVacio: 'Sin órdenes en diagnóstico'
  },
  {
    id: 'ASIGNADO',
    titulo: '3. ASIGNADOS / EN RUTA',
    colorDot: 'bg-purple-600',
    colorBorder: 'hover:border-purple-400',
    colorDragOver: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/60',
    estadosValidos: ['ASIGNADO'],
    estadoDestino: 'ASIGNADO',
    estadoSiguiente: 'REPUESTOS_EN_RUTA',
    textoVacio: 'Sin técnicos en ruta'
  },
  {
    id: 'REPUESTOS_EN_RUTA',
    titulo: '4. GESTIÓN RUNNER',
    colorDot: 'bg-sky-500',
    colorBorder: 'hover:border-sky-400',
    colorDragOver: 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/60',
    estadosValidos: ['REPUESTOS_EN_RUTA', 'RUNNER_ASIGNADO'],
    estadoDestino: 'REPUESTOS_EN_RUTA',
    estadoSiguiente: 'EN_EJECUCION',
    textoVacio: 'Sin repuestos en tránsito'
  },
  {
    id: 'EN_EJECUCION',
    titulo: '5. EN EJECUCIÓN',
    colorDot: 'bg-emerald-500',
    colorBorder: 'hover:border-emerald-400',
    colorDragOver: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/60',
    estadosValidos: ['EN_EJECUCION', 'EN_SERVICIO'],
    estadoDestino: 'EN_EJECUCION',
    estadoSiguiente: 'PENDIENTE_PAGO',
    textoVacio: 'Sin servicios activos en sitio'
  },
  {
    id: 'PENDIENTE_PAGO',
    titulo: '6. POR LIQUIDAR',
    colorDot: 'bg-amber-500',
    colorBorder: 'hover:border-amber-400',
    colorDragOver: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/60',
    estadosValidos: ['PENDIENTE_PAGO', 'LIQUIDACION_PENDIENTE', 'POR_LIQUIDAR'],
    estadoDestino: 'PENDIENTE_PAGO',
    estadoSiguiente: null,
    textoVacio: 'Sin pagos pendientes'
  }
];

const FOTO_MECANICO_OFICIAL =
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=100&q=80';

// Formato de hora de creación (HH:MM AM/PM)
function formatearHoraCreacion(createdAt?: string): string {
  if (!createdAt) return '12:00 PM';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '12:00 PM';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Cronómetro Animado con cálculo de tiempo transcurrido en vivo (SLA 45 min)
function CronometroSLA({ createdAt }: { createdAt?: string }) {
  const [segundosTranscurridos, setSegundosTranscurridos] = useState<number>(() => {
    if (!createdAt) return 120;
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (!createdAt) return;

    const actualizar = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      setSegundosTranscurridos(diff > 0 ? diff : 0);
    };

    actualizar();
    const interval = setInterval(actualizar, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutos = Math.floor(segundosTranscurridos / 60);
  const segundos = segundosTranscurridos % 60;
  const tiempoFormateado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  // UX Visual SLA:
  // < 35 min: verde (#16A34A)
  // 35 a 44 min: naranja (#F59E0B)
  // >= 45 min: rojo (#DC2626) con animación sutil de pulso
  const esVencido = minutos >= 45;
  const esAlerta = minutos >= 35 && minutos < 45;

  const colorTexto = esVencido
    ? 'text-[#DC2626]'
    : esAlerta
    ? 'text-[#F59E0B]'
    : 'text-[#16A34A]';

  return (
    <div
      className={`flex items-center gap-1 font-mono text-[11px] font-black ${colorTexto} ${
        esVencido ? 'animate-pulse' : ''
      }`}
      title={
        esVencido
          ? 'SLA de 45 min vencido'
          : esAlerta
          ? 'Próximo a vencer SLA (45 min)'
          : 'Tiempo dentro de SLA'
      }
    >
      <Clock className="w-3 h-3 stroke-[2.5]" />
      <span>{tiempoFormateado}</span>
      {esVencido && <span className="text-[9px] uppercase font-sans font-bold">!</span>}
    </div>
  );
}

// Avatar del mecánico asignado con estilo squircle oscuro, iniciales CM en verde neón y badge de estatus (Fiel a la referencia de diseño)
interface MecanicoAvatarSquircleProps {
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'verified' | 'available' | 'slate';
  className?: string;
  onClick?: () => void;
}

function MecanicoAvatarSquircle({
  initials = 'CM',
  size = 'sm',
  status = 'verified',
  className = '',
  onClick
}: MecanicoAvatarSquircleProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-xl text-[11px]',
    md: 'w-11 h-11 rounded-2xl text-sm',
    lg: 'w-20 h-20 rounded-3xl text-2xl'
  }[size];

  const dotSize = {
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 ring-[1.5px]',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 ring-2',
    lg: 'w-6 h-6 -bottom-1 -right-1 ring-[3px]'
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} bg-[#0A1525] border border-slate-700/60 flex items-center justify-center font-black tracking-wider text-[#CCFF00] shadow-sm select-none shrink-0 ${
        onClick ? 'cursor-pointer hover:border-[#1E56B0] hover:scale-105 transition-all' : ''
      } ${className}`}
    >
      <span className="drop-shadow-xs">{initials}</span>

      {/* Indicador inferior derecho con aro blanco idéntico a las referencias del usuario */}
      {status === 'verified' ? (
        <span
          className={`absolute ${dotSize} rounded-full bg-[#16A34A] ring-white flex items-center justify-center shadow-xs text-white`}
          title="Técnico Verificado Oficial"
        >
          <Check className={`${size === 'lg' ? 'w-3.5 h-3.5 stroke-[3.5]' : size === 'md' ? 'w-2 h-2 stroke-[3.5]' : 'w-1.5 h-1.5 stroke-[3.5]'}`} />
        </span>
      ) : status === 'available' ? (
        <span
          className={`absolute ${dotSize} rounded-full bg-emerald-500 ring-white flex items-center justify-center shadow-xs`}
          title="Disponible / En ruta"
        >
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
        </span>
      ) : (
        /* Estado base (círculo gris/slate con aro blanco idéntico a la imagen CM) */
        <span
          className={`absolute ${dotSize} rounded-full bg-[#8B9BB4] ring-white shadow-xs`}
          title="Estatus de servicio"
        />
      )}
    </div>
  );
}

// Badge interactivo del mecánico asignado con avatar squircle 'CM' neon lime
function MecanicoAsignadoBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className="flex items-center gap-2 hover:bg-slate-100/90 px-2 py-1 -mx-2 -my-1 rounded-xl transition-all cursor-pointer text-left w-full group select-none"
      title="Ver ficha operativa de Carlos Mendoza (#TTM-0842)"
    >
      {/* Avatar Squircle con 'CM' en verde neón e indicador de estado según la referencia */}
      <MecanicoAvatarSquircle initials="CM" size="sm" status="verified" />

      <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
        <span className="text-xs font-bold text-[#0A1525] group-hover:text-[#1E56B0] transition-colors truncate">
          Carlos Mendoza
        </span>
        <span className="font-mono text-[10px] text-slate-500 font-semibold shrink-0">
          #TTM-0842
        </span>
      </div>
    </button>
  );
}

export default function TableroDespachoPage() {
  const [ordenes, setOrdenes] = useState<OrdenKanban[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  // Estados de Drag and Drop
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Estados de Modales y Paneles Tácticos
  const [modalCotizadorOpen, setModalCotizadorOpen] = useState(false);
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [modalMecanicoDetalleOpen, setModalMecanicoDetalleOpen] = useState(false);
  const [ordenParaAsignar, setOrdenParaAsignar] = useState<OrdenKanban | null>(null);

  // Estados del Centro de Despacho Táctico
  const [sheetRadarMecanicosOpen, setSheetRadarMecanicosOpen] = useState(false);
  const [ordenParaRadar, setOrdenParaRadar] = useState<OrdenKanban | null>(null);
  const [modalRunnerOpen, setModalRunnerOpen] = useState(false);
  const [ordenParaRunner, setOrdenParaRunner] = useState<OrdenKanban | null>(null);
  const [runnersAsignados, setRunnersAsignados] = useState<Record<string, string>>({
    'orden_demo_1': 'Luis'
  });
  const [toastPagoExitoso, setToastPagoExitoso] = useState<string | null>(null);

  // Estado del Cotizador
  const [manoDeObra, setManoDeObra] = useState<string>('');
  const [repuestos, setRepuestos] = useState<string>('');
  const [notasCotizacion, setNotasCotizacion] = useState<string>('');

  // 1. Cargar Órdenes de Supabase
  const cargarOrdenes = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando órdenes para el Kanban:', error);
      } else if (data) {
        setOrdenes(data);
      }
    } catch (err) {
      console.error('Excepción al cargar órdenes:', err);
    } finally {
      setCargando(false);
    }
  };

  // 5. Supabase Realtime: Suscripción a cambios
  useEffect(() => {
    cargarOrdenes();

    const supabase = createClient();
    const canal = supabase
      .channel('admin_despacho_realtime_dnd')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ordenes'
        },
        (payload) => {
          console.log('⚡ Kanban Despacho Realtime Update:', payload);
          cargarOrdenes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // 3. Mover Orden al Nuevo Estado (Tanto por botón como por Drag & Drop)
  const moverOrden = async (ordenId: string, nuevoEstado: string, mecanicoId?: string) => {
    setActualizandoId(ordenId);

    // Optimistic UI update: actualizar inmediatamente en memoria
    setOrdenes((prev) =>
      prev.map((ord) =>
        ord.id === ordenId
          ? { ...ord, estado: nuevoEstado, ...(mecanicoId ? { mecanico_id: mecanicoId } : {}) }
          : ord
      )
    );

    try {
      const supabase = createClient();
      const updatePayload: Record<string, any> = { estado: nuevoEstado };
      if (mecanicoId) {
        updatePayload.mecanico_id = mecanicoId;
      }

      const { error } = await supabase
        .from('ordenes')
        .update(updatePayload)
        .eq('id', ordenId);

      if (error) {
        console.error('Error actualizando estado de la orden:', error);
        alert('No se pudo actualizar el estado de la orden');
        await cargarOrdenes();
      }
    } catch (err) {
      console.error('Excepción al mover orden:', err);
      await cargarOrdenes();
    } finally {
      setActualizandoId(null);
    }
  };

  // Manejadores de Drag and Drop
  const handleDragStart = (e: React.DragEvent, ordenId: string) => {
    e.dataTransfer.setData('text/plain', ordenId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCardId(ordenId);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverColId(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent) => {
    // Si sale hacia otro elemento que no es hijo, limpiar indicador
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColId(null);
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColId(null);
    const ordenId = e.dataTransfer.getData('text/plain') || draggedCardId;
    setDraggedCardId(null);

    if (!ordenId) return;

    const orden = ordenes.find((o) => o.id === ordenId);
    if (!orden) return;

    // Verificar si ya está en esta columna
    const targetCol = COLUMNAS.find((c) => c.id === targetColId);
    if (!targetCol) return;

    if (targetCol.estadosValidos.includes(orden.estado)) {
      return; // Ya está en esta columna
    }

    // Si se suelta en ASIGNADO y no tiene mecánico asignado, asignar el primer especialista disponible por defecto
    if (targetColId === 'ASIGNADO' && !orden.mecanico_id) {
      await moverOrden(ordenId, 'ASIGNADO', MECANICOS_DISPONIBLES[0].id);
    } else {
      await moverOrden(ordenId, targetCol.estadoDestino);
    }
  };

  const handleSeleccionarMecanico = async (mecanico: typeof MECANICOS_DISPONIBLES[0]) => {
    if (!ordenParaAsignar) return;
    await moverOrden(ordenParaAsignar.id, 'ASIGNADO', mecanico.id);
    setModalAsignarOpen(false);
    setOrdenParaAsignar(null);
  };

  // 1. Asignación Forzada desde el Radar de Mecánicos
  const handleForzarAsignacion = async (mecanico: typeof MECANICOS_RADAR[0]) => {
    if (!ordenParaRadar) return;
    const ordenId = ordenParaRadar.id;
    const cliente = ordenParaRadar.cliente_nombre;

    console.log('[BITÁCORA INMUTABLE] Operadora forzó asignación manual de especialista en ruta.', {
      evento: 'ASIGNACION_MANUAL_RADAR',
      ordenId,
      cliente,
      mecanicoId: mecanico.id,
      mecanicoNombre: mecanico.nombre,
      mecanicoCredencial: mecanico.credencial,
      distanciaGPS: mecanico.distancia,
      estadoAnterior: 'DIAGNOSTICO_AGENDADO',
      nuevoEstado: 'ASIGNADO',
      timestamp: new Date().toISOString()
    });

    await moverOrden(ordenId, 'ASIGNADO', mecanico.id);
    setSheetRadarMecanicosOpen(false);
    setOrdenParaRadar(null);
  };

  // 2. Asignación de Runner para Despacho de Repuestos
  const handleSeleccionarRunner = (runnerNombre: string) => {
    if (!ordenParaRunner) return;
    const ordenId = ordenParaRunner.id;

    console.log('[BITÁCORA INMUTABLE] Operadora asignó runner para despacho de repuestos.', {
      evento: 'RUNNER_ASIGNADO',
      ordenId,
      cliente: ordenParaRunner.cliente_nombre,
      runnerAsignado: runnerNombre,
      timestamp: new Date().toISOString()
    });

    setRunnersAsignados((prev) => ({
      ...prev,
      [ordenId]: runnerNombre
    }));

    setModalRunnerOpen(false);
    setOrdenParaRunner(null);
  };

  // 3. Validación de Pago y Cierre con Retención QA (Mueve fuera del Kanban)
  const handleValidarPagoYCerrar = async (orden: OrdenKanban) => {
    const monto =
      typeof orden.ganancia_estimada === 'number' && orden.ganancia_estimada > 0
        ? (orden.ganancia_estimada * 1.5).toFixed(2)
        : '75.00';
    const retencionQA = (parseFloat(monto) * 0.03).toFixed(2);

    console.log('[BITÁCORA INMUTABLE] Operadora validó y concilió pago de orden.', {
      evento: 'ORDEN_PAGADA_CONCILIADA',
      ordenId: orden.id,
      cliente: orden.cliente_nombre,
      montoTotalUSD: monto,
      retencionQA_3pct: retencionQA,
      estadoAnterior: orden.estado,
      nuevoEstado: 'PAGADO',
      timestamp: new Date().toISOString()
    });

    // Optimistic update: remover del Kanban (estado PAGADO)
    setOrdenes((prev) => prev.filter((o) => o.id !== orden.id));

    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({ estado: 'PAGADO' })
        .eq('id', orden.id);
    } catch (err) {
      console.error('Error al actualizar estado PAGADO en Supabase:', err);
    }

    setToastPagoExitoso('Orden pagada. Fondo QA retenido (3%)');
    setTimeout(() => {
      setToastPagoExitoso(null);
    }, 4500);
  };

  // 4. Lógica Financiera del Cotizador ($40 regla de negocio P0)
  const numManoObra = parseFloat(manoDeObra) || 0;
  const numRepuestos = parseFloat(repuestos) || 0;
  const subtotalServicio = numManoObra + numRepuestos;
  const exoneraDiagnostico = subtotalServicio > 40;
  const totalCotizacion = exoneraDiagnostico
    ? subtotalServicio
    : subtotalServicio > 0
    ? subtotalServicio + 15
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525] relative">
      
      {/* Patrón sutil de puntos técnicos de fondo (Spatial UI 2027) */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none" />

      {/* 1. Header de Comando y Control */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo y Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#475569] hover:text-[#0A1525] hover:bg-slate-50 transition-colors shadow-2xs"
              title="Volver a la Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#0A1525]">TTM</span>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#0A1525] text-[#CCFF00] px-2.5 py-0.5 rounded-md">
                Torre de Despacho
              </span>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-3">
            {/* Botón Cotizador Orden (Fondo #0A1525, texto blanco) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalCotizadorOpen(true)}
              className="h-10 px-4 text-xs font-black bg-[#0A1525] hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <Calculator className="w-4 h-4 text-[#CCFF00]" />
              <span>Cotizar Orden</span>
            </motion.button>

            {/* Indicador Realtime */}
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#475569] bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Tiempo Real</span>
            </div>

            <button
              type="button"
              onClick={cargarOrdenes}
              className="p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0A1525] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Actualizar tablero"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col relative z-10">
        
        {/* Título de Sección y Contadores */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0A1525] tracking-tight flex items-center gap-2">
              <Kanban className="w-6 h-6 text-[#1E56B0]" />
              Tablero Operativo de Despacho
            </h1>
            <p className="text-xs text-[#475569] font-medium flex items-center gap-1.5 pt-0.5">
              <span>Arrastra y suelta (Drag &amp; Drop) cualquier tarjeta entre columnas para actualizar su fase operativa.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
            <span>En gestión activa:</span>
            <span className="bg-[#1E56B0] text-white px-2.5 py-0.5 rounded-full font-mono font-black text-xs shadow-2xs">
              {ordenes.length} órdenes
            </span>
          </div>
        </div>

        {/* 1. Estructura del Tablero: Contenedor con scroll horizontal suave, snap-x y soporte Drag & Drop */}
        <div className="flex-1 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="flex gap-6 snap-x snap-mandatory items-start min-w-max pb-2">
            
            {COLUMNAS.map((columna) => {
              const ordenesDeColumna = ordenes.filter((o) =>
                columna.estadosValidos.includes(o.estado)
              );
              const isDragOver = dragOverColId === columna.id;

              return (
                <div
                  key={columna.id}
                  onDragOver={(e) => handleDragOverColumn(e, columna.id)}
                  onDragLeave={handleDragLeaveColumn}
                  onDrop={(e) => handleDropOnColumn(e, columna.id)}
                  className={`min-w-[320px] w-[320px] shrink-0 snap-center rounded-3xl flex flex-col shadow-xs overflow-hidden max-h-[calc(100vh-210px)] transition-all duration-200 ${
                    isDragOver
                      ? `${columna.colorDragOver} border-2 border-dashed`
                      : 'bg-slate-50/80 border border-[#E2E8F0]'
                  }`}
                >
                  {/* Cabecera Sticky Glassmorphism */}
                  <div className="sticky top-0 z-10 backdrop-blur-md bg-white/85 border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${columna.colorDot}`}></span>
                      <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                        {columna.titulo}
                      </h2>
                    </div>
                    <span className="font-mono text-xs font-black bg-[#E2E8F0] text-[#0A1525] px-2.5 py-0.5 rounded-full">
                      {ordenesDeColumna.length}
                    </span>
                  </div>

                  {/* Zona de Drop/Tarjetas */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[320px]">
                    {/* Indicador visual al arrastrar encima */}
                    {isDragOver && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 text-center rounded-xl bg-blue-100/60 border-2 border-dashed border-[#1E56B0] text-xs font-extrabold text-[#1E56B0]"
                      >
                        Soltar aquí para mover a {columna.titulo}
                      </motion.div>
                    )}

                    {ordenesDeColumna.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#475569] font-medium flex flex-col items-center justify-center gap-2 h-44">
                        <span className="text-slate-300">Arrastra tarjetas aquí</span>
                        <span className="text-slate-400 text-[11px]">{columna.textoVacio}</span>
                      </div>
                    ) : (
                      ordenesDeColumna.map((orden) => {
                        const vehiculo =
                          [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                            .filter(Boolean)
                            .join(' ') || orden.vehiculo_modelo;
                        const isUpdating = actualizandoId === orden.id;
                        const isBeingDragged = draggedCardId === orden.id;

                        return (
                          <motion.div
                            key={orden.id}
                            layout
                            draggable={!isUpdating}
                            onDragStart={(e: any) => handleDragStart(e, orden.id)}
                            onDragEnd={handleDragEnd}
                            whileHover={{ scale: isBeingDragged ? 1 : 1.02, y: isBeingDragged ? 0 : -2 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-white rounded-2xl border p-3.5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-2.5 cursor-grab active:cursor-grabbing select-none group ${
                              isBeingDragged
                                ? 'opacity-40 border-2 border-dashed border-[#1E56B0] scale-95 shadow-none'
                                : 'border-[#E2E8F0] hover:border-[#1E56B0]'
                            }`}
                          >
                            {/* 1. Barra Superior: Hora de Solicitud (HH:MM AM/PM) y Cronómetro Animado SLA */}
                            <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1.5 rounded-xl text-xs transition-colors">
                              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Solicitud:</span>
                                <span className="font-mono font-bold text-[#0A1525]">
                                  {formatearHoraCreacion(orden.created_at)}
                                </span>
                              </div>

                              <CronometroSLA createdAt={orden.created_at} />
                            </div>

                            {/* 2. Grip Icon, Vehículo en negrita y Nombre del Cliente */}
                            <div className="flex items-start justify-between gap-2 pt-0.5">
                              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 hover:text-[#0A1525]" />
                                <div className="space-y-0.5 min-w-0">
                                  <h3 className="text-sm font-black text-[#0A1525] tracking-tight leading-snug truncate">
                                    {vehiculo}
                                  </h3>
                                  <p className="text-xs font-semibold text-[#475569] truncate">
                                    {orden.cliente_nombre || 'Cliente Particular'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Medio: Falla Reportada (truncada) */}
                            <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed pl-5">
                              {orden.falla_reportada}
                            </p>

                            {/* Datos complementarios según columna */}
                            {columna.id === 'ASIGNADO' && (
                              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs ml-5">
                                <MecanicoAsignadoBadge onClick={() => setModalMecanicoDetalleOpen(true)} />
                              </div>
                            )}

                            {/* En REPUESTOS_EN_RUTA: Avatar del Mecánico Asignado + Gestión de Runner */}
                            {columna.id === 'REPUESTOS_EN_RUTA' && (
                              <div className="space-y-1.5 ml-5">
                                <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                                  <MecanicoAsignadoBadge onClick={() => setModalMecanicoDetalleOpen(true)} />
                                </div>

                                {runnersAsignados[orden.id] ? (
                                  <div className="p-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs shadow-2xs">
                                    <span className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-xs">
                                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                                      Runner: {runnersAsignados[orden.id]}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOrdenParaRunner(orden);
                                        setModalRunnerOpen(true);
                                      }}
                                      className="text-[10px] font-bold text-slate-400 hover:text-[#0A1525] underline ml-1 cursor-pointer"
                                    >
                                      Cambiar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOrdenParaRunner(orden);
                                      setModalRunnerOpen(true);
                                    }}
                                    className="w-full h-8 px-3 rounded-xl bg-sky-50 hover:bg-[#CCFF00] text-[#1E56B0] hover:text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 border border-sky-200 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-2xs"
                                  >
                                    <Bike className="w-3.5 h-3.5" />
                                    <span>Asignar Runner</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {/* En EN_EJECUCION: Avatar del Mecánico Asignado + Botón verde sutil 'Ver Checklist TTM' */}
                            {columna.id === 'EN_EJECUCION' && (
                              <div className="space-y-2 ml-5">
                                <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                                  <MecanicoAsignadoBadge onClick={() => setModalMecanicoDetalleOpen(true)} />
                                </div>
                                <div className="flex items-center justify-between pt-0.5">
                                  <Link
                                    href={`/aliados/servicio/${orden.id}`}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-200 transition-colors shadow-2xs"
                                    title="Ver Checklist TTM y Candado de Odómetro"
                                  >
                                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Ver Checklist TTM</span>
                                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                                  </Link>
                                  <Link
                                    href="/carnet/TTM-0842"
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Carnet</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* En PENDIENTE_PAGO: Monto total a cobrar en grande y botón oscuro 'Validar Pago y Cerrar' */}
                            {columna.id === 'PENDIENTE_PAGO' && (
                              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 ml-5 space-y-2">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                                    Total a Cobrar:
                                  </span>
                                  <span className="text-lg font-black text-[#0A1525] font-mono">
                                    ${typeof orden.ganancia_estimada === 'number' && orden.ganancia_estimada > 0 ? (orden.ganancia_estimada * 1.5).toFixed(2) : '75.00'}{' '}
                                    <span className="text-xs font-sans text-slate-500 font-bold">USD</span>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleValidarPagoYCerrar(orden);
                                  }}
                                  className="w-full h-9 rounded-xl bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Validar Pago y Cerrar</span>
                                </button>
                              </div>
                            )}

                            {/* Abajo: Sector y Acciones Rápidas */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between pl-5">
                              <div className="flex items-center gap-1 text-[11px] text-[#475569] font-semibold">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[120px]">{orden.sector}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Botón de asignación táctica en columna diagnóstico */}
                                {columna.id === 'DIAGNOSTICO_AGENDADO' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOrdenParaRadar(orden);
                                      setSheetRadarMecanicosOpen(true);
                                    }}
                                    className="h-8 px-2.5 rounded-lg bg-blue-50 hover:bg-[#CCFF00] text-[#1E56B0] hover:text-[#0A1525] text-xs font-black flex items-center gap-1.5 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-2xs"
                                    title="Abrir Radar de Mecánicos para asignación manual"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Asignar</span>
                                  </button>
                                )}

                                {/* Botón Circular: fondo #1E56B0, hover #CCFF00 para avanzar rápidamente con fade-in */}
                                {columna.estadoSiguiente && (
                                  <motion.button
                                    type="button"
                                    disabled={isUpdating}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (columna.id === 'DIAGNOSTICO_AGENDADO') {
                                        setOrdenParaRadar(orden);
                                        setSheetRadarMecanicosOpen(true);
                                      } else {
                                        moverOrden(orden.id, columna.estadoSiguiente!);
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#1E56B0] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                                    title={`Mover a ${columna.estadoSiguiente}`}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    )}
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </main>

      {/* ======================================================== */}
      {/* 4. MODAL DEL COTIZADOR PREMIUM (Spatial UI - 2 Columnas) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalCotizadorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 relative overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                      Cotizador Premium de Servicio
                    </h2>
                    <p className="text-xs text-[#475569] font-medium">
                      Regla de Negocio P0: Diagnóstico de $15 100% GRATIS en reparaciones &gt; $40
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalCotizadorOpen(false)}
                  className="p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Diseño de Dos Columnas (Izquierda: Inputs, Derecha: Resumen Financiero) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                
                {/* Columna Izquierda: Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A1525] mb-1.5">
                      Mano de Obra ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={manoDeObra}
                        onChange={(e) => setManoDeObra(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 pl-9 pr-3 text-base font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A1525] mb-1.5">
                      Repuestos &amp; Insumos ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={repuestos}
                        onChange={(e) => setRepuestos(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 pl-9 pr-3 text-base font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A1525] mb-1.5">
                      Notas del Presupuesto (Opcional)
                    </label>
                    <input
                      type="text"
                      value={notasCotizacion}
                      onChange={(e) => setNotasCotizacion(e.target.value)}
                      placeholder="Ej. Cambio de pastillas delanteras + rectificación"
                      className="w-full h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Columna Derecha: Resumen Financiero Animado Spatial UI */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">
                      Desglose en Vivo
                    </span>

                    <div className="flex justify-between text-xs text-[#475569] font-medium">
                      <span>Mano de Obra:</span>
                      <span className="font-bold text-[#0A1525] font-mono">${numManoObra.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-[#475569] font-medium">
                      <span>Repuestos:</span>
                      <span className="font-bold text-[#0A1525] font-mono">${numRepuestos.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-[#E2E8F0] pt-2 flex justify-between text-xs font-extrabold text-[#0A1525]">
                      <span>Subtotal de Intervención:</span>
                      <span className="font-mono text-sm">${subtotalServicio.toFixed(2)}</span>
                    </div>

                    {/* UX Dinámica con AnimatePresence: Regla $40 */}
                    <AnimatePresence mode="wait">
                      {subtotalServicio > 0 && (
                        <motion.div
                          key={exoneraDiagnostico ? 'exonerado' : 'cobro'}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="pt-1"
                        >
                          {exoneraDiagnostico ? (
                            <div className="p-3 rounded-xl bg-[#CCFF00] text-[#0A1525] text-xs font-black shadow-xs flex items-center justify-between border border-[#0A1525]/10">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#0A1525]" />
                                ✓ Diagnóstico Exonerado (-$15.00)
                              </span>
                              <span className="line-through text-slate-700 font-mono">$15.00</span>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                Cobro de Diagnóstico: +$15.00
                              </span>
                              <span className="font-mono font-black">+$15.00</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Total Final */}
                  <div className="border-t border-[#E2E8F0] pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
                        Total Facturable:
                      </span>
                      <span className="text-2xl font-black text-[#1E56B0] font-mono tracking-tight">
                        ${totalCotizacion.toFixed(2)} <span className="text-xs font-sans text-slate-500 font-bold">USD</span>
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Botones de Acción */}
              <div className="pt-6 border-t border-[#E2E8F0] flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Presupuesto TuTallerMóvil: Subtotal $${subtotalServicio.toFixed(2)} | ${
                      exoneraDiagnostico ? 'Diagnóstico GRATIS' : 'Diagnóstico $15.00'
                    } | Total Final: $${totalCotizacion.toFixed(2)} USD. ${notasCotizacion ? `(${notasCotizacion})` : ''}`;
                    navigator.clipboard.writeText(text);
                    alert('¡Presupuesto copiado al portapapeles!');
                  }}
                  className="flex-1 h-11 text-xs font-bold bg-[#F8FAFC] hover:bg-slate-100 text-[#0A1525] border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                >
                  Copiar para WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setModalCotizadorOpen(false)}
                  className="flex-1 h-11 text-xs font-black bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-colors cursor-pointer border border-[#0A1525]/10 shadow-xs"
                >
                  Listo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 3. MODAL DE ASIGNAR MECÁNICO (Simulado) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalAsignarOpen && ordenParaAsignar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 relative overflow-hidden space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1E56B0] text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Asignar Especialista en Ruta
                    </h2>
                    <p className="text-xs text-[#475569] font-medium">
                      Orden #{ordenParaAsignar.id.slice(0, 6).toUpperCase()} • {ordenParaAsignar.sector}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalAsignarOpen(false);
                    setOrdenParaAsignar(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                  Especialistas Verificados Disponibles
                </span>

                {MECANICOS_DISPONIBLES.map((mec) => (
                  <div
                    key={mec.id}
                    className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] bg-[#F8FAFC] hover:bg-blue-50/40 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <MecanicoAvatarSquircle
                        initials={mec.iniciales}
                        size="md"
                        status="verified"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#0A1525]">{mec.nombre}</span>
                          <span className="font-mono text-[10px] font-black text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {mec.credencial}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600">{mec.rating}</span>
                        </div>
                        <p className="text-xs text-[#475569] font-medium">{mec.especialidad}</p>
                        <p className="text-[11px] text-slate-400">{mec.unidad}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSeleccionarMecanico(mec)}
                      className="h-10 px-4 text-xs font-black bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-all shadow-2xs cursor-pointer border border-[#0A1525]/15 shrink-0"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setModalAsignarOpen(false);
                    setOrdenParaAsignar(null);
                  }}
                  className="text-xs text-[#475569] hover:text-[#0A1525] font-bold"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 4. MODAL PERFIL OPERATIVO DEL MECÁNICO (Bento Box UI)     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalMecanicoDetalleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 relative overflow-hidden space-y-5"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={() => setModalMecanicoDetalleOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera: Avatar Squircle Oficial w-20 h-20, Nombre, Código y Calificación */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1 text-center sm:text-left">
                <MecanicoAvatarSquircle initials="CM" size="lg" status="verified" />

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                      Carlos Mendoza
                    </h2>
                    <span className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs" title="Técnico Verificado Oficial">
                      <Check className="w-3 h-3 text-white stroke-[3.5]" />
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-mono text-xs font-black text-[#1E56B0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      #TTM-0842
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                      4.9 / 5.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid de Datos (Bento Grid 2x2 con Stagger) */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {/* 1. Rango / Especialidad */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Shield className="w-4 h-4 text-[#1E56B0]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Rango / Especialidad
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#0A1525]">
                    Mecánico 1 — Senior
                  </p>
                </motion.div>

                {/* 4. Zona Actual */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Zona Actual
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#0A1525]">
                    Chacao
                  </p>
                </motion.div>

                {/* 2. Unidad de Traslado (Vital para Garita) */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-1 sm:col-span-2"
                >
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Bike className="w-4 h-4 text-[#0A1525]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 font-black">
                      Unidad de Traslado (Autorización Garita)
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#0A1525]">
                    Moto Yamaha FZ • Negro • Placa{' '}
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-[#1E56B0]">
                      AB123CD
                    </span>
                  </p>
                </motion.div>

                {/* 3. Teléfono */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-1 sm:col-span-2"
                >
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-4 h-4 text-[#1E56B0]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Contacto Directo
                    </span>
                  </div>
                  <p className="text-xs font-black font-mono text-[#0A1525]">
                    +58 412-1234567
                  </p>
                </motion.div>
              </motion.div>

              {/* Botones de Acción Rápida (Footer del Modal) */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href="tel:+584121234567"
                  className="flex-1 h-12 rounded-xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar al Mecánico</span>
                </a>

                <Link
                  href="/carnet/TTM-0842"
                  target="_blank"
                  className="flex-1 h-12 rounded-xl bg-white hover:bg-slate-50 text-[#0A1525] border border-[#CBD5E1] hover:border-[#1E56B0] text-xs font-black flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <span>Ver Carnet QR</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#1E56B0]" />
                </Link>
              </div>

              {/* Nota de UX en el footer */}
              <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Verificado por TuTallerMóvil • Activo en ruta</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. SHEET / PANEL LATERAL: RADAR DE MECÁNICOS (Asignación) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {sheetRadarMecanicosOpen && ordenParaRadar && (
          <div className="fixed inset-0 z-50 flex justify-end bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between overflow-hidden"
            >
              {/* Cabecera del Sheet */}
              <div className="p-6 border-b border-[#E2E8F0] flex items-start justify-between bg-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1E56B0] text-[#CCFF00] flex items-center justify-center font-bold">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <h2 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Radar de Mecánicos
                    </h2>
                  </div>
                  <p className="text-xs text-[#475569] font-medium">
                    Orden #{ordenParaRadar.id.slice(0, 8).toUpperCase()} • {ordenParaRadar.sector} ({ordenParaRadar.cliente_nombre})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSheetRadarMecanicosOpen(false);
                    setOrdenParaRadar(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Mecánicos en el Radar */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Especialistas por Cobertura</span>
                  <span className="text-[#1E56B0] font-mono">3 simulados</span>
                </div>

                {MECANICOS_RADAR.map((mec) => (
                  <div
                    key={mec.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                      mec.disponible
                        ? 'bg-white border-[#E2E8F0] hover:border-[#1E56B0] shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <MecanicoAvatarSquircle
                          initials={mec.iniciales}
                          size="md"
                          status={mec.disponible ? 'verified' : 'slate'}
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black text-[#0A1525]">
                              {mec.nombre}
                            </h3>
                            <span className="font-mono text-[10px] font-bold text-[#1E56B0] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                              {mec.credencial}
                            </span>
                          </div>
                          <p className="text-xs text-[#475569] font-medium">
                            {mec.especialidad}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                            <MapPin className="w-3 h-3 text-[#1E56B0]" />
                            <span>{mec.distancia}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge: Verde lima si Disponible, gris si Ocupado */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border ${
                          mec.disponible
                            ? 'bg-[#CCFF00] text-[#0A1525] border-[#0A1525]/10'
                            : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                      >
                        {mec.disponible ? '● Disponible' : 'Ocupado'}
                      </span>
                    </div>

                    {/* Botón Forzar Asignación */}
                    {mec.disponible ? (
                      <button
                        type="button"
                        onClick={() => handleForzarAsignacion(mec)}
                        className="w-full h-10 rounded-xl bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Forzar Asignación Inmediata</span>
                      </button>
                    ) : (
                      <div className="text-[11px] font-semibold text-slate-400 italic text-center py-1 bg-slate-100/60 rounded-xl">
                        En servicio activo • No disponible para despacho
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer del Sheet */}
              <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  🔒 Cada forzado queda registrado en la bitácora inmutable de despacho táctico.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 6. MODAL GESTIÓN DE RUNNER (Seleccionar Motorizado)      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalRunnerOpen && ordenParaRunner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#1E56B0] flex items-center justify-center font-bold">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0A1525] tracking-tight">
                      Seleccionar Motorizado
                    </h3>
                    <p className="text-[11px] text-[#475569]">
                      Despacho para {ordenParaRunner.sector}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalRunnerOpen(false);
                    setOrdenParaRunner(null);
                  }}
                  className="p-1 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {MOTORIZADOS_RUNNER.map((runner) => (
                  <button
                    key={runner.id}
                    type="button"
                    onClick={() => handleSeleccionarRunner(runner.nombre)}
                    className="w-full p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] hover:bg-blue-50/40 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <span className="text-sm font-black text-[#0A1525] group-hover:text-[#1E56B0]">
                        {runner.nombre}
                      </span>
                      <p className="text-xs text-[#475569] font-medium">{runner.unidad}</p>
                      <p className="text-[11px] text-emerald-700 font-bold">{runner.estado}</p>
                    </div>
                    <span className="h-8 px-3 rounded-lg bg-slate-100 group-hover:bg-[#CCFF00] group-hover:text-[#0A1525] text-xs font-black flex items-center transition-colors">
                      Asignar
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 7. TOAST ANIMADO: VALIDACIÓN DE PAGO (Retención 3% QA)   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastPagoExitoso && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A1525] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white shrink-0">
              <Check className="w-4 h-4 stroke-[3.5]" />
            </div>
            <div>
              <p className="text-xs font-black text-white">
                {toastPagoExitoso}
              </p>
              <p className="text-[10px] text-slate-400">
                La orden fue conciliada y archivada fuera del tablero activo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastPagoExitoso(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
