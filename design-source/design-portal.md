# Guía de Diseño — Portal privado · Portal de Clientes INDUCOM

> **Fuente de verdad de los valores:** `design-tokens.css`. Este documento describe *cómo* el portal usa esos tokens; no redefine colores, tamaños ni espaciados.
>
> **Superficie:** las rutas `/portal/*`, privadas, detrás de login. **No** aplicar `data-surface="landing"` aquí: en el portal la acción primaria es acero, no rojo.

---

## 1. Qué es esta superficie

Todo el portal autenticado: dashboard, módulo de pagos PayPal (saldo cargado manual/CSV), solicitudes del cliente y los módulos futuros marcados como "próximamente". Es una **herramienta de trabajo**, no una vitrina.

## 2. Principio rector

**El portal opera, no vende.** El usuario entra a consultar su saldo, ver el estado de su crédito y trabajar con sus datos, posiblemente todos los días. Por eso el criterio es la **claridad sostenida**, no el impacto. Tres reglas de estilo que gobiernan todo lo demás:

1. **Acero dominante, rojo contenido.** El acción primaria, la navegación y los encabezados usan `--ink`. El rojo (`--accent`) es un realce puntual, no el color de fondo del producto.
2. **El rojo de marca NO es el rojo de error.** Uno de los estados reales es `rechazado`, que debe leerse como rojo. Si el botón primario también fuera rojo, se confundiría "acción de marca" con "algo salió mal". Los estados de error viven siempre como **badges de fondo tenue** (`--state-danger-bg` + `--state-danger-text`), nunca como bloques rojos sólidos. Así jamás compiten con un CTA.
3. **La UI no es la seguridad.** El aislamiento entre empresas lo hace la base de datos (RLS), no la pantalla. Ocultar un botón no protege nada. Ver la sección 10.

## 3. Color

### Roles

| Uso | Token |
|---|---|
| Botón primario, nav activa, encabezados | `--action-primary` (acero) / `--action-primary-hover` |
| Realces de marca, ícono de logo, detalles | `--accent` (rojo), con moderación |
| Enlaces en texto | `--link` / `--link-hover` |
| Fondo de página | `--bg-page` |
| Superficie de tarjetas y tablas | `--bg-surface` (blanco) |
| Superficie alterna (filas zebra, headers de tabla) | `--bg-surface-alt` |
| Texto principal / secundario / tenue | `--text-primary` / `--text-secondary` / `--text-muted` |
| Bordes | `--border` / `--border-strong` |

### Sistema de estados (núcleo del portal)

Los estados salen directo del spec de negocio. Cada uno es un **badge tipo pill**: fondo tenue + texto oscuro de la misma familia + (opcional) borde. Nunca sólido saturado.

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

**Módulos futuros:** badge `--state-neutral-*` con **borde punteado** y etiqueta "próximamente".

Regla: un estado = un color en todo el sistema. `rechazado` (solicitud) y `vencido` (código) comparten el rojo tenue porque ambos son "terminó mal / no válido"; eso es intencional y consistente.

## 4. Tipografía

- **Título de página:** `--font-display` (Sora) `--weight-semibold`, `--text-2xl`. Es el único lugar del portal donde Sora aparece de forma habitual; el resto es Inter para no romper la densidad.
- **Cuerpo, formularios, tablas, navegación, botones:** `--font-sans` (Inter). Cuerpo `--text-base` (16px) con `--leading-normal`; labels y texto secundario `--text-sm` (14px).
- **Códigos de invitación, IDs, montos, referencias:** `--font-mono` (JetBrains Mono). Decisión funcional: evita confundir `0/O` y `1/l` cuando el cliente teclea un código, y alinea columnas de números.
- Pesos: el portal vive en `--weight-regular` (400) y `--weight-medium` (500). Reservar `--weight-semibold` (600) para el título de página. Evitar pesos altos en UI densa: se ven pesados.

Sentence case siempre. Sin punto final en labels y encabezados de UI.

### Montos y números

- Usar `--font-mono` o `font-variant-numeric: tabular-nums` para que las columnas de dinero alineen.
- Formatear con `Intl.NumberFormat`. INDUCOM opera en EC/BO/PE/CO (todos con USD o su propia moneda y convenciones distintas de separador). No hardcodear el formato: usar el locale correspondiente (por defecto `es-EC`). Ejemplo de referencia: `$ 12.480,00`.
- Redondear todo número que llegue a pantalla; nunca mostrar artefactos de coma flotante.

## 5. Espaciado y densidad

- El portal es más compacto que la landing, pero no apretado. Padding de tarjeta `--space-4`/`--space-5`; separación entre bloques `--space-6`/`--space-8`.
- Tablas cómodas: alto de fila legible, padding de celda `--space-3`, header en `--bg-surface-alt`.
- Ancho de contenido del área de trabajo con máximo legible (~1200px) y padding lateral `--space-6`.

## 6. Componentes

### Navegación privada
Barra lateral o superior con fondo `--ink-900`/`--ink-800`, texto `--text-on-dark`, ítem activo marcado con `--accent` (barra o punto rojo) o con contraste de fondo. Identidad clara de "estás dentro del portal".

### Botones
- **Primario:** fondo `--action-primary` (acero), texto blanco, `--radius`. Uno por vista.
- **Secundario:** contorno `--border-strong` sobre `--bg-surface`, texto `--text-primary`.
- **Peligro** (eliminar, acciones destructivas): contorno o texto `--state-danger-text`; sólido rojo solo tras confirmación explícita.
- **Ghost:** sin borde, hover `--bg-surface-alt`.
- Todos con `:focus-visible` usando `--focus-ring` (los de peligro, `--focus-ring-danger`).

### Formularios (incluida la solicitud de crédito)
La solicitud recoge **datos sensibles** (identificación, ingresos, documentos). El diseño debe reflejar seriedad y cuidado:
- Inputs con label visible arriba (no solo placeholder), `--radius`, borde `--border`, foco con `--focus-ring`.
- Estados de campo: normal, foco, error (borde `--state-danger-border`, mensaje en `--state-danger-text` debajo), deshabilitado (`--slate-100`).
- **Casilla de consentimiento explícito** antes de enviar (finalidad y retención de datos). No es opcional: es requisito legal (LOPDP en Ecuador y equivalentes en BO/PE/CO). Enlazar a la política de privacidad.
- La **validación que importa ocurre en el servidor.** La validación en el navegador es solo ayuda de UX; el diseño no debe dar a entender que basta.
- Estados de envío: idle, enviando (spinner, botón deshabilitado brevemente), éxito (confirmación clara), error (mensaje reintentable, sin exponer detalles internos).

### Carga de adjuntos
- Zona de carga con límite de **tamaño y tipos permitidos** visibles antes de subir. Rechazar en cliente como cortesía, pero el servidor decide.
- Mostrar archivos cargados con nombre, tamaño y opción de quitar. Los adjuntos van a almacenamiento **privado**; nunca mostrar una URL pública permanente.

### Tablas (pagos / saldo PayPal)
- Header en `--bg-surface-alt`, filas con borde inferior `--border`. Montos alineados a la derecha con tabular-nums.
- El módulo PayPal se carga **manual o por CSV**, no en tiempo real. El diseño debe **decir la verdad**: mostrar de forma visible "Saldo actualizado al [fecha de última carga]". Nunca insinuar tiempo real.

### Tarjetas de métrica / saldo
- Etiqueta `--text-sm` `--text-muted` arriba, número grande `--text-2xl` `--weight-medium` abajo, fondo `--bg-surface-alt` o tarjeta blanca con borde.
- Junto al saldo, la nota de "última actualización" (ver arriba).

### Badges de estado
Pill (`--radius-full`), fondo + texto del par `--state-*`, ícono Tabler opcional a la izquierda. Ver tabla de la sección 3.

### Estados vacíos
Cada lista/tabla necesita un estado vacío claro, no un error:
- **Cliente sin pagos aún:** ícono neutro + "Aún no hay pagos registrados" + una línea que explique que el saldo se actualiza cuando INDUCOM carga la información. Nada de pantalla en blanco ni error rojo.
- Solicitudes vacías, adjuntos vacíos, etc.: mismo patrón, tono informativo.

### Mensajes de error de acceso (códigos)
Para **código vencido o ya usado**: mensaje **genérico** — "Código no válido" — sin revelar en qué falló. No decir "ya usado" vs "vencido": eso facilita fuerza bruta. Mismo tratamiento para correo ya registrado: mensaje neutro y controlado.

### Sesión expirada
Si la sesión caduca mientras el usuario navega, redirigir a login de forma limpia (idealmente conservando a dónde volver), sin cortar abruptamente ni mostrar un error crudo.

### Módulos "próximamente"
Facturas, garantías, cotizaciones, documentos, redención de saldo aparecen listados pero deshabilitados, con badge "próximamente". **Funcionalidad a medias no se muestra como un botón que falla.**

## 7. Iconografía

Tabler outline, tamaño 16–20px inline, un solo estilo (nunca mezclar con filled). Íconos decorativos con `aria-hidden`; íconos-botón con `aria-label`.

## 8. Accesibilidad

- Contraste AA mínimo en texto y componentes. Los pares `--state-*` están calculados para que el texto oscuro lea sobre su fondo tenue.
- El color **nunca** es el único portador de significado: los estados llevan también etiqueta de texto (y opcionalmente ícono). Un usuario con daltonismo debe distinguir `aprobado` de `rechazado` por la palabra, no solo por el color.
- Foco siempre visible (`--focus-ring`). Nunca `outline: none` sin reemplazo.
- Labels asociados a cada input; errores anunciables por lector de pantalla.
- Áreas táctiles cómodas (~44px) en controles interactivos.

## 9. Responsive / densidad

- El portal se usa en desktop principalmente, pero debe ser utilizable en móvil (un cliente puede consultar su saldo desde el teléfono).
- Tablas anchas: en pantallas chicas, permitir scroll horizontal en un contenedor o colapsar a formato de tarjeta por fila. No encoger el texto por debajo de 12px.
- Navegación lateral colapsa a menú en móvil.

## 10. Reglas de seguridad que tocan la UI

Estas no son solo de backend; condicionan el diseño:

- **No confiar en el frontend para seguridad.** Ocultar un elemento no es protegerlo. El acceso real lo controla RLS en la base de datos.
- **Cada usuario ve solo los datos de su empresa.** El diseño nunca debe asumir que "como no muestro el dato, está protegido". El aislamiento es de base de datos.
- **No exponer URLs públicas** a documentos con datos personales; los adjuntos son de almacenamiento privado.
- **Mensajes de error controlados y genéricos** en el flujo de acceso (códigos), para no filtrar información útil a un atacante.

## 11. Qué NO hacer

- **No** usar el rojo de marca como color de fondo del producto ni como botón primario general (choca con `rechazado`).
- **No** representar estados de error/rechazo como bloques rojos sólidos; usar badges tenues.
- **No** prometer tiempo real en el saldo mientras la carga sea manual/CSV.
- **No** mostrar funcionalidad a medias como un botón funcional; usar "próximamente".
- **No** revelar en la UI por qué un código falló.
- **No** confiar la seguridad a ocultar elementos en pantalla.
- **No** inventar tokens nuevos aquí. Si falta un valor, se agrega en `design-tokens.css`.

---

## Resumen en una frase

El portal se sostiene en **acero dominante con rojo contenido**, un **sistema de estados de fondo tenue** mapeado uno a uno al negocio, y la disciplina de **decir la verdad en la UI** (saldo no es tiempo real, errores genéricos, nada a medias) — todo apoyado en tokens compartidos con la landing pero aplicados con la sobriedad de una herramienta de trabajo.
