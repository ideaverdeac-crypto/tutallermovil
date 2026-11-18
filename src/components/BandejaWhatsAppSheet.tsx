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
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface MensajeWhatsApp {
  id: string;
  telefono_remitente: string;
  nombre_remitente: string | null;
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
  const [mensajes, setMensajes] = useState<MensajeWhatsApp[]>([]);
  const [selectedTelefono, setSelectedTelefono] = useState<string | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorTabla, setErrorTabla] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar mensajes desde Supabase
  const cargarMensajes = async () => {
    try {
      setCargando(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('mensajes_whatsapp')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        // Puede ocurrir si la tabla aún no se ha creado en Supabase SQL editor
        console.warn('Nota sobre tabla mensajes_whatsapp:', error.message);
        setErrorTabla(error.message);
        return;
      }

      setErrorTabla(null);
      if (data) {
        setMensajes(data as MensajeWhatsApp[]);
      }
    } catch (err: any) {
      console.error('Error cargando mensajes de WhatsApp:', err);
      setErrorTabla(err?.message || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  // Cargar inicial y suscripción Realtime
  useEffect(() => {
    cargarMensajes();

    const supabase = createClient();
    const canal = supabase
      .channel('realtime_mensajes_whatsapp')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mensajes_whatsapp' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nuevo = payload.new as MensajeWhatsApp;
            setMensajes((prev) => {
              // Evitar duplicados
              if (prev.some((m) => m.id === nuevo.id)) return prev;
              return [...prev, nuevo];
            });
          } else if (payload.eventType === 'UPDATE') {
            const actualizado = payload.new as MensajeWhatsApp;
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
      supabase.removeChannel(canal);
    };
  }, []);

  // Calcular número total de no leídos
  const totalNoLeidos = useMemo(() => {
    return mensajes.filter((m) => !m.leido && !m.es_de_taller).length;
  }, [mensajes]);

  // Notificar al padre sobre cambios en los no leídos
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(totalNoLeidos);
    }
  }, [totalNoLeidos, onUnreadCountChange]);

  // Agrupar mensajes en conversaciones por telefono_remitente
  const conversaciones = useMemo(() => {
    const grupos: {
      [key: string]: {
        telefono: string;
        nombre: string;
        ultimoMensaje: MensajeWhatsApp;
        mensajes: MensajeWhatsApp[];
        noLeidos: number;
      };
    } = {};

    mensajes.forEach((m) => {
      const tel = m.telefono_remitente;
      if (!grupos[tel]) {
        grupos[tel] = {
          telefono: tel,
          nombre: m.nombre_remitente || `Usuario ${tel.slice(-4)}`,
          ultimoMensaje: m,
          mensajes: [],
          noLeidos: 0,
        };
      }

      grupos[tel].mensajes.push(m);
      grupos[tel].ultimoMensaje = m; // Al venir ordenados ascendentemente, el último es el más reciente
      if (m.nombre_remitente && (!grupos[tel].nombre || grupos[tel].nombre.startsWith('Usuario '))) {
        grupos[tel].nombre = m.nombre_remitente;
      }
      if (!m.leido && !m.es_de_taller) {
        grupos[tel].noLeidos += 1;
      }
    });

    // Convertir a array y ordenar por la fecha del último mensaje descendente
    return Object.values(grupos).sort((a, b) => {
      return (
        new Date(b.ultimoMensaje.created_at).getTime() -
        new Date(a.ultimoMensaje.created_at).getTime()
      );
    });
  }, [mensajes]);

  // Filtrar conversaciones según el buscador
  const conversacionesFiltradas = useMemo(() => {
    if (!filtroBusqueda.trim()) return conversaciones;
    const query = filtroBusqueda.toLowerCase();
    return conversaciones.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.telefono.toLowerCase().includes(query) ||
        c.ultimoMensaje.mensaje.toLowerCase().includes(query)
    );
  }, [conversaciones, filtroBusqueda]);

  // Si no hay conversación seleccionada, seleccionar la primera por defecto cuando cargue
  useEffect(() => {
    if (isOpen && conversaciones.length > 0 && !selectedTelefono) {
      setSelectedTelefono(conversaciones[0].telefono);
    }
  }, [isOpen, conversaciones, selectedTelefono]);

  // Marcar como leídos cuando se abre una conversación
  useEffect(() => {
    if (!selectedTelefono) return;

    const noLeidosDeEstaConv = mensajes.filter(
      (m) => m.telefono_remitente === selectedTelefono && !m.leido && !m.es_de_taller
    );

    if (noLeidosDeEstaConv.length > 0) {
      // Actualizar localmente de inmediato para reactividad
      setMensajes((prev) =>
        prev.map((m) =>
          m.telefono_remitente === selectedTelefono && !m.es_de_taller
            ? { ...m, leido: true }
            : m
        )
      );

      // Actualizar en base de datos
      const supabase = createClient();
      supabase
        .from('mensajes_whatsapp')
        .update({ leido: true })
        .eq('telefono_remitente', selectedTelefono)
        .eq('es_de_taller', false)
        .then(({ error }) => {
          if (error) console.error('Error actualizando estado de lectura:', error);
        });
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

  // Enviar mensaje como taller
  const handleEnviarMensaje = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevoMensaje.trim() || !selectedTelefono || enviando) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviando(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('mensajes_whatsapp').insert([
        {
          telefono_remitente: selectedTelefono,
          nombre_remitente: conversacionActiva?.nombre || 'Cliente',
          mensaje: texto,
          es_de_taller: true,
          leido: true,
        },
      ]).select();

      if (error) {
        console.error('Error enviando mensaje:', error);
        alert('No se pudo enviar el mensaje: ' + error.message);
      } else if (data && data.length > 0) {
        setMensajes((prev) => [...prev, data[0] as MensajeWhatsApp]);
      }
    } catch (err: any) {
      console.error('Error inesperado al enviar mensaje:', err);
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-wide">
                  Bandeja WhatsApp • Torre de Despacho
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Realtime
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atención unificada de clientes, mecánicos aliados y proveedores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cargarMensajes}
              disabled={cargando}
              title="Refrescar mensajes"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                <strong>Aviso de Configuración:</strong> Ejecuta la migración SQL <code>supabase/migrations/20261118_mensajes_whatsapp.sql</code> en el editor SQL de Supabase para activar la persistencia completa.
              </span>
            </div>
            <button
              onClick={cargarMensajes}
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
                  placeholder="Buscar por nombre, teléfono o texto..."
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
                  const fecha = new Date(c.ultimoMensaje.created_at);
                  const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button
                      key={c.telefono}
                      onClick={() => setSelectedTelefono(c.telefono)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
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
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
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
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {c.ultimoMensaje.es_de_taller && (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <p className="truncate">{c.ultimoMensaje.mensaje}</p>
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
                <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {conversacionActiva.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {conversacionActiva.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {conversacionActiva.telefono}
                      </p>
                    </div>
                  </div>

                  {/* Acceso directo a WhatsApp Web */}
                  <a
                    href={`https://wa.me/${conversacionActiva.telefono.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en WA Web
                  </a>
                </div>

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
                      className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-[240px]"
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
                    className="flex-1 px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                    disabled={enviando}
                  />

                  <button
                    type="submit"
                    disabled={!nuevoMensaje.trim() || enviando}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span>Enviar</span>
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
                  Elige un chat de la lista izquierda para ver el historial y responder directamente desde la Torre de Despacho.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
