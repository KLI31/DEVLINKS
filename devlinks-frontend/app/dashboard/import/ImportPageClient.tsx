"use client";

import { Lightbulb } from "lucide-react";
import { DropZone } from "@/components/import/DropZone";
import { JsonEditor } from "@/components/import/JsonEditor";
import { SchemaDocs } from "@/components/import/SchemaDocs";
import { ImportToolbar } from "@/components/import/ImportToolbar";
import { ImportTabs } from "@/components/import/ImportTabs";
import { ImportActions } from "@/components/import/ImportActions";
import { JsonValidationPanel } from "@/components/import/JsonValidationPanel";
import { ImportPreviewSection } from "@/components/import/ImportPreviewSection";
import { useImportState } from "@/hooks/use-import-state";
import type { ProfileExportJson, UserProfile } from "@/types";

interface ImportPageClientProps {
  currentConfig: ProfileExportJson | null;
  user: UserProfile | null;
}

export function ImportPageClient({
  currentConfig,
  user,
}: ImportPageClientProps) {
  const state = useImportState({ currentConfig, user });

  return (
    <div className="space-y-6">
      <ImportToolbar
        onValidate={state.validateJson}
        onImport={state.handleApplyImport}
        onDownload={state.handleDownload}
        isImporting={state.isImporting}
        canDownload={!!currentConfig}
      />

      <ImportTabs activeTab={state.activeTab} onTabChange={state.setActiveTab} />

      {state.activeTab === "editor" ? (
        <div className="space-y-4">
          <ImportActions
            onLoadExample={state.handleLoadExample}
            onLoadCurrent={state.handleLoadCurrent}
            onClear={state.handleClear}
            hasCurrentConfig={!!currentConfig}
          />

          <JsonEditor
            value={state.jsonText}
            onChange={state.setJsonText}
            isValid={state.isValid}
            errorCount={state.validationErrors.length}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DropZone
            onFileSelect={state.handleFileSelect}
            onClear={() => state.setFileName(null)}
            fileName={state.fileName}
            error={state.fileError}
          />
          <p className="text-xs text-muted-foreground">
            Al cargar un archivo, su contenido se transferirá automáticamente al
            editor JSON.
          </p>
        </div>
      )}

      <JsonValidationPanel
        isValid={state.isValid}
        errors={state.validationErrors}
      />

      <SchemaDocs />

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Lightbulb className="size-4 shrink-0 text-muted-foreground" />
        <span>
          Tip: Puedes validar tu JSON antes de importar para asegurarte de que
          cumple el esquema. La importación es parcial — solo se actualizan las
          secciones que incluyas.
        </span>
      </p>

      {state.parsedData && state.previewProfile && (
        <ImportPreviewSection
          parsedData={state.parsedData}
          previewProfile={state.previewProfile}
          previewProjects={state.previewProjects}
          previewBg={state.previewBg}
          currentConfig={currentConfig}
          isImporting={state.isImporting}
          onCancel={() => {
            state.setParsedData(null);
            state.setIsValid(null);
          }}
          onApply={state.handleApplyImport}
        />
      )}
    </div>
  );
}
