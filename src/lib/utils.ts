/**
 * Genera un enlace directo a WhatsApp (wa.me) con número internacional sanitizado y mensaje codificado
 * @param telefono Número de teléfono en cualquier formato (ej. 0414-2314194, +58 412 1234567, 584142314194)
 * @param mensaje Mensaje de texto preescrito
 * @returns URL completa https://wa.me/...
 */
export function generarLinkWhatsApp(telefono: string, mensaje: string): string {
  // Limpiar caracteres que no sean dígitos
  let numLimpio = (telefono || '').replace(/\D/g, '');

  // Normalizar prefijo internacional para Venezuela (+58)
  if (numLimpio.startsWith('0')) {
    numLimpio = '58' + numLimpio.slice(1);
  } else if (!numLimpio.startsWith('58')) {
    numLimpio = '58' + numLimpio;
  }

  // Fallback si no hay número válido
  if (!numLimpio || numLimpio === '58' || numLimpio.length < 10) {
    numLimpio = '584142314194'; // Soporte oficial TTM
  }

  const textoCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numLimpio}?text=${textoCodificado}`;
}
