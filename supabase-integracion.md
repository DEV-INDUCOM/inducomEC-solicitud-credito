# Integración con Supabase

Este documento explica **cómo se conecta este proyecto a Supabase**, qué ya
está construido, y el plan para dejar completamente funcional el flujo de
solicitud de crédito (el primer caso real, sin stub).

## 1. Framework, no API cruda

Supabase ofrece dos formas de integrarte: usar su **API REST/PostgREST
autogenerada** directamente (llamadas HTTP a mano), o usar su **librería
cliente oficial** (`@supabase/supabase-js`), que es la que este proyecto usa.

Se eligió la librería porque Next.js ya actúa como backend (Route Handlers,
Server Components, Server Actions), y la librería da gratis: tipado, manejo
de sesión vía cookies, y respeto automático de Row Level Security — sin tener
que construir a mano los endpoints REST que Supabase ya expone.

## 2. Los tres clientes (`src/lib/supabase/`)

El proyecto separa el acceso a Supabase en tres clientes, cada uno con un
propósito y un nivel de permiso distintos:

| Archivo | Key que usa | Respeta RLS | Dónde se usa |
|---|---|---|---|
| `client.ts` | `anon` | Sí | Componentes `"use client"` (navegador) |
| `server.ts` | `anon` + cookies de sesión | Sí | Server Components, Route Handlers, Server Actions autenticados |
| `admin.ts` | `service_role` | **No** (la bypassea) | Solo servidor, solo para operaciones que por diseño deben cruzar RLS |

`admin.ts` es el más delicado: `service_role` puede leer y escribir
cualquier fila de cualquier tabla, sin importar las políticas de seguridad.
Por eso:

- Vive detrás de `import "server-only"` (el build falla si un componente
  cliente lo importa, directa o indirectamente).
- La key correspondiente (`SUPABASE_SERVICE_ROLE_KEY`) solo existe en
  `src/lib/config/env.server.ts`, nunca en `env.ts` (que es el archivo de
  variables `NEXT_PUBLIC_*` que sí llegan al navegador).
- Nunca se sube al repo: vive en `.env` (gitignored) en local, y como
  variable de entorno de servidor en Vercel.

## 3. Separación de variables de entorno

```
env.ts         → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
                  (llegan al navegador, es intencional y seguro: la anon
                  key sin service_role no puede saltarse RLS)

env.server.ts  → SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
                  INTERNAL_NOTIFICATION_EMAIL
                  (protegido con "server-only", nunca al bundle del cliente)
```

`.env.example` documenta los nombres de estas variables sin valores reales
(se versiona en git); `.env` tiene los valores reales y está en
`.gitignore`.

## 4. Caso de uso real: solicitud de crédito

La solicitud de crédito es pública (sin login) y necesita: guardar los datos
del formulario, subir hasta 5 archivos adjuntos, y notificar internamente
por correo. Como no hay sesión de usuario, esta operación **debe** usar el
cliente `admin.ts` desde el Route Handler `src/app/api/solicitud-credito/route.ts`.

Flujo:

1. El navegador envía `FormData` (datos + archivos) a `/api/solicitud-credito`.
2. El Route Handler revalida todo en servidor (nunca confía en la validación
   del navegador): campos requeridos, formato de cédula/RUC, email, tipo y
   tamaño de cada archivo, honeypot anti-spam.
3. Con `createSupabaseAdminClient()`:
   - Sube cada adjunto a un **bucket privado** de Storage (sin URL pública
     permanente).
   - Inserta la fila en la tabla `solicitudes_credito` (Postgres), con las
     rutas de Storage guardadas como referencia, no como URL pública.
4. Envía la notificación interna por correo con **Resend**
   (`RESEND_API_KEY` + `INTERNAL_NOTIFICATION_EMAIL`).
5. Responde al cliente con un folio o un mensaje de error genérico (nunca
   se expone el motivo interno de un fallo).

### Seguridad del flujo

- RLS **activo** en `solicitudes_credito` y en el bucket de Storage, sin
  ninguna política pública — solo `service_role` puede leer/escribir. Esto
  cumple la regla del proyecto: los adjuntos nunca quedan expuestos por URL
  pública, y la tabla no es accesible desde el cliente ni con la `anon key`.
- Honeypot: si el campo trampa viene lleno, se responde éxito falso sin
  procesar nada.
- Límites de tipo/tamaño de archivo aplicados en servidor, no solo en UI.
- Mensajes de error genéricos hacia el usuario.

## 5. Qué está hecho vs. qué falta

**Hecho:**
- Los tres clientes de Supabase (`client.ts`, `server.ts`, `admin.ts`).
- Separación de env vars públicas/privadas.
- Route Handler de solicitud de crédito con validación server-side completa
  (antes reenviaba a un webhook de n8n; se descartó esa idea a favor de
  hacerlo directo en el código, ver más abajo).

**En progreso ahora mismo:**
- Reescribir el Route Handler para que, en vez de reenviar a n8n, llame
  directamente a `createSupabaseAdminClient()` (subida a Storage + insert en
  Postgres) y a Resend para el correo.
- Migración SQL: tabla `solicitudes_credito` + bucket privado de Storage,
  ambos con RLS activo y cero políticas públicas.

**Pendiente (fuera del código, tareas del usuario):**
- Crear el proyecto real en Supabase.
- Correr la migración SQL en ese proyecto.
- Poner los valores reales en `.env` (local) y en las variables de entorno
  del proyecto en Vercel (producción).
- Verificar un dominio remitente en Resend para que el correo de
  notificación no caiga en spam.

## 6. Por qué no n8n

Se evaluó mover este flujo a n8n (Supabase + Storage + notificación) para
escribir menos código, y se llegó a implementar. Se decidió revertirlo y
hacerlo directo en el repo porque:

- El plan original del proyecto ya contemplaba esta lógica en código.
- Centraliza la lógica sensible a seguridad (validación, `service_role`,
  límites de archivo) en un solo lugar auditable, en vez de repartirla entre
  el repo y un workflow externo.
- El ahorro real de código era mínimo: la validación server-side de todos
  modos tiene que vivir en el Route Handler, sin importar a dónde se
  reenvíen los datos después.

Login, registro y "olvidé mi contraseña" siguen siendo stubs
(`src/lib/stubs/placeholder-actions.ts`) — no están afectados por este
trabajo, se conectarán a Supabase Auth en una fase posterior.
