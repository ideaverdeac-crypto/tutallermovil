# Progressive Web App (PWA) Audit & Roadmap

**Proyecto:** Tu Taller Móvil (`https://tutallermovil.vercel.app`)  
**Fecha:** 26 de Noviembre de 2026  
**Entorno:** Next.js App Router (v15+) en Vercel  

---

## 1. Estado Actual de PWA

| Componente | Estado | Detalle |
| :--- | :---: | :--- |
| **Web App Manifest (`public/manifest.json`)** | ✅ Implementado | Configurado con `name: "Tu Taller Móvil"`, `short_name: "TuTallerMóvil"`, `start_url: "/"`, `display: "standalone"`, `orientation: "portrait"`, `background_color: "#FFFFFF"`, `theme_color: "#0A1525"`. |
| **Enlace en `<head>` (`src/app/layout.tsx`)** | ✅ Implementado | Metadata nativa de Next.js `manifest: "/manifest.json"`, `appleWebApp: { capable: true, statusBarStyle: "black-translucent" }`. |
| **Íconos de aplicación** | ✅ Implementado | `public/icon.svg` configurado para densidades `192x192` y `512x512` con `purpose: "any maskable"`, favicon e iconos Apple Touch. |
| **Theme Color / Viewport** | ✅ Implementado | Configuración de export `viewport` en `src/app/layout.tsx` con `themeColor: "#0A1525"` y `viewportFit: "cover"`. |
| **Service Worker (Offline Caching / Background Sync)** | ⏳ Pendiente | No implementado en este bloque (según directriz del proyecto para evitar complejidad de sincronización en tiempo real con Supabase Realtime). |

---

## 2. Diagnóstico del Service Worker

Actualmente, la plataforma opera como un Web App interactiva con datos en tiempo real (despacho, WebSocket/Supabase Realtime, geolocalización de mecánicos en ruta). 

Un Service Worker con caching agresivo de rutas API o de Server Actions podría causar desincronización de estados críticos (ej. estados de despacho en vivo, disponibilidad de órdenes en la bolsa de mecánicos). Por lo tanto:
- El manifest permite la instalación inmediata como PWA (A2HS - "Add to Home Screen") en iOS y Android con vista standalone sin barra del navegador.
- El Service Worker queda documentado para una fase dedicada de offline-first o notificaciones Push.

---

## 3. Hoja de Ruta para Integración Futura de Service Worker

1. **Librería recomendada:** `@ducanh2912/next-pwa` o `Serwist` (diseñadas específicamente para Next.js App Router y Turbopack).
2. **Estrategia de Caché recomendada:**
   - **Assets estáticos (`_next/static`, fuentes, imágenes locales):** *Cache First* con expiración a 30 días.
   - **Páginas dinámicas (`/aliados/*`, `/admin/*`):** *Network Only* para asegurar que el estado de despacho y las órdenes en vivo nunca muestren datos obsoletos.
   - **Landing (`/`):** *Stale While Revalidate* para carga instantánea offline o en redes 3G lentas.
3. **Web Push Notifications:** Integración de VAPID keys para alertar a los mecánicos cuando cae un nuevo lead disponible en su cuadrante.
