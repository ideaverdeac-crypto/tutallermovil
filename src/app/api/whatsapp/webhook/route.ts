import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para el Webhook (usa service_role si existe, sino anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Verificación de Webhook de Meta WhatsApp Cloud API
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

// POST: Recepción de mensajes entrantes desde Meta WhatsApp Cloud API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Soporte para formato directo/custom para pruebas internas o curl:
    // { "telefono": "584121234567", "mensaje": "Hola", "nombre": "Juan Pérez" }
    if (body.telefono && body.mensaje) {
      const { data, error } = await supabase.from('mensajes_whatsapp').insert([
        {
          telefono_remitente: String(body.telefono).trim(),
          nombre_remitente: body.nombre || 'Usuario WhatsApp',
          mensaje: String(body.mensaje).trim(),
          es_de_taller: false,
          leido: false,
        },
      ]).select();

      if (error) {
        console.error('Error guardando mensaje custom WhatsApp:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Mensaje recibido e insertado', data }, { status: 200 });
    }

    // Formato oficial Meta WhatsApp Cloud API
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value && value.messages && value.messages.length > 0) {
      const msgObj = value.messages[0];
      const from = msgObj.from; // Número de teléfono (ej. 584121234567)
      const contact = value.contacts?.[0];
      const nombre = contact?.profile?.name || `Contacto (${from})`;

      let texto = '';
      if (msgObj.type === 'text') {
        texto = msgObj.text?.body || '';
      } else if (msgObj.type === 'location') {
        const loc = msgObj.location;
        texto = `📍 [Ubicación compartida: Lat ${loc?.latitude}, Lng ${loc?.longitude}] ${loc?.name || ''}`;
      } else if (msgObj.type === 'image') {
        texto = `📷 [Imagen enviada] ${msgObj.image?.caption || ''}`;
      } else if (msgObj.type === 'interactive') {
        texto = msgObj.interactive?.button_reply?.title || msgObj.interactive?.list_reply?.title || 'Respuesta interactiva';
      } else {
        texto = `[Mensaje de tipo ${msgObj.type}]`;
      }

      if (from && texto) {
        const { error } = await supabase.from('mensajes_whatsapp').insert([
          {
            telefono_remitente: String(from).trim(),
            nombre_remitente: nombre,
            mensaje: texto,
            es_de_taller: false,
            leido: false,
          },
        ]);

        if (error) {
          console.error('Error insertando en mensajes_whatsapp:', error);
        } else {
          console.log(`📥 Mensaje recibido de ${nombre} (${from}): ${texto}`);
        }
      }
    }

    // Siempre retornar 200 OK a Meta para confirmar recepción y evitar reintentos continuos
    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook WhatsApp:', error);
    // Meta espera 200 o reintentará
    return NextResponse.json({ error: 'Error procesando payload' }, { status: 200 });
  }
}
