import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color hex inválido");

const validUrl = z.string().url("URL inválida");

export const importProfileSchema = z.object({
  version: z.literal("1.0").optional(),

  profile: z
    .object({
      displayName: z.string().min(1).max(50).optional(),
      bio: z.string().max(160).optional(),
      location: z.string().max(100).nullable().optional(),
      avatarUrl: validUrl.nullable().optional(),
      githubUsername: z.string().nullable().optional(),
      theme: z
        .enum(["dark", "light", "midnight", "ocean", "rose"])
        .optional(),
      accentColor: hexColor.optional(),
      buttonStyle: z
        .enum([
          "rounded-fill",
          "pill-fill",
          "sharp-fill",
          "rounded-outline",
          "pill-outline",
          "sharp-outline",
        ])
        .optional(),
      fontFamily: z
        .enum([
          "inter",
          "poppins",
          "mono",
          "playfair",
          "jetbrains-mono",
          "fraunces",
          "space-grotesk",
          "fira-code",
          "outfit",
          "dm-sans",
        ])
        .optional(),
      bgType: z.enum(["flat", "gradient"]).optional(),
      bgColor: hexColor.optional(),
      profileLayout: z.enum(["classic", "cover"]).optional(),
      coverImageUrl: validUrl.nullable().optional(),
    })
    .optional(),

  links: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        url: validUrl,
        icon: z.string().nullable().optional(),
        previewImage: validUrl.nullable().optional(),
        isPrimary: z.boolean().default(false),
        displayOrder: z.number().int().min(0).default(0),
        isActive: z.boolean().default(true),
      }),
    )
    .optional(),

  stickers: z
    .array(
      z.object({
        id: z.string(),
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        rotation: z.number(),
        scale: z.number().min(0.5).max(2).optional(),
      }),
    )
    .optional(),

  projects: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        url: validUrl.nullable().optional(),
        githubRepo: z
          .string()
          .regex(
            /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/,
            'Formato inválido. Usa "owner/repo"',
          )
          .nullable()
          .optional(),
        stars: z.number().int().min(0).default(0),
        language: z.string().nullable().optional(),
        imageUrl: validUrl.nullable().optional(),
        pinned: z.boolean().default(false),
        displayOrder: z.number().int().min(0).default(0),
      }),
    )
    .optional(),
});

export type ProfileImportJson = z.infer<typeof importProfileSchema>;
