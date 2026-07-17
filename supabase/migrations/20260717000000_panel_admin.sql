-- ============================================================================
-- Panel administrativo: acceso de lectura para personal interno + soporte
-- para las pantallas de Resumen, Solicitudes, Empresas, Pagos y Códigos.
-- ============================================================================
-- Hasta hoy `personal_interno` solo podía ver su propia fila (necesario para
-- `es_personal_interno_activo()`), pero ninguna policy le daba acceso a los
-- datos de negocio (clientes, pagos, solicitudes, códigos...). El MVP asumía
-- que esa operación se hacía a mano en el dashboard de Supabase; ahora que
-- existe un panel propio con su propio login, el aislamiento de datos lo
-- sigue haciendo la base de datos (RLS), no la pantalla: se agrega "personal
-- interno activo ve todo" como policy adicional en cada tabla, sin tocar las
-- policies existentes de "cada cliente ve lo suyo".
-- ============================================================================


-- ============================================================================
-- 1. Lectura de personal interno activo en todas las tablas de negocio
-- ============================================================================

-- Sin esto, el historial de una solicitud solo muestra el nombre de quien lo
-- consulta (la policy original de personal_interno es "ve su propia fila"):
-- para mostrar "Por Ana Torres" en un cambio de estado hecho por otro admin,
-- cualquier personal interno activo necesita poder leer el nombre de otro.
create policy "personal interno ve a todo el personal interno"
  on public.personal_interno for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todos los clientes"
  on public.clientes for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todas las personas naturales"
  on public.personas_naturales for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todas las empresas"
  on public.empresas for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todos los perfiles"
  on public.perfiles for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todos los pagos"
  on public.pagos for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todos los codigos"
  on public.codigos_invitacion for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todas las solicitudes"
  on public.solicitudes_credito for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todos los documentos"
  on public.documentos_credito for select to authenticated
  using (public.es_personal_interno_activo());

create policy "personal interno ve todos los incentivos"
  on public.incentivos_cliente for select to authenticated
  using (public.es_personal_interno_activo());

-- Asignar/actualizar el incentivo de un cliente es una operación simple (sin
-- invariantes de negocio que proteger), así que se resuelve con RLS directo
-- en vez de un RPC dedicado.
create policy "personal interno asigna incentivos"
  on public.incentivos_cliente for insert to authenticated
  with check (public.es_personal_interno_activo());

create policy "personal interno actualiza incentivos"
  on public.incentivos_cliente for update to authenticated
  using (public.es_personal_interno_activo())
  with check (public.es_personal_interno_activo());

-- Documentos adjuntos: bucket privado. Sin esta policy, `createSignedUrl`
-- desde el panel (cliente con cookies de sesión, no service_role) no puede
-- leer el objeto aunque la fila de `documentos_credito` sí sea visible.
create policy "personal interno lee documentos de credito"
  on storage.objects for select to authenticated
  using (bucket_id = 'documentos-credito' and public.es_personal_interno_activo());


-- ============================================================================
-- 1b. Vista agregada para el directorio de "Empresas": evita N+1 queries en
--     el panel (usuarios, total pagado, último pago por cliente).
--     `security_invoker = true` respeta las policies de arriba: sin ellas,
--     un cliente normal seguiría sin ver nada de otros clientes a través de
--     esta vista.
-- ============================================================================

create view public.admin_resumen_clientes
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
    ic.tipo as incentivo_tipo
  from public.clientes c
  join public.paises pa on pa.id = c.pais_id
  left join public.incentivos_cliente ic on ic.cliente_id = c.id;


-- ============================================================================
-- 2. Pagos: método de pago + quién lo registró
-- ============================================================================
-- El registro manual de un pago (única vía: no hay importación CSV en el
-- panel) necesita capturar el método (transferencia, cheque, etc., visto en
-- el mockup de Resumen) y quién lo cargó, para trazabilidad.

alter table public.pagos
  add column metodo_pago text
    check (metodo_pago in ('transferencia', 'tarjeta', 'efectivo', 'cheque', 'ventanilla', 'otro'));

alter table public.pagos
  add column registrado_por uuid references public.personal_interno(id);

-- Insertar un pago manual no tiene invariantes complejas (a diferencia de
-- consumir un código o aprobar una solicitud): RLS directo alcanza.
create policy "personal interno registra pagos"
  on public.pagos for insert to authenticated
  with check (public.es_personal_interno_activo());


-- ============================================================================
-- 3. Historial de solicitudes: respalda el panel "Historial" del detalle.
-- ============================================================================

create table public.historial_solicitud (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes_credito(id) on delete cascade,
  estado_anterior text not null,
  estado_nuevo text not null,
  nota text,
  actor_id uuid references public.personal_interno(id),
  created_at timestamptz not null default now()
);

alter table public.historial_solicitud enable row level security;

create policy "personal interno ve el historial de solicitudes"
  on public.historial_solicitud for select to authenticated
  using (public.es_personal_interno_activo());

-- Sin policy de INSERT: la única vía de escritura es la función
-- `actualizar_estado_solicitud` (security definer, más abajo), para que cada
-- fila del historial quede atada a un cambio de estado real y auditado.


-- ============================================================================
-- 4. actualizar_estado_solicitud: cambia el estado de una solicitud y deja
--    rastro en el historial. Si el nuevo estado es 'aprobado', delega en
--    `aprobar_solicitud_credito` (crea/vincula cliente + genera código).
-- ============================================================================

create function public.actualizar_estado_solicitud(
  p_solicitud_id uuid,
  p_nuevo_estado text,
  p_nota text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado_anterior text;
begin
  if not public.es_personal_interno_activo() then
    raise exception 'no_autorizado';
  end if;

  if p_nuevo_estado not in ('recibido', 'en_revision', 'aprobado', 'rechazado', 'pendiente_informacion') then
    raise exception 'estado_invalido';
  end if;

  select estado into v_estado_anterior
  from public.solicitudes_credito
  where id = p_solicitud_id
  for update;

  if not found then
    raise exception 'solicitud_no_existe';
  end if;

  if p_nuevo_estado = 'aprobado' and v_estado_anterior <> 'aprobado' then
    -- aprobar_solicitud_credito ya valida consentimiento/datos y genera el
    -- código de invitación; se descarta el resultado acá porque el panel lo
    -- vuelve a leer de las tablas al refrescar.
    perform * from public.aprobar_solicitud_credito(p_solicitud_id, 30);
  elsif p_nuevo_estado <> v_estado_anterior then
    update public.solicitudes_credito
    set estado = p_nuevo_estado, updated_at = now()
    where id = p_solicitud_id;
  end if;

  insert into public.historial_solicitud (solicitud_id, estado_anterior, estado_nuevo, nota, actor_id)
  values (p_solicitud_id, v_estado_anterior, p_nuevo_estado, nullif(trim(p_nota), ''), auth.uid());
end;
$$;

revoke all on function public.actualizar_estado_solicitud(uuid, text, text) from public;
revoke all on function public.actualizar_estado_solicitud(uuid, text, text) from anon;
revoke all on function public.actualizar_estado_solicitud(uuid, text, text) from service_role;
grant execute on function public.actualizar_estado_solicitud(uuid, text, text) to authenticated;

comment on function public.actualizar_estado_solicitud(uuid, text, text) is
  'Cambia el estado de una solicitud de crédito y registra el cambio en historial_solicitud. Requiere sesión de personal interno activo.';

notify pgrst, 'reload schema';
