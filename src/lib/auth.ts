import { createClient } from '@/lib/supabase/client';

export async function cerrarSesion() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[AUTH] Aviso al cerrar sesión en Supabase:', err);
  }

  // Eliminar cookies de autenticación y rol
  if (typeof document !== 'undefined') {
    document.cookie = 'ttm_role=; path=/; max-age=0; SameSite=Lax;';
    document.cookie = 'ttm_user_code=; path=/; max-age=0; SameSite=Lax;';
    window.location.href = '/login';
  }
}
