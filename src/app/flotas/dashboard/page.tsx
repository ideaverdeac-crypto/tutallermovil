'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Truck,
  Car,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Wrench,
  Check,
  X,
  Gauge,
  Phone,
  Building2,
  Layers,
  History,
  Info,
  BadgeCheck,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Camera,
  Upload,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  Eye,
  User,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Tipos de datos para el portal B2B
export type TipoVehiculo = 'Carga Ligera' | 'Carga Pesada' | 'Utilitario' | 'Pick-Up' | 'Van de Pasajeros';

export interface VehiculoFlota {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: TipoVehiculo;
  conductor: string;
  conductorTelefono: string;
  ultimoServicioFecha: string;
  ultimoServicioTipo: string;
  kilometrajeActual: number;
  kilometrajeUltimoServicio: number;
  estado: 'AL_DIA' | 'PROXIMO' | 'VENCIDO';
  fotoUrl?: string;
  notas?: string;
  serviciosHistorial: {
    fecha: string;
    tipo: string;
    kilometraje: number;
    mecanico: string;
    costo: number;
    repuestos: string;
  }[];
}

export interface EmpresaFlota {
  razonSocial: string;
  rif: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  sector: string;
}

const EMPRESA_DEFAULT: EmpresaFlota = {
  razonSocial: 'Logística El Este C.A.',
  rif: 'J-12345678-9',
  contacto: 'Ing. Carlos Mendoza (Gerente de Flota)',
  telefono: '+58 212 900 1122',
  correo: 'flotas@logisticaeste.com',
  direccion: 'Sector Industrial Los Ruices, Galpón 4B, Caracas',
  sector: 'Distribución & Transporte de Carga Nacional'
};

// 12 Unidades iniciales de la flota
const VEHICULOS_FLOTA_INICIAL: VehiculoFlota[] = [
  {
    id: 'FLEET-01',
    placa: 'A12BC3D',
    marca: 'Iveco',
    modelo: 'Daily 70C16 Chasis Cabina',
    anio: 2021,
    tipo: 'Carga Pesada',
    conductor: 'Pedro Morales',
    conductorTelefono: '+58 412 889 1122',
    ultimoServicioFecha: '12 Oct 2026',
    ultimoServicioTipo: 'Cambio de Aceite Sintético 15W-40 y Filtros',
    kilometrajeActual: 146800,
    kilometrajeUltimoServicio: 141200,
    estado: 'VENCIDO',
    fotoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=500&q=80',
    notas: 'Unidad principal de distribución interurbana Caracas-Valencia.',
    serviciosHistorial: [
      {
        fecha: '12 Oct 2026',
        tipo: 'Mantenimiento Preventivo 140K',
        kilometraje: 141200,
        mecanico: 'Carlos Mendoza (#TTM-0842)',
        costo: 180.0,
        repuestos: 'Aceite 15W-40 Mobil Delvac, Filtro Aceite Mann, Filtro Combustible'
      },
      {
        fecha: '15 Jul 2026',
        tipo: 'Revisión y Cambio de Frenos',
        kilometraje: 135000,
        mecanico: 'Roberto Silva (#TTM-0512)',
        costo: 145.0,
        repuestos: 'Pastillas delanteras cerámicas Fras-le, Líquido DOT 4'
      }
    ]
  },
  {
    id: 'FLEET-02',
    placa: 'A34DE5F',
    marca: 'Chevrolet',
    modelo: 'NPR 75L Turbo Diésel',
    anio: 2022,
    tipo: 'Carga Pesada',
    conductor: 'Roberto Gómez',
    conductorTelefono: '+58 414 772 3344',
    ultimoServicioFecha: '28 Sep 2026',
    ultimoServicioTipo: 'Inspección OBD2 y Calibración Inyectores',
    kilometrajeActual: 98400,
    kilometrajeUltimoServicio: 93800,
    estado: 'PROXIMO',
    fotoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=500&q=80',
    notas: 'Ruta centro del país. Requiere revisión de inyección programada.',
    serviciosHistorial: [
      {
        fecha: '28 Sep 2026',
        tipo: 'Mantenimiento Intermedio 90K',
        kilometraje: 93800,
        mecanico: 'Carlos Mendoza (#TTM-0842)',
        costo: 165.0,
        repuestos: 'Aceite 15W-40 Castrol CRB, Filtro de Aire y Combustible'
      }
    ]
  },
  {
    id: 'FLEET-03',
    placa: 'A56GH7J',
    marca: 'Toyota',
    modelo: 'Hilux 2.7 4x4 Doble Cabina',
    anio: 2023,
    tipo: 'Pick-Up',
    conductor: 'Andrés Eloy Blanco',
    conductorTelefono: '+58 416 554 9988',
    ultimoServicioFecha: '05 Nov 2026',
    ultimoServicioTipo: 'Cambio de Aceite 5W-30 Sintético y Rotación',
    kilometrajeActual: 51200,
    kilometrajeUltimoServicio: 49800,
    estado: 'AL_DIA',
    fotoUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=500&q=80',
    notas: 'Vehículo de supervisión de operaciones y supervisores de campo.',
    serviciosHistorial: [
      {
        fecha: '05 Nov 2026',
        tipo: 'Servicio 50.000 KM Garantía',
        kilometraje: 49800,
        mecanico: 'Luis Carrillo (#TTM-0901)',
        costo: 110.0,
        repuestos: 'Aceite 5W-30 Motul Full Sintético, Filtro Aceite Genuino Toyota'
      }
    ]
  },
  {
    id: 'FLEET-04',
    placa: 'A78KL9M',
    marca: 'Ford',
    modelo: 'F-350 Tritón V8 5.4L',
    anio: 2019,
    tipo: 'Carga Pesada',
    conductor: 'José Vicente Rangel',
    conductorTelefono: '+58 412 331 4455',
    ultimoServicioFecha: '10 Ago 2026',
    ultimoServicioTipo: 'Cambio de Aceite 20W-50 y Servicio de Bujías',
    kilometrajeActual: 215400,
    kilometrajeUltimoServicio: 209800,
    estado: 'VENCIDO',
    fotoUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=500&q=80',
    notas: 'Carga pesada materiales. Vencido por kilometraje excedido (+5,600 km).',
    serviciosHistorial: [
      {
        fecha: '10 Ago 2026',
        tipo: 'Mantenimiento Mayor Motor V8',
        kilometraje: 209800,
        mecanico: 'Manuel Arrieta (#TTM-0419)',
        costo: 220.0,
        repuestos: 'Aceite 20W-50 Mineral Motorcraft, Juego Bujías Platino, Filtro de Aire'
      }
    ]
  },
  {
    id: 'FLEET-05',
    placa: 'A90NP1Q',
    marca: 'Renault',
    modelo: 'Kangoo Maxi 1.6 16V',
    anio: 2022,
    tipo: 'Utilitario',
    conductor: 'Mariana Duque',
    conductorTelefono: '+58 424 112 8899',
    ultimoServicioFecha: '01 Nov 2026',
    ultimoServicioTipo: 'Cambio de Aceite 10W-40 y Filtro Antipolen',
    kilometrajeActual: 62400,
    kilometrajeUltimoServicio: 61100,
    estado: 'AL_DIA',
    fotoUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=500&q=80',
    notas: 'Despacho exprés urbano y paquetería ligera en Caracas metropolitana.',
    serviciosHistorial: [
      {
        fecha: '01 Nov 2026',
        tipo: 'Mantenimiento Preventivo 60K',
        kilometraje: 61100,
        mecanico: 'Luis Carrillo (#TTM-0901)',
        costo: 85.0,
        repuestos: 'Aceite 10W-40 Elf Evolution, Filtro de Aceite Renault Original'
      }
    ]
  },
  {
    id: 'FLEET-06',
    placa: 'A23RS4T',
    marca: 'Mitsubishi',
    modelo: 'Canter FE 639 Chasis Largo',
    anio: 2020,
    tipo: 'Carga Pesada',
    conductor: 'Héctor Lavoe C.',
    conductorTelefono: '+58 414 990 7766',
    ultimoServicioFecha: '19 Oct 2026',
    ultimoServicioTipo: 'Engrase de Chasis y Cambio de Aceite Diferencial',
    kilometrajeActual: 178900,
    kilometrajeUltimoServicio: 177400,
    estado: 'AL_DIA',
    fotoUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=500&q=80',
    notas: 'Caja térmica refrigerada para traslados de productos lácteos.',
    serviciosHistorial: [
      {
        fecha: '19 Oct 2026',
        tipo: 'Servicio Tren Motriz y Diferencial',
        kilometraje: 177400,
        mecanico: 'Carlos Mendoza (#TTM-0842)',
        costo: 135.0,
        repuestos: 'Aceite 80W-90 GL-5 Valvoline, Grasa Litio Chasis EP-2'
      }
    ]
  }
];

export default function FlotasDashboardPage() {
  // Estado de la Empresa
  const [empresa, setEmpresa] = useState<EmpresaFlota>(EMPRESA_DEFAULT);
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState<boolean>(false);
  const [formEmpresa, setFormEmpresa] = useState<EmpresaFlota>(EMPRESA_DEFAULT);

  // Estado de Vehículos
  const [vehiculos, setVehiculos] = useState<VehiculoFlota[]>(VEHICULOS_FLOTA_INICIAL);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'AL_DIA' | 'PROXIMO' | 'VENCIDO'>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales
  const [modalJornadaOpen, setModalJornadaOpen] = useState<boolean>(false);
  const [modalPasaporteOpen, setModalPasaporteOpen] = useState<boolean>(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<VehiculoFlota | null>(null);

  // Modal Crear / Editar Vehículo
  const [modalVehiculoFormOpen, setModalVehiculoFormOpen] = useState<boolean>(false);
  const [modoVehiculo, setModoVehiculo] = useState<'CREAR' | 'EDITAR'>('CREAR');
  const [vehiculoEnEdicion, setVehiculoEnEdicion] = useState<VehiculoFlota | null>(null);

  // Campos del formulario de vehículo
  const [formPlaca, setFormPlaca] = useState<string>('');
  const [formMarca, setFormMarca] = useState<string>('');
  const [formModelo, setFormModelo] = useState<string>('');
  const [formAnio, setFormAnio] = useState<number>(2023);
  const [formTipo, setFormTipo] = useState<TipoVehiculo>('Carga Pesada');
  const [formConductor, setFormConductor] = useState<string>('');
  const [formConductorTelefono, setFormConductorTelefono] = useState<string>('');
  const [formKmActual, setFormKmActual] = useState<number>(50000);
  const [formKmUltimoServicio, setFormKmUltimoServicio] = useState<number>(45000);
  const [formUltimoServicioFecha, setFormUltimoServicioFecha] = useState<string>('01 Nov 2026');
  const [formUltimoServicioTipo, setFormUltimoServicioTipo] = useState<string>('Mantenimiento Preventivo');
  const [formFotoUrl, setFormFotoUrl] = useState<string>('');
  const [formNotas, setFormNotas] = useState<string>('');

  // Subida de imagen
  const [subiendoFotoVehiculo, setSubiendoFotoVehiculo] = useState<boolean>(false);
  const fileInputVehiculoRef = useRef<HTMLInputElement>(null);

  // Modal Confirmar Eliminación
  const [modalEliminarOpen, setModalEliminarOpen] = useState<boolean>(false);
  const [vehiculoParaEliminar, setVehiculoParaEliminar] = useState<VehiculoFlota | null>(null);

  // Zoom de Foto
  const [fotoZoomUrl, setFotoZoomUrl] = useState<string | null>(null);

  // Estados del modal de Jornada Sabatina
  const [vehiculosParaJornada, setVehiculosParaJornada] = useState<string[]>(['FLEET-01', 'FLEET-04']);
  const [fechaJornada, setFechaJornada] = useState<string>('2026-11-21');
  const [turnoJornada, setTurnoJornada] = useState<'manana' | 'tarde'>('manana');
  const [jornadaConfirmadaToast, setJornadaConfirmadaToast] = useState<string | null>(null);
  const [toastGeneral, setToastGeneral] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState<boolean>(false);

  // Estados de Solicitar Servicio de Flota
  const [modalPedirServicioOpen, setModalPedirServicioOpen] = useState<boolean>(false);
  const [servicioVehiculoId, setServicioVehiculoId] = useState<string>('');
  const [servicioTipo, setServicioTipo] = useState<string>('Mantenimiento Preventivo (Aceite y Filtros)');
  const [servicioDescripcion, setServicioDescripcion] = useState<string>('');
  const [servicioUbicacion, setServicioUbicacion] = useState<string>('');
  const [servicioUrgencia, setServicioUrgencia] = useState<'INMEDIATA' | 'PROGRAMADA'>('INMEDIATA');
  const [enviandoServicioFlota, setEnviandoServicioFlota] = useState<boolean>(false);

  // Carga inicial y persistencia en localStorage
  useEffect(() => {
    try {
      const storedEmpresa = localStorage.getItem('ttm_flota_empresa');
      if (storedEmpresa) {
        const parsed = JSON.parse(storedEmpresa);
        setEmpresa(parsed);
        setFormEmpresa(parsed);
      }
      const storedVehiculos = localStorage.getItem('ttm_flota_vehiculos');
      if (storedVehiculos) {
        const parsedV = JSON.parse(storedVehiculos);
        if (Array.isArray(parsedV) && parsedV.length > 0) {
          setVehiculos(parsedV);
        }
      }
    } catch (e) {
      console.warn('Error leyendo localStorage:', e);
    }
  }, []);

  // Helper para persistir vehículos
  const guardarVehiculosLocal = (nuevos: VehiculoFlota[]) => {
    setVehiculos(nuevos);
    try {
      localStorage.setItem('ttm_flota_vehiculos', JSON.stringify(nuevos));
    } catch (e) {
      console.warn('Error guardando en localStorage:', e);
    }
  };

  // Helper para persistir empresa
  const guardarEmpresaLocal = (nueva: EmpresaFlota) => {
    setEmpresa(nueva);
    try {
      localStorage.setItem('ttm_flota_empresa', JSON.stringify(nueva));
    } catch (e) {
      console.warn('Error guardando en localStorage:', e);
    }
  };

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setToastGeneral({ mensaje, tipo });
    setTimeout(() => setToastGeneral(null), 4000);
  };

  const handleAbrirPedirServicio = (vehiculo?: VehiculoFlota) => {
    if (vehiculo) {
      setServicioVehiculoId(vehiculo.id);
    } else if (vehiculos.length > 0 && !servicioVehiculoId) {
      setServicioVehiculoId(vehiculos[0].id);
    }
    setServicioUbicacion(empresa.direccion);
    setServicioDescripcion('');
    setModalPedirServicioOpen(true);
  };

  const handleConfirmarServicioFlota = async (e: React.FormEvent) => {
    e.preventDefault();
    const vehiculo = vehiculos.find((v) => v.id === servicioVehiculoId) || vehiculos[0];
    if (!vehiculo) {
      mostrarToast('Selecciona un vehículo de tu flota', 'error');
      return;
    }

    setEnviandoServicioFlota(true);
    const nuevaOrdenId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ord_flota_${Date.now()}`;

    const nuevaOrden = {
      id: nuevaOrdenId,
      cliente_nombre: `${empresa.razonSocial} (Flota)`,
      cliente_telefono: vehiculo.conductorTelefono || empresa.telefono,
      vehiculo_marca: vehiculo.marca,
      vehiculo_modelo: `${vehiculo.modelo} [${vehiculo.placa}]`,
      vehiculo_anio: vehiculo.anio,
      falla_reportada: `[FLOTA ${empresa.rif}] ${servicioTipo}: ${servicioDescripcion || 'Revisión y servicio técnico prioritario in situ.'}`,
      sector: servicioUbicacion || empresa.direccion,
      estado: 'LEAD_NUEVO',
      ganancia_estimada: 85.0,
      es_flota: true,
      empresa_flota: empresa.razonSocial,
      placa_flota: vehiculo.placa,
      created_at: new Date().toISOString()
    };

    // 1. Guardar en Supabase tabla ordenes
    try {
      const supabase = createClient();
      const { error } = await supabase.from('ordenes').insert([
        {
          id: nuevaOrden.id,
          cliente_nombre: nuevaOrden.cliente_nombre,
          cliente_telefono: nuevaOrden.cliente_telefono,
          vehiculo_marca: nuevaOrden.vehiculo_marca,
          vehiculo_modelo: nuevaOrden.vehiculo_modelo,
          vehiculo_anio: nuevaOrden.vehiculo_anio,
          falla_reportada: nuevaOrden.falla_reportada,
          sector: nuevaOrden.sector,
          estado: nuevaOrden.estado,
          ganancia_estimada: nuevaOrden.ganancia_estimada
        }
      ]);
      if (error) {
        console.warn('Aviso insertando orden flota en Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error conectando a Supabase ordenes:', err);
    }

    // 2. Persistir localmente para sincronización en tiempo real con el tablero de despacho
    try {
      const raw = localStorage.getItem('ttm_ordenes_flota_recientes');
      const lista = raw ? JSON.parse(raw) : [];
      lista.unshift(nuevaOrden);
      localStorage.setItem('ttm_ordenes_flota_recientes', JSON.stringify(lista));
    } catch (e) {}

    // 3. Añadir al historial del vehículo
    const nuevosVehiculos = vehiculos.map((v) => {
      if (v.id === vehiculo.id) {
        const histActual = v.serviciosHistorial ? [...v.serviciosHistorial] : [];
        histActual.unshift({
          fecha: 'Hoy (Solicitado)',
          tipo: servicioTipo,
          kilometraje: v.kilometrajeActual,
          mecanico: 'Despacho Central TTM (Prioridad B2B)',
          costo: 85.0,
          repuestos: 'En evaluación'
        });
        return {
          ...v,
          estado: 'PROXIMO' as const,
          serviciosHistorial: histActual
        };
      }
      return v;
    });
    guardarVehiculosLocal(nuevosVehiculos);

    setEnviandoServicioFlota(false);
    setModalPedirServicioOpen(false);
    mostrarToast(
      `¡Servicio solicitado para ${vehiculo.placa}! Orden #${nuevaOrdenId.slice(0, 8).toUpperCase()} enviada a Despacho con prioridad B2B.`
    );
  };

  // KPIs
  const totalVehiculos = vehiculos.length;
  const vencidosCount = vehiculos.filter((v) => v.estado === 'VENCIDO').length;
  const proximosCount = vehiculos.filter((v) => v.estado === 'PROXIMO').length;
  const requierenMantenimiento = vencidosCount + proximosCount;
  const gastoDelMes = 1250.0 + (totalVehiculos - 6 > 0 ? (totalVehiculos - 6) * 110 : 0);

  // Filtrado de la tabla
  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((v) => {
      const coincideEstado = filtroEstado === 'TODOS' || v.estado === filtroEstado;
      const term = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !term ||
        v.placa.toLowerCase().includes(term) ||
        v.marca.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term) ||
        v.conductor.toLowerCase().includes(term);
      return coincideEstado && coincideBusqueda;
    });
  }, [vehiculos, filtroEstado, busqueda]);

  // Manejo de Selección de vehículos para Jornada Sabatina
  const toggleSeleccionVehiculo = (id: string) => {
    setVehiculosParaJornada((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const seleccionarTodosLosVencidos = () => {
    const ids = vehiculos.filter((v) => v.estado === 'VENCIDO' || v.estado === 'PROXIMO').map((v) => v.id);
    setVehiculosParaJornada(ids);
  };

  const handleConfirmarJornada = () => {
    if (vehiculosParaJornada.length === 0) {
      alert('Selecciona al menos un vehículo para la jornada de mantenimiento.');
      return;
    }

    setModalJornadaOpen(false);
    setJornadaConfirmadaToast(
      `¡Jornada Sabatina agendada con éxito para ${vehiculosParaJornada.length} unidades el sábado ${fechaJornada}!`
    );
    setTimeout(() => setJornadaConfirmadaToast(null), 5500);
  };

  // Helper para calcular estado del semáforo según kilometraje
  const calcularEstadoSemaforo = (kmActual: number, kmUltimo: number): 'AL_DIA' | 'PROXIMO' | 'VENCIDO' => {
    const dif = kmActual - kmUltimo;
    if (dif >= 5000) return 'VENCIDO';
    if (dif >= 4000) return 'PROXIMO';
    return 'AL_DIA';
  };

  // Subida de foto a Supabase Storage (bucket evidencias)
  const handleSubirFotoVehiculo = async (file: File) => {
    setSubiendoFotoVehiculo(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanPlaca = formPlaca.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'VEH';
      const fileName = `flota_${cleanPlaca}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('evidencias')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('evidencias')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        setFormFotoUrl(publicUrlData.publicUrl);
        mostrarToast('✓ Foto del vehículo subida con éxito');
      } else {
        // Fallback local
        const localUrl = URL.createObjectURL(file);
        setFormFotoUrl(localUrl);
        mostrarToast('✓ Foto cargada localmente');
      }
    } catch (err: any) {
      console.warn('Subiendo con fallback local por error en storage:', err);
      const localUrl = URL.createObjectURL(file);
      setFormFotoUrl(localUrl);
      mostrarToast('✓ Foto cargada (modo local)');
    } finally {
      setSubiendoFotoVehiculo(false);
    }
  };

  // Abrir Modal para Crear Vehículo
  const handleAbrirCrearVehiculo = () => {
    setModoVehiculo('CREAR');
    setVehiculoEnEdicion(null);
    setFormPlaca('');
    setFormMarca('');
    setFormModelo('');
    setFormAnio(2023);
    setFormTipo('Carga Pesada');
    setFormConductor('');
    setFormConductorTelefono('+58 ');
    setFormKmActual(50000);
    setFormKmUltimoServicio(45000);
    setFormUltimoServicioFecha('Noviembre 2026');
    setFormUltimoServicioTipo('Mantenimiento Preventivo General');
    setFormFotoUrl('');
    setFormNotas('');
    setModalVehiculoFormOpen(true);
  };

  // Abrir Modal para Editar Vehículo
  const handleAbrirEditarVehiculo = (vehiculo: VehiculoFlota) => {
    setModoVehiculo('EDITAR');
    setVehiculoEnEdicion(vehiculo);
    setFormPlaca(vehiculo.placa);
    setFormMarca(vehiculo.marca);
    setFormModelo(vehiculo.modelo);
    setFormAnio(vehiculo.anio);
    setFormTipo(vehiculo.tipo);
    setFormConductor(vehiculo.conductor);
    setFormConductorTelefono(vehiculo.conductorTelefono);
    setFormKmActual(vehiculo.kilometrajeActual);
    setFormKmUltimoServicio(vehiculo.kilometrajeUltimoServicio);
    setFormUltimoServicioFecha(vehiculo.ultimoServicioFecha);
    setFormUltimoServicioTipo(vehiculo.ultimoServicioTipo);
    setFormFotoUrl(vehiculo.fotoUrl || '');
    setFormNotas(vehiculo.notas || '');
    setModalVehiculoFormOpen(true);
  };

  // Guardar Vehículo (Crear o Editar)
  const handleGuardarVehiculo = (e: React.FormEvent) => {
    e.preventDefault();

    const placaLimpia = formPlaca.trim().toUpperCase();
    if (!placaLimpia || !formMarca.trim() || !formModelo.trim()) {
      mostrarToast('Por favor completa la Placa, Marca y Modelo.', 'error');
      return;
    }

    const estadoCalculado = calcularEstadoSemaforo(formKmActual, formKmUltimoServicio);

    if (modoVehiculo === 'CREAR') {
      const nuevoId = `FLEET-${Date.now().toString().slice(-4)}`;
      const nuevoVehiculo: VehiculoFlota = {
        id: nuevoId,
        placa: placaLimpia,
        marca: formMarca.trim(),
        modelo: formModelo.trim(),
        anio: Number(formAnio) || 2023,
        tipo: formTipo,
        conductor: formConductor.trim() || 'Sin conductor asignado',
        conductorTelefono: formConductorTelefono.trim() || 'N/A',
        kilometrajeActual: Number(formKmActual) || 0,
        kilometrajeUltimoServicio: Number(formKmUltimoServicio) || 0,
        ultimoServicioFecha: formUltimoServicioFecha.trim() || 'Reciente',
        ultimoServicioTipo: formUltimoServicioTipo.trim() || 'Revisión General de Flota',
        estado: estadoCalculado,
        fotoUrl: formFotoUrl || 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=500&q=80',
        notas: formNotas.trim() || 'Unidad incorporada al sistema de flota.',
        serviciosHistorial: [
          {
            fecha: formUltimoServicioFecha.trim() || 'Nov 2026',
            tipo: formUltimoServicioTipo.trim() || 'Ingreso de Unidad a Flota',
            kilometraje: Number(formKmUltimoServicio) || 0,
            mecanico: 'TuTallerMóvil Flotas (#TTM-B2B)',
            costo: 95.0,
            repuestos: 'Inspección multipunto inicial y diagnóstico computarizado'
          }
        ]
      };

      const listaActualizada = [nuevoVehiculo, ...vehiculos];
      guardarVehiculosLocal(listaActualizada);
      mostrarToast(`¡Vehículo ${placaLimpia} agregado a la flota con éxito!`);
    } else if (modoVehiculo === 'EDITAR' && vehiculoEnEdicion) {
      const listaActualizada = vehiculos.map((v) => {
        if (v.id === vehiculoEnEdicion.id) {
          return {
            ...v,
            placa: placaLimpia,
            marca: formMarca.trim(),
            modelo: formModelo.trim(),
            anio: Number(formAnio) || v.anio,
            tipo: formTipo,
            conductor: formConductor.trim() || v.conductor,
            conductorTelefono: formConductorTelefono.trim() || v.conductorTelefono,
            kilometrajeActual: Number(formKmActual) || v.kilometrajeActual,
            kilometrajeUltimoServicio: Number(formKmUltimoServicio) || v.kilometrajeUltimoServicio,
            ultimoServicioFecha: formUltimoServicioFecha.trim() || v.ultimoServicioFecha,
            ultimoServicioTipo: formUltimoServicioTipo.trim() || v.ultimoServicioTipo,
            estado: estadoCalculado,
            fotoUrl: formFotoUrl || v.fotoUrl,
            notas: formNotas.trim()
          };
        }
        return v;
      });

      guardarVehiculosLocal(listaActualizada);

      // Si el vehículo editado estaba abierto en el pasaporte, actualizarlo
      if (vehiculoSeleccionado?.id === vehiculoEnEdicion.id) {
        setVehiculoSeleccionado({
          ...vehiculoSeleccionado,
          placa: placaLimpia,
          marca: formMarca.trim(),
          modelo: formModelo.trim(),
          anio: Number(formAnio) || vehiculoSeleccionado.anio,
          tipo: formTipo,
          conductor: formConductor.trim() || vehiculoSeleccionado.conductor,
          conductorTelefono: formConductorTelefono.trim() || vehiculoSeleccionado.conductorTelefono,
          kilometrajeActual: Number(formKmActual) || vehiculoSeleccionado.kilometrajeActual,
          kilometrajeUltimoServicio: Number(formKmUltimoServicio) || vehiculoSeleccionado.kilometrajeUltimoServicio,
          estado: estadoCalculado,
          fotoUrl: formFotoUrl || vehiculoSeleccionado.fotoUrl,
          notas: formNotas.trim()
        });
      }

      mostrarToast(`¡Datos del vehículo ${placaLimpia} actualizados exitosamente!`);
    }

    setModalVehiculoFormOpen(false);
  };

  // Confirmar y Ejecutar Eliminación de Unidad
  const handleEliminarVehiculoConfirmado = () => {
    if (!vehiculoParaEliminar) return;
    const listaActualizada = vehiculos.filter((v) => v.id !== vehiculoParaEliminar.id);
    guardarVehiculosLocal(listaActualizada);
    mostrarToast(`Unidad ${vehiculoParaEliminar.placa} desincorporada de la flota.`);
    setModalEliminarOpen(false);
    setVehiculoParaEliminar(null);
    if (modalPasaporteOpen && vehiculoSeleccionado?.id === vehiculoParaEliminar.id) {
      setModalPasaporteOpen(false);
    }
  };

  // Guardar Datos de la Empresa
  const handleGuardarDatosEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpresa.razonSocial.trim() || !formEmpresa.rif.trim()) {
      mostrarToast('Ingresa la Razón Social y el RIF de la empresa.', 'error');
      return;
    }
    guardarEmpresaLocal(formEmpresa);
    mostrarToast('¡Datos de la empresa guardados correctamente!');
    setModalEmpresaOpen(false);
  };

  // 4. Generación de Factura Quincenal en PDF con jsPDF + AutoTable
  const handleDescargarFacturaPDF = () => {
    setGenerandoPdf(true);
    try {
      const doc = new jsPDF();

      // Colores corporativos TTM
      const azulCobalto = [30, 86, 176];
      const grisOscuro = [10, 21, 37];
      const verdeLima = [204, 255, 0];

      // 1. Encabezado Corporativo
      doc.setFillColor(grisOscuro[0], grisOscuro[1], grisOscuro[2]);
      doc.rect(0, 0, 210, 38, 'F');

      // Franja de Acento Verde Lima
      doc.setFillColor(verdeLima[0], verdeLima[1], verdeLima[2]);
      doc.rect(0, 38, 210, 3, 'F');

      // Título y Marca
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('TuTallerMovil', 14, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(204, 255, 0);
      doc.text('RED B2B CORPORATIVA & LOGÍSTICA DE FLOTAS', 14, 27);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('FACTURA PROFORMA CONSOLIDADA', 130, 16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('N° TTM-B2B-2026-11Q1', 130, 23);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Periodo: 01 Nov 2026 — 15 Nov 2026', 130, 29);

      // 2. Datos del Cliente B2B
      doc.setTextColor(grisOscuro[0], grisOscuro[1], grisOscuro[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('DATOS DE LA EMPRESA CLIENTE:', 14, 50);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Razón Social: ${empresa.razonSocial}`, 14, 57);
      doc.text(`RIF: ${empresa.rif}`, 14, 63);
      doc.text(`Dirección: ${empresa.direccion}`, 14, 69);
      doc.text(`Contacto: ${empresa.contacto} (${empresa.telefono})`, 14, 75);

      // Cuadro de Resumen Quincenal a la derecha
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(120, 46, 76, 32, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('RESUMEN DE FLOTA B2B', 126, 53);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Total Unidades Registradas: ${totalVehiculos}`, 126, 60);
      doc.text(`Unidades con Mantenimiento: ${requierenMantenimiento}`, 126, 66);
      doc.text(`Tasa de Disponibilidad Operativa: 96.4%`, 126, 72);

      // 3. Tabla Consolidada de Unidades con AutoTable
      const tableData = vehiculos.map((v) => [
        v.placa,
        `${v.marca} ${v.modelo} (${v.anio})`,
        v.tipo,
        v.conductor,
        `${v.kilometrajeActual.toLocaleString()} km`,
        v.estado === 'AL_DIA' ? 'Al Día' : v.estado === 'PROXIMO' ? 'Próximo' : 'Vencido',
        v.ultimoServicioFecha
      ]);

      autoTable(doc, {
        startY: 84,
        head: [['Placa', 'Vehículo / Modelo', 'Tipo', 'Conductor Asignado', 'Odómetro', 'Semáforo', 'Últ. Servicio']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [10, 21, 37],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          5: { fontStyle: 'bold' }
        }
      });

      // Guardar PDF
      const cleanRif = empresa.rif.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Factura_Flotas_TTM_${cleanRif}.pdf`);
      mostrarToast('✓ Factura Proforma descargada en PDF');
    } catch (error) {
      console.error('Error generando PDF:', error);
      mostrarToast('Hubo un error al generar el PDF.', 'error');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525] pb-20">
      
      {/* ======================================================== */}
      {/* 1. NAVBAR SUPERIOR CORPORATIVO                           */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo y Badge B2B */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/icon.svg"
                alt="TuTallerMóvil"
                className="h-[45px] w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#0A1525] text-[#CCFF00] px-2 py-0.5 rounded-md border border-slate-700">
                Flotas B2B
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Gestión Integral de Mantenimiento Móvil In Situ
            </span>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2">
            {/* Botón Registrar/Editar Empresa */}
            <button
              type="button"
              onClick={() => {
                setFormEmpresa(empresa);
                setModalEmpresaOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A1525] bg-white border border-[#CBD5E1] hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Registrar o editar datos de la empresa cliente"
            >
              <Building2 className="w-3.5 h-3.5 text-[#1E56B0]" />
              <span className="hidden sm:inline">Perfil Empresa</span>
            </button>

            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0A1525]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Flota Conectada</span>
            </div>
          </div>

        </div>
      </header>

      {/* Alerta flotante general */}
      <AnimatePresence>
        {toastGeneral && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 inset-x-0 z-50 max-w-md mx-auto px-4"
          >
            <div className={`p-4 rounded-2xl shadow-xl flex items-center justify-between border-2 ${
              toastGeneral.tipo === 'exito'
                ? 'bg-[#0A1525] text-white border-[#CCFF00]'
                : 'bg-rose-900 text-white border-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                {toastGeneral.tipo === 'exito' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className="text-xs font-bold">{toastGeneral.mensaje}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastGeneral(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {jornadaConfirmadaToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 inset-x-0 z-50 max-w-lg mx-auto px-4"
          >
            <div className="bg-[#0A1525] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border-2 border-[#CCFF00]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
                <span className="text-xs font-bold">{jornadaConfirmadaToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setJornadaConfirmadaToast(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6 flex-1">

        {/* ======================================================== */}
        {/* 2. HEADER DE LA EMPRESA (Bento Card Principal)          */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Información Corporativa */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-[#1E56B0] border border-blue-200">
                Cuenta Corporativa Premium B2B
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold text-slate-500 bg-slate-100">
                {empresa.sector}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-[#0A1525] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <Building2 className="w-7 h-7 text-[#CCFF00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                    {empresa.razonSocial}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setFormEmpresa(empresa);
                      setModalEmpresaOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1E56B0] hover:bg-slate-100 transition-colors"
                    title="Editar datos de la empresa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  RIF: <strong className="text-[#0A1525] font-mono">{empresa.rif}</strong> • {empresa.direccion}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Contacto: {empresa.contacto} • {empresa.telefono} • {empresa.correo}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones Corporativas Destacadas */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-10">
            
            {/* Botón Descargar Factura Quincenal PDF */}
            <button
              type="button"
              disabled={generandoPdf}
              onClick={handleDescargarFacturaPDF}
              className="h-12 px-4.5 rounded-2xl bg-white hover:bg-[#F8FAFC] text-[#0A1525] hover:text-[#1E56B0] border border-[#CBD5E1] text-xs font-black flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Descargar proforma consolidada con jsPDF"
            >
              <FileDown className="w-4 h-4 text-[#1E56B0]" />
              <span>{generandoPdf ? 'Generando PDF...' : 'Factura Quincenal (PDF)'}</span>
            </button>

            {/* Botón Destacado: Pedir un Servicio de Flota */}
            <button
              type="button"
              onClick={() => handleAbrirPedirServicio()}
              className="h-12 px-5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-lime-500/20 transition-all cursor-pointer active:scale-95 border border-[#0A1525]/10"
              title="Solicitar servicio técnico inmediato o correctivo para un vehículo de la flota"
            >
              <Wrench className="w-4 h-4 text-[#0A1525]" />
              <span>Pedir un Servicio</span>
            </button>

            {/* Botón Principal: Agendar Jornada Sabatina */}
            <button
              type="button"
              onClick={() => setModalJornadaOpen(true)}
              className="h-12 px-5 rounded-2xl bg-[#0A1525] hover:bg-slate-800 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4 text-[#CCFF00]" />
              <span>Agendar Jornada</span>
            </button>

            {/* Botón Destacado: Agregar Unidad a la Flota */}
            <button
              type="button"
              onClick={handleAbrirCrearVehiculo}
              className="h-12 px-5 rounded-2xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#CCFF00] stroke-[3]" />
              <span>+ Agregar Vehículo</span>
            </button>

          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. KPIS DE LA FLOTA (Fila Superior - Bento Grid)        */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* KPI 1: Total Vehículos */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Total Unidades Monitoreadas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#0A1525] font-mono">
                  {totalVehiculos}
                </span>
                <span className="text-xs font-bold text-slate-500">unidades en sistema</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 pt-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>100% con Pasaporte Digital TTM</span>
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center shrink-0">
              <Truck className="w-7 h-7" />
            </div>
          </div>

          {/* KPI 2: Requieren Mantenimiento (Semáforo Alert) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 block">
                Requieren Mantenimiento
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-600 font-mono">
                  {requierenMantenimiento}
                </span>
                <span className="text-xs font-bold text-slate-500">en semáforo de alerta</span>
              </div>
              <span className="text-[11px] text-rose-700 font-extrabold flex items-center gap-1 pt-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{vencidosCount} Vencidos • {proximosCount} Próximos</span>
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
            </div>
          </div>

          {/* KPI 3: Gasto del Mes */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Gasto Acumulado del Mes
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#0A1525] font-mono">
                  ${gastoDelMes.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Tarifa B2B Preferencial TuTallerMóvil</span>
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>

        </section>

        {/* ======================================================== */}
        {/* 4. TABLA DE VEHÍCULOS: EL SEMÁFORO DE MANTENIMIENTO     */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
          
          {/* Cabecera, Búsqueda y Botón Añadir */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0A1525] tracking-tight">
                  Estado Operativo de las Unidades
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {vehiculosFiltrados.length} de {totalVehiculos}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Semáforo predictivo según kilometraje transcurrido. Puedes editar o agregar fotos a cada vehículo.
              </p>
            </div>

            {/* Barra de Filtros, Búsqueda y Botón */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              
              {/* Buscador */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar placa, modelo, chofer..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-[#0A1525] focus:outline-none focus:border-[#1E56B0] bg-[#F8FAFC]"
                />
              </div>

              {/* Filtros Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFiltroEstado('TODOS')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filtroEstado === 'TODOS' ? 'bg-white text-[#0A1525] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado('AL_DIA')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    filtroEstado === 'AL_DIA' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>Al Día</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado('PROXIMO')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    filtroEstado === 'PROXIMO' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span>Próximos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado('VENCIDO')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    filtroEstado === 'VENCIDO' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  <span>Vencidos</span>
                </button>
              </div>

              {/* Botón Rápido + Agregar Unidad */}
              <button
                type="button"
                onClick={handleAbrirCrearVehiculo}
                className="h-9 px-3 rounded-xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span className="hidden sm:inline">Nueva Unidad</span>
              </button>

            </div>
          </div>

          {/* Tabla de Unidades */}
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5 sm:px-6">Unidad / Foto</th>
                  <th className="py-3 px-4">Marca / Modelo</th>
                  <th className="py-3 px-4">Conductor Asignado</th>
                  <th className="py-3 px-4">Último Servicio</th>
                  <th className="py-3 px-4 text-right">Odómetro Actual</th>
                  <th className="py-3 px-4 text-center">Semáforo</th>
                  <th className="py-3 px-5 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehiculosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-sm text-[#0A1525]">No se encontraron vehículos</p>
                      <p className="text-xs text-slate-500 mt-1">Prueba con otro término de búsqueda o agrega una nueva unidad.</p>
                      <button
                        type="button"
                        onClick={handleAbrirCrearVehiculo}
                        className="mt-3 px-4 py-2 rounded-xl bg-[#1E56B0] text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Agregar Vehículo Ahora</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  vehiculosFiltrados.map((vehiculo) => {
                    const difKm = vehiculo.kilometrajeActual - vehiculo.kilometrajeUltimoServicio;

                    return (
                      <tr
                        key={vehiculo.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* Foto y Placa */}
                        <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {/* Thumbnail con Zoom */}
                            <div
                              onClick={() => vehiculo.fotoUrl && setFotoZoomUrl(vehiculo.fotoUrl)}
                              className="w-12 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative group/foto cursor-pointer flex items-center justify-center shadow-2xs"
                              title={vehiculo.fotoUrl ? 'Clic para ver foto en grande' : 'Sin foto'}
                            >
                              {vehiculo.fotoUrl ? (
                                <>
                                  <img
                                    src={vehiculo.fotoUrl}
                                    alt={vehiculo.placa}
                                    className="w-full h-full object-cover group-hover/foto:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/foto:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                  </div>
                                </>
                              ) : (
                                <Car className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            {/* Placa con Diseño Matrícula */}
                            <div className="inline-flex flex-col items-center bg-white border border-[#0A1525]/30 rounded-lg px-2.5 py-1 shadow-2xs">
                              <span className="text-[8px] font-black text-slate-400 tracking-widest leading-none">
                                VENEZUELA
                              </span>
                              <span className="font-mono text-xs font-black text-[#0A1525] tracking-wider">
                                {vehiculo.placa}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Marca / Modelo */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-black text-[#0A1525] text-xs block">
                              {vehiculo.marca} {vehiculo.modelo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Año {vehiculo.anio} • {vehiculo.tipo}
                            </span>
                          </div>
                        </td>

                        {/* Conductor Asignado */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0A1525] block">
                              {vehiculo.conductor}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {vehiculo.conductorTelefono}
                            </span>
                          </div>
                        </td>

                        {/* Último Servicio */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 max-w-[190px]">
                            <span className="font-bold text-slate-700 text-[11px] block truncate">
                              {vehiculo.ultimoServicioTipo}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{vehiculo.ultimoServicioFecha}</span>
                            </span>
                          </div>
                        </td>

                        {/* Kilometraje Actual */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-mono font-black text-[#0A1525] text-xs block">
                              {vehiculo.kilometrajeActual.toLocaleString()} km
                            </span>
                            <span className="text-[10px] text-slate-400">
                              +{difKm.toLocaleString()} km desde últ.
                            </span>
                          </div>
                        </td>

                        {/* El Semáforo */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {vehiculo.estado === 'AL_DIA' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                              <span>Al día</span>
                            </span>
                          ) : vehiculo.estado === 'PROXIMO' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                              <span>Próximo (+4,000 km)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-800 border border-rose-300">
                              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                              <span>Vencido (Requiere servicio)</span>
                            </span>
                          )}
                        </td>

                        {/* Acciones: Pedir Servicio, Pasaporte, Editar, Eliminar */}
                        <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Pedir Servicio para este vehículo */}
                            <button
                              type="button"
                              onClick={() => handleAbrirPedirServicio(vehiculo)}
                              className="h-8 px-2.5 rounded-xl bg-blue-50 hover:bg-[#1E56B0] text-[#1E56B0] hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs border border-blue-200"
                              title="Solicitar servicio técnico prioritario para esta unidad"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Pedir Servicio</span>
                            </button>

                            {/* Ver Pasaporte */}
                            <button
                              type="button"
                              onClick={() => {
                                setVehiculoSeleccionado(vehiculo);
                                setModalPasaporteOpen(true);
                              }}
                              className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-[#0A1525] text-slate-700 hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs group-hover:bg-[#1E56B0] group-hover:text-white"
                              title="Ver pasaporte técnico e historial"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                              <span className="hidden md:inline">Pasaporte</span>
                            </button>

                            {/* Editar Unidad */}
                            <button
                              type="button"
                              onClick={() => handleAbrirEditarVehiculo(vehiculo)}
                              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Editar datos y foto del vehículo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Eliminar Unidad */}
                            <button
                              type="button"
                              onClick={() => {
                                setVehiculoParaEliminar(vehiculo);
                                setModalEliminarOpen(true);
                              }}
                              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                              title="Desincorporar vehículo de la flota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </section>

      </main>

      {/* ======================================================== */}
      {/* MODAL: REGISTRAR / EDITAR EMPRESA CLIENTE                */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalEmpresaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-5 border border-[#E2E8F0] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalEmpresaOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0A1525] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <Building2 className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                    Datos de la Empresa de Flota
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura la información fiscal y operativa de tu cuenta corporativa.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGuardarDatosEmpresa} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Razón Social / Nombre Comercial *</label>
                    <input
                      type="text"
                      required
                      value={formEmpresa.razonSocial}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, razonSocial: e.target.value })}
                      placeholder="Ej. Logística El Este C.A."
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">RIF / ID Fiscal *</label>
                    <input
                      type="text"
                      required
                      value={formEmpresa.rif}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, rif: e.target.value.toUpperCase() })}
                      placeholder="Ej. J-12345678-9"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Sector / Industria</label>
                    <input
                      type="text"
                      value={formEmpresa.sector}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, sector: e.target.value })}
                      placeholder="Ej. Alimentos, Carga, Farmacéutico"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Persona de Contacto</label>
                    <input
                      type="text"
                      value={formEmpresa.contacto}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, contacto: e.target.value })}
                      placeholder="Ej. Carlos Mendoza (Gerente)"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Teléfono Móvil</label>
                    <input
                      type="text"
                      value={formEmpresa.telefono}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, telefono: e.target.value })}
                      placeholder="+58 412 123 4567"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Correo Electrónico Corporativo</label>
                    <input
                      type="email"
                      value={formEmpresa.correo}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, correo: e.target.value })}
                      placeholder="flotas@empresa.com"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Dirección de Base / Galpón de Operaciones</label>
                    <input
                      type="text"
                      value={formEmpresa.direccion}
                      onChange={(e) => setFormEmpresa({ ...formEmpresa, direccion: e.target.value })}
                      placeholder="Zona Industrial Los Ruices, Galpón 4B, Caracas"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalEmpresaOpen(false)}
                    className="h-11 px-5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Guardar Datos de Empresa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: AGREGAR / EDITAR VEHÍCULO                         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalVehiculoFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 space-y-5 border border-[#E2E8F0] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalVehiculoFormOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1E56B0] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  {modoVehiculo === 'CREAR' ? (
                    <Plus className="w-6 h-6 text-[#CCFF00] stroke-[3]" />
                  ) : (
                    <Edit3 className="w-6 h-6 text-[#CCFF00]" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                    {modoVehiculo === 'CREAR' ? 'Agregar Nueva Unidad a la Flota' : `Editar Unidad #${formPlaca}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ingresa los datos del vehículo, conductor, kilometraje y sube una fotografía.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGuardarVehiculo} className="space-y-4">
                
                {/* 1. SECCIÓN: FOTO DE LA UNIDAD */}
                <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0A1525] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#1E56B0]" />
                      <span>Fotografía del Vehículo</span>
                    </span>
                    {formFotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormFotoUrl('')}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputVehiculoRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSubirFotoVehiculo(file);
                    }}
                  />

                  <div className="flex items-center gap-4">
                    {/* Preview de la foto */}
                    <div className="w-24 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
                      {subiendoFotoVehiculo ? (
                        <div className="flex flex-col items-center gap-1 text-[10px] text-slate-500">
                          <Loader2 className="w-5 h-5 text-[#1E56B0] animate-spin" />
                          <span>Subiendo...</span>
                        </div>
                      ) : formFotoUrl ? (
                        <img
                          src={formFotoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <button
                        type="button"
                        disabled={subiendoFotoVehiculo}
                        onClick={() => fileInputVehiculoRef.current?.click()}
                        className="h-10 px-4 rounded-xl bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0A1525] text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#1E56B0]" />
                        <span>{formFotoUrl ? 'Cambiar Fotografía' : 'Subir Foto desde tu Equipo'}</span>
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Formatos JPG, PNG o WEBP. Se guardará vinculada a la ficha de la flota.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN: DATOS BÁSICOS DEL VEHÍCULO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  
                  {/* Placa */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Placa / Matrícula *</label>
                    <input
                      type="text"
                      required
                      value={formPlaca}
                      onChange={(e) => setFormPlaca(e.target.value.toUpperCase())}
                      placeholder="Ej. A12BC3D"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-mono font-bold"
                    />
                  </div>

                  {/* Marca */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Marca *</label>
                    <input
                      type="text"
                      required
                      value={formMarca}
                      onChange={(e) => setFormMarca(e.target.value)}
                      placeholder="Ej. Iveco, Toyota, Ford"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-semibold"
                    />
                  </div>

                  {/* Modelo */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={formModelo}
                      onChange={(e) => setFormModelo(e.target.value)}
                      placeholder="Ej. Daily 70C16, Hilux"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-semibold"
                    />
                  </div>

                  {/* Año */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Año *</label>
                    <input
                      type="number"
                      min={1990}
                      max={2030}
                      value={formAnio}
                      onChange={(e) => setFormAnio(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>

                  {/* Tipo de Vehículo */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Categoría / Tipo de Flota *</label>
                    <select
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value as TipoVehiculo)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-medium"
                    >
                      <option value="Carga Pesada">Carga Pesada (Camiones, Gandolas, NPR)</option>
                      <option value="Carga Ligera">Carga Ligera (Furgón, Van)</option>
                      <option value="Pick-Up">Pick-Up 4x4 / 4x2</option>
                      <option value="Utilitario">Utilitario / Paquetería Urbana</option>
                      <option value="Van de Pasajeros">Van de Pasajeros / Traslado Personal</option>
                    </select>
                  </div>
                </div>

                {/* 3. SECCIÓN: CONDUCTOR ASIGNADO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Chofer / Conductor Asignado</label>
                    <input
                      type="text"
                      value={formConductor}
                      onChange={(e) => setFormConductor(e.target.value)}
                      placeholder="Nombre y Apellido del Chofer"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#0A1525]">Teléfono del Conductor</label>
                    <input
                      type="text"
                      value={formConductorTelefono}
                      onChange={(e) => setFormConductorTelefono(e.target.value)}
                      placeholder="+58 412 123 4567"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0] font-mono"
                    />
                  </div>
                </div>

                {/* 4. SECCIÓN: KILOMETRAJE Y SEMÁFORO */}
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3 text-xs">
                  <span className="font-black text-[#1E56B0] uppercase tracking-wider block">
                    Odómetro y Mantenimiento Predictivo
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-[#0A1525]">Kilometraje Actual (KM) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formKmActual}
                        onChange={(e) => setFormKmActual(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-blue-200 bg-white font-mono font-bold focus:outline-none focus:border-[#1E56B0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#0A1525]">KM en Último Servicio *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formKmUltimoServicio}
                        onChange={(e) => setFormKmUltimoServicio(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-blue-200 bg-white font-mono font-bold focus:outline-none focus:border-[#1E56B0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#0A1525]">Fecha del Último Servicio</label>
                      <input
                        type="text"
                        value={formUltimoServicioFecha}
                        onChange={(e) => setFormUltimoServicioFecha(e.target.value)}
                        placeholder="Ej. 15 Oct 2026"
                        className="w-full h-10 px-3 rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-[#1E56B0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#0A1525]">Tipo del Último Servicio</label>
                      <input
                        type="text"
                        value={formUltimoServicioTipo}
                        onChange={(e) => setFormUltimoServicioTipo(e.target.value)}
                        placeholder="Ej. Cambio de Aceite 15W-40"
                        className="w-full h-10 px-3 rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-[#1E56B0]"
                      />
                    </div>
                  </div>

                  {/* Cálculo en vivo del semáforo */}
                  {(() => {
                    const dif = formKmActual - formKmUltimoServicio;
                    const semaforo = calcularEstadoSemaforo(formKmActual, formKmUltimoServicio);
                    return (
                      <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-[11px] font-bold">
                        <span>Kilómetros recorridos desde último servicio: <strong className="font-mono font-black text-[#0A1525]">+{dif.toLocaleString()} km</strong></span>
                        <span className={`px-2.5 py-0.5 rounded-full ${
                          semaforo === 'AL_DIA' ? 'bg-emerald-100 text-emerald-800' :
                          semaforo === 'PROXIMO' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Semáforo: {semaforo === 'AL_DIA' ? '✓ Al Día' : semaforo === 'PROXIMO' ? '⚠ Próximo (+4,000 km)' : '✕ Vencido (+5,000 km)'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* 5. SECCIÓN: NOTAS */}
                <div className="space-y-1 text-xs">
                  <label className="font-extrabold text-[#0A1525]">Notas u Observaciones Operativas</label>
                  <textarea
                    rows={2}
                    value={formNotas}
                    onChange={(e) => setFormNotas(e.target.value)}
                    placeholder="Ej. Asignado a ruta oriente, requiere revisión de bujes en próxima parada..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1E56B0]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalVehiculoFormOpen(false)}
                    className="h-11 px-5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-[#1E56B0] hover:bg-[#15448c] text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-[#CCFF00] stroke-[3]" />
                    <span>{modoVehiculo === 'CREAR' ? 'Agregar a la Flota' : 'Guardar Cambios'}</span>
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN DE VEHÍCULO                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalEliminarOpen && vehiculoParaEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 border border-rose-200 shadow-2xl relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0A1525]">¿Desincorporar Unidad?</h3>
                <p className="text-xs text-slate-500">
                  ¿Estás seguro de que deseas eliminar el vehículo <strong className="font-mono text-[#0A1525]">{vehiculoParaEliminar.placa}</strong> ({vehiculoParaEliminar.marca} {vehiculoParaEliminar.modelo}) de la flota activa?
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalEliminarOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEliminarVehiculoConfirmado}
                  className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors shadow-sm"
                >
                  Sí, Desincorporar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: VISOR DE FOTO EN PANTALLA COMPLETA                */}
      {/* ======================================================== */}
      <AnimatePresence>
        {fotoZoomUrl && (
          <div
            onClick={() => setFotoZoomUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          >
            <div className="relative max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setFotoZoomUrl(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={fotoZoomUrl}
                alt="Foto Vehículo Ampliada"
                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 1: AGENDAR JORNADA SABATINA CORPORATIVA            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalJornadaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 space-y-5 border border-[#E2E8F0] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalJornadaOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera Modal */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1E56B0] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <Calendar className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                    Agendar Jornada Sabatina In Situ
                  </h3>
                  <p className="text-xs text-slate-500">
                    Despacho de brigada mecánica oficial a tus galpones para mantenimiento masivo de flota.
                  </p>
                </div>
              </div>

              {/* Configuración de Fecha y Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-2xl text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#0A1525] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Fecha de la Jornada (Sábado):</span>
                  </label>
                  <input
                    type="date"
                    value={fechaJornada}
                    onChange={(e) => setFechaJornada(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-mono font-bold text-[#0A1525] focus:outline-none focus:border-[#1E56B0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0A1525] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1E56B0]" />
                    <span>Turno Preferido:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-10">
                    <button
                      type="button"
                      onClick={() => setTurnoJornada('manana')}
                      className={`rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        turnoJornada === 'manana'
                          ? 'bg-[#1E56B0] text-white border-[#1E56B0] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Mañana (8am - 1pm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurnoJornada('tarde')}
                      className={`rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        turnoJornada === 'tarde'
                          ? 'bg-[#1E56B0] text-white border-[#1E56B0] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Tarde (1pm - 6pm)
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Selección de Vehículos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0A1525] uppercase tracking-wider">
                    Selecciona las unidades a intervenir ({vehiculosParaJornada.length} seleccionadas):
                  </span>
                  <button
                    type="button"
                    onClick={seleccionarTodosLosVencidos}
                    className="text-xs font-bold text-[#1E56B0] hover:underline cursor-pointer"
                  >
                    Seleccionar Vencidos / Próximos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {vehiculos.map((v) => {
                    const isSelected = vehiculosParaJornada.includes(v.id);

                    return (
                      <div
                        key={v.id}
                        onClick={() => toggleSeleccionVehiculo(v.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-[#1E56B0] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-[#1E56B0] border-[#1E56B0] text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-[#0A1525] block">
                              {v.placa} • {v.modelo}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Chofer: {v.conductor}
                            </span>
                          </div>
                        </div>

                        <div>
                          {v.estado === 'VENCIDO' && (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Vencido
                            </span>
                          )}
                          {v.estado === 'PROXIMO' && (
                            <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Próximo
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Confirmación */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmarJornada}
                  className="flex-1 h-13 bg-[#1E56B0] hover:bg-[#0A1525] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4 text-[#CCFF00]" />
                  <span>Confirmar Jornada para {vehiculosParaJornada.length} Unidades</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalJornadaOpen(false)}
                  className="h-13 px-5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: PASAPORTE TÉCNICO E HISTORIAL DEL VEHÍCULO      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalPasaporteOpen && vehiculoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 space-y-5 border border-[#E2E8F0] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalPasaporteOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Pasaporte con Foto */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
                <div className="flex items-center gap-3.5">
                  {/* Foto destacada */}
                  <div
                    onClick={() => vehiculoSeleccionado.fotoUrl && setFotoZoomUrl(vehiculoSeleccionado.fotoUrl)}
                    className="w-16 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer shadow-sm relative group"
                  >
                    {vehiculoSeleccionado.fotoUrl ? (
                      <>
                        <img
                          src={vehiculoSeleccionado.fotoUrl}
                          alt={vehiculoSeleccionado.placa}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Pasaporte Digital TuTallerMóvil
                      </span>
                      <span className="font-mono text-xs font-black text-[#1E56B0] bg-slate-100 px-2 py-0.5 rounded-md">
                        {vehiculoSeleccionado.placa}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#0A1525] tracking-tight mt-0.5">
                      {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}
                    </h3>
                  </div>
                </div>

                {/* Botón Editar esta Unidad desde el Pasaporte */}
                <button
                  type="button"
                  onClick={() => {
                    handleAbrirEditarVehiculo(vehiculoSeleccionado);
                  }}
                  className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-[#1E56B0] hover:text-white text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Unidad</span>
                </button>
              </div>

              {/* Ficha Resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] border border-[#CBD5E1] p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Año / Tipo</span>
                  <span className="font-bold text-[#0A1525]">{vehiculoSeleccionado.anio} • {vehiculoSeleccionado.tipo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Odómetro Actual</span>
                  <span className="font-mono font-bold text-[#0A1525]">{vehiculoSeleccionado.kilometrajeActual.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Chofer Asignado</span>
                  <span className="font-bold text-[#0A1525] truncate block">{vehiculoSeleccionado.conductor}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Garantía QA</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>90 Días Activa</span>
                  </span>
                </div>
              </div>

              {/* Historial de Mantenimientos Realizados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#1E56B0]" />
                    <span>Historial de Servicios Certificados In Situ</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {vehiculoSeleccionado.serviciosHistorial.length} servicios registrados
                  </span>
                </div>

                <div className="space-y-2.5">
                  {vehiculoSeleccionado.serviciosHistorial.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#CBD5E1] shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-black text-sm text-[#0A1525] block">
                            {srv.tipo}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {srv.fecha} • Kilometraje: <strong className="font-mono text-[#0A1525]">{srv.kilometraje.toLocaleString()} km</strong>
                          </span>
                        </div>
                        <span className="font-mono font-black text-xs text-[#1E56B0] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          ${srv.costo.toFixed(2)} USD
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200">
                        <strong className="text-[#0A1525]">Repuestos & Insumos:</strong> {srv.repuestos}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Técnico Certificado: <strong>{srv.mecanico}</strong></span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Odómetro & Evidencia Verificada</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie con Enlace a vista pública */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <Link
                  href={`/historial/${vehiculoSeleccionado.placa}`}
                  target="_blank"
                  className="text-xs font-bold text-[#1E56B0] hover:underline flex items-center gap-1"
                >
                  <span>Abrir Pasaporte en pestaña completa</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setModalPasaporteOpen(false)}
                  className="h-10 px-5 rounded-xl bg-[#0A1525] text-white text-xs font-bold hover:bg-[#1E56B0] transition-colors"
                >
                  Cerrar Pasaporte
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: SOLICITAR SERVICIO TÉCNICO PARA FLOTA            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalPedirServicioOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 space-y-5 border border-[#E2E8F0] shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalPedirServicioOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Wrench className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                      Pedir Servicio para Flota
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E56B0] border border-blue-200">
                      B2B Prioritario
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Despacho de brigada mecánica oficial in situ a las instalaciones de {empresa.razonSocial}
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleConfirmarServicioFlota} className="space-y-4">
                {/* 1. Selección de Vehículo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    1. Unidad de la Flota que requiere servicio *
                  </label>
                  <select
                    value={servicioVehiculoId}
                    onChange={(e) => setServicioVehiculoId(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-[#0A1525] bg-[#F8FAFC] font-bold focus:outline-none focus:border-[#1E56B0]"
                  >
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        [{v.placa}] {v.marca} {v.modelo} (Año {v.anio}) — {v.conductor} • {v.kilometrajeActual.toLocaleString()} km
                      </option>
                    ))}
                  </select>

                  {/* Resumen de la unidad seleccionada */}
                  {(() => {
                    const sel = vehiculos.find((v) => v.id === servicioVehiculoId) || vehiculos[0];
                    if (!sel) return null;
                    return (
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={sel.fotoUrl}
                            alt={sel.placa}
                            className="w-10 h-10 rounded-xl object-cover border border-blue-200 shrink-0"
                          />
                          <div>
                            <span className="font-black text-[#0A1525] block">
                              {sel.marca} {sel.modelo} • <span className="font-mono text-[#1E56B0]">{sel.placa}</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Chofer: {sel.conductor} ({sel.conductorTelefono})
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            sel.estado === 'AL_DIA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sel.estado === 'PROXIMO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sel.estado === 'AL_DIA' ? 'Al día' : sel.estado === 'PROXIMO' ? 'Próximo' : 'Vencido'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Tipo de Servicio Requerido */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    2. Tipo de Servicio o Falla Principal *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Mantenimiento Preventivo (Aceite y Filtros)',
                      'Frenos y Pastillas',
                      'Diagnóstico OBD-II / Check Engine',
                      'Sistema Eléctrico y Batería',
                      'Tren Delantero / Suspensión',
                      'Mecánica de Urgencia en Sitio'
                    ].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setServicioTipo(t)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          servicioTipo === t
                            ? 'bg-[#0A1525] text-white border-[#0A1525] shadow-xs'
                            : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Urgencia del Servicio */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      3. Prioridad de Respuesta
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setServicioUrgencia('INMEDIATA')}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold text-center transition-all ${
                          servicioUrgencia === 'INMEDIATA'
                            ? 'bg-[#1E56B0] text-white border-[#1E56B0] shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        ⚡ Inmediata (45 min)
                      </button>
                      <button
                        type="button"
                        onClick={() => setServicioUrgencia('PROGRAMADA')}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold text-center transition-all ${
                          servicioUrgencia === 'PROGRAMADA'
                            ? 'bg-[#1E56B0] text-white border-[#1E56B0] shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        📅 Programada
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      4. Ubicación / Patio de la Flota *
                    </label>
                    <input
                      type="text"
                      required
                      value={servicioUbicacion}
                      onChange={(e) => setServicioUbicacion(e.target.value)}
                      placeholder="Dirección o punto de atención..."
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-[#0A1525] bg-[#F8FAFC] focus:outline-none focus:border-[#1E56B0]"
                    />
                  </div>
                </div>

                {/* 5. Descripción de la Falla */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    5. Detalles del Fallo o Síntomas Observados
                  </label>
                  <textarea
                    rows={2}
                    value={servicioDescripcion}
                    onChange={(e) => setServicioDescripcion(e.target.value)}
                    placeholder="Ej. Pérdida de fuerza en subidas, chillido persistente en frenos delanteros..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-[#0A1525] bg-[#F8FAFC] focus:outline-none focus:border-[#1E56B0]"
                  />
                </div>

                {/* Banner de Garantía B2B */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>SLA Flota Corporativa:</strong> Despacho asigna técnico certificado con repuestos evaluados y registro automático en Pasaporte Técnico.
                  </span>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalPedirServicioOpen(false)}
                    className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoServicioFlota}
                    className="h-11 px-6 rounded-xl bg-[#1E56B0] hover:bg-[#0A1525] text-white font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {enviandoServicioFlota ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#CCFF00]" />
                        <span>Enviando a Despacho...</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-4 h-4 text-[#CCFF00]" />
                        <span>Confirmar y Pedir Servicio</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
