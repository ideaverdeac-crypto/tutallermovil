# Auditoría y Políticas de Seguridad — Tu Taller Móvil

**Sitio web:** [https://tutallermovil.vercel.app](https://tutallermovil.vercel.app)  
**Fecha:** Noviembre 2026  
**Entorno:** Producción / Vercel Edge Network  

---

## 1. Cabeceras de Seguridad HTTP (HTTP Security Headers)

Se han configurado a nivel de infraestructura en `vercel.json` para aplicarse a todas las rutas `/(.*)`:

| Cabecera HTTP | Valor Configurado | Estado | Descripción / Justificación |
| :--- | :--- | :---: | :--- |
| **Strict-Transport-Security (HSTS)** | `max-age=63072000; includeSubDomains; preload` | **Aplicada** | Fuerza el uso exclusivo de HTTPS durante 2 años en todo el dominio y subdominios, elegible para la lista de precarga HSTS de navegadores. |
| **X-Content-Type-Options** | `nosniff` | **Aplicada** | Bloquea el MIME-sniffing de archivos, forzando a los clientes a respetar los tipos MIME declarados. |
| **X-Frame-Options** | `SAMEORIGIN` | **Aplicada** | Previene ataques de Clickjacking impidiendo que el sitio sea incrustado en iframes de dominios externos. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | **Aplicada** | Protege datos de la ruta y parámetros en solicitudes hacia dominios externos manteniendo el origen completo solo en HTTPS del mismo origen. |
| **Permissions-Policy** | `camera=(self), microphone=(), geolocation=(self)` | **Aplicada** | Permite cámara y geolocalización exclusivamente en el origen propio (necesario para odómetro, carnet y cálculo de ruta) y bloquea micrófono globalmente. |
| **Content-Security-Policy-Report-Only** | Política detallada multi-origen | **Aplicada (Report-Only)** | Monitorea violaciones de recursos sin interrumpir la operación ni scripts de terceros legítimos. |

### Migración de CSP Report-Only a Enforcement (`Content-Security-Policy`)

Actualmente la cabecera está configurada como:
`Content-Security-Policy-Report-Only`

Permite:
- **Scripts:** `'self'`, scripts inline requeridos por Next.js App Router, `https://va.vercel-scripts.com`, `https://vitals.vercel-insights.com`.
- **Estilos:** `'self'`, `'unsafe-inline'` (Tailwind CSS JIT), fuentes de Google Fonts (`https://fonts.googleapis.com`).
- **Imágenes:** `'self'`, `data:`, `blob:`, Unsplash (`https://images.unsplash.com`), avatares de Google (`https://lh3.googleusercontent.com`), Supabase Storage (`https://*.supabase.co`), Vercel Blob (`https://*.vercel-storage.com`).
- **Conexiones:** `'self'`, API REST y WebSockets de Supabase (`https://*.supabase.co`, `wss://*.supabase.co`), Vercel Analytics y WhatsApp Web (`https://api.whatsapp.com`).

**Pasos para migrar a modo estricto (Enforcement):**
1. Inspeccionar la consola del navegador durante 7 días para verificar que no existan reportes de violación en flujos críticos (carga de imágenes de odómetro, subida de firmas, WebSockets de despacho).
2. En `vercel.json`, cambiar la clave:
   ```json
   "key": "Content-Security-Policy"
   ```
   reemplazando `"Content-Security-Policy-Report-Only"`.
3. Opcionalmente, agregar una directiva `report-uri` o `report-to` hacia un endpoint de monitoreo (como Sentry o Vercel Log Drains).

---

## 2. Verificación de Cookies de Sesión (`/aliados/portal` y Staff)

Se verificó el esquema de almacenamiento y transporte de credenciales:

1. **Sesión Principal Supabase Auth (`sb-<id>-auth-token`):**
   - **Gestor:** `@supabase/ssr` en `src/middleware.ts` y cliente HTTP del servidor.
   - **Atributos:** `HttpOnly=true`, `Secure=true` (en producción), `SameSite=Lax`.
   - **Estado:** **Ya cumple.** Las credenciales criptográficas de Supabase Auth se transfieren protegidas contra lectura por scripts XSS.

2. **Cookies de Contexto RBAC (`ttm_role`, `ttm_user_code`):**
   - **Propósito:** Resolución ultra-rápida de rol en Edge Middleware (`src/middleware.ts`) para evitar waterfalls en navegación hacia portales (`/aliados/portal`, `/admin/despacho`, `/runner/portal`).
   - **Atributos aplicados:** `SameSite=Lax`, `path=/`, `max-age=86400`, `Secure` activo en conexiones HTTPS.
   - **Estado:** **Aplicada.**

---

## 3. Revisión de Seguridad de Credenciales QR (`/carnet/[codigo]`)

### Diagnóstico Actual
- La ruta dinámica actual es `/carnet/[codigo]`, consumida por `src/components/CarnetCard.tsx`.
- Parámetro recibido: códigos asignados (por ejemplo `#TTM-0842`, `#TTM-8976`) o UUID de perfil.
- El QR generado imprime la URL pública:
  `https://tutallermovil.vercel.app/carnet/<codigo>`
- Los códigos tienen formato de prefijo `#TTM-XXXX` con longitud corta, lo que teóricamente permitiría enumeración secuencial si no se audita.

### Plan de IDs Opacos y Firma Criptográfica (Sin romper datos actuales)

Para fortalecer el protocolo antifraude sin migrar ni invalidar los carnets físicos o códigos existentes:

1. **Esquema de ID Opaco (Nanoid / UUIDv4):**
   - Mantener el campo `codigo_aliado` (`#TTM-8976`) únicamente como identificador visual para el cliente humano.
   - Agregar a la tabla `perfiles` una columna `carnet_token` generada con `nanoid(21)` o `gen_random_uuid()`.
   - El QR apuntará a: `https://tutallermovil.vercel.app/carnet/v2?token=<token>&sig=<hmac>`

2. **Firma Criptográfica en Servidor (HMAC-SHA256):**
   - Utilizar una clave secreta en el servidor (`CARNET_SIGNING_KEY`).
   - Firma: `HMAC_SHA256(carnet_token + issued_at, CARNET_SIGNING_KEY)`.
   - El endpoint del servidor valida la firma antes de renderizar la credencial oficial, evitando cualquier alteración de la URL.
   - Si la firma es inválida, se muestra la advertencia de credencial no certificada.
