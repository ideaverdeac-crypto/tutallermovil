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

  // Helper para guardar mensajes
  const guardarMensaje = async (txt: string, esTaller: boolean) => {
    try {
      await supabase.from('whatsapp_mensajes').insert([
        {
          telefono,
          mensaje: txt,
          es_de_taller: esTaller
        }
      ]);
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
          nombre_cliente: contactProfileName || null,
          estado_bot: 'INICIANDO',
          actualizado_en: new Date().toISOString()
        }
      ])
      .select()
      .single();

    // Guardar el mensaje entrante del usuario
    await guardarMensaje(texto, false);

    // Respuesta automatizada del Bot:
    const saludoBot =
      '¡Hola! Bienvenido a TuTallerMóvil 🚗🔧\n' +
      'Para enviarte un mecánico especialista hasta tu ubicación, ¿cuál es tu nombre completo?';

    await enviarMensajeWhatsApp(telefono, saludoBot);
    await guardarMensaje(saludoBot, true);

    console.log(`🤖 [BOT INICIANDO] Chat creado para +${telefono}. Saludo enviado.`);
    return;
  }

  // ==========================================================================
  // SI EL CHAT EXISTE: EVALUAR MÁQUINA DE ESTADOS
  // ==========================================================================
  const estadoActual = (chatExistente.estado_bot || chatExistente.estado || 'INICIANDO').toUpperCase();
  const chatId = chatExistente.id;

  // Guardar siempre el mensaje entrante recibido
  await guardarMensaje(texto, false);

  // ==========================================================================
  // CASO B: Estado INICIANDO -> El usuario respondió su nombre
  // ==========================================================================
  if (estadoActual === 'INICIANDO') {
    const nombreCapturado = texto;

    await supabase
      .from('whatsapp_chats')
      .update({
        nombre_cliente: nombreCapturado,
        estado_bot: 'PREGUNTANDO_CARRO',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', chatId);

    const respuestaBot =
      `¡Mucho gusto, ${nombreCapturado}! 👋\n\n` +
      '¿Cuál es la marca, modelo y año de tu vehículo?\n' +
      '(Ejemplo: *Toyota Corolla 2018* o *Ford Fiesta 2012*)';

    await enviarMensajeWhatsApp(telefono, respuestaBot);
    await guardarMensaje(respuestaBot, true);

    console.log(`🤖 [BOT PREGUNTANDO_CARRO] Nombre guardado: "${nombreCapturado}". Preguntando vehículo.`);
    return;
  }

  // ==========================================================================
  // CASO C: Estado PREGUNTANDO_CARRO -> El usuario respondió su vehículo
  // ==========================================================================
  if (estadoActual === 'PREGUNTANDO_CARRO') {
    const vehiculoCapturado = texto;

    await supabase
      .from('whatsapp_chats')
      .update({
        vehiculo_info: vehiculoCapturado,
        estado_bot: 'PREGUNTANDO_FALLA',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', chatId);

    const respuestaBot =
      `Excelente, un *${vehiculoCapturado}* 🚙.\n\n` +
      'Cuéntame, ¿qué falla o síntoma presenta el carro?\n' +
      '(Ejemplo: *Frenos chirriando, bote de refrigerante, bota humo blanco, no enciende o requiere mantenimiento*)';

    await enviarMensajeWhatsApp(telefono, respuestaBot);
    await guardarMensaje(respuestaBot, true);

    console.log(`🤖 [BOT PREGUNTANDO_FALLA] Vehículo guardado: "${vehiculoCapturado}". Preguntando falla.`);
    return;
  }

  // ==========================================================================
  // CASO D: Estado PREGUNTANDO_FALLA -> Usuario respondió la falla
  // Handoff: pasa a HUMANO e inserta la orden formal en `ordenes` (LEAD_NUEVO)
  // ==========================================================================
  if (estadoActual === 'PREGUNTANDO_FALLA') {
    const fallaCapturada = texto;

    // 1. Actualizar el chat a estado HUMANO
    await supabase
      .from('whatsapp_chats')
      .update({
        falla: fallaCapturada,
        estado_bot: 'HUMANO',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', chatId);

    // 2. Extraer marca y modelo para el registro de la orden
    const vehiculoRaw = chatExistente.vehiculo_info || chatExistente.vehiculo || 'Automóvil Particular';
    const partes = vehiculoRaw.split(' ');
    const marca = partes[0] || 'Particular';
    const modelo = partes.slice(1).join(' ') || vehiculoRaw;

    // 3. Insertar orden formal en la tabla `ordenes`
    try {
      const { data: nuevaOrden, error: errOrden } = await supabase
        .from('ordenes')
        .insert([
          {
            cliente_nombre: chatExistente.nombre_cliente || chatExistente.nombre || contactProfileName || 'Cliente WhatsApp',
            cliente_telefono: `+${telefono}`,
            vehiculo_marca: marca,
            vehiculo_modelo: modelo,
            vehiculo_anio: 2020,
            falla_reportada: fallaCapturada,
            sector: 'Caracas (WhatsApp Bot)',
            estado: 'LEAD_NUEVO'
          }
        ])
        .select()
        .single();

      if (errOrden) {
        console.error('⚠️ Error insertando orden desde WhatsApp:', errOrden);
      } else {
        console.log(`🎉 [ORDEN CREADA DESDE BOT] ID: ${nuevaOrden?.id} | Cliente: ${nuevaOrden?.cliente_nombre}`);
      }
    } catch (errOrdenCatch) {
      console.warn('Aviso insertando orden en tabla ordenes:', errOrdenCatch);
    }

    // 4. Mensaje de despedida y transferencia a la operadora humana
    const respuestaBot =
      '¡Listo! 📋 He registrado tu solicitud con éxito.\n\n' +
      '👨‍🔧 Un operador humano de nuestra **Torre de Despacho** se conectará contigo en este mismo chat en un momento para coordinar la llegada del mecánico.';

    await enviarMensajeWhatsApp(telefono, respuestaBot);
    await guardarMensaje(respuestaBot, true);

    console.log(`✅ [HANDOFF A HUMANO] Falla guardada: "${fallaCapturada}". Chat transferido a operador humano.`);
    return;
  }

  // ==========================================================================
  // CASO E: Estado HUMANO -> Handoff activo. No hace nada automatizado.
  // ==========================================================================
  if (estadoActual === 'HUMANO') {
    await supabase
      .from('whatsapp_chats')
      .update({
        actualizado_en: new Date().toISOString()
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
