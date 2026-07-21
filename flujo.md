# Flujo del formulario de solicitud de crédito (explicado desde cero)

Este documento explica, paso a paso y sin dar por sentado nada, qué pasa
desde que un cliente abre el formulario público de solicitud de crédito
hasta que la solicitud queda guardada y las notificaciones salen. Está
pensado para alguien que recién llega al proyecto.

## 1. Conceptos básicos que hay que tener claros primero

**¿Qué es un "endpoint"?**
Es una URL a la que se le puede mandar una petición (un pedido) y que
responde algo. En este proyecto, `/api/solicitud-credito` es un endpoint.

**¿Qué significa `/api/solicitud-credito`?**
No es un archivo que "se busca" en tiempo real — es una **ruta** que Next.js
(el framework que usa este proyecto) resuelve automáticamente a partir de la
estructura de carpetas. Este proyecto usa el "App Router" de Next.js, que
tiene una regla simple: **la carpeta = la URL**.

```
src/app/api/solicitud-credito/route.ts   →   /api/solicitud-credito
```

No hay que "conectar" nada a mano ni registrar la ruta en ningún lado — el
solo hecho de que exista el archivo `route.ts` dentro de esa carpeta hace que
Next.js sepa que ahí vive el código que debe correr cuando alguien le
mande una petición a esa URL. Por eso cuando el frontend hace
`fetch("/api/solicitud-credito")`, Next.js **ya sabe** exactamente qué
archivo ejecutar: no hay magia, es una convención de carpetas.

**¿Qué es `fetch`?**
Es la forma en la que el código que corre en el navegador (JavaScript del
lado del cliente) le pide algo a un servidor por internet. `fetch(url, {...})`
manda una petición HTTP a esa URL y devuelve una respuesta (o un error si no
hay conexión).

**¿Qué es `POST`?**
Es el "verbo" de la petición HTTP. `GET` normalmente pide datos ("dame
información"), `POST` normalmente envía datos para que el servidor los
procese o guarde ("acá te mando información nueva"). El formulario usa
`POST` porque le está mandando datos nuevos al servidor (los datos de la
solicitud + los archivos).

**Cliente vs. servidor, en este proyecto:**
- El **cliente** es el navegador del usuario. Ahí corre React —
  `CreditRequestForm2.tsx` y todo lo que ve el usuario en pantalla.
- El **servidor** es donde corre `route.ts`. Nunca se ejecuta en el
  navegador del usuario — corre en Vercel (en producción) o en tu máquina
  cuando usas `next dev` (en local). Solo el servidor tiene acceso a las
  credenciales sensibles (`service_role` de Supabase, la API key de Resend,
  la URL del webhook de n8n) — el navegador nunca las ve.

## 2. Los archivos que intervienen (y qué hace cada uno)

| Archivo | Dónde corre | Qué hace |
|---|---|---|
| [`CreditRequestForm2.tsx`](src/components/pages/landing/solicitud-formulario/CreditRequestForm2.tsx) | Navegador (cliente) | El wizard de 3 pasos completo: guarda todo lo que el usuario escribe/sube en memoria (React state), valida en el paso final y dispara el `fetch` |
| [`Step2Datos.tsx`](src/components/pages/landing/solicitud-formulario/steps-version2/Step2Datos.tsx) | Navegador (cliente) | El formulario visual del último paso (los inputs de texto y los inputs de archivo) |
| [`validation.ts`](src/components/pages/landing/solicitud-formulario/validation.ts) | Navegador (cliente) | Valida los campos antes de dejar avanzar/enviar — es solo ayuda visual, no seguridad real |
| [`route.ts`](src/app/api/solicitud-credito/route.ts) | Servidor | El único lugar que de verdad valida, guarda en la base de datos, sube archivos y dispara notificaciones |
| [`env.server.ts`](src/lib/config/env.server.ts) | Servidor | Lee las variables de entorno secretas (`.env`) que `route.ts` necesita |
| `.env` | Servidor (nunca llega al navegador) | Tiene los valores reales de esas variables (claves de Supabase, Resend, n8n) |

## 3. El recorrido completo, paso a paso

### Paso 1 — El usuario llena el formulario (navegador)

Mientras el usuario escribe o sube archivos en `Step2Datos`, **no se manda
nada todavía**. Cada cambio solo actualiza el estado de React dentro de
`CreditRequestForm2.tsx` (la función `setState(...)`). Todo vive en la
memoria del navegador, nada ha viajado por internet aún.

### Paso 2 — El usuario hace clic en "Enviar solicitud"

Ese botón siempre llama a una función llamada `next()`. `next()` valida el
paso actual y, como es el último paso del wizard, en vez de avanzar llama a
otra función: `submit()`.

### Paso 3 — `submit()` empaqueta todo en un solo paquete (`FormData`)

Antes de mandar nada, arma un objeto especial llamado `FormData`, que es el
único tipo de "paquete" que puede llevar **archivos binarios junto con
texto** en una sola petición HTTP. Adentro va:
- Un campo llamado `"data"` con **todos los datos de texto** convertidos a
  un solo string JSON (nombre, apellido, correo, RUC, etc.).
- Cada archivo subido, cada uno con su propia "etiqueta" (`cedula`, `ruc`,
  `certBancario`, etc.) para que el servidor sepa cuál es cuál.
- Un campo oculto (`website`) que sirve de trampa anti-bots.

### Paso 4 — Se dispara el `fetch` (esto es el momento en que "sale" del navegador)

```ts
const res = await fetch("/api/solicitud-credito", { method: "POST", body });
```

Acá el navegador manda ese paquete por internet hacia el servidor. Como es
una ruta relativa (`/api/solicitud-credito`, sin `https://...`), el
navegador la manda al mismo dominio donde está corriendo la app — en local,
`http://localhost:3000/api/solicitud-credito`; en producción, el dominio real
de Vercel.

### Paso 5 — Next.js recibe la petición y sabe exactamente qué correr

Como se explicó en la sección 1, `/api/solicitud-credito` coincide con la
carpeta `src/app/api/solicitud-credito/`, así que Next.js ejecuta la función
`POST` que está exportada en `route.ts`. Acá termina la parte de "cliente" y
empieza la parte de "servidor" — es un archivo completamente distinto,
corriendo en una máquina distinta, con acceso a credenciales que el
navegador nunca tuvo.

### Paso 6 — Dentro de `route.ts`, todo corre en este orden

1. **Rate limit**: si esa misma IP ya mandó 3 solicitudes en los últimos 10
   minutos, se corta ahí mismo con un error 429 — ni siquiera se lee el resto
   de la petición.
2. **Lee el `FormData`** que mandó el navegador (`request.formData()`).
3. **Honeypot**: si el campo trampa `website` viene lleno, responde "éxito"
   falso sin procesar nada (es casi seguro un bot).
4. **Parsea el JSON** que viene en el campo `"data"`.
5. **Valida en el servidor** (nombre, correo, RUC, aceptación de
   condiciones, etc.) — esta es la validación que de verdad importa; la del
   navegador (paso 3 más arriba) es solo para que la experiencia de usuario
   sea más agradable, un atacante podría saltársela fácilmente.
6. **Sube cada archivo** al bucket privado de Supabase Storage.
7. **Guarda la solicitud** en la tabla `solicitudes_credito` — **acá es
   exactamente el momento en que "se guarda en la base de datos"**.
8. **Guarda la metadata de cada documento** en la tabla `documentos_credito`
   (nombre del archivo, tipo de documento, tamaño, etc.).
9. **Dispara el webhook de n8n** — un segundo `fetch`, esta vez del servidor
   hacia n8n, que arma y manda el correo de notificación interno con los
   archivos reales adjuntos. Este paso es "fire-and-forget": no se espera a
   que termine, así el usuario no tiene que quedarse esperando por un correo
   que es solo informativo.
10. **Responde al navegador** con `{ ok: true, numeroSolicitud }`.

### Paso 7 — El navegador recibe la respuesta

De vuelta en `CreditRequestForm2.tsx`, el `await fetch(...)` termina y se
lee la respuesta. Si `ok: true`, se muestra la pantalla de éxito
(`SuccessScreen`) con el número de solicitud. Si algo falló, se muestra un
mensaje de error en su lugar.

## 4. Resumen en una sola frase

El usuario llena datos que solo existen en su navegador → al enviar, todo se
empaqueta en un `FormData` → un `fetch POST` lo manda a
`/api/solicitud-credito` → Next.js, por convención de carpetas (no por
configuración manual), sabe que eso corresponde a `route.ts` y ejecuta esa
función en el servidor → ahí (y solo ahí) se valida de verdad, se sube todo a
Supabase, se guarda en la base de datos, y se dispara el aviso a n8n para el
correo con adjuntos → el servidor responde, y el navegador muestra el
resultado.

## 5. Notas para no confundirse

- **La validación del navegador (`validation.ts`) no es seguridad.** Es solo
  para que el usuario no tenga que esperar un viaje de ida y vuelta al
  servidor para saber que le falta un campo. La seguridad real está en
  `route.ts`, porque cualquiera puede saltarse el navegador y mandar una
  petición directa.
- **El guardado en base de datos y el webhook de n8n pasan en la misma
  petición**, uno después del otro (no son cosas separadas que "se activan
  solas") — todo ocurre dentro de la misma función `POST` de `route.ts`,
  mientras el navegador espera la respuesta.
- **Actualmente solo se manda un correo de notificación**, el que arma y
  envía el flujo de n8n (con los adjuntos reales). Antes se mandaban dos —
  se corrigió para que sea uno solo.
