# Cómo está organizada `src/lib/`

`lib/` es donde vive todo lo que **no es interfaz**: configuración, conexión a
Supabase, validación de formularios y helpers genéricos. La regla simple para
decidir si algo va en `lib/` o en `components/`: si no devuelve JSX, va en
`lib/`.

```
src/lib/
  config/       Configuración de la app: rutas, textos de navegación, variables de entorno
  stubs/        Simulaciones de backend mientras no hay Supabase conectado
  supabase/     Fábricas del cliente de Supabase (browser / server / admin)
  utils/        Helpers genéricos sin lógica de negocio
  validations/  Esquemas Zod: qué es un dato válido, en un solo lugar
```

## ¿Por qué 5 carpetas y no una sola?

Cada una responde a una pregunta distinta:

| Carpeta | Pregunta que responde |
|---|---|
| `config/` | ¿Cómo se llama esta ruta / este dato del sitio / esta variable de entorno? |
| `stubs/` | ¿Qué pasa cuando el usuario envía un formulario, *antes* de que exista el backend real? |
| `supabase/` | ¿Cómo obtengo un cliente de Supabase, y con qué permisos? |
| `validations/` | ¿Es válido este dato antes de mandarlo a algún lado? |
| `utils/` | Utilidades sin opinión de negocio (ej. combinar clases de Tailwind) |

Mezclar todo en un solo archivo `lib/helpers.ts` funciona al principio, pero
dentro de unas semanas se vuelve un archivo de 500 líneas donde nadie
encuentra nada. Separar por **tipo de responsabilidad** (no por pantalla) es
la convención estándar en proyectos Next.js — es la misma razón por la que
`components/` sí se separa por pantalla (`landing/` / `portal/`): son dos
tipos de código distintos.

**¿Por qué `lib/` no sigue el mismo patrón landing/portal que `components/`?**
Porque nada de lo que hay aquí pertenece a una sola superficie. `site.ts`
tiene las rutas de *ambas* superficies. Los tres clientes de Supabase los va
a usar tanto el login como el dashboard. `cn()` lo usa literalmente todo. Si
forzara `lib/landing/` y `lib/portal/`, terminaría con las mismas 3 líneas de
`env.ts` duplicadas en dos carpetas, o con imports cruzados entre ellas — la
carpeta dejaría de significar algo. Separar por *tipo de responsabilidad*
aquí, y por *pantalla* en `components/`, no es una inconsistencia: son dos
tipos de código distinto (infraestructura transversal vs. interfaz por
pantalla) y cada uno se organiza mejor a su manera.

## Guía de uso, carpeta por carpeta

### `config/`

```
config/
  site.ts        rutas (routes.login, routes.dashboard...), links del navbar/footer, datos de contacto
  env.ts         variables NEXT_PUBLIC_* — pueden importarse desde componentes cliente
  env.server.ts  variables privadas (service_role, Resend) — solo desde código de servidor
```

**Cuándo tocarlo:** agregas una ruta nueva → la registras en `site.ts` en vez
de escribir el string `"/portal/algo"` a mano en 5 componentes distintos. Si
mañana cambia una URL, se cambia en un solo lugar.

```ts
import { routes } from "@/lib/config/site";
<Link href={routes.dashboard}>Ir al panel</Link>
```

`env.server.ts` importa el paquete `server-only`: si por error un componente
cliente lo importa, el build falla en vez de filtrar `SUPABASE_SERVICE_ROLE_KEY`
al navegador. Es una barrera automática, no solo una convención de nombres.

### `stubs/`

Hoy contiene `placeholder-actions.ts`: funciones como `simulateLogin` o
`simulateCreditRequest` que esperan ~700ms y devuelven una respuesta fija.
Existen para que los formularios (`LoginForm`, `CreditRequestForm`, etc.)
tengan un flujo real de loading → éxito/error **sin que exista Supabase
todavía**. Cada función tiene un comentario `TODO` marcando exactamente qué
llamada real la va a reemplazar.

**Cuándo tocarlo:** cuando conectes el backend real, reemplazas la función
correspondiente por una llamada de verdad (server action o route handler) y
borras el stub — no hace falta tocar el componente que la usa, porque la
firma (qué recibe, qué devuelve) se mantiene igual.

> Antes vivía en `lib/auth/`, pero ahí adentro también estaba
> `simulateCreditRequest`, que no tiene nada que ver con autenticación. Lo
> renombré a `lib/stubs/` porque describe con precisión lo que hay: no es
> lógica de auth, es una capa de simulación temporal.

### `supabase/`

```
supabase/
  client.ts   cliente para Client Components ("use client") — respeta RLS
  server.ts   cliente para Server Components / Route Handlers — respeta RLS
  admin.ts    cliente con service_role — BYPASSEA RLS, solo servidor
```

Tres archivos porque son tres contextos con permisos distintos, y mezclarlos
es exactamente el tipo de error que puede filtrar datos entre empresas. La
regla de uso:

- ¿Estás en un componente con `"use client"`? → `client.ts`.
- ¿Estás en un Server Component o Route Handler leyendo datos del usuario
  logueado? → `server.ts`.
- ¿Necesitas una operación que por diseño debe saltarse RLS (ej. consumir un
  código de invitación de forma atómica)? → `admin.ts`, **solo** en ese paso
  puntual de servidor, nunca como cliente por defecto.

Hoy los tres son stubs (no hay proyecto Supabase conectado — las variables de
`.env.local` están vacías), pero la forma de usarlos no cambia cuando se
conecte el real.

### `validations/`

Esquemas Zod: `auth.ts` (login, código de invitación, registro, recuperar
contraseña) y `credit-request.ts` (solicitud de crédito). Cada formulario
importa su esquema y lo corre con `.safeParse()` antes de mostrar el estado
de envío:

```ts
const result = loginSchema.safeParse({ email, password });
if (!result.success) { /* mostrar errores de campo */ }
```

**Por qué centralizados y no junto a cada formulario:** porque son la
definición de "qué es un dato válido" para el negocio, no un detalle visual
del formulario. Si mañana el código de invitación cambia de formato, se edita
un esquema, no se busca en 3 componentes. Ojo: esto es validación de **UX**
en el cliente — la regla del proyecto (ver `consideraciones-tecnicas`) es que
la validación que de verdad importa (código, permisos) se repite en el
servidor. Zod aquí no reemplaza eso.

### `utils/`

Por ahora solo `cn.ts` (combina clases de Tailwind condicionalmente, envoltura
de `clsx`). Es el único candidato real a "helper genérico sin opinión de
negocio" que existe hoy. Si aparece otro (formateo de fechas, moneda, etc.),
va aquí — pero evita que esta carpeta se vuelva el cajón de sastre: si un
helper solo lo usa una pantalla, mejor vive junto a esa pantalla en
`components/pages/...`, no en `lib/utils/`.

## Resumen para decidir dónde poner algo nuevo

1. ¿Es una ruta, texto de navegación o variable de entorno? → `config/`.
2. ¿Es una llamada a Supabase? → `supabase/`, elige el archivo según el
   contexto (cliente / servidor / admin).
3. ¿Define qué hace válido a un dato de formulario? → `validations/`.
4. ¿Es un reemplazo temporal de una llamada a backend que aún no existe? →
   `stubs/`.
5. ¿Es una función pura, sin conocimiento del negocio, usada en más de una
   pantalla? → `utils/`.
6. ¿No calza en ninguna de las anteriores y solo lo usa una pantalla? →
   probablemente no va en `lib/` — va junto al componente que lo necesita.
