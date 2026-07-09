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

<!--
Plantilla para nuevas sesiones — copiar y completar:

## Sesión — YYYY-MM-DD

**Cambios de esta sesión:**

- Qué se cambió / agregó / arregló.
  - Para qué sirve / por qué se hizo.
- ...

-->
