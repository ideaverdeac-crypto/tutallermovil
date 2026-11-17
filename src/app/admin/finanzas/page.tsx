'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Shield,
  Wallet,
  Landmark,
  Sparkles,
  RefreshCw,
  Download,
  User,
  Users,
  Car,
  Bike,
  Wrench,
  FileText,
  BadgeCheck,
  ChevronRight,
  AlertCircle,
  LogOut,
  KeyRound,
  UserPlus,
  Copy,
  Trash2,
  UserX,
  Eye,
  EyeOff,
  Smartphone,
  X
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { obtenerBitacoraOperaciones, type RegistroBitacora } from '@/lib/audit';
import OnboardingModal from '@/components/ui/onboarding-modal';
import FloatingSupportButton from '@/components/ui/floating-support-button';

export interface CredencialOperadora {
  id: string;
  nombre: string;
  email: string;
  passwordTemporal: string;
  turno: string;
  telefono?: string;
  fechaCreacion: string;
  estado: 'ACTIVA' | 'SUSPENDIDA';
}

const OPERADORAS_INICIALES: CredencialOperadora[] = [
  {
    id: 'op_1',
    nombre: 'Ana Pérez',
    email: 'ana.despacho@tutallermovil.com',
    passwordTemporal: 'Despacho2026*',
    turno: 'Turno Mañana (07:00 AM - 03:00 PM)',
    telefono: '+58 412 1234567',
    fechaCreacion: '10 Nov 2026',
    estado: 'ACTIVA'
  },
  {
    id: 'op_2',
    nombre: 'Carlos Martínez',
    email: 'carlos.despacho@tutallermovil.com',
    passwordTemporal: 'CaracasTaller#1',
    turno: 'Turno Tarde (02:00 PM - 10:00 PM)',
    telefono: '+58 414 7654321',
    fechaCreacion: '12 Nov 2026',
    estado: 'ACTIVA'
  }
];

interface LiquidacionMecanico {
  id: string;
  ordenId: string;
  mecanicoNombre: string;
  mecanicoCodigo: string;
  mecanicoFoto: string;
  servicioDescripcion: string;
  vehiculo: string;
  cliente: string;
  montoBruto: number;
  retencionQA: number;
  montoNeto: number;
  estado: 'PENDIENTE' | 'PAGADO';
}

const LIQUIDACIONES_INICIALES: LiquidacionMecanico[] = [
  {
    id: 'liq_1',
    ordenId: '#4492',
    mecanicoNombre: 'Carlos Mendoza',
    mecanicoCodigo: '#TTM-0842',
    mecanicoFoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
    servicioDescripcion: 'Cambio de Pastillas de Freno & Purga DOT 4',
    vehiculo: 'Toyota Corolla 2018',
    cliente: 'Ana Pérez',
    montoBruto: 65.0,
    retencionQA: 1.95,
    montoNeto: 63.05,
    estado: 'PENDIENTE'
  },
  {
    id: 'liq_2',
    ordenId: '#4489',
    mecanicoNombre: 'Alejandro Blanco',
    mecanicoCodigo: '#TTM-0912',
    mecanicoFoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    servicioDescripcion: 'Diagnóstico OBD2 & Sustitución de Batería 12V',
    vehiculo: 'Ford Explorer 2016',
    cliente: 'Marcos Rivas',
    montoBruto: 90.0,
    retencionQA: 2.70,
    montoNeto: 87.30,
    estado: 'PENDIENTE'
  },
  {
    id: 'liq_3',
    ordenId: '#4478',
    mecanicoNombre: 'Roberto Páez',
    mecanicoCodigo: '#TTM-0341',
    mecanicoFoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    servicioDescripcion: 'Afinación Mayor, Bujías Iridio & Filtros',
    vehiculo: 'Chevrolet Aveo 2015',
    cliente: 'Elena Morales',
    montoBruto: 85.0,
    retencionQA: 2.55,
    montoNeto: 82.45,
    estado: 'PENDIENTE'
  },
  {
    id: 'liq_4',
    ordenId: '#4465',
    mecanicoNombre: 'Carlos Mendoza',
    mecanicoCodigo: '#TTM-0842',
    mecanicoFoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
    servicioDescripcion: 'Revisión y Ajuste de Correa de Accesorios',
    vehiculo: 'Mazda 3 2019',
    cliente: 'Daniela Soto',
    montoBruto: 52.5,
    retencionQA: 1.58,
    montoNeto: 50.92,
    estado: 'PENDIENTE'
  }
];

const DIAS_SEMANA = [
  { dia: 'Lun', fecha: '11 Nov', monto: 1420, porcentaje: 58 },
  { dia: 'Mar', fecha: '12 Nov', monto: 1850, porcentaje: 75 },
  { dia: 'Mié', fecha: '13 Nov', monto: 1200, porcentaje: 49 },
  { dia: 'Jue', fecha: '14 Nov', monto: 2100, porcentaje: 85 },
  { dia: 'Vie', fecha: '15 Nov', monto: 2450, porcentaje: 100, pico: true },
  { dia: 'Sáb', fecha: '16 Nov', monto: 1980, porcentaje: 80 },
  { dia: 'Dom', fecha: '17 Nov', monto: 1450, porcentaje: 59 }
];

const BITACORA_AUDITORIA = [
  {
    id: 'aud_1',
    hora: '10:45 AM',
    fecha: 'Hoy',
    usuario: 'Ana (Operadora)',
    accion: 'Asignó mecánico a orden #4492',
    tipo: 'asignacion',
    badge: 'Despacho Táctico'
  },
  {
    id: 'aud_2',
    hora: '10:30 AM',
    fecha: 'Hoy',
    usuario: 'Carlos (Operadora)',
    accion: 'Modificó cotización #4489 (+ Pastillas Bosch)',
    tipo: 'cotizacion',
    badge: 'Cotizador Oficial'
  },
  {
    id: 'aud_3',
    hora: '09:15 AM',
    fecha: 'Hoy',
    usuario: 'Luis (Runner)',
    accion: 'Retiró repuesto con PIN en AutoPartes Chacao',
    tipo: 'runner',
    badge: 'Logística Runner'
  },
  {
    id: 'aud_4',
    hora: '08:50 AM',
    fecha: 'Hoy',
    usuario: 'Sistema TTM',
    accion: 'Conciliación automática lote Cashea (+$1,250.00)',
    tipo: 'sistema',
    badge: 'Fintech Cashea'
  },
  {
    id: 'aud_5',
    hora: '08:12 AM',
    fecha: 'Hoy',
    usuario: 'Valeria (Admin)',
    accion: 'Aprobó liquidación retenida fondo QA #3891',
    tipo: 'qa',
    badge: 'Fondo QA 3%'
  }
];

export default function FinanzasAdminPage() {
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionMecanico[]>(LIQUIDACIONES_INICIALES);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [toastNotificacion, setToastNotificacion] = useState<string | null>(null);
  const [diaHover, setDiaHover] = useState<typeof DIAS_SEMANA[0] | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [mostrarBotonTutorial, setMostrarBotonTutorial] = useState(false);

  // Estados para Gestión de Credenciales de Operadoras (Solo Dueño)
  const [modalOperadorasOpen, setModalOperadorasOpen] = useState(false);
  const [operadoras, setOperadoras] = useState<CredencialOperadora[]>(OPERADORAS_INICIALES);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaEmail, setNuevaEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [nuevaTurno, setNuevaTurno] = useState('Turno Mañana (07:00 AM - 03:00 PM)');
  const [nuevaTelefono, setNuevaTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [mensajeOperadora, setMensajeOperadora] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Estado de Bitácora de Auditoría Conectada a Supabase Realtime
  const [bitacoraItems, setBitacoraItems] = useState<any[]>(BITACORA_AUDITORIA);

  useEffect(() => {
    const cargarBitacora = async () => {
      const logs = await obtenerBitacoraOperaciones();
      if (logs.length > 0) {
        const formateados = logs.map((log) => ({
          id: log.id,
          hora: new Date(log.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
          fecha: 'Hoy',
          usuario: log.operadora_nombre || 'Operadora',
          accion: log.orden_id ? `${log.accion} (Orden #${log.orden_id.slice(0, 8)})` : log.accion,
          badge: log.badge || 'Despacho Táctico',
          tipo: 'operadora'
        }));
        setBitacoraItems(formateados);
      }
    };
    cargarBitacora();

    // Supabase Realtime para Bitácora de Operaciones en Vivo
    const supabase = createClient();
    const canal = supabase
      .channel('realtime_bitacora_admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bitacora_operaciones' },
        (payload) => {
          if (payload.new) {
            const nuevo = payload.new;
            const itemNuevo = {
              id: nuevo.id,
              hora: new Date(nuevo.created_at || Date.now()).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
              fecha: 'En vivo',
              usuario: nuevo.operadora_nombre || 'Operadora',
              accion: nuevo.orden_id ? `${nuevo.accion} (Orden #${nuevo.orden_id.slice(0, 8)})` : nuevo.accion,
              badge: 'Despacho Táctico',
              tipo: 'operadora'
            };
            setBitacoraItems((prev) => [itemNuevo, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const estaRegistrado = typeof document !== 'undefined' && Boolean(
        document.cookie.match(/(^| )ttm_user_code=([^;]+)/) ||
        document.cookie.match(/(^| )ttm_role=([^;]+)/)
      );
      const visto = localStorage.getItem('onboarding_seen_admin');
      if (estaRegistrado || visto) {
        setMostrarBotonTutorial(false);
      } else {
        setMostrarBotonTutorial(true);
      }

      // Cargar operadoras persistidas
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
  }, []);

  const guardarOperadoras = (nuevas: CredencialOperadora[]) => {
    setOperadoras(nuevas);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ttm_operadoras_credenciales', JSON.stringify(nuevas));
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

  const handleCrearOperadora = (e: React.FormEvent) => {
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
      estado: 'ACTIVA'
    };

    const actualizadas = [nueva, ...operadoras];
    guardarOperadoras(actualizadas);

    // Limpiar campos
    setNuevaNombre('');
    setNuevaEmail('');
    setNuevaPassword('');
    setNuevaTelefono('');
    setMensajeOperadora({
      tipo: 'ok',
      texto: `✅ ¡Operadora ${nueva.nombre} dada de alta exitosamente! Ya puedes copiar sus credenciales.`
    });

    setToastNotificacion(`Operadora ${nueva.nombre} habilitada en el Centro de Despacho.`);
    setTimeout(() => setToastNotificacion(null), 4000);
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

    const opMod = operadoras.find((o) => o.id === id);
    if (opMod) {
      setToastNotificacion(
        opMod.estado === 'ACTIVA'
          ? `Acceso de ${opMod.nombre} suspendido temporalmente.`
          : `Acceso de ${opMod.nombre} reactivado exitosamente.`
      );
      setTimeout(() => setToastNotificacion(null), 4000);
    }
  };

  const handleEliminarOperadora = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de revocar permanentemente las credenciales de ${nombre}?`)) {
      const actualizadas = operadoras.filter((op) => op.id !== id);
      guardarOperadoras(actualizadas);
      setToastNotificacion(`Credenciales de ${nombre} revocadas.`);
      setTimeout(() => setToastNotificacion(null), 4000);
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
2. Esta cuenta tiene permisos directos para asignar mecánicos, cotizar y enviar runners.
3. Toda acción queda registrada con tu nombre en la Bitácora de Auditoría inmutable.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiadoId(op.id);
      setTimeout(() => setCopiadoId(null), 3000);
      setToastNotificacion(`Credenciales de ${op.nombre} copiadas al portapapeles para WhatsApp.`);
      setTimeout(() => setToastNotificacion(null), 4000);
    }
  };

  // Manejador para Liberar Pago al Mecánico
  const handleLiberarPago = (id: string, mecanicoNombre: string, montoNeto: number) => {
    setProcesandoId(id);

    setTimeout(() => {
      setLiquidaciones((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: 'PAGADO' } : item))
      );
      setProcesandoId(null);

      // Bitácora inmutable en consola
      console.log('[BITÁCORA FINANCIERA INMUTABLE] Administrador liberó liquidación de especialista.', {
        evento: 'PAGO_MECANICO_LIBERADO',
        liquidacionId: id,
        mecanico: mecanicoNombre,
        montoNetoUSD: montoNeto.toFixed(2),
        retencionQA_3pct_custodiada: (montoNeto * 0.03).toFixed(2),
        medioPago: 'Transferencia Inmediata TuTallerMóvil Pay',
        timestamp: new Date().toISOString()
      });

      setToastNotificacion(
        `Pago de $${montoNeto.toFixed(2)} liberado a ${mecanicoNombre}. Fondo QA (3%) conciliado en bóveda.`
      );

      setTimeout(() => {
        setToastNotificacion(null);
      }, 4500);
    }, 700);
  };

  const totalPendienteLiquidar = liquidaciones
    .filter((l) => l.estado === 'PENDIENTE')
    .reduce((acc, l) => acc + l.montoNeto, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] antialiased selection:bg-[#CCFF00] selection:text-[#0A1525] relative">
      
      {/* Patrón sutil técnico de fondo estilo 2027 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ======================================================== */}
      {/* 1. HEADER INSTITUCIONAL (C-Level Dashboard) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Título & Badge de Vista del Dueño */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black tracking-wider text-base shadow-sm shrink-0 border border-slate-700/60">
                <Landmark className="w-6 h-6 text-[#CCFF00]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                    Finanzas & Tesorería
                  </h1>
                  <span className="hidden md:inline-flex text-[10px] font-extrabold uppercase tracking-wider bg-[#0A1525] text-[#CCFF00] px-2.5 py-0.5 rounded-full shadow-2xs">
                    Admin C-Level
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium flex items-center gap-2 mt-0.5">
                  <span>TuTallerMóvil Technologies</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Caja Conciliada en Tiempo Real
                  </span>
                </p>
              </div>
            </div>

            {/* Accesos Rápidos entre Módulos */}
            <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
              <Link
                href="/admin/despacho"
                className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#1E56B0]" />
                <span className="hidden sm:inline">Centro de Despacho</span>
              </Link>

              <Link
                href="/repuestos/pedidos"
                className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Bike className="w-4 h-4 text-[#1E56B0]" />
                <span>B2B Repuestos</span>
              </Link>

              {/* Botón Dueño: Gestión de Operadoras de Despacho */}
              <button
                type="button"
                onClick={() => setModalOperadorasOpen(true)}
                className="h-10 px-3.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-900 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Emitir y gestionar credenciales de acceso para operadoras"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Credenciales Operadoras</span>
                <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full ml-0.5">
                  {operadoras.filter((o) => o.estado === 'ACTIVA').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => alert('Generando informe consolidado en PDF de ingresos y retenciones QA...')}
                className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black tracking-wide flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span className="hidden lg:inline">Descargar Balance</span>
              </button>

              {mostrarBotonTutorial && (
                <button
                  type="button"
                  onClick={() => setMostrarTutorial(true)}
                  className="h-10 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#1E56B0] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="Ver tutorial de bienvenida (Solo primera visita)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span className="hidden sm:inline">Tutorial</span>
                </button>
              )}

              <button
                type="button"
                onClick={cerrarSesion}
                className="h-10 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. FILA SUPERIOR: KPIS PRINCIPALES (BENTO GRID 4 COLS) */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Ingresos Brutos (Mes) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#475569]">
                Ingresos Brutos (Mes)
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#CCFF00] text-[#0A1525] flex items-center justify-center transition-colors">
                <DollarSign className="w-4 h-4 text-[#0A1525]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-mono font-black text-[#0A1525] tracking-tight">
                $12,450.00
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-0.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="w-3 h-3 stroke-[3]" />
                  +15%
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  vs. mes anterior
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>84 servicios facturados</span>
              <span className="font-mono font-bold text-[#1E56B0]">Caracas Hub</span>
            </div>
          </motion.div>

          {/* KPI 2: Comisiones Netas */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#475569]">
                Comisiones Netas
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E56B0] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#1E56B0]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-mono font-black text-[#1E56B0] tracking-tight">
                $2,100.00
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Margen: 16.8%
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Utilidad TTM
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Mano de obra + Fee piezas</span>
              <span className="font-mono font-bold text-emerald-600">Líquido</span>
            </div>
          </motion.div>

          {/* KPI 3: Fondo de Garantía QA (3%) - LA JOYA DE LA CORONA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-5 rounded-3xl bg-[#0A1525] border-2 border-[#CCFF00]/50 shadow-xl relative overflow-hidden group text-white"
          >
            {/* Halo de luz verde lima */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00]">
                  Fondo de Garantía QA (3%)
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-mono font-black text-white tracking-tight flex items-baseline gap-2">
                <span>$373.50</span>
                <span className="text-xs font-mono font-bold text-[#CCFF00]">USD</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Retención automática en cada orden para garantía incondicional.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Protección Total</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Custodia Activa
              </span>
            </div>
          </motion.div>

          {/* KPI 4: Caja Rotativa Cashea */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#475569]">
                Caja Rotativa Cashea
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-700" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-mono font-black text-[#0A1525] tracking-tight">
                $3,200.00
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Límite autorizado:</span>
                <span className="font-mono font-bold text-slate-700">$4,000.00</span>
              </div>
            </div>

            {/* Barra de Progreso de Utilización */}
            <div className="mt-3 space-y-1">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#1E56B0] to-[#CCFF00] rounded-full transition-all duration-1000"
                  style={{ width: '80%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-0.5">
                <span>80% Utilizado</span>
                <span className="text-emerald-700">$800 disp.</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2.1 BENTO EJECUTIVO: SEGURIDAD & CREDENCIALES OPERADORAS */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-r from-[#0A1525] via-[#112240] to-[#0A1525] rounded-3xl p-5 sm:p-6 border border-slate-700/60 shadow-lg text-white flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
        >
          {/* Luz decorativa */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-[#CCFF00] border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Control de Accesos & Credenciales de Operadoras
                </h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#CCFF00] text-[#0A1525] px-2.5 py-0.5 rounded-full shadow-2xs">
                  Privilegio Dueño
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Solo el Dueño/Director puede emitir, suspender o revocar accesos a la cabina de despacho táctico. Crea claves seguras y envíalas directamente por WhatsApp con un solo clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto relative z-10">
            {/* Avatares de las operadoras */}
            <div className="hidden lg:flex items-center -space-x-2 mr-1">
              {operadoras.slice(0, 3).map((op) => (
                <div
                  key={op.id}
                  title={`${op.nombre} (${op.turno}) - ${op.estado}`}
                  className={`w-8 h-8 rounded-full border-2 border-[#0A1525] flex items-center justify-center text-[11px] font-black shadow-xs ${
                    op.estado === 'ACTIVA' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {op.nombre.charAt(0)}
                </div>
              ))}
              {operadoras.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-[#0A1525] bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                  +{operadoras.length - 3}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setModalOperadorasOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black tracking-wide flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Gestionar & Crear Acceso</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 3. FILA CENTRAL: GRÁFICO (2/3) + AUDITORÍA (1/3) */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* COLUMNA IZQUIERDA: GRÁFICO DE INGRESOS (8 cols en desktop) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            
            {/* Header del Gráfico */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#0A1525] tracking-tight">
                    Flujo de Ingresos (Últimos 7 días)
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    Semana Actual
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium mt-0.5">
                  Comportamiento del volumen bruto facturado entre servicios y repuestos.
                </p>
              </div>

              {/* Total y Promedio Diario */}
              <div className="flex items-center gap-4 text-right">
                <div className="bg-[#F8FAFC] px-3.5 py-2 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">
                    Promedio Diario
                  </span>
                  <span className="text-sm font-mono font-black text-[#1E56B0]">
                    $1,778.50
                  </span>
                </div>
                <div className="bg-[#F8FAFC] px-3.5 py-2 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">
                    Pico Semanal
                  </span>
                  <span className="text-sm font-mono font-black text-emerald-600">
                    $2,450.00
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico de Barras con Tailwind (Degradado Azul Cobalto a Azul Marino) */}
            <div className="pt-8 pb-4">
              <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4">
                {DIAS_SEMANA.map((d) => (
                  <div
                    key={d.dia}
                    onMouseEnter={() => setDiaHover(d)}
                    onMouseLeave={() => setDiaHover(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip Dinámico Flotante */}
                    <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center pointer-events-none">
                      <span className="bg-[#0A1525] text-white text-[11px] font-mono font-black px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                        ${d.monto.toLocaleString()}
                      </span>
                      <div className="w-1.5 h-1.5 bg-[#0A1525] rotate-45 -mt-1" />
                    </div>

                    {/* Barra con Degradado Cobalto a Marino */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-2xl overflow-hidden p-1 flex items-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.porcentaje}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`w-full rounded-xl transition-all duration-300 relative group-hover:brightness-110 ${
                          d.pico
                            ? 'bg-gradient-to-t from-[#0A1525] via-[#1E56B0] to-[#CCFF00] shadow-sm'
                            : 'bg-gradient-to-t from-[#0A1525] to-[#1E56B0]'
                        }`}
                      >
                        {d.pico && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#CCFF00] shadow-xs" />
                        )}
                      </motion.div>
                    </div>

                    {/* Etiquetas del Eje X */}
                    <div className="text-center mt-3">
                      <span className="text-xs font-black text-[#0A1525] block group-hover:text-[#1E56B0] transition-colors">
                        {d.dia}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {d.fecha}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leyenda y Notas Financieras */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-md bg-[#0A1525]" />
                  <span>Base Despacho</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-md bg-[#1E56B0]" />
                  <span>Mano de Obra (62%)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-md bg-[#CCFF00] border border-slate-300" />
                  <span>Pico / Repuestos (35%)</span>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Auditoría cerrada al 17 Nov 2026
              </span>
            </div>

          </div>

          {/* COLUMNA DERECHA: BITÁCORA DE AUDITORÍA INMUTABLE (4 cols en desktop) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            
            <div>
              {/* Header de la Bitácora */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#0A1525] flex items-center justify-center font-black">
                    <Clock className="w-4 h-4 text-[#1E56B0]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0A1525] tracking-tight">
                      Últimas Operaciones
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Bitácora de Auditoría Inmutable
                    </p>
                  </div>
                </div>

                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Registro activo en vivo" />
              </div>

              {/* Timeline Vertical */}
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                {bitacoraItems.slice(0, 10).map((item, idx) => (
                  <div key={item.id} className="relative group">
                    
                    {/* Punto del Timeline */}
                    <div
                      className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                        idx === 0
                          ? 'bg-[#1E56B0] ring-4 ring-blue-100'
                          : idx === 1
                          ? 'bg-[#0A1525]'
                          : 'bg-slate-400'
                      }`}
                    />

                    {/* Contenido de la Acción */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-mono font-bold text-[#1E56B0]">
                          {item.hora}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-xs font-black text-[#0A1525]">
                        {item.usuario}
                      </p>

                      <p className="text-xs text-slate-600 font-medium leading-snug">
                        {item.accion}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Sello de Seguridad */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3 text-emerald-600" />
                Inmutable SHA-256
              </span>
              <span className="font-mono text-[10px]">C-LEVEL QA</span>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. TABLA DE LIQUIDACIONES PENDIENTES (Parte Inferior) */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 mb-10">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          
          {/* Header de la Tabla */}
          <div className="p-5 sm:p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#0A1525] tracking-tight">
                  Liquidaciones Pendientes a Especialistas
                </h3>
                <span className="text-xs font-mono font-black bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {liquidaciones.filter((l) => l.estado === 'PENDIENTE').length} pendientes
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium mt-0.5">
                Cierre de órdenes validadas por QA. El 3% es automáticamente retenido para el Fondo de Garantía.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 flex items-center gap-4 self-end sm:self-auto">
              <span className="text-xs text-[#475569] font-bold">Total por Liberar:</span>
              <span className="text-lg font-mono font-black text-[#0A1525]">
                ${totalPendienteLiquidar.toFixed(2)}{' '}
                <span className="text-xs font-sans text-slate-400">USD</span>
              </span>
            </div>
          </div>

          {/* Tabla de Liquidaciones */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-black uppercase tracking-wider text-[#475569]">
                  <th className="py-3.5 px-6">Mecánico</th>
                  <th className="py-3.5 px-4">Servicio & Vehículo</th>
                  <th className="py-3.5 px-4 text-right">Monto Bruto</th>
                  <th className="py-3.5 px-4 text-center">Retención QA (3%)</th>
                  <th className="py-3.5 px-4 text-right">Monto Neto</th>
                  <th className="py-3.5 px-6 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {liquidaciones.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Mecánico */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.mecanicoFoto}
                          alt={item.mecanicoNombre}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <p className="font-black text-[#0A1525] text-xs">
                            {item.mecanicoNombre}
                          </p>
                          <span className="font-mono text-[10px] font-bold text-[#1E56B0] block">
                            {item.mecanicoCodigo}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Servicio y Vehículo */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.ordenId}
                          </span>
                          <span className="font-bold text-[#0A1525] text-xs truncate">
                            {item.servicioDescripcion}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {item.vehiculo} • Cliente: {item.cliente}
                        </p>
                      </div>
                    </td>

                    {/* Monto Bruto */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-700">
                      ${item.montoBruto.toFixed(2)}
                    </td>

                    {/* Retención QA (3%) */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200" title="Retenido al fondo de garantía QA">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        -${item.retencionQA.toFixed(2)}
                      </span>
                    </td>

                    {/* Monto Neto */}
                    <td className="py-4 px-4 text-right font-mono font-black text-sm text-[#0A1525]">
                      ${item.montoNeto.toFixed(2)}
                    </td>

                    {/* Botón de Acción */}
                    <td className="py-4 px-6 text-center">
                      {item.estado === 'PAGADO' ? (
                        <motion.span
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] text-white text-xs font-black shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Pagado</span>
                        </motion.span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          disabled={procesandoId === item.id}
                          onClick={() => handleLiberarPago(item.id, item.mecanicoNombre, item.montoNeto)}
                          className="px-4 py-2 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 mx-auto cursor-pointer disabled:opacity-50"
                        >
                          {procesandoId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Liberando...</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5 text-[#CCFF00]" />
                              <span>Liberar Pago</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer de la Tabla */}
          <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantía QA incondicional de 30 días activada por cada orden liberada.</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-400">
              Transferencias acreditadas por TuTallerMóvil Pay
            </span>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. TOAST NOTIFICACIÓN FLOTANTE */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastNotificacion && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A1525] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3.5 max-w-md"
          >
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 shadow-xs font-black">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">
                Liquidación Aprobada
              </p>
              <p className="text-[11px] text-slate-300">
                {toastNotificacion}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL DE GESTIÓN DE CREDENCIALES DE OPERADORAS (SOLO DUEÑO) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalOperadorasOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            {/* Backdrop con desenfoque de cristal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOperadorasOpen(false)}
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
                  onClick={() => setModalOperadorasOpen(false)}
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
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                      <UserPlus className="w-4 h-4 text-[#1E56B0]" />
                      <h4 className="text-sm font-black text-[#0A1525]">
                        Emitir Nueva Credencial
                      </h4>
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

                    <form onSubmit={handleCrearOperadora} className="space-y-3.5">
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

                      {/* Botón Guardar */}
                      <button
                        type="submit"
                        className="w-full mt-2 py-3 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg"
                      >
                        <UserPlus className="w-4 h-4 text-[#CCFF00]" />
                        <span>Dar de Alta & Emitir Acceso</span>
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
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          {/* Datos de la Operadora */}
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

                          {/* Acciones para el Dueño */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                  onClick={() => setModalOperadorasOpen(false)}
                  className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal de Bienvenida para Administrador */}
      <OnboardingModal
        rol="ADMIN"
        isOpen={mostrarTutorial ? true : undefined}
        onClose={() => {
          setMostrarTutorial(false);
          setMostrarBotonTutorial(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboarding_seen_admin', 'true');
          }
        }}
      />

      {/* Botón Flotante de Soporte Técnico (WhatsApp FAB) */}
      <FloatingSupportButton mensajePersonalizado="Hola, soy administrador de TuTallerMóvil y requiero soporte técnico con el módulo de Finanzas." />

    </div>
  );
}
