-- ==============================================================================
-- MIGRACIÓN SUPABASE: IDENTIDAD DIGITAL Y CÓDIGO ÚNICO DE ALIADOS 2027
-- ==============================================================================

-- 1. Crear tabla perfiles si no existe
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY,
  email TEXT,
  rol VARCHAR(50) NOT NULL, -- 'CLIENTE', 'MECANICO', 'RUNNER', 'REPUESTOS', 'OPERADORA', 'ADMIN'
  nombre_completo VARCHAR(255),
  telefono VARCHAR(50),
  avatar_url TEXT,
  codigo_aliado VARCHAR(50) UNIQUE,
  perfil_completado BOOLEAN DEFAULT false,
  detalles JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que la columna 'codigo_aliado' exista y sea UNIQUE
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS codigo_aliado VARCHAR(50);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'perfiles_codigo_aliado_key'
  ) THEN
    ALTER TABLE public.perfiles ADD CONSTRAINT perfiles_codigo_aliado_key UNIQUE (codigo_aliado);
  END IF;
END $$;

ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS rol VARCHAR(50),
ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
ADD COLUMN IF NOT EXISTS perfil_completado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS detalles JSONB DEFAULT '{}'::jsonb;

-- 2. Función PL/pgSQL para generar el código automáticamente según el rol del usuario
CREATE OR REPLACE FUNCTION generar_codigo_aliado()
RETURNS TRIGGER AS $$
DECLARE
  prefijo VARCHAR;
  nuevo_codigo VARCHAR;
BEGIN
  IF NEW.rol = 'MECANICO' THEN prefijo := '#TTM-';
  ELSIF NEW.rol = 'RUNNER' THEN prefijo := '#RUN-';
  ELSIF NEW.rol = 'REPUESTOS' THEN prefijo := '#REP-';
  ELSE RETURN NEW; END IF;
  
  -- Si ya viene un codigo_aliado asignado manualmente, respetarlo
  IF NEW.codigo_aliado IS NOT NULL AND NEW.codigo_aliado <> '' THEN
    RETURN NEW;
  END IF;

  -- Genera un número aleatorio de 4 dígitos
  nuevo_codigo := prefijo || lpad(floor(random() * 10000)::text, 4, '0');
  NEW.codigo_aliado := nuevo_codigo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger antes de la inserción en perfiles
DROP TRIGGER IF EXISTS trigger_generar_codigo ON public.perfiles;
CREATE TRIGGER trigger_generar_codigo
BEFORE INSERT ON public.perfiles
FOR EACH ROW EXECUTE FUNCTION generar_codigo_aliado();

-- 4. Habilitar Row Level Security (RLS) en perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para lectura pública/anónima (necesaria para el login por código)
DROP POLICY IF EXISTS "Permitir lectura de perfiles" ON public.perfiles;
CREATE POLICY "Permitir lectura de perfiles" 
  ON public.perfiles 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir insercion de perfiles" ON public.perfiles;
CREATE POLICY "Permitir insercion de perfiles" 
  ON public.perfiles 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de perfiles" ON public.perfiles;
CREATE POLICY "Permitir actualizacion de perfiles" 
  ON public.perfiles 
  FOR UPDATE 
  USING (true);

-- 5. Habilitar Supabase Realtime para perfiles si aplica
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'perfiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.perfiles;
  END IF;
END $$;
