# Portal de Clientes INDUCOM

Frontend del Portal de Clientes INDUCOM. Next.js (App Router) + React + TypeScript.

Este repo contiene únicamente las **4 pantallas públicas convertidas desde Figma** (Landing,
Política de Privacidad, Login, Registro) más el resto de rutas públicas del MVP y placeholders
de las rutas privadas. No hay lógica real de Supabase todavía: los formularios usan stubs
claramente marcados en `lib/auth/placeholder-actions.ts`.

## Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Si el puerto 3000 ya está en uso, Next.js
levanta automáticamente en el 3001.

Otros comandos:

```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # ESLint
```

## Variables de entorno

Copia `.env.example` a `.env.local` y complétalo cuando exista el proyecto de Supabase real:

```bash
cp .env.example .env.local
```

| Variable | Alcance | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Llega al navegador. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Llega al navegador. Respeta RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor** | Bypassea RLS por completo. Nunca debe llegar al cliente ni al repositorio. |
| `RESEND_API_KEY` | **Solo servidor** | Envío de correo (notificación interna de solicitudes). |
| `INTERNAL_NOTIFICATION_EMAIL` | **Solo servidor** | Correo interno que recibe cada solicitud de crédito. |

`.env.local` está en `.gitignore` — nunca se sube al repositorio.

## Rutas

| Ruta | Acceso | Estado |
|---|---|---|
| `/` | Público | Landing (convertida de Figma) |
| `/solicitud-credito` | Público, sin login | Formulario funcional (validación + stub de envío) |
| `/politica-de-privacidad` | Público | Convertida de Figma |
| `/portal/login` | Público | Convertida de Figma |
| `/portal/registro` | Público | Convertida de Figma (2 pasos: código → datos de cuenta) |
| `/portal/recuperar-contrasena` | Público | Placeholder simple |
| `/portal/dashboard` | Privado (futuro) | Solo estructura visual, sin datos reales |
| `/portal/paypal` | Privado (futuro) | Marcado como "Próximamente" |

**Regla dura respetada:** `/solicitud-credito` nunca está detrás de login — aplica también a
quienes todavía no son clientes. El registro (`/portal/registro`) solo es alcanzable con un
código de invitación; no hay forma de crear una cuenta libremente.

## Estructura

```
app/
  (public)/        Landing, solicitud de crédito, política de privacidad — con Navbar + Footer
  (auth)/portal/    Login, registro, recuperar contraseña — layout split-screen, sin Navbar/Footer
  (portal)/portal/  Dashboard y PayPal — placeholders privados, con PortalShell

components/
  ui/               Piezas reutilizables: Button, Input, Card, Accordion, Alert, FormStatus...
  layout/           Navbar, Footer, AuthSplitLayout, PortalShell
  sections/         Bloques de la landing y de la página legal
  forms/            Formularios client-side (Login, Registro, Solicitud de crédito, ...)

lib/
  config/           site.ts (nav, contacto, rutas), env.ts (público), env.server.ts (privado)
  validations/      Esquemas Zod
  supabase/         Stubs de cliente Supabase (browser, server, admin) — sin proyecto conectado aún
  auth/             Acciones simuladas (loading/error/éxito) mientras no hay backend real
  utils/            Helpers (cn)

styles/
  design-tokens.css Fuente de verdad de colores, tipografía, espaciado, radios y sombras

app/globals.css     Único stylesheet del proyecto: reset + todas las clases de componentes,
                    organizado en secciones comentadas que reflejan la estructura de components/
```

## CSS

El proyecto usa **un solo `app/globals.css`**, no CSS Modules ni Tailwind. Cada componente tiene
su propia sección comentada dentro del archivo (`/* === UI · Button === */`, etc.) con clases con
prefijo único (`btn-*`, `input-*`, `auth-card-*`, `mgmt-*`...) para evitar colisiones de nombres.
El responsive se maneja con `@media` queries normales dentro de cada sección, junto a la regla
base que ajustan. Todo valor de color, tipografía, espaciado, radio o sombra se toma de
`design-tokens.css` — no hay colores hardcodeados fuera de ese archivo.

## Pendiente (fuera de alcance de este entregable)

- Conectar Supabase real (Auth, tablas, RLS, Storage).
- Middleware de `/portal/*` para proteger rutas privadas.
- `validar_codigo` en servidor (consumo atómico de códigos de invitación).
- Envío real de correos con Resend.
- Módulo PayPal real, panel admin, métricas — ver `blueprint_cronograma_portal_clientes_inducom.pdf`.
