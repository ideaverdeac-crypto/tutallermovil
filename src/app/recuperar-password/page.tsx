'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

function RecuperarPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sesionActiva, setSesionActiva] = useState<boolean | null>(null);

  useEffect(() => {
    async function verificarSesion() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setSesionActiva(!!session);
    }
    verificarSesion();
  }, []);

  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setCargando(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setExito(true);
      setTimeout(() => {
        router.push('/login-cliente?status=password_actualizada');
      }, 2500);
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      setErrorMsg('Ocurrió un error inesperado al actualizar la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#0A1525] font-sans">
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0A1525] flex items-center justify-center font-black text-white text-base">
            TTM
          </div>
          <span className="font-black text-sm tracking-tight text-[#0A1525]">
            TuTaller<span className="text-[#1E56B0]">Móvil</span>
          </span>
        </Link>
        <span className="text-[11px] font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
          PROTOCOLO TTM 2027
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-[#1E56B0] shadow-xs">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-[#0A1525] tracking-tight">
              Establecer Nueva Contraseña
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Ingresa tu nueva clave de acceso para asegurar tu cuenta en TuTallerMóvil.
            </p>
          </div>

          {exito ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-black text-sm text-emerald-900">
                ¡Contraseña Actualizada con Éxito!
              </div>
              <p className="text-emerald-700 leading-relaxed">
                Tu nueva clave ha sido guardada. Te estamos redirigiendo al inicio de sesión...
              </p>
              <div className="pt-2">
                <Link
                  href="/login-cliente"
                  className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                >
                  <span>Iniciar sesión ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleActualizarPassword} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#1E56B0] shrink-0" />
                <span>Tu contraseña se encripta con protocolo militar SSL/TLS.</span>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full h-12 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#CCFF00]" />
                    <span>Guardando contraseña...</span>
                  </>
                ) : (
                  <span>Guardar Nueva Contraseña</span>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <span className="text-[11px] text-slate-400 block font-medium">
              ¿Problemas para acceder o el enlace expiró?
            </span>
            <a
              href="https://wa.me/584142314194?text=Hola%20TuTallerM%C3%B3vil%2C%20necesito%20ayuda%20para%20restablecer%20mi%20contrase%C3%B1a."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <span>Atención Inmediata por WhatsApp (+58 414-231-4194)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        TuTallerMóvil Protocol 2027 • Seguridad & Respaldo Oficial
      </footer>
    </div>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold">Cargando...</div>}>
      <RecuperarPasswordForm />
    </Suspense>
  );
}
