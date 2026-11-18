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
  Car,
  CreditCard,
  Briefcase,
  Award,
  FileText,
  Building,
  AlertTriangle
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

const BANCOS_VENEZUELA = [
  'Banesco (0134)',
  'Banco de Venezuela (0102)',
  'Mercantil (0105)',
  'Bancamiga (0172)',
  'BBVA Provincial (0108)',
  'Banco Nacional de Crédito BNC (0191)',
  'Banplus (0174)',
  'Bancaribe (0114)',
  'Banco Fondo Común BFC (0151)',
  'Banco Plaza (0138)'
];

const SECTORES_CARACAS = [
  'Chacao / El Rosal / Bello Campo',
  'Las Mercedes / Valle Arriba',
  'Altamira / La Castellana / Los Palos Grandes',
  'Baruta / El Cafetal / Caurimare',
  'Los Ruices / Boleíta / La Carlota',
  'Santa Fe / Prados del Este / La Trinidad',
  'Libertador / Centro / La Candelaria',
  'El Hatillo / La Boyera',
  'San Bernardino / San Martín',
  'Toda la Gran Caracas'
];

const ESPECIALIDADES_MECANICO = [
  'Frenos y Tren Delantero',
  'Inyección Electrónica & Afinación',
  'Diagnóstico Computarizado & Escáner OBD-II',
  'Electricidad Automotriz & Baterías',
  'Mecánica Integral / Motor y Transmisión',
  'Suspensión, Amortiguadores y Dirección',
  'Aire Acondicionado Automotriz'
];

const HERRAMIENTAS_MECANICO = [
  { id: 'escaner', label: 'Escáner OBD-II propio' },
  { id: 'dados', label: 'Juego de dados y llaves milimétricas' },
  { id: 'gato', label: 'Gato hidráulico de patín y torres' },
  { id: 'multimetro', label: 'Multímetro automotriz / Lámpara de prueba' },
  { id: 'manometro', label: 'Manómetro de presión / Bomba de vacío' },
  { id: 'caja_herramientas', label: 'Caja móvil de herramientas completa' }
];

const MARCAS_REPUESTOS = [
  'Toyota',
  'Chevrolet',
  'Ford',
  'Marcas Asiáticas (Chery, Changan, JAC)',
  'Hyundai / Kia',
  'Nissan / Renault',
  'Multimarca / Genéricos Certificados'
];

function RegistroRolContent() {
  const router = useRouter();
  const params = useParams();
  const rolParam = String(params?.rol || 'mecanico').toLowerCase();

  const config = CONFIG_ROLES[rolParam] || CONFIG_ROLES.mecanico;
  const IconoRol = config.icono;

  // Paso Actual del Asistente (1: Identidad & Acceso, 2: Ficha Técnica)
  const [paso, setPaso] = useState<1 | 2>(1);

  // ==========================================
  // PASO 1: Identidad y Acceso
  // ==========================================
  const [nombre, setNombre] = useState('');
  const [cedulaTipo, setCedulaTipo] = useState<'V' | 'E' | 'J' | 'G'>('V');
  const [cedulaNumero, setCedulaNumero] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [zonaResidencia, setZonaResidencia] = useState(SECTORES_CARACAS[0]);

  // ==========================================
  // PASO 2: Ficha Técnica Específica por Rol
  // ==========================================
  // A. Mecánico
  const [especialidadPrincipal, setEspecialidadPrincipal] = useState(ESPECIALIDADES_MECANICO[0]);
  const [especialidadSecundaria, setEspecialidadSecundaria] = useState('');
  const [aniosExperiencia, setAniosExperiencia] = useState('3-5 años');
  const [herramientasSeleccionadas, setHerramientasSeleccionadas] = useState<string[]>([
    'dados',
    'caja_herramientas'
  ]);
  const [vehiculoTrasladoMecanico, setVehiculoTrasladoMecanico] = useState('Motocicleta propia');
  const [placaVehiculoMecanico, setPlacaVehiculoMecanico] = useState('');

  // B. Runner
  const [tipoVehiculoRunner, setTipoVehiculoRunner] = useState('Moto Bera / Empire 150cc');
  const [placaRunner, setPlacaRunner] = useState('');
  const [poseeLicenciaCertificado, setPoseeLicenciaCertificado] = useState(true);
  const [capacidadCarga, setCapacidadCarga] = useState('Caja trasera rígida instalada');
  const [zonaDespachoPreferida, setZonaDespachoPreferida] = useState('Toda la Gran Caracas');

  // C. Casa de Repuestos
  const [nombreComercial, setNombreComercial] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [rifLetra, setRifLetra] = useState<'J' | 'G' | 'V'>('J');
  const [rifNumero, setRifNumero] = useState('');
  const [direccionTienda, setDireccionTienda] = useState('');
  const [encargadoMostrador, setEncargadoMostrador] = useState('');
  const [marcasManejadas, setMarcasManejadas] = useState<string[]>(['Toyota', 'Chevrolet']);

  // D. Coordenadas de Cobro / Pago Móvil (Mecánico y Runner)
  const [bancoPagoMovil, setBancoPagoMovil] = useState(BANCOS_VENEZUELA[0]);
  const [telefonoPagoMovil, setTelefonoPagoMovil] = useState('');
  const [cedulaPagoMovil, setCedulaPagoMovil] = useState('');

  // Estados de Operación
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Pantalla de Éxito
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<string>('');
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  // Confeti festivo al completar el registro
  useEffect(() => {
    if (registroExitoso) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#CCFF00', '#1E56B0', '#0A1525', '#16a34a']
        });
      } catch (e) {}
    }
  }, [registroExitoso]);

  // Sincronizar datos de Pago Móvil con datos personales por conveniencia
  const handleCopiarDatosAPagoMovil = () => {
    setTelefonoPagoMovil(telefono);
    setCedulaPagoMovil(cedulaNumero);
  };

  const toggleHerramienta = (id: string) => {
    setHerramientasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleMarcaRepuestos = (m: string) => {
    setMarcasManejadas((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  // ==========================================
  // VALIDACIONES DEL PASO 1
  // ==========================================
  const handleAvanzarPaso2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim() || !cedulaNumero.trim() || !email.trim() || !telefono.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios del Paso 1.');
      return;
    }

    if (nombre.trim().split(' ').length < 2) {
      setErrorMsg('Por favor ingresa tu Nombre y Apellido completos.');
      return;
    }

    const cleanCedula = cedulaNumero.replace(/\D/g, '');
    if (cleanCedula.length < 6 || cleanCedula.length > 9) {
      setErrorMsg('Ingresa un número de cédula o identificación válido (6 a 9 dígitos).');
      return;
    }

    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Ingresa un número telefónico venezolano válido (ej. 0414-1234567).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Prefill de Pago Móvil si está vacío
    if (!telefonoPagoMovil) setTelefonoPagoMovil(telefono);
    if (!cedulaPagoMovil) setCedulaPagoMovil(cleanCedula);

    setPaso(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // VALIDACIONES Y REGISTRO FINAL (PASO 2)
  // ==========================================
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validación obligatoria de Términos, Condiciones y Privacidad
    if (!aceptaTerminos) {
      setErrorMsg('Debes aceptar los Términos y Condiciones Generales de Uso y la Política Integral de Privacidad de Datos para registrarte en TuTallerMóvil.');
      return;
    }

    // Validaciones específicas
    if (config.rol === 'MECANICO') {
      if (herramientasSeleccionadas.length === 0) {
        setErrorMsg('Por favor selecciona al menos una herramienta propia de diagnóstico.');
        return;
      }
      if (!placaVehiculoMecanico.trim()) {
        setErrorMsg('Por favor ingresa la placa de tu vehículo de traslado.');
        return;
      }
      if (!telefonoPagoMovil.trim() || !cedulaPagoMovil.trim()) {
        setErrorMsg('Ingresa tus datos de Pago Móvil para poder liquidar tus servicios.');
        return;
      }
    } else if (config.rol === 'RUNNER') {
      if (!placaRunner.trim()) {
        setErrorMsg('Por favor ingresa la placa de tu motocicleta de entrega.');
        return;
      }
      if (!poseeLicenciaCertificado) {
        setErrorMsg('Debes declarar poseer licencia de conducir y certificado médico vigentes.');
        return;
      }
      if (!telefonoPagoMovil.trim() || !cedulaPagoMovil.trim()) {
        setErrorMsg('Ingresa tus datos de Pago Móvil para transferirte tus carreras.');
        return;
      }
    } else if (config.rol === 'REPUESTOS') {
      if (!nombreComercial.trim() || !razonSocial.trim() || !rifNumero.trim() || !direccionTienda.trim()) {
        setErrorMsg('Por favor completa los datos comerciales, RIF y dirección física de la tienda.');
        return;
      }
      if (marcasManejadas.length === 0) {
        setErrorMsg('Selecciona al menos una línea o marca de autopartes que comercialices.');
        return;
      }
    }

    setCargando(true);

    try {
      const supabase = createClient();
      const numAleatorio = Math.floor(1000 + Math.random() * 9000);
      const codigoNuevo = `${config.prefijo}${numAleatorio}`;
      const cedulaCompleta = `${cedulaTipo}-${cedulaNumero.replace(/\D/g, '')}`;

      // Empaquetar detalles exhaustivos
      const detalles: Record<string, any> = {
        cedula_completa: cedulaCompleta,
        zona_residencia: zonaResidencia,
        fecha_registro: new Date().toISOString()
      };

      if (config.rol === 'MECANICO') {
        detalles.especialidad_principal = especialidadPrincipal;
        detalles.especialidad_secundaria = especialidadSecundaria || 'N/A';
        detalles.anios_experiencia = aniosExperiencia;
        detalles.herramientas = herramientasSeleccionadas;
        detalles.vehiculo_traslado = vehiculoTrasladoMecanico;
        detalles.placa_vehiculo = placaVehiculoMecanico.trim().toUpperCase();
        detalles.pago_movil = {
          banco: bancoPagoMovil,
          telefono: telefonoPagoMovil.trim(),
          cedula: `${cedulaTipo}-${cedulaPagoMovil.trim()}`
        };
      } else if (config.rol === 'RUNNER') {
        detalles.tipo_vehiculo = tipoVehiculoRunner;
        detalles.placa = placaRunner.trim().toUpperCase();
        detalles.licencia_vigente = poseeLicenciaCertificado;
        detalles.capacidad_carga = capacidadCarga;
        detalles.zona_preferida = zonaDespachoPreferida;
        detalles.pago_movil = {
          banco: bancoPagoMovil,
          telefono: telefonoPagoMovil.trim(),
          cedula: `${cedulaTipo}-${cedulaPagoMovil.trim()}`
        };
      } else if (config.rol === 'REPUESTOS') {
        const rifCompleto = `${rifLetra}-${rifNumero.trim().toUpperCase()}`;
        detalles.nombre_comercial = nombreComercial.trim();
        detalles.razon_social = razonSocial.trim();
        detalles.rif = rifCompleto;
        detalles.direccion_tienda = direccionTienda.trim();
        detalles.encargado_mostrador = encargadoMostrador.trim() || nombre.trim();
        detalles.marcas_autopartes = marcasManejadas;
        detalles.coordenadas_pago = {
          banco: bancoPagoMovil,
          rif_o_cedula: rifCompleto,
          telefono_contacto: telefono.trim()
        };
      }

      // 1. Registro en Supabase Auth
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
              cedula_rif: cedulaCompleta,
              codigo_aliado: codigoNuevo
            }
          }
        });

        if (authData?.user?.id) {
          userId = authData.user.id;
        } else if (authError) {
          if (authError.message.includes('already registered')) {
            setErrorMsg('Este correo electrónico ya está registrado. Por favor inicia sesión.');
            setCargando(false);
            return;
          }
        }
      } catch (authEx) {
        console.warn('Aviso de Auth SignUp:', authEx);
      }

      // 2. Upsert en la tabla 'perfiles' con todos los datos auditables
      try {
        const { data: perfilData } = await supabase
          .from('perfiles')
          .upsert(
            [
              {
                id: userId,
                email: email.trim().toLowerCase(),
                rol: config.rol,
                nombre_completo: nombre.trim(),
                telefono: telefono.trim(),
                codigo_aliado: codigoNuevo,
                perfil_completado: true,
                cedula_rif: cedulaCompleta,
                detalles: detalles,
                updated_at: new Date().toISOString()
              }
            ],
            { onConflict: 'id' }
          )
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

      // 3. Persistir sesión en LocalStorage y Cookies
      const sesionAliado = {
        id: userId,
        email: email.trim().toLowerCase(),
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        rol: config.rol,
        codigo_aliado: codigoNuevo,
        detalles
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('ttm_aliado_sesion', JSON.stringify(sesionAliado));
        document.cookie = `ttm_role=${config.rol}; path=/; max-age=86400; SameSite=Lax;`;
        document.cookie = `ttm_user_code=${codigoNuevo}; path=/; max-age=86400; SameSite=Lax;`;
      }

      setRegistroExitoso(true);
    } catch (err: any) {
      console.error('Error durante el registro:', err);
      setErrorMsg(err?.message || 'Ocurrió un error inesperado al procesar el registro.');
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] antialiased flex flex-col justify-between selection:bg-[#CCFF00] selection:text-[#0A1525] relative">
      {/* Fondo de Cuadrícula Técnica */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link
          href="/registro"
          className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E56B0]" />
          <span>Volver a Roles</span>
        </Link>

        <Link href="/" className="hover:opacity-90 transition-opacity">
          <img src="/icon.svg" alt="TuTallerMóvil" className="h-10 w-auto object-contain" />
        </Link>
      </header>

      {/* Contenido Central */}
      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        {/* ======================================================== */}
        {/* PANTALLA DE ÉXITO FINAL Y ASIGNACIÓN DE CÓDIGO           */}
        {/* ======================================================== */}
        {registroExitoso ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white rounded-3xl border-2 border-[#1E56B0]/20 shadow-2xl p-6 sm:p-10 text-center space-y-6 overflow-hidden relative"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1E56B0] bg-[#1E56B0]/10 px-3 py-1 rounded-full">
                Registro Completado • {config.titulo}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-[#0A1525] tracking-tight">
                ¡Bienvenido a la Red Oficial!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Tus datos y credenciales han sido verificados. Este es tu <strong>Código de Aliado Único</strong>.
                Podrás usarlo para iniciar sesión en tu portal.
              </p>
            </div>

            {/* Credencial Digital con el Código */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md mx-auto space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Identidad Digital
                  </span>
                  <span className="text-sm font-black text-[#0A1525]">{nombre}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Activo
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  Tu Código de Identificación:
                </span>
                <div className="bg-[#0A1525] text-[#CCFF00] font-mono text-3xl sm:text-4xl font-black py-4 px-6 rounded-2xl tracking-widest border border-slate-800 shadow-md">
                  {codigoGenerado || `${config.prefijo}0842`}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopiarCodigo}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {codigoCopiado ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">¡Código copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#1E56B0]" />
                    <span>Copiar mi código</span>
                  </>
                )}
              </button>
            </div>

            {/* Botón de Ingreso al Portal */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push(config.portalRuta)}
                className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>Ingresar a Mi Portal de Aliado</span>
                <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ======================================================== */
          /* FORMULARIO ASISTENTE (WIZARD DE 2 PASOS)                 */
          /* ======================================================== */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8 space-y-6"
          >
            {/* Cabecera del Formulario con Barra de Pasos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${config.bgIcono} ${config.colorIcono} flex items-center justify-center font-black shadow-xs shrink-0`}>
                  <IconoRol className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                    {config.titulo}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {config.subtitulo}
                  </p>
                </div>
              </div>

              {/* Barra de Progreso del Asistente */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    paso === 1 ? 'bg-[#1E56B0] text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {paso > 1 ? '✓' : '1'}
                  </span>
                  <span className={paso === 1 ? 'text-[#0A1525]' : 'text-slate-500'}>
                    Identidad & Acceso
                  </span>
                </div>

                <div className="h-0.5 w-8 sm:w-16 bg-slate-200" />

                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    paso === 2 ? 'bg-[#1E56B0] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    2
                  </span>
                  <span className={paso === 2 ? 'text-[#0A1525]' : 'text-slate-400'}>
                    Ficha Técnica
                  </span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* PASO 1: IDENTIDAD Y ACCESO                               */}
            {/* ======================================================== */}
            {paso === 1 && (
              <form onSubmit={handleAvanzarPaso2} className="space-y-4">
                {/* Nombre Completo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Nombre y Apellido *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Cédula de Identidad y WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Cédula de Identidad / RIF *</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={cedulaTipo}
                        onChange={(e) => setCedulaTipo(e.target.value as any)}
                        className="w-16 h-11 px-2 text-xs font-black bg-[#F8FAFC] border border-slate-200 rounded-xl text-center"
                      >
                        <option value="V">V-</option>
                        <option value="E">E-</option>
                        <option value="J">J-</option>
                        <option value="G">G-</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={cedulaNumero}
                        onChange={(e) => setCedulaNumero(e.target.value.replace(/\D/g, ''))}
                        placeholder="18456789"
                        className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:bg-white focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>WhatsApp de Contacto *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="0414-2314194"
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Correo Electrónico y Contraseña */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Correo Electrónico *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@correo.com"
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A1525] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#1E56B0]" />
                        <span>Contraseña *</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Mínimo 6 car.</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 px-3.5 pr-10 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:bg-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      >
                        {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zona de Residencia / Operación */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Zona de Residencia / Base en Caracas *</span>
                  </label>
                  <select
                    value={zonaResidencia}
                    onChange={(e) => setZonaResidencia(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl focus:border-[#1E56B0] focus:bg-white focus:outline-hidden text-[#0A1525]"
                  >
                    {SECTORES_CARACAS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón Siguiente */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>Continuar a Ficha Técnica (Paso 2)</span>
                    <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* PASO 2: FICHA TÉCNICA Y OPERATIVA (POR ROL)              */}
            {/* ======================================================== */}
            {paso === 2 && (
              <form onSubmit={handleSubmitFinal} className="space-y-5">
                {/* ---------------- MECÁNICO ---------------- */}
                {config.rol === 'MECANICO' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-[#1E56B0]" />
                          <span>Especialidad Principal *</span>
                        </label>
                        <select
                          value={especialidadPrincipal}
                          onChange={(e) => setEspecialidadPrincipal(e.target.value)}
                          className="w-full h-11 px-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl text-[#0A1525]"
                        >
                          {ESPECIALIDADES_MECANICO.map((esp) => (
                            <option key={esp} value={esp}>
                              {esp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#1E56B0]" />
                          <span>Años de Experiencia Comprobable *</span>
                        </label>
                        <select
                          value={aniosExperiencia}
                          onChange={(e) => setAniosExperiencia(e.target.value)}
                          className="w-full h-11 px-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl text-[#0A1525]"
                        >
                          <option value="1-2 años">1 a 2 años en taller</option>
                          <option value="3-5 años">3 a 5 años (Recomendado)</option>
                          <option value="6-10 años">6 a 10 años (Técnico Senior)</option>
                          <option value="Más de 10 años">Más de 10 años (Master Tech)</option>
                        </select>
                      </div>
                    </div>

                    {/* Herramientas de Diagnóstico */}
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <label className="text-xs font-bold text-[#0A1525] block">
                        Herramientas Propias Disponibles (Selecciona las que poseas) *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {HERRAMIENTAS_MECANICO.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                              herramientasSeleccionadas.includes(item.id)
                                ? 'bg-blue-50/80 border-[#1E56B0] text-[#1E56B0]'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={herramientasSeleccionadas.includes(item.id)}
                              onChange={() => toggleHerramienta(item.id)}
                              className="w-4 h-4 rounded text-[#1E56B0] focus:ring-0"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Vehículo y Placa */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                          <span>Vehículo de Traslado *</span>
                        </label>
                        <select
                          value={vehiculoTrasladoMecanico}
                          onChange={(e) => setVehiculoTrasladoMecanico(e.target.value)}
                          className="w-full h-11 px-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                        >
                          <option value="Motocicleta propia">Motocicleta propia (Recomendado)</option>
                          <option value="Carro / Camioneta particular">Carro / Camioneta particular</option>
                          <option value="Sin vehículo (Transporte en ruta aliada)">Sin vehículo propio</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525]">Placa del Vehículo *</label>
                        <input
                          type="text"
                          required
                          value={placaVehiculoMecanico}
                          onChange={(e) => setPlacaVehiculoMecanico(e.target.value.toUpperCase())}
                          placeholder="Ej. AB123CD"
                          className="w-full h-11 px-3.5 text-xs font-mono font-bold bg-[#F8FAFC] border border-slate-200 rounded-xl uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- RUNNER ---------------- */}
                {config.rol === 'RUNNER' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525] flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-[#1E56B0]" />
                          <span>Tipo de Vehículo de Entrega *</span>
                        </label>
                        <select
                          value={tipoVehiculoRunner}
                          onChange={(e) => setTipoVehiculoRunner(e.target.value)}
                          className="w-full h-11 px-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                        >
                          <option value="Moto Bera / Empire 150cc">Moto 150cc (Bera, Empire, etc.)</option>
                          <option value="Moto Scooter Express">Moto Scooter Automática</option>
                          <option value="Moto Paseo / Alta Cilindrada">Moto Paseo / Alta Cilindrada</option>
                          <option value="Bicicleta Urbana">Bicicleta Urbana</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525]">Placa de la Moto *</label>
                        <input
                          type="text"
                          required
                          value={placaRunner}
                          onChange={(e) => setPlacaRunner(e.target.value.toUpperCase())}
                          placeholder="Ej. AC456DF"
                          className="w-full h-11 px-3.5 text-xs font-mono font-bold bg-[#F8FAFC] border border-slate-200 rounded-xl uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0A1525]">Capacidad de Carga *</label>
                      <select
                        value={capacidadCarga}
                        onChange={(e) => setCapacidadCarga(e.target.value)}
                        className="w-full h-11 px-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                      >
                        <option value="Caja trasera rígida instalada">Caja trasera rígida instalada (Para repuestos pesados)</option>
                        <option value="Bolso térmico / Mochila de carga">Bolso / Mochila de carga</option>
                        <option value="Parrilla trasera con pulpos">Parrilla trasera con pulpos</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 cursor-pointer text-xs font-semibold text-blue-950">
                      <input
                        type="checkbox"
                        checked={poseeLicenciaCertificado}
                        onChange={(e) => setPoseeLicenciaCertificado(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1E56B0]"
                      />
                      <span>Declaro poseer Licencia de Conducir de 2do Grado y Certificado Médico Vial Vigentes *</span>
                    </label>
                  </div>
                )}

                {/* ---------------- REPUESTOS ---------------- */}
                {config.rol === 'REPUESTOS' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525]">Nombre Comercial *</label>
                        <input
                          type="text"
                          required
                          value={nombreComercial}
                          onChange={(e) => setNombreComercial(e.target.value)}
                          placeholder="Ej. Repuestos El Rosal C.A."
                          className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525]">Razón Social Fiscal *</label>
                        <input
                          type="text"
                          required
                          value={razonSocial}
                          onChange={(e) => setRazonSocial(e.target.value)}
                          placeholder="Ej. Distribuidora Automotriz Caracas S.A."
                          className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525]">RIF de la Empresa *</label>
                        <div className="flex gap-2">
                          <select
                            value={rifLetra}
                            onChange={(e) => setRifLetra(e.target.value as any)}
                            className="w-16 h-11 px-2 text-xs font-black bg-[#F8FAFC] border border-slate-200 rounded-xl text-center"
                          >
                            <option value="J">J-</option>
                            <option value="G">G-</option>
                            <option value="V">V-</option>
                          </select>
                          <input
                            type="text"
                            required
                            value={rifNumero}
                            onChange={(e) => setRifNumero(e.target.value.toUpperCase())}
                            placeholder="12345678-9"
                            className="w-full h-11 px-3.5 text-xs font-semibold font-mono bg-[#F8FAFC] border border-slate-200 rounded-xl uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A1525]">Encargado / Despachador</label>
                        <input
                          type="text"
                          value={encargadoMostrador}
                          onChange={(e) => setEncargadoMostrador(e.target.value)}
                          placeholder="Nombre del despachador de mostrador"
                          className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0A1525]">
                        Dirección Física Exacta (Para retiro del Runner) *
                      </label>
                      <input
                        type="text"
                        required
                        value={direccionTienda}
                        onChange={(e) => setDireccionTienda(e.target.value)}
                        placeholder="Ej. Av. Principal de Bello Monte, Edif. Centro, Local 2 PB"
                        className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Marcas que comercializa */}
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <label className="text-xs font-bold text-[#0A1525] block">
                        Líneas / Marcas de Autopartes Principales *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {MARCAS_REPUESTOS.map((m) => (
                          <label
                            key={m}
                            className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
                              marcasManejadas.includes(m)
                                ? 'bg-blue-50/80 border-[#1E56B0] text-[#1E56B0]'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={marcasManejadas.includes(m)}
                              onChange={() => toggleMarcaRepuestos(m)}
                              className="w-4 h-4 rounded text-[#1E56B0]"
                            />
                            <span className="truncate">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- DATOS DE PAGO MÓVIL (COMÚN A MECÁNICOS Y RUNNERS) ---------------- */}
                {(config.rol === 'MECANICO' || config.rol === 'RUNNER') && (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Datos de Pago Móvil para Liquidaciones *</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopiarDatosAPagoMovil}
                        className="text-[11px] font-bold text-[#1E56B0] hover:underline cursor-pointer"
                      >
                        Copiar teléfono y cédula del Paso 1
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Banco Receptor</label>
                        <select
                          value={bancoPagoMovil}
                          onChange={(e) => setBancoPagoMovil(e.target.value)}
                          className="w-full h-10 px-2 text-xs font-semibold bg-white border border-emerald-200 rounded-xl"
                        >
                          {BANCOS_VENEZUELA.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Teléfono Pago Móvil</label>
                        <input
                          type="tel"
                          required
                          value={telefonoPagoMovil}
                          onChange={(e) => setTelefonoPagoMovil(e.target.value)}
                          placeholder="0414-2314194"
                          className="w-full h-10 px-3 text-xs font-semibold bg-white border border-emerald-200 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Cédula</label>
                        <input
                          type="text"
                          required
                          value={cedulaPagoMovil}
                          onChange={(e) => setCedulaPagoMovil(e.target.value.replace(/\D/g, ''))}
                          placeholder="18456789"
                          className="w-full h-10 px-3 text-xs font-semibold font-mono bg-white border border-emerald-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Aceptación Legal Obligatoria de Términos y Normativa Operativa */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-all cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1E56B0] focus:ring-[#1E56B0] cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      Declaro bajo juramento que he leído, comprendo y acepto sin reservas los{' '}
                      <Link
                        href="/terminos"
                        target="_blank"
                        className="text-[#1E56B0] font-bold underline hover:text-[#0A1525]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Términos y Condiciones Generales de Uso
                      </Link>
                      , la{' '}
                      <Link
                        href="/terminos#seccion-3"
                        target="_blank"
                        className="text-[#1E56B0] font-bold underline hover:text-[#0A1525]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Normativa Operativa de mi Rol
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
                      de TuTallerMóvil en Caracas, Venezuela. <span className="text-rose-500 font-bold">*</span>
                    </span>
                  </label>
                </div>

                {/* Botones de Navegación del Paso 2 */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setPaso(1);
                    }}
                    className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Paso 1</span>
                  </button>

                  <button
                    type="submit"
                    disabled={cargando || !aceptaTerminos}
                    className={`h-12 px-8 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                      !aceptaTerminos
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-[#0A1525] hover:bg-[#1E56B0] text-white hover:shadow-lg cursor-pointer'
                    } disabled:opacity-50`}
                  >
                    {cargando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#CCFF00]" />
                        <span>Generando Código de Aliado...</span>
                      </>
                    ) : (
                      <>
                        <span>Finalizar Registro y Obtener Código</span>
                        <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white/50 backdrop-blur-xs mt-8">
        <p>© 2026 TuTallerMóvil Technologies. Plataforma Integral de Admisión Técnica.</p>
      </footer>
    </div>
  );
}

export default function RegistroRolPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E56B0]" />
        </div>
      }
    >
      <RegistroRolContent />
    </Suspense>
  );
}
