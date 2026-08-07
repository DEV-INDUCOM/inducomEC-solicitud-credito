-- ============================================================================
-- Archivar clientes (soft delete) desde el panel admin.
-- ============================================================================
-- En vez de borrar un cliente (pierde el historial de pagos/solicitudes y
-- obliga a decidir qué hacer con auth.users, perfiles, códigos, etc.), se
-- reutiliza `clientes.activo` (ya existe desde
-- 20260710010000_incentivo_activo_empresa.sql) como archivado/desactivado:
-- reversible, no destruye nada, y el portal YA bloquea el acceso cuando
-- `activo = false` (ver getPortalContext(), src/lib/portal/queries.ts) — sus
-- credenciales dejan de servir sin tocar auth.users.
--
-- El permiso de UPDATE sobre `clientes` para personal interno ya existe
-- (20260807000000_editar_cliente.sql, policy sin restricción de columnas),
-- así que no hace falta ninguna policy nueva — solo falta que el panel
-- pueda VER el estado `activo` de cada cliente en el listado.
-- ============================================================================

-- `activo` va al FINAL del select a propósito: create or replace view
-- matchea columnas por posición y no permite insertar una columna nueva en
-- el medio de una vista existente (solo agregar al final), o falla con
-- "cannot change name of view column ... to ...".
create or replace view public.admin_resumen_clientes
  with (security_invoker = true) as
  select
    c.id as cliente_id,
    c.tipo_cliente,
    c.nombre_visible,
    c.identificacion,
    pa.nombre as pais_nombre,
    (select count(*) from public.perfiles p where p.cliente_id = c.id) as usuarios,
    (select coalesce(sum(pg.monto), 0) from public.pagos pg where pg.cliente_id = c.id) as total_pagos,
    (select max(pg.fecha) from public.pagos pg where pg.cliente_id = c.id) as ultimo_pago,
    ic.tipo as incentivo_tipo,
    c.activo
  from public.clientes c
  join public.paises pa on pa.id = c.pais_id
  left join public.incentivos_cliente ic on ic.cliente_id = c.id;

notify pgrst, 'reload schema';