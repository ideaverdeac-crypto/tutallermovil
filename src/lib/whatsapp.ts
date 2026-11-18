/**
 * Helper para integración oficial con Meta WhatsApp Cloud API (Graph API v20.0)
 */

export interface EnviarMensajeWhatsAppResult {
  success: boolean;
  data?: any;
  error?: string;
  mocked?: boolean;
}

/**
 * Normaliza el número de teléfono eliminando caracteres no numéricos
 */
export function normalizarTelefono(telefono: string): string {
  return String(telefono).replace(/[^0-9]/g, '');
}

/**
 * Envía un mensaje de texto saliente por WhatsApp usando la API oficial de Meta
 * @param telefono Número de teléfono destino en formato internacional (ej. 584121234567)
 * @param texto Contenido del mensaje de texto
 */
export async function enviarMensajeWhatsApp(
  telefono: string,
  texto: string
): Promise<EnviarMensajeWhatsAppResult> {
  const cleanPhone = normalizarTelefono(telefono);
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.META_PHONE_NUMBER_ID ||
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID ||
    '';

  const accessToken =
    process.env.WHATSAPP_API_TOKEN ||
    process.env.META_WA_TOKEN ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    '';

  // Si no hay credenciales configuradas en el entorno (modo desarrollo o prueba inicial)
  if (!phoneNumberId || !accessToken) {
    console.warn(
      `[WHATSAPP API SIMULACIÓN] Meta API credentials no configuradas (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_API_TOKEN). ` +
      `Simulando envío saliente a +${cleanPhone}: "${texto}"`
    );
    return {
      success: true,
      mocked: true,
      data: {
        messaging_product: 'whatsapp',
        contacts: [{ input: cleanPhone, wa_id: cleanPhone }],
        messages: [{ id: `wamid_sim_${Date.now()}` }]
      }
    };
  }

  const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: texto
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WHATSAPP API ERROR] Fallo al enviar mensaje por Meta API:', data);
      return {
        success: false,
        error: data?.error?.message || `HTTP ${response.status}: Error al enviar mensaje`
      };
    }

    console.log(`[WHATSAPP API ÉXITO] Mensaje entregado a Meta para +${cleanPhone}. ID:`, data?.messages?.[0]?.id);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('[WHATSAPP API EXCEPCIÓN] Error de red o ejecución:', error);
    return {
      success: false,
      error: error?.message || 'Error inesperado de red al contactar Meta API'
    };
  }
}
