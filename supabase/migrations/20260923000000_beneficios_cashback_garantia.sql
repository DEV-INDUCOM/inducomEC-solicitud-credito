-- ============================================================================
-- PROGRAMA DE BENEFICIOS PAYPAL: cashback 1% + garantía extendida por ciclos
-- ============================================================================
-- Fuente: "Guía funcional — Programa PayPal: Cashback + Garantía Extendida"
-- y el diagrama "Lógica del Programa de Garantía Extendida".
--
-- Dos beneficios INDEPENDIENTES, ambos alimentados por el mismo hecho: un pago
-- PayPal confirmado (`pagos.origen = 'paypal'`).
--
--   A. CASHBACK — 1% de lo pagado. Se acumula sin tope y se puede redimir a
--      partir de USD 20. Es un saldo, no tiene ciclos.
--
--   B. GARANTÍA EXTENDIDA — acumula el monto de las compras en CICLOS de
--      USD 10.000:
--        · al cruzar USD 5.000  → +6 meses  (garantía total 18)
--        · al cruzar USD 10.000 → +12 meses (garantía total 24) y el ciclo
--          se cierra; el siguiente arranca en 0 (el excedente NO se arrastra)
--      El beneficio pertenece a UNA cotización: la del pago que cruzó el
--      umbral. Las demás compras del ciclo conservan sus 12 meses de fábrica.
--      Máximo 2 garantías extendidas vigentes a la vez: al aparecer una
--      tercera, la más antigua pierde SOLO la extensión (mantiene los 12
--      meses de fábrica).
--
-- Decisiones tomadas con el usuario (2026-09-23):
--   · La base de cálculo de ambos beneficios es `pagos.monto_pagado` (el total
--     capturado por PayPal, comisión incluida), no el monto cotizado.
--   · Los pagos PayPal ya registrados se reprocesan al final de esta
--     migración, en orden cronológico.
--   · El excedente al cruzar USD 10.000 se pierde: el ciclo nuevo inicia en 0.
--
-- MODELO: la ACUMULACIÓN es temporal y pertenece al ciclo; las GARANTÍAS son
-- registros históricos atados a una cotización y sobreviven al reinicio.
-- ============================================================================


-- ============================================================================
-- 1. ciclos_garantia — la acumulación (temporal, se reinicia)
-- ============================================================================
create table if not exists public.ciclos_garantia (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  -- Correlativo por cliente (1, 2, 3…): es lo que la UI llama "ciclo actual".
  numero integer not null,
  acumulado numeric not null default 0 check (acumulado >= 0),
  estado text not null default 'abierto' check (estado in ('abierto', 'completado')),
  -- Qué pago cruzó cada umbral. Sirve de guard de idempotencia: un umbral ya
  -- marcado no se vuelve a otorgar dentro del mismo ciclo.
  umbral_5k_pago_id uuid references public.pagos(id) on delete set null,
  umbral_5k_en timestamptz,
  umbral_10k_pago_id uuid references public.pagos(id) on delete set null,
  umbral_10k_en timestamptz,
  abierto_en timestamptz not null default now(),
  cerrado_en timestamptz,
  unique (cliente_id, numero)
);

-- Un solo ciclo abierto por cliente: es el invariante que hace que
-- "el ciclo actual" nunca sea ambiguo.
create unique index if not exists uq_ciclo_abierto_por_cliente
  on public.ciclos_garantia (cliente_id)
  where estado = 'abierto';

comment on table public.ciclos_garantia is
  'Acumulación de compras PayPal hacia los umbrales de garantía. Se reinicia al completar USD 10.000.';


-- ============================================================================
-- 2. pagos_ciclo_garantia — qué pago acumuló en qué ciclo
-- ============================================================================
-- Necesaria por dos razones:
--   · Idempotencia: la PK por pago impide acumular dos veces el mismo pago
--     (PayPal reintenta webhooks; el reproceso histórico se puede correr de
--     nuevo sin inflar el acumulado).
--   · UI: "Compras que cuentan para tu garantía" muestra SOLO las del ciclo
--     actual. Después de un reinicio eso no se puede deducir por fecha.
create table if not exists public.pagos_ciclo_garantia (
  pago_id uuid primary key references public.pagos(id) on delete cascade,
  ciclo_id uuid not null references public.ciclos_garantia(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  monto numeric not null,
  acumulado_antes numeric not null,
  acumulado_despues numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists ix_pcg_ciclo on public.pagos_ciclo_garantia (ciclo_id, acumulado_despues);
create index if not exists ix_pcg_cliente on public.pagos_ciclo_garantia (cliente_id);


-- ============================================================================
-- 3. garantias_extendidas — el beneficio (histórico, por cotización)
-- ============================================================================
-- Tres campos numéricos separados (fábrica / extensión / total) en vez de un
-- solo "meses de garantía": conceptualmente son cosas distintas y la garantía
-- de fábrica JAMÁS se toca, ni siquiera al revocar la extensión.
--
-- Las fechas se guardan concretas (no se recalculan a diario): un proceso
-- nocturno que "reste meses" sería un punto de falla innecesario.
create table if not exists public.garantias_extendidas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  ciclo_id uuid not null references public.ciclos_garantia(id) on delete cascade,
  -- Un pago otorga como máximo un beneficio (si cruza 5k y 10k a la vez, el
  -- diagrama evalúa 10k primero y solo se asigna ese).
  pago_id uuid not null unique references public.pagos(id) on delete cascade,

  umbral numeric not null check (umbral in (5000, 10000)),

  -- Snapshot de la cotización beneficiada: si la cotización se edita después,
  -- el histórico del cliente no debe cambiar (mismo criterio que `pagos`).
  cotizacion_numero text,
  deal_nombre text,
  cotizacion_url text,
  monto_pago numeric not null,
  acumulado_alcanzado numeric not null,

  meses_fabrica integer not null default 12 check (meses_fabrica > 0),
  meses_extension integer not null check (meses_extension in (6, 12)),
  meses_totales integer generated always as (meses_fabrica + meses_extension) stored,

  fecha_inicio date not null,
  fecha_fin_fabrica date not null,
  fecha_fin_total date not null,

  -- 'expirada' NO es un estado almacenado: se deduce comparando
  -- fecha_fin_total con la fecha de hoy, así nadie tiene que correr un job.
  estado text not null default 'activa' check (estado in ('activa', 'revocada_por_limite')),
  revocada_en timestamptz,
  -- Qué garantía nueva la desplazó (regla del máximo de 2 vigentes).
  desplazada_por uuid references public.garantias_extendidas(id) on delete set null,

  -- Null = el cliente todavía no vio el modal de "beneficio desbloqueado".
  vista_en timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ix_garantias_cliente on public.garantias_extendidas (cliente_id, created_at desc);
create index if not exists ix_garantias_desplazada on public.garantias_extendidas (desplazada_por);

comment on table public.garantias_extendidas is
  'Beneficios de garantía extendida desbloqueados. Cada fila pertenece a la cotización cuyo pago cruzó el umbral.';


-- ============================================================================
-- 4. cashback_redenciones — canjes del saldo de cashback
-- ============================================================================
-- Todavía sin UI (el canje se muestra BLOQUEADO hasta USD 20), pero la vista
-- de saldo ya descuenta de acá: así habilitar el canje no obliga a rehacer la
-- vista más adelante.
create table if not exists public.cashback_redenciones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  monto numeric not null check (monto > 0),
  nota text,
  registrado_por uuid references public.personal_interno(id),
  created_at timestamptz not null default now()
);

create index if not exists ix_cashback_red_cliente on public.cashback_redenciones (cliente_id);


-- ============================================================================
-- 5. RLS — mismo patrón que el resto del portal
-- ============================================================================
-- El cliente ve lo suyo (vía `perfiles`), el personal interno ve todo.
-- OJO: la subconsulta selecciona `perfiles.cliente_id` explícitamente. La
-- policy de `personas_naturales` tiene ese bug (selecciona la columna de la
-- tabla externa, con lo que la condición se cumple siempre); no repetirlo.

alter table public.ciclos_garantia enable row level security;
alter table public.pagos_ciclo_garantia enable row level security;
alter table public.garantias_extendidas enable row level security;
alter table public.cashback_redenciones enable row level security;

drop policy if exists "usuarios ven sus ciclos de garantia" on public.ciclos_garantia;
create policy "usuarios ven sus ciclos de garantia"
  on public.ciclos_garantia for select to authenticated
  using (cliente_id in (select perfiles.cliente_id from public.perfiles where perfiles.id = auth.uid()));

drop policy if exists "personal interno ve todos los ciclos" on public.ciclos_garantia;
create policy "personal interno ve todos los ciclos"
  on public.ciclos_garantia for select to authenticated
  using (public.es_personal_interno_activo());

drop policy if exists "usuarios ven los pagos de sus ciclos" on public.pagos_ciclo_garantia;
create policy "usuarios ven los pagos de sus ciclos"
  on public.pagos_ciclo_garantia for select to authenticated
  using (cliente_id in (select perfiles.cliente_id from public.perfiles where perfiles.id = auth.uid()));

drop policy if exists "personal interno ve los pagos de todos los ciclos" on public.pagos_ciclo_garantia;
create policy "personal interno ve los pagos de todos los ciclos"
  on public.pagos_ciclo_garantia for select to authenticated
  using (public.es_personal_interno_activo());

drop policy if exists "usuarios ven sus garantias" on public.garantias_extendidas;
create policy "usuarios ven sus garantias"
  on public.garantias_extendidas for select to authenticated
  using (cliente_id in (select perfiles.cliente_id from public.perfiles where perfiles.id = auth.uid()));

drop policy if exists "personal interno ve todas las garantias" on public.garantias_extendidas;
create policy "personal interno ve todas las garantias"
  on public.garantias_extendidas for select to authenticated
  using (public.es_personal_interno_activo());

drop policy if exists "usuarios ven sus redenciones" on public.cashback_redenciones;
create policy "usuarios ven sus redenciones"
  on public.cashback_redenciones for select to authenticated
  using (cliente_id in (select perfiles.cliente_id from public.perfiles where perfiles.id = auth.uid()));

drop policy if exists "personal interno ve todas las redenciones" on public.cashback_redenciones;
create policy "personal interno ve todas las redenciones"
  on public.cashback_redenciones for select to authenticated
  using (public.es_personal_interno_activo());

drop policy if exists "personal interno registra redenciones" on public.cashback_redenciones;
create policy "personal interno registra redenciones"
  on public.cashback_redenciones for insert to authenticated
  with check (public.es_personal_interno_activo());


-- ============================================================================
-- 6. saldo_por_cliente — cashback con redenciones descontadas
-- ============================================================================
-- `create or replace view` solo permite AGREGAR columnas al final, nunca
-- reordenar ni insertar en el medio (ya pasó con admin_resumen_clientes).
-- Por eso cliente_id / saldo / saldo_cashback se mantienen en su posición.
--
-- Cambio de semántica intencional: `saldo_cashback` ahora cuenta SOLO pagos
-- PayPal, porque el cashback es un beneficio del programa PayPal. `saldo`
-- sigue siendo el total pagado por cualquier vía. Hoy los 9 pagos existentes
-- son todos PayPal, así que el número visible no cambia.
create or replace view public.saldo_por_cliente
  with (security_invoker = true) as
  select
    c.id as cliente_id,
    coalesce(p.total_pagado, 0) as saldo,
    coalesce(p.total_paypal, 0) * 0.01 as saldo_cashback,
    coalesce(r.total_redimido, 0) as cashback_redimido,
    coalesce(p.total_paypal, 0) * 0.01 - coalesce(r.total_redimido, 0) as cashback_disponible
  from public.clientes c
  left join (
    select
      cliente_id,
      sum(monto_pagado) as total_pagado,
      sum(monto_pagado) filter (where origen = 'paypal') as total_paypal
    from public.pagos
    group by cliente_id
  ) p on p.cliente_id = c.id
  left join (
    select cliente_id, sum(monto) as total_redimido
    from public.cashback_redenciones
    group by cliente_id
  ) r on r.cliente_id = c.id;


-- ============================================================================
-- 7. procesar_beneficios_pago — el corazón de la lógica
-- ============================================================================
-- Idempotente por `pagos_ciclo_garantia.pago_id`: correrla dos veces sobre el
-- mismo pago no acumula dos veces ni otorga dos beneficios.
-- Devuelve el id de la garantía desbloqueada, o null si el pago solo acumuló.
create or replace function public.procesar_beneficios_pago(p_pago_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pago              public.pagos;
  v_ciclo             public.ciclos_garantia;
  v_acumulado_antes   numeric;
  v_acumulado_despues numeric;
  v_meses_extension   integer;
  v_umbral            numeric;
  v_garantia_id       uuid;
  v_fecha_inicio      date;
begin
  select * into v_pago from public.pagos where id = p_pago_id for update;
  if not found then
    raise exception 'pago_no_existe';
  end if;

  -- Solo PayPal alimenta el programa (regla 1 del diagrama). Un pago manual o
  -- por CSV se registra igual en `pagos`, pero no acumula ni da cashback.
  if v_pago.origen <> 'paypal' then
    return null;
  end if;

  -- Ya procesado: salir sin tocar nada.
  if exists (select 1 from public.pagos_ciclo_garantia where pago_id = p_pago_id) then
    return null;
  end if;

  -- Ciclo abierto del cliente, o uno nuevo si es su primera compra (o si el
  -- anterior se cerró al llegar a USD 10.000).
  select * into v_ciclo
    from public.ciclos_garantia
   where cliente_id = v_pago.cliente_id and estado = 'abierto'
     for update;

  if not found then
    -- Dos webhooks del mismo cliente en paralelo pueden intentar abrir el
    -- primer ciclo a la vez; `uq_ciclo_abierto_por_cliente` deja pasar solo a
    -- uno. El que pierde la carrera vuelve a leer y usa el ciclo del ganador.
    begin
      insert into public.ciclos_garantia (cliente_id, numero)
      values (
        v_pago.cliente_id,
        coalesce((select max(numero) from public.ciclos_garantia where cliente_id = v_pago.cliente_id), 0) + 1
      )
      returning * into v_ciclo;
    exception when unique_violation then
      select * into v_ciclo
        from public.ciclos_garantia
       where cliente_id = v_pago.cliente_id and estado = 'abierto'
         for update;
      if not found then
        raise exception 'no_se_pudo_abrir_ciclo';
      end if;
    end;
  end if;

  v_acumulado_antes   := v_ciclo.acumulado;
  v_acumulado_despues := v_acumulado_antes + v_pago.monto_pagado;

  insert into public.pagos_ciclo_garantia (
    pago_id, ciclo_id, cliente_id, monto, acumulado_antes, acumulado_despues
  ) values (
    p_pago_id, v_ciclo.id, v_pago.cliente_id, v_pago.monto_pagado,
    v_acumulado_antes, v_acumulado_despues
  );

  -- ¿Qué umbral cruzó este pago? El diagrama evalúa primero USD 10.000: un
  -- pago que cruza ambos otorga +12 meses (no +6 y +12).
  if v_acumulado_despues >= 10000 and v_ciclo.umbral_10k_pago_id is null then
    v_umbral := 10000;
    v_meses_extension := 12;
  elsif v_acumulado_despues >= 5000 and v_ciclo.umbral_5k_pago_id is null then
    v_umbral := 5000;
    v_meses_extension := 6;
  else
    -- Sin beneficio: solo se actualiza el acumulado del ciclo.
    update public.ciclos_garantia
       set acumulado = v_acumulado_despues
     where id = v_ciclo.id;
    return null;
  end if;

  v_fecha_inicio := v_pago.fecha::date;

  insert into public.garantias_extendidas (
    cliente_id, ciclo_id, pago_id, umbral,
    cotizacion_numero, deal_nombre, cotizacion_url,
    monto_pago, acumulado_alcanzado,
    meses_extension, fecha_inicio, fecha_fin_fabrica, fecha_fin_total
  ) values (
    v_pago.cliente_id, v_ciclo.id, p_pago_id, v_umbral,
    v_pago.cotizacion_numero, v_pago.deal_nombre, v_pago.cotizacion_url,
    v_pago.monto_pagado, v_acumulado_despues,
    v_meses_extension,
    v_fecha_inicio,
    -- `date + interval` devuelve timestamp: se castea explícito para que la
    -- columna date no dependa de un cast implícito.
    (v_fecha_inicio + make_interval(months => 12))::date,
    (v_fecha_inicio + make_interval(months => 12 + v_meses_extension))::date
  )
  returning id into v_garantia_id;

  if v_umbral = 10000 then
    -- Cierre del ciclo. El excedente NO se arrastra: el siguiente ciclo nace
    -- en 0 (decisión del usuario, 2026-09-23).
    update public.ciclos_garantia
       set acumulado = v_acumulado_despues,
           umbral_10k_pago_id = p_pago_id,
           umbral_10k_en = now(),
           estado = 'completado',
           cerrado_en = now()
     where id = v_ciclo.id;

    insert into public.ciclos_garantia (cliente_id, numero)
    values (v_pago.cliente_id, v_ciclo.numero + 1);
  else
    update public.ciclos_garantia
       set acumulado = v_acumulado_despues,
           umbral_5k_pago_id = p_pago_id,
           umbral_5k_en = now()
     where id = v_ciclo.id;
  end if;

  -- Máximo 2 garantías extendidas vigentes. La recién desbloqueada SIEMPRE se
  -- conserva (por eso se excluye del ranking) junto con la anterior más
  -- reciente que siga vigente; las demás pierden SOLO la extensión. Los 12
  -- meses de fábrica quedan intactos: `meses_fabrica` no se toca nunca.
  with vigentes as (
    select id, row_number() over (order by fecha_inicio desc, created_at desc) as rn
      from public.garantias_extendidas
     where cliente_id = v_pago.cliente_id
       and estado = 'activa'
       and fecha_fin_total >= current_date
       and id <> v_garantia_id
  )
  update public.garantias_extendidas g
     set estado = 'revocada_por_limite',
         revocada_en = now(),
         desplazada_por = v_garantia_id
    from vigentes v
   where v.id = g.id and v.rn > 1;

  return v_garantia_id;
end;
$$;

revoke all on function public.procesar_beneficios_pago(uuid) from public;
revoke all on function public.procesar_beneficios_pago(uuid) from anon;
revoke all on function public.procesar_beneficios_pago(uuid) from authenticated;
grant execute on function public.procesar_beneficios_pago(uuid) to service_role;

comment on function public.procesar_beneficios_pago(uuid) is
  'Acumula un pago PayPal en el ciclo de garantía del cliente y otorga el beneficio si cruza un umbral. Idempotente por pago.';


-- ============================================================================
-- 8. Disparo automático al registrarse un pago
-- ============================================================================
-- Vía trigger y no desde n8n: así no hay que tocar el workflow W4, y cualquier
-- pago que entre por otra vía (reproceso, carga manual futura) también cuenta.
--
-- El PERFORM va dentro de un bloque con EXCEPTION a propósito: si el cálculo
-- de beneficios fallara, el INSERT del pago NO debe revertirse. El dinero ya
-- entró y el pago tiene que quedar registrado; el beneficio se puede
-- reprocesar después con `procesar_beneficios_pago`.
create or replace function public.pagos_procesar_beneficios()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.origen = 'paypal' then
    begin
      perform public.procesar_beneficios_pago(new.id);
    exception when others then
      raise warning 'procesar_beneficios_pago falló para el pago %: %', new.id, sqlerrm;
    end;
  end if;
  return null;
end;
$$;

revoke all on function public.pagos_procesar_beneficios() from public;
revoke all on function public.pagos_procesar_beneficios() from anon;
revoke all on function public.pagos_procesar_beneficios() from authenticated;

drop trigger if exists pagos_beneficios on public.pagos;
create trigger pagos_beneficios
after insert on public.pagos
for each row execute function public.pagos_procesar_beneficios();


-- ============================================================================
-- 9. marcar_garantia_vista — el cliente cierra el modal de "desbloqueaste…"
-- ============================================================================
-- Security definer en vez de una policy de UPDATE sobre la tabla: una policy
-- abierta dejaría al cliente escribir cualquier columna (meses, estado…).
-- Acá solo puede marcar como vista una garantía que le pertenece.
create or replace function public.marcar_garantia_vista(p_garantia_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.garantias_extendidas
     set vista_en = now()
   where id = p_garantia_id
     and vista_en is null
     and cliente_id in (
       select perfiles.cliente_id from public.perfiles where perfiles.id = auth.uid()
     );
end;
$$;

revoke all on function public.marcar_garantia_vista(uuid) from public;
revoke all on function public.marcar_garantia_vista(uuid) from anon;
grant execute on function public.marcar_garantia_vista(uuid) to authenticated;


-- ============================================================================
-- 10. Reproceso de los pagos PayPal ya registrados
-- ============================================================================
-- En orden cronológico, que es el único orden en que los umbrales caen sobre
-- la cotización correcta. Es seguro repetirlo: la función es idempotente.
do $$
declare
  r record;
begin
  for r in
    select id from public.pagos
     where origen = 'paypal'
     order by fecha, created_at
  loop
    perform public.procesar_beneficios_pago(r.id);
  end loop;
end $$;

notify pgrst, 'reload schema';


-- ============================================================================
-- Verificación sugerida (correr después, en el SQL Editor)
-- ============================================================================
--   select c.nombre_visible, g.numero, g.acumulado, g.estado
--     from public.ciclos_garantia g join public.clientes c on c.id = g.cliente_id
--    order by c.nombre_visible, g.numero;
--
--   select cotizacion_numero, umbral, meses_totales, fecha_fin_total, estado
--     from public.garantias_extendidas order by created_at;
--
--   -- Todo pago PayPal debe estar acumulado exactamente una vez:
--   select count(*) filter (where pcg.pago_id is null) as sin_acumular
--     from public.pagos p
--     left join public.pagos_ciclo_garantia pcg on pcg.pago_id = p.id
--    where p.origen = 'paypal';
