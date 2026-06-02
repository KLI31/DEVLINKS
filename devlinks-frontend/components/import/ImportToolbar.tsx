import { Download, Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportToolbarProps {
  onValidate: () => void;
  onImport: () => void;
  onDownload: () => void;
  isImporting: boolean;
  canDownload: boolean;
}

export function ImportToolbar({
  onValidate,
  onImport,
  onDownload,
  isImporting,
  canDownload,
}: ImportToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Importar perfil desde JSON
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea o actualiza tu perfil a partir de un archivo JSON
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onValidate}
          className="cursor-pointer gap-2"
        >
          <Play className="size-4" />
          Validar JSON
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onImport}
          disabled={isImporting}
          className="cursor-pointer gap-2"
        >
          <Upload className="size-4" />
          {isImporting ? "Importando..." : "Importar"}
        </Button>
        {canDownload && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onDownload}
            className="cursor-pointer gap-2"
          >
            <Download className="size-4" />
            Descargar JSON
          </Button>
        )}
      </div>
    </div>
  );
}
