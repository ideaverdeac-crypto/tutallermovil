# Resumen de Auditoría y Optimización Web — Tu Taller Móvil

**URL de Producción:** https://tutallermovil.vercel.app  
**Stack:** Next.js 16 (App Router / Turbopack), React 19, Tailwind CSS, Supabase  
**Fecha de Ejecución:** 26 de Noviembre de 2026  

---

## Tabla de Resultados por Bloque

| Bloque | Cambio | Archivos tocados | Estado | Verificación |
| :--- | :--- | :--- | :---: | :--- |
| **Bloque 1 — Seguridad** | Cabeceras de seguridad estrictas (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy-Report-Only); cookies con flag `Secure` dinámico para producción; auditoría y plan de tokens opacos para carnet QR. | `vercel.json`<br>`SECURITY.md`<br>`src/app/login/page.tsx` | **Completado** | Inspección de cabeceras HTTP vía `curl -I`, validación de cookies de autenticación en login HTTPS. |
| **Bloque 2 — Rendimiento** | Lazy loading dinámico sin SSR para modal pesado (`SolicitarMecanicoModal`); optimización de Hero con `next/image` (`fill`, `priority`, `sizes="100vw"`); `loading="lazy"` en imágenes secundarias; Google Fonts con `display: "swap"`; preconnect y dns-prefetch a orígenes de imágenes y base de datos (`images.unsplash.com`, Supabase); configuración de remote patterns en `next.config.ts`. | `src/app/page.tsx`<br>`src/app/layout.tsx`<br>`src/components/HeroCredencialQR.tsx`<br>`next.config.ts`<br>`PERFORMANCE.md` | **Completado** | `npm run build` Turbopack exitoso en 612ms; prefetch y lazy load activos; bundle inicial de cliente aligerado. |
| **Bloque 3 — SEO y Metadatos** | JSON-LD estructurado de `LocalBusiness` con subtipo `AutoRepair` (Caracas, 5 municipios, servicios y precio base); Canonical URL; OpenGraph y Twitter Card completos; generación dinámica de `sitemap.xml` para rutas públicas y `robots.txt` bloqueando rutas privadas; directivas `robots: { index: false }` en rutas protegidas y carnet. | `src/app/robots.ts`<br>`src/app/sitemap.ts`<br>`src/app/aliados/layout.tsx`<br>`src/app/admin/layout.tsx`<br>`src/app/carnet/[codigo]/page.tsx`<br>`src/app/layout.tsx` | **Completado** | Validación sintáctica de JSON-LD con Google Rich Results Schema; rutas `/sitemap.xml` y `/robots.txt` servidas por Next.js. |
| **Bloque 4 — Accesibilidad (a11y)** | Skip link "Saltar al contenido principal" accesible por teclado hacia `<main id="main">`; idioma `lang="es-VE"`; foco visible de alto contraste con contorno dual (#0A1525 y halo claro); atributos `aria-label` en botones con solo icono (cerrar toasts, recargar órdenes, campana, tutorial, salir, crear servicio); ajuste de contraste de badges rojos a `#991B1B` superando 4.5:1 (ratio 6.94:1); asociación explícita de `htmlFor` e `id` en formularios de login. | `src/app/layout.tsx`<br>`src/app/page.tsx`<br>`src/app/globals.css`<br>`src/app/admin/despacho/page.tsx`<br>`src/app/aliados/portal/page.tsx`<br>`src/app/login/page.tsx`<br>`src/components/BandejaWhatsAppSheet.tsx`<br>`src/components/ModalCrearServicioManual.tsx`<br>`src/components/CredencialesOperadorasModal.tsx`<br>`src/components/ui/onboarding-modal.tsx` | **Completado** | Navegación por teclado (Tab) activando skip-to-content; cálculo de contraste WCAG AA/AAA; inspección de labels asociados en formularios. |
| **Bloque 5 — UX y PWA** | Botón visible "[ ACCESO OPERADORES ]" en barra de navegación de escritorio y "[ OPERADORES ]" en cabecera móvil; enlace discreto "[ PORTAL DE ALIADOS ]" en pie de página; Web App Manifest (`manifest.json`) validado con soporte para íconos 192x192 y 512x512; documentación del diagnóstico y hoja de ruta de Service Worker en `PWA.md`. | `src/app/page.tsx`<br>`public/manifest.json`<br>`PWA.md` | **Completado** | Enlaces operativos a `/aliados/portal` en header y footer; manifest accesible en `/manifest.json` e integrable como PWA standalone. |

---

## Cómo Verificar los Cambios

### 1. Seguridad
Ejecutar una consulta HTTP a la cabecera del despliegue en Vercel:
```bash
curl -I https://tutallermovil.vercel.app/
```
**Comprobar que aparezcan:**
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(self), microphone=(), geolocation=(self)`
- `Content-Security-Policy-Report-Only: default-src 'self'; ...`

Revisar en el navegador (DevTools > Application > Cookies) al iniciar sesión en `/login`:
- La cookie `ttm_session` incluye la propiedad `Secure` cuando el protocolo es `https:`.

---

### 2. Rendimiento
1. Abrir DevTools > pestaña **Network**:
   - Comprobar que en la carga de `/` no se descarga de inmediato el chunk correspondiente al formulario/modal de solicitud hasta hacer clic en el botón de solicitar mecánico (`next/dynamic` activo).
   - Comprobar que la imagen principal del Hero inicia con prioridad alta (`fetchpriority="high"`) y tamaños responsivos (`sizes="100vw"`).
2. Ejecutar auditoría Lighthouse en modo Mobile / Desktop sobre la landing page:
   - FCP (First Contentful Paint) y LCP (Largest Contentful Paint) optimizados gracias a `priority` en Hero y preconnects.

---

### 3. SEO y Metadatos
1. Visitar `https://tutallermovil.vercel.app/robots.txt`:
   - Verificar la presencia de `Disallow: /aliados/`, `Disallow: /admin/`, `Disallow: /carnet/`, etc., y el enlace a `Sitemap: https://tutallermovil.vercel.app/sitemap.xml`.
2. Visitar `https://tutallermovil.vercel.app/sitemap.xml`:
   - Verificar que lista únicamente las URLs públicas (`/`, `/login-cliente`, `/registro`, `/terminos`, `/terminos-y-condiciones`).
3. Inspeccionar el `<head>` de `/`:
   - Verificar el bloque `<script type="application/ld+json">` con el schema `AutoRepair` y el objeto `areaServed` con los 5 municipios de Caracas.
4. Inspeccionar el `<head>` de `/aliados/portal` y `/carnet/[codigo]`:
   - Verificar `<meta name="robots" content="noindex, nofollow"/>`.

---

### 4. Accesibilidad (a11y)
1. Navegación por teclado en la landing (`/`):
   - Al cargar la página y presionar la tecla `Tab`, debe aparecer en la parte superior el botón `[ Saltar al contenido principal ]`.
   - Al presionar `Enter`, el foco salta directamente al contenedor `<main id="main">`.
   - El contorno de foco en elementos interactivos es nítido (`outline: 2px solid #0A1525` con halo).
2. Inspección del código HTML:
   - El elemento raíz tiene `<html lang="es-VE">`.
   - En `/login`, los inputs tienen `id="staff-email"` y sus etiquetas tienen `htmlFor="staff-email"`.
   - Los botones con solo icono (cerrar notificación, campana, recargar) cuentan con `aria-label`.

---

### 5. UX y PWA
1. En pantalla de escritorio (`md` o superior):
   - En el menú superior aparece `[ ACCESO OPERADORES ]` enlazando a `/aliados/portal`.
2. En pantalla móvil (`< 768px`):
   - En la barra de cabecera superior aparece el botón `[ OPERADORES ]`.
3. En el pie de página de la landing:
   - Se observa el enlace `[ PORTAL DE ALIADOS ]` junto a los términos y privacidad.
4. Visitar `https://tutallermovil.vercel.app/manifest.json`:
   - El archivo responde con JSON válido, `display: "standalone"` y tamaños de icono `192x192` y `512x512`.
