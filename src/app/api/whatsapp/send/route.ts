import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarMensajeWhatsApp, normalizarTelefono } from '@/lib/whatsapp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono, mensaje, chatId } = body;

    if (!telefono || !mensaje) {
      return NextResponse.json(
        { error: 'Parámetros "telefono" y "mensaje" son requeridos' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizarTelefono(telefono);
    const textoMensaje = String(mensaje).trim();

    // 1. Enviar mensaje por Meta WhatsApp Cloud API
    const metaResult = await enviarMensajeWhatsApp(cleanPhone, textoMensaje);

    // 2. Guardar en base de datos Supabase
    let finalChatId = chatId;

    // Si no se proporcionó chatId, buscarlo o crearlo
    if (!finalChatId) {
      const { data: chatExistente } = await supabase
        .from('whatsapp_chats')
        .select('id')
        .eq('telefono', cleanPhone)
        .maybeSingle();

      if (chatExistente?.id) {
        finalChatId = chatExistente.id;
      }
    }

    // 2.1 Insertar en whatsapp_mensajes
    const { data: nuevoMensaje, error: errMensaje } = await supabase
      .from('whatsapp_mensajes')
      .insert([
        {
          telefono: cleanPhone,
          mensaje: textoMensaje,
          es_de_taller: true
        }
      ])
      .select()
      .single();

    if (errMensaje) {
      console.warn('Aviso insertando en whatsapp_mensajes:', errMensaje.message);
    }

    // 2.2 Actualizar el chat
    if (finalChatId) {
      await supabase
        .from('whatsapp_chats')
        .update({
          estado_bot: 'HUMANO', // Al responder la operadora, se consolida como atención humana
          actualizado_en: new Date().toISOString()
        })
        .eq('id', finalChatId);
    }

    // 2.3 Mantener compatibilidad con la tabla previa mensajes_whatsapp si existe
    try {
      await supabase.from('mensajes_whatsapp').insert([
        {
          telefono_remitente: cleanPhone,
          nombre_remitente: 'Operadora Central',
          mensaje: textoMensaje,
          es_de_taller: true,
          leido: true
        }
      ]);
    } catch {}

    return NextResponse.json({
      success: true,
      mensaje: nuevoMensaje,
      metaApi: metaResult
    });
  } catch (error: any) {
    console.error('Error en /api/whatsapp/send:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
