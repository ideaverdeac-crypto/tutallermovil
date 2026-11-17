-- ==============================================================================
-- MIGRACIÓN SUPABASE: CUENTAS CLIENTES, HISTORIAL CON CHECKLIST Y LIBERACIÓN PAGO
-- ==============================================================================

-- 1. Añadir columna checklist_json a la tabla historial_servicios
ALTER TABLE public.historial_servicios 
ADD COLUMN IF NOT EXISTS checklist_json JSONB DEFAULT '{}'::jsonb;

-- 2. Asegurar campos para clientes y vinculación de vehículos
ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS cliente_email TEXT,
ADD COLUMN IF NOT EXISTS cliente_telefono TEXT,
ADD COLUMN IF NOT EXISTS cliente_nombre TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.ordenes 
ADD COLUMN IF NOT EXISTS cliente_email TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 3. Crear o actualizar la función liberar_pago_orden
CREATE OR REPLACE FUNCTION public.liberar_pago_orden(
  p_orden_id TEXT,
  p_operadora_email TEXT DEFAULT 'despacho@tutallermovil.com'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_orden RECORD;
  v_historial_id UUID;
BEGIN
  -- Buscar orden actual
  SELECT * INTO v_orden FROM public.ordenes WHERE id = p_orden_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Orden no encontrada');
  END IF;

  -- 1. Actualizar estado de la orden a PAGADO
  UPDATE public.ordenes
  SET 
    estado = 'PAGADO',
    bloqueado_por = NULL,
    updated_at = NOW()
  WHERE id = p_orden_id;

  -- 2. Insertar en historial_servicios copiando diagnostico_json a checklist_json
  INSERT INTO public.historial_servicios (
    vehiculo_id,
    placa,
    fecha,
    kilometraje,
    tipo_servicio,
    costo,
    detalles,
    foto_repuesto_nuevo_url,
    checklist_json,
    created_at
  ) VALUES (
    COALESCE(v_orden.vehiculo_id, v_orden.id),
    COALESCE(v_orden.placa_flota, 'AB123CD'),
    CURRENT_DATE,
    COALESCE(v_orden.kilometraje_actual, 85400),
    COALESCE(v_orden.falla_reportada, 'Mantenimiento Certificado'),
    COALESCE(v_orden.monto_aprobado_cliente, v_orden.ganancia_estimada, 75.0),
    'Servicio conciliado y liberado automáticamente',
    COALESCE(v_orden.foto_repuesto_nuevo_url, v_orden.foto_odometro_url),
    COALESCE(v_orden.diagnostico_json, '{}'::jsonb),
    NOW()
  )
  RETURNING id INTO v_historial_id;

  -- 3. Registrar auditoría en bitácora
  INSERT INTO public.bitacora_operaciones (
    orden_id,
    operadora_email,
    accion,
    detalles
  ) VALUES (
    p_orden_id,
    p_operadora_email,
    'PAGO_LIBERADO_Y_CERRADO',
    jsonb_build_object('historial_id', v_historial_id, 'monto', v_orden.ganancia_estimada)
  );

  RETURN jsonb_build_object('success', true, 'orden_id', p_orden_id, 'historial_id', v_historial_id);
END;
$$;
