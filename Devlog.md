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

## Sesión — 2026-07-14

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

### Fix de imagen rota en producción (Vercel): mayúscula/minúscula en la ruta

- El deploy de Vercel mostraba el Hero de la landing **sin la foto de fondo** (solo el
  degradado navy), aunque en local se veía bien. Causa: en `Hero.tsx` la ruta estaba
  escrita como `/images/background-image.png` (minúscula), pero la carpeta real es
  `public/Images/` (con **I** mayúscula). Windows no distingue mayúsculas/minúsculas en
  rutas de archivo, así que funcionaba en local; Vercel corre sobre Linux, que sí
  distingue, y la imagen daba 404 en producción.
- Se corrigió a `/Images/background-image.png`. Se revisó el resto del repo por el mismo
  patrón (`grep` de `/images/` en minúscula) y no había más casos.
- Pendiente para quien haga el próximo deploy: falta el commit + push de este cambio
  (y del fix del comentario que rompía `globals.css`, más arriba en esta misma sesión)
  para que se refleje en Vercel.

### Validación de RUC (13 dígitos) en la solicitud de crédito v2

- `validateStep2` (paso "Datos y documentos") solo pedía que `rucSolicitante` no
  viniera vacío, sin validar el formato — a diferencia de `cedula` en v1, que ya tenía
  `idOk` (10 u 13 dígitos). Se agregó `rucOk` en `validation.ts`:
  `const rucOk = (v: string) => /^\d{13}$/.test((v || "").trim());` — a propósito
  **distinta** de `idOk`: el RUC ecuatoriano son siempre 13 dígitos, ni más ni menos,
  no "10 ó 13" como cédula/RUC combinados.
- Usado en el paso 2: `if (!rucOk(s.datos.rucSolicitante)) e.rucSolicitante = "El RUC
  debe tener 13 dígitos.";` — reemplaza el chequeo anterior de solo "no vacío".
- Implementado por el usuario siguiendo el patrón ya explicado de `emailOk`/`idOk`; no
  requiere cambios en `route.ts` porque la longitud ya la exige el input, pero
  recordar que la validación de servidor de ese endpoint no revalida el formato de RUC
  hoy — solo revisa que el campo no esté vacío. Quedaría como posible mejora futura
  replicar `rucOk` también en el servidor, ya que la validación del navegador es solo
  ayuda de UX.




## Sesión — 2026-07-16

**Migracion de la base de datos**

- Qué se cambió / agregó / arregló.

### Se corrio el arhicvo 20260715000000_reconciliar_registro_y_cerrar_anon.sql 

  - Se corrio este codigo sql con el fin de dejar definido lo que realmente funciona y actualemente se esta usando en este proyecto, tambien para dejar definido y tener claro las polcies, functions que se hace uso y poder continuar con el crecimiento y desarrollo de este proyeto y la base de datos sin problema.

### Se corre el archivo limpieza-data-demo.sql 

  - Se corre este codigo sql para limpiar toda la data de prueba ingresada en la base de datos con el fin de empezar de cero con un proceso mas completo y avanzar mas alla del MVP y acercarse mas a la version para produccion.

## Resumen (estado al 2026-07-16, ANTES del refactor a `clientes` — ver más abajo)

> ⚠️ **Desactualizado.** Estas tablas describían el modelo cuando `empresas` era
> el hub central. Esa migración se reemplazó por completo — ver "Modelo
> `clientes`" más abajo — y las tablas actuales (correctas, post-refactor)
> están al final de esta sesión, bajo "Resumen final". Se deja esta versión
> vieja tal cual, sin editarla, como registro histórico de por qué se decidió
> el refactor.

**Functions and policies que actualmente estan funcionando y se usan**

| Función | Para qué sirve | Quién la ejecuta |
|---|---|---|
| `consumir_codigo_invitacion(text)` | Consume el código al registrarse (1 arg) | `authenticated` — la llama tu `RegisterForm` desde el navegador |
| `aprobar_solicitud_credito(uuid, int)` | Aprueba una solicitud: crea/vincula la empresa y genera su código de invitación | `service_role` — manual, desde el SQL Editor |
| `generar_codigo_invitacion(uuid, int)` | Genera el código `IND-EC-...` | `service_role` — la llama internamente `aprobar_solicitud_credito` |
| `set_updated_at()` | Trigger que mantiene la columna `updated_at` al día | automático, en cada `UPDATE` |
| `rls_auto_enable` | Event trigger: activa RLS solo en tablas nuevas | automático, de infraestructura

**Policies RLS que actualmente estan funcionando y se usan**

| Policy | Tabla | Qué permite |
|---|---|---|
| `lectura pública de países` | `paises` | cualquiera lee el catálogo (no es sensible) |
| `usuarios ven su propio perfil` | `perfiles` | cada quien ve solo su propia fila (`auth.uid() = id`) |
| `usuarios ven su propia empresa` | `empresas` | solo la empresa vinculada a tu perfil, nunca otra |
| `usuarios ven los pagos de su empresa` | `pagos` | pagos aislados por `empresa_id`; sin INSERT/UPDATE/DELETE desde la app |
| `usuarios ven el incentivo de su empresa` | `incentivos_empresa` | mismo aislamiento por `empresa_id` |

`solicitudes_credito`, `documentos_credito` y `codigos_invitacion` tienen RLS
activo pero **sin ninguna policy pública de lectura ni de INSERT** (las de INSERT a
`anon` se cerraron en `20260715000000_reconciliar_registro_y_cerrar_anon.sql`) — solo
`service_role` puede tocarlas, que es justo el cliente que usa `route.ts`.


### Explicacion de flujo de registro con codigo y el uso de consumir_codigo_invitacion(text)

- La primera vista del form de registro muestra el input para ingresar el codigo cuyo objetivo tiene que solo las empresas o contactos que considere INDUCOM generarle un codigo es enviado a sus correos opcion que se podra usar desde el portal administrativo, donde se habra tarjetas para su generacion inmediata pero claro primero se tendra que llenar al menos el correo de quien se le enviara, como consiguente el receptor hace consume el codigo, pero primero hay que corregir algo en el flujo, actualmente no se valida que el codigo sea valido donde se ingreso sino despues de llenar los datos del usuario es que recien hace validacion de codigo, entonces primero antes de presionar VALIDAR CODIGO, primero se llamara x funcion que haga la respectiva validacion a la base de datos mediante un query porque aunque el cliente copie y pegue el codigo puede que eso mitigue muchos errores, pero igual hay que validar 2 cosas, 1. el codigo exista, este activo y claro este dentro de la fecha de vencimiento, claro un punto importante es que cuando la fecha de vencimiento termine mediante un trigger se tendra que cambiar el estado automaticamente.



**Flujo de la creacion de codigo 
https://claude.ai/code/artifact/12ca1cff-ed57-4f6b-bdd6-47431a47e857?via=auto_preview 


### Scripts de limpieza total (`supabase/scripts/`)

Antes del refactor de esquema se necesitaba una base limpia de cero, no solo sin
data demo sino sin absolutamente nada (para poder ejecutar migraciones
estructurales sin arrastrar filas viejas):

- **`borrar-todo-menos-paises.sql`**: vacía `empresas`, `perfiles`,
  `codigos_invitacion`, `solicitudes_credito`, `documentos_credito`, `pagos`,
  `incentivos_empresa` y `auth.users`. Conserva `paises` (catálogo fijo,
  necesario para que el formulario siga funcionando). 3 partes: PARTE 1 solo
  cuenta filas por tabla (revisar antes de borrar), PARTE 2 borra en
  transacción y en orden de foreign keys (hijos antes que padres), PARTE 3
  verifica que todo quedó en 0 salvo `paises`.
- **`vaciar-bucket-documentos-credito.mjs`**: Supabase bloquea el `DELETE`
  directo sobre `storage.objects` con un trigger (`storage.protect_delete`),
  para no dejar archivos huérfanos en el disco real — hay que usar la Storage
  API. Este script (`node supabase/scripts/vaciar-bucket-documentos-credito.mjs`)
  lista el bucket en dos niveles (una carpeta por `solicitud_id`, archivos
  adentro) y los borra por lotes de hasta 1000.

---

## Modelo `clientes`: reemplaza a `empresas` como tabla central

**Problema que motivó el cambio:** hasta este punto, una persona natural que
llenaba el formulario de crédito terminaba con una fila en `empresas` usando
su propio nombre como "nombre de la empresa" (`aprobar_solicitud_credito`
caía a `nombre_solicitante` cuando no había `nombre_empresa`). Funcionaba,
pero mezclaba personas y empresas reales en la misma tabla, y tras aprobar
una solicitud se perdía el dato de si el cliente era natural o jurídico (no
había ninguna columna que lo guardara).

**`supabase/migrations/20260716000000_modelo_clientes.sql`** introduce
`clientes` como hub común, con `personas_naturales` y `empresas` como
subtipos:

```
clientes (id, tipo_cliente, pais_id, nombre_visible, email, identificacion)
    ├── personas_naturales (cliente_id PK/FK)
    └── empresas (cliente_id PK/FK)
```

- `nombre_visible`/`email`/`identificacion` viven en `clientes` porque el
  formulario recoge los mismos campos para ambos tipos — no hay razón para
  duplicarlos en los subtipos.
- Los subtipos nacieron **deliberadamente mínimos** (solo el FK) en un primer
  borrador, y luego se les agregó lo que sí distingue a cada tipo — ver la
  sección de nombres/apellidos más abajo, que fue lo que permitió llenarlos
  con datos reales en vez de vacíos.
- Se migran a `cliente_id` (en vez de `empresa_id`): `perfiles`, `pagos`,
  `codigos_invitacion`, `solicitudes_credito`.
- `incentivos_empresa` → `incentivos_cliente`; vista `saldo_por_empresa` →
  `saldo_por_cliente`.
- Las 3 funciones que dependían de `empresa_id` se reescriben:
  `consumir_codigo_invitacion` (insert a `perfiles` con `cliente_id`),
  `generar_codigo_invitacion` (cambia el `returns table`, requiere `drop`
  antes de recrear), `aprobar_solicitud_credito` (crea la fila en `clientes`
  y, según `tipoCliente`, en `personas_naturales` o `empresas`).
- **Guard de seguridad**: la migración es estructural — al inicio hace un
  `raise exception` si detecta filas en cualquier tabla de datos, obligando a
  correr `borrar-todo-menos-paises.sql` antes. Sin esto se podía perder data
  real en silencio.
- Se decidió **no editar las migraciones viejas** (`20260709000000`,
  `20260710010000`) para no reescribir historial ya aplicado — esta es una
  migración nueva hacia adelante, como corresponde al modelo de migraciones
  de Supabase.

**Frontend actualizado en el mismo cambio** (verificado con `tsc --noEmit` y
`next build`, ambos sin errores): `src/lib/portal/types.ts` (`PortalEmpresa`
→ `PortalCliente`, `empresaId` → `clienteId`), `queries.ts` (lee
`clientes.nombre_visible` directo, sin join a subtipos; `saldo_por_cliente`;
`incentivos_cliente`), `layout.tsx`/`PortalShell`/`PortalTopbar`
(`empresaNombre` → `clienteNombre`), `dashboard/page.tsx`, `paypal/page.tsx`,
`CompanySummary.tsx`. Se ajustaron 3 textos de UI que decían "tu empresa" a
"tu cuenta", porque ya no aplica solo a empresas.

### Nombres y apellidos separados (no un solo "nombre completo")

Al diseñar `personas_naturales` surgió la duda de si guardar `nombres`/
`apellidos` por separado (mejor práctica) o un solo campo. El formulario
público (v2, activo) solo tenía **un input** — "Nombre del solicitante",
placeholder "Nombres y apellidos" — así que partir ese string a posteriori
para llenar dos columnas habría significado *adivinar* dónde cortar un
nombre compuesto (ej. "Juan Carlos Pérez López"), con alto riesgo de error.

Se optó por resolverlo en la raíz: **separar el campo en el formulario
público**, no solo en la base de datos.

- `Step2Datos.tsx`: el input único se partió en dos — "Nombres del
  solicitante" y "Apellidos del solicitante".
- `types.ts` (`DatosStep2`), `validation.ts` (`validateStep2`),
  `CreditRequestForm2.tsx`: `nombreSolicitante` → `nombres` + `apellidos` en
  todo el flujo del wizard.
- `route.ts`: el cliente ya **no manda** un nombre concatenado — manda
  `nombres`/`apellidos` sueltos. El servidor arma
  `` `${nombres} ${apellidos}`.trim() `` él mismo para la columna
  `solicitudes_credito.nombre_solicitante` y para el correo de notificación:
  es la única fuente de verdad, así no puede llegar un nombre completo que no
  coincida con los campos reales que sí llegaron.
- `personas_naturales` terminó con columnas reales `nombres text not null,
  apellidos text not null`, pobladas por `aprobar_solicitud_credito` leyendo
  `datos_adicionales ->> 'nombres'` / `->> 'apellidos'` (el jsonb ya guarda
  el objeto completo que mandó el cliente). Si faltaran, la función corta con
  `raise exception 'solicitud_sin_nombres_apellidos'` en vez de guardar datos
  inventados.
- De paso se le agregó a `empresas` la columna `representante_legal text not
  null` (faltaba en el primer borrador): quien llena el form como jurídica
  ES el representante legal, y con nombres/apellidos ya separados ese dato
  llega limpio. No se agregó `ruc` en `empresas` porque ya vive en
  `clientes.identificacion` — duplicarlo hubiera sido redundante.

## Resumen final (post-refactor, vigente)

**Tablas de negocio:** `paises`, `clientes` (hub), `personas_naturales` y
`empresas` (subtipos 1:1 con `clientes`), `perfiles`, `codigos_invitacion`,
`solicitudes_credito`, `documentos_credito`, `pagos`, `incentivos_cliente`.
Vista: `saldo_por_cliente`.

| Función | Para qué sirve | Quién la ejecuta |
|---|---|---|
| `consumir_codigo_invitacion(text)` | Consume el código al registrarse | `authenticated` — `RegisterForm` desde el navegador |
| `aprobar_solicitud_credito(uuid, int)` | Aprueba una solicitud: crea/vincula cliente (natural o jurídica) y genera su código | `service_role` en este punto (cambia a `authenticated` con el panel admin — ver Sesión 2026-07-17) |
| `generar_codigo_invitacion(uuid, int)` | Genera el código `IND-EC-...` | llamada internamente por `aprobar_solicitud_credito` |
| `set_updated_at()` | Trigger que mantiene `updated_at` al día | automático |
| `rls_auto_enable` | Event trigger: activa RLS en tablas nuevas | automático |

| Policy | Tabla | Qué permite |
|---|---|---|
| `usuarios ven su propio cliente` | `clientes` | cada quien ve solo su fila |
| `usuarios ven su propia persona natural` / `...su propia empresa` | `personas_naturales` / `empresas` | mismo aislamiento por `cliente_id` |
| `usuarios ven los pagos de su cliente` | `pagos` | aislado por `cliente_id` |
| `usuarios ven el incentivo de su cliente` | `incentivos_cliente` | aislado por `cliente_id` |

`solicitudes_credito`, `documentos_credito` y `codigos_invitacion` siguen sin
ninguna policy pública de lectura ni de INSERT — solo `service_role` (desde
`route.ts`) puede tocarlas.

---

## Sesión — 2026-07-17

**Tema principal: panel administrativo completo** — hasta ahora, aprobar una
solicitud o generar un código de invitación se hacía a mano en el SQL Editor
de Supabase con `service_role`, sin ningún login de por medio y sin registro
de qué empleado hizo qué. Esta sesión construye un panel propio en
`/admin/*`, con su propio login, y mueve la autorización de esas operaciones
a nivel de base de datos (RLS + funciones), no solo de pantalla.

### `supabase/migrations/20260716010000_personal_interno.sql`

- Tabla **`personal_interno`**: identidad individual 1:1 con `auth.users`
  (`id uuid references auth.users(id)`, `nombre`, `rol` fijo a `'admin'` por
  ahora, `activo boolean`). Alta es manual (crear el usuario en Supabase Auth
  + un `insert` a esta tabla) — no hay self-service, para no poder escalar
  privilegios de admin desde el navegador.
- Policy `"personal ve su propio registro"`: cada quien ve solo su fila.
- Función helper **`es_personal_interno_activo()`** (`security definer`,
  `stable`): responde si el usuario autenticado actual es personal interno
  con `activo = true`. La usan como guard todas las funciones/policies
  admin de aquí en adelante.
- Columnas de auditoría nuevas: `codigos_invitacion.generado_por` y
  `solicitudes_credito.aprobado_por`, ambas `references personal_interno(id)`
  — para que quede registro de qué empleado generó cada código y aprobó cada
  solicitud (antes, con `service_role`, no había forma de saberlo).
- **`generar_codigo_invitacion`** y **`aprobar_solicitud_credito`** se
  reescriben: pierden el `grant` a `service_role` y pasan a `authenticated`,
  con `if not public.es_personal_interno_activo() then raise exception
  'no_autorizado'` al inicio. Ya no basta con tener la llave maestra — hay
  que estar logueado como personal interno activo.

### `supabase/migrations/20260717000000_panel_admin.sql`

- **Policies "personal interno ve todo"**, agregadas sin tocar las policies
  existentes de "cada cliente ve lo suyo" (conviven en la misma tabla): sobre
  `personal_interno`, `clientes`, `personas_naturales`, `empresas`,
  `perfiles`, `pagos`, `codigos_invitacion`, `solicitudes_credito`,
  `documentos_credito`, `incentivos_cliente`. Todas con el mismo patrón:
  `using (public.es_personal_interno_activo())`.
- `incentivos_cliente` gana policies de INSERT/UPDATE para personal interno
  (asignar/actualizar un incentivo no tiene invariantes complejas, se
  resuelve con RLS directo, sin RPC dedicado).
- **Policy de Storage**: `"personal interno lee documentos de credito"` — sin
  esto, `createSignedUrl()` desde el panel (que usa la sesión del admin, no
  `service_role`) no puede leer los objetos del bucket privado aunque la fila
  de `documentos_credito` sí sea visible por RLS. Ver el bug de esta sesión
  más abajo.
- Vista **`admin_resumen_clientes`** (`security_invoker = true`): evita N+1
  queries en la pantalla de Empresas — trae usuarios, total pagado y último
  pago por cliente en una sola consulta.
- `pagos` gana columnas **`metodo_pago`** (transferencia/tarjeta/efectivo/
  cheque/ventanilla/otro) y **`registrado_por`** (qué admin cargó el pago) +
  policy de INSERT para personal interno.
- Tabla nueva **`historial_solicitud`**: registra cada cambio de estado de
  una solicitud (`estado_anterior`, `estado_nuevo`, `nota`, `actor_id`). Sin
  policy de INSERT — la única vía de escritura es la función de abajo, para
  que cada fila del historial quede atada a un cambio real y auditado.
- Función **`actualizar_estado_solicitud(solicitud_id, nuevo_estado, nota)`**:
  cambia el estado de una solicitud y deja rastro en `historial_solicitud`. Si
  el nuevo estado es `'aprobado'`, delega en `aprobar_solicitud_credito`
  (crea/vincula cliente + genera código) en vez de duplicar esa lógica.
  También requiere `es_personal_interno_activo()`.

### Frontend del panel (`src/app/(admin)/`, `src/components/admin/`)

- **Rutas** (`src/lib/config/site.ts`): `/admin/login`, `/admin` (Resumen),
  `/admin/solicitudes` (+ detalle `[id]`), `/admin/empresas` (+ detalle
  `[id]`), `/admin/pagos`, `/admin/codigos`, `/admin/perfil`.
- **Protección de rutas** en `proxy.ts` (middleware): cualquier `/admin/*`
  que no sea `/admin/login` exige sesión **y** una fila en `personal_interno`
  con `activo = true` — si falta cualquiera de las dos, redirige a
  `/admin/login`. Es el mismo patrón que ya protegía `/portal/*`, con su
  propio matcher (`/admin/:path*`).
- **`AdminGroupLayout`** (`(admin)/layout.tsx`): defensa en profundidad —
  vuelve a resolver el contexto aunque el middleware ya haya filtrado, para
  poder mostrar un estado propio (sesión sin cuenta de personal interno,
  error) en vez de un error crudo.
- **`src/lib/admin/actions.ts`** (server actions):
  - `obtenerUrlDocumento(storagePath)`: genera una signed URL de 5 minutos
    para un adjunto del bucket privado.
  - `actualizarEstadoSolicitud(id, nuevoEstado, nota)`: llama al RPC del
    mismo nombre; revalida el detalle, el listado y el resumen.
  - `registrarPago(input)`: inserta en `pagos` con `origen: "manual"` y el
    `id` del admin logueado en `registrado_por`; revalida pagos, resumen y
    empresas.
  - `generarCodigo(clienteId, diasValidez)`: llama a
    `generar_codigo_invitacion` vía RPC.
- **Componentes** (`components/admin/`): `ClientesTable`, `CodigosTable`,
  `PagosTable`, `EstadoSolicitudBadge`, `EstadoSolicitudForm`,
  `GenerarCodigoModal`, `Pagination`, `DocumentoDownloadButton` (botón que
  llama a `obtenerUrlDocumento` y abre la signed URL en una pestaña nueva).
- **`docs/flujo-solicitud-credito.md`**: documento nuevo con el flujo
  completo público → aprobación → registro, para referencia del equipo.

### Cambio menor de paso: `folio` → `numeroSolicitud`

En el mismo commit se renombró la variable/campo de respuesta de
`route.ts` (y su consumo en `CreditRequestForm2.tsx`/`SuccessScreen.tsx`) de
`folio` a `numeroSolicitud` — mismo valor (`SOL-XXXXXXXX`), solo cambia el
nombre. No afecta ninguna lógica.

### 🐛 Bug diagnosticado: el botón de descargar documento no abre nada

**Síntoma reportado:** "no se me está guardando en el bucket". Se verificó
con capturas del Storage Explorer que **los archivos sí se suben
correctamente** — cada `solicitud_id` tiene su carpeta con los adjuntos
reales, con su tamaño y fecha. El bug no está en la subida (`route.ts`, sin
tocar desde la refactorización de nombres/apellidos).

**Causa real:** `obtenerUrlDocumento()` usa `createSupabaseServerClient()`
(la sesión del admin logueado, respeta RLS) para llamar
`.storage.from("documentos-credito").createSignedUrl(...)`. Generar una
signed URL de un bucket privado exige que el llamante tenga permiso de
`SELECT` sobre `storage.objects` vía RLS. Esa policy
(`"personal interno lee documentos de credito"`) **sí existe en el
repo** — está en `20260717000000_panel_admin.sql` — pero si esa migración
todavía no se corrió contra el Supabase real, la policy no existe ahí, y
`createSignedUrl` falla en silencio (el botón no abre nada, sin error
visible).

**Pendiente de confirmar:** correr `20260716010000_personal_interno.sql` y
`20260717000000_panel_admin.sql` (completos, en ese orden, cada uno de una
sola vez) contra el Supabase real, y volver a probar el botón de descarga
desde el panel.

---

## Sesión — 2026-07-21

**Tema principal: correo de notificación con adjuntos reales vía n8n, y se
descubrió que el backend de ese flujo ya estaba escrito en el working tree
(sin commitear) antes de empezar esta sesión.**

### Contexto encontrado al iniciar

`route.ts` y `env.server.ts` ya tenían, sin commitear, un bloque que dispara
un `fetch` (sin `await`, fire-and-forget) a `serverEnv.n8nWebhookUrl` justo
después de guardar la solicitud en Supabase — con `solicitud_id` y los datos
del solicitante en el body. Es decir: el lado de Next.js de esta integración
ya estaba resuelto de una sesión anterior; lo que faltaba era (a) la variable
de entorno con la URL real y (b) el workflow del lado de n8n que reciba ese
POST y realmente arme/mande el correo con los adjuntos.

### Variable de entorno `N8N_WEBHOOK_URL`

- Agregada en `.env` (valor real: `https://inducom.app.n8n.cloud/webhook/envio-correo`)
  y en `.env.example` (vacía, como plantilla).
- Falta agregarla también en Vercel (Settings → Environment Variables) +
  redeploy para que tome efecto en producción — **pendiente, no hecho en esta
  sesión**.

### Workflow de n8n diseñado (fuera del repo)

Se diseñó el flujo completo para el webhook `envio-correo`: **Webhook (POST)
→ query Postgres a `documentos_credito` por `solicitud_id` → HTTP Request que
descarga cada adjunto del bucket privado de Supabase Storage → Code que junta
los adjuntos en base64 → Code que arma el HTML del correo (mismo diseño de
marca que la plantilla original, portado a JS) → HTTP Request que envía por
la API de Resend con los adjuntos reales.**

El JSON exportable del workflow quedó guardado en la carpeta scratchpad de la
sesión (fuera del repo, no versionado): el usuario lo importa manualmente en
su instancia de n8n. Pendiente de que el usuario lo importe, complete las
credenciales (Postgres, Supabase `service_role`, Resend API key) y active el
workflow.

### Se corrigió: se mandaban DOS correos por cada solicitud, ahora uno solo

Antes de esta sesión, `route.ts` mandaba un correo inmediato por Resend
**sin adjuntos** (solo listaba nombres de archivo) y, además, el fetch a n8n
disparaba un **segundo** correo con los adjuntos reales. A pedido del
usuario, se dejó un solo correo:

- Se quitó de `route.ts` el bloque que enviaba directo por `resend.emails.send(...)`.
- Se limpiaron los imports que quedaron sin uso: `Resend` (de `"resend"`) y
  `renderNuevaSolicitudEmail` (de `@/lib/email/nueva-solicitud`), y la
  constante `NOTIFICATION_FROM`.
- Único correo restante: el que arma y manda el workflow de n8n (con
  adjuntos reales), disparado por el `fetch` fire-and-forget que ya existía.
- **Pendiente sin resolver:** `src/lib/email/nueva-solicitud.ts` quedó sin
  ningún import — es código muerto. Se intentó borrar con `rm` pero el modo
  automático bloqueó la acción (operación destructiva). Falta que alguien lo
  borre manualmente si se está de acuerdo.

### Columna nueva `documentos_credito.tipo_documento`

El usuario pidió poder saber a qué requisito corresponde cada documento
(cédula, RUC, certificado bancario, etc.) — antes esa clave solo vivía
escondida como substring dentro de `storage_path`, no como columna
consultable.

- **Migración nueva:** `supabase/migrations/20260721000000_documentos_credito_tipo.sql`
  — `alter table documentos_credito add column tipo_documento text;`
  (nullable, sin backfill de filas viejas — el usuario confirmó que los datos
  existentes son descartables). **Todavía no se corrió contra el Supabase
  real.**
- `route.ts`: nuevo diccionario `REQUISITO_LABEL` (clave interna → etiqueta
  en español ya traducida: "Cédula", "RUC", "Certificado bancario", etc.,
  decisión explícita del usuario de guardar la etiqueta ya traducida y no la
  clave cruda) y se agregó `tipo_documento: REQUISITO_LABEL[key] ?? key` al
  `insert` de `documentos`.
- A pedido explícito del usuario, **no se tocó** `admin/queries.ts` ni la UI
  del panel — sigue mostrando `nombre_archivo` como antes. Alcance
  intencionalmente mínimo.
- Se verificó que ninguna policy/función RLS enumera columnas de
  `documentos_credito` (la única policy sobre esa tabla es un `select` sin
  lista de columnas), así que el `alter table` no rompe nada existente.

### Documentación

- Se agrega esta entrada al Devlog.
- Se crea `flujo.md` (raíz del proyecto): explicación del flujo completo del
  formulario de solicitud de crédito, para alguien sin contexto previo del
  proyecto — qué archivos intervienen, cuándo se activa cada paso, y qué
  significa en términos simples el `fetch` hacia `/api/solicitud-credito`. 