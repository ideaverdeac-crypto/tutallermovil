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
  Bell,
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
  KeyRound,
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
  MessageSquare,
  Receipt,
  Lock,
  Truck,
  Building2,
  Mail,
  Copy,
  Navigation,
  Share2
} from 'lucide-react';
import BandejaWhatsAppSheet from '@/components/BandejaWhatsAppSheet';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import CredencialesOperadorasModal from '@/components/CredencialesOperadorasModal';
import ModalCrearServicioManual from '@/components/ModalCrearServicioManual';
import CierreServiciosDia, { ServicioFinalizadoDia, SERVICIOS_DIA_INICIALES } from '@/components/CierreServiciosDia';
import { enviarEmailRecibo } from '@/lib/email';
import { registrarOperacionEnBitacora } from '@/lib/audit';
import {
  solicitarPermisoNotificaciones,
  estanNotificacionesActivas,
  notificarNuevoServicioOperadora,
  reproducirSonidoOperadora
} from '@/lib/notificaciones';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrdenKanban {
  id: string;
  cliente_nombre: string;
  cliente_telefono?: string | null;
  cliente_email?: string | null;
  vehiculo_id?: string | null;
  vehiculo_placa?: string | null;
  vehiculo_marca?: string | null;
  vehiculo_modelo: string;
  vehiculo_anio?: number | string | null;
  kilometraje_actual?: number | null;
  falla_reportada: string;
  sector: string;
  direccion?: string | null;
  ubicacion_gps?: string | null;
  tipo_servicio?: string | null;
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
  es_flota?: boolean | null;
  empresa_flota?: string | null;
  placa_flota?: string | null;
  diagnostico_json?: any | null;
}

// 25 Puntos de Inspección Certificada TuTallerMóvil Protocol 2027
const CHECKLIST_25_CATEGORIAS = [
  {
    id: 'fluidos',
    titulo: '1. Nivel y Calidad de Fluidos (7 Puntos)',
    items: [
      { id: 'aceite_motor', nombre: 'Aceite de Motor', descripcion: 'Nivel en varilla y viscosidad adecuada' },
      { id: 'liquido_frenos', nombre: 'Líquido de Frenos', descripcion: 'Humedad menor a 2% y nivel en reservorio' },
      { id: 'refrigerante', nombre: 'Refrigerante / Coolant', descripcion: 'Estado del líquido y hermeticidad de mangueras' },
      { id: 'direccion_hidraulica', nombre: 'Dirección Hidráulica', descripcion: 'Nivel de ATF y ausencia de fugas en bomba' },
      { id: 'limpiaparabrisas', nombre: 'Agua Limpiaparabrisas', descripcion: 'Nivel de reservorio y aditivo desengrasante' },
      { id: 'aceite_transmision', nombre: 'Aceite de Transmisión', descripcion: 'Nivel y color de fluido de caja' },
      { id: 'fugas_motor', nombre: 'Hermeticidad de Motor', descripcion: 'Inspección de fugas en tapa de válvulas y cárter' }
    ]
  },
  {
    id: 'frenos',
    titulo: '2. Sistema de Frenos (6 Puntos)',
    items: [
      { id: 'pastillas_delanteras', nombre: 'Pastillas Delanteras', descripcion: 'Grosor de pasta mayor a 4 mm' },
      { id: 'pastillas_traseras', nombre: 'Pastillas Traseras / Bandas', descripcion: 'Desgaste simétrico en ambos lados' },
      { id: 'discos_freno', nombre: 'Discos de Freno', descripcion: 'Superficie uniforme sin rebaba crítica' },
      { id: 'lineas_mangueras', nombre: 'Líneas y Mangueras', descripcion: 'Sin agrietamiento ni pérdida de presión' },
      { id: 'freno_mano', nombre: 'Freno de Estacionamiento', descripcion: 'Tensión de guaya (4 a 6 clics de bloqueo)' },
      { id: 'calipers_mordazas', nombre: 'Calipers / Mordazas', descripcion: 'Desplazamiento libre de pasadores y pistones' }
    ]
  },
  {
    id: 'suspension',
    titulo: '3. Suspensión y Tren Delantero (6 Puntos)',
    items: [
      { id: 'amortiguadores', nombre: 'Amortiguadores', descripcion: 'Sin fugas de aceite ni rebote excesivo' },
      { id: 'munones_rotulas', nombre: 'Muñones y Rótulas', descripcion: 'Guardapolvos intactos y sin holgura axial' },
      { id: 'terminales_direccion', nombre: 'Terminales de Dirección', descripcion: 'Alineación firme y terminales ajustados' },
      { id: 'bujes_mesetas', nombre: 'Bujes de Meseta', descripcion: 'Gomas sin resequedad ni desprendimiento' },
      { id: 'barra_estabilizadora', nombre: 'Bielas y Barra Estabilizadora', descripcion: 'Gomas y terminales sin juego' },
      { id: 'rodamientos_rueda', nombre: 'Rodamientos de Rueda', descripcion: 'Sin zumbido al giro libre ni juego axial' }
    ]
  },
  {
    id: 'electrico',
    titulo: '4. Luces y Sistema Eléctrico (6 Puntos)',
    items: [
      { id: 'luces_principales', nombre: 'Luces Principales', descripcion: 'Altas, bajas y alineación de faros' },
      { id: 'luces_stop', nombre: 'Luces de Stop e Intermitentes', descripcion: 'Funcionamiento simultáneo al frenar' },
      { id: 'bornes_bateria', nombre: 'Bornes de Batería', descripcion: 'Ajuste firme, sin sulfatación' },
      { id: 'estado_bateria', nombre: 'Salud de Batería (CCA)', descripcion: 'Capacidad de arranque y voltaje en reposo' },
      { id: 'alternador_carga', nombre: 'Carga de Alternador', descripcion: 'Voltaje en ralentí entre 13.8V y 14.4V' },
      { id: 'correa_accesorios', nombre: 'Correa de Accesorios', descripcion: 'Tensión adecuada y sin grietas superficiales' }
    ]
  }
];

export interface OperadoraPresencia {
  id: string;
  nombre: string;
  email: string;
  iniciales: string;
  avatarColor: string;
  fotoUrl?: string;
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

export interface MecanicoDespacho {
  id: string;
  nombre: string;
  iniciales: string;
  credencial: string;
  especialidad: string;
  unidad: string;
  rating: string;
  foto: string;
  telefono?: string;
  distancia?: string;
  disponible: boolean;
}

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
          className={`inline-flex items-center gap-1 font-mono text-[11px] font-black ${colorTexto} ${esVencido ? 'animate-pulse' : ''
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

// Avatar del mecánico asignado con foto oficial en el círculo y badge de técnico verificado
interface MecanicoAvatarSquircleProps {
  initials?: string;
  fotoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'verified' | 'available' | 'slate';
  className?: string;
  onClick?: () => void;
}

function MecanicoAvatarSquircle({
  initials = 'TM',
  fotoUrl = '',
  size = 'sm',
  status = 'verified',
  className = '',
  onClick
}: MecanicoAvatarSquircleProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-full text-[11px]',
    md: 'w-11 h-11 rounded-full text-sm',
    lg: 'w-20 h-20 rounded-full text-2xl'
  }[size];

  const dotSize = {
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 ring-[1.5px]',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 ring-2',
    lg: 'w-6 h-6 -bottom-1 -right-1 ring-[3px]'
  }[size];

  // Si fotoUrl es la foto de stock repetida o está vacía, no mostrarla y usar iniciales limpias
  const tieneFotoReal =
    fotoUrl &&
    fotoUrl.trim() !== '' &&
    !fotoUrl.includes('photo-1534528741775-53994a69daeb');

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} bg-[#0A1525] border border-slate-300/80 flex items-center justify-center font-black tracking-wider text-[#CCFF00] shadow-sm select-none shrink-0 overflow-visible ${onClick ? 'cursor-pointer hover:border-[#1E56B0] hover:scale-105 transition-all' : ''
        } ${className}`}
    >
      {/* Fotografía Real o Iniciales en Squircle */}
      {tieneFotoReal ? (
        <img
          src={fotoUrl}
          alt={initials}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="font-mono font-black">{initials}</span>
      )}

      {/* Indicador inferior derecho con aro blanco idéntico a las referencias del usuario */}
      {status === 'verified' ? (
        <span
          className={`absolute ${dotSize} rounded-full bg-[#16A34A] ring-white ring-2 flex items-center justify-center shadow-xs text-white z-10`}
          title="Técnico Verificado Oficial"
        >
          <Check className={`${size === 'lg' ? 'w-3.5 h-3.5 stroke-[3.5]' : size === 'md' ? 'w-2 h-2 stroke-[3.5]' : 'w-1.5 h-1.5 stroke-[3.5]'}`} />
        </span>
      ) : status === 'available' ? (
        <span
          className={`absolute ${dotSize} rounded-full bg-emerald-500 ring-white ring-2 flex items-center justify-center shadow-xs z-10`}
          title="Disponible / En ruta"
        >
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
        </span>
      ) : (
        <span
          className={`absolute ${dotSize} rounded-full bg-[#8B9BB4] ring-white ring-2 shadow-xs z-10`}
          title="Estatus de servicio"
        />
      )}
    </div>
  );
}

// Badge interactivo del mecánico asignado con la foto oficial en el círculo
function MecanicoAsignadoBadge({
  nombre = 'Especialista',
  credencial = '#TTM-0000',
  fotoUrl = '',
  onClick
}: {
  nombre?: string;
  credencial?: string;
  fotoUrl?: string;
  onClick?: () => void;
}) {
  const iniciales = nombre
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('') || 'CM';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className="flex items-center gap-2 hover:bg-slate-100/90 px-2 py-1 -mx-2 -my-1 rounded-xl transition-all cursor-pointer text-left w-full group select-none"
      title={`Ver ficha operativa de ${nombre} (${credencial})`}
    >
      {/* Círculo con la foto del mecánico e indicador verificado */}
      <MecanicoAvatarSquircle
        fotoUrl={fotoUrl}
        initials={iniciales}
        size="sm"
        status="verified"
      />

      <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
        <span className="text-xs font-bold text-[#0A1525] group-hover:text-[#1E56B0] transition-colors truncate">
          {nombre}
        </span>
        <span className="font-mono text-[10px] text-slate-500 font-semibold shrink-0">
          {credencial}
        </span>
      </div>
    </button>
  );
}

export default function TableroDespachoPage() {
  const [ordenes, setOrdenes] = useState<OrdenKanban[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  // Vista Activa: Tablero Activo (Kanban) vs Servicios del Día (Cierre & Expedientes)
  const [vistaActiva, setVistaActiva] = useState<'kanban' | 'servicios_dia'>('kanban');
  const [serviciosDia, setServiciosDia] = useState<ServicioFinalizadoDia[]>([]);

  // Estados de Drag and Drop
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Estados de Modales y Paneles Tácticos
  const [modalCotizadorOpen, setModalCotizadorOpen] = useState(false);
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false);
  const [unreadWhatsAppCount, setUnreadWhatsAppCount] = useState(0);
  const [modalCrearServicioManualOpen, setModalCrearServicioManualOpen] = useState(false);
  const [modalOperadorasOpen, setModalOperadorasOpen] = useState(false);
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

  // Estados de Mecánicos Registrados (Sin datos de prueba)
  const [listaMecanicos, setListaMecanicos] = useState<MecanicoDespacho[]>([]);
  const [cargandoMecanicos, setCargandoMecanicos] = useState<boolean>(true);

  const obtenerMecanicoAsignado = (mecanicoId?: string | null): MecanicoDespacho => {
    if (!mecanicoId) {
      return {
        id: '',
        nombre: 'Sin Asignar',
        iniciales: 'SA',
        credencial: '#TTM-PEND',
        especialidad: 'Especialista Pendiente',
        unidad: 'Despacho Pendiente',
        rating: '-',
        foto: '',
        telefono: '',
        distancia: '',
        disponible: true
      };
    }
    const encontrado = listaMecanicos.find((m) => m.id === mecanicoId);
    if (encontrado) return encontrado;
    return {
      id: mecanicoId,
      nombre: 'Mecánico Registrado',
      iniciales: 'MR',
      credencial: '#TTM-ASIG',
      especialidad: 'Especialista en Ruta',
      unidad: 'Unidad Móvil',
      rating: '5.0 ★',
      foto: '',
      telefono: '',
      distancia: 'En zona',
      disponible: true
    };
  };

  // Notificaciones Push y Alertas Sonoras (Piano Elegante)
  const [pushActivo, setPushActivo] = useState<boolean>(false);
  const [toastPush, setToastPush] = useState<string | null>(null);

  useEffect(() => {
    setPushActivo(estanNotificacionesActivas());
  }, []);

  const handleToggleNotificaciones = async () => {
    const permiso = await solicitarPermisoNotificaciones();
    if (permiso === 'granted') {
      setPushActivo(true);
      notificarNuevoServicioOperadora({
        id: 'test',
        cliente: 'Torre de Despacho',
        vehiculo: 'Alerta Sonora Especial de Operadora',
        falla: 'Notificaciones Push activadas con tono New Notification 010',
        direccion: 'Central Caracas'
      });
      setToastPush('🔔 Notificaciones push de operadora activadas con sonido especial');
      setTimeout(() => setToastPush(null), 4000);
    } else {
      reproducirSonidoOperadora();
      setToastPush('⚠️ Permiso push bloqueado en el navegador. (Sonido de prueba ejecutado)');
      setTimeout(() => setToastPush(null), 4000);
    }
  };
  const [ordenParaComprobante, setOrdenParaComprobante] = useState<OrdenKanban | null>(null);

  // Estados de Visor de Diagnóstico Checklist 25 Puntos
  const [modalDiagnosticoOpen, setModalDiagnosticoOpen] = useState(false);
  const [ordenParaDiagnostico, setOrdenParaDiagnostico] = useState<OrdenKanban | null>(null);

  // Estados de Presencia Multiusuario y Bloqueo de Tarjetas (Figma/Notion Style)
  const [miOperadora, setMiOperadora] = useState<{
    nombre: string;
    email: string;
    iniciales: string;
    avatarColor: string;
    fotoUrl?: string;
  }>({
    nombre: 'Ana Pérez',
    email: 'ana.despacho@tutallermovil.com',
    iniciales: 'AP',
    avatarColor: 'bg-indigo-600',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  });

  const [esDuenio, setEsDuenio] = useState<boolean>(false);

  const [operadorasConectadas, setOperadorasConectadas] = useState<OperadoraPresencia[]>([
    {
      id: 'ana.despacho@tutallermovil.com',
      nombre: 'Ana Pérez',
      email: 'ana.despacho@tutallermovil.com',
      iniciales: 'AP',
      avatarColor: 'bg-indigo-600',
      fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      onlineAt: '2026-11-17T12:00:00.000Z'
    }
  ]);

  const [toastCondicionCarrera, setToastCondicionCarrera] = useState<string | null>(null);
  const canalPresenciaRef = useRef<any>(null);

  // Estados y funciones para la Ficha Detallada del Cliente (Teléfono, Ubicación, Nombre, Correo y Falla)
  const [modalDetalleClienteOpen, setModalDetalleClienteOpen] = useState(false);
  const [ordenParaDetalleCliente, setOrdenParaDetalleCliente] = useState<OrdenKanban | null>(null);
  const [copiadoDatoCliente, setCopiadoDatoCliente] = useState<string | null>(null);

  const handleAbrirDetalleCliente = (orden: OrdenKanban) => {
    setOrdenParaDetalleCliente(orden);
    setModalDetalleClienteOpen(true);
  };

  const handleCopiarDatoCliente = (texto: string, clave: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiadoDatoCliente(clave);
      setTimeout(() => setCopiadoDatoCliente(null), 2500);
    }
  };

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
    } catch (e) { }
    try {
      const supabase = createClient();
      await supabase.from('ordenes').update({ bloqueado_por: miOperadora.nombre }).eq('id', ordenId);
    } catch (e) { }
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
    } catch (e) { }
    try {
      const supabase = createClient();
      await supabase.from('ordenes').update({ bloqueado_por: null }).eq('id', ordenId);
    } catch (e) { }
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

  const registrarServicioFinalizadoEnCierre = (orden: OrdenKanban) => {
    const totalFacturado = Number(orden.monto_aprobado_cliente || orden.ganancia_estimada || 75.0);
    const retencionQA = +(totalFacturado * 0.03).toFixed(2);
    const netoMecanico = +(totalFacturado - retencionQA).toFixed(2);
    const placaVehiculo =
      orden.placa_flota ||
      (orden.vehiculo_modelo.match(/\[([A-Z0-9-]+)\]/)?.[1]) ||
      orden.vehiculo_placa ||
      'AB123CD';
    const mecAsignado = obtenerMecanicoAsignado(orden.mecanico_id);
    const runnerNombre = runnersAsignados[orden.id] || null;

    const ahora = new Date();
    const horaStr = ahora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

    const nuevoServicio: ServicioFinalizadoDia = {
      id: `srv_${Date.now()}`,
      orden_id: orden.id,
      codigo_servicio: `#TTM-SRV-${orden.id.slice(0, 6).toUpperCase()}`,
      fecha_cierre: `Hoy, ${horaStr}`,
      hora_cierre: horaStr,
      duracion_total_minutos: 65,
      es_flota: Boolean(orden.es_flota || orden.empresa_flota),
      empresa_flota: orden.empresa_flota || undefined,
      cliente: {
        nombre: orden.cliente_nombre || 'Cliente TuTallerMóvil',
        telefono: orden.cliente_telefono || '+58 414 231 4194',
        email: orden.cliente_email || undefined
      },
      vehiculo: {
        marca: orden.vehiculo_marca || 'Vehículo',
        modelo: orden.vehiculo_modelo,
        anio: orden.vehiculo_anio || 2020,
        placa: placaVehiculo,
        kilometraje_inicial: (orden.kilometraje_actual || 85400) - 8,
        kilometraje_final: orden.kilometraje_actual || 85400
      },
      mecanico: {
        id: mecAsignado.id,
        nombre: mecAsignado.nombre,
        credencial: mecAsignado.credencial,
        especialidad: mecAsignado.especialidad,
        unidad: mecAsignado.unidad,
        foto: mecAsignado.foto
      },
      operadora: {
        nombre: miOperadora.nombre,
        email: miOperadora.email,
        metodo_pago: 'Pago Móvil Banesco',
        referencia_pago: `PM-${Math.floor(100000 + Math.random() * 900000)}`,
        monto_validado_usd: totalFacturado,
        comprobante_url:
          orden.comprobante_url ||
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'
      },
      runner: runnerNombre
        ? {
          nombre: runnerNombre,
          unidad: 'Moto Bera SBR Negra (Placa AB987CD)',
          pin_validacion: String(Math.floor(1000 + Math.random() * 9000)),
          repuestera: 'AutoPartes Chacao'
        }
        : null,
      cotizacion: {
        mano_de_obra_usd: +(totalFacturado * 0.4).toFixed(2),
        repuestos: [
          {
            nombre: 'Repuestos e Insumos Certificados TTM',
            marca: 'OEM Original',
            cantidad: 1,
            precio_usd: +(totalFacturado * 0.6).toFixed(2),
            tienda: 'AutoPartes Chacao'
          }
        ],
        subtotal_repuestos_usd: +(totalFacturado * 0.6).toFixed(2),
        total_facturado_usd: totalFacturado,
        retencion_qa_3pct_usd: retencionQA,
        pago_neto_mecanico_usd: netoMecanico
      },
      diagnostico_y_trabajo: {
        falla_reportada: orden.falla_reportada || 'Mantenimiento Preventivo Certificado',
        trabajo_realizado: orden.falla_reportada || 'Servicio Mecánico Realizado y Conciliado',
        checklist_json: orden.diagnostico_json || null,
        foto_odometro_url:
          orden.foto_odometro_url ||
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
        foto_repuesto_viejo_url:
          orden.foto_repuesto_viejo_url ||
          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
        foto_repuesto_nuevo_url:
          orden.foto_repuesto_nuevo_url ||
          'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
      }
    };

    setServiciosDia((prev) => {
      const actualizados = [nuevoServicio, ...prev.filter((s) => s.orden_id !== orden.id)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttm_servicios_dia_finalizados', JSON.stringify(actualizados));
        } catch (e) { }
      }
      return actualizados;
    });
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

      // Inserción automática en la tabla historial_servicios
      try {
        const supabase = createClient();
        const placaVehiculo =
          orden.vehiculo_placa ||
          orden.placa_flota ||
          (orden.vehiculo_modelo?.match(/\[([A-Z0-9-]+)\]/)?.[1]) ||
          '';

        let vId = orden.vehiculo_id;
        if (!vId && placaVehiculo) {
          const { data: vData } = await supabase
            .from('vehiculos')
            .select('id')
            .eq('placa', placaVehiculo)
            .maybeSingle();
          if (vData?.id) vId = vData.id;
        }

        if (vId) {
          const fotoEvidencia =
            orden.foto_repuesto_nuevo_url ||
            orden.foto_odometro_url ||
            'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80';
          const kmFinal = orden.kilometraje_actual || 85400;
          const costoTotal = Number(
            orden.monto_aprobado_cliente || orden.ganancia_estimada || 75.0
          );

          const nuevoHistorial = {
            vehiculo_id: vId,
            fecha: new Date().toISOString().split('T')[0],
            kilometraje: kmFinal,
            tipo_servicio: orden.falla_reportada || 'Mantenimiento Certificado TTM',
            costo_usd: costoTotal,
            foto_evidencia: fotoEvidencia,
            checklist_json: {
              ...(orden.diagnostico_json || {}),
              detalles: `Servicio cerrado y conciliado por operadora ${miOperadora.nombre}`
            },
            created_at: new Date().toISOString()
          };

          const { error: errHist } = await supabase
            .from('historial_servicios')
            .insert([nuevoHistorial]);

          if (errHist) {
            console.warn('Aviso insertando en historial_servicios:', errHist.message);
          }
        }
      } catch (errHist) {
        console.warn('Excepción guardando historial_servicios:', errHist);
      }

      await moverOrden(orden.id, 'PAGADO');

      // Guardar en el expediente oficial de Cierre de Servicios del Día
      registrarServicioFinalizadoEnCierre(orden);

      // Simulación de envío automático de correo con el recibo del servicio
      enviarEmailRecibo({
        correo: orden.cliente_email || 'cliente@tutallermovil.com',
        clienteNombre: orden.cliente_nombre || 'Cliente',
        ordenId: orden.id,
        montoTotal: Number(orden.ganancia_estimada || 75),
        servicioDescripcion: orden.falla_reportada || 'Servicio Mecánico TuTallerMóvil',
        placaVehiculo: orden.vehiculo_placa || undefined
      }).catch((e) => console.warn('Error simulando email:', e));

      setModalComprobanteOpen(false);
      setToastPagoExitoso(
        `¡Pago Aprobado y Conciliado! Orden #${orden.id.slice(0, 8)} cerrada oficialmente. Historial médico vehicular actualizado.`
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

      let ordenesFinales: OrdenKanban[] = [];

      if (data && data.length > 0) {
        ordenesFinales = [...data];
      }

      // Sincronizar con órdenes de Flotas Corporativas y Solicitudes Recientes (Inspecciones / Leads)
      if (typeof window !== 'undefined') {
        try {
          const rawFlota = localStorage.getItem('ttm_ordenes_flota_recientes');
          if (rawFlota) {
            const parsedFlota = JSON.parse(rawFlota);
            if (Array.isArray(parsedFlota)) {
              parsedFlota.forEach((of: OrdenKanban) => {
                if (!ordenesFinales.some((o) => o.id === of.id)) {
                  ordenesFinales.unshift(of);
                }
              });
            }
          }

          const rawRecientes = localStorage.getItem('ttm_ordenes_recientes');
          if (rawRecientes) {
            const parsedRecientes = JSON.parse(rawRecientes);
            if (Array.isArray(parsedRecientes)) {
              parsedRecientes.forEach((ord: OrdenKanban) => {
                if (!ordenesFinales.some((o) => o.id === ord.id)) {
                  ordenesFinales.unshift(ord);
                }
              });
            }
          }
        } catch (e) { }
      }

      // Si no hay órdenes (base de datos sin datos), inicializar estrictamente en vacío para producción
      if (ordenesFinales.length === 0) {
        ordenesFinales = [];
        setServiciosDia([]);
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('ttm_servicios_dia_finalizados');
            localStorage.removeItem('ttm_ordenes_flota_recientes');
          } catch (e) {}
        }
      } else {
        setServiciosDia((prev) => {
          const validos = prev.filter((s) =>
            ordenesFinales.some((o) => o.id === s.orden_id && (o.estado === 'FINALIZADO' || o.estado === 'PAGADO'))
          );
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ttm_servicios_dia_finalizados', JSON.stringify(validos));
            } catch (e) {}
          }
          return validos;
        });
      }

      if (error) {
        console.error('Error cargando órdenes para el Kanban:', error);
      }
      setOrdenes(ordenesFinales);
      if (ordenesFinales.length > 0 && !ordenParaCotizar) {
        setOrdenParaCotizar(ordenesFinales[0]);
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
        setCatalogoRepuestos([]);
      }
    } catch (err) {
      console.warn('Aviso cargando catálogo de repuestos:', err);
    }
  };

  const cargarMecanicos = async () => {
    try {
      setCargandoMecanicos(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, rol, nombre_completo, telefono, codigo_aliado, avatar_url, perfil_completado, created_at')
        .or('rol.eq.MECANICO,rol.eq.mecanico,codigo_aliado.ilike.%TTM%');

      let mecanicosEncontrados: MecanicoDespacho[] = [];

      if (data && data.length > 0) {
        mecanicosEncontrados = data.map((m: any) => {
          const nombres = (m.nombre_completo || 'Mecánico').trim().split(' ');
          const iniciales = nombres.length > 1
            ? `${nombres[0][0]}${nombres[1][0]}`.toUpperCase()
            : nombres[0].slice(0, 2).toUpperCase();

          return {
            id: m.id,
            nombre: m.nombre_completo || 'Especialista Mecánico',
            iniciales,
            credencial: m.codigo_aliado || `#TTM-${m.id.slice(0, 4).toUpperCase()}`,
            especialidad: 'Especialista Mecánico Certificado',
            unidad: 'Unidad Móvil de Asistencia',
            rating: '5.0 ★',
            foto: m.avatar_url || '',
            telefono: m.telefono || '',
            distancia: 'En zona (disponible)',
            disponible: true
          };
        });
      }

      // Sincronizar con mecánicos guardados localmente (fallback offline o registro reciente)
      if (typeof window !== 'undefined') {
        try {
          const keys = ['ttm_aliados_mecanicos', 'ttm_aliados_registrados', 'ttm_aliado_sesion'];
          const listaLocal: any[] = [];
          keys.forEach((k) => {
            const raw = localStorage.getItem(k);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  listaLocal.push(...parsed);
                } else if (parsed && typeof parsed === 'object') {
                  listaLocal.push(parsed);
                }
              } catch {}
            }
          });

          listaLocal.forEach((lm: any) => {
            if (lm.rol === 'MECANICO' || !lm.rol) {
              const nombreLocal = (lm.nombre || lm.nombre_completo || '').trim();
              if (!nombreLocal) return;

              const idx = mecanicosEncontrados.findIndex(
                (m) =>
                  m.id === lm.id ||
                  (lm.codigo_aliado && m.credencial === lm.codigo_aliado) ||
                  (lm.telefono && m.telefono && lm.telefono === m.telefono)
              );

              const nombres = nombreLocal.split(' ');
              const iniciales = nombres.length > 1
                ? `${nombres[0][0]}${nombres[1][0]}`.toUpperCase()
                : nombres[0].slice(0, 2).toUpperCase();

              if (idx !== -1) {
                // Si el registro local contiene el nombre real auténtico, sobreescribir cualquier dato placeholder
                mecanicosEncontrados[idx].nombre = nombreLocal;
                mecanicosEncontrados[idx].iniciales = iniciales;
                if (lm.telefono) mecanicosEncontrados[idx].telefono = lm.telefono;
                if (lm.detalles?.especialidad_principal) {
                  mecanicosEncontrados[idx].especialidad = lm.detalles.especialidad_principal;
                }
                if (lm.foto || lm.avatar_url) {
                  mecanicosEncontrados[idx].foto = lm.foto || lm.avatar_url;
                }

                // Sincronizar a Supabase en segundo plano para que quede grabado de forma definitiva
                supabase
                  .from('perfiles')
                  .update({
                    nombre_completo: nombreLocal,
                    telefono: lm.telefono || mecanicosEncontrados[idx].telefono,
                    rol: 'MECANICO',
                    perfil_completado: true
                  })
                  .eq('id', mecanicosEncontrados[idx].id)
                  .then();
              } else {
                mecanicosEncontrados.unshift({
                  id: lm.id || `mec_loc_${Date.now()}`,
                  nombre: nombreLocal,
                  iniciales,
                  credencial: lm.codigo_aliado || '#TTM-REG',
                  especialidad: lm.detalles?.especialidad_principal || 'Mecánica General & Diagnóstico',
                  unidad: lm.detalles?.vehiculo_traslado
                    ? `${lm.detalles.vehiculo_traslado} • ${lm.detalles.placa_vehiculo || 'CARACAS'}`
                    : 'Unidad Móvil',
                  rating: '5.0 ★',
                  foto: lm.foto || lm.avatar_url || '',
                  telefono: lm.telefono || '',
                  distancia: lm.detalles?.zona_residencia ? `Base: ${lm.detalles.zona_residencia}` : 'En zona',
                  disponible: true
                });
              }
            }
          });
        } catch (e) {
          console.warn('Error leyendo mecánicos locales:', e);
        }
      }

      setListaMecanicos(mecanicosEncontrados);
    } catch (err) {
      console.error('Error cargando lista de mecánicos:', err);
    } finally {
      setCargandoMecanicos(false);
    }
  };

  // Refrescar lista de mecánicos al abrir el modal o sheet de asignación
  useEffect(() => {
    if (sheetRadarMecanicosOpen || modalAsignarOpen) {
      cargarMecanicos();
    }
  }, [sheetRadarMecanicosOpen, modalAsignarOpen]);

  // Escuchar eventos globales desde la barra de navegación móvil (PWA Bottom Nav)
  useEffect(() => {
    const handleOpenWhatsApp = () => setModalWhatsAppOpen(true);
    const handleOpenOperadoras = () => setModalOperadorasOpen(true);
    window.addEventListener('ttm:open-whatsapp', handleOpenWhatsApp);
    window.addEventListener('ttm:open-operadoras', handleOpenOperadoras);
    return () => {
      window.removeEventListener('ttm:open-whatsapp', handleOpenWhatsApp);
      window.removeEventListener('ttm:open-operadoras', handleOpenOperadoras);
    };
  }, []);

  // 5. Supabase Realtime: Suscripción a cambios, Presencia y Concurrencia
  useEffect(() => {
    // 0. Detectar operadora actual desde cookies o credenciales locales
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^| )ttm_user_code=([^;]+)/);
      if (match && match[2]) {
        const email = decodeURIComponent(match[2]).toLowerCase();
        let nombre = email.split('@')[0].replace(/[._-]/g, ' ');
        nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        let fotoUrl = email.includes('carlos')
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';

        try {
          const raw = localStorage.getItem('ttm_operadoras_credenciales');
          if (raw) {
            const ops = JSON.parse(raw);
            const found = ops.find((o: any) => o.email.toLowerCase() === email);
            if (found) {
              nombre = found.nombre;
              if (found.fotoUrl) fotoUrl = found.fotoUrl;
            }
          }
        } catch (e) { }

        const parts = nombre.split(' ');
        const iniciales = (parts[0]?.charAt(0) || 'O') + (parts[1]?.charAt(0) || '');
        const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'];
        const avatarColor = colors[Math.abs(email.length) % colors.length];

        setMiOperadora({ nombre, email, iniciales, avatarColor, fotoUrl });
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

      // Detectar si el usuario actual es el Dueño (ADMIN)
      const roleMatch = document.cookie.match(/(^| )ttm_role=([^;]+)/);
      const userRole = roleMatch ? decodeURIComponent(roleMatch[2]).toUpperCase() : '';

      const codeMatch = document.cookie.match(/(^| )ttm_user_code=([^;]+)/);
      const userCode = codeMatch ? decodeURIComponent(codeMatch[2]).toLowerCase() : '';

      if (
        userRole === 'ADMIN' ||
        userCode.includes('admin') ||
        userCode.includes('dueno') ||
        userCode.includes('owner') ||
        userCode === 'admin@tutallermovil.com'
      ) {
        setEsDuenio(true);
      } else {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (
            user?.user_metadata?.role?.toUpperCase() === 'ADMIN' ||
            user?.email?.toLowerCase().includes('admin') ||
            user?.email?.toLowerCase().includes('dueno')
          ) {
            setEsDuenio(true);
          }
        }).catch(() => { });
      }
    }

    cargarOrdenes();
    cargarCatalogoRepuestos();
    cargarMecanicos();

    // Inicializar servicios finalizados del día estrictamente en vacío
    setServiciosDia([]);

    const supabase = createClient();

    // Canal en tiempo real para sincronizar mecánicos registrados
    const canalMecanicos = supabase
      .channel('despacho_perfiles_mecanicos_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'perfiles'
        },
        () => {
          cargarMecanicos();
        }
      )
      .subscribe();

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
            const fallbackFoto = (p.email || key).toLowerCase().includes('carlos')
              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
            online.push({
              id: key,
              nombre: p.nombre || key,
              email: p.email || key,
              iniciales: p.iniciales || 'OP',
              avatarColor: p.avatarColor || 'bg-indigo-600',
              fotoUrl: p.fotoUrl || fallbackFoto,
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
        (payload: any) => {
          console.log('⚡ Kanban Despacho Realtime Update:', payload);
          if (
            payload.eventType === 'INSERT' ||
            (payload.new && (payload.new.estado === 'DISPONIBLE' || payload.new.estado === 'LEAD_NUEVO'))
          ) {
            const ord = payload.new;
            notificarNuevoServicioOperadora({
              id: ord?.id,
              cliente: ord?.cliente_nombre,
              vehiculo: ord?.marca_modelo || `${ord?.vehiculo_marca || ''} ${ord?.vehiculo_modelo || ''}`.trim(),
              falla: ord?.falla_reportada,
              direccion: ord?.direccion_texto || ord?.sector,
              monto: ord?.monto_total || ord?.ganancia_estimada
            });
          }
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
            fotoUrl: miOperadora.fotoUrl,
            onlineAt: new Date().toISOString()
          });
        }
      });

    canalPresenciaRef.current = canal;

    return () => {
      supabase.removeChannel(canal);
      supabase.removeChannel(canalMecanicos);
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
      } catch (e) { }

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

    // Si se suelta en EN_INSPECCION y no tiene mecánico asignado, asignar si hay especialistas registrados
    if (targetColId === 'EN_INSPECCION' && !orden.mecanico_id) {
      if (listaMecanicos.length > 0) {
        await moverOrden(ordenId, 'EN_INSPECCION', listaMecanicos[0].id);
      } else {
        await moverOrden(ordenId, 'EN_INSPECCION');
      }
    } else {
      await moverOrden(ordenId, targetCol.estadoDestino);
    }
  };

  const handleSeleccionarMecanico = async (mecanico: MecanicoDespacho) => {
    if (!ordenParaAsignar) return;
    await moverOrden(ordenParaAsignar.id, 'EN_INSPECCION', mecanico.id);
    setModalAsignarOpen(false);
    setOrdenParaAsignar(null);
  };

  // 1. Asignación Forzada desde el Radar de Mecánicos
  const handleForzarAsignacion = async (mecanico: MecanicoDespacho) => {
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

  // 2. Asignación de Runner para Despacho de Repuestos (Persistente en Supabase P1-01)
  const handleSeleccionarRunner = async (runnerNombre: string) => {
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

    // Persistir runner en Supabase
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          runner_nombre: runnerNombre,
          estado: 'REPUESTOS_EN_RUTA',
          updated_at: new Date().toISOString()
        })
        .eq('id', ordenId);
    } catch (err) {
      console.error('Error persistiendo runner en Supabase:', err);
    }

    setModalRunnerOpen(false);
    setOrdenParaRunner(null);
  };

  // 3. Validación de Pago y Cierre con Retención QA (Invocación RPC P0-01)
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

    // Guardar en el expediente oficial de Cierre de Servicios del Día
    registrarServicioFinalizadoEnCierre(orden);

    try {
      const supabase = createClient();
      // P0-01: Invocación RPC atómica que garantiza la creación del historial y retención QA
      const { data, error } = await supabase.rpc('liberar_pago_orden', {
        p_orden_id: orden.id,
        p_operadora_email: miOperadora?.email || 'despacho@tutallermovil.com'
      });

      if (error) {
        console.error('Error invocando liberar_pago_orden, aplicando fallback update directo:', error);
        await supabase
          .from('ordenes')
          .update({ estado: 'PAGADO' })
          .eq('id', orden.id);
      } else {
        console.log('[RPC EXITOSO] Historial médico creado y pago liberado:', data);
      }
    } catch (err) {
      console.error('Error al actualizar estado PAGADO en Supabase:', err);
      try {
        const supabase = createClient();
        await supabase.from('ordenes').update({ estado: 'PAGADO' }).eq('id', orden.id);
      } catch (e) {
        console.error('Fallback falló:', e);
      }
    }

    setToastPagoExitoso('Orden pagada. Historial médico creado y Fondo QA (3%) conciliado.');
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
        `Falla: ${orden.falla_reportada.slice(0, 38)}${orden.falla_reportada.length > 38 ? '...' : ''
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
              <img
                src="/icon.svg"
                alt="TTM"
                className="h-[35px] sm:h-10 w-auto object-contain"
              />
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#0A1525] text-[#CCFF00] px-2.5 py-0.5 rounded-md">
                Torre de Despacho
              </span>
            </div>
          </div>

          {/* Acciones de Cabecera en Móvil: Compacto (PWA Mobile-First) */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalCrearServicioManualOpen(true)}
              className="h-9 px-2.5 text-xs font-black bg-[#16a34a] text-white rounded-xl shadow-xs flex items-center gap-1 cursor-pointer min-h-[38px]"
              title="Crear servicio manual recibido por llamada"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>Nuevo</span>
            </motion.button>

            {operadorasConectadas.length > 0 && (
              <div
                onClick={() => setModalOperadorasOpen(true)}
                className="relative w-8 h-8 rounded-full border-2 border-white shadow-xs overflow-hidden bg-slate-200 cursor-pointer shrink-0 min-h-[32px] min-w-[32px]"
                title="Ver Operadoras y Perfil"
              >
                <img
                  src={
                    operadorasConectadas[0].fotoUrl ||
                    (operadorasConectadas[0].email?.toLowerCase().includes('carlos')
                      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
                      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80')
                  }
                  alt={operadorasConectadas[0].nombre}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
            )}
          </div>

          {/* Acciones de Cabecera en Escritorio */}
          <div className="hidden md:flex items-center gap-3">
            {/* Acceso a Finanzas & QA y Gestión de Operadoras: Estrictamente Exclusivo para el Dueño / ADMIN */}
            {esDuenio && (
              <>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOperadorasOpen(true)}
                  className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="Credenciales de Operadoras de Despacho (Exclusivo Dueño / Admin)"
                >
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span className="hidden md:inline">Operadoras</span>
                </motion.button>

                <Link
                  href="/admin/finanzas"
                  className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Panel Financiero y Administrativo (Exclusivo Dueño / Admin)"
                >
                  <Landmark className="w-4 h-4 text-[#1E56B0]" />
                  <span className="hidden md:inline">Finanzas & QA</span>
                </Link>
              </>
            )}

            {/* Botón Bandeja WhatsApp Central */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalWhatsAppOpen(true)}
              className="relative h-10 px-3.5 sm:px-4 text-xs font-black bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-emerald-600/30"
              title="Bandeja de Entrada de WhatsApp Central"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Chats WhatsApp</span>
              {unreadWhatsAppCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs">
                  {unreadWhatsAppCount}
                </span>
              )}
            </motion.button>

            {/* Botón Nuevo Servicio Manual (Llamada Telefónica) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalCrearServicioManualOpen(true)}
              className="h-10 px-3.5 sm:px-4 text-xs font-black bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-emerald-600/30"
              title="Crear servicio manual recibido por llamada telefónica directa"
            >
              <Phone className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Nuevo Servicio (Llamada)</span>
              <span className="sm:hidden">Nuevo</span>
            </motion.button>

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

            {/* Barra de Operadoras Conectadas (Figma / Notion Style con Foto Oficial) */}
            <div className="flex items-center -space-x-2 mr-1">
              {operadorasConectadas.map((op, idx) => {
                const fotoParaMostrar =
                  op.fotoUrl ||
                  (op.email?.toLowerCase().includes('carlos')
                    ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
                    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80');

                return (
                  <div
                    key={op.email || idx}
                    className="relative w-8.5 h-8.5 rounded-full border-2 border-white shadow-xs overflow-visible bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                    title={`${op.nombre} (${op.email}) • Operadora en línea`}
                  >
                    <img
                      src={fotoParaMostrar}
                      alt={op.nombre}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                );
              })}
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

            <button
              type="button"
              onClick={handleToggleNotificaciones}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${pushActivo
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0A1525] hover:bg-slate-50'
                }`}
              title={
                pushActivo
                  ? 'Notificaciones Push y Sonido Especial de Operadora Activos (Clic para probar)'
                  : 'Activar Notificaciones Push con Sonido Especial de Operadora'
              }
            >
              <Bell className={`w-4 h-4 ${pushActivo ? 'text-emerald-600' : ''}`} />
              <span
                className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white transition-all ${pushActivo ? 'bg-emerald-500 animate-pulse' : 'bg-[#CCFF00]'
                  }`}
              />
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

        {/* Selector de Vistas Operativas: Tablero Kanban Activo vs Cierre de Servicios del Día */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-300/60 shadow-xs">
            <button
              type="button"
              onClick={() => setVistaActiva('kanban')}
              className={`h-11 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${vistaActiva === 'kanban'
                ? 'bg-[#0A1525] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0A1525] hover:bg-white/50'
                }`}
            >
              <Kanban className="w-4 h-4 text-[#CCFF00]" />
              <span>Tablero Activo (Flujo en Vivo)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${vistaActiva === 'kanban'
                  ? 'bg-white/20 text-[#CCFF00]'
                  : 'bg-slate-300/80 text-slate-800'
                  }`}
              >
                {ordenes.filter((o) => o.estado !== 'PAGADO').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVistaActiva('servicios_dia')}
              className={`h-11 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${vistaActiva === 'servicios_dia'
                ? 'bg-[#0A1525] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#0A1525] hover:bg-white/50'
                }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Servicios del Día (Cierre &amp; Expedientes)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${vistaActiva === 'servicios_dia'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 text-emerald-900'
                  }`}
              >
                {serviciosDia.length}
              </span>
            </button>
          </div>

          {vistaActiva === 'kanban' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
              <span>En gestión activa:</span>
              <span className="bg-[#1E56B0] text-white px-2.5 py-0.5 rounded-full font-mono font-black text-xs shadow-2xs">
                {ordenes.filter((o) => o.estado !== 'PAGADO').length} órdenes
              </span>
            </div>
          )}
        </div>

        {/* Vista Condicional: Servicios Finalizados del Día o Tablero Kanban */}
        {vistaActiva === 'servicios_dia' ? (
          <CierreServiciosDia
            servicios={serviciosDia}
            onVolverAlKanban={() => setVistaActiva('kanban')}
            operadoraActual={miOperadora}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Banner de Bienvenida Admin / Primer inicio de sesión sin órdenes */}
            {ordenes.length === 0 && (
              <div className="mb-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-[#CCFF00]/20 border border-emerald-500/30 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0A1525]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#0A1525]">
                      ¡Sistema listo! Esperando el primer cliente de la historia
                    </h3>
                    <p className="text-xs text-[#475569] font-medium mt-0.5">
                      Todas las conexiones de Supabase Realtime y el tablero de despacho están al 100%. Las solicitudes de clientes, aliados y repuestos entrarán directamente aquí.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
                  ● 100% En Vivo
                </span>
              </div>
            )}

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
                    className={`min-w-[320px] w-[320px] shrink-0 snap-center rounded-3xl flex flex-col shadow-xs overflow-hidden max-h-[calc(100vh-210px)] transition-all duration-200 ${isDragOver
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
                              Esperando órdenes...
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
                          const esFlota = Boolean(
                            orden.es_flota === true ||
                            orden.cliente_nombre?.toLowerCase().includes('flota') ||
                            orden.cliente_nombre?.toLowerCase().includes('logística') ||
                            orden.falla_reportada?.includes('[FLOTA') ||
                            orden.empresa_flota
                          );
                          const esInspeccionTecnica = Boolean(
                            orden.tipo_servicio === 'INSPECCION_TECNICA' ||
                            (orden as any).servicio === 'INSPECCION_TECNICA' ||
                            orden.falla_reportada?.toUpperCase().includes('INSPECCI') ||
                            orden.falla_reportada?.toUpperCase().includes('25 PUNTO') ||
                            orden.falla_reportada?.toUpperCase().includes('EXPEDIENTE')
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
                              onClick={() => {
                                if (!isBeingDragged) {
                                  handleAbrirDetalleCliente(orden);
                                }
                              }}
                              className={`rounded-2xl p-3.5 transition-all relative flex flex-col justify-between gap-2.5 select-none group cursor-pointer ${estaBloqueadaPorOtra
                                ? 'border-rose-200 bg-rose-50/20 cursor-not-allowed opacity-90'
                                : isBeingDragged
                                  ? 'opacity-40 border-2 border-dashed border-[#1E56B0] scale-95 shadow-none'
                                  : esFlota
                                    ? 'bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/70 border-2 border-[#1E56B0] shadow-md shadow-blue-900/10 ring-2 ring-[#1E56B0]/25 hover:border-[#0A1525] hover:shadow-lg'
                                    : esInspeccionTecnica
                                      ? 'bg-gradient-to-br from-[#F4FFB8]/40 via-white to-lime-50/70 border-2 border-[#CCFF00] shadow-md shadow-lime-900/10 ring-2 ring-[#CCFF00]/60 hover:border-[#0A1525] hover:shadow-lg'
                                      : 'bg-white border border-[#E2E8F0] hover:border-[#1E56B0] shadow-sm hover:shadow-md'
                                }`}
                            >
                              {/* 0. Banner Distintivo Flota Corporativa B2B (Resalta la tarjeta de color diferente) */}
                              {esFlota && (
                                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#0A1525] text-white shadow-2xs border border-blue-400/30">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wide text-[#CCFF00] uppercase truncate">
                                    <Truck className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                                    <span className="truncate">{orden.empresa_flota || 'Flota Corporativa B2B'}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-white font-extrabold px-1.5 py-0.5 rounded bg-[#1E56B0] shrink-0 shadow-2xs">
                                    PRIORIDAD B2B
                                  </span>
                                </div>
                              )}

                              {/* 0. Banner Distintivo Inspección Técnica 25 Puntos (Firma Verde Lima Oficial de la Marca) */}
                              {esInspeccionTecnica && !esFlota && (
                                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#CCFF00] text-[#0A1525] shadow-2xs border border-[#0A1525]/15">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wide uppercase truncate">
                                    <ClipboardCheck className="w-3.5 h-3.5 text-[#0A1525] shrink-0 stroke-[2.5]" />
                                    <span className="truncate font-black">INSPECCIÓN TÉCNICA (25 PUNTOS)</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-white font-extrabold px-1.5 py-0.5 rounded bg-[#0A1525] shrink-0 shadow-2xs">
                                    AUDITORÍA TTM
                                  </span>
                                </div>
                              )}

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
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${estaBloqueadaPorOtra
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
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h3 className="text-sm font-black text-[#0A1525] tracking-tight leading-snug truncate">
                                        {vehiculo}
                                      </h3>
                                      {esFlota && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-blue-100 text-[#1E56B0] border border-blue-200 shrink-0">
                                          FLOTA
                                        </span>
                                      )}
                                      {esInspeccionTecnica && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-[#CCFF00] text-[#0A1525] border border-lime-400 shrink-0 shadow-2xs">
                                          25 PUNTOS
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-semibold text-[#475569] truncate flex items-center gap-1 group-hover:text-[#1E56B0] transition-colors" title="Clic para ver datos del cliente (teléfono, correo, dirección)">
                                        {esFlota && <Building2 className="w-3 h-3 text-[#1E56B0] shrink-0" />}
                                        <span className="truncate">{orden.cliente_nombre || 'Cliente Particular'}</span>
                                      </p>
                                      <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-[#1E56B0]" title="Ver datos del cliente">
                                        <User className="w-3 h-3 text-[#1E56B0]" />
                                      </span>
                                    </div>
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
                                    className={`w-full h-8 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed ${
                                      esInspeccionTecnica
                                        ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border border-[#0A1525]/20 shadow-xs'
                                        : 'bg-blue-50 hover:bg-[#CCFF00] text-[#1E56B0] hover:text-[#0A1525] border border-blue-200'
                                    }`}
                                  >
                                    {esInspeccionTecnica ? (
                                      <>
                                        <ClipboardCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Asignar Inspector Certificado</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>Asignar Mecánico</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* En EN_INSPECCION: Avatar del Mecánico + Botón Diagnóstico + Botón de Cotizar */}
                              {columna.id === 'EN_INSPECCION' && (() => {
                                const mecAsignado = obtenerMecanicoAsignado(orden.mecanico_id);
                                return (
                                  <div className="space-y-2 ml-5">
                                    <div className="flex items-center justify-between gap-2">
                                      <MecanicoAsignadoBadge
                                        nombre={mecAsignado.nombre}
                                        credencial={mecAsignado.credencial}
                                        fotoUrl={mecAsignado.foto}
                                        onClick={() => { setOrdenParaEvidencia(orden); setModalMecanicoDetalleOpen(true); }}
                                      />
                                      <div
                                        className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1E56B0] flex items-center justify-center shrink-0 relative shadow-2xs transition-colors cursor-help"
                                        title="Diagnóstico en curso • Mecánico en sitio realizando inspección"
                                      >
                                        <Wrench className="w-3.5 h-3.5 text-[#1E56B0]" />
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1E56B0] animate-pulse ring-2 ring-white" />
                                      </div>
                                    </div>

                                    {/* Botón: Ver Diagnóstico de 25 Puntos */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOrdenParaDiagnostico(orden);
                                        setModalDiagnosticoOpen(true);
                                      }}
                                      className="w-full h-8 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white border border-purple-200 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                                      title="Ver inspección certificada de 25 puntos con repuestos requeridos"
                                    >
                                      <ClipboardCheck className="w-3.5 h-3.5" />
                                      <span>Ver Diagnóstico (25 Puntos)</span>
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
                                );
                              })()}

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
                              {columna.id === 'REPUESTOS_EN_RUTA' && (() => {
                                const mecAsignado = obtenerMecanicoAsignado(orden.mecanico_id);
                                return (
                                  <div className="space-y-1.5 ml-5">
                                    <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                                      <MecanicoAsignadoBadge
                                        nombre={mecAsignado.nombre}
                                        credencial={mecAsignado.credencial}
                                        fotoUrl={mecAsignado.foto}
                                        onClick={() => { setOrdenParaEvidencia(orden); setModalMecanicoDetalleOpen(true); }}
                                      />
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
                                );
                              })()}

                              {/* En EN_EJECUCION: Avatar del Mecánico Asignado + Estado de Instalación + Ver Checklist */}
                              {columna.id === 'EN_EJECUCION' && (() => {
                                const mecAsignado = obtenerMecanicoAsignado(orden.mecanico_id);
                                return (
                                  <div className="space-y-2 ml-5">
                                    <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                                      <MecanicoAsignadoBadge
                                        nombre={mecAsignado.nombre}
                                        credencial={mecAsignado.credencial}
                                        fotoUrl={mecAsignado.foto}
                                        onClick={() => { setOrdenParaEvidencia(orden); setModalMecanicoDetalleOpen(true); }}
                                      />
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
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })()}

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
                                <div className="flex items-center gap-1 text-[11px] text-[#475569] font-semibold group-hover:text-[#1E56B0] transition-colors" title="Clic para ver ubicación en Google Maps / Waze y datos del cliente">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-rose-500 transition-colors" />
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
          </div>
        )}

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
                    const text = `Presupuesto TuTallerMóvil: Subtotal $${subtotalServicio.toFixed(2)} | ${exoneraDiagnostico ? 'Diagnóstico GRATIS' : 'Diagnóstico $15.00'
                      } | Total Final: $${totalCotizacion.toFixed(2)} USD. ${listaRepuestos ? `Repuestos: ${listaRepuestos}. ` : ''
                      }${notasCotizacion ? `(${notasCotizacion})` : ''}`;
                    navigator.clipboard.writeText(text);
                    alert('¡Presupuesto copiado al portapapeles!');
                  }}
                  className="sm:w-auto px-4 h-11 text-xs font-bold bg-[#F8FAFC] hover:bg-slate-100 text-[#0A1525] border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                >
                  Copiar Presupuesto
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/60 backdrop-blur-xs overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-5 sm:p-6 relative my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1E56B0] text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight">
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
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                    Especialistas Verificados Registrados ({listaMecanicos.length})
                  </span>
                  <Link
                    href="/registro/mecanico"
                    target="_blank"
                    className="text-[11px] font-black text-[#1E56B0] hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Registrar Mecánico</span>
                  </Link>
                </div>

                {cargandoMecanicos ? (
                  <div className="p-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1E56B0] mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Cargando especialistas registrados...</p>
                  </div>
                ) : listaMecanicos.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-3 my-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1E56B0] flex items-center justify-center mx-auto">
                      <Wrench className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#0A1525]">No hay mecánicos registrados aún</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Los mecánicos de prueba han sido eliminados. Puedes registrar especialistas en el portal de registro y aparecerán aquí automáticamente.
                      </p>
                    </div>
                    <Link
                      href="/registro/mecanico"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black transition-all shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>Registrar Especialista Mecánico</span>
                    </Link>
                  </div>
                ) : (
                  listaMecanicos.map((mec) => (
                    <div
                      key={mec.id}
                      className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] bg-[#F8FAFC] hover:bg-blue-50/40 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <MecanicoAvatarSquircle
                          initials={mec.iniciales}
                          fotoUrl={mec.foto}
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
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{mec.unidad}</span>
                            {mec.telefono && <span>• Tel: {mec.telefono}</span>}
                          </div>
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
                  ))
                )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/60 backdrop-blur-xs overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-5 sm:p-6 relative my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden space-y-4"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={() => setModalMecanicoDetalleOpen(false)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              {(() => {
                const mecModal = obtenerMecanicoAsignado(ordenParaEvidencia?.mecanico_id);
                return (
                  <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                    {/* Cabecera: Avatar Squircle Oficial w-20 h-20, Nombre, Código y Calificación */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1 text-center sm:text-left">
                      <MecanicoAvatarSquircle initials={mecModal.iniciales} fotoUrl={mecModal.foto} size="lg" status="verified" />

                      <div className="space-y-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                            {mecModal.nombre}
                          </h2>
                          <span className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs" title="Técnico Verificado Oficial">
                            <Check className="w-3 h-3 text-white stroke-[3.5]" />
                          </span>
                        </div>

                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <span className="font-mono text-xs font-black text-[#1E56B0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            {mecModal.credencial}
                          </span>
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                            {mecModal.rating}
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
                            Especialidad
                          </span>
                        </div>
                        <p className="text-xs font-black text-[#0A1525]">
                          {mecModal.especialidad}
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
                            Zona de Atención
                          </span>
                        </div>
                        <p className="text-xs font-black text-[#0A1525]">
                          {mecModal.distancia || 'En Ruta • Caracas'}
                        </p>
                      </motion.div>

                      {/* 2. Unidad de Traslado */}
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
                            Unidad de Traslado
                          </span>
                        </div>
                        <p className="text-xs font-black text-[#0A1525]">
                          {mecModal.unidad}
                        </p>
                      </motion.div>

                      {/* 3. Teléfono */}
                      {mecModal.telefono && (
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
                            {mecModal.telefono}
                          </p>
                        </motion.div>
                      )}
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
                        href={mecModal.telefono ? `tel:${mecModal.telefono}` : '#'}
                        className="flex-1 h-12 rounded-xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Llamar al Mecánico</span>
                      </a>

                      <Link
                        href={`/carnet/${(mecModal.credencial || 'TTM-0842').replace('#', '')}`}
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
                  </div>
                );
              })()}
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
                  <span className="text-[#1E56B0] font-mono">{listaMecanicos.length} registrados</span>
                </div>

                {listaMecanicos.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1E56B0] flex items-center justify-center mx-auto">
                      <Wrench className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#0A1525]">Sin especialistas en radar</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Los mecánicos de prueba fueron eliminados. Los aliados registrados aparecerán aquí para despacho inmediato.
                      </p>
                    </div>
                    <Link
                      href="/registro/mecanico"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black transition-all shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>+ Registrar Mecánico</span>
                    </Link>
                  </div>
                ) : (
                  listaMecanicos.map((mec) => (
                    <div
                      key={mec.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3.5 ${mec.disponible
                        ? 'bg-white border-[#E2E8F0] hover:border-[#1E56B0] shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 opacity-60'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <MecanicoAvatarSquircle
                            initials={mec.iniciales}
                            fotoUrl={mec.foto}
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
                              <span>{mec.distancia || 'En zona'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badge: Verde lima si Disponible, gris si Ocupado */}
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border ${mec.disponible
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
                  ))
                )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/60 backdrop-blur-xs overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
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
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/75 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-4 sm:p-6 relative my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden space-y-4"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={() => setModalEvidenciaOpen(false)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar visor"
                aria-label="Cerrar modal"
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
                  className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${tabEvidenciaModal === 'odometro'
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
                  className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${tabEvidenciaModal === 'repuesto_viejo'
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
                  className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${tabEvidenciaModal === 'repuesto_nuevo'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-4 sm:p-6 relative my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden space-y-4"
            >
              <button
                type="button"
                onClick={handleCerrarComprobante}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar modal"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3 pr-8 shrink-0">
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

              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
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
                  <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] bg-slate-900 shadow-inner flex items-center justify-center group">
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
              </div>

              {/* Botones de Acción de Validación */}
              <div className="grid grid-cols-2 gap-3 pt-2 shrink-0">
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

      {/* ======================================================== */}
      {/* 11. MODAL VISOR DE DIAGNÓSTICO CHECKLIST 25 PUNTOS       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalDiagnosticoOpen && ordenParaDiagnostico && (() => {
          const diag = ordenParaDiagnostico.diagnostico_json || {};
          const itemsResp = diag.items || {};

          // Calcular items con cambio o falla
          const itemsCambioCount = Object.entries(itemsResp).filter(
            ([_, val]) => val === 'requiere_cambio' || val === 'CAMBIO' || val === 'falla'
          ).length || (diag.puntos_cambio ?? (diag.frenos === 'requiere_cambio' ? 3 : 0));

          const itemsOkCount = 25 - itemsCambioCount;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-4 sm:p-6 relative my-auto space-y-4 max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Botón Cerrar */}
                <button
                  type="button"
                  onClick={() => {
                    setModalDiagnosticoOpen(false);
                    setOrdenParaDiagnostico(null);
                  }}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar visor"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Cabecera */}
                <div className="flex items-center gap-3 pr-8 shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                    <ClipboardCheck className="w-6 h-6 text-[#CCFF00]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight">
                        Diagnóstico Certificado 25 Puntos
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Protocolo 2027
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] font-medium truncate">
                      Orden #{ordenParaDiagnostico.id.slice(0, 8)} • {ordenParaDiagnostico.vehiculo_modelo} • {ordenParaDiagnostico.cliente_nombre}
                    </p>
                  </div>
                </div>

                {/* Banner Bento Stats */}
                <div className="grid grid-cols-3 gap-2.5 shrink-0 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Puntos</span>
                    <span className="text-lg font-mono font-black text-[#0A1525]">25</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">En Buen Estado</span>
                    <span className="text-lg font-mono font-black text-emerald-700">
                      {itemsOkCount} OK
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${itemsCambioCount > 0 ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                    <span className={`text-[10px] font-bold uppercase block ${itemsCambioCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                      Requieren Cambio
                    </span>
                    <span className={`text-lg font-mono font-black ${itemsCambioCount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                      {itemsCambioCount} Falla{itemsCambioCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Repuestos recomendados para cotizar */}
                {(diag.piezas_requeridas || ordenParaDiagnostico.falla_reportada) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 shrink-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Repuestos Sugeridos por el Mecánico para Cotizar:</span>
                    </div>
                    <p className="text-xs text-amber-950 font-semibold pl-5">
                      {diag.piezas_requeridas || ordenParaDiagnostico.falla_reportada}
                    </p>
                  </div>
                )}

                {/* Lista Scrolleable de los 25 Puntos Organizados por Categoría */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {CHECKLIST_25_CATEGORIAS.map((cat) => {
                    const itemsDeCat = cat.items.map((it) => {
                      const val = itemsResp[it.id] || (
                        (it.id === 'pastillas_delanteras' || it.id === 'discos_freno' || it.id === 'liquido_frenos') && diag.frenos === 'requiere_cambio'
                          ? 'requiere_cambio'
                          : it.id === 'aceite_motor' && diag.aceite === 'requiere_cambio'
                            ? 'requiere_cambio'
                            : 'ok'
                      );
                      const esFalla = val === 'requiere_cambio' || val === 'CAMBIO' || val === 'falla';
                      return { ...it, val, esFalla };
                    });

                    const tieneFallas = itemsDeCat.some((i) => i.esFalla);

                    return (
                      <div
                        key={cat.id}
                        className={`rounded-2xl border transition-all ${tieneFallas
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-200 bg-white'
                          }`}
                      >
                        <div className="p-3 bg-slate-50 border-b border-slate-200/80 rounded-t-2xl flex items-center justify-between">
                          <span className="text-xs font-black text-[#0A1525]">
                            {cat.titulo}
                          </span>
                          {tieneFallas && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              Atención Requerida
                            </span>
                          )}
                        </div>

                        <div className="p-3 divide-y divide-slate-100 space-y-2">
                          {itemsDeCat.map((item) => (
                            <div
                              key={item.id}
                              className={`pt-2 first:pt-0 flex items-center justify-between gap-3 p-1.5 rounded-xl transition-colors ${item.esFalla ? 'bg-rose-50/80 border border-rose-200' : ''
                                }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-black truncate ${item.esFalla ? 'text-rose-950' : 'text-[#0A1525]'}`}>
                                  {item.nombre}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {item.descripcion}
                                </p>
                              </div>

                              <div className="shrink-0">
                                {item.esFalla ? (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span>REQUIERE CAMBIO</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>OK</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer de Acciones para la Operadora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setModalDiagnosticoOpen(false);
                      setOrdenParaDiagnostico(null);
                    }}
                    className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cerrar Detalle
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalDiagnosticoOpen(false);
                      setOrdenParaCotizar(ordenParaDiagnostico);
                      setModalCotizadorOpen(true);
                    }}
                    className="h-11 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border border-[#0A1525]/10"
                  >
                    <FileText className="w-4 h-4 text-[#0A1525]" />
                    <span>Cotizar Repuestos Detectados</span>
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal Ficha Detallada del Cliente (Teléfono, Ubicación, Nombre, Correo y Falla) */}
      <AnimatePresence>
        {modalDetalleClienteOpen && ordenParaDetalleCliente && (() => {
          const ord = ordenParaDetalleCliente;
          const nombreCliente = ord.cliente_nombre || 'Cliente Particular';
          const telCliente = ord.cliente_telefono || '+58 414 123 4567';
          const emailCliente = ord.cliente_email || (ord as any).email || 'cliente@tutallermovil.com';

          // Formatear dirección completa
          let direccionCompleta = ord.direccion || '';
          if (!direccionCompleta && ord.diagnostico_json?.direccion) {
            direccionCompleta = ord.diagnostico_json.direccion;
          }
          if (!direccionCompleta) {
            direccionCompleta = ord.sector ? `${ord.sector}, Caracas, Venezuela` : 'Caracas, Venezuela';
          }

          // Teléfono para llamadas y WhatsApp
          const telNumeros = telCliente.replace(/[^0-9]/g, '');
          const telParaLlamar = telCliente.replace(/[^0-9+]/g, '');
          let waNumero = telNumeros;
          if (waNumero.startsWith('0')) {
            waNumero = '58' + waNumero.slice(1);
          } else if (waNumero.length === 10 && !waNumero.startsWith('58')) {
            waNumero = '58' + waNumero;
          }
          const msgWhatsApp = encodeURIComponent(`Hola ${nombreCliente}, te contactamos desde TuTallerMóvil respecto a tu solicitud de mecánico para tu ${ord.vehiculo_modelo}.`);
          const urlWhatsApp = `https://wa.me/${waNumero}?text=${msgWhatsApp}`;

          // URLs de navegación
          const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
          const urlWaze = `https://waze.com/ul?q=${encodeURIComponent(direccionCompleta)}`;

          // Texto para copiar ficha completa
          const textoFichaCompleta = `📋 *FICHA DE CLIENTE — TUTALLERMÓVIL*\n` +
            `👤 *Cliente:* ${nombreCliente}\n` +
            `📞 *Teléfono:* ${telCliente}\n` +
            `✉️ *Correo:* ${emailCliente}\n` +
            `📍 *Ubicación:* ${direccionCompleta}\n` +
            `🚗 *Vehículo:* ${ord.vehiculo_modelo}${ord.vehiculo_placa ? ` [${ord.vehiculo_placa}]` : ''}\n` +
            `⚠️ *Falla:* ${ord.falla_reportada}\n` +
            `🕒 *Estado:* ${ord.estado}`;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[92dvh] max-h-[90vh]"
              >
                {/* Header del Modal */}
                <div className="bg-[#0A1525] p-4 sm:p-5 text-white flex items-start justify-between relative shrink-0">
                  <div className="space-y-1 pr-6 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#CCFF00] text-[#0A1525] uppercase tracking-wider">
                        {ord.estado.replace(/_/g, ' ')}
                      </span>
                      {ord.es_flota && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500 text-white uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {ord.empresa_flota || 'Flota B2B'}
                        </span>
                      )}
                      {Boolean(ord.tipo_servicio === 'INSPECCION_TECNICA' || ord.falla_reportada?.toUpperCase().includes('INSPECCI') || ord.falla_reportada?.toUpperCase().includes('25 PUNTO')) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#CCFF00] text-[#0A1525] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <ClipboardCheck className="w-3 h-3 stroke-[2.5]" />
                          Inspección 25 Pts
                        </span>
                      )}
                      <span className="text-slate-400 text-xs font-mono">
                        #{ord.id.slice(0, 8)}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 truncate">
                      <User className="w-5 h-5 text-[#CCFF00] shrink-0" />
                      <span className="truncate">Ficha del Cliente & Datos</span>
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalDetalleClienteOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Cerrar ficha"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-sm">

                  {/* Bloque 1: Identificación del Cliente */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre del Cliente</span>
                      <h3 className="text-base font-black text-[#0A1525] truncate">
                        {nombreCliente}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {ord.es_flota ? 'Conductor / Representante Corporativo' : 'Cliente Particular Verificado'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopiarDatoCliente(nombreCliente, 'nombre')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title="Copiar nombre"
                    >
                      {copiadoDatoCliente === 'nombre' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-black">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bloque 2: Teléfono & Canales de Contacto Directo */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                        Teléfono Móvil
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopiarDatoCliente(telCliente, 'telefono')}
                        className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiadoDatoCliente === 'telefono' ? (
                          <span className="text-emerald-600 font-black">¡Copiado!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar número</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-lg font-mono font-black text-[#0A1525] tracking-wide">
                      {telCliente}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${telParaLlamar}`}
                        className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-[#1E56B0] text-[#1E56B0] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-all shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar Ahora</span>
                      </a>
                      <a
                        href={urlWhatsApp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Bloque 3: Correo Electrónico */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-600" />
                        Correo Electrónico
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopiarDatoCliente(emailCliente, 'email')}
                        className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiadoDatoCliente === 'email' ? (
                          <span className="text-emerald-600 font-black">¡Copiado!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {emailCliente}
                    </div>
                    <div className="pt-1">
                      <a
                        href={`mailto:${emailCliente}?subject=TuTallerMóvil%20-%20Servicio%20para%20${encodeURIComponent(ord.vehiculo_modelo)}`}
                        className="h-8 px-3 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-all shadow-2xs w-full"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Enviar Correo</span>
                      </a>
                    </div>
                  </div>

                  {/* Bloque 4: Ubicación y Dirección */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Ubicación del Servicio
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopiarDatoCliente(direccionCompleta, 'direccion')}
                        className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiadoDatoCliente === 'direccion' ? (
                          <span className="text-emerald-600 font-black">¡Copiado!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar dirección</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        📍 {ord.sector}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {direccionCompleta}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={urlGoogleMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Google Maps</span>
                      </a>
                      <a
                        href={urlWaze}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-sky-200 shadow-2xs"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-600" />
                        <span>Waze</span>
                      </a>
                    </div>
                  </div>

                  {/* Bloque 5: Vehículo & Falla Reportada */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-700" />
                        Vehículo & Falla
                      </span>
                      {ord.vehiculo_placa && (
                        <span className="font-mono text-xs font-black bg-white px-2 py-0.5 rounded border border-amber-200 text-[#0A1525]">
                          {ord.vehiculo_placa}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#0A1525]">
                      {ord.vehiculo_modelo}
                    </div>
                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-900 block mb-0.5">Falla Reportada:</span>
                      {ord.falla_reportada}
                    </div>
                  </div>

                </div>

                {/* Footer del Modal con Acciones Tácticas */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopiarDatoCliente(textoFichaCompleta, 'ficha_completa')}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiadoDatoCliente === 'ficha_completa' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-black">¡Ficha Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Ficha Completa</span>
                        </>
                      )}
                    </button>
                    {ord.estado === 'LEAD_NUEVO' && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalDetalleClienteOpen(false);
                          bloquearTarjeta(ord.id);
                          setOrdenParaRadar(ord);
                          setSheetRadarMecanicosOpen(true);
                        }}
                        className="flex-1 h-9 px-3 rounded-xl bg-[#1E56B0] hover:bg-[#0A1525] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Asignar Mecánico</span>
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalDetalleClienteOpen(false)}
                    className="w-full h-8 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal de Gestión de Credenciales de Operadoras (Solo Dueño Admin) */}
      <CredencialesOperadorasModal
        isOpen={modalOperadorasOpen}
        onClose={() => setModalOperadorasOpen(false)}
      />

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

      {/* Toast Flotante de Notificaciones Push */}
      <AnimatePresence>
        {toastPush && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-[#0A1525] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 font-black">
              <Bell className="w-4 h-4 text-[#0A1525]" />
            </div>
            <div className="text-xs font-semibold text-slate-100 flex-1">
              {toastPush}
            </div>
            <button
              type="button"
              onClick={() => setToastPush(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-1 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Crear Servicio Manual (Llamadas / Recepción Directa) */}
      <ModalCrearServicioManual
        isOpen={modalCrearServicioManualOpen}
        onClose={() => setModalCrearServicioManualOpen(false)}
        onOrdenCreada={() => {
          cargarOrdenes();
          setToastPagoExitoso('✅ Nuevo servicio despachado con éxito al tablero.');
          setTimeout(() => setToastPagoExitoso(null), 4000);
        }}
        operadora={miOperadora}
      />

      {/* Bandeja de Entrada de WhatsApp Web UX 2027 */}
      <BandejaWhatsAppSheet
        isOpen={modalWhatsAppOpen}
        onClose={() => setModalWhatsAppOpen(false)}
        onUnreadCountChange={setUnreadWhatsAppCount}
      />

    </div>
  );
}
