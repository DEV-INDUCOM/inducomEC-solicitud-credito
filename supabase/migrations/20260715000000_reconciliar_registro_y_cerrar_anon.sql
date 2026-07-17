-- Reconciliación: deja la BD alineada con lo que el código realmente usa.
--
-- El historial del SQL Editor dejó objetos de DOS diseños de registro distintos
-- y varias policies de INSERT abiertas a `anon` que el route ya no necesita
-- (todo se inserta con service_role). Aquí se consolida en un solo diseño.
--
-- Idempotente: se puede correr más de una vez sin romper nada.

-- ============================================================
-- 1. Registro: se conserva el diseño de NAVEGADOR (función de 1 argumento).
--    RegisterForm.tsx:80 -> supabase.rpc("consumir_codigo_invitacion", { p_codigo }).
--    Se re-otorga el permiso por si una migración anterior lo revocó (era la causa
--    probable de que el registro dejara de funcionar).
-- ============================================================
grant execute on function public.consumir_codigo_invitacion(text) to authenticated;

-- Versión de 3 args (diseño backend de Iván): el proyecto no la usa. Se elimina
-- para no dejar dos caminos de registro conviviendo.
drop function if exists public.consumir_codigo_invitacion(text, uuid, text);

-- ============================================================
-- 2. crear_solicitud_credito: RPC de un diseño viejo. El route inserta directo
--    con service_role, así que esta función no se llama desde ningún lado.
-- ============================================================
drop function if exists public.crear_solicitud_credito(text, text, text, text, smallint, boolean, text, jsonb);

-- ============================================================
-- 3. Cerrar las puertas de INSERT abiertas a `anon`.
--    El route sube y guarda todo con service_role (que ignora RLS), así que estas
--    policies no las usa la app. Pero la anon key es PÚBLICA: dejarlas abiertas
--    permite insertar filas y subir archivos al bucket saltándose el rate-limit,
--    la validación y el honeypot del endpoint.
-- ============================================================
drop policy if exists "cualquiera puede crear una solicitud" on public.solicitudes_credito;
revoke insert on public.solicitudes_credito from anon, authenticated;   

drop policy if exists "cualquiera puede adjuntar un documento a su solicitud" on public.documentos_credito;
revoke insert on public.documentos_credito from anon, authenticated;

drop policy if exists "cualquiera puede subir documentos de credito" on storage.objects;

-- PostgREST recarga el cache del esquema tras los cambios.
notify pgrst, 'reload schema';