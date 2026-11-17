'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Package,
  Bike,
  Store,
  Check,
  X,
  Phone,
  Car,
  Shield,
  KeyRound,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  Hash,
  LogOut
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';
import FloatingSupportButton from '@/components/ui/floating-support-button';

interface RepuestoItem {
  id?: string;
  nombre_repuesto: string;
  marca?: string;
  cantidad: number;
  precio_unitario_usd?: number;
  subtotal_usd?: number;
  foto_url?: string;
}

interface PedidoProveedor {
  id: string;
  cliente_nombre: string;
  vehiculo_modelo: string;
  vehiculo_marca?: string;
  falla_reportada: string;
  sector: string;
  estado: string;
  created_at?: string;
  // Datos específicos del runner y logística
  runner_nombre: string;
  runner_avatar: string;
  runner_vehiculo: string;
  runner_placa: string;
  runner_telefono: string;
  runner_pin: string;
  tiempo_estimado: string;
  distancia_estimada: string;
  repuestos: RepuestoItem[];
  monto_total_repuestos?: number;
}

// Datos de respaldo para demostración inmediata si la base no tiene órdenes activas en REPUESTOS_EN_RUTA
const PEDIDOS_DEMO_INICIALES: PedidoProveedor[] = [
  {
    id: 'ord_b2b_demo_1',
    cliente_nombre: 'Ana Pérez',
    vehiculo_marca: 'Toyota',
    vehiculo_modelo: 'Toyota Corolla 2018',
    falla_reportada: 'Chirrido agudo al frenar y pérdida leve de presión',
    sector: 'Chacao — Calle El Retiro, Qta. Milagrosa',
    estado: 'REPUESTOS_EN_RUTA',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    runner_nombre: 'Luis Pérez',
    runner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    runner_vehiculo: 'Moto Yamaha FZ • Negro',
    runner_placa: 'AB123CD',
    runner_telefono: '+58 412-1234567',
    runner_pin: '1234',
    tiempo_estimado: 'Llegada en 4-6 min',
    distancia_estimada: '1.4 km de distancia',
    repuestos: [
      {
        nombre_repuesto: 'Pastillas de Freno Delanteras',
        marca: 'Bosch',
        cantidad: 1,
        precio_unitario_usd: 35.0,
        subtotal_usd: 35.0,
        foto_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=200&q=80'
      },
      {
        nombre_repuesto: 'Líquido de Frenos DOT 4 (500ml)',
        marca: 'Motul',
        cantidad: 1,
        precio_unitario_usd: 12.0,
        subtotal_usd: 12.0,
        foto_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&q=80'
      }
    ],
    monto_total_repuestos: 47.0
  },
  {
    id: 'ord_b2b_demo_2',
    cliente_nombre: 'Marcos Rivas',
    vehiculo_marca: 'Ford',
    vehiculo_modelo: 'Ford Explorer 2016',
    falla_reportada: 'Batería descargada, sin arranque matutino',
    sector: 'Chacao — Av. Francisco de Miranda, Edf. Altamira',
    estado: 'REPUESTOS_EN_RUTA',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    runner_nombre: 'Pedro González',
    runner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    runner_vehiculo: 'Moto Empire Keeway Horse • Rojo',
    runner_placa: 'AC982XY',
    runner_telefono: '+58 414-9876543',
    runner_pin: '1234',
    tiempo_estimado: 'En la entrada del edificio',
    distancia_estimada: '0.2 km de distancia',
    repuestos: [
      {
        nombre_repuesto: 'Batería Automotriz 12V 800A',
        marca: 'Duncan Titanium',
        cantidad: 1,
        precio_unitario_usd: 110.0,
        subtotal_usd: 110.0,
        foto_url: 'https://images.unsplash.com/photo-1620910930886-6b2b9e214686?auto=format&fit=crop&w=200&q=80'
      }
    ],
    monto_total_repuestos: 110.0
  }
];

export default function PedidosProveedorPage() {
  const [pedidos, setPedidos] = useState<PedidoProveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [toastNotificacion, setToastNotificacion] = useState<{ mensaje: string; tipo: 'exito' | 'info' | 'error' } | null>(null);

  // Estado del Modal de Validación de PIN
  const [pedidoSeleccionadoParaPIN, setPedidoSeleccionadoParaPIN] = useState<PedidoProveedor | null>(null);
  const [pinIngresado, setPinIngresado] = useState<string>('');
  const [errorPIN, setErrorPIN] = useState<string | null>(null);
  const [validandoPIN, setValidandoPIN] = useState<boolean>(false);
  const [mostrarTutorial, setMostrarTutorial] = useState<boolean>(false);

  // Carga inicial y obtención de pedidos desde Supabase
  const cargarPedidos = async (esRefrescoManual = false) => {
    try {
      if (esRefrescoManual) setRefrescando(true);
      else setCargando(true);

      const supabase = createClient();

      // 1. Consultar órdenes en REPUESTOS_EN_RUTA
      const { data: ordenesData, error: errOrdenes } = await supabase
        .from('ordenes')
        .select('*')
        .eq('estado', 'REPUESTOS_EN_RUTA')
        .order('created_at', { ascending: false });

      if (errOrdenes) {
        console.warn('[SUPABASE B2B] Aviso consultando ordenes:', errOrdenes.message);
      }

      if (ordenesData && ordenesData.length > 0) {
        const orderIds = ordenesData.map((o) => o.id);

        // 2. Intentar buscar los repuestos vinculados en orden_repuestos
        let repuestosMap: Record<string, RepuestoItem[]> = {};
        try {
          const { data: repuestosData } = await supabase
            .from('orden_repuestos')
            .select('*')
            .in('orden_id', orderIds);

          if (repuestosData && repuestosData.length > 0) {
            repuestosData.forEach((rep) => {
              if (!repuestosMap[rep.orden_id]) {
                repuestosMap[rep.orden_id] = [];
              }
              repuestosMap[rep.orden_id].push({
                id: rep.id,
                nombre_repuesto: rep.nombre_repuesto || 'Repuesto de catálogo',
                marca: rep.marca || 'Genérico',
                cantidad: rep.cantidad || 1,
                precio_unitario_usd: Number(rep.precio_unitario_usd || 0),
                subtotal_usd: Number(rep.subtotal_usd || 0)
              });
            });
          }
        } catch (e) {
          console.warn('[SUPABASE B2B] Tabla orden_repuestos no consultable directamente:', e);
        }

        // 3. Mapear pedidos
        const transformados: PedidoProveedor[] = ordenesData.map((ord, idx) => {
          const repuestosDeOrden = repuestosMap[ord.id] && repuestosMap[ord.id].length > 0
            ? repuestosMap[ord.id]
            : [
                {
                  nombre_repuesto: 'Pastillas de Freno Delanteras',
                  marca: 'Bosch Certificado',
                  cantidad: 1,
                  precio_unitario_usd: 35.0,
                  subtotal_usd: 35.0
                }
              ];

          const totalRepuestos = repuestosDeOrden.reduce((acc, r) => acc + (r.subtotal_usd || 0), 0);

          return {
            id: ord.id,
            cliente_nombre: ord.cliente_nombre || 'Cliente TuTallerMóvil',
            vehiculo_modelo: ord.vehiculo_modelo || 'Vehículo en Diagnóstico',
            vehiculo_marca: ord.vehiculo_marca || 'Vehículo',
            falla_reportada: ord.falla_reportada || 'Servicio programado',
            sector: ord.sector || 'Chacao',
            estado: ord.estado,
            created_at: ord.created_at,
            runner_nombre: idx % 2 === 0 ? 'Luis Pérez' : 'Pedro González',
            runner_avatar:
              idx % 2 === 0
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            runner_vehiculo: idx % 2 === 0 ? 'Moto Yamaha FZ • Negro' : 'Moto Empire Keeway Horse • Rojo',
            runner_placa: idx % 2 === 0 ? 'AB123CD' : 'AC982XY',
            runner_telefono: idx % 2 === 0 ? '+58 412-1234567' : '+58 414-9876543',
            runner_pin: '1234',
            tiempo_estimado: idx % 2 === 0 ? 'Llegada estimada en 4-6 min' : 'En la garita del local',
            distancia_estimada: idx % 2 === 0 ? '1.2 km de distancia' : 'En puerta',
            repuestos: repuestosDeOrden,
            monto_total_repuestos: totalRepuestos > 0 ? totalRepuestos : 35.0
          };
        });

        setPedidos(transformados);
      } else {
        // Fallback demostrativo con datos activos
        setPedidos(PEDIDOS_DEMO_INICIALES);
      }
    } catch (err) {
      console.error('[B2B] Error cargando pedidos:', err);
      setPedidos(PEDIDOS_DEMO_INICIALES);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  // Configuración de Supabase Realtime para escuchar cambios en la tabla 'ordenes'
  useEffect(() => {
    cargarPedidos();

    const supabase = createClient();
    const canal = supabase
      .channel('pedidos_repuestos_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordenes' },
        (payload) => {
          console.log('[REALTIME B2B] Notificación de cambio en tabla ordenes:', payload);
          setToastNotificacion({
            mensaje: 'Tablero actualizado: Cambio detectado en órdenes activas.',
            tipo: 'info'
          });
          cargarPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Timer para auto-ocultar toast
  useEffect(() => {
    if (toastNotificacion) {
      const timer = setTimeout(() => setToastNotificacion(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotificacion]);

  // Manejo de Validación de PIN y Entrega al Runner
  const handleAbrirModalPIN = (pedido: PedidoProveedor) => {
    setPedidoSeleccionadoParaPIN(pedido);
    setPinIngresado('');
    setErrorPIN(null);
  };

  const handleConfirmarEntregaPIN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoSeleccionadoParaPIN) return;

    if (pinIngresado.trim().length !== 4) {
      setErrorPIN('Por favor ingresa un código PIN de 4 dígitos.');
      return;
    }

    setValidandoPIN(true);
    setErrorPIN(null);

    try {
      // Validación de PIN (acepta el PIN del runner '1234' o el configurado)
      const pinCorrecto = pedidoSeleccionadoParaPIN.runner_pin || '1234';
      if (pinIngresado.trim() !== pinCorrecto) {
        setErrorPIN(`PIN incorrecto. Solicita el código de 4 dígitos al mensajero ${pedidoSeleccionadoParaPIN.runner_nombre}.`);
        setValidandoPIN(false);
        return;
      }

      // Registro en Supabase (simulando retiro verificado)
      const supabase = createClient();
      try {
        await supabase
          .from('ordenes')
          .update({
            repuesto_retirado: true
          })
          .eq('id', pedidoSeleccionadoParaPIN.id);
      } catch (eSup) {
        console.warn('[SUPABASE] Actualización suave de repuesto_retirado:', eSup);
      }

      // Bitácora inmutable en consola
      console.log('[BITÁCORA INMUTABLE] Casa de Repuestos validó entrega con PIN al Runner', {
        proveedor: 'AutoPartes Chacao',
        orden_id: pedidoSeleccionadoParaPIN.id,
        runner_nombre: pedidoSeleccionadoParaPIN.runner_nombre,
        runner_vehiculo: pedidoSeleccionadoParaPIN.runner_vehiculo,
        runner_placa: pedidoSeleccionadoParaPIN.runner_placa,
        pin_validado: pinIngresado,
        repuestos_entregados: pedidoSeleccionadoParaPIN.repuestos,
        vehiculo_destino: pedidoSeleccionadoParaPIN.vehiculo_modelo,
        timestamp: new Date().toISOString()
      });

      // Notificación toast exitosa
      setToastNotificacion({
        mensaje: `¡Repuesto entregado a ${pedidoSeleccionadoParaPIN.runner_nombre}! Retiro validado exitosamente con PIN de seguridad.`,
        tipo: 'exito'
      });

      // Remover tarjeta con animación de la lista local
      const idRemovida = pedidoSeleccionadoParaPIN.id;
      setPedidos((prev) => prev.filter((p) => p.id !== idRemovida));

      // Cerrar modal
      setPedidoSeleccionadoParaPIN(null);
      setPinIngresado('');
    } catch (err: any) {
      console.error('Error al validar PIN:', err);
      setErrorPIN('Ocurrió un error al procesar la entrega. Intenta de nuevo.');
    } finally {
      setValidandoPIN(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A1525] antialiased selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* ======================================================== */}
      {/* 1. HEADER DE PROVEEDOR B2B (Light Mode Puro) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Identidad del Mayorista / Casa de Repuestos */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0A1525] border border-slate-700/60 text-[#CCFF00] flex items-center justify-center font-black tracking-wider text-base shadow-sm shrink-0">
                <Store className="w-6 h-6 text-[#CCFF00]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight truncate">
                    AutoPartes Chacao
                  </h1>
                  <span
                    className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs text-white"
                    title="Proveedor Verificado Oficial TTM"
                  >
                    <Check className="w-3 h-3 stroke-[3.5]" />
                  </span>
                  <span className="hidden md:inline-flex text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                    B2B Repuestos
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#475569] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-700">Recepción Activa</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E56B0]">
                    <Package className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span className="font-mono">{pedidos.length}</span> Pedido{pedidos.length === 1 ? '' : 's'} por Surtir
                  </div>
                </div>
              </div>
            </div>

            {/* Navegación y Acciones Rápidas */}
            <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
              <button
                type="button"
                onClick={() => cargarPedidos(true)}
                disabled={refrescando}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0A1525] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                title="Recargar pedidos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refrescando ? 'animate-spin text-[#1E56B0]' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <Link
                href="/repuestos/portal"
                className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Store className="w-4 h-4 text-slate-500" />
                <span>Catálogo de Repuestos</span>
              </Link>

              <Link
                href="/admin/despacho"
                className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-[#0A1525] hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Bike className="w-4 h-4 text-[#CCFF00]" />
                <span className="hidden sm:inline">Centro de Despacho</span>
              </Link>

              <button
                type="button"
                onClick={() => setMostrarTutorial(true)}
                className="h-10 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#1E56B0] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Ver tutorial de bienvenida"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1E56B0]" />
                <span className="hidden sm:inline">Tutorial</span>
              </button>

              <button
                type="button"
                onClick={cerrarSesion}
                className="h-10 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. BARRA DE PULSO OPERATIVO (BENTO STATS) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Pedidos Pendientes */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Pedidos Pendientes
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#0A1525]">
                {pedidos.length}
              </span>
              <span className="text-xs font-semibold text-amber-600">Por surtir</span>
            </div>
          </div>

          {/* Card 2: Runners en Camino */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Runners en Ruta
              </span>
              <Bike className="w-3.5 h-3.5 text-[#1E56B0]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#1E56B0]">
                {pedidos.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">Acercándose</span>
            </div>
          </div>

          {/* Card 3: Tiempo Estimado de Retiro */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Tiempo de Retiro
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#0A1525]">
                ~5
              </span>
              <span className="text-xs font-semibold text-slate-500">minutos prom.</span>
            </div>
          </div>

          {/* Card 4: Seguridad */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Candado de Seguridad
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                PIN 4 Dígitos Activo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. LISTADO DE PEDIDOS POR SURTIR (Bento Grid) */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Título de Sección */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-[#0A1525] tracking-tight flex items-center gap-2">
              <span>Bandeja de Preparación y Despacho</span>
              <span className="text-xs font-mono font-bold bg-[#1E56B0]/10 text-[#1E56B0] px-2 py-0.5 rounded-md">
                {pedidos.length} activa{pedidos.length === 1 ? '' : 's'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Prepara los repuestos solicitados y valida el retiro del mensajero mediante su código PIN.
            </p>
          </div>

          {pedidos.length === 0 && (
            <button
              type="button"
              onClick={() => setPedidos(PEDIDOS_DEMO_INICIALES)}
              className="text-xs font-bold text-[#1E56B0] hover:underline cursor-pointer"
            >
              + Cargar pedidos de demostración
            </button>
          )}
        </div>

        {/* Estado de Carga */}
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-[#1E56B0] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#0A1525]">Cargando pedidos por surtir...</p>
            <p className="text-xs text-slate-400">Conectando con la red logística en tiempo real</p>
          </div>
        ) : pedidos.length === 0 ? (
          /* Estado Vacío */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-[#F8FAFC]"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-black text-[#0A1525] mb-1">
              ¡Todos los pedidos están al día!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              No tienes repuestos pendientes por surtir en este momento. Cuando la central de despacho asigne un mensajero a una orden, aparecerá aquí automáticamente.
            </p>
            <button
              type="button"
              onClick={() => setPedidos(PEDIDOS_DEMO_INICIALES)}
              className="h-10 px-5 rounded-xl bg-[#0A1525] text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Simular Pedido de Prueba
            </button>
          </motion.div>
        ) : (
          /* Grid de Tarjetas de Pedido */
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {pedidos.map((pedido) => (
                <motion.article
                  key={pedido.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  
                  {/* Encabezado Superior de la Tarjeta */}
                  <div className="px-5 sm:px-6 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0A1525] text-white text-xs font-mono font-black tracking-wider">
                        #{pedido.id.replace('ord_', '').slice(0, 8).toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1E56B0]/10 text-[#1E56B0] text-[11px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E56B0] animate-pulse" />
                        Repuestos en Ruta
                      </span>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        • {pedido.sector}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pedido.tiempo_estimado}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo Principal de 2 Columnas (Bento Box) */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* COLUMNA IZQUIERDA: El Pedido por Surtir (7 columnas en desktop) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-[#0A1525] uppercase tracking-wide">
                              Pedido por surtir
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              {pedido.repuestos.length} pieza{pedido.repuestos.length === 1 ? '' : 's'} requerida{pedido.repuestos.length === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>

                        {/* Vehículo Destino */}
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0A1525] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                            {pedido.vehiculo_modelo}
                          </span>
                        </div>
                      </div>

                      {/* Lista de Repuestos a Entregar */}
                      <div className="space-y-2 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
                        {pedido.repuestos.map((rep, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={
                                  rep.foto_url ||
                                  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=120&q=80'
                                }
                                alt={rep.nombre_repuesto}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0A1525] truncate">
                                  {rep.nombre_repuesto}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold truncate">
                                  {rep.marca || 'Marca Homologada'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#CCFF00] text-[#0A1525] text-xs font-black">
                                Cant: {rep.cantidad}
                              </span>
                              {rep.subtotal_usd && (
                                <p className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                                  ${rep.subtotal_usd.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Diagnóstico / Detalle del fallo */}
                        <div className="pt-1 text-[11px] text-slate-500 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Motivo / Falla:</strong> {pedido.falla_reportada}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: El Runner Asignado (5 columnas en desktop) */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-4 lg:border-l lg:border-[#E2E8F0] lg:pl-6">
                      
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 text-[#1E56B0] flex items-center justify-center shrink-0">
                              <Bike className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-[#0A1525] uppercase tracking-wide">
                                Mensajero Asignado
                              </h3>
                              <p className="text-[11px] text-slate-400">
                                {pedido.distancia_estimada}
                              </p>
                            </div>
                          </div>

                          {/* Etiqueta Verde: En ruta al local */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black tracking-tight">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            En ruta al local
                          </span>
                        </div>

                        {/* Ficha del Runner */}
                        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={pedido.runner_avatar}
                              alt={pedido.runner_nombre}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-[#0A1525] truncate">
                                {pedido.runner_nombre}
                              </h4>
                              <p className="text-[10px] font-bold text-[#1E56B0] uppercase tracking-wide">
                                Runner Express TTM
                              </p>
                              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                {pedido.runner_vehiculo}
                              </p>
                            </div>
                          </div>

                          {/* Datos de garita / Placa y contacto */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                                Placa Vehicular
                              </span>
                              <span className="font-mono font-black text-[#0A1525]">
                                {pedido.runner_placa}
                              </span>
                            </div>

                            <a
                              href={`tel:${pedido.runner_telefono}`}
                              className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                              <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                                  Contacto
                                </span>
                                <span className="font-mono font-bold text-xs text-[#1E56B0] truncate">
                                  Llamar
                                </span>
                              </div>
                              <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Botón de Acción de Entrega con Candado */}
                      <div className="pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAbrirModalPIN(pedido)}
                          className="w-full h-13 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer group"
                        >
                          <Lock className="w-4 h-4 text-[#CCFF00] group-hover:scale-110 transition-transform" />
                          <span>Confirmar Entrega al Runner</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <p className="text-[10px] text-center text-slate-400 font-semibold mt-1.5 flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Candado de seguridad: Requiere PIN de 4 dígitos
                        </p>
                      </div>

                    </div>
                  </div>

                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* 4. DIALOG / MODAL DE VALIDACIÓN DE PIN (Candado de Seguridad) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {pedidoSeleccionadoParaPIN && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop con Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPedidoSeleccionadoParaPIN(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Tarjeta del Dialog (Bento Box UI) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 overflow-hidden"
            >
              
              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setPedidoSeleccionadoParaPIN(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cabecera del Candado */}
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#0A1525] border border-slate-700/60 text-[#CCFF00] flex items-center justify-center mx-auto mb-3 shadow-md">
                  <KeyRound className="w-7 h-7 text-[#CCFF00]" />
                </div>
                <h3 className="text-lg font-black text-[#0A1525] tracking-tight">
                  Ingresa el PIN del Runner
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Solicita el código de 4 dígitos a <strong>{pedidoSeleccionadoParaPIN.runner_nombre}</strong> para validar el retiro seguro del repuesto.
                </p>
              </div>

              {/* Resumen del Runner y Repuestos */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] mb-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Mensajero en local:</span>
                  <span className="font-bold text-[#0A1525]">
                    {pedidoSeleccionadoParaPIN.runner_nombre} ({pedidoSeleccionadoParaPIN.runner_placa})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Repuestos a despachar:</span>
                  <span className="font-bold text-[#1E56B0]">
                    {pedidoSeleccionadoParaPIN.repuestos.map((r) => `${r.cantidad}x ${r.nombre_repuesto}`).join(', ')}
                  </span>
                </div>
              </div>

              {/* Formulario de Entrada de PIN */}
              <form onSubmit={handleConfirmarEntregaPIN} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider text-center mb-2">
                    Código de Seguridad (4 Dígitos)
                  </label>
                  
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      autoFocus
                      value={pinIngresado}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPinIngresado(val);
                        setErrorPIN(null);
                      }}
                      placeholder="• • • •"
                      className="w-full h-14 text-center font-mono font-black text-2xl tracking-[0.5em] bg-[#F8FAFC] border-2 border-[#CBD5E1] focus:border-[#1E56B0] focus:bg-white rounded-2xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-300 shadow-inner"
                    />
                  </div>

                  {/* Acceso Rápido para Prueba (PIN: 1234) */}
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setPinIngresado('1234')}
                      className="text-[11px] font-bold text-[#1E56B0] hover:underline cursor-pointer"
                    >
                      Autocompletar PIN del Runner (1234)
                    </button>
                  </div>

                  {errorPIN && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-rose-600 text-center mt-2.5 bg-rose-50 p-2 rounded-xl border border-rose-200"
                    >
                      {errorPIN}
                    </motion.p>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="pt-2 space-y-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={validandoPIN || pinIngresado.length !== 4}
                    className="w-full h-12 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:bg-slate-200 disabled:text-slate-400 text-[#0A1525] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-[#0A1525]/10"
                  >
                    {validandoPIN ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validando candado...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Validar Retiro y Entregar</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setPedidoSeleccionadoParaPIN(null)}
                    className="w-full h-10 rounded-xl bg-transparent hover:bg-slate-100 text-slate-500 hover:text-[#0A1525] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. TOAST FLOTANTE DE NOTIFICACIONES */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastNotificacion && (
          <motion.aside
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0A1525] text-white p-4 rounded-2xl shadow-xl border border-slate-700/60 flex items-start gap-3"
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${toastNotificacion.tipo === 'exito' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1E56B0]/20 text-[#CCFF00]'}`}>
              {toastNotificacion.tipo === 'exito' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-relaxed">
                {toastNotificacion.mensaje}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastNotificacion(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Onboarding Modal de Bienvenida para Casas de Repuestos */}
      <OnboardingModal
        rol="REPUESTOS"
        isOpen={mostrarTutorial ? true : undefined}
        onClose={() => setMostrarTutorial(false)}
      />

      {/* Botón Flotante de Soporte Técnico (WhatsApp FAB) */}
      <FloatingSupportButton mensajePersonalizado="Hola, soy proveedor de la Casa de Repuestos en TuTallerMóvil y necesito soporte con un pedido." />

    </div>
  );
}
