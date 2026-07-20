# CLAUDE.md

Instrucciones de trabajo para este proyecto (Portal de Clientes INDUCOM).

## Verificar antes de alarmar

Antes de reportar una anomalía o inconsistencia como un problema real (ej. "esto
está roto", "esto no coincide con el esquema", "esto va a fallar"), **releer el
estado actual de los archivos involucrados** — no asumir por memoria de la
conversación, por lo visto en una migración SQL, o por contexto de sesiones
anteriores.

**Por qué:** el proyecto avanza rápido y con varias personas/sesiones en
paralelo (incluida esta). Lo que se sabía "antes" puede ya estar corregido por
otra sesión, por el usuario, o por un compañero de equipo. Ya pasó una vez:
se reportó el portal del cliente como "roto" tras leer una migración que
renombraba `empresas` → `clientes`, sin releer primero `src/lib/portal/queries.ts`
— que ya estaba actualizado. Falsa alarma evitable con una lectura previa.

**Cómo aplicarlo:** antes de decir que algo está roto o desactualizado, leer el
archivo real involucrado (no solo la migración/esquema que lo motivó) y
confirmar el problema contra ese contenido actual. Si hace falta, verificar
también contra la base de datos real (solo lectura, vía API con la
`service_role` key, sin imprimir credenciales) en vez de inferir desde el
código de las migraciones.
