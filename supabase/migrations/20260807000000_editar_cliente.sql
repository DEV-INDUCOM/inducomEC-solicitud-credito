-- ============================================================================
-- Edición de clientes desde el panel admin (módulo Empresas).
-- ============================================================================
-- `clientes` y sus subtipos solo tenían policies de SELECT para personal
-- interno (ver 20260717000000_panel_admin.sql): el directorio de Empresas era
-- de solo lectura, y corregir un nombre mal escrito, un RUC errado o un correo
-- de contacto viejo obligaba a entrar al dashboard de Supabase.
--
-- Se resuelve con RLS directo y no con un RPC, mismo criterio que
-- `incentivos_cliente` en esa migración: editar campos sueltos no tiene
-- invariantes de negocio que proteger.
--
-- `tipo_cliente` queda fuera del alcance de la UI a propósito: cambiar
-- natural <-> jurídica implica mover la fila entre `personas_naturales` y
-- `empresas`, que tienen columnas `not null` distintas. Eso es una migración
-- de datos, no la edición de un campo.
-- ============================================================================

create policy "personal interno actualiza clientes"
  on public.clientes for update to authenticated
  using (public.es_personal_interno_activo())
  with check (public.es_personal_interno_activo());

create policy "personal interno actualiza personas naturales"
  on public.personas_naturales for update to authenticated
  using (public.es_personal_interno_activo())
  with check (public.es_personal_interno_activo());

create policy "personal interno actualiza empresas"
  on public.empresas for update to authenticated
  using (public.es_personal_interno_activo())
  with check (public.es_personal_interno_activo());

-- Las policies filtran filas, pero el privilegio de tabla tiene que existir
-- igual. Se otorga explícito para que la migración no dependa de los grants
-- por defecto del proyecto.
grant update on public.clientes to authenticated;
grant update on public.personas_naturales to authenticated;
grant update on public.empresas to authenticated;

notify pgrst, 'reload schema';
