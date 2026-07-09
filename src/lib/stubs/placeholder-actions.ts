/**
 * Stubs de frontend para los flujos de autenticación y formularios públicos.
 *
 * Ninguna de estas funciones toca Supabase todavía: simulan latencia de red
 * y devuelven una respuesta fija para que la UI (loading / error / éxito)
 * sea demostrable end-to-end. Cada una está marcada con el punto exacto
 * donde debe conectarse la lógica real de servidor.
 *
 * Reglas del proyecto que esta capa respeta aunque sea un stub:
 * - El código de invitación NO se valida de verdad en el cliente; el check
 *   de formato de aquí es solo UX, la validación real es en el servidor.
 * - Ninguna de estas funciones expone ni necesita `service_role`.
 */

const NETWORK_DELAY_MS = 700;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateLogin(): Promise<{ ok: boolean; message: string }> {
  await wait(NETWORK_DELAY_MS);
  // TODO(Supabase Auth): reemplazar por supabase.auth.signInWithPassword en el servidor.
  return {
    ok: false,
    message:
      "El inicio de sesión todavía no está conectado a Supabase Auth. Este formulario queda listo para integrarse.",
  };
}

const INVITATION_CODE_FORMAT = /^[A-Za-z0-9-]{4,}$/;

export async function simulateValidateInvitationCode(
  code: string
): Promise<{ ok: boolean; message: string }> {
  await wait(NETWORK_DELAY_MS);
  // TODO(validar_codigo): esta es solo una comprobación de formato para UX.
  // La validación real (existe / activo / no vencido / no usado) ocurre en
  // el servidor con service_role, de forma atómica. Nunca confiar en esto.
  if (!INVITATION_CODE_FORMAT.test(code)) {
    return { ok: false, message: "Código no válido." };
  }
  return { ok: true, message: "Código válido. Completa tus datos para crear la cuenta." };
}

export async function simulateRegisterAccount(): Promise<{ ok: boolean; message: string }> {
  await wait(NETWORK_DELAY_MS);
  // TODO(Supabase Auth): reemplazar por supabase.auth.signUp + asociación a empresa en el servidor.
  return {
    ok: false,
    message:
      "El registro todavía no está conectado a Supabase Auth. Este formulario queda listo para integrarse.",
  };
}

export async function simulateForgotPassword(): Promise<{ ok: boolean; message: string }> {
  await wait(NETWORK_DELAY_MS);
  // TODO: reemplazar por supabase.auth.resetPasswordForEmail en el servidor.
  // El mensaje es intencionalmente genérico (no confirma si el correo existe).
  return {
    ok: true,
    message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
  };
}
