'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Gauge,
  Calendar,
  Wrench,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ChecklistModalProps {
  tipoServicio: string;
  fecha: string;
  kilometraje: number | string;
  checklistJson: any;
  placa?: string;
  modelo?: string;
}

const CATEGORIAS_25_ITEMS = [
  {
    id: 'fluidos',
    titulo: '1. Nivel y Calidad de Fluidos',
    items: [
      { id: 'aceite_motor', nombre: 'Aceite de Motor', desc: 'Nivel en varilla y viscosidad adecuada' },
      { id: 'liquido_frenos', nombre: 'Líquido de Frenos', desc: 'Humedad controlada en reservorio' },
      { id: 'refrigerante', nombre: 'Refrigerante / Coolant', desc: 'Hermeticidad y punto de ebullición' },
      { id: 'direccion_hidraulica', nombre: 'Dirección Hidráulica', desc: 'Fluido ATF y sin fugas en bomba' },
      { id: 'limpiaparabrisas', nombre: 'Agua Limpiaparabrisas', desc: 'Nivel y aditivo desengrasante' },
      { id: 'aceite_transmision', nombre: 'Aceite de Transmisión', desc: 'Color y viscosidad de caja' },
      { id: 'fugas_motor', nombre: 'Hermeticidad de Motor', desc: 'Empaques de tapa y cárter secos' }
    ]
  },
  {
    id: 'frenos',
    titulo: '2. Sistema de Frenos',
    items: [
      { id: 'pastillas_delanteras', nombre: 'Pastillas Delanteras', desc: 'Grosor de pasta mayor a 4 mm' },
      { id: 'pastillas_traseras', nombre: 'Pastillas Traseras / Bandas', desc: 'Desgaste simétrico en ambos lados' },
      { id: 'discos_freno', nombre: 'Discos de Freno', desc: 'Superficie uniforme sin rebaba crítica' },
      { id: 'lineas_mangueras', nombre: 'Líneas y Mangueras', desc: 'Sin grietas ni pérdida de presión' },
      { id: 'freno_mano', nombre: 'Freno de Mano', desc: 'Tensión de guaya adecuada' },
      { id: 'calipers_mordazas', nombre: 'Calipers / Mordazas', desc: 'Desplazamiento libre de pasadores' }
    ]
  },
  {
    id: 'suspension',
    titulo: '3. Suspensión y Tren Delantero',
    items: [
      { id: 'amortiguadores', nombre: 'Amortiguadores', desc: 'Sin fugas de aceite ni rebote' },
      { id: 'munones_rotulas', nombre: 'Muñones y Rótulas', desc: 'Guardapolvos intactos y sin juego' },
      { id: 'terminales_direccion', nombre: 'Terminales de Dirección', desc: 'Alineación firme y ajustada' },
      { id: 'bujes_mesetas', nombre: 'Bujes de Meseta', desc: 'Gomas sin resequedad' },
      { id: 'barra_estabilizadora', nombre: 'Bielas y Barra Estabilizadora', desc: 'Terminales sin juego' },
      { id: 'rodamientos_rueda', nombre: 'Rodamientos de Rueda', desc: 'Sin zumbido al giro libre' }
    ]
  },
  {
    id: 'electrico',
    titulo: '4. Luces y Sistema Eléctrico',
    items: [
      { id: 'luces_principales', nombre: 'Luces Principales', desc: 'Altas y bajas alineadas' },
      { id: 'luces_stop', nombre: 'Luces de Stop e Intermitentes', desc: 'Encendido inmediato al frenar' },
      { id: 'bornes_bateria', nombre: 'Bornes de Batería', desc: 'Ajuste firme, sin sulfatación' },
      { id: 'estado_bateria', nombre: 'Salud de Batería (CCA)', desc: 'Capacidad de arranque y voltaje' },
      { id: 'alternador_carga', nombre: 'Carga de Alternador', desc: 'Voltaje en ralentí entre 13.8V y 14.4V' },
      { id: 'correa_accesorios', nombre: 'Correa de Accesorios', desc: 'Tensión adecuada sin grietas' }
    ]
  }
];

export function HistorialChecklistButton({
  tipoServicio,
  fecha,
  kilometraje,
  checklistJson,
  placa,
  modelo
}: ChecklistModalProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  if (!checklistJson) return null;

  const itemsMap = checklistJson.items || {};
  const puntosOk = checklistJson.puntos_ok ?? (checklistJson.frenos === 'requiere_cambio' ? 22 : 25);
  const puntosCambio = checklistJson.puntos_cambio ?? (checklistJson.frenos === 'requiere_cambio' ? 3 : 0);

  return (
    <>
      {/* Botón en la Tarjeta del Servicio */}
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        className="mt-3 w-full sm:w-auto h-9 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
      >
        <ClipboardCheck className="w-3.5 h-3.5 text-purple-700" />
        <span>Ver Diagnóstico de 25 Puntos</span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-200/80 text-purple-950 font-extrabold ml-1">
          {puntosOk}/25 OK
        </span>
      </button>

      {/* Modal Interactivo con los 25 Puntos Organizados */}
      <AnimatePresence>
        {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1525]/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative my-auto space-y-4 max-h-[90vh] flex flex-col"
            >
              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0A1525] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer z-10"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera */}
              <div className="flex items-center gap-3 pr-8 shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-[#0A1525] text-[#CCFF00] flex items-center justify-center font-black shadow-xs shrink-0">
                  <ClipboardCheck className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-[#0A1525] tracking-tight">
                      Diagnóstico de 25 Puntos
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-200">
                      Certificado
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {fecha}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#1E56B0] font-mono font-bold">
                      <Gauge className="w-3 h-3 text-[#1E56B0]" />
                      {Number(kilometraje).toLocaleString()} KM
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Metric Badges */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Puntos en Buen Estado</span>
                  <span className="text-base font-mono font-black text-emerald-800">
                    {puntosOk} Componentes OK
                  </span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${
                  puntosCambio > 0 ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase block ${puntosCambio > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                    Requiere Cambio / Falla
                  </span>
                  <span className={`text-base font-mono font-black ${puntosCambio > 0 ? 'text-rose-800' : 'text-slate-700'}`}>
                    {puntosCambio} Pieza{puntosCambio === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Lista Desglosada de los 25 Puntos por Categoría */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {CATEGORIAS_25_ITEMS.map((cat) => {
                  return (
                    <div key={cat.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-xs font-black text-[#0A1525]">
                        {cat.titulo}
                      </div>

                      <div className="p-2.5 space-y-2 divide-y divide-slate-100">
                        {cat.items.map((it) => {
                          const val = itemsMap[it.id] || (
                            (it.id === 'pastillas_delanteras' || it.id === 'discos_freno' || it.id === 'liquido_frenos') && checklistJson.frenos === 'requiere_cambio'
                              ? 'requiere_cambio'
                              : it.id === 'aceite_motor' && checklistJson.aceite === 'requiere_cambio'
                              ? 'requiere_cambio'
                              : 'ok'
                          );
                          const esFalla = val === 'requiere_cambio' || val === 'CAMBIO' || val === 'falla';

                          return (
                            <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${esFalla ? 'text-rose-950 font-black' : 'text-[#0A1525]'}`}>
                                  {it.nombre}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {it.desc}
                                </p>
                              </div>

                              <div className="shrink-0">
                                {esFalla ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    <span>Requiere Cambio</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                    <span>OK</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Entendido */}
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-full h-11 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                Cerrar Detalle
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
