import { createClient } from '@/lib/supabase/client';

export interface RegistroBitacora {
  id: string;
  orden_id?: string | null;
  operadora_email: string;
  operadora_nombre: string;
  accion: string;
  detalles?: Record<string, any> | null;
  created_at: string;
  badge?: string;
}

const STORAGE_KEY = 'ttm_bitacora_operaciones';

/**
 * Registra una acción crítica en Supabase bitacora_operaciones y en cache local inmutable
 */
export async function registrarOperacionEnBitacora({
  ordenId,
  operadoraEmail,
  operadoraNombre,
  accion,
  detalles = {}
}: {
  ordenId?: string | null;
  operadoraEmail?: string;
  operadoraNombre?: string;
  accion: string;
  detalles?: Record<string, any>;
}): Promise<RegistroBitacora> {
  const emailFinal = operadoraEmail || (typeof document !== 'undefined' ? obtenerCookie('ttm_user_code') : '') || 'operadora@tutallermovil.com';
  const nombreFinal = operadoraNombre || extraerNombreDesdeEmail(emailFinal);

  const nuevoRegistro: RegistroBitacora = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orden_id: ordenId || null,
    operadora_email: emailFinal,
    operadora_nombre: nombreFinal,
    accion,
    detalles: detalles || {},
    created_at: new Date().toISOString(),
    badge: clasificarBadgePorAccion(accion)
  };

  // 1. Guardar en localStorage para disponibilidad instantánea y offline
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const lista: RegistroBitacora[] = raw ? JSON.parse(raw) : [];
      const actualizada = [nuevoRegistro, ...lista].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizada));
    } catch (e) {
      console.warn('[BITACORA] Error guardando en local:', e);
    }
  }

  // 2. Intentar guardar en Supabase (tabla bitacora_operaciones)
  try {
    const supabase = createClient();
    const { error } = await supabase.from('bitacora_operaciones').insert({
      orden_id: ordenId || null,
      operadora_email: emailFinal,
      operadora_nombre: nombreFinal,
      accion,
      detalles: detalles || {},
      created_at: nuevoRegistro.created_at
    });

    if (error) {
      console.warn('[BITACORA] Aviso al insertar en Supabase (se usó cache local):', error.message);
    }
  } catch (err) {
    console.warn('[BITACORA] Error de conexión con Supabase:', err);
  }

  return nuevoRegistro;
}

/**
 * Obtiene los registros de la bitácora desde Supabase o fallback local
 */
export async function obtenerBitacoraOperaciones(): Promise<RegistroBitacora[]> {
  let registros: RegistroBitacora[] = [];

  // 1. Intentar desde Supabase
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bitacora_operaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      registros = data.map((item: any) => ({
        id: item.id || `aud_${Date.now()}`,
        orden_id: item.orden_id,
        operadora_email: item.operadora_email,
        operadora_nombre: item.operadora_nombre || extraerNombreDesdeEmail(item.operadora_email),
        accion: item.accion,
        detalles: item.detalles,
        created_at: item.created_at,
        badge: clasificarBadgePorAccion(item.accion)
      }));
      return registros;
    }
  } catch (err) {
    console.warn('[BITACORA] Fallback a local:', err);
  }

  // 2. Fallback a localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[BITACORA] Error leyendo local:', e);
    }
  }

  return [];
}

function clasificarBadgePorAccion(accion: string): string {
  const norm = accion.toUpperCase();
  if (norm.includes('ASIGN')) return 'Despacho Táctico';
  if (norm.includes('COTIZ')) return 'Cotizador Oficial';
  if (norm.includes('PAGO') || norm.includes('LIQUID')) return 'Tesorería QA';
  if (norm.includes('RUNNER')) return 'Logística Runner';
  if (norm.includes('BLOQUE')) return 'Concurrencia';
  return 'Operación';
}

function extraerNombreDesdeEmail(email: string): string {
  if (!email) return 'Operadora de Despacho';
  const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function obtenerCookie(nombre: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + nombre + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
