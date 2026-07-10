-- Esquema base del Portal INDUCOM.
-- Esta migración documenta el esquema que ya existe en el proyecto Supabase.
-- NO la ejecutes de nuevo en ese proyecto remoto: sirve para versionar el
-- esquema y para crear entornos nuevos de forma reproducible.

create table if not exists public.paises (
  id smallint primary key generated always as identity,
  codigo text unique not null,
  nombre text not null
);

insert into public.paises (codigo, nombre) values
  ('EC', 'Ecuador'),
  ('BO', 'Bolivia'),
  ('PE', 'Perú'),
  ('CO', 'Colombia')
on conflict (codigo) do nothing;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  pais_id smallint not null references public.paises(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id),
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists perfiles_email_normalizado_key
  on public.perfiles (lower(email));

create table if not exists public.codigos_invitacion (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  empresa_id uuid not null references public.empresas(id),
  estado text not null default 'activo'
    check (estado in ('activo', 'usado', 'vencido')),
  fecha_vencimiento timestamptz not null,
  usado_por uuid references auth.users(id),
  usado_en timestamptz,
  created_at timestamptz not null default now(),
  constraint uso_consistente check (
    estado <> 'usado' or (usado_por is not null and usado_en is not null)
  )
);

create table if not exists public.solicitudes_credito (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'recibido'
    check (estado in ('recibido', 'en_revision', 'aprobado', 'rechazado', 'pendiente_informacion')),
  nombre_solicitante text not null,
  email_solicitante text not null,
  telefono_solicitante text,
  identificacion text not null,
  pais_id smallint not null references public.paises(id),
  datos_adicionales jsonb not null default '{}'::jsonb,
  empresa_id uuid references public.empresas(id),
  consentimiento_aceptado boolean not null default false,
  consentimiento_fecha timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre_empresa text,
  constraint consentimiento_requerido check (
    consentimiento_aceptado = true and consentimiento_fecha is not null
  )
);

create table if not exists public.documentos_credito (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes_credito(id) on delete cascade,
  storage_path text not null unique,
  nombre_archivo text not null,
  tipo_mime text not null,
  tamano_bytes bigint not null check (tamano_bytes > 0 and tamano_bytes <= 10 * 1024 * 1024),
  created_at timestamptz not null default now()
);

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  monto numeric(12, 2) not null,
  fecha timestamptz not null,
  origen text not null check (origen in ('manual', 'csv')),
  referencia text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
before update on public.empresas
for each row execute function public.set_updated_at();

drop trigger if exists solicitudes_credito_set_updated_at on public.solicitudes_credito;
create trigger solicitudes_credito_set_updated_at
before update on public.solicitudes_credito
for each row execute function public.set_updated_at();

alter table public.paises enable row level security;
alter table public.empresas enable row level security;
alter table public.perfiles enable row level security;
alter table public.codigos_invitacion enable row level security;
alter table public.solicitudes_credito enable row level security;
alter table public.documentos_credito enable row level security;
alter table public.pagos enable row level security;

create policy "lectura pública de países"
  on public.paises for select to anon, authenticated using (true);

create policy "usuarios ven su perfil"
  on public.perfiles for select to authenticated using (auth.uid() = id);

create policy "usuarios ven su empresa"
  on public.empresas for select to authenticated
  using (id in (select empresa_id from public.perfiles where id = auth.uid()));

create policy "usuarios ven pagos de su empresa"
  on public.pagos for select to authenticated
  using (empresa_id in (select empresa_id from public.perfiles where id = auth.uid()));

-- No hay políticas públicas de INSERT para solicitudes ni documentos.
-- El Route Handler de Next.js usa service_role y valida antes de escribir.

create or replace view public.saldo_por_empresa
  with (security_invoker = true) as
  select empresa_id, coalesce(sum(monto), 0) as saldo
  from public.pagos
  group by empresa_id;

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
      update public.codigos_invitacion set estado = 'vencido' where id = v_codigo.id;
    end if;
    raise exception 'codigo_no_valido';
  end if;

  if exists (select 1 from public.perfiles where id = v_user_id or lower(email) = v_email) then
    raise exception 'codigo_no_valido';
  end if;

  update public.codigos_invitacion
  set estado = 'usado', usado_por = v_user_id, usado_en = now()
  where id = v_codigo.id;

  insert into public.perfiles (id, empresa_id, email)
  values (v_user_id, v_codigo.empresa_id, v_email);

  return jsonb_build_object('empresa_id', v_codigo.empresa_id);
end;
$$;

revoke all on function public.consumir_codigo_invitacion(text) from public;
grant execute on function public.consumir_codigo_invitacion(text) to authenticated;

insert into storage.buckets (id, name, public)
values ('documentos-credito', 'documentos-credito', false)
on conflict (id) do nothing;
