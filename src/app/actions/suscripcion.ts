'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function activarSuscripcion({
  vehiculoId,
  placa
}: {
  vehiculoId?: string;
  placa?: string;
}) {
  try {
    const supabase = await createClient();

    // Fecha de vencimiento a 1 año en el futuro
    const fechaVencimiento = new Date();
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
    const fechaVencimientoIso = fechaVencimiento.toISOString();

    // 1. Verificar si ya existe un registro de suscripción para el vehículo
    let existingSub = null;

    if (vehiculoId) {
      const { data } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('vehiculo_id', vehiculoId)
        .maybeSingle();
      if (data) existingSub = data;
    }

    if (!existingSub && placa) {
      const { data } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('placa', placa)
        .maybeSingle();
      if (data) existingSub = data;
    }

    // 2. Si existe, actualizar a activa = true
    if (existingSub) {
      const { error: updateError } = await supabase
        .from('suscripciones')
        .update({
          activa: true,
          fecha_vencimiento: fechaVencimientoIso
        })
        .eq('id', existingSub.id);

      if (updateError) {
        console.error('Error al actualizar suscripción:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // 3. Si no existe, crear un nuevo registro de suscripción
      const payload: Record<string, any> = {
        activa: true,
        fecha_vencimiento: fechaVencimientoIso
      };

      if (vehiculoId) payload.vehiculo_id = vehiculoId;
      if (placa) payload.placa = placa;

      const { error: insertError } = await supabase
        .from('suscripciones')
        .insert(payload);

      if (insertError) {
        console.warn('Primer intento de insert falló, reintentando con campos mínimos:', insertError);
        // Si falló por columna placa inexistente, intentar solo con vehiculo_id
        if (vehiculoId) {
          const { error: retryError } = await supabase
            .from('suscripciones')
            .insert({
              vehiculo_id: vehiculoId,
              activa: true,
              fecha_vencimiento: fechaVencimientoIso
            });

          if (retryError) {
            console.error('Error final al insertar suscripción:', retryError);
            return { success: false, error: retryError.message };
          }
        } else {
          return { success: false, error: insertError.message };
        }
      }
    }

    if (placa) {
      revalidatePath(`/historial/${placa}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Excepción en activarSuscripcion:', err);
    return { success: false, error: err?.message || 'Error inesperado al activar suscripción' };
  }
}
