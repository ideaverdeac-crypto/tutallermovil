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
  X
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
import { SolicitarExpedienteModal } from '@/components/SolicitarExpedienteModal';
import WidgetChatCliente from '@/components/WidgetChatCliente';

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

export default function ClienteDashboardPage() {
  const router = useRouter();

  // Estados de usuario
  const [usuario, setUsuario] = useState<{
    nombre: string;
    email: string;
    telefono?: string;
  }>({
    nombre: 'María Rodríguez',
    email: 'maria.rodriguez@tutallermovil.com',
    telefono: '+58 412 123 4567'
  });

  const [vehiculos, setVehiculos] = useState<VehiculoGaraje[]>(VEHICULOS_DEFAULT);
  const [cargando, setCargando] = useState<boolean>(true);

  // Modales
  const [modalSolicitarOpen, setModalSolicitarOpen] = useState(false);
  const [modalChecklistOpen, setModalChecklistOpen] = useState(false);
  const [modalExpedienteOpen, setModalExpedienteOpen] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<VehiculoGaraje | null>(null);

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

        let emailUsuario = 'maria.rodriguez@tutallermovil.com';
        let nombreUsuario = 'María Rodríguez';
        let telefonoUsuario = '+58 412 123 4567';

        if (user) {
          emailUsuario = user.email || emailUsuario;
          nombreUsuario = user.user_metadata?.nombre || emailUsuario.split('@')[0];
          telefonoUsuario = user.user_metadata?.telefono || telefonoUsuario;
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

        // 1. Consultar vehículos en Supabase asociados al email o teléfono del cliente
        const { data: vehiculosData } = await supabase
          .from('vehiculos')
          .select('*')
          .or(`cliente_email.ilike.%${emailUsuario}%,cliente_telefono.eq.${telefonoUsuario}`);

        // 2. Consultar órdenes de servicio previas asociadas al correo (para vincular servicios pedidos como invitado)
        const { data: ordenesData } = await supabase
          .from('ordenes')
          .select('*')
          .ilike('cliente_email', emailUsuario);

        const mapaVehiculos = new Map<string, VehiculoGaraje>();

        // Incorporar vehículos registrados en la tabla 'vehiculos'
        if (vehiculosData && vehiculosData.length > 0) {
          vehiculosData.forEach((v: any) => {
            const placa = (v.placa || 'PLACA').toUpperCase().trim();
            const tieneChecklist = Boolean(v.checklist_json || v.checklist25);
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
              checklist25: v.checklist_json || v.checklist25 || null
            });
          });
        }

        // Incorporar vehículos de órdenes previas de invitado que coincidan con su correo
        if (ordenesData && ordenesData.length > 0) {
          ordenesData.forEach((ord: any) => {
            const placaOrd = (
              ord.placa_flota ||
              ord.vehiculo_modelo?.match(/\[([A-Z0-9-]+)\]/)?.[1] ||
              `ORD-${ord.id.slice(0, 5).toUpperCase()}`
            ).toUpperCase().trim();

            if (!mapaVehiculos.has(placaOrd)) {
              mapaVehiculos.set(placaOrd, {
                id: `veh_ord_${ord.id}`,
                marca: ord.vehiculo_marca || 'Automóvil',
                modelo: ord.vehiculo_modelo?.replace(/\[.*?\]/, '').trim() || 'Vehículo Particular',
                anio: ord.vehiculo_anio || 2020,
                placa: placaOrd,
                kilometraje: ord.kilometraje_actual || 85400,
                ultimoServicio: ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-VE') : 'Reciente',
                tipoUltimoServicio: ord.falla_reportada || 'Servicio Técnico TuTallerMóvil',
                estadoSalud: ord.diagnostico_json?.frenos === 'requiere_cambio' ? 'atencion' : 'optimo',
                fotoUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
                checklist25: ord.diagnostico_json || {
                  puntos_ok: 22,
                  puntos_cambio: 3,
                  frenos: 'requiere_cambio',
                  aceite: 'ok',
                  suspension: 'ok',
                  electrico: 'ok'
                }
              });
            }
          });
        }

        const listaFinal = Array.from(mapaVehiculos.values());

        if (listaFinal.length > 0) {
          setVehiculos(listaFinal);
        } else {
          // Si es cuenta demo o precargada, mostrar vehículos demo
          if (emailUsuario.includes('demo') || emailUsuario.includes('maria')) {
            setVehiculos(VEHICULOS_DEFAULT);
          } else {
            // Verificar localStorage
            if (typeof window !== 'undefined') {
              const garajeLocal = localStorage.getItem('ttm_garaje_vehiculos');
              if (garajeLocal) {
                try {
                  const parseLocal = JSON.parse(garajeLocal);
                  if (parseLocal && parseLocal.length > 0) {
                    setVehiculos(parseLocal);
                    return;
                  }
                } catch (e) {}
              }
            }
            // Usuario nuevo sin vehículos registrados: estado vacío para registrar
            setVehiculos([]);
          }
        }

      } catch (err) {
        console.warn('Cargando garaje con configuración por defecto:', err);
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModalSolicitarOpen(true)}
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
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Vehículos</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-[#CCFF00]">
                  {vehiculos.length}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Inspecciones</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">
                  25 Pts
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Garantía QA</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                  90 Días
                </span>
              </div>
            </div>
          </div>
        </div>

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
                  Aún no tienes vehículos en tu Garaje
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
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setModalSolicitarOpen(true);
                            }}
                            className="h-11 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Wrench className="w-3.5 h-3.5 text-[#CCFF00]" />
                            <span className="truncate">Pide tu primer servicio</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setModalExpedienteOpen(true);
                            }}
                            className="h-11 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 border border-[#0A1525]/10"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-[#0A1525]" />
                            <span className="truncate">Abrir Expediente ($5)</span>
                          </button>
                        </div>

                        <div className="text-center pt-1">
                          <Link
                            href={`/historial/${v.placa}?garaje=true`}
                            className="text-[11px] font-bold text-slate-500 hover:text-[#1E56B0] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Ver Ficha e Historial en Cero</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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

                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setVehiculoSeleccionado(v);
                              setModalSolicitarOpen(true);
                            }}
                            className="text-[11px] font-bold text-slate-500 hover:text-[#1E56B0] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Wrench className="w-3 h-3 text-[#1E56B0]" />
                            <span>Solicitar Nuevo Servicio para este Carro</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative my-auto space-y-4 max-h-[90vh] flex flex-col"
            >
              <button
                type="button"
                onClick={() => setModalChecklistOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer z-10"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative space-y-4"
            >
              <button
                type="button"
                onClick={() => setModalNuevoVehiculo(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
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

      {/* Modal de Solicitud de Mecánico como Invitado o Cliente */}
      <SolicitarMecanicoModal
        open={modalSolicitarOpen}
        onOpenChange={setModalSolicitarOpen}
        initialVehiculo={
          vehiculoSeleccionado
            ? {
                marca: vehiculoSeleccionado.marca,
                modelo: vehiculoSeleccionado.modelo,
                anio: vehiculoSeleccionado.anio,
                placa: vehiculoSeleccionado.placa
              }
            : undefined
        }
        initialCliente={{
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono
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

      {/* Widget de Chat en Vivo con la Operadora Central (Andrea Silva) */}
      <WidgetChatCliente
        cliente={{
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono
        }}
        placaActiva={vehiculoSeleccionado?.placa || vehiculos[0]?.placa || 'AB123CD'}
        vehiculoInfo={
          vehiculoSeleccionado
            ? `${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo} (${vehiculoSeleccionado.anio})`
            : vehiculos[0]
            ? `${vehiculos[0].marca} ${vehiculos[0].modelo} (${vehiculos[0].anio})`
            : 'Vehículo en Garaje'
        }
      />

    </div>
  );
}
