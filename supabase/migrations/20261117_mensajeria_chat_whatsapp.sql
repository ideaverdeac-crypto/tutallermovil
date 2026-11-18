-- ==============================================================================
-- MIGRACIÓN SUPABASE: BANDEJA DE MENSAJERÍA Y CHAT EN VIVO CENTRALIZADO 2027
-- TUTALLERMÓVIL: TORRE DE DESPACHO Y CLIENTE MI GARAJE
-- ==============================================================================

-- 1. Tabla de Conversaciones (Chat Web y WhatsApp)
CREATE TABLE IF NOT EXISTS public.conversaciones_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT,
  cliente_email TEXT,
  placa TEXT NOT NULL,
  vehiculo_info TEXT,
  operadora_id TEXT,
  operadora_nombre TEXT DEFAULT 'Andrea Silva (Central TTM)',
  operadora_foto TEXT DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  ultimo_mensaje TEXT,
  ultimo_mensaje_at TIMESTAMPTZ DEFAULT NOW(),
  no_leidos_operadora INTEGER DEFAULT 0,
  no_leidos_cliente INTEGER DEFAULT 0,
  estado TEXT DEFAULT 'activa', -- 'activa' | 'archivada' | 'resuelta'
  canal TEXT DEFAULT 'garaje_web', -- 'garaje_web' | 'whatsapp'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por placa y cliente
CREATE INDEX IF NOT EXISTS idx_conversaciones_placa ON public.conversaciones_whatsapp (placa);
CREATE INDEX IF NOT EXISTS idx_conversaciones_email ON public.conversaciones_whatsapp (cliente_email);
CREATE INDEX IF NOT EXISTS idx_conversaciones_updated ON public.conversaciones_whatsapp (updated_at DESC);

-- 2. Tabla de Mensajes de Chat
CREATE TABLE IF NOT EXISTS public.mensajes_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES public.conversaciones_whatsapp(id) ON DELETE CASCADE,
  remitente_tipo TEXT NOT NULL, -- 'cliente' | 'operadora' | 'sistema'
  remitente_nombre TEXT NOT NULL,
  remitente_foto TEXT,
  contenido TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto', -- 'texto' | 'imagen' | 'cotizacion' | 'ubicacion' | 'estado_orden'
  metadata JSONB DEFAULT '{}'::jsonb,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para recuperar mensajes de una conversación ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON public.mensajes_chat (conversacion_id, created_at ASC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.conversaciones_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_chat ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso RLS permisivas para operación en tiempo real
DROP POLICY IF EXISTS "Permitir lectura de conversaciones" ON public.conversaciones_whatsapp;
CREATE POLICY "Permitir lectura de conversaciones" 
  ON public.conversaciones_whatsapp FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion de conversaciones" ON public.conversaciones_whatsapp;
CREATE POLICY "Permitir insercion de conversaciones" 
  ON public.conversaciones_whatsapp FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de conversaciones" ON public.conversaciones_whatsapp;
CREATE POLICY "Permitir actualizacion de conversaciones" 
  ON public.conversaciones_whatsapp FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir lectura de mensajes" ON public.mensajes_chat;
CREATE POLICY "Permitir lectura de mensajes" 
  ON public.mensajes_chat FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion de mensajes" ON public.mensajes_chat;
CREATE POLICY "Permitir insercion de mensajes" 
  ON public.mensajes_chat FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de mensajes" ON public.mensajes_chat;
CREATE POLICY "Permitir actualizacion de mensajes" 
  ON public.mensajes_chat FOR UPDATE USING (true);

-- 4. Habilitar Supabase Realtime para ambas tablas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversaciones_whatsapp'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversaciones_whatsapp;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mensajes_chat'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_chat;
  END IF;
END $$;

-- 5. Semillas de Conversaciones Iniciales (Demo Operativa y Producción)
DO $$
DECLARE
  v_conv_maria UUID := 'a1111111-1111-1111-1111-111111111111';
  v_conv_carlos UUID := 'b2222222-2222-2222-2222-222222222222';
  v_conv_flota UUID := 'c3333333-3333-3333-3333-333333333333';
BEGIN
  -- Conversación 1: María Rodríguez (Toyota Corolla GLi 1.8L - AB123CD)
  INSERT INTO public.conversaciones_whatsapp (
    id, cliente_nombre, cliente_telefono, cliente_email, placa, vehiculo_info, 
    operadora_nombre, operadora_foto, ultimo_mensaje, ultimo_mensaje_at, no_leidos_operadora, no_leidos_cliente, canal
  ) VALUES (
    v_conv_maria, 'María Rodríguez', '+58 412 123 4567', 'maria.rodriguez@tutallermovil.com', 'AB123CD',
    'Toyota Corolla GLi 1.8L (2018)', 'Andrea Silva (Central TTM)',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'Perfecto Andrea, apruebo el cambio de pastillas delanteras. Quedo atenta al técnico.',
    NOW() - INTERVAL '15 minutes', 1, 0, 'garaje_web'
  ) ON CONFLICT (id) DO NOTHING;

  -- Mensajes María
  INSERT INTO public.mensajes_chat (conversacion_id, remitente_tipo, remitente_nombre, remitente_foto, contenido, created_at)
  VALUES 
    (v_conv_maria, 'cliente', 'María Rodríguez', NULL, 'Hola Andrea, buenas tardes. El pedal del freno se siente un poco esponjoso al frenar en bajada.', NOW() - INTERVAL '40 minutes'),
    (v_conv_maria, 'operadora', 'Andrea Silva', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', '¡Hola María! Un gusto saludarte. Ya revisé el último reporte de escáner de tu Corolla (AB123CD). Podemos enviar al especialista Carlos Mendoza para revisar pastillas y purgar el líquido.', NOW() - INTERVAL '30 minutes'),
    (v_conv_maria, 'sistema', 'Sistema TTM', NULL, '📋 Inspección técnica asignada: Especialista Carlos Mendoza (Mecánico 1 Senior).', NOW() - INTERVAL '25 minutes'),
    (v_conv_maria, 'operadora', 'Andrea Silva', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Te comento que el diagnóstico tiene un costo de $15 USD, pero si apruebas el servicio de frenos te queda 100% EXONERADO.', NOW() - INTERVAL '20 minutes'),
    (v_conv_maria, 'cliente', 'María Rodríguez', NULL, 'Perfecto Andrea, apruebo el cambio de pastillas delanteras. Quedo atenta al técnico.', NOW() - INTERVAL '15 minutes')
  ON CONFLICT DO NOTHING;

  -- Conversación 2: Carlos Gómez (Ford Explorer XLT 4x4 - AD456EF)
  INSERT INTO public.conversaciones_whatsapp (
    id, cliente_nombre, cliente_telefono, cliente_email, placa, vehiculo_info, 
    operadora_nombre, operadora_foto, ultimo_mensaje, ultimo_mensaje_at, no_leidos_operadora, no_leidos_cliente, canal
  ) VALUES (
    v_conv_carlos, 'Carlos Gómez', '+58 414 987 6543', 'carlos.gomez@gmail.com', 'AD456EF',
    'Ford Explorer XLT 4x4 (2020)', 'Andrea Silva (Central TTM)',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'Carlos ya va en camino hacia Chacao. Te llegará en aproximadamente 25 minutos con su Credencial QR.',
    NOW() - INTERVAL '5 minutes', 0, 1, 'whatsapp'
  ) ON CONFLICT (id) DO NOTHING;

  -- Mensajes Carlos
  INSERT INTO public.mensajes_chat (conversacion_id, remitente_tipo, remitente_nombre, remitente_foto, contenido, created_at)
  VALUES 
    (v_conv_carlos, 'cliente', 'Carlos Gómez', NULL, 'Buenas, solicité el servicio por la página para la Explorer AD456EF. ¿A qué hora llega el mecánico?', NOW() - INTERVAL '18 minutes'),
    (v_conv_carlos, 'operadora', 'Andrea Silva', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Hola Carlos, bienvenido a TuTallerMóvil. El especialista Carlos Mendoza ya aceptó la orden en la zona Chacao.', NOW() - INTERVAL '10 minutes'),
    (v_conv_carlos, 'operadora', 'Andrea Silva', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Carlos ya va en camino hacia Chacao. Te llegará en aproximadamente 25 minutos con su Credencial QR.', NOW() - INTERVAL '5 minutes')
  ON CONFLICT DO NOTHING;
END $$;
