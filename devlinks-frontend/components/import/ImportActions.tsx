import { FileJson, RotateCcw, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportActionsProps {
  onLoadExample: () => void;
  onLoadCurrent: () => void;
  onClear: () => void;
  hasCurrentConfig: boolean;
}

export function ImportActions({
  onLoadExample,
  onLoadCurrent,
  onClear,
  hasCurrentConfig,
}: ImportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={onLoadExample}
        className="gap-1.5 text-xs"
      >
        <FileJson className="size-3.5" />
        Ver ejemplo
      </Button>
      {hasCurrentConfig && (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onLoadCurrent}
          className="gap-1.5 text-xs"
        >
          <User className="size-3.5" />
          Usar perfil actual
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onClear}
        className="gap-1.5 text-xs"
      >
        <RotateCcw className="size-3.5" />
        Restablecer
      </Button>
    </div>
  );
}
