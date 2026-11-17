---
name: Precision Technical Mobility
project_id: projects/7855173846451732796
project_title: TuTallerMóvil Landing Page
colors:
  surface: '#f7f9ff'
  surface-dim: '#d1dbe7'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf4ff'
  surface-container: '#e5effb'
  surface-container-high: '#dfe9f5'
  surface-container-highest: '#dae3f0'
  on-surface: '#131d25'
  on-surface-variant: '#45474c'
  inverse-surface: '#28313b'
  inverse-on-surface: '#e8f2fe'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f72'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#111c2c'
  on-primary-container: '#7a8498'
  inverse-primary: '#bcc7dd'
  secondary: '#255bb5'
  on-secondary: '#ffffff'
  secondary-container: '#719ffd'
  on-secondary-container: '#003479'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#161e00'
  on-tertiary-container: '#718e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fa'
  primary-fixed-dim: '#bcc7dd'
  on-primary-fixed: '#111c2c'
  on-primary-fixed-variant: '#3d4759'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a43'
  on-secondary-fixed-variant: '#004397'
  tertiary-fixed: '#c3f400'
  tertiary-fixed-dim: '#abd600'
  on-tertiary-fixed: '#161e00'
  on-tertiary-fixed-variant: '#3c4d00'
  background: '#f7f9ff'
  on-background: '#131d25'
  surface-variant: '#dae3f0'
  brand-overrides:
    primary-navy: '#0a1525'
    secondary-cobalt: '#1e56b0'
    accent-lime: '#ccff00'
    structural-border: '#cbd5e1'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
---

# TuTallerMóvil — Design System: Precision Technical Mobility

## 1. Brand & Style

Este sistema de diseño encarna la precisión clínica de un hangar aeroespacial moderno combinada con la agilidad logística bajo demanda en Caracas. Está dirigido a propietarios de vehículos que exigen diagnósticos rigurosos, transparencia y competencia mecánica experta a domicilio.

- **Filosofía Visual:** Laboratorio limpio / ingeniería de precisión.
- **Atmósfera:** Trazos arquitectónicos nítidos, alto contraste estructural, jerarquía tipográfica analítica y pureza de lienzo sin saturación visual.

---

## 2. Paleta de Colores

### Colores Principales de Marca
- **Lienzo Base (`#FFFFFF`):** Blanco puro para máxima claridad e higiene visual.
- **Superficie Suave (`#F8FAFC`):** Tinte pizarra frío para contenedores secundarios, módulos anidados y lecturas de datos.
- **Azul Marino Primario (`#0A1525`):** Ancla estructural para encabezados mayores, texto base y fondos oscuros de alto impacto.
- **Azul Cobalto Secundario (`#1E56B0` / `#255BB5`):** Motor operativo; enlaces, acciones secundarias, foco e indicadores dinámicos.
- **Verde Lima Acento (`#CCFF00`):** Gatillo diagnóstico de alto voltaje. Exclusivo para llamadas a la acción (CTAs primarios) y estados críticos, combinado estrictamente con texto `#0A1525`.
- **Borde Estructural (`#CBD5E1`):** Línea arquitectónica de bajo ruido (1px) para dividir secciones complejas sin sobrecarga visual.

### Mapeo Semántico Material Design
| Token Semántico | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `primary` | `#000000` | Énfasis estructural máximo |
| `on-primary` | `#ffffff` | Texto/íconos sobre primario |
| `primary-container` | `#111c2c` | Contenedores primarios oscuros |
| `on-primary-container`| `#7a8498` | Texto atenuado sobre contenedor primario |
| `secondary` | `#255bb5` | Elementos interactivos principales |
| `on-secondary` | `#ffffff` | Texto sobre elementos secundarios |
| `secondary-container`| `#719ffd` | Contenedores de interacción suave |
| `tertiary-fixed` | `#c3f400` / `#ccff00` | Acentos Lima diagnósticos |
| `surface` | `#f7f9ff` | Fondo base de aplicación |
| `surface-container-low` | `#ecf4ff` | Fondos de tarjetas de bajo nivel |
| `surface-container` | `#e5effb` | Fondos de tarjetas estándar |
| `surface-container-high`| `#dfe9f5` | Contenedores destacados |
| `on-surface` | `#131d25` | Texto principal |
| `on-surface-variant` | `#45474c` | Texto secundario y etiquetas |
| `outline` | `#75777d` | Bordes activos y divisores fuertes |
| `outline-variant` | `#c5c6cd` | Bordes pasivos y reglas de tabla |
| `error` | `#ba1a1a` | Estados de error crítico |

---

## 3. Tipografía

La tipografía unificada es **Inter** para mantener uniformidad mecánica y alta densidad de datos legibles.

| Escala | Tamaño | Peso | Line Height | Tracking | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `headline-xl` | 48px | 700 (Bold) | 56px | -0.03em | Héroe Desktop |
| `headline-xl-mobile` | 32px | 700 (Bold) | 40px | -0.02em | Héroe Mobile |
| `headline-lg` | 32px | 600 (SemiBold) | 40px | -0.02em | Títulos de Sección Desktop |
| `headline-lg-mobile` | 24px | 600 (SemiBold) | 32px | -0.01em | Títulos de Sección Mobile |
| `headline-md` | 24px | 600 (SemiBold) | 32px | -0.01em | Subtítulos y Módulos |
| `title-md` | 18px | 600 (SemiBold) | 26px | -0.005em | Títulos de Tarjetas / Servicios |
| `body-lg` | 16px | 400 (Regular) | 24px | 0 | Párrafos introductorios |
| `body-md` | 14px | 400 (Regular) | 20px | 0 | Texto de lectura estándar |
| `body-sm` | 12px | 400 (Regular) | 16px | 0 | Notas técnicas, metadatos y partes |
| `label-md` | 12px | 600 (SemiBold) | 16px | +0.05em | Etiquetas técnicas, selectores |
| `label-sm` | 10px | 700 (Bold) | 12px | +0.08em | Badges de telemetría y chips en mayúsculas |

---

## 4. Radios de Borde (Border Radius)

Inspirado en piezas mecánicas y equipo de diagnóstico calibrado, el sistema utiliza esquinas suaves y sutiles:

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `sm` | `0.125rem` (2px) | Checkboxes, indicadores pequeños, toggles |
| `DEFAULT` | `0.25rem` (4px) | Botones primarios, inputs, chips de estado |
| `md` | `0.375rem` (6px) | Menús desplegables, tooltips |
| `lg` | `0.5rem` (8px) | Tarjetas de servicios, contenedores estándar |
| `xl` | `0.75rem` (12px) | Paneles modales y hojas inferiores |
| `full` | `9999px` | Avatares y puntos de estado redondos |

---

## 5. Espaciado y Layout

Ritmo base basado en múltiplos de **4px**:

### Escala de Espacios
- `space-xs`: `0.25rem` (4px) — Separación mínima interna (ícono-texto).
- `space-sm`: `0.5rem` (8px) — Padding interno en botones compactos y chips.
- `space-md`: `1rem` (16px) — Padding estándar de tarjetas y separación entre bloques.
- `space-lg`: `1.5rem` (24px) — Gutter entre columnas y padding de contenedores mayores.
- `space-xl`: `2.5rem` (40px) — Separación vertical entre secciones principales.

### Cuadrícula (Grid) y Márgenes
- **Desktop (>= 1024px):** 12 columnas | Gutters: `1.5rem` (24px) | Márgenes: `2rem` (32px) | Ancho máximo: `1280px`.
- **Tablet (768px - 1023px):** 8 columnas | Gutters: `1rem` (16px) | Márgenes: `1.5rem` (24px).
- **Mobile (< 768px):** 4 columnas | Gutters: `1rem` (16px) | Márgenes: `1rem` (16px).

---

## 6. Elevación y Sombras

Jerarquía basada en bordes finos y estratificación tonal en lugar de sombras pesadas:
- **Nivel 0 (Base):** `#FFFFFF` fondo limpio.
- **Nivel 1 (Estructural):** Fondo `#F8FAFC` con borde de `1px solid #CBD5E1`.
- **Nivel 2 (Flotante / Overlay):** Fondo `#FFFFFF` con borde `1px solid #0A1525` y sombra tenue: `0 4px 12px rgba(10, 21, 37, 0.08)`.
- **Divisores:** `1px solid #CBD5E1`.

---

## 7. Componentes Clave

### Botones
- **CTA Primario ("Agendar Mecánico"):** Fondo Verde Lima `#CCFF00`, texto `#0A1525`, Inter SemiBold, radio 4px (`rounded-DEFAULT`). Hover: borde inset de 1px `#0A1525`.
- **CTA Secundario:** Fondo Azul Marino `#0A1525` con texto blanco, o variante outline con borde `1px solid #CBD5E1` y texto `#0A1525` pasando a `#1E56B0` en hover.
- **Acción Terciaria:** Fondo transparente, texto `#1E56B0` con subrayado en hover.

### Badges e Indicadores de Estado
- Fondo `#F8FAFC`, borde `1px solid #CBD5E1`, punto de 6px (Verde `#CCFF00` = confirmado, Cobalto `#1E56B0` = en camino, Marino `#0A1525` = programado). Tipografía: `label-sm` en mayúsculas con tracking `0.08em`.

### Tarjetas de Diagnóstico y Telemetría
- Contenedores compactos con metadatos del vehículo (placa, chasis, mecánico asignado), división por líneas `1px solid #CBD5E1` y desglose de cotización transparente con totales contrastados.
