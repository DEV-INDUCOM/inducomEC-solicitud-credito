import { z } from "zod";

//? zod schemas for auth forms : Es una librería de validación de datos con TypeScript

//? Tú defines la "forma" que debe tener un dato (un objeto, un string, lo que sea) 
//? y Zod te da una función que revisa si un valor cualquiera cumple 
//? esa forma — y si no cumple, te dice exactamente qué está mal.

export const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
  rememberMe: z.boolean().optional(),
});

//?derívame el tipo TypeScript equivalente". Sin esto, tendrías que escribir a mano:
export type LoginInput = z.infer<typeof loginSchema>;

export const invitationCodeSchema = z.object({
  code: z.string().trim().min(1, "Ingresa tu código de invitación.").max(40, "El código no es válido."),
});

export type InvitationCodeInput = z.infer<typeof invitationCodeSchema>;

//?Los 4 campos son reglas independientes, campo por campo (nota que aquí password sí exige mínimo 8 
//? porque esta contraseña se está creando, a diferencia del login).

//? Pero "¿coinciden password y confirmPassword?" 
//? es una regla que necesita comparar dos campos entre sí 
//? path: ["confirmPassword"] → esto le dice a Zod en qué campo debe
//? aparecer el error. Sin esto, el error quedaría "flotando"
//? a nivel del objeto entero y no sabrías en qué input pintarlo en rojo
export const registerAccountSchema = z
  .object({
    fullName: z.string().trim().min(1, "Ingresa tu nombre completo."),
    email: z.email("Ingresa un correo electrónico válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });


export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
