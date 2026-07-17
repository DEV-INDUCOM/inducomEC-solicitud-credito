// Vacía por completo el bucket privado 'documentos-credito' usando la Storage API
// (SQL directo sobre storage.objects está bloqueado por Supabase a propósito).
//
// Los archivos están un nivel anidados: <solicitud_id>/<archivo>. list() de
// Supabase solo lista un nivel, así que primero se listan las "carpetas"
// (una por solicitud) y luego los archivos dentro de cada una.
//
// Uso:
//   node supabase/scripts/vaciar-bucket-documentos-credito.mjs
//
// Lee las credenciales de .env.local (o .env) — necesita la service_role key,
// porque el bucket es privado y no tiene policy pública de lectura/borrado.

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;
  for (const rawLine of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    process.env[key] ||= value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const BUCKET = "documentos-credito";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env/.env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAllPaths() {
  const { data: folders, error: listError } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  if (listError) throw new Error(`Listando la raíz del bucket: ${listError.message}`);

  const paths = [];
  for (const folder of folders ?? []) {
    // Un objeto de primer nivel sin `id` es una "carpeta" (prefijo), no un archivo.
    if (folder.id === null) {
      const { data: files, error: subError } = await supabase.storage.from(BUCKET).list(folder.name, { limit: 1000 });
      if (subError) throw new Error(`Listando "${folder.name}/": ${subError.message}`);
      for (const file of files ?? []) {
        paths.push(`${folder.name}/${file.name}`);
      }
    } else {
      paths.push(folder.name);
    }
  }
  return paths;
}

const paths = await listAllPaths();

if (paths.length === 0) {
  console.log("El bucket ya está vacío. Nada que borrar.");
  process.exit(0);
}

console.log(`Se van a borrar ${paths.length} archivo(s) de "${BUCKET}":`);
for (const path of paths) console.log(`  - ${path}`);

// Supabase Storage acepta hasta 1000 paths por llamada a remove().
const BATCH_SIZE = 1000;
for (let i = 0; i < paths.length; i += BATCH_SIZE) {
  const batch = paths.slice(i, i + BATCH_SIZE);
  const { error: removeError } = await supabase.storage.from(BUCKET).remove(batch);
  if (removeError) throw new Error(`Borrando lote ${i / BATCH_SIZE + 1}: ${removeError.message}`);
}

console.log(`\nListo: ${paths.length} archivo(s) borrado(s) de "${BUCKET}".`);
