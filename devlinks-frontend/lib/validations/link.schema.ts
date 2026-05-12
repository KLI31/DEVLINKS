import { z } from "zod";

export const linkSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  url: z.string().url("Introduce una URL válida").max(2048),
  icon: z.string().max(100).optional(),
});

export type LinkFormValues = z.infer<typeof linkSchema>;
