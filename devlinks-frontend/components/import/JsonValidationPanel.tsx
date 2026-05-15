import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonValidationPanelProps {
  isValid: boolean | null;
  errors: string[];
}

export function JsonValidationPanel({
  isValid,
  errors,
}: JsonValidationPanelProps) {
  if (isValid === null) return null;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm",
          isValid
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
            : "border-destructive/30 bg-destructive/5 text-destructive",
        )}
      >
        {isValid ? (
          <CheckCircle className="size-4 shrink-0" />
        ) : (
          <AlertCircle className="size-4 shrink-0" />
        )}
        <span className="font-medium">
          {isValid
            ? "JSON válido — sin errores encontrados"
            : `${errors.length} error${errors.length !== 1 ? "es" : ""} de validación`}
        </span>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-destructive">
                • {err}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
