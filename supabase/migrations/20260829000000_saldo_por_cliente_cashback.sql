-- ============================================================================
-- saldo_por_cliente: agrega saldo_cashback
-- ============================================================================
-- `saldo` se deja intacto (getSaldo() en src/lib/portal/queries.ts todavía
-- lo lee) y se agrega una columna nueva al FINAL del select (create or
-- replace view no permite insertar una columna en el medio de una vista
-- existente, solo agregar al final — ya nos pasó una vez con
-- admin_resumen_clientes en 20260811000000_archivar_clientes.sql):
--
--   - saldo_cashback: saldo * 0.01, calculado en la base en vez de en
--     TypeScript (src/lib/portal/incentivos.ts). Ojo: esta columna NO sabe
--     si el cliente tiene el incentivo cashback_1 asignado — siempre trae
--     el 1%, sea cual sea el incentivo activo. El cashback ahora se
--     muestra siempre (decisión de negocio confirmada), así que ya no hace
--     falta esa distinción en el código.
--
-- OJO: el texto de la vista original decía `sum(monto)`, pero esa columna
-- ya no existe — se renombró a `monto_pagado` en
-- 20260827000000_renombrar_montos_pagos.sql. La vista compilada seguía
-- funcionando porque Postgres propaga el rename por attnum, pero un
-- `create or replace view` nuevo necesita el nombre real de la columna.
-- ============================================================================

create or replace view public.saldo_por_cliente
  with (security_invoker = true) as
  select
    cliente_id,
    coalesce(sum(monto_pagado), 0) as saldo,
    coalesce(sum(monto_pagado), 0) * 0.01 as saldo_cashback
  from public.pagos
  group by cliente_id;

notify pgrst, 'reload schema';
