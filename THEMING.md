# Identidad visual y Dark Mode — SE (Sistema Empresarial) RutaLibre

Este documento explica el sistema de colores y el modo oscuro implementados en el frontend del SE (`erp-shell`), para que cualquier persona que agregue un módulo nuevo mantenga la consistencia visual sin tener que adivinar valores.

## A. Paleta utilizada

La paleta se tomó directamente de `estilos/tokens.css` del **Portal de Clientes** (familia "azul" y "verde" de marca). El SE la reutiliza aplicándola a una interfaz administrativa: el azul profundo pasa a ser el color de navegación/acciones primarias, y el verde pasa a ser el acento de foco y estados activos.

| Color                    | HEX (light) | HEX (dark) | Uso                                                        |
| ------------------------ | ----------- | ---------- | ----------------------------------------------------------- |
| Azul 950 (`ink-950`)     | `#071E25`   | `#030C10`  | Fondo del sidebar                                           |
| Azul 900 (`ink-900`)     | `#0B3540`   | `#0A2830`  | Sidebar — secciones, hover                                  |
| Azul 600 (`ink-600`)     | `#147F91`   | `#2F95A8`  | Detalles sobre el sidebar, íconos                            |
| Primary 500              | `#0B3540`   | `#147F91`  | Botón primario, foco de marca                                |
| Route 500 (secundario)   | `#0B6878`   | `#147F91`  | Botón secundario, badges informativos                        |
| Verde acento 500         | `#16A34A`   | `#16A34A`  | Estado activo del sidebar, foco de inputs, CTA destacados     |
| Verde acento 400         | `#2DD4A8`   | `#2DD4A8`  | Detalles decorativos, hover sutil de acento                  |
| Surface (fondo app)      | `#F7F9FB`   | `#0B171C`  | Fondo del área de contenido                                   |
| Surface card             | `#FFFFFF`   | `#111D23`  | Tarjetas, paneles, modales, dropdowns                          |
| Surface sunken            | `#F1F5F7`   | `#081217`  | Inputs, filas alternas, skeletons, zonas "hundidas"            |
| Border / Border strong    | `#E2E8ED` / `#CBD6DE` | `#1E2C31` / `#2B3D43` | Bordes de tarjetas, inputs, separadores                        |
| Texto principal (900)     | `#172B3A`   | `#EEF4F4`  | Títulos, texto de mayor jerarquía                              |
| Texto secundario (700)    | `#3D505F`   | `#C3CFD1`  | Texto de cuerpo                                                |
| Texto muted (500/400)     | `#64748B` / `#93A2B3` | `#8FA0A4` / `#62767A` | Texto secundario, placeholders, metadatos                       |
| Éxito                     | `#16A34A`   | `#16A34A`  | Badges/alertas de éxito, tendencias positivas                  |
| Advertencia                | `#D18A1F`   | `#D18A1F`  | Badges/alertas de advertencia                                   |
| Error                      | `#DC4C3F`   | `#DC4C3F`  | Botón/badge/alerta destructivos                                 |
| Información                 | `#147F91`   | `#147F91`  | Badges/alertas informativos                                     |

> Nota: los tonos "500" sólidos (los que llevan texto blanco encima, como botones y badges) se mantienen **iguales o muy cercanos** entre modo claro y oscuro a propósito — ver sección C.

## B. Design Tokens

Todo vive centralizado en `src/index.css`, dentro de un bloque `@theme` (tokens de Tailwind v4) más un bloque `:root.dark` que redefine esos mismos tokens para el modo oscuro.

```css
@theme {
  --color-ink-950: #071e25;     /* sidebar */
  --color-primary-500: #0b3540; /* acciones principales */
  --color-route-500: #0b6878;   /* acciones/información secundaria */
  --color-accent-500: #16a34a;  /* foco, estados activos, CTA */
  --color-surface: #f7f9fb;
  --color-surface-card: #ffffff;
  --color-text-900: #172b3a;
  --color-success-500: #16a34a;
  --color-danger-500: #dc4c3f;
  --color-warning-500: #d18a1f;
  --color-info-500: #147f91;
  /* …ver src/index.css para el listado completo */
}
```

Los **nombres** de los tokens no cambiaron respecto a la versión anterior del SE (`ink`, `primary`, `route`, `surface`, `text`, `success/danger/warning/info`) — solo cambiaron los valores hexadecimales. La única excepción es `brass` → **`accent`**, renombrado porque ese token pasó de representar el latón/bronce anterior a representar el verde de marca del Portal; mantener el nombre viejo hubiera sido confuso para quien lea el código.

Todos los componentes (`Button`, `Badge`, `Input`, `Select`, `Sidebar`, `Header`, tarjetas del Dashboard, etc.) consumen estos tokens por nombre (`bg-primary-500`, `text-text-700`, `border-border`…), nunca colores sueltos. Por eso cambiar la paleta fue, en la práctica, editar un solo archivo (`src/index.css`) sin tocar los componentes.

## C. Dark Mode

### Cómo funciona

Tailwind v4 permite declarar `@custom-variant dark (&:where(.dark, .dark *));` y, como los tokens de arriba son variables CSS normales (no solo valores usados en tiempo de build), basta con **redefinirlas** bajo el selector `:root.dark` para que absolutamente todo lo que use `bg-surface`, `text-text-900`, `bg-primary-500`, etc. cambie de valor automáticamente cuando `<html>` tiene la clase `dark`. No hace falta agregar `dark:` a cada clase de cada componente.

Jerarquía de superficies en oscuro (de más profundo a más elevado):

```
ink-950 (sidebar, el más oscuro)
   ↓
surface (fondo del área de contenido)
   ↓
surface-card (tarjetas, paneles, modales)
   ↓
surface-sunken (inputs, filas alternas — vuelve a bajar un poco)
```

Los colores "500" de marca (botones, badges) se mantuvieron **casi iguales** entre temas a propósito: aclararlos demasiado para "que resalten más" sobre fondo oscuro arruina el contraste con el texto blanco que llevan encima. Lo que sí cambió con fuerza fue la escala neutra (fondos/bordes/texto) y los tintes "-50/-100" usados como fondo de badges y alertas.

### Dónde se controla

- **Store**: `src/stores/themeStore.ts` — Zustand + middleware `persist`. Guarda `mode: 'light' | 'dark' | 'system'`.
- **Sincronización**: `src/theme/ThemeSync.tsx` — componente sin UI, montado en `AppProviders`. Aplica la clase `dark` en `<html>` cada vez que cambia `mode`, y si `mode === 'system'`, escucha en vivo los cambios de preferencia del sistema operativo.
- **Control visual**: `src/layouts/AppLayout/Header/ThemeToggle.tsx` — dropdown en el Header (junto a notificaciones) con las tres opciones Claro / Oscuro / Sistema y check en la seleccionada. El ícono del botón (sol/luna) siempre refleja el tema *efectivo* actual.

### Cómo se persiste

`localStorage`, bajo la key `rutalibre-theme`, con el formato que genera el middleware `persist` de Zustand:

```json
{ "state": { "mode": "dark" }, "version": 0 }
```

No se agregó ninguna dependencia nueva — se reutilizó el mismo mecanismo (`zustand/persist`) que ya usaba `uiStore` para el estado del sidebar.

### Cómo se evita el flash de tema

Un script inline en el `<head>` de `index.html` (antes de cargar React) lee esa misma key de `localStorage`, resuelve `system` contra `window.matchMedia('(prefers-color-scheme: dark)')`, y agrega la clase `dark` a `<html>` sincrónicamente, antes del primer paint. Verificado: al recargar con el tema oscuro guardado, la clase `dark` ya está presente en el HTML en el momento de `DOMContentLoaded`, antes de que la aplicación de React monte.

Si en el futuro cambia el nombre de la key o el shape del estado persistido en `themeStore.ts`, hay que actualizar el script inline en `index.html` para que sigan leyendo lo mismo (está comentado en ambos archivos).

### Cómo agregar un componente nuevo compatible con Dark Mode

1. No uses colores sueltos (`#fff`, `bg-white`, `text-gray-500`, `rgb(...)`) — usa los tokens existentes (`bg-surface-card`, `text-text-500`, `border-border`, etc.).
2. Si necesitas un color que no existe como token, agrégalo en `src/index.css`: un valor en el bloque `@theme` (modo claro) y su contraparte en `:root.dark`.
3. Con eso alcanza — no necesitas escribir clases `dark:` en el componente. El componente hereda el tema automáticamente por heredar los tokens.

## D. Componentes y archivos relacionados con el tema

- `src/index.css` — tokens (paleta del Portal), arquitectura de Dark Mode (`@custom-variant dark`, bloque `:root.dark`), tokens de series de gráficos y reglas `@media print` del comprobante.
- `src/components/ui/Button.tsx` — la variante `danger` usa tokens (`bg-danger-600` / `bg-danger-700`).
- `index.html` — script inline anti-flash + `meta[name=color-scheme]` en `light dark`.
- `src/stores/themeStore.ts`, `src/theme/ThemeSync.tsx`, `src/layouts/AppLayout/Header/ThemeToggle.tsx` — control y persistencia del tema.
- Componentes del MVP (`Card`, `Table`, `Stepper`, `Toast`, `RadioCardGroup`, `SeatMap`, gráficos del Dashboard) consumen solo tokens: se re-temaron sin código adicional.

## E. Tokens de series de gráficos (Sprint 4)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-chart-1` | `#147f91` | `#2f95a8` | Serie principal (ingresos, barras de ranking, servicio Económico) |
| `--color-chart-2` | `#16a34a` | `#2dd4a8` | Servicio Ejecutivo |
| `--color-chart-3` | `#d18a1f` | `#e0a13e` | Servicio Directo |
| `--color-chart-4` | `#5b73c9` | `#8ea0ec` | Servicio VIP |

Los gráficos (recharts) reciben estos valores como `var(--color-chart-N)` y los ejes/grilla usan `var(--color-text-500)` y `var(--color-border)` (ver `features/dashboard/utils/estiloGraficos.ts`). Nunca se usan hexadecimales sueltos ni la paleta por defecto de la librería, así el cambio de tema los actualiza sin re-render especial. Cada gráfico incluye además una alternativa textual (tabla de datos o leyenda con valores).

## G. Movimiento (login, transiciones, microinteracciones)

Vocabulario de animación compartido, definido una sola vez en `src/index.css`:

- **Easing**: `--ease-premium` (`cubic-bezier(0.16, 1, 0.3, 1)`), usado en botones, inputs, cards, Sidebar y transición entre secciones — una curva "expo-out" para que las entradas se sientan rápidas pero controladas, no lineales.
- **Keyframes reutilizables**: `fade-in`, `fade-slide-up` (y su variante `-sm`), `scale-in`, `float-slow`/`float-slower` (halos del login), `draw-path` (trazo de ruta del login), `toast-in`, `shimmer` (Skeleton).
- **Transición entre secciones**: `views/MainView/MainView.tsx` usa `key={activeSectionId}` + `animate-fade-slide-up` para que cambiar entre "Registrar pasaje" y "Dashboard" tenga una entrada suave, sin bloquear la interacción ni requerir un router.
- **`prefers-reduced-motion`**: la regla global en `@layer base` reduce cualquier `animation-duration`/`transition-duration` a ~0ms. Como toda animación de entrada termina en el estado final visible (opacity:1, transform:none), con motion reducido el contenido aparece directamente en su posición final, sin saltos ni contenido invisible.

## H. Consideraciones futuras

- **Componentes nuevos**: usar `src/components/ui/` y los tokens existentes; así son compatibles con Dark Mode sin esfuerzo adicional.
- **Imágenes/ilustraciones**: considerar variante para fondo oscuro (o SVG con `currentColor`).
- **Contraste**: probar cualquier color nuevo con texto blanco/negro en ambos temas; los tonos "500" de marca se mantienen estables entre temas para no comprometer la legibilidad (el asiento seleccionado usa `primary-500` con texto blanco por esa razón).


## Tokens de booking (Registrar pasaje)

Capa semántica añadida para el flujo de venta. Viven en `@theme` y se redefinen en `:root.dark`; los componentes los usan por nombre (`bg-surface-selected`, `text-accent-line`, `bg-cta`…), nunca con hex sueltos.

| Token | Uso |
| --- | --- |
| `surface-hover` / `surface-raised` / `surface-selected` | hover de tarjetas y filtros, elevación (paleta de comandos), fondo de selección |
| `border-subtle` | separadores internos de bajo contraste |
| `accent-line` | borde/relleno de selección, progreso y disponibilidad alta |
| `cta` / `cta-hover` / `cta-active` / `on-cta` | acción primaria del flujo (`<Button variant="accent">`) |
| `--radius-card`, `--duration-fast/base` | radio y duraciones de microinteracciones (150–220 ms) |

Modo oscuro (por defecto): fondos `#0b171b` / `#0d1c21`, superficies `#102126` / `#12272d` / `#162d33`, sidebar `#071317`, verde `#10b981`. El modo claro sigue disponible desde el ThemeToggle.
