'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Wrench,
  X,
  Car,
  MapPin,
  AlertTriangle,
  User,
  Loader2,
  CheckCircle2,
  Sparkles,
  Calendar
} from 'lucide-react';

interface SolicitarMecanicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessToast?: (msg: string) => void;
}

export function SolicitarMecanicoModal({
  open,
  onOpenChange,
  onSuccessToast
}: SolicitarMecanicoModalProps) {
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [falla, setFalla] = useState('');
  const [sector, setSector] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !nombre.trim() ||
      !marca.trim() ||
      !modelo.trim() ||
      !anio.trim() ||
      !falla.trim() ||
      !sector.trim()
    ) {
      setErrorMsg('Por favor completa todos los campos para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const anioNum = parseInt(anio.trim(), 10) || null;

      const { data, error } = await supabase.from('ordenes').insert([
        {
          cliente_nombre: nombre.trim(),
          vehiculo_marca: marca.trim(),
          vehiculo_modelo: modelo.trim(),
          vehiculo_anio: anioNum,
          falla_reportada: falla.trim(),
          sector: sector.trim(),
          estado: 'DISPONIBLE',
          ganancia_estimada: 30.0,
          latitud: 10.49,
          longitud: -66.85
        }
      ]).select();

      if (error) {
        console.error('Error insertando orden en Supabase:', error);
        setErrorMsg('Ocurrió un error al registrar la solicitud: ' + error.message);
        setSubmitting(false);
        return;
      }

      // Éxito: limpiar campos, cerrar modal y disparar toast
      setNombre('');
      setMarca('');
      setModelo('');
      setAnio('');
      setFalla('');
      setSector('');
      setSubmitting(false);
      onOpenChange(false);

      if (onSuccessToast) {
        onSuccessToast('Solicitud enviada. Buscando mecánico...');
      }
    } catch (err: any) {
      console.error('Excepción al solicitar mecánico:', err);
      setErrorMsg('No se pudo conectar con el servidor. Intenta nuevamente.');
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay con desenfoque */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#0A1525]/60 backdrop-blur-xs z-50 transition-opacity"
              />
            </Dialog.Overlay>

            {/* Contenido del Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full max-w-lg bg-white rounded-2xl border-2 border-[#CBD5E1] shadow-2xl p-6 sm:p-7 relative overflow-hidden"
                >
                  {/* Borde superior de marca */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0A1525] via-[#1E56B0] to-[#CCFF00]" />

                  {/* Botón Cerrar */}
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0A1525] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A1525] shrink-0 shadow-xs">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                        Pedir Mecánico Ahora
                      </Dialog.Title>
                      <p className="text-xs text-slate-500 font-medium">
                        Atención en menos de 45 min en Caracas
                      </p>
                    </div>
                  </div>

                  <Dialog.Description className="text-xs text-slate-600 mb-5 leading-relaxed">
                    Completa los datos de tu vehículo. Asignaremos a un especialista verificado con escáner y herramientas directas a tu ubicación.
                  </Dialog.Description>

                  {/* Mensaje de error si ocurre */}
                  {errorMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo 1: Nombre */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                        Tu Nombre Completo
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Ej. Roberto Sánchez"
                          className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Fila 2: Grid Marca y Año (grid-cols-2) */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Campo: Marca */}
                      <div>
                        <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                          Marca
                        </label>
                        <div className="relative">
                          <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                            placeholder="Ej. Toyota"
                            className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                          />
                        </div>
                      </div>

                      {/* Campo: Año */}
                      <div>
                        <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                          Año
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            required
                            min="1970"
                            max="2030"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                            placeholder="Ej. 2018"
                            className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fila 3: Modelo (Ancho completo) */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                        Modelo
                      </label>
                      <div className="relative">
                        <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={modelo}
                          onChange={(e) => setModelo(e.target.value)}
                          placeholder="Ej. Corolla / Yaris / Fiesta"
                          className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Campo 4: Falla Reportada */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                        Falla Reportada o Síntoma
                      </label>
                      <div className="relative">
                        <Wrench className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={falla}
                          onChange={(e) => setFalla(e.target.value)}
                          placeholder="Ej. Frenos chirriando, no enciende, recalentamiento"
                          className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Campo 5: Sector */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                        Sector en Caracas
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          placeholder="Ej. Chacao, Las Mercedes, Los Dos Caminos, El Hatillo"
                          className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Nota de tarifa gancho */}
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#1E56B0] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600 leading-snug">
                        <strong className="text-[#0A1525]">Garantía TTM:</strong> Diagnóstico inicial $15 USD. Ganancia para el aliado: <span className="font-bold text-[#1E56B0]">$30.00 USD</span>. Sin costos ocultos.
                      </p>
                    </div>

                    {/* Botón de Envío */}
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.01 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className={`w-full h-12 text-sm sm:text-base font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#0A1525]/10 ${
                        submitting
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525]'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#0A1525]" />
                          <span>Despachando solicitud...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-[#0A1525]" />
                          <span>Confirmar y Pedir Mecánico</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
