/**
 * Utilidades generales del sistema TuTallerMóvil
 */

/**
 * Normaliza y formatea un número telefónico venezolano
 */
export function formatearTelefono(telefono: string): string {
  const numLimpio = (telefono || '').replace(/\D/g, '');
  if (!numLimpio) return '';
  return numLimpio;
}
