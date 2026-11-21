import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let role: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.user_metadata?.role) {
      role = String(user.user_metadata.role).toUpperCase();
    }
  } catch (err) {
    // Continuar con verificación de cookie secundaria
  }

  // Si no se obtuvo de user_metadata (o para Aliados autenticados con código y PIN)
  if (!role) {
    const roleCookie = request.cookies.get('ttm_role')?.value;
    if (roleCookie) {
      role = roleCookie.toUpperCase();
    }
  }

  const { pathname } = request.nextUrl;

  const rolePortals: Record<string, string> = {
    ADMIN: '/admin/finanzas',
    OPERADORA: '/admin/despacho',
    MECANICO: '/aliados/portal',
    RUNNER: '/runner/portal',
    REPUESTOS: '/repuestos/pedidos',
  };

  // 1. Si está en /login y ya cuenta con sesión y rol activo
  if (pathname === '/login') {
    if (role && rolePortals[role]) {
      return NextResponse.redirect(new URL(rolePortals[role], request.url));
    }
    return response;
  }

  // 2. Ruta /admin/finanzas (Exclusivo ADMIN)
  if (pathname.startsWith('/admin/finanzas')) {
    if (role !== 'ADMIN') {
      if (!role) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        );
      }
      const destino = rolePortals[role] || '/login';
      return NextResponse.redirect(new URL(destino, request.url));
    }
    return response;
  }

  // 3. Ruta /admin/despacho (ADMIN u OPERADORA)
  if (pathname.startsWith('/admin/despacho')) {
    if (role !== 'ADMIN' && role !== 'OPERADORA') {
      if (!role) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        );
      }
      const destino = rolePortals[role] || '/login';
      return NextResponse.redirect(new URL(destino, request.url));
    }
    return response;
  }

  // 4. Ruta /aliados (MECANICO o ADMIN)
  if (pathname.startsWith('/aliados')) {
    // Si es un enlace directo de servicio (/aliados/servicio/[id]), permitir acceso directo
    if (pathname.startsWith('/aliados/servicio/')) {
      return response;
    }

    if (role !== 'MECANICO' && role !== 'ADMIN') {
      if (!role) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        );
      }
      const destino = rolePortals[role] || '/login';
      return NextResponse.redirect(new URL(destino, request.url));
    }
    return response;
  }

  // 5. Ruta /runner (RUNNER o ADMIN)
  if (pathname.startsWith('/runner')) {
    if (role !== 'RUNNER' && role !== 'ADMIN') {
      if (!role) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        );
      }
      const destino = rolePortals[role] || '/login';
      return NextResponse.redirect(new URL(destino, request.url));
    }
    return response;
  }

  // 6. Ruta /repuestos (REPUESTOS o ADMIN)
  if (pathname.startsWith('/repuestos')) {
    if (role !== 'REPUESTOS' && role !== 'ADMIN') {
      if (!role) {
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        );
      }
      const destino = rolePortals[role] || '/login';
      return NextResponse.redirect(new URL(destino, request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/aliados/:path*',
    '/runner/:path*',
    '/repuestos/:path*',
    '/login'
  ],
};
