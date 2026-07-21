-- Tipo de documento (etiqueta en español, ej. "Cédula", "RUC") de cada
-- adjunto de una solicitud de crédito. Antes solo se sabía el requisito al
-- que correspondía mirando el nombre del archivo dentro de storage_path.
alter table public.documentos_credito
  add column tipo_documento text;
