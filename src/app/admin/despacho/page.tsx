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
  BadgeCheck
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

// Cálculo de SLA (Tiempo Restante de Respuesta objetivo 45 min)
function calcularSLA(createdAt?: string): { texto: string; critico: boolean } {
  if (!createdAt) return { texto: '⏱ 45 min', critico: false };
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const transcurridoMin = Math.floor(diffMs / 60000);
  const restanteMin = 45 - transcurridoMin;

  if (restanteMin <= 0) {
    return {
      texto: `⏱ Vencido hace ${Math.abs(restanteMin)}m`,
      critico: true
    };
  }

  return {
    texto: `⏱ ${restanteMin} min`,
    critico: restanteMin < 15
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
      .channel('admin_despacho_realtime_2027')
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

  // 3. Flujo de Acción Rápida: Mover Orden al Siguiente Estado
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

  const handleSeleccionarMecanico = async (mecanico: typeof MECANICOS_DISPONIBLES[0]) => {
    if (!ordenParaAsignar) return;
    await moverOrden(ordenParaAsignar.id, 'ASIGNADO', mecanico.id);
    setModalAsignarOpen(false);
    setOrdenParaAsignar(null);
  };

  // Filtros de Columnas
  const leadsNuevos = ordenes.filter(
    (o) => o.estado === 'LEAD_NUEVO' || o.estado === 'DISPONIBLE'
  );
  const enDiagnostico = ordenes.filter((o) => o.estado === 'DIAGNOSTICO_AGENDADO');
  const asignados = ordenes.filter((o) => o.estado === 'ASIGNADO');
  const enEjecucion = ordenes.filter(
    (o) => o.estado === 'EN_EJECUCION' || o.estado === 'EN_SERVICIO'
  );

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col relative z-10">
        
        {/* Título de Sección y Contadores */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0A1525] tracking-tight flex items-center gap-2">
              <Kanban className="w-6 h-6 text-[#1E56B0]" />
              Tablero Operativo de Despacho
            </h1>
            <p className="text-xs text-[#475569] font-medium">
              Gestión de flujo de trabajo en tiempo real con SLA y cálculo dinámico de exoneración.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
            <span>En gestión activa:</span>
            <span className="bg-[#1E56B0] text-white px-2.5 py-0.5 rounded-full font-mono font-black text-xs shadow-2xs">
              {ordenes.length} órdenes
            </span>
          </div>
        </div>

        {/* 1. Estructura del Tablero: Contenedor con scroll horizontal suave */}
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-[1100px] items-start">
            
            {/* ======================================================== */}
            {/* COLUMNA 1: LEAD_NUEVO */}
            {/* ======================================================== */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-50/80 border border-[#E2E8F0] rounded-3xl flex flex-col shadow-xs overflow-hidden max-h-[calc(100vh-210px)]">
              {/* Cabecera Sticky Glassmorphism */}
              <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    1. NUEVOS LEADS
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-[#E2E8F0] text-[#0A1525] px-2.5 py-0.5 rounded-full">
                  {leadsNuevos.length}
                </span>
              </div>

              {/* Zona de Drop/Tarjetas con gap-3 y padding */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {leadsNuevos.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#475569] font-medium">
                    Sin nuevos leads por ahora
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
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-3"
                      >
                        {/* Arriba: Vehículo en negrita y Nombre del Cliente */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-[#0A1525] tracking-tight leading-snug">
                              {vehiculo}
                            </h3>
                            <p className="text-xs font-semibold text-[#475569]">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </p>
                          </div>

                          {/* SLA Chip Dinámico */}
                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                              sla.critico
                                ? 'bg-[#FEE2E2] text-rose-700'
                                : 'bg-[#F0FDF4] text-emerald-700'
                            }`}
                          >
                            {sla.texto}
                          </span>
                        </div>

                        {/* Medio: Falla Reportada (truncada) */}
                        <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                          {orden.falla_reportada}
                        </p>

                        {/* Abajo: Sector y Botón Circular de Acción Rápida */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] text-[#475569] font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{orden.sector}</span>
                          </div>

                          {/* Botón Circular: fondo #1E56B0, hover #CCFF00 */}
                          <motion.button
                            type="button"
                            disabled={isUpdating}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => moverOrden(orden.id, 'DIAGNOSTICO_AGENDADO')}
                            className="w-8 h-8 rounded-full bg-[#1E56B0] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                            title="Mover a Diagnóstico"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* COLUMNA 2: DIAGNOSTICO_AGENDADO */}
            {/* ======================================================== */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-50/80 border border-[#E2E8F0] rounded-3xl flex flex-col shadow-xs overflow-hidden max-h-[calc(100vh-210px)]">
              {/* Cabecera Sticky Glassmorphism (Puntito Azul) */}
              <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E56B0]"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    2. DIAGNÓSTICO
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-[#E2E8F0] text-[#0A1525] px-2.5 py-0.5 rounded-full">
                  {enDiagnostico.length}
                </span>
              </div>

              {/* Zona de Drop/Tarjetas */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {enDiagnostico.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#475569] font-medium">
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
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-3"
                      >
                        {/* Arriba: Vehículo y Nombre */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-[#0A1525] tracking-tight leading-snug">
                              {vehiculo}
                            </h3>
                            <p className="text-xs font-semibold text-[#475569]">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                              sla.critico
                                ? 'bg-[#FEE2E2] text-rose-700'
                                : 'bg-[#F0FDF4] text-emerald-700'
                            }`}
                          >
                            {sla.texto}
                          </span>
                        </div>

                        {/* Medio: Falla */}
                        <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                          {orden.falla_reportada}
                        </p>

                        {/* Abajo: Sector, Botón Asignar y Botón Circular */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOrdenParaAsignar(orden);
                              setModalAsignarOpen(true);
                            }}
                            className="text-[11px] font-black text-[#1E56B0] hover:text-[#0A1525] bg-blue-50 hover:bg-[#CCFF00] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + Asignar
                          </button>

                          <div className="flex items-center gap-1.5">
                            <div className="text-[10px] text-[#475569] font-medium hidden sm:block">
                              {orden.sector}
                            </div>
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setOrdenParaAsignar(orden);
                                setModalAsignarOpen(true);
                              }}
                              className="w-8 h-8 rounded-full bg-[#1E56B0] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                              title="Asignar y avanzar"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* COLUMNA 3: ASIGNADOS */}
            {/* ======================================================== */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-50/80 border border-[#E2E8F0] rounded-3xl flex flex-col shadow-xs overflow-hidden max-h-[calc(100vh-210px)]">
              {/* Cabecera Sticky Glassmorphism (Puntito Púrpura) */}
              <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    3. ASIGNADOS
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-[#E2E8F0] text-[#0A1525] px-2.5 py-0.5 rounded-full">
                  {asignados.length}
                </span>
              </div>

              {/* Zona de Drop/Tarjetas */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {asignados.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#475569] font-medium">
                    Sin técnicos en ruta
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
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-3"
                      >
                        {/* Arriba: Vehículo y Estado */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-[#0A1525] tracking-tight leading-snug">
                              {vehiculo}
                            </h3>
                            <p className="text-xs font-semibold text-[#475569]">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </p>
                          </div>

                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            En Ruta
                          </span>
                        </div>

                        {/* Técnico Asignado */}
                        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0A1525] flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#1E56B0]" />
                            Carlos Mendoza
                          </span>
                          <span className="font-mono text-[10px] text-[#475569] font-semibold">
                            #TTM-0842
                          </span>
                        </div>

                        {/* Abajo: Sector y Botón Circular */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] text-[#475569] font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{orden.sector}</span>
                          </div>

                          <motion.button
                            type="button"
                            disabled={isUpdating}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => moverOrden(orden.id, 'EN_EJECUCION')}
                            className="w-8 h-8 rounded-full bg-[#1E56B0] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                            title="Iniciar Ejecución"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* COLUMNA 4: EN_EJECUCION */}
            {/* ======================================================== */}
            <div className="w-72 sm:w-80 shrink-0 bg-slate-50/80 border border-[#E2E8F0] rounded-3xl flex flex-col shadow-xs overflow-hidden max-h-[calc(100vh-210px)]">
              {/* Cabecera Sticky Glassmorphism (Puntito Verde Esmeralda) */}
              <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#0A1525]">
                    4. EN EJECUCIÓN
                  </h2>
                </div>
                <span className="font-mono text-xs font-black bg-[#E2E8F0] text-[#0A1525] px-2.5 py-0.5 rounded-full">
                  {enEjecucion.length}
                </span>
              </div>

              {/* Zona de Drop/Tarjetas */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {enEjecucion.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#475569] font-medium">
                    Sin servicios activos en sitio
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
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border-2 border-emerald-300 p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-3"
                      >
                        {/* Arriba: Vehículo y Badge Activo */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-[#0A1525] tracking-tight leading-snug">
                              {vehiculo}
                            </h3>
                            <p className="text-xs font-semibold text-[#475569]">
                              {orden.cliente_nombre || 'Cliente Particular'}
                            </p>
                          </div>

                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                            Activo
                          </span>
                        </div>

                        {/* Medio: Falla */}
                        <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                          {orden.falla_reportada}
                        </p>

                        {/* Abajo: Enlace al Carnet y Acción Cotizar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            href="/carnet/TTM-0842"
                            target="_blank"
                            className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1"
                          >
                            <span>Ver Carnet</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setModalCotizadorOpen(true)}
                            className="h-8 px-3 rounded-full bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] text-xs font-extrabold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Cotizar</span>
                          </motion.button>
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

    </div>
  );
}
