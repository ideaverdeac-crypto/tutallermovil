/**
 * Servicio Central de Mensajería y Chat en Vivo (TuTallerMóvil 2027)
 * Conexión en tiempo real entre la Torre de Despacho (/admin/despacho)
 * y el Portal del Cliente / Mi Garaje (/cliente/dashboard).
 */

import { createClient } from '@/lib/supabase/client';

export interface ConversacionChat {
  id: string;
  cliente_nombre: string;
  cliente_telefono?: string | null;
  cliente_email?: string | null;
  placa: string;
  vehiculo_info?: string | null;
  operadora_id?: string | null;
  operadora_nombre: string;
  operadora_foto: string;
  ultimo_mensaje?: string | null;
  ultimo_mensaje_at?: string;
  no_leidos_operadora: number;
  no_leidos_cliente: number;
  estado: 'activa' | 'archivada' | 'resuelta';
  canal: 'garaje_web' | 'whatsapp';
  created_at?: string;
  updated_at?: string;
}

export interface MensajeChat {
  id: string;
  conversacion_id: string;
  remitente_tipo: 'cliente' | 'operadora' | 'sistema';
  remitente_nombre: string;
  remitente_foto?: string | null;
  contenido: string;
  tipo?: 'texto' | 'imagen' | 'cotizacion' | 'ubicacion' | 'estado_orden';
  metadata?: Record<string, any>;
  leido?: boolean;
  created_at: string;
}

export interface RespuestaRapida {
  id: string;
  titulo: string;
  texto: string;
  categoria: 'saludo' | 'ruta' | 'diagnostico' | 'cotizacion' | 'seguridad' | 'cierre';
}

export const FOTO_OPERADORA_DEFAULT =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';

export const RESPUESTAS_RAPIDAS_OPERATIVAS: RespuestaRapida[] = [
  {
    id: 'rr-saludo',
    titulo: '👋 Saludo Oficial',
    texto: '¡Hola! Te escribe Andrea desde la Torre de Despacho de TuTallerMóvil. ¿En qué podemos ayudarte con tu vehículo hoy?',
    categoria: 'saludo'
  },
  {
    id: 'rr-ruta',
    titulo: '📍 Mecánico en Ruta (< 35 min)',
    texto: 'Tu especialista asignado ya se encuentra en ruta hacia tu dirección. Tiempo de llegada estimado: menor a 35 minutos.',
    categoria: 'ruta'
  },
  {
    id: 'rr-carnet',
    titulo: '🛡️ Verificar Carnet QR',
    texto: 'Por tu seguridad, antes de autorizar el acceso solicita al técnico su Carnet Digital y escanea su código QR antifraude oficial.',
    categoria: 'seguridad'
  },
  {
    id: 'rr-diagnostico',
    titulo: '📋 Inspección 25 Puntos',
    texto: 'El especialista ha completado la inspección técnica de 25 puntos. El diagnóstico computarizado ($15 USD) quedará 100% EXONERADO si apruebas la reparación hoy.',
    categoria: 'diagnostico'
  },
  {
    id: 'rr-cotizacion',
    titulo: '💰 Cotización con Repuestos',
    texto: 'Tu presupuesto formal ya está listo en el sistema con repuestos nuevos certificados y mano de obra garantizada por 90 días.',
    categoria: 'cotizacion'
  },
  {
    id: 'rr-pago',
    titulo: '✅ Pago Validado & Garantía',
    texto: 'Hemos validado tu pago exitosamente. Tu vehículo ya cuenta con la Garantía de Mano de Obra activa y el servicio fue archivado en su Historial Médico.',
    categoria: 'cierre'
  }
];

export const CONVERSACIONES_INICIALES_DEMO: ConversacionChat[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    cliente_nombre: 'María Rodríguez',
    cliente_telefono: '+58 412 123 4567',
    cliente_email: 'maria.rodriguez@tutallermovil.com',
    placa: 'AB123CD',
    vehiculo_info: 'Toyota Corolla GLi 1.8L (2018)',
    operadora_nombre: 'Andrea Silva (Central TTM)',
    operadora_foto: FOTO_OPERADORA_DEFAULT,
    ultimo_mensaje: 'Perfecto Andrea, apruebo el cambio de pastillas delanteras. Quedo atenta al técnico.',
    ultimo_mensaje_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    no_leidos_operadora: 1,
    no_leidos_cliente: 0,
    estado: 'activa',
    canal: 'garaje_web'
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    cliente_nombre: 'Carlos Gómez',
    cliente_telefono: '+58 414 987 6543',
    cliente_email: 'carlos.gomez@gmail.com',
    placa: 'AD456EF',
    vehiculo_info: 'Ford Explorer XLT 4x4 (2020)',
    operadora_nombre: 'Andrea Silva (Central TTM)',
    operadora_foto: FOTO_OPERADORA_DEFAULT,
    ultimo_mensaje: 'Carlos ya va en camino hacia Chacao. Te llegará en aproximadamente 25 minutos con su Credencial QR.',
    ultimo_mensaje_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    no_leidos_operadora: 0,
    no_leidos_cliente: 1,
    estado: 'activa',
    canal: 'whatsapp'
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    cliente_nombre: 'Transportes Ávila C.A. (B2B)',
    cliente_telefono: '+58 416 555 1212',
    cliente_email: 'flotas@transportesavila.com',
    placa: 'AF789JK',
    vehiculo_info: 'Chevrolet Silverado 5.3L V8 (2021)',
    operadora_nombre: 'Andrea Silva (Central TTM)',
    operadora_foto: FOTO_OPERADORA_DEFAULT,
    ultimo_mensaje: 'Buenos días, requerimos cambio de aceite sintético y filtros para 3 unidades hoy.',
    ultimo_mensaje_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    no_leidos_operadora: 2,
    no_leidos_cliente: 0,
    estado: 'activa',
    canal: 'garaje_web'
  }
];

export const MENSAJES_INICIALES_DEMO: Record<string, MensajeChat[]> = {
  'a1111111-1111-1111-1111-111111111111': [
    {
      id: 'm-101',
      conversacion_id: 'a1111111-1111-1111-1111-111111111111',
      remitente_tipo: 'cliente',
      remitente_nombre: 'María Rodríguez',
      contenido: 'Hola Andrea, buenas tardes. El pedal del freno se siente un poco esponjoso al frenar en bajada en mi Corolla.',
      created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString()
    },
    {
      id: 'm-102',
      conversacion_id: 'a1111111-1111-1111-1111-111111111111',
      remitente_tipo: 'operadora',
      remitente_nombre: 'Andrea Silva',
      remitente_foto: FOTO_OPERADORA_DEFAULT,
      contenido: '¡Hola María! Un gusto saludarte. Ya revisé el último reporte de escáner de tu Corolla (AB123CD). Podemos enviar al especialista Carlos Mendoza para revisar pastillas y purgar el líquido.',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'm-103',
      conversacion_id: 'a1111111-1111-1111-1111-111111111111',
      remitente_tipo: 'sistema',
      remitente_nombre: 'Sistema TTM',
      contenido: '📋 Inspección técnica asignada: Especialista Carlos Mendoza (Mecánico 1 Senior).',
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      id: 'm-104',
      conversacion_id: 'a1111111-1111-1111-1111-111111111111',
      remitente_tipo: 'operadora',
      remitente_nombre: 'Andrea Silva',
      remitente_foto: FOTO_OPERADORA_DEFAULT,
      contenido: 'Te comento que el diagnóstico tiene un costo de $15 USD, pero si apruebas el servicio de frenos te queda 100% EXONERADO.',
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    },
    {
      id: 'm-105',
      conversacion_id: 'a1111111-1111-1111-1111-111111111111',
      remitente_tipo: 'cliente',
      remitente_nombre: 'María Rodríguez',
      contenido: 'Perfecto Andrea, apruebo el cambio de pastillas delanteras. Quedo atenta al técnico.',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ],
  'b2222222-2222-2222-2222-222222222222': [
    {
      id: 'm-201',
      conversacion_id: 'b2222222-2222-2222-2222-222222222222',
      remitente_tipo: 'cliente',
      remitente_nombre: 'Carlos Gómez',
      contenido: 'Buenas, solicité el servicio por la página para la Explorer AD456EF. ¿A qué hora llega el mecánico?',
      created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString()
    },
    {
      id: 'm-202',
      conversacion_id: 'b2222222-2222-2222-2222-222222222222',
      remitente_tipo: 'operadora',
      remitente_nombre: 'Andrea Silva',
      remitente_foto: FOTO_OPERADORA_DEFAULT,
      contenido: 'Hola Carlos, bienvenido a TuTallerMóvil. El especialista Carlos Mendoza ya aceptó la orden en la zona Chacao.',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: 'm-203',
      conversacion_id: 'b2222222-2222-2222-2222-222222222222',
      remitente_tipo: 'operadora',
      remitente_nombre: 'Andrea Silva',
      remitente_foto: FOTO_OPERADORA_DEFAULT,
      contenido: 'Carlos ya va en camino hacia Chacao. Te llegará en aproximadamente 25 minutos con su Credencial QR.',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
  ],
  'c3333333-3333-3333-3333-333333333333': [
    {
      id: 'm-301',
      conversacion_id: 'c3333333-3333-3333-3333-333333333333',
      remitente_tipo: 'cliente',
      remitente_nombre: 'Transportes Ávila C.A.',
      contenido: 'Buenos días, requerimos cambio de aceite sintético y filtros para 3 unidades hoy.',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ]
};

/**
 * Obtiene o crea la conversación activa para un cliente y placa
 */
export async function obtenerOCrearConversacionCliente(params: {
  placa: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  vehiculoInfo?: string;
}): Promise<ConversacionChat> {
  const placaNorm = params.placa.toUpperCase().trim();
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('conversaciones_whatsapp')
      .select('*')
      .eq('placa', placaNorm)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as ConversacionChat;
    }

    // Si no existe, crearla
    const nuevaId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`;
    const nuevaConv: ConversacionChat = {
      id: nuevaId,
      cliente_nombre: params.clienteNombre,
      cliente_email: params.clienteEmail || null,
      cliente_telefono: params.clienteTelefono || null,
      placa: placaNorm,
      vehiculo_info: params.vehiculoInfo || `Vehículo [${placaNorm}]`,
      operadora_nombre: 'Andrea Silva (Central TTM)',
      operadora_foto: FOTO_OPERADORA_DEFAULT,
      ultimo_mensaje: '¡Hola! Te escribe tu operadora Andrea. ¿En qué te apoyamos con tu auto hoy?',
      ultimo_mensaje_at: new Date().toISOString(),
      no_leidos_operadora: 0,
      no_leidos_cliente: 0,
      estado: 'activa',
      canal: 'garaje_web'
    };

    const { data: inserted, error: insertError } = await supabase
      .from('conversaciones_whatsapp')
      .insert(nuevaConv)
      .select('*')
      .single();

    if (!insertError && inserted) {
      return inserted as ConversacionChat;
    }
    return nuevaConv;
  } catch (e) {
    // Fallback local
    const found = CONVERSACIONES_INICIALES_DEMO.find((c) => c.placa === placaNorm);
    if (found) return found;

    return {
      id: `conv-${placaNorm}`,
      cliente_nombre: params.clienteNombre,
      cliente_email: params.clienteEmail || null,
      cliente_telefono: params.clienteTelefono || null,
      placa: placaNorm,
      vehiculo_info: params.vehiculoInfo || `Vehículo [${placaNorm}]`,
      operadora_nombre: 'Andrea Silva (Central TTM)',
      operadora_foto: FOTO_OPERADORA_DEFAULT,
      ultimo_mensaje: '¡Hola! Te escribe Andrea de TuTallerMóvil.',
      ultimo_mensaje_at: new Date().toISOString(),
      no_leidos_operadora: 0,
      no_leidos_cliente: 0,
      estado: 'activa',
      canal: 'garaje_web'
    };
  }
}

/**
 * Carga todas las conversaciones para la Torre de Despacho
 */
export async function cargarTodasLasConversaciones(): Promise<ConversacionChat[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('conversaciones_whatsapp')
      .select('*')
      .order('ultimo_mensaje_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as ConversacionChat[];
    }
  } catch (err) {
    console.warn('Usando semillas locales de conversaciones:', err);
  }

  // Si la tabla aún no existe o está vacía, retornar las semillas
  return CONVERSACIONES_INICIALES_DEMO;
}

/**
 * Carga los mensajes de una conversación
 */
export async function cargarMensajesConversacion(conversacionId: string): Promise<MensajeChat[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('mensajes_chat')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as MensajeChat[];
    }
  } catch (err) {
    console.warn('Usando mensajes locales demo para conversacion:', conversacionId);
  }

  return MENSAJES_INICIALES_DEMO[conversacionId] || [];
}

/**
 * Envía un mensaje y sincroniza en Supabase y canales de tiempo real
 */
export async function enviarMensajeChat(params: {
  conversacionId: string;
  remitenteTipo: 'cliente' | 'operadora' | 'sistema';
  remitenteNombre: string;
  remitenteFoto?: string;
  contenido: string;
  tipo?: 'texto' | 'imagen' | 'cotizacion' | 'ubicacion';
  metadata?: Record<string, any>;
}): Promise<MensajeChat> {
  const supabase = createClient();
  const nuevoId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const nuevoMensaje: MensajeChat = {
    id: nuevoId,
    conversacion_id: params.conversacionId,
    remitente_tipo: params.remitenteTipo,
    remitente_nombre: params.remitenteNombre,
    remitente_foto: params.remitenteFoto || null,
    contenido: params.contenido,
    tipo: params.tipo || 'texto',
    metadata: params.metadata || {},
    leido: false,
    created_at: new Date().toISOString()
  };

  try {
    // 1. Guardar en base de datos
    await supabase.from('mensajes_chat').insert(nuevoMensaje);

    // 2. Actualizar último mensaje en la conversación
    const updates: Partial<ConversacionChat> = {
      ultimo_mensaje: params.contenido,
      ultimo_mensaje_at: nuevoMensaje.created_at,
      updated_at: nuevoMensaje.created_at
    };

    if (params.remitenteTipo === 'cliente') {
      try {
        await supabase.rpc('increment_no_leidos_operadora', { conv_id: params.conversacionId });
      } catch (e) {}
    } else if (params.remitenteTipo === 'operadora') {
      try {
        await supabase.rpc('increment_no_leidos_cliente', { conv_id: params.conversacionId });
      } catch (e) {}
    }

    await supabase
      .from('conversaciones_whatsapp')
      .update(updates)
      .eq('id', params.conversacionId);

    // 3. Emitir broadcast por canal de websocket para sincronización inmediata
    const channel = supabase.channel(`chat_${params.conversacionId}`);
    channel.send({
      type: 'broadcast',
      event: 'nuevo_mensaje',
      payload: nuevoMensaje
    });
  } catch (err) {
    console.warn('Error al persistir en Supabase, mensaje guardado optimistamente:', err);
  }

  // Guardar en cache local en memoria para no perderlo
  if (!MENSAJES_INICIALES_DEMO[params.conversacionId]) {
    MENSAJES_INICIALES_DEMO[params.conversacionId] = [];
  }
  MENSAJES_INICIALES_DEMO[params.conversacionId].push(nuevoMensaje);

  return nuevoMensaje;
}
