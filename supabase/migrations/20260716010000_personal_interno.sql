-- ============================================================================
-- Personal interno: identidad individual para el panel administrativo.
-- ============================================================================
-- Hasta hoy `generar_codigo_invitacion` y `aprobar_solicitud_credito` solo se
-- podían ejecutar con la service_role key, es decir sin ningún usuario
-- autenticado detrás: no había forma de saber qué empleado aprobó cada
-- solicitud. Esta migración crea `personal_interno` (1:1 con auth.users) y
-- mueve la autorización a las propias funciones, para que cada admin tenga
-- su login y quede registro de quién actuó.
--
-- Alta de un admin (a mano, no hay self-service — evita escalar privilegios
-- desde el navegador):
--   1. Crear el usuario en Supabase Auth (invite o signup).
--   2. insert into public.personal_interno (id, nombre) values ('<uuid>', 'Nombre Apellido');
-- ============================================================================

create table public.personal_interno (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null default 'admin' check (rol in ('admin')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.personal_interno enable row level security;

create policy "personal ve su propio registro"
  on public.personal_interno for select to authenticated
  using (auth.uid() = id);

-- Helper de autorización: ¿el usuario autenticado es personal interno activo?
-- security definer porque la policy de arriba solo deja ver la propia fila,
-- y las funciones admin necesitan comprobar la fila de QUIEN sea que llame.
create function public.es_personal_interno_activo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.personal_interno
    where id = auth.uid() and activo
  );
$$;

revoke all on function public.es_personal_interno_activo() from public;
grant execute on function public.es_personal_interno_activo() to authenticated;


-- ============================================================================
-- Auditoría: quién generó cada código / aprobó cada solicitud.
-- ============================================================================
alter table public.codigos_invitacion
  add column generado_por uuid references public.personal_interno(id);

alter table public.solicitudes_credito
  add column aprobado_por uuid references public.personal_interno(id);


-- ----------------------------------------------------------------------------
-- generar_codigo_invitacion: ya no es exclusiva de service_role, requiere
-- sesión de personal interno activo. Registra quién lo generó.
-- ----------------------------------------------------------------------------
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

  if p_dias_validez is null or p_dias_validez <= 0 then
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

revoke all on function public.generar_codigo_invitacion(uuid, integer) from public;
revoke all on function public.generar_codigo_invitacion(uuid, integer) from anon;
revoke all on function public.generar_codigo_invitacion(uuid, integer) from service_role;
grant execute on function public.generar_codigo_invitacion(uuid, integer) to authenticated;

comment on function public.generar_codigo_invitacion(uuid, integer) is
  'Genera códigos de invitación internos para clientes. Requiere sesión de personal interno activo.';


-- ----------------------------------------------------------------------------
-- aprobar_solicitud_credito: ídem, requiere sesión de personal interno
-- activo y registra quién aprobó.
-- ----------------------------------------------------------------------------
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

  if p_dias_validez is null or p_dias_validez <= 0 then
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

  -- tipoCliente viaja dentro de datos_adicionales (route.ts lo guarda ahí);
  -- si por lo que sea no viniera, se asume 'natural' antes que reventar.
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
      -- El formulario público recolecta nombres/apellidos como campos
      -- separados desde datos_adicionales (Step2Datos.tsx los manda así,
      -- route.ts los guarda tal cual en el jsonb). Si faltaran, se corta con
      -- un error explícito en vez de guardar una fila con datos inventados.
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

revoke all on function public.aprobar_solicitud_credito(uuid, integer) from public;
revoke all on function public.aprobar_solicitud_credito(uuid, integer) from anon;
revoke all on function public.aprobar_solicitud_credito(uuid, integer) from service_role;
grant execute on function public.aprobar_solicitud_credito(uuid, integer) to authenticated;

comment on function public.aprobar_solicitud_credito(uuid, integer) is
  'Aprueba una solicitud de crédito: crea/vincula cliente (natural o jurídica) y genera código de invitación. Requiere sesión de personal interno activo.';

notify pgrst, 'reload schema';
