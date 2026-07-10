-- Incentivo/beneficio activo por empresa para el módulo PayPal del portal
-- privado (dashboard + comparador). No toca Auth ni la lógica de códigos de
-- invitación.
--
-- Tabla en vez de columna en `empresas`: da trazabilidad (asignado_en) y
-- fuerza "un incentivo activo por empresa" vía `empresa_id` como PK, igual
-- que el resto del esquema modela estado con fecha (codigos_invitacion,
-- solicitudes_credito).
--
-- Sin fila para una empresa = sin incentivo asignado (estado vacío en UI).
-- La asignación es manual desde el dashboard de Supabase, igual que pagos y
-- códigos de invitación (ver consideraciones-tecnicas-portal-inducom.md).

create table if not exists public.incentivos_empresa (
  empresa_id uuid primary key references public.empresas(id) on delete cascade,
  tipo text not null check (tipo in ('cashback_1', 'garantia_extendida', 'despacho_rapido')),
  asignado_en timestamptz not null default now()
);

alter table public.incentivos_empresa enable row level security;

create policy "usuarios ven el incentivo de su empresa"
  on public.incentivos_empresa for select to authenticated
  using (empresa_id in (select empresa_id from public.perfiles where id = auth.uid()));
