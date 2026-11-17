'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  Search,
  Trash2,
  Plus,
  Minus,
  Package,
  FileDown,
  Landmark,
  LogOut,
  HelpCircle,
  Inbox,
  Ghost,
  Camera,
  Eye,
  AlertTriangle,
  Hourglass,
  Gauge,
  Layers,
  PackageCheck,
  MessageCircle,
  Receipt,
  Lock
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import FloatingSupportButton from '@/components/ui/floating-support-button';
import { generarLinkWhatsApp } from '@/lib/utils';
import { registrarOperacionEnBitacora } from '@/lib/audit';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrdenKanban {
  id: string;
  cliente_nombre: string;
  cliente_telefono?: string | null;
  vehiculo_marca?: string | null;
  vehiculo_modelo: string;
  vehiculo_anio?: number | string | null;
  falla_reportada: string;
  sector: string;
  ganancia_estimada: number | string;
  estado: string;
  mecanico_id?: string | null;
  created_at?: string;
  foto_odometro_url?: string | null;
  foto_repuesto_viejo_url?: string | null;
  foto_repuesto_nuevo_url?: string | null;
  comprobante_url?: string | null;
  monto_aprobado_cliente?: number | string | null;
  bloqueado_por?: string | null;
}

export interface OperadoraPresencia {
  id: string;
  nombre: string;
  email: string;
  iniciales: string;
  avatarColor: string;
  onlineAt: string;
}

// Repuestos del catálogo oficial para integración en cotizador
interface RepuestoCatalogo {
  id: string;
  proveedor_nombre?: string;
  nombre_repuesto: string;
  marca: string;
  precio_usd: number;
  descripcion?: string;
  foto_url?: string;
  compatibilidad: string;
  stock?: number;
}

interface RepuestoSeleccionado {
  id: string;
  nombre_repuesto: string;
  marca: string;
  precio_usd: number;
  foto_url?: string;
  compatibilidad?: string;
  cantidad: number;
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

// Definición de las 6 Columnas del Kanban según el flujo operativo real y financiero 2027
const COLUMNAS = [
  {
    id: 'LEAD_NUEVO',
    titulo: '1. NUEVOS LEADS',
    colorDot: 'bg-slate-400',
    colorBorder: 'hover:border-slate-400',
    colorDragOver: 'ring-2 ring-slate-400 border-slate-400 bg-slate-50/90',
    estadosValidos: ['LEAD_NUEVO', 'DISPONIBLE'],
    estadoDestino: 'LEAD_NUEVO',
    estadoSiguiente: 'EN_INSPECCION',
    textoVacio: 'Sin nuevos leads por ahora'
  },
  {
    id: 'EN_INSPECCION',
    titulo: '2. MECÁNICO EN SITIO',
    colorDot: 'bg-[#1E56B0]',
    colorBorder: 'hover:border-[#1E56B0]',
    colorDragOver: 'ring-2 ring-[#1E56B0] border-[#1E56B0] bg-blue-50/60',
    estadosValidos: ['EN_INSPECCION', 'ASIGNADO', 'DIAGNOSTICO_AGENDADO'],
    estadoDestino: 'EN_INSPECCION',
    estadoSiguiente: 'COTIZADO',
    textoVacio: 'Sin órdenes en inspección'
  },
  {
    id: 'COTIZADO',
    titulo: '3. ESPERANDO APROBACIÓN',
    colorDot: 'bg-amber-500',
    colorBorder: 'hover:border-amber-400',
    colorDragOver: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/60',
    estadosValidos: ['COTIZADO', 'ESPERANDO_APROBACION'],
    estadoDestino: 'COTIZADO',
    estadoSiguiente: 'REPUESTOS_EN_RUTA',
    textoVacio: 'Sin presupuestos pendientes'
  },
  {
    id: 'REPUESTOS_EN_RUTA',
    titulo: '4. GESTIÓN RUNNER',
    colorDot: 'bg-sky-500',
    colorBorder: 'hover:border-sky-400',
    colorDragOver: 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/60',
    estadosValidos: ['REPUESTOS_EN_RUTA', 'RUNNER_ASIGNADO', 'APROBADO'],
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
    estadosValidos: ['EN_EJECUCION', 'EN_SERVICIO', 'TRABAJO_TERMINADO'],
    estadoDestino: 'EN_EJECUCION',
    estadoSiguiente: 'PAGO_REPORTADO',
    textoVacio: 'Sin servicios activos en sitio'
  },
  {
    id: 'PAGO_REPORTADO',
    titulo: '6. VALIDAR PAGO',
    colorDot: 'bg-purple-600',
    colorBorder: 'hover:border-purple-400',
    colorDragOver: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/60',
    estadosValidos: ['PAGO_REPORTADO', 'PENDIENTE_PAGO', 'LIQUIDACION_PENDIENTE', 'POR_LIQUIDAR'],
    estadoDestino: 'PAGO_REPORTADO',
    estadoSiguiente: 'PAGADO',
    textoVacio: 'Sin pagos pendientes por validar'
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
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`inline-flex items-center gap-1 font-mono text-[11px] font-black ${colorTexto} ${
            esVencido ? 'animate-pulse' : ''
          } cursor-help`}
        >
          <Clock className="w-3 h-3 stroke-[2.5]" />
          <span>{tiempoFormateado}</span>
          {esVencido && <span className="text-[9px] uppercase font-sans font-bold">!</span>}
          <HelpCircle className="w-2.5 h-2.5 text-slate-400 hover:text-slate-600 transition-colors ml-0.5" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-[#0A1525] text-white">
        <p className="font-bold text-xs text-[#CCFF00]">Cronómetro SLA (45 min)</p>
        <p className="text-[11px] text-slate-200">El color rojo indica que el mecánico está retrasado.</p>
      </TooltipContent>
    </Tooltip>
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
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [mostrarBotonTutorial, setMostrarBotonTutorial] = useState(false);
  const [modalEvidenciaOpen, setModalEvidenciaOpen] = useState(false);
  const [ordenParaEvidencia, setOrdenParaEvidencia] = useState<OrdenKanban | null>(null);
  const [tabEvidenciaModal, setTabEvidenciaModal] = useState<'odometro' | 'repuesto_viejo' | 'repuesto_nuevo'>('odometro');

  // Estados de Validación de Comprobante de Pago
  const [modalComprobanteOpen, setModalComprobanteOpen] = useState(false);
  const [ordenParaComprobante, setOrdenParaComprobante] = useState<OrdenKanban | null>(null);

  // Estados de Presencia Multiusuario y Bloqueo de Tarjetas (Figma/Notion Style)
  const [miOperadora, setMiOperadora] = useState<{
    nombre: string;
    email: string;
    iniciales: string;
    avatarColor: string;
  }>({
    nombre: 'Ana Pérez',
    email: 'ana.despacho@tutallermovil.com',
    iniciales: 'AP',
    avatarColor: 'bg-indigo-600'
  });

  const [operadorasConectadas, setOperadorasConectadas] = useState<OperadoraPresencia[]>([
    {
      id: 'ana.despacho@tutallermovil.com',
      nombre: 'Ana Pérez',
      email: 'ana.despacho@tutallermovil.com',
      iniciales: 'AP',
      avatarColor: 'bg-indigo-600',
      onlineAt: '2026-11-17T12:00:00.000Z'
    },
    {
      id: 'carlos.despacho@tutallermovil.com',
      nombre: 'Carlos Martínez',
      email: 'carlos.despacho@tutallermovil.com',
      iniciales: 'CM',
      avatarColor: 'bg-[#1E56B0]',
      onlineAt: '2026-11-17T12:00:00.000Z'
    }
  ]);

  const [toastCondicionCarrera, setToastCondicionCarrera] = useState<string | null>(null);
  const canalPresenciaRef = useRef<any>(null);

  const bloquearTarjeta = async (ordenId: string) => {
    setOrdenes((prev) =>
      prev.map((o) => (o.id === ordenId ? { ...o, bloqueado_por: miOperadora.nombre } : o))
    );
    try {
      await canalPresenciaRef.current?.send({
        type: 'broadcast',
        event: 'bloqueo_tarjeta',
        payload: { ordenId, bloqueado_por: miOperadora.nombre }
      });
    } catch (e) {}
    try {
      const supabase = createClient();
      await supabase.from('ordenes').update({ bloqueado_por: miOperadora.nombre }).eq('id', ordenId);
    } catch (e) {}
  };

  const desbloquearTarjeta = async (ordenId: string) => {
    setOrdenes((prev) =>
      prev.map((o) => (o.id === ordenId ? { ...o, bloqueado_por: null } : o))
    );
    try {
      await canalPresenciaRef.current?.send({
        type: 'broadcast',
        event: 'bloqueo_tarjeta',
        payload: { ordenId, bloqueado_por: null }
      });
    } catch (e) {}
    try {
      const supabase = createClient();
      await supabase.from('ordenes').update({ bloqueado_por: null }).eq('id', ordenId);
    } catch (e) {}
  };

  const handleAbrirEvidencia = (orden: OrdenKanban) => {
    setOrdenParaEvidencia(orden);
    setTabEvidenciaModal('odometro');
    setModalEvidenciaOpen(true);
  };

  const handleAbrirComprobante = (orden: OrdenKanban) => {
    setOrdenParaComprobante(orden);
    bloquearTarjeta(orden.id);
    setModalComprobanteOpen(true);
  };

  const handleCerrarComprobante = () => {
    if (ordenParaComprobante) {
      desbloquearTarjeta(ordenParaComprobante.id);
    }
    setModalComprobanteOpen(false);
  };

  const handleAprobarPagoYTerminar = async (orden: OrdenKanban) => {
    try {
      setActualizandoId(orden.id);
      await desbloquearTarjeta(orden.id);
      await registrarOperacionEnBitacora({
        ordenId: orden.id,
        operadoraEmail: miOperadora.email,
        operadoraNombre: miOperadora.nombre,
        accion: 'PAGO_APROBADO',
        detalles: {
          monto_usd: orden.monto_aprobado_cliente || orden.ganancia_estimada || 0,
          cliente: orden.cliente_nombre
        }
      });
      await moverOrden(orden.id, 'PAGADO');
      setModalComprobanteOpen(false);
      setToastPagoExitoso(
        `¡Pago Aprobado y Conciliado! Orden #${orden.id.slice(0, 8)} cerrada oficialmente. Dinero ingresado en caja.`
      );
      setTimeout(() => setToastPagoExitoso(null), 5000);
    } catch (err) {
      console.error('Error aprobando pago:', err);
    } finally {
      setActualizandoId(null);
    }
  };

  const handleRechazarComprobante = async (orden: OrdenKanban) => {
    try {
      setActualizandoId(orden.id);
      await desbloquearTarjeta(orden.id);
      await registrarOperacionEnBitacora({
        ordenId: orden.id,
        operadoraEmail: miOperadora.email,
        operadoraNombre: miOperadora.nombre,
        accion: 'COMPROBANTE_RECHAZADO',
        detalles: {
          cliente: orden.cliente_nombre,
          motivo: 'Comprobante no válido o ilegible'
        }
      });
      await moverOrden(orden.id, 'PENDIENTE_PAGO');
      setModalComprobanteOpen(false);
      setToastPagoExitoso(
        `Comprobante rechazado. Orden #${orden.id.slice(0, 8)} devuelta a Pendiente de Pago para nuevo reporte.`
      );
      setTimeout(() => setToastPagoExitoso(null), 5000);
    } catch (err) {
      console.error('Error rechazando comprobante:', err);
    } finally {
      setActualizandoId(null);
    }
  };

  const handleEnviarCarnetWhatsApp = (orden: OrdenKanban) => {
    const mec = MECANICOS_DISPONIBLES.find((m) => m.id === orden.mecanico_id) || MECANICOS_DISPONIBLES[0];
    const credSlug = mec.credencial.replace('#', '');
    const linkCarnet = `https://tutallermovil.vercel.app/carnet/${credSlug}`;
    const mensaje = `Hola ${orden.cliente_nombre || 'estimado cliente'}, soy tu operadora de TuTallerMóvil. Tu mecánico ${mec.nombre} va en camino. Verifica su identidad aquí: ${linkCarnet}`;
    const telefono = orden.cliente_telefono || '0414-2314194';
    window.open(generarLinkWhatsApp(telefono, mensaje), '_blank');
  };

  // Estados del Centro de Despacho Táctico
  const [sheetRadarMecanicosOpen, setSheetRadarMecanicosOpen] = useState(false);
  const [ordenParaRadar, setOrdenParaRadar] = useState<OrdenKanban | null>(null);
  const [modalRunnerOpen, setModalRunnerOpen] = useState(false);
  const [ordenParaRunner, setOrdenParaRunner] = useState<OrdenKanban | null>(null);
  const [runnersAsignados, setRunnersAsignados] = useState<Record<string, string>>({
    'orden_demo_1': 'Luis'
  });
  const [toastPagoExitoso, setToastPagoExitoso] = useState<string | null>(null);

  // Estado del Cotizador con Repuestos del Catálogo
  const [ordenParaCotizar, setOrdenParaCotizar] = useState<OrdenKanban | null>(null);
  const [manoDeObra, setManoDeObra] = useState<string>('30');
  const [repuestos, setRepuestos] = useState<string>('');
  const [notasCotizacion, setNotasCotizacion] = useState<string>('');
  const [catalogoRepuestos, setCatalogoRepuestos] = useState<RepuestoCatalogo[]>([]);
  const [busquedaRepuesto, setBusquedaRepuesto] = useState<string>('');
  const [repuestosSeleccionados, setRepuestosSeleccionados] = useState<RepuestoSeleccionado[]>([]);
  const [guardandoCotizacion, setGuardandoCotizacion] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [toastCotizacion, setToastCotizacion] = useState<string | null>(null);

  // 1. Cargar Órdenes y Catálogo de Repuestos de Supabase
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
        if (data.length > 0 && !ordenParaCotizar) {
          setOrdenParaCotizar(data[0]);
        }
      }
    } catch (err) {
      console.error('Excepción al cargar órdenes:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarCatalogoRepuestos = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('repuestos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setCatalogoRepuestos(data as RepuestoCatalogo[]);
      } else {
        // Fallback de catálogo en caso de tabla sin datos iniciales
        setCatalogoRepuestos([
          {
            id: '5f07a2d9-270e-4745-bc57-7b85cd82f80e',
            proveedor_nombre: 'AutoPartes Chacao',
            nombre_repuesto: 'Pastillas de Freno Delanteras',
            marca: 'Bosch',
            precio_usd: 35.0,
            foto_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80',
            compatibilidad: 'Toyota Corolla 2014-2020, Chevrolet Aveo 2012-2018',
            stock: 15
          },
          {
            id: '72dd0245-2853-462e-8f74-bb66cf135fed',
            proveedor_nombre: 'Repuestos El Hatillo',
            nombre_repuesto: 'Filtro de Aceite Sintético',
            marca: 'Mann-Filter',
            precio_usd: 12.5,
            foto_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80',
            compatibilidad: 'Ford Explorer 2011-2019, Toyota Corolla 2010-2022',
            stock: 20
          },
          {
            id: '5bcb7def-faf0-4391-9b4d-89b0abbd4721',
            proveedor_nombre: 'Mayorista Las Mercedes',
            nombre_repuesto: 'Batería 12V 650A',
            marca: 'Optima',
            precio_usd: 110.0,
            foto_url: 'https://images.unsplash.com/photo-1620910930886-6b2b9e214686?auto=format&fit=crop&w=300&q=80',
            compatibilidad: 'Chevrolet Aveo, Ford Explorer',
            stock: 8
          }
        ]);
      }
    } catch (err) {
      console.warn('Aviso cargando catálogo de repuestos:', err);
    }
  };

  // 5. Supabase Realtime: Suscripción a cambios, Presencia y Concurrencia
  useEffect(() => {
    // 0. Detectar operadora actual desde cookies o credenciales locales
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^| )ttm_user_code=([^;]+)/);
      if (match && match[2]) {
        const email = decodeURIComponent(match[2]).toLowerCase();
        let nombre = email.split('@')[0].replace(/[._-]/g, ' ');
        nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);

        try {
          const raw = localStorage.getItem('ttm_operadoras_credenciales');
          if (raw) {
            const ops = JSON.parse(raw);
            const found = ops.find((o: any) => o.email.toLowerCase() === email);
            if (found) nombre = found.nombre;
          }
        } catch (e) {}

        const parts = nombre.split(' ');
        const iniciales = (parts[0]?.charAt(0) || 'O') + (parts[1]?.charAt(0) || '');
        const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'];
        const avatarColor = colors[Math.abs(email.length) % colors.length];

        setMiOperadora({ nombre, email, iniciales, avatarColor });
      }

      const estaRegistrado = typeof document !== 'undefined' && Boolean(
        document.cookie.match(/(^| )ttm_user_code=([^;]+)/) ||
        document.cookie.match(/(^| )ttm_role=([^;]+)/)
      );
      const visto = localStorage.getItem('onboarding_seen_operadora');
      if (estaRegistrado || visto) {
        setMostrarBotonTutorial(false);
      } else {
        setMostrarBotonTutorial(true);
      }
    }

    cargarOrdenes();
    cargarCatalogoRepuestos();

    const supabase = createClient();
    const canal = supabase
      .channel('kanban_torre_despacho_presence', {
        config: {
          presence: { key: miOperadora.email }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = canal.presenceState();
        const online: OperadoraPresencia[] = [];
        Object.keys(state).forEach((key) => {
          const presencias = state[key] as any[];
          if (presencias && presencias.length > 0) {
            const p = presencias[0];
            online.push({
              id: key,
              nombre: p.nombre || key,
              email: p.email || key,
              iniciales: p.iniciales || 'OP',
              avatarColor: p.avatarColor || 'bg-indigo-600',
              onlineAt: p.onlineAt || new Date().toISOString()
            });
          }
        });
        if (online.length > 0) {
          setOperadorasConectadas(online);
        }
      })
      .on('broadcast', { event: 'bloqueo_tarjeta' }, ({ payload }) => {
        if (payload?.ordenId) {
          setOrdenes((prev) =>
            prev.map((o) =>
              o.id === payload.ordenId ? { ...o, bloqueado_por: payload.bloqueado_por } : o
            )
          );
        }
      })
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
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await canal.track({
            nombre: miOperadora.nombre,
            email: miOperadora.email,
            iniciales: miOperadora.iniciales,
            avatarColor: miOperadora.avatarColor,
            onlineAt: new Date().toISOString()
          });
        }
      });

    canalPresenciaRef.current = canal;

    return () => {
      supabase.removeChannel(canal);
    };
  }, [miOperadora.email]);

  // 3. Mover Orden al Nuevo Estado (Concurrencia Optimista & Prevención de Condiciones de Carrera)
  const moverOrden = async (ordenId: string, nuevoEstado: string, mecanicoId?: string) => {
    setActualizandoId(ordenId);
    const ordenLocal = ordenes.find((o) => o.id === ordenId);
    if (!ordenLocal) {
      setActualizandoId(null);
      return;
    }

    try {
      const supabase = createClient();

      // 1. Verificación previa de condición de carrera contra Supabase
      const { data: ordenRemota } = await supabase
        .from('ordenes')
        .select('estado, bloqueado_por')
        .eq('id', ordenId)
        .maybeSingle();

      if (ordenRemota && ordenRemota.estado !== ordenLocal.estado) {
        setToastCondicionCarrera(
          `⚠️ Otra operadora ya actualizó esta orden a "${ordenRemota.estado}". Actualizando tablero...`
        );
        setTimeout(() => setToastCondicionCarrera(null), 5000);
        // Sincronizar estado local con el remoto
        setOrdenes((prev) =>
          prev.map((o) =>
            o.id === ordenId
              ? { ...o, estado: ordenRemota.estado, bloqueado_por: ordenRemota.bloqueado_por }
              : o
          )
        );
        setActualizandoId(null);
        return;
      }

      // 2. Optimistic UI update en memoria local y liberación de bloqueo
      setOrdenes((prev) =>
        prev.map((ord) =>
          ord.id === ordenId
            ? {
                ...ord,
                estado: nuevoEstado,
                bloqueado_por: null,
                ...(mecanicoId ? { mecanico_id: mecanicoId } : {})
              }
            : ord
        )
      );

      // Notificar desbloqueo a otras operadoras
      try {
        await canalPresenciaRef.current?.send({
          type: 'broadcast',
          event: 'bloqueo_tarjeta',
          payload: { ordenId, bloqueado_por: null }
        });
      } catch (e) {}

      // 3. Update condicional en Supabase
      const updatePayload: Record<string, any> = {
        estado: nuevoEstado,
        bloqueado_por: null
      };
      if (mecanicoId) {
        updatePayload.mecanico_id = mecanicoId;
      }

      const { error } = await supabase
        .from('ordenes')
        .update(updatePayload)
        .eq('id', ordenId);

      if (error) {
        console.warn('Aviso actualizando estado en Supabase:', error);
      }

      // 4. Registrar en Bitácora inmutable de auditoría
      await registrarOperacionEnBitacora({
        ordenId,
        operadoraEmail: miOperadora.email,
        operadoraNombre: miOperadora.nombre,
        accion: 'ORDEN_MOVIDA',
        detalles: {
          de: ordenLocal.estado,
          a: nuevoEstado,
          mecanico_id: mecanicoId || ordenLocal.mecanico_id
        }
      });
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

    // Si se suelta en EN_INSPECCION y no tiene mecánico asignado, asignar el primer especialista disponible por defecto
    if (targetColId === 'EN_INSPECCION' && !orden.mecanico_id) {
      await moverOrden(ordenId, 'EN_INSPECCION', MECANICOS_DISPONIBLES[0].id);
    } else {
      await moverOrden(ordenId, targetCol.estadoDestino);
    }
  };

  const handleSeleccionarMecanico = async (mecanico: typeof MECANICOS_DISPONIBLES[0]) => {
    if (!ordenParaAsignar) return;
    await moverOrden(ordenParaAsignar.id, 'EN_INSPECCION', mecanico.id);
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

    await desbloquearTarjeta(ordenId);
    await registrarOperacionEnBitacora({
      ordenId,
      operadoraEmail: miOperadora.email,
      operadoraNombre: miOperadora.nombre,
      accion: 'MECANICO_ASIGNADO',
      detalles: {
        mecanico_id: mecanico.id,
        mecanico_nombre: mecanico.nombre,
        mecanico_credencial: mecanico.credencial,
        distancia_gps: mecanico.distancia
      }
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

  // Manejo de Carrito de Cotización y Repuestos del Catálogo
  const handleAgregarRepuesto = (rep: RepuestoCatalogo) => {
    setRepuestosSeleccionados((prev) => {
      const existe = prev.find((item) => item.id === rep.id);
      if (existe) {
        return prev.map((item) =>
          item.id === rep.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: rep.id,
          nombre_repuesto: rep.nombre_repuesto,
          marca: rep.marca,
          precio_usd: Number(rep.precio_usd),
          foto_url: rep.foto_url,
          compatibilidad: rep.compatibilidad,
          cantidad: 1
        }
      ];
    });
    setBusquedaRepuesto('');
  };

  const handleEliminarRepuesto = (id: string) => {
    setRepuestosSeleccionados((prev) => prev.filter((item) => item.id !== id));
  };

  const handleModificarCantidad = (id: string, delta: number) => {
    setRepuestosSeleccionados((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean) as RepuestoSeleccionado[]
    );
  };

  const handleEstablecerCantidad = (id: string, cantidad: number) => {
    const qty = Math.max(1, cantidad);
    setRepuestosSeleccionados((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad: qty } : item))
    );
  };

  // 4. Lógica Financiera del Cotizador ($40 regla de negocio P0)
  const totalRepuestosCatalogo = repuestosSeleccionados.reduce(
    (acc, r) => acc + r.precio_usd * r.cantidad,
    0
  );
  const numRepuestosManual = parseFloat(repuestos) || 0;
  const numRepuestos = totalRepuestosCatalogo + numRepuestosManual;
  const numManoObra = parseFloat(manoDeObra) || 0;
  const subtotalServicio = numManoObra + numRepuestos;
  const exoneraDiagnostico = subtotalServicio > 40;
  const totalCotizacion = exoneraDiagnostico
    ? subtotalServicio
    : subtotalServicio > 0
    ? subtotalServicio + 15
    : 0;

  // Filtrado de repuestos para el Command/Combobox
  const repuestosFiltradosCatalogo = catalogoRepuestos.filter((r) => {
    if (!busquedaRepuesto.trim()) return false;
    const term = busquedaRepuesto.toLowerCase();
    return (
      r.nombre_repuesto.toLowerCase().includes(term) ||
      r.marca.toLowerCase().includes(term) ||
      (r.compatibilidad && r.compatibilidad.toLowerCase().includes(term))
    );
  });

  // Guardar Cotización e Inserción en orden_repuestos para control de inventario
  const handleGuardarCotizacion = async () => {
    try {
      setGuardandoCotizacion(true);
      const supabase = createClient();
      const ordenObjetivo = ordenParaCotizar || ordenes[0];

      if (!ordenObjetivo) {
        alert('No hay una orden activa seleccionada para cotizar.');
        return;
      }

      const ordenId = ordenObjetivo.id;

      // 1. Insertar en orden_repuestos por cada repuesto seleccionado
      if (repuestosSeleccionados.length > 0) {
        const filasAInsertar = repuestosSeleccionados.map((rep) => ({
          orden_id: ordenId,
          repuesto_id: rep.id,
          cantidad: rep.cantidad,
          precio_al_momento: rep.precio_usd
        }));

        const { error: errRep } = await supabase
          .from('orden_repuestos')
          .insert(filasAInsertar);

        if (errRep) {
          console.warn('[SUPABASE] Aviso al insertar en orden_repuestos:', errRep.message);
        }
      }

      // 2. Actualizar monto y mover estado a COTIZADO en tabla ordenes
      const { error: errOrd } = await supabase
        .from('ordenes')
        .update({
          estado: 'COTIZADO',
          ganancia_estimada: totalCotizacion
        })
        .eq('id', ordenId);

      if (errOrd) {
        console.warn('[SUPABASE] Aviso al actualizar estado COTIZADO en ordenes:', errOrd.message);
      }

      // 3. Actualizar estado local (la tarjeta se mueve a la columna COTIZADO)
      setOrdenes((prev) =>
        prev.map((ord) =>
          ord.id === ordenId ? { ...ord, estado: 'COTIZADO', ganancia_estimada: totalCotizacion } : ord
        )
      );

      // 4. Registrar en Bitácora inmutable de auditoría y liberar bloqueo
      await desbloquearTarjeta(ordenId);
      await registrarOperacionEnBitacora({
        ordenId,
        operadoraEmail: miOperadora.email,
        operadoraNombre: miOperadora.nombre,
        accion: 'COTIZACION_MODIFICADA',
        detalles: {
          vehiculo: ordenObjetivo.vehiculo_modelo,
          cliente: ordenObjetivo.cliente_nombre,
          repuestos_count: repuestosSeleccionados.length,
          total_facturable_usd: totalCotizacion,
          mano_de_obra: numManoObra,
          diagnostico_exonerado: exoneraDiagnostico
        }
      });

      // 5. Cerrar modal y mostrar toast
      setModalCotizadorOpen(false);
      setToastCotizacion('Cotización enviada al cliente');
      setTimeout(() => setToastCotizacion(null), 4500);
    } catch (err) {
      console.error('Error al guardar cotización:', err);
    } finally {
      setGuardandoCotizacion(false);
    }
  };

  // 5.b Confirmar aprobación del cliente y pasar a asignación de Runner
  const handleAprobarCliente = async (orden: OrdenKanban) => {
    setActualizandoId(orden.id);
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({ estado: 'REPUESTOS_EN_RUTA' })
        .eq('id', orden.id);

      setOrdenes((prev) =>
        prev.map((o) => (o.id === orden.id ? { ...o, estado: 'REPUESTOS_EN_RUTA' } : o))
      );
      setToastPagoExitoso(`¡Presupuesto aprobado por el cliente! Asigna un runner para el despacho.`);
      setTimeout(() => setToastPagoExitoso(null), 4000);
      setOrdenParaRunner(orden);
      setModalRunnerOpen(true);
    } catch (e) {
      console.error('Error al aprobar cliente:', e);
    } finally {
      setActualizandoId(null);
    }
  };

  // 6. Exportación de Cotización a PDF (jsPDF + AutoTable)
  const handleExportarPDF = async () => {
    const orden = ordenParaCotizar || ordenes[0];
    if (!orden) {
      alert('No hay una orden seleccionada para exportar.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const margin = 14;

      // 1. Cabecera (#0A1525)
      doc.setFillColor(10, 21, 37); // #0A1525
      doc.rect(0, 0, pageWidth, 26, 'F');

      // Acento verde lima (#CCFF00)
      doc.setFillColor(204, 255, 0); // #CCFF00
      doc.rect(0, 26, pageWidth, 3, 'F');

      // Textos en cabecera
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('TTM TuTallerMóvil', margin, 17);

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('COTIZACIÓN DE SERVICIO', pageWidth - margin, 17, { align: 'right' });

      // 2. Datos del Cliente y Vehículo
      const startY = 40;

      // Bloque Cliente (Izquierda)
      doc.setTextColor(71, 85, 105); // #475569
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL CLIENTE', margin, startY);

      doc.setTextColor(10, 21, 37); // #0A1525
      doc.setFontSize(9.5);
      doc.text(`Cliente: ${orden.cliente_nombre || 'Cliente General'}`, margin, startY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Sector: ${orden.sector || 'Chacao, Caracas'}`, margin, startY + 11);
      doc.text(`Teléfono: +58 412-1234567`, margin, startY + 16);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-VE')}`, margin, startY + 21);

      // Bloque Vehículo (Derecha)
      const colRight = 115;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL VEHÍCULO', colRight, startY);

      doc.setTextColor(10, 21, 37);
      doc.setFontSize(9.5);
      const modelo = orden.vehiculo_modelo || 'Vehículo';
      const marca = orden.vehiculo_marca ? `${orden.vehiculo_marca} ` : '';
      const anio = orden.vehiculo_anio ? ` (${orden.vehiculo_anio})` : '';
      doc.text(`${marca}${modelo}${anio}`.trim(), colRight, startY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const placaVehiculo = (
        (orden as any).placa ||
        (orden as any).vehiculo_placa ||
        'AB123CD'
      ).toUpperCase();
      doc.text(`Placa: ${placaVehiculo}`, colRight, startY + 11);
      doc.text(
        `Falla: ${orden.falla_reportada.slice(0, 38)}${
          orden.falla_reportada.length > 38 ? '...' : ''
        }`,
        colRight,
        startY + 16
      );
      doc.text(
        `Código Orden: #${orden.id.replace('ord_', '').slice(0, 8).toUpperCase()}`,
        colRight,
        startY + 21
      );

      // Línea divisoria
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, startY + 26, pageWidth - margin, startY + 26);

      // 3. Tabla de Repuestos (jspdf-autotable)
      // Columnas: Cantidad, Repuesto, Marca, Precio Unitario, Total
      const tableRows =
        repuestosSeleccionados.length > 0
          ? repuestosSeleccionados.map((rep) => [
              rep.cantidad.toString(),
              rep.nombre_repuesto,
              rep.marca || 'Original/Homologado',
              `$${rep.precio_usd.toFixed(2)}`,
              `$${(rep.precio_usd * rep.cantidad).toFixed(2)}`
            ])
          : [
              ['1', 'Inspección y Diagnóstico Técnico In Situ', 'TuTallerMóvil', `$${numManoObra.toFixed(2)}`, `$${numManoObra.toFixed(2)}`]
            ];

      autoTable(doc, {
        startY: startY + 30,
        head: [['Cantidad', 'Repuesto', 'Marca', 'Precio Unitario', 'Total']],
        body: tableRows,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: [10, 21, 37],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        bodyStyles: {
          textColor: [10, 21, 37],
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35 },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
        }
      });

      // 4. Resumen Financiero
      const finalY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 8
        : startY + 80;
      const rightAlignX = pageWidth - margin;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Mano de Obra: $${numManoObra.toFixed(2)}`, rightAlignX, finalY, { align: 'right' });
      doc.text(`Repuestos: $${totalRepuestosCatalogo.toFixed(2)}`, rightAlignX, finalY + 5, { align: 'right' });
      if (numRepuestosManual > 0) {
        doc.text(`Insumos Adicionales: $${numRepuestosManual.toFixed(2)}`, rightAlignX, finalY + 10, { align: 'right' });
      }

      const subtotalY = finalY + (numRepuestosManual > 0 ? 15 : 10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 21, 37);
      doc.text(`Subtotal: $${subtotalServicio.toFixed(2)}`, rightAlignX, subtotalY, { align: 'right' });

      let totalY = subtotalY + 6;
      // Regla de Negocio: Si el subtotal > $40, añade una línea con texto en verde: 'Diagnóstico Exonerado: -$15.00'
      if (exoneraDiagnostico) {
        doc.setTextColor(22, 163, 74); // Verde #16A34A
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnóstico Exonerado: -$15.00', rightAlignX, totalY, { align: 'right' });
        totalY += 6;
      } else if (subtotalServicio > 0) {
        doc.setTextColor(180, 83, 9); // Amber
        doc.setFont('helvetica', 'bold');
        doc.text('Cobro de Diagnóstico: +$15.00', rightAlignX, totalY, { align: 'right' });
        totalY += 6;
      }

      // Total a Pagar
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 86, 176); // Azul #1E56B0
      doc.text(`Total a Pagar: $${totalCotizacion.toFixed(2)} USD`, rightAlignX, totalY, { align: 'right' });

      // Notas si existen
      if (notasCotizacion.trim()) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text(`Nota: ${notasCotizacion.trim()}`, margin, totalY, { maxWidth: 100 });
      }

      // 5. Footer al pie de página (A4 height is 297mm)
      const footerY = 282;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Cotización válida por 24 horas. Sujeto a disponibilidad de inventario. Garantía Total TuTallerMóvil.',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
      doc.text(
        'TuTallerMóvil C.A. • RIF J-50493821-0 • Caracas, Venezuela • soporte@tutallermovil.com',
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
      );

      // 6. Guardar y Descargar con nombre dinámico
      const fechaHoy = new Date().toISOString().slice(0, 10);
      const placaLimpia = placaVehiculo.replace(/[^a-zA-Z0-9]/g, '') || 'VEHICULO';
      const nombreArchivo = `Cotizacion_${placaLimpia}_${fechaHoy}.pdf`;

      doc.save(nombreArchivo);

      // Toast de éxito
      setToastCotizacion('PDF generado con éxito');
      setTimeout(() => {
        setToastCotizacion(null);
      }, 4000);
    } catch (err) {
      console.error('Error al generar PDF de cotización:', err);
      alert('Ocurrió un error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
            <Link
              href="/admin/finanzas"
              className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Landmark className="w-4 h-4 text-[#1E56B0]" />
              <span className="hidden md:inline">Finanzas & QA</span>
            </Link>

            {/* Botón Cotizador Orden con Tooltip explicativo */}
            <div className="flex items-center gap-1">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="w-8 h-10 flex items-center justify-center text-slate-400 hover:text-[#1E56B0] hover:bg-blue-50/80 rounded-xl transition-colors cursor-help"
                    aria-label="Ayuda sobre Cotización"
                  >
                    <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#0A1525] text-white max-w-xs">
                  <p className="font-bold text-xs text-[#CCFF00]">Regla de Exoneración P0</p>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    La regla de negocio exonerará los $15 si la cotización supera los $40.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Barra de Operadoras Conectadas (Figma / Notion Style) */}
            <div className="hidden lg:flex items-center -space-x-2 mr-1">
              {operadorasConectadas.map((op, idx) => (
                <div
                  key={op.email || idx}
                  className={`relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-xs ${
                    op.avatarColor || 'bg-blue-600'
                  }`}
                  title={`${op.nombre} (${op.email}) • En línea`}
                >
                  <span>{op.iniciales || 'OP'}</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
              ))}
              <div className="pl-3 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                {operadorasConectadas.length}{' '}
                {operadorasConectadas.length === 1 ? 'operadora' : 'operadoras'}
              </div>
            </div>

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

            {mostrarBotonTutorial && (
              <button
                type="button"
                onClick={() => setMostrarTutorial(true)}
                className="h-10 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#1E56B0] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Ver tutorial de bienvenida (Solo primera visita)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1E56B0]" />
                <span className="hidden sm:inline">Tutorial</span>
              </button>
            )}

            <button
              type="button"
              onClick={cerrarSesion}
              className="h-10 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta flotante de Condición de Carrera (Optimistic Concurrency) */}
      <AnimatePresence>
        {toastCondicionCarrera && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A1525] text-white border-2 border-amber-400 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <span>{toastCondicionCarrera}</span>
            <button
              type="button"
              onClick={() => setToastCondicionCarrera(null)}
              className="ml-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg text-slate-300 cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                      <div className="p-8 text-center border-2 border-dashed border-[#CBD5E1]/80 rounded-2xl bg-white/60 text-xs text-[#475569] font-medium flex flex-col items-center justify-center gap-2.5 h-48 select-none">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100/90 border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                          {columna.id === 'LEAD_NUEVO' ? (
                            <Ghost className="w-6 h-6 stroke-[1.8] text-slate-400" />
                          ) : (
                            <Inbox className="w-6 h-6 stroke-[1.8] text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-0.5 text-center">
                          <p className="text-xs font-black text-[#0A1525]">
                            {columna.id === 'LEAD_NUEVO'
                              ? 'Esperando nuevos leads...'
                              : 'Todo al día'}
                          </p>
                          <p className="text-[11px] text-[#475569] font-medium max-w-[200px]">
                            {columna.textoVacio || 'Sin órdenes en esta etapa por ahora'}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          Arrastra tarjetas aquí
                        </span>
                      </div>
                    ) : (
                      ordenesDeColumna.map((orden) => {
                        const vehiculo =
                          [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                            .filter(Boolean)
                            .join(' ') || orden.vehiculo_modelo;
                        const isUpdating = actualizandoId === orden.id;
                        const isBeingDragged = draggedCardId === orden.id;
                        const estaBloqueadaPorOtra = Boolean(
                          orden.bloqueado_por && orden.bloqueado_por !== miOperadora.nombre
                        );

                        return (
                          <motion.div
                            key={orden.id}
                            layout
                            draggable={!isUpdating && !estaBloqueadaPorOtra}
                            onDragStart={(e: any) => handleDragStart(e, orden.id)}
                            onDragEnd={handleDragEnd}
                            whileHover={{ scale: isBeingDragged || estaBloqueadaPorOtra ? 1 : 1.02, y: isBeingDragged || estaBloqueadaPorOtra ? 0 : -2 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-white rounded-2xl border p-3.5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-2.5 select-none group ${
                              estaBloqueadaPorOtra
                                ? 'border-rose-200 bg-rose-50/20 cursor-not-allowed opacity-90'
                                : 'cursor-grab active:cursor-grabbing border-[#E2E8F0] hover:border-[#1E56B0]'
                            } ${
                              isBeingDragged
                                ? 'opacity-40 border-2 border-dashed border-[#1E56B0] scale-95 shadow-none'
                                : ''
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

                            {/* Banner de Bloqueo de Tarjeta (Card Locking) */}
                            {orden.bloqueado_por && (
                              <div
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                  estaBloqueadaPorOtra
                                    ? 'bg-rose-100/90 text-rose-800 border border-rose-300 shadow-2xs'
                                    : 'bg-amber-100/90 text-amber-800 border border-amber-300 shadow-2xs'
                                }`}
                              >
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">
                                  {estaBloqueadaPorOtra
                                    ? `Editando: ${orden.bloqueado_por}`
                                    : 'En edición por ti'}
                                </span>
                              </div>
                            )}

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
                            {columna.id === 'LEAD_NUEVO' && (
                              <div className="pt-1 ml-5">
                                <button
                                  type="button"
                                  disabled={estaBloqueadaPorOtra}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (estaBloqueadaPorOtra) return;
                                    bloquearTarjeta(orden.id);
                                    setOrdenParaRadar(orden);
                                    setSheetRadarMecanicosOpen(true);
                                  }}
                                  className="w-full h-8 px-3 rounded-xl bg-blue-50 hover:bg-[#CCFF00] text-[#1E56B0] hover:text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 border border-blue-200 transition-all cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Asignar Mecánico</span>
                                </button>
                              </div>
                            )}

                            {/* En EN_INSPECCION: Avatar del Mecánico + Icono Redondo + WhatsApp Carnet + Botón de Cotizar */}
                            {columna.id === 'EN_INSPECCION' && (
                              <div className="space-y-2 ml-5">
                                <div className="flex items-center justify-between gap-2">
                                  <MecanicoAsignadoBadge onClick={() => { setOrdenParaEvidencia(orden); setModalMecanicoDetalleOpen(true); }} />
                                  <div
                                    className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1E56B0] flex items-center justify-center shrink-0 relative shadow-2xs transition-colors cursor-help"
                                    title="Diagnóstico en curso • Mecánico en sitio realizando inspección"
                                  >
                                    <Wrench className="w-3.5 h-3.5 text-[#1E56B0]" />
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1E56B0] animate-pulse ring-2 ring-white" />
                                  </div>
                                </div>

                                {/* Botón: Enviar Carnet por WhatsApp */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnviarCarnetWhatsApp(orden);
                                  }}
                                  className="w-full h-8 px-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                                  title="Enviar carnet digital verificado del mecánico al WhatsApp del cliente"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Enviar Carnet por WhatsApp</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrdenParaCotizar(orden);
                                    setModalCotizadorOpen(true);
                                  }}
                                  className="w-full h-8 px-3 rounded-xl bg-[#1E56B0] hover:bg-[#0A1525] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#CCFF00]" />
                                  <span>Cotizar y Enviar al Cliente</span>
                                </button>
                              </div>
                            )}

                            {/* En COTIZADO: Monto cotizado en grande + Esperando al cliente + Botón de Aprobación */}
                            {columna.id === 'COTIZADO' && (
                              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 ml-5 space-y-2">
                                <div className="flex items-baseline justify-between">
                                  <div className="flex items-center gap-1.5 text-amber-900 text-xs font-extrabold">
                                    <Hourglass className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                    <span>Esperando al cliente...</span>
                                  </div>
                                  <span className="text-base font-black text-[#0A1525] font-mono">
                                    ${typeof orden.ganancia_estimada === 'number' && orden.ganancia_estimada > 0 ? (Number(orden.ganancia_estimada) * 1.5).toFixed(2) : '75.00'}{' '}
                                    <span className="text-[10px] font-sans text-slate-500 font-bold">USD</span>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAprobarCliente(orden);
                                  }}
                                  className="w-full h-8 px-3 rounded-xl bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                                  <span>Marcar como Aprobado por el Cliente</span>
                                </button>
                              </div>
                            )}

                            {/* En REPUESTOS_EN_RUTA: Avatar del Mecánico Asignado + Gestión de Runner */}
                            {columna.id === 'REPUESTOS_EN_RUTA' && (
                              <div className="space-y-1.5 ml-5">
                                <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                                  <MecanicoAsignadoBadge onClick={() => { setOrdenParaEvidencia(orden); setModalMecanicoDetalleOpen(true); }} />
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
                                    className="w-full h-8 px-3 rounded-xl bg-sky-500 hover:bg-[#0A1525] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                                  >
                                    <Bike className="w-3.5 h-3.5" />
                                    <span>Asignar Runner</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {/* En EN_EJECUCION: Avatar del Mecánico Asignado + Estado de Instalación + Ver Checklist */}
                            {columna.id === 'EN_EJECUCION' && (
                              <div className="space-y-2 ml-5">
                                <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                                  <MecanicoAsignadoBadge onClick={() => { setOrdenParaEvidencia(orden); setModalMecanicoDetalleOpen(true); }} />
                                  <span className="text-[10px] font-extrabold text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E56B0] animate-pulse" />
                                    En Ejecución
                                  </span>
                                </div>
                                <div className="pt-0.5">
                                  <Link
                                    href={`/aliados/servicio/${orden.id}`}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
                                    title="Ver Checklist TTM y Candado de Odómetro"
                                  >
                                    <ClipboardCheck className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Ver Checklist TTM</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* En PAGO_REPORTADO / PENDIENTE_PAGO: Ver Comprobante + Rechazar / Aprobar */}
                            {(columna.id === 'PAGO_REPORTADO' || columna.id === 'PENDIENTE_PAGO') && (
                              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 ml-5 space-y-2.5">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-900">
                                    Total a Liquidar:
                                  </span>
                                  <span className="text-base font-black text-[#0A1525] font-mono">
                                    ${typeof orden.ganancia_estimada === 'number' && orden.ganancia_estimada > 0 ? (Number(orden.ganancia_estimada) * 1.5).toFixed(2) : '75.00'}{' '}
                                    <span className="text-[10px] font-sans text-slate-500 font-bold">USD</span>
                                  </span>
                                </div>

                                {orden.estado === 'PAGO_REPORTADO' || orden.comprobante_url ? (
                                  <div className="space-y-2">
                                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                                      <span className="text-emerald-800 font-extrabold flex items-center gap-1.5 text-[11px]">
                                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                        Ticket Cargado
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAbrirComprobante(orden);
                                        }}
                                        className="h-6 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>Ver Comprobante</span>
                                      </button>
                                    </div>

                                    {/* Dos botones: Rechazar vs Aprobar Pago y Cerrar Orden */}
                                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                      <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRechazarComprobante(orden);
                                        }}
                                        className="h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                                        title="Rechazar comprobante y devolver a Pendiente de Pago"
                                      >
                                        <X className="w-3 h-3 stroke-[2.5]" />
                                        <span>Rechazar</span>
                                      </button>

                                      <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAprobarPagoYTerminar(orden);
                                        }}
                                        className="h-8 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border border-slate-900/10 text-[10px] font-black flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer active:scale-95"
                                        title="Aprobar pago y cerrar orden (el dinero entra oficialmente)"
                                      >
                                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                        <span>Aprobar Pago</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const tel = orden.cliente_telefono || '0414-2314194';
                                        const msg = `Hola ${orden.cliente_nombre || 'estimado cliente'}, te recordamos los datos para realizar el pago de tu servicio en TuTallerMóvil: Zelle (correo@tutallermovil.com) o Pago Móvil (0102 • V-1786991 • 0414-2314194). Puedes subir tu comprobante en tu portal: https://tutallermovil.vercel.app/cliente/servicio/${orden.id}`;
                                        window.open(generarLinkWhatsApp(tel, msg), '_blank');
                                      }}
                                      className="w-full h-8 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-[10px] font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                      <span>Recordar Pago por WhatsApp</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleValidarPagoYCerrar(orden);
                                      }}
                                      className="w-full h-8 rounded-xl bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] text-[10px] font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                                      <span>Validar Pago y Cerrar</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Abajo: Sector y Acciones Rápidas */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between pl-5">
                              <div className="flex items-center gap-1 text-[11px] text-[#475569] font-semibold">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[100px] sm:max-w-[120px]">{orden.sector}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Botón Ver Evidencia: solo cuando el servicio llega a ejecución (o posterior) */}
                                {(columna.id === 'EN_EJECUCION' || columna.id === 'PAGO_REPORTADO') && (
                                  <button
                                    type="button"
                                    disabled={estaBloqueadaPorOtra}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAbrirEvidencia(orden);
                                    }}
                                    className="h-7 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border bg-blue-50/90 hover:bg-blue-100 text-[#1E56B0] border-blue-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={orden.foto_odometro_url ? 'Foto de odómetro y evidencias verificadas (Clic para ver)' : 'Ver evidencia del servicio'}
                                  >
                                    <Camera className="w-3.5 h-3.5 text-[#1E56B0]" />
                                    <span>{orden.foto_odometro_url ? 'Evidencia ✓' : 'Evidencia'}</span>
                                  </button>
                                )}

                                {/* Botón de asignación táctica en columna lead nuevo */}
                                {columna.id === 'LEAD_NUEVO' && (
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
                                      if (columna.id === 'LEAD_NUEVO') {
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
              className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Header Modal */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs border border-[#0A1525]/10 shrink-0">
                    <Calculator className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                        Cotizador Táctico con Repuestos del Catálogo
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-[#1E56B0] rounded-lg transition-colors cursor-help"
                            aria-label="Regla de exoneración de diagnóstico"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#0A1525] text-white max-w-xs">
                          <p className="font-bold text-xs text-[#CCFF00]">Regla de Exoneración P0</p>
                          <p className="text-[11px] text-slate-200">
                            La regla de negocio exonerará los $15 si la cotización supera los $40.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-[#475569] font-medium">
                      Regla de Negocio P0: Diagnóstico de $15 100% GRATIS en reparaciones &gt; $40
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (ordenParaCotizar) desbloquearTarjeta(ordenParaCotizar.id);
                    setModalCotizadorOpen(false);
                  }}
                  className="p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector de Orden Activa */}
              {ordenes.length > 0 && (
                <div className="my-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Car className="w-4 h-4 text-[#1E56B0] shrink-0" />
                    <span className="text-xs font-bold text-slate-500 shrink-0">Cotizando para:</span>
                    <span className="text-xs font-black text-[#0A1525] truncate">
                      {ordenParaCotizar?.vehiculo_modelo || ordenes[0].vehiculo_modelo} — {ordenParaCotizar?.cliente_nombre || ordenes[0].cliente_nombre}
                    </span>
                  </div>

                  <select
                    value={ordenParaCotizar?.id || ordenes[0]?.id || ''}
                    onChange={(e) => {
                      const sel = ordenes.find((o) => o.id === e.target.value);
                      if (sel) setOrdenParaCotizar(sel);
                    }}
                    className="text-xs font-bold bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-[#0A1525] focus:outline-none focus:border-[#1E56B0] cursor-pointer shadow-2xs"
                  >
                    {ordenes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.vehiculo_modelo} • {o.cliente_nombre} ({o.sector})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Contenido Principal en Dos Columnas (Scrollable) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 py-1 flex-1">
                
                {/* Columna Izquierda: Mano de Obra, Buscador Command y Carrito (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Mano de Obra */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A1525] mb-1.5">
                      Mano de Obra Especializada ($ USD)
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

                  {/* 1. Buscador de Repuestos (Command / Combobox) */}
                  <div className="space-y-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#1E56B0]" />
                        <span>Añadir Repuestos del Catálogo</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {catalogoRepuestos.length} disponibles en red
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={busquedaRepuesto}
                        onChange={(e) => setBusquedaRepuesto(e.target.value)}
                        placeholder="Buscar repuesto (ej: Freno, Corolla, Bujías, Optima)..."
                        className="w-full h-10 pl-9 pr-8 text-xs font-semibold bg-white border border-[#E2E8F0] focus:border-[#1E56B0] rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                      />
                      {busquedaRepuesto && (
                        <button
                          type="button"
                          onClick={() => setBusquedaRepuesto('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Desplegable de Resultados de Búsqueda (Combobox) */}
                    {busquedaRepuesto.trim().length > 0 && (
                      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xl p-2 max-h-56 overflow-y-auto space-y-1.5 z-20 relative">
                        {repuestosFiltradosCatalogo.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No se encontraron repuestos para &ldquo;{busquedaRepuesto}&rdquo;
                          </div>
                        ) : (
                          repuestosFiltradosCatalogo.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E2E8F0] flex items-center justify-between gap-3 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={rep.foto_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=150&q=80'}
                                  alt={rep.nombre_repuesto}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=150&q=80';
                                  }}
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-[#0A1525] truncate">
                                    {rep.nombre_repuesto}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span className="font-bold text-[#1E56B0]">{rep.marca}</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[150px]">{rep.compatibilidad}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-black text-xs text-[#0A1525]">
                                  ${Number(rep.precio_usd).toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAgregarRepuesto(rep)}
                                  className="h-7 px-2.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black flex items-center gap-1 shadow-2xs border border-[#0A1525]/10 cursor-pointer active:scale-95"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" />
                                  <span>Añadir</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Carrito de Cotización */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                        Carrito de Cotización ({repuestosSeleccionados.length})
                      </span>
                      {repuestosSeleccionados.length > 0 && (
                        <span className="font-mono font-bold text-xs text-[#1E56B0]">
                          Subtotal Repuestos: ${totalRepuestosCatalogo.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {repuestosSeleccionados.length === 0 ? (
                      <div className="p-3.5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 bg-[#F8FAFC]">
                        Sin repuestos seleccionados. Escribe en el buscador para sumar piezas del catálogo.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {repuestosSeleccionados.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 px-2.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={item.foto_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=100&q=80'}
                                alt={item.nombre_repuesto}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=100&q=80';
                                }}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0A1525] truncate">
                                  {item.nombre_repuesto}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold truncate">
                                  {item.marca} • ${item.precio_usd.toFixed(2)} c/u
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {/* Selector de Cantidad Interactivo */}
                              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleModificarCantidad(item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-[#0A1525] hover:bg-white active:scale-90 transition-all cursor-pointer"
                                  title={item.cantidad > 1 ? "Reducir cantidad" : "Eliminar repuesto"}
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.cantidad}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    handleEstablecerCantidad(item.id, isNaN(val) ? 1 : Math.max(1, val));
                                  }}
                                  className="w-7 text-center text-xs font-mono font-black text-slate-800 bg-transparent focus:outline-none focus:bg-white rounded px-0 py-0"
                                  title="Editar cantidad"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleModificarCantidad(item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-[#0A1525] hover:bg-[#CCFF00] active:scale-90 transition-all cursor-pointer"
                                  title="Aumentar cantidad"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <span className="font-mono font-black text-xs text-[#0A1525] min-w-[54px] text-right">
                                ${(item.precio_usd * item.cantidad).toFixed(2)}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleEliminarRepuesto(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar del presupuesto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Repuestos / Insumos Adicionales Manuales (Opcional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
                        Insumos Manuales ($ USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={repuestos}
                        onChange={(e) => setRepuestos(e.target.value)}
                        placeholder="0.00 (Opcional)"
                        className="w-full h-9 px-3 text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
                        Notas del Presupuesto
                      </label>
                      <input
                        type="text"
                        value={notasCotizacion}
                        onChange={(e) => setNotasCotizacion(e.target.value)}
                        placeholder="Ej. Piezas con garantía oficial"
                        className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white"
                      />
                    </div>
                  </div>

                </div>

                {/* Columna Derecha: Resumen Financiero Animado Spatial UI (5 cols) */}
                <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">
                        Desglose en Vivo (Spatial UI)
                      </span>
                      <span className="text-[10px] font-mono text-[#1E56B0] font-bold">
                        {repuestosSeleccionados.length} piezas
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-[#475569] font-medium">
                      <span>Mano de Obra:</span>
                      <span className="font-bold text-[#0A1525] font-mono">${numManoObra.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-[#475569] font-medium">
                      <span>Repuestos de Catálogo:</span>
                      <span className="font-bold text-[#0A1525] font-mono">${totalRepuestosCatalogo.toFixed(2)}</span>
                    </div>

                    {numRepuestosManual > 0 && (
                      <div className="flex justify-between text-xs text-[#475569] font-medium">
                        <span>Insumos Adicionales:</span>
                        <span className="font-bold text-[#0A1525] font-mono">${numRepuestosManual.toFixed(2)}</span>
                      </div>
                    )}

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

                  {/* Total Final Facturable */}
                  <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
                        Total Facturable:
                      </span>
                      <span className="text-3xl font-black text-[#1E56B0] font-mono tracking-tight">
                        ${totalCotizacion.toFixed(2)}{' '}
                        <span className="text-xs font-sans text-slate-500 font-bold">USD</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-2 text-[11px] text-[#475569]">
                      <Bike className="w-4 h-4 text-[#1E56B0] shrink-0" />
                      <span>
                        Al guardar, se descontará del inventario en <strong className="text-[#0A1525]">orden_repuestos</strong> para el Runner.
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Botones de Acción (Footer del Modal) */}
              <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const listaRepuestos = repuestosSeleccionados
                      .map((r) => `${r.nombre_repuesto} ($${r.precio_usd.toFixed(2)})`)
                      .join(', ');
                    const text = `Presupuesto TuTallerMóvil: Subtotal $${subtotalServicio.toFixed(2)} | ${
                      exoneraDiagnostico ? 'Diagnóstico GRATIS' : 'Diagnóstico $15.00'
                    } | Total Final: $${totalCotizacion.toFixed(2)} USD. ${
                      listaRepuestos ? `Repuestos: ${listaRepuestos}. ` : ''
                    }${notasCotizacion ? `(${notasCotizacion})` : ''}`;
                    navigator.clipboard.writeText(text);
                    alert('¡Presupuesto copiado al portapapeles!');
                  }}
                  className="sm:w-auto px-4 h-11 text-xs font-bold bg-[#F8FAFC] hover:bg-slate-100 text-[#0A1525] border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                >
                  Copiar WhatsApp
                </button>

                {/* Botón Secundario: Exportar PDF */}
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleExportarPDF}
                  className="sm:w-auto px-4.5 h-11 text-xs font-bold bg-white hover:bg-slate-50 text-[#0A1525] border border-[#CBD5E1] rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  title="Descargar cotización formal en PDF"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1E56B0]" />
                      <span>Generando PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-[#1E56B0]" />
                      <span>Exportar PDF</span>
                    </>
                  )}
                </button>

                {/* Botón Principal: Guardar Cotización */}
                <button
                  type="button"
                  disabled={guardandoCotizacion}
                  onClick={handleGuardarCotizacion}
                  className="flex-1 h-11 text-xs font-black bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-all cursor-pointer border border-[#0A1525]/10 shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {guardandoCotizacion ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-[#0A1525] border-t-transparent rounded-full animate-spin" />
                      <span>Guardando en orden_repuestos...</span>
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Guardar Cotización</span>
                    </>
                  )}
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

              {/* Botón para ver Evidencia de Odómetro */}
              <button
                type="button"
                onClick={() => {
                  setModalMecanicoDetalleOpen(false);
                  setModalEvidenciaOpen(true);
                }}
                className="w-full h-11 rounded-2xl bg-[#F8FAFC] hover:bg-[#CCFF00] text-[#0A1525] text-xs font-black flex items-center justify-center gap-2 border border-[#CBD5E1] transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Camera className="w-4 h-4 text-[#1E56B0]" />
                <span>Ver Foto del Odómetro {ordenParaEvidencia?.foto_odometro_url ? '(Foto Subida ✓)' : '(Pendiente)'}</span>
              </button>

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
                    if (ordenParaRadar) desbloquearTarjeta(ordenParaRadar.id);
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
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 8. TOAST ANIMADO: COTIZACIÓN ENVIADA AL CLIENTE          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastCotizacion && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A1525] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3.5 max-w-md"
          >
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center text-white shrink-0 shadow-xs font-black">
              <Check className="w-5 h-5 text-[#0A1525] stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">
                {toastCotizacion}
              </p>
              <p className="text-[11px] text-slate-400">
                Repuestos guardados en orden_repuestos para control de inventario y runner.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastCotizacion(null)}
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 9. MODAL VISOR DE EVIDENCIA DE ODÓMETRO (Zoom-in Framer) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalEvidenciaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 relative overflow-hidden space-y-4"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={() => setModalEvidenciaOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer z-10"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Visor */}
              <div className="flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Camera className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-[#0A1525] tracking-tight truncate">
                    Evidencias Técnicas del Servicio
                  </h3>
                  <p className="text-xs text-[#475569] font-medium truncate">
                    {ordenParaEvidencia ? `${ordenParaEvidencia.vehiculo_modelo} • ${ordenParaEvidencia.cliente_nombre}` : 'Orden de Servicio'}
                  </p>
                </div>
              </div>

              {/* Selector de Pestañas (3 Evidencias Obligatorias) */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTabEvidenciaModal('odometro')}
                  className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tabEvidenciaModal === 'odometro'
                      ? 'bg-white text-[#0A1525] shadow-xs'
                      : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span className="truncate">1. Odómetro</span>
                  {ordenParaEvidencia?.foto_odometro_url && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTabEvidenciaModal('repuesto_viejo')}
                  className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tabEvidenciaModal === 'repuesto_viejo'
                      ? 'bg-white text-[#0A1525] shadow-xs'
                      : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">2. Rep. Viejo</span>
                  {ordenParaEvidencia?.foto_repuesto_viejo_url && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTabEvidenciaModal('repuesto_nuevo')}
                  className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tabEvidenciaModal === 'repuesto_nuevo'
                      ? 'bg-white text-[#0A1525] shadow-xs'
                      : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">3. Rep. Nuevo</span>
                  {ordenParaEvidencia?.foto_repuesto_nuevo_url && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>

              {/* Contenido Dinámico de la Pestaña Seleccionada */}
              {(() => {
                const fotoActual =
                  tabEvidenciaModal === 'odometro'
                    ? ordenParaEvidencia?.foto_odometro_url
                    : tabEvidenciaModal === 'repuesto_viejo'
                    ? ordenParaEvidencia?.foto_repuesto_viejo_url || (ordenParaEvidencia?.estado === 'EN_EJECUCION' || ordenParaEvidencia?.estado === 'PENDIENTE_PAGO' ? 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80' : null)
                    : ordenParaEvidencia?.foto_repuesto_nuevo_url || (ordenParaEvidencia?.estado === 'EN_EJECUCION' || ordenParaEvidencia?.estado === 'PENDIENTE_PAGO' ? 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80' : null);

                const tituloActual =
                  tabEvidenciaModal === 'odometro'
                    ? 'Foto de Kilometraje (Odómetro Inicial)'
                    : tabEvidenciaModal === 'repuesto_viejo'
                    ? 'Foto de Pieza Defectuosa Extraída (Repuesto Viejo)'
                    : 'Foto de Pieza Nueva Instalada (Repuesto Nuevo)';

                const descPendiente =
                  tabEvidenciaModal === 'odometro'
                    ? 'El mecánico debe fotografiar el odómetro para validar el kilometraje real en sitio.'
                    : tabEvidenciaModal === 'repuesto_viejo'
                    ? 'El mecánico debe fotografiar la pieza defectuosa extraída para control de calidad.'
                    : 'El mecánico debe fotografiar el repuesto nuevo instalado para respaldar la garantía oficial.';

                return fotoActual ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] bg-slate-900 group shadow-inner flex items-center justify-center">
                      <motion.img
                        key={tabEvidenciaModal}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        src={fotoActual}
                        alt={tituloActual}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#16A34A] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Evidencia Verificada en Sitio</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {tituloActual}
                        </span>
                        <span className="font-mono font-bold text-[#0A1525] text-[11px]">
                          Bucket Supabase: evidencias
                        </span>
                      </div>
                      <a
                        href={fotoActual}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#1E56B0] text-xs font-bold flex items-center gap-1.5 border border-[#CBD5E1] shadow-2xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Original</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
                      <AlertTriangle className="w-7 h-7 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-amber-900">
                        {tituloActual}
                      </h4>
                      <p className="text-xs text-amber-800 font-bold max-w-sm mx-auto leading-relaxed">
                        {descPendiente}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      🔒 La liquidación del servicio permanecerá bloqueada hasta que el técnico capture esta evidencia técnica desde su móvil.
                    </p>
                  </div>
                );
              })()}

              {/* Botón de Aceptar */}
              <button
                type="button"
                onClick={() => setModalEvidenciaOpen(false)}
                className="w-full h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
              >
                Cerrar Visor
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 10. MODAL VISOR DE COMPROBANTE DE PAGO (VALIDACIÓN TTM)  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalComprobanteOpen && ordenParaComprobante && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 relative overflow-hidden space-y-4"
            >
              <button
                type="button"
                onClick={handleCerrarComprobante}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer z-10"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Receipt className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Validación de Pago
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                      Tesorería QA
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] font-medium truncate">
                    Orden #{ordenParaComprobante.id.slice(0, 8)} • {ordenParaComprobante.cliente_nombre}
                  </p>
                </div>
              </div>

              {/* Resumen de Monto y Vehículo */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Monto a Conciliar</span>
                  <span className="text-base font-mono font-black text-[#0A1525]">
                    ${typeof ordenParaComprobante.ganancia_estimada === 'number' && ordenParaComprobante.ganancia_estimada > 0 ? (Number(ordenParaComprobante.ganancia_estimada) * 1.5).toFixed(2) : '75.00'} USD
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehículo</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {ordenParaComprobante.vehiculo_modelo}
                  </span>
                  <span className="text-[10px] text-[#1E56B0] font-mono font-bold">
                    Sector: {ordenParaComprobante.sector}
                  </span>
                </div>
              </div>

              {/* Visor de la Imagen del Ticket */}
              <div className="space-y-2">
                <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] bg-slate-900 shadow-inner flex items-center justify-center group">
                  <img
                    src={
                      ordenParaComprobante.comprobante_url ||
                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
                    }
                    alt="Comprobante Bancario"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#16A34A] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Comprobante Subido por Cliente</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="font-mono text-[11px]">
                    Bucket: evidencias • SHA-256 verificado
                  </span>
                  <a
                    href={
                      ordenParaComprobante.comprobante_url ||
                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E56B0] hover:underline font-bold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver en alta resolución</span>
                  </a>
                </div>
              </div>

              {/* Botones de Acción de Validación */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={actualizandoId === ordenParaComprobante.id}
                  onClick={() => handleRechazarComprobante(ordenParaComprobante)}
                  className="h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Rechazar Comprobante</span>
                </button>

                <button
                  type="button"
                  disabled={actualizandoId === ordenParaComprobante.id}
                  onClick={() => handleAprobarPagoYTerminar(ordenParaComprobante)}
                  className="h-12 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border border-slate-900/10 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Aprobar Pago y Cerrar</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal de Bienvenida para Operadora */}
      <OnboardingModal
        rol="OPERADORA"
        isOpen={mostrarTutorial ? true : undefined}
        onClose={() => {
          setMostrarTutorial(false);
          setMostrarBotonTutorial(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboarding_seen_operadora', 'true');
          }
        }}
      />

      {/* Botón Flotante de Soporte Técnico (WhatsApp FAB) */}
      <FloatingSupportButton mensajePersonalizado="Hola, soy operadora de TuTallerMóvil y necesito soporte técnico con el Tablero de Despacho." />

    </div>
  );
}
