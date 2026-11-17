'use client';

import React from 'react';
import Link from 'next/link';
import {
  Kanban,
  ArrowLeft,
  Radio,
  SlidersHorizontal,
  Clock,
  ShieldAlert,
  Car,
  Wrench
} from 'lucide-react';

export default function TableroDespachoPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center text-slate-500 hover:text-[#0A1525] hover:bg-slate-50 transition-colors"
              title="Volver al Inicio"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#0A1525]">TTM</span>
              <span className="text-xs font-extrabold uppercase tracking-wider bg-[#0A1525] text-[#CCFF00] px-2.5 py-0.5 rounded">
                Admin Operadora
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Torre de Control Activa
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Encabezado del Tablero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#1E56B0] flex items-center justify-center text-white shadow-xs">
                <Kanban className="w-5 h-5 text-[#CCFF00]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                Tablero de Despacho
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Control central de servicios en tiempo real: Solicitudes, En Ruta, En Servicio y Finalizados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 px-4 text-xs font-bold bg-white border border-[#CBD5E1] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filtros Caracas</span>
            </button>
          </div>
        </div>

        {/* Placeholder / Estructura Inicial Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Columna 1: Solicitadas / Disponibles */}
          <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-4 min-h-[380px] shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Disponibles
              </span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Pendientes
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
              <Clock className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">
                Preparado para la conexión Kanban en tiempo real
              </p>
            </div>
          </div>

          {/* Columna 2: Asignadas / En Ruta */}
          <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-4 min-h-[380px] shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                En Ruta
              </span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Mecánico Asignado
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
              <Car className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">
                Mecánicos desplazándose al cliente
              </p>
            </div>
          </div>

          {/* Columna 3: En Diagnóstico / Servicio */}
          <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-4 min-h-[380px] shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                En Servicio
              </span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Diagnóstico Activo
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
              <Wrench className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">
                Intervención mecánica en curso
              </p>
            </div>
          </div>

          {/* Columna 4: Finalizados / Pagados */}
          <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-4 min-h-[380px] shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                Completados
              </span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Garantía Activa
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
              <ShieldAlert className="w-7 h-7 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">
                Historial y liquidación cerrada
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
