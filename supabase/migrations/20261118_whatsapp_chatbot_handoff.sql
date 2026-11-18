-- ==============================================================================
-- MIGRACIÓN SUPABASE: CHATBOT DE WHATSAPP Y HANDOFF HUMANO
-- TABLAS: whatsapp_chats, whatsapp_mensajes
-- ==============================================================================

-- 1. Tabla de Chats (Conversaciones)
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  vehiculo VARCHAR(255),
  falla TEXT,
  estado VARCHAR(50) DEFAULT 'INICIANDO', -- 'INICIANDO', 'PREGUNTANDO_CARRO', 'PREGUNTANDO_FALLA', 'HUMANO'
  ultimo_mensaje TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Mensajes
CREATE TABLE IF NOT EXISTS public.whatsapp_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
  telefono VARCHAR(50) NOT NULL,
  mensaje TEXT NOT NULL,
  es_de_taller BOOLEAN DEFAULT false,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_tel ON public.whatsapp_chats (telefono);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_estado ON public.whatsapp_chats (estado);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_updated ON public.whatsapp_chats (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_mensajes_chat ON public.whatsapp_mensajes (chat_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensajes_tel ON public.whatsapp_mensajes (telefono, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensajes_leido ON public.whatsapp_mensajes (leido);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura whatsapp_chats" ON public.whatsapp_chats;
CREATE POLICY "Permitir lectura whatsapp_chats" ON public.whatsapp_chats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion whatsapp_chats" ON public.whatsapp_chats;
CREATE POLICY "Permitir insercion whatsapp_chats" ON public.whatsapp_chats FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion whatsapp_chats" ON public.whatsapp_chats;
CREATE POLICY "Permitir actualizacion whatsapp_chats" ON public.whatsapp_chats FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir lectura whatsapp_mensajes" ON public.whatsapp_mensajes;
CREATE POLICY "Permitir lectura whatsapp_mensajes" ON public.whatsapp_mensajes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion whatsapp_mensajes" ON public.whatsapp_mensajes;
CREATE POLICY "Permitir insercion whatsapp_mensajes" ON public.whatsapp_mensajes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion whatsapp_mensajes" ON public.whatsapp_mensajes;
CREATE POLICY "Permitir actualizacion whatsapp_mensajes" ON public.whatsapp_mensajes FOR UPDATE USING (true);

-- Habilitar Supabase Realtime para ambas tablas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_mensajes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_mensajes;
  END IF;
END $$;
