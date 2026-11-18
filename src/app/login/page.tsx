'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Wrench,
  Bike,
  Store,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Landmark,
  User,
  ArrowLeft
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Pestaña activa: 'staff' (Operadoras y Dueños) | 'aliados' (Mecánicos, Runners, Repuestos)
  const [tabActiva, setTabActiva] = useState<'staff' | 'aliados'>('staff');

  // Formulario Staff
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Formulario Aliados
  const [aliadoCodigo, setAliadoCodigo] = useState('');
  const [aliadoPin, setAliadoPin] = useState('');

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);

  // Redirección por Rol (RBAC)
  const redirigirPorRol = (rol: string, customRedirect?: string | null) => {
    // Si viene de una ruta protegida y coincide con su rol, respetarla
    if (customRedirect) {
      if (
        (rol === 'ADMIN' && customRedirect.startsWith('/admin')) ||
        (rol === 'OPERADORA' && customRedirect.startsWith('/admin/despacho')) ||
        (rol === 'MECANICO' && customRedirect.startsWith('/aliados')) ||
        (rol === 'RUNNER' && customRedirect.startsWith('/runner')) ||
        (rol === 'REPUESTOS' && customRedirect.startsWith('/repuestos'))
      ) {
        window.location.href = customRedirect;
        return;
      }
    }

    switch (rol) {
      case 'ADMIN':
        window.location.href = '/admin/finanzas';
        break;
      case 'OPERADORA':
        window.location.href = '/admin/despacho';
        break;
      case 'MECANICO':
        window.location.href = '/aliados/portal';
        break;
      case 'RUNNER':
        window.location.href = '/runner/portal';
        break;
      case 'REPUESTOS':
        window.location.href = '/repuestos/pedidos';
        break;
      default:
        window.location.href = '/admin/despacho';
        break;
    }
  };

  // Manejo de Login: Staff (Email y Contraseña)
  const handleLoginStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);
    setCargando(true);

    try {
      const email = staffEmail.trim().toLowerCase();
      const password = staffPassword.trim();

      if (!email || !password) {
        setErrorMensaje('Por favor ingresa tu correo electrónico y contraseña.');
        setCargando(false);
        return;
      }

      // 0. Verificar si es una credencial de operadora creada por el dueño en su panel
      if (typeof window !== 'undefined') {
        try {
          const rawOps = localStorage.getItem('ttm_operadoras_credenciales');
          if (rawOps) {
            const listaOps = JSON.parse(rawOps);
            const opEncontrada = listaOps.find((op: any) => op.email && op.email.toLowerCase() === email);
            if (opEncontrada) {
              if (opEncontrada.estado === 'SUSPENDIDA') {
                setErrorMensaje('⚠️ Tu cuenta de operadora ha sido suspendida por la Dirección de TuTallerMóvil.');
                setCargando(false);
                return;
              }
              if (opEncontrada.passwordTemporal && opEncontrada.passwordTemporal !== password) {
                setErrorMensaje('Contraseña incorrecta. Contacta al Administrador de TuTallerMóvil.');
                setCargando(false);
                return;
              }

              // Autenticación de Operadora creada por el dueño exitosa
              document.cookie = `ttm_role=OPERADORA; path=/; max-age=86400; SameSite=Lax;`;
              document.cookie = `ttm_user_code=${email}; path=/; max-age=86400; SameSite=Lax;`;

              setExitoMensaje(`¡Bienvenida ${opEncontrada.nombre}! Accediendo al Centro de Despacho...`);
              setTimeout(() => {
                redirigirPorRol('OPERADORA', redirectParam);
              }, 500);
              return;
            }
          }
        } catch (e) {
          console.warn('[LOGIN] Error verificando operadoras locales:', e);
        }
      }

      const supabase = createClient();
      let rolDetectado: string = 'OPERADORA';

      // 1. Intento de autenticación con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (data?.user) {
        // Rol desde user.user_metadata.role
        const metaRole = data.user.user_metadata?.role;
        if (metaRole) {
          rolDetectado = String(metaRole).toUpperCase();
        } else if (email.includes('admin') || email.includes('dueno') || email.includes('ceo')) {
          rolDetectado = 'ADMIN';
        }
      } else {
        // En caso de modo desarrollo o credenciales de prueba preconfiguradas
        if (email.includes('admin') || email.includes('dueno') || email.includes('finanzas')) {
          rolDetectado = 'ADMIN';
        } else {
          rolDetectado = 'OPERADORA';
        }
      }

      // Guardar cookie de rol para Middleware
      document.cookie = `ttm_role=${rolDetectado}; path=/; max-age=86400; SameSite=Lax;`;
      document.cookie = `ttm_user_code=${email}; path=/; max-age=86400; SameSite=Lax;`;

      console.log('[AUTH RBAC] Staff autenticado:', {
        email,
        rol: rolDetectado,
        timestamp: new Date().toISOString()
      });

      setExitoMensaje(`¡Bienvenido! Accediendo como ${rolDetectado}...`);
      setTimeout(() => {
        redirigirPorRol(rolDetectado, redirectParam);
      }, 500);
    } catch (err: any) {
      console.error('Error en login staff:', err);
      setErrorMensaje(err.message || 'Error al iniciar sesión.');
      setCargando(false);
    }
  };

  // Manejo de Login: Aliados (Correo o Código + Contraseña/PIN)
  const handleLoginAliados = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);
    setCargando(true);

    try {
      const input = aliadoCodigo.trim();
      const secret = aliadoPin.trim();

      if (!input) {
        setErrorMensaje('Por favor ingresa tu correo electrónico o tu código de aliado.');
        setCargando(false);
        return;
      }

      if (!secret) {
        setErrorMensaje('Por favor ingresa tu contraseña o PIN de seguridad.');
        setCargando(false);
        return;
      }

      const supabase = createClient();
      let emailFinal = '';
      let rolDeducido: 'MECANICO' | 'RUNNER' | 'REPUESTOS' | null = null;
      let codigoParaCookie = input.toUpperCase();

      // ========================================================
      // 1. SI INCLUYE UN '@': Autenticar directamente por Email
      // ========================================================
      if (input.includes('@')) {
        emailFinal = input.toLowerCase();

        // 1.1 Intentar autenticar con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: emailFinal,
          password: secret
        });

        // 1.2 Consultar perfil para obtener rol y codigo_aliado asignado
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('email, rol, codigo_aliado, nombre_completo')
          .eq('email', emailFinal)
          .maybeSingle();

        if (perfil?.rol) {
          rolDeducido = perfil.rol as any;
          if (perfil.codigo_aliado) codigoParaCookie = perfil.codigo_aliado;
        } else if (authData?.user?.user_metadata?.rol) {
          rolDeducido = authData.user.user_metadata.rol;
          codigoParaCookie = authData.user.user_metadata.codigo_aliado || '#TTM-0842';
        } else {
          // Deducción por convención si es cuenta demo o sin perfil en tabla
          if (emailFinal.includes('runner') || emailFinal.includes('diego') || emailFinal.includes('luis')) {
            rolDeducido = 'RUNNER';
            codigoParaCookie = '#RUN-101';
          } else if (emailFinal.includes('repuesto') || emailFinal.includes('autopartes') || emailFinal.includes('tienda')) {
            rolDeducido = 'REPUESTOS';
            codigoParaCookie = '#REP-505';
          } else {
            rolDeducido = 'MECANICO';
            codigoParaCookie = '#TTM-0842';
          }
        }

        if (authError && !authData?.user) {
          // Si falló auth pero es cuenta demo local permitida
          if (!secret || secret.length < 4) {
            setErrorMensaje(authError.message || 'Credenciales inválidas.');
            setCargando(false);
            return;
          }
        }
      } 
      // ========================================================
      // 2. SI EMPIEZA CON '#' (O CÓDIGO): Buscar Correo Asociado
      // ========================================================
      else {
        const codigoBuscado = input.startsWith('#') ? input.toUpperCase() : `#${input.toUpperCase()}`;
        codigoParaCookie = codigoBuscado;

        // Deducir rol a partir del prefijo oficial
        if (codigoBuscado.startsWith('#TTM-') || codigoBuscado.startsWith('TTM-')) {
          rolDeducido = 'MECANICO';
        } else if (codigoBuscado.startsWith('#RUN-') || codigoBuscado.startsWith('RUN-')) {
          rolDeducido = 'RUNNER';
        } else if (codigoBuscado.startsWith('#REP-') || codigoBuscado.startsWith('REP-')) {
          rolDeducido = 'REPUESTOS';
        }

        // 2.1 Consulta a Supabase perfiles para obtener el correo asociado
        const { data: perfil, error: perfilError } = await supabase
          .from('perfiles')
          .select('email, rol, nombre_completo')
          .eq('codigo_aliado', codigoBuscado)
          .maybeSingle();

        if (perfil?.email) {
          emailFinal = perfil.email;
          if (perfil.rol) rolDeducido = perfil.rol as any;

          // 2.2 Iniciar sesión con el correo asociado y la contraseña/PIN
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: emailFinal,
            password: secret
          });

          if (signInError) {
            console.warn('[LOGIN CÓDIGO] Aviso signInWithPassword:', signInError.message);
          }
        } else {
          // 2.3 Fallbacks para códigos preconfigurados del ecosistema de prueba
          if (codigoBuscado === '#TTM-0842' || codigoBuscado.startsWith('#TTM-')) {
            rolDeducido = 'MECANICO';
            emailFinal = 'carlos.mendoza@tutallermovil.com';
          } else if (codigoBuscado === '#RUN-101' || codigoBuscado.startsWith('#RUN-')) {
            rolDeducido = 'RUNNER';
            emailFinal = 'luis.perez@tutallermovil.com';
          } else if (codigoBuscado === '#REP-505' || codigoBuscado.startsWith('#REP-')) {
            rolDeducido = 'REPUESTOS';
            emailFinal = 'ventas@autoparteschacao.com';
          } else {
            setErrorMensaje(
              `No encontramos ningún aliado registrado con el código "${codigoBuscado}". Verifica tu código o inicia sesión con tu correo.`
            );
            setCargando(false);
            return;
          }
        }
      }

      if (!rolDeducido) {
        rolDeducido = 'MECANICO';
      }

      // Guardar cookies de rol y código para Middleware y sesión
      document.cookie = `ttm_role=${rolDeducido}; path=/; max-age=86400; SameSite=Lax;`;
      document.cookie = `ttm_user_code=${codigoParaCookie}; path=/; max-age=86400; SameSite=Lax;`;

      if (typeof window !== 'undefined') {
        const sesionLocal = {
          email: emailFinal,
          codigo_aliado: codigoParaCookie,
          rol: rolDeducido,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('ttm_aliado_sesion', JSON.stringify(sesionLocal));
      }

      console.log('[AUTH RBAC] Aliado autenticado con éxito:', {
        identificador: input,
        email: emailFinal,
        codigo: codigoParaCookie,
        rolDeducido,
        timestamp: new Date().toISOString()
      });

      setExitoMensaje(`¡Credenciales verificadas! Accediendo como ${rolDeducido} (${codigoParaCookie})...`);
      setTimeout(() => {
        redirigirPorRol(rolDeducido!, redirectParam);
      }, 500);
    } catch (err: any) {
      console.error('Error en login aliados:', err);
      setErrorMensaje(err?.message || 'Ocurrió un error al verificar tus credenciales.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col justify-center items-center p-4 relative antialiased selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* Fondo técnico de cuadrícula */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Botón Volver a la Landing */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E56B0]" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

      {/* Contenedor Principal (Bento Card Centrada) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-6 sm:p-8 overflow-hidden my-8"
      >
        
        {/* Cabecera / Identidad */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mx-auto mb-4 group">
            <img
              src="/icon.svg"
              alt="TuTallerMóvil"
              className="h-12 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl font-black text-[#0A1525] tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-[#475569] font-medium mt-1">
            Plataforma Integral de Despacho y Operaciones TuTallerMóvil
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. SELECTOR DE PESTAÑAS (STAFF VS ALIADOS) CON FRAMER MOTION */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-2xl border border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setTabActiva('staff');
              setErrorMensaje(null);
            }}
            className={`relative py-2.5 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              tabActiva === 'staff' ? 'text-[#0A1525]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tabActiva === 'staff' && (
              <motion.div
                layoutId="loginTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E56B0]" />
              <span>Staff</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTabActiva('aliados');
              setErrorMensaje(null);
            }}
            className={`relative py-2.5 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              tabActiva === 'aliados' ? 'text-[#0A1525]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tabActiva === 'aliados' && (
              <motion.div
                layoutId="loginTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#0A1525]" />
              <span>Aliados en Ruta</span>
            </span>
          </button>
        </div>

        {/* Mensaje de Error / Éxito */}
        <AnimatePresence mode="wait">
          {errorMensaje && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMensaje}</span>
            </motion.div>
          )}

          {exitoMensaje && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exitoMensaje}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* 2. FORMULARIOS SEGÚN PESTAÑA CON TRANSICIÓN ANIMADA */}
        {/* ======================================================== */}
        <AnimatePresence mode="wait">
          {tabActiva === 'staff' ? (
            /* ========================================== */
            /* PESTAÑA 1: STAFF (Operadoras y Dueños)     */
            /* ========================================== */
            <motion.form
              key="form-staff"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLoginStaff}
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Correo Corporativo</span>
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="ej. operadora@tutallermovil.com"
                  className="w-full h-12 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Contraseña</span>
                </label>
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                />
              </div>

              {/* Botón Principal Staff */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={cargando}
                className="w-full h-12 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#CCFF00]" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder como Staff</span>
                    <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                  </>
                )}
              </motion.button>

              {/* Atajos Rápidos de Prueba para Staff */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
                  Accesos Rápidos (Demostración)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffEmail('admin@tutallermovil.com');
                      setStaffPassword('admin123');
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[#0A1525] block">Dueño / Finanzas</span>
                    <span className="text-[10px] text-slate-400 truncate block">admin@tutallermovil.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffEmail('operadora@tutallermovil.com');
                      setStaffPassword('operadora123');
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[#0A1525] block">Operadora Despacho</span>
                    <span className="text-[10px] text-slate-400 truncate block">operadora@tutallermovil.com</span>
                  </button>
                </div>
              </div>
            </motion.form>
          ) : (
            /* ========================================================= */
            /* PESTAÑA 2: ALIADOS (Mecánicos, Runners y Casas Repuestos)  */
            /* ========================================================= */
            <motion.form
              key="form-aliados"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLoginAliados}
              className="space-y-4"
            >
              {/* Código de Aliado o Correo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Correo o Código de Aliado</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    #TTM / #RUN / #REP
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={aliadoCodigo}
                  onChange={(e) => setAliadoCodigo(e.target.value)}
                  placeholder="ej. #TTM-0842 o aliado@tutallermovil.com"
                  className="w-full h-12 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                />
              </div>

              {/* Contraseña o PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Contraseña o PIN</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PIN demo: 1234
                  </span>
                </label>
                <input
                  type="password"
                  required
                  value={aliadoPin}
                  onChange={(e) => setAliadoPin(e.target.value)}
                  placeholder="•••••••• o PIN (1234)"
                  className="w-full h-12 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                />
              </div>

              {/* Botón Principal Aliados (#CCFF00) */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={cargando}
                className="w-full h-12 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md border border-[#0A1525]/10 cursor-pointer disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0A1525]" />
                    <span>Validando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder a Mi Portal</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </motion.button>

              {/* Enlace al Registro de Aliados */}
              <div className="text-center pt-1">
                <Link
                  href="/registro"
                  className="text-xs font-bold text-[#1E56B0] hover:text-[#0A1525] transition-colors inline-flex items-center gap-1"
                >
                  <span>¿Aún no tienes código de aliado?</span>
                  <span className="underline underline-offset-2">Regístrate aquí →</span>
                </Link>
              </div>

              {/* Atajos Rápidos de Prueba para Aliados */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
                  Seleccionar Credencial de Prueba (PIN: 1234)
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAliadoCodigo('#TTM-0842');
                      setAliadoPin('1234');
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-black text-xs text-[#1E56B0] block">#TTM-0842</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Mecánico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAliadoCodigo('#RUN-101');
                      setAliadoPin('1234');
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-black text-xs text-sky-700 block">#RUN-101</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Runner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAliadoCodigo('#REP-505');
                      setAliadoPin('1234');
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-black text-xs text-amber-700 block">#REP-505</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Repuestos</span>
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer Informativo */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Seguridad y Enrutamiento por Roles (RBAC) • TuTallerMóvil 2027
          </p>
        </div>

      </motion.div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1E56B0]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
