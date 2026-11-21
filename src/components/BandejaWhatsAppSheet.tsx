'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Check, 
  CheckCheck, 
  Search, 
  X, 
  ExternalLink, 
  User, 
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Bot,
  UserCheck,
  Car,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export type BotEstado = 'INICIANDO' | 'PREGUNTANDO_CARRO' | 'PREGUNTANDO_FALLA' | 'HUMANO';

export interface WhatsAppChat {
  id: string;
  telefono: string;
  nombre?: string | null;
  nombre_cliente?: string | null;
  vehiculo?: string | null;
  vehiculo_info?: string | null;
  falla?: string | null;
  estado?: BotEstado;
  estado_bot?: BotEstado;
  ultimo_mensaje?: string | null;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
  actualizado_en?: string;
}

export interface WhatsAppMensaje {
  id: string;
  chat_id?: string | null;
  telefono: string;
  mensaje: string;
  es_de_taller: boolean;
  leido: boolean;
  created_at: string;
}

interface BandejaWhatsAppSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function BandejaWhatsAppSheet({
  isOpen,
  onClose,
  onUnreadCountChange,
}: BandejaWhatsAppSheetProps) {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [mensajes, setMensajes] = useState<WhatsAppMensaje[]>([]);
  const [selectedTelefono, setSelectedTelefono] = useState<string | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorTabla, setErrorTabla] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar chats y mensajes desde Supabase
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const supabase = createClient();

      // 1. Intentar cargar desde whatsapp_chats
      let chatsQuery = supabase.from('whatsapp_chats').select('*');
      const { data: chatsData, error: chatsError } = await chatsQuery;

      // 2. Cargar mensajes desde whatsapp_mensajes
      const { data: msgsData, error: msgsError } = await supabase
        .from('whatsapp_mensajes')
        .select('*')
        .order('created_at', { ascending: true });

      // Si falla whatsapp_mensajes, intentar con mensajes_whatsapp como fallback
      if (msgsError) {
        console.warn('Fallback a mensajes_whatsapp:', msgsError.message);
        const { data: oldMsgsData, error: oldMsgsError } = await supabase
          .from('mensajes_whatsapp')
          .select('*')
          .order('created_at', { ascending: true });

        if (oldMsgsError && chatsError) {
          setErrorTabla(msgsError.message);
        } else {
          setErrorTabla(null);
        }

        if (oldMsgsData) {
          const mapped: WhatsAppMensaje[] = oldMsgsData.map((m: any) => ({
            id: m.id,
            chat_id: null,
            telefono: m.telefono_remitente,
            mensaje: m.mensaje,
            es_de_taller: m.es_de_taller,
            leido: m.leido,
            created_at: m.created_at,
          }));
          setMensajes(mapped);
        }
      } else {
        setErrorTabla(null);
        if (msgsData) {
          setMensajes(msgsData as WhatsAppMensaje[]);
        }
      }

      if (chatsData) {
        setChats(chatsData as WhatsAppChat[]);
      }
    } catch (err: any) {
      console.error('Error cargando bandeja WhatsApp:', err);
      setErrorTabla(err?.message || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  // Cargar inicial y suscripción Realtime a ambas tablas
  useEffect(() => {
    cargarDatos();

    const supabase = createClient();

    // Canal para whatsapp_chats
    const canalChats = supabase
      .channel('realtime_whatsapp_chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_chats' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nuevo = payload.new as WhatsAppChat;
            setChats((prev) => {
              if (prev.some((c) => c.id === nuevo.id || c.telefono === nuevo.telefono)) {
                return prev.map((c) => c.telefono === nuevo.telefono ? nuevo : c);
              }
              return [nuevo, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const actualizado = payload.new as WhatsAppChat;
            setChats((prev) =>
              prev.map((c) => (c.telefono === actualizado.telefono ? actualizado : c))
            );
          } else if (payload.eventType === 'DELETE') {
            const eliminado = payload.old as { id: string };
            setChats((prev) => prev.filter((c) => c.id !== eliminado.id));
          }
        }
      )
      .subscribe();

    // Canal para whatsapp_mensajes
    const canalMensajes = supabase
      .channel('realtime_whatsapp_mensajes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_mensajes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nuevo = payload.new as WhatsAppMensaje;
            setMensajes((prev) => {
              if (prev.some((m) => m.id === nuevo.id)) return prev;
              return [...prev, nuevo];
            });
          } else if (payload.eventType === 'UPDATE') {
            const actualizado = payload.new as WhatsAppMensaje;
            setMensajes((prev) =>
              prev.map((m) => (m.id === actualizado.id ? actualizado : m))
            );
          } else if (payload.eventType === 'DELETE') {
            const eliminado = payload.old as { id: string };
            setMensajes((prev) => prev.filter((m) => m.id !== eliminado.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalChats);
      supabase.removeChannel(canalMensajes);
    };
  }, []);

  // Calcular número total de mensajes no leídos del cliente
  const totalNoLeidos = useMemo(() => {
    return mensajes.filter((m) => !m.leido && !m.es_de_taller).length;
  }, [mensajes]);

  // Notificar al padre sobre cambios en los no leídos
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(totalNoLeidos);
    }
  }, [totalNoLeidos, onUnreadCountChange]);

  // Consolidar lista de conversaciones uniendo `chats` y `mensajes`
  const conversaciones = useMemo(() => {
    const mapa = new Map<string, {
      chat?: WhatsAppChat;
      telefono: string;
      nombre: string;
      vehiculo?: string;
      falla?: string;
      estado: BotEstado;
      ultimoMensajeTexto: string;
      ultimoMensajeFecha: string;
      esDeTaller: boolean;
      noLeidos: number;
      mensajes: WhatsAppMensaje[];
    }>();

    // 1. Agregar desde tabla `chats`
    chats.forEach((chat) => {
      const nombreFinal = chat.nombre_cliente || chat.nombre || `Usuario +${chat.telefono.slice(-4)}`;
      const estadoFinal = (chat.estado_bot || chat.estado || 'INICIANDO') as BotEstado;
      const vehiculoFinal = chat.vehiculo_info || chat.vehiculo || undefined;
      const fechaFinal = chat.actualizado_en || chat.updated_at || chat.created_at || new Date().toISOString();

      mapa.set(chat.telefono, {
        chat,
        telefono: chat.telefono,
        nombre: nombreFinal,
        vehiculo: vehiculoFinal,
        falla: chat.falla || undefined,
        estado: estadoFinal,
        ultimoMensajeTexto: chat.ultimo_mensaje || 'Conversación iniciada',
        ultimoMensajeFecha: fechaFinal,
        esDeTaller: false,
        noLeidos: chat.unread_count || 0,
        mensajes: [],
      });
    });

    // 2. Asociar los mensajes
    mensajes.forEach((m) => {
      const tel = m.telefono;
      let conv = mapa.get(tel);
      if (!conv) {
        conv = {
          telefono: tel,
          nombre: `Usuario +${tel.slice(-4)}`,
          estado: 'HUMANO',
          ultimoMensajeTexto: m.mensaje,
          ultimoMensajeFecha: m.created_at,
          esDeTaller: m.es_de_taller,
          noLeidos: 0,
          mensajes: [],
        };
        mapa.set(tel, conv);
      }

      conv.mensajes.push(m);
      conv.ultimoMensajeTexto = m.mensaje;
      conv.ultimoMensajeFecha = m.created_at;
      conv.esDeTaller = m.es_de_taller;
      if (!m.leido && !m.es_de_taller) {
        conv.noLeidos += 1;
      }
    });

    // 3. Ordenar descendentemente por la fecha del último mensaje
    return Array.from(mapa.values()).sort((a, b) => {
      return new Date(b.ultimoMensajeFecha).getTime() - new Date(a.ultimoMensajeFecha).getTime();
    });
  }, [chats, mensajes]);

  // Filtrar conversaciones según el buscador
  const conversacionesFiltradas = useMemo(() => {
    if (!filtroBusqueda.trim()) return conversaciones;
    const query = filtroBusqueda.toLowerCase();
    return conversaciones.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.telefono.toLowerCase().includes(query) ||
        c.ultimoMensajeTexto.toLowerCase().includes(query) ||
        (c.vehiculo && c.vehiculo.toLowerCase().includes(query)) ||
        (c.falla && c.falla.toLowerCase().includes(query))
    );
  }, [conversaciones, filtroBusqueda]);

  // Seleccionar la primera conversación al abrir si no hay ninguna
  useEffect(() => {
    if (isOpen && conversaciones.length > 0 && !selectedTelefono) {
      setSelectedTelefono(conversaciones[0].telefono);
    }
  }, [isOpen, conversaciones, selectedTelefono]);

  // Marcar como leídos cuando se abre una conversación
  useEffect(() => {
    if (!selectedTelefono) return;

    const noLeidosDeEstaConv = mensajes.filter(
      (m) => m.telefono === selectedTelefono && !m.leido && !m.es_de_taller
    );

    if (noLeidosDeEstaConv.length > 0) {
      setMensajes((prev) =>
        prev.map((m) =>
          m.telefono === selectedTelefono && !m.es_de_taller
            ? { ...m, leido: true }
            : m
        )
      );

      const supabase = createClient();
      supabase
        .from('whatsapp_mensajes')
        .update({ leido: true })
        .eq('telefono', selectedTelefono)
        .eq('es_de_taller', false)
        .then(() => {});

      supabase
        .from('whatsapp_chats')
        .update({ unread_count: 0 })
        .eq('telefono', selectedTelefono)
        .then(() => {});
    }
  }, [selectedTelefono, mensajes]);

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTelefono, mensajes]);

  // Conversación activa
  const conversacionActiva = useMemo(() => {
    return conversaciones.find((c) => c.telefono === selectedTelefono) || null;
  }, [conversaciones, selectedTelefono]);

  // Forzar cambio de estado a HUMANO (Handoff manual por la operadora)
  const handleTomarControlHumano = async () => {
    if (!conversacionActiva || cambiandoEstado) return;
    setCambiandoEstado(true);
    try {
      const supabase = createClient();
      await supabase
        .from('whatsapp_chats')
        .update({ estado_bot: 'HUMANO', actualizado_en: new Date().toISOString() })
        .eq('telefono', conversacionActiva.telefono);

      setChats((prev) =>
        prev.map((c) =>
          c.telefono === conversacionActiva.telefono ? { ...c, estado_bot: 'HUMANO', estado: 'HUMANO' } : c
        )
      );
    } catch (e) {
      console.error('Error al tomar control humano:', e);
    } finally {
      setCambiandoEstado(false);
    }
  };

  // Enviar mensaje como operadora (usando el endpoint seguro /api/whatsapp/send)
  const handleEnviarMensaje = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevoMensaje.trim() || !selectedTelefono || enviando) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviando(true);

    // Mensaje optimista local
    const tempId = 'temp-' + Date.now();
    const mensajeOptimista: WhatsAppMensaje = {
      id: tempId,
      chat_id: conversacionActiva?.chat?.id || null,
      telefono: selectedTelefono,
      mensaje: texto,
      es_de_taller: true,
      leido: true,
      created_at: new Date().toISOString(),
    };
    setMensajes((prev) => [...prev, mensajeOptimista]);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: selectedTelefono,
          mensaje: texto,
          chatId: conversacionActiva?.chat?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('Aviso al enviar WhatsApp:', data.error);
      }
    } catch (err: any) {
      console.error('Error al enviar WhatsApp:', err);
    } finally {
      setEnviando(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Plantillas de respuestas rápidas
  const respuestasRapidas = [
    '¡Hola! Un gusto atenderte. ¿En qué zona de Caracas te encuentras?',
    'Tu orden ha sido asignada. El mecánico va en camino con escáner profesional.',
    'Ya estamos cotizando los repuestos originales para tu vehículo.',
    'Servicio finalizado con éxito. Puedes consultar tu Pasaporte Digital en línea.',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Superior del Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-wide">
                  Chats WhatsApp • Torre de Despacho
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Realtime & Chatbot
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atención unificada de clientes, mecánicos aliados y proveedores con Handoff Humano
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              disabled={cargando}
              title="Refrescar mensajes"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar bandeja"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerta si la tabla no existe aún */}
        {errorTabla && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Aviso de Configuración:</strong> Ejecuta la migración SQL <code>supabase/migrations/20261118_whatsapp_chatbot_handoff.sql</code> en el editor SQL de Supabase para activar la persistencia del Chatbot.
              </span>
            </div>
            <button
              onClick={cargarDatos}
              className="text-xs underline font-semibold hover:text-amber-900 dark:hover:text-amber-100"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Cuerpo: Estilo WhatsApp Web de 2 Columnas */}
        <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950">
          
          {/* ================================================================= */}
          {/* COLUMNA IZQUIERDA: LISTA DE CONVERSACIONES                        */}
          {/* ================================================================= */}
          <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
            {/* Buscador */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono, carro..."
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Listado de Chats */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {cargando && conversaciones.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                  <span>Sincronizando chats...</span>
                </div>
              ) : conversacionesFiltradas.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {filtroBusqueda ? 'Sin resultados' : 'Bandeja en Cero'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      {filtroBusqueda
                        ? 'No se encontraron conversaciones con ese criterio.'
                        : 'Los mensajes que envíen clientes o aliados aparecerán aquí en tiempo real.'}
                    </p>
                  </div>
                </div>
              ) : (
                conversacionesFiltradas.map((c) => {
                  const isSelected = c.telefono === selectedTelefono;
                  const fecha = new Date(c.ultimoMensajeFecha);
                  const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  // Badges de estado según máquina de estados del bot
                  const getEstadoBadge = (estado: BotEstado) => {
                    switch (estado) {
                      case 'INICIANDO':
                        return { label: 'Bot: Nombre', bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: Bot };
                      case 'PREGUNTANDO_CARRO':
                        return { label: 'Bot: Vehículo', bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: Car };
                      case 'PREGUNTANDO_FALLA':
                        return { label: 'Bot: Falla', bg: 'bg-orange-100 text-orange-700 border-orange-200', icon: Wrench };
                      case 'HUMANO':
                      default:
                        return { label: 'Operador', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: UserCheck };
                    }
                  };

                  const badgeInfo = getEstadoBadge(c.estado);
                  const BadgeIcon = badgeInfo.icon;

                  return (
                    <button
                      key={c.telefono}
                      onClick={() => setSelectedTelefono(c.telefono)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-emerald-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        {c.noLeidos > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm animate-pulse">
                            {c.noLeidos}
                          </span>
                        )}
                      </div>

                      {/* Info de la conversación */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {c.nombre}
                          </h3>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {horaStr}
                          </span>
                        </div>

                        {/* Badge de Estado del Chatbot */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeInfo.bg}`}>
                            <BadgeIcon className="w-2.5 h-2.5" />
                            {badgeInfo.label}
                          </span>
                          {c.vehiculo && (
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                              🚗 {c.vehiculo}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {c.esDeTaller && (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <p className="truncate">{c.ultimoMensajeTexto}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                          {c.telefono}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* COLUMNA DERECHA: HISTORIAL Y ENVIAR RESPUESTA                     */}
          {/* ================================================================= */}
          <div className="flex-1 flex flex-col bg-slate-100/50 dark:bg-slate-950 overflow-hidden">
            {conversacionActiva ? (
              <>
                {/* Cabecera del chat seleccionado */}
                <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {conversacionActiva.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {conversacionActiva.nombre}
                        </h3>
                        {conversacionActiva.estado === 'HUMANO' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            Control Humano
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <Bot className="w-3 h-3 text-amber-600" />
                            Bot Activo ({conversacionActiva.estado})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {conversacionActiva.telefono}
                      </p>
                    </div>
                  </div>

                  {/* Acciones de Cabecera */}
                  <div className="flex items-center gap-2 shrink-0">
                    {conversacionActiva.estado !== 'HUMANO' && (
                      <button
                        type="button"
                        onClick={handleTomarControlHumano}
                        disabled={cambiandoEstado}
                        className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold bg-[#0A1525] hover:bg-slate-800 text-[#CCFF00] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Tomar control del chat e interrumpir al bot"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tomar Control Humano</span>
                      </button>
                    )}

                    <a
                      href={`https://wa.me/${conversacionActiva.telefono.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Abrir en WA Web</span>
                    </a>
                  </div>
                </div>

                {/* Banner de Datos Recopilados por el Bot (Vehículo y Falla) */}
                {(conversacionActiva.vehiculo || conversacionActiva.falla) && (
                  <div className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-b border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      {conversacionActiva.vehiculo && (
                        <div className="flex items-center gap-1.5 text-[#0A1525] dark:text-slate-200">
                          <Car className="w-3.5 h-3.5 text-[#1E56B0]" />
                          <span className="text-[11px] font-bold">Vehículo:</span>
                          <span className="font-extrabold text-[#1E56B0]">{conversacionActiva.vehiculo}</span>
                        </div>
                      )}
                      {conversacionActiva.falla && (
                        <div className="flex items-center gap-1.5 text-[#0A1525] dark:text-slate-200">
                          <Wrench className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[11px] font-bold">Falla:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{conversacionActiva.falla}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-slate-700 shadow-2xs">
                      Datos capturados por Bot
                    </span>
                  </div>
                )}

                {/* Burbujas de Chat */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversacionActiva.mensajes.map((m) => {
                    const hora = new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.es_de_taller ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed relative ${
                            m.es_de_taller
                              ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-800/80 dark:text-emerald-50 rounded-br-none border border-emerald-200 dark:border-emerald-700/50'
                              : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          {/* Contenido del mensaje */}
                          <p className="whitespace-pre-wrap break-words">{m.mensaje}</p>

                          {/* Metadata hora y checks */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              m.es_de_taller
                                ? 'text-emerald-800 dark:text-emerald-300'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <span>{hora}</span>
                            {m.es_de_taller && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 ${
                                  m.leido ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Respuestas rápidas */}
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Respuestas rápidas:
                  </span>
                  {respuestasRapidas.map((resp, i) => (
                    <button
                      key={i}
                      onClick={() => setNuevoMensaje(resp)}
                      className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-[240px] cursor-pointer"
                    >
                      {resp}
                    </button>
                  ))}
                </div>

                {/* Área de envío de respuesta */}
                <form
                  onSubmit={handleEnviarMensaje}
                  className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder={`Escribir respuesta para ${conversacionActiva.nombre}...`}
                    className="flex-1 px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all font-medium"
                    disabled={enviando}
                  />

                  <button
                    type="submit"
                    disabled={!nuevoMensaje.trim() || enviando}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{enviando ? 'Enviando...' : 'Enviar'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  Selecciona una conversación
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Elige un chat de la lista izquierda para ver el historial, revisar los datos recolectados por el chatbot y responder en vivo desde la Torre de Despacho.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
