-- ============================================================================
-- BORRADO TOTAL DE DATOS DE CLIENTES (conserva solo acceso del personal interno)
-- ============================================================================
-- Vacía todas las tablas de clientes/solicitudes/pagos y las cuentas de
-- auth.users creadas por registro de clientes. Conserva:
--   - `personal_interno` y sus cuentas de auth.users (login del panel admin)
--   - `paises` (catálogo fijo EC/BO/PE/CO, no es data de usuario)
--
-- NO es una migración: correr a mano en el SQL Editor con service_role.
--
-- ⚠️  ABSOLUTAMENTE DESTRUCTIVO E IRREVERSIBLE. Esto es PRODUCCIÓN.
--     1. Hacer un backup/export de la base antes de correr esto (Supabase
--        dashboard → Database → Backups, o pg_dump).
--     2. Correr PRIMERO la PARTE 1 (solo conteo) y confirmar qué se pierde.
--     3. Recién entonces correr la PARTE 2.
-- ============================================================================


-- ============================================================================
-- PARTE 1 — REVISIÓN (correr esto solo, primero, y leer los resultados)
-- ============================================================================

select 'clientes'              as tabla, count(*) from public.clientes
union all
select 'personas_naturales',            count(*) from public.personas_naturales
union all
select 'empresas',                      count(*) from public.empresas
union all
select 'perfiles',                      count(*) from public.perfiles
union all
select 'codigos_invitacion',            count(*) from public.codigos_invitacion
union all
select 'solicitudes_credito',           count(*) from public.solicitudes_credito
union all
select 'documentos_credito',            count(*) from public.documentos_credito
union all
select 'historial_solicitud',           count(*) from public.historial_solicitud
union all
select 'pagos',                         count(*) from public.pagos
union all
select 'incentivos_cliente',            count(*) from public.incentivos_cliente
union all
select 'auth.users (clientes)',         count(*) from auth.users where id in (select id from public.perfiles)
union all
select 'storage.objects (bucket)',      count(*) from storage.objects where bucket_id = 'documentos-credito'
union all
select '-- se conserva --',             null
union all
select 'personal_interno',              count(*) from public.personal_interno
union all
select 'paises',                        count(*) from public.paises
order by tabla;


-- ============================================================================
-- PARTE 2 — BORRADO (correr solo después de revisar la PARTE 1)
-- ----------------------------------------------------------------------------
-- En transacción y en orden de foreign keys (hijos antes que padres). Si algo
-- no cuadra, cambiar `commit` por `rollback` al final antes de correrlo.
-- ============================================================================
-- NOTA: los archivos del bucket 'documentos-credito' NO se borran aquí.
-- Supabase bloquea el DELETE directo sobre storage.objects (trigger
-- storage.protect_delete). Vaciarlo por la Storage API: correr
-- `node supabase/scripts/vaciar-bucket-documentos-credito.mjs`, o borrar a
-- mano desde el dashboard (Storage → documentos-credito → seleccionar todo →
-- Delete). Se puede hacer antes o después de esta transacción.

begin;

-- Hijos de solicitudes_credito (historial_solicitud cae también por cascade,
-- pero se borra explícito para dejar el orden claro)
delete from public.historial_solicitud;
delete from public.documentos_credito;

-- Hijos de clientes
delete from public.pagos;
delete from public.incentivos_cliente;
delete from public.codigos_invitacion;
delete from public.solicitudes_credito;
delete from public.perfiles;
delete from public.personas_naturales;
delete from public.empresas;

-- Hub de clientes
delete from public.clientes;

-- Cuentas de Auth de clientes únicamente. Excluye explícitamente las de
-- personal_interno para no arrastrarlas por el ON DELETE CASCADE de
-- personal_interno.id -> auth.users.id.
delete from auth.users
where id not in (select id from public.personal_interno);

commit;


-- ============================================================================
-- PARTE 3 — VERIFICACIÓN (opcional, correr después del commit)
-- ----------------------------------------------------------------------------
-- Todo debe dar 0, excepto 'personal_interno' y 'paises' que deben seguir igual.
-- ============================================================================

select 'clientes'              as tabla, count(*) from public.clientes
union all
select 'personas_naturales',            count(*) from public.personas_naturales
union all
select 'empresas',                      count(*) from public.empresas
union all
select 'perfiles',                      count(*) from public.perfiles
union all
select 'codigos_invitacion',            count(*) from public.codigos_invitacion
union all
select 'solicitudes_credito',           count(*) from public.solicitudes_credito
union all
select 'documentos_credito',            count(*) from public.documentos_credito
union all
select 'historial_solicitud',           count(*) from public.historial_solicitud
union all
select 'pagos',                         count(*) from public.pagos
union all
select 'incentivos_cliente',            count(*) from public.incentivos_cliente
union all
select 'auth.users (total)',            count(*) from auth.users
union all
select 'storage.objects (bucket)',      count(*) from storage.objects where bucket_id = 'documentos-credito'
union all
select '-- debe seguir igual --',       null
union all
select 'personal_interno',              count(*) from public.personal_interno
union all
select 'paises',                        count(*) from public.paises
order by tabla;
