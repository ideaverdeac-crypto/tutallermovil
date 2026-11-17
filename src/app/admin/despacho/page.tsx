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
  PlusCircle,
  ExternalLink,
  DollarSign
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

// Lista simulada de mecánicos disponibles para asignación
const MECANICOS_DISPONIBLES = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nombre: 'Carlos Mendoza',
    credencial: '#TTM-0842',
    especialidad: 'Especialista Senior (OBD2 & Inyección)',
    unidad: 'Moto Yamaha FZ • AB123CD',
    rating: '4.9 ★'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    nombre: 'Alejandro Blanco',
    credencial: '#TTM-0912',
    especialidad: 'Mecánica Ligera & Frenos',
    unidad: 'Moto Suzuki GN • AC456DF',
    rating: '4.95 ★'
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    nombre: 'Roberto Páez',
    credencial: '#TTM-0341',
    especialidad: 'Electricidad Automotriz & Baterías',
    unidad: 'Moto Bera SBR • AE789GH',
    rating: '4.8 ★'
  }
];

// Cálculo de tiempo SLA
function calcularSLA(createdAt?: string): { texto: string; urgente: boolean } {
  if (!createdAt) return { texto: 'Reciente', urgente: false };
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return { texto: 'Hace instantes', urgente: false };
  if (diffMin < 60) {
    return {
      texto: `SLA: ${diffMin} min`,
      urgente: diffMin > 35
    };
  }
  const horas = Math.floor(diffMin / 60);
  return {
    texto: `SLA: ${horas}h ${diffMin % 60}m`,
    urgente: true
  };
}

export default function TableroDespachoPage() {
  const [ordenes, setOrdenes] = useState<OrdenKanban[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  // Estados de Modales
  const [modalCotizadorOpen, setModalCotizadorOpen] = useState(false);
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [ordenParaAsignar, setOrdenParaAsignar] = useState<OrdenKanban | null>(null);

  // Estado del Cotizador
  const [manoDeObra, setManoDeObra] = useState<string>('');
  const [repuestos, setRepuestos] = useState<string>('');

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
      .channel('admin_despacho_realtime')
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

  // 3. Mover Orden a Nuevo Estado
  const moverOrden = async (ordenId: string, nuevoEstado: string, mecanicoId?: string) => {
    setActualizandoId(ordenId);
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
      } else {
        // Actualizar estado local inmediatamente
        setOrdenes((prev) =>
          prev.map((ord) =>
            ord.id === ordenId
              ? { ...ord, estado: nuevoEstado, ...(mecanicoId ? { mecanico_id: mecanicoId } : {}) }
              : ord
          )
        );
      }
    } catch (err) {
      console.error('Excepción al mover orden:', err);
    } finally {
      setActualizandoId(null);
    }
  };

  // Asignar Mecánico Seleccionado
  const handleSeleccionarMecanico = async (mecanico: typeof MECANICOS_DISPONIBLES[0]) => {
    if (!ordenParaAsignar) return;
    await moverOrden(ordenParaAsignar.id, 'ASIGNADO', mecanico.id);
    setModalAsignarOpen(false);
    setOrdenParaAsignar(null);
  };

  // Filtros por Columna
  // Columna 1: '1. NUEVOS LEADS' (Acepta LEAD_NUEVO y DISPONIBLE para retrocompatibilidad)
  const leadsNuevos = ordenes.filter(
    (o) => o.estado === 'LEAD_NUEVO' || o.estado === 'DISPONIBLE'
  );

  // Columna 2: '2. DIAGNÓSTICO'
  const enDiagnostico = ordenes.filter((o) => o.estado === 'DIAGNOSTICO_AGENDADO');

  // Columna 3: '3. ASIGNADOS'
  const asignados = ordenes.filter((o) => o.estado === 'ASIGNADO');

  // Columna 4: '4. EN EJECUCIÓN'
  const enEjecucion = ordenes.filter(
    (o) => o.estado === 'EN_EJECUCION' || o.estado === 'EN_SERVICIO'
  );

  // 4. Lógica del Cotizador (Regla P0)
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* 1. Header Superior de Control */}
      <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center text-slate-500 hover:text-[#0A1525] hover:bg-slate-50 transition-colors"
              title="Volver a la Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#0A1525]">TTM</span>
              <span className="text-xs font-extrabold uppercase tracking-wider bg-[#0A1525] text-[#CCFF00] px-2.5 py-0.5 rounded">
                Torre de Despacho
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón Cotizador P0 */}
            <button
              type="button"
              onClick={() => setModalCotizadorOpen(true)}
              className="h-10 px-4 text-xs font-extrabold bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-[#0A1525]/15"
            >
              <Calculator className="w-4 h-4 text-[#0A1525]" />
              <span>Cotizar Orden</span>
            </button>

            {/* Estado de sincronización en vivo */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Realtime Activo</span>
            </span>

            <button
              type="button"
              onClick={cargarOrdenes}
              className="p-2 rounded-lg border border-[#CBD5E1] text-slate-600 hover:bg-slate-50 transition-colors"
              title="Recargar órdenes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        
        {/* Título y Resumen del Flujo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0A1525] tracking-tight flex items-center gap-2">
              <Kanban className="w-6 h-6 text-[#1E56B0]" />
              Tablero de Despacho Operativo
            </h1>
            <p className="text-xs text-slate-500">
              Mueve y asigna órdenes en vivo. Los cambios se sincronizan en los teléfonos de los aliados al instante.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">Total en cola:</span>
            <span className="bg-[#1E56B0] text-white px-2 py-0.5 rounded-md font-mono">
              {ordenes.length} órdenes
            </span>
          </div>
        </div>

        {/* 1. Contenedor con Scroll Horizontal para las 4 Columnas */}
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-[1060px] items-start">
            
            {/* COLUMNA 1: NUEVOS LEADS */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-100/70 border border-[#CBD5E1] rounded-2xl p-3 flex flex-col max-h-[calc(100vh-220px)]">
              {/* Cabecera de Columna */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 mb-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    1. NUEVOS LEADS
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-blue-50 text-[#1E56B0] border border-blue-200 px-2 py-0.5 rounded-full">
                  {leadsNuevos.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {leadsNuevos.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No hay nuevos leads
                  </div>
                ) : (
                  leadsNuevos.map((orden) => {
                    const sla = calcularSLA(orden.created_at);
                    const vehiculo =
                      [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                        .filter(Boolean)
                        .join(' ') || orden.vehiculo_modelo;
                    const isUpdating = actualizandoId === orden.id;

                    return (
                      <motion.div
                        key={orden.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#CBD5E1] hover:border-[#1E56B0] rounded-xl p-4 shadow-sm space-y-3 transition-all"
                      >
                        {/* Header Tarjeta: Cliente y SLA */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-extrabold text-[#0A1525] block leading-tight">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                              <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                              {vehiculo}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                              sla.urgente
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {sla.texto}
                          </span>
                        </div>

                        {/* Falla y Sector */}
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold text-slate-700 line-clamp-2">
                            {orden.falla_reportada}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{orden.sector}</span>
                          </div>
                        </div>

                        {/* Botón de Acción -> A Diagnóstico */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            #{orden.id.slice(0, 6).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => moverOrden(orden.id, 'DIAGNOSTICO_AGENDADO')}
                            className="h-8 px-3 text-xs font-extrabold bg-blue-50 hover:bg-[#1E56B0] text-[#1E56B0] hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                            title="Agendar para diagnóstico"
                          >
                            <span>A Diagnóstico</span>
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMNA 2: DIAGNÓSTICO */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-100/70 border border-[#CBD5E1] rounded-2xl p-3 flex flex-col max-h-[calc(100vh-220px)]">
              {/* Cabecera de Columna */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 mb-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    2. DIAGNÓSTICO
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  {enDiagnostico.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {enDiagnostico.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Sin órdenes en diagnóstico
                  </div>
                ) : (
                  enDiagnostico.map((orden) => {
                    const sla = calcularSLA(orden.created_at);
                    const vehiculo =
                      [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                        .filter(Boolean)
                        .join(' ') || orden.vehiculo_modelo;

                    return (
                      <motion.div
                        key={orden.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#CBD5E1] hover:border-amber-400 rounded-xl p-4 shadow-sm space-y-3 transition-all"
                      >
                        {/* Header Tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-extrabold text-[#0A1525] block leading-tight">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                              <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                              {vehiculo}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            Diagnóstico $15
                          </span>
                        </div>

                        {/* Falla y Sector */}
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold text-slate-700 line-clamp-2">
                            {orden.falla_reportada}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{orden.sector}</span>
                          </div>
                        </div>

                        {/* Botón de Asignar Mecánico */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            #{orden.id.slice(0, 6).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setOrdenParaAsignar(orden);
                              setModalAsignarOpen(true);
                            }}
                            className="h-8 px-3 text-xs font-extrabold bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-[#0A1525]/15 shadow-2xs"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#0A1525]" />
                            <span>Asignar Mecánico</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMNA 3: ASIGNADOS */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-100/70 border border-[#CBD5E1] rounded-2xl p-3 flex flex-col max-h-[calc(100vh-220px)]">
              {/* Cabecera de Columna */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 mb-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    3. ASIGNADOS
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                  {asignados.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {asignados.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No hay mecánicos asignados en ruta
                  </div>
                ) : (
                  asignados.map((orden) => {
                    const vehiculo =
                      [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                        .filter(Boolean)
                        .join(' ') || orden.vehiculo_modelo;
                    const isUpdating = actualizandoId === orden.id;

                    return (
                      <motion.div
                        key={orden.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm space-y-3 transition-all"
                      >
                        {/* Header Tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-extrabold text-[#0A1525] block leading-tight">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                              <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                              {vehiculo}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            En Ruta
                          </span>
                        </div>

                        {/* Asignación y Mecánico */}
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-[#0A1525]">
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-[#1E56B0]" />
                              Carlos Mendoza
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">#TTM-0842</span>
                          </div>
                          <p className="text-[11px] text-slate-500">Moto Yamaha FZ • AB123CD</p>
                        </div>

                        {/* Botón Iniciar Ejecución */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            href="/carnet/TTM-0842"
                            target="_blank"
                            className="text-[11px] font-bold text-[#1E56B0] hover:underline flex items-center gap-0.5"
                          >
                            <span>Ver Carnet</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => moverOrden(orden.id, 'EN_EJECUCION')}
                            className="h-8 px-3 text-xs font-extrabold bg-[#1E56B0] hover:bg-[#15428a] text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>En Ejecución</span>
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMNA 4: EN EJECUCIÓN */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-100/70 border border-[#CBD5E1] rounded-2xl p-3 flex flex-col max-h-[calc(100vh-220px)]">
              {/* Cabecera de Columna */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 mb-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    4. EN EJECUCIÓN
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {enEjecucion.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {enEjecucion.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No hay servicios en intervención activa
                  </div>
                ) : (
                  enEjecucion.map((orden) => {
                    const vehiculo =
                      [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                        .filter(Boolean)
                        .join(' ') || orden.vehiculo_modelo;

                    return (
                      <motion.div
                        key={orden.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-emerald-300 rounded-xl p-4 shadow-sm space-y-3 transition-all"
                      >
                        {/* Header Tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-extrabold text-[#0A1525] block leading-tight">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                              <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                              {vehiculo}
                            </span>
                          </div>

                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                            Activo
                          </span>
                        </div>

                        {/* Falla y Sector */}
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold text-slate-700">{orden.falla_reportada}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{orden.sector}</span>
                          </div>
                        </div>

                        {/* Footer de Tarjeta Activa */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            En intervención
                          </span>

                          <button
                            type="button"
                            onClick={() => setModalCotizadorOpen(true)}
                            className="h-8 px-2.5 text-xs font-bold text-[#1E56B0] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Cotizar</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* 4. MODAL DEL COTIZADOR (Regla P0 de Diagnóstico Exonerado) */}
      <AnimatePresence>
        {modalCotizadorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl border-2 border-[#CBD5E1] shadow-2xl p-6 relative overflow-hidden space-y-5"
            >
              {/* Barra superior de acento */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#CCFF00]" />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Cotizador de Servicio
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Regla P0: Diagnóstico exonerado en reparaciones &gt; $40
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalCotizadorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-[#0A1525] rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario simple */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A1525] mb-1.5">
                    Mano de Obra ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={manoDeObra}
                      onChange={(e) => setManoDeObra(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 text-base font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A1525] mb-1.5">
                    Repuestos ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={repuestos}
                      onChange={(e) => setRepuestos(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 pl-8 pr-3 text-base font-bold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Desglose y Regla de Negocio P0 */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Mano de obra + Repuestos:</span>
                  <span className="font-bold text-[#0A1525] font-mono">
                    ${subtotalServicio.toFixed(2)} USD
                  </span>
                </div>

                {/* Badge Dinámico de Regla de Negocio */}
                {subtotalServicio > 0 && (
                  <div className="pt-1">
                    {exoneraDiagnostico ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ✓ Diagnóstico Exonerado (-$15)
                        </span>
                        <span className="text-emerald-700 line-through font-mono">$15.00</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Cobro de Diagnóstico: +$15
                        </span>
                        <span className="font-mono font-black">+$15.00</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-[#CBD5E1] flex justify-between items-center">
                  <span className="text-sm font-extrabold text-[#0A1525]">Total a Facturar:</span>
                  <span className="text-2xl font-black text-[#1E56B0] font-mono">
                    ${totalCotizacion.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Acciones del Modal */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Presupuesto TuTallerMóvil: Subtotal $${subtotalServicio.toFixed(2)} | ${
                        exoneraDiagnostico ? 'Diagnóstico GRATIS' : 'Diagnóstico $15'
                      } | Total: $${totalCotizacion.toFixed(2)} USD`
                    );
                    alert('¡Resumen copiado al portapapeles!');
                  }}
                  className="flex-1 h-11 text-xs font-bold bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 border border-[#CBD5E1] rounded-xl transition-colors cursor-pointer"
                >
                  Copiar Resumen
                </button>
                <button
                  type="button"
                  onClick={() => setModalCotizadorOpen(false)}
                  className="flex-1 h-11 text-xs font-black bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-colors cursor-pointer border border-[#0A1525]/10"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MODAL DE ASIGNAR MECÁNICO (Simulado) */}
      <AnimatePresence>
        {modalAsignarOpen && ordenParaAsignar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white rounded-3xl border-2 border-[#CBD5E1] shadow-2xl p-6 relative overflow-hidden space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#1E56B0] text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Asignar Especialista TTM
                    </h2>
                    <p className="text-xs text-slate-500">
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
                  className="p-1.5 text-slate-400 hover:text-[#0A1525] rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Mecánicos Disponibles en Caracas
                </span>

                {MECANICOS_DISPONIBLES.map((mec) => (
                  <div
                    key={mec.id}
                    className="p-3.5 rounded-2xl border-2 border-[#CBD5E1] hover:border-[#1E56B0] bg-[#F8FAFC] hover:bg-blue-50/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#0A1525]">{mec.nombre}</span>
                        <span className="font-mono text-[10px] font-black text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {mec.credencial}
                        </span>
                        <span className="text-[11px] font-bold text-amber-600">{mec.rating}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{mec.especialidad}</p>
                      <p className="text-[11px] text-slate-400">{mec.unidad}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSeleccionarMecanico(mec)}
                      className="h-10 px-4 text-xs font-black bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-all shadow-xs cursor-pointer border border-[#0A1525]/15 shrink-0"
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
                  className="text-xs text-slate-500 hover:text-[#0A1525] font-bold"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
