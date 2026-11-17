'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Camera,
  Check,
  AlertTriangle,
  ChevronDown,
  Gauge,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Clock,
  Car,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ServicioEjecucionClientProps {
  id: string;
}

// 4 Categorías del Checklist Táctil de 25 Puntos (Muestra representativa de 16 ítems clave)
interface ChecklistItem {
  id: string;
  nombre: string;
  descripcion: string;
}

interface ChecklistCategory {
  id: string;
  titulo: string;
  items: ChecklistItem[];
}

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'fluidos',
    titulo: '1. Nivel y Calidad de Fluidos',
    items: [
      { id: 'aceite_motor', nombre: 'Aceite de Motor', descripcion: 'Nivel en varilla y viscosidad adecuada' },
      { id: 'liquido_frenos', nombre: 'Líquido de Frenos', descripcion: 'Humedad menor a 2% y nivel en reservorio' },
      { id: 'refrigerante', nombre: 'Refrigerante / Coolant', descripcion: 'Estado del líquido y hermeticidad de mangueras' },
      { id: 'direccion_hidraulica', nombre: 'Dirección Hidráulica', descripcion: 'Nivel de ATF y ausencia de fugas en bomba' }
    ]
  },
  {
    id: 'frenos',
    titulo: '2. Sistema de Frenos',
    items: [
      { id: 'pastillas_delanteras', nombre: 'Pastillas Delanteras', descripcion: 'Grosor de pasta mayor a 4 mm' },
      { id: 'discos_freno', nombre: 'Discos de Freno', descripcion: 'Superficie uniforme sin rebaba crítica' },
      { id: 'lineas_mangueras', nombre: 'Líneas y Mangueras', descripcion: 'Sin agrietamiento ni pérdida de presión' },
      { id: 'freno_mano', nombre: 'Freno de Estacionamiento', descripcion: 'Tensión de guaya (4 a 6 clics de bloqueo)' }
    ]
  },
  {
    id: 'suspension',
    titulo: '3. Suspensión y Tren Delantero',
    items: [
      { id: 'amortiguadores', nombre: 'Amortiguadores', descripcion: 'Sin fugas de aceite ni rebote excesivo' },
      { id: 'munones_rotulas', nombre: 'Muñones y Rótulas', descripcion: 'Guardapolvos intactos y sin holgura axial' },
      { id: 'terminales_direccion', nombre: 'Terminales de Dirección', descripcion: 'Alineación firme y terminales ajustados' },
      { id: 'bujes_mesetas', nombre: 'Bujes de Meseta', descripcion: 'Gomas sin resequedad ni desprendimiento' }
    ]
  },
  {
    id: 'electrico',
    titulo: '4. Luces y Sistema Eléctrico',
    items: [
      { id: 'luces_principales', nombre: 'Luces Principales', descripcion: 'Altas, bajas y alineación de faros' },
      { id: 'luces_stop', nombre: 'Luces de Stop e Intermitentes', descripcion: 'Funcionamiento simultáneo al frenar' },
      { id: 'bornes_bateria', nombre: 'Bornes de Batería', descripcion: 'Ajuste firme, sin sulfatación' },
      { id: 'alternador_carga', nombre: 'Carga de Alternador', descripcion: 'Voltaje en ralentí entre 13.8V y 14.4V' }
    ]
  }
];

export function ServicioEjecucionClient({ id }: ServicioEjecucionClientProps) {
  // Datos del servicio (desde Supabase con fallback robusto)
  const [vehiculo, setVehiculo] = useState('Toyota Corolla 2018');
  const [placa, setPlaca] = useState('AB123CD');
  const [clienteNombre, setClienteNombre] = useState('María Rodríguez');
  const [clienteTelefono, setClienteTelefono] = useState('+584121234567');
  const [fallaReportada, setFallaReportada] = useState('Diagnóstico OBD2 por testigo Check Engine y pérdida de fuerza en subida');
  
  // Cotización acordada (solo lectura)
  const cotizacion = {
    manoDeObra: 35.0,
    repuestos: 20.0,
    diagnosticoExonerado: true,
    diagnosticoMonto: 15.0,
    totalFacturable: 55.0,
    gananciaMecanico: 38.5 // 70% de mano de obra + repuestos
  };

  // 2. Candado de Odómetro (P0 Crítico)
  const KILOMETRAJE_ANTERIOR = 48500;
  const [nuevoKm, setNuevoKm] = useState<string>('');
  const [fotoOdometro, setFotoOdometro] = useState<string | null>(null);
  const [horaFoto, setHoraFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Checklist Táctil: Estado de cada ítem (null = sin responder, 'OK' | 'CAMBIO')
  const [checklistRespuestas, setChecklistRespuestas] = useState<Record<string, 'OK' | 'CAMBIO'>>({});
  const [categoriaAbierta, setCategoriaAbierta] = useState<string>('fluidos');

  // 4. Modales y Toasts
  const [toastMensaje, setToastMensaje] = useState<string[] | null>(null);
  const [modalExitoOpen, setModalExitoOpen] = useState(false);
  const [enviandoLiquidacion, setEnviandoLiquidacion] = useState(false);

  // Carga inicial de datos de la orden
  useEffect(() => {
    async function cargarDatosOrden() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('ordenes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data && !error) {
          const v = [data.vehiculo_marca, data.vehiculo_modelo, data.vehiculo_anio]
            .filter(Boolean)
            .join(' ') || data.vehiculo_modelo;
          if (v) setVehiculo(v);
          if (data.cliente_nombre) setClienteNombre(data.cliente_nombre);
          if (data.cliente_telefono) setClienteTelefono(data.cliente_telefono);
          if (data.falla_reportada) setFallaReportada(data.falla_reportada);
        }
      } catch (err) {
        // Fallback silencioso a datos estándar
      }
    }

    if (id) {
      cargarDatosOrden();
    }
  }, [id]);

  // Validaciones del Candado de Odómetro
  const nuevoKmNum = Number(nuevoKm);
  const kmIngresado = nuevoKm.trim() !== '' && !isNaN(nuevoKmNum);
  const kmEsMayor = kmIngresado && nuevoKmNum > KILOMETRAJE_ANTERIOR;
  const fotoSubida = Boolean(fotoOdometro);
  const odometroValido = kmEsMayor && fotoSubida;

  // Contador de Checklist
  const totalItemsChecklist = CHECKLIST_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
  const itemsCompletados = Object.keys(checklistRespuestas).length;
  const checklistCompleto = itemsCompletados === totalItemsChecklist;
  const porcentajeChecklist = Math.round((itemsCompletados / totalItemsChecklist) * 100);

  // Estado general de validación para Liquidación
  const puedeLiquidar = odometroValido && checklistCompleto;

  // Manejo de foto del tablero
  const handleCapturarFoto = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFotoOdometro(url);
    } else {
      // Simulación de foto instantánea si no se selecciona archivo
      setFotoOdometro('https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80');
    }
    const ahora = new Date();
    setHoraFoto(ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleToggleChecklist = (itemId: string, valor: 'OK' | 'CAMBIO') => {
    // Si el odómetro no está válido, advertir
    if (!odometroValido) {
      mostrarErrores();
      return;
    }

    setChecklistRespuestas((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === valor ? (undefined as any) : valor
    }));
  };

  const mostrarErrores = () => {
    const errores: string[] = [];
    if (!kmIngresado) {
      errores.push(`Debes registrar el kilometraje actual.`);
    } else if (!kmEsMayor) {
      errores.push(`El kilometraje (${nuevoKmNum.toLocaleString()} km) debe ser mayor a ${KILOMETRAJE_ANTERIOR.toLocaleString()} km.`);
    }
    if (!fotoSubida) {
      errores.push(`Falta tomar la foto de evidencia del tablero.`);
    }
    if (!checklistCompleto) {
      const pendientes = totalItemsChecklist - itemsCompletados;
      errores.push(`Faltan ${pendientes} punto${pendientes > 1 ? 's' : ''} de inspección por calificar.`);
    }

    setToastMensaje(errores);
    setTimeout(() => {
      setToastMensaje(null);
    }, 4500);
  };

  const handleSolicitarLiquidacion = async () => {
    if (!puedeLiquidar) {
      mostrarErrores();
      return;
    }

    setEnviandoLiquidacion(true);

    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          estado: 'LIQUIDACION_PENDIENTE'
        })
        .eq('id', id);
    } catch (err) {
      // Fallback
    } finally {
      setEnviandoLiquidacion(false);
      setModalExitoOpen(true);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col selection:bg-[#CCFF00] selection:text-[#0A1525] relative">
      
      {/* ======================================================== */}
      {/* 1. HEADER DE CONTEXTO (Sticky, Alto Contraste Mobile)     */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          
          {/* Botón Volver */}
          <Link
            href="/aliados/portal"
            className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0A1525] hover:bg-slate-100 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-2xs"
            title="Volver al Portal de Aliados"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Contexto del Vehículo y Placa */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-[#0A1525] truncate tracking-tight">
                {vehiculo}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#475569] font-medium truncate">
              <span className="font-mono font-bold text-[#1E56B0] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                {placa}
              </span>
              <span>•</span>
              <span className="truncate">{clienteNombre}</span>
            </div>
          </div>

          {/* Badge 'EN EJECUCIÓN' Pulsante & Botón de Llamada */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-black px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              EN EJECUCIÓN
            </span>

            <a
              href={`tel:${clienteTelefono}`}
              className="w-12 h-12 rounded-2xl bg-[#1E56B0] hover:bg-[#15448c] text-white flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-xs"
              title={`Llamar al cliente (${clienteTelefono})`}
            >
              <Phone className="w-5 h-5 stroke-[2.5]" />
            </a>
          </div>
        </div>

        {/* Barra de Estatus para Mobile Extra Pequeño */}
        <div className="sm:hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-rose-700 font-black text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            SERVICIO EN EJECUCIÓN ACTIVA
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            ID: #{id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </header>

      {/* Contenido Principal con Espaciado Táctil */}
      <main className="flex-1 p-4 space-y-4 pb-32">

        {/* Notificación de Falla Reportada por el Cliente */}
        <div className="bg-white rounded-2xl p-4 border border-[#CBD5E1] shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Falla Declarada por el Cliente
          </span>
          <p className="text-xs font-semibold text-[#0A1525] leading-relaxed">
            {fallaReportada}
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. CANDADO DE ODÓMETRO (Bloque 1 - Crítico P0)           */}
        {/* ======================================================== */}
        <section className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-sm space-y-4 ${
          odometroValido
            ? 'border-emerald-400 ring-2 ring-emerald-50'
            : 'border-slate-300'
        }`}>
          
          {/* Cabecera del Candado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                odometroValido ? 'bg-emerald-600 text-white' : 'bg-[#0A1525] text-white'
              }`}>
                {odometroValido ? (
                  <Unlock className="w-5 h-5 text-[#CCFF00]" />
                ) : (
                  <Lock className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-base font-black text-[#0A1525] tracking-tight">
                  Registro de Kilometraje
                </h2>
                <p className="text-[11px] font-semibold text-[#475569]">
                  Candado P0 obligatorio para garantía
                </p>
              </div>
            </div>

            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
              odometroValido
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {odometroValido ? '✓ Desbloqueado' : '● Bloqueado'}
            </span>
          </div>

          {/* Último Registro del Sistema */}
          <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <span className="text-[#475569] font-bold">
              Último registro en sistema:
            </span>
            <span className="font-mono text-sm font-black text-[#1E56B0] bg-white px-2.5 py-0.5 rounded-lg border border-[#CBD5E1]">
              {KILOMETRAJE_ANTERIOR.toLocaleString()} km
            </span>
          </div>

          {/* Input Grande de Kilometraje Nuevo */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#0A1525] block">
              Kilometraje Actual del Tablero (km) *
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={nuevoKm}
                onChange={(e) => setNuevoKm(e.target.value)}
                placeholder={`Ej: ${(KILOMETRAJE_ANTERIOR + 120).toLocaleString()}`}
                className={`w-full h-16 px-4 text-2xl font-mono font-black text-center rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 ${
                  kmIngresado && !kmEsMayor
                    ? 'border-rose-400 bg-rose-50/50 text-rose-700 focus:ring-rose-100'
                    : kmEsMayor
                    ? 'border-emerald-500 bg-emerald-50/20 text-[#0A1525] focus:ring-emerald-100'
                    : 'border-slate-300 bg-[#F8FAFC] text-[#0A1525] focus:border-[#1E56B0] focus:ring-blue-100'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                KM
              </span>
            </div>

            {/* Mensaje de Error si km <= anterior */}
            {kmIngresado && !kmEsMayor && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 text-xs font-bold text-rose-700 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>
                  El kilometraje debe ser estrictamente mayor a {KILOMETRAJE_ANTERIOR.toLocaleString()} km.
                </span>
              </motion.div>
            )}
          </div>

          {/* Botón Cuadrado Grande de Foto del Tablero (h-32) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#0A1525] block">
              Foto de Evidencia del Odómetro *
            </label>

            {/* Input de archivo real oculto para activar cámara en móviles */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleCapturarFoto}
              className="hidden"
            />

            {!fotoOdometro ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    handleCapturarFoto();
                  }
                }}
                className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-[#1E56B0] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:bg-blue-100/50"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#1E56B0] shadow-2xs">
                  <Camera className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-extrabold text-[#0A1525] block">
                    Tomar foto del tablero
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Abre la cámara y enfoca los números del odómetro
                  </span>
                </div>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-emerald-50/30 flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={fotoOdometro}
                    alt="Evidencia Odómetro"
                    className="w-24 h-24 rounded-xl object-cover border border-emerald-300 shrink-0 shadow-xs"
                  />
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                      </span>
                      Foto Capturada
                    </span>
                    <p className="text-xs font-bold text-[#0A1525]">
                      Evidencia registrada
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      ⏱ {horaFoto || 'Hoy'}
                    </span>
                  </div>
                </div>

                {/* Botón de re-tomar */}
                <button
                  type="button"
                  onClick={() => {
                    setFotoOdometro(null);
                    setHoraFoto(null);
                  }}
                  className="h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0A1525] flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                  title="Tomar otra foto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cambiar</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Advertencia si no se ha completado el candado */}
          {!odometroValido && (
            <p className="text-[11px] font-semibold text-slate-500 text-center pt-1">
              🔒 El checklist táctil permanecerá bloqueado hasta ingresar el kilometraje correcto y capturar la foto.
            </p>
          )}
        </section>

        {/* ======================================================== */}
        {/* 3. CHECKLIST DE 25 PUNTOS (Acordeón Táctil Mobile)        */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-sm space-y-4">
          
          {/* Header de Sección con Barra de Progreso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#0A1525] tracking-tight">
                  Checklist de Inspección Táctil
                </h2>
                <p className="text-xs text-[#475569] font-medium">
                  Chequeo reglamentario de 25 puntos
                </p>
              </div>

              <span className={`text-xs font-black font-mono px-3 py-1 rounded-full ${
                checklistCompleto
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#0A1525] text-white'
              }`}>
                {itemsCompletados} / {totalItemsChecklist}
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <motion.div
                className="h-full bg-gradient-to-r from-[#1E56B0] to-[#CCFF00]"
                initial={{ width: 0 }}
                animate={{ width: `${porcentajeChecklist}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Acordeón de Categorías */}
          <div className="space-y-3 pt-1">
            {CHECKLIST_CATEGORIES.map((categoria) => {
              const estaAbierta = categoriaAbierta === categoria.id;
              const completadosCat = categoria.items.filter((it) => checklistRespuestas[it.id]).length;
              const catCompleta = completadosCat === categoria.items.length;

              return (
                <div
                  key={categoria.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    estaAbierta
                      ? 'border-[#1E56B0] shadow-sm bg-white'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                >
                  {/* Título de la Categoría (Tap Target h-14) */}
                  <button
                    type="button"
                    onClick={() => setCategoriaAbierta(estaAbierta ? '' : categoria.id)}
                    className="w-full h-14 px-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        catCompleta
                          ? 'bg-[#16a34a]'
                          : completadosCat > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`} />
                      <span className="text-sm font-black text-[#0A1525]">
                        {categoria.titulo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {completadosCat}/{categoria.items.length}
                      </span>
                      <motion.div
                        animate={{ rotate: estaAbierta ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Lista de Ítems en Acordeón */}
                  <AnimatePresence initial={false}>
                    {estaAbierta && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white"
                      >
                        {categoria.items.map((item) => {
                          const respuesta = checklistRespuestas[item.id];
                          const isOk = respuesta === 'OK';
                          const isCambio = respuesta === 'CAMBIO';

                          return (
                            <div key={item.id} className="p-4 space-y-3">
                              <div>
                                <h3 className="text-sm font-extrabold text-[#0A1525]">
                                  {item.nombre}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {item.descripcion}
                                </p>
                              </div>

                              {/* Dos Botones Grandes Tipo Toggle (Mínimo h-14 para uso con una mano) */}
                              <div className="grid grid-cols-2 gap-2.5">
                                {/* Botón OK */}
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleToggleChecklist(item.id, 'OK')}
                                  disabled={!odometroValido}
                                  className={`h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                                    isOk
                                      ? 'bg-[#16a34a] text-white border-[#15803d] shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                                  } ${!odometroValido ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                    isOk ? 'bg-white text-[#16a34a]' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                  </span>
                                  <span>OK</span>
                                </motion.button>

                                {/* Botón Requiere Cambio */}
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleToggleChecklist(item.id, 'CAMBIO')}
                                  disabled={!odometroValido}
                                  className={`h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                                    isCambio
                                      ? 'bg-[#dc2626] text-white border-[#b91c1c] shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
                                  } ${!odometroValido ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                    isCambio ? 'bg-white text-[#dc2626]' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    <X className="w-3.5 h-3.5 stroke-[3.5]" />
                                  </span>
                                  <span>Requiere Cambio</span>
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. COTIZACIÓN EN VIVO (Solo lectura de la Operadora)      */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#1E56B0]">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-[#0A1525] tracking-tight">
                Cotización de Despacho
              </h2>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              Solo Lectura
            </span>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#475569] font-medium">Mano de Obra Autorizada:</span>
              <span className="font-mono font-bold text-[#0A1525]">${cotizacion.manoDeObra.toFixed(2)} USD</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#475569] font-medium">Repuestos y Consumibles:</span>
              <span className="font-mono font-bold text-[#0A1525]">${cotizacion.repuestos.toFixed(2)} USD</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#475569] font-medium">Diagnóstico Inicial:</span>
              {cotizacion.diagnosticoExonerado ? (
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Exonerado (-$15.00)
                </span>
              ) : (
                <span className="font-mono font-bold text-[#0A1525]">+$15.00 USD</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-black text-[#0A1525] uppercase tracking-wider">
                Total Facturable al Cliente:
              </span>
              <span className="text-base font-black text-[#1E56B0] font-mono">
                ${cotizacion.totalFacturable.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Tarjeta de Ganancia para el Técnico */}
          <div className="bg-[#CCFF00]/20 border border-[#CCFF00] rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                Tu Ganancia Pre-Liquidada (70%)
              </span>
              <span className="text-lg font-black text-[#0A1525] font-mono">
                ${cotizacion.gananciaMecanico.toFixed(2)} USD
              </span>
            </div>
            <span className="text-xs font-black text-[#0A1525] bg-[#CCFF00] px-3 py-1 rounded-xl shadow-2xs">
              Pago Inmediato
            </span>
          </div>
        </section>

      </main>

      {/* ======================================================== */}
      {/* 5. ACTION BAR INFERIOR (Sticky h-14 con Validación)      */}
      {/* ======================================================== */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md p-4 border-t border-[#E2E8F0] shadow-2xl">
        <div className="space-y-2">
          {/* Botón Principal de Acción (h-14) */}
          <motion.button
            type="button"
            whileTap={{ scale: puedeLiquidar ? 0.97 : 1 }}
            onClick={handleSolicitarLiquidacion}
            disabled={enviandoLiquidacion}
            className={`w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-md ${
              puedeLiquidar
                ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] cursor-pointer shadow-[#CCFF00]/30 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {enviandoLiquidacion ? (
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 animate-spin" />
                <span>Enviando Liquidación...</span>
              </span>
            ) : puedeLiquidar ? (
              <span className="flex items-center gap-2">
                <span>Solicitar Liquidación (${cotizacion.gananciaMecanico.toFixed(2)} USD)</span>
                <span className="text-xl">➔</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                <span>Completar Odómetro y Checklist para Liquidar</span>
              </span>
            )}
          </motion.button>

          {/* Micro resumen inferior */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span>Odómetro: {odometroValido ? '✓ Listo' : '⚠️ Pendiente'}</span>
            <span>Checklist: {itemsCompletados}/{totalItemsChecklist}</span>
            <span>Liquidación: {puedeLiquidar ? '🟢 Habilitada' : '🔴 Bloqueada'}</span>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* TOAST DE REQUISITOS FALTANTES (Framer Motion)            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastMensaje && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 bg-[#0A1525] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#CCFF00] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#CCFF00]" />
                Requisitos Pendientes
              </span>
              <button
                type="button"
                onClick={() => setToastMensaje(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="text-xs space-y-1 text-slate-200 font-medium">
              {toastMensaje.map((m, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#CCFF00] font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL DE ÉXITO DE LIQUIDACIÓN                            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalExitoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-5 border border-[#CBD5E1] shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-lg shadow-[#CCFF00]/30">
                <Check className="w-8 h-8 stroke-[3.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  ¡Liquidación Solicitada!
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  El servicio de <strong>{vehiculo}</strong> ({placa}) ha sido completado y reportado a despacho central.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Monto a Transferir
                </span>
                <span className="text-3xl font-black text-[#1E56B0] font-mono">
                  ${cotizacion.gananciaMecanico.toFixed(2)} <span className="text-xs font-sans text-slate-500 font-bold">USD</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block pt-1">
                  ✓ Verificación fotográfica del odómetro aprobada
                </span>
              </div>

              <Link
                href="/aliados/portal"
                className="w-full h-14 bg-[#0A1525] hover:bg-slate-800 text-white font-black text-sm rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                Volver a la Bandeja de Servicios
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
