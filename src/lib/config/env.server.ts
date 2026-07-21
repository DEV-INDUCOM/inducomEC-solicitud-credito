import "server-only";

/**
 * Variables de entorno privadas. Solo se importan desde código de servidor
 * (route handlers, server actions, server components sin `"use client"`).
 *
 * El paquete `server-only` hace que el build falle si este archivo termina
 * importado, directa o indirectamente, desde un componente cliente.
 */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  internalNotificationEmail: process.env.INTERNAL_NOTIFICATION_EMAIL ?? "",
  // Webhook de n8n (https://inducom.app.n8n.cloud/webhook/envio-correo) que arma
  // el correo con los adjuntos reales descargados del bucket privado.
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
};
