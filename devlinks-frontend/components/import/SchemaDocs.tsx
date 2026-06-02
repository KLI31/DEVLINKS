"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FieldDoc {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

const SCHEMA_SECTIONS: { title: string; fields: FieldDoc[] }[] = [
  {
    title: "profile",
    fields: [
      { name: "displayName", type: "string", required: true, description: "Nombre visible (max 50)" },
      { name: "bio", type: "string | null", description: "Biografía (max 160)" },
      { name: "location", type: "string | null", description: "Ubicación" },
      { name: "avatarUrl", type: "string | null", description: "URL de avatar" },
      { name: "githubUsername", type: "string | null", description: "Usuario de GitHub" },
      { name: "theme", type: "enum", description: "dark, light, midnight, ocean, rose" },
      { name: "accentColor", type: "string", description: "Color hex (#rrggbb)" },
      { name: "buttonStyle", type: "enum", description: "rounded-fill, pill-fill, sharp-fill, rounded-outline, pill-outline, sharp-outline" },
      { name: "fontFamily", type: "enum", description: "inter, poppins, mono, playfair, jetbrains-mono, fraunces, space-grotesk, fira-code, outfit, dm-sans" },
      { name: "bgType", type: "enum", description: "flat, gradient" },
      { name: "bgColor", type: "string", description: "Color de fondo (#rrggbb)" },
      { name: "profileLayout", type: "enum", description: "classic, cover" },
      { name: "coverImageUrl", type: "string | null", description: "URL de imagen de portada" },
    ],
  },
  {
    title: "links[]",
    fields: [
      { name: "title", type: "string", required: true, description: "Título del link (max 100)" },
      { name: "url", type: "string (URL)", required: true, description: "URL válida con http/https" },
      { name: "icon", type: "string | null", description: "Nombre del icono" },
      { name: "previewImage", type: "string | null", description: "URL de imagen preview" },
      { name: "isPrimary", type: "boolean", description: "¿Es link principal?" },
      { name: "displayOrder", type: "number", description: "Orden de visualización" },
      { name: "isActive", type: "boolean", description: "¿Activo?" },
    ],
  },
  {
    title: "stickers[]",
    fields: [
      { name: "id", type: "string", required: true, description: "ID del sticker" },
      { name: "x", type: "number (0-100)", required: true, description: "Posición horizontal %" },
      { name: "y", type: "number (0-100)", required: true, description: "Posición vertical %" },
      { name: "rotation", type: "number", required: true, description: "Rotación en grados" },
      { name: "scale", type: "number (0.5-2.0)", description: "Escala" },
    ],
  },
  {
    title: "projects[]",
    fields: [
      { name: "title", type: "string", required: true, description: "Nombre del proyecto" },
      { name: "description", type: "string | null", description: "Descripción" },
      { name: "url", type: "string | null", description: "URL del proyecto" },
      { name: "githubRepo", type: "string | null", description: "Repositorio GitHub" },
      { name: "stars", type: "number", description: "Estrellas" },
      { name: "language", type: "string | null", description: "Lenguaje principal" },
      { name: "imageUrl", type: "string | null", description: "URL de imagen" },
      { name: "pinned", type: "boolean", description: "¿Fijado?" },
      { name: "displayOrder", type: "number", description: "Orden de visualización" },
    ],
  },
];

export function SchemaDocs() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Esquema esperado (v1.0.0)
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t px-4 pb-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCHEMA_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                  {section.title}
                </p>
                <div className="space-y-1.5">
                  {section.fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1"
                    >
                      <span className="text-xs font-medium text-foreground">
                        {field.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {field.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Los campos marcados como requeridos son obligatorios dentro de su sección. La importación es parcial: puedes enviar solo las secciones que quieras actualizar.
          </p>
        </div>
      )}
    </div>
  );
}
