# Auditoría de Rendimiento y Core Web Vitals — Tu Taller Móvil

**Sitio web:** [https://tutallermovil.vercel.app](https://tutallermovil.vercel.app)  
**Entorno:** Next.js 16 (App Router) + Turbopack + Vercel Edge  
**Fecha:** Noviembre 2026  

---

## 1. Diagnóstico del Bundle y Dependencias

Se evaluó la estructura del bundle y la carga inicial de scripts:

- **Componentes con renderizado interactivo diferido:**
  - `SolicitarMecanicoModal` (contiene múltiples pasos de formulario, selector de marcas, inputs de kilometraje y geocodificación): Migrado a carga bajo demanda con `next/dynamic` (`ssr: false`). El bundle inicial de la landing `/` ya no transfiere el código del modal hasta que el usuario hace clic en "PEDIR MECÁNICO HOY" o "AGENDAR SERVICIO".
- **Librerías de iconos y utilidades:**
  - `lucide-react`: Se importan únicamente los iconos requeridos directamente para que el tree-shaking de Next.js/Turbopack descarte los no utilizados.
- **Scripts de terceros bloqueantes:**
  - No existen tags `<script>` externos bloqueantes en el `<head>`. Las fuentes de Google Fonts y analytics de Vercel se cargan de forma asíncrona y optimizada.

---

## 2. Optimización de Imágenes y LCP (Largest Contentful Paint)

1. **Imagen Hero Principal (`/`):**
   - **Antes:** Etiqueta estándar `<img>` con URL estática de Unsplash sin optimización de tamaño, formato moderno ni atributo `priority`.
   - **Mejora aplicada:** Sustituida por `next/image` con:
     - `priority={true}`: Dispara el preload HTTP en el HTML inicial para minimizar el tiempo de LCP.
     - `fill`: Adaptación responsiva al contenedor con CSS aspect-ratio.
     - `sizes="100vw"`: Permite al navegador seleccionar el tamaño óptimo según la densidad de píxeles del dispositivo.
     - Conversión automática a WebP/AVIF gestionada por el optimizador de imágenes de Vercel.
2. **Imágenes Below-the-fold:**
   - Se añadió `loading="lazy"` en componentes secundarios (como `HeroCredencialQR` y avatares).
   - Se actualizaron los `remotePatterns` en `next.config.ts` para autorizar `images.unsplash.com`, `lh3.googleusercontent.com` y `*.supabase.co`.

---

## 3. Fuentes Web y Eliminación de FOIT (Flash of Invisible Text)

En `src/app/layout.tsx`:
- Las fuentes `Playfair_Display`, `Anton` y `Space_Mono` fueron configuradas con:
  ```ts
  display: "swap"
  ```
- **Beneficio en Core Web Vitals:** Evita el bloqueo del renderizado de texto (FOIT) durante la descarga de tipografías, reduciendo el FCP (First Contentful Paint) y asegurando que el contenido sea legible de inmediato con la tipografía fallback del sistema hasta que la fuente web esté lista.

---

## 4. Preconexión y Pre-resolución DNS (Resource Hints)

Se agregaron etiquetas en el `<head>` del layout raíz:
- `<link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />`
- `<link rel="dns-prefetch" href="https://images.unsplash.com" />`
- `<link rel="preconnect" href="https://iixmdbkckvypujqpkfsf.supabase.co" crossOrigin="anonymous" />`
- `<link rel="dns-prefetch" href="https://iixmdbkckvypujqpkfsf.supabase.co" />`

Esto adelanta el handshake TCP/TLS hacia los orígenes de imágenes y base de datos en tiempo real antes de que se inicien las solicitudes de red.

---

## 5. Metadatos de Viewport y Theme Color

En `src/app/layout.tsx`:
- Se exporta el objeto `viewport` conforme a la especificación de Next.js:
  ```ts
  export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#0A1525",
  };
  ```
- Previene saltos de zoom indeseados en inputs móviles y sincroniza el color de la barra del navegador (Chrome Android / Safari iOS) con el color primario de la marca.
