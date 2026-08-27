-- ============================================================================
-- Pagos PayPal: link a la cotización, sin el Deal de HubSpot
-- ============================================================================
-- Ajuste sobre 20260825000000_pagos_datos_cotizacion.sql. El historial pasa a
-- mostrar exactamente seis columnas:
--
--   Fecha | Empresa | Negocio | N.º de cotización | Cotización | Monto cotizado
--
-- Cambios respecto a la migración anterior:
--   - `deal_url` se elimina: el link que interesa es el de la cotización
--     pública (https://cotizaciones.grupo-inducom.com/<token>), que el
--     cliente sí puede abrir, no el Deal interno de HubSpot.
--   - `cotizacion_subtotal` se elimina: la tabla muestra un solo importe
--     ("Monto cotizado" = `cotizacion_total`), no subtotal + total.
--
-- Ninguna de las dos columnas llegó a tener datos (W4 todavía no las
-- enviaba), así que el drop no pierde nada.
-- ============================================================================


-- ============================================================================
-- 1. Columnas
-- ============================================================================

alter table public.pagos
  add column if not exists cotizacion_url text;

alter table public.pagos
  drop column if exists deal_url,
  drop column if exists cotizacion_subtotal;

comment on column public.pagos.cotizacion_url is
  'Link público a la cotización (https://cotizaciones.grupo-inducom.com/<token>). Visible para el cliente.';
comment on column public.pagos.cotizacion_total is
  'Monto cotizado. Snapshot de la versión efectivamente pagada.';


-- ============================================================================
-- 2. RPC: registrar_pago_paypal
-- ============================================================================
-- Cambia la aridad otra vez (13 -> 12 parámetros), así que hay que DROP la
-- versión anterior: un `create or replace` con distinta cantidad de
-- argumentos crea una sobrecarga en vez de reemplazar.

drop function if exists public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, text, integer, text, text, numeric, numeric, text);

create or replace function public.registrar_pago_paypal(
  p_identificacion    text,
  p_nombre            text,
  p_email             text,
  p_monto             numeric,
  p_capture_id        text,
  p_fecha             timestamptz,
  p_pais_codigo       text    default 'EC',
  p_dias_validez      integer default 30,
  p_cotizacion_numero text    default null,
  p_deal_nombre       text    default null,
  p_cotizacion_total  numeric default null,
  p_cotizacion_url    text    default null
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
#variable_conflict use_column
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

  -- País del cliente nuevo. Viene de `meta.country` en el snapshot de la
  -- cotización; 'EC' solo como red de seguridad si el metadata viene vacío.
  select id into v_pais_id
    from public.paises
   where codigo = upper(btrim(p_pais_codigo));

  if v_pais_id is null then
    raise exception 'PAIS_NO_VALIDO: %', p_pais_codigo;
  end if;

  -- Resolver o crear cliente por RUC. Reintenta ante unique_violation:
  -- dos webhooks del mismo RUC nuevo en paralelo no deben abortar; el que
  -- pierde la carrera vuelve a buscar y encuentra al ganador.
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

  -- Registrar el pago, con el snapshot de la cotización que lo originó.
  insert into public.pagos (
    cliente_id, monto, fecha, origen, metodo_pago, referencia,
    cotizacion_numero, deal_nombre, cotizacion_total, cotizacion_url
  )
  values (
    v_cliente.id, p_monto, p_fecha, 'paypal', 'paypal', btrim(p_capture_id),
    nullif(btrim(p_cotizacion_numero), ''), nullif(btrim(p_deal_nombre), ''),
    p_cotizacion_total, nullif(btrim(p_cotizacion_url), '')
  );

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

  -- Código de invitación: mismo formato y misma lógica de reintento que
  -- `generar_codigo_invitacion`. El prefijo de país sale de la fila del
  -- cliente, así un cliente ya existente conserva SU país, no el del pago.
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
revoke all on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, text, integer, text, text, numeric, text) from public;
revoke all on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, text, integer, text, text, numeric, text) from anon;
revoke all on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, text, integer, text, text, numeric, text) from authenticated;
grant execute on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, text, integer, text, text, numeric, text) to service_role;

comment on function public.registrar_pago_paypal(text, text, text, numeric, text, timestamptz, text, integer, text, text, numeric, text) is
  'Resuelve/crea cliente, registra pago (con snapshot de la cotización) y genera código de invitación para un pago confirmado de PayPal. Solo service_role. Idempotente por paypal_capture_id.';

notify pgrst, 'reload schema';
