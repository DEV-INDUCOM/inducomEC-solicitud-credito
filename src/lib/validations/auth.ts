import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const invitationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Ingresa tu código de invitación.")
    .max(40, "El código no es válido."),
});

export type InvitationCodeInput = z.infer<typeof invitationCodeSchema>;

export const registerAccountSchema = z
  .object({
    fullName: z.string().trim().min(1, "Ingresa tu nombre completo."),
    email: z.email("Ingresa un correo electrónico válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
