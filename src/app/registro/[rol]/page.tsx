'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';
import {
  Wrench,
  Bike,
  Store,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  MapPin,
  Car
} from 'lucide-react';
import GoogleAuthButton from '@/components/GoogleAuthButton';

const CONFIG_ROLES: Record<string, {
  rol: 'MECANICO' | 'RUNNER' | 'REPUESTOS';
  titulo: string;
  subtitulo: string;
  prefijo: string;
  icono: any;
  portalRuta: string;
  colorIcono: string;
  bgIcono: string;
}> = {
  mecanico: {
    rol: 'MECANICO',
    titulo: 'Registro de Especialista Mecánico',
    subtitulo: 'Atiende servicios a domicilio en Caracas y genera ingresos inmediatos.',
    prefijo: '#TTM-',
    icono: Wrench,
    portalRuta: '/aliados/portal',
    colorIcono: 'text-[#CCFF00]',
    bgIcono: 'bg-[#0A1525]'
  },
  runner: {
    rol: 'RUNNER',
    titulo: 'Registro de Runner / Mensajero',
    subtitulo: 'Despacha repuestos con validación por PIN y cobra por viaje completado.',
    prefijo: '#RUN-',
    icono: Bike,
    portalRuta: '/runner/portal',
    colorIcono: 'text-white',
    bgIcono: 'bg-sky-600'
  },
  repuestos: {
    rol: 'REPUESTOS',
    titulo: 'Registro de Casa de Repuestos',
    subtitulo: 'Vende tus autopartes en la red de talleres móviles con pago asegurado.',
    prefijo: '#REP-',
    icono: Store,
    portalRuta: '/repuestos/pedidos',
    colorIcono: 'text-[#CCFF00]',
    bgIcono: 'bg-[#1E56B0]'
  }
};

function RegistroRolContent() {
  const router = useRouter();
  const params = useParams();
  const rolParam = String(params?.rol || 'mecanico').toLowerCase();

  const config = CONFIG_ROLES[rolParam] || CONFIG_ROLES.mecanico;
  const IconoRol = config.icono;

  // Formulario Común
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Campos Específicos por Rol
  const [especialidad, setEspecialidad] = useState('Frenos y Tren Delantero');
  const [vehiculoTraslado, setVehiculoTraslado] = useState('Motocicleta');
  const [placaVehiculo, setPlacaVehiculo] = useState('');
  const [nombreTienda, setNombreTienda] = useState('');
  const [rifTienda, setRifTienda] = useState('');
  const [direccionTienda, setDireccionTienda] = useState('Caracas');

  // Estados de Operación
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pantalla de Éxito
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<string>('');
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Disparar confeti al entrar en pantalla de éxito
  useEffect(() => {
    if (registroExitoso) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#CCFF00', '#1E56B0', '#0A1525', '#25D366']
        });
      } catch (e) {}
    }
  }, [registroExitoso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    try {
      const supabase = createClient();
      const numAleatorio = Math.floor(1000 + Math.random() * 9000);
      const codigoNuevo = `${config.prefijo}${numAleatorio}`;

      // Detalles específicos
      const detalles: Record<string, any> = {};
      if (config.rol === 'MECANICO') {
        detalles.especialidad = especialidad;
        detalles.vehiculo_traslado = vehiculoTraslado;
      } else if (config.rol === 'RUNNER') {
        detalles.tipo_vehiculo = vehiculoTraslado;
        detalles.placa = placaVehiculo.trim().toUpperCase();
      } else if (config.rol === 'REPUESTOS') {
        detalles.nombre_tienda = nombreTienda.trim();
        detalles.rif = rifTienda.trim().toUpperCase();
        detalles.direccion = direccionTienda.trim();
      }

      // 1. Registro con Supabase Auth
      let userId = `usr_${Date.now()}`;
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password,
          options: {
            data: {
              nombre: nombre.trim(),
              rol: config.rol,
              telefono: telefono.trim(),
              codigo_aliado: codigoNuevo
            }
          }
        });

        if (authData?.user?.id) {
          userId = authData.user.id;
        } else if (authError) {
          console.warn('Aviso de Auth SignUp:', authError.message);
          // Si el usuario ya existe o error menor, continuar para guardar perfil
          if (authError.message.includes('already registered')) {
            setErrorMsg('Este correo electrónico ya está registrado. Por favor inicia sesión.');
            setCargando(false);
            return;
          }
        }
      } catch (authEx) {
        console.warn('Excepción SignUp:', authEx);
      }

      // 2. Insertar en tabla 'perfiles' de Supabase
      try {
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfiles')
          .insert([
            {
              id: userId,
              email: email.trim().toLowerCase(),
              rol: config.rol,
              nombre_completo: nombre.trim(),
              telefono: telefono.trim(),
              codigo_aliado: codigoNuevo,
              perfil_completado: true,
              detalles: detalles
            }
          ])
          .select('codigo_aliado')
          .maybeSingle();

        if (perfilData?.codigo_aliado) {
          setCodigoGenerado(perfilData.codigo_aliado);
        } else {
          setCodigoGenerado(codigoNuevo);
        }
      } catch (dbEx) {
        console.warn('Excepción guardando perfil:', dbEx);
        setCodigoGenerado(codigoNuevo);
      }

      // 3. Persistir en localStorage y Cookies de sesión
      const perfilLocal = {
        id: userId,
        email: email.trim().toLowerCase(),
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        rol: config.rol,
        codigo_aliado: codigoNuevo,
        detalles
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('ttm_aliado_sesion', JSON.stringify(perfilLocal));
        document.cookie = `ttm_role=${config.rol}; path=/; max-age=86400; SameSite=Lax;`;
        document.cookie = `ttm_user_code=${codigoNuevo}; path=/; max-age=86400; SameSite=Lax;`;
      }

      setCodigoGenerado(codigoNuevo);
      setRegistroExitoso(true);
    } catch (err: any) {
      console.error('Error durante el registro:', err);
      setErrorMsg(err?.message || 'Ocurrió un error inesperado al procesar tu registro.');
    } finally {
      setCargando(false);
    }
  };

  const handleCopiarCodigo = () => {
    if (!codigoGenerado) return;
    try {
      navigator.clipboard.writeText(codigoGenerado);
      setCodigoCopiado(true);
      setTimeout(() => setCodigoCopiado(false), 3000);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] antialiased selection:bg-[#CCFF00] selection:text-[#0A1525] flex flex-col justify-center items-center p-4 relative">
      
      {/* Fondo técnico de cuadrícula */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Botón Volver */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/registro"
          className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E56B0]" />
          <span>Cambiar Perfil</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-lg my-8">
        
        <AnimatePresence mode="wait">
          {!registroExitoso ? (
            /* ========================================================= */
            /* PANTALLA 1: FORMULARIO DE REGISTRO                        */
            /* ========================================================= */
            <motion.div
              key="formulario-registro"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8"
            >
              {/* Encabezado */}
              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                <div className={`w-12 h-12 rounded-2xl ${config.bgIcono} ${config.colorIcono} flex items-center justify-center font-black shadow-xs shrink-0`}>
                  <IconoRol className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                    {config.titulo}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {config.subtitulo}
                  </p>
                </div>
              </div>

              {/* Botón de Google OAuth para Aliados */}
              <div className="pt-1">
                <GoogleAuthButton
                  redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(config.portalRuta)}` : undefined}
                  texto="Continuar con Google"
                  onError={(msg) => setErrorMsg(msg)}
                />

                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    o llena tus datos
                  </div>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Nombre Completo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Nombre y Apellido *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                  />
                </div>

                {/* Correo y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Correo Electrónico *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@correo.com"
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="0414-1234567"
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Contraseña de Acceso *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Mínimo 6 caracteres</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 px-3.5 pr-10 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    >
                      {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Campos Específicos para Mecánicos */}
                {config.rol === 'MECANICO' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0A1525]">Especialidad Principal</label>
                      <select
                        value={especialidad}
                        onChange={(e) => setEspecialidad(e.target.value)}
                        className="w-full h-11 px-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#0A1525] focus:outline-none focus:border-[#1E56B0]"
                      >
                        <option value="Frenos y Tren Delantero">Frenos y Tren Delantero</option>
                        <option value="Mecánica Ligera & Afinación">Mecánica Ligera & Afinación</option>
                        <option value="Diagnóstico & Escáner OBD-II">Diagnóstico & Escáner OBD-II</option>
                        <option value="Electricidad & Baterías">Electricidad & Baterías</option>
                        <option value="Mecánica Integral General">Mecánica Integral General</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0A1525]">Unidad de Traslado</label>
                      <select
                        value={vehiculoTraslado}
                        onChange={(e) => setVehiculoTraslado(e.target.value)}
                        className="w-full h-11 px-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#0A1525] focus:outline-none focus:border-[#1E56B0]"
                      >
                        <option value="Motocicleta con caja de herramientas">Motocicleta (Recomendado)</option>
                        <option value="Vehículo Particular / Camioneta">Vehículo Particular</option>
                        <option value="Transporte en ruta aliada">Transporte en ruta aliada</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Campos Específicos para Runners */}
                {config.rol === 'RUNNER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0A1525]">Vehículo de Entrega</label>
                      <select
                        value={vehiculoTraslado}
                        onChange={(e) => setVehiculoTraslado(e.target.value)}
                        className="w-full h-11 px-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#0A1525] focus:outline-none focus:border-[#1E56B0]"
                      >
                        <option value="Moto Bera / Empire 150cc">Moto 150cc (Estándar)</option>
                        <option value="Moto Scooter Express">Moto Scooter</option>
                        <option value="Bicicleta / Ciclista">Bicicleta Urbana</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0A1525]">Placa del Vehículo</label>
                      <input
                        type="text"
                        required
                        value={placaVehiculo}
                        onChange={(e) => setPlacaVehiculo(e.target.value.toUpperCase())}
                        placeholder="Ej. AB1C23D"
                        className="w-full h-11 px-3.5 text-xs font-mono font-bold bg-[#F8FAFC] border border-slate-200 rounded-xl uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* Campos Específicos para Casas de Repuestos */}
                {config.rol === 'REPUESTOS' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0A1525]">Nombre Comercial</label>
                        <input
                          type="text"
                          required
                          value={nombreTienda}
                          onChange={(e) => setNombreTienda(e.target.value)}
                          placeholder="Ej. Repuestos El Rosal C.A."
                          className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0A1525]">RIF de la Empresa</label>
                        <input
                          type="text"
                          required
                          value={rifTienda}
                          onChange={(e) => setRifTienda(e.target.value.toUpperCase())}
                          placeholder="J-12345678-9"
                          className="w-full h-11 px-3.5 text-xs font-mono font-bold bg-[#F8FAFC] border border-slate-200 rounded-xl uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0A1525]">Zona / Sector en Caracas</label>
                      <input
                        type="text"
                        value={direccionTienda}
                        onChange={(e) => setDireccionTienda(e.target.value)}
                        placeholder="Ej. Las Acacias, Boleíta, Quinta Crespo"
                        className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Mensaje de Error */}
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {errorMsg}
                  </div>
                )}

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full h-12 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {cargando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#CCFF00]" />
                      <span>Generando tu Código de Aliado...</span>
                    </>
                  ) : (
                    <>
                      <span>Completar Registro y Generar Código</span>
                      <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Al registrarte aceptas las políticas de garantía técnica y el código de conducta TTM.
                </p>
              </form>
            </motion.div>
          ) : (
            /* ========================================================= */
            /* PANTALLA 2: ÉXITO Y ENTREGA DEL CÓDIGO DE ALIADO          */
            /* ========================================================= */
            <motion.div
              key="pantalla-exito-codigo"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl p-7 sm:p-9 text-center space-y-6 relative overflow-hidden"
            >
              {/* Franja superior estética */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1E56B0] via-[#0A1525] to-[#CCFF00]" />

              {/* Check Gigante */}
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border-4 border-emerald-50">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              {/* Mensaje de Bienvenida */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                  Identidad Oficial Certificada
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  ¡Bienvenido a TuTallerMóvil!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Hola <strong>{nombre}</strong>, tu perfil de <strong>{config.rol}</strong> ha sido activado en la red oficial de Caracas.
                </p>
              </div>

              {/* Tarjeta del Código en Grande */}
              <div className="p-6 rounded-2xl bg-[#0A1525] text-white border border-slate-800 shadow-xl space-y-3 relative group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Tu Código Único de Aliado
                </span>

                <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-[#CCFF00] py-1 select-all">
                  {codigoGenerado}
                </div>

                {/* Botón para Copiar Código */}
                <button
                  type="button"
                  onClick={handleCopiarCodigo}
                  className="mx-auto h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  {codigoCopiado ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span className="text-[#CCFF00]">¡Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              {/* Indicación de Uso */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-slate-600 text-left space-y-1">
                <p className="font-bold text-[#1E56B0] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1E56B0]" />
                  <span>Guarda tu código seguro</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Podrás acceder a tus operaciones iniciando sesión con tu correo electrónico o directamente con tu código <strong>{codigoGenerado}</strong>.
                </p>
              </div>

              {/* Botón Principal: Ir a mi Portal */}
              <div className="pt-2">
                <Link
                  href={config.portalRuta}
                  className="w-full h-14 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] active:scale-98 text-[#0A1525] font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg border border-[#0A1525]/10 cursor-pointer"
                >
                  <span>Ir a mi Portal</span>
                  <ArrowRight className="w-5 h-5 text-[#0A1525]" />
                </Link>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default function RegistroRolPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#1E56B0] border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegistroRolContent />
    </Suspense>
  );
}
