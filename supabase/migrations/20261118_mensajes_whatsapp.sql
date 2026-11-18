-- ==============================================================================
-- MIGRACIÓN SUPABASE: BANDEJA DE MENSAJES WHATSAPP (TORRE DE DESPACHO)
-- TABLA: mensajes_whatsapp
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.mensajes_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono_remitente VARCHAR(50) NOT NULL,
  nombre_remitente VARCHAR(255),
  mensaje TEXT NOT NULL,
  es_de_taller BOOLEAN DEFAULT false,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de conversaciones e histórico ordenado
CREATE INDEX IF NOT EXISTS idx_mensajes_whatsapp_tel ON public.mensajes_whatsapp (telefono_remitente, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mensajes_whatsapp_leido ON public.mensajes_whatsapp (leido);
CREATE INDEX IF NOT EXISTS idx_mensajes_whatsapp_created ON public.mensajes_whatsapp (created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.mensajes_whatsapp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura mensajes_whatsapp" ON public.mensajes_whatsapp;
CREATE POLICY "Permitir lectura mensajes_whatsapp" 
  ON public.mensajes_whatsapp FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion mensajes_whatsapp" ON public.mensajes_whatsapp;
CREATE POLICY "Permitir insercion mensajes_whatsapp" 
  ON public.mensajes_whatsapp FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion mensajes_whatsapp" ON public.mensajes_whatsapp;
CREATE POLICY "Permitir actualizacion mensajes_whatsapp" 
  ON public.mensajes_whatsapp FOR UPDATE USING (true);

-- Habilitar Supabase Realtime para la tabla mensajes_whatsapp
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mensajes_whatsapp'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_whatsapp;
  END IF;
END $$;
