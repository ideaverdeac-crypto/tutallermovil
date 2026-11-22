import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let next = requestUrl.searchParams.get('next') ?? '/cliente/dashboard';
  if (!next.startsWith('/')) {
    next = `/${next}`;
  }

  // Obtener host para redirección respetando proxies en Vercel
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectBase = !isLocalEnv && forwardedHost
    ? `https://${forwardedHost}`
    : requestUrl.origin;

  // Protección anti-localhost en producción
  if (!isLocalEnv && (redirectBase.includes('localhost') || redirectBase.includes('127.0.0.1'))) {
    redirectBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://tutallermovil.vercel.app';
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        const user = data.user;
        const nombreCompleto =
          user.user_metadata?.full_name ||
          user.user_metadata?.nombre ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Cliente TTM';

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        // Upsert en la tabla perfiles para garantizar integridad de cuenta
        try {
          await supabase.from('perfiles').upsert(
            {
              id: user.id,
              email: user.email,
              nombre_completo: nombreCompleto,
              avatar_url: avatarUrl,
              rol: 'CLIENTE',
              perfil_completado: true,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          );
        } catch (dbErr) {
          console.warn('[AUTH CALLBACK] Advertencia al sincronizar perfil en BD:', dbErr);
        }

        // Redirigir al destino (por defecto /cliente/dashboard)
        return NextResponse.redirect(`${redirectBase}${next}`);
      } else if (error) {
        console.error('[AUTH CALLBACK] Error intercambiando código OAuth:', error);
      }
    } catch (err) {
      console.error('[AUTH CALLBACK] Excepción en callback de autenticación:', err);
    }
  }

  // Fallback en caso de error o retorno sin código
  return NextResponse.redirect(`${redirectBase}/login-cliente?error=oauth`);
}
