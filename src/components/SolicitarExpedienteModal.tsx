'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  ClipboardCheck,
  X,
  CheckCircle2,
  Car,
  MapPin,
  Phone,
  DollarSign,
  Loader2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Banknote,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Gauge
} from 'lucide-react';
import Link from 'next/link';

interface SolicitarExpedienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehiculo: {
    marca: string;
    modelo: string;
    anio?: string | number;
    placa: string;
    color?: string;
  };
  cliente?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  };
  onSuccess?: (ordenId: string) => void;
}

const SECTORES_CARACAS = [
  'Chacao',
  'Las Mercedes',
  'Altamira',
  'Los Palos Grandes',
  'El Rosal',
  'Baruta',
  'El Hatillo',
  'La Castellana',
  'Bello Monte',
  'Los Ruices',
  'Boleíta',
  'La California',
  'San Bernardino',
  'La Candelaria',
  'El Paraíso',
  'Montalbán',
  'Santa Mónica',
  'San Antonio de los Altos',
  'Otro sector en Caracas'
];

export function SolicitarExpedienteModal({
  open,
  onOpenChange,
  vehiculo,
  cliente,
  onSuccess
}: SolicitarExpedienteModalProps) {
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [email, setEmail] = useState(cliente?.email || '');
  const [sector, setSector] = useState('Chacao');
  const [direccionExacta, setDireccionExacta] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'pagomovil' | 'zelle' | 'cashea'>('efectivo');
  const [referenciaPago, setReferenciaPago] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [ordenCreada, setOrdenCreada] = useState<{ id: string; codigo: string } | null>(null);

  useEffect(() => {
    if (open) {
      if (cliente?.nombre) setNombre(cliente.nombre);
      if (cliente?.telefono) setTelefono(cliente.telefono);
      if (cliente?.email) setEmail(cliente.email);
      setOrdenCreada(null);
      setErrorMsg('');
    }
  }, [open, cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!telefono.trim()) {
      setErrorMsg('Por favor ingresa un número de teléfono para que el mecánico te contacte.');
      return;
    }
    if (!direccionExacta.trim()) {
      setErrorMsg('Por favor indica la dirección o punto de referencia en Caracas.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const anioNum = parseInt(String(vehiculo.anio || '2020'), 10) || 2020;
      const direccionCompleta = `${sector}: ${direccionExacta.trim()}`;
      const placaVehiculo = (vehiculo.placa || 'PLACA').toUpperCase().trim();

      const fallaDetalle = `[INSPECCIÓN TÉCNICA 25 PUNTOS] Auditoría y Expediente Técnico de 25 Puntos - Pago: ${metodoPago.toUpperCase()}${referenciaPago ? ` (Ref: ${referenciaPago.trim()})` : ''}`;

      const { data, error } = await supabase
        .from('ordenes')
        .insert([
          {
            cliente_nombre: nombre.trim() || 'Cliente TuTallerMóvil',
            cliente_email: email.trim() || null,
            cliente_telefono: telefono.trim(),
            vehiculo_marca: vehiculo.marca.trim(),
            vehiculo_modelo: `${vehiculo.modelo.trim()} [${placaVehiculo}]`,
            vehiculo_anio: anioNum,
            falla_reportada: fallaDetalle,
            sector: direccionCompleta,
            estado: 'LEAD_NUEVO',
            ganancia_estimada: 15.0,
            latitud: 10.49,
            longitud: -66.85
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error al insertar orden de expediente en Supabase:', error);
        setErrorMsg('No se pudo registrar la orden: ' + error.message);
        setSubmitting(false);
        return;
      }

      const orderId = data?.id || `ttm-exp-${Date.now().toString().slice(-6)}`;
      const codigoVisible = orderId.slice(0, 8).toUpperCase();

      // Guardar en cache local para reflejo inmediato en el Tablero de Despacho
      if (typeof window !== 'undefined') {
        try {
          const nuevaOrdenCache = {
            id: orderId,
            cliente_nombre: nombre.trim() || 'Cliente TuTallerMóvil',
            cliente_email: email.trim() || null,
            cliente_telefono: telefono.trim(),
            vehiculo_marca: vehiculo.marca.trim(),
            vehiculo_modelo: `${vehiculo.modelo.trim()} [${placaVehiculo}]`,
            vehiculo_anio: anioNum,
            falla_reportada: fallaDetalle,
            sector: direccionCompleta,
            estado: 'LEAD_NUEVO',
            ganancia_estimada: 15.0,
            tipo_servicio: 'INSPECCION_TECNICA',
            created_at: new Date().toISOString()
          };
          const rawPrev = localStorage.getItem('ttm_ordenes_recientes');
          const prevList = rawPrev ? JSON.parse(rawPrev) : [];
          localStorage.setItem('ttm_ordenes_recientes', JSON.stringify([nuevaOrdenCache, ...prevList]));
        } catch (e) { }
      }

      setOrdenCreada({ id: orderId, codigo: codigoVisible });
      setSubmitting(false);

      if (onSuccess) {
        onSuccess(orderId);
      }
    } catch (err: any) {
      console.error('Excepción al solicitar expediente:', err);
      setErrorMsg('Ocurrió un error inesperado al procesar la solicitud.');
      setSubmitting(false);
    }
  };

  const handleCerrar = () => {
    onOpenChange(false);
    setOrdenCreada(null);
    setErrorMsg('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0A1525]/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[92vh] w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 outline-none focus:outline-none">
          
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={handleCerrar}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer z-10"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!ordenCreada ? (
            /* VISTA DEL FORMULARIO */
            <div className="space-y-5">
              
              {/* Encabezado */}
              <div className="pr-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E56B0]/10 text-[#1E56B0] text-xs font-black mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Auditoría Certificada • $5.00 USD</span>
                </div>
                <Dialog.Title className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Apertura de Expediente Técnico
                </Dialog.Title>
                <Dialog.Description className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Un mecánico especialista de TuTallerMóvil acude a tu ubicación en Caracas para realizar la inspección técnica de <strong>25 puntos</strong> y crear tu historial digital oficial.
                </Dialog.Description>
              </div>

              {/* Ficha del Vehículo Seleccionado */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shrink-0">
                    <Car className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Vehículo a Inspeccionar
                    </span>
                    <h4 className="font-extrabold text-[#0A1525] text-sm sm:text-base leading-tight">
                      {vehiculo.marca} {vehiculo.modelo}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Año {vehiculo.anio || 'N/D'} {vehiculo.color ? `• ${vehiculo.color}` : ''}
                    </span>
                  </div>
                </div>

                {/* Placa badge */}
                <div className="bg-white border-2 border-[#0A1525] px-2.5 py-1 rounded-lg text-center shadow-2xs shrink-0">
                  <span className="text-[7px] font-black text-slate-400 block tracking-widest leading-none">
                    VENEZUELA
                  </span>
                  <span className="font-mono text-xs font-black text-[#0A1525]">
                    {vehiculo.placa}
                  </span>
                </div>
              </div>

              {/* Qué incluye la auditoría de 25 Puntos */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-[#1E56B0] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1E56B0]" />
                  <span>¿Qué incluye la inspección por $5 USD?</span>
                </span>
                <ul className="grid grid-cols-2 gap-1.5 text-slate-700 text-[11px] font-medium">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Nivel de 7 fluidos vitales</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Medición milimétrica de frenos</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Suspensión y tren delantero</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Escáner OBD-II y alternador</span>
                  </li>
                </ul>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Sector y Dirección */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Sector y Dirección de Visita (Caracas) *</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0A1525] focus:outline-none focus:border-[#1E56B0]"
                    >
                      {SECTORES_CARACAS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Calle, Residencia, Punto de ref."
                      value={direccionExacta}
                      onChange={(e) => setDireccionExacta(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>
                </div>

                {/* Teléfono de Contacto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Teléfono Móvil de Contacto *</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. +58 412 123 4567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0]"
                  />
                </div>

                {/* Método de Pago */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0A1525] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Método de Pago ($5.00 USD)</span>
                    </span>
                    <span className="text-emerald-700 font-extrabold text-sm">$5.00 USD</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setMetodoPago('efectivo')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        metodoPago === 'efectivo'
                          ? 'border-[#1E56B0] bg-blue-50/70 text-[#1E56B0]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div className="truncate">
                        <span className="block text-xs">Efectivo en Sitio</span>
                        <span className="text-[10px] text-slate-400 font-normal">Al mecánico</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago('pagomovil')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        metodoPago === 'pagomovil'
                          ? 'border-[#1E56B0] bg-blue-50/70 text-[#1E56B0]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 shrink-0 text-blue-600" />
                      <div className="truncate">
                        <span className="block text-xs">Pago Móvil</span>
                        <span className="text-[10px] text-slate-400 font-normal">Tasa oficial BCV</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago('zelle')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        metodoPago === 'zelle'
                          ? 'border-[#1E56B0] bg-blue-50/70 text-[#1E56B0]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
                      <div className="truncate">
                        <span className="block text-xs">Zelle</span>
                        <span className="text-[10px] text-slate-400 font-normal">Directo USD</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago('cashea')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        metodoPago === 'cashea'
                          ? 'border-[#1E56B0] bg-blue-50/70 text-[#1E56B0]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 shrink-0 text-amber-600" />
                      <div className="truncate">
                        <span className="block text-xs">Cashea / Binance</span>
                        <span className="text-[10px] text-slate-400 font-normal">Cripto / Cuotas</span>
                      </div>
                    </button>
                  </div>

                  {/* Detalle si elige Pago Móvil o Zelle */}
                  {metodoPago === 'pagomovil' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5">
                      <p className="font-semibold text-[#0A1525]">
                        Datos para Pago Móvil (Tasa Oficial BCV):
                      </p>
                      <p>Banco: <strong>Banesco (0134)</strong> • Teléfono: <strong>0414-2314194</strong> • RIF: <strong>J-50123456-7</strong></p>
                      <input
                        type="text"
                        placeholder="Número de Referencia (o pagar al llegar el mecánico)"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}

                  {metodoPago === 'zelle' && (
                    <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                      <p className="font-semibold text-purple-900">
                        Zelle: <strong>pagos@tutallermovil.com</strong>
                      </p>
                      <input
                        type="text"
                        placeholder="Nombre de la cuenta o confirmación"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-purple-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                    {errorMsg}
                  </p>
                )}

                {/* Botón Principal */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#0A1525] font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A1525]" />
                      <span>Asignando mecánico certificado...</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-4 h-4 text-[#0A1525]" />
                      <span>Solicitar Expediente Técnico ($5 USD)</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* PANTALLA DE ÉXITO */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                  Solicitud Confirmada
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0A1525]">
                  ¡Expediente Técnico en Proceso!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  La orden <strong>#{ordenCreada.codigo}</strong> ha sido enviada a la Torre de Despacho. El mecánico acudirá a auditar tu <strong>{vehiculo.marca} {vehiculo.modelo} [{vehiculo.placa}]</strong> en <strong>{sector}</strong>.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2 pt-2">
                <Link
                  href={`/cliente/servicio/${ordenCreada.id}`}
                  className="w-full h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Ver Estado en Tiempo Real</span>
                  <ChevronRight className="w-4 h-4 text-[#CCFF00]" />
                </Link>

                <button
                  type="button"
                  onClick={handleCerrar}
                  className="w-full h-10 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cerrar y volver al Garaje
                </button>
              </div>

            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
