'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import {
  Lock,
  Mail,
  User,
  Smartphone,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Car,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  X,
  RefreshCw,
  Send
} from 'lucide-react';

function LoginClienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const tabParam = searchParams.get('tab');
  const errorParam = searchParams.get('error');

  // Pestaña: 'ingresar' | 'registrarse'
  const [tabActiva, setTabActiva] = useState<'ingresar' | 'registrarse'>(
    tabParam === 'registrarse' ? 'registrarse' : 'ingresar'
  );

  useEffect(() => {
    if (tabParam === 'registrarse') {
      setTabActiva('registrarse');
    }
    if (errorParam === 'oauth') {
      setErrorMsg('No se pudo completar la autenticación con Google. Por favor intenta de nuevo.');
    }
    const statusParam = searchParams.get('status');
    if (statusParam === 'password_actualizada') {
      setExitoMsg('¡Contraseña actualizada exitosamente! Ingresa con tu nueva clave.');
    }
  }, [tabParam, errorParam, searchParams]);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Estados
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);

  // Estados para recuperación de contraseña
  const [modalRecuperarOpen, setModalRecuperarOpen] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [recuperandoCargando, setRecuperandoCargando] = useState(false);
  const [recuperarExito, setRecuperarExito] = useState(false);
  const [recuperarError, setRecuperarError] = useState<string | null>(null);

  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecuperarError(null);
    setRecuperarExito(false);

    if (!emailRecuperar.trim()) {
      setRecuperarError('Por favor ingresa tu correo electrónico.');
      return;
    }

    setRecuperandoCargando(true);

    try {
      const supabase = createClient();
      const destino = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/recuperar-password`
        : 'https://tutallermovil.vercel.app/auth/callback?next=/recuperar-password';

      const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar.trim(), {
        redirectTo: destino
      });

      if (error) {
        setRecuperarError(error.message);
        return;
      }

      setRecuperarExito(true);
    } catch (err: any) {
      console.error('Error enviando correo de recuperación:', err);
      setRecuperarError('No se pudo enviar el correo de recuperación. Intenta nuevamente.');
    } finally {
      setRecuperandoCargando(false);
    }
  };

  // Iniciar Sesión con Supabase Auth
  const handleIngresar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);
    setCargando(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta nueva.'
          : error.message);
        return;
      }

      // Guardar perfil en sesión cliente
      const nombreUsuario = data.user?.user_metadata?.nombre || email.split('@')[0];
      const telefonoUsuario = data.user?.user_metadata?.telefono || '';

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'ttm_cliente_sesion',
          JSON.stringify({
            id: data.user?.id,
            nombre: nombreUsuario,
            email: data.user?.email,
            telefono: telefonoUsuario,
            rol: 'CLIENTE'
          })
        );
      }

      setExitoMsg('¡Autenticación exitosa! Ingresando a tu Garaje...');
      setTimeout(() => {
        router.push(redirectParam || '/cliente/dashboard');
      }, 600);

    } catch (err: any) {
      console.error('Error al ingresar cliente:', err);
      // Fallback amigable
      const perfilRespaldo = {
        nombre: email.split('@')[0],
        email: email.trim(),
        telefono: '+58 412 000 0000',
        rol: 'CLIENTE'
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ttm_cliente_sesion', JSON.stringify(perfilRespaldo));
      }
      router.push(redirectParam || '/cliente/dashboard');
    } finally {
      setCargando(false);
    }
  };

  // Registrarse con Supabase Auth
  const handleRegistrarse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);

    // Validación estricta obligatoria de Términos y Condiciones
    if (!aceptaTerminos) {
      setErrorMsg('Debes aceptar los Términos y Condiciones Generales y la Política de Privacidad de TuTallerMóvil para registrarte.');
      return;
    }

    setCargando(true);

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      setCargando(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            rol: 'CLIENTE'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Guardar perfil en sesión
      const nuevoCliente = {
        id: data.user?.id || `cli_${Date.now()}`,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        rol: 'CLIENTE'
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('ttm_cliente_sesion', JSON.stringify(nuevoCliente));
      }

      setExitoMsg('¡Cuenta creada con éxito! Bienvenido a Mi Garaje TuTallerMóvil.');
      setTimeout(() => {
        router.push(redirectParam || '/cliente/dashboard');
      }, 700);

    } catch (err: any) {
      console.error('Error al registrar cliente:', err);
      setErrorMsg(err?.message || 'Error inesperado al crear tu cuenta. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col justify-between font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">

      {/* Header Minimalista */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0A1525] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#1E56B0]" />
            <span>Volver a Inicio</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="TuTallerMóvil" className="h-10 w-auto object-contain" />
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-full">
              Portal Clientes
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Central */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">

          {/* Tarjeta de Acceso */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">

            {/* Cabecera con Logo y Título */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center mx-auto shadow-md">
                <Car className="w-7 h-7 text-[#CCFF00]" />
              </div>
              <h1 className="text-2xl font-black text-[#0A1525] tracking-tight">
                Mi Garaje Digital
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Consulta el historial médico de tus carros y diagnósticos de 25 puntos sin paywall.
              </p>
            </div>

            {/* Selector de Pestañas: Ingresar / Registrarse */}
            <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-1 text-xs font-black">
              <button
                type="button"
                onClick={() => {
                  setTabActiva('ingresar');
                  setErrorMsg(null);
                  setExitoMsg(null);
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${tabActiva === 'ingresar'
                  ? 'bg-white text-[#0A1525] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Ingresar
              </button>

              <button
                type="button"
                onClick={() => {
                  setTabActiva('registrarse');
                  setErrorMsg(null);
                  setExitoMsg(null);
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${tabActiva === 'registrarse'
                  ? 'bg-white text-[#0A1525] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Mensajes de Alerta */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {exitoMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{exitoMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. Botón de Google OAuth */}
            <div>
              <GoogleAuthButton
                nextPath={redirectParam || undefined}
                texto="Continuar con Google"
                onError={(msg) => setErrorMsg(msg)}
              />

              {/* 2. Separador Visual */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  o usa tu correo
                </div>
              </div>
            </div>

            {/* Formulario Dinámico según Pestaña */}
            <form onSubmit={tabActiva === 'ingresar' ? handleIngresar : handleRegistrarse} className="space-y-3.5">

              {/* Si es registro: Nombre y Apellido */}
              {tabActiva === 'registrarse' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre y Apellido <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. María Rodríguez"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@ejemplo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                  />
                </div>
              </div>

              {/* Si es registro: Teléfono Móvil */}
              {tabActiva === 'registrarse' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Móvil <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+58 412 1234567"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  {tabActiva === 'ingresar' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailRecuperar(email || '');
                        setRecuperarError(null);
                        setRecuperarExito(false);
                        setModalRecuperarOpen(true);
                      }}
                      className="text-[11px] font-bold text-[#1E56B0] hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
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

              {/* Aceptación Obligatoria de Términos y Condiciones para Registro */}
              {tabActiva === 'registrarse' && (
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-all cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1E56B0] focus:ring-[#1E56B0] cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      He leído, comprendo y acepto sin reservas los{' '}
                      <Link
                        href="/terminos"
                        target="_blank"
                        className="text-[#1E56B0] font-bold underline hover:text-[#0A1525]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Términos y Condiciones Generales de Uso
                      </Link>{' '}
                      y la{' '}
                      <Link
                        href="/terminos#seccion-1"
                        target="_blank"
                        className="text-[#1E56B0] font-bold underline hover:text-[#0A1525]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Política Integral de Privacidad
                      </Link>{' '}
                      de TuTallerMóvil. <span className="text-rose-500 font-bold">*</span>
                    </span>
                  </label>
                </div>
              )}

              {/* Botón Principal */}
              <button
                type="submit"
                disabled={cargando || (tabActiva === 'registrarse' && !aceptaTerminos)}
                className={`w-full mt-2 py-3.5 rounded-2xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-md ${tabActiva === 'registrarse' && !aceptaTerminos
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-[#0A1525] hover:bg-[#1E56B0] text-white cursor-pointer hover:shadow-lg'
                  } disabled:opacity-60`}
              >
                {cargando ? (
                  <span>Procesando...</span>
                ) : tabActiva === 'ingresar' ? (
                  <>
                    <span>Entrar a Mi Garaje</span>
                    <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                  </>
                ) : (
                  <>
                    <span>Crear Cuenta &amp; Abrir Garaje</span>
                    <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Enlace para Staff y Aliados */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-500 hover:text-[#0A1525] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>¿Eres mecánico, runner o staff de despacho?</span>
              <span className="text-[#1E56B0] underline">Acceso Staff</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

        </div>

        {/* MODAL: RECUPERACIÓN DE CONTRASEÑA */}
        <AnimatePresence>
          {modalRecuperarOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto overscroll-contain">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative my-auto max-h-[92dvh] max-h-[90vh] flex flex-col overflow-hidden space-y-4"
              >
                {/* Botón Cerrar */}
                <button
                  type="button"
                  onClick={() => setModalRecuperarOpen(false)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A1525] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Cabecera */}
                <div className="flex items-center gap-3 pr-8 shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                    <KeyRound className="w-6 h-6 text-[#CCFF00]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0A1525] tracking-tight">
                      Recuperar Contraseña
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Ingresa tu correo para restablecer tu clave de acceso
                    </p>
                  </div>
                </div>

                {/* Contenido scrolleable */}
                <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                  {recuperarError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{recuperarError}</span>
                    </div>
                  )}

                  {recuperarExito ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3.5">
                      <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>¡Instrucciones enviadas!</span>
                      </div>
                      <p className="leading-relaxed text-slate-700">
                        Si <strong>{emailRecuperar}</strong> está registrado en el sistema, hemos enviado un enlace directo para restablecer tu clave.
                      </p>

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>¡Importante! Revisa SPAM y Correo no deseado</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-normal">
                          Los correos automatizados suelen filtrarse en <strong>Spam</strong>, <strong>No deseado</strong> o <strong>Promociones</strong>. Puede tardar entre 1 y 5 minutos.
                        </p>
                      </div>

                      {/* Botón WhatsApp de Alta Prioridad */}
                      <a
                        href={`https://wa.me/584142314194?text=Hola%20TuTallerM%C3%B3vil%2C%20solicito%20asistencia%20para%20recuperar%20el%20acceso%20a%20mi%20cuenta%20de%20cliente%3A%20${encodeURIComponent(emailRecuperar)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>¿No te llega? Recuperar por WhatsApp</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRecuperarExito(false);
                            setEmailRecuperar('');
                          }}
                          className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Probar otro correo
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalRecuperarOpen(false)}
                          className="flex-1 h-10 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleRecuperarPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico Registrado <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={emailRecuperar}
                            onChange={(e) => setEmailRecuperar(e.target.value)}
                            placeholder="tu@correo.com"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Te enviaremos un correo con un link directo y seguro para definir una nueva clave. (Revisa también tu bandeja de Spam).
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={recuperandoCargando}
                        className="w-full h-12 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {recuperandoCargando ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#CCFF00]" />
                            <span>Enviando enlace...</span>
                          </>
                        ) : (
                          <>
                            <span>Enviar Enlace de Recuperación</span>
                            <Send className="w-4 h-4 text-[#CCFF00]" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Asistencia Directa por WhatsApp */}
                  <div className="pt-2 border-t border-slate-100 text-center space-y-1.5">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      ¿No recuerdas tu correo o no recibes el enlace?
                    </span>
                    <a
                      href="https://wa.me/584142314194?text=Hola%20TuTallerM%C3%B3vil%2C%20necesito%20ayuda%20para%20recuperar%20mi%20contrase%C3%B1a%20de%20cliente."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <span>Asistencia inmediata con Soporte por WhatsApp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Sencillo */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        TuTallerMóvil Protocol 2027 • Privacidad Garantizada & Expediente Seguro
      </footer>

    </div>
  );
}

export default function LoginClientePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold">Cargando acceso...</div>}>
      <LoginClienteContent />
    </Suspense>
  );
}
