'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  ConversacionChat,
  MensajeChat,
  obtenerOCrearConversacionCliente,
  cargarMensajesConversacion,
  enviarMensajeChat,
  FOTO_OPERADORA_DEFAULT
} from '@/lib/chat';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Phone,
  ShieldCheck,
  Check,
  CheckCheck,
  ChevronDown,
  Minimize2,
  ExternalLink,
  Car
} from 'lucide-react';

interface WidgetChatClienteProps {
  cliente: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  placaActiva: string;
  vehiculoInfo?: string;
}

export default function WidgetChatCliente({
  cliente,
  placaActiva,
  vehiculoInfo
}: WidgetChatClienteProps) {
  const [abierto, setAbierto] = useState(false);
  const [conversacion, setConversacion] = useState<ConversacionChat | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [tieneNoLeidos, setTieneNoLeidos] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (abierto) {
      scrollToBottom();
      setTieneNoLeidos(false);
    }
  }, [mensajes, abierto]);

  // Cargar o inicializar la conversación para este cliente y placa
  useEffect(() => {
    let cancelado = false;

    obtenerOCrearConversacionCliente({
      placa: placaActiva || 'AB123CD',
      clienteNombre: cliente.nombre,
      clienteEmail: cliente.email,
      clienteTelefono: cliente.telefono,
      vehiculoInfo: vehiculoInfo || `Vehículo [${placaActiva}]`
    }).then((conv) => {
      if (!cancelado && conv) {
        setConversacion(conv);
        cargarMensajesConversacion(conv.id).then((msgs) => {
          if (!cancelado) {
            setMensajes(msgs);
            if (msgs.length > 0 && !abierto) {
              setTieneNoLeidos(true);
            }
          }
        });
      }
    });

    return () => {
      cancelado = true;
    };
  }, [placaActiva, cliente.email, cliente.nombre]);

  // Suscripción en Tiempo Real
  useEffect(() => {
    if (!conversacion?.id) return;

    const supabase = createClient();
    const canal = supabase
      .channel(`chat_${conversacion.id}`)
      .on('broadcast', { event: 'nuevo_mensaje' }, ({ payload }) => {
        setMensajes((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          if (!abierto) setTieneNoLeidos(true);
          return [...prev, payload];
        });
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `conversacion_id=eq.${conversacion.id}`
        },
        (payload) => {
          setMensajes((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            if (!abierto) setTieneNoLeidos(true);
            return [...prev, payload.new as MensajeChat];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [conversacion?.id, abierto]);

  // Enviar mensaje
  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevoTexto.trim() || !conversacion) return;

    const texto = nuevoTexto.trim();
    setNuevoTexto('');
    setEnviando(true);

    const optimista: MensajeChat = {
      id: `client-temp-${Date.now()}`,
      conversacion_id: conversacion.id,
      remitente_tipo: 'cliente',
      remitente_nombre: cliente.nombre,
      contenido: texto,
      created_at: new Date().toISOString()
    };

    setMensajes((prev) => [...prev, optimista]);

    await enviarMensajeChat({
      conversacionId: conversacion.id,
      remitenteTipo: 'cliente',
      remitenteNombre: cliente.nombre,
      contenido: texto
    });

    setEnviando(false);
  };

  const handlePreguntaRapida = (pregunta: string) => {
    setNuevoTexto(pregunta);
  };

  return (
    <>
      {/* 1. Botón Flotante con Foto Oficial de la Operadora */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAbierto(!abierto)}
          className="group relative flex items-center gap-2.5 h-13 px-4 rounded-full bg-[#0A1525] hover:bg-[#1E56B0] text-white shadow-2xl border-2 border-white transition-all cursor-pointer"
          title="Chatear con tu operadora en vivo"
        >
          {/* Foto de la Operadora con punto verde online */}
          <div className="relative shrink-0">
            <img
              src={conversacion?.operadora_foto || FOTO_OPERADORA_DEFAULT}
              alt="Andrea Silva"
              className="w-8 h-8 rounded-full object-cover border border-[#CCFF00]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div className="text-left hidden sm:block pr-1">
            <p className="text-[10px] text-slate-300 font-bold leading-tight">
              Operadora en vivo
            </p>
            <p className="text-xs font-black text-white leading-tight">
              Andrea Silva
            </p>
          </div>

          <span className="w-2 h-2 rounded-full bg-[#CCFF00] hidden sm:block" />

          {/* Badge de No Leídos */}
          {tieneNoLeidos && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-bounce shadow-md">
              1
            </span>
          )}
        </motion.button>
      </div>

      {/* 2. Ventana de Chat en Vivo (Estilo Tarjeta Flotante Moderna) */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-20 sm:bottom-22 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-[380px] max-w-[420px] bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col h-[520px] max-h-[80vh]"
          >
            {/* Header del Chat */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#0A1525] to-[#1E56B0] text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={conversacion?.operadora_foto || FOTO_OPERADORA_DEFAULT}
                    alt="Andrea Silva"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#CCFF00] shadow-xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate">
                      Andrea Silva
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#CCFF00] text-[#0A1525] text-[9px] font-black uppercase">
                      OFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 truncate">
                    Torre de Despacho TTM • Placa <strong className="text-[#CCFF00] font-mono">{placaActiva}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Opción de abrir en WhatsApp si el cliente prefiere */}
                <a
                  href={`https://wa.me/584120000000?text=${encodeURIComponent(
                    `Hola Andrea, te escribo desde Mi Garaje sobre mi vehículo placa ${placaActiva}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Continuar en WhatsApp"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Minimizar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banner de Garantía y Confianza */}
            <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-[11px] text-[#1E56B0] font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E56B0]" />
                <span>Atención humana y técnica verificada</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">24/7 CCS</span>
            </div>

            {/* Cuerpo de Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {mensajes.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    ¡Hola {cliente.nombre.split(' ')[0]}! 👋
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Soy Andrea, tu operadora asignada. Escríbeme cualquier consulta sobre tu {vehiculoInfo || `vehículo ${placaActiva}`} y te atenderé de inmediato.
                  </p>
                </div>
              ) : (
                mensajes.map((m) => {
                  const esCliente = m.remitente_tipo === 'cliente';
                  const esSistema = m.remitente_tipo === 'sistema';

                  if (esSistema) {
                    return (
                      <div key={m.id} className="text-center my-1.5">
                        <span className="bg-slate-200/80 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                          {m.contenido}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2 ${esCliente ? 'justify-end' : 'justify-start'}`}
                    >
                      {!esCliente && (
                        <img
                          src={conversacion?.operadora_foto || FOTO_OPERADORA_DEFAULT}
                          alt="Operadora"
                          className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                        />
                      )}

                      <div
                        className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                          esCliente
                            ? 'bg-[#1E56B0] text-white rounded-br-2xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-2xs'
                        }`}
                      >
                        {!esCliente && (
                          <p className="text-[10px] font-black text-[#1E56B0] mb-0.5">
                            Andrea Silva (Operadora TTM)
                          </p>
                        )}
                        <p className="whitespace-pre-wrap font-medium">{m.contenido}</p>
                        <p
                          className={`text-[9px] mt-1 text-right ${
                            esCliente ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          {m.created_at
                            ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={mensajesEndRef} />
            </div>

            {/* Píldoras de Preguntas Frecuentes del Cliente */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handlePreguntaRapida('¿Cuánto cuesta el diagnóstico a domicilio?')}
                className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap active:scale-95"
              >
                🔧 Costo diagnóstico
              </button>
              <button
                type="button"
                onClick={() => handlePreguntaRapida('¿En cuánto tiempo llega mi mecánico?')}
                className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap active:scale-95"
              >
                ⏱ Tiempo de llegada
              </button>
              <button
                type="button"
                onClick={() => handlePreguntaRapida('¿Cómo valido la credencial QR del mecánico?')}
                className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap active:scale-95"
              >
                🛡️ Validar QR
              </button>
            </div>

            {/* Input y Botón Enviar */}
            <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                placeholder="Escribe un mensaje a tu operadora..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all font-medium"
              />
              <button
                type="submit"
                disabled={enviando || !nuevoTexto.trim()}
                className="w-10 h-10 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Send className="w-4 h-4 text-[#CCFF00]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
