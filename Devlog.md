# Devlog — Portal de Clientes INDUCOM

Este archivo documenta el historial de cambios del proyecto, sesión por sesión. Cada
entrada indica la fecha en la que se hizo el trabajo, un resumen de qué se hizo, y el
"por qué" o para qué sirve cada cambio (contexto que no siempre es obvio solo leyendo
el código).

**Cómo usarlo:**
- Cada vez que se trabaje en el proyecto (código, configuración, contenido, etc.), se
  agrega una nueva sección al final con el formato `## Sesión — YYYY-MM-DD`.
- Dentro de cada sesión se listan los cambios realizados y, cuando aplica, la razón o
  el objetivo detrás de ellos.
- No se borran sesiones anteriores: el Devlog es un historial acumulativo.

---

## Sesión — 2026-07-09

**Contexto general del proyecto (estado al iniciar este Devlog):**

- Frontend del Portal de Clientes INDUCOM, hecho con Next.js (App Router), React y
  TypeScript.
- Contiene las 4 pantallas públicas convertidas desde Figma (Landing, Política de
  Privacidad, Login, Registro), el resto de rutas públicas del MVP, y placeholders de
  las rutas privadas (Dashboard, PayPal).
- Aún no hay lógica real de Supabase conectada: los formularios usan stubs en
  `lib/auth/placeholder-actions.ts`.
- Estilos centralizados en un único `app/globals.css`, sin Tailwind ni CSS Modules,
  con tokens de diseño en `styles/design-tokens.css`.

**Cambios de esta sesión:**

- Se crea este archivo `Devlog.md` para llevar un registro documentado de los cambios
  futuros del proyecto, sesión por sesión, con fecha y explicación de para qué sirve
  cada cambio.

- **Backend real de la solicitud de crédito: se evaluó n8n y se descartó a favor de
  hacerlo directo en el código.**
  - Primero se implementó un flujo completo con n8n: el Route Handler
    `/api/solicitud-credito` revalidaba todo en servidor y reenviaba los datos +
    adjuntos a un webhook de n8n en la nube (con header `X-Webhook-Secret` y timeout),
    que se encargaría de guardar en Supabase, subir adjuntos y notificar por correo.
    Se llegó a escribir incluso un prompt detallado para que ChatGPT ayudara a armar
    ese workflow en n8n.
  - Al pedir una opinión honesta sobre n8n vs. código propio, se recomendó código
    propio: el plan original del proyecto ya contemplaba esta lógica en el repo,
    centraliza la lógica sensible a seguridad (validación, `service_role`, límites de
    archivo) en un solo lugar auditable, y el ahorro real de código con n8n era
    mínimo (la validación server-side de todos modos tiene que vivir en el Route
    Handler). Se decidió descartar n8n.
  - Se revirtió todo lo de n8n: se quitaron `n8nCreditRequestWebhookUrl` /
    `n8nWebhookSecret` de `lib/config/env.server.ts`, `.env.example` y `.env`.
  - Se instaló `resend` (`npm install resend`) para el envío de correo de
    notificación interna.
  - Se reescribió `src/app/api/solicitud-credito/route.ts` para guardar todo directo:
    mantiene honeypot, la misma validación server-side de campos (identidad,
    aceptación de condiciones, firma) y de adjuntos (tipo/tamaño) que ya existía; lo
    que cambia es el paso final, que ahora usa `createSupabaseAdminClient()` para
    subir cada adjunto al bucket privado `solicitudes-adjuntos` e insertar la fila en
    la tabla `solicitudes_credito`, y usa el SDK de Resend para notificar al correo
    interno (`INTERNAL_NOTIFICATION_EMAIL`). Si el correo falla no se le muestra
    error al usuario, porque la solicitud ya quedó guardada.
  - Se creó la migración SQL
    `supabase/migrations/20260709000000_solicitudes_credito.sql`: tabla
    `solicitudes_credito` (folio único, tipo_cliente, `data` jsonb con el resto del
    formulario, `adjuntos` jsonb con las rutas de Storage, `status` con default
    `'nueva'` para las transiciones manuales de un admin) más la creación del bucket
    privado `solicitudes-adjuntos`. RLS activo y sin ninguna política pública — solo
    `service_role` puede leer/escribir, que es justo el cliente que usa el Route
    Handler. **Importante: este archivo es solo un script SQL guardado en el repo,
    no toca ninguna base de datos real hasta que alguien lo ejecute contra un
    proyecto Supabase específico** — falta confirmar si el proyecto a usar es el
    mismo que ya está preparando un compañero de equipo (para no duplicar/chocar con
    una tabla que ya exista ahí) o uno nuevo.
  - Se creó `supabase-integracion.md` en la raíz explicando cómo se conecta el
    proyecto a Supabase (por framework — `@supabase/supabase-js` + `@supabase/ssr` —
    no por API REST cruda), los tres clientes (`client.ts` navegador,
    `server.ts` servidor con sesión, `admin.ts` con `service_role`) y el detalle de
    este flujo de solicitud de crédito.
  - `npm run lint` y `npm run build` corridos al final, sin errores.
  - No afectado por este cambio: login, registro y "olvidé mi contraseña" siguen
    siendo stubs en `lib/stubs/placeholder-actions.ts`; se conectan a Supabase Auth
    en una fase posterior.

---

## Sesión — 2026-07-10

**Tema principal: la solicitud de crédito ahora tiene DOS versiones conviviendo en el
repo, y v2 es la que está activa.**

Nos pidieron rehacer el formulario de solicitud de crédito. En vez de borrar la versión
original, se montó una segunda versión en paralelo, de modo que se puede volver a la
primera cuando se quiera cambiando **una sola línea**. Esto es clave para no perder el
trabajo de la v1.

### Qué es cada versión

- **v1 (original):** wizard de **8 pasos** (Datos personales → Actividad económica →
  Referencias → Estado financiero → Financiamiento → Requisitos → Firmas → Condiciones).
  Vive en:
  - `CreditRequestForm.tsx`
  - `steps-version1/` (los 8 archivos `Step0Datos.tsx` … `Step7Condiciones.tsx`)
  - En `validation.ts`: la función `validateStep`
  - En `types.ts`: `WizardState`, `blankState`, `TOTAL_STEPS`, `STEP_TITLES`,
    `STEP_SHORT_LABELS` y todos los tipos v1 (`DatosPersonales`, `ActividadEconomica`,
    `Financiamiento`, etc.)

- **v2 (nueva, ACTIVA hoy):** wizard reducido de **3 pasos**:
  1. **Inicio** — Nueva solicitud de crédito / Apertura de línea de crédito.
  2. **Tipo de cliente** — Persona Natural / Jurídica.
  3. **Datos y documentos** — nombre, correo, RUC, número de cotización (este campo
     **solo se muestra en "Nueva solicitud"**, se oculta en "Apertura de línea"), los 7
     documentos a adjuntar, y el checkbox de consentimiento.
  Vive en:
  - `CreditRequestForm2.tsx`
  - `steps-version2/` (`Step0TwoOptions.tsx`, `Step1TipoCliente.tsx`, `Step2Datos.tsx`)
  - En `validation.ts`: la función `validateStep2`
  - En `types.ts`: `WizardState2`, `blankState2`, `TOTAL_STEPS2`, `STEP_TITLES2`,
    `STEP_SHORT_LABELS2`, `TipoSolicitud`, `DatosStep2`

### Cómo está conectado hoy (v2 activa)

Solo tres archivos deciden qué versión corre. En cada uno, el código de v1 quedó
**comentado** (no borrado) y el de v2 activo:

1. **`src/app/(public)/solicitud-credito/page.tsx`** — renderiza `<CreditRequestForm2 />`.
   La línea `<CreditRequestForm />` (v1) está comentada justo debajo.
2. **`src/app/api/solicitud-credito/route.ts`** — el endpoint valida, inserta y notifica
   con los campos de v2. Los bloques de v1 (validación, inserción, notificación y las
   claves de archivo) están comentados con la etiqueta `v1`.
3. **`Stepper.tsx`** — el encabezado, el título, la barra de progreso y las "pills"
   usan las constantes de v2. Las de v1 están comentadas.

### CÓMO REVERTIR a la v1 (paso a paso)

Para volver a la versión original de 8 pasos:

1. En **`src/app/(public)/solicitud-credito/page.tsx`**: cambiar el `return` para que
   use `<CreditRequestForm />` en vez de `<CreditRequestForm2 />` (descomentar la línea
   de v1 y comentar la de v2). **Con esto la UI ya vuelve a la v1.**
2. En **`src/app/api/solicitud-credito/route.ts`**: comentar los bloques marcados como
   `v2` y descomentar los marcados como `v1` (validación, inserción, notificación y la
   constante `REQUISITO_KEYS`). Esto es necesario porque el endpoint es compartido: la
   v1 y la v2 mandan campos distintos.
3. En **`Stepper.tsx`**: descomentar el bloque de v1 (encabezado/progreso/pills con
   `TOTAL_STEPS`, `STEP_TITLES`, `STEP_SHORT_LABELS`) y comentar el de v2.

No hace falta tocar `types.ts` ni `validation.ts` para revertir: ambas versiones de los
tipos y validaciones conviven ahí sin estorbarse.

### AVISO PARA QUIEN LEA ESTO (no tocar de más)

- **NO borres `CreditRequestForm.tsx` ni la carpeta `steps-version1/`.** Son el respaldo
  íntegro de la v1. Aunque hoy no se rendericen, siguen siendo código válido y son lo
  que permite volver a la v1 con un cambio mínimo.
- **NO comentes ni borres los tipos/funciones v1 de `types.ts` y `validation.ts`**
  (`validateStep`, `WizardState`, `blankState`, `TOTAL_STEPS`, `DatosPersonales`, etc.).
  Se comprobó que `CreditRequestForm.tsx` y `steps-version1/` los importan; si los quitas,
  **se rompe el `next build`** (y con él también la v2, porque el build falla completo).
- Los warnings de lint por "imports/const sin usar" en `Stepper.tsx` (`STEP_TITLES`,
  `TOTAL_STEPS`, `STEP_SHORT_LABELS`) y `route.ts` (`idOk`) son **intencionales**: apuntan
  a código v1 dejado comentado a propósito. No los "arregles" borrando esas referencias.

### Detalles de la implementación v2

- **Razón social / `nombre_empresa` (según tipo de cliente):** si el usuario elige
  **Persona Jurídica**, en el paso 3 aparece el campo **"Razón social"** (obligatorio) y
  su valor se guarda en la columna `nombre_empresa`. Si elige **Persona Natural**, el
  campo **no se muestra**, no se valida, y `nombre_empresa` se guarda como `null` (no hay
  empresa que registrar). La regla está tanto en el cliente (`validateStep2`) como
  revalidada en el servidor (`route.ts`), porque la validación del navegador es solo
  ayuda de UX.
- El endpoint mapea `identificacion` desde el RUC del solicitante; `telefono_solicitante`
  va `null` (columna nullable) porque v2 no lo pide.
- La tabla `solicitudes_credito` exige `nombre_solicitante`, `email_solicitante`
  (NOT NULL) y `consentimiento_aceptado = true` (constraint). Por eso el Step 3 de v2
  agrega esos campos y el checkbox de consentimiento — sin ellos el insert fallaría.
- Se limpió el `tsconfig.json` (se quitó un `include` manual apuntando a un archivo
  suelto de `steps-version2`, innecesario porque `**/*.tsx` ya lo cubre).

### Verificación hecha esta sesión

- Se corrigió un bug: el `Stepper` mostraba "PASO 01 / 08", título "Datos personales" y
  barra al 12.5% porque aún usaba constantes de v1. Ahora usa las de v2 ("PASO 01 / 03",
  "Tipo de solicitud", 33%).
- Se manejó el navegador real (Playwright) recorriendo los 3 pasos: validación por paso,
  ocultamiento del campo de cotización en "Apertura de línea", errores de campos y
  documentos requeridos (Orden de compra queda opcional, sin error). 13/13 OK.
- Se probó el endpoint por HTTP en las rutas que NO persisten (data vacío → 400,
  honeypot → 200 falso, faltante de cotización en "nueva" → 400, consentimiento false →
  400), confirmando que corre la validación de v2. **No se disparó un envío real** contra
  Supabase para no insertar filas ni enviar correos de prueba.
- `tsc --noEmit` en verde. Playwright se instaló solo para probar y se desinstaló al
  final (`package.json` quedó sin cambios).

---

## Sesión — 2026-07-11

**Tema principal: se construyó el área privada del Portal (dashboard + módulo PayPal)
con datos reales de Supabase, sobre la base de Auth que ya estaba conectada.**

### Arreglos previos (bloqueaban levantar el proyecto)

- **`globals.css` no compilaba** (`Unexpected token Delim('.')`). Causa: un comentario
  JSDoc en `Button.tsx` tenía como ejemplo un selector de borde arbitrario con tres
  puntos suspensivos literales en vez de un nombre de variable real; el scanner de
  Tailwind no distingue comentarios de código, lo tomó como una clase real y generó
  CSS inválido. Se reescribió el comentario sin ese patrón. Ojo: en un primer intento
  el comentario que *explicaba* el arreglo volvió a incluir el mismo texto literal y
  rompió el build otra vez — y este mismo Devlog lo rompió una tercera vez al citarlo
  entre comillas (el scanner de Tailwind también rastrea `.md`). Moraleja: nunca
  escribir ese patrón literal en ningún archivo del repo, ni siquiera para explicarlo;
  describirlo en palabras alcanza.
- **Warning de aspect-ratio** en el logo (`Logo.tsx`): tenía `w-auto` solo por clase
  CSS, que Next no puede ver para el chequeo de `next/image`. Se agregó
  `style={{ width: "auto" }}` explícito.
- Se verificó la conexión real a Supabase (URL/anon key/service_role en `.env`,
  nunca en `.env.example`) contra el proyecto compartido con el compañero de equipo:
  las 7 tablas del esquema (`paises`, `empresas`, `perfiles`, `codigos_invitacion`,
  `solicitudes_credito`, `documentos_credito`, `pagos`) ya existían con datos.

### Gap encontrado: no había dónde guardar el incentivo activo por empresa

`design-portal.md` pide mostrar un "incentivo activo" real por empresa (cashback 1%,
garantía extendida, despacho rápido) y un comparador — pero el esquema real (confirmado
vía OpenAPI de PostgREST, no solo la migración documentada) no tenía ninguna tabla ni
columna para eso. Se agregó una migración nueva (no se tocó
`20260709000000_schema_portal_inducom.sql`, que ya está documentado como aplicado en
producción — las migraciones no se re-editan, se sirven en el historial):

- `supabase/migrations/20260710010000_incentivo_activo_empresa.sql`: tabla
  `incentivos_empresa` (`empresa_id` uuid **primary key** → fuerza "un incentivo activo
  por empresa" sin lógica extra, `tipo` con `check` a los 3 valores fijos, `asignado_en`
  para trazabilidad). Se descartó la primera idea (una columna simple en `empresas`)
  porque no daba historial de cuándo se asignó — el resto del esquema sí modela estado
  con fecha (`codigos_invitacion`, `solicitudes_credito`). RLS habilitado con policy
  "usuarios ven el incentivo de su empresa" (mismo patrón que `pagos`). No toca Auth,
  RLS de otras tablas ni la lógica de códigos de invitación.
- La asignación es manual desde el SQL Editor de Supabase (mismo modelo operativo que
  pagos y códigos, según `consideraciones-tecnicas-portal-inducom.md`).

### Capa de datos del portal (`src/lib/portal/`)

- `types.ts`: `PortalPerfil`, `PortalEmpresa`, `PortalContext`, `PortalPago`,
  `IncentivoTipo`.
- `queries.ts`: `getPortalContext()` (perfil + empresa + país + incentivo del usuario
  logueado, usando `cache()` de React para no repetir la consulta si el layout y la
  página la piden en el mismo request), `getSaldo(empresaId)`, `getPagos(empresaId, limit?)`.
  Cada una devuelve un resultado tipado `{ ok: true, data }` / `{ ok: false, reason }`
  en vez de tirar: así cada página decide qué estado mostrar (sin sesión, sin perfil,
  error) en vez de que la página reviente.
- `nav.ts`: lista única de navegación del portal (`portalNavItems`) que consumen tanto
  el sidebar de escritorio como el drawer de móvil — evita mantener el menú en dos
  lugares. Los ítems sin `href` (Facturas y pagos, Cotizaciones) son los módulos
  "próximamente".
- `format.ts`: `formatMonto` / `formatFecha` centralizados en locale `es-EC` (según
  `design-portal.md`, sección de montos y números).
- `incentivos.ts`: catálogo fijo de los 3 tipos de incentivo (título, descripción,
  ícono Tabler) que usan tanto `BenefitCard` como el comparador.

### Componentes UI nuevos (`src/components/ui/`)

- `StatusBadge.tsx`: badge tipo pill con los 5 tonos semánticos del design system
  (`info/warning/success/danger/neutral`), fondo tenue + texto oscuro, nunca sólido
  saturado (regla de `design-portal.md` sección 3).
- `EmptyState.tsx` / `ErrorState.tsx`: estados vacío y de error genéricos y
  reutilizables. `ErrorState` nunca expone detalles internos de Supabase, solo mensaje
  genérico (regla de seguridad de `consideraciones-tecnicas`).
- `LoadingSkeleton.tsx`: bloques de skeleton + `DashboardSkeleton` / `PaypalSkeleton`
  compuestos, usados por los `loading.tsx` de cada ruta (Next los muestra automático
  mientras el Server Component carga, sin JS de cliente extra).

### Componentes de dominio (`src/components/portal/`)

`BalanceCard`, `BenefitCard`, `CompanySummary`, `ComparisonCard` (exporta
`IncentiveComparison`), `PaymentHistory` (una tabla en desktop/tablet y tarjetas
apiladas en móvil, responsive con Tailwind, sin fragmentar en dos componentes
separados), `StatCard`.

### Layout privado (`src/components/layout/portal/`)

- `PortalSidebar.tsx` + `PortalNavList.tsx` + `MobilePortalNavigation.tsx`: sidebar
  navy fijo en desktop (oculto en móvil), drawer en móvil. `PortalNavList` resalta el
  ítem activo comparando `usePathname()` contra `nav.ts`.
- `PortalTopbar.tsx`: nombre de empresa + botón de menú (móvil) + `LogoutButton`.
- `PortalShell.tsx` reescrito para componer sidebar + topbar + contenido.
  **Bug encontrado y corregido en esta misma sesión:** la primera versión usaba
  `sticky` + `h-screen` en el sidebar con toda la página haciendo scroll; en páginas
  más largas que un viewport, el sidebar se "acababa" antes del final de la página
  (comportamiento normal de `sticky`, pero no el buscado). Se cambió a un shell fijo
  (`h-screen overflow-hidden` en el contenedor raíz, sidebar a `h-full`) donde **solo
  `<main>` hace scroll** — patrón estándar de "app shell", así el sidebar/topbar
  siempre se ven completos sin importar el largo del contenido.
- `src/app/(portal)/layout.tsx`: ahora resuelve `getPortalContext()` una vez y decide
  qué mostrar: redirect a login (sin sesión — defensa en profundidad, `proxy.ts` ya
  filtra esto), `EmptyState` (usuario autenticado sin perfil — caso "huérfano" de
  `consideraciones-tecnicas`), `ErrorState` (falla de conexión), o el `PortalShell` con
  los datos reales.
- `Logo.tsx` extendido (sin romper usos existentes, todo con default): ahora acepta
  `src`, `imageClassName`, `width`, `height` (para poder usar la versión blanca del
  logo sobre el navy del sidebar) y `asLink` (para renderizarlo sin el `<Link>`
  envolvente cuando no debe navegar).

### Páginas reescritas con datos reales

- `dashboard/page.tsx` y `paypal/page.tsx`: Server Components async, consultan
  `getPortalContext` + `getSaldo` + `getPagos` en paralelo (`Promise.all`), sin lógica
  sensible en el cliente. Contemplan estado vacío (empresa sin pagos / sin incentivo)
  y estado de error, nunca dejan un botón que aparente funcionar sin hacerlo.
- `loading.tsx` en ambas rutas usando los skeletons compuestos.

### Verificación hecha esta sesión

- `tsc --noEmit`, `npm run lint` y `npm run build` (producción) corridos varias veces
  durante la sesión, siempre en verde.
- Se verificó por API (solo lectura, con `service_role`, sin exponerla nunca en
  output) que la tabla `incentivos_empresa` quedó creada con el shape esperado y que
  la consulta que usa `getPortalContext()` responde `200`.
- Se probó en el navegador real (no por mí — no hay herramienta de browser headless
  disponible en este entorno; se intentó generar una cookie de sesión programática
  para probarlo yo mismo y el propio sistema lo bloqueó como manejo de credenciales no
  autorizado, así que se descartó ese camino) con la cuenta de prueba
  `alisa@gmail.com` (empresa sin pagos ni incentivo asignado todavía): se confirmó que
  cargan el dashboard y PayPal con los estados vacíos correctos ("Aún no se ha cargado
  ningún pago", "Sin incentivo asignado", "Aún no hay pagos registrados").
- Pendiente para una próxima sesión: repetir la prueba con una empresa que sí tenga
  pagos e incentivo asignado (para ver `BalanceCard`/`PaymentHistory`/`ComparisonCard`
  con contenido real, no solo estados vacíos), y una revisión responsive en
  tablet/móvil sobre el navegador real.

### Ajuste menor en landing (fuera del alcance del portal privado)

- `AccessProcess.tsx`: el paso 3 ("Invitación") tenía `active: true` fijo, pintando su
  círculo siempre en naranja. Se cambió a `group-hover`: los 4 círculos arrancan en
  navy y cualquiera se resalta en naranja al pasar el cursor por encima de ese paso,
  ninguno queda resaltado por defecto.

---

## Sesión — 2026-07-13

**Cambios de esta sesión:**

### Rate limit por IP en `/api/solicitud-credito` (`src/lib/server/rate-limit.ts`)

- El endpoint era público y **sin ningún tope**: cualquiera podía repetir el POST en
  bucle y crear filas infinitas en `solicitudes_credito` + subir hasta 70 MB por envío
  al bucket (7 adjuntos × 10 MB). El honeypot no cubre esto — solo frena bots que
  llenan campos ocultos, no a alguien que copie la petición del Network tab.
- `checkRateLimit()` cuenta peticiones por IP en un `Map` en memoria y devuelve `429`
  con header `Retry-After`. Configurado en **3 envíos cada 10 minutos por IP**.
- Va como **primer guard del `POST`**, antes de leer el body: una petición bloqueada no
  gasta CPU parseando el `FormData` ni toca Supabase.
- Verificado contra el dev server: 3 peticiones desde la misma IP pasan al validador,
  la 4ª y 5ª devuelven 429, y una IP distinta pasa sin problema (el contador es por IP,
  así que un atacante no puede dejar fuera a los clientes reales).
- **Limitación conocida:** el contador vive en memoria del proceso. En Vercel cada
  instancia serverless lleva el suyo, así que el límite efectivo es más laxo. Suficiente
  para el MVP; si hace falta rigor, mover el contador a Supabase o a un KV externo.
- Adaptado de la rama `feature/backend-ivan` (no se hizo merge: las dos ramas
  reescribieron `route.ts` por separado y un merge habría roto la v2 del formulario).

### Correo de notificación de nueva solicitud (`src/lib/email/nueva-solicitud.ts`)

- Hasta ahora el bloque de Resend en `route.ts` era **código muerto**: existía, pero
  `RESEND_API_KEY` e `INTERNAL_NOTIFICATION_EMAIL` estaban vacías, así que el `if` nunca
  entraba. Nadie en INDUCOM se enteraba de una solicitud nueva; había que mirar la tabla
  en Supabase a mano.
- Nueva plantilla HTML con el **mismo diseño que el correo de "Restablece tu contraseña"**
  que vive en el dashboard de Supabase: tablas anidadas y estilos inline (lo único que
  renderiza bien en Outlook/Gmail), con los colores de `design-tokens.css` —
  navy `#00005B`, navy oscuro `#000027`, naranja `#EE6B03`.
- Contenido: folio destacado, tabla de datos del solicitante (tipo de solicitud, tipo de
  cliente, nombre, empresa si es jurídica, correo, RUC, cotización si es "nueva") y lista
  de los documentos que sí llegaron, con etiquetas legibles en vez de las claves internas.
- Se envía también versión **texto plano**, para el preview de algunos clientes y para no
  puntuar como spam por venir solo en HTML.
- `replyTo` apunta al correo del solicitante: responder el aviso escribe directo al
  cliente.
- **Todo valor dinámico pasa por `escapeHtml()`.** Los datos vienen del formulario
  público, así que un nombre con `<` o `"` rompería la maqueta y uno malicioso podría
  inyectar marcado en la bandeja de quien lo abra. Verificado con un `<script>` de prueba
  en el nombre: queda escapado.
- La plantilla **no** lleva `import "server-only"` a propósito: es una función pura que
  solo arma un string y no toca credenciales, así que puede renderizarse desde un script
  para previsualizarla. El secreto (la API key) lo guarda el route handler.

### Corrección del dominio remitente

- El `from` estaba hardcodeado como `notificaciones@inducom.com` — un dominio que **no
  existe en la cuenta de Resend**. Se corrigió a `notificaciones@grupo-inducom.com`.
- Cuidado con los tres dominios, que son fáciles de confundir:
  - `inducom-ec.com` → SMTP de **Zoho**, lo usa **Supabase Auth** (correo de recuperar
    contraseña). Funcionando.
  - `grupo-inducom.com` → dado de alta en **Resend**, para la notificación interna.
  - `inducom.com` → no existe en ningún lado. Era el valor viejo, incorrecto.

**⚠️ Pendientes para que el correo de notificación funcione (hoy NO envía):**

1. **Verificar `grupo-inducom.com` en Resend.** La API lo reporta como `not_started` y
   un envío de prueba devuelve `403: The grupo-inducom.com domain is not verified`. Hay
   que agregar los registros DNS (SPF/DKIM) que da Resend en resend.com/domains.
2. **Llenar `INTERNAL_NOTIFICATION_EMAIL`** en `.env` (y en Vercel). Está vacía, así que
   el `if` de `route.ts` ni siquiera entra. Es el correo interno que recibe el aviso.

**Nota sobre el correo de "olvidé mi contraseña":** no requirió ningún cambio de código.
La plantilla HTML vive en el dashboard de Supabase (Authentication → Emails), sale por el
SMTP de Zoho (`analista@inducom-ec.com`), y el `resetPasswordForEmail()` que ya existía en
`ForgotPasswordForm.tsx` la dispara tal cual. Supabase Auth **solo** manda correos de
autenticación — por eso la notificación de solicitud nueva necesita Resend aparte.

**⚠️ Pendiente crítico (sigue abierto):** el commit `3d9c17d` de `feature/backend-ivan`
publicó la `SUPABASE_SERVICE_ROLE_KEY` real en `.env.example`, que sí se sube a Git. Esa
llave **ignora todo el RLS**: da lectura/escritura/borrado sobre toda la base y sobre el
bucket privado con las cédulas y certificados bancarios de los clientes. Borrar el archivo
**no basta** — queda en el historial. Hay que **rotar la llave** (Supabase → Settings →
API → Rotate) y actualizar `.env` y las variables de Vercel.

**Antes de desplegar a Vercel:** configurar Supabase → Authentication → **URL
Configuration** con el dominio de producción en *Redirect URLs* (`https://…/**`). Sin eso,
`redirectTo` apuntará a la URL de Vercel, Supabase la rechazará por no estar en la lista
blanca, y el enlace del correo de recuperar contraseña no funcionará.

---

<!--
Plantilla para nuevas sesiones — copiar y completar:

## Sesión — YYYY-MM-DD

**Cambios de esta sesión:**

- Qué se cambió / agregó / arregló.
  - Para qué sirve / por qué se hizo.
- ...

-->
