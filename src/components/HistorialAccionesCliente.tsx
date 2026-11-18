'use client';

import React, { useState } from 'react';
import {
  Wrench,
  ClipboardCheck,
  ShieldCheck,
  Car,
  Sparkles,
  ArrowRight,
  Plus,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';
import { SolicitarExpedienteModal } from '@/components/SolicitarExpedienteModal';

interface HistorialAccionesClienteProps {
  vehiculo: {
    marca: string;
    modelo: string;
    anio?: string | number;
    placa: string;
    color?: string;
  };
  cliente?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  };
  esHistorialVacio?: boolean;
  tieneSuscripcionActiva?: boolean;
  servicios?: Array<{
    id: string;
    fecha?: string;
    kilometraje?: number;
    tipo_servicio?: string;
    costo?: number;
    detalles?: string;
  }>;
}

export function HistorialAccionesCliente({
  vehiculo,
  cliente,
  esHistorialVacio = true,
  tieneSuscripcionActiva = false,
  servicios = []
}: HistorialAccionesClienteProps) {
  const [modalMecanicoOpen, setModalMecanicoOpen] = useState(false);
  const [modalExpedienteOpen, setModalExpedienteOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleMecanicoSuccess = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Generador de Certificado PDF Oficial
  const handleDescargarCertificadoPdf = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = 210;
      const margin = 14;

      // 1. Cabecera institucional
      doc.setFillColor(10, 21, 37); // #0A1525
      doc.rect(0, 0, pageWidth, 26, 'F');
      doc.setFillColor(204, 255, 0); // #CCFF00
      doc.rect(0, 26, pageWidth, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('TuTallerMóvil CCS', margin, 17);

      doc.setFontSize(10);
      doc.text('CERTIFICADO TÉCNICO OFICIAL', pageWidth - margin, 17, { align: 'right' });

      // 2. Datos del Vehículo y Propietario
      doc.setTextColor(10, 21, 37);
      doc.setFontSize(12);
      doc.text(`EXPEDIENTE DIGITAL • PLACA ${vehiculo.placa.toUpperCase()}`, margin, 38);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Vehículo: ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio || 'N/A'})${vehiculo.color ? ` • Color: ${vehiculo.color}` : ''}`, margin, 44);
      doc.text(`Propietario: ${cliente?.nombre || 'Cliente Verificado'} • Contacto: ${cliente?.telefono || 'Registrado'}`, margin, 50);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')} • HASH: TTM-${vehiculo.placa}-${Date.now().toString().slice(-6)}`, margin, 56);

      // 3. Tabla de Intervenciones y Mantenimientos
      const tableData = (servicios || []).map((s) => [
        s.fecha || 'N/A',
        s.tipo_servicio || 'Mantenimiento Preventivo Certificado',
        s.kilometraje ? `${Number(s.kilometraje).toLocaleString()} km` : 'N/A',
        s.costo ? `$${Number(s.costo).toFixed(2)} USD` : 'N/A',
        'Validado TTM'
      ]);

      autoTable(doc, {
        startY: 63,
        head: [['Fecha', 'Intervención / Servicio', 'Kilometraje', 'Monto USD', 'Certificación']],
        body: tableData.length > 0 ? tableData : [['N/A', 'Inspección de Ingreso a Pasaporte Digital', '0 km', '$0.00', 'Certificado']],
        theme: 'striped',
        headStyles: {
          fillColor: [30, 86, 176], // #1E56B0
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        styles: {
          fontSize: 8,
          cellPadding: 3.5
        }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 180;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Documento oficial inmutable emitido por TuTallerMóvil Technologies Caracas.', margin, finalY + 12);
      doc.text(`Verificable en: https://tutallermovil.vercel.app/historial/${vehiculo.placa}`, margin, finalY + 17);

      doc.save(`Certificado_Tecnico_TTM_${vehiculo.placa}.pdf`);
      setToastMsg('📄 Certificado PDF descargado con éxito.');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (e) {
      console.error('Error al generar PDF:', e);
      if (typeof window !== 'undefined') window.print();
    }
  };

  return (
    <>
      {/* Toast Notification si se crea orden */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1525] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#CCFF00]/40 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-[#CCFF00]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {esHistorialVacio ? (
        /* PANEL PRINCIPAL PARA VEHÍCULO NUEVO (SIN HISTORIAL / EN CERO) */
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E56B0] flex items-center justify-center mx-auto shadow-2xs">
              <Car className="w-8 h-8 text-[#1E56B0]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
              <span>Historial en Cero • Vehículo Nuevo</span>
            </div>
            <h3 className="text-2xl font-black text-[#0A1525] tracking-tight">
              Aún no hay servicios registrados para este vehículo
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Este automóvil está dado de alta en la plataforma. En cuanto realices tu primer servicio técnico, cada reparación, repuesto y kilometraje quedará documentado de forma inmutable con garantía respaldada.
            </p>
          </div>

          {/* Dos Opciones Claras: Pedir Primer Servicio o Abrir Expediente de 25 Puntos ($5) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Opción A: Pedir Primer Servicio */}
            <div className="p-5 sm:p-6 bg-[#F8FAFC] border-2 border-slate-200 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#1E56B0] transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black">
                  <Wrench className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <h4 className="text-base font-black text-[#0A1525]">
                  Pide tu Primer Servicio
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ¿Tu vehículo necesita cambio de aceite, frenos, mecánica ligera o auxilio vial? Un mecánico certificado va hasta tu casa u oficina en Caracas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalMecanicoOpen(true)}
                className="w-full h-12 bg-[#0A1525] hover:bg-[#1E56B0] active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-[#CCFF00]" />
                <span>Pide tu primer servicio</span>
              </button>
            </div>

            {/* Opción B: Expediente Técnico de 25 Puntos ($5 USD) */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/50 to-white border-2 border-[#1E56B0]/40 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#1E56B0] transition-colors relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#1E56B0] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  $5.00 USD
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#1E56B0] text-white flex items-center justify-center font-black">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base font-black text-[#0A1525]">
                  Expediente Técnico de 25 Puntos
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Por solo $5 USD, un especialista TTM acude a tu ubicación y audita 7 fluidos, frenos, tren delantero y escáner OBD-II para certificar tu pasaporte digital.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalExpedienteOpen(true)}
                className="w-full h-12 bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#0A1525] font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#0A1525]/10"
              >
                <ClipboardCheck className="w-4 h-4 text-[#0A1525]" />
                <span>Solicitar Expediente Técnico ($5)</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* BARRA UNIFICADA DE ACCIONES Y DESCARGA (100% ALINEADA) */
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {tieneSuscripcionActiva && servicios && servicios.length > 0 && (
            <button
              type="button"
              onClick={handleDescargarCertificadoPdf}
              className="h-10 px-4 rounded-xl bg-[#1E56B0] hover:bg-[#16448c] text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95 whitespace-nowrap"
              title="Descargar Certificado Técnico Digital Oficial en formato PDF"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Descargar Certificado PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalExpedienteOpen(true)}
            className="h-10 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black inline-flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs hover:shadow-xs active:scale-95"
            title="Solicitar Auditoría Técnica in situ de 25 Puntos ($5)"
          >
            <ClipboardCheck className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Auditoría 25 Pts ($5)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMecanicoOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95 whitespace-nowrap"
            title="Solicitar mecánico a domicilio para diagnóstico o mantenimiento"
          >
            <Wrench className="w-4 h-4 text-[#CCFF00] shrink-0" />
            <span>Pedir Servicio</span>
          </button>
        </div>
      )}

      {/* MODAL 1: PEDIR SERVICIO / PRIMER SERVICIO */}
      <SolicitarMecanicoModal
        open={modalMecanicoOpen}
        onOpenChange={setModalMecanicoOpen}
        onSuccessToast={handleMecanicoSuccess}
        initialVehiculo={{
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          placa: vehiculo.placa
        }}
        initialCliente={cliente}
      />

      {/* MODAL 2: EXPEDIENTE TÉCNICO DE 25 PUNTOS ($5 USD) */}
      <SolicitarExpedienteModal
        open={modalExpedienteOpen}
        onOpenChange={setModalExpedienteOpen}
        vehiculo={vehiculo}
        cliente={cliente}
        onSuccess={(id) => {
          handleMecanicoSuccess(`¡Solicitud #${id.slice(0, 8).toUpperCase()} creada! Mecánico en camino para auditar 25 puntos.`);
        }}
      />
    </>
  );
}
