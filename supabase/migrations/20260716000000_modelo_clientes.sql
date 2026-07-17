-- ============================================================================
-- MODELO "CLIENTES" — reemplaza a `empresas` como tabla central.
-- ============================================================================
-- Hasta hoy TODO colgaba de `empresas`, incluso las personas naturales (se
-- creaba una fila en `empresas` usando el nombre de la persona como
-- "nombre de empresa"). Esta migración introduce `clientes` como hub común
-- para ambos tipos, con `personas_naturales` y `empresas` como subtipos:
--
--                    clientes (id, tipo_cliente, pais_id, nombre_visible,
--                              email, identificacion)
--                     /                              \
--         personas_naturales                      empresas
--         (cliente_id PK/FK)                  (cliente_id PK/FK)
--
-- `nombre_visible`/`email`/`identificacion` viven en `clientes` porque HOY el
-- formulario de solicitud de crédito recoge exactamente los mismos campos
-- para natural y jurídica (no hay razón_social vs nombre, ni representante
-- legal, ni cédula vs RUC en formatos distintos). Por eso los subtipos nacen
-- deliberadamente vacíos (solo el FK): son el lugar para agregar, el día que
-- el formulario los recoja, campos que sí difieran por tipo (representante
-- legal, fecha de nacimiento, etc.) sin otra migración estructural grande.
--
-- ⚠️  ESTRUCTURAL. Asume las tablas de datos VACÍAS (corre después de
--     `supabase/scripts/borrar-todo-menos-paises.sql`). El guard de abajo
--     aborta si detecta filas, para no perder datos reales en silencio.
-- ============================================================================

do $$
begin
  if exists (select 1 from public.empresas limit 1)
     or exists (select 1 from public.perfiles limit 1)
     or exists (select 1 from public.pagos limit 1)
     or exists (select 1 from public.codigos_invitacion limit 1)
     or exists (select 1 from public.solicitudes_credito limit 1)
     or exists (select 1 from public.incentivos_empresa limit 1)
  then
    raise exception
      'Hay filas en tablas de datos. Corre supabase/scripts/borrar-todo-menos-paises.sql (o migra los datos a mano) antes de esta migración estructural.';
  end if;
end $$;


-- ============================================================================
-- 1. Tabla hub: clientes
-- ============================================================================
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  tipo_cliente text not null check (tipo_cliente in ('natural', 'juridica')),
  pais_id smallint not null references public.paises(id),
  nombre_visible text not null,
  email text not null,
  identificacion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
before update on public.clientes
for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

create policy "usuarios ven su propio cliente"
  on public.clientes for select to authenticated
  using (id in (select cliente_id from public.perfiles where perfiles.id = auth.uid()));


-- ============================================================================
-- 2. Subtipos: personas_naturales y empresas (deliberadamente mínimos hoy)
-- ============================================================================
drop table if exists public.empresas cascade;

create table public.personas_naturales (
  cliente_id uuid primary key references public.clientes(id) on delete cascade,
  -- Separados (no un solo "nombre completo"): el formulario público ahora
  -- recolecta nombres y apellidos en inputs distintos (Step2Datos.tsx), así
  -- que llegan reales, sin tener que partir un nombre compuesto a ciegas.
  nombres text not null,
  apellidos text not null
);

alter table public.personas_naturales enable row level security;

create policy "usuarios ven su propia persona natural"
  on public.personas_naturales for select to authenticated
  using (cliente_id in (select cliente_id from public.perfiles where perfiles.id = auth.uid()));

create table public.empresas (
  cliente_id uuid primary key references public.clientes(id) on delete cascade,
  -- Quien llena el form como jurídica ES el representante legal; con
  -- nombres/apellidos ya separados, este dato llega limpio (no adivinado).
  -- No hay "ruc" acá: ya vive en clientes.identificacion, no se duplica.
  representante_legal text not null
);

alter table public.empresas enable row level security;

create policy "usuarios ven su propia empresa"
  on public.empresas for select to authenticated
  using (cliente_id in (select cliente_id from public.perfiles where perfiles.id = auth.uid()));


-- ============================================================================
-- 3. Migrar las tablas que colgaban de `empresas` a `cliente_id`
-- ----------------------------------------------------------------------------
-- Todas asumidas vacías (por el guard de arriba), así que es un simple
-- drop+add de columna en vez de una migración de datos fila por fila.
-- ============================================================================

-- perfiles
alter table public.perfiles drop column if exists empresa_id;
alter table public.perfiles add column cliente_id uuid not null references public.clientes(id);

-- pagos
alter table public.pagos drop column if exists empresa_id;
alter table public.pagos add column cliente_id uuid not null references public.clientes(id);

drop policy if exists "usuarios ven los pagos de su empresa" on public.pagos;
drop policy if exists "usuarios ven pagos de su empresa" on public.pagos;
create policy "usuarios ven los pagos de su cliente"
  on public.pagos for select to authenticated
  using (cliente_id in (select cliente_id from public.perfiles where perfiles.id = auth.uid()));

-- codigos_invitacion
alter table public.codigos_invitacion drop column if exists empresa_id;
alter table public.codigos_invitacion add column cliente_id uuid not null references public.clientes(id);

-- solicitudes_credito (nullable: se asigna recién al aprobar)
alter table public.solicitudes_credito drop column if exists empresa_id;
alter table public.solicitudes_credito add column cliente_id uuid references public.clientes(id);

-- incentivos_empresa → incentivos_cliente (PK cambia de tabla referenciada)
drop table if exists public.incentivos_empresa cascade;

create table public.incentivos_cliente (
  cliente_id uuid primary key references public.clientes(id) on delete cascade,
  tipo text not null check (tipo in ('cashback_1', 'garantia_extendida', 'despacho_rapido')),
  asignado_en timestamptz not null default now()
);

alter table public.incentivos_cliente enable row level security;

create policy "usuarios ven el incentivo de su cliente"
  on public.incentivos_cliente for select to authenticated
  using (cliente_id in (select cliente_id from public.perfiles where perfiles.id = auth.uid()));


-- ============================================================================
-- 4. Vista de saldo: saldo_por_empresa → saldo_por_cliente
-- ============================================================================
drop view if exists public.saldo_por_empresa;

create view public.saldo_por_cliente
  with (security_invoker = true) as
  select cliente_id, coalesce(sum(monto), 0) as saldo
  from public.pagos
  group by cliente_id;


-- ============================================================================
-- 5. Funciones: renombrar empresa_id → cliente_id en firmas y cuerpos
-- ============================================================================

-- generar_codigo_invitacion: cambia el `returns table`, requiere drop previo.
drop function if exists public.generar_codigo_invitacion(uuid, integer);

create function public.generar_codigo_invitacion(
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
          fecha_vencimiento
        )
        values (
          v_codigo,
          p_cliente_id,
          now() + make_interval(days => p_dias_validez)
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
revoke all on function public.generar_codigo_invitacion(uuid, integer) from authenticated;
grant execute on function public.generar_codigo_invitacion(uuid, integer) to service_role;

comment on function public.generar_codigo_invitacion(uuid, integer) is
  'Genera códigos de invitación internos para clientes. Uso exclusivo dashboard/service_role.';


-- aprobar_solicitud_credito: cambia el `returns table`, requiere drop previo.
drop function if exists public.aprobar_solicitud_credito(uuid, integer);

create function public.aprobar_solicitud_credito(
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
revoke all on function public.aprobar_solicitud_credito(uuid, integer) from authenticated;
grant execute on function public.aprobar_solicitud_credito(uuid, integer) to service_role;

comment on function public.aprobar_solicitud_credito(uuid, integer) is
  'Aprueba una solicitud de crédito: crea/vincula cliente (natural o jurídica) y genera código de invitación.';


-- consumir_codigo_invitacion: devuelve jsonb (tipo no cambia), no requiere drop.
create or replace function public.consumir_codigo_invitacion(p_codigo text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo public.codigos_invitacion;
  v_user_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if v_user_id is null or v_email = '' then
    raise exception 'codigo_no_valido';
  end if;

  select * into v_codigo
  from public.codigos_invitacion
  where codigo = trim(p_codigo)
  for update;

  if not found or v_codigo.estado <> 'activo' or v_codigo.fecha_vencimiento < now() then
    if found and v_codigo.estado = 'activo' then
      update public.codigos_invitacion
      set estado = 'vencido'
      where id = v_codigo.id;
    end if;

    raise exception 'codigo_no_valido';
  end if;

  if exists (
    select 1
    from public.perfiles
    where id = v_user_id or lower(email) = v_email
  ) then
    raise exception 'codigo_no_valido';
  end if;

  update public.codigos_invitacion
  set estado = 'usado',
      usado_por = v_user_id,
      usado_en = now()
  where id = v_codigo.id;

  insert into public.perfiles (id, cliente_id, email)
  values (v_user_id, v_codigo.cliente_id, v_email);

  return jsonb_build_object('cliente_id', v_codigo.cliente_id);
end;
$$;

revoke all on function public.consumir_codigo_invitacion(text) from public;
grant execute on function public.consumir_codigo_invitacion(text) to authenticated;

notify pgrst, 'reload schema';
