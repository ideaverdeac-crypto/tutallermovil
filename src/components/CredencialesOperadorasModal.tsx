'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  X,
  UserPlus,
  Users,
  Pencil,
  RotateCcw,
  Camera,
  Upload,
  Sparkles,
  Eye,
  EyeOff,
  Smartphone,
  Check,
  ShieldCheck,
  UserX,
  Clock,
  Copy,
  Trash2,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface CredencialOperadora {
  id: string;
  nombre: string;
  email: string;
  passwordTemporal: string;
  turno: string;
  telefono?: string;
  fechaCreacion: string;
  estado: 'ACTIVA' | 'SUSPENDIDA';
  fotoUrl?: string;
}

export const OPERADORAS_INICIALES: CredencialOperadora[] = [
  {
    id: 'op_1',
    nombre: 'Ana Pérez',
    email: 'ana.despacho@tutallermovil.com',
    passwordTemporal: 'Despacho2026*',
    turno: 'Turno Mañana (07:00 AM - 03:00 PM)',
    telefono: '+58 412 1234567',
    fechaCreacion: '10 Nov 2026',
    estado: 'ACTIVA',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'op_2',
    nombre: 'Carlos Martínez',
    email: 'carlos.despacho@tutallermovil.com',
    passwordTemporal: 'CaracasTaller#1',
    turno: 'Turno Tarde (02:00 PM - 10:00 PM)',
    telefono: '+58 414 7654321',
    fechaCreacion: '12 Nov 2026',
    estado: 'ACTIVA',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  }
];

interface CredencialesOperadorasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOperadorasChange?: (operadoras: CredencialOperadora[]) => void;
}

export default function CredencialesOperadorasModal({
  isOpen,
  onClose,
  onOperadorasChange
}: CredencialesOperadorasModalProps) {
  const [operadoras, setOperadoras] = useState<CredencialOperadora[]>(OPERADORAS_INICIALES);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaEmail, setNuevaEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [nuevaTurno, setNuevaTurno] = useState('Turno Mañana (07:00 AM - 03:00 PM)');
  const [nuevaTelefono, setNuevaTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [mensajeOperadora, setMensajeOperadora] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState<string>('');
  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);
  const [editandoOperadoraId, setEditandoOperadoraId] = useState<string | null>(null);
  const fileInputOperadoraRef = useRef<HTMLInputElement>(null);

  // Cargar operadoras persistidas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ttm_operadoras_credenciales');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOperadoras(parsed);
          } else {
            localStorage.setItem('ttm_operadoras_credenciales', JSON.stringify(OPERADORAS_INICIALES));
          }
        } else {
          localStorage.setItem('ttm_operadoras_credenciales', JSON.stringify(OPERADORAS_INICIALES));
        }
      } catch (err) {
        console.error('Error cargando operadoras:', err);
      }
    }
  }, [isOpen]);

  const guardarOperadoras = (nuevas: CredencialOperadora[]) => {
    setOperadoras(nuevas);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ttm_operadoras_credenciales', JSON.stringify(nuevas));
      window.dispatchEvent(new Event('ttm_operadoras_updated'));
    }
    if (onOperadorasChange) {
      onOperadorasChange(nuevas);
    }
  };

  const generarPasswordSegura = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'TTM-';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNuevaPassword(pass);
  };

  const handleCargarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG).');
      return;
    }

    setSubiendoFoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNuevaFotoUrl(result);
      setSubiendoFoto(false);
    };
    reader.onerror = () => {
      setSubiendoFoto(false);
      alert('Error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleIniciarEdicion = (op: CredencialOperadora) => {
    setEditandoOperadoraId(op.id);
    setNuevaNombre(op.nombre);
    setNuevaEmail(op.email);
    setNuevaPassword(op.passwordTemporal);
    setNuevaTurno(op.turno);
    setNuevaTelefono(op.telefono || '');
    setNuevaFotoUrl(op.fotoUrl || '');
    setMensajeOperadora({
      tipo: 'ok',
      texto: `✏️ Editando los datos de ${op.nombre}. Realiza los cambios y pulsa "Guardar Cambios".`
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoOperadoraId(null);
    setNuevaNombre('');
    setNuevaEmail('');
    setNuevaPassword('');
    setNuevaTelefono('');
    setNuevaFotoUrl('');
    setMensajeOperadora(null);
    if (fileInputOperadoraRef.current) {
      fileInputOperadoraRef.current.value = '';
    }
  };

  const handleGuardarOperadora = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeOperadora(null);

    if (!nuevaNombre.trim()) {
      setMensajeOperadora({ tipo: 'error', texto: 'Por favor ingresa el nombre de la operadora.' });
      return;
    }

    if (!nuevaEmail.trim() || !nuevaEmail.includes('@')) {
      setMensajeOperadora({ tipo: 'error', texto: 'Por favor ingresa un correo electrónico válido.' });
      return;
    }

    const emailNorm = nuevaEmail.trim().toLowerCase();

    // Modo Edición: Actualizar operadora existente
    if (editandoOperadoraId) {
      if (operadoras.some((o) => o.id !== editandoOperadoraId && o.email.toLowerCase() === emailNorm)) {
        setMensajeOperadora({ tipo: 'error', texto: 'Ya existe otra operadora registrada con este correo.' });
        return;
      }

      const actualizadas = operadoras.map((op) => {
        if (op.id === editandoOperadoraId) {
          return {
            ...op,
            nombre: nuevaNombre.trim(),
            email: emailNorm,
            passwordTemporal: nuevaPassword.trim() || op.passwordTemporal,
            turno: nuevaTurno,
            telefono: nuevaTelefono.trim() || undefined,
            fotoUrl: nuevaFotoUrl || op.fotoUrl
          };
        }
        return op;
      });

      guardarOperadoras(actualizadas);
      handleCancelarEdicion();
      setMensajeOperadora({
        tipo: 'ok',
        texto: `✅ ¡Datos de ${nuevaNombre.trim()} actualizados exitosamente!`
      });
      return;
    }

    // Modo Creación: Registrar nueva operadora
    if (operadoras.some((o) => o.email.toLowerCase() === emailNorm)) {
      setMensajeOperadora({ tipo: 'error', texto: 'Ya existe una operadora registrada con este correo.' });
      return;
    }

    const passFinal = nuevaPassword.trim() || `TTM-${Math.floor(100000 + Math.random() * 900000)}`;

    const nueva: CredencialOperadora = {
      id: `op_${Date.now()}`,
      nombre: nuevaNombre.trim(),
      email: emailNorm,
      passwordTemporal: passFinal,
      turno: nuevaTurno,
      telefono: nuevaTelefono.trim() || undefined,
      fechaCreacion: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }),
      estado: 'ACTIVA',
      fotoUrl: nuevaFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    };

    const actualizadas = [nueva, ...operadoras];
    guardarOperadoras(actualizadas);

    handleCancelarEdicion();
    setMensajeOperadora({
      tipo: 'ok',
      texto: `✅ ¡Operadora ${nueva.nombre} dada de alta exitosamente! Ya puedes compartir sus credenciales.`
    });
  };

  const handleToggleEstadoOperadora = (id: string) => {
    const actualizadas = operadoras.map((op) => {
      if (op.id === id) {
        const nuevoEstado: 'ACTIVA' | 'SUSPENDIDA' = op.estado === 'ACTIVA' ? 'SUSPENDIDA' : 'ACTIVA';
        return { ...op, estado: nuevoEstado };
      }
      return op;
    });
    guardarOperadoras(actualizadas);
  };

  const handleEliminarOperadora = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de revocar permanentemente las credenciales de ${nombre}?`)) {
      const actualizadas = operadoras.filter((op) => op.id !== id);
      guardarOperadoras(actualizadas);
    }
  };

  const copiarCredencialesWhatsApp = (op: CredencialOperadora) => {
    const texto = `👋 *¡Hola ${op.nombre}!*
Tus credenciales oficiales para la cabina de despacho en *TuTallerMóvil* han sido emitidas por la Dirección:

🔗 *Portal de Acceso:* https://tutallermovil.vercel.app/login
📧 *Correo:* \`${op.email}\`
🔑 *Contraseña:* \`${op.passwordTemporal}\`
🕒 *Turno Asignado:* ${op.turno}

⚠️ *Instrucciones:*
1. Ingresa a la URL e inicia sesión en la pestaña *Staff (Operadoras & Dueños)*.
2. Mantén tu sesión activa durante tu turno para atender el tablero táctico.
3. Ante cualquier consulta, contacta al administrador de turno.`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiadoId(op.id);
      setTimeout(() => setCopiadoId(null), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop con desenfoque de cristal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A1525]/80 backdrop-blur-md"
          />

          {/* Contenedor del Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
          >
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A1525] via-[#112240] to-[#0A1525] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-[#CCFF00] border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Credenciales de Operadoras de Despacho
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#CCFF00] text-[#0A1525] px-2 py-0.5 rounded-full">
                      Dueño Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Crea y administra los accesos para el equipo de control de flota y despacho táctico.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido en 2 Columnas (Desktop) */}
            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8FAFC]">
              {/* COLUMNA 1: FORMULARIO DE ALTA (5 cols en desktop) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {editandoOperadoraId ? (
                        <Pencil className="w-4 h-4 text-blue-600" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-[#1E56B0]" />
                      )}
                      <h4 className="text-sm font-black text-[#0A1525]">
                        {editandoOperadoraId ? 'Editar Datos de Operadora' : 'Emitir Nueva Credencial'}
                      </h4>
                    </div>
                    {editandoOperadoraId && (
                      <button
                        type="button"
                        onClick={handleCancelarEdicion}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Cancelar Edición</span>
                      </button>
                    )}
                  </div>

                  {mensajeOperadora && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        mensajeOperadora.tipo === 'ok'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {mensajeOperadora.tipo === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      )}
                      <span>{mensajeOperadora.texto}</span>
                    </div>
                  )}

                  <form onSubmit={handleGuardarOperadora} className="space-y-3.5">
                    {/* Foto de Perfil de la Operadora */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Foto de Perfil <span className="text-slate-400 font-normal">(Dispositivo o Cámara)</span>
                      </label>
                      <div className="flex items-center gap-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="relative group shrink-0">
                          {nuevaFotoUrl ? (
                            <img
                              src={nuevaFotoUrl}
                              alt="Foto de perfil"
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white flex items-center justify-center text-slate-400 shadow-xs">
                              <Users className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => fileInputOperadoraRef.current?.click()}
                            className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Cambiar foto"
                          >
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="file"
                            ref={fileInputOperadoraRef}
                            accept="image/*"
                            onChange={handleCargarFoto}
                            className="hidden"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputOperadoraRef.current?.click()}
                              disabled={subiendoFoto}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#1E56B0]" />
                              <span>{nuevaFotoUrl ? 'Cambiar Foto' : 'Cargar desde Dispositivo'}</span>
                            </button>
                            {nuevaFotoUrl && (
                              <button
                                type="button"
                                onClick={() => setNuevaFotoUrl('')}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            JPG, PNG o WebP desde tu galería o cámara
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nombre y Apellido */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre y Apellido <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nuevaNombre}
                        onChange={(e) => setNuevaNombre(e.target.value)}
                        placeholder="Ej. Mariana Salazar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                      />
                    </div>

                    {/* Correo Electrónico */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Corporativo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={nuevaEmail}
                        onChange={(e) => setNuevaEmail(e.target.value)}
                        placeholder="ej. mariana.despacho@tutallermovil.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                      />
                    </div>

                    {/* Contraseña Temporal */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Contraseña de Acceso
                        </label>
                        <button
                          type="button"
                          onClick={generarPasswordSegura}
                          className="text-[11px] font-bold text-[#1E56B0] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Generar Segura</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={mostrarPassword ? 'text' : 'password'}
                          value={nuevaPassword}
                          onChange={(e) => setNuevaPassword(e.target.value)}
                          placeholder="Autogenerar o escribir manual"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {mostrarPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Turno Asignado */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Turno de Trabajo Asignado
                      </label>
                      <select
                        value={nuevaTurno}
                        onChange={(e) => setNuevaTurno(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all cursor-pointer"
                      >
                        <option value="Turno Mañana (07:00 AM - 03:00 PM)">
                          🌅 Turno Mañana (07:00 AM - 03:00 PM)
                        </option>
                        <option value="Turno Tarde (02:00 PM - 10:00 PM)">
                          🌆 Turno Tarde (02:00 PM - 10:00 PM)
                        </option>
                        <option value="Turno Nocturno / Guardias (10:00 PM - 06:00 AM)">
                          🌙 Turno Nocturno / Guardias (10:00 PM - 06:00 AM)
                        </option>
                        <option value="Jornadas Especiales / Fin de Semana">
                          ⚡ Jornadas Especiales / Fin de Semana
                        </option>
                      </select>
                    </div>

                    {/* WhatsApp / Teléfono (Opcional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono / WhatsApp <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={nuevaTelefono}
                          onChange={(e) => setNuevaTelefono(e.target.value)}
                          placeholder="+58 412 1234567"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                        />
                      </div>
                    </div>

                    {/* Botón Guardar / Actualizar */}
                    <button
                      type="submit"
                      className={`w-full mt-2 py-3 rounded-xl text-white text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg ${
                        editandoOperadoraId
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-[#0A1525] hover:bg-[#1E56B0]'
                      }`}
                    >
                      {editandoOperadoraId ? (
                        <>
                          <Check className="w-4 h-4 text-[#CCFF00]" />
                          <span>Guardar Cambios de Operadora</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-[#CCFF00]" />
                          <span>Dar de Alta & Emitir Acceso</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Permiso directo con rol OPERADORA (RBAC Nivel 2).</span>
                </div>
              </div>

              {/* COLUMNA 2: LISTA DE OPERADORAS ACTIVAS (7 cols en desktop) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-black text-[#0A1525]">
                      Operadoras Registradas
                    </h4>
                    <span className="text-[11px] font-mono font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                      {operadoras.length} total
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-semibold">
                    {operadoras.filter((o) => o.estado === 'ACTIVA').length} activas
                  </span>
                </div>

                {operadoras.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                    <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold">No hay operadoras registradas.</p>
                    <p className="text-[11px] mt-1">Usa el formulario para dar de alta la primera.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {operadoras.map((op) => (
                      <div
                        key={op.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          editandoOperadoraId === op.id
                            ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
                        }`}
                      >
                        {/* Avatar y Datos de la Operadora */}
                        <div className="flex items-center gap-3.5">
                          {/* Avatar con foto y dot de estado */}
                          <div className="relative shrink-0">
                            {op.fotoUrl ? (
                              <img
                                src={op.fotoUrl}
                                alt={op.nombre}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-sm">
                                {op.nombre.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                op.estado === 'ACTIVA' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              title={op.estado === 'ACTIVA' ? 'En línea / Activa' : 'Suspendida'}
                            />
                          </div>

                          {/* Datos */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[#0A1525]">
                                {op.nombre}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  op.estado === 'ACTIVA'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {op.estado}
                              </span>
                            </div>

                            <p className="text-[11px] font-mono text-slate-600">
                              {op.email}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#1E56B0]" />
                                {op.turno}
                              </span>
                              <span>•</span>
                              <span>Creado: {op.fechaCreacion}</span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones para el Dueño */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Editar datos y foto */}
                          <button
                            type="button"
                            onClick={() => handleIniciarEdicion(op)}
                            className={`h-8 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              editandoOperadoraId === op.id
                                ? 'border-blue-300 bg-blue-100 text-blue-900'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-700'
                            }`}
                            title="Editar datos y foto de la operadora"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                            <span>Editar</span>
                          </button>

                          {/* Copiar para WhatsApp */}
                          <button
                            type="button"
                            onClick={() => copiarCredencialesWhatsApp(op)}
                            className="h-8 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-black text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copiar credenciales formateadas para enviar por WhatsApp"
                          >
                            {copiadoId === op.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </>
                            )}
                          </button>

                          {/* Suspender / Reactivar */}
                          <button
                            type="button"
                            onClick={() => handleToggleEstadoOperadora(op.id)}
                            className={`h-8 px-2.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                              op.estado === 'ACTIVA'
                                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                            title={op.estado === 'ACTIVA' ? 'Suspender acceso temporalmente' : 'Reactivar acceso'}
                          >
                            {op.estado === 'ACTIVA' ? 'Suspender' : 'Reactivar'}
                          </button>

                          {/* Revocar / Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleEliminarOperadora(op.id, op.nombre)}
                            className="h-8 w-8 rounded-lg border border-slate-200 hover:border-rose-200 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Revocar credencial permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cuadro informativo de seguridad */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-[#1E56B0] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Auditoría Garantizada:</span> Cada asignación de mecánico, modificación de cotización o envío de runner realizado por estas operadoras queda registrado con su nombre y sello de tiempo en la Bitácora inmutable de tu panel.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                RBAC Security • TuTallerMóvil Protocol 2027
              </span>

              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
