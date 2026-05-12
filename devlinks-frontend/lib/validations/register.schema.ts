import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const registerSchema = z.object({
  "display-name": z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(30, "El usuario no puede superar 30 caracteres")
    .regex(
      usernameRegex,
      "Solo letras, números y guion bajo (_)"
    ),
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Introduce un correo válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
