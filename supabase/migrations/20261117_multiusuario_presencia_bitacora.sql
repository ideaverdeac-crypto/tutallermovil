-- ==============================================================================
-- MIGRACIÓN SUPABASE: PRESENCIA, BLOQUEO DE TARJETAS Y AUDITORÍA MULTIUSUARIO 2027
-- ==============================================================================

-- 1. Añadir columna 'bloqueado_por' a la tabla ordenes para concurrencia optimista
ALTER TABLE public.ordenes 
ADD COLUMN IF NOT EXISTS bloqueado_por TEXT;

-- 2. Crear tabla inmutable de auditoría 'bitacora_operaciones'
CREATE TABLE IF NOT EXISTS public.bitacora_operaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id TEXT,
  operadora_email TEXT NOT NULL,
  operadora_nombre TEXT,
  accion TEXT NOT NULL,
  detalles JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.bitacora_operaciones ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso RLS (Lectura y Escritura para staff autenticado / anónimo)
DROP POLICY IF EXISTS "Permitir lectura de bitacora" ON public.bitacora_operaciones;
CREATE POLICY "Permitir lectura de bitacora" 
  ON public.bitacora_operaciones 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir insercion de bitacora" ON public.bitacora_operaciones;
CREATE POLICY "Permitir insercion de bitacora" 
  ON public.bitacora_operaciones 
  FOR INSERT 
  WITH CHECK (true);

-- 5. Habilitar Supabase Realtime para bitácora y órdenes
ALTER PUBLICATION supabase_realtime ADD TABLE public.bitacora_operaciones;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ordenes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ordenes;
  END IF;
END $$;
