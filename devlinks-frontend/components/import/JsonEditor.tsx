"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isValid?: boolean | null;
  errorCount?: number;
}

export function JsonEditor({
  value,
  onChange,
  className,
  isValid,
  errorCount,
}: JsonEditorProps) {
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === "light" ? "light" : "dark";

  const statusColor =
    isValid === true
      ? "border-emerald-500/50"
      : isValid === false
        ? "border-destructive/60"
        : "border-input";

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border", statusColor, className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Editor JSON
        </span>
        {isValid !== null && (
          <span
            className={cn(
              "text-xs font-medium",
              isValid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive",
            )}
          >
            {isValid
              ? "JSON válido"
              : `${errorCount ?? 1} error${errorCount !== 1 ? "es" : ""}`}
          </span>
        )}
      </div>

      <CodeEditor
        value={value}
        language="json"
        onChange={(e) => onChange(e.target.value)}
        padding={12}
        minHeight={400}
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 12,
          lineHeight: "24px",
          backgroundColor: "transparent",
        }}
        data-color-mode={colorMode}
      />
    </div>
  );
}
