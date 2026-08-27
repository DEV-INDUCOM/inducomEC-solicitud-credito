-- ============================================================================
-- `pagos`: nombres explícitos para los dos importes
-- ============================================================================
--   monto            -> monto_pagado     (lo que el cliente pagó realmente)
--   cotizacion_total -> monto_cotizado   (lo que valía la cotización)
--
-- Se RENOMBRA, no se crea columna nueva + drop de la vieja:
--
--   - `monto` ya ES el monto pagado, solo tenía el nombre genérico. Tiene
--     TODOS los datos históricos (pagos manuales y PayPal). Borrarla los
--     perdería.
--   - `saldo_por_cliente` y `admin_resumen_clientes` hacen `sum(monto)`.
--     Un `drop column monto` fallaría con "cannot drop because other objects
--     depend on it". Un RENAME, en cambio, Postgres lo propaga solo a las
--     vistas (referencian la columna por attnum, no por nombre).
--
-- La columna `monto_pagado` que se había agregado a mano queda vacía y
-- duplicada: se elimina antes de renombrar para liberar el nombre.
-- ============================================================================

-- 1. Fuera la columna vacía que duplicaba a `monto` (0 filas con dato).
alter table public.pagos drop column if exists monto_pagado;

-- 2. Renombres. Los datos y las vistas viajan solos.
alter table public.pagos rename column monto to monto_pagado;
alter table public.pagos rename column cotizacion_total to monto_cotizado;

comment on column public.pagos.monto_pagado is
  'Importe efectivamente pagado. Es lo que suma el saldo del portal.';
comment on column public.pagos.monto_cotizado is
  'Importe de la cotización. Snapshot de la versión efectivamente pagada; puede diferir de monto_pagado.';


-- ============================================================================
-- RPC: registrar_pago_paypal apunta a los nombres nuevos
-- ============================================================================
-- Los NOMBRES DE PARÁMETRO no cambian (`p_monto`, `p_cotizacion_total`): W4
-- llama por nombre vía PostgREST, así que dejarlos igual evita tener que
-- tocar el nodo de n8n. Solo cambian las columnas destino del insert.
--
-- Misma aridad que la versión anterior (12 args), así que `create or replace`
-- alcanza: no hace falta drop previo.

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
    cliente_id, monto_pagado, fecha, origen, metodo_pago, referencia,
    cotizacion_numero, deal_nombre, monto_cotizado, cotizacion_url
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

notify pgrst, 'reload schema';


-- ============================================================================
-- Verificación (correr después)
-- ============================================================================
-- Los importes deben seguir intactos y el saldo dar igual que antes
-- (23.53 y 158.00 al momento de escribir esto):
--
--   select origen, monto_pagado, monto_cotizado from public.pagos order by fecha desc;
--   select * from public.saldo_por_cliente;
