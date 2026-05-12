import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo letras minúsculas, números y guiones",
    ),
  bio: z.string().max(160, "Máximo 160 caracteres").optional(),
});

export const accountSchema = z.object({
  email: z.string().email("Introduce un correo válido"),
  currentPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .optional()
    .or(z.literal("")),
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .optional()
    .or(z.literal("")),
});

export const appearanceSchema = z.object({
  theme: z.enum(["system", "dark", "light"]),
  language: z.enum(["es", "en"]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type AccountFormValues = z.infer<typeof accountSchema>;
export type AppearanceFormValues = z.infer<typeof appearanceSchema>;
