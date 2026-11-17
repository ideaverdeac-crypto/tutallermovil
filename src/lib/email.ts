/**
 * Módulo de envío de correos transaccionales para TuTallerMóvil
 * Preparado para integración futura con Resend / SendGrid / Postmark
 */

export interface DatosReciboEmail {
  correo: string;
  clienteNombre: string;
  ordenId: string;
  montoTotal: number;
  servicioDescripcion: string;
  placaVehiculo?: string;
  fecha?: string;
}

/**
 * Simula el envío de un correo electrónico con el recibo del servicio
 */
export async function enviarEmailRecibo(datos: DatosReciboEmail): Promise<{ success: boolean; id: string }> {
  // Simulación requerida para auditoría y pruebas
  console.log(`Email enviado a ${datos.correo} con el recibo del servicio`);
  console.log(`[EMAIL DISPATCHER] Recibo digital #${datos.ordenId} ($${datos.montoTotal.toFixed(2)}) emitido para ${datos.clienteNombre} (${datos.correo})`);

  return {
    success: true,
    id: `email_mock_${Date.now()}`
  };
}

/**
 * Función genérica de envío para notificaciones transaccionales
 */
export async function enviarEmailNotificacion(correo: string, asunto: string, mensaje: string): Promise<boolean> {
  console.log(`Email enviado a ${correo} con el recibo del servicio`);
  console.log(`[NOTIFICACIÓN EMAIL] Para: ${correo} | Asunto: ${asunto} | Contenido: ${mensaje.slice(0, 80)}...`);
  return true;
}
