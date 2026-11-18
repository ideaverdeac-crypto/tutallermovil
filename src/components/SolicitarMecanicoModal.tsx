'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Calendar,
  Mail,
  Plus,
  Check
} from 'lucide-react';

export interface VehiculoOpcion {
  id?: string;
  marca: string;
  modelo: string;
  anio: string | number;
  placa: string;
  color?: string;
}

export interface SolicitarMecanicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessToast?: (msg: string) => void;
  onVehiculoCreado?: (vehiculo: VehiculoOpcion) => void;
  initialVehiculo?: {
    marca?: string;
    modelo?: string;
    anio?: string | number;
    placa?: string;
    falla?: string;
  };
  initialCliente?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  };
  vehiculosRegistrados?: VehiculoOpcion[];
}

export function SolicitarMecanicoModal({
  open,
  onOpenChange,
  onSuccessToast,
  onVehiculoCreado,
  initialVehiculo,
  initialCliente,
  vehiculosRegistrados
}: SolicitarMecanicoModalProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [anio, setAnio] = useState('');
  const [falla, setFalla] = useState('');
  const [sector, setSector] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Detección de usuario logueado / autenticado
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<{
    nombre: string;
    email: string;
    telefono?: string;
  } | null>(null);

  // Selector entre vehículo registrado o agregar uno nuevo
  const [listaVehiculos, setListaVehiculos] = useState<VehiculoOpcion[]>([]);
  const [modoVehiculo, setModoVehiculo] = useState<'registrado' | 'nuevo'>('nuevo');
  const [vehiculoSeleccionadoId, setVehiculoSeleccionadoId] = useState<string>('');
  const [guardarEnGaraje, setGuardarEnGaraje] = useState<boolean>(true);

  useEffect(() => {
    async function sincronizarModal() {
      if (!open) return;

      // 1. Resolver identidad del usuario autenticado
      let userNombre = initialCliente?.nombre || '';
      let userEmail = initialCliente?.email || '';
      let userTel = initialCliente?.telefono || '';

      if (!userNombre || !userEmail) {
        if (typeof window !== 'undefined') {
          const sesionLocal = localStorage.getItem('ttm_cliente_sesion');
          if (sesionLocal) {
            try {
              const p = JSON.parse(sesionLocal);
              if (p.nombre) userNombre = p.nombre;
              if (p.email) userEmail = p.email;
              if (p.telefono) userTel = p.telefono;
            } catch (e) {}
          }
        }
      }

      if (!userEmail) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            userEmail = user.email || '';
            userNombre =
              user.user_metadata?.nombre ||
              user.user_metadata?.full_name ||
              userEmail.split('@')[0];
            userTel = user.user_metadata?.telefono || userTel;
          }
        } catch (e) {}
      }

      if (userNombre || userEmail) {
        setUsuarioAutenticado({
          nombre: userNombre,
          email: userEmail,
          telefono: userTel
        });
        setNombre(userNombre);
        setEmail(userEmail);
      } else {
        setUsuarioAutenticado(null);
        setNombre('');
        setEmail('');
      }

      // 2. Resolver lista de vehículos registrados reales del usuario (SIN datos falsos o mock)
      let vehiculosDisponibles: VehiculoOpcion[] = [];
      if (vehiculosRegistrados && vehiculosRegistrados.length > 0) {
        vehiculosDisponibles = vehiculosRegistrados;
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('ttm_garaje_vehiculos');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              vehiculosDisponibles = parsed;
            }
          } catch (e) {}
        }
      }

      setListaVehiculos(vehiculosDisponibles);

      // 3. Selección y modo de vehículo
      if (initialVehiculo && (initialVehiculo.placa || initialVehiculo.modelo)) {
        const matching = vehiculosDisponibles.find(
          (v) =>
            (initialVehiculo.placa && v.placa.toUpperCase() === initialVehiculo.placa.toUpperCase()) ||
            (initialVehiculo.modelo && v.modelo.toLowerCase().includes(initialVehiculo.modelo.toLowerCase()))
        );

        if (matching) {
          setModoVehiculo('registrado');
          setVehiculoSeleccionadoId(matching.id || matching.placa);
          setMarca(matching.marca);
          setModelo(matching.modelo);
          setAnio(String(matching.anio));
          setPlaca(matching.placa);
        } else {
          setModoVehiculo('nuevo');
          setVehiculoSeleccionadoId('');
          setMarca(initialVehiculo.marca || '');
          setModelo(initialVehiculo.modelo || '');
          setAnio(initialVehiculo.anio ? String(initialVehiculo.anio) : '');
          setPlaca(initialVehiculo.placa || '');
        }
      } else if (vehiculosDisponibles.length > 0) {
        setModoVehiculo('registrado');
        const primero = vehiculosDisponibles[0];
        setVehiculoSeleccionadoId(primero.id || primero.placa);
        setMarca(primero.marca);
        setModelo(primero.modelo);
        setAnio(String(primero.anio));
        setPlaca(primero.placa);
      } else {
        // Usuario nuevo sin vehículos: Modo NUEVO limpio, sin inventar autos
        setModoVehiculo('nuevo');
        setVehiculoSeleccionadoId('');
        setMarca('');
        setModelo('');
        setAnio('');
        setPlaca('');
      }

      if (initialVehiculo?.falla) setFalla(initialVehiculo.falla);
    }

    sincronizarModal();
  }, [open, initialVehiculo, initialCliente, vehiculosRegistrados]);

  const handleSeleccionarVehiculo = (v: VehiculoOpcion) => {
    setVehiculoSeleccionadoId(v.id || v.placa);
    setMarca(v.marca);
    setModelo(v.modelo);
    setAnio(String(v.anio));
    setPlaca(v.placa);
  };

  const handleCambiarANuevo = () => {
    setModoVehiculo('nuevo');
    setVehiculoSeleccionadoId('');
    setMarca('');
    setModelo('');
    setAnio('');
    setPlaca('');
  };

  const handleCambiarARegistrado = () => {
    setModoVehiculo('registrado');
    if (listaVehiculos.length > 0) {
      const v =
        listaVehiculos.find((item) => (item.id || item.placa) === vehiculoSeleccionadoId) ||
        listaVehiculos[0];
      handleSeleccionarVehiculo(v);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const nombreFinal = nombre.trim() || usuarioAutenticado?.nombre?.trim() || '';
    const emailFinal = email.trim() || usuarioAutenticado?.email?.trim() || null;

    if (
      !nombreFinal ||
      !marca.trim() ||
      !modelo.trim() ||
      !anio.trim() ||
      !falla.trim() ||
      !sector.trim()
    ) {
      setErrorMsg('Por favor completa todos los campos del vehículo y falla para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const anioNum = parseInt(anio.trim(), 10) || null;
      const placaLimpia = (placa.trim() || 'AD456EF').toUpperCase();
      const modeloFinal = modelo.includes('[') ? modelo.trim() : `${modelo.trim()} [${placaLimpia}]`;

      // 1. Si está en modo nuevo y el usuario marcó guardar en Garaje
      if (modoVehiculo === 'nuevo' && guardarEnGaraje) {
        const nuevoVehiculo: VehiculoOpcion = {
          id: `veh_${Date.now()}`,
          marca: marca.trim(),
          modelo: modelo.trim(),
          anio: anioNum || 2022,
          placa: placaLimpia
        };

        try {
          await supabase.from('vehiculos').insert([
            {
              marca: marca.trim(),
              modelo: modelo.trim(),
              anio: anioNum || 2022,
              placa: placaLimpia,
              kilometraje: 0,
              cliente_nombre: nombreFinal,
              cliente_email: emailFinal
            }
          ]);
        } catch (e) {
          console.warn('No se pudo guardar vehículo en Supabase vehiculos:', e);
        }

        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('ttm_garaje_vehiculos');
            const listaActual = stored ? JSON.parse(stored) : [];
            const nueva = [...listaActual.filter((x: any) => x.placa !== placaLimpia), nuevoVehiculo];
            localStorage.setItem('ttm_garaje_vehiculos', JSON.stringify(nueva));
          } catch (e) {}
        }

        if (onVehiculoCreado) {
          onVehiculoCreado(nuevoVehiculo);
        }
      }

      // 2. Insertar orden en Supabase
      const { data, error } = await supabase.from('ordenes').insert([
        {
          cliente_nombre: nombreFinal,
          cliente_email: emailFinal,
          vehiculo_marca: marca.trim(),
          vehiculo_modelo: modeloFinal,
          vehiculo_placa: placaLimpia,
          placa_flota: placaLimpia,
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

      // Éxito: limpiar campos de vehículo, cerrar modal y disparar toast
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
                    {/* Identidad del Solicitante: Si ya inició sesión NO se le pide el nombre ni email */}
                    {usuarioAutenticado ? (
                      <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                            {usuarioAutenticado.nombre ? usuarioAutenticado.nombre[0].toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                              Solicitante
                            </span>
                            <h4 className="text-sm font-black text-[#0A1525] truncate">
                              {usuarioAutenticado.nombre || 'Cliente TuTallerMóvil'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {usuarioAutenticado.email} {usuarioAutenticado.telefono ? `• ${usuarioAutenticado.telefono}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right pl-2">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cuenta Activa</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Campo 1: Nombre (Solo para invitados sin sesión) */}
                        <div>
                          <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                            Tu Nombre Completo <span className="text-rose-500">*</span>
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

                        {/* Campo 1.5: Correo Electrónico (Solo para invitados sin sesión) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider">
                              Correo Electrónico
                            </label>
                            <span className="text-[10px] text-[#1E56B0] font-bold">
                              Opcional • Para recibo y vincular a Mi Garaje
                            </span>
                          </div>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="ej. roberto@gmail.com"
                              className="w-full h-11 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] focus:bg-white transition-all font-medium"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* SELECCIÓN DE VEHÍCULO: REGISTRADO O AGREGAR NUEVO */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider">
                          Vehículo para el Servicio <span className="text-rose-500">*</span>
                        </label>
                        {listaVehiculos.length > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {listaVehiculos.length} {listaVehiculos.length === 1 ? 'vehículo en tu garaje' : 'vehículos en tu garaje'}
                          </span>
                        )}
                      </div>

                      {/* Selector Toggle de Modo (Mis Registrados vs Agregar Nuevo) */}
                      {listaVehiculos.length > 0 && (
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 mb-3">
                          <button
                            type="button"
                            onClick={handleCambiarARegistrado}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              modoVehiculo === 'registrado'
                                ? 'bg-white text-[#0A1525] shadow-xs ring-1 ring-slate-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Car className={`w-3.5 h-3.5 ${modoVehiculo === 'registrado' ? 'text-[#1E56B0]' : 'text-slate-400'}`} />
                            <span>Mis Registrados ({listaVehiculos.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCambiarANuevo}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              modoVehiculo === 'nuevo'
                                ? 'bg-white text-[#0A1525] shadow-xs ring-1 ring-slate-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Plus className={`w-3.5 h-3.5 ${modoVehiculo === 'nuevo' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span>+ Agregar Nuevo</span>
                          </button>
                        </div>
                      )}

                      {/* 1. MODO: ELEGIR DE LOS REGISTRADOS */}
                      {modoVehiculo === 'registrado' && listaVehiculos.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {listaVehiculos.map((v) => {
                              const isSelected =
                                (vehiculoSeleccionadoId === (v.id || v.placa)) || (placa === v.placa);

                              return (
                                <div
                                  key={v.id || v.placa}
                                  onClick={() => handleSeleccionarVehiculo(v)}
                                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                    isSelected
                                      ? 'border-[#1E56B0] bg-blue-50/70 shadow-xs ring-1 ring-blue-200'
                                      : 'border-slate-200 hover:border-slate-300 bg-[#F8FAFC]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected ? 'bg-[#0A1525] text-[#CCFF00]' : 'bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      <Car className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-xs text-[#0A1525] truncate">
                                        {v.marca} {v.modelo}
                                      </p>
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-1 rounded">
                                          {v.placa}
                                        </span>
                                        <span>• {v.anio}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {isSelected ? (
                                      <div className="w-5 h-5 rounded-full bg-[#1E56B0] text-white flex items-center justify-center">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-slate-500">
                              ¿Vas a reparar un vehículo diferente?
                            </p>
                            <button
                              type="button"
                              onClick={handleCambiarANuevo}
                              className="text-[11px] font-bold text-[#1E56B0] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Agregar otro vehículo</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* 2. MODO: AGREGAR NUEVO VEHÍCULO */
                        <div className="space-y-3 p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 text-emerald-600" />
                              Datos del Nuevo Vehículo
                            </span>
                            {listaVehiculos.length > 0 && (
                              <button
                                type="button"
                                onClick={handleCambiarARegistrado}
                                className="text-[11px] font-bold text-[#1E56B0] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Car className="w-3 h-3" />
                                <span>← Elegir de mis registrados</span>
                              </button>
                            )}
                          </div>

                          {/* Grid Marca y Año */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#0A1525] uppercase tracking-wider mb-1">
                                Marca <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  required={modoVehiculo === 'nuevo'}
                                  value={marca}
                                  onChange={(e) => setMarca(e.target.value)}
                                  placeholder="Ej. Toyota"
                                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] transition-all font-medium"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-[#0A1525] uppercase tracking-wider mb-1">
                                Año <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="number"
                                  required={modoVehiculo === 'nuevo'}
                                  min="1970"
                                  max="2030"
                                  value={anio}
                                  onChange={(e) => setAnio(e.target.value)}
                                  placeholder="Ej. 2018"
                                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] transition-all font-medium"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Grid Modelo y Placa */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#0A1525] uppercase tracking-wider mb-1">
                                Modelo <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  required={modoVehiculo === 'nuevo'}
                                  value={modelo}
                                  onChange={(e) => setModelo(e.target.value)}
                                  placeholder="Ej. Corolla / Yaris"
                                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] transition-all font-medium"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-[#0A1525] uppercase tracking-wider mb-1">
                                Placa / Matrícula
                              </label>
                              <input
                                type="text"
                                value={placa}
                                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                                placeholder="Ej. AD456EF"
                                className="w-full h-10 px-3 text-sm font-mono font-bold uppercase bg-white border border-[#CBD5E1] rounded-xl text-[#0A1525] placeholder:text-slate-400 focus:outline-none focus:border-[#1E56B0] transition-all"
                              />
                            </div>
                          </div>

                          {/* Checkbox guardar en Garaje */}
                          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={guardarEnGaraje}
                              onChange={(e) => setGuardarEnGaraje(e.target.checked)}
                              className="w-4 h-4 text-[#1E56B0] rounded border-slate-300 focus:ring-[#1E56B0]"
                            />
                            <span className="text-xs text-slate-600 font-medium">
                              Guardar este vehículo en <strong>Mi Garaje</strong> para futuros servicios
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Campo 4: Falla Reportada */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1525] uppercase tracking-wider mb-1.5">
                        Falla Reportada o Síntoma <span className="text-rose-500">*</span>
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
                        Sector en Caracas <span className="text-rose-500">*</span>
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

                    {/* Nota de garantía y tarifa de diagnóstico */}
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#1E56B0] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600 leading-snug">
                        <strong className="text-[#0A1525]">Garantía TTM:</strong> Diagnóstico inicial $15 USD. Si la cotización es mayor a $40 el diagnóstico es gratis. Sin costos ocultos.
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

                    <p className="text-[11px] text-center text-slate-500 pt-1">
                      Al solicitar el servicio declaras aceptar los{' '}
                      <Link
                        href="/terminos"
                        target="_blank"
                        className="text-[#1E56B0] underline font-semibold hover:text-[#0A1525]"
                      >
                        Términos y Política de Privacidad
                      </Link>{' '}
                      de TuTallerMóvil.
                    </p>
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
