'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  Wrench,
  ShieldCheck,
  UserCheck,
  Bike,
  Receipt,
  Eye,
  ExternalLink,
  MessageCircle,
  FileText,
  Search,
  Filter,
  DollarSign,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ClipboardCheck,
  Building2,
  Share2,
  X,
  Phone,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { generarLinkWhatsApp } from '@/lib/utils';
import { HistorialChecklistButton } from '@/components/HistorialChecklistModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ServicioFinalizadoDia {
  id: string;
  orden_id: string;
  codigo_servicio: string;
  fecha_cierre: string; // ISO string o "Hoy, 15:30"
  hora_cierre: string;
  duracion_total_minutos: number;
  es_flota: boolean;
  empresa_flota?: string;
  cliente: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  vehiculo: {
    marca: string;
    modelo: string;
    anio: number | string;
    placa: string;
    kilometraje_inicial: number;
    kilometraje_final: number;
  };
  mecanico: {
    id: string;
    nombre: string;
    credencial: string; // #TTM-0842
    especialidad: string;
    unidad: string;
    foto?: string;
  };
  operadora: {
    nombre: string;
    email: string;
    metodo_pago: string; // Pago Móvil Banesco, Zelle, Transferencia, Efectivo
    referencia_pago: string;
    monto_validado_usd: number;
    comprobante_url?: string;
  };
  runner?: {
    nombre: string;
    unidad: string;
    pin_validacion: string;
    repuestera: string;
    entregado_at?: string;
  } | null;
  cotizacion: {
    mano_de_obra_usd: number;
    repuestos: Array<{
      nombre: string;
      marca: string;
      cantidad: number;
      precio_usd: number;
      tienda?: string;
    }>;
    subtotal_repuestos_usd: number;
    total_facturado_usd: number;
    retencion_qa_3pct_usd: number;
    pago_neto_mecanico_usd: number;
  };
  diagnostico_y_trabajo: {
    falla_reportada: string;
    trabajo_realizado: string;
    checklist_json?: any;
    foto_odometro_url?: string;
    foto_repuesto_viejo_url?: string;
    foto_repuesto_nuevo_url?: string;
  };
}

export const SERVICIOS_DIA_INICIALES: ServicioFinalizadoDia[] = [
  {
    id: 'srv-demo-cierre-01',
    orden_id: 'ord-demo-01',
    codigo_servicio: '#TTM-SRV-0842',
    fecha_cierre: 'Hoy, 14:35',
    hora_cierre: '14:35',
    duracion_total_minutos: 75,
    es_flota: false,
    cliente: {
      nombre: 'Carlos Silva',
      telefono: '+58 414 231 4194',
      email: 'carlos.silva@gmail.com'
    },
    vehiculo: {
      marca: 'Toyota',
      modelo: 'Corolla GLi',
      anio: 2018,
      placa: 'AB123CD',
      kilometraje_inicial: 85412,
      kilometraje_final: 85420
    },
    mecanico: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nombre: 'Carlos Mendoza',
      credencial: '#TTM-0842',
      especialidad: 'Especialista Senior (OBD2 & Inyección)',
      unidad: 'Moto Yamaha FZ • AB123CD',
      foto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80'
    },
    operadora: {
      nombre: 'Ana Pérez',
      email: 'ana.despacho@tutallermovil.com',
      metodo_pago: 'Pago Móvil Banesco',
      referencia_pago: 'PM-984210',
      monto_validado_usd: 150.0,
      comprobante_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'
    },
    runner: {
      nombre: 'Luis',
      unidad: 'Moto Bera SBR Negra (Placa AB987CD)',
      pin_validacion: '4829',
      repuestera: 'AutoPartes Chacao'
    },
    cotizacion: {
      mano_de_obra_usd: 45.0,
      repuestos: [
        {
          nombre: 'Pastillas de Freno Cerámicas',
          marca: 'Bosch',
          cantidad: 1,
          precio_usd: 35.0,
          tienda: 'AutoPartes Chacao'
        },
        {
          nombre: 'Discos Delanteros Ventilados (Par)',
          marca: 'Fremax',
          cantidad: 1,
          precio_usd: 60.0,
          tienda: 'AutoPartes Chacao'
        },
        {
          nombre: 'Líquido de Frenos Sintético DOT4',
          marca: 'Motul',
          cantidad: 1,
          precio_usd: 10.0,
          tienda: 'AutoPartes Chacao'
        }
      ],
      subtotal_repuestos_usd: 105.0,
      total_facturado_usd: 150.0,
      retencion_qa_3pct_usd: 4.5,
      pago_neto_mecanico_usd: 145.5
    },
    diagnostico_y_trabajo: {
      falla_reportada: 'Chillido agudo al frenar en frío y pedal esponjoso con recorrido largo.',
      trabajo_realizado: 'Sustitución de pastillas delanteras, cambio de discos de freno ventilados, purga de circuito y reemplazo total de líquido DOT4.',
      checklist_json: {
        frenos: 'requiere_cambio',
        aceite: 'ok',
        suspension: 'ok',
        fluidos: 'requiere_cambio',
        electrico: 'ok',
        total_puntos: 25,
        puntos_ok: 22,
        puntos_cambio: 3,
        piezas_requeridas: 'Pastillas cerámicas Bosch, 2 Discos delanteros, Líquido DOT4',
        items: {
          aceite_motor: 'ok',
          liquido_frenos: 'requiere_cambio',
          refrigerante: 'ok',
          direccion_hidraulica: 'ok',
          limpiaparabrisas: 'ok',
          aceite_transmision: 'ok',
          fugas_motor: 'ok',
          pastillas_delanteras: 'requiere_cambio',
          pastillas_traseras: 'ok',
          discos_freno: 'requiere_cambio',
          lineas_mangueras: 'ok',
          freno_mano: 'ok',
          calipers_mordazas: 'ok',
          amortiguadores: 'ok',
          munones_rotulas: 'ok',
          terminales_direccion: 'ok',
          bujes_mesetas: 'ok',
          barra_estabilizadora: 'ok',
          rodamientos_rueda: 'ok',
          luces_principales: 'ok',
          luces_stop: 'ok',
          bornes_bateria: 'ok',
          estado_bateria: 'ok',
          alternador_carga: 'ok',
          correa_accesorios: 'ok'
        }
      },
      foto_odometro_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
      foto_repuesto_viejo_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
      foto_repuesto_nuevo_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'srv-demo-cierre-02',
    orden_id: 'ord-flota-demo-01',
    codigo_servicio: '#FLOTA-120K-89',
    fecha_cierre: 'Hoy, 12:15',
    hora_cierre: '12:15',
    duracion_total_minutos: 95,
    es_flota: true,
    empresa_flota: 'Logística El Este C.A.',
    cliente: {
      nombre: 'Ing. Ricardo Morales (Flotas)',
      telefono: '+58 412 889 0011',
      email: 'flota@logisticaeleste.com'
    },
    vehiculo: {
      marca: 'Iveco',
      modelo: 'Daily 70C15 Furgón',
      anio: 2022,
      placa: 'A89DF5G',
      kilometraje_inicial: 120440,
      kilometraje_final: 120448
    },
    mecanico: {
      id: '223e4567-e89b-12d3-a456-426614174001',
      nombre: 'Alejandro Blanco',
      credencial: '#TTM-0912',
      especialidad: 'Mecánica Ligera & Frenos',
      unidad: 'Moto Suzuki GN • AC456DF',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    operadora: {
      nombre: 'Ana Pérez',
      email: 'ana.despacho@tutallermovil.com',
      metodo_pago: 'Transferencia BNC Inmediata',
      referencia_pago: 'BNC-440912',
      monto_validado_usd: 210.0,
      comprobante_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'
    },
    runner: {
      nombre: 'Pedro',
      unidad: 'Moto Yamaha Roja (Placa XY456ZW)',
      pin_validacion: '7712',
      repuestera: 'Repuestos El Hatillo'
    },
    cotizacion: {
      mano_de_obra_usd: 70.0,
      repuestos: [
        {
          nombre: '4 Galones Aceite 15W-40 Diésel',
          marca: 'Shell Rimula',
          cantidad: 4,
          precio_usd: 20.0,
          tienda: 'Repuestos El Hatillo'
        },
        {
          nombre: 'Filtro de Aceite Blindado Iveco',
          marca: 'Mann-Filter',
          cantidad: 1,
          precio_usd: 25.0,
          tienda: 'Repuestos El Hatillo'
        },
        {
          nombre: 'Filtro Trampa Diésel Decantador',
          marca: 'Donaldson',
          cantidad: 1,
          precio_usd: 35.0,
          tienda: 'Repuestos El Hatillo'
        }
      ],
      subtotal_repuestos_usd: 140.0,
      total_facturado_usd: 210.0,
      retencion_qa_3pct_usd: 6.3,
      pago_neto_mecanico_usd: 203.7
    },
    diagnostico_y_trabajo: {
      falla_reportada: '[FLOTA J-12345678-9] Mantenimiento Preventivo 120K programado según protocolo de flota pesada.',
      trabajo_realizado: 'Drenado y carga de lubricante 15W-40, cambio de filtro primario y filtro trampa de combustible, verificación de frenos de aire y suspensión.',
      checklist_json: {
        total_puntos: 25,
        puntos_ok: 25,
        puntos_cambio: 0,
        items: {
          aceite_motor: 'ok',
          liquido_frenos: 'ok',
          refrigerante: 'ok',
          direccion_hidraulica: 'ok',
          limpiaparabrisas: 'ok',
          aceite_transmision: 'ok',
          fugas_motor: 'ok',
          pastillas_delanteras: 'ok',
          pastillas_traseras: 'ok',
          discos_freno: 'ok',
          lineas_mangueras: 'ok',
          freno_mano: 'ok',
          calipers_mordazas: 'ok',
          amortiguadores: 'ok',
          munones_rotulas: 'ok',
          terminales_direccion: 'ok',
          bujes_mesetas: 'ok',
          barra_estabilizadora: 'ok',
          rodamientos_rueda: 'ok',
          luces_principales: 'ok',
          luces_stop: 'ok',
          bornes_bateria: 'ok',
          estado_bateria: 'ok',
          alternador_carga: 'ok',
          correa_accesorios: 'ok'
        }
      },
      foto_odometro_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
      foto_repuesto_viejo_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
      foto_repuesto_nuevo_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'srv-demo-cierre-03',
    orden_id: 'ord-demo-03',
    codigo_servicio: '#TTM-SRV-0341',
    fecha_cierre: 'Hoy, 10:40',
    hora_cierre: '10:40',
    duracion_total_minutos: 45,
    es_flota: false,
    cliente: {
      nombre: 'Mariana Rivas',
      telefono: '+58 424 115 9844',
      email: 'mariana.rivas@gmail.com'
    },
    vehiculo: {
      marca: 'Chevrolet',
      modelo: 'Aveo LT Automático',
      anio: 2014,
      placa: 'AF890KL',
      kilometraje_inicial: 114200,
      kilometraje_final: 114205
    },
    mecanico: {
      id: '323e4567-e89b-12d3-a456-426614174002',
      nombre: 'Roberto Páez',
      credencial: '#TTM-0341',
      especialidad: 'Electricidad Automotriz & Baterías',
      unidad: 'Moto Bera SBR • AE789GH',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    operadora: {
      nombre: 'Carlos Martínez',
      email: 'carlos.despacho@tutallermovil.com',
      metodo_pago: 'Zelle',
      referencia_pago: 'ZL-8823104',
      monto_validado_usd: 120.0,
      comprobante_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'
    },
    runner: null,
    cotizacion: {
      mano_de_obra_usd: 25.0,
      repuestos: [
        {
          nombre: 'Batería 12V 650A Libre Mantenimiento',
          marca: 'Optima',
          cantidad: 1,
          precio_usd: 95.0,
          tienda: 'Mayorista Las Mercedes'
        }
      ],
      subtotal_repuestos_usd: 95.0,
      total_facturado_usd: 120.0,
      retencion_qa_3pct_usd: 3.6,
      pago_neto_mecanico_usd: 116.4
    },
    diagnostico_y_trabajo: {
      falla_reportada: 'Vehículo no da arranque en estacionamiento subterráneo, luces del tablero tenues.',
      trabajo_realizado: 'Diagnóstico con analizador de batería (voltaje en reposo 9.4V, CCA bajo), chequeo de voltaje del alternador en marcha (14.1V OK), cambio e instalación de batería y bornes nuevos.',
      checklist_json: {
        total_puntos: 25,
        puntos_ok: 24,
        puntos_cambio: 1,
        items: {
          aceite_motor: 'ok',
          liquido_frenos: 'ok',
          refrigerante: 'ok',
          direccion_hidraulica: 'ok',
          limpiaparabrisas: 'ok',
          aceite_transmision: 'ok',
          fugas_motor: 'ok',
          pastillas_delanteras: 'ok',
          pastillas_traseras: 'ok',
          discos_freno: 'ok',
          lineas_mangueras: 'ok',
          freno_mano: 'ok',
          calipers_mordazas: 'ok',
          amortiguadores: 'ok',
          munones_rotulas: 'ok',
          terminales_direccion: 'ok',
          bujes_mesetas: 'ok',
          barra_estabilizadora: 'ok',
          rodamientos_rueda: 'ok',
          luces_principales: 'ok',
          luces_stop: 'ok',
          bornes_bateria: 'requiere_cambio',
          estado_bateria: 'requiere_cambio',
          alternador_carga: 'ok',
          correa_accesorios: 'ok'
        }
      },
      foto_odometro_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
      foto_repuesto_viejo_url: 'https://images.unsplash.com/photo-1620910930886-6b2b9e214686?auto=format&fit=crop&w=400&q=80',
      foto_repuesto_nuevo_url: 'https://images.unsplash.com/photo-1620910930886-6b2b9e214686?auto=format&fit=crop&w=400&q=80'
    }
  }
];

interface CierreServiciosDiaProps {
  servicios: ServicioFinalizadoDia[];
  onVolverAlKanban: () => void;
  operadoraActual?: {
    nombre: string;
    email: string;
  };
}

export default function CierreServiciosDia({
  servicios,
  onVolverAlKanban,
  operadoraActual
}: CierreServiciosDiaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'particular' | 'flota'>('todos');
  const [servicioSeleccionadoModal, setServicioSeleccionadoModal] = useState<ServicioFinalizadoDia | null>(null);
  const [modalFotoUrl, setModalFotoUrl] = useState<{ url: string; titulo: string } | null>(null);
  const [acordeonDesglose, setAcordeonDesglose] = useState<Record<string, boolean>>({});

  const toggleAcordeon = (id: string) => {
    setAcordeonDesglose((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrado reactivo en tiempo real
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => {
      // Filtro de tipo
      if (filtroTipo === 'particular' && s.es_flota) return false;
      if (filtroTipo === 'flota' && !s.es_flota) return false;

      // Filtro de búsqueda
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      return (
        s.vehiculo.placa.toLowerCase().includes(q) ||
        s.cliente.nombre.toLowerCase().includes(q) ||
        s.mecanico.nombre.toLowerCase().includes(q) ||
        s.codigo_servicio.toLowerCase().includes(q) ||
        s.vehiculo.modelo.toLowerCase().includes(q) ||
        (s.empresa_flota && s.empresa_flota.toLowerCase().includes(q))
      );
    });
  }, [servicios, busqueda, filtroTipo]);

  // Métricas financieras del día
  const metricas = useMemo(() => {
    const totalServicios = servicios.length;
    const totalFacturado = servicios.reduce((acc, s) => acc + s.cotizacion.total_facturado_usd, 0);
    const totalQA = servicios.reduce((acc, s) => acc + s.cotizacion.retencion_qa_3pct_usd, 0);
    const totalMecanicos = servicios.reduce((acc, s) => acc + s.cotizacion.pago_neto_mecanico_usd, 0);
    const flotas = servicios.filter((s) => s.es_flota).length;
    const particulares = totalServicios - flotas;

    return {
      totalServicios,
      totalFacturado: totalFacturado.toFixed(2),
      totalQA: totalQA.toFixed(2),
      totalMecanicos: totalMecanicos.toFixed(2),
      flotas,
      particulares
    };
  }, [servicios]);

  // Generador de PDF de Cierre Diario Oficial
  const handleExportarCierrePDF = () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Encabezado
    doc.setFillColor(10, 21, 37); // #0A1525
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(204, 255, 0); // #CCFF00
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TUTALLERMÓVIL • REPORTE DE CIERRE DIARIO', 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`Fecha: ${fechaHoy} | Operadora: ${operadoraActual?.nombre || 'Torre de Despacho'}`, 14, 23);

    // Resumen Financiero
    doc.setTextColor(10, 21, 37);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Operaciones y Conciliación del Día', 14, 40);

    const resumenData = [
      ['Total Servicios Finalizados', `${metricas.totalServicios} servicios (${metricas.particulares} part. / ${metricas.flotas} flotas)`],
      ['Total Facturado (USD)', `$${metricas.totalFacturado} USD`],
      ['Fondo de Garantía QA Retenido (3%)', `$${metricas.totalQA} USD`],
      ['Liquidado a Especialistas y Repuesteras', `$${metricas.totalMecanicos} USD`]
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Concepto Operativo / Financiero', 'Monto / Cantidad']],
      body: resumenData,
      theme: 'grid',
      headStyles: { fillColor: [30, 86, 176], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });

    // Detalle de Expedientes
    const detalleBody = servicios.map((s) => [
      s.codigo_servicio,
      s.vehiculo.placa,
      `${s.vehiculo.marca} ${s.vehiculo.modelo}`,
      s.cliente.nombre,
      s.mecanico.nombre,
      s.runner ? s.runner.nombre : 'Directo',
      s.operadora.nombre,
      `$${s.cotizacion.total_facturado_usd.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 12,
      head: [['ID Orden', 'Placa', 'Vehículo', 'Cliente', 'Mecánico', 'Runner', 'Aprobado Por', 'Total']],
      body: detalleBody,
      theme: 'striped',
      headStyles: { fillColor: [10, 21, 37], textColor: [204, 255, 0], fontStyle: 'bold' },
      styles: { fontSize: 8 }
    });

    doc.save(`TTM-Cierre-Diario-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Reenviar recibo oficial vía WhatsApp
  const handleReenviarReciboWA = (servicio: ServicioFinalizadoDia) => {
    const telefono = servicio.cliente.telefono || '0414-2314194';
    const linkPasaporte = `https://tutallermovil.vercel.app/historial/${servicio.vehiculo.placa}`;
    const mensaje = `🔧 *TUTALLERMÓVIL • COMPROBANTE OFICIAL DE SERVICIO FINALIZADO*
━━━━━━━━━━━━━━━━━━━━━━━━━
🚗 *Vehículo:* ${servicio.vehiculo.marca} ${servicio.vehiculo.modelo} (${servicio.vehiculo.anio})
📋 *Placa Certificada:* ${servicio.vehiculo.placa}
🔢 *Expediente:* ${servicio.codigo_servicio}
⏱ *Finalizado:* ${servicio.fecha_cierre} (${servicio.duracion_total_minutos} min)
━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍🔧 *Especialista:* ${servicio.mecanico.nombre} (${servicio.mecanico.credencial})
🛵 *Runner Logístico:* ${servicio.runner ? servicio.runner.nombre + ' (' + servicio.runner.unidad + ')' : 'Entrega directa en sitio'}
👩‍💼 *Aprobado y Conciliado por:* ${servicio.operadora.nombre}
💳 *Pago:* ${servicio.operadora.metodo_pago} (Ref: ${servicio.operadora.referencia_pago})
━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Total Facturado:* $${servicio.cotizacion.total_facturado_usd.toFixed(2)} USD
🛡️ *Garantía TTM Activa:* 30 días o 1,000 km protegidos por Fondo QA

📲 *Consulta tu Pasaporte Técnico Inmutable:*
${linkPasaporte}

¡Gracias por confiar en TuTallerMóvil! Tu historial vehicular ya está actualizado en la nube.`;

    window.open(generarLinkWhatsApp(telefono, mensaje), '_blank');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. Barra de Navegación y Acciones Superiores */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onVolverAlKanban}
            className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0A1525] font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            title="Volver a la vista del Tablero Kanban"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Tablero Activo</span>
          </motion.button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Cierre de Servicios del Día
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Expedientes Certificados
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Historial oficial inmutable de todos los trabajos ejecutados, validados y pagados hoy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportarCierrePDF}
            className="h-11 px-4 rounded-2xl bg-[#0A1525] hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-slate-800"
            title="Descargar reporte de cierre diario en PDF"
          >
            <FileText className="w-4 h-4 text-[#CCFF00]" />
            <span>Descargar Cierre Diario (PDF)</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas del Día (KPIs de Cierre) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Servicios Finalizados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Servicios Concluidos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#0A1525]">
                {metricas.totalServicios}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Pagados
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {metricas.particulares} Particulares • {metricas.flotas} Flotas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Total Facturado */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Facturado Hoy
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#0A1525]">
                ${metricas.totalFacturado}
              </span>
              <span className="text-xs font-bold text-slate-500">USD</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Ingresos brutos conciliados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shrink-0">
            <DollarSign className="w-6 h-6 text-[#CCFF00]" />
          </div>
        </div>

        {/* KPI 3: Fondo de Garantía QA (3%) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Fondo Garantía QA (3%)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-purple-700">
                ${metricas.totalQA}
              </span>
              <span className="text-xs font-bold text-purple-600">USD</span>
            </div>
            <span className="text-[10px] text-purple-500 font-semibold mt-1 block">
              Protección inmutable retenida
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Liquidado a Especialistas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Liquidado a Especialistas
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#1E56B0]">
                ${metricas.totalMecanicos}
              </span>
              <span className="text-xs font-bold text-blue-600">USD</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Mano de obra y repuestos netos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center font-black shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filtros y Buscador Rápido */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por placa, cliente o mecánico..."
            className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0A1525] focus:outline-hidden focus:ring-2 focus:ring-[#1E56B0] transition-all"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros de Tipo */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">
            Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setFiltroTipo('todos')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroTipo === 'todos'
                ? 'bg-[#0A1525] text-[#CCFF00] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Todos ({servicios.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('particular')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroTipo === 'particular'
                ? 'bg-[#1E56B0] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Particulares ({servicios.filter((s) => !s.es_flota).length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('flota')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroTipo === 'flota'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Flotas ({servicios.filter((s) => s.es_flota).length})
          </button>
        </div>
      </div>

      {/* 4. Listado de Expedientes de Servicios Finalizados */}
      {serviciosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0A1525]">
            No se encontraron servicios finalizados
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {busqueda
              ? `No hay coincidencias para "${busqueda}". Intenta con otra placa o nombre.`
              : 'Aún no se han completado ni aprobado pagos de servicios en esta sesión.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviciosFiltrados.map((servicio) => {
            const isDesgloseOpen = Boolean(acordeonDesglose[servicio.id]);

            return (
              <motion.div
                key={servicio.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Cabecera del Expediente */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Identificación y Tags */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black bg-[#0A1525] text-[#CCFF00] px-2.5 py-1 rounded-lg">
                        {servicio.codigo_servicio}
                      </span>

                      {servicio.es_flota ? (
                        <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Flota: {servicio.empresa_flota || 'Corporativa'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-black uppercase tracking-wider bg-blue-100 text-[#1E56B0] border border-blue-200 px-2.5 py-0.5 rounded-md">
                          Particular
                        </span>
                      )}

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PAGADO &amp; CONCILIADO</span>
                      </span>

                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{servicio.fecha_cierre} • {servicio.duracion_total_minutos} min en sitio</span>
                      </span>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReenviarReciboWA(servicio)}
                        className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Reenviar comprobante oficial por WhatsApp al cliente"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Reenviar Recibo</span>
                      </button>

                      <Link
                        href={`/historial/${servicio.vehiculo.placa}`}
                        target="_blank"
                        className="h-9 px-3 rounded-xl bg-[#0A1525] hover:bg-slate-800 text-[#CCFF00] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                        title="Ver Pasaporte Técnico Inmutable en una nueva pestaña"
                      >
                        <Award className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Pasaporte Técnico</span>
                        <ArrowUpRight className="w-3 h-3 opacity-70" />
                      </Link>
                    </div>
                  </div>

                  {/* Vehículo y Cliente */}
                  <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center font-black shrink-0">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-[#0A1525]">
                            {servicio.vehiculo.marca} {servicio.vehiculo.modelo} ({servicio.vehiculo.anio})
                          </h4>
                          <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-md">
                            {servicio.vehiculo.placa}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Cliente: <span className="font-bold text-[#0A1525]">{servicio.cliente.nombre}</span> • Tel: {servicio.cliente.telefono}
                        </p>
                      </div>
                    </div>

                    {/* Resumen Total Facturado */}
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Facturado
                      </span>
                      <div className="flex items-baseline md:justify-end gap-1">
                        <span className="text-2xl font-black text-[#0A1525]">
                          ${servicio.cotizacion.total_facturado_usd.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">USD</span>
                      </div>
                      <span className="text-[10px] text-purple-600 font-semibold block">
                        Incluye 3% Garantía QA (${servicio.cotizacion.retencion_qa_3pct_usd.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid de 4 Pilares del Servicio: ¿Quién realizó? | ¿Quién aprobó? | Runner | Cotización */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
                  {/* Pilar 1: ¿Quién lo realizó? */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-[#1E56B0]" />
                        ¿Quién lo realizó?
                      </span>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded-md">
                        {servicio.mecanico.credencial}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {servicio.mecanico.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#0A1525] truncate">
                          {servicio.mecanico.nombre}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">
                          {servicio.mecanico.especialidad}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Unidad:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">{servicio.mecanico.unidad}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-400">Odómetro:</span>
                        <span className="font-bold text-slate-800">
                          {servicio.vehiculo.kilometraje_inicial.toLocaleString()} → {servicio.vehiculo.kilometraje_final.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pilar 2: ¿Quién aprobó el pago? */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ¿Quién aprobó?
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-md">
                        Conciliado
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {servicio.operadora.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#0A1525] truncate">
                          {servicio.operadora.nombre}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">
                          Torre de Despacho
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Método:</span>
                        <span className="font-bold text-slate-800">{servicio.operadora.metodo_pago}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Referencia:</span>
                        <span className="font-mono text-[10px] font-bold text-[#1E56B0]">{servicio.operadora.referencia_pago}</span>
                      </div>
                      {servicio.operadora.comprobante_url && (
                        <button
                          type="button"
                          onClick={() => setModalFotoUrl({ url: servicio.operadora.comprobante_url!, titulo: 'Comprobante de Pago Validado' })}
                          className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 pt-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Capture del Pago</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pilar 3: Runner de Repuestos */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-sky-600" />
                        Logística Runner
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        servicio.runner ? 'text-sky-700 bg-sky-100/80' : 'text-slate-500 bg-slate-200'
                      }`}>
                        {servicio.runner ? 'Despachado' : 'Sin Runner'}
                      </span>
                    </div>

                    {servicio.runner ? (
                      <>
                        <div className="flex items-center gap-2.5 pt-1">
                          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {servicio.runner.nombre[0]}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#0A1525] truncate">
                              Runner: {servicio.runner.nombre}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">
                              {servicio.runner.unidad}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">PIN Entrega:</span>
                            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ {servicio.runner.pin_validacion}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Proveedor:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[120px]">{servicio.runner.repuestera}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        <p className="font-semibold text-slate-500">Repuestos del Especialista</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Suministrados desde el stock móvil o sin repuestos.</p>
                      </div>
                    )}
                  </div>

                  {/* Pilar 4: Desglose de Cotización */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        Cotización &amp; Cierre
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleAcordeon(servicio.id)}
                        className="text-[10px] font-bold text-[#1E56B0] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isDesgloseOpen ? 'Ocultar' : 'Ver detalle'}</span>
                        {isDesgloseOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="text-[11px] space-y-1.5 pt-1 text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Mano de Obra:</span>
                        <span className="font-bold text-[#0A1525]">${servicio.cotizacion.mano_de_obra_usd.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Repuestos ({servicio.cotizacion.repuestos.length} ítems):</span>
                        <span className="font-bold text-[#0A1525]">${servicio.cotizacion.subtotal_repuestos_usd.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-purple-700 font-semibold border-t border-slate-200/60 pt-1">
                        <span className="text-[10px]">Retención QA (3%):</span>
                        <span className="font-mono text-[10px]">-${servicio.cotizacion.retencion_qa_3pct_usd.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 font-bold">
                        <span className="text-[10px]">Neto Liquidado:</span>
                        <span className="font-mono text-xs">${servicio.cotizacion.pago_neto_mecanico_usd.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desglose Extendido de Repuestos (Acordeón Opcional) */}
                <AnimatePresence>
                  {isDesgloseOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 overflow-hidden"
                    >
                      <h6 className="text-xs font-black text-[#0A1525] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-[#1E56B0]" />
                        <span>Desglose de Repuestos e Insumos Facturados</span>
                      </h6>

                      {servicio.cotizacion.repuestos.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No se requirieron repuestos externos para este servicio.</p>
                      ) : (
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                          {servicio.cotizacion.repuestos.map((rep, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-[#0A1525]">{rep.cantidad}x {rep.nombre}</span>
                                <span className="text-slate-400 text-[11px] ml-2">Marca: {rep.marca}</span>
                                {rep.tienda && <span className="text-slate-400 text-[11px] ml-2">• Tienda: {rep.tienda}</span>}
                              </div>
                              <span className="font-mono font-bold text-[#0A1525]">
                                ${(rep.cantidad * rep.precio_usd).toFixed(2)} USD
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Todo lo que se hizo: Diagnóstico, Checklist 25 Puntos y Evidencias Fotográficas */}
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/40">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Trabajo Realizado y Falla */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Falla Reportada Original
                        </span>
                        <p className="text-xs text-slate-700 font-medium mt-0.5">
                          {servicio.diagnostico_y_trabajo.falla_reportada}
                        </p>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Trabajo Certificado Realizado
                        </span>
                        <p className="text-xs text-[#0A1525] font-semibold mt-0.5">
                          {servicio.diagnostico_y_trabajo.trabajo_realizado}
                        </p>
                      </div>

                      {/* Checklist 25 Puntos Integrado */}
                      {servicio.diagnostico_y_trabajo.checklist_json && (
                        <div className="pt-2">
                          <HistorialChecklistButton
                            tipoServicio={servicio.diagnostico_y_trabajo.trabajo_realizado}
                            fecha={servicio.fecha_cierre}
                            kilometraje={servicio.vehiculo.kilometraje_final}
                            checklistJson={servicio.diagnostico_y_trabajo.checklist_json}
                            placa={servicio.vehiculo.placa}
                            modelo={`${servicio.vehiculo.marca} ${servicio.vehiculo.modelo}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Galería de Evidencias Fotográficas Certificadas */}
                    <div className="lg:w-80 space-y-2 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Evidencias Certificadas en Sitio
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {/* 1. Odómetro Final */}
                        {servicio.diagnostico_y_trabajo.foto_odometro_url ? (
                          <div
                            onClick={() =>
                              setModalFotoUrl({
                                url: servicio.diagnostico_y_trabajo.foto_odometro_url!,
                                titulo: `Odómetro Final Certificado (${servicio.vehiculo.kilometraje_final.toLocaleString()} km)`
                              })
                            }
                            className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 cursor-pointer hover:border-[#1E56B0] transition-all shadow-2xs"
                          >
                            <img
                              src={servicio.diagnostico_y_trabajo.foto_odometro_url}
                              alt="Odómetro"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-[#0A1525]/80 py-0.5 px-1 text-[9px] text-[#CCFF00] font-black text-center truncate">
                              Odómetro
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center text-slate-300 text-[9px] text-center p-1">
                            <ImageIcon className="w-4 h-4 mb-0.5" />
                            <span>Odómetro</span>
                          </div>
                        )}

                        {/* 2. Repuesto Viejo */}
                        {servicio.diagnostico_y_trabajo.foto_repuesto_viejo_url ? (
                          <div
                            onClick={() =>
                              setModalFotoUrl({
                                url: servicio.diagnostico_y_trabajo.foto_repuesto_viejo_url!,
                                titulo: 'Repuesto Dañado / Sustituido'
                              })
                            }
                            className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 cursor-pointer hover:border-[#1E56B0] transition-all shadow-2xs"
                          >
                            <img
                              src={servicio.diagnostico_y_trabajo.foto_repuesto_viejo_url}
                              alt="Repuesto Viejo"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-[#0A1525]/80 py-0.5 px-1 text-[9px] text-rose-400 font-bold text-center truncate">
                              Pieza Vieja
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center text-slate-300 text-[9px] text-center p-1">
                            <ImageIcon className="w-4 h-4 mb-0.5" />
                            <span>Pieza Vieja</span>
                          </div>
                        )}

                        {/* 3. Repuesto Nuevo */}
                        {servicio.diagnostico_y_trabajo.foto_repuesto_nuevo_url ? (
                          <div
                            onClick={() =>
                              setModalFotoUrl({
                                url: servicio.diagnostico_y_trabajo.foto_repuesto_nuevo_url!,
                                titulo: 'Repuesto Nuevo Instalado en Sitio'
                              })
                            }
                            className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 cursor-pointer hover:border-[#1E56B0] transition-all shadow-2xs"
                          >
                            <img
                              src={servicio.diagnostico_y_trabajo.foto_repuesto_nuevo_url}
                              alt="Repuesto Nuevo"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-[#0A1525]/80 py-0.5 px-1 text-[9px] text-emerald-400 font-bold text-center truncate">
                              Pieza Nueva
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center text-slate-300 text-[9px] text-center p-1">
                            <ImageIcon className="w-4 h-4 mb-0.5" />
                            <span>Pieza Nueva</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Zoom de Fotografías / Evidencias / Comprobante */}
      <AnimatePresence>
        {modalFotoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-5 max-w-xl w-full border border-slate-200 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#0A1525]">{modalFotoUrl.titulo}</h4>
                <button
                  type="button"
                  onClick={() => setModalFotoUrl(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-[70vh] flex items-center justify-center bg-black">
                <img
                  src={modalFotoUrl.url}
                  alt={modalFotoUrl.titulo}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalFotoUrl(null)}
                  className="h-10 px-5 rounded-xl bg-[#0A1525] text-white font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
