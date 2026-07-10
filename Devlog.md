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

- El endpoint mapea `identificacion` desde el RUC del solicitante; `telefono_solicitante`
  y `nombre_empresa` van `null` (columnas nullable) porque v2 no los pide.
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

<!--
Plantilla para nuevas sesiones — copiar y completar:

## Sesión — YYYY-MM-DD

**Cambios de esta sesión:**

- Qué se cambió / agregó / arregló.
  - Para qué sirve / por qué se hizo.
- ...

-->
