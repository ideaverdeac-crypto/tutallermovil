'use client';

import React, { useState } from 'react';
import {
  Wrench,
  ClipboardCheck,
  ShieldCheck,
  Car,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
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
}

export function HistorialAccionesCliente({
  vehiculo,
  cliente,
  esHistorialVacio = true
}: HistorialAccionesClienteProps) {
  const [modalMecanicoOpen, setModalMecanicoOpen] = useState(false);
  const [modalExpedienteOpen, setModalExpedienteOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleMecanicoSuccess = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
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
        /* BOTÓN COMPACTO CUANDO SÍ HAY HISTORIAL PERO QUIERE AGREGAR OTRO SERVICIO O EXPEDIENTE */
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setModalExpedienteOpen(true)}
            className="h-10 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 text-purple-700" />
            <span>Auditoría 25 Pts ($5)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMecanicoOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Wrench className="w-4 h-4 text-[#CCFF00]" />
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
