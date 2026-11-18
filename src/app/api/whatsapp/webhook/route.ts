import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarMensajeWhatsApp, normalizarTelefono } from '@/lib/whatsapp';

// Cliente Supabase para el Webhook (usa service_role si existe, sino anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// 1. GET: Verificación de Webhook de Meta WhatsApp Cloud API (hub.verify_token)
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'tutallermovil_meta_token_2027';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('✅ Webhook de WhatsApp verificado con éxito por Meta.');
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Token de verificación no coincide' }, { status: 403 });
  } catch (error) {
    console.error('Error en verificación webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Error interno en verificación' }, { status: 500 });
  }
}

// ============================================================================
// Lógica del Chatbot de WhatsApp y Handoff Humano
// ============================================================================
async function procesarMensajeEntrante(rawPhone: string, textoBruto: string, contactProfileName?: string) {
  const telefono = normalizarTelefono(rawPhone);
  const texto = String(textoBruto).trim();

  if (!telefono || !texto) return;

  console.log(`📥 [WHATSAPP INCOMING] De: +${telefono} | Texto: "${texto}"`);

  // 1. Consultar la tabla whatsapp_chats por el teléfono
  const { data: chatExistente, error: errChat } = await supabase
    .from('whatsapp_chats')
    .select('*')
    .eq('telefono', telefono)
    .maybeSingle();

  // Helper para guardar mensajes y opcionalmente replicar en mensajes_whatsapp (compatibilidad)
  const guardarMensaje = async (chatId: string, txt: string, esTaller: boolean, leido: boolean = false) => {
    try {
      await supabase.from('whatsapp_mensajes').insert([
        {
          chat_id: chatId,
          telefono,
          mensaje: txt,
          es_de_taller: esTaller,
          leido
        }
      ]);

      // Compatibilidad con tabla previa
      try {
        await supabase.from('mensajes_whatsapp').insert([
          {
            telefono_remitente: telefono,
            nombre_remitente: esTaller ? 'TuTallerMóvil' : (chatExistente?.nombre || contactProfileName || 'Cliente WhatsApp'),
            mensaje: txt,
            es_de_taller: esTaller,
            leido
          }
        ]);
      } catch {
        // Silencioso si la tabla previa no existe
      }
    } catch (e) {
      console.warn('Aviso guardando mensaje en Supabase:', e);
    }
  };

  // ==========================================================================
  // CASO A: El chat NO existe -> Crearlo con estado INICIANDO y enviar saludo
  // ==========================================================================
  if (!chatExistente) {
    const { data: nuevoChat, error: errCrear } = await supabase
      .from('whatsapp_chats')
      .insert([
        {
          telefono,
          nombre: contactProfileName || null,
          estado: 'INICIANDO',
          ultimo_mensaje: texto,
          unread_count: 1
        }
      ])
      .select()
      .single();

    const chatId = nuevoChat?.id || null;

    // Guardar el mensaje entrante del usuario
    if (chatId) {
      await guardarMensaje(chatId, texto, false, false);
    }

    // Respuesta automatizada del Bot:
    const respuestaBot = '¡Hola! Bienvenido a TuTallerMóvil. Para enviarte un mecánico, ¿cuál es tu nombre?';
    await enviarMensajeWhatsApp(telefono, respuestaBot);

    // Guardar mensaje saliente del Bot y actualizar chat
    if (chatId) {
      await guardarMensaje(chatId, respuestaBot, true, true);
      await supabase
        .from('whatsapp_chats')
        .update({
          ultimo_mensaje: respuestaBot,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);
    }

    return;
  }

  const chatId = chatExistente.id;
  const estadoActual = chatExistente.estado || 'INICIANDO';

  // Guardar primero el mensaje entrante que envió el usuario
  await guardarMensaje(chatId, texto, false, false);

  // ==========================================================================
  // CASO B: Estado INICIANDO -> Guarda el nombre, cambia a PREGUNTANDO_CARRO
  // ==========================================================================
  if (estadoActual === 'INICIANDO') {
    const nombreUsuario = texto;
    const respuestaBot = '¿Cuál es el modelo y año de tu vehículo?';

    await supabase
      .from('whatsapp_chats')
      .update({
        nombre: nombreUsuario,
        estado: 'PREGUNTANDO_CARRO',
        ultimo_mensaje: respuestaBot,
        unread_count: (chatExistente.unread_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);

    await enviarMensajeWhatsApp(telefono, respuestaBot);
    await guardarMensaje(chatId, respuestaBot, true, true);
    return;
  }

  // ==========================================================================
  // CASO C: Estado PREGUNTANDO_CARRO -> Guarda vehículo, cambia a PREGUNTANDO_FALLA
  // ==========================================================================
  if (estadoActual === 'PREGUNTANDO_CARRO') {
    const vehiculoUsuario = texto;
    const respuestaBot = '¿Qué falla presenta tu carro?';

    await supabase
      .from('whatsapp_chats')
      .update({
        vehiculo: vehiculoUsuario,
        estado: 'PREGUNTANDO_FALLA',
        ultimo_mensaje: respuestaBot,
        unread_count: (chatExistente.unread_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);

    await enviarMensajeWhatsApp(telefono, respuestaBot);
    await guardarMensaje(chatId, respuestaBot, true, true);
    return;
  }

  // ==========================================================================
  // CASO D: Estado PREGUNTANDO_FALLA -> Guarda falla, pasa a HUMANO e inserta orden
  // ==========================================================================
  if (estadoActual === 'PREGUNTANDO_FALLA') {
    const fallaUsuario = texto;
    const respuestaBot = '¡Gracias! He registrado tu solicitud. Un operador humano se conectará contigo en este mismo chat en un momento.';

    // 1. Cambiar estado a HUMANO y guardar falla en whatsapp_chats
    await supabase
      .from('whatsapp_chats')
      .update({
        falla: fallaUsuario,
        estado: 'HUMANO',
        ultimo_mensaje: respuestaBot,
        unread_count: (chatExistente.unread_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);

    // 2. Insertar nueva orden en la tabla 'ordenes' (con estado LEAD_NUEVO)
    try {
      const nombreFinal = chatExistente.nombre || contactProfileName || 'Cliente WhatsApp';
      const vehiculoFinal = chatExistente.vehiculo || 'No especificado';

      const { error: errOrden } = await supabase.from('ordenes').insert([
        {
          cliente_nombre: `${nombreFinal} (WhatsApp)`,
          cliente_telefono: telefono,
          vehiculo_modelo: vehiculoFinal,
          falla_reportada: fallaUsuario,
          sector: 'Caracas (Atención WhatsApp)',
          estado: 'LEAD_NUEVO',
          ganancia_estimada: 30.00
        }
      ]);

      if (errOrden) {
        console.error('Error insertando orden desde WhatsApp Bot:', errOrden.message);
      } else {
        console.log(`✨ [ORDEN CREADA POR CHATBOT] Cliente: ${nombreFinal} | Carro: ${vehiculoFinal} | Falla: ${fallaUsuario}`);
      }
    } catch (e) {
      console.error('Excepción creando orden desde WhatsApp:', e);
    }

    // 3. Enviar confirmación al cliente y guardar en el historial
    await enviarMensajeWhatsApp(telefono, respuestaBot);
    await guardarMensaje(chatId, respuestaBot, true, true);
    return;
  }

  // ==========================================================================
  // CASO E: Estado HUMANO -> Handoff activo. No hace nada automatizado.
  // ==========================================================================
  if (estadoActual === 'HUMANO') {
    await supabase
      .from('whatsapp_chats')
      .update({
        ultimo_mensaje: texto,
        unread_count: (chatExistente.unread_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);

    console.log(`👤 [HANDOFF HUMANO] Mensaje recibido de +${telefono} en espera de la operadora: "${texto}"`);
  }
}

// ============================================================================
// 2. POST: Recepción de eventos desde Meta WhatsApp Cloud API
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Soporte para formato directo/custom para pruebas internas o curl:
    // { "telefono": "584121234567", "mensaje": "Hola", "nombre": "Juan Pérez" }
    if (body.telefono && body.mensaje) {
      await procesarMensajeEntrante(
        String(body.telefono),
        String(body.mensaje),
        body.nombre || undefined
      );

      return NextResponse.json(
        { success: true, message: 'Mensaje procesado por el bot' },
        { status: 200 }
      );
    }

    // Formato oficial Meta WhatsApp Cloud API
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value && value.messages && value.messages.length > 0) {
      const msgObj = value.messages[0];
      const from = msgObj.from; // Número de teléfono (ej. 584121234567)
      const contact = value.contacts?.[0];
      const nombrePerfil = contact?.profile?.name || undefined;

      let texto = '';
      if (msgObj.type === 'text') {
        texto = msgObj.text?.body || '';
      } else if (msgObj.type === 'location') {
        const loc = msgObj.location;
        texto = `📍 Ubicación: Lat ${loc?.latitude}, Lng ${loc?.longitude} ${loc?.name || ''}`;
      } else if (msgObj.type === 'image') {
        texto = `📷 [Imagen enviada] ${msgObj.image?.caption || ''}`.trim();
      } else if (msgObj.type === 'interactive') {
        texto = msgObj.interactive?.button_reply?.title || msgObj.interactive?.list_reply?.title || 'Respuesta interactiva';
      } else {
        texto = `[Mensaje tipo ${msgObj.type}]`;
      }

      if (from && texto) {
        await procesarMensajeEntrante(from, texto, nombrePerfil);
      }
    }

    // Siempre retornar 200 OK a Meta
    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Error procesando payload' }, { status: 200 });
  }
}
