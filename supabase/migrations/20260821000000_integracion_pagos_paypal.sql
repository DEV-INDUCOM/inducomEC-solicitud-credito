-- ============================================================================
-- Integración PORTAL <- PAGOS PAYPAL
-- Prepara el esquema `public` (portal) para recibir pagos automáticos desde
-- el webhook handler de PayPal (n8n, nodo W4). Mismo proyecto de Supabase que
-- el esquema `payments`, distinto esquema.
--
-- Contrato acordado con el proyecto de payments: UNA sola RPC, llamable con
-- service_role, que resuelve cliente + pago + código de invitación en una
-- llamada y le dice a n8n exactamente qué correo mandar.
-- ============================================================================


-- ============================================================================
-- 1. `clientes`: deduplicación por identificación (RUC)
-- ============================================================================
-- Es la clave con la que el webhook busca la empresa que pagó. Sin esto,
-- cada pago de un cliente existente crearía un duplicado. Índice parcial:
-- permite varios NULL/'' teóricos, pero impide dos filas con el mismo RUC
-- no vacío. (identificacion es NOT NULL en la tabla, pero nada impide '' hoy.)

create unique index if not exists uq_clientes_identificacion
  on public.clientes (btrim(identificacion))
  where identificacion is not null and btrim(identificacion) <> '';


-- ============================================================================
-- 2. `pagos`: acepta origen automático 'paypal'
-- ============================================================================

-- 2.1 origen
alter table public.pagos drop constraint if exists pagos_origen_check;
alter table public.pagos add constraint pagos_origen_check
  check (origen = any (array['manual'::text, 'csv'::text, 'paypal'::text]));

-- 2.2 metodo_pago
alter table public.pagos drop constraint if exists pagos_metodo_pago_check;
alter table public.pagos add constraint pagos_metodo_pago_check
  check (metodo_pago = any (array[
    'transferencia'::text, 'tarjeta'::text, 'efectivo'::text,
    'cheque'::text, 'ventanilla'::text, 'otro'::text, 'paypal'::text
  ]));

-- 2.3 Idempotencia: el mismo capture de PayPal no puede entrar dos veces.
--     `referencia` guarda el paypal_capture_id. Parcial y solo para origen
--     'paypal': los pagos manuales/csv sí pueden repetir referencia hoy.
create unique index if not exists uq_pagos_referencia_paypal
  on public.pagos (referencia)
  where origen = 'paypal' and referencia is not null;

-- `registrado_por` ya es nullable desde 20260717000000_panel_admin.sql
-- (un pago automático no lo registra una persona). No requiere ALTER.


-- ============================================================================
-- 3. RPC: registrar_pago_paypal
-- ============================================================================
-- Encapsula en UNA llamada lo que W4 necesita, en vez de encadenar nodos
-- con condicionales en n8n:
--   1. Si el capture_id ya se procesó (reintento de webhook de PayPal),
--      no repite nada: ni pago, ni cliente, ni código, ni correo.
--   2. Resuelve el cliente por RUC o lo crea (siempre 'juridica': todo pago
--      de PayPal viene de una Company de HubSpot).
--   3. Registra el pago.
--   4. Si el cliente ya tiene cuenta en el portal (fila en `perfiles`), no
--      genera código — mandarle uno sería inútil, `consumir_codigo_invitacion`
--      lo rechazaría igual.
--   5. Si no tiene cuenta, genera código de invitación.
--
-- No reutiliza `crear_cliente_manual` ni `generar_codigo_invitacion`: ambas
-- exigen `es_personal_interno_activo()`, que depende de `auth.uid()`. Desde
-- n8n con la service_role key, `auth.uid()` es NULL y esas funciones siempre
-- fallarían con 'no_autorizado'. `security definer` no lo evita: cambia los
-- permisos de ejecución, no la sesión.
--
-- El formato de código replica exacto el de `generar_codigo_invitacion`
-- (20260718000000_generar_codigo_mejoras.sql): 'IND-{pais}-{YYMM}-{8 hex}'.
--
-- Clientes archivados (`activo = false`): sin tratamiento especial. HubSpot
-- no deja cotizar a una empresa archivada, así que ese caso no se origina
-- en este flujo — decisión ya tomada con el otro proyecto.
--
-- Devuelve:
--   cliente_id      -> null si pago_duplicado, si no siempre
--   es_nuevo        -> true si el cliente se acaba de crear
--   ya_registrado   -> true si ya tiene fila en `perfiles` (no mandar código)
--   pago_duplicado  -> true si este capture_id ya se había procesado
--   codigo          -> código de invitación, o null si ya_registrado/duplicado
--   fecha_venc      -> vencimiento del código, o null
--   cliente_nombre  -> para el correo
--   cliente_email   -> para el correo
-- ============================================================================

create or replace function public.registrar_pago_paypal(
  p_identificacion text,
  p_nombre         text,
  p_email          text,
  p_monto          numeric,
  p_capture_id     text,
  p_fecha          timestamptz,
  p_dias_validez   integer default 30
) returns table (
  cliente_id      uuid,
  es_nuevo        boolean,
  ya_registrado   boolean,
  pago_duplicado  boolean,
  codigo          text,
  fecha_venc      timestamptz,
  cliente_nombre  text,
  cliente_email   text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_cliente      public.clientes;
  v_es_nuevo     boolean := false;
  v_tiene_perfil boolean;
  v_codigo       text;
  v_venc         timestamptz;
  v_pais_id      smallint;
  v_pais_codigo  text;
  v_intento      integer;
begin
  if p_identificacion is null or btrim(p_identificacion) = '' then
    raise exception 'IDENTIFICACION_REQUERIDA';
  end if;

  if p_capture_id is null or btrim(p_capture_id) = '' then
    raise exception 'CAPTURE_ID_REQUERIDO';
  end if;

  -- Idempotencia primero, antes de tocar clientes/pagos: PayPal reintenta
  -- el webhook si no recibe 200 a tiempo, y un reintento no debe generar
  -- un segundo código ni un segundo correo.
  if exists (
    select 1 from public.pagos
     where origen = 'paypal' and referencia = btrim(p_capture_id)
  ) then
    return query select
      null::uuid, false, false, true,
      null::text, null::timestamptz, null::text, null::text;
    return;
  end if;

  select id into v_pais_id from public.paises where codigo = 'EC';

  -- Resolver o crear cliente por RUC. Reintenta ante unique_violation:
  -- dos webhooks del mismo RUC nuevo en paralelo no deben abortar, el que
  -- pierde la carrera simplemente vuelve a buscar y encuentra al ganador.
  <<resolver_cliente>>
  loop
    select * into v_cliente
      from public.clientes
     where btrim(identificacion) = btrim(p_identificacion)
     limit 1;

    if v_cliente.id is not null then
      exit resolver_cliente;
    end if;

    begin
      v_es_nuevo := true;

      insert into public.clientes (tipo_cliente, pais_id, nombre_visible, email, identificacion)
      values ('juridica', v_pais_id, btrim(p_nombre), btrim(p_email), btrim(p_identificacion))
      returning * into v_cliente;

      -- HubSpot no entrega representante legal (NOT NULL en `empresas`);
      -- el panel admin lo corrige después, ya existe esa UI de edición.
      insert into public.empresas (cliente_id, representante_legal)
      values (v_cliente.id, '(por confirmar)');

      exit resolver_cliente;
    exception when unique_violation then
      v_es_nuevo := false;
    end;
  end loop;

  -- Registrar el pago.
  insert into public.pagos (cliente_id, monto, fecha, origen, metodo_pago, referencia)
  values (v_cliente.id, p_monto, p_fecha, 'paypal', 'paypal', btrim(p_capture_id));

  -- ¿Ya tiene cuenta en el portal?
  select exists (
    select 1 from public.perfiles where cliente_id = v_cliente.id
  ) into v_tiene_perfil;

  if v_tiene_perfil then
    return query select v_cliente.id, v_es_nuevo, true, false,
                        null::text, null::timestamptz,
                        v_cliente.nombre_visible, v_cliente.email;
    return;
  end if;

  -- Generar código de invitación, mismo formato y misma lógica de reintento
  -- que `generar_codigo_invitacion` (no se reusa esa función, ver nota arriba).
  select p.codigo into v_pais_codigo
    from public.clientes c
    join public.paises p on p.id = c.pais_id
   where c.id = v_cliente.id;

  for v_intento in 1..5 loop
    begin
      v_codigo :=
        'IND-' ||
        v_pais_codigo ||
        '-' ||
        to_char(now(), 'YYMM') ||
        '-' ||
        substring(upper(replace(gen_random_uuid()::text, '-', '')) from 1 for 8);

      insert into public.codigos_invitacion (codigo, cliente_id, fecha_vencimiento)
      values (v_codigo, v_cliente.id, now() + make_interval(days => p_dias_validez))
      returning fecha_vencimiento into v_venc;

      exit;
    exception when unique_violation then
      v_codigo := null;
    end;
  end loop;

  if v_codigo is null then
    raise exception 'no_se_pudo_generar_codigo';
  end if;

  return query select v_cliente.id, v_es_nuevo, false, false,
                      v_codigo, v_venc,
                      v_cliente.nombre_visible, v_cliente.email;
end $$;

-- Solo service_role (n8n) debe poder llamarla: Postgres da EXECUTE a PUBLIC
-- por defecto y PostgREST expone toda función de `public` en /rest/v1/rpc/,
-- alcanzable con la anon key del navegador. Sin este revoke, cualquiera
-- podría acuñar clientes y códigos de invitación válidos.
revoke all on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, integer) from public;
revoke all on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, integer) from anon;
revoke all on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, integer) from authenticated;
grant execute on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, integer) to service_role;

comment on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, integer) is
  'Resuelve/crea cliente, registra pago y genera código de invitación para un pago confirmado de PayPal. Solo service_role. Idempotente por paypal_capture_id.';

notify pgrst, 'reload schema';
