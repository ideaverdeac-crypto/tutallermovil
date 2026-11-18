'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { registrarOperacionEnBitacora } from '@/lib/audit';
import { notificarNuevoServicioOperadora } from '@/lib/notificaciones';
import { generarLinkWhatsApp } from '@/lib/utils';
import {
  X,
  Phone,
  MessageCircle,
  Car,
  User,
  MapPin,
  Wrench,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Send,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface ModalCrearServicioManualProps {
  isOpen: boolean;
  onClose: () => void;
  onOrdenCreada: () => void;
  operadora: {
    nombre: string;
    email: string;
  };
}

const SECTORES_CARACAS = [
  'Chacao / El Rosal',
  'Las Mercedes / Valle Arriba',
  'Altamira / La Castellana',
  'Los Palos Grandes / Sebucán',
  'Baruta / Las Minas',
  'El Cafetal / Caurimare / San Luis',
  'Los Ruices / Boleíta / La Carlota',
  'Santa Fe / Prados del Este / Cumbres',
  'San Bernardino / La Candelaria',
  'Bello Monte / Sabana Grande',
  'Macaracuay / La California',
  'La Trinidad / La Boyera / El Hatillo',
  'Otro Sector en Caracas'
];

const FALLAS_FRECUENTES = [
  'Batería descargada / No enciende',
  'Frenos rechinan / Pedal bajo / Cambio de pastillas',
  'Bote de aceite o refrigerante',
  'Falla de inyección / Tirones al acelerar',
  'Inspección Preventiva de 25 Puntos',
  'Diagnóstico con Escáner OBD-II',
  'Ruido en tren delantero / Amortiguación',
  'Aire acondicionado no enfría',
  'Revisión general pre-compra'
];

const MECANICOS_ASIGNACION = [
  { id: '', nombre: 'Dejar Disponible (Cualquier especialista en zona)' },
  { id: '123e4567-e89b-12d3-a456-426614174000', nombre: 'Carlos Mendoza (#TTM-0842 • Senior OBD2)' },
  { id: '223e4567-e89b-12d3-a456-426614174001', nombre: 'Alejandro Blanco (#TTM-0912 • Frenos y Ligera)' },
  { id: '323e4567-e89b-12d3-a456-426614174002', nombre: 'Roberto Páez (#TTM-0341 • Electricidad & Baterías)' }
];

export default function ModalCrearServicioManual({
  isOpen,
  onClose,
  onOrdenCreada,
  operadora
}: ModalCrearServicioManualProps) {
  // Canal de Recepción
  const [canal, setCanal] = useState<'WHATSAPP' | 'LLAMADA' | 'RECURRENTE'>('WHATSAPP');

  // Datos del Cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Datos del Vehículo
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [placa, setPlaca] = useState('');

  // Ubicación
  const [sector, setSector] = useState('Chacao / El Rosal');
  const [direccionDetallada, setDireccionDetallada] = useState('');

  // Falla y Diagnóstico
  const [falla, setFalla] = useState('');
  const [prioridad, setPrioridad] = useState<'INMEDIATO' | 'HOY' | 'PROGRAMADO'>('INMEDIATO');
  const [mecanicoAsignado, setMecanicoAsignado] = useState('');
  const [tarifaBase, setTarifaBase] = useState('25');
  const [notasOperadora, setNotasOperadora] = useState('');

  // Estados de Operación
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ordenCreadaExito, setOrdenCreadaExito] = useState<{
    id: string;
    cliente: string;
    telefono: string;
    vehiculo: string;
    sector: string;
  } | null>(null);
  const [mensajeCopiado, setMensajeCopiado] = useState(false);

  if (!isOpen) return null;

  const resetFormulario = () => {
    setNombre('');
    setTelefono('');
    setEmail('');
    setMarca('');
    setModelo('');
    setAnio('');
    setPlaca('');
    setFalla('');
    setDireccionDetallada('');
    setNotasOperadora('');
    setErrorMsg(null);
    setOrdenCreadaExito(null);
  };

  const handleCerrar = () => {
    resetFormulario();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim() || !telefono.trim() || !marca.trim() || !modelo.trim() || !falla.trim()) {
      setErrorMsg('Por favor completa los campos requeridos: Cliente, Teléfono, Marca, Modelo y Falla.');
      return;
    }

    setCargando(true);

    try {
      const supabase = createClient();
      const anioNum = parseInt(anio.trim(), 10) || new Date().getFullYear();
      const placaLimpia = (placa.trim() || 'SIN-PLACA').toUpperCase();
      const modeloFinal = modelo.includes('[') ? modelo.trim() : `${modelo.trim()} [${placaLimpia}]`;
      const sectorFinal = direccionDetallada.trim()
        ? `${sector} — ${direccionDetallada.trim()}`
        : sector;

      const estadoInicial = mecanicoAsignado ? 'EN_INSPECCION' : 'DISPONIBLE';
      const mecanicoObj = MECANICOS_ASIGNACION.find((m) => m.id === mecanicoAsignado);

      const nuevaFila = {
        cliente_nombre: nombre.trim(),
        cliente_telefono: telefono.trim(),
        cliente_email: email.trim() || null,
        vehiculo_marca: marca.trim(),
        vehiculo_modelo: modeloFinal,
        vehiculo_placa: placaLimpia,
        placa_flota: placaLimpia,
        vehiculo_anio: anioNum,
        falla_reportada: `[${canal}] ${falla.trim()}${prioridad === 'INMEDIATO' ? ' (URGENTE IN SITU)' : ''}`,
        sector: sectorFinal,
        estado: estadoInicial,
        ganancia_estimada: parseFloat(tarifaBase) || 25.0,
        mecanico_id: mecanicoAsignado || null,
        latitud: 10.491,
        longitud: -66.852,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ordenes')
        .insert([nuevaFila])
        .select()
        .single();

      if (error) {
        console.error('Error insertando orden manual:', error);
        throw new Error(error.message);
      }

      const ordenId = data?.id || `ord_manual_${Date.now()}`;

      // 1. Auditoría en Bitácora Operacional
      await registrarOperacionEnBitacora({
        ordenId: ordenId,
        operadoraEmail: operadora.email,
        operadoraNombre: operadora.nombre,
        accion: 'CREAR_ORDEN_DESPACHO_MANUAL',
        detalles: {
          canal,
          cliente: nombre.trim(),
          telefono: telefono.trim(),
          vehiculo: `${marca} ${modelo}`,
          sector: sectorFinal,
          mecanicoAsignado: mecanicoObj?.nombre || 'Red abierta',
          tarifaBase: parseFloat(tarifaBase)
        }
      });

      // 2. Disparar Sonido Especial de Operadora y Notificación Push
      notificarNuevoServicioOperadora({
        id: ordenId,
        cliente: nombre.trim(),
        vehiculo: `${marca} ${modeloFinal}`,
        falla: falla.trim(),
        direccion: sectorFinal,
        monto: parseFloat(tarifaBase)
      });

      // 3. Preparar Pantalla de Éxito y Acción Rápida de WhatsApp
      setOrdenCreadaExito({
        id: ordenId,
        cliente: nombre.trim(),
        telefono: telefono.trim(),
        vehiculo: `${marca} ${modelo}`,
        sector: sectorFinal
      });

      // Refrescar Kanban padre
      onOrdenCreada();
    } catch (err: any) {
      console.error('Error al registrar servicio manual:', err);
      setErrorMsg(err?.message || 'Ocurrió un error al guardar la orden. Revisa la conexión.');
    } finally {
      setCargando(false);
    }
  };

  const generarMensajeConfirmacionWhatsApp = () => {
    if (!ordenCreadaExito) return '';
    const idCorto = ordenCreadaExito.id.slice(0, 8);
    const linkSeguimiento = `https://tutallermovil.vercel.app/historial/${encodeURIComponent(placa || 'PLACA')}?desde=despacho`;

    return `¡Hola ${ordenCreadaExito.cliente}! 👋 Te escribe ${operadora.nombre} de *TuTallerMóvil Caracas* 🚗🔧.\n\nConfirmamos la recepción de tu solicitud de mecánico para tu *${ordenCreadaExito.vehiculo}* en *${ordenCreadaExito.sector}*.\n\n📌 *Orden de Servicio:* #${idCorto}\n⏱️ *Estatus:* Mecánico en ruta / en asignación prioritaria.\n🔍 *Rastreo en vivo:* ${linkSeguimiento}\n\nAnte cualquier duda puedes responder directamente a este mensaje. ¡Estamos contigo en la vía!`;
  };

  const handleCopiarMensaje = () => {
    const texto = generarMensajeConfirmacionWhatsApp();
    navigator.clipboard.writeText(texto);
    setMensajeCopiado(true);
    setTimeout(() => setMensajeCopiado(false), 3000);
  };

  const handleAbrirWhatsApp = () => {
    if (!ordenCreadaExito) return;
    const texto = generarMensajeConfirmacionWhatsApp();
    const link = generarLinkWhatsApp(ordenCreadaExito.telefono, texto);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1525]/80 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0A1525] via-slate-900 to-[#1E56B0] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center font-black shadow-md shrink-0">
              {canal === 'WHATSAPP' ? (
                <MessageCircle className="w-5 h-5 text-[#0A1525]" />
              ) : (
                <Phone className="w-5 h-5 text-[#0A1525]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Despacho Manual de Servicio
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-[#CCFF00] px-2 py-0.5 rounded-md">
                  Operadora
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Atención directa por Llamada o WhatsApp • Operadora: <strong>{operadora.nombre}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCerrar}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* PANTALLA DE ÉXITO INMEDIATO CON WHATSAPP                   */}
        {/* ======================================================== */}
        {ordenCreadaExito ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#0A1525] tracking-tight">
                ¡Servicio Despachado al Tablero!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                La orden fue registrada exitosamente en <strong>{ordenCreadaExito.sector}</strong> y ya está visible en el Kanban para los mecánicos.
              </p>
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-700 border border-slate-200">
                ID: #{ordenCreadaExito.id.slice(0, 8)}
              </div>
            </div>

            {/* Tarjeta de Confirmación para Enviar al Cliente */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Mensaje listo para el cliente (WhatsApp):</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopiarMensaje}
                  className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {mensajeCopiado ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {generarMensajeConfirmacionWhatsApp()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAbrirWhatsApp}
                className="h-12 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Abrir WhatsApp del Cliente</span>
              </button>

              <button
                type="button"
                onClick={handleCerrar}
                className="h-12 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Ver en Tablero Kanban</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* FORMULARIO DE CAPTURA RÁPIDA DE SERVICIO                 */
          /* ======================================================== */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Selector de Canal de Recepción */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Canal de Recepción
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCanal('WHATSAPP')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    canal === 'WHATSAPP'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCanal('LLAMADA')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    canal === 'LLAMADA'
                      ? 'bg-blue-50 text-[#1E56B0] border-blue-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Llamada</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCanal('RECURRENTE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    canal === 'RECURRENTE'
                      ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Flota / Recurrente</span>
                </button>
              </div>
            </div>

            {/* 2. Datos del Cliente */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1E56B0]" />
                <span>Datos del Cliente</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Nombre y Apellido *</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Mariana Rossi"
                    className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0414-2314194"
                    className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 3. Datos del Vehículo */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                <span>Vehículo a Atender</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Marca *</label>
                  <input
                    type="text"
                    required
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Toyota"
                    className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Corolla GLi"
                    className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Año</label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    placeholder="2018"
                    className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Placa</label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    placeholder="AB123CD"
                    className="w-full h-10 px-3 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl uppercase focus:border-[#1E56B0] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 4. Ubicación en Caracas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Sector / Municipio *</span>
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden text-[#0A1525]"
                >
                  {SECTORES_CARACAS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Punto de Referencia / Dirección</label>
                <input
                  type="text"
                  value={direccionDetallada}
                  onChange={(e) => setDireccionDetallada(e.target.value)}
                  placeholder="Ej. Frente a CC Tolón, Edif. A, PB"
                  className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                />
              </div>
            </div>

            {/* 5. Falla Reportada y Sugerencias Rápidas */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Falla Reportada por el Cliente *</span>
                </label>
                <span className="text-[10px] text-slate-400">Clic para autocompletar</span>
              </div>

              {/* Botones de fallas frecuentes */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {FALLAS_FRECUENTES.slice(0, 5).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFalla(f)}
                    className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    + {f}
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={2}
                value={falla}
                onChange={(e) => setFalla(e.target.value)}
                placeholder="Describe el síntoma o motivo del servicio reportado por llamada/WhatsApp..."
                className="w-full p-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden resize-none"
              />
            </div>

            {/* 6. Prioridad, Asignación y Tarifa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Prioridad */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Urgencia</span>
                </label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as any)}
                  className="w-full h-10 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                >
                  <option value="INMEDIATO">🚨 Inmediato (En Calle)</option>
                  <option value="HOY">📅 Hoy (Próximas horas)</option>
                  <option value="PROGRAMADO">🗓️ Programado</option>
                </select>
              </div>

              {/* Asignación Directa */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Asignar Mecánico</span>
                </label>
                <select
                  value={mecanicoAsignado}
                  onChange={(e) => setMecanicoAsignado(e.target.value)}
                  className="w-full h-10 px-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden text-[#0A1525]"
                >
                  {MECANICOS_ASIGNACION.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarifa Base */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tarifa Diagnóstico ($)</span>
                </label>
                <input
                  type="number"
                  value={tarifaBase}
                  onChange={(e) => setTarifaBase(e.target.value)}
                  placeholder="25"
                  className="w-full h-10 px-3 text-xs font-bold text-emerald-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCerrar}
                className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={cargando}
                className="h-11 px-6 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#CCFF00]" />
                    <span>Despachando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#CCFF00]" />
                    <span>Crear y Despachar Servicio</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
