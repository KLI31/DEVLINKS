import { RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { JsonCodeBlock } from "@/components/import/JsonCodeBlock";
import { ImportPreview } from "@/components/import/ImportPreview";
import type { PublicProfile, Project } from "@/types";
import type { ProfileImportJson } from "@/lib/validations/import-profile.schema";
import type { ProfileExportJson } from "@/types";

interface ImportPreviewSectionProps {
  parsedData: ProfileImportJson;
  previewProfile: PublicProfile;
  previewProjects: Project[];
  previewBg: string;
  currentConfig: ProfileExportJson | null;
  isImporting: boolean;
  onCancel: () => void;
  onApply: () => void;
}

export function ImportPreviewSection({
  parsedData,
  previewProfile,
  previewProjects,
  previewBg,
  currentConfig,
  isImporting,
  onCancel,
  onApply,
}: ImportPreviewSectionProps) {
  return (
    <section className="space-y-6 border-t pt-6">
      <h2 className="text-lg font-semibold text-foreground">
        Preview de cambios
      </h2>

      <ImportPreview importData={parsedData} currentConfig={currentConfig} />

      {/* Card preview — full width on mobile, left column on desktop */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Vista previa del card
        </h3>
        <div
          className="overflow-auto rounded-xl p-4 sm:p-6"
          style={{ background: previewBg, maxHeight: 700 }}
        >
          <PublicProfileCard
            profile={previewProfile}
            projects={previewProjects}
            githubStats={null}
          />
        </div>
      </div>

      {/* JSON preview — full width with proper overflow handling */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          JSON a importar
        </h3>
        <JsonCodeBlock
          data={parsedData}
          className="border-border/70"
        />
      </div>

      {/* Action buttons — centered, with clear separation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isImporting}
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onApply}
          disabled={isImporting}
          className="gap-2"
        >
          <CheckCircle className="size-4" />
          {isImporting ? "Importando..." : "Aplicar importación"}
        </Button>
      </div>
    </section>
  );
}
