-- ============================================================================
-- LIMPIEZA DE DATA DEMO / DE PRUEBA
-- ============================================================================
-- Borra las filas de prueba que quedaron del historial del SQL Editor (empresas
-- "Demo", perfiles @cliente.com, pagos PAGO-DEMO, códigos de prueba, etc.).
--
-- NO es una migración: es un script de un solo uso. Correr en el SQL Editor de
-- Supabase con service_role.
--
-- ⚠️  DESTRUCTIVO. Correr PRIMERO la PARTE 1 (solo SELECT) y revisar que lo que
--     lista sea SOLO data de prueba. Recién entonces correr la PARTE 2.
--
-- Marcadores de "demo" usados para identificar la basura:
--   - empresas.nombre         ILIKE '%demo%'
--   - perfiles.email          LIKE  '%@cliente.com'
--   - solicitudes.email_...   LIKE  '%@cliente.com'
--   - pagos / codigos: se borran por su empresa demo (más seguro que por patrón
--     de texto, porque un código real de julio 2026 también sería IND-EC-2607-*).
-- ============================================================================


-- ============================================================================
-- PARTE 1 — REVISIÓN (correr esto solo, primero, y leer los resultados)
-- ============================================================================

select 'empresas demo' as que, id::text, nombre       from public.empresas             where nombre ilike '%demo%'
union all
select 'perfiles demo',        id::text, email         from public.perfiles             where email like '%@cliente.com'
union all
select 'solicitudes demo',     id::text, email_solicitante from public.solicitudes_credito where email_solicitante like '%@cliente.com'
union all
select 'pagos demo',           id::text, referencia    from public.pagos                where empresa_id in (select id from public.empresas where nombre ilike '%demo%')
union all
select 'codigos demo',         id::text, codigo         from public.codigos_invitacion   where empresa_id in (select id from public.empresas where nombre ilike '%demo%')
order by que;


-- ============================================================================
-- PARTE 2 — BORRADO (correr solo después de revisar la PARTE 1)
-- ----------------------------------------------------------------------------
-- Va en una transacción y en orden de foreign keys (hijos antes que padres).
-- Si algo no cuadra, cambiar `commit` por `rollback` al final.
-- ============================================================================
begin;

-- Hijos de "empresas" (pagos, incentivos, códigos)
delete from public.pagos
 where empresa_id in (select id from public.empresas where nombre ilike '%demo%');

delete from public.incentivos_empresa
 where empresa_id in (select id from public.empresas where nombre ilike '%demo%');

delete from public.codigos_invitacion
 where empresa_id in (select id from public.empresas where nombre ilike '%demo%');

-- Hijos de "solicitudes" (documentos), luego las solicitudes demo
delete from public.documentos_credito
 where solicitud_id in (
   select id from public.solicitudes_credito
    where email_solicitante like '%@cliente.com'
       or nombre_empresa ilike '%demo%'
 );

delete from public.solicitudes_credito
 where email_solicitante like '%@cliente.com'
    or nombre_empresa ilike '%demo%'
    or empresa_id in (select id from public.empresas where nombre ilike '%demo%');

-- Perfiles demo (deben irse antes que sus empresas)
delete from public.perfiles
 where email like '%@cliente.com';

-- Empresas demo (al final, ya sin hijos)
delete from public.empresas
 where nombre ilike '%demo%';

-- Cuentas de login de prueba. Los perfiles ya se borraron arriba; esto quita el
-- usuario de Auth para no dejar cuentas huérfanas. Quitar si se quieren conservar.
delete from auth.users
 where email like '%@cliente.com';

commit;


-- ============================================================================
-- PARTE 3 — ARCHIVOS EN STORAGE (manual)
-- ----------------------------------------------------------------------------
-- Los adjuntos demo subidos al bucket privado 'documentos-credito' NO se borran
-- desde SQL de forma fiable. Revisar el bucket en el dashboard
-- (Storage → documentos-credito) y borrar a mano las carpetas de las solicitudes
-- demo que ya no existan en la tabla.
-- ============================================================================
