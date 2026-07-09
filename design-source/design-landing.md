# Guía de Diseño — Landing pública · Portal de Clientes INDUCOM

> **Fuente de verdad de los valores:** `design-tokens.css`. Este documento describe *cómo* la landing usa esos tokens; no redefine colores, tamaños ni espaciados. Si un valor cambia, se cambia allá.
>
> **Superficie:** activar `data-surface="landing"` en el layout de las rutas públicas para que la acción primaria sea roja (ver token `--action-primary`).

---

## 1. Qué es esta superficie

Las páginas **públicas, sin login**: landing, pantalla de login, pantalla de registro con código y — la más importante — el **formulario de solicitud de crédito**, que aplica también a personas que aún no son clientes.

Regla dura del proyecto que la landing debe respetar visualmente: **la solicitud de crédito nunca vive detrás del login.** El CTA principal ("Solicitar crédito") lleva directo al formulario público, no a una pantalla de acceso.

## 2. Principio rector

**La landing vende.** Su trabajo es transmitir que INDUCOM es un aliado industrial serio y hacer que el visitante actúe (solicitar crédito o iniciar sesión). Por eso, a diferencia del portal, aquí:

- El **rojo INDUCOM tiene protagonismo**: es el color de los CTAs grandes y los acentos de marca. La landing no tiene estados de error compitiendo por el rojo, así que puede respirar.
- La **jerarquía es amplia y contrastada**: títulos grandes en Sora, mucho aire entre secciones, imágenes de equipos.
- El **acero (`--ink`)** aporta el peso serio: se usa en texto fuerte, footer y fondos de sección oscuros cuando se busca contraste.

Contraste con el portal: si el portal es una herramienta de trabajo, la landing es la vitrina.

## 3. Color

| Uso | Token | Notas |
|---|---|---|
| CTA primario ("Solicitar crédito") | `--action-primary` (= rojo en landing) | Botón sólido rojo, texto blanco |
| CTA secundario ("Iniciar sesión") | contorno `--ink-800` sobre blanco | Menos peso que el primario |
| Acentos, subrayados, íconos de marca | `--accent` | Con moderación; el rojo pierde fuerza si se abusa |
| Texto principal | `--text-primary` | |
| Texto secundario / párrafos de apoyo | `--text-secondary` | |
| Fondos de sección | `--bg-surface` (blanco) alternando con `--slate-50` / `--slate-100` | Bandas para separar secciones |
| Sección oscura de contraste (p. ej. franja de credenciales o footer) | `--ink-900` con texto `--text-on-dark` | Uno o dos bloques como mucho |

**No usar** los colores de estado (`--state-*`) en la landing. Esos pertenecen al portal; aquí no significan nada y ensucian la marca.

## 4. Tipografía

- **Hero y headings de sección:** `--font-display` (Sora) `--weight-semibold`. Tamaños `--text-5xl` (hero) y `--text-4xl` (secciones).
- **Subtítulo del hero / intro:** `--font-sans` o Sora `--weight-medium`, `--text-lg`.
- **Cuerpo:** `--font-sans` (Inter) `--text-base`/`--text-lg`, `--leading-normal`. En landing el cuerpo puede ir a 16–18px porque hay espacio; no es UI densa.
- **Botones y etiquetas:** Inter `--weight-medium`.
- **Mono** (`--font-mono`) casi no aparece aquí. Solo si se muestra un ejemplo de código de invitación en la explicación de "cómo funciona".

Sentence case en todo. Nada de MAYÚSCULAS sostenidas ni Title Case forzado.

## 5. Espaciado y ritmo

- Separación **generosa entre secciones**: `--space-20` (80px) o más en desktop, `--space-12` en móvil.
- Ancho de contenido cómodo: contenedor centrado ~1120–1200px máx., con padding lateral `--space-6`.
- El aire es parte del mensaje de "empresa seria": no apretar.

## 6. Componentes de la landing

**Navbar público.** Logo INDUCOM a la izquierda; a la derecha "Iniciar sesión" (secundario) y "Solicitar crédito" (primario rojo). Fijo o sticky opcional.

**Hero.** Título Sora grande + subtítulo + CTA primario rojo. Imagen o fondo industrial a un lado o detrás con overlay `--ink-900` para asegurar contraste del texto.

**Secciones de valor.** Tarjetas o bloques con ícono (Tabler outline), título corto y descripción. Bordes `--border`, radio `--radius-lg`, sombra `--shadow-md` opcional al elevar.

**Bloque "¿Cómo obtengo acceso?"** Explica el modelo real: se solicita crédito → INDUCOM revisa → si aprueba, entrega un **código de invitación** para registrarse. Es importante para gestionar expectativas: nadie crea cuenta libremente.

**FAQ (preguntas frecuentes).** Sección de acordeón que resuelve las dudas típicas antes del CTA final. Su función principal aquí es **gestionar expectativas**: el modelo de acceso cerrado por código y el hecho de que la solicitud de crédito sea pública no son obvios para el visitante, y explicarlos reduce solicitudes mal dirigidas y confusión.

*Diseño del componente:*
- Contenedor centrado, ancho legible (~720–820px), fondo `--bg-surface` o `--slate-50`.
- Cada ítem es una fila de acordeón: pregunta en Inter `--weight-medium` `--text-base`/`--text-lg`, respuesta en `--text-secondary` `--leading-normal`. Separador `--border` entre ítems, `--radius` en la fila activa.
- Ícono de expandir/colapsar a la derecha (Tabler `chevron-down`, que rota al abrir). Estado abierto opcionalmente con un acento sutil `--accent` en el borde o el ícono; sin bloques rojos.
- Primer ítem abierto por defecto; el resto colapsado. Un ítem abierto a la vez o varios, según se prefiera.
- Accesible: cada pregunta es un `<button>` con `aria-expanded`; la respuesta se asocia con `aria-controls`. Navegable por teclado y con foco visible (`--focus-ring`). El contenido colapsado no debe quedar oculto a lectores de pantalla de forma que impida indexarlo.

*Contenido sugerido (derivado de las reglas del proyecto; ajustar el texto con INDUCOM):*
- **¿Cómo obtengo una cuenta?** No se crean cuentas libremente. Primero se solicita crédito; si INDUCOM aprueba, se entrega un código de invitación de un solo uso para registrarse.
- **¿Necesito ser cliente para solicitar crédito?** No. La solicitud de crédito es pública y aplica también a quienes aún no son clientes.
- **¿Qué es el código de invitación?** Es un código personal, de un solo uso, que entrega INDUCOM. Con él se crea la cuenta y queda asociada a la empresa correspondiente.
- **Mi código no funciona, ¿qué hago?** Un código puede haber vencido o ya haber sido utilizado. Contactar a INDUCOM para gestionar uno nuevo. *(En el copy público, mantener el mensaje genérico; no detallar en qué falló.)*
- **¿Pueden tener cuenta varias personas de la misma empresa?** Cada persona requiere su propio código de invitación. La política específica la define INDUCOM.
- **¿Qué datos pide la solicitud de crédito y cómo se protegen?** Datos como identificación e ingresos, con documentos de respaldo. Se tratan conforme a la política de privacidad y la normativa de protección de datos aplicable (EC/BO/PE/CO). Enlazar a la política.
- **¿El saldo y los pagos se ven en tiempo real?** No en esta fase: la información de pagos se actualiza cuando INDUCOM la carga. *(No prometer tiempo real.)*

**CTA de cierre.** Franja ancha (puede ser `--ink-900` con texto blanco) repitiendo "Solicitar crédito".

**Footer.** Fondo `--ink-900`, texto `--text-on-dark`/`--slate-300`. Datos de contacto, enlaces legales (importante: política de privacidad — la solicitud recoge datos sensibles y opera en EC/BO/PE/CO).

## 7. Accesibilidad y responsive

- Contraste AA como mínimo. El rojo `--red-600` sobre blanco cumple para texto grande y para botones; el texto blanco sobre `--red-600` también. Verificar cualquier texto pequeño sobre color.
- Todo CTA es un elemento enfocable con `:focus-visible` usando `--focus-ring`. Nunca quitar el outline sin reemplazo.
- Mobile-first: el hero y los CTAs deben funcionar en una columna; los CTAs no se parten ni se encogen por debajo de un área táctil cómoda (~44px de alto).
- Imágenes con `alt` descriptivo.

## 8. Qué NO hacer

- **No** mandar el CTA de crédito al login. Rompe el requisito de que aplica a no-clientes.
- **No** usar los colores de estado del portal como decoración.
- **No** saturar de rojo. El rojo funciona porque es acento sobre una base neutra; si todo es rojo, nada resalta.
- **No** prometer en el copy funciones que el MVP no tiene (pagos en tiempo real, panel de métricas visual, notificaciones automáticas al cliente). Mostrar módulos futuros, si acaso, como "próximamente".
- **No** inventar tokens nuevos aquí. Si falta un valor, se agrega en `design-tokens.css`.
