'use client';

import React, { useState, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';

// Tipos de datos para el portal B2B
interface VehiculoFlota {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: 'Carga Ligera' | 'Carga Pesada' | 'Utilitario' | 'Pick-Up';
  conductor: string;
  conductorTelefono: string;
  ultimoServicioFecha: string;
  ultimoServicioTipo: string;
  kilometrajeActual: number;
  kilometrajeUltimoServicio: number;
  estado: 'AL_DIA' | 'PROXIMO' | 'VENCIDO';
  serviciosHistorial: {
    fecha: string;
    tipo: string;
    kilometraje: number;
    mecanico: string;
    costo: number;
    repuestos: string;
  }[];
}

// 12 Unidades de la empresa "Logística El Este C.A."
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
    modelo: 'F-350 Super Duty Tritón V8',
    anio: 2019,
    tipo: 'Carga Pesada',
    conductor: 'Héctor Quintero',
    conductorTelefono: '+58 424 112 4455',
    ultimoServicioFecha: '10 Ago 2026',
    ultimoServicioTipo: 'Frenos y Tren Delantero Completo',
    kilometrajeActual: 212400,
    kilometrajeUltimoServicio: 206000,
    estado: 'VENCIDO',
    serviciosHistorial: [
      {
        fecha: '10 Ago 2026',
        tipo: 'Mantenimiento Correctivo de Frenos',
        kilometraje: 206000,
        mecanico: 'Carlos Mendoza (#TTM-0842)',
        costo: 240.0,
        repuestos: 'Discos ventilados, Pastillas Heavy Duty, Terminales de Dirección'
      }
    ]
  },
  {
    id: 'FLEET-05',
    placa: 'A90NP1Q',
    marca: 'Renault',
    modelo: 'Kangoo Express 1.6 16V',
    anio: 2022,
    tipo: 'Utilitario',
    conductor: 'Manuel Sanoja',
    conductorTelefono: '+58 412 334 5566',
    ultimoServicioFecha: '02 Nov 2026',
    ultimoServicioTipo: 'Cambio de Aceite 10W-40 y Filtros',
    kilometrajeActual: 62400,
    kilometrajeUltimoServicio: 61500,
    estado: 'AL_DIA',
    serviciosHistorial: [
      {
        fecha: '02 Nov 2026',
        tipo: 'Mantenimiento Menor 60K',
        kilometraje: 61500,
        mecanico: 'Roberto Silva (#TTM-0512)',
        costo: 75.0,
        repuestos: 'Aceite 10W-40 ELF Semi-sintético, Filtro Aceite Purflux'
      }
    ]
  },
  {
    id: 'FLEET-06',
    placa: 'A23RS4T',
    marca: 'Mitsubishi',
    modelo: 'Canter FE 659 Turbo Diésel',
    anio: 2020,
    tipo: 'Carga Pesada',
    conductor: 'Jorge Valero',
    conductorTelefono: '+58 414 998 7766',
    ultimoServicioFecha: '18 Oct 2026',
    ultimoServicioTipo: 'Mantenimiento de Sistema Neumático y Frenos',
    kilometrajeActual: 178900,
    kilometrajeUltimoServicio: 177400,
    estado: 'AL_DIA',
    serviciosHistorial: [
      {
        fecha: '18 Oct 2026',
        tipo: 'Mantenimiento General Sistema Aire',
        kilometraje: 177400,
        mecanico: 'Carlos Mendoza (#TTM-0842)',
        costo: 130.0,
        repuestos: 'Filtro secador de aire WABCO, Válvula purga'
      }
    ]
  },
  {
    id: 'FLEET-07',
    placa: 'A45UV6W',
    marca: 'Toyota',
    modelo: 'Hilux 2.7 4x2 Chasis',
    anio: 2021,
    tipo: 'Pick-Up',
    conductor: 'David Zambrano',
    conductorTelefono: '+58 416 223 8899',
    ultimoServicioFecha: '15 Sep 2026',
    ultimoServicioTipo: 'Afinación de Motor y Bujías',
    kilometrajeActual: 88900,
    kilometrajeUltimoServicio: 84200,
    estado: 'PROXIMO',
    serviciosHistorial: [
      {
        fecha: '15 Sep 2026',
        tipo: 'Mantenimiento Preventivo 85K',
        kilometraje: 84200,
        mecanico: 'Luis Carrillo (#TTM-0901)',
        costo: 95.0,
        repuestos: 'Bujías Denso Iridium, Limpieza Inyectores por Ultrasonido'
      }
    ]
  },
  {
    id: 'FLEET-08',
    placa: 'A67XY8Z',
    marca: 'Chevrolet',
    modelo: 'D-Max 3.0 Turbo Diésel 4x4',
    anio: 2023,
    tipo: 'Pick-Up',
    conductor: 'Javier Marcano',
    conductorTelefono: '+58 424 887 6655',
    ultimoServicioFecha: '29 Oct 2026',
    ultimoServicioTipo: 'Cambio de Aceite 5W-40 Sintético',
    kilometrajeActual: 38200,
    kilometrajeUltimoServicio: 37100,
    estado: 'AL_DIA',
    serviciosHistorial: [
      {
        fecha: '29 Oct 2026',
        tipo: 'Servicio Preventivo 35K',
        kilometraje: 37100,
        mecanico: 'Roberto Silva (#TTM-0512)',
        costo: 120.0,
        repuestos: 'Aceite 5W-40 Liqui Moly Top Tec, Filtro Original Isuzu/GM'
      }
    ]
  },
  {
    id: 'FLEET-09',
    placa: 'A89AB0C',
    marca: 'Iveco',
    modelo: 'Daily 55C16 Furgón Cerrado',
    anio: 2020,
    tipo: 'Carga Pesada',
    conductor: 'Oscar Benítez',
    conductorTelefono: '+58 412 776 5544',
    ultimoServicioFecha: '20 Jul 2026',
    ultimoServicioTipo: 'Revisión Embrague y Caja de Cambios',
    kilometrajeActual: 184200,
    kilometrajeUltimoServicio: 177500,
    estado: 'VENCIDO',
    serviciosHistorial: [
      {
        fecha: '20 Jul 2026',
        tipo: 'Reemplazo Kit de Embrague',
        kilometraje: 177500,
        mecanico: 'Carlos Mendoza (#TTM-0842)',
        costo: 310.0,
        repuestos: 'Kit Clutch Valeo Original, Horquilla, Rectificación de Volante'
      }
    ]
  },
  {
    id: 'FLEET-10',
    placa: 'A01CD2E',
    marca: 'Renault',
    modelo: 'Master 2.3 dCi Furgón Largo',
    anio: 2022,
    tipo: 'Carga Ligera',
    conductor: 'César Bastardo',
    conductorTelefono: '+58 414 445 6677',
    ultimoServicioFecha: '08 Nov 2026',
    ultimoServicioTipo: 'Cambio de Aceite 5W-30 y Filtro de Partículas',
    kilometrajeActual: 72100,
    kilometrajeUltimoServicio: 71200,
    estado: 'AL_DIA',
    serviciosHistorial: [
      {
        fecha: '08 Nov 2026',
        tipo: 'Servicio Preventivo 70K',
        kilometraje: 71200,
        mecanico: 'Roberto Silva (#TTM-0512)',
        costo: 135.0,
        repuestos: 'Aceite Castrol Magnatec DPF, Filtro Polen y Aceite'
      }
    ]
  },
  {
    id: 'FLEET-11',
    placa: 'A23EF4G',
    marca: 'Chevrolet',
    modelo: 'Silverado 3500 HD 4x4',
    anio: 2021,
    tipo: 'Pick-Up',
    conductor: 'Nelson Carpio',
    conductorTelefono: '+58 416 112 3388',
    ultimoServicioFecha: '14 Oct 2026',
    ultimoServicioTipo: 'Inspección de Suspensión y Frenos',
    kilometrajeActual: 112500,
    kilometrajeUltimoServicio: 111800,
    estado: 'AL_DIA',
    serviciosHistorial: [
      {
        fecha: '14 Oct 2026',
        tipo: 'Mantenimiento Preventivo 110K',
        kilometraje: 111800,
        mecanico: 'Luis Carrillo (#TTM-0901)',
        costo: 105.0,
        repuestos: 'Aceite 10W-30 Dexos1, Filtro de Aire Motorcraft'
      }
    ]
  },
  {
    id: 'FLEET-12',
    placa: 'A45GH6J',
    marca: 'Ford',
    modelo: 'Transit Van 350L Techo Alto',
    anio: 2023,
    tipo: 'Carga Ligera',
    conductor: 'Wilmer Albornoz',
    conductorTelefono: '+58 424 554 1122',
    ultimoServicioFecha: '01 Nov 2026',
    ultimoServicioTipo: 'Mantenimiento Inicial de Flota 20K',
    kilometrajeActual: 21900,
    kilometrajeUltimoServicio: 20500,
    estado: 'AL_DIA',
    serviciosHistorial: [
      {
        fecha: '01 Nov 2026',
        tipo: 'Mantenimiento Preventivo 20K',
        kilometraje: 20500,
        mecanico: 'Roberto Silva (#TTM-0512)',
        costo: 90.0,
        repuestos: 'Aceite 5W-20 Sintético Motorcraft, Filtro Genuino Ford'
      }
    ]
  }
];

export default function FlotasDashboardPage() {
  const [vehiculos, setVehiculos] = useState<VehiculoFlota[]>(VEHICULOS_FLOTA_INICIAL);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'AL_DIA' | 'PROXIMO' | 'VENCIDO'>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales
  const [modalJornadaOpen, setModalJornadaOpen] = useState<boolean>(false);
  const [modalPasaporteOpen, setModalPasaporteOpen] = useState<boolean>(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<VehiculoFlota | null>(null);

  // Estados del modal de Jornada Sabatina
  const [vehiculosParaJornada, setVehiculosParaJornada] = useState<string[]>([
    'FLEET-01', // Iveco Daily (Vencido)
    'FLEET-04', // Ford F-350 (Vencido)
    'FLEET-09'  // Iveco Daily (Vencido)
  ]);
  const [fechaJornada, setFechaJornada] = useState<string>('2026-11-21'); // Próximo sábado
  const [turnoJornada, setTurnoJornada] = useState<'manana' | 'tarde'>('manana');
  const [jornadaConfirmadaToast, setJornadaConfirmadaToast] = useState<string | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState<boolean>(false);

  // KPIs
  const totalVehiculos = vehiculos.length;
  const vencidosCount = vehiculos.filter((v) => v.estado === 'VENCIDO').length;
  const proximosCount = vehiculos.filter((v) => v.estado === 'PROXIMO').length;
  const requierenMantenimiento = vencidosCount + proximosCount;
  const gastoDelMes = 1250.0;

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
      doc.text('Razón Social: Logística El Este C.A.', 14, 57);
      doc.text('RIF: J-12345678-9', 14, 63);
      doc.text('Dirección: Zona Industrial Los Ruices, Galpón 4B, Caracas.', 14, 69);
      doc.text('Contacto: Dpto. de Transporte y Operaciones (+58 212 900 1122)', 14, 75);

      // Cuadro de Resumen Quincenal a la derecha
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(120, 46, 76, 32, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('RESUMEN DE FLOTA B2B', 126, 53);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Total Unidades Monitoreadas: 12', 126, 60);
      doc.text('Servicios Ejecutados en Quincena: 8', 126, 66);
      doc.text('Mantenimientos en Sitio: 100% In Situ', 126, 72);

      // 3. Tabla Detallada de Servicios Realizados
      const filasServicios = [
        ['02 Nov', 'A90NP1Q', 'Renault Kangoo', 'Mantenimiento Menor 60K (Aceite y Filtros)', 'Roberto Silva', '$75.00'],
        ['05 Nov', 'A56GH7J', 'Toyota Hilux', 'Servicio 50.000 KM Garantía (Motul Sintético)', 'Luis Carrillo', '$110.00'],
        ['08 Nov', 'A01CD2E', 'Renault Master', 'Servicio Preventivo 70K DPF', 'Roberto Silva', '$135.00'],
        ['10 Nov', 'A45GH6J', 'Ford Transit', 'Inspección de Flota 20K In Situ', 'Roberto Silva', '$90.00'],
        ['12 Nov', 'A23RS4T', 'Mitsubishi Canter', 'Revisión y Filtro Neumático de Aire', 'Carlos Mendoza', '$130.00'],
        ['14 Nov', 'A23EF4G', 'Chevrolet Silverado', 'Mantenimiento Preventivo 110K', 'Luis Carrillo', '$105.00'],
        ['15 Nov', 'A67XY8Z', 'Chevrolet D-Max', 'Cambio Aceite 5W-40 Liqui Moly', 'Roberto Silva', '$120.00'],
        ['15 Nov', 'FLEET-AUD', 'Módulos Globales', 'Auditoría OBD2 y Odómetros Flota (12 Unid.)', 'Carlos Mendoza', '$485.00']
      ];

      autoTable(doc, {
        startY: 83,
        head: [['Fecha', 'Placa', 'Vehículo', 'Detalle del Servicio In Situ', 'Especialista', 'Total USD']],
        body: filasServicios,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 86, 176],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.8
        },
        columnStyles: {
          0: { cellWidth: 16 },
          1: { cellWidth: 20, fontStyle: 'bold' },
          2: { cellWidth: 32 },
          3: { cellWidth: 70 },
          4: { cellWidth: 32 },
          5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
        }
      });

      // 4. Totales y Conciliación
      const finalY = (doc as any).lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Términos: Crédito Corporativo B2B Quincenal (Net 15 Días)', 14, finalY + 4);
      doc.text('Garantía Oficial TuTallerMóvil: 90 Días o 5,000 km en repuestos y mano de obra', 14, finalY + 9);
      doc.text('Pago conciliado vía Transferencia Banesco o Zelle: pagos@tutallermovil.com', 14, finalY + 14);

      // Cuadro de Totales
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(125, finalY, 71, 36, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Subtotal Servicios:', 130, finalY + 8);
      doc.text('$1,250.00', 190, finalY + 8, { align: 'right' });

      doc.text('Descuento Convenio Flota (-10%):', 130, finalY + 14);
      doc.setTextColor(22, 163, 74);
      doc.text('-$125.00', 190, finalY + 14, { align: 'right' });

      doc.setTextColor(grisOscuro[0], grisOscuro[1], grisOscuro[2]);
      doc.text('Retención Fondo QA (3%):', 130, finalY + 20);
      doc.text('$33.75', 190, finalY + 20, { align: 'right' });

      doc.setDrawColor(200, 200, 200);
      doc.line(130, finalY + 23, 192, finalY + 23);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TOTAL A CONCILIAR:', 130, finalY + 30);
      doc.setTextColor(azulCobalto[0], azulCobalto[1], azulCobalto[2]);
      doc.text('$1,125.00 USD', 190, finalY + 30, { align: 'right' });

      // Guardar PDF
      doc.save('Factura_Quincenal_LogisticaElEste_TTM.pdf');
    } catch (err) {
      console.error('Error generando factura PDF:', err);
      alert('Ocurrió un error al generar el PDF de facturación.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] font-sans pb-24 selection:bg-[#CCFF00] selection:text-[#0A1525]">
      
      {/* ======================================================== */}
      {/* 1. TOPBAR DE NAVEGACIÓN Y ACCESO A OTROS PANELES        */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo y Switch de Módulos */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#0A1525] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:bg-[#1E56B0] transition-colors">
                <span className="text-[#CCFF00]">T</span>TM
              </div>
              <div>
                <span className="text-sm font-black text-[#0A1525] tracking-tight block">
                  TuTallerMóvil
                </span>
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                  Portal Corporativo B2B
                </span>
              </div>
            </Link>
          </div>

          {/* Links directos de navegación para administradores */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/despacho"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E56B0] px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Despacho Operadora</span>
            </Link>

            <Link
              href="/admin/finanzas"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E56B0] px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Dashboard Dueño</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 rounded-2xl text-xs font-semibold text-[#0A1525]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Flota Conectada GPS</span>
            </div>
          </div>

        </div>
      </header>

      {/* Alerta flotante de confirmación de jornada */}
      <AnimatePresence>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* ======================================================== */}
        {/* 2. HEADER DE LA EMPRESA (Bento Card Principal)          */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Información Corporativa */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-[#1E56B0] border border-blue-200">
                Cuenta Corporativa Premium B2B
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold text-slate-500 bg-slate-100">
                Convenio Nacional TTM
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0A1525] text-white flex items-center justify-center font-black shadow-xs">
                <Building2 className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  Logística El Este C.A.
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  RIF: <strong className="text-[#0A1525] font-mono">J-12345678-9</strong> • Sector Industrial Los Ruices, Caracas
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
              <span>{generandoPdf ? 'Generando PDF...' : 'Descargar Factura Quincenal (PDF)'}</span>
            </button>

            {/* Botón Principal: Agendar Jornada Sabatina */}
            <button
              type="button"
              onClick={() => setModalJornadaOpen(true)}
              className="h-12 px-5 rounded-2xl bg-[#1E56B0] hover:bg-[#0A1525] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4 text-[#CCFF00]" />
              <span>Agendar Jornada Sabatina</span>
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
                <span className="text-xs font-bold text-slate-500">camiones & vans</span>
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
                <span className="text-xs font-bold text-slate-500">unidades en alerta</span>
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
                <span>Ahorro B2B: $210 vs Taller Convencional</span>
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
          
          {/* Cabecera y Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#0A1525] tracking-tight flex items-center gap-2">
                <span>Estado Operativo de las Unidades</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {vehiculosFiltrados.length} de {totalVehiculos}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Semáforo predictivo según kilometraje y tiempo transcurrido desde el último servicio.
              </p>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              
              {/* Buscador */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por placa, modelo o chofer..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-[#0A1525] focus:outline-none focus:border-[#1E56B0] bg-[#F8FAFC]"
                />
              </div>

              {/* Filtros Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFiltroEstado('TODOS')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filtroEstado === 'TODOS' ? 'bg-white text-[#0A1525] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado('AL_DIA')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    filtroEstado === 'AL_DIA' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>Al Día</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado('PROXIMO')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    filtroEstado === 'PROXIMO' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span>Próximos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado('VENCIDO')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    filtroEstado === 'VENCIDO' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  <span>Vencidos</span>
                </button>
              </div>

            </div>
          </div>

          {/* Tabla de Unidades */}
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5 sm:px-6">Placa</th>
                  <th className="py-3 px-4">Marca / Modelo</th>
                  <th className="py-3 px-4">Conductor Asignado</th>
                  <th className="py-3 px-4">Último Servicio</th>
                  <th className="py-3 px-4 text-right">Kilometraje Actual</th>
                  <th className="py-3 px-4 text-center">Semáforo de Estado</th>
                  <th className="py-3 px-5 sm:px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehiculosFiltrados.map((vehiculo) => {
                  const difKm = vehiculo.kilometrajeActual - vehiculo.kilometrajeUltimoServicio;

                  return (
                    <tr
                      key={vehiculo.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Placa con Diseño Matrícula */}
                      <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                        <div className="inline-flex flex-col items-center bg-white border border-[#0A1525]/30 rounded-lg px-2.5 py-1 shadow-2xs">
                          <span className="text-[8px] font-black text-slate-400 tracking-widest leading-none">
                            VENEZUELA
                          </span>
                          <span className="font-mono text-xs font-black text-[#0A1525] tracking-wider">
                            {vehiculo.placa}
                          </span>
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

                      {/* Acción: Ver Pasaporte Técnico */}
                      <td className="py-3.5 px-5 sm:px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setVehiculoSeleccionado(vehiculo);
                            setModalPasaporteOpen(true);
                          }}
                          className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-[#0A1525] text-slate-700 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:bg-[#1E56B0] group-hover:text-white"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                          <span>Ver Pasaporte Técnico</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </section>

      </main>

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
                <div>
                  <label className="font-extrabold text-[#0A1525] block mb-1">
                    Fecha de la Jornada (Sábados Recomendados):
                  </label>
                  <input
                    type="date"
                    value={fechaJornada}
                    onChange={(e) => setFechaJornada(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-[#0A1525] bg-white focus:outline-none focus:border-[#1E56B0]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Horario de servicio técnico: 8:00 AM a 4:00 PM
                  </span>
                </div>

                <div>
                  <label className="font-extrabold text-[#0A1525] block mb-1">
                    Turno de Atención en Galpón:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setTurnoJornada('manana')}
                      className={`h-10 rounded-xl font-bold text-xs border transition-all ${
                        turnoJornada === 'manana'
                          ? 'bg-[#1E56B0] text-white border-[#1E56B0]'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Mañana (8:00 AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurnoJornada('tarde')}
                      className={`h-10 rounded-xl font-bold text-xs border transition-all ${
                        turnoJornada === 'tarde'
                          ? 'bg-[#1E56B0] text-white border-[#1E56B0]'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Tarde (1:00 PM)
                    </button>
                  </div>
                </div>
              </div>

              {/* Selector de Vehículos */}
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

              {/* Cabecera del Pasaporte */}
              <div className="flex items-start justify-between gap-4 pr-10">
                <div className="flex items-center gap-3.5">
                  <div className="inline-flex flex-col items-center bg-[#0A1525] text-white rounded-xl px-3 py-1.5 shadow-sm border border-slate-700">
                    <span className="text-[9px] font-black text-[#CCFF00] tracking-widest leading-none">
                      VENEZUELA
                    </span>
                    <span className="font-mono text-base font-black tracking-wider text-white">
                      {vehiculoSeleccionado.placa}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Pasaporte Digital TuTallerMóvil
                    </span>
                    <h3 className="text-xl font-black text-[#0A1525] tracking-tight mt-0.5">
                      {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Ficha Resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] border border-[#CBD5E1] p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Año</span>
                  <span className="font-bold text-[#0A1525]">{vehiculoSeleccionado.anio}</span>
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

    </div>
  );
}
