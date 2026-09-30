# RutaLibre — Sistema Empresarial (SE) · MVP Sprint 3 + Sprint 4

ERP para agencias de transporte terrestre de pasajeros en Perú. Este MVP es **solo frontend**: datos mock deterministas + mock services + estado en memoria. No hay backend, base de datos ni autenticación real.

```bash
npm install
npm run dev      # desarrollo
npm run build    # tsc -b + vite build
npm run lint     # oxlint src
```

## Alcance del MVP

**Sprint 3 — Operaciones › Registrar pasaje.** Flujo `Viaje → Asientos → Pasajeros → Pago → Revisión → Confirmación`, con soporte para **operaciones de 1 a 6 asientos/pasajeros**: se eligen varios asientos del mismo viaje, se completa un formulario independiente por cada pasajero, se realiza **un único pago agrupado** y se emite **un boleto individual por asiento**, descargable uno a uno o todos juntos. El servicio (Económico, Ejecutivo, VIP, Directo) es un atributo del viaje, visible y filtrable en el paso 1. Métodos de pago: Efectivo, Tarjeta, Yape/Plin y Transferencia. Estado del pasaje: `emitido`. Ver la sección "Operación multi-pasajero" más abajo para el detalle completo.

**Sprint 4 — Dashboard.** KPIs (ingresos, pasajes vendidos, ocupación promedio, ticket promedio, viajes con ventas, agencias activas) con variación frente al período anterior; gráficos (evolución diaria de ingresos, ranking de agencias, distribución por servicio, ranking de rutas); filtros de período (7/30/90 días o rango), agencia, servicio y destino.

Un pasaje registrado en Sprint 3 se refleja de inmediato en el Dashboard: ambos leen el mismo store.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 (tokens `@theme` en `src/index.css`) · Zustand 5 · lucide-react · recharts (única dependencia de gráficos).

**¿Por qué recharts?** Ofrece tooltips, ejes responsivos y accesibilidad de SVG listos, y acepta `var(--color-…)` como colores, así que respeta los tokens y el modo oscuro. Construir esos gráficos en SVG propio habría costado más código que mantener. Se carga bajo demanda (`React.lazy`) solo al abrir el Dashboard.

## Arquitectura

No hay router: la app es una **Main View única**. El Sidebar cambia `activeSectionId` en `stores/uiStore.ts` y `views/MainView/SectionRegistry.tsx` renderiza la sección. `config/navigation.ts` es la única fuente de verdad del menú (Sidebar, Breadcrumbs y tooltips).

```
data/mock  →  services/mock  →  utils (agregaciones puras)  →  hooks  →  componentes
```

```
src/
├── app/                    App, providers (tema, toasts), ProtectedRoute
├── layouts/AppLayout/      Sidebar, Header, Breadcrumbs, MainContent
├── views/MainView/         MainView, SectionRegistry, sections/ (wrappers finos)
├── features/
│   ├── ticketing/          Sprint 3: TicketingFlow, components/, hooks/, utils/
│   └── dashboard/          Sprint 4: DashboardView, components/, hooks/, utils/
├── components/ui|feedback|navigation/   UI kit (Button, Input, Select, Card, Table, Stepper, Toast, RadioCardGroup…)
├── config/                 navigation.ts, referencia.ts (fecha de referencia)
├── data/mock/              datos crudos y generador con semilla
├── services/               contracts.ts, errors.ts, mock/, index.ts
├── stores/                 uiStore, authStore, themeStore, toastStore, ticketingStore
├── types/  hooks/  utils/  theme/
```

Reglas: los componentes de `features/` **nunca** importan de `data/mock` ni de `services/mock`; solo de `@/services` y de hooks. Tipado estricto, sin `any`.

### Datos mock

`FECHA_REFERENCIA = 2026-09-24` (`config/referencia.ts`). Los datos se generan con un PRNG con semilla (mulberry32), por lo que son idénticos en cada recarga: 180 días de historia + 14 días de viajes programados, 7 agencias, 9 rutas, 4 servicios, ~2.500 viajes y ~60.000 pasajes. El Dashboard no tiene datos propios: todo se deriva de pasajes + viajes + agencias + servicios, y solo suman los pasajes en estado `emitido`. Recargar la página reinicia al estado semilla (nada se persiste, salvo las preferencias de UI ya existentes).

### Reemplazar mock por API real

1. Crear `src/services/api/*` que implementen `CatalogService`, `TicketingService` y `DashboardService` de `services/contracts.ts` (lanzando `ServiceError` con su `code` para los errores de dominio, p. ej. `ASIENTO_OCUPADO`).
2. En `src/services/index.ts` (único punto de selección) cambiar las tres importaciones `mock` por las `api`.
3. `data/mock`, `services/mock` y `stores/ticketingStore.ts` dejan de usarse y pueden eliminarse. Ningún componente ni hook cambia. Sustituir también `FECHA_REFERENCIA` por la fecha real.

## Autenticación (mock) y login

El acceso al Sistema Empresarial requiere sesión. `authStore` expone tres estados reales — `loading` (verificando si ya existe sesión), `unauthenticated` (se muestra `LoginView`, sin Sidebar/Header/contenido) y `authenticated` (se muestra el Shell) — y `ProtectedRoute` es el único lugar que decide entre ambos.

**Credenciales de la cuenta de demostración** (no se muestran como texto en la UI; el login trae un botón "Autocompletar" que las rellena sin revelarlas):

```
Correo:      camila.rojas@rutalibre.com
Contraseña:  RutaLibre#2026
```

Detalles de la implementación (100% mock, sin backend ni JWT real):
- La sesión se guarda en `sessionStorage` bajo la clave `rutalibre-se-session`: sobrevive a un refresh de la pestaña (como una sesión real) pero no persiste entre reinicios del navegador. `logout()` la borra y vuelve a `unauthenticated`.
- Como la app no tiene rutas (Main View única, sin historial de URLs), no existe una URL del shell a la que el botón "atrás" del navegador pueda volver tras cerrar sesión: `ProtectedRoute` decide qué se ve únicamente a partir de `status`.
- Credenciales incorrectas: mensaje de error accesible (`role="alert"`), ambos campos se marcan en rojo sin señalar cuál falló, la contraseña se limpia y recibe foco.
- "Recordarme" guarda solo el correo (no la contraseña) en `localStorage`, para prellenar el campo en la próxima visita.
- "¿Problemas para acceder?" dispara un toast informativo mock ("contacta a tu administrador"); no hay recuperación de contraseña real.

## Operación multi-pasajero (1 a 6 asientos)

El registro de pasaje admite una **operación** con varios asientos del mismo viaje en una sola pasada, inspirado en el comportamiento del Portal de clientes pero adaptado al contexto de ventanilla (sede, trabajador, trazabilidad).

**Modelo de datos.** Un `Pasaje` sigue siendo la unidad mínima (un asiento + un pasajero) — así el Dashboard, que agrega sumando `pasajes`, no necesita saber nada de "operaciones" para seguir calculando bien ingresos, ocupación y rankings. Una operación con N asientos genera N registros `Pasaje`, todos compartiendo un `operacionId` correlativo (`RL-OP-000123`) para trazabilidad, el mismo método de pago y un único monto recibido/vuelto (el pago es siempre grupal, nunca por asiento). `services/contracts.ts` expone `registrarOperacion(input)` (reemplaza al antiguo `registrarPasaje`), que valida y registra todos los asientos de forma **atómica**: si cualquiera ya está ocupado, no se emite ningún pasaje del grupo.

**Paso "Asientos".** Selección múltiple en el mismo mapa del bus (de 1 a `MAX_ASIENTOS_OPERACION = 6`, `src/types/pasaje.ts`), con contador ("X de 6 asientos seleccionados"), chips removibles y numeración de orden (#1, #2…). Al alcanzar el máximo, los asientos disponibles restantes se deshabilitan visualmente (no solo se avisa al hacer clic).

**Paso "Pasajeros".** Un ticket superior por asiento (`PassengerTicketCard`), con estado Pendiente/✓ Completado. Los datos de cada pasajero se guardan en `pasajerosPorAsiento: Record<numeroAsiento, PasajeroForm>` dentro del wizard (`useTicketWizard.ts`): cambiar de ticket nunca mezcla ni sobrescribe los datos de otro. El botón "Continuar al pago" permanece deshabilitado hasta que los N formularios sean válidos.

**Códigos de asiento amigables.** Los asientos se muestran como `fila + letra` (ej. "3D") en vez del número interno, calculados por `utils/asientos.ts` (`codigoDeAsiento`/`mapaCodigosAsiento`) a partir de la distribución del servicio. El número entero sigue siendo el identificador de negocio real; el código es solo de presentación.

**Cambiar asientos.** Botón visible en el paso "Pasajeros" que vuelve a "Asientos" conservando la selección y los datos ya ingresados. Si se intenta quitar (deseleccionar) un asiento que ya tiene datos de pasajero, se pide confirmación (`Modal`) antes de descartarlos; el resto de la operación no se ve afectado.

**Conflicto de asiento con varios seleccionados.** La simulación de venta concurrente (asiento interno n.º 13, ver más abajo) sigue disparándose una sola vez por viaje. Como el registro es atómico, si el asiento en conflicto forma parte de una operación de varios asientos, **no se emite ninguno**: se muestra el error señalando el asiento específico (`ServiceError.details.asiento`), y "Elegir otro asiento" solo quita ese asiento de la operación (con `quitarAsiento`), conservando el resto de los asientos y pasajeros ya cargados.

**Pago y revisión.** El paso "Pago" muestra el desglose por asiento (`Asiento 3D · Juan Pérez — S/ 51.00`, etc.) y un único total. La revisión final lista todos los pasajeros antes de confirmar.

**Boletos y descarga.** Al confirmar, se genera un `ComprobantePasaje` (boleto) por asiento — nunca un solo comprobante genérico para toda la operación. La pantalla de confirmación muestra una tarjeta compacta por boleto con su propio botón "Descargar boleto", más un botón "Descargar todos los boletos". **Sin backend ni librería de PDF**, la descarga genera un archivo **HTML autocontenido** (`features/ticketing/utils/descargaBoletos.ts`) con el mismo contenido del boleto, listo para abrir, guardar o imprimir/exportar a PDF desde el navegador. Cuando exista un servicio real de generación de boletos, esa función es el único lugar a reemplazar.



`authStore` simula un único usuario **trabajador** (`role: 'staff'`, permisos `pasajes:registrar` y `dashboard:ver`) asociado a la agencia `lim-norte`. El menú se filtra por `requiredPermission`. Cada sede del `BranchSelector` es una agencia (`data/mock/agencias.ts`): la misma entidad que agrupa el Dashboard y, en el registro, la **sede de venta** del pasaje.

## Reglas de negocio simuladas

- Solo se venden viajes `programado` con asientos libres y fecha ≥ fecha de referencia; los cancelados y agotados se listan deshabilitados.
- Una operación admite de 1 a 6 asientos del mismo viaje (`MAX_ASIENTOS_OPERACION`); cada asiento tiene exactamente un pasajero.
- Un asiento no se vende dos veces ni se puede duplicar dentro de la misma operación. Si hay conflicto al confirmar, se muestra el error señalando el asiento y **no se emite ningún pasaje de la operación** (todo o nada), y se vuelve al paso de asientos. Para poder demostrarlo, **el primer intento de confirmar una operación que incluya el asiento 13 de un viaje simula una venta concurrente** de ese asiento (`services/mock/ticketingService.ts`).
- Precio de la operación = tarifa base del servicio × factor de la ruta × cantidad de asientos, sin descuentos. Total y monto del pago coinciden.
- El pago es único para toda la operación (nunca por asiento). Efectivo: el monto recibido debe cubrir el total y se calcula el vuelto. Tarjeta, Yape/Plin y Transferencia requieren código de referencia.
- Un boleto (`Pasaje`) por asiento/pasajero; 6 asientos → 6 boletos.
- Códigos correlativos `RL-PS-000123` (pasaje/boleto), `RL-OP-000123` (operación) y `RL-VJ-000123` (viaje).

## Supuestos documentados

- Se añadió `data/mock/rutas.ts` (rutas, salidas y factores de tarifa) porque el modelo de viaje lo necesita.
- Tipos de documento: DNI (8 dígitos), Carné de extranjería (9 dígitos) y Pasaporte (6–12 alfanuméricos). Celular peruano: 9 dígitos, empieza con 9.
- Existen pasajes `anulado` (~2 % del histórico) solo en los datos semilla para que la regla "el Dashboard excluye lo no emitido" sea verificable; la UI no permite anular.
- Fechas del Dashboard = fecha de **emisión** del pasaje. La agencia = agencia de **venta**. Ocupación promedio = asientos vendidos / capacidad, promediado sobre los viajes **finalizados** con ventas en el período; su variación se muestra en puntos porcentuales (pp).
- Período anterior comparable = mismo número de días inmediatamente anteriores.
- La grilla de KPIs es 3 → 2 → 1 columnas (son 6 indicadores; 4 columnas dejarían 2 huérfanos).
- Los datos del asistente (viaje, asientos, pasajero por asiento, pago) viven en un store en memoria (no en `useState`) para que cambiar de sección, o de ticket de pasajero, no descarte lo ingresado.
- No se crearon `Textarea` ni `Tabs`: el diseño no los requiere. Sí se agregó `Checkbox` (usado en "Recordarme" del login).
- La descarga de boletos genera un archivo **HTML autocontenido** (no PDF, sin librerías nuevas): ver "Operación multi-pasajero" más arriba.
- Los toasts se posicionan arriba a la derecha (debajo del Header) y no abajo a la derecha, para no competir nunca con los botones de acción que suelen vivir al final de la pantalla (ej. "Registrar otro pasaje" en la confirmación).
- Las filas de la lista de viajes (`TripPicker`) usan **container queries** (`@container` / `@3xl:`), no breakpoints de viewport: la fila pasa a una sola línea solo cuando su propio contenedor (no la ventana) tiene sitio real, evitando texto superpuesto cuando el Sidebar o el panel de resumen achican el espacio disponible en pantallas intermedias.
- La fila de tickets de pasajeros (hasta 6) usa scroll horizontal contenido (`overflow-x-auto` con `min-w-0` en toda la cadena de contenedores) en vez de envolver o achicar las tarjetas, para que siempre se lean completas.

## Tema y modo oscuro

Ver [THEMING.md](./THEMING.md).
