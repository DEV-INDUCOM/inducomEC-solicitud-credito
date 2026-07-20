-- ============================================================================
-- Mejoras al flujo de "Generar código" del panel admin:
-- 1. Tope de 30 días de validez (antes solo se rechazaba <= 0, sin techo).
-- 2. Columna clientes.activo, mismo patrón que personal_interno.activo.
-- 3. crear_cliente_manual: crea un cliente nuevo (natural o jurídica) a mano
--    desde el panel, sin depender de una solicitud de crédito previa, y de
--    una vez genera su código de invitación.
-- ============================================================================


-- ============================================================================
-- 1. Cliente activo/inactivo — mismo patrón que personal_interno.activo.
-- ============================================================================
-- Un cliente inactivo no debe poder generar sesión útil en el portal: la
-- app (getPortalContext, src/lib/portal/queries.ts) lo revisa y bloquea el
-- acceso con un mensaje explícito, no un error crudo. Esto es la columna;
-- el guard vive en la capa de aplicación, igual que "sin-perfil".

alter table public.clientes
  add column if not exists activo boolean not null default true;


-- ============================================================================
-- 2. Tope de 30 días en generar_codigo_invitacion y aprobar_solicitud_credito
-- ============================================================================
-- Validado también acá (no solo en el input del modal) porque ambas son
-- security definer: alguien con sesión de personal interno podría llamarlas
-- directo y saltarse cualquier límite que solo viva en el formulario.

create or replace function public.generar_codigo_invitacion(
  p_cliente_id uuid,
  p_dias_validez integer default 30
)
returns table (
  codigo_id uuid,
  codigo_generado text,
  cliente_id uuid,
  fecha_vencimiento timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pais_codigo text;
  v_codigo text;
  v_intento integer;
begin
  if not public.es_personal_interno_activo() then
    raise exception 'no_autorizado';
  end if;

  if p_dias_validez is null or p_dias_validez <= 0 or p_dias_validez > 30 then
    raise exception 'dias_validez_invalido';
  end if;

  select p.codigo
  into v_pais_codigo
  from public.clientes c
  join public.paises p on p.id = c.pais_id
  where c.id = p_cliente_id;

  if v_pais_codigo is null then
    raise exception 'cliente_no_existe';
  end if;

  for v_intento in 1..5 loop
    begin
      v_codigo :=
        'IND-' ||
        v_pais_codigo ||
        '-' ||
        to_char(now(), 'YYMM') ||
        '-' ||
        substring(upper(replace(gen_random_uuid()::text, '-', '')) from 1 for 8);

      return query
      with ins as (
        insert into public.codigos_invitacion (
          codigo,
          cliente_id,
          fecha_vencimiento,
          generado_por
        )
        values (
          v_codigo,
          p_cliente_id,
          now() + make_interval(days => p_dias_validez),
          auth.uid()
        )
        returning
          public.codigos_invitacion.id as r_codigo_id,
          public.codigos_invitacion.codigo as r_codigo_generado,
          public.codigos_invitacion.cliente_id as r_cliente_id,
          public.codigos_invitacion.fecha_vencimiento as r_fecha_vencimiento
      )
      select
        ins.r_codigo_id,
        ins.r_codigo_generado,
        ins.r_cliente_id,
        ins.r_fecha_vencimiento
      from ins;

      return;

    exception when unique_violation then
      null;
    end;
  end loop;

  raise exception 'no_se_pudo_generar_codigo';
end;
$$;

comment on function public.generar_codigo_invitacion(uuid, integer) is
  'Genera códigos de invitación internos para clientes. Requiere sesión de personal interno activo. Máximo 30 días de validez.';


create or replace function public.aprobar_solicitud_credito(
  p_solicitud_id uuid,
  p_dias_validez integer default 30
)
returns table (
  resultado_solicitud_id uuid,
  resultado_cliente_id uuid,
  resultado_nombre_visible text,
  resultado_codigo text,
  resultado_fecha_vencimiento timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud record;
  v_cliente_id uuid;
  v_nombre_visible text;
  v_tipo_cliente text;
  v_nombres text;
  v_apellidos text;
  v_codigo record;
begin
  if not public.es_personal_interno_activo() then
    raise exception 'no_autorizado';
  end if;

  if p_dias_validez is null or p_dias_validez <= 0 or p_dias_validez > 30 then
    raise exception 'dias_validez_invalido';
  end if;

  select *
  into v_solicitud
  from public.solicitudes_credito
  where id = p_solicitud_id
  for update;

  if not found then
    raise exception 'solicitud_no_existe';
  end if;

  if v_solicitud.estado = 'aprobado' then
    raise exception 'solicitud_ya_aprobada';
  end if;

  if v_solicitud.consentimiento_aceptado is not true then
    raise exception 'solicitud_sin_consentimiento';
  end if;

  v_tipo_cliente := coalesce(v_solicitud.datos_adicionales ->> 'tipoCliente', 'natural');
  if v_tipo_cliente not in ('natural', 'juridica') then
    v_tipo_cliente := 'natural';
  end if;

  v_nombre_visible := coalesce(
    nullif(v_solicitud.nombre_empresa, ''),
    nullif(v_solicitud.datos_adicionales ->> 'nombre_empresa', ''),
    v_solicitud.nombre_solicitante
  );

  if v_solicitud.cliente_id is null then
    insert into public.clientes (tipo_cliente, pais_id, nombre_visible, email, identificacion)
    values (
      v_tipo_cliente,
      v_solicitud.pais_id,
      v_nombre_visible,
      v_solicitud.email_solicitante,
      v_solicitud.identificacion
    )
    returning id into v_cliente_id;

    if v_tipo_cliente = 'juridica' then
      v_nombres := nullif(v_solicitud.datos_adicionales ->> 'nombres', '');
      v_apellidos := nullif(v_solicitud.datos_adicionales ->> 'apellidos', '');

      if v_nombres is null or v_apellidos is null then
        raise exception 'solicitud_sin_nombres_apellidos';
      end if;

      insert into public.empresas (cliente_id, representante_legal)
      values (v_cliente_id, v_nombres || ' ' || v_apellidos);
    else
      v_nombres := nullif(v_solicitud.datos_adicionales ->> 'nombres', '');
      v_apellidos := nullif(v_solicitud.datos_adicionales ->> 'apellidos', '');

      if v_nombres is null or v_apellidos is null then
        raise exception 'solicitud_sin_nombres_apellidos';
      end if;

      insert into public.personas_naturales (cliente_id, nombres, apellidos)
      values (v_cliente_id, v_nombres, v_apellidos);
    end if;
  else
    v_cliente_id := v_solicitud.cliente_id;
  end if;

  update public.solicitudes_credito
  set
    cliente_id = v_cliente_id,
    estado = 'aprobado',
    aprobado_por = auth.uid(),
    updated_at = now()
  where id = p_solicitud_id;

  select *
  into v_codigo
  from public.generar_codigo_invitacion(
    v_cliente_id,
    p_dias_validez
  );

  resultado_solicitud_id := p_solicitud_id;
  resultado_cliente_id := v_cliente_id;
  resultado_nombre_visible := v_nombre_visible;
  resultado_codigo := v_codigo.codigo_generado;
  resultado_fecha_vencimiento := v_codigo.fecha_vencimiento;

  return next;
end;
$$;

comment on function public.aprobar_solicitud_credito(uuid, integer) is
  'Aprueba una solicitud de crédito: crea/vincula cliente (natural o jurídica) y genera código de invitación. Requiere sesión de personal interno activo. Máximo 30 días de validez.';


-- ============================================================================
-- 3. crear_cliente_manual: alta manual de cliente desde el panel (sin
--    solicitud de crédito previa) + código de invitación en el mismo paso.
--    Mismo patrón de creación que aprobar_solicitud_credito (cliente +
--    subtipo de forma atómica), para no dejar un cliente huérfano si algo
--    falla a medias.
-- ============================================================================

create function public.crear_cliente_manual(
  p_tipo_cliente text,
  p_pais_id smallint,
  p_nombre_visible text,
  p_email text,
  p_identificacion text,
  p_nombres text default null,
  p_apellidos text default null,
  p_representante_legal text default null,
  p_dias_validez integer default 30
)
returns table (
  resultado_cliente_id uuid,
  resultado_nombre_visible text,
  resultado_codigo text,
  resultado_fecha_vencimiento timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cliente_id uuid;
  v_codigo record;
begin
  if not public.es_personal_interno_activo() then
    raise exception 'no_autorizado';
  end if;

  if p_dias_validez is null or p_dias_validez <= 0 or p_dias_validez > 30 then
    raise exception 'dias_validez_invalido';
  end if;

  if p_tipo_cliente not in ('natural', 'juridica') then
    raise exception 'tipo_cliente_invalido';
  end if;

  if nullif(trim(p_nombre_visible), '') is null
     or nullif(trim(p_email), '') is null
     or nullif(trim(p_identificacion), '') is null
  then
    raise exception 'datos_cliente_incompletos';
  end if;

  insert into public.clientes (tipo_cliente, pais_id, nombre_visible, email, identificacion)
  values (p_tipo_cliente, p_pais_id, trim(p_nombre_visible), trim(p_email), trim(p_identificacion))
  returning id into v_cliente_id;

  if p_tipo_cliente = 'natural' then
    if nullif(trim(p_nombres), '') is null or nullif(trim(p_apellidos), '') is null then
      raise exception 'datos_cliente_incompletos';
    end if;

    insert into public.personas_naturales (cliente_id, nombres, apellidos)
    values (v_cliente_id, trim(p_nombres), trim(p_apellidos));
  else
    if nullif(trim(p_representante_legal), '') is null then
      raise exception 'datos_cliente_incompletos';
    end if;

    insert into public.empresas (cliente_id, representante_legal)
    values (v_cliente_id, trim(p_representante_legal));
  end if;

  select *
  into v_codigo
  from public.generar_codigo_invitacion(v_cliente_id, p_dias_validez);

  resultado_cliente_id := v_cliente_id;
  resultado_nombre_visible := trim(p_nombre_visible);
  resultado_codigo := v_codigo.codigo_generado;
  resultado_fecha_vencimiento := v_codigo.fecha_vencimiento;

  return next;
end;
$$;

revoke all on function public.crear_cliente_manual(text, smallint, text, text, text, text, text, text, integer) from public;
revoke all on function public.crear_cliente_manual(text, smallint, text, text, text, text, text, text, integer) from anon;
grant execute on function public.crear_cliente_manual(text, smallint, text, text, text, text, text, text, integer) to authenticated;

comment on function public.crear_cliente_manual(text, smallint, text, text, text, text, text, text, integer) is
  'Crea un cliente nuevo (natural o jurídica) a mano desde el panel y genera su código de invitación. Requiere sesión de personal interno activo.';

notify pgrst, 'reload schema';
