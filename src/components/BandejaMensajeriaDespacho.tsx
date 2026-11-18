'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  ConversacionChat,
  MensajeChat,
  cargarTodasLasConversaciones,
  cargarMensajesConversacion,
  enviarMensajeChat,
  RESPUESTAS_RAPIDAS_OPERATIVAS,
  FOTO_OPERADORA_DEFAULT,
  CONVERSACIONES_INICIALES_DEMO
} from '@/lib/chat';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Phone,
  Car,
  Check,
  CheckCheck,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react';

interface BandejaMensajeriaDespachoProps {
  operadoraActual: {
    nombre: string;
    email: string;
    fotoUrl?: string;
  };
  onIrAKanbanConPlaca?: (placa: string) => void;
}

export default function BandejaMensajeriaDespacho({
  operadoraActual,
  onIrAKanbanConPlaca
}: BandejaMensajeriaDespachoProps) {
  const [conversaciones, setConversaciones] = useState<ConversacionChat[]>(CONVERSACIONES_INICIALES_DEMO);
  const [conversacionActivaId, setConversacionActivaId] = useState<string>(CONVERSACIONES_INICIALES_DEMO[0].id);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCanal, setFiltroCanal] = useState<'todos' | 'garaje_web' | 'whatsapp'>('todos');
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const conversacionActiva = conversaciones.find((c) => c.id === conversacionActivaId) || conversaciones[0];

  // Auto scroll al final de los mensajes
  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Cargar lista de conversaciones
  const refrescarConversaciones = async () => {
    setCargando(true);
    const data = await cargarTodasLasConversaciones();
    setConversaciones(data);
    setCargando(false);
  };

  useEffect(() => {
    refrescarConversaciones();

    const supabase = createClient();
    // Suscripción en tiempo real a nuevas conversaciones o actualizaciones
    const channel = supabase
      .channel('despacho_mensajeria_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversaciones_whatsapp' },
        (payload) => {
          refrescarConversaciones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Cargar mensajes de la conversación activa
  useEffect(() => {
    if (!conversacionActivaId) return;

    let cancelado = false;
    cargarMensajesConversacion(conversacionActivaId).then((data) => {
      if (!cancelado) {
        setMensajes(data);
      }
    });

    // Suscripción Realtime a mensajes de esta conversación
    const supabase = createClient();
    const chatChannel = supabase
      .channel(`chat_${conversacionActivaId}`)
      .on('broadcast', { event: 'nuevo_mensaje' }, ({ payload }) => {
        setMensajes((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `conversacion_id=eq.${conversacionActivaId}`
        },
        (payload) => {
          setMensajes((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as MensajeChat];
          });
        }
      )
      .subscribe();

    return () => {
      cancelado = true;
      supabase.removeChannel(chatChannel);
    };
  }, [conversacionActivaId]);

  // Enviar mensaje
  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevoTexto.trim() || !conversacionActiva) return;

    const textoAEnviar = nuevoTexto.trim();
    setNuevoTexto('');
    setEnviando(true);

    const remitenteFoto = operadoraActual.fotoUrl || FOTO_OPERADORA_DEFAULT;

    // Optimista
    const tempId = `temp-${Date.now()}`;
    const optimista: MensajeChat = {
      id: tempId,
      conversacion_id: conversacionActiva.id,
      remitente_tipo: 'operadora',
      remitente_nombre: operadoraActual.nombre || 'Operadora Central',
      remitente_foto: remitenteFoto,
      contenido: textoAEnviar,
      tipo: 'texto',
      leido: true,
      created_at: new Date().toISOString()
    };

    setMensajes((prev) => [...prev, optimista]);

    // Actualizar conversación optimista
    setConversaciones((prev) =>
      prev.map((c) =>
        c.id === conversacionActiva.id
          ? { ...c, ultimo_mensaje: textoAEnviar, ultimo_mensaje_at: optimista.created_at }
          : c
      )
    );

    await enviarMensajeChat({
      conversacionId: conversacionActiva.id,
      remitenteTipo: 'operadora',
      remitenteNombre: operadoraActual.nombre || 'Operadora Central',
      remitenteFoto: remitenteFoto,
      contenido: textoAEnviar
    });

    setEnviando(false);
  };

  // Enviar respuesta rápida con un clic
  const handleEnviarRespuestaRapida = (texto: string) => {
    setNuevoTexto(texto);
  };

  // Filtrado de conversaciones
  const conversacionesFiltradas = conversaciones.filter((c) => {
    const coincideTexto =
      c.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.vehiculo_info && c.vehiculo_info.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideCanal =
      filtroCanal === 'todos' ||
      (filtroCanal === 'whatsapp' && c.canal === 'whatsapp') ||
      (filtroCanal === 'garaje_web' && c.canal === 'garaje_web');

    return coincideTexto && coincideCanal;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-190px)] min-h-[650px]">
      
      {/* 1. Header de la Bandeja */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] flex items-center justify-center text-[#0A1525] shadow-md shadow-lime-900/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white">
                Bandeja Central de Mensajería &amp; WhatsApp
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Realtime Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Atención directa a clientes de Mi Garaje y WhatsApp vinculados por placa vehicular.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refrescarConversaciones}
            className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 2. Cuerpo en 3 Columnas (Lista de Chats | Chat Activo | Ficha de Vehículo) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANEL IZQUIERDO: Selector de Chats */}
        <div className="w-80 sm:w-96 border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0">
          {/* Buscador & Filtros */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por placa, cliente o modelo..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all font-medium"
              />
            </div>

            {/* Píldoras de Filtro */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFiltroCanal('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filtroCanal === 'todos'
                    ? 'bg-[#0A1525] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({conversaciones.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroCanal('garaje_web')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  filtroCanal === 'garaje_web'
                    ? 'bg-[#1E56B0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Car className="w-3 h-3" /> Garaje Web
              </button>
              <button
                type="button"
                onClick={() => setFiltroCanal('whatsapp')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  filtroCanal === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> WhatsApp
              </button>
            </div>
          </div>

          {/* Lista de Conversaciones */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversacionesFiltradas.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No se encontraron conversaciones</p>
              </div>
            ) : (
              conversacionesFiltradas.map((conv) => {
                const esActivo = conv.id === conversacionActiva?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setConversacionActivaId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left relative ${
                      esActivo
                        ? 'bg-white border-l-4 border-l-[#1E56B0] shadow-sm'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    {/* Avatar del Cliente / Placa */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0A1525] to-[#1E56B0] text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {conv.cliente_nombre.slice(0, 2).toUpperCase()}
                      </div>
                      {conv.canal === 'whatsapp' ? (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-black" title="WhatsApp Oficial">
                          W
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1E56B0] border-2 border-white flex items-center justify-center text-[8px] text-white font-black" title="Mi Garaje Web">
                          G
                        </span>
                      )}
                    </div>

                    {/* Resumen */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-black text-[#0A1525] truncate">
                          {conv.cliente_nombre}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {conv.ultimo_mensaje_at
                            ? new Date(conv.ultimo_mensaje_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Hoy'}
                        </span>
                      </div>

                      {/* Placa y Vehículo */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#CCFF00] text-[#0A1525] font-mono font-black text-[10px] tracking-wider">
                          {conv.placa}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate font-semibold">
                          {conv.vehiculo_info}
                        </span>
                      </div>

                      {/* Último Mensaje */}
                      <p className="text-[11px] text-slate-600 truncate">
                        {conv.ultimo_mensaje || 'Conversación iniciada'}
                      </p>
                    </div>

                    {/* Indicador de No Leídos */}
                    {conv.no_leidos_operadora > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {conv.no_leidos_operadora}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL CENTRAL: Ventana de Conversación Activa */}
        <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
          
          {/* Header del Chat */}
          {conversacionActiva && (
            <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0A1525] to-[#1E56B0] text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {conversacionActiva.cliente_nombre.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#0A1525]">
                      {conversacionActiva.cliente_nombre}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#CCFF00] text-[#0A1525] font-mono font-black text-[11px] rounded-lg tracking-wider border border-[#0A1525]/10">
                      {conversacionActiva.placa}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                      • {conversacionActiva.vehiculo_info}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>Teléfono: <strong className="text-slate-800">{conversacionActiva.cliente_telefono || 'No registrado'}</strong></span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En línea
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas del Header */}
              <div className="flex items-center gap-2">
                {conversacionActiva.cliente_telefono && (
                  <a
                    href={`https://wa.me/${conversacionActiva.cliente_telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hola ${conversacionActiva.cliente_nombre}, te escribe ${operadoraActual.nombre} de TuTallerMóvil sobre tu vehículo placa ${conversacionActiva.placa}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-200 transition-colors shadow-2xs"
                    title="Abrir chat externo en WhatsApp"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="hidden sm:inline">WhatsApp Web</span>
                  </a>
                )}

                {onIrAKanbanConPlaca && (
                  <button
                    type="button"
                    onClick={() => onIrAKanbanConPlaca(conversacionActiva.placa)}
                    className="h-9 px-3 bg-[#1E56B0]/10 hover:bg-[#1E56B0]/20 text-[#1E56B0] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Ver orden en el Tablero Kanban"
                  >
                    <span>Ver en Kanban</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Área de Mensajes con Scroll */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {mensajes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  No hay mensajes anteriores en esta conversación.
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm text-center">
                  Utiliza las respuestas rápidas o escribe abajo para iniciar la asistencia técnica con el cliente.
                </p>
              </div>
            ) : (
              mensajes.map((m) => {
                const esOperadora = m.remitente_tipo === 'operadora';
                const esSistema = m.remitente_tipo === 'sistema';

                if (esSistema) {
                  return (
                    <div key={m.id} className="flex justify-center my-2">
                      <div className="bg-slate-200/80 text-slate-700 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs border border-slate-300">
                        <Zap className="w-3 h-3 text-[#1E56B0]" />
                        <span>{m.contenido}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2.5 ${esOperadora ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar en caso de cliente */}
                    {!esOperadora && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mb-1">
                        {m.remitente_nombre.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Burbuja de Mensaje */}
                    <div
                      className={`max-w-md sm:max-w-lg rounded-2xl p-3.5 text-xs shadow-xs relative ${
                        esOperadora
                          ? 'bg-[#0A1525] text-white rounded-br-2xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`text-[10px] font-black ${esOperadora ? 'text-[#CCFF00]' : 'text-[#1E56B0]'}`}>
                          {m.remitente_nombre} {esOperadora && '(Operadora TTM)'}
                        </span>
                        <span className={`text-[9px] ${esOperadora ? 'text-slate-400' : 'text-slate-400'}`}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap font-medium">
                        {m.contenido}
                      </p>

                      {esOperadora && (
                        <div className="flex justify-end mt-1">
                          <CheckCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                        </div>
                      )}
                    </div>

                    {/* Foto en caso de operadora */}
                    {esOperadora && (
                      <img
                        src={m.remitente_foto || operadoraActual.fotoUrl || FOTO_OPERADORA_DEFAULT}
                        alt="Operadora"
                        className="w-8 h-8 rounded-full object-cover border border-white shadow-xs shrink-0 mb-1"
                      />
                    )}
                  </div>
                );
              })
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* BARRA DE RESPUESTAS RÁPIDAS OPERATIVAS (Quick Replies) */}
          <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Respuestas Rápidas:
            </span>
            {RESPUESTAS_RAPIDAS_OPERATIVAS.map((rr) => (
              <button
                key={rr.id}
                type="button"
                onClick={() => handleEnviarRespuestaRapida(rr.texto)}
                className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-[#CCFF00]/30 hover:border-[#0A1525]/30 text-slate-700 hover:text-[#0A1525] rounded-lg text-xs font-bold border border-slate-200 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                title={rr.texto}
              >
                {rr.titulo}
              </button>
            ))}
          </div>

          {/* Input de Mensaje y Botón de Envío */}
          <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              placeholder={`Escribe un mensaje como ${operadoraActual.nombre}...`}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E56B0] transition-all font-medium"
            />
            <button
              type="submit"
              disabled={enviando || !nuevoTexto.trim()}
              className="h-11 px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-[#0A1525] font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-lime-900/10 cursor-pointer disabled:cursor-not-allowed border border-[#0A1525]/15 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

        </div>

        {/* PANEL DERECHO: Ficha Rápida del Vehículo & Cliente */}
        {conversacionActiva && (
          <div className="w-72 border-l border-slate-200 p-5 bg-white hidden xl:flex flex-col justify-between shrink-0">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Ficha Rápida del Vehículo
                </p>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-[#CCFF00] text-[#0A1525] font-mono font-black text-xs">
                      {conversacionActiva.placa}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verificado
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#0A1525]">
                    {conversacionActiva.vehiculo_info}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Propietario: <strong className="text-slate-800">{conversacionActiva.cliente_nombre}</strong>
                  </p>
                </div>
              </div>

              {/* Botón de Historial Médico */}
              <div>
                <Link
                  href={`/historial/${conversacionActiva.placa}`}
                  target="_blank"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A1525] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1E56B0]" />
                  <span>Historial Médico del Carro</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>

              {/* Garantías y Soporte */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-[#1E56B0] font-black text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-[#1E56B0]" />
                  <span>Protocolo de Garantía TTM</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Toda cotización aprobada por este canal queda respaldada con el Fondo de Garantía QA y repuestos certificados.
                </p>
              </div>
            </div>

            {/* Operadora Responsable */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
              <img
                src={operadoraActual.fotoUrl || FOTO_OPERADORA_DEFAULT}
                alt="Operadora"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0A1525] truncate">
                  {operadoraActual.nombre}
                </p>
                <p className="text-[10px] text-slate-500">Operadora en turno</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
