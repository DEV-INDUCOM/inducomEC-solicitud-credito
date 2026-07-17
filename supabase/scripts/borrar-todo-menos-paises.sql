-- ============================================================================
-- BORRADO TOTAL DE DATOS (excepto el catálogo `paises`)
-- ============================================================================
-- Vacía TODAS las tablas de la aplicación, las cuentas de auth.users creadas
-- por el registro, y los archivos del bucket 'documentos-credito'.
-- Conserva `paises` (EC/BO/PE/CO): es un catálogo fijo, no data de usuarios,
-- y el formulario de crédito no funciona sin él.
--
-- NO es una migración: correr a mano en el SQL Editor con service_role.
--
-- ⚠️  ABSOLUTAMENTE DESTRUCTIVO E IRREVERSIBLE. No hay demo vs. real: esto
--     borra TODO. Correr PRIMERO la PARTE 1 (solo conteo) para confirmar qué
--     se va a perder. Recién entonces correr la PARTE 2.
-- ============================================================================


-- ============================================================================
-- PARTE 1 — REVISIÓN (correr esto solo, primero, y leer los resultados)
-- ============================================================================

select 'empresas'            as tabla, count(*) from public.empresas
union all
select 'perfiles',                     count(*) from public.perfiles
union all
select 'codigos_invitacion',           count(*) from public.codigos_invitacion
union all
select 'solicitudes_credito',          count(*) from public.solicitudes_credito
union all
select 'documentos_credito',           count(*) from public.documentos_credito
union all
select 'pagos',                        count(*) from public.pagos
union all
select 'incentivos_empresa',           count(*) from public.incentivos_empresa
union all
select 'auth.users',                   count(*) from auth.users
union all
select 'storage.objects (bucket)',     count(*) from storage.objects where bucket_id = 'documentos-credito'
order by tabla;


-- ============================================================================
-- PARTE 2 — BORRADO (correr solo después de revisar la PARTE 1)
-- ----------------------------------------------------------------------------
-- En transacción y en orden de foreign keys (hijos antes que padres). Si algo
-- no cuadra, cambiar `commit` por `rollback` al final antes de correrlo.
-- ============================================================================
-- NOTA: los archivos del bucket 'documentos-credito' NO se borran aquí.
-- Supabase bloquea el DELETE directo sobre storage.objects (trigger
-- storage.protect_delete) para no dejar archivos huérfanos en el disco real.
-- Hay que vaciarlo por la Storage API: correr
-- `node supabase/scripts/vaciar-bucket-documentos-credito.mjs` (ver ese
-- archivo), o borrar a mano desde el dashboard (Storage → documentos-credito
-- → seleccionar todo → Delete). Se puede hacer antes o después de esta
-- transacción, es independiente.

begin;

-- Hijos directos de solicitudes_credito
delete from public.documentos_credito;

-- Hijos de empresas
delete from public.pagos;
delete from public.incentivos_empresa;
delete from public.codigos_invitacion;

-- Ahora ya sin hijos: solicitudes, perfiles, empresas
delete from public.solicitudes_credito;
delete from public.perfiles;
delete from public.empresas;

-- Cuentas de Auth creadas por el registro (perfiles ya se borró arriba,
-- así que esto no deja perfiles huérfanos).
delete from auth.users;

commit;


-- ============================================================================
-- PARTE 3 — VERIFICACIÓN (opcional, correr después del commit)
-- ----------------------------------------------------------------------------
-- Todo debe dar 0, excepto 'paises' que debe seguir en 4 (EC/BO/PE/CO).
-- ============================================================================

select 'empresas'            as tabla, count(*) from public.empresas
union all
select 'perfiles',                     count(*) from public.perfiles
union all
select 'codigos_invitacion',           count(*) from public.codigos_invitacion
union all
select 'solicitudes_credito',          count(*) from public.solicitudes_credito
union all
select 'documentos_credito',           count(*) from public.documentos_credito
union all
select 'pagos',                        count(*) from public.pagos
union all
select 'incentivos_empresa',           count(*) from public.incentivos_empresa
union all
select 'auth.users',                   count(*) from auth.users
union all
select 'storage.objects (bucket)',     count(*) from storage.objects where bucket_id = 'documentos-credito'
union all
select 'paises (debe ser 4)',          count(*) from public.paises
order by tabla;
