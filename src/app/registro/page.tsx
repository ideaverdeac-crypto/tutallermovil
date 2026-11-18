'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wrench,
  Bike,
  Store,
  Car,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const ROLES_REGISTRO = [
  {
    id: 'mecanico',
    titulo: 'Soy Mecánico',
    subtitulo: 'Especialista automotriz en calle',
    descripcion: 'Atiende servicios de mecánica ligera, diagnósticos y mantenimiento preventivo a domicilio en Caracas.',
    icono: Wrench,
    colorIcono: 'text-[#CCFF00]',
    bgIcono: 'bg-[#0A1525]',
    tag: 'Gana hasta $40/servicio',
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    prefijoCodigo: '#TTM-',
    ruta: '/registro/mecanico'
  },
  {
    id: 'runner',
    titulo: 'Soy Runner / Repartidor',
    subtitulo: 'Mensajería técnica express',
    descripcion: 'Transporta repuestos desde las tiendas aliadas hasta el vehículo del cliente con validación segura por PIN.',
    icono: Bike,
    colorIcono: 'text-white',
    bgIcono: 'bg-sky-600',
    tag: 'Tarifa fija por entrega express',
    tagBg: 'bg-sky-50 text-sky-800 border-sky-200',
    prefijoCodigo: '#RUN-',
    ruta: '/registro/runner'
  },
  {
    id: 'repuestos',
    titulo: 'Soy Casa de Repuestos',
    subtitulo: 'Proveedor y tienda aliada',
    descripcion: 'Publica tu catálogo B2B, recibe pedidos en tiempo real y despacha autopartes con cobro garantizado.',
    icono: Store,
    colorIcono: 'text-[#CCFF00]',
    bgIcono: 'bg-[#1E56B0]',
    tag: 'Ventas directas B2B',
    tagBg: 'bg-blue-50 text-blue-800 border-blue-200',
    prefijoCodigo: '#REP-',
    ruta: '/registro/repuestos'
  },
  {
    id: 'cliente',
    titulo: 'Soy Propietario / Cliente',
    subtitulo: 'Dueño de vehículo particular',
    descripcion: 'Registra tus carros, consulta su historial médico inmutable en la nube y pide asistencia mecánica en sitio.',
    icono: Car,
    colorIcono: 'text-[#0A1525]',
    bgIcono: 'bg-[#CCFF00]',
    tag: 'Pasaporte Vehicular Gratuito',
    tagBg: 'bg-slate-100 text-slate-800 border-slate-200',
    prefijoCodigo: 'CLIENTE',
    ruta: '/login-cliente?tab=registrarse'
  }
];

export default function RegistroHubPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] antialiased selection:bg-[#CCFF00] selection:text-[#0A1525] flex flex-col justify-between relative">
      
      {/* Fondo técnico de cuadrícula */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E56B0]" />
          <span>Volver al Inicio</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            ¿Ya tienes una cuenta o código?
          </span>
          <Link
            href="/login"
            className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
          </Link>
        </div>
      </header>

      {/* Contenido Central */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        
        {/* Encabezado Principal */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E56B0]/10 text-[#1E56B0] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#1E56B0]" />
            <span>Identidad Digital TuTallerMóvil 2027</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0A1525] tracking-tight">
            Únete a TuTallerMóvil
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Selecciona tu perfil en la plataforma. Al registrarte se te asignará un <strong>Código de Aliado único</strong> para identificarte y acceder a tus servicios.
          </p>
        </div>

        {/* Bento Grid con 4 Tarjetas Interactivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROLES_REGISTRO.map((item, index) => {
            const Icon = item.icono;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <Link
                  href={item.ruta}
                  className="h-full bg-white rounded-3xl border-2 border-slate-200/90 hover:border-[#1E56B0] p-6 flex flex-col justify-between space-y-5 transition-all shadow-xs hover:shadow-xl group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Icono + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl ${item.bgIcono} ${item.colorIcono} flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.tagBg}`}>
                        {item.prefijoCodigo}
                      </span>
                    </div>

                    {/* Títulos */}
                    <div>
                      <h2 className="text-lg font-black text-[#0A1525] group-hover:text-[#1E56B0] transition-colors">
                        {item.titulo}
                      </h2>
                      <span className="text-xs font-bold text-slate-400 block mt-0.5">
                        {item.subtitulo}
                      </span>
                    </div>

                    {/* Descripción */}
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {item.descripcion}
                    </p>
                  </div>

                  {/* Pie de Tarjeta / Acción */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#0A1525] group-hover:text-[#1E56B0]">
                    <span>Registrarme</span>
                    <ArrowRight className="w-4 h-4 text-[#1E56B0] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white/50 backdrop-blur-xs mt-12">
        <p>© 2026 TuTallerMóvil. Sistema de Identidad Digital Certificada para Aliados.</p>
      </footer>

    </div>
  );
}
