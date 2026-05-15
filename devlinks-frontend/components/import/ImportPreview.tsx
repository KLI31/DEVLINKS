"use client";

import { cn } from "@/lib/utils";
import type { ProfileExportJson } from "@/types";
import type { ProfileImportJson } from "@/lib/validations/import-profile.schema";

interface ImportPreviewProps {
  importData: ProfileImportJson;
  currentConfig: ProfileExportJson | null;
  className?: string;
}

function DiffRow({ label, from, to }: { label: string; from?: string; to?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      {from !== undefined && (
        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive line-through">
          {from || "vacío"}
        </span>
      )}
      <span className="text-muted-foreground">→</span>
      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">
        {to || "vacío"}
      </span>
    </div>
  );
}

function CountRow({ label, current, incoming }: { label: string; current: number; incoming: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="rounded bg-muted px-1.5 py-0.5 text-foreground">{current} actual</span>
      <span className="text-muted-foreground">→</span>
      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">
        {incoming} nuevo{incoming !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export function ImportPreview({ importData, currentConfig, className }: ImportPreviewProps) {
  const changes: React.ReactNode[] = [];

  if (importData.profile) {
    const profile = importData.profile;
    const current = currentConfig?.profile;

    const profileFields: Array<{ key: keyof typeof profile; label: string }> = [
      { key: "displayName", label: "Nombre" },
      { key: "bio", label: "Bio" },
      { key: "location", label: "Ubicación" },
      { key: "theme", label: "Tema" },
      { key: "accentColor", label: "Color de acento" },
      { key: "buttonStyle", label: "Estilo de botón" },
      { key: "fontFamily", label: "Fuente" },
      { key: "bgType", label: "Tipo de fondo" },
      { key: "bgColor", label: "Color de fondo" },
      { key: "profileLayout", label: "Layout" },
    ];

    for (const { key, label } of profileFields) {
      const next = profile[key];
      const prev = current?.[key];
      if (next !== undefined && next !== prev) {
        changes.push(
          <DiffRow key={key} label={label} from={String(prev ?? "")} to={String(next ?? "")} />,
        );
      }
    }
  }

  if (importData.links !== undefined) {
    changes.push(
      <CountRow
        key="links"
        label="Links"
        current={currentConfig?.links.length ?? 0}
        incoming={importData.links.length}
      />,
    );
  }

  if (importData.stickers !== undefined) {
    changes.push(
      <CountRow
        key="stickers"
        label="Stickers"
        current={currentConfig?.stickers.length ?? 0}
        incoming={importData.stickers.length}
      />,
    );
  }

  if (importData.projects !== undefined) {
    changes.push(
      <CountRow
        key="projects"
        label="Proyectos"
        current={currentConfig?.projects.length ?? 0}
        incoming={importData.projects.length}
      />,
    );
  }

  if (changes.length === 0) {
    return (
      <div className={cn("rounded-lg border border-muted bg-muted/30 p-4", className)}>
        <p className="text-sm text-muted-foreground">
          No se detectaron cambios respecto a tu configuración actual.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold text-foreground">Cambios detectados</h4>
      <div className="space-y-2 rounded-lg border border-muted bg-muted/30 p-4">
        {changes}
      </div>
    </div>
  );
}
