'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { createClient } from '@/lib/supabase/client';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
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
  Tag,
  Copy,
  Lock,
  History,
  FileDown,
  Unlock,
  Calendar,
  Gauge,
  FileCheck,
  ClipboardCheck,
  AlertTriangle,
  Activity,
  Plus,
  Trash2,
  Minus,
  CheckSquare,
  Square
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { activarSuscripcion } from '@/app/actions/suscripcion';

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
  seleccionado?: boolean;
  esPersonalizado?: boolean;
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
    estado_pieza: '100% Nuevo en Caja Sellada',
    seleccionado: true
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
    estado_pieza: 'Insumo Nuevo Grado Automotriz',
    seleccionado: true
  }
];

export const DATOS_BANCARIOS = {
  zelle: {
    correo: 'correo@tutallermovil.com',
    titular: 'TuTallerMóvil C.A.'
  },
  pagoMovil: {
    banco: 'Banco de Venezuela (0102)',
    rif: 'V-1786991',
    telefono: '0414-2314194'
  }
};

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
  runner_id?: string | null;
  kilometraje_actual?: number | null;
  vehiculo_id?: string | null;
  diagnostico_json?: any | null;
  foto_repuesto_viejo_url?: string | null;
  foto_repuesto_nuevo_url?: string | null;
}

// Variantes de animación para cascada fluida (UX 2027)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const }
  }
};

// 25 Puntos de Inspección para el Cliente
const CHECKLIST_25_CLIENTE = [
  {
    categoria: '1. Nivel y Calidad de Fluidos',
    items: [
      { id: 'aceite_motor', nombre: 'Aceite de Motor', okDesc: 'Nivel y viscosidad óptimos' },
      { id: 'liquido_frenos', nombre: 'Líquido de Frenos', okDesc: 'Humedad controlada en reservorio' },
      { id: 'refrigerante', nombre: 'Refrigerante / Coolant', okDesc: 'Hermeticidad y nivel adecuado' },
      { id: 'direccion_hidraulica', nombre: 'Dirección Hidráulica', okDesc: 'Fluido ATF sin fugas' },
      { id: 'limpiaparabrisas', nombre: 'Agua Limpiaparabrisas', okDesc: 'Nivel normal de reserva' },
      { id: 'aceite_transmision', nombre: 'Aceite de Transmisión', okDesc: 'Color y viscosidad de caja' },
      { id: 'fugas_motor', nombre: 'Hermeticidad de Motor', okDesc: 'Empaques secos sin fugas' }
    ]
  },
  {
    categoria: '2. Sistema de Frenos',
    items: [
      { id: 'pastillas_delanteras', nombre: 'Pastillas Delanteras', okDesc: 'Grosor de pasta mayor a 4 mm' },
      { id: 'pastillas_traseras', nombre: 'Pastillas Traseras', okDesc: 'Desgaste simétrico' },
      { id: 'discos_freno', nombre: 'Discos de Freno', okDesc: 'Superficie lisa sin rebaba' },
      { id: 'lineas_mangueras', nombre: 'Líneas y Mangueras', okDesc: 'Sin pérdida de presión' },
      { id: 'freno_mano', nombre: 'Freno de Mano', okDesc: 'Tensión de guaya correcta' },
      { id: 'calipers_mordazas', nombre: 'Calipers / Mordazas', okDesc: 'Pistones libres' }
    ]
  },
  {
    categoria: '3. Suspensión y Tren Delantero',
    items: [
      { id: 'amortiguadores', nombre: 'Amortiguadores', okDesc: 'Sin fugas ni rebote' },
      { id: 'munones_rotulas', nombre: 'Muñones y Rótulas', okDesc: 'Guardapolvos intactos' },
      { id: 'terminales_direccion', nombre: 'Terminales de Dirección', okDesc: 'Alineación firme' },
      { id: 'bujes_mesetas', nombre: 'Bujes de Meseta', okDesc: 'Gomas sin resequedad' },
      { id: 'barra_estabilizadora', nombre: 'Bielas y Barra', okDesc: 'Terminales sin juego' },
      { id: 'rodamientos_rueda', nombre: 'Rodamientos de Rueda', okDesc: 'Giro silencioso y libre' }
    ]
  },
  {
    categoria: '4. Luces y Sistema Eléctrico',
    items: [
      { id: 'luces_principales', nombre: 'Luces Principales', okDesc: 'Altas y bajas alineadas' },
      { id: 'luces_stop', nombre: 'Luces de Stop', okDesc: 'Encendido al frenar' },
      { id: 'bornes_bateria', nombre: 'Bornes de Bateria', okDesc: 'Ajuste firme sin sulfato' },
      { id: 'estado_bateria', nombre: 'Salud de Batería', okDesc: 'Voltaje óptimo de arranque' },
      { id: 'alternador_carga', nombre: 'Carga de Alternador', okDesc: 'Entre 13.8V y 14.4V' },
      { id: 'correa_accesorios', nombre: 'Correa de Accesorios', okDesc: 'Tensión adecuada sin grietas' }
    ]
  }
];

// Datos por defecto si la orden es de prueba o nueva
const DATOS_DEFAULT: OrdenCliente = {
  id: 'TTM-ORD-7892',
  cliente_nombre: 'Cliente TTM',
  vehiculo_marca: 'Vehículo',
  vehiculo_modelo: 'Modelo Vehicular',
  vehiculo_anio: 2020,
  placa: '',
  falla_reportada: 'Inspección técnica vehicular',
  sector: 'Caracas',
  estado: 'COTIZADO',
  ganancia_estimada: 65.0,
  foto_odometro_url: null,
  created_at: '2026-11-17T12:00:00.000Z',
  mecanico_id: null,
  runner_id: null,
  kilometraje_actual: null,
  vehiculo_id: null,
  diagnostico_json: null
};

const MECANICO_INFO = {
  nombre: 'Carlos Mendoza',
  codigo: '#TTM-0842',
  especialidad: 'Especialista Máster en Frenos y Tren Delantero',
  rating: 4.95,
  serviciosCompletados: 124,
  ranking: 'Top 5% Caracas',
  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  telefono: '+58 412 123 4567'
};

const RUNNER_INFO = {
  nombre: 'Marcos Rivas',
  codigo: '#RUN-312',
  rol: 'Runner Logístico TTM Express',
  moto: 'Yamaha DT 175 • Placa: AA4K21X',
  foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  telefono: '+58 414 789 0123'
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
  const [modalChecklistClienteOpen, setModalChecklistClienteOpen] = useState<boolean>(false);
  const [modalPedirServicioOpen, setModalPedirServicioOpen] = useState<boolean>(false);

  // Estados de acciones
  const [guardandoAprobacion, setGuardandoAprobacion] = useState<boolean>(false);
  const [presupuestoRechazado, setPresupuestoRechazado] = useState<boolean>(false);
  const [subiendoComprobante, setSubiendoComprobante] = useState<boolean>(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [confirmandoPago, setConfirmandoPago] = useState<boolean>(false);
  const [pantallaExitoReportado, setPantallaExitoReportado] = useState<boolean>(false);
  const [toastNotificacion, setToastNotificacion] = useState<string | null>(null);
  const [copiadoKey, setCopiadoKey] = useState<string | null>(null);

  // Copiar dato con micro-interacción de check verde y toast
  const copiarDato = (texto: string, key: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiadoKey(key);
      setToastNotificacion(`✓ ${label} copiado`);
      setTimeout(() => setCopiadoKey(null), 2500);
      setTimeout(() => setToastNotificacion(null), 3000);
    }
  };

  // Encuesta de calificación
  const [calificacionEstrellas, setCalificacionEstrellas] = useState<number>(5);
  const [comentarioCalificacion, setComentarioCalificacion] = useState<string>('');
  const [calificacionEnviada, setCalificacionEnviada] = useState<boolean>(false);

  // Perfil del mecánico real asignado
  const [mecanicoData, setMecanicoData] = useState<{
    id: string;
    nombre: string;
    telefono: string;
    especialidad: string;
    rating: number;
    ranking: string;
    foto: string;
    codigo: string;
  } | null>(null);

  const cargarPerfilMecanico = async (mecanicoId: string) => {
    if (!mecanicoId) {
      setMecanicoData(null);
      return;
    }
    try {
      const supabase = createClient();
      const { data: mecProfile } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, telefono, rol, codigo_aliado, avatar_url')
        .eq('id', mecanicoId)
        .maybeSingle();

      if (mecProfile) {
        setMecanicoData({
          id: mecProfile.id,
          nombre: mecProfile.nombre_completo || 'Técnico Especialista TTM',
          telefono: mecProfile.telefono || '+584142314194',
          especialidad: 'Mecánico Certificado TTM',
          rating: 4.9,
          ranking: 'Top #1 TTM',
          foto: mecProfile.avatar_url || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80',
          codigo: mecProfile.codigo_aliado ? mecProfile.codigo_aliado.replace('#', '') : `TTM-${mecProfile.id.slice(0, 4).toUpperCase()}`
        });
      }
    } catch (errMec) {
      console.warn('Error cargando perfil del mecánico:', errMec);
    }
  };

  // Lista detallada de repuestos que se van a instalar en el vehículo
  const [repuestosDetallados, setRepuestosDetallados] = useState<RepuestoDetallado[]>(REPUESTOS_FALLBACK_DEFAULT);

  // Estados para que el Cliente pueda decidir qué quitar y/o poner en su cotización
  const [modalAgregarPieza, setModalAgregarPieza] = useState<boolean>(false);
  const [nuevaPiezaNombre, setNuevaPiezaNombre] = useState<string>('');
  const [nuevaPiezaPrecio, setNuevaPiezaPrecio] = useState<string>('');
  const [nuevaPiezaMarca, setNuevaPiezaMarca] = useState<string>('Repuesto Certificado TTM');

  const toggleSeleccionarRepuesto = (id: string) => {
    setRepuestosDetallados((prev) =>
      prev.map((rep) =>
        rep.id === id ? { ...rep, seleccionado: rep.seleccionado === false ? true : false } : rep
      )
    );
  };

  const handleEliminarRepuestoPersonalizado = (id: string) => {
    setRepuestosDetallados((prev) => prev.filter((r) => r.id !== id));
    setToastNotificacion('✓ Ítem eliminado de la cotización');
    setTimeout(() => setToastNotificacion(null), 3000);
  };

  const handleAgregarRepuestoPersonalizado = (nombreParam?: string, precioParam?: number, marcaParam?: string) => {
    const nombreFinal = (nombreParam || nuevaPiezaNombre).trim();
    const precioFinal = precioParam !== undefined ? precioParam : parseFloat(nuevaPiezaPrecio);

    if (!nombreFinal) {
      setToastNotificacion('⚠ Por favor indica el nombre de la pieza');
      setTimeout(() => setToastNotificacion(null), 3000);
      return;
    }
    if (isNaN(precioFinal) || precioFinal <= 0) {
      setToastNotificacion('⚠ Ingresa un precio válido en USD');
      setTimeout(() => setToastNotificacion(null), 3000);
      return;
    }

    const nuevoItem: RepuestoDetallado = {
      id: `rep-custom-${Date.now()}`,
      nombre: nombreFinal,
      marca: marcaParam || nuevaPiezaMarca || 'Repuesto Certificado TTM',
      referencia: `Ref: TTM-ADIC-${Math.floor(1000 + Math.random() * 9000)}`,
      foto_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80',
      cantidad: 1,
      precio_unitario: precioFinal,
      precio_total: precioFinal,
      compatibilidad: `${orden.vehiculo_marca || ''} ${orden.vehiculo_modelo} • Especificación TTM`,
      garantia: 'Garantía QA 90 días / 5,000 km',
      estado_pieza: '100% Nuevo Sellado',
      seleccionado: true,
      esPersonalizado: true
    };

    setRepuestosDetallados((prev) => [...prev, nuevoItem]);
    setNuevaPiezaNombre('');
    setNuevaPiezaPrecio('');
    setModalAgregarPieza(false);
    setToastNotificacion(`✓ "${nombreFinal}" añadido a tu cotización`);
    setTimeout(() => setToastNotificacion(null), 3500);
  };

  // Estados para Navegación con Pestañas e Historial Médico (El Garaje)
  const [pestanaActiva, setPestanaActiva] = useState<'servicio' | 'historial'>('servicio');
  const [tieneSuscripcion, setTieneSuscripcion] = useState<boolean>(false);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);
  const [listaHistorial, setListaHistorial] = useState<any[]>([]);
  const [activandoSuscripcion, setActivandoSuscripcion] = useState<boolean>(false);
  const [generandoPdfPasaporte, setGenerandoPdfPasaporte] = useState<boolean>(false);

  // Referencia para input de archivo comprobante
  const inputComprobanteRef = useRef<HTMLInputElement>(null);

  // Consulta de Suscripción e Historial Médico del Vehículo
  const cargarHistorialYSuscripcion = async (placaParam?: string | null, vehiculoIdParam?: string | null) => {
    setCargandoHistorial(true);
    try {
      const supabase = createClient();
      const placaActual = (placaParam || orden.placa || '').toUpperCase().trim();
      let vehiculoIdActual = vehiculoIdParam || orden.vehiculo_id || null;

      // Limpiar cache local de servicios temporales
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('ttm_historial_servicios_recientes');
        } catch (e) {}
      }

      // Si no tenemos vehiculoIdActual pero tenemos placa, buscar el vehiculo_id real en la tabla vehiculos
      if (!vehiculoIdActual && placaActual) {
        try {
          const { data: vData } = await supabase
            .from('vehiculos')
            .select('id')
            .eq('placa', placaActual)
            .maybeSingle();
          if (vData?.id) {
            vehiculoIdActual = vData.id;
          }
        } catch (eVeh) {
          console.warn('Error resolviendo vehiculo por placa:', eVeh);
        }
      }

      // Si el cliente no tiene vehículo registrado o es un servicio nuevo sin historial
      if (!vehiculoIdActual && !placaActual) {
        setListaHistorial([]);
        setTieneSuscripcion(false);
        return;
      }

      // 1. Consultar estado de suscripción en Supabase / LocalStorage
      let subActiva = false;
      if (typeof window !== 'undefined' && placaActual) {
        const localSub = localStorage.getItem(`ttm_sub_${placaActual}`);
        if (localSub === 'activa') subActiva = true;
      }

      if (vehiculoIdActual) {
        try {
          const { data: subData } = await supabase
            .from('suscripciones')
            .select('*')
            .eq('vehiculo_id', vehiculoIdActual)
            .eq('activa', true)
            .maybeSingle();

          if (subData) {
            subActiva = true;
          }
        } catch (errSub) {
          console.warn('Verificación remota de suscripción omitida:', errSub);
        }
      }
      setTieneSuscripcion(subActiva);

      // 2. Consultar historial_servicios estrictamente para ESTE vehículo (filtrado real sin datos mock)
      let servicios: any[] = [];
      if (vehiculoIdActual) {
        try {
          const { data: srvData } = await supabase
            .from('historial_servicios')
            .select('*')
            .eq('vehiculo_id', vehiculoIdActual)
            .order('fecha', { ascending: false });

          if (srvData && srvData.length > 0) {
            servicios = srvData.map((s) => ({
              ...s,
              costo: Number(s.costo_usd ?? s.costo ?? 0),
              foto_repuesto_nuevo_url: s.foto_evidencia || s.foto_repuesto_nuevo_url || s.foto_url,
              detalles: s.checklist_json?.detalles || s.detalles || ''
            }));
          }
        } catch (errSrv) {
          console.warn('Verificación remota de historial omitida:', errSrv);
        }
      }

      setListaHistorial(servicios);
    } catch (err) {
      console.error('Error cargando historial y suscripción:', err);
      setListaHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Activar Suscripción del Pasaporte Técnico ($5/año)
  const handleActivarSuscripcion = async () => {
    setActivandoSuscripcion(true);
    try {
      const placaActual = (orden.placa || 'AB123CD').toUpperCase().trim();
      const vehiculoIdActual = orden.vehiculo_id || orden.id;

      await activarSuscripcion({ vehiculoId: vehiculoIdActual, placa: placaActual });

      if (typeof window !== 'undefined') {
        localStorage.setItem(`ttm_sub_${placaActual}`, 'activa');
      }

      setTieneSuscripcion(true);

      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 }
      });

      setToastNotificacion('🎉 ¡Pasaporte Técnico activado con éxito! Historial desbloqueado');
      setTimeout(() => setToastNotificacion(null), 4000);
    } catch (err: any) {
      console.warn('Activación con fallback local:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ttm_sub_${(orden.placa || 'AB123CD').toUpperCase().trim()}`, 'activa');
      }
      setTieneSuscripcion(true);
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 }
      });
      setToastNotificacion('🎉 ¡Pasaporte Técnico activado con éxito!');
      setTimeout(() => setToastNotificacion(null), 4000);
    } finally {
      setActivandoSuscripcion(false);
    }
  };

  // Descarga del Pasaporte Técnico en PDF con jsPDF + autoTable
  const handleDescargarPasaportePdf = () => {
    setGenerandoPdfPasaporte(true);
    try {
      const doc = new jsPDF();
      const placaActual = (orden.placa || 'AB123CD').toUpperCase().trim();
      const vehiculoNombre = `${orden.vehiculo_marca || ''} ${orden.vehiculo_modelo}`.trim();

      const azulCobalto = [30, 86, 176];
      const grisOscuro = [10, 21, 37];
      const verdeLima = [204, 255, 0];

      // Encabezado Corporativo
      doc.setFillColor(grisOscuro[0], grisOscuro[1], grisOscuro[2]);
      doc.rect(0, 0, 210, 42, 'F');

      // Franja Verde Lima
      doc.setFillColor(verdeLima[0], verdeLima[1], verdeLima[2]);
      doc.rect(0, 42, 210, 3, 'F');

      // Título
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('TuTallerMovil', 14, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(204, 255, 0);
      doc.text('PASAPORTE TÉCNICO VEHICULAR CERTIFICADO', 14, 28);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('HISTORIAL CLOUD & AUDITORÍA DE MANTENIMIENTO', 14, 34);

      // Metadatos
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('FOLIO PASAPORTE:', 135, 18);
      doc.setFont('helvetica', 'normal');
      doc.text(`TTM-PAS-${placaActual}`, 135, 24);

      doc.setFont('helvetica', 'bold');
      doc.text('FECHA DE EMISIÓN:', 135, 32);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' }), 135, 38);

      // Caja de Información del Vehículo
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 52, 182, 32, 3, 3, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 52, 182, 32, 3, 3, 'S');

      doc.setTextColor(grisOscuro[0], grisOscuro[1], grisOscuro[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('FICHA TÉCNICA CERTIFICADA', 18, 60);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Vehículo: ${vehiculoNombre}`, 18, 68);
      doc.text(`Placa / Matrícula: ${placaActual}`, 18, 76);

      doc.text(`Propietario: ${orden.cliente_nombre || 'Cliente Certificado'}`, 110, 68);
      doc.text(`Estado Pasaporte: ACTIVO Y GARANTIZADO (365 Días)`, 110, 76);

      // Tabla de Servicios con autoTable
      const filasTabla = listaHistorial.map((srv) => [
        srv.fecha || 'N/A',
        srv.kilometraje ? `${Number(srv.kilometraje).toLocaleString('es-VE')} KM` : 'N/A',
        srv.tipo_servicio || 'Mantenimiento General',
        srv.detalles || 'Inspección técnica aprobada',
        `$${Number(srv.costo || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 92,
        head: [['Fecha', 'Odómetro', 'Servicio Realizado', 'Detalles / Certificación', 'Costo USD']],
        body: filasTabla,
        theme: 'grid',
        headStyles: {
          fillColor: [10, 21, 37],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [10, 21, 37],
          cellPadding: 3.5
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 26 },
          2: { cellWidth: 50 },
          3: { cellWidth: 62 },
          4: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
        }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 180;

      // Sello de Garantía y Certificación
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, finalY + 10, 182, 30, 3, 3, 'F');
      doc.setDrawColor(30, 86, 176);
      doc.roundedRect(14, finalY + 10, 182, 30, 3, 3, 'S');

      doc.setTextColor(azulCobalto[0], azulCobalto[1], azulCobalto[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('CERTIFICACIÓN OFICIAL ANTI-FRAUDE & VALIDEZ LEGAL', 18, finalY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        'Este pasaporte técnico valida el kilometraje fidedigno y los repuestos legítimos instalados por mecánicos avalados de TuTallerMóvil.',
        18,
        finalY + 25
      );
      doc.text(
        'Válido para auditorías de reventa vehicular, pólizas de seguros, tasaciones y transferencias de dominio en Venezuela.',
        18,
        finalY + 31
      );

      // Pie de Página
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'TuTallerMóvil C.A. • RIF J-50123456-7 • www.tutallermovil.com • Línea Directa: +58 414-2314194',
        14,
        285
      );

      doc.save(`Pasaporte_Tecnico_${placaActual}.pdf`);
      setToastNotificacion('✓ Pasaporte Técnico PDF descargado');
      setTimeout(() => setToastNotificacion(null), 3000);
    } catch (errPdf) {
      console.error('Error generando PDF:', errPdf);
      setToastNotificacion('⚠️ Error al generar PDF');
      setTimeout(() => setToastNotificacion(null), 3000);
    } finally {
      setGenerandoPdfPasaporte(false);
    }
  };

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
            placa: data.vehiculo_placa || data.placa || '',
            falla_reportada: data.falla_reportada || 'Servicio de mantenimiento automotriz',
            sector: data.sector || 'Caracas',
            estado: data.estado || 'COTIZADO',
            ganancia_estimada: data.ganancia_estimada || 65.0,
            foto_odometro_url: data.foto_odometro_url || null,
            created_at: data.created_at || '2026-11-17T12:00:00.000Z',
            mecanico_id: data.mecanico_id || null,
            runner_id: data.runner_id || null,
            kilometraje_actual: data.kilometraje_actual || data.kilometraje || null,
            vehiculo_id: data.vehiculo_id || null,
            diagnostico_json: data.diagnostico_json || null
          });

          if (data.mecanico_id) {
            cargarPerfilMecanico(data.mecanico_id);
          } else {
            setMecanicoData(null);
          }

          cargarHistorialYSuscripcion(data.vehiculo_placa || data.placa, data.vehiculo_id || null);

          // Consultar repuestos asociados a la orden en diagnostico_json o en orden_repuestos
          if (data.diagnostico_json?.repuestos_aprobados && Array.isArray(data.diagnostico_json.repuestos_aprobados) && data.diagnostico_json.repuestos_aprobados.length > 0) {
            const aprobados = data.diagnostico_json.repuestos_aprobados.map((r: any) => ({ ...r, seleccionado: true }));
            const descartados = Array.isArray(data.diagnostico_json.repuestos_descartados)
              ? data.diagnostico_json.repuestos_descartados.map((r: any) => ({ ...r, seleccionado: false }))
              : [];
            setRepuestosDetallados([...aprobados, ...descartados]);
          } else {
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
                  estado_pieza: '100% Nuevo en Caja Sellada',
                  seleccionado: true
                }));
                setRepuestosDetallados(formateados);
              }
            } catch (errRep) {
              console.warn('Usando catálogo descriptivo de repuestos para demostración:', errRep);
            }
          }
        }
      } catch (err) {
        console.warn('Cargando orden con valores por defecto para demostración:', err);
        cargarHistorialYSuscripcion('', null);
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
            const nuevo = payload.new as any;
            setOrden((prev) => ({
              ...prev,
              ...nuevo
            }));
            if (nuevo.mecanico_id) {
              cargarPerfilMecanico(nuevo.mecanico_id);
            } else if (nuevo.mecanico_id === null) {
              setMecanicoData(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Cálculos de Cotización y Repuestos (Reactivos a la personalización del cliente)
  const repuestosActivos = useMemo(() => {
    return repuestosDetallados.filter((r) => r.seleccionado !== false);
  }, [repuestosDetallados]);

  const repuestosTotal = useMemo(() => {
    return repuestosActivos.reduce((acc, curr) => acc + curr.precio_total, 0);
  }, [repuestosActivos]);

  // Mano de Obra: Base de $25 por primera pieza + $5 por cada repuesto adicional
  const manoDeObra = useMemo(() => {
    if (repuestosActivos.length === 0) return 20.0;
    return 25.0 + (repuestosActivos.length - 1) * 5.0;
  }, [repuestosActivos]);

  const totalCotizado = useMemo(() => {
    return Math.round((repuestosTotal + manoDeObra) * 100) / 100;
  }, [repuestosTotal, manoDeObra]);

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
          subtitulo: `${mecanicoActivo?.nombre || 'El especialista'} está en sitio realizando la inspección técnica de 25 puntos y captura del odómetro.`,
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
      case 'PAGO_REPORTADO':
        return {
          etapaIndex: 4,
          titulo: 'Comprobante en Verificación',
          subtitulo: 'Hemos recibido tu comprobante de pago. La operadora de despacho lo está validando para liberar tu garantía.',
          icono: Clock,
          iconoAnimacion: {
            scale: [1, 1.08, 1],
            transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
          } as TargetAndTransition,
          colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
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

  // Lista de fotos de evidencias combinadas (odómetro real + fotos técnicas + piezas viejo/nuevo)
  const listaEvidencias = useMemo(() => {
    const list: { titulo: string; tipo: string; url: string }[] = [];
    if (orden.foto_odometro_url) {
      list.push({
        titulo: 'Odómetro Real (Subido en Sitio)',
        tipo: 'Inspección Inicial TTM',
        url: orden.foto_odometro_url
      });
    }

    if (orden.diagnostico_json?.evidencias_piezas && Array.isArray(orden.diagnostico_json.evidencias_piezas)) {
      orden.diagnostico_json.evidencias_piezas.forEach((p: any) => {
        if (p.fotoViejo) {
          list.push({
            titulo: `Pieza Desmontada: ${p.nombre}`,
            tipo: 'Evidencia: Repuesto Usado',
            url: p.fotoViejo
          });
        }
        if (p.fotoNuevo) {
          list.push({
            titulo: `Pieza Instalada: ${p.nombre}`,
            tipo: 'Evidencia: Repuesto Nuevo',
            url: p.fotoNuevo
          });
        }
      });
    } else {
      if (orden.foto_repuesto_viejo_url) {
        list.push({
          titulo: 'Repuesto Usado Desmontado',
          tipo: 'Evidencia Técnica',
          url: orden.foto_repuesto_viejo_url
        });
      }
      if (orden.foto_repuesto_nuevo_url) {
        list.push({
          titulo: 'Repuesto Nuevo Instalado',
          tipo: 'Evidencia Técnica',
          url: orden.foto_repuesto_nuevo_url
        });
      }
    }

    if (list.length === 0) {
      if (!orden.mecanico_id) return [];
      return [...FOTOS_EVIDENCIAS_DEMO];
    }
    return list;
  }, [orden.foto_odometro_url, orden.foto_repuesto_viejo_url, orden.foto_repuesto_nuevo_url, orden.diagnostico_json, orden.mecanico_id]);

  // Pasos del Progreso Operativo: Confirmado -> Asignando -> En Ruta -> Reparando -> Listo
  const pasosProgreso = useMemo(() => [
    { id: 0, label: 'Confirmado', icon: CheckCircle2 },
    { id: 1, label: 'Asignando', icon: Clock },
    { id: 2, label: 'En Ruta', icon: Navigation },
    { id: 3, label: 'Reparando', icon: Wrench },
    { id: 4, label: 'Listo', icon: ShieldCheck }
  ], []);

  // Paso Activo para el Stepper: Si no hay especialista asignado, está en 'Asignando'
  const pasoActivo = useMemo(() => {
    if (!orden.mecanico_id) {
      if (orden.estado === 'PENDIENTE' && !orden.id) return 0;
      return 1; // Asignando especialista
    }

    switch (orden.estado) {
      case 'LEAD_NUEVO':
      case 'PENDIENTE':
      case 'SOLICITADO':
        return 1; // Asignando
      case 'ASIGNADO':
      case 'EN_RUTA_TALLER':
      case 'DIAGNOSTICO_AGENDADO':
        return 2; // En Ruta
      case 'EN_INSPECCION':
      case 'COTIZADO':
      case 'ESPERANDO_APROBACION':
      case 'REPUESTOS_EN_RUTA':
      case 'EN_EJECUCION':
      case 'EN_REPARACION':
        return 3; // Reparando
      case 'TRABAJO_TERMINADO':
      case 'PENDIENTE_PAGO':
      case 'PAGO_REPORTADO':
      case 'PAGADO':
      case 'FINALIZADO':
        return 4; // Listo
      default:
        return orden.mecanico_id ? 2 : 1;
    }
  }, [orden.estado, orden.mecanico_id, orden.id]);

  // Renderizado condicional del personal activo
  const tieneMecanico = useMemo(() => {
    return Boolean(orden.mecanico_id);
  }, [orden.mecanico_id]);

  const mecanicoActivo = useMemo(() => {
    if (!tieneMecanico) return null;
    return (
      mecanicoData || {
        ...MECANICO_INFO,
        codigo: orden.mecanico_id ? `TTM-${orden.mecanico_id.slice(0, 4).toUpperCase()}` : 'TTM-0842'
      }
    );
  }, [tieneMecanico, mecanicoData, orden.mecanico_id]);

  const tieneRunner = useMemo(() => {
    return Boolean(
      orden.runner_id ||
      orden.estado === 'REPUESTOS_EN_RUTA'
    );
  }, [orden.runner_id, orden.estado]);

  // Lógica de Aprobación de Cotización (UPDATE a ordenes con estado: APROBADO)
  const handleAprobarPresupuesto = async () => {
    setGuardandoAprobacion(true);
    try {
      const supabase = createClient();
      const repuestosAprobados = repuestosDetallados.filter((r) => r.seleccionado !== false);
      const repuestosDescartados = repuestosDetallados.filter((r) => r.seleccionado === false);

      await supabase
        .from('ordenes')
        .update({
          estado: 'APROBADO',
          ganancia_estimada: totalCotizado,
          diagnostico_json: {
            ...(orden.diagnostico_json || {}),
            repuestos_aprobados: repuestosAprobados,
            repuestos_descartados: repuestosDescartados,
            total_aprobado: totalCotizado,
            mano_obra_aprobada: manoDeObra
          }
        })
        .eq('id', id);

      setOrden((prev) => ({
        ...prev,
        estado: 'APROBADO',
        ganancia_estimada: totalCotizado,
        diagnostico_json: {
          ...(prev.diagnostico_json || {}),
          repuestos_aprobados: repuestosAprobados,
          repuestos_descartados: repuestosDescartados,
          total_aprobado: totalCotizado,
          mano_obra_aprobada: manoDeObra
        }
      }));
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

  const handleRechazarPresupuesto = async () => {
    setPresupuestoRechazado(true);
    setModalAprobarPresupuesto(false);

    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          estado: 'COTIZACION_RECHAZADA',
          falla_reportada: `${orden.falla_reportada || 'Servicio'} [CLIENTE RECHAZÓ COTIZACIÓN - Cobrar solo diagnóstico $15]`
        })
        .eq('id', id);

      setOrden((prev) => ({
        ...prev,
        estado: 'COTIZACION_RECHAZADA',
        falla_reportada: `${prev.falla_reportada || 'Servicio'} [CLIENTE RECHAZÓ COTIZACIÓN - Cobrar solo diagnóstico $15]`
      }));
    } catch (err) {
      console.error('Error notificando rechazo a Supabase:', err);
    }
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

  // Confirmar Pago y Notificar a la Operadora (Pasa a PAGO_REPORTADO y muestra pantalla de éxito)
  const handleConfirmarPago = async () => {
    if (!comprobanteUrl) {
      alert('Por favor sube primero el comprobante de pago.');
      return;
    }

    setConfirmandoPago(true);
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          estado: 'PAGO_REPORTADO'
        })
        .eq('id', id);

      setOrden((prev) => ({ ...prev, estado: 'PAGO_REPORTADO' }));
      setModalPagoOpen(false);
      setPantallaExitoReportado(true);

      // Lanzar Confeti Festivo con partículas verdes
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#16A34A', '#CCFF00', '#1E56B0', '#10B981', '#0A1525']
        });
      } catch (e) {
        console.warn('Confetti trigger:', e);
      }
    } catch (err) {
      console.error('Error al reportar pago en Supabase:', err);
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

          {/* Botón de Asistencia Telefónica con la Operadora */}
          <a
            href="tel:04142314194"
            className="h-9 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0A1525] border border-slate-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Llamar a la operadora de despacho"
          >
            <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
            <span>Operadora</span>
          </a>

        </div>
      </header>

      {/* ======================================================== */}
      {/* SELECTOR DE PESTAÑAS: SERVICIO ACTUAL vs HISTORIAL MÉDICO */}
      {/* ======================================================== */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-2 sticky top-[68px] z-30 bg-white/90 backdrop-blur-md">
        <Tabs
          value={pestanaActiva}
          onValueChange={(val) => {
            const nuevaPestana = val as 'servicio' | 'historial';
            setPestanaActiva(nuevaPestana);
            if (nuevaPestana === 'historial') {
              cargarHistorialYSuscripcion(orden.placa, orden.vehiculo_id);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner h-12">
            <TabsTrigger
              value="servicio"
              className="rounded-xl font-black text-xs py-2 data-[state=active]:bg-[#0A1525] data-[state=active]:text-[#CCFF00] data-[state=active]:shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Servicio Actual</span>
            </TabsTrigger>
            <TabsTrigger
              value="historial"
              className="rounded-xl font-black text-xs py-2 data-[state=active]:bg-[#0A1525] data-[state=active]:text-[#CCFF00] data-[state=active]:shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial Médico</span>
              {tieneSuscripcion && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        {pestanaActiva === 'servicio' ? (
          <motion.div
            key="pestana-servicio"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto px-4 py-3 space-y-4"
          >
            {/* ======================================================== */}
            {/* 1. HERO BANNER: Foto del Vehículo con Gradiente Oscuro,  */}
            {/*    Placa Venezolana y Modelo en Texto Blanco Grande      */}
            {/* ======================================================== */}
            <motion.div variants={itemVariants}>
              <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80"
                  alt={orden.vehiculo_modelo}
                  className="w-full h-full object-cover"
                />

                {/* Gradiente Oscuro en la parte inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1525] via-[#0A1525]/60 to-transparent" />

                {/* Badge de Estado Superior */}
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0A1525]/85 backdrop-blur-md text-[#CCFF00] border border-white/10 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                    <span>{orden.estado.replace(/_/g, ' ')}</span>
                  </span>
                </div>

                {/* Cronómetro Flotante Superior Derecho si el servicio está en curso */}
                {orden.estado !== 'FINALIZADO' && orden.estado !== 'PAGADO' && (
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[#0A1525] text-[10px] font-mono font-black flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3 h-3 text-[#1E56B0] animate-spin" style={{ animationDuration: '8s' }} />
                      <span>{minutosLlegada}:{segundosLlegada < 10 ? `0${segundosLlegada}` : segundosLlegada} min</span>
                    </div>
                  </div>
                )}

                {/* Información Superpuesta: Placa Venezolana + Modelo del Vehículo en Blanco Grande */}
                <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                  {/* Placa Estilo Venezolano */}
                  <div className="inline-block bg-white border-2 border-[#0A1525] rounded-xl px-3 py-1 shadow-md">
                    <span className="text-[7.5px] font-black text-slate-400 block tracking-widest leading-none">
                      VENEZUELA
                    </span>
                    <span className="font-mono text-base font-black text-[#0A1525] tracking-wider leading-tight">
                      {orden.placa || 'AB123CD'}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                      {orden.vehiculo_marca ? `${orden.vehiculo_marca} ` : ''}{orden.vehiculo_modelo}
                    </h1>
                    <p className="text-xs text-slate-300 font-semibold drop-shadow-xs mt-0.5">
                      {configuracionEstado.titulo}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ======================================================== */}
            {/* 2. SÍNTOMAS Y VEHÍCULO (BENTO CARDS VERTICALES FULL-WIDTH) */}
            {/* ======================================================== */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 gap-3.5">
                {/* Tarjeta 1: Síntomas Reportados */}
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
                      <Wrench className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Diagnóstico Inicial
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-[#0A1525]">
                        Síntomas Reportados
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#0A1525] leading-relaxed bg-white p-3 rounded-2xl border border-slate-200/70">
                    "{orden.falla_reportada}"
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-extrabold pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Garantía QA TuTallerMóvil 90 días</span>
                  </div>
                </div>

                {/* Tarjeta 2: Detalles del Vehículo */}
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-[#1E56B0] flex items-center justify-center shrink-0 border border-blue-200/50">
                      <Car className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Ficha Automotriz
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-[#0A1525]">
                        Detalles
                      </h3>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Marca:</span>
                      <span className="font-bold text-[#0A1525]">{orden.vehiculo_marca || 'Toyota'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Año:</span>
                      <span className="font-bold text-[#0A1525]">{orden.vehiculo_anio || '2018'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kilometraje:</span>
                      </span>
                      <span className="font-mono font-black text-[#1E56B0]">
                        {orden.kilometraje_actual
                          ? `${Number(orden.kilometraje_actual).toLocaleString('es-VE')} KM`
                          : orden.foto_odometro_url
                          ? '85.400 KM'
                          : 'En verificación'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                    <span>Sector: {orden.sector || 'Caracas'}</span>
                    <span className="text-[#1E56B0] font-bold font-mono">#{orden.id.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Tarjeta 3: Estado del Vehículo (Bento Box - Diagnóstico 25 Puntos) */}
                {(() => {
                  const tieneChecklistReal = Boolean(
                    orden.diagnostico_json &&
                    typeof orden.diagnostico_json === 'object' &&
                    (orden.diagnostico_json.items || orden.diagnostico_json.puntos_ok !== undefined)
                  );

                  return (
                    <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/50">
                            <ClipboardCheck className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Checklist 25 Puntos
                            </span>
                            <h3 className="text-xs sm:text-sm font-black text-[#0A1525]">
                              Estado del Vehículo
                            </h3>
                          </div>
                        </div>
                        {tieneChecklistReal && (
                          <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            {orden.diagnostico_json.puntos_ok ?? 25}/25 OK
                          </span>
                        )}
                      </div>

                      {tieneChecklistReal ? (
                        <div className="space-y-2">
                          {/* Grid de 4 Sistemas Clave */}
                          <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                            {/* 1. Aceite y Motor */}
                            <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  orden.diagnostico_json.aceite === 'ok' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400 block leading-tight">Aceite Motor</span>
                                <span
                                  className={`text-[11px] font-extrabold truncate block ${
                                    orden.diagnostico_json.aceite === 'ok' ? 'text-slate-800' : 'text-rose-600'
                                  }`}
                                >
                                  {orden.diagnostico_json.aceite === 'ok' ? 'Nivel OK' : 'Requiere Cambio'}
                                </span>
                              </div>
                            </div>

                            {/* 2. Frenos */}
                            <div
                              className={`p-2 rounded-xl border flex items-center gap-2 ${
                                orden.diagnostico_json.frenos === 'requiere_cambio'
                                  ? 'bg-rose-50/70 border-rose-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  orden.diagnostico_json.frenos === 'requiere_cambio'
                                    ? 'bg-rose-500 animate-pulse'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400 block leading-tight">Frenos</span>
                                <span
                                  className={`text-[11px] font-black truncate block ${
                                    orden.diagnostico_json.frenos === 'requiere_cambio'
                                      ? 'text-rose-700'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {orden.diagnostico_json.frenos === 'requiere_cambio'
                                    ? 'Requiere Cambio'
                                    : 'Sistema OK'}
                                </span>
                              </div>
                            </div>

                            {/* 3. Suspensión */}
                            <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  orden.diagnostico_json.suspension === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400 block leading-tight">Suspensión</span>
                                <span className="text-[11px] font-extrabold text-slate-800 truncate block">
                                  {orden.diagnostico_json.suspension === 'ok' ? 'Tren OK' : 'Atención'}
                                </span>
                              </div>
                            </div>

                            {/* 4. Sistema Eléctrico */}
                            <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400 block leading-tight">Eléctrico</span>
                                <span className="text-[11px] font-extrabold text-slate-800 truncate block">
                                  Batería & Faros OK
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mensaje de Transparencia y Justificación de Repuestos */}
                          {orden.diagnostico_json.frenos === 'requiere_cambio' && (
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight font-medium flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>Inspección certificada:</strong> El desgaste detectado en frenos respalda los repuestos de tu presupuesto.
                              </span>
                            </div>
                          )}

                          {/* Botón para ver los 25 puntos */}
                          <button
                            type="button"
                            onClick={() => setModalChecklistClienteOpen(true)}
                            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#1E56B0] text-[11px] font-black border border-slate-200 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-98"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#1E56B0]" />
                            <span>Ver los 25 Puntos Evaluados</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-3 my-auto">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <ClipboardCheck className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[#0A1525]">Sin Inspección Realizada</p>
                            <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                              Aún no se ha realizado la evaluación técnica de 25 puntos a este vehículo.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setModalPedirServicioOpen(true)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                          >
                            <Wrench className="w-3.5 h-3.5 text-[#0A1525]" />
                            <span>Pedir Inspección Técnica</span>
                          </button>
                        </div>
                      )}

                      {tieneChecklistReal && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                          <span>Protocolo TTM 2027</span>
                          <span className="text-emerald-700 font-bold">100% Certificado</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>

            {/* ======================================================== */}
            {/* 3. PROGRESO OPERATIVO (EL STEPPER: Confirmado -> En Ruta  */}
            {/*    -> Reparando -> Listo con Animación Fluida)           */}
            {/* ======================================================== */}
            <motion.div variants={itemVariants}>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Progreso Operativo
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1E56B0]">
                    Paso {pasoActivo + 1} de {pasosProgreso.length}
                  </span>
                </div>

                <div className="relative flex items-center justify-between px-1 sm:px-2">
                  {/* Barra de Fondo */}
                  <div className="absolute left-5 right-5 sm:left-6 sm:right-6 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0" />

                  {/* Barra de Progreso Dinámica con Animación Fluida */}
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${(pasoActivo / (pasosProgreso.length - 1)) * 100}%`
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#1E56B0] via-[#3B82F6] to-[#CCFF00] rounded-full z-0 shadow-xs"
                    style={{ maxWidth: 'calc(100% - 40px)' }}
                  />

                  {/* 5 Pasos: Confirmado -> Asignando -> En Ruta -> Reparando -> Listo */}
                  {pasosProgreso.map((paso) => {
                    const isPassed = pasoActivo > paso.id;
                    const isActive = pasoActivo === paso.id;
                    const IconComponent = paso.icon;

                    return (
                      <div key={paso.id} className="relative z-10 flex flex-col items-center gap-1.5 min-w-0">
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
                            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A1525] stroke-[2.5]" />
                          ) : isPassed ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          ) : (
                            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                          )}
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-extrabold tracking-tight text-center leading-tight truncate max-w-[58px] sm:max-w-none ${
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
            </motion.div>

            {/* ======================================================== */}
            {/* 4. TARJETAS DEL PERSONAL ACTIVO (Renderizado Condicional) */}
            {/* ======================================================== */}
            <motion.div variants={itemVariants} className="space-y-3.5">
              {/* Tarjeta Mecánico: Fondo Oscuro (#0A1525), Rating y Botón Verde Lima Verificar Carnet */}
              {tieneMecanico && (
                <div className="bg-[#0A1525] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-[#1E56B0]/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={mecanicoActivo?.foto || MECANICO_INFO.foto}
                          alt={mecanicoActivo?.nombre || MECANICO_INFO.nombre}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#CCFF00] shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center font-black shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                            {mecanicoActivo?.nombre || MECANICO_INFO.nombre}
                          </h3>
                          <BadgeCheck className="w-4 h-4 text-[#CCFF00]" />
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {mecanicoActivo?.especialidad || MECANICO_INFO.especialidad}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 text-xs">
                          <span className="flex items-center gap-1 text-amber-300 font-black">
                            <Star className="w-3 h-3 fill-amber-300" />
                            {mecanicoActivo?.rating || MECANICO_INFO.rating}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[11px] text-[#CCFF00] font-bold">
                            {mecanicoActivo?.ranking || MECANICO_INFO.ranking}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón Llamar Directo */}
                    <a
                      href={`tel:${mecanicoActivo?.telefono || MECANICO_INFO.telefono}`}
                      className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-[#CCFF00] hover:text-[#0A1525] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Llamar al Mecánico"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Acciones del Mecánico: Carnet QR Oficial */}
                  <div className="space-y-2 relative z-10">
                    {/* Botón Gigante en Verde Lima: Verificar Carnet QR */}
                    <button
                      type="button"
                      onClick={() => setModalCarnetOpen(true)}
                      className="w-full h-11 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/20 transition-all cursor-pointer active:scale-95 border border-[#0A1525]/10"
                    >
                      <QrCode className="w-4 h-4 text-[#0A1525] stroke-[2.5]" />
                      <span>Verificar Carnet QR Oficial</span>
                      <ShieldCheck className="w-4 h-4 text-[#0A1525]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tarjeta Runner: Fondo blanco, borde azul cobalto, moto y badge 'En camino con tus repuestos' */}
              {tieneRunner && (
                <div className="bg-white border-2 border-[#1E56B0] rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={RUNNER_INFO.foto}
                          alt={RUNNER_INFO.nombre}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#1E56B0] shadow-xs"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1E56B0] text-white flex items-center justify-center font-black">
                          <Bike className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-[#0A1525] tracking-tight">
                            {RUNNER_INFO.nombre}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {RUNNER_INFO.codigo}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#1E56B0] flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5" />
                          <span>{RUNNER_INFO.moto}</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${RUNNER_INFO.telefono}`}
                      className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                      title="Llamar al Runner"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Llamar</span>
                    </a>
                  </div>

                  {/* Badge Azul: En camino con tus repuestos */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#1E56B0] font-black">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1E56B0]"></span>
                      </span>
                      <span>En camino con tus repuestos</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                      Despacho Express
                    </span>
                  </div>
                </div>
              )}

              {/* Estado Vacío Elegante si no hay mecánico ni runner asignados */}
              {!tieneMecanico && !tieneRunner && (
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-3xl p-6 text-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-sm text-[#1E56B0]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                      <Wrench className="w-6 h-6 stroke-[2.2]" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0A1525]">
                      Asignando especialista...
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs mx-auto">
                      Nuestra central de despacho está localizando al técnico certificado más cercano con disponibilidad inmediata.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* ======================================================== */}
            {/* 5. TARJETA FLOTANTE: Aprobación de Cotización            */}
            {/* (Visible destacada en estado COTIZADO)                   */}
            {/* ======================================================== */}
            {(orden.estado === 'COTIZADO' || orden.estado === 'ESPERANDO_APROBACION') && !presupuestoRechazado && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-3xl p-5 border-2 border-[#1E56B0] shadow-xl space-y-4 relative overflow-hidden">
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

            {/* Desglose Financiero con Detalle de Repuestos y Personalización */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 space-y-3.5 text-xs">
              
              {/* 1. Detalle de Cada Repuesto a Instalar */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                  <div>
                    <span className="font-extrabold text-[#0A1525] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Repuestos a Instalar ({repuestosActivos.length} de {repuestosDetallados.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      Puedes marcar/desmarcar repuestos o añadir piezas adicionales
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setModalAgregarPieza(true)}
                      className="h-7 px-2.5 rounded-lg bg-[#0A1525] hover:bg-slate-800 text-[#CCFF00] font-black text-[10px] flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+ Añadir pieza / servicio</span>
                    </button>
                    <span className="font-mono font-black text-[#1E56B0] text-xs">
                      ${repuestosTotal.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Banner informativo si el cliente excluyó piezas */}
                {repuestosDetallados.length > repuestosActivos.length && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Has excluido {repuestosDetallados.length - repuestosActivos.length} pieza(s). No se cobrarán ni instalarán.</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  {repuestosDetallados.map((rep) => {
                    const estaIncluido = rep.seleccionado !== false;
                    return (
                      <div
                        key={rep.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          estaIncluido
                            ? 'bg-white border-slate-200 shadow-2xs hover:border-[#1E56B0]'
                            : 'bg-slate-100/70 border-dashed border-slate-300 opacity-75'
                        } space-y-2`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={rep.foto_url}
                            alt={rep.nombre}
                            className={`w-14 h-14 rounded-xl object-cover border shrink-0 ${
                              estaIncluido ? 'border-slate-200 shadow-2xs' : 'border-slate-300 grayscale'
                            }`}
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <h4 className={`font-black text-xs leading-snug ${
                                  estaIncluido ? 'text-[#0A1525]' : 'line-through text-slate-400'
                                }`}>
                                  {rep.nombre}
                                </h4>
                                {rep.esPersonalizado && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                    Añadido por ti
                                  </span>
                                )}
                              </div>
                              <span className={`font-mono font-black text-xs shrink-0 ${
                                estaIncluido ? 'text-[#0A1525]' : 'line-through text-slate-400'
                              }`}>
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

                        {/* Botones de Acción para Quitar o Volver a Incluir */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSeleccionarRepuesto(rep.id)}
                              className={`flex items-center gap-1 font-black px-2 py-1 rounded-lg transition-all cursor-pointer ${
                                estaIncluido
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-rose-50 hover:text-rose-700'
                                  : 'bg-blue-50 text-[#1E56B0] hover:bg-blue-100'
                              }`}
                            >
                              {estaIncluido ? (
                                <>
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>✓ Incluido (Toca para quitar)</span>
                                </>
                              ) : (
                                <>
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                  <span>+ Volver a incluir</span>
                                </>
                              )}
                            </button>

                            {rep.esPersonalizado && (
                              <button
                                type="button"
                                onClick={() => handleEliminarRepuestoPersonalizado(rep.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors"
                                title="Eliminar ítem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <span className="font-semibold text-slate-500">
                            Cant: <strong className="text-[#0A1525]">{rep.cantidad}</strong> (${rep.precio_unitario.toFixed(2)} c/u)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Mano de Obra Certificada */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between items-start py-1">
                  <div className="space-y-0.5">
                    <span className="text-slate-700 font-bold block text-xs">Mano de Obra Certificada</span>
                    <span className="text-[10px] text-slate-400 block">
                      Instalación profesional en sitio, torque según manual y prueba técnica
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
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 6. PANEL DE PAGO PREMIUM (Glassmorphism & Ultra-Seguro)   */}
      {/* ======================================================== */}
      {(orden.estado === 'PENDIENTE_PAGO' || orden.estado === 'LIQUIDACION_PENDIENTE' || orden.estado === 'TRABAJO_TERMINADO' || orden.estado === 'PAGO_REPORTADO') && (
        <motion.div variants={itemVariants}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Acento Sutil de Luz */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#16A34A]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Cabecera del Panel con Sellos de Seguridad */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Receipt className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-[#0A1525]">
                      {orden.estado === 'PAGO_REPORTADO' ? 'Comprobante en Validación' : 'Reportar Pago del Servicio'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {orden.estado === 'PAGO_REPORTADO' ? 'Operadora conciliando transferencia' : 'Transferencia bancaria o digital'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>SSL 256-Bit</span>
              </div>
            </div>

            {/* Monto Total a Conciliar */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 via-[#0A1525] to-slate-900 text-white rounded-2xl shadow-inner flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-300 uppercase font-black tracking-wider block">
                  Total Facturable:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Diagnóstico + Reparación QA
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-black text-[#CCFF00] tracking-tight">
                  ${totalCotizado.toFixed(2)}
                </span>
                <span className="text-[11px] font-mono text-slate-300 ml-1">USD</span>
              </div>
            </div>

            {/* Datos Bancarios Reales con Micro-Interacciones de Copiado */}
            <div className="space-y-2.5">
              
              {/* Opción 1: Zelle */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span className="text-xs font-black text-[#0A1525]">Zelle</span>
                    <span className="text-[10px] text-slate-400">({DATOS_BANCARIOS.zelle.titular})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copiarDato(DATOS_BANCARIOS.zelle.correo, 'zelle_correo', 'Correo Zelle')}
                    className={`h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copiadoKey === 'zelle_correo'
                        ? 'bg-[#16A34A] text-white shadow-xs'
                        : 'bg-slate-200/70 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    {copiadoKey === 'zelle_correo' ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-600" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 break-all select-all">
                  {DATOS_BANCARIOS.zelle.correo}
                </p>
              </div>

              {/* Opción 2: Pago Móvil */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-black text-[#0A1525]">Pago Móvil</span>
                    <span className="text-[10px] text-slate-500 font-semibold">• {DATOS_BANCARIOS.pagoMovil.banco}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* RIF */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">RIF / CI</span>
                      <span className="font-mono font-bold text-slate-800">{DATOS_BANCARIOS.pagoMovil.rif}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarDato(DATOS_BANCARIOS.pagoMovil.rif, 'pm_rif', 'RIF')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        copiadoKey === 'pm_rif' ? 'bg-[#16A34A] text-white' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Copiar RIF"
                    >
                      {copiadoKey === 'pm_rif' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Teléfono */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Teléfono</span>
                      <span className="font-mono font-bold text-slate-800">{DATOS_BANCARIOS.pagoMovil.telefono}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copiarDato(DATOS_BANCARIOS.pagoMovil.telefono, 'pm_tel', 'Teléfono')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        copiadoKey === 'pm_tel' ? 'bg-[#16A34A] text-white' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Copiar teléfono"
                    >
                      {copiadoKey === 'pm_tel' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Input escondido para carga */}
            <input
              type="file"
              ref={inputComprobanteRef}
              accept="image/*"
              className="hidden"
              onChange={handleSubirComprobante}
            />

            {/* Área de Carga de Comprobante (Bucket 'evidencias') */}
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
                    className="w-14 h-14 rounded-xl object-cover border border-emerald-400 shadow-xs"
                  />
                  <div>
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Comprobante Listo
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Bucket: evidencias</span>
                  </div>
                </div>
                {orden.estado !== 'PAGO_REPORTADO' && (
                  <button
                    type="button"
                    onClick={() => inputComprobanteRef.current?.click()}
                    className="text-xs font-bold text-slate-600 underline cursor-pointer p-1 hover:text-[#0A1525]"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputComprobanteRef.current?.click()}
                className="w-full h-18 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1E56B0] bg-slate-50 hover:bg-blue-50/40 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1E56B0] flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-[#1E56B0]" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-[#0A1525] block">Sube tu comprobante de pago</span>
                  <span className="text-[10px] text-slate-400">Captura de pantalla JPG o PNG de la transferencia</span>
                </div>
              </button>
            )}

            {/* Botón de Confirmación o Estado Reportado */}
            {orden.estado === 'PAGO_REPORTADO' ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <span className="text-xs font-black text-emerald-800 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                  Comprobante Enviado a la Operadora
                </span>
                <p className="text-[11px] text-slate-600">
                  Estamos validando tu pago en tesorería. Te notificaremos al liberar la garantía de 90 días.
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={confirmandoPago || !comprobanteUrl}
                onClick={handleConfirmarPago}
                className={`w-full h-12 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  comprobanteUrl
                    ? 'bg-[#16A34A] hover:bg-[#15803d] text-white cursor-pointer active:scale-95 shadow-emerald-600/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {confirmandoPago ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmar Pago y Notificar</span>
                  </>
                )}
              </button>
            )}

            {/* Sello de Garantía Inferior */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Garantía TuTallerMóvil 90 días
              </span>
              <span>Bóveda QA Conciliada</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 7. GALERÍA DE EVIDENCIAS: Carrusel Snap                   */}
      {/* ======================================================== */}
      {tieneMecanico && listaEvidencias.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3 pt-1">
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
        </motion.div>
      )}

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
          ) : tieneMecanico ? (
            /* Estado en curso CON MECÁNICO ASIGNADO */
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setModalCarnetOpen(true)}
                className="flex-1 h-14 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <QrCode className="w-5 h-5 text-[#0A1525]" />
                <span>Verificar Carnet QR del Mecánico</span>
              </button>
            </div>
          ) : (
            /* ASIGNANDO ESPECIALISTA: NO debe salir verificar carnet hasta haberlo asignado al cliente */
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-14 bg-slate-100/95 border border-slate-200 rounded-2xl flex items-center justify-center gap-2.5 text-slate-700 font-extrabold text-xs sm:text-sm shadow-inner px-3">
                <Clock className="w-4 h-4 text-[#1E56B0] animate-spin" style={{ animationDuration: '4s' }} />
                <span>Asignando Especialista Técnico...</span>
              </div>
              <a
                href="https://wa.me/584142314194?text=Hola,%20solicité%20un%20servicio%20en%20TuTallerMóvil%20y%20estoy%20en%20espera%20de%20asignación%20de%20especialista"
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Soporte WhatsApp</span>
              </a>
            </div>
          )}

        </div>
      </nav>
          </motion.div>
        ) : (
          <motion.div
            key="pestana-historial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="max-w-md mx-auto px-4 py-4 space-y-5"
          >
            {/* 1. FICHA DEL VEHÍCULO (GARAGE HERO) */}
            <div className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E56B0]">
                      El Garaje • Pasaporte Digital
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                    {orden.vehiculo_marca ? `${orden.vehiculo_marca} ` : ''}
                    {orden.vehiculo_modelo}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Año {orden.vehiculo_anio || '2018'} • {orden.cliente_nombre}
                  </p>
                </div>

                {/* Placa Estilo Matrícula Venezolana */}
                <div className="bg-white border-2 border-[#0A1525] rounded-xl px-3 py-1.5 shadow-xs text-center shrink-0">
                  <span className="text-[8px] font-black text-slate-400 block tracking-widest leading-none">
                    VENEZUELA
                  </span>
                  <span className="font-mono text-base font-black text-[#0A1525] tracking-wider">
                    {orden.placa || 'AB123CD'}
                  </span>
                </div>
              </div>

              {/* Badges de Estado de Suscripción */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${tieneSuscripcion ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-[#0A1525]">
                    {tieneSuscripcion ? 'Pasaporte Activo y Certificado' : 'Pasaporte Técnico Inactivo'}
                  </span>
                </div>
                {tieneSuscripcion ? (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                    Suscrito (365 Días)
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    Suscripción Requerida
                  </span>
                )}
              </div>
            </div>

            {/* 2. SI TIENE SUSCRIPCIÓN ACTIVA: BOTÓN DESTACADO PDF & STATS & TIMELINE */}
            {tieneSuscripcion ? (
              <div className="space-y-4">
                {/* Botón Destacado: Descargar Pasaporte Técnico en PDF */}
                <button
                  type="button"
                  onClick={handleDescargarPasaportePdf}
                  disabled={generandoPdfPasaporte}
                  className="w-full h-14 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-[#0A1525]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {generandoPdfPasaporte ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#CCFF00]" />
                      <span>Generando Pasaporte PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-[#CCFF00]" />
                      <span>Descargar Pasaporte Técnico en PDF</span>
                    </>
                  )}
                </button>

                {/* Resumen KPIs del Vehículo */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Servicios</span>
                    <span className="text-lg font-black text-[#0A1525]">{listaHistorial.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Odómetro</span>
                    <span className="text-xs font-black text-[#0A1525]">
                      {listaHistorial[0]?.kilometraje ? `${Number(listaHistorial[0].kilometraje).toLocaleString('es-VE')} KM` : '85.400 KM'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Garantía QA</span>
                    <span className="text-xs font-black text-emerald-700">90 Días TTM</span>
                  </div>
                </div>

                {/* TIMELINE VERTICAL PREMIUM DE HITOS */}
                <div className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#1E56B0]" />
                      <h3 className="text-sm font-black text-[#0A1525] uppercase tracking-wider">
                        Línea de Vida Certificada
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {listaHistorial.length} servicios registrados
                    </span>
                  </div>

                  {listaHistorial.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-xs font-black text-[#0A1525]">Este es el primer servicio de tu vehículo</p>
                      <p className="text-[11px] text-[#475569] max-w-xs mx-auto">
                        Al completar la reparación, los hitos certificados y el diagnóstico de 25 puntos quedarán registrados aquí automáticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {listaHistorial.map((hito, idx) => (
                        <div key={hito.id || idx} className="relative group">
                          {/* Nodo de la línea de tiempo */}
                          <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-[#0A1525] border-2 border-white shadow-xs flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                          </div>

                          {/* Tarjeta del Hito */}
                          <div className="bg-[#F8FAFC] hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-2xl p-4 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#1E56B0]" />
                                {hito.fecha || 'Reciente'}
                              </span>
                              <span className="text-xs font-black text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                                <DollarSign className="w-3 h-3 stroke-[2.5]" />
                                {Number(hito.costo || 0).toFixed(2)} USD
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-[#0A1525] leading-snug">
                              {hito.tipo_servicio}
                            </h4>

                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                              <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                <Gauge className="w-3 h-3 text-slate-500" />
                                Odómetro: {Number(hito.kilometraje || 0).toLocaleString('es-VE')} KM
                              </span>
                            </div>

                            {hito.detalles && (
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {hito.detalles}
                              </p>
                            )}

                            {/* Botón Ver Foto de Evidencia */}
                            {(hito.foto_repuesto_nuevo_url || hito.foto_url) && (
                              <button
                                type="button"
                                onClick={() => setModalFotoZoom(hito.foto_repuesto_nuevo_url || hito.foto_url)}
                                className="mt-1 h-8 px-3 rounded-xl bg-white hover:bg-[#0A1525] hover:text-white border border-slate-200 text-[#0A1525] text-[10px] font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#1E56B0]" />
                                <span>Ver Foto de Evidencia</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 3. SI NO TIENE SUSCRIPCIÓN (EL PAYWALL EN VERDE LIMA) */
              <div className="space-y-5">
                {/* TARJETA DE CONVERSIÓN EN VERDE LIMA (#CCFF00) */}
                <div className="bg-gradient-to-br from-[#CCFF00] to-[#b3e600] rounded-3xl p-6 border-2 border-[#0A1525] shadow-xl text-[#0A1525] space-y-4 relative overflow-hidden">
                  <div className="absolute top-2 right-2 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#0A1525] text-[#CCFF00] px-2 py-0.5 rounded-full">
                        Valor de Reventa Certificado
                      </span>
                      <h3 className="text-base font-black tracking-tight leading-tight mt-0.5">
                        Pasaporte Técnico TTM
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-bold leading-relaxed text-[#0A1525]/90">
                    Activa el Pasaporte Técnico por <span className="font-black text-sm">$5/año</span> para ver todo el historial y aumentar el valor de reventa de tu carro.
                  </p>

                  <div className="space-y-2 bg-white/70 backdrop-blur-xs rounded-2xl p-3 text-[11px] font-bold text-[#0A1525]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      <span>Historial médico completo e inalterable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      <span>Fotos de evidencias de repuestos nuevos instalados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      <span>Descarga de Pasaporte Técnico oficial en PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      <span>Certificación anti-fraude de odómetro y kilometraje</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleActivarSuscripcion}
                    disabled={activandoSuscripcion}
                    className="w-full h-13 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-[#CCFF00] hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    {activandoSuscripcion ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#CCFF00]" />
                        <span>Activando Pasaporte...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 stroke-[2.5]" />
                        <span>Activar Pasaporte Técnico por $5/año</span>
                      </>
                    )}
                  </button>
                </div>

                {/* LÍNEA DE TIEMPO DIFUMINADA (BLUR) */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-5">
                  {/* Candado Flotante en el Centro */}
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center shadow-lg mb-2">
                      <Lock className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black text-[#0A1525] tracking-tight">
                      Historial Protegido
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 text-center max-w-[200px] mt-0.5">
                      Activa la suscripción para desbloquear los hitos de mantenimiento
                    </span>
                  </div>

                  {/* Contenido Difuminado */}
                  <div className="filter blur-sm select-none opacity-40 pointer-events-none space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#1E56B0]" />
                        <h3 className="text-sm font-black text-[#0A1525] uppercase tracking-wider">
                          Línea de Vida Certificada
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">3 eventos registrados</span>
                    </div>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400">2026-11-17</span>
                            <span className="text-xs font-black text-slate-700">$75.00 USD</span>
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            Reemplazo de Pastillas de Freno Cerámicas & Purga DOT 4
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Odómetro: 85.400 KM • Garantía Oficial TTM
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 1: VERIFICAR CARNET QR DEL MECÁNICO (Estilo Bottom Sheet en móvil) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalCarnetOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 text-center space-y-4 border-t sm:border border-[#CBD5E1] shadow-2xl relative max-h-[92dvh] overflow-y-auto safe-area-bottom"
            >
              {/* Drag handle nativo para móviles */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1 sm:hidden shrink-0" />

              <button
                type="button"
                onClick={() => setModalCarnetOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="Cerrar credencial"
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
                  {mecanicoActivo?.nombre || MECANICO_INFO.nombre}
                </h3>
                <p className="text-xs font-mono font-bold text-slate-500">
                  {mecanicoActivo?.codigo || MECANICO_INFO.codigo} • Especialista TTM
                </p>
              </div>

              {/* QR Escaneable */}
              <div className="bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-2xl p-4 flex flex-col items-center justify-center">
                <QRCodeSVG
                  value={`https://tutallermovil.vercel.app/carnet/${encodeURIComponent(mecanicoActivo?.codigo || 'TTM-0842')}`}
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
                  href={`/carnet/${encodeURIComponent(mecanicoActivo?.codigo || 'TTM-0842')}`}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/75 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl relative max-h-[92dvh] max-h-[90vh] overflow-hidden flex flex-col my-auto"
            >
              {/* Header Fijo con Botón Cerrar */}
              <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight truncate">
                      Aprobar Presupuesto
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {orden.vehiculo_modelo}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAprobarPresupuesto(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4 text-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    Desglose de Repuestos e Insumos
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Revisa las piezas certificadas a montar en tu vehículo
                  </p>
                </div>

              {/* Desglose con Repuestos Detallados */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-left space-y-3.5 text-xs">
                
                {/* Repuestos a Instalar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-extrabold text-[#0A1525] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Repuestos Certificados a Instalar ({repuestosActivos.length})</span>
                    </span>
                    <span className="font-mono font-bold text-[#1E56B0]">
                      ${repuestosTotal.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {repuestosActivos.map((rep) => (
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
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: PERSONALIZAR COTIZACIÓN (AÑADIR REPUESTO/SERVICIO) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalAgregarPieza && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl relative max-h-[92dvh] max-h-[90vh] overflow-hidden flex flex-col my-auto"
            >
              {/* Header Fijo con Botón Cerrar */}
              <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center shadow-xs shrink-0">
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E56B0] block">
                      Personaliza tu Servicio
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight truncate">
                      Añadir Repuesto o Servicio
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAgregarPieza(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenedor scrolleable */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">

              <p className="text-xs text-slate-600 font-medium">
                Selecciona una pieza recomendada con 1 toque o escribe un requerimiento para que el taller móvil lo incluya.
              </p>

              {/* Sugerencias Rápidas de 1 Clic */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0A1525] block">
                  Sugerencias frecuentes para tu vehículo
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { nombre: 'Bujías de Iridio (Juego de 4)', precio: 28, marca: 'NGK Laser Iridium' },
                    { nombre: 'Filtro de Aceite Sintético', precio: 12, marca: 'Mann Filter / Bosch' },
                    { nombre: 'Filtro de Aire de Motor', precio: 14, marca: 'Filtec OEM' },
                    { nombre: 'Filtro de Cabina A/C', precio: 12, marca: 'Carbon Activo' },
                    { nombre: 'Refrigerante 50/50 (1 Galón)', precio: 15, marca: 'Prestone / Motul' },
                    { nombre: 'Limpieza Inyectores / Admisión', precio: 25, marca: 'Servicio Químico Pro' },
                    { nombre: 'Líquido de Frenos DOT 4 Extra', precio: 10, marca: 'Motul Brake Fluid' },
                    { nombre: 'Correa Única / Accesorios', precio: 22, marca: 'Gates / Continental' }
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAgregarRepuestoPersonalizado(sug.nombre, sug.precio, sug.marca)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-[#1E56B0] hover:bg-blue-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-xs font-bold text-[#0A1525] block truncate group-hover:text-[#1E56B0]">
                          {sug.nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {sug.marca}
                        </span>
                      </div>
                      <span className="text-xs font-black font-mono text-[#1E56B0] shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-2xs">
                        +${sug.precio}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario para Pieza Personalizada */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0A1525] block">
                  O escribe una pieza personalizada:
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nombre de la pieza o trabajo:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Estopera de cigüeñal, Bujes de barra..."
                      value={nuevaPiezaNombre}
                      onChange={(e) => setNuevaPiezaNombre(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Marca / Detalle:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: OEM / Genuino"
                        value={nuevaPiezaMarca}
                        onChange={(e) => setNuevaPiezaMarca(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#1E56B0]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Precio aprox ($ USD):
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 20"
                        value={nuevaPiezaPrecio}
                        onChange={(e) => setNuevaPiezaPrecio(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#1E56B0]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAgregarRepuestoPersonalizado()}
                  className="w-full h-11 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Añadir a mi Cotización</span>
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 4: SUBIR COMPROBANTE DE PAGO (GLASSMORPHISM)       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalPagoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl relative max-h-[92dvh] max-h-[90vh] overflow-hidden flex flex-col my-auto"
            >
              {/* Header Fijo con Botón Cerrar */}
              <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center shrink-0 shadow-xs">
                    <Receipt className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight truncate">
                      Reportar Pago
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      Monto: <strong className="text-[#0A1525] font-mono">${totalCotizado.toFixed(2)} USD</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalPagoOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenedor scrolleable */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex mb-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Bóveda Segura SSL 256-Bit</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Realiza tu transferencia o pago móvil y adjunta el comprobante
                  </p>
                </div>

              {/* Datos Bancarios Reales con Botones de Copiar */}
              <div className="space-y-2 text-left">
                {/* Zelle */}
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0A1525]">Zelle ({DATOS_BANCARIOS.zelle.titular})</span>
                    <button
                      type="button"
                      onClick={() => copiarDato(DATOS_BANCARIOS.zelle.correo, 'modal_zelle', 'Correo Zelle')}
                      className={`h-6 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        copiadoKey === 'modal_zelle'
                          ? 'bg-[#16A34A] text-white'
                          : 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                      }`}
                    >
                      {copiadoKey === 'modal_zelle' ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiadoKey === 'modal_zelle' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 break-all select-all">
                    {DATOS_BANCARIOS.zelle.correo}
                  </p>
                </div>

                {/* Pago Móvil */}
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3 space-y-1.5">
                  <span className="text-[11px] font-black text-[#0A1525] block">
                    Pago Móvil • {DATOS_BANCARIOS.pagoMovil.banco}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-slate-400 font-black block">RIF / CI</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">{DATOS_BANCARIOS.pagoMovil.rif}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copiarDato(DATOS_BANCARIOS.pagoMovil.rif, 'modal_pm_rif', 'RIF')}
                        className={`p-1 rounded transition-colors ${copiadoKey === 'modal_pm_rif' ? 'bg-[#16A34A] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                      >
                        {copiadoKey === 'modal_pm_rif' ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-slate-400 font-black block">Teléfono</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">{DATOS_BANCARIOS.pagoMovil.telefono}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copiarDato(DATOS_BANCARIOS.pagoMovil.telefono, 'modal_pm_tel', 'Teléfono')}
                        className={`p-1 rounded transition-colors ${copiadoKey === 'modal_pm_tel' ? 'bg-[#16A34A] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                      >
                        {copiadoKey === 'modal_pm_tel' ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Selección de Comprobante */}
              {subiendoComprobante ? (
                <div className="h-18 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#1E56B0] animate-spin" />
                  <span className="text-xs font-bold text-[#0A1525]">Subiendo comprobante...</span>
                </div>
              ) : comprobanteUrl ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comprobanteUrl}
                      alt="Comprobante"
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-400 shadow-2xs"
                    />
                    <div className="text-left">
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
                <div
                  onClick={() => inputComprobanteRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-3 hover:border-[#1E56B0] transition-colors cursor-pointer bg-slate-50"
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#0A1525] block">
                    Sube tu comprobante de pago
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Captura JPG o PNG de la transferencia
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={confirmandoPago || !comprobanteUrl}
                  onClick={handleConfirmarPago}
                  className={`w-full h-12 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
                    comprobanteUrl
                      ? 'bg-[#16A34A] hover:bg-[#15803d] text-white cursor-pointer active:scale-95 shadow-emerald-600/30'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {confirmandoPago ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Pago y Notificar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL CELEBRATORIO: COMPROBANTE NOTIFICADO CON ÉXITO     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {pantallaExitoReportado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative overflow-hidden my-auto max-h-[92dvh] max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#16A34A]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#CCFF00]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Botón X superior accesible en móvil */}
              <button
                type="button"
                onClick={() => setPantallaExitoReportado(false)}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#16A34A] to-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 relative"
                >
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3.5] text-[#0A1525]" />
                  <span className="absolute inset-0 rounded-3xl border-2 border-[#16A34A] animate-ping opacity-30" />
                </motion.div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ Comprobante Notificado
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#0A1525] tracking-tight">
                    ¡Pago en Validación!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tu comprobante ha sido enviado a la operadora de despacho. En unos minutos tu orden pasará a <strong>PAGADO</strong> y se liberará tu certificado de garantía.
                  </p>
                </div>

                {comprobanteUrl && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                    <img
                      src={comprobanteUrl}
                      alt="Ticket"
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
                    />
                    <div className="text-left text-xs">
                      <span className="font-bold text-[#0A1525] block">Comprobante Recibido</span>
                      <span className="text-[10px] text-slate-500 font-mono">Bucket: evidencias</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPantallaExitoReportado(false)}
                className="w-full h-11 sm:h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
              >
                Entendido, Continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* TOAST FLOTANTE DE CONFIRMACIÓN DE COPIADO                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastNotificacion && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-24 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
          >
            <div className="bg-[#0A1525] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{toastNotificacion}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 5: CELEBRACIÓN CON CONFETI Y ENCUESTA 5 ESTRELLAS  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalCalificacionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 text-center space-y-4 border border-[#CBD5E1] shadow-2xl relative overflow-hidden my-auto max-h-[92dvh] max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/30 rounded-full blur-2xl pointer-events-none" />

              {/* Botón X visible en móvil */}
              <button
                type="button"
                onClick={() => setModalCalificacionOpen(false)}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-lg shadow-[#CCFF00]/40">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#0A1525] stroke-[2.2]" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ¡Pago Verificado y Conciliado!
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#0A1525] tracking-tight mt-1.5">
                    ¿Cómo estuvo tu experiencia con {mecanicoActivo?.nombre || 'el técnico especialista'}?
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
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
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
                  placeholder={`Deja un comentario para ${mecanicoActivo?.nombre || 'el especialista'} (opcional)...`}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-[#0A1525] focus:outline-none focus:border-[#1E56B0] resize-none"
                />
              </div>

              {calificacionEnviada ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Gracias! Tu reseña ha sido registrada.</span>
                </div>
              ) : (
                <div className="space-y-2 pt-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleEnviarCalificacion}
                    className="w-full h-11 sm:h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    Enviar Calificación
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalCalificacionOpen(false)}
                    className="w-full h-8 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Omitir por ahora
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 6: DETALLE DEL CHECKLIST DE 25 PUNTOS (CLIENTE)    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalChecklistClienteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl p-4 sm:p-6 relative my-auto space-y-4 max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Botón Cerrar Pinned / Sticky */}
              <button
                type="button"
                onClick={() => setModalChecklistClienteOpen(false)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar visor"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3 pr-8 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ClipboardCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight">
                      Checklist Certificado 25 Puntos
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                      Inspección
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {orden.vehiculo_modelo} • Placa: {orden.placa || 'AB123CD'}
                  </p>
                </div>
              </div>

              {/* Resumen de Auditoría */}
              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed shrink-0">
                <p className="font-semibold text-slate-900 mb-0.5">
                  Inspección realizada por el especialista en sitio:
                </p>
                <p className="text-[11px] text-slate-500">
                  Cada componente fue evaluado siguiendo la norma de control preventivo de TuTallerMóvil Protocol 2027.
                </p>
              </div>

              {/* Lista Categorizada de los 25 Puntos */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {CHECKLIST_25_CLIENTE.map((cat, idx) => {
                  const itemsResp = orden.diagnostico_json?.items || {};
                  return (
                    <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-xs font-black text-[#0A1525]">
                        {cat.categoria}
                      </div>
                      <div className="p-2.5 space-y-2 divide-y divide-slate-100">
                        {cat.items.map((item) => {
                          const val = itemsResp[item.id] || (
                            (item.id === 'pastillas_delanteras' || item.id === 'discos_freno' || item.id === 'liquido_frenos') && orden.diagnostico_json?.frenos === 'requiere_cambio'
                              ? 'requiere_cambio'
                              : 'ok'
                          );
                          const esFalla = val === 'requiere_cambio' || val === 'CAMBIO' || val === 'falla';

                          return (
                            <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${esFalla ? 'text-rose-900 font-black' : 'text-slate-800'}`}>
                                  {item.nombre}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {item.okDesc}
                                </p>
                              </div>
                              <div className="shrink-0">
                                {esFalla ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    <span>Requiere Cambio</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                    <span>OK</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setModalChecklistClienteOpen(false)}
                className="w-full h-11 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para solicitar Inspección Técnica / Servicio cuando no hay checklist */}
      <SolicitarMecanicoModal
        open={modalPedirServicioOpen}
        onOpenChange={setModalPedirServicioOpen}
        initialTipoServicio="INSPECCION_TECNICA"
        initialVehiculo={{
          marca: orden.vehiculo_marca || undefined,
          modelo: orden.vehiculo_modelo || undefined,
          anio: orden.vehiculo_anio || undefined,
          placa: orden.placa || undefined
        }}
        initialCliente={{
          nombre: orden.cliente_nombre || '',
          telefono: orden.cliente_telefono || '',
          email: ''
        }}
      />

    </div>
  );
}

export default ClienteServicioClient;
