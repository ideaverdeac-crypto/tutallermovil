'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  Check,
  Package,
  Store,
  DollarSign,
  Clock,
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';

interface OrdenRunner {
  id: string;
  cliente_nombre: string;
  vehiculo_modelo: string;
  falla_reportada: string;
  sector: string;
  estado: string;
  ganancia_estimada?: number | string;
  created_at?: string;
  // Campos complementarios del Runner
  mayorista_nombre?: string;
  mayorista_direccion?: string;
  repuestos_lista?: string[];
  mecanico_nombre?: string;
  mecanico_telefono?: string;
  mecanico_codigo?: string;
  distancia_km?: string;
  tiempo_estimado?: string;
}

type SubEstadoRunner = 'POR_RETIRAR' | 'EN_RUTA' | 'LLEGADO';

export default function RunnerPortalPage() {
  const [ordenes, setOrdenes] = useState<OrdenRunner[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [recibiendoEntregas, setRecibiendoEntregas] = useState<boolean>(true);
  const [saldoHoy, setSaldoHoy] = useState<number>(12.50);

  // Estados de los 3 pasos por cada orden: 'POR_RETIRAR' -> 'EN_RUTA' -> 'LLEGADO'
  const [subEstadoPorOrden, setSubEstadoPorOrden] = useState<Record<string, SubEstadoRunner>>({});

  // Toast de Éxito al Entregar
  const [toastExito, setToastExito] = useState<string | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState<boolean>(false);
  const [mostrarBotonTutorial, setMostrarBotonTutorial] = useState<boolean>(false);
  const [codigoAliado, setCodigoAliado] = useState<string>('#RUN-101');
  const [nombreRunner, setNombreRunner] = useState<string>('Luis Pérez');

  // Cargar órdenes en REPUESTOS_EN_RUTA de Supabase
  const cargarOrdenesRunner = async () => {
    try {
      setCargando(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .eq('estado', 'REPUESTOS_EN_RUTA')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Aviso cargando órdenes para el runner:', error.message);
      }

      if (data && data.length > 0) {
        const enriquecidas: OrdenRunner[] = data.map((ord) => ({
          ...ord,
          mayorista_nombre: 'AutoPartes Chacao',
          mayorista_direccion: 'Av. Francisco de Miranda, Edf. Chacao Center, Nivel 1',
          repuestos_lista: [
            'Pastillas de Freno Delanteras (Bosch)',
            'Líquido de Frenos DOT 4'
          ],
          mecanico_nombre: 'Carlos Mendoza #TTM-0842',
          mecanico_telefono: '+584121234567',
          distancia_km: '2.8 km',
          tiempo_estimado: '12 min'
        }));
        setOrdenes(enriquecidas);
      } else {
        setOrdenes([]);
      }
    } catch (err) {
      console.error('Error cargando órdenes runner:', err);
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const matchCode = document.cookie.match(/(^| )ttm_user_code=([^;]+)/);
      if (matchCode && matchCode[2]) {
        const val = decodeURIComponent(matchCode[2]);
        if (val.startsWith('#') || val.startsWith('RUN-')) {
          setCodigoAliado(val.startsWith('#') ? val : `#${val}`);
        }
      }
      const rawSesion = localStorage.getItem('ttm_aliado_sesion');
      if (rawSesion) {
        try {
          const parsed = JSON.parse(rawSesion);
          if (parsed.codigo_aliado) setCodigoAliado(parsed.codigo_aliado);
          if (parsed.nombre) setNombreRunner(parsed.nombre);
        } catch (e) { }
      }

      const estaRegistrado = typeof document !== 'undefined' && Boolean(
        document.cookie.match(/(^| )ttm_user_code=([^;]+)/) ||
        document.cookie.match(/(^| )ttm_role=([^;]+)/)
      );
      const visto = localStorage.getItem('onboarding_seen_runner');
      if (estaRegistrado || visto) {
        setMostrarBotonTutorial(false);
      } else {
        setMostrarBotonTutorial(true);
      }
    }

    cargarOrdenesRunner();

    // Supabase Realtime: Suscripción para recibir órdenes asignadas en tiempo real
    const supabase = createClient();
    const canal = supabase
      .channel('runner_portal_realtime_stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordenes' },
        (payload) => {
          console.log('⚡ Sincronización Realtime Runner:', payload);
          cargarOrdenesRunner();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const getSubEstado = (id: string): SubEstadoRunner => {
    return subEstadoPorOrden[id] || 'POR_RETIRAR';
  };

  // Paso 3: Entregado al Mecánico
  const entregarAlMecanico = async (orden: OrdenRunner) => {
    try {
      const supabase = createClient();

      // 1. Actualizar orden en Supabase a EN_EJECUCION para que el Kanban se mueva automáticamente
      if (!orden.id.startsWith('ord_runner_demo')) {
        await supabase
          .from('ordenes')
          .update({ estado: 'EN_EJECUCION' })
          .eq('id', orden.id);
      }

      // 2. Bitácora inmutable en consola
      console.log('[BITÁCORA INMUTABLE] Runner entregó repuestos. Estado de orden actualizado a EN_EJECUCION', {
        runner: 'Luis Pérez',
        orden_id: orden.id,
        mecanico: orden.mecanico_nombre,
        monto_acreditado: 4.00,
        nuevo_estado_orden: 'EN_EJECUCION',
        timestamp: new Date().toISOString()
      });

      // 3. Acreditar saldo al runner (+ $4.00)
      setSaldoHoy((prev) => prev + 4.00);

      // 4. Animación de éxito y remoción de la tarjeta
      setToastExito(`¡Entregado a ${orden.mecanico_nombre}! +$4.00 acreditados a tu saldo.`);
      setTimeout(() => {
        setOrdenes((prev) => prev.filter((o) => o.id !== orden.id));
      }, 350);

      setTimeout(() => setToastExito(null), 5000);
    } catch (err) {
      console.error('Error al marcar entrega como completada:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] selection:bg-[#CCFF00] selection:text-[#0A1525] pb-24">
      {/* Patrón sutil técnico de fondo */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* ======================================================== */}
      {/* 1. HEADER PEGAJOSO (Sticky) Con Rendimiento & Switch iOS */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-md mx-auto px-4 py-3.5 space-y-3">

          {/* Fila Superior: Perfil del Runner, Saldo y Enlace Despacho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar circular con foto oficial */}
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Luis Pérez"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#CCFF00] shadow-xs"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${recibiendoEntregas ? 'bg-[#16A34A]' : 'bg-slate-400'
                    }`}
                  title={recibiendoEntregas ? 'Activo en ruta' : 'Desconectado'}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base font-black text-[#0A1525] tracking-tight">
                    {nombreRunner}
                  </h1>
                  <span className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center text-white shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#0A1525] text-[#CCFF00] font-mono text-[11px] font-black shadow-2xs border border-slate-800">
                    {codigoAliado}
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Runner • Moto Bera SBR</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Recuadro Saldo Hoy: $12.50 */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-3.5 py-2 text-right shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">
                  Saldo hoy:
                </span>
                <p className="text-base font-black text-[#1E56B0] font-mono tracking-tight leading-none pt-0.5">
                  ${saldoHoy.toFixed(2)}{' '}
                  <span className="text-[10px] font-sans text-slate-500 font-bold">USD</span>
                </p>
              </div>

              {/* Botón Tutorial */}
              {mostrarBotonTutorial && (
                <button
                  type="button"
                  onClick={() => setMostrarTutorial(true)}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1E56B0] transition-colors shadow-2xs cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold"
                  title="Ver tutorial de bienvenida (Solo primera visita)"
                >
                  <Sparkles className="w-4 h-4 text-[#1E56B0]" />
                  <span className="hidden sm:inline">Tutorial</span>
                </button>
              )}

              {/* Botón Cerrar Sesión */}
              <button
                type="button"
                onClick={cerrarSesion}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
              </button>
            </div>
          </div>

          {/* Switch Grande tipo iOS de 'Recibiendo Entregas' (Verde Lima #CCFF00) */}
          <button
            type="button"
            onClick={() => setRecibiendoEntregas(!recibiendoEntregas)}
            className={`w-full h-13 rounded-2xl px-4 flex items-center justify-between transition-all cursor-pointer border ${recibiendoEntregas
              ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border-[#0A1525]/10 shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${recibiendoEntregas ? 'bg-emerald-600 animate-ping' : 'bg-slate-400'
                  }`}
              />
              <span className="text-xs font-black uppercase tracking-wider">
                {recibiendoEntregas ? 'Recibiendo Entregas' : 'Pausado / No disponible'}
              </span>
            </div>

            {/* Switch visual tipo iOS */}
            <div
              className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 shadow-inner ${recibiendoEntregas ? 'bg-[#0A1525]' : 'bg-slate-300'
                }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform duration-200 ${recibiendoEntregas ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. FEED DE ENTREGAS: Tarjetas de Ruta con 2 Bloques      */}
      {/* ======================================================== */}
      <main className="relative z-10 max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* Barra de Título */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#1E56B0]" />
            <span>Rutas Asignadas ({ordenes.length})</span>
          </h2>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/despacho"
              className="text-[11px] font-bold text-[#1E56B0] hover:underline flex items-center gap-0.5"
            >
              <span>Kanban</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
            <button
              type="button"
              onClick={cargarOrdenesRunner}
              className="text-slate-400 hover:text-[#0A1525] p-1 rounded-lg"
              title="Refrescar órdenes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Estado Vacío */}
        {ordenes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#CBD5E1] p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
              <Bike className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-sm font-black text-[#0A1525]">
                ¡Sin entregas pendientes en este momento!
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Mantén tu estado en <strong>Disponible</strong>. Cuando la torre de despacho asigne repuestos para una orden en tu zona, la alerta sonará y aparecerá aquí en tiempo real.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {ordenes.map((orden) => {
                const subEstado = getSubEstado(orden.id);

                return (
                            <motion.div
                              key={orden.id}
                              layout
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -30, opacity: 0, scale: 0.94 }}
                              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden rounded-3xl shadow-md border border-[#E2E8F0] flex flex-col"
                            >

                              {/* ======================================================== */}
                              {/* BLOQUE SUPERIOR (Recoger): Fondo Blanco, Borde Superior   */}
                              {/* ======================================================== */}
                              <div className="bg-white rounded-t-3xl p-4 sm:p-5 relative">
                                <div className="flex items-center justify-between pb-1.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    RECOGER EN:
                                  </span>
                                  {subEstado !== 'POR_RETIRAR' && (
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      Retirado
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-start justify-between gap-3 pt-1">
                                  <div className="min-w-0">
                                    <h4 className="text-base font-black text-[#0A1525] truncate">
                                      {orden.mayorista_nombre || 'AutoPartes Chacao'}
                                    </h4>
                                    <p className="text-xs text-[#475569] font-medium pt-0.5 leading-relaxed">
                                      {orden.mayorista_direccion || 'Av. Francisco de Miranda, Edf. Chacao Center'}
                                    </p>
                                  </div>

                                  {/* Botón de 'Abrir Mapa' (icono de Google Maps) */}
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      `${orden.mayorista_nombre || 'AutoPartes Chacao'} ${orden.mayorista_direccion || 'Caracas'}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#1E56B0] border border-[#CBD5E1] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
                                    title="Abrir en Google Maps"
                                  >
                                    <Navigation className="w-3.5 h-3.5 text-[#1E56B0]" />
                                    <span>Abrir Mapa</span>
                                  </a>
                                </div>
                              </div>

                              {/* ======================================================== */}
                              {/* ICONO CONECTOR EN EL MEDIO (Flecha hacia abajo animada)  */}
                              {/* ======================================================== */}
                              <div className="relative flex items-center justify-center -my-3.5 z-20">
                                <div className="absolute inset-x-0 h-px border-t border-dashed border-slate-300 pointer-events-none" />
                                <motion.div
                                  animate={{ y: [0, 4, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                  className="w-8 h-8 rounded-full bg-white border-2 border-[#1E56B0] shadow-md flex items-center justify-center text-[#1E56B0] shrink-0"
                                >
                                  <ArrowDown className="w-4 h-4 stroke-[2.8]" />
                                </motion.div>
                              </div>

                              {/* ======================================================== */}
                              {/* BLOQUE INFERIOR (Entregar): Fondo #F1F5F9 (Gris Sutil)   */}
                              {/* ======================================================== */}
                              <div className="bg-[#F1F5F9] rounded-b-3xl p-4 sm:p-5 relative space-y-3 pt-5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    ENTREGAR A:
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                    Orden #{orden.id.slice(0, 6).toUpperCase()}
                                  </span>
                                </div>

                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h4 className="text-base font-black text-[#0A1525] truncate">
                                      {orden.mecanico_nombre || 'Carlos Mendoza #TTM-0842'}
                                    </h4>
                                    <p className="text-xs font-semibold text-slate-600 pt-0.5">
                                      {orden.vehiculo_modelo} • {orden.sector}
                                    </p>

                                    {/* Paso 2: Llegada estimada: 12 min */}
                                    {subEstado === 'EN_RUTA' && (
                                      <p className="text-xs font-bold text-amber-700 pt-1.5 flex items-center gap-1.5 animate-pulse">
                                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Llegada estimada: 12 min</span>
                                      </p>
                                    )}
                                  </div>

                                  {/* Botón de llamada rápida al Mecánico */}
                                  <a
                                    href={`tel:${orden.mecanico_telefono || '+584121234567'}`}
                                    className="h-10 px-3.5 rounded-xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
                                    title="Llamar al Mecánico"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>Llamar</span>
                                  </a>
                                </div>

                                {/* ======================================================== */}
                                {/* 3. FLUJO DE ACCIÓN DE 3 PASOS (Un solo botón gigante)   */}
                                {/* ======================================================== */}
                                <div className="pt-2">
                                  <AnimatePresence mode="wait">
                                    {subEstado === 'POR_RETIRAR' && (
                                      /* Paso 1: 'Marcar como Retirado' (Fondo Azul Cobalto #1E56B0) */
                                      <motion.button
                                        key="btn_paso_1"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="button"
                                        onClick={() => {
                                          setSubEstadoPorOrden((prev) => ({
                                            ...prev,
                                            [orden.id]: 'EN_RUTA'
                                          }));
                                          console.log('[BITÁCORA INMUTABLE] Runner marcó como retirado los repuestos en mayorista', {
                                            orden_id: orden.id,
                                            runner: 'Luis Pérez',
                                            timestamp: new Date().toISOString()
                                          });
                                        }}
                                        className="w-full h-14 rounded-2xl bg-[#1E56B0] hover:bg-[#15448c] text-white font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-md active:scale-97 cursor-pointer transition-colors"
                                      >
                                        <Package className="w-5 h-5 text-[#CCFF00]" />
                                        <span>Marcar como Retirado</span>
                                      </motion.button>
                                    )}

                                    {subEstado === 'EN_RUTA' && (
                                      /* Paso 2: 'Iniciar Ruta al Mecánico' (Fondo Naranja #F59E0B) */
                                      <motion.button
                                        key="btn_paso_2"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="button"
                                        onClick={() => {
                                          setSubEstadoPorOrden((prev) => ({
                                            ...prev,
                                            [orden.id]: 'LLEGADO'
                                          }));
                                          console.log('[BITÁCORA INMUTABLE] Runner inició ruta GPS hacia el mecánico', {
                                            orden_id: orden.id,
                                            runner: 'Luis Pérez',
                                            timestamp: new Date().toISOString()
                                          });
                                        }}
                                        className="w-full h-14 rounded-2xl bg-[#F59E0B] hover:bg-[#d97706] text-white font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-md active:scale-97 cursor-pointer transition-colors"
                                      >
                                        <Bike className="w-5 h-5 text-white" />
                                        <span>Iniciar Ruta al Mecánico</span>
                                      </motion.button>
                                    )}

                                    {subEstado === 'LLEGADO' && (
                                      /* Paso 3: 'Entregado al Mecánico' (Fondo Verde Lima #CCFF00, texto oscuro) */
                                      <motion.button
                                        key="btn_paso_3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="button"
                                        onClick={() => entregarAlMecanico(orden)}
                                        className="w-full h-14 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-base tracking-tight flex items-center justify-center gap-2.5 shadow-lg active:scale-97 cursor-pointer border border-[#0A1525]/10 transition-colors"
                                      >
                                        <CheckCircle2 className="w-6 h-6 text-[#0A1525]" />
                                        <span>Entregado al Mecánico</span>
                                      </motion.button>
                                    )}
                                  </AnimatePresence>
                                </div>

                              </div>

                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
        )}
      </main>

            {/* ======================================================== */}
            {/* 4. TOAST ANIMADO DE ÉXITO                                */}
            {/* ======================================================== */}
            <AnimatePresence>
              {toastExito && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-50 bg-[#0A1525] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 shadow-xs font-black">
                    <Sparkles className="w-5 h-5 text-[#0A1525]" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-black text-white">{toastExito}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      ✓ Estado en Supabase actualizado a EN_EJECUCION en tiempo real
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToastExito(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Onboarding Modal de Bienvenida para Runners */}
            <OnboardingModal
              rol="RUNNER"
              isOpen={mostrarTutorial ? true : undefined}
              onClose={() => {
                setMostrarTutorial(false);
                setMostrarBotonTutorial(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('onboarding_seen_runner', 'true');
                }
              }}
            />
          </div>
        );
}
