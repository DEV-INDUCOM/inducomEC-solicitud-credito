-- Tabla y bucket para el flujo público de solicitud de crédito.
-- Sin políticas RLS públicas a propósito: solo `service_role` (usado desde
-- el Route Handler /api/solicitud-credito, nunca desde el navegador) puede
-- leer o escribir aquí. Con RLS activo y cero políticas, todo queda
-- denegado por defecto salvo para `service_role`, que las bypassea.

create table if not exists public.solicitudes_credito (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  tipo_cliente text not null check (tipo_cliente in ('natural', 'juridica')),
  data jsonb not null,
  adjuntos jsonb not null default '{}'::jsonb,
  status text not null default 'nueva' check (status in ('nueva', 'en_revision', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now()
);

alter table public.solicitudes_credito enable row level security;

-- Bucket privado para los adjuntos (RUC, cédula, nombramientos, etc.).
-- `public = false` evita cualquier URL pública permanente sobre estos
-- archivos; solo son accesibles vía signed URL generada con `service_role`.
insert into storage.buckets (id, name, public)
values ('solicitudes-adjuntos', 'solicitudes-adjuntos', false)
on conflict (id) do nothing;
