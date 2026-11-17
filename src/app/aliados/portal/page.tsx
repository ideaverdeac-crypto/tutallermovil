'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertTriangle
} from 'lucide-react';

type EstadoMecanico = 'DISPONIBLE' | 'EN_SERVICIO' | 'INACTIVO';

interface OrdenServicio {
  id: string;
  falla: string;
  modelo: string;
  sector: string;
  distancia: string;
  ganancia: string;
  tiempoEstimado: string;
  urgencia: 'ALTA' | 'ESTANDAR';
  cliente: string;
}

const ORDENES_DEMO: OrdenServicio[] = [
  {
    id: 'ORD-8412',
    falla: 'Frenos chirriando al frenar en bajada',
    modelo: 'Toyota Corolla 2018',
    sector: 'Chacao',
    distancia: '3.2 km',
    ganancia: '$45.00 USD',
    tiempoEstimado: '15 min de llegada',
    urgencia: 'ALTA',
    cliente: 'Andrés V.'
  },
  {
    id: 'ORD-8413',
    falla: 'Batería descargada / No enciende motor',
    modelo: 'Ford Fiesta 2014',
    sector: 'Las Mercedes',
    distancia: '1.8 km',
    ganancia: '$30.00 USD',
    tiempoEstimado: '8 min de llegada',
    urgencia: 'ALTA',
    cliente: 'Mariana G.'
  },
  {
    id: 'ORD-8414',
    falla: 'Escaneo OBD-II Check Engine parpadea',
    modelo: 'Chevrolet Cruze 2015',
    sector: 'Altamira',
    distancia: '4.5 km',
    ganancia: '$40.00 USD',
    tiempoEstimado: '20 min de llegada',
    urgencia: 'ESTANDAR',
    cliente: 'Roberto C.'
  },
  {
    id: 'ORD-8415',
    falla: 'Cambio de aceite sintético 5W-30 y filtros',
    modelo: 'Jeep Grand Cherokee 2019',
    sector: 'El Cafetal',
    distancia: '5.1 km',
    ganancia: '$60.00 USD',
    tiempoEstimado: '25 min de llegada',
    urgencia: 'ESTANDAR',
    cliente: 'Valeria S.'
  }
];

export default function PortalAliadosPage() {
  const [estado, setEstado] = useState<EstadoMecanico>('DISPONIBLE');
  const [activeTab, setActiveTab] = useState<'inicio' | 'historial' | 'billetera' | 'perfil'>('inicio');
  const [ordenesAceptadas, setOrdenesAceptadas] = useState<Record<string, boolean>>({});

  const handleAceptarServicio = (id: string) => {
    setOrdenesAceptadas((prev) => ({ ...prev, [id]: true }));
    setEstado('EN_SERVICIO');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans pb-28 md:pb-12 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Barra Superior con Notificaciones y Enlace a Home */}
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
              className="relative p-2 rounded-lg border border-[#CBD5E1] text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#CCFF00] ring-2 ring-white"></span>
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
                  <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center font-bold text-2xl tracking-tighter text-[#CCFF00]">
                    CM
                  </div>
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

            {/* Ubicación y zona operativa */}
            <div className="flex sm:flex-col items-center sm:items-end justify-center gap-1 text-xs text-slate-500 bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl sm:min-w-[160px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Zona de Cobertura
              </span>
              <span className="font-bold text-[#0A1525] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1E56B0]" /> Gran Caracas
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Radio: 10 KM activo</span>
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

            {/* Botones de Selección de Estado */}
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

        {/* 4. Feed de Servicios (Órdenes Disponibles en Tiempo Real) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A1525]">
                Órdenes Cercanas Disponibles
              </h2>
              <span className="bg-[#CCFF00] text-[#0A1525] font-extrabold text-xs px-2 py-0.5 rounded-full">
                {ORDENES_DEMO.length} activas
              </span>
            </div>

            <span className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              GPS en vivo
            </span>
          </div>

          {estado === 'INACTIVO' ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center space-y-3">
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
          ) : (
            <div className="space-y-4">
              {ORDENES_DEMO.map((orden, index) => {
                const yaAceptada = Boolean(ordenesAceptadas[orden.id]);

                return (
                  <motion.div
                    key={orden.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
                    whileHover={{ scale: 1.01 }}
                    className={`bg-white border-2 rounded-2xl p-5 sm:p-6 shadow-sm transition-all ${
                      yaAceptada
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-[#CBD5E1] hover:border-[#1E56B0]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Datos de la Orden */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {orden.id}
                          </span>
                          {orden.urgencia === 'ALTA' && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                              Urgencia Inmediata
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            Cliente: <strong className="text-slate-600">{orden.cliente}</strong>
                          </span>
                        </div>

                        {/* Falla Reportada en Grande */}
                        <h3 className="text-lg sm:text-xl font-extrabold text-[#0A1525] tracking-tight">
                          {orden.falla}
                        </h3>

                        {/* Modelo de Carro y Sector */}
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#0A1525]">
                            <Car className="w-4 h-4 text-[#1E56B0]" />
                            {orden.modelo}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {orden.sector} <strong className="text-[#1E56B0]">({orden.distancia})</strong>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {orden.tiempoEstimado}
                          </span>
                        </div>
                      </div>

                      {/* Ganancia y Botón de Aceptar */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Tu Ganancia
                          </span>
                          <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                            {orden.ganancia}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            Pago garantizado
                          </span>
                        </div>

                        {yaAceptada ? (
                          <div className="w-full lg:w-44 h-12 bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            <span>En Ruta al Cliente</span>
                          </div>
                        ) : (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAceptarServicio(orden.id)}
                            className="w-full lg:w-44 h-12 text-base font-extrabold bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#0A1525]/10"
                          >
                            <Navigation className="w-4 h-4 text-[#0A1525]" />
                            <span>Aceptar Servicio</span>
                          </motion.button>
                        )}
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

    </div>
  );
}
