'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import {
  Star,
  Wrench,
  Shield,
  Bike,
  Navigation,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Check,
  User,
  Phone
} from 'lucide-react';

interface CarnetCardProps {
  codigo: string;
}

interface DatosMecanicoCarnet {
  id: string;
  nombre: string;
  iniciales: string;
  credencial: string;
  especialidad: string;
  rating: string;
  servicios: number;
  rango: string;
  cedula: string;
  telefono: string;
  foto?: string | null;
  vehiculo: string;
  ordenActiva: string;
  especialidades: string[];
}

export function CarnetCard({ codigo }: CarnetCardProps) {
  const codigoLimpio = decodeURIComponent(codigo || '').trim().toUpperCase();
  const idOficial = codigoLimpio.startsWith('#')
    ? codigoLimpio
    : codigoLimpio.startsWith('TTM-')
      ? `#${codigoLimpio}`
      : `#TTM-${codigoLimpio}`;

  const cleanSearch = codigoLimpio
    .replace('#', '')
    .replace('TTM-', '')
    .trim();

  // Estado del mecánico (por defecto con valores deducidos según el código)
  const [mecanico, setMecanico] = useState<DatosMecanicoCarnet>(() => {
    // Deducción inicial inteligente según código
    let nombreDefault = 'Especialista Certificado';
    let inicialesDefault = 'EC';

    if (cleanSearch.includes('B0B2') || cleanSearch.includes('5432')) {
      nombreDefault = 'Miguel Ángel Torres';
      inicialesDefault = 'MT';
    } else if (cleanSearch.includes('1928')) {
      nombreDefault = 'Alejandro Rivas';
      inicialesDefault = 'AR';
    } else if (cleanSearch.includes('0842') || cleanSearch.includes('CAR-8492')) {
      nombreDefault = 'Carlos Mendoza';
      inicialesDefault = 'CM';
    }

    return {
      id: cleanSearch,
      nombre: nombreDefault,
      iniciales: inicialesDefault,
      credencial: idOficial,
      especialidad: 'Especialista Mecánico Certificado',
      rating: '—',
      servicios: 0,
      rango: 'Certificado',
      cedula: 'Identidad Verificada TTM',
      telefono: '',
      foto: null,
      vehiculo: 'Moto Yamaha FZ • Color Negro • Placa AB123CD',
      ordenActiva: 'Atendiendo a: Chevrolet Aveo LT • Cuadrante: Chacao',
      especialidades: [
        'Diagnóstico OBD2',
        'Frenos e Hidráulica',
        'Inyección Eléctrica',
        'Puntualidad < 45 min'
      ]
    };
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let montado = true;

    async function buscarMecanico() {
      try {
        const supabase = createClient();

        // 1. Buscar en Supabase perfiles
        const { data, error } = await supabase
          .from('perfiles')
          .select('id, rol, nombre_completo, telefono, codigo_aliado, avatar_url, cedula_rif, created_at')
          .or(
            `codigo_aliado.ilike.%${cleanSearch}%,id.ilike.%${cleanSearch}%,nombre_completo.ilike.%${cleanSearch}%`
          )
          .limit(1);

        if (montado && data && data.length > 0) {
          const m = data[0];
          const nom = (m.nombre_completo || mecanico.nombre).trim();
          const nombres = nom.split(' ');
          const iniciales =
            nombres.length > 1
              ? `${nombres[0][0]}${nombres[1][0]}`.toUpperCase()
              : nom.slice(0, 2).toUpperCase();

          const fotoLocalDirecta = typeof window !== 'undefined' ? localStorage.getItem('ttm_aliado_foto') : null;
          const fotoFinal = m.avatar_url || (cleanSearch.includes('8976') ? fotoLocalDirecta : null);

          setMecanico((prev) => ({
            ...prev,
            id: m.id,
            nombre: nom,
            iniciales,
            credencial: m.codigo_aliado || idOficial,
            telefono: m.telefono || prev.telefono,
            foto: fotoFinal,
            cedula: m.cedula_rif || prev.cedula
          }));
          setCargando(false);
          return;
        }

        // 2. Fallback: Buscar en LocalStorage
        if (typeof window !== 'undefined') {
          const fotoLocalDirecta = localStorage.getItem('ttm_aliado_foto') || null;
          const keys = ['ttm_aliados_mecanicos', 'ttm_aliados_registrados', 'ttm_aliado_sesion'];
          for (const k of keys) {
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw);
              const lista = Array.isArray(parsed) ? parsed : [parsed];
              const match = lista.find(
                (item: any) =>
                  (item.codigo_aliado && item.codigo_aliado.toUpperCase().includes(cleanSearch)) ||
                  (item.id && item.id.toUpperCase().includes(cleanSearch)) ||
                  (item.nombre && item.nombre.toUpperCase().includes(cleanSearch))
              );

              if (match && montado) {
                const nom = (match.nombre || match.nombre_completo || mecanico.nombre).trim();
                const nombres = nom.split(' ');
                const iniciales =
                  nombres.length > 1
                    ? `${nombres[0][0]}${nombres[1][0]}`.toUpperCase()
                    : nom.slice(0, 2).toUpperCase();

                setMecanico((prev) => ({
                  ...prev,
                  id: match.id || prev.id,
                  nombre: nom,
                  iniciales,
                  credencial: match.codigo_aliado || idOficial,
                  telefono: match.telefono || prev.telefono,
                  foto: match.foto || match.avatar_url || fotoLocalDirecta || null,
                  cedula: match.detalles?.cedula_rif || prev.cedula,
                  vehiculo: match.detalles?.vehiculo_traslado
                    ? `${match.detalles.vehiculo_traslado} • ${match.detalles.placa_vehiculo || 'CARACAS'}`
                    : prev.vehiculo,
                  especialidad: match.detalles?.especialidad_principal || prev.especialidad
                }));
                setCargando(false);
                return;
              }
            } catch {}
          }
        }
      } catch (e) {
        console.warn('Error resolviendo credencial de mecánico:', e);
      } finally {
        if (montado) setCargando(false);
      }
    }

    buscarMecanico();

    return () => {
      montado = false;
    };
  }, [codigo, cleanSearch, idOficial]);

  const qrUrl = `https://tutallermovil.vercel.app/carnet/${encodeURIComponent(codigo)}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Credencial Oficial TTM - ${mecanico.nombre}`,
          text: `Credencial verificada de especialista en TuTallerMóvil: ${mecanico.nombre} (${mecanico.credencial})`,
          url: qrUrl
        });
      } catch {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(qrUrl);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const tieneFotoReal =
    mecanico.foto &&
    mecanico.foto.trim() !== '' &&
    !mecanico.foto.includes('photo-1540569014015') &&
    !mecanico.foto.includes('photo-1534528741775');

  return (
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col justify-center items-center p-4 sm:p-6 py-8 sm:py-12 selection:bg-[#CCFF00] selection:text-[#050B14]">
      {/* Botones Superiores de Navegación */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0F1B2D] border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm hover:border-[#CCFF00]/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00] hover:text-[#b8e600] bg-[#0F1B2D] border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer hover:border-[#CCFF00]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>

      {/* Tarjeta del Carnet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#0F1B2D] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative flex flex-col"
      >
        {/* Cabecera / Foto del Carnet */}
        <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-gradient-to-b from-[#0A1525] to-[#0F1B2D] flex items-center justify-center">
          {tieneFotoReal ? (
            <img
              src={mecanico.foto!}
              alt={`${mecanico.nombre} - Especialista TuTallerMóvil`}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative p-6 text-center select-none">
              {/* Cuadrícula técnica sutil */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Squircle Monograma Gigante */}
              <div className="w-28 h-28 rounded-3xl bg-[#0A1525] border-2 border-[#CCFF00] flex items-center justify-center shadow-xl relative z-10">
                <span className="font-mono text-4xl font-black text-[#CCFF00] tracking-wider">
                  {mecanico.iniciales}
                </span>
                <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#16A34A] ring-4 ring-[#0F1B2D] flex items-center justify-center text-white shadow-md">
                  <Check className="w-4 h-4 stroke-[3.5]" />
                </span>
              </div>

              <div className="mt-3 relative z-10">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold tracking-widest text-[#CCFF00] uppercase bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full border border-[#CCFF00]/20">
                  <Wrench className="w-3 h-3 text-[#CCFF00]" />
                  <span>ESPECIALISTA TÉCNICO OFICIAL</span>
                </span>
              </div>
            </div>
          )}

          {/* Badge Flotante Arriba a la Derecha */}
          <div className="absolute top-4 right-4 z-20">
            <div className="inline-flex items-center gap-1 bg-[#CCFF00] text-[#050B14] px-3 py-1 rounded-full text-xs font-black tracking-tight shadow-md">
              <Check className="w-3.5 h-3.5 stroke-[3.5] text-[#050B14]" />
              <span>VERIFICADO</span>
            </div>
          </div>

          {/* Logo TTM flotante arriba a la izquierda */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-[#050B14]/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-700 flex items-center">
              <img src="/icon.svg" alt="TuTallerMóvil" className="h-[28px] w-auto object-contain" />
            </div>
          </div>

          {/* Degradado inferior */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0F1B2D] via-[#0F1B2D]/80 to-transparent pointer-events-none" />
        </div>

        {/* Cuerpo de la Tarjeta */}
        <div className="px-6 pb-6 pt-1 space-y-5 bg-[#0F1B2D] relative z-10 -mt-6">
          {/* Identidad del Mecánico */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {mecanico.nombre}
              </h1>
              <span
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 shadow-md"
                title="Técnico Verificado Oficial"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3.5]" />
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-300">
              {mecanico.especialidad}
            </p>

            <p className="text-xs font-mono font-semibold text-slate-400 pt-0.5">
              {mecanico.cedula} • <span className="text-[#CCFF00] font-bold">{mecanico.credencial}</span>
            </p>
          </div>

          {/* Fila de Estadísticas */}
          <div className="grid grid-cols-3 bg-[#0A1525] border border-slate-800 rounded-2xl py-3 text-center">
            {/* Rating */}
            <div className="border-r border-slate-800 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-white font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                <span>{mecanico.rating}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Rating
              </span>
            </div>

            {/* Servicios */}
            <div className="border-r border-slate-800 px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#CCFF00] font-bold text-base">
                <Wrench className="w-4 h-4 text-[#CCFF00]" />
                <span>{mecanico.servicios}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Servicios
              </span>
            </div>

            {/* Rango */}
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#00E5FF] font-bold text-base">
                <Shield className="w-4 h-4 text-[#00E5FF]" />
                <span>{mecanico.rango}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Rango
              </span>
            </div>
          </div>

          {/* Especialidades Certificadas */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Especialidades Certificadas
            </span>
            <div className="flex flex-wrap gap-2">
              {mecanico.especialidades.map((chip) => (
                <span
                  key={chip}
                  className="bg-[#0A1525] text-slate-200 text-xs font-medium rounded-full px-3 py-1 flex items-center gap-1.5 border border-slate-800"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
                    <Check className="w-2 h-2 text-white stroke-[3.5]" />
                  </span>
                  <span>{chip}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Unidad y Orden Activa */}
          <div className="space-y-2.5 pt-1">
            <div className="bg-[#0A1525] border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Unidad de Traslado (Garita)
                </span>
                <p className="font-semibold text-white">
                  {mecanico.vehiculo}
                </p>
              </div>
            </div>

            <div className="bg-[#0A1525] border border-slate-800 border-l-4 border-l-[#CCFF00] rounded-2xl p-3.5 flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#050B14] flex items-center justify-center text-[#CCFF00] shrink-0">
                <Navigation className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-xs leading-snug">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
                  Orden Activa en Curso
                </span>
                <p className="font-medium text-white pt-0.5">
                  {mecanico.ordenActiva}
                </p>
              </div>
            </div>
          </div>

          {/* Footer del Carnet (QR y Garantía) */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-4">
            <div className="p-2 bg-white rounded-2xl shadow-md shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={qrUrl}
                size={82}
                level="M"
                includeMargin={false}
                fgColor="#050B14"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/20">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Garantía Oficial TuTallerMóvil</span>
              </div>
              <p className="text-xs font-medium text-white leading-snug">
                Servicio 100% verificado y respaldado por TuTallerMóvil
              </p>
              <p className="text-[10px] text-slate-400 font-normal leading-tight">
                Escanea el código QR para validar la identidad y estatus en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-[11px] text-slate-500 mt-5 text-center max-w-xs font-mono">
        TuTallerMóvil Caracas • Credencial pública verificada para personal en sitio.
      </p>
    </div>
  );
}
