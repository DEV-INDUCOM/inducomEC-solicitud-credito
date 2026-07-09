import { z } from "zod";

export const countryOptions = [
  { value: "EC", label: "Ecuador" },
  { value: "BO", label: "Bolivia" },
  { value: "PE", label: "Perú" },
  { value: "CO", label: "Colombia" },
] as const;

export const MAX_ATTACHMENT_SIZE_MB = 10;
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const creditRequestSchema = z.object({
  companyName: z.string().trim().min(1, "Ingresa la razón social de la empresa."),
  taxId: z.string().trim().min(1, "Ingresa el RUC / NIT / identificación tributaria."),
  contactName: z.string().trim().min(1, "Ingresa el nombre del contacto."),
  email: z.email("Ingresa un correo electrónico válido."),
  phone: z.string().trim().min(1, "Ingresa un teléfono de contacto."),
  country: z.enum(countryOptions.map((c) => c.value) as [string, ...string[]], {
    error: "Selecciona un país.",
  }),
  monthlyIncome: z.string().trim().min(1, "Ingresa un estimado de ingresos mensuales."),
  requestedAmount: z.string().trim().min(1, "Ingresa el monto de crédito solicitado."),
  message: z.string().trim().max(1000, "Máximo 1000 caracteres.").optional(),
  consent: z.literal(true, {
    error: "Debes aceptar el tratamiento de datos para continuar.",
  }),
});

export type CreditRequestInput = z.infer<typeof creditRequestSchema>;
