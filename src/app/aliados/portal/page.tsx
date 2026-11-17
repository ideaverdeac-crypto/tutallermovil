'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Star,
  Wrench,
  DollarSign,
  Wallet,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  History as HistoryIcon,
  User as UserIcon,
  TrendingUp,
  Radio,
  Bell,
  ArrowLeft,
  Navigation,
  Car,
  Loader2,
  RefreshCw,
  Inbox,
  LocateFixed,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';
import FloatingSupportButton from '@/components/ui/floating-support-button';

type EstadoMecanico = 'DISPONIBLE' | 'EN_SERVICIO' | 'INACTIVO';

interface OrdenSupabase {
  id: string;
  cliente_nombre: string;
  vehiculo_marca?: string | null;
  vehiculo_modelo: string;
  vehiculo_anio?: number | string | null;
  falla_reportada: string;
  sector: string;
  ganancia_estimada: number | string;
  estado: string;
  latitud?: number | string | null;
  longitud?: number | string | null;
  created_at?: string;
}

// 2. Función con fórmula de Haversine para calcular distancia en km
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PortalAliadosPage() {
  const [estado, setEstado] = useState<EstadoMecanico>('DISPONIBLE');
  const [activeTab, setActiveTab] = useState<'inicio' | 'historial' | 'billetera' | 'perfil'>('inicio');
  
  // Órdenes reales desde Supabase
  const [ordenes, setOrdenes] = useState<OrdenSupabase[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [aceptandoId, setAceptandoId] = useState<string | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState<boolean>(false);

  // 1. Geolocalización del mecánico
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsActivo, setGpsActivo] = useState<boolean>(false);

  // Obtener geolocalización al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsActivo(true);
        },
        (error) => {
          console.warn('GPS no disponible o denegado por el usuario:', error.message);
          setGpsActivo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Consulta a Supabase para traer todas las órdenes donde estado = 'DISPONIBLE'
  const cargarOrdenes = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setCargando(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .eq('estado', 'DISPONIBLE')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error consultando tabla ordenes:', error);
      } else if (data) {
        setOrdenes(data);
      }
    } catch (err) {
      console.error('Excepción al cargar ordenes:', err);
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  // 2. Cargar órdenes iniciales y activar Supabase Realtime (INSERT y UPDATE)
  useEffect(() => {
    cargarOrdenes();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_ordenes_aliados')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ordenes'
        },
        (payload) => {
          console.log('Nueva orden recibida en tiempo real:', payload);
          const nuevaOrden = payload.new as OrdenSupabase;
          if (nuevaOrden && nuevaOrden.estado === 'DISPONIBLE') {
            setOrdenes((prev) => {
              // Evitar duplicados si ya está en la lista
              if (prev.some((o) => o.id === nuevaOrden.id)) return prev;
              return [nuevaOrden, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes'
        },
        (payload) => {
          console.log('Orden actualizada en tiempo real:', payload);
          const ordenActualizada = payload.new as OrdenSupabase;
          if (ordenActualizada) {
            setOrdenes((prev) => {
              // Si ya no está DISPONIBLE (ej. otro mecánico la aceptó), se quita del feed
              if (ordenActualizada.estado !== 'DISPONIBLE') {
                return prev.filter((o) => o.id !== ordenActualizada.id);
              }
              // Si sigue DISPONIBLE, se actualiza o se inserta
              const exists = prev.some((o) => o.id === ordenActualizada.id);
              if (exists) {
                return prev.map((o) => (o.id === ordenActualizada.id ? ordenActualizada : o));
              }
              return [ordenActualizada, ...prev];
            });
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Estado de suscripción Supabase Realtime:', status, err || '');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Ordenar por cercanía (Haversine) si hay coordenadas del usuario
  const ordenesConDistancia = useMemo(() => {
    return ordenes
      .map((orden) => {
        let distanciaKm: number | null = null;
        if (
          userCoords &&
          orden.latitud !== null &&
          orden.latitud !== undefined &&
          orden.longitud !== null &&
          orden.longitud !== undefined
        ) {
          const latOrd = Number(orden.latitud);
          const lonOrd = Number(orden.longitud);
          if (!isNaN(latOrd) && !isNaN(lonOrd)) {
            distanciaKm = calcularDistanciaKm(
              userCoords.latitude,
              userCoords.longitude,
              latOrd,
              lonOrd
            );
          }
        }
        return {
          ...orden,
          distanciaKm
        };
      })
      .sort((a, b) => {
        // Si ambos tienen distancia, ordenar el más cercano primero
        if (a.distanciaKm !== null && b.distanciaKm !== null) {
          return a.distanciaKm - b.distanciaKm;
        }
        // Los que tienen distancia van antes de los que no tienen
        if (a.distanciaKm !== null) return -1;
        if (b.distanciaKm !== null) return 1;
        return 0;
      });
  }, [ordenes, userCoords]);

  // 4 y 5. Acción de Aceptar con Supabase RPC y manejo de Race Conditions
  const handleAceptarServicio = async (orden: OrdenSupabase) => {
    if (aceptandoId) return;
    setAceptandoId(orden.id);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('aceptar_servicio_disponible', {
        p_orden_id: orden.id,
        p_mecanico_id: '123e4567-e89b-12d3-a456-426614174000'
      });

      if (error) {
        console.error('Error al llamar RPC aceptar_servicio_disponible:', error);
        alert('Lo sentimos, otro mecánico acaba de aceptar este servicio');
        await cargarOrdenes(true);
        return;
      }

      if (data === true) {
        alert('¡Servicio aceptado! Dirígete al cliente');
        // Eliminar esa tarjeta de la lista visualmente
        setOrdenes((prev) => prev.filter((o) => o.id !== orden.id));
      } else {
        alert('Lo sentimos, otro mecánico acaba de aceptar este servicio');
        // Actualizar la lista para remover la orden ya tomada
        await cargarOrdenes(true);
      }
    } catch (err) {
      console.error('Excepción al aceptar servicio:', err);
      alert('Lo sentimos, ocurrió un problema al aceptar este servicio. Intenta nuevamente.');
    } finally {
      setAceptandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans pb-28 md:pb-12 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Barra Superior */}
      <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center text-slate-500 hover:text-[#0A1525] hover:bg-slate-50 transition-colors"
              title="Volver a la Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#0A1525]">TTM</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1E56B0]/10 text-[#1E56B0] px-2 py-0.5 rounded">
                  Portal Aliados
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cargarOrdenes(true)}
              disabled={refreshing}
              className="p-2 rounded-lg border border-[#CBD5E1] text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Actualizar Órdenes"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#1E56B0]' : ''}`} />
            </button>
            <button
              type="button"
              className="relative p-2 rounded-lg border border-[#CBD5E1] text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#CCFF00] ring-2 ring-white"></span>
            </button>

            <button
              type="button"
              onClick={() => setMostrarTutorial(true)}
              className="p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1E56B0] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Ver tutorial de bienvenida"
            >
              <Sparkles className="w-4 h-4 text-[#1E56B0]" />
              <span className="hidden sm:inline">Tutorial</span>
            </button>

            <button
              type="button"
              onClick={cerrarSesion}
              className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">

        {/* 1. Header del Perfil */}
        <section className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
            
            {/* Avatar y Datos Personales */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#0A1525] border-2 border-[#CBD5E1] p-1 overflow-hidden flex items-center justify-center text-white shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80"
                    alt="Carlos Mendoza - Especialista TuTallerMóvil"
                    className="w-full h-full rounded-xl object-cover object-center"
                  />
                </div>
                {/* Indicador de estado en el avatar */}
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    estado === 'DISPONIBLE'
                      ? 'bg-[#CCFF00]'
                      : estado === 'EN_SERVICIO'
                      ? 'bg-[#1E56B0]'
                      : 'bg-slate-400'
                  }`}
                ></span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A1525] tracking-tight">
                    Carlos Mendoza
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verificado
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-medium">
                  <span className="font-mono font-bold text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    #TTM-0842
                  </span>
                  <span>•</span>
                  <span>Mecánica General &amp; Inyección</span>
                </div>

                {/* Calificación 4.9 estrellas */}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  </div>
                  <span className="text-xs font-black text-[#0A1525]">4.9</span>
                  <span className="text-[11px] text-slate-400 font-normal">(118 reseñas)</span>
                </div>
              </div>
            </div>

            {/* Zona de Cobertura & GPS State */}
            <div className="flex sm:flex-col items-center sm:items-end justify-center gap-1.5 text-xs text-slate-500 bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl sm:min-w-[170px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Zona de Cobertura
              </span>
              <span className="font-bold text-[#0A1525] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1E56B0]" /> Gran Caracas
              </span>
              <span className={`text-[10px] font-semibold flex items-center gap-1 ${gpsActivo ? 'text-emerald-700' : 'text-slate-400'}`}>
                <LocateFixed className="w-3 h-3" />
                {gpsActivo ? 'GPS activo • Cercanía' : 'GPS no detectado'}
              </span>
            </div>

          </div>
        </section>

        {/* 2. Conmutador de Estado (3 Estados) */}
        <section className="bg-white border border-[#CBD5E1] rounded-2xl p-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estado Operativo:
              </span>
            </div>

            {/* Botones de Selección */}
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1]">
              
              {/* DISPONIBLE */}
              <button
                type="button"
                onClick={() => setEstado('DISPONIBLE')}
                className={`h-11 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  estado === 'DISPONIBLE'
                    ? 'bg-[#CCFF00] text-[#0A1525] shadow-xs'
                    : 'text-slate-500 hover:text-[#0A1525]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${estado === 'DISPONIBLE' ? 'bg-[#0A1525] animate-ping' : 'bg-slate-300'}`}></span>
                <span>DISPONIBLE</span>
              </button>

              {/* EN SERVICIO */}
              <button
                type="button"
                onClick={() => setEstado('EN_SERVICIO')}
                className={`h-11 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  estado === 'EN_SERVICIO'
                    ? 'bg-[#1E56B0] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#0A1525]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${estado === 'EN_SERVICIO' ? 'bg-[#CCFF00]' : 'bg-slate-300'}`}></span>
                <span>EN SERVICIO</span>
              </button>

              {/* INACTIVO */}
              <button
                type="button"
                onClick={() => setEstado('INACTIVO')}
                className={`h-11 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  estado === 'INACTIVO'
                    ? 'bg-slate-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#0A1525]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>INACTIVO</span>
              </button>

            </div>
          </div>
        </section>

        {/* Banner Destacado: Servicio Activo en Ejecución */}
        {estado === 'EN_SERVICIO' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A1525] text-white rounded-2xl p-4 border-2 border-[#CCFF00] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center font-black shrink-0">
                <Wrench className="w-5 h-5 text-[#0A1525]" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00]">
                    Servicio en Ejecución Activa
                  </span>
                </div>
                <h3 className="text-sm font-black text-white">
                  Toyota Corolla 2018 • Placa AB123CD
                </h3>
                <p className="text-xs text-slate-300">
                  María Rodríguez • Diagnóstico OBD2 y Checklist de 25 Puntos
                </p>
              </div>
            </div>

            <Link
              href="/aliados/servicio/TTM-0842"
              className="h-11 px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
            >
              <span>Abrir Consola de Ejecución</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* 3. Tablero de Rendimiento (KPIs) */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* KPI 1: Servicios Realizados */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Servicios
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  124
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  +12 este mes
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Wrench className="w-5 h-5 text-[#1E56B0]" />
              </div>
            </motion.div>

            {/* KPI 2: Dinero Acumulado */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Acumulado
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  $1,450
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  Total generado
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E56B0]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </motion.div>

            {/* KPI 3: Saldo Disponible */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Saldo Disponible
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                  $350
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Listo para retiro
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
            </motion.div>

            {/* KPI 4: Calificación */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Calificación
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  4.95
                </span>
                <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                  Top 5% Caracas
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </motion.div>

          </div>
        </section>

        {/* 4. Feed de Servicios (Conectado a la tabla ordenes en Supabase) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A1525]">
                Órdenes Cercanas Disponibles
              </h2>
              {!cargando && (
                <span className="bg-[#CCFF00] text-[#0A1525] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {ordenesConDistancia.length} disponibles
                </span>
              )}
            </div>

            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase en vivo
            </span>
          </div>

          {/* Estado Inactivo */}
          {estado === 'INACTIVO' ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0A1525]">Estás en modo INACTIVO</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cambia tu estado a <strong className="text-emerald-700">DISPONIBLE</strong> en la parte superior para recibir solicitudes y despachos en tu zona.
              </p>
              <button
                type="button"
                onClick={() => setEstado('DISPONIBLE')}
                className="h-10 px-4 bg-[#CCFF00] text-[#0A1525] font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Activar Disponibilidad
              </button>
            </div>
          ) : cargando ? (
            /* Estado de Carga */
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E56B0] mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Consultando órdenes disponibles en Supabase...
              </p>
            </div>
          ) : ordenesConDistancia.length === 0 ? (
            /* 5. Mensaje Vacío si no hay órdenes */
            <div className="bg-white border border-[#CBD5E1] rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="relative w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                <Inbox className="w-8 h-8 stroke-[1.8] text-slate-400" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[#0A1525]">
                  No hay servicios cerca
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-sm mx-auto">
                  Mantente conectado, te avisaremos en tiempo real cuando un cliente solicite asistencia en tu zona.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Radar GPS activo y escuchando</span>
              </div>
            </div>
          ) : (
            /* Feed de Servicios con Datos Reales y Ordenados por Distancia */
            <div className="space-y-4">
              {ordenesConDistancia.map((orden, index) => {
                const gananciaFormatted = `$${Number(orden.ganancia_estimada || 0).toFixed(2)} USD`;
                const shortId = orden.id ? `#${orden.id.slice(0, 8).toUpperCase()}` : `#ORD-${index + 1}`;
                const isAccepting = aceptandoId === orden.id;
                const vehiculoCompleto = [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                  .filter(Boolean)
                  .join(' ') || orden.vehiculo_modelo || 'Vehículo';

                return (
                  <motion.div
                    key={orden.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border-2 border-[#CBD5E1] hover:border-[#1E56B0] rounded-2xl p-5 sm:p-6 shadow-sm transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Datos de la Orden (Falla, Modelo, Sector, Distancia) */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {shortId}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            {orden.estado}
                          </span>

                          {/* Distancia Calculada con Haversine (si GPS concedido y orden tiene coords) */}
                          {orden.distanciaKm !== null && (
                            <span className="inline-flex items-center gap-1 bg-[#1E56B0]/10 text-[#1E56B0] border border-[#1E56B0]/20 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                              <Navigation className="w-3 h-3 text-[#1E56B0]" />
                              A {orden.distanciaKm < 1 ? `${Math.round(orden.distanciaKm * 1000)} m` : `${orden.distanciaKm.toFixed(1)} km`}
                            </span>
                          )}

                          {orden.cliente_nombre && (
                            <span className="text-[11px] text-slate-400">
                              Cliente: <strong className="text-slate-600">{orden.cliente_nombre}</strong>
                            </span>
                          )}
                        </div>

                        {/* Falla Reportada Real */}
                        <h3 className="text-lg sm:text-xl font-extrabold text-[#0A1525] tracking-tight">
                          {orden.falla_reportada}
                        </h3>

                        {/* Modelo de Carro (Marca, Modelo, Año) y Sector Reales */}
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#0A1525]">
                            <Car className="w-4 h-4 text-[#1E56B0]" />
                            {vehiculoCompleto}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {orden.sector}
                          </span>
                        </div>
                      </div>

                      {/* Ganancia Real y Botón de Aceptar con RPC */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Tu Ganancia
                          </span>
                          <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                            {gananciaFormatted}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            Pago garantizado
                          </span>
                        </div>

                        {/* 4. Botón "Aceptar Servicio" con llamada RPC y race condition */}
                        <motion.button
                          type="button"
                          disabled={isAccepting}
                          whileHover={{ scale: isAccepting ? 1 : 1.02 }}
                          whileTap={{ scale: isAccepting ? 1 : 0.98 }}
                          onClick={() => handleAceptarServicio(orden)}
                          className={`w-full lg:w-44 h-12 text-base font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#0A1525]/10 ${
                            isAccepting
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525]'
                          }`}
                        >
                          {isAccepting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#0A1525]" />
                              <span>Aceptando...</span>
                            </>
                          ) : (
                            <>
                              <Navigation className="w-4 h-4 text-[#0A1525]" />
                              <span>Aceptar Servicio</span>
                            </>
                          )}
                        </motion.button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* 5. Navegación Móvil (Bottom Nav Fija) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#CBD5E1] shadow-xl py-2 px-6 backdrop-blur-md bg-white/95 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${
              activeTab === 'inicio' ? 'text-[#1E56B0] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px]">Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${
              activeTab === 'historial' ? 'text-[#1E56B0] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-[10px]">Historial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billetera')}
            className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${
              activeTab === 'billetera' ? 'text-[#1E56B0] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px]">Billetera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${
              activeTab === 'perfil' ? 'text-[#1E56B0] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </button>

        </div>
      </nav>

      {/* Onboarding Modal de Bienvenida para Mecánicos */}
      <OnboardingModal
        rol="MECANICO"
        isOpen={mostrarTutorial ? true : undefined}
        onClose={() => setMostrarTutorial(false)}
      />

      {/* Botón Flotante de Soporte Técnico (WhatsApp FAB) */}
      <FloatingSupportButton
        className="bottom-20 sm:bottom-6"
        mensajePersonalizado="Hola, soy especialista de TuTallerMóvil y necesito soporte técnico en mi portal."
      />

    </div>
  );
}
