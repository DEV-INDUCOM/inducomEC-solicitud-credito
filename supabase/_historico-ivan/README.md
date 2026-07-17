# Histórico del SQL Editor (archivo muerto)

Esta carpeta guarda, **solo como referencia**, el volcado crudo de los snippets
que se corrieron a mano en el SQL Editor de Supabase durante el desarrollo del
backend.

## ⚠️ Nada de aquí se ejecuta

- **No** es parte de la cadena de migraciones.
- **No** lo lee la CLI de Supabase.
- Contiene mezclado: definiciones de esquema, inserts de data demo, y consultas
  de diagnóstico de un solo uso.

La verdad del esquema vive en [`../migrations/`](../migrations/). La limpieza de
la data demo que dejó este historial vive en
[`../scripts/limpieza-data-demo.sql`](../scripts/limpieza-data-demo.sql).

## Qué se rescató de aquí (ya está en `migrations/`)

- **Policies de lectura** (aislamiento por empresa): `paises`, `perfiles`,
  `empresas`, `pagos`, `incentivos_empresa`.
- **Funciones en uso**: `consumir_codigo_invitacion(text)`,
  `aprobar_solicitud_credito`, `generar_codigo_invitacion`, `set_updated_at`,
  `rls_auto_enable`.

## Qué se descartó (ver `20260715000000_reconciliar_registro_y_cerrar_anon.sql`)

- `crear_solicitud_credito` — el route inserta con service_role, no se usa.
- `consumir_codigo_invitacion(text, uuid, text)` — diseño de registro backend no
  adoptado.
- Policies de INSERT abiertas a `anon` en `solicitudes_credito`,
  `documentos_credito` y `storage.objects` — hueco de seguridad, cerrado.

---

**Para archivar el volcado:** pega aquí el contenido completo del historial del
SQL Editor como `historial-sql-editor.sql`.
