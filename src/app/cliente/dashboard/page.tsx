'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Car,
  Wrench,
  Calendar,
  Gauge,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronRight,
  Clock,
  User,
  Sparkles,
  X,
  Activity,
  Radio,
  Check,
  RotateCcw,
  FileText
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
import { SolicitarExpedienteModal } from '@/components/SolicitarExpedienteModal';
import BotonSoporteWhatsApp from '@/components/BotonSoporteWhatsApp';

interface VehiculoGaraje {
  id: string;
  marca: string;
  modelo: string;
  anio: number | string;
  placa: string;
  color?: string;
  kilometraje: number;
  ultimoServicio?: string;
  tipoUltimoServicio?: string;
  estadoSalud: 'optimo' | 'atencion' | 'pendiente';
  fotoUrl?: string;
  checklist25?: {
    puntos_ok: number;
    puntos_cambio: number;
    frenos: string;
    aceite: string;
    suspension: string;
    electrico: string;
    piezas_requeridas?: string;
    items?: Record<string, string>;
  } | null;
}

export interface OrdenServicioCliente {
  id: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  vehiculo_placa?: string;
  falla_reportada?: string;
  sector?: string;
  estado: string;
  created_at?: string;
  mecanico_id?: string;
  mecanico_nombre?: string;
  tipo_servicio?: string;
  precio_estimado?: number;
  ganancia_estimada?: number;
}

const VEHICULOS_DEFAULT: VehiculoGaraje[] = [
  {
    id: 'veh-01',
    marca: 'Toyota',
    modelo: 'Corolla GLi 1.8L',
    anio: 2018,
    placa: 'AB123CD',
    color: 'Plata Metalizado',
    kilometraje: 85400,
    ultimoServicio: '17 Nov 2026',
    tipoUltimoServicio: 'Reemplazo de Pastillas Delanteras e Inspección 25 Puntos',
    estadoSalud: 'optimo',
    fotoUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    checklist25: {
      puntos_ok: 22,
      puntos_cambio: 3,
      frenos: 'requiere_cambio',
      aceite: 'ok',
      suspension: 'ok',
      electrico: 'ok',
      piezas_requeridas: 'Pastillas delanteras cerámicas Bosch y rectificación de discos',
      items: {
        aceite_motor: 'ok',
        liquido_frenos: 'requiere_cambio',
        refrigerante: 'ok',
        direccion_hidraulica: 'ok',
        limpiaparabrisas: 'ok',
        aceite_transmision: 'ok',
        fugas_motor: 'ok',
        pastillas_delanteras: 'requiere_cambio',
        pastillas_traseras: 'ok',
        discos_freno: 'requiere_cambio',
        lineas_mangueras: 'ok',
        freno_mano: 'ok',
        calipers_mordazas: 'ok',
        amortiguadores: 'ok',
        munones_rotulas: 'ok',
        terminales_direccion: 'ok',
        bujes_mesetas: 'ok',
        barra_estabilizadora: 'ok',
        rodamientos_rueda: 'ok',
        luces_principales: 'ok',
        luces_stop: 'ok',
        bornes_bateria: 'ok',
        estado_bateria: 'ok',
        alternador_carga: 'ok',
        correa_accesorios: 'ok'
      }
    }
  },
  {
    id: 'veh-02',
    marca: 'Jeep',
    modelo: 'Grand Cherokee Limited 4x4',
    anio: 2019,
    placa: 'AE456FG',
    color: 'Negro Brillante',
    kilometraje: 62100,
    ultimoServicio: '02 Oct 2026',
    tipoUltimoServicio: 'Mantenimiento Preventivo 60K & Diagnóstico Computarizado',
    estadoSalud: 'optimo',
    fotoUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
    checklist25: {
      puntos_ok: 25,
      puntos_cambio: 0,
      frenos: 'ok',
      aceite: 'ok',
      suspension: 'ok',
      electrico: 'ok',
      items: {
        aceite_motor: 'ok',
        liquido_frenos: 'ok',
        pastillas_delanteras: 'ok',
        discos_freno: 'ok'
      }
    }
  }
];

function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'LEAD_NUEVO':
      return { label: 'Solicitud Recibida', bg: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500' };
    case 'ASIGNADO':
      return { label: 'Mecánico Asignado', bg: 'bg-blue-100 text-blue-900 border-blue-200', dot: 'bg-blue-600' };
    case 'EN_RUTA_TALLER':
    case 'EN_RUTA':
      return { label: 'Mecánico en Camino', bg: 'bg-[#CCFF00] text-[#0A1525] border-[#0A1525]/20', dot: 'bg-[#0A1525]' };
    case 'DIAGNOSTICO_AGENDADO':
    case 'EN_EJECUCION':
      return { label: 'En Diagnóstico / Sitio', bg: 'bg-purple-100 text-purple-900 border-purple-200', dot: 'bg-purple-600' };
    case 'COTIZADO':
    case 'ESPERANDO_APROBACION':
      return { label: 'Presupuesto por Aprobar', bg: 'bg-orange-100 text-orange-900 border-orange-200', dot: 'bg-orange-600' };
    case 'APROBADO':
    case 'REPUESTOS_EN_RUTA':
      return { label: 'Repuestos en Ruta', bg: 'bg-sky-100 text-sky-900 border-sky-200', dot: 'bg-sky-600' };
    case 'EN_REPARACION':
      return { label: 'Reparación en Proceso', bg: 'bg-indigo-100 text-indigo-900 border-indigo-200', dot: 'bg-indigo-600' };
    case 'TRABAJO_TERMINADO':
    case 'PENDIENTE_PAGO':
      return { label: 'Trabajo Listo • Pendiente Pago', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', dot: 'bg-emerald-600' };
    case 'PAGO_REPORTADO':
      return { label: 'Validando Pago', bg: 'bg-cyan-100 text-cyan-900 border-cyan-200', dot: 'bg-cyan-600' };
    case 'PAGADO':
    case 'FINALIZADO':
      return { label: 'Completado & Certificado', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
    default:
      return { label: (estado || 'ACTIVO').replace(/_/g, ' '), bg: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-400' };
  }
}

export default function ClienteDashboardPage() {
  const router = useRouter();

  // Estados de usuario
  const [usuario, setUsuario] = useState<{
    nombre: string;
    email: string;
    telefono?: string;
  }>({
    nombre: '',
    email: '',
    telefono: ''
  });

  const [vehiculos, setVehiculos] = useState<VehiculoGaraje[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Modales
  const [modalSolicitarOpen, setModalSolicitarOpen] = useState(false);
  const [tipoServicioModal, setTipoServicioModal] = useState<'FALLA' | 'INSPECCION_TECNICA'>('FALLA');
  const [modalChecklistOpen, setModalChecklistOpen] = useState(false);
  const [modalExpedienteOpen, setModalExpedienteOpen] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<VehiculoGaraje | null>(null);

  // Órdenes de servicio y visualización de Servicios Activos
  const [ordenesCliente, setOrdenesCliente] = useState<OrdenServicioCliente[]>([]);
  const [modalServiciosActivosOpen, setModalServiciosActivosOpen] = useState(false);
  const [tabServiciosModal, setTabServiciosModal] = useState<'activos' | 'historial'>('activos');

  const serviciosActivos = ordenesCliente.filter(o => 
    !['FINALIZADO', 'CANCELADO'].includes(o.estado)
  );
  const serviciosHistorial = ordenesCliente.filter(o => 
    ['FINALIZADO', 'CANCELADO'].includes(o.estado)
  );

  // Recargar órdenes desde Supabase y LocalStorage
  const recargarOrdenes = async (emailParam?: string, telParam?: string) => {
    try {
      const supabase = createClient();
      const eMail = emailParam || usuario.email;
      const tel = telParam || usuario.telefono;
      const lista: OrdenServicioCliente[] = [];

      if (eMail || tel) {
        const query = eMail && tel
          ? `cliente_email.ilike.%${eMail}%,cliente_telefono.eq.${tel}`
          : eMail
            ? `cliente_email.ilike.%${eMail}%`
            : `cliente_telefono.eq.${tel}`;

        const { data: ordenesData } = await supabase
          .from('ordenes')
          .select('*')
          .or(query)
          .order('created_at', { ascending: false });

        if (ordenesData) {
          ordenesData.forEach((ord: any) => {
            lista.push({
              id: ord.id,
              cliente_nombre: ord.cliente_nombre,
              cliente_telefono: ord.cliente_telefono,
              cliente_email: ord.cliente_email,
              vehiculo_marca: ord.vehiculo_marca,
              vehiculo_modelo: ord.vehiculo_modelo,
              vehiculo_placa: ord.vehiculo_placa || ord.placa_flota,
              falla_reportada: ord.falla_reportada,
              sector: ord.sector,
              estado: ord.estado || 'LEAD_NUEVO',
              created_at: ord.created_at,
              mecanico_id: ord.mecanico_id,
              mecanico_nombre: ord.mecanico_nombre,
              tipo_servicio: ord.tipo_servicio,
              precio_estimado: ord.precio_estimado,
              ganancia_estimada: ord.ganancia_estimada
            });
          });
        }
      }

      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('ttm_ordenes_recientes');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((ord: any) => {
              if (!lista.some(o => o.id === ord.id)) {
                lista.push({
                  id: ord.id,
                  cliente_nombre: ord.cliente_nombre,
                  cliente_telefono: ord.cliente_telefono,
                  cliente_email: ord.cliente_email,
                  vehiculo_marca: ord.vehiculo_marca,
                  vehiculo_modelo: ord.vehiculo_modelo,
                  vehiculo_placa: ord.vehiculo_placa,
                  falla_reportada: ord.falla_reportada,
                  sector: ord.sector,
                  estado: ord.estado || 'LEAD_NUEVO',
                  created_at: ord.created_at,
                  mecanico_id: ord.mecanico_id,
                  mecanico_nombre: ord.mecanico_nombre,
                  tipo_servicio: ord.tipo_servicio,
                  precio_estimado: ord.precio_estimado,
                  ganancia_estimada: ord.ganancia_estimada
                });
              }
            });
          }
        }
      }

      setOrdenesCliente(lista);
    } catch (e) {
      console.warn('Error recargando órdenes:', e);
    }
  };

  // Modal para registrar un nuevo vehículo en el Garaje
  const [modalNuevoVehiculo, setModalNuevoVehiculo] = useState(false);
  const [nuevoMarca, setNuevoMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [nuevoAnio, setNuevoAnio] = useState('');
  const [nuevoPlaca, setNuevoPlaca] = useState('');

  // Carga de sesión de usuario y vehículos vinculados
  useEffect(() => {
    async function inicializarDashboard() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let emailUsuario = '';
        let nombreUsuario = '';
        let telefonoUsuario = '';

        if (user) {
          emailUsuario = user.email || '';
          nombreUsuario = user.user_metadata?.nombre || user.user_metadata?.full_name || emailUsuario.split('@')[0];
          telefonoUsuario = user.user_metadata?.telefono || '';
        } else if (typeof window !== 'undefined') {
          const sesionLocal = localStorage.getItem('ttm_cliente_sesion');
          if (sesionLocal) {
            try {
              const parsed = JSON.parse(sesionLocal);
              if (parsed.email) emailUsuario = parsed.email;
              if (parsed.nombre) nombreUsuario = parsed.nombre;
              if (parsed.telefono) telefonoUsuario = parsed.telefono;
            } catch (e) {}
          }
        }

        setUsuario({
          nombre: nombreUsuario,
          email: emailUsuario,
          telefono: telefonoUsuario
        });

        const mapaVehiculos = new Map<string, VehiculoGaraje>();

        // 1. Consultar vehículos en Supabase solo si hay email o teléfono identificado
        if (emailUsuario || telefonoUsuario) {
          const { data: vehiculosData } = await supabase
            .from('vehiculos')
            .select('*')
            .or(`cliente_email.ilike.%${emailUsuario}%,cliente_telefono.eq.${telefonoUsuario}`);

          if (vehiculosData && vehiculosData.length > 0) {
            vehiculosData.forEach((v: any) => {
              const placa = (v.placa || 'PLACA').toUpperCase().trim();
              const tieneChecklist = Boolean(v.checklist_json && Object.keys(v.checklist_json).length > 0);
              const km = typeof v.kilometraje === 'number' ? v.kilometraje : 0;

              mapaVehiculos.set(placa, {
                id: v.id,
                marca: v.marca || 'Vehículo',
                modelo: v.modelo || 'Automóvil',
                anio: v.anio ?? v.año ?? 2020,
                placa: placa,
                color: v.color || 'No especificado',
                kilometraje: km,
                ultimoServicio: tieneChecklist && v.updated_at
                  ? new Date(v.updated_at).toLocaleDateString('es-VE')
                  : 'Sin servicios aún',
                tipoUltimoServicio: tieneChecklist
                  ? 'Inspección Certificada TTM'
                  : 'Registro inicial en Mi Garaje',
                estadoSalud: tieneChecklist ? 'optimo' : 'pendiente',
                fotoUrl: v.foto_url || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
                checklist25: tieneChecklist ? v.checklist_json : null
              });
            });
          }

          // 2. Consultar órdenes de servicio previas asociadas al correo
          const { data: ordenesData } = await supabase
            .from('ordenes')
            .select('*')
            .ilike('cliente_email', emailUsuario);

          if (ordenesData && ordenesData.length > 0) {
            ordenesData.forEach((ord: any) => {
              const placaOrd = (
                ord.vehiculo_placa ||
                ord.placa_flota ||
                ord.vehiculo_modelo?.match(/\[([A-Z0-9-]+)\]/)?.[1] ||
                `ORD-${ord.id.slice(0, 5).toUpperCase()}`
              ).toUpperCase().trim();

              if (!mapaVehiculos.has(placaOrd)) {
                const tieneChecklistReal = Boolean(ord.diagnostico_json && Object.keys(ord.diagnostico_json).length > 0);
                mapaVehiculos.set(placaOrd, {
                  id: `veh_ord_${ord.id}`,
                  marca: ord.vehiculo_marca || 'Automóvil',
                  modelo: ord.vehiculo_modelo?.replace(/\[.*?\]/, '').trim() || 'Vehículo Particular',
                  anio: ord.vehiculo_anio || 2020,
                  placa: placaOrd,
                  kilometraje: typeof ord.kilometraje_actual === 'number' ? ord.kilometraje_actual : 0,
                  ultimoServicio: ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-VE') : 'Reciente',
                  tipoUltimoServicio: ord.falla_reportada || 'Servicio Técnico TuTallerMóvil',
                  estadoSalud: tieneChecklistReal ? 'optimo' : 'pendiente',
                  fotoUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
                  checklist25: tieneChecklistReal ? ord.diagnostico_json : null
                });
              }
            });
          }
        }

        const listaFinal = Array.from(mapaVehiculos.values());

        if (listaFinal.length > 0) {
          setVehiculos(listaFinal);
        } else {
          // Si no hay en Supabase, verificar si guardó alguno localmente en su sesión
          let cargadoLocal = false;
          if (typeof window !== 'undefined') {
            const garajeLocal = localStorage.getItem('ttm_garaje_vehiculos');
            if (garajeLocal) {
              try {
                const parseLocal = JSON.parse(garajeLocal);
                if (Array.isArray(parseLocal) && parseLocal.length > 0) {
                  setVehiculos(parseLocal);
                  cargadoLocal = true;
                }
              } catch (e) {}
            }
          }

          // Si es un usuario nuevo sin vehículos: Garaje 100% limpio en cero
          if (!cargadoLocal) {
            setVehiculos([]);
          }
        }

        // Cargar órdenes de servicio del cliente (Supabase y localStorage)
        await recargarOrdenes(emailUsuario, telefonoUsuario);

      } catch (err) {
        console.warn('Error inicializando garaje:', err);
        setVehiculos([]);
      } finally {
        setCargando(false);
      }
    }

    inicializarDashboard();
  }, []);

  // Agregar nuevo vehículo al garaje
  const handleGuardarNuevoVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMarca || !nuevoModelo || !nuevoPlaca) return;

    const nuevo: VehiculoGaraje = {
      id: `veh_${Date.now()}`,
      marca: nuevoMarca.trim(),
      modelo: nuevoModelo.trim(),
      anio: nuevoAnio.trim() || '2022',
      placa: nuevoPlaca.trim().toUpperCase(),
      kilometraje: 0,
      ultimoServicio: 'Sin servicios aún',
      tipoUltimoServicio: 'Registro inicial en Mi Garaje',
      estadoSalud: 'pendiente',
      fotoUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      checklist25: null
    };

    const nuevaLista = [nuevo, ...vehiculos];
    setVehiculos(nuevaLista);

    if (typeof window !== 'undefined') {
      localStorage.setItem('ttm_garaje_vehiculos', JSON.stringify(nuevaLista));
    }

    // Intentar persistir en Supabase
    try {
      const supabase = createClient();
      await supabase.from('vehiculos').insert([{
        marca: nuevo.marca,
        modelo: nuevo.modelo,
        anio: parseInt(String(nuevo.anio), 10) || 2022,
        placa: nuevo.placa,
        kilometraje: 0,
        cliente_email: usuario.email,
        cliente_telefono: usuario.telefono,
        cliente_nombre: usuario.nombre
      }]);
    } catch (e) {}

    setNuevoMarca('');
    setNuevoModelo('');
    setNuevoAnio('');
    setNuevoPlaca('');
    setModalNuevoVehiculo(false);
  };

  // Cerrar Sesión
  const handleCerrarSesion = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('ttm_cliente_sesion');
      localStorage.removeItem('ttm_garaje_vehiculos');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* 1. Header con Saludo y Perfil */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo y Garaje */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/icon.svg"
                alt="TuTallerMóvil"
                className="h-[50px] sm:h-[55px] w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-[#1E56B0] shadow-2xs">
                Mi Garaje
              </span>
            </Link>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <BotonSoporteWhatsApp 
              modo="header" 
              mensaje="Hola, necesito ayuda con mi garaje o servicio en TuTallerMóvil"
              className="hidden sm:inline-flex"
            />

            {/* BOTÓN SERVICIOS ACTIVOS */}
            <button
              type="button"
              onClick={() => {
                setTabServiciosModal('activos');
                setModalServiciosActivosOpen(true);
              }}
              className="h-10 px-3 sm:px-4 rounded-xl bg-slate-900 hover:bg-[#1E56B0] text-white text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 relative border border-slate-700/60"
              title="Ver servicios y reparaciones activas"
            >
              <div className="relative flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#CCFF00]" />
                {serviciosActivos.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                )}
              </div>
              <span className="hidden sm:inline">Servicios Activos</span>
              <span className="sm:hidden">Activos</span>
              {serviciosActivos.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#CCFF00] text-[#0A1525] text-[10px] font-mono font-black">
                  {serviciosActivos.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoServicioModal('INSPECCION_TECNICA');
                setVehiculoSeleccionado(null);
                setModalSolicitarOpen(true);
              }}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 border border-[#0A1525]/10"
            >
              <ClipboardCheck className="w-4 h-4 text-[#0A1525] stroke-[2.5]" />
              <span className="hidden sm:inline">Inspección Técnica (25 Pts)</span>
              <span className="sm:hidden">Inspección</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoServicioModal('FALLA');
                setVehiculoSeleccionado(null);
                setModalSolicitarOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Wrench className="w-4 h-4 text-[#CCFF00]" />
              <span className="hidden sm:inline">Pedir Servicio Mecánico</span>
              <span className="sm:hidden">Pedir</span>
            </button>

            <button
              type="button"
              onClick={handleCerrarSesion}
              className="h-10 px-3 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cerrar sesión de cliente"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Contenido Central */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6 w-full">
        
        {/* Banner de Bienvenida y Resumen Bento */}
        <div className="bg-gradient-to-br from-[#0A1525] via-[#102038] to-[#1E56B0] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/10 text-[#CCFF00]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cliente Verificado • Sin Paywall</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Bienvenido a tu Garaje, {usuario.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Acceso ilimitado al Pasaporte Técnico de tus vehículos, diagnósticos de 25 puntos y seguimiento de garantías en tiempo real.
              </p>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTabServiciosModal('activos');
                  setModalServiciosActivosOpen(true);
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-[#CCFF00]/40 text-center min-w-[85px] sm:min-w-[100px] transition-all cursor-pointer group"
                title="Ver tus servicios en curso"
              >
                <span className="text-[10px] text-slate-300 font-bold uppercase block flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3 text-[#CCFF00]" />
                  <span>En Curso</span>
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-[#CCFF00] group-hover:scale-105 transition-transform inline-block">
                  {serviciosActivos.length}
                </span>
              </button>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[85px] sm:min-w-[90px]">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Vehículos</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">
                  {vehiculos.length}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[85px] sm:min-w-[90px]">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Inspecciones</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">
                  25 Pts
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[85px] sm:min-w-[90px]">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Garantía QA</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                  90 Días
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BANNER DE SEGUIMIENTO EN VIVO: SERVICIO ACTIVO EN CURSO */}
        {serviciosActivos.length > 0 && (
          <div className="bg-[#0A1525] rounded-3xl p-5 sm:p-6 border-2 border-[#CCFF00]/50 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start sm:items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 shadow-lg shadow-[#CCFF00]/30">
                <Radio className="w-6 h-6 stroke-[2.5] animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#CCFF00] text-[#0A1525] px-2.5 py-0.5 rounded-full shadow-2xs">
                    ● En Curso • {serviciosActivos[0].estado.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #{serviciosActivos[0].id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {serviciosActivos[0].vehiculo_modelo} {serviciosActivos[0].vehiculo_placa ? `[${serviciosActivos[0].vehiculo_placa}]` : ''}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  {serviciosActivos[0].falla_reportada || 'Servicio técnico automotriz en progreso'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 relative z-10">
              <Link
                href={`/cliente/servicio/${serviciosActivos[0].id}`}
                className="h-11 px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Ver Seguimiento en Vivo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {serviciosActivos.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setTabServiciosModal('activos');
                    setModalServiciosActivosOpen(true);
                  }}
                  className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Ver todos ({serviciosActivos.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sección: Mis Vehículos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#1E56B0]" />
              <h2 className="text-lg font-black text-[#0A1525]">
                Vehículos en tu Garaje
              </h2>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                {vehiculos.length} activos
              </span>
            </div>

            <button
              type="button"
              onClick={() => setModalNuevoVehiculo(true)}
              className="text-xs font-extrabold text-[#1E56B0] hover:text-[#0A1525] flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Otro Carro</span>
            </button>
          </div>

          {/* Grid de Tarjetas de Vehículos o Estado Vacío */}
          {vehiculos.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center mx-auto shadow-xs">
                <Car className="w-8 h-8 text-[#1E56B0]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-black text-[#0A1525]">
                  Tu portal está listo. Aquí aparecerán tus vehículos
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Registra tu automóvil para consultar su historial médico en cualquier momento, o pide tu primer servicio a domicilio y se vinculará automáticamente con tu correo <strong>{usuario.email}</strong>.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoVehiculo(true)}
                  className="h-11 px-5 rounded-xl bg-white hover:bg-slate-50 text-[#0A1525] font-black text-xs border border-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#1E56B0]" />
                  <span>Registrar mi Vehículo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalSolicitarOpen(true)}
                  className="h-11 px-5 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Wrench className="w-4 h-4 text-[#CCFF00]" />
                  <span>Pedir mi primer servicio</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vehiculos.map((v) => {
                const esNuevoVehiculo = v.kilometraje === 0 || !v.checklist25 || v.estadoSalud === 'pendiente';

                return (
                  <div
                    key={v.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Fila Superior: Foto / Silueta y Placa Venezolana */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {v.marca} • {v.anio}
                          </span>
                          <h3 className="text-lg font-black text-[#0A1525] truncate">
                            {v.modelo}
                          </h3>
                          {v.color && (
                            <p className="text-xs text-slate-500 font-medium">
                              Color: {v.color}
                            </p>
                          )}
                        </div>

                        {/* Matrícula Venezolana */}
                        <div className="w-32 bg-white border-2 border-[#0A1525] rounded-xl p-1.5 text-center shadow-xs shrink-0">
                          <span className="text-[8px] font-black text-slate-400 block tracking-widest leading-none">
                            VENEZUELA
                          </span>
                          <span className="font-mono text-base font-black text-[#0A1525] tracking-wider leading-tight">
                            {v.placa}
                          </span>
                        </div>
                      </div>

                      {/* Ficha Rápida: Kilometraje y Estado */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                          <Gauge className="w-4 h-4 text-[#1E56B0]" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Odómetro</span>
                            <span className="font-mono font-black text-[#0A1525]">
                              {v.kilometraje === 0 ? '0 KM' : `${v.kilometraje.toLocaleString()} KM`}
                            </span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                          esNuevoVehiculo
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                        }`}>
                          {esNuevoVehiculo ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className={`text-[10px] font-semibold block ${
                              esNuevoVehiculo ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              Pasaporte
                            </span>
                            <span className="font-bold text-xs truncate block">
                              {esNuevoVehiculo ? 'Sin Certificar' : '100% Certificado'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Último Servicio / Diagnóstico */}
                      <div className="mt-3 p-3 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-[#0A1525] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#1E56B0]" />
                            <span>Último Servicio:</span>
                          </span>
                          <span>{v.ultimoServicio || 'Sin servicios aún'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium truncate">
                          {esNuevoVehiculo
                            ? 'Vehículo registrado en Garaje • Sin intervenciones previas'
                            : v.tipoUltimoServicio}
                        </p>
                      </div>
                    </div>

                    {/* Acciones de la Tarjeta */}
                    {esNuevoVehiculo ? (
                      /* ACCIONES PARA VEHÍCULO NUEVO (HISTORIAL EN CERO) */
                      <div className="pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setTipoServicioModal('FALLA');
                              setModalSolicitarOpen(true);
                            }}
                            className="h-11 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Wrench className="w-3.5 h-3.5 text-[#CCFF00]" />
                            <span className="truncate">Pedir Reparación</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setTipoServicioModal('INSPECCION_TECNICA');
                              setModalSolicitarOpen(true);
                            }}
                            className="h-11 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 border border-[#0A1525]/10"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-[#0A1525] stroke-[2.5]" />
                            <span className="truncate">Inspección Técnica</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ACCIONES PARA VEHÍCULO CON HISTORIAL DOCUMENTADO */
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/historial/${v.placa}?garaje=true`}
                            className="h-11 rounded-xl bg-slate-100 hover:bg-[#0A1525] text-slate-700 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer group/btn"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-[#1E56B0] group-hover/btn:text-[#CCFF00]" />
                            <span>Ver Historial</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setModalChecklistOpen(true);
                            }}
                            className="h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Checklist 25 Pts</span>
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setTipoServicioModal('INSPECCION_TECNICA');
                              setModalSolicitarOpen(true);
                            }}
                            className="text-[11px] font-extrabold text-[#0A1525] hover:text-[#1E56B0] inline-flex items-center gap-1 transition-colors cursor-pointer bg-lime-100 hover:bg-lime-200 px-3 py-1.5 rounded-lg border border-lime-300 shadow-2xs"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-[#0A1525]" />
                            <span>Pedir Inspección Técnica (25 Puntos)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setTipoServicioModal('FALLA');
                              setModalSolicitarOpen(true);
                            }}
                            className="text-[11px] font-bold text-slate-500 hover:text-[#1E56B0] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Wrench className="w-3 h-3 text-slate-400" />
                            <span>Reparación General</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
        )}
      </div>

      </main>

      {/* MODAL 1: CHECKLIST DE 25 PUNTOS DEL VEHÍCULO */}
      <AnimatePresence>
        {modalChecklistOpen && vehiculoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative my-auto space-y-4 max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setModalChecklistOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pr-8 shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <ClipboardCheck className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0A1525]">
                    Expediente Técnico 25 Puntos
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {vehiculoSeleccionado.modelo} • Matrícula {vehiculoSeleccionado.placa}
                  </p>
                </div>
              </div>

              {!vehiculoSeleccionado.checklist25 ? (
                <div className="text-center py-6 px-2 space-y-4 flex-1 flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <AlertTriangle className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-[#0A1525]">
                      Auditoría de 25 Puntos Pendiente
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Este vehículo aún no cuenta con un Expediente Técnico Certificado. Solicita la visita de un mecánico certificado por tan solo <strong>$5.00 USD</strong> para auditar fluidos, frenos, suspensión y escáner.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
                    <span className="font-bold text-[#0A1525] block">Sistemas a certificar:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 font-medium">
                      <span>• Nivel de 7 fluidos vitales</span>
                      <span>• Pastillas y discos de freno</span>
                      <span>• Suspensión y tren delantero</span>
                      <span>• Escáner OBD-II y alternador</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setModalChecklistOpen(false);
                      setModalExpedienteOpen(true);
                    }}
                    className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#0A1525]/10 active:scale-95 transition-all"
                  >
                    <ClipboardCheck className="w-4 h-4 text-[#0A1525]" />
                    <span>Solicitar Expediente Técnico ($5 USD)</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Bento Resumen */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Puntos Evaluados</span>
                      <span className="text-base font-mono font-black text-[#0A1525]">25 / 25 Total</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">Estado General</span>
                      <span className="text-base font-mono font-black text-emerald-800">
                        {vehiculoSeleccionado.checklist25?.puntos_ok ?? 22} OK • {vehiculoSeleccionado.checklist25?.puntos_cambio ?? 3} Atención
                      </span>
                    </div>
                  </div>

                  {/* Lista Rápida de Sistemas Vitales */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    <div className="p-3 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800">1. Fluidos y Aceite de Motor</span>
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OK
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold pt-2 border-t border-slate-100">
                        <span className="text-slate-800">2. Sistema de Frenos</span>
                        <span className="text-amber-700 font-black flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Servicio Realizado
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold pt-2 border-t border-slate-100">
                        <span className="text-slate-800">3. Suspensión y Tren Delantero</span>
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OK
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold pt-2 border-t border-slate-100">
                        <span className="text-slate-800">4. Sistema Eléctrico & Batería</span>
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OK
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                      <span className="font-bold">Acceso Pro Garantizado:</span> Al estar registrado en Mi Garaje, nunca pagarás paywalls para consultar el historial de tus carros.
                    </div>
                  </div>
                </>
              )}

              {/* Footer con Enlace a Vista Detallada */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalChecklistOpen(false)}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cerrar
                </button>
                <Link
                  href={`/historial/${vehiculoSeleccionado.placa}?garaje=true`}
                  className="h-11 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Ver Pasaporte Completo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#CCFF00]" />
                </Link>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: AÑADIR NUEVO VEHÍCULO AL GARAJE */}
      <AnimatePresence>
        {modalNuevoVehiculo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative space-y-4 my-auto max-h-[92dvh] max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalNuevoVehiculo(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0A1525]">
                  Añadir Vehículo a Mi Garaje
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Registra otro automóvil para vincular sus futuros servicios técnicos.
                </p>
              </div>

              <form onSubmit={handleGuardarNuevoVehiculo} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marca <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoMarca}
                    onChange={(e) => setNuevoMarca(e.target.value)}
                    placeholder="Ej. Chevrolet, Toyota, Ford"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Modelo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoModelo}
                    onChange={(e) => setNuevoModelo(e.target.value)}
                    placeholder="Ej. Spark, Hilux, Explorer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Año</label>
                    <input
                      type="number"
                      value={nuevoAnio}
                      onChange={(e) => setNuevoAnio(e.target.value)}
                      placeholder="Ej. 2021"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Placa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoPlaca}
                      onChange={(e) => setNuevoPlaca(e.target.value)}
                      placeholder="Ej. AF789JK"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#1E56B0]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#CCFF00]" />
                  <span>Guardar Vehículo en Garaje</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SERVICIOS ACTIVOS Y SEGUIMIENTO EN VIVO */}
      <AnimatePresence>
        {modalServiciosActivosOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden space-y-4"
            >
              {/* Botón Cerrar Pinned */}
              <button
                type="button"
                onClick={() => setModalServiciosActivosOpen(false)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3 pr-8 shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Activity className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Tus Servicios en TuTallerMóvil
                    </h3>
                    {serviciosActivos.length > 0 && (
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#CCFF00] text-[#0A1525] px-2.5 py-0.5 rounded-full shadow-2xs">
                        ● {serviciosActivos.length} Activo{serviciosActivos.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Seguimiento en vivo, estatus operativo y asignación de especialistas
                  </p>
                </div>
              </div>

              {/* Pestañas de Filtrado */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setTabServiciosModal('activos')}
                  className={`py-2 px-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tabServiciosModal === 'activos'
                      ? 'bg-white text-[#0A1525] shadow-xs'
                      : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>En Curso ({serviciosActivos.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTabServiciosModal('historial')}
                  className={`py-2 px-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tabServiciosModal === 'historial'
                      ? 'bg-white text-[#0A1525] shadow-xs'
                      : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Historial Pasado ({serviciosHistorial.length})</span>
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {tabServiciosModal === 'activos' ? (
                  serviciosActivos.length === 0 ? (
                    <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-[#1E56B0]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#0A1525]">
                          No tienes servicios en curso en este momento
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Todos tus servicios anteriores han sido completados o archivados. ¿Necesitas un mecánico hoy?
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModalServiciosActivosOpen(false);
                          setModalSolicitarOpen(true);
                        }}
                        className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Wrench className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Solicitar Mecánico Ahora</span>
                      </button>
                    </div>
                  ) : (
                    serviciosActivos.map((ord) => {
                      const badge = getEstadoBadge(ord.estado);
                      return (
                        <div
                          key={ord.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#1E56B0] transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
                                  <span>{badge.label}</span>
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  #{ord.id.slice(0, 8)}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-[#0A1525] pt-1 truncate">
                                {ord.vehiculo_modelo || 'Vehículo Particular'}
                              </h4>
                              {ord.vehiculo_placa && (
                                <span className="font-mono text-xs font-extrabold text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                                  {ord.vehiculo_placa}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/cliente/servicio/${ord.id}`}
                              className="h-10 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 border border-[#0A1525]/10"
                            >
                              <span>Seguimiento</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-bold text-slate-700">Falla / Servicio:</span>
                              {ord.created_at && (
                                <span className="font-mono">{new Date(ord.created_at).toLocaleDateString('es-VE')}</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 font-medium">
                              {ord.falla_reportada || 'Servicio técnico a domicilio'}
                            </p>
                            {ord.sector && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                Ubicación: <strong className="text-slate-800">{ord.sector}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  serviciosHistorial.length === 0 ? (
                    <div className="p-8 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">
                        No hay servicios archivados o finalizados aún.
                      </p>
                    </div>
                  ) : (
                    serviciosHistorial.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Finalizado / Garantía 90 Días
                            </span>
                            <h4 className="text-xs font-black text-[#0A1525] pt-1">
                              {ord.vehiculo_modelo} {ord.vehiculo_placa ? `[${ord.vehiculo_placa}]` : ''}
                            </h4>
                          </div>
                          <Link
                            href={`/cliente/servicio/${ord.id}`}
                            className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                          >
                            <span>Ver Detalles</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        </div>
                        <p className="text-xs text-slate-600">
                          {ord.falla_reportada}
                        </p>
                      </div>
                    ))
                  )
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <button
                  type="button"
                  onClick={() => recargarOrdenes()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E56B0] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Actualizar estado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalServiciosActivosOpen(false)}
                  className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Solicitud de Mecánico como Invitado o Cliente */}
      <SolicitarMecanicoModal
        open={modalSolicitarOpen}
        onOpenChange={setModalSolicitarOpen}
        initialTipoServicio={tipoServicioModal}
        initialVehiculo={
          vehiculoSeleccionado
            ? {
                marca: vehiculoSeleccionado.marca,
                modelo: vehiculoSeleccionado.modelo,
                anio: vehiculoSeleccionado.anio,
                placa: vehiculoSeleccionado.placa,
                falla: tipoServicioModal === 'INSPECCION_TECNICA' ? 'Inspección Técnica Certificada de 25 Puntos' : ''
              }
            : undefined
        }
        initialCliente={{
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono
        }}
        vehiculosRegistrados={vehiculos}
        onSuccessToast={() => recargarOrdenes()}
        onVehiculoCreado={(nuevo) => {
          setVehiculos((prev) => {
            if (prev.some((v) => v.placa === nuevo.placa)) return prev;
            return [
              ...prev,
              {
                id: nuevo.id || `veh_${Date.now()}`,
                marca: nuevo.marca,
                modelo: nuevo.modelo,
                anio: Number(nuevo.anio) || 2022,
                placa: nuevo.placa,
                kilometraje: 0,
                ultimoServicio: 'Sin servicios aún',
                tipoUltimoServicio: 'Registro inicial en Mi Garaje',
                estadoSalud: 'pendiente',
                fotoUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
                checklist25: null
              }
            ];
          });
        }}
      />

      {/* Modal de Expediente Técnico de 25 Puntos ($5 USD) */}
      {vehiculoSeleccionado && (
        <SolicitarExpedienteModal
          open={modalExpedienteOpen}
          onOpenChange={setModalExpedienteOpen}
          vehiculo={{
            marca: vehiculoSeleccionado.marca,
            modelo: vehiculoSeleccionado.modelo,
            anio: vehiculoSeleccionado.anio,
            placa: vehiculoSeleccionado.placa,
            color: vehiculoSeleccionado.color
          }}
          cliente={{
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono
          }}
          onSuccess={() => {
            // Actualizar estado del vehículo si se desea
          }}
        />
      )}

      {/* Botón Flotante Soporte WhatsApp */}
      <BotonSoporteWhatsApp 
        modo="fab"
        mensaje="Hola, necesito ayuda con mi garaje o servicio en TuTallerMóvil"
      />

    </div>
  );
}
