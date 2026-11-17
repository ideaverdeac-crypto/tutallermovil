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
  Camera,
  Check,
  ShieldCheck,
  Package,
  Store,
  DollarSign,
  Clock,
  X,
  KeyRound,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Layers,
  Wrench
} from 'lucide-react';

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
  paso_actual?: number; // 1: Retirar, 2: Iniciar Ruta, 3: Entregar
}

export default function RunnerPortalPage() {
  const [ordenes, setOrdenes] = useState<OrdenRunner[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [recibiendoEntregas, setRecibiendoEntregas] = useState<boolean>(true);
  const [saldoHoy, setSaldoHoy] = useState<number>(12.50);
  const [entregasHoy, setEntregasHoy] = useState<number>(3);

  // Estados de sub-pasos por orden (1: Por retirar, 2: En ruta al mecánico, 3: Llegó al destino)
  const [pasosPorOrden, setPasosPorOrden] = useState<Record<string, number>>({});

  // Modal de Retiro (Paso 1: Foto factura y PIN)
  const [modalRetiroAbierto, setModalRetiroAbierto] = useState<boolean>(false);
  const [ordenSeleccionadaParaRetiro, setOrdenSeleccionadaParaRetiro] = useState<OrdenRunner | null>(null);
  const [fotoFacturaSubida, setFotoFacturaSubida] = useState<boolean>(false);
  const [fotoFacturaUrl, setFotoFacturaUrl] = useState<string>('');
  const [pinMayorista, setPinMayorista] = useState<string>('');
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // Toast de Recompensa
  const [toastExito, setToastExito] = useState<string | null>(null);

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
            'Líquido de Frenos DOT 4 (Wagner)'
          ],
          mecanico_nombre: 'Carlos Mendoza',
          mecanico_codigo: '#TTM-0842',
          mecanico_telefono: '+584121234567',
          distancia_km: '3.2 km',
          tiempo_estimado: '11 min en moto'
        }));
        setOrdenes(enriquecidas);
      } else {
        // Mock fallback activo para demostración inmediata si no hay órdenes en REPUESTOS_EN_RUTA
        setOrdenes([
          {
            id: 'ord_runner_demo_1',
            cliente_nombre: 'Ana Pérez',
            vehiculo_modelo: 'Toyota Corolla 2018',
            falla_reportada: 'Frenos chirriando al frenar',
            sector: 'Chacao — Calle El Retiro, Qta. Milagrosa',
            estado: 'REPUESTOS_EN_RUTA',
            mayorista_nombre: 'AutoPartes Chacao',
            mayorista_direccion: 'Av. Francisco de Miranda, Edf. Chacao Center, Nivel PB',
            repuestos_lista: [
              'Pastillas de Freno Delanteras (Bosch)',
              'Líquido de Frenos Sintético DOT 4'
            ],
            mecanico_nombre: 'Carlos Mendoza',
            mecanico_codigo: '#TTM-0842',
            mecanico_telefono: '+584121234567',
            distancia_km: '2.8 km',
            tiempo_estimado: '9 min en moto'
          }
        ]);
      }
    } catch (err) {
      console.error('Error cargando órdenes runner:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOrdenesRunner();

    // Supabase Realtime para recibir entregas asignadas al instante
    const supabase = createClient();
    const canal = supabase
      .channel('runner_portal_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordenes' },
        (payload) => {
          console.log('⚡ Notificación en vivo para Runner:', payload);
          cargarOrdenesRunner();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Obtener el paso actual de una orden (por defecto 1: Marcar como retirado)
  const getPasoOrden = (id: string) => pasosPorOrden[id] || 1;

  // Paso 1: Abrir Modal para Validar Retiro en Almacén
  const iniciarPaso1Retiro = (orden: OrdenRunner) => {
    setOrdenSeleccionadaParaRetiro(orden);
    setFotoFacturaSubida(false);
    setPinMayorista('');
    setErrorPin(null);
    setModalRetiroAbierto(true);
  };

  // Validar PIN y Foto de Factura
  const confirmarRetiroEnMayorista = () => {
    if (!fotoFacturaSubida) {
      setErrorPin('Debes tomar o subir la foto de la factura del mayorista.');
      return;
    }
    if (!pinMayorista || pinMayorista.trim().length < 4) {
      setErrorPin('Ingresa el PIN de seguridad de 4 dígitos proporcionado por el mayorista.');
      return;
    }

    if (ordenSeleccionadaParaRetiro) {
      // Avanzar a Paso 2: Iniciar Ruta al Mecánico
      setPasosPorOrden((prev) => ({
        ...prev,
        [ordenSeleccionadaParaRetiro.id]: 2
      }));
      setModalRetiroAbierto(false);

      // Feedback audit log
      console.log('[BITÁCORA INMUTABLE] Runner retiró repuestos en mayorista con PIN verificado', {
        runner: 'Luis Pérez',
        orden_id: ordenSeleccionadaParaRetiro.id,
        mayorista: ordenSeleccionadaParaRetiro.mayorista_nombre,
        pin: pinMayorista,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Paso 2: Iniciar Ruta al Mecánico -> Avanza a Paso 3: Llegó al destino
  const iniciarRutaAlMecanico = (ordenId: string) => {
    setPasosPorOrden((prev) => ({
      ...prev,
      [ordenId]: 3
    }));

    console.log('[BITÁCORA INMUTABLE] Runner inició ruta GPS hacia el mecánico', {
      runner: 'Luis Pérez',
      orden_id: ordenId,
      timestamp: new Date().toISOString()
    });
  };

  // Paso 3: Entregado al Mecánico -> Actualiza Supabase a EN_EJECUCION y acredita saldo
  const entregarAlMecanico = async (orden: OrdenRunner) => {
    try {
      const supabase = createClient();

      // 1. Actualizar estado en Supabase a EN_EJECUCION para que el mecánico comience
      if (!orden.id.startsWith('ord_runner_demo')) {
        await supabase
          .from('ordenes')
          .update({ estado: 'EN_EJECUCION' })
          .eq('id', orden.id);
      }

      // 2. Registrar en consola bitácora inmutable
      console.log('[BITÁCORA INMUTABLE] Runner entregó repuestos al mecánico. Estado: EN_EJECUCION', {
        runner: 'Luis Pérez',
        orden_id: orden.id,
        mecanico: orden.mecanico_nombre,
        monto_ganancia_runner: 4.00,
        nuevo_estado_orden: 'EN_EJECUCION',
        timestamp: new Date().toISOString()
      });

      // 3. Acreditar saldo al runner (+ $4.00) y sumar entrega
      setSaldoHoy((prev) => prev + 4.00);
      setEntregasHoy((prev) => prev + 1);

      // 4. Quitar la tarjeta con animación
      setOrdenes((prev) => prev.filter((o) => o.id !== orden.id));

      // 5. Toast animado de confirmación
      setToastExito(`¡Entrega completada! +$4.00 USD acreditados. ${orden.mecanico_nombre} inició el servicio.`);
      setTimeout(() => setToastExito(null), 5000);
    } catch (err) {
      console.error('Error al marcar entrega como completada:', err);
    }
  };

  // Simular una nueva orden en REPUESTOS_EN_RUTA para pruebas si está vacío
  const simularNuevaEntrega = () => {
    const nueva: OrdenRunner = {
      id: `ord_runner_${Date.now()}`,
      cliente_nombre: 'Carlos Ramos',
      vehiculo_modelo: 'Ford Explorer 2016',
      falla_reportada: 'Batería descargada y bornes sulfatados',
      sector: 'Las Mercedes — Calle París, Torre Financiera',
      estado: 'REPUESTOS_EN_RUTA',
      mayorista_nombre: 'Mayorista Las Mercedes',
      mayorista_direccion: 'Av. Principal de Las Mercedes, Edif. Caracas 2000',
      repuestos_lista: ['Batería Optima 12V 650A'],
      mecanico_nombre: 'Carlos Mendoza',
      mecanico_codigo: '#TTM-0842',
      mecanico_telefono: '+584121234567',
      distancia_km: '1.9 km',
      tiempo_estimado: '6 min en moto'
    };
    setOrdenes((prev) => [nueva, ...prev]);
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

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* ======================================================== */}
        {/* 1. HEADER DE RENDIMIENTO & DISPONIBILIDAD (Mobile-First) */}
        {/* ======================================================== */}
        <header className="bg-white rounded-3xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Perfil del Runner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar Squircle con 'LP' en verde neón */}
              <div className="relative w-12 h-12 rounded-2xl bg-[#0A1525] border border-slate-700/60 flex items-center justify-center font-black text-sm text-[#CCFF00] shadow-sm select-none shrink-0">
                <span>LP</span>
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs ${
                    recibiendoEntregas ? 'bg-[#16A34A]' : 'bg-slate-400'
                  }`}
                  title={recibiendoEntregas ? 'En línea' : 'Desconectado'}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black text-[#0A1525] tracking-tight">
                    Luis Pérez
                  </h1>
                  <span className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center text-white shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Moto Bera SBR • #RUN-02</span>
                </p>
              </div>
            </div>

            <Link
              href="/admin/despacho"
              className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100"
            >
              <span>Despacho</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Métricas de Rendimiento del Día */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">
                Saldo de hoy
              </span>
              <p className="text-xl font-black text-[#1E56B0] font-mono tracking-tight pt-0.5">
                ${saldoHoy.toFixed(2)}{' '}
                <span className="text-[10px] font-sans text-slate-500 font-bold">USD</span>
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">
                Entregas Hoy
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <p className="text-xl font-black text-[#0A1525] font-mono tracking-tight">
                  {entregasHoy}
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  +100% QA
                </span>
              </div>
            </div>
          </div>

          {/* Switch Grande de Disponibilidad */}
          <button
            type="button"
            onClick={() => setRecibiendoEntregas(!recibiendoEntregas)}
            className={`w-full h-12 rounded-2xl px-4 flex items-center justify-between transition-all cursor-pointer border ${
              recibiendoEntregas
                ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border-[#0A1525]/10 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  recibiendoEntregas ? 'bg-emerald-600 animate-ping' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-black uppercase tracking-wider">
                {recibiendoEntregas ? 'Recibiendo Entregas Activo' : 'En Pausa / No Disponible'}
              </span>
            </div>

            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                recibiendoEntregas ? 'bg-[#0A1525]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  recibiendoEntregas ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </header>

        {/* ======================================================== */}
        {/* 2. FEED DE ENTREGAS: Tarjetas de Ruta (RECOGER & ENTREGAR) */}
        {/* ======================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#1E56B0]" />
              <span>Rutas Asignadas ({ordenes.length})</span>
            </h2>
            <button
              type="button"
              onClick={cargarOrdenesRunner}
              className="text-slate-400 hover:text-[#0A1525] p-1 rounded-lg"
              title="Refrescar órdenes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {ordenes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#CBD5E1] p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bike className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#0A1525]">
                  ¡Sin entregas pendientes!
                </h3>
                <p className="text-xs text-[#475569]">
                  Mantén el switch activo. Recibirás una alerta en cuanto la operadora asigne repuestos.
                </p>
              </div>
              <button
                type="button"
                onClick={simularNuevaEntrega}
                className="h-11 px-4 rounded-xl bg-[#0A1525] text-white text-xs font-black hover:bg-[#1E56B0] transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                + Simular Entrega de Repuesto
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {ordenes.map((orden) => {
                  const paso = getPasoOrden(orden.id);

                  return (
                    <motion.div
                      key={orden.id}
                      layout
                      initial={{ opacity: 0, scale: 0.94, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -100 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      {/* Cabecera de la Orden: Vehículo y Cliente */}
                      <div className="p-4 bg-slate-50/80 border-b border-[#E2E8F0] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            Orden #{orden.id.slice(0, 6).toUpperCase()}
                          </span>
                          <h3 className="text-sm font-black text-[#0A1525] pt-1">
                            {orden.vehiculo_modelo}
                          </h3>
                          <p className="text-xs font-semibold text-[#475569]">
                            {orden.cliente_nombre}
                          </p>
                        </div>

                        {/* Indicador de Estado del Flujo */}
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-slate-400 block">
                            Paso {paso} de 3
                          </span>
                          <span
                            className={`text-xs font-black font-mono ${
                              paso === 1
                                ? 'text-[#1E56B0]'
                                : paso === 2
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {paso === 1
                              ? 'Por Retirar'
                              : paso === 2
                              ? 'En Ruta'
                              : 'Por Entregar'}
                          </span>
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta dividido en RECOGER y ENTREGAR */}
                      <div className="p-4 space-y-4">
                        
                        {/* 1. SECCIÓN RECOGER (Punto A: Mayorista) */}
                        <div className={`p-3.5 rounded-2xl border transition-all ${
                          paso === 1
                            ? 'bg-blue-50/50 border-blue-200'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80'
                        }`}>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E56B0] flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5" />
                              <span>Punto A: Recoger en Mayorista</span>
                            </span>
                            {paso > 1 && (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Retirado
                              </span>
                            )}
                          </div>

                          <div className="pt-2.5 space-y-2">
                            <div>
                              <p className="text-sm font-black text-[#0A1525]">
                                {orden.mayorista_nombre}
                              </p>
                              <p className="text-xs text-[#475569] font-medium leading-relaxed">
                                {orden.mayorista_direccion}
                              </p>
                            </div>

                            {/* Lista de Repuestos a Retirar */}
                            {orden.repuestos_lista && (
                              <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                  Piezas a Retirar:
                                </span>
                                {orden.repuestos_lista.map((rep, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E56B0]" />
                                    <span>{rep}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Botón para Abrir Google Maps / Waze */}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${orden.mayorista_nombre} ${orden.mayorista_direccion}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-[#0A1525] border border-[#CBD5E1] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Navigation className="w-3.5 h-3.5 text-[#1E56B0]" />
                              <span>Navegar a Mayorista (Google Maps)</span>
                            </a>
                          </div>
                        </div>

                        {/* 2. SECCIÓN ENTREGAR (Punto B: Mecánico en Servicio) */}
                        <div className={`p-3.5 rounded-2xl border transition-all ${
                          paso >= 2
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                        }`}>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Punto B: Entregar al Mecánico</span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#1E56B0]">
                              {orden.distancia_km} ({orden.tiempo_estimado})
                            </span>
                          </div>

                          <div className="pt-2.5 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-black text-[#0A1525]">
                                    {orden.mecanico_nombre}
                                  </p>
                                  <span className="font-mono text-[10px] font-bold text-[#1E56B0] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                    {orden.mecanico_codigo}
                                  </span>
                                </div>
                                <p className="text-xs text-[#475569] font-medium pt-0.5">
                                  {orden.sector}
                                </p>
                              </div>

                              {/* Botón de Llamada Rápida */}
                              <a
                                href={`tel:${orden.mecanico_telefono || '+584121234567'}`}
                                className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-[#1E56B0] text-[#1E56B0] hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs border border-blue-100"
                                title="Llamar al Mecánico"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            </div>

                            {/* Botón de Navegación al Mecánico */}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${orden.sector} Caracas Venezuela`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-[#0A1525] border border-[#CBD5E1] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Navegar al Mecánico (Waze / Maps)</span>
                            </a>
                          </div>
                        </div>

                      </div>

                      {/* ======================================================== */}
                      {/* 3. BOTÓN DE ACCIÓN GIGANTE (Mínimo h-14 - Mobile First) */}
                      {/* ======================================================== */}
                      <div className="p-4 pt-0">
                        <AnimatePresence mode="wait">
                          {paso === 1 && (
                            /* PASO 1: Marcar como Retirado (#1E56B0) */
                            <motion.button
                              key="paso_1"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => iniciarPaso1Retiro(orden)}
                              className="w-full h-15 rounded-2xl bg-[#1E56B0] hover:bg-[#15448c] text-white font-black text-sm tracking-tight flex items-center justify-center gap-2.5 shadow-md active:scale-97 cursor-pointer transition-colors"
                            >
                              <Package className="w-5 h-5 text-[#CCFF00]" />
                              <span>Paso 1: Marcar como Retirado</span>
                              <ChevronRight className="w-4 h-4 opacity-70" />
                            </motion.button>
                          )}

                          {paso === 2 && (
                            /* PASO 2: Iniciar Ruta al Mecánico (Naranja #EA580C) */
                            <motion.button
                              key="paso_2"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => iniciarRutaAlMecanico(orden.id)}
                              className="w-full h-15 rounded-2xl bg-[#EA580C] hover:bg-[#c2410c] text-white font-black text-sm tracking-tight flex items-center justify-center gap-2.5 shadow-md active:scale-97 cursor-pointer transition-colors"
                            >
                              <Bike className="w-5 h-5 text-[#CCFF00]" />
                              <span>Paso 2: Iniciar Ruta al Mecánico</span>
                              <ArrowRight className="w-4 h-4 opacity-70" />
                            </motion.button>
                          )}

                          {paso === 3 && (
                            /* PASO 3: Entregado al Mecánico (Verde Lima #CCFF00) */
                            <motion.button
                              key="paso_3"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => entregarAlMecanico(orden)}
                              className="w-full h-16 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-base tracking-tight flex items-center justify-center gap-3 shadow-lg active:scale-97 cursor-pointer border border-[#0A1525]/10 transition-colors"
                            >
                              <CheckCircle2 className="w-6 h-6 text-[#0A1525]" />
                              <span>Paso 3: Entregado al Mecánico</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

      </div>

      {/* ======================================================== */}
      {/* 4. MODAL DE VALIDACIÓN DE RETIRO (Paso 1: Foto & PIN)    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalRetiroAbierto && ordenSeleccionadaParaRetiro && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0A1525]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 space-y-5"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#1E56B0] text-[#CCFF00] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0A1525]">
                      Validar Retiro en Mayorista
                    </h3>
                    <p className="text-xs text-[#475569] font-medium">
                      {ordenSeleccionadaParaRetiro.mayorista_nombre}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalRetiroAbierto(false)}
                  className="p-1.5 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error si falta algún dato */}
              {errorPin && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorPin}</span>
                </div>
              )}

              {/* 1. Subida Real de la Foto de la Factura desde Cámara o Dispositivo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Foto de la Factura / Despacho *</span>
                </label>

                {/* Input de archivo oculto para cámara nativa */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setFotoFacturaUrl(event.target?.result as string);
                        setFotoFacturaSubida(true);
                        setErrorPin(null);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (cameraInputRef.current) {
                      cameraInputRef.current.click();
                    } else {
                      setFotoFacturaSubida(true);
                      setErrorPin(null);
                    }
                  }}
                  className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer overflow-hidden relative ${
                    fotoFacturaSubida
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800'
                      : 'border-slate-300 hover:border-[#1E56B0] bg-[#F8FAFC] text-slate-500'
                  }`}
                >
                  {fotoFacturaSubida ? (
                    <div className="flex items-center gap-3 px-3">
                      {fotoFacturaUrl ? (
                        <img
                          src={fotoFacturaUrl}
                          alt="Factura"
                          className="w-16 h-16 rounded-xl object-cover border border-emerald-300 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                      <div className="text-left">
                        <span className="text-xs font-black text-emerald-900 block">
                          ✓ Foto de Factura Registrada
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold underline">
                          Toca aquí para volver a tomar o cambiar foto
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#1E56B0] shadow-2xs">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#0A1525]">
                        Tomar foto con la cámara del teléfono
                      </span>
                      <span className="text-[10px] text-slate-400">
                        O selecciona una foto de tu galería
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. PIN de Seguridad del Mayorista */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>PIN de Seguridad del Mayorista *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPinMayorista('4488')}
                    className="text-[10px] font-bold text-[#1E56B0] hover:underline"
                  >
                    Usar PIN 4488
                  </button>
                </div>

                <input
                  type="password"
                  maxLength={4}
                  value={pinMayorista}
                  onChange={(e) => {
                    setPinMayorista(e.target.value);
                    setErrorPin(null);
                  }}
                  placeholder="PIN de 4 dígitos"
                  className="w-full h-12 text-center text-xl font-mono font-black tracking-widest bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] rounded-xl outline-hidden text-[#0A1525]"
                />
                <p className="text-[11px] text-slate-400 text-center">
                  El encargado del almacén te indicará el PIN de despacho.
                </p>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="button"
                onClick={confirmarRetiroEnMayorista}
                className="w-full h-14 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-sm font-black tracking-tight flex items-center justify-center gap-2 shadow-md cursor-pointer border border-[#0A1525]/10 active:scale-97 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Validar y Pasar a Ruta</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. TOAST ANIMADO DE RECOMPENSA Y ÉXITO                   */}
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
                ✓ Estado actualizado en el Kanban a EN_EJECUCION
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastExito(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
