-- ==============================================================================
-- MIGRACIÓN SUPABASE: DIAGNÓSTICO CHECKLIST 25 PUNTOS (JSONB)
-- ==============================================================================

-- 1. Añadir columna 'diagnostico_json' a la tabla 'ordenes'
ALTER TABLE public.ordenes 
ADD COLUMN IF NOT EXISTS diagnostico_json JSONB DEFAULT '{}'::jsonb;

-- 2. Asegurar que las actualizaciones de ordenes disparen Supabase Realtime
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ordenes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ordenes;
  END IF;
END $$;
