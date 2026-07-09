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

---

<!--
Plantilla para nuevas sesiones — copiar y completar:

## Sesión — YYYY-MM-DD

**Cambios de esta sesión:**

- Qué se cambió / agregó / arregló.
  - Para qué sirve / por qué se hizo.
- ...

-->
