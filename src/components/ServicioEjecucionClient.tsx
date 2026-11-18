'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Camera,
  Check,
  AlertTriangle,
  ChevronDown,
  Gauge,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
  DollarSign,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Clock,
  Car,
  X,
  Loader2,
  Hourglass,
  Bike,
  Layers,
  Upload,
  Navigation,
  Eye,
  ZoomIn,
  PackageCheck,
  AlertCircle,
  Wrench,
  ChevronRight,
  ShieldAlert,
  MessageCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ServicioEjecucionClientProps {
  id: string;
}

// 4 Categorías del Checklist Táctil de 25 Puntos
interface ChecklistItem {
  id: string;
  nombre: string;
  descripcion: string;
}

interface ChecklistCategory {
  id: string;
  titulo: string;
  items: ChecklistItem[];
}

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'fluidos',
    titulo: '1. Nivel y Calidad de Fluidos (7 Puntos)',
    items: [
      { id: 'aceite_motor', nombre: 'Aceite de Motor', descripcion: 'Nivel en varilla y viscosidad adecuada' },
      { id: 'liquido_frenos', nombre: 'Líquido de Frenos', descripcion: 'Humedad menor a 2% y nivel en reservorio' },
      { id: 'refrigerante', nombre: 'Refrigerante / Coolant', descripcion: 'Estado del líquido y hermeticidad de mangueras' },
      { id: 'direccion_hidraulica', nombre: 'Dirección Hidráulica', descripcion: 'Nivel de ATF y ausencia de fugas en bomba' },
      { id: 'limpiaparabrisas', nombre: 'Agua Limpiaparabrisas', descripcion: 'Nivel de reservorio y aditivo' },
      { id: 'aceite_transmision', nombre: 'Aceite de Transmisión', descripcion: 'Nivel y color de fluido de caja' },
      { id: 'fugas_motor', nombre: 'Hermeticidad de Motor', descripcion: 'Inspección de fugas en tapa de válvulas y cárter' }
    ]
  },
  {
    id: 'frenos',
    titulo: '2. Sistema de Frenos (6 Puntos)',
    items: [
      { id: 'pastillas_delanteras', nombre: 'Pastillas Delanteras', descripcion: 'Grosor de pasta mayor a 4 mm' },
      { id: 'pastillas_traseras', nombre: 'Pastillas Traseras / Bandas', descripcion: 'Desgaste simétrico en ambos lados' },
      { id: 'discos_freno', nombre: 'Discos de Freno', descripcion: 'Superficie uniforme sin rebaba crítica' },
      { id: 'lineas_mangueras', nombre: 'Líneas y Mangueras', descripcion: 'Sin agrietamiento ni pérdida de presión' },
      { id: 'freno_mano', nombre: 'Freno de Estacionamiento', descripcion: 'Tensión de guaya (4 a 6 clics de bloqueo)' },
      { id: 'calipers_mordazas', nombre: 'Calipers / Mordazas', descripcion: 'Desplazamiento libre de pasadores y pistones' }
    ]
  },
  {
    id: 'suspension',
    titulo: '3. Suspensión y Tren Delantero (6 Puntos)',
    items: [
      { id: 'amortiguadores', nombre: 'Amortiguadores', descripcion: 'Sin fugas de aceite ni rebote excesivo' },
      { id: 'munones_rotulas', nombre: 'Muñones y Rótulas', descripcion: 'Guardapolvos intactos y sin holgura axial' },
      { id: 'terminales_direccion', nombre: 'Terminales de Dirección', descripcion: 'Alineación firme y terminales ajustados' },
      { id: 'bujes_mesetas', nombre: 'Bujes de Meseta', descripcion: 'Gomas sin resequedad ni desprendimiento' },
      { id: 'barra_estabilizadora', nombre: 'Bielas y Barra Estabilizadora', descripcion: 'Gomas y terminales sin juego' },
      { id: 'rodamientos_rueda', nombre: 'Rodamientos de Rueda', descripcion: 'Sin zumbido al giro libre ni juego axial' }
    ]
  },
  {
    id: 'electrico',
    titulo: '4. Luces y Sistema Eléctrico (6 Puntos)',
    items: [
      { id: 'luces_principales', nombre: 'Luces Principales', descripcion: 'Altas, bajas y alineación de faros' },
      { id: 'luces_stop', nombre: 'Luces de Stop e Intermitentes', descripcion: 'Funcionamiento simultáneo al frenar' },
      { id: 'bornes_bateria', nombre: 'Bornes de Batería', descripcion: 'Ajuste firme, sin sulfatación' },
      { id: 'estado_bateria', nombre: 'Salud de Batería (CCA)', descripcion: 'Capacidad de arranque y voltaje en reposo' },
      { id: 'alternador_carga', nombre: 'Carga de Alternador', descripcion: 'Voltaje en ralentí entre 13.8V y 14.4V' },
      { id: 'correa_accesorios', nombre: 'Correa de Accesorios', descripcion: 'Tensión adecuada y sin grietas superficiales' }
    ]
  }
];

const CHECKLIST_DEFAULT_MAP: Record<string, 'OK' | 'CAMBIO'> = {
  aceite_motor: 'OK',
  liquido_frenos: 'CAMBIO',
  refrigerante: 'OK',
  direccion_hidraulica: 'OK',
  limpiaparabrisas: 'OK',
  aceite_transmision: 'OK',
  fugas_motor: 'OK',
  pastillas_delanteras: 'CAMBIO',
  pastillas_traseras: 'OK',
  discos_freno: 'CAMBIO',
  lineas_mangueras: 'OK',
  freno_mano: 'OK',
  calipers_mordazas: 'OK',
  amortiguadores: 'OK',
  munones_rotulas: 'OK',
  terminales_direccion: 'OK',
  bujes_mesetas: 'OK',
  barra_estabilizadora: 'OK',
  rodamientos_rueda: 'OK',
  luces_principales: 'OK',
  luces_stop: 'OK',
  bornes_bateria: 'OK',
  estado_bateria: 'OK',
  alternador_carga: 'OK',
  correa_accesorios: 'OK'
};

// Pasos del Stepper
const PASOS_WIZARD = [
  { id: 1, nombre: 'Diagnóstico', icon: Wrench },
  { id: 2, nombre: 'Aprobación', icon: Hourglass },
  { id: 3, nombre: 'Runner', icon: Bike },
  { id: 4, nombre: 'Instalación', icon: Layers },
  { id: 5, nombre: 'Liquidación', icon: ShieldCheck }
];

export function ServicioEjecucionClient({ id }: ServicioEjecucionClientProps) {
  // Datos del servicio
  const [vehiculo, setVehiculo] = useState('Toyota Corolla 2018');
  const [placa, setPlaca] = useState('AB123CD');
  const [clienteNombre, setClienteNombre] = useState('María Rodríguez');
  const [clienteTelefono, setClienteTelefono] = useState('+584121234567');
  const [fallaReportada, setFallaReportada] = useState('Diagnóstico OBD2 por testigo Check Engine y pérdida de fuerza');
  const [estadoOrden, setEstadoOrden] = useState<string>('ASIGNADO');

  // Cotización acordada
  const cotizacion = {
    manoDeObra: 35.0,
    repuestos: 20.0,
    diagnosticoExonerado: true,
    diagnosticoMonto: 15.0,
    totalFacturable: 55.0,
    gananciaMecanico: 38.5
  };

  // Fase actual del Wizard (1 a 5)
  const [faseActual, setFaseActual] = useState<number>(1);

  // ==========================================
  // FASE 1: Llegada y Diagnóstico Inicial
  // ==========================================
  const KILOMETRAJE_ANTERIOR = 48500;
  const [kmInicial, setKmInicial] = useState<string>('');
  const [fotoOdometroInicial, setFotoOdometroInicial] = useState<string | null>(null);
  const [piezasRequeridas, setPiezasRequeridas] = useState<string>('Pastillas de freno delanteras Bosch, 1 Botella Líquido DOT 4 Motul');
  const [checklistRespuestas, setChecklistRespuestas] = useState<Record<string, 'OK' | 'CAMBIO'>>(CHECKLIST_DEFAULT_MAP);
  const [categoriaAbierta, setCategoriaAbierta] = useState<string>('fluidos');
  const [enviandoDiagnostico, setEnviandoDiagnostico] = useState<boolean>(false);

  // ==========================================
  // FASE 3: Datos del Runner
  // ==========================================
  const runnerInfo = {
    nombre: 'Luis Pérez',
    telefono: '+58 412 123 4567',
    vehiculo: 'Moto Yamaha FZ • Negro',
    placa: 'AB123CD',
    tiempoEstimado: 'Llegada en 4-6 minutos',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  };

  // ==========================================
  // FASE 4: Instalación y Evidencias
  // ==========================================
  const [fotoRepuestoViejo, setFotoRepuestoViejo] = useState<string | null>(null);
  const [fotoRepuestoNuevo, setFotoRepuestoNuevo] = useState<string | null>(null);
  const [guardandoFase4, setGuardandoFase4] = useState<boolean>(false);

  // ==========================================
  // FASE 5: Cierre y Liquidación
  // ==========================================
  const [kmFinal, setKmFinal] = useState<string>('');
  const [fotoOdometroFinal, setFotoOdometroFinal] = useState<string | null>(null);
  const [enviandoLiquidacion, setEnviandoLiquidacion] = useState<boolean>(false);
  const [modalExitoOpen, setModalExitoOpen] = useState<boolean>(false);

  // Estados generales de subida y modales
  const [subiendoFotoTipo, setSubiendoFotoTipo] = useState<string | null>(null);
  const [toastMensaje, setToastMensaje] = useState<string[] | null>(null);
  const [modalFotoZoom, setModalFotoZoom] = useState<string | null>(null);

  // Resiliencia ante fallas de red en subida de fotos
  const [fotoPendienteReintento, setFotoPendienteReintento] = useState<File | null>(null);
  const [tipoFotoPendiente, setTipoFotoPendiente] = useState<{
    prefijo: string;
    nombreLegible: string;
  } | null>(null);

  // Refs para inputs de archivo
  const fileInputOdometroInicialRef = useRef<HTMLInputElement>(null);
  const fileInputRepuestoViejoRef = useRef<HTMLInputElement>(null);
  const fileInputRepuestoNuevoRef = useRef<HTMLInputElement>(null);
  const fileInputOdometroFinalRef = useRef<HTMLInputElement>(null);

  // Helper para calcular fase según estado de la orden
  const calcularFasePorEstado = (estado?: string): number => {
    switch (estado) {
      case 'CANCELADO':
      case 'RECHAZADO':
        return 0; // Estado terminal de cancelación/rechazo
      case 'COTIZACION_RECHAZADA':
        return 5; // Salta directo a liquidación del diagnóstico ($15)
      case 'COTIZADO':
      case 'EN_INSPECCION':
        return 2;
      case 'REPUESTOS_EN_RUTA':
        return 3;
      case 'EN_EJECUCION':
      case 'EN_SERVICIO':
        return 4;
      case 'TRABAJO_TERMINADO':
      case 'PENDIENTE_PAGO':
      case 'LIQUIDACION_PENDIENTE':
      case 'FINALIZADO':
        return 5;
      default:
        return 1;
    }
  };

  // Carga inicial de datos de la orden y suscripción en tiempo real
  useEffect(() => {
    async function cargarDatosOrden() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('ordenes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data && !error) {
          const v = [data.vehiculo_marca, data.vehiculo_modelo, data.vehiculo_anio]
            .filter(Boolean)
            .join(' ') || data.vehiculo_modelo;
          if (v) setVehiculo(v);
          if (data.cliente_nombre) setClienteNombre(data.cliente_nombre);
          if (data.cliente_telefono) setClienteTelefono(data.cliente_telefono);
          if (data.falla_reportada) setFallaReportada(data.falla_reportada);
          if (data.estado) {
            setEstadoOrden(data.estado);
            if (data.estado === 'COTIZACION_RECHAZADA') {
              setToastMensaje(['El cliente no aprobó la cotización. Procede a cobrar la tarifa base de diagnóstico ($15) y cerrar el servicio.']);
            }
            const faseCalculada = calcularFasePorEstado(data.estado);
            setFaseActual(faseCalculada);
          }
          if (data.foto_odometro_url) {
            setFotoOdometroInicial(data.foto_odometro_url);
          }
          if (data.diagnostico_json?.items) {
            const cargadas: Record<string, 'OK' | 'CAMBIO'> = {};
            Object.entries(data.diagnostico_json.items).forEach(([k, v]) => {
              cargadas[k] = v === 'requiere_cambio' ? 'CAMBIO' : 'OK';
            });
            setChecklistRespuestas(cargadas);
          }
          if (data.diagnostico_json?.piezas_requeridas) {
            setPiezasRequeridas(data.diagnostico_json.piezas_requeridas);
          }
        }
      } catch (err) {
        console.warn('Cargando orden con valores por defecto para demostración:', err);
      }
    }

    if (id) {
      cargarDatosOrden();
    }

    // Supabase Realtime: Escuchar cambios de estado ejecutados por Operadora / Runner
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime_wizard_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ordenes',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('⚡ Actualización en tiempo real del Wizard:', payload);
          const nuevo = payload.new as any;
          if (nuevo && nuevo.estado) {
            setEstadoOrden(nuevo.estado);
            if (nuevo.estado === 'COTIZACION_RECHAZADA') {
              setToastMensaje(['El cliente no aprobó la cotización. Procede a cobrar la tarifa base de diagnóstico ($15) y cerrar el servicio.']);
            }
            const nuevaFase = calcularFasePorEstado(nuevo.estado);
            setFaseActual(nuevaFase);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Función universal para subir imágenes al bucket 'evidencias'
  const handleSubirArchivo = async (
    file: File,
    prefijo: string,
    onSuccess: (url: string) => void
  ) => {
    setSubiendoFotoTipo(prefijo);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanId = id ? id.replace(/[^a-zA-Z0-9_-]/g, '_') : 'orden';
      const fileName = `${prefijo}_${cleanId}_${Date.now()}.${ext}`;

      // 1. Subir al Bucket 'evidencias'
      const { error: uploadError } = await supabase.storage
        .from('evidencias')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message || 'Error al subir la imagen al bucket evidencias');
      }

      // 2. Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('evidencias')
        .getPublicUrl(fileName);

      const urlPublica = publicUrlData?.publicUrl;
      if (!urlPublica) {
        throw new Error('No se pudo generar la URL pública de la evidencia');
      }

      onSuccess(urlPublica);
      // Limpiar archivo pendiente de reintento si fue exitoso
      setFotoPendienteReintento(null);
      setTipoFotoPendiente(null);
      setToastMensaje(['✓ Evidencia subida con éxito al bucket']);
      setTimeout(() => setToastMensaje(null), 3500);
    } catch (err: any) {
      console.error('Error al subir evidencia:', err);
      // Resiliencia ante fallas de red: guardar archivo en memoria local para reintento
      setFotoPendienteReintento(file);
      const nombresLegibles: Record<string, string> = {
        odometro_inicial: 'Odómetro Inicial',
        repuesto_viejo: 'Repuesto Usado',
        repuesto_nuevo: 'Repuesto Nuevo',
        odometro_final: 'Odómetro Final'
      };
      setTipoFotoPendiente({
        prefijo,
        nombreLegible: nombresLegibles[prefijo] || 'Foto de evidencia'
      });
      const msg = err?.message || 'Error al subir la evidencia por falla de conexión. Puedes reintentar sin volver a tomar la foto.';
      setToastMensaje([msg]);
      setTimeout(() => setToastMensaje(null), 4500);
    } finally {
      setSubiendoFotoTipo(null);
    }
  };

  // Reintento de subida resiliente para el archivo guardado en memoria
  const handleReintentarSubida = async () => {
    if (!fotoPendienteReintento || !tipoFotoPendiente) return;
    const archivo = fotoPendienteReintento;
    const prefijo = tipoFotoPendiente.prefijo;

    let callback = setFotoOdometroInicial;
    if (prefijo === 'repuesto_viejo') callback = setFotoRepuestoViejo;
    else if (prefijo === 'repuesto_nuevo') callback = setFotoRepuestoNuevo;
    else if (prefijo === 'odometro_final') callback = setFotoOdometroFinal;

    await handleSubirArchivo(archivo, prefijo, (url) => {
      callback(url);
      setFotoPendienteReintento(null);
      setTipoFotoPendiente(null);
    });
  };

  // Validaciones Fase 1
  const kmInicialNum = Number(kmInicial);
  const kmInicialValido = kmInicial.trim() !== '' && !isNaN(kmInicialNum) && kmInicialNum > KILOMETRAJE_ANTERIOR;
  const fotoInicialValida = Boolean(fotoOdometroInicial);
  const piezasValidas = piezasRequeridas.trim().length > 3;
  const puedeEnviarDiagnostico = kmInicialValido && fotoInicialValida && piezasValidas;

  // Enviar Diagnóstico a Operadora (Fase 1 -> Fase 2)
  const handleEnviarDiagnostico = async () => {
    if (!puedeEnviarDiagnostico) {
      const errores: string[] = [];
      if (!kmInicialValido) errores.push(`Kilometraje debe ser mayor a ${KILOMETRAJE_ANTERIOR.toLocaleString()} km`);
      if (!fotoInicialValida) errores.push('Toma la foto del odómetro inicial');
      if (!piezasValidas) errores.push('Indica las piezas requeridas para la cotización');
      setToastMensaje(errores);
      setTimeout(() => setToastMensaje(null), 4500);
      return;
    }

    setEnviandoDiagnostico(true);
    try {
      // Normalizar respuestas y agrupaciones para formato interoperable
      const itemsNormalizados: Record<string, string> = {};
      Object.entries(checklistRespuestas).forEach(([key, val]) => {
        itemsNormalizados[key] = val === 'CAMBIO' ? 'requiere_cambio' : 'ok';
      });

      const tieneCambioFrenos = [
        'pastillas_delanteras',
        'pastillas_traseras',
        'discos_freno',
        'liquido_frenos',
        'lineas_mangueras',
        'freno_mano',
        'calipers_mordazas'
      ].some((id) => checklistRespuestas[id] === 'CAMBIO');

      const tieneCambioFluidos = [
        'aceite_motor',
        'liquido_frenos',
        'refrigerante',
        'direccion_hidraulica',
        'aceite_transmision',
        'limpiaparabrisas',
        'fugas_motor'
      ].some((id) => checklistRespuestas[id] === 'CAMBIO');

      const tieneCambioSuspension = [
        'amortiguadores',
        'munones_rotulas',
        'terminales_direccion',
        'bujes_mesetas',
        'barra_estabilizadora',
        'rodamientos_rueda'
      ].some((id) => checklistRespuestas[id] === 'CAMBIO');

      const tieneCambioElectrico = [
        'luces_principales',
        'luces_stop',
        'bornes_bateria',
        'estado_bateria',
        'alternador_carga',
        'correa_accesorios'
      ].some((id) => checklistRespuestas[id] === 'CAMBIO');

      // Objeto JSON con el resumen solicitado: {"frenos": "requiere_cambio", "aceite": "ok", "suspension": "ok"}
      const diagnosticoJson = {
        frenos: tieneCambioFrenos ? 'requiere_cambio' : 'ok',
        aceite: checklistRespuestas['aceite_motor'] === 'CAMBIO' ? 'requiere_cambio' : 'ok',
        suspension: tieneCambioSuspension ? 'requiere_cambio' : 'ok',
        fluidos: tieneCambioFluidos ? 'requiere_cambio' : 'ok',
        electrico: tieneCambioElectrico ? 'requiere_cambio' : 'ok',
        items: itemsNormalizados,
        total_puntos: 25,
        puntos_ok: Object.values(checklistRespuestas).filter((v) => v === 'OK').length,
        puntos_cambio: Object.values(checklistRespuestas).filter((v) => v === 'CAMBIO').length,
        piezas_requeridas: piezasRequeridas,
        fecha: new Date().toISOString(),
        mecanico: {
          nombre: 'Carlos Mendoza',
          codigo: '#TTM-0842'
        }
      };

      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          estado: 'COTIZADO',
          foto_odometro_url: fotoOdometroInicial,
          diagnostico_json: diagnosticoJson,
          falla_reportada: `${fallaReportada} | Piezas requeridas: ${piezasRequeridas}`
        })
        .eq('id', id);

      setEstadoOrden('COTIZADO');
      setFaseActual(2);
      setToastMensaje(['✓ Diagnóstico de 25 Puntos enviado a Despacho Central. Esperando cotización y aprobación.']);
      setTimeout(() => setToastMensaje(null), 4500);
    } catch (e) {
      console.error(e);
      setFaseActual(2);
    } finally {
      setEnviandoDiagnostico(false);
    }
  };

  // Validaciones Fase 4
  const fotosInstalacionCompletas = Boolean(fotoRepuestoViejo && fotoRepuestoNuevo);

  // Terminar Trabajo de Instalación (Fase 4 -> Fase 5)
  const handleTerminarTrabajo = async () => {
    if (!fotosInstalacionCompletas) {
      setToastMensaje(['Debes subir tanto la foto del repuesto viejo como del repuesto nuevo.']);
      setTimeout(() => setToastMensaje(null), 4000);
      return;
    }

    setGuardandoFase4(true);
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          estado: 'TRABAJO_TERMINADO'
        })
        .eq('id', id);

      setEstadoOrden('TRABAJO_TERMINADO');
      setFaseActual(5);
    } catch (e) {
      console.error(e);
      setFaseActual(5);
    } finally {
      setGuardandoFase4(false);
    }
  };

  // Validaciones Fase 5
  const esCotizacionRechazada = estadoOrden === 'COTIZACION_RECHAZADA';
  const kmFinalNum = Number(kmFinal);
  const kmBase = kmInicialNum || KILOMETRAJE_ANTERIOR;
  const kmFinalValido = kmFinal.trim() !== '' && !isNaN(kmFinalNum) && kmFinalNum > kmBase;
  const fotoFinalValida = Boolean(fotoOdometroFinal);
  const puedePedirLiquidacion = esCotizacionRechazada ? true : (kmFinalValido && fotoFinalValida);
  const gananciaLiquidacion = esCotizacionRechazada ? 15.0 : cotizacion.gananciaMecanico;

  // Solicitar Liquidación Final (Fase 5 -> Éxito)
  const handleSolicitarLiquidacion = async () => {
    if (!puedePedirLiquidacion) {
      const errores: string[] = [];
      if (!esCotizacionRechazada) {
        if (!kmFinalValido) errores.push(`El kilometraje final debe ser mayor al inicial (${kmBase.toLocaleString()} km)`);
        if (!fotoFinalValida) errores.push('Toma la foto del odómetro final tras la prueba de ruta');
      }
      setToastMensaje(errores);
      setTimeout(() => setToastMensaje(null), 4000);
      return;
    }

    setEnviandoLiquidacion(true);
    try {
      const supabase = createClient();
      await supabase
        .from('ordenes')
        .update({
          estado: 'PENDIENTE_PAGO',
          ganancia_estimada: gananciaLiquidacion
        })
        .eq('id', id);

      setEstadoOrden('PENDIENTE_PAGO');
      setModalExitoOpen(true);
    } catch (e) {
      console.error(e);
      setModalExitoOpen(true);
    } finally {
      setEnviandoLiquidacion(false);
    }
  };

  // Helpers para pruebas rápidas / demos
  const simularPasoAprobacionDemo = async () => {
    const supabase = createClient();
    await supabase.from('ordenes').update({ estado: 'REPUESTOS_EN_RUTA' }).eq('id', id);
    setEstadoOrden('REPUESTOS_EN_RUTA');
    setFaseActual(3);
  };

  const simularEntregaRunnerDemo = async () => {
    const supabase = createClient();
    await supabase.from('ordenes').update({ estado: 'EN_EJECUCION' }).eq('id', id);
    setEstadoOrden('EN_EJECUCION');
    setFaseActual(4);
  };

  // Identificador de servicio cancelado o rechazado
  const esCanceladoORechazado = estadoOrden === 'CANCELADO' || estadoOrden === 'RECHAZADO' || faseActual === 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col selection:bg-[#CCFF00] selection:text-[#0A1525] relative pb-24 font-sans">
      
      {/* ======================================================== */}
      {/* 1. HEADER DE CONTEXTO (Sticky, Alto Contraste)          */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          
          <Link
            href="/aliados/portal"
            className="w-11 h-11 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0A1525] hover:bg-slate-100 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-2xs"
            title="Volver al Portal de Aliados"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-[#0A1525] truncate tracking-tight">
              {vehiculo}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[#475569] font-medium truncate">
              <span className="font-mono font-bold text-[#1E56B0] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                {placa}
              </span>
              <span>•</span>
              <span className="truncate">{clienteNombre}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${clienteTelefono}`}
              className="w-11 h-11 rounded-2xl bg-[#1E56B0] hover:bg-[#15448c] text-white flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-xs"
              title={`Llamar al cliente (${clienteTelefono})`}
            >
              <Phone className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEPPER VISUAL DE 5 PASOS (Oculto si se canceló)         */}
        {/* ======================================================== */}
        {!esCanceladoORechazado && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between relative">
              
              {/* Barra de progreso de fondo */}
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
              
              {/* Barra de progreso activa */}
              <motion.div
                initial={false}
                animate={{ width: `${((faseActual - 1) / (PASOS_WIZARD.length - 1)) * 100}%` }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#1E56B0] to-[#CCFF00] z-0 transition-all duration-500"
              />

              {PASOS_WIZARD.map((paso) => {
                const isPast = faseActual > paso.id;
                const isCurrent = faseActual === paso.id;
                const IconComp = paso.icon;

                return (
                  <div key={paso.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-[#CCFF00] text-[#0A1525] ring-4 ring-[#CCFF00]/40 shadow-md font-black scale-110'
                          : isPast
                          ? 'bg-[#1E56B0] text-white'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <IconComp className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-black tracking-tight mt-1 transition-colors ${
                        isCurrent ? 'text-[#0A1525]' : isPast ? 'text-[#1E56B0]' : 'text-slate-400'
                      }`}
                    >
                      {paso.nombre}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Contenido Dinámico de las Fases con AnimatePresence */}
      <main className="flex-1 p-4 space-y-4">
        {/* Cartel de advertencia: Resiliencia ante Fallas de Red en Subida */}
        {fotoPendienteReintento && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 text-amber-950 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-black text-amber-950 truncate">
                  Falla de conexión al subir {tipoFotoPendiente?.nombreLegible || 'evidencia'}
                </p>
                <p className="text-[11px] text-amber-900 font-medium truncate">
                  Archivo guardado ({fotoPendienteReintento.name}). No necesitas tomar la foto de nuevo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReintentarSubida}
                disabled={Boolean(subiendoFotoTipo)}
                className="px-3 py-2 rounded-xl bg-[#0A1525] hover:bg-slate-800 text-[#CCFF00] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {subiendoFotoTipo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Reintentar Subida</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFotoPendienteReintento(null);
                  setTipoFotoPendiente(null);
                }}
                className="p-1.5 rounded-lg hover:bg-amber-200/50 text-amber-900 transition-colors cursor-pointer"
                title="Descartar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {esCanceladoORechazado ? (
          <motion.div
            key="cancelado"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 border-2 border-red-200 shadow-xl space-y-6 text-center my-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
              <Ban className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                Servicio {estadoOrden === 'RECHAZADO' ? 'Rechazado' : 'Cancelado'}
              </span>
              <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                Este servicio ha sido cancelado o rechazado por el cliente
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No se requieren más acciones en este vehículo. Tu tiempo y diagnóstico inicial quedan registrados en el sistema central.
              </p>
            </div>

            {/* Resumen de la Orden Cancelada */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-medium text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehículo:</span>
                <span className="font-bold text-[#0A1525]">{vehiculo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placa:</span>
                <span className="font-mono font-bold text-[#1E56B0]">{placa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-[#0A1525]">{clienteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado de la Orden:</span>
                <span className="font-mono font-black text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {estadoOrden}
                </span>
              </div>
            </div>

            <Link
              href="/aliados/portal"
              className="w-full h-14 rounded-2xl bg-[#0A1525] hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Volver a mi Portal</span>
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">

          {/* ======================================================== */}
          {/* FASE 1: LLEGADA Y DIAGNÓSTICO INICIAL                    */}
          {/* ======================================================== */}
          {faseActual === 1 && (
            <motion.div
              key="fase-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-4 border border-[#CBD5E1] shadow-2xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Fase 1 • Llegada y Diagnóstico en Sitio
                </span>
                <p className="text-xs font-semibold text-[#0A1525]">
                  Registra el kilometraje inicial, completa la inspección e indica las piezas requeridas.
                </p>
              </div>

              {/* Candado de Odómetro Inicial */}
              <section className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#0A1525] text-white flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-[#CCFF00]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-[#0A1525]">
                        Odómetro Inicial *
                      </h2>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        Último registrado: {KILOMETRAJE_ANTERIOR.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    kmInicialValido && fotoInicialValida ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {kmInicialValido && fotoInicialValida ? 'Listo' : 'Requerido'}
                  </span>
                </div>

                {/* Input de Kilometraje Inicial */}
                <div>
                  <label className="text-xs font-black text-[#0A1525] block mb-1">
                    Kilometraje Actual del Tablero (km) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kmInicial}
                      onChange={(e) => setKmInicial(e.target.value)}
                      placeholder={`Ej: ${KILOMETRAJE_ANTERIOR + 85}`}
                      className="w-full h-14 px-4 text-xl font-mono font-black text-center rounded-2xl border-2 border-slate-300 focus:border-[#1E56B0] focus:outline-none bg-[#F8FAFC]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                      KM
                    </span>
                  </div>
                  {kmInicial.trim() !== '' && !kmInicialValido && (
                    <p className="text-rose-600 text-xs font-bold mt-1">
                      El kilometraje debe ser mayor a {KILOMETRAJE_ANTERIOR.toLocaleString()} km.
                    </p>
                  )}
                </div>

                {/* Botón de Foto Odómetro Inicial */}
                <input
                  type="file"
                  ref={fileInputOdometroInicialRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSubirArchivo(f, 'odometro_inicial', setFotoOdometroInicial);
                  }}
                />

                {subiendoFotoTipo === 'odometro_inicial' ? (
                  <div className="h-28 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#1E56B0] animate-spin" />
                    <span className="text-xs font-bold text-[#0A1525]">Subiendo odómetro inicial...</span>
                  </div>
                ) : !fotoOdometroInicial ? (
                  <button
                    type="button"
                    onClick={() => fileInputOdometroInicialRef.current?.click()}
                    className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-[#1E56B0] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#1E56B0] shadow-2xs">
                      <Camera className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black text-[#0A1525]">Tomar Foto del Odómetro Inicial</span>
                    <span className="text-[10px] text-slate-400">Enfoca con claridad los números</span>
                  </button>
                ) : (
                  <div className="p-3 bg-[#CCFF00]/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={fotoOdometroInicial}
                        alt="Odómetro"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-400 cursor-pointer"
                        onClick={() => setModalFotoZoom(fotoOdometroInicial)}
                      />
                      <div>
                        <span className="text-xs font-black text-[#0A1525] block">✓ Odómetro Registrado</span>
                        <span className="text-[10px] text-slate-500">Guardado en bucket evidencias</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputOdometroInicialRef.current?.click()}
                      className="text-xs font-bold text-slate-600 hover:text-black underline cursor-pointer p-1"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </section>

              {/* Checklist Táctil */}
              <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#1E56B0]" />
                    <h3 className="text-sm font-black text-[#0A1525]">Checklist de Inspección (25 Puntos)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allOk: Record<string, 'OK' | 'CAMBIO'> = {};
                      CHECKLIST_CATEGORIES.forEach((cat) => cat.items.forEach((item) => { allOk[item.id] = 'OK'; }));
                      setChecklistRespuestas(allOk);
                    }}
                    className="text-[11px] font-bold text-[#1E56B0] hover:underline cursor-pointer"
                  >
                    Marcar Todo OK
                  </button>
                </div>

                <div className="space-y-2">
                  {CHECKLIST_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCategoriaAbierta(categoriaAbierta === cat.id ? '' : cat.id)}
                        className="w-full p-3 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-[#0A1525] cursor-pointer"
                      >
                        <span>{cat.titulo}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${categoriaAbierta === cat.id ? 'rotate-180' : ''}`} />
                      </button>

                      {categoriaAbierta === cat.id && (
                        <div className="p-3 space-y-2.5 bg-white divide-y divide-slate-100">
                          {cat.items.map((item) => {
                            const res = checklistRespuestas[item.id];
                            return (
                              <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-[#0A1525] truncate">{item.nombre}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{item.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setChecklistRespuestas((p) => ({ ...p, [item.id]: 'OK' }))}
                                    className={`h-7 px-2.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                      res === 'OK' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    OK
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChecklistRespuestas((p) => ({ ...p, [item.id]: 'CAMBIO' }))}
                                    className={`h-7 px-2.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                      res === 'CAMBIO' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    CAMBIO
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Piezas Requeridas */}
              <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <label className="text-xs font-black text-[#0A1525] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#1E56B0]" />
                  <span>Piezas y Repuestos Requeridos *</span>
                </label>
                <textarea
                  rows={2}
                  value={piezasRequeridas}
                  onChange={(e) => setPiezasRequeridas(e.target.value)}
                  placeholder="Ej: Juego de bujías de iridio, filtro de aire..."
                  className="w-full p-3 text-xs font-semibold rounded-2xl border border-slate-300 focus:border-[#1E56B0] focus:outline-none bg-[#F8FAFC]"
                />
              </section>

              {/* Botón Acción Fase 1 */}
              <button
                type="button"
                disabled={enviandoDiagnostico}
                onClick={handleEnviarDiagnostico}
                className={`w-full h-14 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  puedeEnviarDiagnostico
                    ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525]'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {enviandoDiagnostico ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Enviar Diagnóstico a Operadora</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FASE 2: SALA DE ESPERA (CLIENTE APRUEBA)                 */}
          {/* ======================================================== */}
          {faseActual === 2 && (
            <motion.div
              key="fase-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 text-center py-6"
            >
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-5">
                
                {/* Reloj de arena animado */}
                <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  >
                    <Hourglass className="w-10 h-10 stroke-[2.2]" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    Candado Financiero Activo
                  </span>
                  <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                    Esperando aprobación del cliente...
                  </h2>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    La operadora está cotizando y formalizando el presupuesto. Por protocolo de calidad y finanzas, <strong>no debes montar ningún repuesto</strong> hasta que el cliente apruebe y pague.
                  </p>
                </div>

                {/* Resumen de lo enviado */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 text-left space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold">
                    <span>Estado en Sistema:</span>
                    <span className="font-mono text-[#1E56B0] uppercase">{estadoOrden}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Piezas solicitadas:</span>
                    <span className="font-bold text-[#0A1525] truncate max-w-[170px]">{piezasRequeridas}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Escuchando respuesta en tiempo real...</span>
                  </div>
                </div>

                {/* Botón Simulador de Prueba Demo (Oculto en Producción) */}
                {process.env.NODE_ENV !== 'production' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={simularPasoAprobacionDemo}
                      className="w-full h-11 rounded-xl bg-slate-100 hover:bg-[#CCFF00] hover:text-[#0A1525] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 active:scale-95"
                      title="Avanzar simulando que el cliente aprobó en despacho"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>⚡ Simular Aprobación & Runner (Demo)</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FASE 3: ESPERA DEL RUNNER                                */}
          {/* ======================================================== */}
          {faseActual === 3 && (
            <motion.div
              key="fase-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4 text-center">
                
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E56B0] border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
                  <motion.div
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <Bike className="w-9 h-9 stroke-[2.2]" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
                    Logística en Ruta
                  </span>
                  <h2 className="text-xl font-black text-[#0A1525] tracking-tight">
                    Tu repuesto está en camino
                  </h2>
                  <p className="text-xs text-slate-500">
                    El runner asignado va en ruta a tu ubicación para entregarte las piezas.
                  </p>
                </div>

                {/* Tarjeta del Runner */}
                <div className="bg-[#0A1525] text-white rounded-2xl p-4 text-left flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={runnerInfo.avatar}
                      alt={runnerInfo.nombre}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#CCFF00]"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{runnerInfo.nombre}</h4>
                      <p className="text-xs text-slate-300">{runnerInfo.vehiculo}</p>
                      <span className="text-[10px] text-[#CCFF00] font-mono font-bold block">
                        {runnerInfo.tiempoEstimado}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${runnerInfo.telefono}`}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#CCFF00] hover:text-[#0A1525] text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 text-left font-medium">
                  🔒 <strong>Aún bloqueado para montar:</strong> Espera la entrega física del repuesto para iniciar la instalación.
                </div>

                {/* Botón Simulador de Entrega (Oculto en Producción) */}
                {process.env.NODE_ENV !== 'production' && (
                  <button
                    type="button"
                    onClick={simularEntregaRunnerDemo}
                    className="w-full h-11 rounded-xl bg-slate-100 hover:bg-[#CCFF00] hover:text-[#0A1525] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 active:scale-95"
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>⚡ Simular Entrega del Runner en Sitio (Demo)</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FASE 4: INSTALACIÓN Y EVIDENCIAS                         */}
          {/* ======================================================== */}
          {faseActual === 4 && (
            <motion.div
              key="fase-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-4 border border-[#CBD5E1] shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  ✓ Repuestos Entregados • Habilitado para Montar
                </span>
                <h3 className="text-sm font-black text-[#0A1525] pt-1">
                  Instalación y Evidencias Fotográficas Obligatorias
                </h3>
                <p className="text-xs text-slate-500">
                  Instala los componentes y sube ambas fotos para validar la garantía oficial TTM.
                </p>
              </div>

              {/* Botón 1: Subir Foto Repuesto Viejo */}
              <input
                type="file"
                ref={fileInputRepuestoViejoRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSubirArchivo(f, 'repuesto_viejo', setFotoRepuestoViejo);
                }}
              />

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0A1525]">
                    1. Foto del Repuesto Viejo (Desmontado) *
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    fotoRepuestoViejo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {fotoRepuestoViejo ? '✓ Cargado' : 'Pendiente'}
                  </span>
                </div>

                {subiendoFotoTipo === 'repuesto_viejo' ? (
                  <div className="h-28 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex flex-col items-center justify-center gap-1.5">
                    <Loader2 className="w-6 h-6 text-[#1E56B0] animate-spin" />
                    <span className="text-xs font-bold text-[#0A1525]">Subiendo repuesto viejo...</span>
                  </div>
                ) : !fotoRepuestoViejo ? (
                  <button
                    type="button"
                    onClick={() => fileInputRepuestoViejoRef.current?.click()}
                    className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1E56B0] bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <Camera className="w-6 h-6 text-[#1E56B0]" />
                    <span className="text-xs font-black text-[#0A1525]">Subir Foto Repuesto Viejo</span>
                    <span className="text-[10px] text-slate-400">Pieza defectuosa extraída</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={fotoRepuestoViejo}
                        alt="Repuesto Viejo"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-400 cursor-pointer"
                        onClick={() => setModalFotoZoom(fotoRepuestoViejo)}
                      />
                      <div>
                        <span className="text-xs font-black text-[#0A1525] block">✓ Repuesto Viejo Verificado</span>
                        <span className="text-[10px] text-slate-500">Guardado en evidencias</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRepuestoViejoRef.current?.click()}
                      className="text-xs font-bold text-slate-600 underline cursor-pointer p-1"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* Botón 2: Subir Foto Repuesto Nuevo */}
              <input
                type="file"
                ref={fileInputRepuestoNuevoRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSubirArchivo(f, 'repuesto_nuevo', setFotoRepuestoNuevo);
                }}
              />

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0A1525]">
                    2. Foto del Repuesto Nuevo (Instalado) *
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    fotoRepuestoNuevo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {fotoRepuestoNuevo ? '✓ Cargado' : 'Pendiente'}
                  </span>
                </div>

                {subiendoFotoTipo === 'repuesto_nuevo' ? (
                  <div className="h-28 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex flex-col items-center justify-center gap-1.5">
                    <Loader2 className="w-6 h-6 text-[#1E56B0] animate-spin" />
                    <span className="text-xs font-bold text-[#0A1525]">Subiendo repuesto nuevo...</span>
                  </div>
                ) : !fotoRepuestoNuevo ? (
                  <button
                    type="button"
                    onClick={() => fileInputRepuestoNuevoRef.current?.click()}
                    className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1E56B0] bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <Camera className="w-6 h-6 text-[#1E56B0]" />
                    <span className="text-xs font-black text-[#0A1525]">Subir Foto Repuesto Nuevo</span>
                    <span className="text-[10px] text-slate-400">Pieza nueva montada en el auto</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={fotoRepuestoNuevo}
                        alt="Repuesto Nuevo"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-400 cursor-pointer"
                        onClick={() => setModalFotoZoom(fotoRepuestoNuevo)}
                      />
                      <div>
                        <span className="text-xs font-black text-[#0A1525] block">✓ Repuesto Nuevo Verificado</span>
                        <span className="text-[10px] text-slate-500">Guardado en evidencias</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRepuestoNuevoRef.current?.click()}
                      className="text-xs font-bold text-slate-600 underline cursor-pointer p-1"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* Botón Acción Fase 4 */}
              <button
                type="button"
                disabled={!fotosInstalacionCompletas || guardandoFase4}
                onClick={handleTerminarTrabajo}
                className={`w-full h-14 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  fotosInstalacionCompletas
                    ? 'bg-[#0A1525] hover:bg-[#1E56B0] text-white shadow-lg'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {guardandoFase4 ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                    <span>Falla Corregida / Trabajo Terminado</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FASE 5: CIERRE Y LIQUIDACIÓN                             */}
          {/* ======================================================== */}
          {faseActual === 5 && (
            <motion.div
              key="fase-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Banner si el cliente rechazó la cotización */}
              {esCotizacionRechazada && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Cotización Rechazada por Cliente</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    El cliente decidió no realizar la reparación con repuestos. Conforme al protocolo, se exonera la prueba de ruta y se liquida únicamente la <strong>tarifa base de diagnóstico ($15.00 USD)</strong>.
                  </p>
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 border border-[#CBD5E1] shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-block">
                  Fase Final • Cierre y Liquidación
                </span>
                <h3 className="text-sm font-black text-[#0A1525] pt-1">
                  {esCotizacionRechazada ? 'Cierre de Diagnóstico Inicial' : 'Odómetro Final Post-Prueba de Ruta'}
                </h3>
                <p className="text-xs text-slate-500">
                  {esCotizacionRechazada
                    ? 'Confirmación y liquidación del honorario de diagnóstico ($15.00 USD).'
                    : `Registra el kilometraje tras probar el auto (debe ser mayor al inicial de ${kmBase.toLocaleString()} km).`}
                </p>
              </div>

              {/* Input Odómetro Final (solo obligatorio si hubo reparación) */}
              {!esCotizacionRechazada && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-black text-[#0A1525] block mb-1">
                    Kilometraje Final del Odómetro (km) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={kmFinal}
                      onChange={(e) => setKmFinal(e.target.value)}
                      placeholder={`Ej: ${kmBase + 3}`}
                      className="w-full h-14 px-4 text-xl font-mono font-black text-center rounded-2xl border-2 border-slate-300 focus:border-[#1E56B0] focus:outline-none bg-[#F8FAFC]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                      KM
                    </span>
                  </div>
                  {kmFinal.trim() !== '' && !kmFinalValido && (
                    <p className="text-rose-600 text-xs font-bold mt-1">
                      El kilometraje final debe ser estrictamente mayor al inicial ({kmBase.toLocaleString()} km).
                    </p>
                  )}
                </div>

                {/* Botón Foto Odómetro Final */}
                <input
                  type="file"
                  ref={fileInputOdometroFinalRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSubirArchivo(f, 'odometro_final', setFotoOdometroFinal);
                  }}
                />

                {subiendoFotoTipo === 'odometro_final' ? (
                  <div className="h-28 rounded-2xl border-2 border-dashed border-[#1E56B0] bg-blue-50/50 flex flex-col items-center justify-center gap-1.5">
                    <Loader2 className="w-6 h-6 text-[#1E56B0] animate-spin" />
                    <span className="text-xs font-bold text-[#0A1525]">Subiendo odómetro final...</span>
                  </div>
                ) : !fotoOdometroFinal ? (
                  <button
                    type="button"
                    onClick={() => fileInputOdometroFinalRef.current?.click()}
                    className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1E56B0] bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <Camera className="w-6 h-6 text-[#1E56B0]" />
                    <span className="text-xs font-black text-[#0A1525]">Tomar Foto del Odómetro Final</span>
                    <span className="text-[10px] text-slate-400">Validación de prueba de ruta</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={fotoOdometroFinal}
                        alt="Odómetro Final"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-400 cursor-pointer"
                        onClick={() => setModalFotoZoom(fotoOdometroFinal)}
                      />
                      <div>
                        <span className="text-xs font-black text-[#0A1525] block">✓ Odómetro Final Registrado</span>
                        <span className="text-[10px] text-slate-500">Guardado en evidencias</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputOdometroFinalRef.current?.click()}
                      className="text-xs font-bold text-slate-600 underline cursor-pointer p-1"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
              )}

              {/* Botón Gigante en Verde Lima: Solicitar Liquidación */}
              <button
                type="button"
                disabled={!puedePedirLiquidacion || enviandoLiquidacion}
                onClick={handleSolicitarLiquidacion}
                className={`w-full h-16 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  puedePedirLiquidacion
                    ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] shadow-[#CCFF00]/30 border border-[#0A1525]/10'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {enviandoLiquidacion ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#0A1525]" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#0A1525]" />
                    <span>Solicitar Liquidación (${gananciaLiquidacion.toFixed(2)} USD)</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL DE ÉXITO DE LIQUIDACIÓN                            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalExitoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-5 border border-[#CBD5E1] shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center mx-auto shadow-lg shadow-[#CCFF00]/30">
                <Check className="w-8 h-8 stroke-[3.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  ¡Liquidación Solicitada!
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  El servicio de <strong>{vehiculo}</strong> ({placa}) ha sido completado y reportado a despacho central.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Monto a Transferir
                </span>
                <span className="text-3xl font-black text-[#1E56B0] font-mono">
                  ${gananciaLiquidacion.toFixed(2)} <span className="text-xs font-sans text-slate-500 font-bold">USD</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block pt-1">
                  ✓ Verificación fotográfica del odómetro aprobada
                </span>
              </div>

              <Link
                href="/aliados/portal"
                className="w-full h-14 bg-[#0A1525] hover:bg-slate-800 text-white font-black text-sm rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                Volver a la Bandeja de Servicios
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Zoom de Fotos */}
      <AnimatePresence>
        {modalFotoZoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-md w-full">
              <button
                type="button"
                onClick={() => setModalFotoZoom(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={modalFotoZoom}
                alt="Evidencia ampliada"
                className="w-full rounded-2xl object-contain max-h-[80vh]"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Flotante de Errores y Alertas */}
      <AnimatePresence>
        {toastMensaje && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#0A1525] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 space-y-1 text-xs"
          >
            {toastMensaje.map((msg, i) => (
              <p key={i} className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="text-[#CCFF00] font-bold">•</span>
                <span>{msg}</span>
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ServicioEjecucionClient;
