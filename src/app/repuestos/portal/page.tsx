'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Package,
  Plus,
  Search,
  Check,
  X,
  Car,
  Store,
  DollarSign,
  Tag,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  AlertCircle,
  ExternalLink,
  Bike,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Pencil,
  LogOut
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';
import BotonSoporteWhatsApp from '@/components/BotonSoporteWhatsApp';

interface Repuesto {
  id: string;
  proveedor_nombre?: string;
  nombre_repuesto: string;
  marca: string;
  precio_usd: number;
  descripcion?: string;
  foto_url?: string;
  compatibilidad: string;
  stock?: number;
  created_at?: string;
}

// Sugerencias de fotos de Unsplash para prueba rápida en 1 clic
const FOTOS_PREESTABLECIDAS = [
  {
    label: 'Pastillas de Freno',
    url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80'
  },
  {
    label: 'Batería Automotriz',
    url: 'https://images.unsplash.com/photo-1620910930886-6b2b9e214686?auto=format&fit=crop&w=600&q=80'
  },
  {
    label: 'Filtro / Bujías',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80'
  },
  {
    label: 'Amortiguador / Suspensión',
    url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80'
  }
];

export default function PortalRepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de Búsqueda y Filtro
  const [busqueda, setBusqueda] = useState<string>('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>('todas');

  // Estado del Modal Bento de Carga y Edición
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [repuestoEnEdicion, setRepuestoEnEdicion] = useState<Repuesto | null>(null);
  const [eliminandoRepuesto, setEliminandoRepuesto] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [toastExito, setToastExito] = useState<string | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState<boolean>(false);
  const [mostrarBotonTutorial, setMostrarBotonTutorial] = useState<boolean>(false);

  // Formulario Bento
  const [formNombre, setFormNombre] = useState<string>('');
  const [formMarca, setFormMarca] = useState<string>('');
  const [formPrecio, setFormPrecio] = useState<string>('');
  const [formDescripcion, setFormDescripcion] = useState<string>('');
  const [formFotoUrl, setFormFotoUrl] = useState<string>('');
  const [formCompatibilidad, setFormCompatibilidad] = useState<string>('');
  const [formStock, setFormStock] = useState<string>('1');

  // Modo de Captura de Foto: 'archivo' (cámara / archivo dispositivo) | 'url' (enlace web)
  const [modoFoto, setModoFoto] = useState<'archivo' | 'url'>('archivo');
  const [procesandoFoto, setProcesandoFoto] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Etiquetas sugeridas dinámicas (el usuario puede crear nuevas)
  const [etiquetasSugeridas, setEtiquetasSugeridas] = useState([
    {
      label: 'Pastillas de Freno',
      url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: 'Batería Automotriz',
      url: 'https://images.unsplash.com/photo-1620910930886-6b2b9e214686?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: 'Filtro / Bujías',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80'
    },
    {
      label: 'Amortiguador / Suspensión',
      url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80'
    }
  ]);
  const [mostrarInputNuevaEtiqueta, setMostrarInputNuevaEtiqueta] = useState<boolean>(false);
  const [textoNuevaEtiqueta, setTextoNuevaEtiqueta] = useState<string>('');
  const [etiquetaActiva, setEtiquetaActiva] = useState<string | null>(null);

  const handleAgregarNuevaEtiqueta = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nombreLimpio = textoNuevaEtiqueta.trim();
    if (!nombreLimpio) return;

    const nuevaEtiqueta = {
      label: nombreLimpio,
      url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80'
    };

    setEtiquetasSugeridas((prev) => [...prev, nuevaEtiqueta]);
    setFormFotoUrl(nuevaEtiqueta.url);
    setEtiquetaActiva(nombreLimpio);
    if (!formNombre) {
      setFormNombre(nombreLimpio);
    }
    setTextoNuevaEtiqueta('');
    setMostrarInputNuevaEtiqueta(false);
  };

  // Procesar y comprimir foto de cámara / dispositivo a base64 optimizada
  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesandoFoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormFotoUrl(dataUrl);
        } else {
          setFormFotoUrl(event.target?.result as string);
        }
        setProcesandoFoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Cargar Repuestos desde Supabase
  const cargarRepuestos = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('repuestos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error al cargar repuestos desde Supabase:', error.message);
        setErrorCarga('No se pudo conectar a la base de datos de repuestos.');
      } else if (data) {
        setRepuestos(data as Repuesto[]);
      }
    } catch (err: any) {
      console.error('Error inesperado en repuestos:', err);
      setErrorCarga('Error inesperado al cargar catálogo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const estaRegistrado = typeof document !== 'undefined' && Boolean(
        document.cookie.match(/(^| )ttm_user_code=([^;]+)/) ||
        document.cookie.match(/(^| )ttm_role=([^;]+)/)
      );
      const visto = localStorage.getItem('onboarding_seen_repuestos');
      if (estaRegistrado || visto) {
        setMostrarBotonTutorial(false);
      } else {
        setMostrarBotonTutorial(true);
      }
    }
    cargarRepuestos();
  }, []);

  // Marcas únicas para filtro rápido
  const marcasDisponibles = useMemo(() => {
    const set = new Set<string>();
    repuestos.forEach((r) => {
      if (r.marca) set.add(r.marca.trim());
    });
    return Array.from(set);
  }, [repuestos]);

  // Lista Filtrada
  const repuestosFiltrados = useMemo(() => {
    return repuestos.filter((item) => {
      const matchBusqueda =
        !busqueda ||
        item.nombre_repuesto.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        (item.compatibilidad &&
          item.compatibilidad.toLowerCase().includes(busqueda.toLowerCase())) ||
        (item.descripcion &&
          item.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

      const matchMarca =
        marcaSeleccionada === 'todas' ||
        item.marca.toLowerCase() === marcaSeleccionada.toLowerCase();

      return matchBusqueda && matchMarca;
    });
  }, [repuestos, busqueda, marcaSeleccionada]);

  const handleAbrirCrear = () => {
    setErrorFormulario(null);
    setRepuestoEnEdicion(null);
    setFormNombre('');
    setFormMarca('');
    setFormPrecio('');
    setFormDescripcion('');
    setFormFotoUrl('');
    setFormCompatibilidad('');
    setFormStock('1');
    setEtiquetaActiva(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (rep: Repuesto) => {
    setErrorFormulario(null);
    setRepuestoEnEdicion(rep);
    setFormNombre(rep.nombre_repuesto || '');
    setFormMarca(rep.marca || '');
    setFormPrecio(rep.precio_usd ? rep.precio_usd.toString() : '');
    setFormDescripcion(rep.descripcion || '');
    setFormFotoUrl(rep.foto_url || '');
    setFormCompatibilidad(rep.compatibilidad || '');
    setFormStock((rep.stock !== undefined && rep.stock !== null ? rep.stock : 1).toString());
    setEtiquetaActiva(rep.marca || null);
    setModalAbierto(true);
  };

  const handleEliminarRepuesto = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este repuesto del catálogo?')) {
      return;
    }

    try {
      setEliminandoRepuesto(true);
      const supabase = createClient();
      const { error } = await supabase.from('repuestos').delete().eq('id', id);

      if (error) {
        console.warn('Aviso al eliminar en Supabase:', error.message);
      }

      setRepuestos((prev) => prev.filter((r) => r.id !== id));
      setModalAbierto(false);
      setRepuestoEnEdicion(null);
      setToastExito('Repuesto eliminado del inventario.');
      setTimeout(() => setToastExito(null), 4000);
    } catch (err: any) {
      console.error('Error eliminando repuesto:', err);
      alert('No se pudo eliminar el repuesto.');
    } finally {
      setEliminandoRepuesto(false);
    }
  };

  // Manejar Envío del Formulario (Creación o Edición)
  const handleGuardarRepuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario(null);

    // Validaciones
    if (!formNombre.trim()) {
      setErrorFormulario('Ingresa el nombre del repuesto');
      return;
    }
    if (!formMarca.trim()) {
      setErrorFormulario('Ingresa la marca del repuesto');
      return;
    }
    const precioNumerico = parseFloat(formPrecio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      setErrorFormulario('Ingresa un precio válido en USD (ej: 45.00)');
      return;
    }
    if (!formCompatibilidad.trim()) {
      setErrorFormulario('Indica los modelos de vehículos compatibles');
      return;
    }

    try {
      setGuardando(true);
      const supabase = createClient();

      const registro = {
        proveedor_nombre: 'AutoPartes Chacao',
        nombre_repuesto: formNombre.trim(),
        marca: formMarca.trim(),
        precio_usd: precioNumerico,
        descripcion: formDescripcion.trim() || 'Repuesto nuevo con garantía oficial TTM',
        foto_url:
          formFotoUrl.trim() ||
          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
        compatibilidad: formCompatibilidad.trim(),
        stock: parseInt(formStock, 10) || 1
      };

      if (repuestoEnEdicion) {
        // MODO EDICIÓN
        const { data, error } = await supabase
          .from('repuestos')
          .update(registro)
          .eq('id', repuestoEnEdicion.id)
          .select()
          .single();

        if (error) {
          console.warn('Aviso Supabase update, aplicando actualización local:', error.message);
        }

        const actualizado = data || { ...repuestoEnEdicion, ...registro };
        setRepuestos((prev) =>
          prev.map((r) => (r.id === repuestoEnEdicion.id ? (actualizado as Repuesto) : r))
        );

        setToastExito(`¡Repuesto "${formNombre}" actualizado con éxito!`);
      } else {
        // MODO CREACIÓN
        const { data, error } = await supabase
          .from('repuestos')
          .insert([registro])
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setRepuestos((prev) => [data as Repuesto, ...prev]);
        } else {
          await cargarRepuestos();
        }

        setToastExito(`¡Repuesto "${formNombre}" publicado en la red TTM!`);
      }

      // Limpiar formulario y cerrar modal
      setFormNombre('');
      setFormMarca('');
      setFormPrecio('');
      setFormDescripcion('');
      setFormFotoUrl('');
      setFormCompatibilidad('');
      setFormStock('1');
      setRepuestoEnEdicion(null);
      setModalAbierto(false);

      setTimeout(() => setToastExito(null), 4500);
    } catch (err: any) {
      console.error('Error al guardar repuesto:', err);
      setErrorFormulario(err.message || 'Error al guardar el repuesto en Supabase.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] selection:bg-[#CCFF00] selection:text-[#0A1525]">
      {/* Patrón sutil técnico de fondo estilo 2027 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ======================================================== */}
      {/* 1. HEADER DE PROVEEDOR (Sticky Glassmorphism) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Identidad del Proveedor */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0A1525] border border-slate-700/60 text-[#CCFF00] flex items-center justify-center font-black tracking-wider text-base shadow-sm shrink-0">
              <Store className="w-5 h-5 text-[#CCFF00]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#0A1525] tracking-tight truncate">
                  AutoPartes Chacao
                </h1>
                {/* Check Verde Oficial Sólido con tilde blanca idéntico a la referencia */}
                <span
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs text-white"
                  title="Proveedor Verificado Oficial TTM"
                >
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3.5]" />
                </span>
                <span className="hidden md:inline-flex text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  Aliado Certificado
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium flex items-center gap-2">
                <span>Catálogo B2B / B2C</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono font-bold text-[#1E56B0]">
                  {repuestos.length} repuestos activos
                </span>
              </p>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <BotonSoporteWhatsApp
              modo="header"
              mensaje="Hola, soy proveedor de repuestos de TuTallerMóvil y necesito asistencia"
              className="hidden md:inline-flex"
            />

            <Link
              href="/repuestos/pedidos"
              className="h-10 px-3.5 rounded-xl border border-[#1E56B0]/20 bg-[#1E56B0]/10 hover:bg-[#1E56B0]/15 text-xs font-bold text-[#1E56B0] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Package className="w-4 h-4 text-[#1E56B0]" />
              <span>Pedidos Entrantes</span>
            </Link>

            <Link
              href="/admin/despacho"
              className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Bike className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Tablero Despacho</span>
            </Link>

            {/* CTA Principal: Publicar Repuesto (#CCFF00) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAbrirCrear}
              className="h-10 px-4 sm:px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black tracking-tight flex items-center gap-2 transition-all shadow-sm border border-[#0A1525]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publicar Repuesto</span>
            </motion.button>

            {mostrarBotonTutorial && (
              <button
                type="button"
                onClick={() => setMostrarTutorial(true)}
                className="h-10 px-3.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-[#1E56B0] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
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
      </header>

      {/* ======================================================== */}
      {/* 2. BARRA DE HERRAMIENTAS: Búsqueda y Filtros Rápidos */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por repuesto, marca, compatibilidad (ej: Corolla, Bosch)..."
              className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Marca */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setMarcaSeleccionada('todas')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                marcaSeleccionada === 'todas'
                  ? 'bg-[#0A1525] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Todas las marcas
            </button>
            {marcasDisponibles.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarcaSeleccionada(m)}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  marcaSeleccionada === m
                    ? 'bg-[#1E56B0] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. GRID DE TARJETAS DE REPUESTOS (E-commerce Bento 2027) */}
      {/* ======================================================== */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-4 animate-pulse h-80"
              >
                <div className="w-full h-44 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-6 bg-slate-100 rounded w-1/3 pt-4" />
              </div>
            ))}
          </div>
        ) : repuestosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-[#CBD5E1] p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
              <Package className="w-8 h-8 stroke-[1.5] text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-[#0A1525]">
                {busqueda
                  ? 'No se encontraron repuestos con ese criterio'
                  : 'Aún no hay repuestos publicados'}
              </h3>
              <p className="text-xs text-[#475569] max-w-sm mx-auto">
                {busqueda
                  ? 'Intenta con otro término o limpia los filtros para ver todo el catálogo.'
                  : 'Publica el primer artículo de tu inventario para los mecánicos y runners de TuTallerMóvil.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setMarcaSeleccionada('todas');
                setModalAbierto(true);
              }}
              className="px-6 py-3 rounded-xl bg-[#0A1525] hover:bg-[#CCFF00] text-white hover:text-[#0A1525] text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publicar el primer repuesto</span>
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {repuestosFiltrados.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#1E56B0] overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  {/* Foto con Badges Flotantes y Botón Editar */}
                  <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        item.foto_url ||
                        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.nombre_repuesto}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback elegante en caso de URL rota
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Badge de Marca / Etiqueta */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#0A1525]/90 backdrop-blur-xs text-[#CCFF00] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                        {item.marca}
                      </span>
                    </div>

                    {/* Badge de Stock */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white/95 backdrop-blur-xs text-[#0A1525] font-black text-[10px] px-2.5 py-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{item.stock && item.stock > 1 ? `${item.stock} en stock` : 'Disponible'}</span>
                      </span>
                    </div>

                    {/* Botón flotante Editar sobre la foto */}
                    <button
                      type="button"
                      onClick={() => handleAbrirEditar(item)}
                      className="absolute bottom-3 right-3 z-10 h-7 px-2.5 rounded-lg bg-white/95 hover:bg-[#CCFF00] text-[#0A1525] text-xs font-black flex items-center gap-1.5 shadow-md border border-slate-200 backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                      title="Editar foto, nombre, etiquetas y stock"
                    >
                      <Pencil className="w-3 h-3 text-[#0A1525]" />
                      <span>Editar</span>
                    </button>

                    {/* Sutil viñeta inferior */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3
                        onClick={() => handleAbrirEditar(item)}
                        className="font-black text-[#0A1525] text-base leading-snug group-hover:text-[#1E56B0] transition-colors line-clamp-2 cursor-pointer"
                        title="Clic para editar este repuesto"
                      >
                        {item.nombre_repuesto}
                      </h3>

                      {item.descripcion && (
                        <p className="text-xs text-[#475569] line-clamp-2 font-medium">
                          {item.descripcion}
                        </p>
                      )}

                      {/* Chip Gris de Compatibilidad */}
                      <div className="pt-1">
                        <div
                          onClick={() => handleAbrirEditar(item)}
                          className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-start gap-1.5 transition-colors cursor-pointer"
                          title={`Vehículos compatibles: ${item.compatibilidad} (Clic para editar)`}
                        >
                          <Car className="w-3.5 h-3.5 text-[#1E56B0] shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-tight">
                            {item.compatibilidad}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer con Precio y Botón Editar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Precio Proveedor
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-[#0A1525] tracking-tight">
                            ${Number(item.precio_usd).toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase">
                            USD
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(item)}
                          className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-[#CCFF00] text-[#0A1525] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-95"
                          title="Editar repuesto completo"
                        >
                          <Pencil className="w-3 h-3 text-[#0A1525]" />
                          <span>Editar</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-1 text-[11px] font-extrabold text-[#1E56B0] bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100">
                          <Bike className="w-3 h-3" />
                          <span>Runner</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 4. MODAL BENTO BOX: Publicar Nuevo Repuesto */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-6 my-8"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={() => {
                  setModalAbierto(false);
                  setRepuestoEnEdicion(null);
                }}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Modal */}
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center font-black shadow-xs border border-[#0A1525]/10">
                  {repuestoEnEdicion ? (
                    <Pencil className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <Package className="w-6 h-6 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                    {repuestoEnEdicion ? 'Editar Repuesto' : 'Publicar Nuevo Repuesto'}
                  </h2>
                  <p className="text-xs text-[#475569] font-medium">
                    {repuestoEnEdicion
                      ? 'Actualiza foto, nombre, marca/etiqueta, stock, precio o compatibilidad'
                      : 'Catálogo oficial de AutoPartes Chacao • Red TuTallerMóvil'}
                  </p>
                </div>
              </div>

              {/* Mensaje de Error en Formulario si existe */}
              {errorFormulario && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorFormulario}</span>
                </div>
              )}

              {/* Formulario Estilo Bento */}
              <form onSubmit={handleGuardarRepuesto} className="space-y-4">
                
                {/* Bloque Bento 1: Nombre del repuesto (Full Width) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Nombre del Repuesto *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej. Kit de Embrague Completo (Disco, Prensa y Collarín)"
                    className="w-full h-12 px-3.5 text-sm font-semibold bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                  />
                </div>

                {/* Bloque Bento 2: Grid Marca, Precio y Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Marca */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525]">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={formMarca}
                      onChange={(e) => setFormMarca(e.target.value)}
                      placeholder="Ej. Valeo, Bosch"
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                    />
                  </div>

                  {/* Precio USD */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Precio (USD) *</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      required
                      value={formPrecio}
                      onChange={(e) => setFormPrecio(e.target.value)}
                      placeholder="Ej. 65.00"
                      className="w-full h-11 px-3.5 text-xs font-black bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400 font-mono"
                    />
                  </div>

                  {/* Stock Inicial */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525]">
                      Stock Disp.
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] font-mono"
                    />
                  </div>
                </div>

                {/* Bloque Bento 3: Compatibilidad (Chip/Input Crítico) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Vehículos Compatibles (Separados por coma) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompatibilidad}
                    onChange={(e) => setFormCompatibilidad(e.target.value)}
                    placeholder="Ej. Toyota Corolla 2012-2020, Chevrolet Aveo 2010-2017"
                    className="w-full h-11 px-3.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    Aparecerá como chip gris de compatibilidad para los mecánicos y clientes.
                  </p>
                </div>

                {/* Bloque Bento 4: Subida de Foto (Cámara / Dispositivo o URL) */}
                <div className="space-y-2.5 pt-1">
                  
                  {/* Selector de Modo: Dispositivo/Cámara vs URL */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Foto del Repuesto *</span>
                    </label>

                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setModoFoto('archivo')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          modoFoto === 'archivo'
                            ? 'bg-white text-[#0A1525] shadow-2xs font-black'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Cámara / Dispositivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setModoFoto('url')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          modoFoto === 'url'
                            ? 'bg-white text-[#0A1525] shadow-2xs font-black'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Pegar URL
                      </button>
                    </div>
                  </div>

                  {/* Input de archivo real oculto para activar cámara nativa o explorador */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleSeleccionarArchivo}
                    className="hidden"
                  />

                  {/* MODO 1: Subir desde Dispositivo / Cámara */}
                  {modoFoto === 'archivo' && (
                    <div>
                      {!formFotoUrl ? (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                          className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1E56B0] bg-[#F8FAFC] hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white border border-[#CBD5E1] group-hover:border-[#1E56B0] flex items-center justify-center text-[#1E56B0] shadow-2xs group-hover:scale-105 transition-all">
                            <Camera className="w-6 h-6 stroke-[2.2]" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-black text-[#0A1525] block">
                              Tomar foto con la cámara o subir imagen
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              JPG, PNG o WEBP desde tu galería o cámara del móvil
                            </span>
                          </div>
                        </motion.button>
                      ) : (
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-900 group shadow-sm">
                          <img
                            src={formFotoUrl}
                            alt="Foto cargada"
                            className="w-full h-full object-cover"
                          />

                          {/* Badge de Confirmación */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-[#16A34A] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-white/20">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Foto del Repuesto Lista</span>
                            </span>
                          </div>

                          {/* Acciones para cambiar o eliminar */}
                          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (fileInputRef.current) {
                                  fileInputRef.current.click();
                                }
                              }}
                              className="h-8 px-3 rounded-lg bg-white/95 hover:bg-white text-[#0A1525] text-xs font-black flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#1E56B0]" />
                              <span>Tomar otra</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormFotoUrl('')}
                              className="h-8 w-8 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Gradiente inferior */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>
                      )}

                      {procesandoFoto && (
                        <div className="p-2 text-center text-xs font-bold text-[#1E56B0] flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border-2 border-[#1E56B0] border-t-transparent rounded-full animate-spin" />
                          <span>Procesando y optimizando imagen...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODO 2: Pegar Enlace URL */}
                  {modoFoto === 'url' && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formFotoUrl}
                        onChange={(e) => setFormFotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... (o selecciona una sugerencia abajo)"
                        className="w-full h-11 px-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400"
                      />

                      {/* Chips de Sugerencias de Fotos y Opción de Nueva Etiqueta */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Sugerencias:
                        </span>

                        {etiquetasSugeridas.map((item) => {
                          const isSelected = etiquetaActiva === item.label || formFotoUrl === item.url;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                setFormFotoUrl(item.url);
                                setEtiquetaActiva(item.label);
                                if (!formNombre) {
                                  setFormNombre(item.label);
                                }
                              }}
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-[#0A1525] text-[#CCFF00] border-[#0A1525] shadow-2xs font-black'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span>{item.label}</span>
                            </button>
                          );
                        })}

                        {/* Opción para escribir una nueva etiqueta personalizada */}
                        {!mostrarInputNuevaEtiqueta ? (
                          <button
                            type="button"
                            onClick={() => setMostrarInputNuevaEtiqueta(true)}
                            className="text-[11px] font-extrabold bg-blue-50 hover:bg-[#CCFF00] text-[#1E56B0] hover:text-[#0A1525] px-2.5 py-0.5 rounded-lg border border-dashed border-blue-300 hover:border-slate-800 transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                            title="Escribir una nueva etiqueta personalizada"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Nueva etiqueta</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-white border border-[#1E56B0] rounded-lg p-0.5 shadow-xs">
                            <input
                              type="text"
                              autoFocus
                              value={textoNuevaEtiqueta}
                              onChange={(e) => setTextoNuevaEtiqueta(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAgregarNuevaEtiqueta();
                                }
                              }}
                              placeholder="Escribe etiqueta..."
                              className="text-[11px] font-semibold text-[#0A1525] px-2 py-0.5 outline-hidden w-28 sm:w-36 bg-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => handleAgregarNuevaEtiqueta()}
                              className="h-6 px-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-[10px] font-black rounded cursor-pointer transition-colors"
                            >
                              Añadir
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTextoNuevaEtiqueta('');
                                setMostrarInputNuevaEtiqueta(false);
                              }}
                              className="h-6 px-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Vista Previa */}
                      {formFotoUrl && (
                        <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-100">
                          <img
                            src={formFotoUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                            Vista Previa URL
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Bloque Bento 5: Descripción */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A1525]">
                    Descripción / Especificaciones Técnicas
                  </label>
                  <textarea
                    rows={2}
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    placeholder="Detalles sobre garantía, origen de fabricación o especificaciones..."
                    className="w-full p-3 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E56B0] focus:bg-white rounded-xl outline-hidden transition-all text-[#0A1525] placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {repuestoEnEdicion ? (
                    <button
                      type="button"
                      disabled={eliminandoRepuesto}
                      onClick={() => handleEliminarRepuesto(repuestoEnEdicion.id)}
                      className="h-11 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Eliminar repuesto del catálogo"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>{eliminandoRepuesto ? 'Eliminando...' : 'Eliminar Repuesto'}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setModalAbierto(false);
                        setRepuestoEnEdicion(null);
                      }}
                      className="flex-1 sm:flex-initial h-11 px-5 rounded-xl border border-[#CBD5E1] hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={guardando}
                      className="flex-1 sm:flex-initial h-11 px-6 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black tracking-tight flex items-center justify-center gap-2 transition-all shadow-md border border-[#0A1525]/10 cursor-pointer disabled:opacity-50"
                    >
                      {guardando ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-[#0A1525] border-t-transparent rounded-full animate-spin" />
                          <span>Guardando...</span>
                        </span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{repuestoEnEdicion ? 'Guardar Cambios' : 'Guardar y Publicar en Red TTM'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. TOAST ANIMADO DE ÉXITO */}
      {/* ======================================================== */}
      <AnimatePresence>
        {toastExito && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0A1525] text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3.5 max-w-md"
          >
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-white">{toastExito}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Disponible al instante para despacho de Runners y Mecánicos.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante Soporte WhatsApp */}
      <BotonSoporteWhatsApp
        modo="fab"
        mensaje="Hola, soy proveedor de repuestos de TuTallerMóvil y necesito asistencia"
      />

      {/* Onboarding Modal de Bienvenida para Portal de Repuestos */}
      <OnboardingModal
        rol="REPUESTOS"
        isOpen={mostrarTutorial ? true : undefined}
        onClose={() => {
          setMostrarTutorial(false);
          setMostrarBotonTutorial(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboarding_seen_repuestos', 'true');
          }
        }}
      />
    </div>
  );
}
