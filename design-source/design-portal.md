# Guía de Diseño — Portal privado · Portal de Clientes INDUCOM

> **Fuente de verdad de los valores:** `design-tokens.css`. Este documento describe *cómo* el portal usa esos tokens; no redefine colores, tamaños ni espaciados. Los HEX que aparecen aquí son solo referencia (resueltos a partir de los tokens); si difieren, manda `design-tokens.css`.
>
> **Superficie:** `data-surface="portal"`. La aplican los layouts de `/portal/*` **y** de `/admin/*`: el panel administrativo comparte este mismo sistema, así que todo cambio aquí afecta a ambos. Las pantallas de acceso (`/portal/login`, registro, recuperar/actualizar contraseña y `/admin/login`) **no** son esta superficie: viven en el grupo `(auth)` con `data-surface="landing"` (ver sección 6, "Pantallas de acceso").

---

## 1. Qué es esta superficie

Todo el portal autenticado: dashboard, módulo PayPal (saldo cargado manual/CSV + cashback), garantía extendida y los módulos futuros marcados como "próximamente" (facturas y pagos, cotizaciones). Es una **herramienta de trabajo**, no una vitrina.

## 2. Principio rector

**El portal opera, no vende.** El usuario entra a consultar su saldo, su cashback y el estado de su garantía, posiblemente todos los días. Por eso el criterio es la **claridad sostenida**, no el impacto. Tres reglas de estilo que gobiernan todo lo demás:

1. **Navy dominante, naranja contenido.** La acción primaria, la navegación y los textos principales usan navy (`--action-primary` `#00005B`, `--text-primary` `#000027`). El naranja (`--accent` `#EE6B03`) es un realce puntual —ítem activo de la nav, íconos de logro, anillo de foco—, no el color de los botones ni del fondo del producto.
2. **El rojo no es marca; es solo error.** El rojo se reserva para `rechazado`, `vencido` y errores, y siempre como **badge de fondo tenue** (`--state-danger-bg` `#FDECEC` + `--state-danger-text` `#8A1F1F`), nunca como bloque sólido. Del mismo modo, el naranja de marca **no** comunica "atención": el estado de advertencia usa su propio ámbar tenue (`--state-warning-*`). Así un realce de marca nunca se confunde con un estado.
3. **La UI no es la seguridad.** El aislamiento entre clientes lo hace la base de datos (RLS), no la pantalla. Ocultar un botón no protege nada. Ver la sección 10.

## 3. Color

### Paleta resuelta en la superficie portal

| Rol | Token | HEX |
|---|---|---|
| Fondo de página | `--bg-page` (override de la superficie → `--slate-50`) | `#F8FAFC` |
| Superficie de tarjetas y tablas | `--bg-surface` | `#FFFFFF` |
| Superficie alterna (bloques internos, headers de tabla, hover) | `--bg-surface-alt` | `#F5F7FA` |
| Fondo suave (estados vacíos) | `--bg-page-soft` | `#F8FAFC` |
| Pista de barras de progreso | `--bg-medium` | `#F2F4F6` |
| Botón primario / hover / pressed | `--action-primary` / `-hover` / `-pressed` | `#00005B` / `#00004A` / `#000039` |
| Acento de marca | `--accent` / `--accent-hover` | `#EE6B03` / `#C95502` |
| Acento suave (fondo de ícono destacado) | `--accent-soft` | `#FFF4E8` |
| Sidebar / navegación privada | `--brand-navy-900` | `#000027` |
| Texto principal | `--text-primary` | `#000027` |
| Texto secundario | `--text-secondary` | `#475569` |
| Texto tenue | `--text-muted` | `#94A3B8` |
| Texto sobre fondo oscuro | `--text-on-dark` | `#FFFFFF` |
| Enlaces / hover | `--link` / `--link-hover` | `#00005B` / `#EE6B03` |
| Bordes / borde fuerte | `--border` / `--border-strong` | `#F2F4F6` / `#CBD5E1` |

Regla: los componentes consumen **roles** (`--action-primary`, `--text-primary`, `--bg-surface`…), no `--brand-*` directo, salvo excepciones puntuales ya existentes (sidebar en `brand-navy-900`, `IconTile`).

### Sistema de estados (núcleo del portal)

Cada estado es un **badge tipo pill**: fondo tenue + texto oscuro de la misma familia + borde. Nunca sólido saturado.

| Tono | Fondo | Texto | Borde |
|---|---|---|---|
| `info` | `#EAF2FF` | `#0B3B75` | `#B8D4FF` |
| `warning` | `#FFF7E0` | `#7A4A00` | `#F7D37A` |
| `success` | `#EAF7E8` | `#1F5F2A` | `#BFE4BD` |
| `danger` | `#FDECEC` | `#8A1F1F` | `#F5B8B8` |
| `neutral` | `#F3F4F6` | `#4B5563` | `#D1D5DB` |

**Solicitud de crédito** — `recibido → en revisión → aprobado | rechazado | pendiente de información`

| Estado | Tokens | Ícono sugerido (Tabler) |
|---|---|---|
| `recibido` | `--state-info-*` | `inbox` |
| `en revisión` | `--state-warning-*` | `loader` |
| `aprobado` | `--state-success-*` | `check` |
| `rechazado` | `--state-danger-*` | `x` |
| `pendiente de información` | `--state-neutral-*` | `alert-circle` |

**Código de invitación** — `activo → usado` o `activo → vencido`

| Estado | Tokens |
|---|---|
| `activo` | `--state-success-*` |
| `usado` | `--state-neutral-*` |
| `vencido` | `--state-danger-*` |

**Beneficios (cashback / garantía)**

| Estado | Tokens |
|---|---|
| Cashback disponible para canje / beneficio desbloqueado | `--state-success-*` |
| Cashback acumulado (aún bajo el mínimo) | `--state-neutral-*` |

**Módulos futuros:** badge `--state-neutral-*` (o, dentro de la nav oscura, su versión translúcida con **borde punteado**) y etiqueta "próximamente".

Regla: un estado = un color en todo el sistema. `rechazado` (solicitud) y `vencido` (código) comparten el rojo tenue porque ambos son "terminó mal / no válido"; eso es intencional y consistente. El verde queda reservado para estados de éxito/desbloqueo: por eso las barras de progreso se rellenan en navy, no en verde.

## 4. Tipografía

- **Encabezados (`h1`–`h6`):** `--font-display` (Sora) `--weight-semibold` (600), `--leading-tight`, color `--text-primary`. Viene de los estilos base de `globals.css`; no hace falta repetirlo en cada componente.
- **Título de página (`h1`):** `--text-3xl` (30px), seguido de un subtítulo en `--text-secondary` (`#475569`) con `mt-2`. Ej.: "Bienvenido, {cliente}" / "Este es el estado general de tu cuenta."
- **Título de tarjeta o bloque:** Sora, `--text-lg`/`--text-xl`; en estados como "próximamente", `--text-2xl`.
- **Cuerpo, formularios, tablas, navegación, botones:** `--font-sans` (Inter). Cuerpo `--text-base` (16px) con `--leading-normal`; labels y texto secundario `--text-sm` (14px), peso `--weight-medium` en labels.
- **Etiquetas de métrica ("eyebrow"):** `--font-mono` (JetBrains Mono), `--text-xs` (12px), `--weight-semibold`, MAYÚSCULAS, tracking `0.06em`, color `--text-secondary`. Ej.: "CASHBACK ACUMULADO".
- **Montos, códigos de invitación, IDs, referencias, porcentajes:** `--font-mono` con `tabular-nums`, peso `--weight-medium`. Decisión funcional: evita confundir `0/O` y `1/l` cuando el cliente teclea un código, y alinea columnas de números.
- Pesos: la UI densa vive en 400 y 500; 600 queda para encabezados, eyebrows y badges. No usar 700 en el portal.

Sentence case en títulos y labels; MAYÚSCULAS solo en eyebrows, badges y "próximamente". Sin punto final en labels y encabezados de UI.

### Montos y números

- `--font-mono` + `tabular-nums` para que las columnas de dinero alineen.
- Formatear con `Intl.NumberFormat` (helpers en `src/lib/portal/format.ts`). INDUCOM opera en EC/BO/PE/CO; el locale de referencia es `es-EC` con moneda USD. Ejemplo: `$ 12.480,00`. Fechas con `dateStyle: "medium"`.
- Redondear todo número que llegue a pantalla; nunca mostrar artefactos de coma flotante.

## 5. Espaciado y densidad

- **Shell:** sidebar fijo de 256px (`w-64`) + topbar de 88px; solo el `<main>` hace scroll. Contenido con máximo de ~1200px (`--container-max`) y padding lateral `--space-6` (24px); padding vertical `--space-8`/`--space-10`.
- **Entre bloques de página:** `--space-8` (32px). **Entre tarjetas de una grilla:** `--space-5` (20px).
- **Tarjeta:** padding `--card-padding` (`--space-6`, 24px); separación interna `--space-4` (16px). Bloques internos destacados (ej. "Te faltan $X") en `--bg-surface-alt` con padding `--space-4`.
- **Tablas:** alto de fila legible, padding de celda `--space-3`, header en `--bg-surface-alt`.

## 6. Componentes

### Navegación privada
- **Sidebar** (desktop): fondo `--brand-navy-900` (`#000027`), logo INDUCOM en blanco arriba.
- **Ítems:** Inter `--text-sm` medium, ícono Tabler 18px. Inactivo: blanco al 70% con hover blanco al 5% de fondo. **Activo:** fondo blanco al 10%, texto blanco y **barra vertical naranja** (`--accent` `#EE6B03`, 4×20px) a la izquierda.
- **Módulo futuro:** ítem no clicable (`aria-disabled`), blanco al 40%, con pill "PRÓXIMAMENTE" de borde punteado translúcido.
- **Topbar:** fondo `--bg-surface` blanco con borde inferior `--border`; muestra el nombre del cliente (`--text-secondary`) y el botón de cerrar sesión.
- **Móvil:** el sidebar se reemplaza por un drawer con el mismo fondo navy, que se abre desde el botón de menú del topbar y se cierra con Escape.

### Botones
- **Primario (`primary`):** fondo `--action-primary` (`#00005B`), texto blanco, hover `#00004A`, pressed `#000039`, `--radius` (8px). Uno por vista.
- **Contorno (`outline`):** borde `--border-strong` sobre `--bg-surface`, texto `--text-primary`; en hover, borde y texto pasan a navy.
- **Ghost:** sin borde ni fondo; en hover el texto pasa a `--link-hover` (naranja).
- **Sobre fondo oscuro (`outlineOnDark`):** borde `--border-on-dark`, texto blanco.
- **Peligro** (eliminar, acciones destructivas): contorno o texto `--state-danger-text`; sólido rojo solo tras confirmación explícita. Aún no existe como variante: si se necesita, se agrega a `Button.tsx`.
- Alturas: `sm` 36px, `md` 44px, `lg` 52px (`--button-height-*`). Deshabilitado al 60% de opacidad.
- Todos con `:focus-visible` usando `--focus-ring` (naranja al 35%); los de peligro, `--focus-ring-danger`.

### Tarjetas
- `Card`: `--bg-surface`, borde `--border`, `--radius-lg` (12px), padding 24px. Sombra `--shadow-md` solo en la tarjeta protagonista de la vista (ej. cashback).
- **Tarjeta de métrica / saldo:** eyebrow mono en mayúsculas arriba (ver sección 4), valor en mono `tabular-nums` (`--text-xl` en métricas secundarias, `--text-4xl` en el saldo protagonista), pista opcional en `--text-sm` `--text-secondary`.
- Junto a cualquier saldo, la nota de "última actualización" (ver "Saldo y pagos").

### Íconos en tile (`IconTile`)
Contenedor de 48px, cuadrado (`--radius`) o circular:
- `neutral`: fondo `--bg-surface-alt`, ícono navy `#00005B`. Es el caso por defecto.
- `accent`: fondo `--accent-soft` (`#FFF4E8`), ícono `#C95502`. Solo para destacar un logro (beneficio desbloqueado, modal de garantía obtenida).
- `onDark`: fondo `--brand-navy-800` (`#000039`), ícono blanco; para paneles navy.

### Barras de progreso
Pista `--bg-medium` (`#F2F4F6`), relleno `--action-primary` (navy), altura 8px, pill. Porcentaje visible aparte en mono. No usar verde (reservado para estados de éxito).

### Saldo y pagos (PayPal / cashback)
- Tablas: header en `--bg-surface-alt`, filas con borde inferior `--border`, montos alineados a la derecha con `tabular-nums`.
- El saldo se carga **manual o por CSV**, no en tiempo real. El diseño debe **decir la verdad**: mostrar siempre "Saldo actualizado al [fecha de última carga]" o, si no hay datos, "Aún no se ha registrado ningún pago". Nunca insinuar tiempo real.
- Cashback y garantía son beneficios independientes: la tarjeta de cashback no enlaza a garantía.

### Formularios
Los formularios (incluida la solicitud de crédito) recogen **datos sensibles**. El diseño debe reflejar seriedad:
- Label visible arriba (Inter `--text-sm` medium), no solo placeholder; input de 44px (`--input-height`), `--radius`, borde `--border`, foco con `--focus-ring`.
- Estados de campo: normal, foco, error (borde `--state-danger-border`, mensaje en `--state-danger-text` debajo), deshabilitado (`--slate-100` `#F5F7FA`).
- **Casilla de consentimiento explícito** antes de enviar (finalidad y retención de datos). Requisito legal (LOPDP en Ecuador y equivalentes en BO/PE/CO). Enlazar a la política de privacidad.
- La **validación que importa ocurre en el servidor**; la del navegador es solo ayuda de UX.
- Estados de envío: idle, enviando (botón deshabilitado con "Procesando…"), éxito (confirmación clara), error (mensaje reintentable, sin exponer detalles internos).

### Carga de adjuntos
- Límite de **tamaño y tipos permitidos** visibles antes de subir. Rechazar en cliente como cortesía; el servidor decide.
- Mostrar archivos cargados con nombre, tamaño y opción de quitar. Los adjuntos van a almacenamiento **privado**; nunca mostrar una URL pública permanente.

### Badges de estado
Pill (`--radius-full`), borde + fondo + texto del par `--state-*`, `--text-xs` semibold en MAYÚSCULAS con tracking `0.04em`, ícono Tabler opcional a la izquierda. Ver tablas de la sección 3.

### Estados vacíos
Contenedor con borde punteado `--border-strong`, fondo `--bg-page-soft`, `--radius-lg`; ícono neutro + título (`--text-base` semibold) + una línea explicativa (`--text-sm` `--text-secondary`). Nunca pantalla en blanco ni error rojo.
- **Cliente sin pagos aún:** "Aún no hay pagos registrados" + explicar que el saldo se actualiza cuando INDUCOM carga la información.

### Mensajes de error de acceso (códigos)
Para **código vencido o ya usado**: mensaje **genérico** — "Código no válido" — sin revelar en qué falló (facilita fuerza bruta). Mismo tratamiento para correo ya registrado.

### Sesión expirada
Si la sesión caduca, redirigir a login de forma limpia (idealmente conservando a dónde volver), sin mostrar un error crudo.

### Módulos "próximamente"
Facturas y pagos y cotizaciones aparecen en la nav pero deshabilitados, con badge "próximamente"; la vista `ComingSoon` los presenta con badge neutro, título Sora y descripción. **Funcionalidad a medias no se muestra como un botón que falla.**

### Pantallas de acceso (fuera de esta superficie)
Login, registro y recuperación usan `AuthSplitLayout` bajo `data-surface="landing"` (botón primario naranja `#EE6B03`). El panel izquierdo es un degradado navy (`--brand-navy-700` → `--brand-navy-900`) en el portal y **negro** (`#0A0A0A` → `#000000`, `tone="black"`) en `/admin/login`, para distinguir el acceso interno del de clientes.

## 7. Iconografía

Tabler outline, `stroke` 1.75, tamaño 18px en navegación, 16–20px inline y 22px dentro de `IconTile`. Un solo estilo (nunca mezclar con filled). Íconos decorativos con `aria-hidden`; íconos-botón con `aria-label`.

## 8. Accesibilidad

- Contraste AA mínimo en texto y componentes. Los pares `--state-*` están calculados para que el texto oscuro lea sobre su fondo tenue.
- El color **nunca** es el único portador de significado: los estados llevan también etiqueta de texto (y opcionalmente ícono).
- Foco siempre visible (`--focus-ring`, naranja, visible tanto sobre blanco como sobre navy). Nunca `outline: none` sin reemplazo.
- Labels asociados a cada input; errores anunciables por lector de pantalla. Barras de progreso con `role="progressbar"` y `aria-valuenow`.
- Áreas táctiles cómodas (~44px) en controles interactivos.

## 9. Responsive / densidad

- Uso principal en desktop, pero utilizable en móvil (un cliente puede consultar su saldo desde el teléfono).
- Grillas de tarjetas: 1 columna en móvil, 2 desde `lg`.
- Tablas anchas: scroll horizontal en un contenedor o formato de tarjeta por fila. No encoger el texto por debajo de 12px.
- La navegación lateral colapsa a drawer en móvil (ver sección 6).

## 10. Reglas de seguridad que tocan la UI

- **No confiar en el frontend para seguridad.** Ocultar un elemento no es protegerlo. El acceso real lo controla RLS en la base de datos.
- **Cada usuario ve solo los datos de su cliente/empresa.** El aislamiento es de base de datos, no de pantalla.
- **No exponer URLs públicas** a documentos con datos personales; los adjuntos son de almacenamiento privado.
- **Mensajes de error controlados y genéricos** en el flujo de acceso (códigos).

## 11. Qué NO hacer

- **No** usar el naranja como fondo del producto ni como botón primario del portal; es acento (su uso como CTA es propio de la landing).
- **No** usar rojo como color de marca ni representar errores como bloques rojos sólidos; usar badges tenues.
- **No** usar verde fuera de estados de éxito (ni en barras de progreso).
- **No** prometer tiempo real en el saldo mientras la carga sea manual/CSV.
- **No** mostrar funcionalidad a medias como un botón funcional; usar "próximamente".
- **No** revelar en la UI por qué un código falló.
- **No** confiar la seguridad a ocultar elementos en pantalla.
- **No** inventar tokens nuevos aquí. Si falta un valor, se agrega en `design-tokens.css`.

---

## Resumen en una frase

El portal se sostiene en **navy dominante con naranja contenido** sobre fondos claros, un **sistema de estados de fondo tenue** mapeado uno a uno al negocio (con el rojo reservado solo para errores), y la disciplina de **decir la verdad en la UI** (saldo no es tiempo real, errores genéricos, nada a medias) — todo apoyado en tokens compartidos con la landing, pero aplicados con la sobriedad de una herramienta de trabajo que también usa el panel administrativo.
